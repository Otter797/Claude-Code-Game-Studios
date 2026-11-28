# Session & Authority

> **Status**: Designed (pending `/design-review` in a fresh session)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode)
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-27
> **Last Verified**: 2026-11-27
> **Implements Pillar**: Pillar 2 (Risk is a choice), Pillar 3 (Bright world, real stakes), Pillar 5 (Home is the scoreboard); co-op designed in (concept, Technical Risks)

## Summary

Session & Authority starts and runs every play session, a real host with one
player in solo play, and is the one place every change to game state passes
through: it takes each action as a request, has the rules check it, applies or
refuses it with a reason, and publishes the result. It also runs the fixed
Simulation tick and the play-time clock storms are scheduled on, handles pause,
decides when to save and when to wait for a save, and carries out the start-up,
run-start and run-end sequences the persistence ADRs fix. Players never see it;
they get a solo game with no network friction and a world that never disagrees
with itself or loses what they built.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Game Data & Tuning` · Category: `Core`

## Overview

Session & Authority is the referee every change to Star Haul's game state
passes through. When the player presses Play, it starts a *session*: a host
with one player in solo play, the same host with friends in co-op later. From
then until the player quits, it does four jobs. It **takes requests**: every
action that changes the game (place a wall, repair the home, move ore into the
stash, launch a run, mine a seam) arrives as a request, is checked by the
rules, and is either applied or refused with a reason. It **keeps time**: it
runs the Simulation's tick at a fixed rate, advances the play-time clock that
storms are scheduled on, and stops everything when the game is paused. It
**decides when to save and when to wait**: after each change at home it hands a
snapshot to the save queue, and at the few moments that must not be lost (run
start, run end, an abandoned run found at start-up) it holds the game in a
short "saving" state until the write is confirmed. And it **runs the session's
lifecycle**: start-up, loading the save, home, runs, and quitting. It owns no
game rule itself; the rules live in the systems it calls. The player never
sees it, and in solo play they must not be able to tell a session was started
at all. Without it there would be no single truth for co-op to share, no
guarantee that an action and its cost are saved together, and no one place
that knows whether the game may accept an action right now.

## Player Fantasy

**Indirect: the player feels what this system guarantees.**

**You never notice the host.** The moment this system serves is the first one:
the player presses Play and is standing in their valley, with no network
prompt, no firewall dialog, no lobby and no wait they can feel. Solo play is a
real host with one player (ADR-0001), but it plays like an ordinary
single-player game. Co-op, when it comes, is the same game with more people in
it, not a different mode with different rules.

Two supporting lines follow:

- **The world agrees with itself.** A wall is placed or it is not; ore is in
  the pack or in the stash, never both and never neither. When a request is
  refused, the player is told why ("not enough sticks", "saving…"). Pillar 2
  asks that danger is *"always readable"*; that includes the game's own state.
  Pausing stops everything, so nothing harms the player while they are not
  looking, and a solo game that loses focus pauses itself.
- **Nothing you did is lost to the save.** Every action at home is saved with
  its cost in one step, so a crash undoes at most the last action or two as a
  whole (ADR-0003). The home really is the scoreboard (Pillar 5) because the
  game never quietly loses a piece of it. And the sting stays real (Pillar 3):
  quitting or crashing during a run costs what was carried, exactly as dying
  would, and the player is told so before they quit and again when they return.

What this asks of the rest of the design: every system that changes state does
so through a request this system can check, and every refusal has a reason the
player can read.

## Detailed Design

### Core Rules

Specialist lenses applied before drafting (Foundation/Infrastructure row):
`systems-designer` (primary), `gameplay-programmer` and `engine-programmer`
(supporting); the systems index also names `network-programmer` and
`technical-director` for this system, whose concerns are already fixed by
ADR-0001 and ADR-0003. The systems-designer asked for a closed state list and
an explicit rule for every request in every state; the gameplay-programmer
asked for a fixed-step tick so results do not depend on frame rate, and for
refusals the player can read; the engine-programmer warned that three choices
ADR-0001 deferred (tick source, seam replication, the home-to-run scene
change) must stay out of this document. Where the lenses disagreed (queue
requests during a save, or refuse them), the choice was taken for the designer
and is listed in Open Questions.

**Layers this system lives in.** Following ADR-0001: the *Simulation* holds the
rules and is plain C#; the *Authority* layer is this system's networked part,
which receives requests, asks the Simulation, applies results and publishes
state; *Presentation* shows state and raises requests. A rule never lives in
this system: "may the player place this wall?" is Building's question; "may
the game accept any home action right now?" is this system's.

**R1. One session, one host.** Every play session is a host-authoritative
session (ADR-0001). Solo play starts a host with exactly one player through
`ISessionHost.StartSolo()`, using the single-player transport, so no socket is
opened and no firewall prompt appears. There is no offline code path: solo goes
through exactly the request and state paths co-op will use. Joining (Tier 2a)
is out of scope here and needs the co-op ADR.

**R2. Player identity.** Each player in a session has a `playerId`, a
Simulation-owned identity that outlives a network connection (ADR-0001). In
solo play the one player's id is the profile's player id from the save. The
network client id is never used as an identity in rules or saves.

**R3. Every state change is a request.** Anything that changes game state
reaches the Simulation as a request: the player id, the *intent* (place piece,
remove piece, repair all, gather, stash move, craft, launch run, mine, pick
up, extract, and any intent a later design doc adds), its arguments, and a
sequence number. Each intent is owned by the system whose rule decides it;
this system owns the request's envelope and its handling. Movement and looking
are not requests: they are owned by the player's own client (ADR-0001) and
the host trusts the reported position for range checks, an accepted shortcut
to revisit before networked melee.

**R4. How a request is handled.** On the host, at the start of each tick,
before the Simulation's `Tick(dt)`:

1. Requests are taken in the order they arrived.
2. The **session check** runs (R5): may this intent be accepted in the current
   session state? If not, the request is refused with a session reason.
3. Otherwise the owning system's `Try…` method is called with the request. It
   returns either *accepted*, with the list of what changed and the model's new
   revision number, or *refused*, with a reason the owning system defines
   (for example Building's "not enough materials").
4. An accepted change is applied, and the change list is published to every
   client's Presentation (R8).
5. If the intent is a home action, a save point follows (R10).
6. The requesting player receives exactly one result for each request,
   matched by its sequence number. A refusal goes only to that player.

The host never trusts a result a client supplies: a client says what it wants,
never what happened.

**R5. The session check.** Whether an intent may be accepted depends only on
the session state (States and Transitions) and two flags, *paused* and *a
waited write is pending*:

| Intent class | Off, Starting, Loading, Resolving, Stopping, Refused | At Home | Launching Run, Ending Run | In Run |
|---|---|---|---|---|
| Home action (place, remove, repair, gather, stash move, craft) | Refused: Not now | Accepted for checking, unless paused (Refused: Paused) | Refused: Saving | Refused: Wrong place |
| Launch run | Refused: Not now | Accepted for checking, unless paused | Refused: Saving | Refused: Wrong place |
| Run action (mine, pick up, use, extract) | Refused: Not now | Refused: Wrong place | Refused: Saving | Accepted for checking, unless paused (Refused: Paused) |
| Movement, look (not a request) | Ignored | Allowed unless paused | Frozen | Allowed unless paused |

Session refusal reasons are a closed list owned here: **Not now**, **Paused**,
**Saving**, **Wrong place**, **Unknown player**, **Malformed** (arguments that
fail basic checks, such as an id the catalog does not know). Requests refused
while saving are not queued for later: the player sees "Saving…" and acts again
when it clears. Queuing them would let an action land after a state the player
did not see.

**R6. The fixed tick.** The Simulation advances in fixed steps of
`1 / tick_rate_hz` seconds (formula F1), never by the frame's length, so every
rule gives the same result at any frame rate. Ticks run only in At Home and In
Run, and only while not paused and no waited write is pending. Long frames are
caught up by running several ticks, up to `max_ticks_per_frame`; time beyond
that is dropped, not owed. Which engine callback drives the tick is a choice
ADR-0001 deferred to the first gameplay story; whichever it is, it must follow
F1.

**R7. The play-time clock.** The storm clock (owned by Storms, ADR-0003)
advances by exactly one tick's length per tick (formula F2), so it counts only
time spent playing: not the main menu, not loading, not saving waits, not
pause, not while closed. This system feeds the ticks; it never reads the wall
clock and never depends on the engine's time scale. At home, after each tick,
it calls Storms' `AdvanceTo(playTime)`; if any storm resolved, that is a save
point (R10). During a run it does not call `AdvanceTo` (ADR-0003); the clock
still advances so the run HUD can warn of the next storm. Every
`note_interval_s` of play time (Save & Load's tuning value, about 30 s) it asks
the save queue to write the play-time note (formula F4), at home and in runs.

**R8. Publishing state.** Presentation on every client, the host's own
included, learns about game state only from what this system publishes:
replicated values and change lists, each carrying the revision number of the
model it came from, so a view can apply changes in order without rebuilding
everything. Built pieces are published as data, never one networked object
each (ADR-0003). How seams and the home are replicated is decided at the first
gameplay story and recorded as an ADR-0001 amendment.

**R9. Pause.** In solo play the player can pause from the pause menu, and the
game pauses itself when its window loses focus (a player setting, default on,
owned by Menus & Settings). Pause stops the tick: oxygen, creatures, hunters,
mining, the storm clock, everything, both at home and during a run. Pause is
an explicit state this system passes to the Simulation (ADR-0003), never a
change of the engine's time scale. While paused, requests are refused with
"Paused" and movement is frozen. With more than one player in the session,
pause and auto-pause are unavailable (whether a co-op host may pause is for
the co-op ADR).

**R10. Save points and waited writes.** This system is the only caller of the
save queue (`ISaveQueue`, ADR-0003):

- **Home save points.** After every accepted home action and every storm
  resolution at home, it takes one snapshot of the whole save model and hands
  it to the queue with `Request`. It does not wait. An action's cost and result
  are always in the same snapshot, so they reach the disk together.
- **Waited writes.** At run start (the run marker), at run end, when an
  abandoned run is resolved at start-up, and during load (which may migrate),
  it uses `RequestAndWait` (or `LoadAndWait`) and holds the session in a
  waiting state until the result arrives. While one is pending, the clock and
  all home save points are held and the "Saving…" indicator is shown (formula
  F5). The main thread never blocks.
- **A waited write that fails or times out** (`waited_write_timeout_s`) is
  retried with growing delays (formula F3) and the player is told; no home
  action is accepted until it succeeds. At run start a failed marker write
  cancels the launch instead, as ADR-0003 Decision 11 sets out (R12).
- **A failed home save** is reported once, without blocking, and the next save
  point tries again.

**R11. Building the Simulation.** At session start, after the game data
catalog is ready (Game Data & Tuning), this system builds each Simulation
system and hands it its own tuning set and definitions (Game Data & Tuning
R10). It also puts together the home façade (`IHomeSimulation`, ADR-0003) over
Building, Stash and Storms, and implements the world-query interface
(`IWorldQuery`) with the engine's physics and navigation on the host
(ADR-0001), answering questions of fact only.

**R12. Starting, launching and ending runs.** The run sequences follow ADR-0002
and ADR-0003 exactly; this system is the one that carries them out.

- **Launch.** A *launch run* request accepted at home moves to Launching Run.
  The Simulation's `BeginRun(carried)` writes the run marker into the model; the
  snapshot is written with `RequestAndWait`. Success: the scene changes to the
  run and the session enters In Run. Failure or time-out: the launch is
  cancelled, the marker is removed from the model, a marker-free snapshot is
  written and waited for, and the player stays home with a message. If that
  write fails too, it is retried (F3) and no home action is accepted until it
  succeeds.
- **End.** Run Flow raises the end of a run (extraction or death); it never
  calls Storms or Stash itself. The session enters Ending Run and, in this
  order: calls `AdvanceTo` with the current clock, so every storm that passed
  during the run is applied first; has the haul placed (Stash's and Run Flow's
  rules decide where; on a death there is none); calls `EndRun(outcome)`, which
  records the outcome and clears the marker; takes one snapshot; writes it with
  `RequestAndWait`. On success the scene returns home and the session enters At
  Home; on failure it retries (F3) and stays in Ending Run.
- The run-end sequence is a plain C# method on the Authority side, testable
  with no Netcode (ADR-0003).
- How the scene change itself is driven under a host is deferred to the first
  gameplay story (ADR-0001) and is not specified here.

**R13. Quitting.** On an orderly quit (to the main menu or the desktop):
requests stop being accepted, the queue is drained (any waiting snapshot is
written) and a final play-time note is written, waiting at most
`quit_drain_timeout_s`; no new snapshot is taken. Quitting during a run first
asks the player to confirm with the warning that everything carried will be
lost; the run marker stays on disk and the next start resolves it as an
abandoned run (ADR-0002: leaving a run is a death). Correctness never depends on
the quit steps running: a kill instead of a quit loses only what a crash
loses.

**R14. Milestone A.** Milestone A has no runs. Launch run, In Run, Launching
Run and Ending Run do not exist yet; the session goes Off → Starting →
Loading → (Resolving, only if a save holds a run marker, which Milestone A
cannot write) → At Home → Stopping. Everything else in this document applies
unchanged.

### States and Transitions

| State | Meaning | Tick and clock | Requests |
|---|---|---|---|
| **Off** | Main menu; no session | Stopped | None |
| **Starting** | Transport chosen, host starting, Simulation being built (R11) | Stopped | Refused: Not now |
| **Loading** | `LoadAndWait()` running on the save writer; no time-out (ADR-0003) | Stopped | Refused: Not now |
| **Resolving** | A run marker was found: storms applied, carried items lost, marker cleared, written and waited for | Stopped | Refused: Not now |
| **At Home** | Home scene; normal play | Running unless paused | Per R5 |
| **Launching Run** | Run marker write pending | Held | Refused: Saving |
| **In Run** | Run scene | Running unless paused | Per R5 |
| **Ending Run** | Run-end sequence and its write pending | Held | Refused: Saving |
| **Stopping** | Draining the queue and writing the final note | Stopped | Refused: Not now |
| **Refused** | The save could not be opened (newer version, locked by another running copy, unreadable with no readable backup) | Stopped | None |

*Paused* is a flag on At Home and In Run, not a state of its own.

| From | To | Trigger |
|---|---|---|
| Off | Starting | Player presses Play (game data catalog already Ready) |
| Starting | Loading | Host started; Simulation built |
| Starting | Refused | Host could not start, or another running copy holds the save lock |
| Loading | At Home | Load result: loaded, loaded from a backup (player told), or new profile; no run marker |
| Loading | Resolving | Load result says a run was abandoned (marker found) |
| Loading | Refused | Load result: newer version, locked, or unreadable |
| Resolving | At Home | Resolution written; abandoned-run notice shown |
| Resolving | Resolving | Resolution write failed: retry (F3) |
| At Home | Launching Run | Launch run request accepted |
| Launching Run | In Run | Marker write succeeded; scene changed |
| Launching Run | At Home | Marker write failed or timed out; marker-free snapshot written |
| In Run | Ending Run | Run Flow raises the end of the run |
| Ending Run | At Home | Run-end write succeeded; scene changed |
| Ending Run | Ending Run | Run-end write failed: retry (F3) |
| At Home, In Run | Stopping | Player quits (from a run, after confirming) |
| Stopping | Off | Drain and note done, or `quit_drain_timeout_s` reached (to main menu) |
| Refused | Off | Player acknowledges the message |

No other transition exists. In particular, In Run never returns to At Home
except through Ending Run, and nothing leaves Loading before the writer
returns.

**Start-up order.** Game data catalog Ready (Game Data & Tuning) → Starting
(`StartSolo`) → Loading (`LoadAndWait`) → on the main thread, pick the later of
the save's clock and the play-time note's clock (ADR-0003 Decision 8) → resolve
a run marker if there is one → At Home, where the first home tick applies any
storm that fell due between the last save and a crash.

### Interactions with Other Systems

| System | Direction | What flows | Interface owner |
|---|---|---|---|
| Game Data & Tuning | In | The catalog's rules view at session start (each system's tuning set and definitions); `tuning.session_and_authority` | Game Data & Tuning |
| Save & Load (`ISaveQueue`) | Out / In | `LoadAndWait`, `Request`, `RequestAndWait`, `NotePlayTime`, `Drain`; load results and failure notices back | ADR-0003 fixes the interface; Save & Load's design doc owns the store's behaviour; this system is its only caller |
| Building, Stash, Storms (through `IHomeSimulation`) | Out | Home requests; `Snapshot()`; `AdvanceTo(playTime)` at home ticks and once at run end; `StormReport`s back for Presentation | Each system owns its rules; this system owns when they are called |
| Gathering, Crafting, Pack | Out | Their intents as requests; change lists back | Owners |
| Run Flow | In / Out | Launch run request; `BeginRun(carried)` and `EndRun(outcome)` hooks; Run Flow raises the end of a run, this system carries out the sequence | Run Flow owns the run's states and outcome; this system owns the sequence and the writes |
| Mining, Health & Damage, Oxygen, Creature AI, Perception, Hunter Escalation | Out | Run intents as requests; `Tick(dt)`; `IWorldQuery` facts from physics and navigation on the host | Owners own rules; this system owns the tick and the world-query implementation |
| Player Controller | In | Owner-authoritative movement and look (not requests); the position the host trusts for range checks; frozen while paused or saving | Player Controller |
| Input, Menus & Settings | In | Pause and quit commands; the auto-pause-on-focus-loss setting | Owners |
| Home HUD & Panels, Run HUD | Out | Published state and change lists with revision; refusal reasons; "Saving…" state; failed-save and abandoned-run notices | This system owns what is published; HUDs own how it looks |
| Co-op Sessions (later) | Out | Join, leave, fingerprint check (Game Data & Tuning R13), whose home it is | Co-op ADR, before Tier 2a |

## Formulas

All values marked `data file` live in `tuning.session_and_authority` (Game
Data & Tuning), except `note_interval_s`, which is Save & Load's. Boundaries
were worked at each variable's minimum, maximum and 0.

### F1. Fixed-step tick accumulator

The `ticks_this_frame` formula is defined as, each rendered frame while the
tick runs (R6):

```
acc   = acc + min(frame_dt_s, max_frame_dt_s)
ticks = min(floor(acc / tick_dt_s), max_ticks_per_frame)
acc   = acc − ticks × tick_dt_s
if ticks = max_ticks_per_frame: acc = min(acc, tick_dt_s)
```

with `tick_dt_s = 1 / tick_rate_hz`. While the tick is stopped or held (any
state but At Home and In Run, paused, or a waited write pending), `acc = 0`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| frame_dt_s | float | ≥ 0 | calculated | Real time since the last frame |
| max_frame_dt_s | float | 0.05–1 | data file | Longest frame counted; a longer one (a debugger break, a disk stall) counts as this |
| tick_rate_hz | int | 20–60 | data file | Simulation ticks per second (default 30, provisional until the ADR-0001 amendment fixes the tick source) |
| tick_dt_s | float | 1/60–1/20 | calculated | Length of one tick |
| max_ticks_per_frame | int | 1–10 | data file | Most ticks run in one frame |
| acc | float | 0 to < tick_dt_s after each frame (except at the cap) | calculated | Unspent time carried to the next frame |
| ticks | int | 0 to max_ticks_per_frame | calculated | Ticks run this frame |

**Output Range:** 0 to `max_ticks_per_frame` ticks per frame. At 60 frames per
second and 30 Hz, one tick every other frame; at 15 frames per second, 2 ticks
a frame.
**Boundaries:** `frame_dt_s = 0` gives 0 ticks. A 5 s stall counts as
`max_frame_dt_s` (0.25 s) → 7 ticks at 30 Hz (under the cap of 8), and the
other 4.75 s are never owed, so the game never tries to catch up for seconds
("spiral of death"). The cap clause only bites if the knobs are changed so that
`max_ticks_per_frame × tick_dt_s < max_frame_dt_s` (see Tuning Knobs). `max_ticks_per_frame = 1` is legal but makes play slow
down below `tick_rate_hz` frames per second. `tick_rate_hz` cannot be 0 (range
starts at 20), so the division is defined.
**Example:** 30 Hz (tick 0.0333 s), frame of 0.05 s, acc 0.02: acc = 0.07 →
ticks = 2 → acc = 0.0033.

### F2. Play-time clock advance

The `play_time_ms` formula is defined as, once per tick (R7):

`play_time_ms' = play_time_ms + tick_dt_s × 1000`

