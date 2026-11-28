# Session & Authority

> **Status**: In Review (revision 2, 2026-11-28, after the second `/design-review`, verdict NEEDS REVISION; awaiting re-review)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode). Senior review in `/design-review` 2026-11-28: NEEDS REVISION, see `design/gdd/reviews/session-and-authority-review-log.md`
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-28 (revision 2)
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
  looking, and a solo release build that loses focus pauses itself.
- **Nothing you did is lost to the save.** Every action at home is saved with
  its cost in one step, so a crash undoes at most the last action or two as a
  whole (ADR-0003). The home really is the scoreboard (Pillar 5) because the
  game never quietly loses a piece of it: if saving starts failing, the player
  sees "Unsaved changes" until a save succeeds. And the sting stays real
  (Pillar 3): **an unfinished run is an unbanked run.** Quitting or crashing
  during a run costs what was carried, exactly as dying would (ADR-0002). A
  quit is the player's choice and they are told before they make it; a crash
  is not a danger of the game, so the rule is disclosed plainly (a first-run
  tip, and the abandoned-run notice when they return) rather than dramatised.
  The one rare exception: if the player's disk refuses the run-end write and
  the player chooses to quit while it retries, the extraction is lost too;
  the Quit option says so in those words before they choose.

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

**R3. Every player-made state change is a request.** Anything a player does
that changes game state reaches the Simulation as a request: the player id,
the *intent* (place piece, remove piece, repair all, gather, stash move,
craft, launch run, mine, pick up, drop, extract, and any intent a later design
doc adds), its arguments, and a sequence number. Changes the Simulation makes
on its own each tick (oxygen draining, creatures moving, storms resolving)
are not requests; they are host-internal, and are published the same way
(R8). Each intent is owned by the system whose rule decides it; this system
owns the request's envelope and its handling. Two more intents come from
outside play and share the same queue: a **live tuning change** (development
builds and solo sessions only, Game Data & Tuning R12) and, from Tier 2a, a
**join**. Requests are handled in arrival order. Live tuning changes are not
applied when handled: they are queued and applied at the first tick in At
Home or In Run, each checked against the changes accepted before it (Game
Data & Tuning R12). So the tick still batches tuning, and a home request
queued after a tuning change is checked against the old tuning.

An intent that does not exist in the current milestone (for example *launch
run* in Milestone A, R14) is **Malformed**.

**Sequence numbers.** Each player's client numbers its requests with a 32-bit
unsigned number that starts at 1 for each session and rises by one per
request. It never wraps within a session (four billion requests is far
beyond any session) and resets with each new session. The host keeps the
**last-handled number per connection**, reset to 0 when that connection
joins (so a Tier 2a reconnect starts again at 1). Every handled request
advances it, refusals included. A request whose number is not higher is
refused as **Duplicate** (a resend or a stale request). A Duplicate refusal
is logged and gets **no second result**: the original request already got
its one result (R4 step 6). "Arrival order" means the order the host
receives requests, which is guaranteed per client only. The wire format is
the co-op ADR's.

Movement and looking are not requests: they are owned by the player's own
client (ADR-0001), and the host trusts the reported position for range
checks, an accepted shortcut to revisit before networked melee.

**The frozen flag.** This system publishes **one frozen flag**. It is set in
exactly the R5 cells where movement is *Frozen*: Starting, Loading,
Resolving, Stopping, Launching Run, Ending Run, At Home with a waited write
pending (kept deliberately: the player stays still while their home is not
saved), and At Home or In Run while paused. Player Controller reads only
that flag, never the session state or the paused flag directly.

