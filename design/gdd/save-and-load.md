# Save & Load

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 3 (Bright world, real stakes), Pillar 5 (Home is the scoreboard)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-28 — run in-session as a checklist (no agent spawned). Pillar 3 is served by rules: leaving a run is a death (R4, from ADR-0002), backups are never offered (R10), New game carries nothing over (R8), and a backup restored by hand still holds the marker (Edge Cases). Pillar 5 by R2 and R3 (every home change saved, materials and piece together) and R5 (unknown content removed with a copy kept, never lost for good). Pillar 2 by the saved storm schedule (R2 `clock`). No anti-pillar crossed; Pillars 1 and 4 do not apply. Looked hardest for a softened loss: none found.

## Summary

Save & Load keeps one save per installation: the home, stashes, what the
player carries at home, the storm clock, the valley's gather spots, statistics
and the run marker, in one versioned JSON document written in the background
after every home change (ADR-0002, ADR-0003). This doc decides what the
document holds and who owns each part, what the player is told in every load
outcome, how content the game no longer knows is removed with a copy kept, and
how New game archives the old save. The home is never lost to a crash or a
patch, and a run's loss can never be undone by quitting.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Session & Authority, Game Data & Tuning`

## Overview

Save & Load keeps the player's game between sessions: the home they built,
what is in each stash, what they carry at home, the storm clock and schedule,
the valley's gather spots, their statistics, and the run marker that makes
quitting a run count as a death. It is one save document per installation,
written by a single background writer after every change at home and at the
run's start and end, kept safe by an atomic replace, three backups and a
pre-migration copy, and upgraded by numbered migrations when the game changes.

Most of how it works is already decided by two accepted ADRs: ADR-0002 (one
human-readable, versioned file, written only by the host at safe points,
leaving a run is a death) and ADR-0003 (the home and storm clock in the same
document, saved after every home change by a background writer, the play-time
note). This doc does not repeat their mechanics; it decides what those ADRs
left to the design: what the document holds and who owns each part, what the
player is told in every load outcome, what happens to content the game no
longer knows, how a player starts over, and the values the store runs on.
Session & Authority already decides *when* a snapshot is taken, how waited
writes and failed home saves are shown, and the "Saving…" indicator (its R10,
F3, F5); this doc does not repeat those either.

The player mostly never sees it. It exists so that the home is never lost to a
crash or an update (Pillar 5: the home is the scoreboard, and a scoreboard
that can vanish means nothing) and so that a loss on a run cannot be undone by
quitting or reloading (Pillar 3: the stakes are real).

## Player Fantasy

**Framing:** Indirect. The player experiences what the save guarantees, not
the save itself; the few moments it speaks are when something went wrong.

**Creative-direction lens applied** (`lens-creative-director.md`, in-session,
no agent spawned). Three candidate framings:

1. **"It's all still there."** Anchor moment: starting the game a week later
   and the title screen shows your own valley, your home standing, the stash
   lit through the window, exactly as you left it. Pillar 5: *"Wealth is
   something you see and walk through, not a number."* Asks of the design:
   nothing at home is ever lost to a crash or a patch; loading is fast and
   silent when nothing went wrong.
2. **"What's lost is lost."** Anchor moment: you quit mid-run with a full pack
   to dodge a death, and the next start tells you plainly the run was not
   finished and what you carried is gone. Pillar 3: *"Debating softening a loss
   to match the art or keeping the sting, this pillar picks the sting."* Asks of
   the design: no reload, no backup as an undo, no way to tell a crash from a
   quit.