using Game Data & Tuning's D3, in double precision, without rounding per tick
(ADR-0003).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| play_time_ms | double | 0 upward | calculated (saved by Storms) | The storm clock |
| tick_dt_s | float | 1/60–1/20 | calculated (F1) | Length of one tick |
| 1000 | int | — | constant | Milliseconds per second |

**Output Range:** grows by exactly 3,600,000 per hour of unpaused play at any
tick rate; never grows in the menu, loading, saving waits or pause.
**Boundaries:** no tick, no change. Double precision keeps whole milliseconds
exact for far longer than any profile will be played.
**Example:** at 30 Hz each tick adds 33.333… ms; 108,000 ticks (one hour) add
3,600,000 ms.

### F3. Waited-write retry delay

The `retry_delay_s` formula is defined as, for the k-th retry of a failed or
timed-out waited write (R10):

`retry_delay_s(k) = min(retry_base_s × 2^(k − 1), retry_cap_s)`, for k ≥ 1

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| k | int | 1 upward | calculated | Retry number |
| retry_base_s | float | 0.25–5 | data file | First delay |
| retry_cap_s | float | 2–60, ≥ retry_base_s | data file | Longest delay |

**Output Range:** `retry_base_s` to `retry_cap_s`. Defaults (1 s, 8 s): 1, 2,
4, 8, 8, 8… s.
**Boundaries:** `k = 0` is not a retry (the first attempt has no delay). Large
k cannot overflow in effect, since the result is capped (implementations stop
doubling once the cap is reached). Retries never stop on their own: the player
is shown the failure and can quit; the waited write is never abandoned while
the session keeps running.
**Example:** a run-end write fails three times (a cloud-sync tool holding the
file): waits of 1, 2 and 4 s, then the fourth try succeeds about 7 s plus write
time later.