**R4. How a request is handled.** Network handlers on the host only put
incoming requests in the queue; they never handle one directly (a request from
the host's own player can arrive immediately, mid-frame). Once per rendered
frame, before that frame's ticks (F1), and **whether or not any tick runs this
frame**, the host drains the queue, so a request made while paused or saving
still gets its refusal at once. The drain handles only the requests present
when it starts; a request enqueued during the drain (the host's own player,
mid-frame) waits for the next frame's drain.

1. Requests are taken in the order they arrived.
2. The **checks** run in this order, and the first that applies gives the
   reason: **Unknown player** → **Duplicate** → **Malformed** → **Saving** →
   **Paused** → the R5 cell for the current session state. A refused request
   stops here.
3. Otherwise the owning system's `Try…` method is called with the request. It
   returns either *accepted*, with the list of what changed, or *refused*,
   with a reason the owning system defines (for example Building's "not enough
   materials"). If it throws, the request is refused with **Internal error**
   (Edge Cases).
4. An accepted change is applied, the **model revision** rises by one, and
   the change list, stamped with it, is published to every client's
   Presentation (R8).
5. If the intent is a home action, a save point follows (R10).
6. The requesting player receives exactly one result for each request,
   matched by its sequence number (a Duplicate gets none, R3). A refusal goes
   only to that player. Each accepted result carries the model revision it
   produced.
7. The request's sequence number becomes the connection's last-handled
   number, whatever the outcome (R3).

If a request changes the session state (a launch accepted), the rest of the
queue is handled against the new state and the frame's remaining ticks are
not run. Then the frame's ticks run (F1).

**Two revision streams, never mixed.** The *model revision* counts accepted
changes to game state, including tick-driven ones that are published (a
storm resolving, run end); it is saved with the model. The *catalog revision*
counts live tuning changes (Game Data & Tuning R12); it is never saved and
never moves the model revision. Change lists travel on a reliable, ordered
channel; a view that sees a gap in model revisions, or has just loaded a
scene, asks for the full state.

**Full-state resync.** The full state is stamped with the model revision it
was taken at. While it is on its way, the view buffers incoming change lists;
when it arrives, the view applies it, drops buffered lists at or below the
stamp and applies the rest in order. A full state may be larger than one
message; how it is split into chunks is for the ADR-0001 amendment (R8).

The host never trusts a result a client supplies: a client says what it wants,
never what happened.

**R5. The session check.** Whether an intent may be accepted depends only on
the session state (States and Transitions), the *paused* flag and, in At
Home, whether a *waited write is pending* (the retry after a failed
marker-free write, R12). Off and Refused have no session, so no request can
arrive in them. The full check order is R4 step 2: Unknown player →
Duplicate → Malformed → **Saving** → **Paused** → the cell below. The Saving
and Paused precedence applies to **player intents only**; a live tuning
change and a join follow their own row.

| Intent class | Starting, Loading, Resolving, Stopping | At Home | Launching Run, Ending Run, or At Home with a waited write pending | In Run |
|---|---|---|---|---|
| Home action (place, remove, repair, gather, stash move, craft) | Refused: Not now | Accepted for checking, unless paused (Refused: Paused) | Refused: Saving | Refused: Wrong place |
| Launch run | Refused: Not now | Accepted for checking, unless paused (Refused: Paused) | Refused: Saving | Refused: Wrong place |
| Run action (mine, pick up, drop, use, extract) | Refused: Not now | Refused: Wrong place | Refused: Saving | Accepted for checking, unless paused (Refused: Paused) |
| Live tuning change (development builds, solo only) | Refused: Not now | Queued; applied at the next tick in At Home or In Run (Game Data & Tuning R12) | Queued; applied at the next tick in At Home or In Run | Queued; applied at the next tick in At Home or In Run |
| Join (Tier 2a) | Refused: Not now | Accepted for checking by the co-op rules; refused if the catalog fingerprint differs from revision 1's (Game Data & Tuning R12) | Refused: Saving | Per the co-op ADR |
| Movement, look (not a request) | Frozen | Allowed unless paused (Frozen) | Frozen | Allowed unless paused (Frozen) |

A live tuning change in a release build, or in a session with more than one
player, is refused in every state with **Not now** and logged; it never
reaches the catalog. "Frozen" in the last row is exactly where the frozen
flag is set (R3).

Session refusal reasons are a closed list owned here: **Not now**, **Paused**,
**Saving**, **Wrong place**, **Unknown player**, **Malformed** (arguments that
fail basic checks, such as an id the catalog does not know), **Duplicate** (a
sequence number already handled, R3) and **Internal error** (the owning rule
threw). Only the owning systems' reasons and "Saving…" are shown to the player
(UI Requirements); the others mean a bug or an impossible input and go to the
log. Requests refused while saving are not queued for later: the player sees
"Saving…" and acts again when it clears. Queuing them would let an action land
after a state the player did not see.

**R6. The fixed tick.** The Simulation advances in fixed steps of
`1 / tick_rate_hz` seconds (formula F1), never by the frame's length, so every
rule gives the same result at any frame rate. Ticks run only in At Home and In
Run, and only while not paused and no waited write is pending. Long frames are
caught up by running several ticks, up to the cap F1 derives; time beyond that
is dropped, not owed. F1 measures frames in real, unscaled time, never the
engine's scaled frame time. The tick runs from a **per-frame entry that comes
after network receive** (a frame update, or a PlayerLoop entry placed after
Netcode's receive step) and runs F1 there; the exact entry is fixed by the
ADR-0001 amendment (Open Questions 1). Netcode's network tick and the
engine's FixedUpdate are ruled out: neither can follow F1 (each has its own
step and catch-up rule). The tick and pause stay independent of the engine's
time scale and of Netcode's network time (which does not pause).

**R7. The play-time clock.** The storm clock (owned by Storms, ADR-0003)
advances by exactly one tick's length per tick (formula F2), so it counts only
time spent playing: not the main menu, not loading, not saving waits, not
pause, not while closed. This system feeds the ticks; it never reads the wall
clock and never depends on the engine's time scale. At home, after each tick,
it calls Storms' `AdvanceTo(playTime)`; if any storm resolved, that is a save
point (R10). It also calls `AdvanceTo` once on entering At Home (from Loading,
Resolving or Ending Run), before the first request is taken, so a storm that
fell due while the game was closed lands before the player can act, and
nothing can be carried out of the home ahead of it. During a run it does not call `AdvanceTo` (ADR-0003); the clock
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
game pauses itself when its window loses focus (**auto-pause**, a player
setting owned by Menus & Settings: default **on in release builds**, **off in
the editor and development builds**, where a developer switching windows
should not stop the game). Auto-pause opens the pause menu, exactly as if the
player had paused. Pause stops the tick: oxygen, creatures, hunters,
mining, the storm clock, everything, both at home and during a run. Pause is
an explicit state this system passes to the Simulation (ADR-0003), never a
change of the engine's time scale for the Simulation. While paused, requests
are refused with "Paused" and movement is frozen.

**Nothing moves while paused.** Everything that moves in a way rules depend
on is driven by the Simulation tick, so a paused frame shows exactly the
world as it stood. These are rules, not guidance:

- **Rules read physics only through queries and triggers** (raycasts,
  overlaps, trigger contacts), never through Rigidbody dynamics.
- **The host steps physics inside the tick.** Automatic simulation is off;
  each tick calls `Physics.SyncTransforms()` before its world queries and
  `Physics.Simulate(tick_dt_s)` once. A frame with no tick only syncs
  transforms, never steps.
- **Players move with a CharacterController** and an owner-authoritative
  NetworkTransform; there is no NetworkRigidbody.
- **Creatures move by NavMesh queries** (path and sample) with their movement
  integrated by the tick; no NavMeshAgent moves itself.
- **Presentation Animators have root motion off**, so animation never moves
  an object the rules read.

What only looks alive (animation, effects, ambient audio) is Presentation,
which may use a time scale of 0 or suspend those components by name while
paused.

The *paused* flag can be set in At Home, In Run, Launching Run and Ending
Run; set during a waited write, it holds after the write returns (Edge
Cases). Focus loss means the operating system window losing focus; an
overlay that does not take window focus does not pause the game. A focus
loss during Starting, Loading or Resolving is latched and applied on
entering At Home (the game arrives paused, with the pause menu open). With
more than one player in the
session, pause and auto-pause are unavailable (whether a co-op host may pause
is for the co-op ADR).

**R10. Save points and waited writes.** This system is the only caller of the
save queue (`ISaveQueue`, ADR-0003):

- **Home save points.** At the end of every frame in which a home action was
  accepted or a storm resolved at home, it takes one snapshot of the whole
  save model and hands it to the queue with `Request`. It does not wait. One
  snapshot covers every change of that frame, so a fast run of placements
  does not queue dozens of snapshots, and an action's cost and result are
  always in the same snapshot, so they reach the disk together.
- **Waited writes.** At run start (the run marker), at run end, and when an
  abandoned run is resolved at start-up, it uses `RequestAndWait` and holds
  the session in a waiting state until the result arrives; at load it uses
  `LoadAndWait`, which has no time-out and whose failure leads to Refused
  (States). While one is pending, the clock and all home save points are held
  and the "Saving…" indicator is shown (formula F5). A held home save point
  that the waited write's snapshot already covers is dropped, not written
  after it (a held snapshot taken before a marker-free write would otherwise
  bring the marker back). The main thread never blocks: time-outs and retry
  delays are timed in real time and checked each frame.
- **A waited write that fails or times out** (`waited_write_timeout_s`) is
  retried with growing delays (formula F3) and the player is told; no home
  action is accepted until it succeeds. **No new attempt starts until the
  previous one has returned**: the time-out only tells the player and starts
  the failure notice; the attempt still in the writer is never doubled. At
  run start a failed marker write cancels the launch instead, as ADR-0003
  Decision 11 sets out (R12). The load is never retried this way.
- **A failed home save** does not block. From the first failure until a save
  succeeds, the HUD shows a persistent "Unsaved changes" mark; each later save
  point tries again with the whole model. After
  `home_save_fail_block_count` failures in a row, a blocking notice says that
  progress is not being saved and why, with Retry and Quit (Quit says it loses
  the changes since the last good save); play resumes when a save succeeds or
  the player dismisses it. After a dismiss the count starts again, so the
  notice shows again after another `home_save_fail_block_count` failures in a
  row.
- **This set's own knobs used only while something is held**
  (`waited_write_timeout_s`, `retry_base_s`, `retry_cap_s`,
  `saving_indicator_delay_s`) apply from the next request drain after a live
  change, not the next tick, since no tick runs while a waited write is
  pending.

**R11. Building the Simulation.** At session start, after the game data
catalog is ready (Game Data & Tuning), this system builds each Simulation
system and hands it its own tuning set and definitions (Game Data & Tuning
R10). It also puts together the home façade (`IHomeSimulation`, ADR-0003) over
Building, Stash and Storms, and implements the world-query interface
(`IWorldQuery`) with the engine's physics and navigation on the host
(ADR-0001), answering questions of fact only. Its physics and navigation
answers follow R9's rules: queries and triggers only, transforms synced
before each tick's queries, physics stepped only inside the tick.

**R12. Starting, launching and ending runs.** The run sequences follow ADR-0002
and ADR-0003 exactly; this system is the one that carries them out.

- **Launch.** A *launch run* request accepted at home moves to Launching Run.
  The Simulation's `BeginRun(carried)` writes the run marker into the model; the
  snapshot is written with `RequestAndWait`. Success: the run scene loads, and
  the session stays in Launching Run (tick held, requests refused with
  "Saving…", movement frozen) until the load reports complete, then enters In
  Run. Failure or time-out of the write, or a failed scene load: the launch is
  cancelled, the marker is removed from the model, a marker-free snapshot is
  written and waited for, and the player stays home with a message naming
  what failed. If that write fails too, the session is At Home with a waited
  write pending: it is retried (F3) and no home action is accepted until it
  succeeds.
- **End.** Run Flow raises the end of a run (extraction or death); it never
  calls Storms or Stash itself. The session enters Ending Run and, in this
  order: calls `AdvanceTo` with the current clock, so every storm that passed
  during the run is applied first; has the haul placed (Stash's and Run Flow's
  rules decide where; on a death there is none); calls `EndRun(outcome)`, which
  records the outcome and clears the marker; takes one snapshot; writes it with
  `RequestAndWait`. On success the home scene loads, the session stays in
  Ending Run until the load reports complete, then enters At Home (where
  `AdvanceTo` runs once more, R7, finding nothing new). A failed home scene
  load is retried (F3) in Ending Run; the write has already landed, so nothing
  is at risk. On a write failure it retries (F3) and stays in Ending Run; the
  failure notice offers Quit, labelled "Quitting now loses this haul" after
  an extraction and plain "Quit" after a death, where there is no haul to
  lose (Edge Cases).
- The run-end sequence is a plain C# method on the Authority side, testable
  with no Netcode (ADR-0003).
- How the scene change itself is driven under a host is deferred to the first
  gameplay story (ADR-0001); this document fixes only that the waiting state
  lasts until the load reports complete, and what a failed load does.

**R13. Quitting.** The rule: **Stopping drains everything that can still
decide the next start, and the player is asked to confirm only when an
outcome is unconfirmed.** On an orderly quit (to the main menu or the
desktop): requests stop being accepted, the queue is drained (any waiting
snapshot is written) and a final play-time note is written, waiting at most
`quit_drain_timeout_s` unless a path below says otherwise; no new snapshot
is taken. Quitting during a run first asks the player to confirm with the
warning that everything carried will be lost; the run marker stays on disk
and the next start resolves it as an abandoned run (ADR-0002: leaving a run
is a death). Correctness never depends on the quit steps running: a kill
instead of a quit loses only what a crash loses.

**Quit from every state.** A quit may be asked for in any state with a
session:

| State | What the quit does |
|---|---|
| Starting | Takes effect once host start-up returns; nothing is written |
| Loading | Takes effect at once: the load is read-only, so nothing is at risk |
| Resolving | Takes effect after the current resolution attempt returns, capped at `waited_write_timeout_s`; re-resolving at the next start gives the same result (idempotent) |
| At Home | Normal drain within `quit_drain_timeout_s` |
| At Home, waited write pending | Confirmation first (below). Stopping cancels the retry delay and makes one last attempt, waiting within `quit_drain_timeout_s` |
| Launching Run | Confirmation first while the marker write is unconfirmed. The quit cancels the launch: the marker-free snapshot is queued behind the marker write (the queue is first in, first out) and both are drained, so a marker never outlives the quit |
| In Run | The quit-during-run confirmation, then a normal drain; the marker stays |
| Ending Run | Confirmation first while the run-end write is unconfirmed, including a first attempt that has not yet failed. Stopping waits for it up to `waited_write_timeout_s`. Once it has landed (home scene loading), a normal drain |

**Confirmation for an unconfirmed waited write**, in any state above where
one is pending: "Quitting now may lose the items you packed. Quit anyway?"
(final wording owned by the UX and narrative pass). Cancelling it leaves the
session where it was. If the drain still fails, the next start finds the
marker and shows the abandoned-run notice (Save & Load). The local fallback
of Open Questions 6 would cover this case too.

- **Quitting to the desktop** (closing the window, Alt+F4) goes through the
  same path: the engine's quit request is held (the `Application.wantsToQuit`
  handler returns false), the confirmation is shown if one applies, the drain
  runs over the next frames without blocking, then `NetworkManager.Shutdown()`
  runs and the application quits with `Application.Quit()`, which the handler
  now lets through. A second close while a quit is already in progress is
  ignored (re-entry guard). Leaving
  Play Mode in the editor does not give the game that chance and counts as a
  kill.

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
| **Launching Run** | Run marker write pending, then the run scene loading | Held | Refused: Saving |
| **In Run** | Run scene | Running unless paused | Per R5 |
| **Ending Run** | Run-end sequence and its write pending, then the home scene loading | Held | Refused: Saving |
| **Stopping** | Draining the queue and writing the final note | Stopped | Refused: Not now |
| **Refused** | The save could not be opened (newer version, locked by another running copy, unreadable with no readable backup) | Stopped | None |

*Paused* is a flag on At Home, In Run, Launching Run and Ending Run, not a
state of its own. *A waited write pending* is a flag on At Home only, set
while a failed marker-free write is retried (R12).

| From | To | Trigger |
|---|---|---|
| Off | Starting | Player presses Play (game data catalog already Ready) |
| Starting | Loading | Host started; Simulation built |
| Starting | Refused | Host could not start |
| Loading | At Home | Load result: loaded, loaded from a backup (player told), or new profile; no run marker. `AdvanceTo` runs once (R7) |
| Loading | Resolving | Load result says a run was abandoned (marker found) |
| Loading | Refused | Load result: newer version, locked by another running copy, or unreadable |
| Resolving | At Home | Resolution written; abandoned-run notice shown |
| Resolving | Resolving | Resolution write failed: retry (F3) |
| At Home | Launching Run | Launch run request accepted |
| Launching Run | Launching Run | Marker write succeeded; run scene loading |
| Launching Run | In Run | Run scene load complete |
| Launching Run | At Home | Marker write failed or timed out, or the run scene failed to load; marker-free snapshot written (if that write fails, At Home with a waited write pending) |
| In Run | Ending Run | Run Flow raises the end of the run |
| Ending Run | Ending Run | Run-end write failed: retry (F3); or write succeeded and the home scene is loading, or its load failed and is retried |
| Ending Run | At Home | Home scene load complete |
| Starting | Stopping | Player quits; takes effect once host start-up returns (R13) |
| Loading | Stopping | Player quits; takes effect at once, since the load is read-only (R13) |
| Resolving | Stopping | Player quits; takes effect after the current attempt returns, capped at `waited_write_timeout_s` (R13) |
| At Home | Stopping | Player quits; with a waited write pending, after the confirmation, and Stopping cancels the retry delay and makes one last attempt (R13) |
| In Run | Stopping | Player quits after the quit-during-run confirmation |
| Launching Run | Stopping | Player quits (after the confirmation while the marker write is unconfirmed); the launch is cancelled and the marker-free snapshot is queued behind the marker write and drained (R13) |
| Ending Run | Stopping | Player quits (after the confirmation while the run-end write is unconfirmed); Stopping waits for that write up to `waited_write_timeout_s` (R13) |
| Stopping | Off | Drain and note done, or the time limit for the path reached (R13); then to the main menu, or the application quits (to desktop) |
| Refused | Off | Player chooses the screen's one action, Quit (Save & Load's Refused screens) |