3. **"Pick up where you left off, anywhere."** Anchor moment: resuming a run
   after closing the game. Rejected: it contradicts ADR-0002 ("a run cannot be
   resumed") and Pillar 3.

**Chosen (autonomous, recommended):** framings 1 and 2 together, as two sides
of one promise. Framing 3 is a pillar clash, not a style choice.

> *The game keeps its promises in both directions. What you built and stored
> at home is never lost to a crash, a power cut or an update: start the game
> and it is all still there, without a word. And what you risked on a run
> stays risked: quitting does not save your pack. The save is trustworthy
> because it is honest both ways.*

What it serves:

- **Pillar 5.** Every home action is saved within a moment of happening, with
  the materials and the piece in the same write (ADR-0003, Decision 12), so the
  home survives anything short of losing the disk.
- **Pillar 3.** Leaving a run is a death (ADR-0002, Decision 4); backups are
  never restore points (ADR-0002, Decision 8). This doc adds: starting over
  never brings back a lost run's items either (R8).
- **Pillar 2, indirectly.** The storm schedule is saved, so a forecast storm
  cannot be rerolled by reloading (ADR-0003, Decision 5).

## Detailed Design

### Core Rules

**Specialist lenses applied before drafting** (in-session, no agents spawned).
Routing row: **Foundation/Infrastructure** (`Persistence` category):
`systems-designer` (primary), `gameplay-programmer` (feasibility),
`engine-programmer` (engine integration).

- **systems-designer.** The ADRs settle the write path; the open design is the
  edges: content the catalog no longer knows, starting over, what each load
  result tells the player, and who owns each part of the document so two
  systems never write the same thing. *Warning:* "drop what we don't know"
  silently loses a player's items; "refuse to load" bricks their save. Both
  are wrong alone.
- **gameplay-programmer.** Each owning system should map its own part of the
  save model to and from data, and Save & Load should only frame and version
  it; otherwise this system becomes a dumping ground that knows every other
  system. Piece ids must come from a saved counter, or a reload reuses them.
- **engine-programmer.** The serializer and the per-user save folder are NOT
  SOURCEABLE from `docs/engine-reference/unity/` (ADR-0002, Engine
  Compatibility); this doc must not assume a library or a path. Keep the file
  size small enough that a 2,000-piece home's write is well within the
  background writer's budget.

**Tensions found and how they were settled** (autonomous mode: the recommended
option, logged; the designer reviews at the first playable):

| Tension | Options | Chosen |
|---|---|---|
| A loaded save holds an id the catalog does not know, or one it retired, with no migration for it | A: refuse to load · B: drop those entries silently · C: drop them, keep an untouched copy of the file outside the rotation, and tell the player what was removed | **C.** The save still loads; nothing is lost for good, because the copy can be repaired by hand or by a later migration |
| How a player starts over | A: no way in the MVP · B: a "New game" that deletes the save · C: a "New game" that archives the current save, never deleted by the game, and starts a fresh profile | **C.** Deleting a save needs the player's explicit confirmation; archiving needs none, and an archived save can be restored by hand |
| Who maps each part of the save | A: Save & Load knows every system's data · B: each owning system maps its own part; Save & Load frames, versions and checks ids | **B.** Each system stays testable alone; Save & Load stays small |

---

**R1. One document, one profile.** There is one save per installation (ADR-0002,
Decision 8): a single JSON document with `formatVersion` at the top
(ADR-0002, Decision 3), written and read only on the host by the background
writer (ADR-0003, Decision 10). The play-time note is a second, tiny file
(ADR-0003, Decision 8). Settings and key bindings are not in the save (ADR-0002,
out of scope; Game Data & Tuning: "settings are not game data"); Menus &
Settings and Input store them.

**R2. What the document holds, and who owns each part.** Format version 1
(ADR-0003, Decision 14) has these top-level parts. *Owner* is the system whose
design doc decides the part's fields and meaning and which maps it to and from
the save model; Save & Load owns the document's framing, the part names,
`formatVersion`, migrations and the id checks (R5).

| Part | Contents | Owner |
|---|---|---|
| `formatVersion` | Integer, 1 in the first release | Save & Load |
| `writtenBy` | The build's version string and catalog fingerprint (Game Data & Tuning, R13) when written; for diagnostics only, never read by rules | Save & Load |
| `profileId` | The player's identity (Session & Authority, R2) | Session & Authority |
| `clock` | Play-time clock in milliseconds; next storm's time and strength; the storm generator's state (ADR-0003, Decisions 4 and 5) | Storms |
| `home` | Structures (anchor, grid), pieces (stable integer id, type id, cell or free position, rotation, condition), and the **next piece id** counter so ids are never reused (ADR-0003, Decision 2) | Building |
| `containers` | Keyed by piece id; each a list of slots of id and count in slot order (Ore & Item Economy, Interactions; ADR-0003, Decision 3) | Stash (container contents format: Ore & Item Economy) |
| `carried` | The pack's slots and the carried tools and gear, at home only (ADR-0003, Decision 3) | Pack, Tools & Gear |
| `valley` | Non-full gather spots: spot id, remaining, regrow time (Home Valley, R8) | Home Valley |
| `recipes` | Unlocked recipe ids (ADR-0002, Decision 1) | Crafting |
| `stats` | Best haul, total haul, runs started, extractions, deaths, abandoned runs, storms weathered (64-bit counters; Ore & Item Economy: haul statistics are 64-bit) | Run Flow (storms weathered: Storms) |
| `runMarker` | Absent at home; during a run, everything carried at launch (ADR-0002, Decision 4; ADR-0003, Decision 3) | Run Flow |

A part whose owner has no data yet is written empty, never left out, so a
reader can tell "nothing" from "missing". Every item, tool and piece is named
by its stable catalog id (ADR-0002, Decision 3). No part may hold the same
item as another (ADR-0003, Decision 3: "every item is saved in exactly one
place").

**R3. Save points and the write path.** Unchanged from ADR-0003, Decisions 9
to 13, and driven by Session & Authority (its R10): every successful home
action and storm resolution at home is a snapshot handed to the queue without
waiting; run start, run end, abandoned-run resolution and migration are waited
for. Session & Authority shows "Saving…", "Unsaved changes" and the blocking
notice. This system's part is the store behind the queue: the temporary file,
flush, single atomic replace, three backups shifted down first, the lock file,
retrying a replace that another program blocks (R9), and never leaving the main
file absent (ADR-0002, Decision 6).

**R4. Loading, and what the player is told.** At start-up the Authority layer
calls `LoadAndWait()` (ADR-0003, Decision 15). The store returns one of ADR-0002's
results, each with one player-facing outcome (wording is placeholder for
`/ux-design`; the meaning is fixed):

| Result | What happens | What the player sees |
|---|---|---|
| **New** (no save, no backup) | A new profile; the first save is written at the first save point | Nothing: the game starts in the valley |
| **Loaded** | Play continues | Nothing |
| **Loaded, run abandoned** (a run marker was found) | Session & Authority resolves it (Resolving): storms that passed are applied, everything carried at launch is lost, the marker is cleared, the result written and waited for | A notice before play: "Your last run didn't finish. Everything you carried was lost: [list]." One button: OK |
| **Loaded from backup** (main file missing or unreadable) | The newest readable backup is loaded and becomes the main file at the next save point | A notice: "Your save couldn't be read, so the most recent backup was loaded. The last few things you did may be missing." OK |
| **Loaded with removed content** (R5) | Unknown or retired entries removed; an untouched copy kept | A notice naming what was removed and where the copy is. OK |
| **Migrated** | Older format upgraded; the pre-migration copy kept (ADR-0002, Decision 7) | Nothing, unless another result above also applies |
| **Refused: newer version** | Session enters Refused; nothing written | "This save was made by a newer version of Star Haul. Update the game to play it." Buttons: Quit, Open save folder |
| **Refused: locked** | Another running copy holds the store | "Star Haul is already running." Quit |
| **Refused: unreadable** (main and every backup unreadable, or a migration failed) | Nothing written; the files are left as they are | "Your save couldn't be read." Buttons: Quit, Open save folder, Start a new game (R8: the unreadable files are archived first) |

When more than one notice applies (an abandoned run found in a backup), they
are shown one after another in the table's order, before the player can move.

**R5. Content the game no longer knows.** After migrations, every id in the
document is checked against the catalog (Game Data & Tuning, R14: *known*,
*retired* or *unknown*):

- **Known**: kept.
- **Retired or unknown**: the entry is removed: an item stack from its
  container slot or `carried`, a recipe from `recipes`, a gather spot entry.
  A **piece** with a retired or unknown type is removed with its container;
  the container's known items are moved into the first other container with
  room, else into `carried`'s pack, else lost (listed in the notice). Before
  anything is removed, the file as loaded (after migration) is copied to
  `save.recovered-<n>.json`, which sits outside the backup rotation and is
  never deleted by the game. The notice lists each removed id and count.
- This should be rare: Game Data & Tuning's validation fails a build that drops
  a previously released id without retiring it, and a retired id should always
  have a migration that maps or removes it on purpose. R5 is the safety net for
  when that discipline slips.

**R6. Migrations.** As ADR-0002, Decision 7: one pure step per format change
(`N → N+1`) on the neutral document type, a stored sample save for every
released format version, the pre-migration copy kept. This doc adds:

- **A migration is required** when a release removes or renames a saved id,
  changes a part's shape, or adds a part whose absence older code cannot treat
  as empty. Adding a new id (a new piece, ore or recipe) needs no migration.
- **A migration that throws** is a Refused: unreadable result. The original
  file is untouched; nothing is written.
- **Format version 1 is frozen** at the first save story. Before then the
  Building doc must settle free-standing pieces (ADR-0003, Decision 14); Home
  Valley's spot entries are already in (Home Valley, R8).

**R7. The play-time note.** As ADR-0003, Decision 8: written every
`note_interval_s` of play (Session & Authority asks, at home and on a run) and
once on an orderly quit; holds only a note format version, the profile id and
the clock. On load, the later clock wins (F1).

**R8. Starting over.** Menus & Settings offers **New game** at the title screen
(and the unreadable-save screen offers **Start a new game**). After a
confirmation ("Your current game will be set aside and a new one started. You
can't switch back from inside the game."), the store renames the main save, its
backups and its note into an archive folder named for the date and time,
never deleted by the game, and starts a New profile. Nothing from the archived
save carries over: not items, not statistics, not a lost run's contents. There
is no in-game way to switch back (one profile, ADR-0002, Decision 8); a player
can restore an archive by hand. During a run, New game is not offered (the
pause menu has Quit instead).

**R9. Values the store runs on.** The store is tuned by `tuning.save_and_load`
(Tuning Knobs): the note interval, how many times and how long apart a blocked
replace is retried before the attempt is reported as failed to Session &
Authority (which then applies its own retry delays, its F3), and the size
budget that a validation test checks with a generated large home (F3). The
backup count is fixed at 3 by ADR-0002 and is not tuning.

**R10. What the save never holds.** Run state other than the clock (seams,
creatures, oxygen, the pack during a run: ADR-0002, Decision 1; ADR-0003,
Decision 8), the player's position (Home Valley, R8; Player Controller, R9),
tuning values or revisions (Game Data & Tuning), settings and key bindings
(R1), and anything that lets a backup or archive be used as an undo inside the
game.

### States and Transitions

The store's own states (the session's states are Session & Authority's; this
table is what the writer is doing):

| State | Meaning |
|---|---|
| **Closed** | No store open (no session, or a client-only process, which never opens it) |
| **Loading** | `LoadAndWait` running: lock, read, fall back to backups, migrate, check ids, read the note |
| **Idle** | Open and locked, nothing to write |
| **Writing** | One snapshot or note being written; at most one main snapshot and one note waiting (ADR-0003, Decision 10) |
| **Failed write** | The last write failed; the next request tries again with the whole model; reported to Session & Authority |
| **Draining** | Orderly quit: writing what waits and a final note, then Closed |
| **Refused** | Load refused (newer version, locked, unreadable); nothing will be written |

| From | To | Trigger |
|---|---|---|
| Closed | Loading | The host's Authority layer calls `LoadAndWait` |
| Loading | Idle | A load result other than Refused |
| Loading | Refused | Newer version, locked, or unreadable |
| Idle | Writing | A snapshot or note arrives |
| Writing | Idle | The write succeeded and nothing waits |
| Writing | Writing | The write finished and another snapshot or note waits |
| Writing | Failed write | The write failed after R9's replace retries |
| Failed write | Writing | The next snapshot or note arrives (a retry with the whole model) |
| Idle, Writing, Failed write | Draining | Orderly quit |
| Draining | Closed | Queue empty and the final note written, or the bounded wait ran out |
| Refused | Closed | The player quits, or starts a new game (R8), which archives the files and goes to Loading for a New profile |

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Session & Authority (2) | In | `LoadAndWait`, `Request`, `RequestAndWait`, `NotePlayTime`, `Drain`; it is the store's only caller and owns waiting, "Saving…" and failure notices | ADR-0003 fixes it; Session & Authority calls it |
| Session & Authority (2) | Out | Load results (R4), write results, the removed-content and archive details | Save & Load |
| Game Data & Tuning (1) | In | Id lookup (known, retired, unknown), `tuning.save_and_load`, the catalog fingerprint for `writtenBy` | Game Data & Tuning |
| Building (11) | Both | The `home` part, including the next piece id | Building (contents) |
| Stash (12), Ore & Item Economy (4) | Both | The `containers` part; slot format id and count | Stash; Economy owns the slot format |
| Pack (8), Tools & Gear (9) | Both | The `carried` part at home | Their owners |
| Home Valley (5) | Both | The `valley` part | Home Valley |
| Crafting (13) | Both | The `recipes` part | Crafting |
| Storms (14) | Both | The `clock` part | Storms |
| Run Flow (22) | Both | `stats` and `runMarker`; the run hooks of ADR-0002 | Run Flow |
| Menus & Settings (27) | In | New game (R8); Open save folder; the notices' screens | Menus & Settings (UI) |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable put at its minimum, its maximum and 0. No feedback loops: the
store reacts to the game and never changes it.

### F1. Clock on load

The `loaded_clock` formula is defined as:

`clock = note_ok ∧ note.clock > save.clock ? note.clock : save.clock`, where
`note_ok = note readable ∧ note.version known ∧ note.profileId = save.profileId`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| save.clock | double, `ms` | 0 and up | calculated (the loaded save's `clock` part) | Clock at the last main save |
| note.clock | double, `ms` | 0 and up | calculated (the play-time note) | Clock at the last note |
| note_ok | bool | — | calculated | Whether the note may be used |
| clock | double, `ms` | 0 and up | calculated | The clock the session starts with |

**Output Range:** never earlier than the main save's clock, so play time never
runs backwards (ADR-0003, Decision 8).
**Boundaries:** no note, an unreadable note, a note from another profile or of
an unknown version: `save.clock`. A note equal to the save: `save.clock`. A
new profile: 0.
**Example:** save written at 1,800,000 ms (30 min), note at 2,712,000 ms after
15 more minutes on a run that crashed: clock = **2,712,000 ms**, and storms due
before then resolve on load.

### F2. Most a crash can lose

The `crash_loss_bound` formula is defined as:

`lost_play_time ≤ note_interval_s`, and `lost_home_actions ≤ actions in the
snapshot being written + actions in the snapshot waiting`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| note_interval_s | float, `s` | 5 to 120 | data file (`tuning.save_and_load`) | Play time between notes |
| lost_play_time | float, `s` | 0 to `note_interval_s` | calculated | Storm-clock time a crash can lose |
| lost_home_actions | int, `count` | 0 and up (in practice 0 to 2 frames' worth) | calculated | Home actions a crash can undo, always as whole actions |

**Output Range:** at most 30 s of clock time with MVP values, in the player's
favour (a storm comes slightly later, never earlier). At home a crash undoes at
most the last frame or two of actions, each whole, never half (ADR-0003,
Decision 12).
**Boundaries:** `note_interval_s` = 0 would write a note every tick, wasting
the writer; the minimum 5 s (Session & Authority assumes it: "at most one note
per 150 ticks"). At 120 s a crash could hand back two minutes of storm time.
**Example:** a crash 25 s after the last note on a run: 25 s of play time is
lost; the run is resolved as abandoned on the next start.

### F3. Save size

The `save_size_bytes` formula is defined as:

`size = s0 + P × b_piece + K × b_slot + V × b_spot`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| s0 | int, bytes | about 2,000 | constant (measured at the first save story) | Fixed parts: version, profile, clock, stats, recipes, carried |
| P | int, `count` | 0 to 2,000 (ADR-0003's test size) and beyond | calculated | Pieces in the home |
| b_piece | int, bytes | about 110 | constant (estimate: id, type id, three-number cell, rotation, condition, indented) | Bytes per piece |
| K | int, `count` | 0 and up | calculated | Filled container slots across all containers |
| b_slot | int, bytes | about 45 | constant (estimate) | Bytes per filled slot |
| V | int, `count` | 0 to 48 | calculated | Non-full gather spots (Home Valley) |
| b_spot | int, bytes | about 70 | constant (estimate) | Bytes per spot entry |
| size_budget_kb | int, KB | 256 to 4,096 | data file | Budget the validation test checks |

**Output Range:** about 2 KB for a new profile; about 262 KB for the test home.
Must stay under `size_budget_kb` (1,024 KB) for the generated 2,000-piece test
home with full stashes; a test fails if it does not.
**Boundaries:** P = 0 gives about 2 KB. The formula has no upper bound by
itself; a home far beyond 2,000 pieces grows linearly and the budget test is
the guard. The constants are estimates until the serializer is chosen.
**Example:** 2,000 pieces, 40 stashes with 24 filled slots each (960 slots),
48 non-full spots: 2,000 + 220,000 + 43,200 + 3,360 = **268,560 bytes
(about 262 KB)**, a quarter of the budget.

### F4. Blocked-replace retries

The `replace_retry_time` formula is defined as:

`t_retry = replace_retry_count × replace_retry_delay_s`, with the constraint
`t_retry < waited_write_timeout_s / 2`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| replace_retry_count | int, `count` | 0 to 10 | data file | Extra tries when another program blocks the replace |
| replace_retry_delay_s | float, `s` | 0.05 to 1.0 | data file | Wait between those tries |
| waited_write_timeout_s | float, `s` | 3 to 30 | data file (Session & Authority) | Its time limit for a waited write |
| t_retry | float, `s` | 0 to 10 | calculated | Longest a single write spends retrying a blocked replace |

**Output Range:** 0.6 s with MVP values (3 × 0.2 s), well inside Session &
Authority's 10 s.
**Boundaries:** count 0: a blocked replace fails at once and Session &
Authority's slower retries (its F3) take over. At 10 × 1.0 = 10 s it would use
up the whole waited-write limit with MVP values, so the constraint keeps it
under half; validation refuses a pair that breaks it.
**Example:** an antivirus scan holds the file for 0.3 s: the first retry at
0.2 s fails, the second at 0.4 s succeeds; the write reports success.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included. Write-path cases already decided by ADR-0002 and ADR-0003
(a crash mid-write, a full queue, a failed marker write, quit) are not
repeated; they are tested through those ADRs' verification items.

**Loading**

- **If the main file is missing but backups exist**: the newest readable
  backup loads (Loaded from backup, R4). It becomes the main file at the next
  save point by the normal replace.
- **If the main file is newer-version and a backup is older and readable**:
  Refused: newer version. Backups are never used to get around a newer save
  (ADR-0002: "never overwritten or migrated").
- **If a temporary file is left over from a crash**: deleted, never loaded
  (ADR-0002, Decision 6).
- **If an abandoned run's marker is found in a backup** (the main file was
  unreadable): both notices show, backup first (R4); the run is resolved as
  abandoned. Restoring a backup never undoes a run's loss.
- **If the note is newer than the save but from another profile** (an archive
  restored by hand, a new game started): ignored (F1).
- **If the save names a piece whose container entry is missing**, or a
  container whose piece is missing (a hand-edited or corrupted save): a piece
  that should hold a container gets an empty one; a container with no piece is
  removed and its known items go where R5 sends them; both are listed in the
  removed-content notice and the file is copied first.
- **If two pieces in the save share an id, or the next piece id is not above
  every saved id**: the next piece id is raised above the largest saved id; a
  duplicate id is a corrupt save, handled as Refused: unreadable unless a
  backup is readable and consistent.
- **If an item's count in a slot is above what the slot holds** (a patch lowered
  `stack_max`): kept as is; Ore & Item Economy's Edge Cases cover overflow
  slots.
- **If a part is missing from the document** (a hand edit): treated as empty,
  logged, and written back complete at the next save point.

**Content changes**

- **If a retired id has a migration that maps it to a new id**: the migration
  runs first and R5 never sees the old id.
- **If a release adds a new piece, ore or recipe**: no migration (R6).
- **If the removed content would leave a piece's materials unaccounted for**:
  nothing is refunded. R5 removes; it never invents items.
- **If R5 removes the player's only drill and hammer**: the player rebuilds from
  valley materials (Home Valley, rebuild guarantee). The notice says what was
  removed.

**Starting over**

- **If the player chooses New game and the archive rename fails** (a program
  holds a file): nothing is changed, the old game stays, and the player is told
  the new game could not be started. A half-archived state never exists: the
  archive folder is created, files are copied, and only then are the originals
  removed.
- **If the player chooses New game twice in one minute**: each archive folder's
  name includes seconds, and a clash adds a number; none is overwritten.
- **If the player restores an archive by hand while the game is closed**: it is
  just a save; it loads normally.

**Files and disk**

- **If the disk is full**: the write fails; Session & Authority shows "Unsaved
  changes" and, after its count, the blocking notice (its R10). The main file
  is never touched by a failed write.
- **If the save folder is in a cloud-synced or antivirus-scanned place that
  holds the file**: R9's quick retries, then Session & Authority's slower ones.
- **If a second copy of the game starts while one is running**: the lock file
  refuses it (Refused: locked).
- **If a client-only process (co-op guest, later) starts**: it never opens the
  store (ADR-0002, Decision 6).

**Degenerate strategies checked**

- **Killing the game to escape a death**: the marker resolves as abandoned;
  the carried items are lost (ADR-0002).
- **Restoring a backup by hand to recover a lost run**: possible outside the
  game and accepted (it is the player's disk); the game never offers it, and a
  backup taken during the run still holds the marker, so restoring it resolves
  the run as abandoned anyway.
- **Starting a new game to get a fresh storm schedule**: also resets the home
  and stash; no gain.
- **Reloading to reroll a storm**: impossible; the schedule and generator state
  are saved (ADR-0003, Decision 5).

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Session & Authority (2) | Hard | Its only caller; owns snapshot timing, waited writes, "Saving…", failure notices (its R10) | Designed (under revision by the design-review session) |
| Game Data & Tuning (1) | Hard | Id lookup and retired list (its R14); `tuning.save_and_load`; catalog fingerprint (R13) | Designed (under revision) |
| ADR-0002, ADR-0003 | Hard | The format, write path, run marker, home and clock, note | Accepted |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Building (11) | Hard | The `home` part saved and loaded; the next piece id kept | Not written: provisional |
| Stash (12) | Hard | The `containers` part | Not written: provisional |
| Storms (14) | Hard | The `clock` part; F1 on load | Not written: provisional |
| Run Flow (22) | Hard | `stats` and `runMarker`; run hooks; abandoned-run notice | Not written: provisional |
| Home Valley (5) | Hard | The `valley` part | Designed: its R8 matches this doc's R2 |
| Pack (8), Tools & Gear (9) | Hard | The `carried` part at home | Not written: provisional |
| Crafting (13) | Soft | The `recipes` part | Not written: provisional |
| Menus & Settings (27) | Soft | New game, Open save folder, the load notices | Not written: provisional |

Bidirectional check: Session & Authority lists "Save & Load (7) | Hard | Its
only caller", matching. Game Data & Tuning lists "Save & Load (7) | Hard | Id
lookup and retired list; `tuning.save_and_load`", matching. Ore & Item Economy
names Save & Load as owner of the container format; this doc says the slot
format (id and count in slot order) is Economy's and the framing is Save &
Load's, which agrees with Economy's Interactions row. Home Valley names Save &
Load for its spot entries, matching. The systems index lists Building, Stash,
Storms and Run Flow as depending on Save & Load, matching; it does not list
Home Valley, Pack, Tools & Gear or Crafting (Open Questions, 3).

## Tuning Knobs

### This system's tuning set: `tuning.save_and_load`

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `note_interval_s` | float | 30 | 5 | 120 | 1 | s | live | Many tiny writes (harmless but busy) | A crash gives back more storm time | ADR-0003's "about 30 seconds" |
| `replace_retry_count` | int | 3 | 0 | 10 | 1 | count | live | A momentary lock fails the write | Long stalls before reporting | Covers antivirus and cloud-sync blips |
| `replace_retry_delay_s` | float | 0.2 | 0.05 | 1.0 | 0.05 | s | live | Retries finish before the lock clears | Long stalls | With count 3, 0.6 s in all |
| `size_budget_kb` | int | 1,024 | 256 | 4,096 | 64 | KB | restart (validation test) | Fails a reasonable large home | Hides a bloated format | Four times F3's estimate for the 2,000-piece test home |

**Constraint:** `replace_retry_count × replace_retry_delay_s <
waited_write_timeout_s / 2` (F4), across this set and Session & Authority's.

**Not knobs:** the backup count (3) and the pre-migration rule are fixed by
ADR-0002; the snapshot and waiting behaviour, the "Saving…" delay, retry delays
and the failed-save block count are Session & Authority's
(`saving_indicator_delay_s`, `retry_base_s`, `retry_cap_s`,
`home_save_fail_block_count`, `waited_write_timeout_s`).

## Visual/Audio Requirements

Optional for a `Persistence` system; kept short. The save has no world
presence. Its notices (R4, R8) use the home screens' slate panel over the live
valley (art bible, Section 7, Home screens), plain text, no colour coding: a
loss notice is not magenta (magenta is for living threat only, art bible,
principle 2), and nothing is shown by colour alone. A short, neutral UI sound
when a notice opens; no alarm sound, since nothing is in danger at that moment.
"Saving…" and "Unsaved changes" are Session & Authority's (its F5, R10).

## Game Feel

- **Silent when nothing went wrong.** Loaded, New and Migrated show nothing;
  the title screen shows the player's own valley (Home Valley, R9) as soon as
  the load completes.
- **Fast.** Loading the 2,000-piece test home, migration included, completes
  in under 1 s on the target PC (measured at the first save story, with the
  real serializer). Home saves never hitch a frame (ADR-0003's 1 ms snapshot
  budget is Session & Authority's and the snapshot's, not the writer's).
- **Plain-spoken when something did.** Every notice says what happened, what
  was lost if anything, and what the player can do, in one or two sentences,
  with no error codes on screen (codes go to the log).

## UI Requirements

- **Load notices** (R4): abandoned run (with the list of what was carried),
  loaded from backup, removed content (with the list and the copy's location).
  Each a modal panel with one OK button, shown before the player can move, in
  R4's order.
- **Refused screens** (R4): newer version (Quit, Open save folder), locked
  (Quit), unreadable (Quit, Open save folder, Start a new game).
- **New game** (R8) on the title screen, with its confirmation; not offered
  during a run.
- **Open save folder** opens the folder in the system's file browser; the
  folder path is shown as text too, for players who cannot open it.

> 📌 **UX Flag — Save & Load**: This system has UI requirements. In Phase 4
> (Pre-Production), run `/ux-design` to create a UX spec for each screen or
> HUD element this system contributes to **before** writing epics: the load
> notices and refused screens, and New game's confirmation, with Menus &
> Settings. Stories that reference UI should cite `design/ux/[screen].md`, not
> the GDD directly.

## Cross-References

| This doc | References | Mechanic, value or rule | Where |
|---|---|---|---|
| R1 to R10 | ADR-0002 | One versioned JSON file, host only, safe points, atomic replace, three backups, pre-migration copy, leaving a run is a death, one profile, backups never restore points | [adr-0002-persistence.md](../../docs/architecture/adr-0002-persistence.md) |
| R2, R3, R7, F1, F2 | ADR-0003 | Home and clock in format 1, containers keyed by piece id, `carried`, background writer, waited writes, play-time note, save points, loading through the writer | [adr-0003-home-and-storm-persistence.md](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| R3, R4, F4, Tuning Knobs | Session & Authority | Only caller (R10), waited writes and their retries (F3), "Saving…" (F5), failed home saves, states Loading, Resolving, Refused | [session-and-authority.md](session-and-authority.md) |
| R5, R9 | Game Data & Tuning | Id lookup known, retired, unknown (R14); validation of dropped ids; fingerprint (R13); settings are not game data | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R2, Edge Cases | Ore & Item Economy | Container slot format; 64-bit haul statistics; overflow slots | [ore-and-item-economy.md](ore-and-item-economy.md) |
| R2, R10 | Home Valley | The `valley` part (R8); position not saved | [home-valley.md](home-valley.md) |
| R10 | Player Controller | Position never saved (R9) | [player-controller.md](player-controller.md) |
| Player Fantasy | Game concept | Pillars 3 and 5; Technical Risks: save migration | [game-concept.md](game-concept.md) |

## Acceptance Criteria

**QA-lead lens applied** (`lens-qa-lead.md`). Every rule R1 to R10 and formula
F1 to F4 has at least one criterion. Write-path guarantees already listed as
ADR-0002 and ADR-0003 verification items (atomic replace, crash safety, lock,
quit) are not restated; the first save story runs them. Story types:
**Logic** (EditMode, against the neutral document and the in-memory file fake,
ADR-0002), **Integration**, **Visual**. Gaps fixed in the first draft: no
criterion for the next piece id; no boundary test for F4's constraint.

**Document (R1, R2, R10)**

1. **GIVEN** a model with a home, two containers, carried items, valley spots,
   recipes, stats and no run marker, **WHEN** it is saved and loaded, **THEN**
   every part round-trips equal, and the document has all eleven top-level
   parts of R2, empty ones written as empty. *(Logic)*
2. **GIVEN** a saved document, **WHEN** it is searched, **THEN** it holds no
   player position, no tuning values, no settings, no pack during a run, and
   no seam, creature or oxygen state. *(Logic)*
3. **GIVEN** a home whose highest piece id is 812 and next piece id 813,
   **WHEN** it is saved, loaded, and a piece placed, **THEN** the new piece's id
   is 813; **AND GIVEN** a save whose next piece id is 500 with a piece 812,
   **THEN** after load the next id is 813 and one log line is written.
   *(Logic)*
4. **GIVEN** any saved document, **WHEN** every item stack is counted across
   `containers` and `carried`, **THEN** no stack appears in two places.
   *(Logic)*

**Loading (R4)**

5. **GIVEN** no save, **WHEN** the game starts, **THEN** result New, no notice,
   the player in the valley. *(Integration)*
6. **GIVEN** a save with a run marker listing a drill and 3 ore, **WHEN** the
   game starts, **THEN** the abandoned-run notice lists the drill and 3 ore,
   neither is in the loaded model, the marker is gone, and the result was
   written before the player could move. *(Integration with Session &
   Authority)*
7. **GIVEN** an unreadable main file and a readable backup 1, **WHEN** the game
   starts, **THEN** backup 1 loads, the backup notice shows, and after the next
   home action the main file is readable and matches the model. *(Logic +
   Integration)*
8. **GIVEN** a main file with `formatVersion` 99, **THEN** the newer-version
   screen shows, and the file's bytes and every backup are unchanged after
   quitting. *(Logic)*
9. **GIVEN** main and all backups unreadable, **THEN** the unreadable screen
   shows Quit, Open save folder and Start a new game, and no file is changed
   unless Start a new game is chosen. *(Logic)*
10. **GIVEN** an abandoned-run marker in the backup that loads, **THEN** the
    backup notice shows first, then the abandoned-run notice. *(Logic)*

**Removed content (R5)**

11. **GIVEN** a save with a container holding `ore.ochre` × 10 and an unknown id
    `ore.glint` × 4, **WHEN** it loads, **THEN** the container holds the ochre
    only, a file `save.recovered-1.json` identical to the loaded document
    exists, and the notice lists "ore.glint × 4". *(Logic)*
12. **GIVEN** a save with a piece of retired type holding a container with
    `material.rock` × 20, and one other stash with room, **WHEN** it loads,
    **THEN** the piece and its container are gone, the other stash gained 20
    rock, and the notice lists the piece. *(Logic)*
13. **GIVEN** a retired id that has a migration mapping it to a new id, **WHEN**
    the save loads, **THEN** the new id is present and no removed-content
    notice shows. *(Logic)*

**Migrations (R6)**

14. **GIVEN** a stored sample save of every released format version, **WHEN**
    each loads, **THEN** it migrates to the current version and the
    pre-migration copy for its version exists unchanged. *(Logic)*
15. **GIVEN** a test migration that throws, **WHEN** the save loads, **THEN**
    the result is Refused: unreadable and the original file is byte-for-byte
    unchanged. *(Logic)*

**Note and clock (R7, F1, F2)**

16. **GIVEN** save clock 1,800,000 ms and a note for the same profile at
    2,712,000 ms, **THEN** the loaded clock is 2,712,000; **AND GIVEN** the note
    is from another profile, or of unknown version, or unreadable, or at
    1,700,000, **THEN** it is 1,800,000. *(Logic)*
17. **GIVEN** a run in progress with `note_interval_s` 30, **WHEN** the process
    is killed at a random moment, **THEN** on restart the clock is within 30 s
    of the play time actually elapsed and never ahead of it. *(Integration)*

**Starting over (R8)**

18. **GIVEN** a save with a home and stats, **WHEN** New game is confirmed,
    **THEN** an archive folder holds the main save, its backups and note, the
    game starts as New with empty stats, and nothing from the old save is in
    the new model. *(Integration)*
19. **GIVEN** a file in the save folder held open by another program, **WHEN**
    New game is confirmed, **THEN** the old save is untouched, the player is
    told the new game could not start, and no partial archive is left.
    *(Integration)*
20. **GIVEN** a run in progress, **WHEN** the pause menu opens, **THEN** New
    game is not offered. *(Integration)*

**Store values (R9, F3, F4)**

21. **GIVEN** a generated home of 2,000 pieces, 40 stashes of 24 full slots and
    48 non-full spots, **WHEN** saved, **THEN** the file is under 1,024 KB, and
    the measured size is recorded against F3's estimate. *(Logic; the
    validation test)*
22. **GIVEN** the main file locked by another program for 0.3 s, **WHEN** a
    home save runs with 3 retries 0.2 s apart, **THEN** it succeeds and no
    failure is reported; **AND GIVEN** locked for 2 s, **THEN** the write
    reports failure to Session & Authority after about 0.6 s. *(Integration)*
23. **GIVEN** `replace_retry_count` 10 and `replace_retry_delay_s` 1.0 with
    `waited_write_timeout_s` 10, **WHEN** the catalog is validated, **THEN** it
    refuses the pair naming F4's constraint; **AND GIVEN** 3 and 0.2, **THEN**
    it passes. *(Logic)*

**Visual and feel**

24. **GIVEN** each notice and refused screen, **WHEN** shown at 1920 × 1080,
    **THEN** a retained screenshot shows plain text on the slate panel over the
    valley, no magenta, and buttons as R4 lists. *(Visual)*
25. **GIVEN** the 2,000-piece test save, **WHEN** the game starts on the target
    PC, **THEN** the load, migration included, completes in under 1 s.
    *(Integration, performance)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | The serializer and the per-user save folder are NOT SOURCEABLE from `docs/engine-reference/unity/` (ADR-0002, Engine Compatibility). F3's byte estimates and AC 25's load time depend on the serializer chosen. | unity-specialist, lead-programmer | First save story |
| 2 | Building must settle free-standing pieces and its condition values before format version 1 is frozen (ADR-0003, Decision 14). | Building (11) | Building design doc |
| 3 | The systems index's Depends On rows for Home Valley (5), Pack (8), Tools & Gear (9) and Crafting (13) do not list Save & Load, though each owns a part of the save (R2). Add them, or record why not. | `/map-systems` (producer) | Next systems-index update |
| 4 | Cloud saves (Steam Cloud) are out of scope (ADR-0002, ADR-0003). With cloud sync, a second machine's newer save could meet this one's; the lock and newer-version rules do not cover two machines. | technical-director | Before a Steam release |
| 5 | Removed-content handling (R5) moves a removed piece's items into another container. Should it instead refuse to load and point at the copy, for a hand-made build? Kept as R5 for players. | Designer | First playable |
| 6 | Statistics in `stats` are a first guess (best haul, total haul, runs, extractions, deaths, abandoned runs, storms weathered). Run Flow and Storms decide the final list. | Run Flow (22), Storms (14) | Their design docs |
| 7 | ADR-0002's registry entries (`persistent_profile`, `run_state_saved`) and ADR-0003's revisions live in `docs/registry/architecture.yaml`; this doc's R2 ownership table should be reflected there when the architecture registry is next updated. | technical-director | Next `/architecture-review` |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Overview framed technically, with the player promise, citing ADR-0002 and
   ADR-0003.
2. Player Fantasy: "It's all still there" and "What's lost is lost" as one
   promise.
3. **Unknown or retired ids at load are removed, an untouched copy is kept, and
   the player is told** (not refused, not silent). *Major.*
4. **New game archives the current save** rather than deleting it; no in-game
   way back. *Major.*
5. Each owning system maps its own part of the save; Save & Load frames,
   versions and checks ids.
6. Eleven top-level parts in format version 1 (R2), including a next piece id
   and `writtenBy` for diagnostics.
7. Every load outcome has one fixed player-facing result (R4), shown in a set
   order.
8. A migration that throws refuses the load and touches nothing.
9. Note interval 30 s; blocked-replace retries 3 × 0.2 s; size budget 1 MB.
10. New game is not offered during a run.
11. Removed pieces' known items go to another container, then the pack, then
    are lost and listed.
12. Settings and key bindings stay out of the save.