### F4. Play-time note schedule

The `note_due` formula is defined as, after each tick (R7):

`note_due = play_time_ms ≥ last_note_ms + note_interval_s × 1000`

When true, the note is requested and `last_note_ms = play_time_ms`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| play_time_ms | double | 0 upward | calculated (F2) | Current clock |
| last_note_ms | double | 0 upward | calculated | Clock when the last note was requested; set to the loaded clock at start-up |
| note_interval_s | float | Save & Load's range (about 30 s) | data file (`tuning.save_and_load`) | Play time between notes |

**Output Range:** one note request per `note_interval_s` of play; with ticks
of 1/30 s, a note is at most one tick late.
**Boundaries:** paused or held, the clock does not move, so no note is due.
An orderly quit writes a final note regardless (R13).
**Example:** interval 30 s, last note at 600,000 ms: the next note is
requested on the first tick at or after 630,000 ms.

### F5. "Saving…" indicator

The `show_saving` formula is defined as:

`show_saving = waited_write_pending ∧ (now_s − pending_since_s ≥ saving_indicator_delay_s)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| waited_write_pending | bool | — | calculated | A load, marker, run-end or abandoned-run write has not returned |
| now_s, pending_since_s | float | — | calculated | Real time now and when the write started (real time, since the clock is held) |
| saving_indicator_delay_s | float | 0–1 | data file | Delay before the indicator appears |

**Output Range:** true or false.
**Boundaries:** delay 0 shows the indicator at once, which flickers for fast
writes; delay 1 leaves a second with no feedback. Default 0.3 s: a typical
write never shows it, a slow one shows it before the player wonders.
**Example:** a run-end write that takes 0.12 s shows nothing; one that takes
2 s shows "Saving…" from 0.3 s to 2 s.

## Edge Cases

**Requests**

- **If two requests in the same tick want the same thing** (two "move this
  ore to the stash" for the last ore, possible with double-clicks or, later,
  two players): they are handled in arrival order; the first is accepted, the
  second is checked against the changed model and refused by the owning rule.
  Nothing is duplicated.
- **If a request names an id the catalog does not know, or a piece id that no
  longer exists**: refused as *Malformed* or by the owning rule; never an
  exception that stops the tick.
- **If a request arrives from a player id not in the session**: refused as
  *Unknown player* and logged.
- **If a request arrives while paused, while saving, or in a state that does
  not take it**: refused per R5, with the reason shown; it is not queued.
- **If a refused request is repeated many times per second** (a held mouse
  button): each gets its own refusal; Presentation shows the reason once
  rather than once per refusal (UI Requirements).
- **If an owning system's `Try…` throws an error**: the request is refused
  with a generic reason, the error is logged with the request, the model is
  not changed, and the session keeps running. In development builds the error
  is also shown on screen.

**Time and pause**

- **If a frame takes seconds** (debugger, disk stall, alt-tab on a slow
  machine): F1 counts at most `max_frame_dt_s` and runs at most
  `max_ticks_per_frame` ticks; the rest of the time is not owed. The clock
  advances only by the ticks that ran.
- **If the window loses focus in solo play with auto-pause on**: the game
  pauses at once, at home or in a run; it stays paused when focus returns until
  the player unpauses. With auto-pause off, it keeps running in the background
  (the project runs in the background, which a host needs).
- **If the player pauses during a waited write**: the write continues (it is on
  the writer); when it returns, the session moves on (for example to In Run)
  but stays paused.
- **If a storm falls due at the exact tick the player launches a run**: the
  tick runs `AdvanceTo` before requests for the next tick are taken, so the
  storm resolves (and saves) at home first; the launch request is handled on
  the following tick. A storm can never fall into the gap between home and run.
- **If a storm fell due during a pause**: impossible; the clock does not move
  while paused.

**Saving**

- **If a home save fails** (disk full, file held by another program): the
  player is told once, play continues, and the next save point tries again with
  the whole model, so nothing is lost unless the game also crashes before a
  save succeeds.
- **If the run-marker write fails or times out**: the launch is cancelled and
  the player stays home (R12); a late arrival of the timed-out write on disk is
  followed by the marker-free write, because the queue writes in order
  (ADR-0003).
- **If the run-end write keeps failing**: the session stays in Ending Run,
  retrying (F3), showing the failure and offering Quit. If the player quits, the
  marker is still on disk; the next start resolves it as an abandoned run and
  the haul is lost. This fails closed: nothing can be duplicated, and it is the
  only way a successful extraction can still be lost, which is accepted as a
  rare failure of the player's disk, not a game rule.
- **If the game is killed during Ending Run before the write lands**: same
  outcome as above, by ADR-0002's marker rule.
- **If the load result is "loaded from a backup"**: the player is told which
  backup and that recent progress may be missing; play continues.
- **If the load result is "newer version", "locked" or "unreadable"**: the
  session enters Refused and shows the matching message; the save is never
  written. "Locked" means another copy of the game is running.

**Run transitions**

- **If the player dies on the same tick they extract**: Run Flow decides which
  outcome happened (it owns the run's states); this system receives exactly one
  end-of-run event and carries out one sequence.
- **If Run Flow raises the end of a run twice**: the second is ignored while in
  Ending Run or At Home, and logged as a programming error.
- **If the player quits during Launching Run or Ending Run**: Stopping waits for
  the pending write within `quit_drain_timeout_s`; whatever reached the disk
  decides the next start (a marker means an abandoned run).
- **If a save holds a run marker in Milestone A** (only possible from a later
  build's save loaded into an older one, which ADR-0002 refuses as a newer
  version): not reachable.

**Degenerate strategies**

- **Pausing to scout or to escape a creature**: pause freezes the whole
  Simulation and hides nothing new (the game keeps showing the frozen view), so
  it buys thinking time, not information or safety. Accepted: solo only, and
  Pillar 2 favours the player having time to read danger.
- **Quitting during a run to keep the haul**: impossible; the marker makes a
  quit a death (ADR-0002).
- **Killing the game during Ending Run to reroll storms**: storms are a pure
  function of the saved schedule (ADR-0003), so the abandoned-run resolution
  gives the same storms; the haul is lost instead. There is nothing to gain.

## Dependencies

### Upstream (this system depends on)

| System or decision | Hard / soft | Interface |
|---|---|---|
| Game Data & Tuning (#1, `design/gdd/game-data-and-tuning.md`) | Hard | The catalog must be Ready before Starting; this system builds every Simulation system from its rules view (GDT R10) and holds `tuning.session_and_authority` |
| ADR-0001 (Accepted) | Hard | Host-authoritative session on Netcode for GameObjects; three layers; `ISessionHost`, `IWorldQuery`, request and state paths; owner-authoritative movement |
| ADR-0002 and ADR-0003 (Accepted) | Hard | Save points, waited writes, the run marker, `ISaveQueue`, the run-end order, the play-time clock and pause rules |
| Engine | Hard | Netcode for GameObjects with the single-player transport. Engine reference read: `docs/engine-reference/unity/modules/networking.md`; its RPC samples are the older form and must not be copied (ADR-0001). The installed package version is not yet verified (ADR-0001 Verification) |

The systems index lists no upstream system for row 2; Game Data & Tuning is
added here (see Open Questions).

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs from this system | Design doc |
|---|---|---|---|
| Player Controller (6) | Hard | Session state, pause and saving freezes; the host's trust of its position | Not written |
| Save & Load (7) | Hard | Its only caller; the load at start-up and every save point | Not written |
| Pack (8) | Hard | Requests (pick up, drop) and published pack state | Not written |
| Health & Damage (17) | Hard | Tick and host-only damage | Not written |
| Co-op Sessions (32) | Hard | The whole session model | Not written; blocked on the co-op ADR |
| Every Simulation system (Building, Stash, Crafting, Gathering, Storms, Mining, Oxygen, Creature AI, Perception, Hunter Escalation, Run Flow) | Hard | Construction (R11), requests (R4), the tick (R6), save points (R10) | Not written. Per the systems index TD note, "rules never depend on Session & Authority"; only their networked parts do |
| Home HUD & Panels, Run HUD, Menus & Settings | Hard | Published state, refusal reasons, notices, pause and quit | Not written |

**Bidirectional check.** The systems index lists Session & Authority under
rows 6, 7, 8, 17 and 32, matching the table. No dependent design doc exists
yet; each must list Session & Authority (its networked part) when written.
Game Data & Tuning's doc already lists Session & Authority as its first
downstream system.

## Tuning Knobs

`tuning.session_and_authority`, in Game Data & Tuning's record shape. All are
`provisional: true` until the first gameplay story measures them.

| Key | Type | Value | Min | Max | Step | Unit | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|
| `tick_rate_hz` | int | 30 | 20 | 60 | 1 | count | Coarse timing: a 0.55 s creature wind-up lands on 16 or 17 ticks; drill and oxygen steps feel lumpy | More CPU per second for the same game; little gain for a slow-paced game | Half the target frame rate; fine enough for the prototype's shortest timings (0.45 s stun drill) |
| `max_ticks_per_frame` | int | 8 | 1 | 10 | 1 | count | The game slows down below `tick_rate_hz` frames per second | Long catch-up bursts after a stall; can make a slow frame slower | 8 ticks at 30 Hz is 0.267 s, just over `max_frame_dt_s`, so a counted frame never loses time |
| `max_frame_dt_s` | float | 0.25 | 0.05 | 1 | 0.05 | s | Ordinary slow frames lose time | A stall turns into a burst of ticks | A quarter second: anything longer is a stall, not play |
| `waited_write_timeout_s` | float | 10 | 3 | 30 | 1 | s | A slow disk fails launches and run ends that would have succeeded | The player watches "Saving…" for a long time before being told | Long enough for a slow disk and a cloud-sync tool; ADR-0003 requires a time limit |
| `retry_base_s` | float | 1 | 0.25 | 5 | 0.25 | s | Retries hammer a disk that is busy | The player waits after a brief glitch | F3 |
| `retry_cap_s` | float | 8 | 2 | 60 | 1 | s | Retries too frequent while a file stays held | The player waits long after the problem clears | F3; 8 s keeps the next try within a short wait |
| `saving_indicator_delay_s` | float | 0.3 | 0 | 1 | 0.05 | s | Flicker on fast writes | No feedback during a slow write | F5 |
| `quit_drain_timeout_s` | float | 3 | 1 | 10 | 0.5 | s | A pending home save may not finish on quit (allowed: correctness does not depend on it) | Quitting feels stuck | ADR-0003: drain within a bounded wait |

Not knobs here: the play-time note interval is Save & Load's
(`tuning.save_and_load`); the auto-pause-on-focus-loss switch is a player
setting owned by Menus & Settings (default on), not tuning. **Interaction:**
`max_ticks_per_frame × (1 / tick_rate_hz)` should be at least
`max_frame_dt_s` (5 × 1/30 ≈ 0.167 s < 0.25 s at the defaults), or a counted
frame can still lose time. At the defaults 8 × 1/30 ≈ 0.267 s ≥ 0.25 s, so it
holds; raising `max_frame_dt_s` or lowering `tick_rate_hz` needs
`max_ticks_per_frame` checked again.

## Visual/Audio Requirements

Optional for a `Core` system; it has no visuals or sounds of its own. It
supplies the events other systems show: refusal reasons, "Saving…", failed-save
and abandoned-run notices, pause. The art bible's UI rules apply to how HUD
systems show them. No asset spec is needed.

## Game Feel

Optional for a `Core` system, but three feel targets belong here because
nothing else owns them:

- **Starting is invisible.** From pressing Play to standing in the valley, the
  session adds no perceptible time over loading the scene and the save, and no
  dialog (ADR-0001 Verification 1).
- **Actions answer at once.** A request made at home gets its result within one
  tick (33 ms at 30 Hz) plus a frame, so placing a piece or moving ore never
  feels laggy in solo play.
- **Waits are short and honest.** Run start and run end show "Saving…" only if
  the write takes longer than 0.3 s, and a failure says what failed and what
  happens next; the player is never left on a frozen screen.

## UI Requirements

This system raises; the HUD systems show. Required surfaces:

1. **Refusal feedback.** Every refused request reaches the player as a short
   reason near the action (the owning system's reason, or a session reason:
   "Paused", "Saving…", "Can't do that here"). Repeats of the same refusal
   within a second show once.
2. **"Saving…" indicator** during waited writes (F5), at home and on the
   run-start and run-end transitions.
3. **Failed save notices.** Home save failed (non-blocking, once, "will retry
   on your next action"); waited write failing (blocking, with retry count and a
   Quit option).
4. **Abandoned-run notice** at home after Resolving: the run ended when the
   game closed; the items carried are listed as lost; any storms that passed are
   summarised (from the `StormReport`s).
5. **Quit-during-run confirmation**: "Quitting now ends the run. Everything
   you carry will be lost." Confirm or stay.
6. **Refused screen**: newer save version ("This save is from a newer version
   of Star Haul"), locked ("Star Haul is already running"), unreadable with no
   backup. Each says the save was not changed.
7. **Pause menu hook** and the auto-pause setting (owned by Menus & Settings).

> **📌 UX Flag — Session & Authority**: items 1 to 6 are player-facing. When
> `/ux-design` runs for Home HUD & Panels, Run HUD and Menus & Settings, include
> them. Stories that show them should cite the UX specs, not this document.

## Cross-References

| This document references | Where | What it relies on |
|---|---|---|
| `design/gdd/game-data-and-tuning.md` | R10, R13, D3, States and Transitions | Catalog Ready before the session; systems built from their own tuning sets; D3 for the clock; the fingerprint for co-op joins |
| `docs/architecture/adr-0001-network-model.md` | Decision, Key Interfaces, Implementation Guidelines, deferrals | Host-authoritative session; three layers; `ISessionHost`, `IWorldQuery`; owner-authoritative movement; tick source, seam replication and scene change deferred |
| `docs/architecture/adr-0002-persistence.md` | Decisions 4 to 6 | Run marker; leaving a run is a death; save points; refused loads |
| `docs/architecture/adr-0003-home-and-storm-persistence.md` | Decisions 4, 6, 8 to 15; Key Interfaces | Play-time clock and pause; `AdvanceTo` at home ticks and at run end; save points; waited writes and their failure rules; `ISaveQueue`; `IHomeSimulation` |
| `design/gdd/game-concept.md` | Pillars 2, 3, 5; Technical Risks | Readable danger; the sting of loss; the home as scoreboard; co-op designed in, host-side checks in solo |
| `design/gdd/systems-index.md` | Row 2; TD notes | Dependents; "rules never depend on Session & Authority"; Run Flow never calls Storms |

## Acceptance Criteria

**Type**: *Logic* criteria need an automated EditMode test under
`StarHaul/Assets/Tests/EditMode/` with no scene and no Netcode where possible;
*Integration* criteria need an automated test or a documented check (PlayMode
or a two-instance smoke test); *UI* criteria need a retained screenshot in
`production/qa/evidence/`. QA lens: every rule R1 to R14 and formula F1 to F5
has at least one criterion below; R8's replication method and R12's scene
change are deferred by ADR-0001 and get criteria in their amendment's stories.

**Session and start-up**

1. **GIVEN** a fresh install with no save, **WHEN** the player presses Play,
   **THEN** they reach the valley with no network or firewall dialog, the log
   shows catalog Ready → Starting → Loading (result: new) → At Home in that
   order, and start-up time differs from a build with the session stubbed out
   by under 0.1 s, averaged over five starts. *(Integration; R1, States,
   Game Feel)*
2. **GIVEN** a save with a later play-time note, **WHEN** loaded, **THEN** the
   session clock equals the note's clock; **GIVEN** an older note, **THEN** the
   save's clock. *(Logic; start-up order)*
3. **GIVEN** a save holding a run marker, **WHEN** the game starts, **THEN**
   the session passes through Resolving, `AdvanceTo` is called exactly once, the
   carried items are gone, the marker is cleared in one waited write, and the
   abandoned-run notice lists the lost items. *(Logic + UI; States, R12)*
4. **GIVEN** a save with a format version newer than the game, a locked save
   folder, or an unreadable save with no backup, **WHEN** the player presses
   Play, **THEN** the session enters Refused with the matching message and the
   save file's bytes are unchanged. *(Integration + UI; States)*
5. **GIVEN** a solo session, **WHEN** inspected, **THEN** the player's
   `playerId` equals the profile's player id and no rule or saved field holds a
   network client id. *(Logic; R2)*

**Requests**

6. **GIVEN** At Home with enough sticks, **WHEN** a place-piece request is
   sent, **THEN** exactly one accepted result with the request's sequence
   number arrives, the model's revision rises by one, the change list names the
   new piece, and one snapshot is handed to the queue. *(Logic; R3, R4, R10)*
7. **GIVEN** two requests in one tick that each move the last ore into the
   stash, **WHEN** handled, **THEN** the first is accepted, the second refused
   by the owning rule, and the ore exists exactly once. *(Logic; R4, Edge
   Cases)*
8. **GIVEN** each cell of R5's table, **WHEN** a request of that intent class
   arrives in that state, **THEN** it is accepted for checking or refused with
   exactly the reason in the table. *(Logic; R5, one test per cell)*
9. **GIVEN** a request whose arguments name an unknown catalog id, or a player
   id not in the session, **WHEN** handled, **THEN** it is refused as Malformed
   or Unknown player and the tick completes. *(Logic; R5)*
10. **GIVEN** an owning system that throws inside `Try…`, **WHEN** a request
    reaches it, **THEN** the request is refused, the model's revision is
    unchanged, the error is logged, and the next tick runs. *(Logic; Edge
    Cases)*
11. **GIVEN** the solo session, **WHEN** a request is sent, **THEN** it goes
    through the same request method an RPC from a remote client would call
    (no solo-only path), verified by a test that sends the same request both
    ways and gets the same result. *(Integration; R1)*

**Tick, clock and pause**

12. **GIVEN** 30 Hz and a frame sequence of 0.05, 0.04, 0.05 s from acc 0,
    **WHEN** F1 runs, **THEN** ticks are 1, 1, 2 and acc ends at 0.00667 (±1e-6).
    **GIVEN** a 5 s frame, **THEN** 7 ticks run. **GIVEN** 0 s, **THEN** 0.
    *(Logic; F1)*
13. **GIVEN** a simulated hour of At Home ticks at 20, 30 and 60 Hz, **WHEN**
    F2 accumulates, **THEN** the clock grows by 3,600,000 ms (±1 ms) in each
    case. *(Logic; F2, R7)*
14. **GIVEN** the session is paused, in the main menu, Loading, Resolving,
    Launching Run or Ending Run for 60 s, **WHEN** that time passes, **THEN**
    the clock and every Simulation value (oxygen, creature positions) are
    unchanged. *(Logic; R6, R7, R9)*
15. **GIVEN** solo play with auto-pause on, **WHEN** the window loses focus,
    **THEN** the session is paused within one frame and stays paused after
    focus returns; **GIVEN** auto-pause off, **THEN** the clock keeps advancing.
    *(Integration; R9)*
16. **GIVEN** At Home with a storm due at the current clock, **WHEN** the tick
    runs, **THEN** `AdvanceTo` resolves it and one snapshot is requested;
    **GIVEN** In Run, **THEN** `AdvanceTo` is not called but the clock advances.
    *(Logic; R7)*
17. **GIVEN** a note interval of 30 s and a last note at 600,000 ms, **WHEN**
    ticks advance the clock past 630,000 ms, **THEN** exactly one note request
    is made on the first tick at or after 630,000 ms. *(Logic; F4)*

**Saves and runs**

18. **GIVEN** a launch accepted, **WHEN** the marker write succeeds, **THEN**
    the session enters In Run; **WHEN** it fails or times out at
    `waited_write_timeout_s`, **THEN** the marker is removed from the model, a
    marker-free snapshot is written and waited for, and the session returns to
    At Home with a message. *(Logic; R12, ADR-0003)*
19. **GIVEN** In Run with storms due and a haul in the pack, **WHEN** Run Flow
    raises an extraction, **THEN** the calls happen in the order `AdvanceTo`,
    haul placement, `EndRun`, one snapshot, one `RequestAndWait`, and the haul is
    never affected by a storm that fell during the run. *(Logic; R12, plain C#
    with no Netcode)*
20. **GIVEN** a run-end write that fails three times then succeeds, **WHEN**
    retried, **THEN** the delays are 1, 2 and 4 s (±1 frame), home actions are
    refused with "Saving…" throughout, and the session reaches At Home after
    the fourth try. *(Logic; F3, R10)*
21. **GIVEN** a waited write pending for 0.12 s, **THEN** "Saving…" never
    shows; **GIVEN** 2 s, **THEN** it shows from 0.3 s until the write returns.
    *(Logic + UI; F5)*
22. **GIVEN** a home save that fails, **WHEN** the next home action is
    accepted, **THEN** a new snapshot is requested, the failure notice was shown
    once, and play never blocked. *(Logic + UI; R10)*
23. **GIVEN** the player quits from a run and confirms, **WHEN** the game is
    started again, **THEN** the run is resolved as abandoned (carried items
    lost). **GIVEN** an orderly quit at home with a pending snapshot, **THEN**
    the snapshot and a final note are written within `quit_drain_timeout_s` and
    no new snapshot is taken. *(Integration; R13)*
24. **GIVEN** Run Flow raises the end of a run twice, **WHEN** the second
    arrives during Ending Run, **THEN** it is ignored and logged, and only one
    sequence and one write happen. *(Logic; Edge Cases)*

**Cross-system**

25. **GIVEN** a test catalog where `tuning.session_and_authority` sets
    `tick_rate_hz` to 20, **WHEN** a session is built, **THEN** F1 runs at 20 Hz
    and each Simulation system received only its own tuning set (Game Data &
    Tuning R10). *(Logic; R11)*
26. **GIVEN** two local instances (host and one client) using the real
    transport, **WHEN** the client places a piece, **THEN** the host validates
    it and both instances show the same piece at the same revision. *(Integration;
    two-instance smoke test, ADR-0001 Validation; MVP definition of done even
    though co-op does not ship)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Which engine callback drives the tick (frame update, fixed update or the network tick), how seams and the home are replicated, and how the home-to-run scene change runs under a host. Deferred by ADR-0001 to the first gameplay story; record as an ADR-0001 amendment. `tick_rate_hz` stays provisional until then | technical-director / network-programmer | First gameplay story (Milestone A for the tick and home replication; Milestone B for seams and the scene change) |
| 2 | The systems index lists no upstream system for row 2; this document depends on Game Data & Tuning (the catalog must be Ready first). Add it to row 2's "Depends On" | producer, at the next `/consistency-check` or `/map-systems` update | Before stories |
| 3 | Storms' open question "does solo play pause when the window loses focus?": this document provides auto-pause (default on) as an explicit pause. The Storms design doc should confirm or change the default | Storms design doc | When Storms is designed |
| 4 | Whether a co-op host may pause, and what guests see; join and leave rules; whose home it is | Co-op ADR | Before Tier 2a |
| 5 | A deliberate "Abandon run" option (end a run as a death without quitting the game) belongs to Run Flow; if added, it goes through Run Flow's end-of-run event, not a session shortcut | Run Flow design doc | Milestone B |

### Decisions taken on the designer's behalf (2026-11-27, autonomous mode)

Logged in `production/session-logs/decision-log.md`; each can be reversed:

1. Player Fantasy is indirect: "You never notice the host", supported by "The
   world agrees with itself" and "Nothing you did is lost to the save".
2. Requests that arrive while a waited write is pending are **refused** with
   "Saving…", not queued (R5).
3. Pause in solo play freezes **everything**, at home and in runs (R9).
4. Solo play **auto-pauses when the window loses focus**, as a player setting
   that defaults to on (R9).
5. The tick is a **fixed step**, 30 Hz provisionally (R6, F1).
6. Quitting during a run asks for confirmation, then leaves the marker so the
   next start resolves it as abandoned (R13).
7. Default timings: waited-write time limit 10 s, retries 1 s doubling to 8 s,
   "Saving…" after 0.3 s, quit drain 3 s (Tuning Knobs).