A cancelled quit confirmation is not a transition: the session stays in the
state it was in.

No other transition exists. In particular, In Run never returns to At Home
except through Ending Run, and nothing leaves Loading before the writer
returns except a quit, which is safe because the load only reads.

**Start-up order.** Game data catalog Ready (Game Data & Tuning) → Starting
(`StartSolo`) → Loading (`LoadAndWait`) → on the main thread, pick the later of
the save's clock and the play-time note's clock (ADR-0003 Decision 8) → resolve
a run marker if there is one → At Home, where `AdvanceTo` runs once before any
request (R7) and applies any storm that fell due between the last save and a
crash.

### Interactions with Other Systems

| System | Direction | What flows | Interface owner |
|---|---|---|---|
| Game Data & Tuning | In / Out | In: the catalog's rules view at session start (each system's tuning set and definitions); `tuning.session_and_authority`. Out: live tuning changes and joins go through this system's queue (R3, R5); it publishes the catalog revision so readers outside the Simulation (Input, Player Controller) get new values (Game Data & Tuning R10, R12) | Game Data & Tuning owns the rules; this system owns the queue and hand-over |
| Save & Load (`ISaveQueue`) | Out / In | `LoadAndWait`, `Request`, `RequestAndWait`, `NotePlayTime`, `Drain`; load results and failure notices back | ADR-0003 fixes the interface; Save & Load's design doc owns the store's behaviour; this system is its only caller |
| Building, Stash, Storms (through `IHomeSimulation`) | Out | Home requests; `Snapshot()`; `AdvanceTo(playTime)` at home ticks and once at run end; `StormReport`s back for Presentation | Each system owns its rules; this system owns when they are called |
| Gathering, Crafting, Pack | Out | Their intents as requests; change lists back | Owners |
| Run Flow | In / Out | Launch run request; `BeginRun(carried)` and `EndRun(outcome)` hooks; Run Flow raises the end of a run, this system carries out the sequence | Run Flow owns the run's states and outcome; this system owns the sequence and the writes |
| Mining, Health & Damage, Oxygen, Creature AI, Perception, Hunter Escalation | Out | Run intents as requests; `Tick(dt)`; `IWorldQuery` facts from physics and navigation on the host | Owners own rules; this system owns the tick and the world-query implementation |
| Player Controller | In / Out | In: owner-authoritative movement and look (not requests); the position the host trusts for range checks. Out: the one published frozen flag (R3), the only thing Player Controller reads to stop movement | Player Controller (movement); this system (the flag) |
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
max_ticks_per_frame = ceil(max_frame_dt_s × tick_rate_hz)
acc   = acc + min(frame_dt_s, max_frame_dt_s)
ticks = min(floor(acc / tick_dt_s), max_ticks_per_frame)
acc   = clamp(acc − ticks × tick_dt_s, 0, below(tick_dt_s))
```

with `tick_dt_s = 1 / tick_rate_hz`, all in double precision, and
`below(x)` the next double below `x` (`Math.BitDecrement(x)` in C#), so `acc`
stays in [0, tick_dt_s). `frame_dt_s` is real,
unscaled time since the last frame (not the engine's scaled frame time, which
a time scale or the engine's own long-frame cap would change). The cap on
ticks is derived, not tuned, so a counted frame can never lose time at any
legal knob values. While the tick is stopped or held (any state but At Home
and In Run, paused, or a waited write pending), `acc = 0`. If a request
changes the session state, the frame's remaining ticks are not run (R4).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| frame_dt_s | double | ≥ 0 | calculated | Real, unscaled time since the last frame |
| max_frame_dt_s | double | 0.05–1 | data file | Longest frame counted; a longer one (a debugger break, a disk stall) counts as this |
| tick_rate_hz | int | 20–60 | data file | Simulation ticks per second (default 30, provisional until the ADR-0001 amendment fixes the tick source) |
| tick_dt_s | double | 1/60–1/20 | calculated | Length of one tick |
| max_ticks_per_frame | int | 1–60 | calculated | Most ticks run in one frame: ceil(max_frame_dt_s × tick_rate_hz); 8 at the defaults |
| acc | double | 0 to < tick_dt_s after each frame | calculated | Unspent time carried to the next frame |
| ticks | int | 0 to max_ticks_per_frame | calculated | Ticks run this frame |

**Output Range:** 0 to `max_ticks_per_frame` ticks per frame. At 60 frames per
second and 30 Hz, one tick every other frame; at 15 frames per second, 2 ticks
a frame.
**Boundaries:** `frame_dt_s = 0` gives 0 ticks. A 5 s stall counts as
`max_frame_dt_s` (0.25 s) → 7 ticks at 30 Hz (under the cap of 8), and the
other 4.75 s are never owed, so the game never tries to catch up for seconds
("spiral of death"). At the knob extremes (max_frame_dt_s 1, 60 Hz) the cap
is 60 ticks: a one-second stall is fully caught up in one burst. Below 1 /
max_frame_dt_s frames per second (4 at the default), play slows down, by
design. `tick_rate_hz` cannot be 0 (range starts at 20), so the division is
defined.
**Example:** 30 Hz (tick 0.0333 s), frame of 0.05 s, acc 0.02: acc = 0.07 →
ticks = 2 → acc = 0.0033. A 5 s frame from acc 0 counts as 0.25 s → 7 ticks
→ acc = 0.25 − 7/30 ≈ 0.01667.

### F2. Play-time clock advance

The `play_time_ms` formula is defined as, once per tick (R7):

`play_time_ms' = play_time_ms + tick_dt_s × 1000`

using Game Data & Tuning's D3, in double precision, without rounding per tick
(ADR-0003).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| play_time_ms | double | 0 upward | calculated (saved by Storms) | The storm clock |
| tick_dt_s | double | 1/60–1/20 | calculated (F1) | Length of one tick |
| 1000 | int | — | constant | Milliseconds per second |

**Output Range:** grows by 3,600,000 (within about 1 ms of rounding) per hour
of *ticks* at any tick rate, which equals an hour of unpaused play whenever
no frame is longer than `max_frame_dt_s`; time dropped by F1 in a stall is not
counted, so the clock never runs ahead of play. It never grows in the menu,
loading, saving waits or pause.
**Boundaries:** no tick, no change. Double precision keeps the sum's rounding
error far below a millisecond for far longer than any profile will be
played.
**Example:** at 30 Hz each tick adds 33.333… ms; 108,000 ticks (one hour) add
3,600,000 ms.

### F3. Waited-write retry delay

The `retry_delay_s` formula is defined as, for the k-th retry of a failed or
timed-out waited write (R10):

`retry_delay_s(k) = min(retry_base_s × 2^(k − 1), retry_cap_s)`, for k ≥ 1

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| k | int | 1 upward | calculated | Retry number; resets to 1 for each new waited write (the marker-free write after a cancelled launch starts again at 1) |
| retry_base_s | double | 0.25–5 | data file | First delay |
| retry_cap_s | double | 5–60 | data file | Longest delay (its range starts at retry_base_s's maximum, so it can never be below it; constraint `retry_base_s ≤ retry_cap_s`) |

Delays are measured in real time (the play-time clock is held during them).
The delay is computed by doubling the previous delay and stopping at the cap,
never by computing 2^(k − 1) as an integer, so no k can overflow.

**Output Range:** `retry_base_s` to `retry_cap_s`. Defaults (1 s, 8 s): 1, 2,
4, 8, 8, 8… s.
**Boundaries:** `k = 0` is not a retry (the first attempt has no delay).
Retries never stop on their own: the player is shown the failure and can
quit; the waited write is never abandoned while the session keeps running.
**Example:** a run-end write fails three times (a cloud-sync tool holding the
file): waits of 1, 2 and 4 s, then the fourth try succeeds about 7 s plus write
time later. Those are fast failures. An attempt that times out instead adds
up to `waited_write_timeout_s` before its retry delay starts, and the next
attempt still waits for it to return (R10).

### F4. Play-time note schedule

The `note_due` formula is defined as, after each tick (R7):

`note_due = play_time_ms ≥ last_note_ms + note_interval_s × 1000`

When true, the note is requested and `last_note_ms = play_time_ms`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| play_time_ms | double | 0 upward | calculated (F2) | Current clock |
| last_note_ms | double | 0 upward | calculated | Clock when the last note was requested; set to the loaded clock at start-up |
| note_interval_s | double | Save & Load's range (about 30 s; this document assumes a minimum of 5 s, so at most one note per (5 × tick_rate_hz) ticks) | data file (`tuning.save_and_load`) | Play time between notes |

**Output Range:** one note request per `note_interval_s` of play; with ticks
of 1/30 s, a note is at most one tick late.
**Boundaries:** paused or held, the clock does not move, so no note is due.
An orderly quit writes a final note regardless (R13).
**Example:** interval 30 s, last note at 600,000 ms: the next note is
requested on the first tick at or after 630,000 ms.

### F5. "Saving…" indicator

The `show_saving` formula is defined as:

`show_saving = waited_write_pending ∧ (refused_while_pending ∨ now_s − pending_since_s ≥ saving_indicator_delay_s)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| waited_write_pending | bool | — | calculated | A load, marker, run-end or abandoned-run write, or its retry sequence, is not finished: it stays true through retry delays, so the indicator does not flicker off between attempts |
| now_s, pending_since_s | double | — | calculated | Real time now and when the first attempt started (real time, since the clock is held) |
| refused_while_pending | bool | — | calculated | A player request was refused with Saving during this waited write; once true, it stays true until the write is finished |
| saving_indicator_delay_s | float | 0–1 | data file | Delay before the indicator appears when the player has not acted |

**Output Range:** true or false.
**Boundaries:** delay 0 shows the indicator at once, which flickers for fast
writes; delay 1 leaves a second with no feedback. Default 0.3 s: a typical
write never shows it, a slow one shows it before the player wonders.
**Example:** a run-end write that takes 0.12 s shows nothing; one that takes
2 s shows "Saving…" from 0.3 s to 2 s. A request made at 0.1 s is refused
with "Saving" (R5), and the indicator shows at once with that reason: the
delay only applies while the player has not acted, so an action is never
refused in silence.

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
  with **Internal error**, the error is logged with the request, the model is
  not changed, and the session keeps running. In development builds the error
  is also shown on screen.
- **If a client resends a request, or one arrives out of order**: a sequence
  number not above the last one handled for that connection is refused as
  **Duplicate** and logged, and no second result is sent; nothing is applied
  twice. Refusals advance the last-handled number too, so resending a refused
  request is also a Duplicate.
- **If a request names an intent that does not exist in this milestone**:
  refused as **Malformed** (R3).
- **If several checks fail at once** (an unknown player sending a duplicate
  while saving): the first in R4's order wins: Unknown player, Duplicate,
  Malformed, Saving, Paused, then the R5 cell.
- **If a request is enqueued while the drain runs** (the host's own player,
  mid-frame): it waits for the next frame's drain (R4).
- **If a live tuning change is sent from a release build or a session with
  more than one player**: refused with Not now and logged (R5).
- **If a request arrives while paused or saving and no tick runs that
  frame**: it is still handled that frame and refused at once (R4); it does
  not wait for the next tick.

**Time and pause**

- **If a frame takes seconds** (debugger, disk stall, alt-tab on a slow
  machine): F1 counts at most `max_frame_dt_s` and runs at most
  `max_ticks_per_frame` ticks; the rest of the time is not owed. The clock
  advances only by the ticks that ran.
- **If the window loses focus in solo play with auto-pause on** (the release
  default): the game pauses at once, at home or in a run, and the pause menu
  opens; it stays paused when focus returns until the player unpauses. With
  auto-pause off (the editor and development default), it keeps running in
  the background (the project runs in the background, which a host needs).
- **If the window loses focus during Starting, Loading or Resolving**: the
  focus loss is latched and applied on entering At Home, so the player
  arrives paused with the pause menu open.
- **If the player pauses during a waited write**: the write continues (it is on
  the writer); when it returns, the session moves on (for example to In Run)
  but stays paused.
- **If a storm falls due in the same frame the player launches a run**:
  requests are handled before that frame's ticks (R4), so the launch is
  accepted first and the session enters Launching Run, where no tick runs.
  The storm is then resolved by `AdvanceTo` at the end of the run, before the
  haul is placed (R12), with the result the forecast promised. A storm can
  never fall into the gap between home and run unaccounted for.
- **If a storm fell due while the game was closed**: `AdvanceTo` runs once on
  entering At Home, before any request (R7), so nothing can be carried out of
  the home ahead of it.
- **If the player is in the middle of fast actions when a pause starts**:
  paused, requests are refused with "Paused"; but the player is in the pause
  menu then, so they rarely see it.
- **If a stash or other home object is driven by engine physics or
  animation**: rules never read it (R9: queries and triggers only, physics
  stepped inside the tick, root motion off); a paused frame shows the world as
  it stood.
- **If a storm fell due during a pause**: impossible; the clock does not move
  while paused.

**Saving**

- **If a home save fails** (disk full, file held by another program): play
  continues, the "Unsaved changes" mark stays on screen until a save
  succeeds, and the next save point tries again with the whole model, so
  nothing is lost unless the game also crashes before a save succeeds. After
  `home_save_fail_block_count` failures in a row the blocking notice appears
  (R10), so a player cannot build for an hour on a full disk without knowing.
- **If the run-marker write fails or times out**: the launch is cancelled and
  the player stays home (R12); a late arrival of the timed-out write on disk is
  followed by the marker-free write, because the queue writes in order
  (ADR-0003).
- **If the run-end write keeps failing**: the session stays in Ending Run,
  retrying (F3), showing the failure and offering Quit, labelled "Quitting now
  loses this haul" after an extraction (plain "Quit" after a death). If the player quits, the marker is still on disk; the next
  start resolves it as an abandoned run and the haul is lost. This fails
  closed: nothing can be duplicated, and it is the only way a successful
  extraction can still be lost, which is accepted as a rare failure of the
  player's disk, disclosed before the player chooses (Player Fantasy). A local
  fallback write that would let the next start honour the extraction is an
  open question (Open Questions 6).
- **If the run or home scene fails to load**: a run scene that fails after
  the marker write cancels the launch like a failed marker write (R12); a home
  scene that fails after the run-end write is retried in Ending Run, since
  the result is already on disk.
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
- **If the player quits during Launching Run**: the confirmation is shown
  while the marker write is unconfirmed; on confirming, the launch is
  cancelled, the marker-free snapshot is queued behind the marker write and
  both are drained, so a marker never outlives the quit (R13).
- **If the player quits during Ending Run**: the confirmation is shown while
  the run-end write is unconfirmed, even if its first attempt has not failed;
  Stopping waits for it up to `waited_write_timeout_s`. If it still fails,
  the marker decides the next start (an abandoned run, R13).
- **If the player quits at home while a waited write is pending**: the
  confirmation is shown; Stopping cancels the retry delay and makes one last
  attempt within `quit_drain_timeout_s`. If that fails too, the next start
  finds the marker and shows the abandoned-run notice.
- **If the player quits during Resolving**: the quit takes effect after the
  current attempt returns, capped at `waited_write_timeout_s`; resolving
  again at the next start gives the same result.
- **If the player quits during Loading**: the quit takes effect at once; the
  load only reads.
- **If the player cancels a quit confirmation**: nothing changes; the session
  stays where it was (In Run stays In Run).
- **If the window is closed twice while a quit drains**: the second close is
  ignored (R13).
- **If a held home save point is older than a waited write's snapshot**: it
  is dropped (R10), so a snapshot taken before a marker-free write can never
  bring the marker back.
- **If a waited write times out while still in the writer**: the player is
  told, but no second attempt starts until the first returns (R10).
- **If a save holds a run marker in Milestone A** (only possible from a later
  build's save loaded into an older one, which ADR-0002 refuses as a newer
  version): not reachable.

**Degenerate strategies**

- **Pausing to scout or to escape a creature**: pause freezes the whole
  Simulation and hides nothing new (the game keeps showing the frozen view), so
  it buys thinking time, not information or safety. Rapid pause and unpause
  lets a player study a creature's wind-up frame by frame. Accepted as an
  accessibility trade-off: solo only, and Pillar 2 favours the player having
  time to read danger. Revisit if a competitive mode is ever added.
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
| Input (3) | Soft | Session state (to choose its Frozen context), pause and quit | [input.md](input.md) (in review) |
| Ore & Item Economy (4) | Hard, Authority side only | Container operations run only inside an accepted request; its refusal reasons are returned as the owning system's | [ore-and-item-economy.md](ore-and-item-economy.md) (in review) |
| Home Valley (5) | Hard | Construction of the valley model (R11), the At Home and dormant states, the tick, the gather request path (R4), the save point after a home action (R10) | [home-valley.md](home-valley.md) |
| Player Controller (6) | Hard | The one published frozen flag (R3), the host's trust of its position; new tuning values when the catalog revision changes | [player-controller.md](player-controller.md) |
| Save & Load (7) | Hard | Its only caller; the load at start-up and every save point; it owns the abandoned-run notice's detection and text | [save-and-load.md](save-and-load.md) |
| Pack (8) | Hard | Requests (pick up, drop), the session check, and published pack state | [pack.md](pack.md) |
| Health & Damage (17) | Hard | Tick and host-only damage | Not written |
| Co-op Sessions (32) | Hard | The whole session model | Not written; blocked on the co-op ADR |
| Every Simulation system (Building, Stash, Crafting, Gathering, Storms, Mining, Oxygen, Creature AI, Perception, Hunter Escalation, Run Flow) | Hard | Construction (R11), requests (R4), the tick (R6), save points (R10) | Not written. Per the systems index TD note, "rules never depend on Session & Authority"; only their networked parts do |
| Home HUD & Panels, Run HUD, Menus & Settings | Hard | Published state, refusal reasons, notices, pause and quit | Not written |

**Bidirectional check.** The systems index lists Session & Authority under
rows 6, 7, 8, 17 and 32, matching the table. Home Valley (5) is not in the
index's Depends On for Session & Authority, but its doc lists it as a hard
upstream dependency, so it is in the table. The written dependents
(`input.md`, `ore-and-item-economy.md`, `home-valley.md`,
`player-controller.md`, `save-and-load.md`, `pack.md`) each list Session &
Authority; Game Data & Tuning's doc lists it as its first downstream system.
Dependents not yet written must list it (its networked part) when written.

**Open conflicts flagged to owners.** This document does not edit other
documents; these are for their owners to apply:

1. `player-controller.md` R10 should read only the published frozen flag
   (R3), including At Home with a waited write pending; its focus-loss edge
   case should read "not paused unless the player pauses or auto-pause
   fires" (auto-pause is off by default in the editor and development
   builds, R9).
2. `save-and-load.md` should narrow `replace_retry_count` to at most 4 and
   `replace_retry_delay_s` to at most 0.6 s, so its in-writer retries stay
   well inside `waited_write_timeout_s`'s new minimum of 5 s, and drop its
   cross-set constraint line (or make it a CI test, per Game Data & Tuning's
   ruling). Its Dependencies row for Run Flow names Run Flow as the
   abandoned-run notice's owner; the owner is Save & Load (UI Requirements
   4).
3. `game-data-and-tuning.md` R12's batching wording should match R3 here:
   requests in arrival order; live tuning changes queued and applied at the
   first tick in At Home or In Run, each checked against the changes
   accepted before it.

## Tuning Knobs

`tuning.session_and_authority`, in Game Data & Tuning's record shape. All are
`provisional: true` until the first gameplay story measures them.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `tick_rate_hz` | int | 30 | 20 | 60 | 1 | `hz` | `restart` | Coarse timing: a 0.55 s creature wind-up lands on 16 or 17 ticks; drill and oxygen steps feel lumpy | More CPU per second for the same game; little gain for a slow-paced game | Half the target frame rate; fine enough for the prototype's shortest timings (0.45 s stun drill). `restart`: a live change would reinterpret every tick-counted timer mid-run |
| `max_frame_dt_s` | float | 0.25 | 0.05 | 1 | 0.05 | `s` | `live` | Ordinary slow frames lose time | A stall turns into a burst of ticks | A quarter second: anything longer is a stall, not play. The tick cap is derived from it (F1) |
| `waited_write_timeout_s` | float | 10 | 5 | 30 | 1 | `s` | `live` | A slow disk fails launches and run ends that would have succeeded | The player watches "Saving…" for a long time before being told | Long enough for a slow disk and a cloud-sync tool; ADR-0003 requires a time limit. Minimum 5 s (raised from 3 in revision 2) keeps Save & Load's in-writer replace retries well inside one attempt (Dependencies, open conflict 2) |
| `retry_base_s` | float | 1 | 0.25 | 5 | 0.25 | `s` | `live` | Retries hammer a disk that is busy | The player waits after a brief glitch | F3 |
| `retry_cap_s` | float | 8 | 5 | 60 | 1 | `s` | `live` | Retries too frequent while a file stays held | The player waits long after the problem clears | F3; 8 s keeps the next try within a short wait |
| `saving_indicator_delay_s` | float | 0.3 | 0 | 1 | 0.05 | `s` | `live` | Flicker on fast writes | No feedback during a slow write | F5 |
| `quit_drain_timeout_s` | float | 3 | 1 | 10 | 0.5 | `s` | `live` | A pending home save may not finish on quit (allowed: correctness does not depend on it) | Quitting feels stuck | ADR-0003: drain within a bounded wait |
| `home_save_fail_block_count` | int | 3 | 1 | 20 | 1 | `count` | `live` | A single glitch interrupts play | A player builds a long time on a disk that is not saving | Three failed save points in a row is a pattern, not a glitch (R10) |

Constraint: `retry_base_s ≤ retry_cap_s` (also guaranteed by the ranges).
Owner: Session & Authority. The unit `hz` (whole ticks per second, `int`,
min > 0) is added to Game Data & Tuning's R5 table in its revision 2.
`max_ticks_per_frame` is no longer a knob: F1 derives it, so no legal
combination of knobs can make a counted frame lose time.

Not knobs here: the play-time note interval is Save & Load's
(`tuning.save_and_load`); the auto-pause-on-focus-loss switch is a player
setting owned by Menus & Settings (default on in release builds, off in the
editor and development builds, R9), not tuning. `waited_write_timeout_s`,
`retry_base_s`, `retry_cap_s` and `saving_indicator_delay_s` apply from the
next request drain, not the next tick (R10).

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
  dialog (ADR-0001 Verification 1). Target: a fresh-install start reaches At
  Home within **2 s** on the development PC. Source: the "you never notice
  the host" moment (Player Fantasy) needs a start no longer than an ordinary
  single-player load; 2 s is the budget for the home scene plus an empty
  save, provisional until AC1 measures it.
- **Actions answer at once.** A request made at home gets its result within one
  tick (33 ms at 30 Hz) plus a frame, so placing a piece or moving ore never
  feels laggy in solo play.
- **Waits are short and honest.** Run start and run end show "Saving…" only if
  the write takes longer than 0.3 s, or at once if the player acts and is
  refused (F5); a failure says what failed and what happens next; the player
  is never left on a frozen screen or refused in silence.

## UI Requirements

This system raises; the HUD systems show. Required surfaces:

1. **Refusal feedback.** A refused request reaches the player as a short
   reason near the action when the reason is one they can act on: the owning
   system's reason, "Saving…" (shown at once with the refusal, which also
   starts the indicator, F5) and "Can't do that here" (Wrong place). Not now, Paused, Unknown player, Malformed,
   Duplicate and Internal error are logged, not shown (development builds show
   Internal error on screen). Repeats of the same refusal within a second show
   once (timed in real time, so it is testable with an injected clock).
2. **"Saving…" indicator** during waited writes (F5), at home and on the
   run-start and run-end transitions.
3. **Failed save notices.** Home save failing: a persistent "Unsaved changes"
   mark until a save succeeds, and a blocking notice with Retry and Quit after
   `home_save_fail_block_count` failures in a row; its Quit says it loses
   the changes since the last good save, and after a dismiss it shows again
   after another `home_save_fail_block_count` failures. Waited write failing:
   blocking, with retry count and a Quit option; during run end after an
   extraction the Quit option reads "Quitting now loses this haul" (after a
   death, plain "Quit").
4. **Abandoned-run notice**: shown on entering At Home after Resolving. Save
   & Load owns its detection and its text (`save-and-load.md`).
5. **Quit confirmations**: during a run, "Quitting now ends the run.
   Everything you carry will be lost." Confirm or stay. While a waited write
   is unconfirmed (R13), "Quitting now may lose the items you packed. Quit
   anyway?" (final wording owned by the UX and narrative pass). Cancelling
   either stays where the player was.
6. **Refused screen**: newer save version ("This save is from a newer version
   of Star Haul"), locked ("Star Haul is already running"), unreadable with no
   backup. Each says the save was not changed. Its one action is **Quit**,
   which returns to Off (matching `save-and-load.md`).
7. **Pause menu hook** and the auto-pause setting (owned by Menus & Settings);
   auto-pause opens the pause menu (R9).
8. **First-run tip** that an unfinished run is an unbanked run: quitting or
   a crash during a run loses what is carried (owned by First-Run Guidance).

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
| `design/gdd/save-and-load.md` | R3, R4, Edge Cases, UI | The lock file (AC6); the abandoned-run notice's detection and text; Refused screens with Quit; in-writer replace retries (Dependencies, open conflict 2) |
| `design/gdd/player-controller.md`, `design/gdd/pack.md`, `design/gdd/home-valley.md` | Dependencies | Dependents that read the frozen flag, the session check and the request path |
| `design/gdd/systems-index.md` | Row 2; TD notes | Dependents; "rules never depend on Session & Authority"; Run Flow never calls Storms |

## Acceptance Criteria

**Type**: *Logic* criteria need an automated EditMode test under
`StarHaul/Assets/Tests/EditMode/` with no scene and no Netcode, written against
fakes of the owning systems' `Try…` methods, `IHomeSimulation`, `ISaveQueue`
and an injected real-time clock, so they do not wait on undesigned systems;
*Integration* criteria need an automated PlayMode test or a documented check;
*UI* criteria need a retained screenshot in `production/qa/evidence/`, one
per message named. A criterion that needs more than one kind of evidence is
split into one criterion per kind. Each criterion names its milestone: **[A]** testable in
Milestone A (the valley, no runs), **[B]** from Milestone B (runs). Criteria
marked **(provisional on X)** cannot be finished until X's design doc or ADR
exists. R8's replication method and R12's scene-change mechanism are deferred
by ADR-0001 and get criteria in their amendment's stories. The traceability
table at the end maps every rule, formula and state to its criteria.

**Session and start-up**

1. **GIVEN** a fresh install (the save directory deleted before each start),
   in a non-development standalone Windows build run by a user with no
   firewall rule for the game, **WHEN** the player presses Play, **THEN** the
   log shows catalog Ready → Starting → Loading (result: new) → At Home in
   that order, and the median of 5 starts from Play to At Home is at most 2 s
   on the development PC (Game Feel). *(Integration; [A]; R1, States, Game
   Feel; provisional on ADR-0001 Verification 1 for the transport)*
2. **GIVEN** the build and start of criterion 1, **THEN** a screenshot taken
   during start shows no network or firewall dialog. *(UI; [A]; R1, Game
   Feel)*
3. **GIVEN** a fake `ISaveQueue` whose load returns a save clock of 600,000 ms
   and a note clock of 630,000 ms, **WHEN** loaded, **THEN** the session clock
   and `last_note_ms` are 630,000; **GIVEN** a note clock of 590,000, **THEN**
   600,000. *(Logic; [A]; start-up order, F4)*
4. **GIVEN** a fake load result holding a run marker, **WHEN** the game
   starts, **THEN** the session passes through Resolving, `AdvanceTo` is called
   exactly once there, the carried items are gone, the marker is cleared in
   one waited write, and the abandoned-run notice event is raised on entering
   At Home. *(Logic; [B]; States, R12, UI Requirements 4)*
5. **GIVEN** that abandoned-run notice, **THEN** a screenshot shows it on
   entering At Home, with the content Save & Load specifies. *(UI; [B]; UI
   Requirements 4; content per `save-and-load.md`)*
6. **GIVEN** a save with a format version newer than the game, a save locked
   by another running copy (the lock designed in `save-and-load.md`, R3 and
   Edge Cases), or an unreadable save with no backup, **WHEN** the player
   presses Play, **THEN** the session enters Refused from Loading with the
   matching message, the save file's bytes are unchanged, and choosing Quit
   returns to Off. *(Integration; [A]; States)*
7. **GIVEN** those three cases, **THEN** three screenshots show the three
   messages, each with Quit as its only action. *(UI; [A]; UI Requirements 6)*
8. **GIVEN** a solo session whose network client id is 0 and whose profile
   player id is `P-7`, **WHEN** a snapshot is serialised, **THEN** the
   session's `playerId` is `P-7` and no field of the snapshot holds the client
   id. *(Logic; [A]; R2)*
9. **GIVEN** a Milestone A build, **WHEN** it is started and quit, **THEN** the
   log shows exactly Off → Starting → Loading → At Home → Stopping → Off.
   *(Integration; [A]; R14)*
10. **GIVEN** a Milestone A session At Home, **WHEN** a launch-run request
    arrives, **THEN** it is refused as Malformed and nothing changes.
    *(Logic; [A]; R3, R14)*

**Requests**

11. **GIVEN** At Home and a fake Building whose `TryPlace` accepts, **WHEN** a
    place-piece request is sent, **THEN** exactly one accepted result with the
    request's sequence number arrives, carrying the new model revision; the
    model revision rises by one, the change list carries that revision and
    names the new piece, and one snapshot is handed to the queue at the end of
    the frame. *(Logic; [A]; R3, R4, R10)*
12. **GIVEN** two requests in one frame that each move the last ore into the
    stash, and a fake Stash that counts, **WHEN** handled, **THEN** the first is
    accepted, the second refused by the owning rule, and the ore exists exactly
    once. *(Logic; [A]; R4, Edge Cases; provisional on Stash for its
    refusal)*
13. **GIVEN** each of the **56 cells** of R5's table for player and tuning
    intents (4 intent classes: home action, launch run, run action, live
    tuning change; × 14 session conditions: Starting, Loading, Resolving,
    Stopping, At Home, At Home paused, At Home with a waited write pending,
    the same paused, Launching Run, Launching Run paused, Ending Run, Ending
    Run paused, In Run, In Run paused), **WHEN** a request of that class
    arrives, **THEN** the result is exactly: Not now for every class in the
    first four conditions; in At Home, home action and launch run accepted
    for checking, run action Wrong place; in At Home paused and In Run
    paused, every player intent Paused; in the six Saving conditions (waited
    write pending, Launching Run, Ending Run, paused or not), every player
    intent Saving; in In Run, home action and launch run Wrong place, run
    action accepted for checking; and the live tuning change queued for the
    next tick in At Home or In Run in all ten At Home, Launching Run, Ending
    Run and In Run conditions. The Join row is deferred to the co-op ADR and
    is not part of this criterion; the Movement row is tested by the frozen
    flag (criterion 27). *(Logic; [A] for the home and tuning rows, [B] for
    run rows and run states; R5, one test per cell)*
14. **GIVEN** At Home, not paused, last-handled number 5, **WHEN** requests
    arrive naming an unknown catalog id (number 6), a player id not in the
    session, number 5 again, and number 3, **THEN** they are refused as
    Malformed, Unknown player, Duplicate and Duplicate; the Duplicates get no
    result and are logged; nothing changes; and the frame completes.
    *(Logic; [A]; R3, R4, R5)*
15. **GIVEN** At Home, **WHEN** requests arrive that fail several checks at
    once (unknown player with a duplicate number; duplicate number with
    malformed arguments; malformed arguments during a waited write; a home
    action while saving and paused), **THEN** the reasons are Unknown player,
    Duplicate, Malformed and Saving, per R4's order. **GIVEN** a request
    refused with Wrong place at number 7, **WHEN** number 7 is resent,
    **THEN** it is a Duplicate with no result. **GIVEN** a second connection
    joining a two-player test harness, **THEN** its number 1 is accepted for
    checking (last-handled is per connection, reset on join). *(Logic; [A];
    R3, R4)*
16. **GIVEN** an owning system that throws inside `Try…`, **WHEN** a request
    reaches it, **THEN** the request is refused with Internal error, the model
    revision is unchanged, the error is logged, and the next tick runs.
    *(Logic; [A]; Edge Cases)*
17. **GIVEN** the session paused, **WHEN** a home request arrives in a frame
    with no tick, **THEN** its Paused refusal is sent that same frame. *(Logic;
    [A]; R4)*
18. **GIVEN** a refusal for player A in a test harness with two player ids,
    **THEN** only A receives a result. **GIVEN** a request that is accepted and
    changes the session state (a launch), **THEN** the rest of that frame's
    requests see the new state and no tick runs after it that frame.
    *(Logic; [B]; R4)*
19. **GIVEN** At Home, **WHEN** three requests numbered 1, 2 and 3 arrive in
    one frame (two accepted, one refused by the owning rule), **THEN** exactly
    three results arrive, matched to 1, 2 and 3, the two accepted ones
    carrying consecutive model revisions. *(Logic; [A]; R4 step 6)*
20. **GIVEN** a fake that enqueues a request while the drain runs, **THEN**
    that request is not handled this frame and is handled at the next
    frame's drain. *(Logic; [A]; R4)*
21. **GIVEN** a fresh solo session, **WHEN** the RPC handler a remote client
    would reach is called directly with a request numbered 1, **AND** in
    another fresh session the same request numbered 1 is sent by the local
    call, **THEN** both reach the same enqueue method and give the same
    result and model revision. *(Integration; [A]; R1)*
22. **GIVEN** a development build, solo, At Home, **WHEN** a live tuning change
    and a home request are queued in that order, **THEN** they are handled in
    that order, the home request's result comes in the same frame and was
    checked against the old tuning, the tuning change applies at the next
    tick (Game Data & Tuning R12), the catalog revision rises by one, the
    model revision does not move for the tuning change, and no snapshot holds
    the catalog revision. *(Logic; [A]; R3, R4, R5)*
23. **GIVEN** a release build, or a test harness with two player ids, **WHEN**
    a live tuning change arrives in At Home, **THEN** it is refused with Not
    now, logged, and the catalog is unchanged. *(Logic; [A]; R5)*
24. **GIVEN** a fake view at model revision 5, **WHEN** it receives change
    list 7, **THEN** it asks for the full state; **GIVEN** change lists 7, 8
    and 9 buffered and a full state stamped 8 arriving, **THEN** the view
    applies the full state, drops 7 and 8, applies 9, and ends at revision 9.
    *(Logic; [A]; R4 full-state resync)*

**Tick, clock and pause**

25. **GIVEN** 30 Hz, `max_frame_dt_s` 0.25 and a frame sequence of 0.05, 0.04,
    0.05 s from acc 0, **WHEN** F1 runs, **THEN** ticks are 1, 1, 2 and acc ends
    at 0.00667 (±1e-6). **GIVEN** a 5 s frame from acc 0, **THEN** 7 ticks run
    and acc ≈ 0.01667 (±1e-6). **GIVEN** 0 s, **THEN** 0. **GIVEN**
    `max_frame_dt_s` 1 and 60 Hz, **THEN** the derived cap is 60 and a 1 s
    frame runs 60 ticks with acc in [0, 1/60). **GIVEN** any frame, **THEN**
    acc never exceeds `Math.BitDecrement(tick_dt_s)`. *(Logic; [A]; F1)*
26. **GIVEN** a simulated hour of At Home ticks at 20, 30 and 60 Hz, **WHEN**
    F2 accumulates in double precision, **THEN** the clock grows by 3,600,000
    ms (±1 ms) in each case. *(Logic; [A]; F2, R7)*
27. **GIVEN** each of Starting, Loading, Resolving, Launching Run, Ending Run,
    Stopping, At Home with a waited write pending, At Home paused and In Run
    paused, **WHEN** 1,800 frames of 1/30 s are fed to F1, **THEN** ticks = 0,
    the clock is unchanged, the fake Simulation's `Tick` was never called,
    and the published frozen flag is set; **GIVEN** At Home and In Run,
    unpaused, with nothing pending, **THEN** the flag is clear. *(Logic; [A],
    [B] for run states; R3, R5 Movement row, R6, R7, R9)*
28. **GIVEN** a paused run with a creature mid-move, **WHEN** 2 s of frames
    pass, **THEN** the creature's position and the physics bodies the rules
    read are unchanged (logged positions before and after are equal).
    *(Integration; [B]; R9; provisional on Creature AI)*
29. **GIVEN** a fake physics stepper, **WHEN** a frame runs two ticks, **THEN**
    each tick calls `SyncTransforms` before its world queries and `Simulate`
    once with `tick_dt_s`; **WHEN** a frame runs no tick, **THEN** it calls
    `SyncTransforms` only. *(Logic; [A]; R9, R11)*
30. **GIVEN** a release build, solo, auto-pause at its default, **WHEN** the
    operating system window loses focus, **THEN** the session is paused within
    one frame, the pause menu opens, and it stays paused after focus returns;
    **GIVEN** a development build at its default, **THEN** the clock keeps
    advancing; **GIVEN** a focus loss during Loading in a release build,
    **THEN** the session enters At Home paused with the pause menu open.
    *(Integration; [A]; R9; provisional on Menus & Settings for the
    setting)*
31. **GIVEN** a fake session with two player ids, **WHEN** a pause is
    requested, **THEN** it is refused and auto-pause does nothing. *(Logic;
    [A]; R9)*
32. **GIVEN** At Home with a fake Storms that has a storm due at the current
    clock, **WHEN** the tick runs, **THEN** `AdvanceTo` resolves it and one
    snapshot is requested; **GIVEN** In Run, **THEN** `AdvanceTo` is not called
    but the clock advances. **GIVEN** a load whose clock is past a due storm,
    **THEN** `AdvanceTo` is called on entering At Home before the first request
    is handled. *(Logic; [A], [B] for the run case; R7)*
33. **GIVEN** a note interval of 30 s and a last note at 600,000 ms, **WHEN**
    ticks advance the clock past 630,000 ms, at home and in a run, **THEN**
    exactly one note request is made on the first tick at or after 630,000 ms.
    *(Logic; [A], [B] for the run case; F4)*

**Saves and runs**

34. **GIVEN** a launch accepted, a fake `ISaveQueue` and an injected clock,
    **WHEN** the marker write succeeds, **THEN** the session stays in Launching
    Run until the fake scene loader reports complete, then enters In Run;
    **WHEN** the write has not returned at `waited_write_timeout_s` minus one
    frame, **THEN** no time-out is reported; at plus one frame, **THEN** the
    time-out is reported, no second attempt starts until the first returns,
    and the launch is cancelled; **WHEN** the write fails or the scene load
    fails, **THEN** the marker is removed from the model, a marker-free
    snapshot is written and waited for, and the session returns to At Home
    with a message naming the failure; **WHEN** that marker-free write also
    fails, **THEN** the session is At Home with a waited write pending and
    home actions are refused with Saving. *(Logic; [B]; R10, R12, ADR-0003)*
35. **GIVEN** In Run with a fake Storms holding due storms and a haul in the
    pack, **WHEN** Run Flow raises an extraction, **THEN** the calls happen in
    the order `AdvanceTo`, haul placement, `EndRun`, one snapshot, one
    `RequestAndWait`, home scene load, and the haul is never affected by a
    storm that fell during the run; **GIVEN** a death, **THEN** the same order
    with no haul placement. *(Logic; [B]; R12, plain C# with no Netcode;
    provisional on Run Flow for the outcome event)*
36. **GIVEN** an injected clock, `retry_base_s` 1 and `retry_cap_s` 8, and a
    run-end write that fails five times then succeeds, **WHEN** retried,
    **THEN** the delays are exactly 1, 2, 4, 8 and 8 s, home actions are refused
    with Saving throughout, "Saving…" shows continuously from 0.3 s, and the
    session reaches At Home after the sixth try. *(Logic; [B]; F3, F5, R10)*
37. **GIVEN** a marker write that fails, **WHEN** the marker-free write that
    follows also fails twice, **THEN** its delays are 1 and 2 s (k starts again
    at 1 for each new waited write). *(Logic; [B]; F3)*
38. **GIVEN** an injected clock and no request from the player, **WHEN** a
    waited write is pending for 0.12 s, **THEN** "Saving…" never shows; at
    exactly 0.3 s, **THEN** it shows; for 2 s, **THEN** it shows from 0.3 s
    until the write returns. *(Logic; [A]; F5)*
39. **GIVEN** an injected clock and a waited write pending, **WHEN** a home
    request is refused at 0.1 s, **THEN** "Saving…" shows at 0.1 s with that
    reason and stays on until the write returns. *(Logic; [A]; F5, UI
    Requirements 1)*
40. **GIVEN** a slow waited write, **THEN** a screenshot shows the "Saving…"
    indicator. *(UI; [A]; UI Requirements 2)*
41. **GIVEN** an injected clock, **WHEN** the same refusal arrives 10 times
    within 0.9 s, **THEN** it is shown once; **WHEN** it arrives again 1.1 s
    after the first, **THEN** it is shown again. *(Logic; [A]; UI
    Requirements 1)*
42. **GIVEN** a fake queue whose home saves fail, **WHEN** home actions are
    accepted, **THEN** each next frame with a change requests a new snapshot,
    the next request is accepted in the same frame (play never blocks), the
    "Unsaved changes" mark is on from the first failure until a save succeeds,
    the blocking notice appears exactly at the third failure in a row
    (`home_save_fail_block_count` 3), and after a dismiss it appears again at
    the sixth. *(Logic; [A]; R10)*
43. **GIVEN** those states, **THEN** screenshots show the "Unsaved changes"
    mark and the blocking notice, whose Quit says it loses the changes since
    the last good save. *(UI; [A]; UI Requirements 3)*
44. **GIVEN** a home save point held while a marker-free write is pending,
    **WHEN** the write returns, **THEN** the held save point is dropped and the
    queue never receives a snapshot holding the marker after the marker-free
    one. *(Logic; [B]; R10)*

**Quitting**

45. **GIVEN** the player quits from a run and confirms, **WHEN** the game is
    started again, **THEN** the run is resolved as abandoned (carried items
    lost). *(Integration; [B]; R13)*
46. **GIVEN** an orderly quit at home with a pending snapshot, **THEN** the
    snapshot and a final note are written and no new snapshot is taken;
    **GIVEN** an injected clock and a fake writer that never returns, **THEN**
    Stopping is still waiting at `quit_drain_timeout_s` minus one frame and
    reaches Off at plus one frame. *(Logic; [A]; R13)*
47. **GIVEN** At Home with a waited write pending in a retry delay, **WHEN** a
    quit is requested, **THEN** the confirmation is shown; on confirming, the
    delay is cancelled, one attempt starts at once, and Off is reached within
    `quit_drain_timeout_s`; if that attempt fails, the next start finds the
    marker and raises the abandoned-run notice. *(Logic; [B]; R13)*
48. **GIVEN** Launching Run with the marker write unconfirmed, **WHEN** a quit
    is confirmed, **THEN** the launch is cancelled, the queue receives the
    marker-free snapshot after the marker write, both are drained, and the
    fake disk ends with no marker. *(Logic; [B]; R13)*
49. **GIVEN** Ending Run with the first run-end attempt still in the writer
    (not failed), **WHEN** a quit is requested, **THEN** the confirmation is
    shown; on confirming, Stopping waits for the write up to
    `waited_write_timeout_s`; a write that lands at 2 s gives Off after the
    drain with no marker on the fake disk. *(Logic; [B]; R13)*
50. **GIVEN** Resolving with an attempt in the writer, **WHEN** a quit is
    requested, **THEN** Stopping is entered when the attempt returns, or at
    `waited_write_timeout_s` if it does not; a second start resolves the same
    marker to the same result. *(Logic; [B]; R13)*
51. **GIVEN** Loading with a fake load that never returns, **WHEN** a quit is
    requested, **THEN** Stopping is entered at the next frame without waiting
    for the load, and nothing is written. *(Logic; [A]; R13)*
52. **GIVEN** Starting, **WHEN** a quit is requested, **THEN** Stopping is
    entered once host start-up returns, and nothing is written. *(Logic; [A];
    R13)*
53. **GIVEN** the quit-during-run confirmation, **WHEN** the player cancels,
    **THEN** the session stays In Run and the tick resumes; **GIVEN** the
    waited-write confirmation, **WHEN** cancelled, **THEN** the session stays
    in its state. *(Logic; [A] for At Home, [B] for the run states; R13)*
54. **GIVEN** each of the **24 rows** of the transition table (including
    Starting → Refused, Resolving → Resolving retry, and Ending Run → Ending
    Run home-load retry), **WHEN** its trigger is raised in its From state,
    **THEN** the session reaches its To state, one test per row; **AND** a test
    that drives every event in every state finds no transition outside the
    table. *(Logic; [A] for rows without run states, [B] for the rest;
    States, R13)*
55. **GIVEN** a standalone player At Home with a pending snapshot, **WHEN**
    the window is closed, **THEN** the `wantsToQuit` handler returns false, the
    drain runs over the next frames, `NetworkManager.Shutdown()` runs before
    `Application.Quit()`, and the application exits; a second close during the
    drain is ignored. *(Integration; [A]; R13)*
56. **GIVEN** a standalone player, **WHEN** the window is closed during a run,
    **THEN** the quit-during-run confirmation appears, and on confirming the
    drain runs and the application exits. *(Integration; [B]; R13)*
57. **GIVEN** the quit-during-run confirmation and the waited-write
    confirmation, **THEN** a screenshot shows each. *(UI; [B]; UI
    Requirements 5)*
58. **GIVEN** Run Flow raises the end of a run twice, **WHEN** the second
    arrives during Ending Run or At Home, **THEN** it is ignored and logged,
    and only one sequence and one write happen. *(Logic; [B]; Edge Cases)*
59. **GIVEN** a run-end write that keeps failing after an extraction, **THEN** a
    screenshot shows the failure notice with Quit labelled "Quitting now loses
    this haul"; **GIVEN** the same after a death, **THEN** a screenshot shows
    plain "Quit". *(UI; [B]; UI Requirements 3, Player Fantasy)*

**Cross-system**

60. **GIVEN** a test catalog where `tuning.session_and_authority` sets
    `tick_rate_hz` to 20, **WHEN** a session is built, **THEN** F1 runs at 20 Hz,
    each Simulation system received only its own tuning set (Game Data &
    Tuning R10), and the home façade and world-query implementation were
    built. *(Logic; [A]; R11)*
61. **[spike, not milestone-gated]** **GIVEN** two instances wired together by
    a development-only test harness (a host and one client given a test
    player id), run in Multiplayer Play Mode or as two builds listening on
    127.0.0.1, using the real transport, **WHEN** the client places a piece,
    **THEN** the host validates it and both instances show the same piece at
    the same model revision. *(Integration; the ADR-0001 validation spike, not
    a co-op feature; provisional on the R8 replication amendment and the
    co-op ADR's guest-id rule)*

**Traceability**

| Rule, formula or state | Criteria |
|---|---|
| R1 One host, no offline path | 1, 2, 21, 61 |
| R2 Player identity | 8 |
| R3 Requests, sequence numbers, Malformed intents, frozen flag | 10, 11, 14, 15, 22, 27 |
| R4 Check order, per-frame drain, one result per request, revision streams, resync | 11, 12, 14, 15, 17, 18, 19, 20, 22, 24 |
| R5 Session check | 13, 14, 22, 23, 27 |
| R6 Fixed tick | 25, 27 |
| R7 Play-time clock, `AdvanceTo` | 26, 32 |
| R8 Publishing | 11 (change list and revision); replication in the ADR-0001 amendment (61 is its spike) |
| R9 Pause, physics and movement rules | 27, 28, 29, 30, 31 |
| R10 Save points, waited writes, failed saves | 11, 34, 36, 42, 44 |
| R11 Building the Simulation | 29, 60 |
| R12 Runs | 4, 34, 35 |
| R13 Quitting, one criterion per path | 45 and 56 (In Run), 46 and 55 (At Home), 47 (At Home, waited write pending), 48 (Launching Run), 49 (Ending Run), 50 (Resolving), 51 (Loading), 52 (Starting), 53 (cancel), 54 (transitions) |
| R14 Milestone A | 9, 10 |
| F1, F2, F3, F4, F5 | 25; 26; 36, 37; 3, 33; 36, 38, 39 |
| States and transitions | 54 (every row), plus 4, 6, 9, 34, 35 for their sequences |
| UI Requirements 1 to 6 | 1: 13 (which reasons), 39, 41; 2: 40; 3: 43, 59; 4: 5; 5: 57; 6: 7. Items 7 and 8 belong to Menus & Settings and First-Run Guidance |

Total: 61 criteria.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Which per-frame entry after network receive runs F1 (a frame update, or a PlayerLoop entry after Netcode's receive step; the network tick and FixedUpdate are struck, since neither can follow F1, R6), how seams and the home are replicated (including how a full-state resync is split into chunks, R4), and how the home-to-run scene change runs under a host. The physics and movement rules are fixed (R9). Seam replication and the scene change stay deferred by ADR-0001 to the first gameplay story; record as an ADR-0001 amendment. `tick_rate_hz` stays provisional until then | technical-director / network-programmer | First gameplay story (Milestone A for the tick and home replication; Milestone B for seams and the scene change) |
| 2 | The systems index lists no upstream system for row 2; this document depends on Game Data & Tuning (the catalog must be Ready first). Add it to row 2's "Depends On". Checked 2026-11-28: row 2 still lists none, so this stays open | producer, at the next `/consistency-check` or `/map-systems` update | Before stories |
| 3 | Storms' open question "does solo play pause when the window loses focus?": this document provides auto-pause (default on) as an explicit pause. The Storms design doc should confirm or change the default | Storms design doc | When Storms is designed |
| 4 | Whether a co-op host may pause, and what guests see; join and leave rules; whose home it is | Co-op ADR | Before Tier 2a |
| 5 | A deliberate "Abandon run" option (end a run as a death without quitting the game) belongs to Run Flow; if added, it goes through Run Flow's end-of-run event, not a session shortcut | Run Flow design doc | Milestone B |
| 6 | **Local fallback for a failing run-end write.** Writing the extraction result beside the marker, so the next start can honour a finished extraction after the player quits during retries, would remove the one way a successful extraction can be lost. It would also cover a quit confirmed while any waited write is unconfirmed (R13: Launching Run, Ending Run, At Home with a waited write pending). Needs an ADR-0003 amendment | technical-director | Vertical Slice |
| 7 | **Request rate and held actions.** Held actions such as drilling should be begin and end intents, not one request per tick, and a per-player cap on requests per frame (with rate-limited logging of Unknown player and Internal error) is needed before co-op. A range-check tolerance for remote players' delayed positions and a speed plausibility check also belong here | network-programmer, with the Mining design doc | Before Tier 2a; begin and end intents with Mining |
| 8 | **Auto-unpause after a focus return** (a countdown, as a setting) | Menus & Settings | After the MVP |

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

Added in revision 1 (2026-11-28), from the creative-director's rulings in the
first `/design-review`; also logged in the decision log:

8. Requests are **drained every frame**, whether or not a tick runs, so
   refusals while paused or saving reach the player at once; network handlers
   only enqueue (R4).
9. Live tuning changes and joins share the **one request queue** (R3, R5).
10. Per-player **sequence numbers** and a Duplicate refusal (R3); two named
    revision streams, model and catalog (R4).
11. The **transition table is closed**: quit from every state with a session,
    quit to the desktop through the same path, and Launching Run and Ending
    Run hold until the scene load completes (R12, R13, States).
12. **Pause stops everything that rules read**; Presentation may use a time
    scale of 0 (R9).
13. **"Unsaved changes"** stays on screen while home saves fail, and a
    blocking notice follows after 3 failures in a row (R10).
14. When the run-end write fails, Quit is labelled **"Quitting now loses this
    haul"**; no ADR-0003 amendment now (Open Questions 6). Crash = death stays
    (ADR-0002), worded "an unfinished run is an unbanked run" and disclosed in
    a first-run tip (Player Fantasy).
15. `max_ticks_per_frame` is **derived**, not tuned (F1); every knob has an
    `apply` mode; `tick_rate_hz` is `restart` and uses a new unit `hz`.
16. Only reasons a player can act on are shown; the rest are logged (UI
    Requirements). Pause buffering is accepted as an accessibility trade-off.

Added in revision 2 (2026-11-28), from the creative-director's rulings in the
second `/design-review`; also logged in the decision log:

17. **Quit rule**: Stopping drains everything that can still decide the next
    start, and the player confirms only when an outcome is unconfirmed; one
    path per state (R13, States).
18. **One frozen flag**, set in exactly R5's Frozen cells, including At Home
    with a waited write pending; Player Controller reads only it (R3, R5).
19. **Check order** Unknown player → Duplicate → Malformed → Saving → Paused
    → the R5 cell; refusals advance the last-handled number, kept per
    connection; a Duplicate gets no second result (R3, R4).
20. **Tuning order**: requests in arrival order; live tuning changes queued
    and applied at the first tick in At Home or In Run; refused with Not now
    in a release build or with more than one player (R3, R5).
21. **Auto-pause split**: on in release builds, off in the editor and
    development builds; it opens the pause menu; a focus loss before At Home
    is latched (R9).
22. **"Saving…" at once** when the player is refused during a waited write;
    the 0.3 s delay only applies while the player has not acted (F5, UI 1).
23. **Physics and tick source are rules**: queries and triggers only, physics
    stepped inside the tick, CharacterController players, NavMesh-query
    creatures, root motion off; the tick runs from a per-frame entry after
    network receive (R6, R9, Open Questions 1).
24. **`waited_write_timeout_s` minimum 5 s** (was 3), to keep Save & Load's
    in-writer retries inside one attempt (Tuning Knobs).
25. **Abandoned-run notice owner** is Save & Load (detection and text); this
    document only says when it shows. The Refused screen's one action is Quit
    (UI Requirements 4 and 6).
