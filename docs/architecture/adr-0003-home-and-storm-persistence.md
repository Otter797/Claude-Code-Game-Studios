# ADR-0003: Home and Storm Persistence — Built Pieces, a Play-Time Storm Clock, and Saves Written Off the Main Thread

## Status
Accepted

## Date
2026-11-27

## Last Verified
2026-11-27

## Decision Makers
Designer (project owner); drafted with Claude. Reviews on 2026-11-27: unity-specialist (no blocking findings; three wording fixes and its notes incorporated; its Unity-behaviour claims are general knowledge, not checked against Unity's documentation). Technical-director gate TD-ADR: CONCERNS (six items, all revised at the designer's direction); focused re-review of Decisions 6 and 11, Key Interfaces and Implementation Guidelines: CONCERNS (three wording gaps, all applied; the director stated no further cycle is needed and that it would approve once they were applied, but it has not seen the final text).

## Summary
The designer's pivot put a buildable valley home and forecast storms into the first game, and ADR-0002 left a player-built home out of scope, saves only at safe points with a synchronous whole-file write, and never saves the pack. This ADR keeps one save document, adds the home (pieces on a per-building grid, their condition, containers, carried items) and a storm clock that counts play time, writes the file from a single background writer so building never hitches, and resolves every storm with one deterministic rule whether the player was home, on a run, or lost the run to a quit or crash.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (editor 6000.3.29f1) |
| **Domain** | Core |
| **Layer** | Foundation |
| **Knowledge Risk** | HIGH — Unity 6.3 LTS is after the LLM knowledge cutoff (VERSION.md) |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `breaking-changes.md`, `deprecated-apis.md`, `current-best-practices.md` (searched for save, serialization, file, threading and quit guidance; there is no dedicated page), `modules/networking.md` via ADR-0001 |
| **Post-Cutoff APIs Used** | None mandated. Running work on a background thread, the application-quit callbacks and Play Mode exit behaviour are NOT SOURCEABLE from `docs/engine-reference/unity/`; this ADR fixes the rules and puts the writer behind an interface, so the calls are chosen and verified at the first save story. |
| **Verification Required** | (1) With a 2,000-piece home, a build, repair or gather action costs under 1 ms on the main thread for saving (the snapshot), with near-zero managed allocation per save point on either thread in steady state (garbage made by the writer can still pause the main thread), measured in a built player. (2) The background writer makes no engine call off the main thread; the save folder path is read once on the main thread. (3) Stopping Play Mode with domain reload disabled leaves no writer thread running and no pending write lost. (4) An orderly quit drains the pending write and writes a final play-time note within a bounded wait; which quit callback allows this on Windows is confirmed against Unity's documentation for the installed version. (5) Killing the process at any moment at home never leaves materials spent without the piece, or the piece without the materials spent. (6) Killing the process during a run, then restarting: the carried items are lost, the storm clock is within one note interval of the time actually played, and the storms applied are the same ones the forecast showed. (7) ADR-0002's verification items 1 to 6 still hold with the larger document. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 (Accepted) — host authority, the Simulation layer; ADR-0002 (Accepted) — the save document, store, backups, migrations and run marker that this ADR extends and amends |
| **Enables** | The Save & Load, Building, Stash and Storms design docs (systems 7, 11, 12, 14). The co-op persistence ADR before Tier 2a now also has to say whose valley it is. |
| **Blocks** | Every Save & Load, Building, Stash, Storms and Gathering story; the Run Flow stories that start and end a run |
| **Ordering Note** | Must be Accepted before the first save story. It amends ADR-0002 without replacing it: ADR-0002 stays Accepted and in force except for the clauses listed under "What this changes in ADR-0002". |

## Context

### Problem Statement
On 2026-11-26 the designer replaced the workshop room with a small valley the player builds in, and on 2026-11-27 fixed the rules (recorded in `design/gdd/systems-index.md` and `design/gdd/game-concept.md`, Open Questions): pieces snap to each other; storms come every 50 to 70 minutes of play; the clock keeps running during a run and never while the game is closed; a rock-and-stick shelter falls after two unrepaired storms; one hammer action repairs the whole home; a stash or furniture is sheltered if it is under a roof, otherwise a storm takes its contents; an abandoned run counts the time actually played; what the player carries at home is kept.

ADR-0002 cannot hold any of that. It put "the layout of a player-built home" out of scope, writes "never on a timer and never during a run", writes the whole file synchronously (the technical director: this "will stutter once a home has hundreds of pieces"), and says the pack is never saved. The technical director made a new ADR a prerequisite for four design docs and ruled that the roof check is computed from the piece model, not physics, and that the home and storm clock live in session-level Simulation state.

### Constraints
- ADR-0001: only the host writes game state; rules are plain C# with no engine dependency; Presentation never holds a rule.
- ADR-0002: one versioned JSON document, replaced atomically, three backups, numbered migrations, a run marker; leaving a run is a death; a run cannot be resumed.
- The home scene is not loaded during a run, so nothing about the home may depend on scene objects or physics.
- Building spends materials and adds a piece in one action; a crash must never separate the two.
- One hobby developer; the save must stay readable and repairable by hand.
- The engine reference has no coverage of file, threading or quit APIs for this Unity version.

### Requirements
- Nothing built, repaired or gathered is lost to a crash, beyond the last action or two still being written.
- Building in a home of hundreds of pieces never causes a visible hitch from saving.
- A storm cannot be dodged, rerolled or changed by quitting, crashing or being on a run.
- Storms that passed during a run are applied in one step when the run ends.
- An abandoned run counts the play time that actually passed.
- Design target: 2,000 pieces in a home (designer, 2026-11-27).

## Decision

**One save document, as in ADR-0002, extended with the home and the storm clock; saved after every change at home by a single background writer; storms resolved by one deterministic Simulation function.**

1. **The home is session-level Simulation state.** A plain C# home model and storm clock exist for the whole session, at home and during a run. No scene object owns any of it. When the home scene loads, its views are built from the model. Pieces reach Presentation as data; a piece is never its own networked object.

2. **How a piece is saved.** A home is a set of structures. Each structure has an anchor (a position and a facing, set freely when its first foundation is placed) and its own regular grid. Each piece has a stable integer id that is never reused, a type id (a stable string such as `"piece.wall.stick"`, as ADR-0002 requires), a grid cell (three integers), a rotation step, and a condition (a small integer whose meaning the Building design doc defines). If the Building design doc allows pieces that stand outside any structure, those carry a free position instead of a cell. Every saved piece has one or the other, and the shelter check must be answerable from those values alone.

3. **Containers and carried items.** A stash is a built piece; its contents are saved keyed by that piece's id. ADR-0002's single `stash` becomes this keyed set of containers. What the player carries at home (pack, tool, gear) is saved as `carried`. When a run starts, the run marker lists what is carried, as in ADR-0002, and from then until the run ends the pack is not saved.

4. **The storm clock counts play time.** The clock is a count of milliseconds, advanced by the Simulation's tick. It advances at home and during a run. It does not advance in the main menu, while the game is paused, or while the game is closed. The wall clock is never read. Pause is an explicit state the Authority layer passes to the Simulation; the clock never depends on the engine's time scale. Whether a co-op host can pause is for the co-op ADR. The clock keeps counting while the game window is in the background (the project runs in the background, which a host needs); only an explicit pause stops it.

5. **The storm schedule is saved, so it cannot be rerolled.** The save holds the clock, the time and strength of the next storm, and the state of the random generator that produces the storms after it. The interval range (50 to 70 minutes) and strength rules are tuning data. Loading the same save always produces the same storms.

6. **One function resolves storms, and Storms owns it.** `AdvanceTo` and the storm clock belong to Storms. Storms depends on Building's `IStructureDamage` and shelter query, and on Stash's container-clearing call. Neither Building nor Stash depends on Storms. `AdvanceTo(playTime)` resolves, in order, every storm whose time has been reached: Storms decides the damage, Building applies it through a narrow interface, the shelter check is run against the pieces still standing, unsheltered containers lose their contents, and the next storm is scheduled. It returns a report of what happened for Presentation to show. It is a pure function of the model, the clock and tuning data. In the model a storm resolves at a single instant; how long it looks and sounds like a storm is Presentation's business.
   - **At home** it is called as the clock advances, so a storm resolves when its time comes, and that is a save point.
   - **During a run** it is not called. The clock still advances, and the next storm's time and strength are readable, so the run HUD can warn that one is on the way.
   - **When a run ends**, by extraction or death, it is called once with the current clock. Every storm that passed is applied in that one step, in the same write that banks the haul (or records the death) and clears the run marker.
   - **When an abandoned run is found at start-up**, the clock is restored (see 8), the Authority layer (not Save & Load, and not Run Flow) calls it once after the load, and the result is written together with the loss of the carried items and the clearing of the marker. Because the schedule is saved, repeating this after a second crash gives the same result.
   - **After a crash at home** there is no marker. The restored clock is applied on the first home tick by the normal rule: storms that fell due between the last save and the crash resolve then, as a save point.

7. **The shelter check is model-only.** "Is this under a roof?" is a function on the home model: it reads cells, piece types and which pieces are standing. It never uses physics, colliders or a loaded scene. The exact rule (which piece types count as a roof, how far cover reaches) belongs to the Building design doc.

8. **The play-time note.** Between save points the clock would otherwise be lost to a crash, and during a run there are no save points at all. So the persistence service writes a tiny separate file, the play-time note, holding the profile id and the clock. It is written about every 30 seconds of play (a tuning value), at home and during a run, and once more on an orderly quit. On load, if the note belongs to this profile and its clock is later than the main save's, the note's clock is used. A missing, unreadable or older note is ignored without error. The note holds nothing else, and nothing in it lets a run be resumed. A crash can therefore lose at most one interval of storm-clock time, in the player's favour.

9. **Save points.** At home: every successful build, removal, repair, gather, stash move, craft and storm resolution. Plus ADR-0002's: run start, extraction, death, abandoned-run resolution. Each save point takes a snapshot of the whole save model.

10. **How it is written without stutter.** On the main thread a save point only takes a snapshot: an immutable copy of the save model (budget: under 1 ms at 2,000 pieces). The snapshot is handed to the save queue (see below for its two pending slots). A single background writer takes the newest snapshot, turns it into text, and runs ADR-0002's write (temporary file, flush, atomic replace, backup rotation) unchanged. If a newer snapshot arrives while one is being written, it replaces the snapshot that is waiting, however fast the player builds. The play-time note goes through the same writer, so the persistence service still has exactly one writer and one write in progress at a time. The queue holds at most one pending main-save snapshot and one pending note. Neither replaces the other; newest-wins applies only within each kind. A failed write is reported to the player on the main thread and the next save point tries again. The writer catches every error: a writer that has failed fails every write waiting on it and says so, it never goes quiet.

11. **Where waiting is still required.** A run does not begin until the run-marker write has finished and succeeded (ADR-0002, unchanged in effect). The run-end write, the abandoned-run resolution and any migration are also waited for before play continues. Home save points are not waited for. Waiting never blocks the main thread; the game shows a short "saving" state and the Authority layer picks up the result on a later frame. While a waited write is pending, the clock and every home save point are held, so nothing else can enter the queue behind it. A waited write has a time limit and fails closed:
    - **Run start.** If the marker write fails or times out, the run does not start. The Simulation removes the marker from the model, and a snapshot without it is written and waited for before play resumes. The queue writes in order, so even if the timed-out marker write reaches the disk late, the marker-free snapshot lands after it. If the marker-free write itself fails or times out, it is handled as a run-end write: retried and reported, and no home action is accepted until it succeeds. If the game closes first, the next start finds the marker and resolves it as an abandoned run (carried items lost). This fails closed and is accepted. The player is never left playing at home with a marker on disk.
    - **Run end and abandoned-run resolution.** A write that fails is retried and reported, and no home action is accepted until it succeeds.

12. **Why one document.** A build action removes materials from a container or the pack and adds a piece. Both are in the same snapshot and reach the disk in the same atomic replace, so after any crash the save holds either both or neither. Nothing can be duplicated or lost by a crash at home; at worst the last action or two is undone as a whole.

13. **Quit.** On an orderly quit the queue is drained (the waiting snapshot, if any, is written) and a final play-time note is written, within a bounded wait. No new snapshot is taken on quit. Correctness never depends on this step: a kill instead of a quit loses only what the crash case already allows.

14. **The first format includes all of this.** No save has shipped and no save code exists, so `formatVersion` 1 is defined with the home, containers, carried items and storm clock in it. No migration is needed now. Later changes to the piece list go through ADR-0002's migrations and stable ids. Whether pieces can stand outside a structure (Decision 2) **must** be settled by the Building design doc before format version 1 is frozen at the first save story. Saving gather points later would cost a migration, which is accepted.

### What this changes in ADR-0002

ADR-0002 remains Accepted. The clauses below are amended; everything else in it stands. The list covers its guideline and interface sentences as well as its Decision clauses, because the control manifest is built from all of them.

| ADR-0002 | Amended by this ADR |
|---|---|
| Out of scope: "the layout of a player-built home (Tier 1b)" | In scope and in format version 1 (Decisions 2, 3) |
| Decision 1: the list of what is saved (stash, gear, recipes, statistics, run marker) | Adds the home, containers, carried items and the storm clock (Decisions 2, 3, 5) |
| Decision 1: the pack is never saved | Carried items are saved at home; the pack is not saved during a run (Decision 3) |
| Decision 5: "Never on a timer and never during a run" | One exception: the play-time note, which holds only the profile id and the clock (Decision 8) |
| Decision 6: "Writes are synchronous"; Guideline: "Saves must be written synchronously through a single writer" | Still a single writer, one write at a time, but it runs off the main thread; run start, run end, abandoned-run resolution and migration wait for it (Decisions 10, 11) |
| Decision 6: "The game never writes on application quit"; Guideline: "The game must never write a save on application quit" | On an orderly quit the queue is drained and a final play-time note is written; no new snapshot is taken (Decision 13) |
| Guideline: "Run state must never be saved" | Still true, with one exception: elapsed play time, in the play-time note. A run still cannot be resumed (Decision 8) |
| Key Interfaces, `ISaveStore`: "The host's Authority layer is its only caller" | The save queue's writer is its only caller; the Authority layer is the only caller of the queue (Decision 10) |
| Key Interfaces, `SaveModel.stash` | Becomes `containers`, keyed by piece id (Decision 3) |

Registry: `run_state_saved` is replaced by a rule that allows the play-time note and nothing else; `persistent_profile` is revised; new ownership entries are added for the home model (owner: Building) and the storm clock (owner: Storms).

Out of scope, each needing its own decision: whose valley it is in co-op and how the home model is sent to guests (before Tier 2a); cloud saves; a second home or a ship interior; whether gathered rocks and sticks come back, and so whether the valley's gather points are saved (Home Valley design doc; if they are, they are keyed by stable id in the same document).

Open question for the Storms design doc: does solo play pause when the game window loses focus? The project runs in the background, which a host needs, so as things stand a player who leaves the game open and unpaused comes back to storms. This ADR fixes only that pausing is the explicit Simulation pause state (Decision 4).

### Architecture Diagram

```
 Simulation (plain C#, session-level)
   Home model: structures -> pieces (cell, type, condition), containers, carried
   Storm clock: play time, next storm (time, strength), generator state
   AdvanceTo(playTime) -> storm reports        IsSheltered(pieceId)
        |
        | snapshot (immutable SaveModel), taken on the main thread at each save point
        v
 Save queue (host only; one pending snapshot + one pending note, newest wins within each)
        |                                                   |
        v                                                   v
 Single background writer ---------------------------------------------
        |  ISaveStore.Save (ADR-0002, unchanged)            |
        v                                                   v
 save.json <- replace <- save.tmp   backups .bak1-3     playtime.json <- replace <- playtime.tmp

 Load:  save.json -> migrations -> SaveModel
        clock = later of (save clock, note clock if same profile)
        run marker found?  -> carried items lost -> AdvanceTo(clock) -> one waited write
        no marker (crash at home or normal start) -> first home tick calls AdvanceTo(clock) -> save point if a storm resolved
```

### Key Interfaces
Names are provisional until the first save story; the shapes are the contract.

- `SaveModel` (extends ADR-0002's) — adds `home` (`structures`, each with `anchor` and `pieces` keyed by piece id; `nextPieceId`), `containers` keyed by piece id (replaces `stash`), `carried`, `storms` (`playTimeMs`, `nextStormAtMs`, `nextStormStrength`, `generatorState`). `runMarker` is unchanged. A snapshot is immutable once taken.
- Building (session-level, plain C#) — owns the home model: `TryPlace(...)`, `TryRemove(pieceId)`, `TryRepairAll(...)`, each returning what changed (with the new revision number) or why it was refused; the shelter query `IsSheltered(pieceId)`.
- `IStructureDamage` — the narrow interface Building exposes to Storms: apply a storm of a given strength to the pieces. Storms decides how much; Building applies it.
- Storms (session-level, plain C#) — owns the storm clock and `AdvanceTo(playTimeMs)`, which returns a list of `StormReport`. It calls `IStructureDamage`, the shelter query, and Stash's container-clearing call. Building and Stash never reference Storms.
- `IHomeSimulation` — a façade the Authority layer puts together over Building, Stash and Storms so it has one place to send requests and take `Snapshot()`. It holds no rules, and no Simulation system depends on it.
- `StormReport` — plain data: which storm, its strength, pieces damaged and destroyed, containers emptied. Presentation shows it; the report is not saved.
- `ISaveQueue` — host only, called only by the Authority layer: `Request(SaveModel snapshot)` (returns at once), `RequestAndWait(SaveModel snapshot)` (completes with success, failure or timed-out; until it completes, `Request` and `NotePlayTime` are refused; after a time-out it counts as complete, and the next request is queued behind any write still in flight), `NotePlayTime(playTimeMs)` (its own pending slot, never displacing a snapshot), `Drain()` (always accepted; waits for whatever is in flight or pending), and a failure notification raised on the main thread. It takes its scheduler as a dependency, so EditMode tests run it inline with no thread.
- `ISaveStore`, `ISaveFiles`, `ISaveSerializer`, `ISaveMigration`, `SaveDocument` — ADR-0002's, unchanged. `ISaveStore` stays synchronous; only the queue calls it, from the writer. `ISaveStore` gains reading and writing the play-time note through `ISaveFiles`.
- Run hooks — ADR-0002's `BeginRun(carried)` and `EndRun(outcome)`. The Authority layer takes the run-end snapshot only after every Simulation listener to the end of the run (the stash banking the haul, Storms advancing the clock) has finished, so there is one write.

### Implementation Guidelines
- The home model and storm clock **must** live in session-level Simulation state; they **must never** be owned by a scene object.
- Home views **must** be built from the model when the home scene loads; the model **must never** be read back from the scene.
- A built piece **must never** be its own networked object; pieces are sent as data. How is decided at the first Building story and recorded as an amendment to ADR-0001.
- The shelter check **must** be a pure function of the home model; it **must never** use physics, colliders or a loaded scene.
- Piece ids **must** be stable and **must never** be reused; piece types **must** be saved by stable string id.
- The storm clock **must** advance only from the Simulation's tick; code **must never** read the wall clock for it.
- The next storm's time and strength and the generator state **must** be saved; storm results **must never** depend on anything that is not in the save or in tuning data.
- Storms **must** be resolved only by `AdvanceTo`; there **must never** be a second code path for storms that passed during a run or before a crash.
- `AdvanceTo` **must not** be called during a run; it **must** be called once when the run ends and its result written in the same write as the run's outcome.
- Storms' only link to Run Flow **must** be listening for the end of a run; Run Flow **must never** call Storms. Save & Load **must never** depend on Run Flow, Building or Storms; they produce the model and it stores it.
- Every successful build, removal, repair, gather, stash move, craft and storm resolution at home **must** request a save.
- A save point on the main thread **must** only take a snapshot and hand it to the queue; serializing and file work **must never** run on the main thread, except where this ADR says the game waits.
- A snapshot **must** be immutable; the writer **must never** read live Simulation state.
- There **must** be exactly one writer for every file in the save folder and one write in progress at a time; at most one main-save snapshot and one play-time note waiting, and neither **may** replace the other.
- While a waited write is pending, the clock and every home save point **must** be held.
- If the run-start write fails or times out, the marker **must** be removed from the model and a marker-free snapshot written and waited for before play resumes; if that write fails too, it **must** be retried and reported, with no home action accepted until it succeeds.
- A failed run-end or abandoned-run write **must** be retried and reported; no home action **may** be accepted until it succeeds.
- `AdvanceTo` and the storm clock **must** belong to Storms; Building and Stash **must never** depend on Storms. At start-up the Authority layer **must** be the caller of `AdvanceTo`.
- An action's cost and its result (materials spent, piece added) **must** be in the same snapshot; they **must never** be saved by separate writes or in separate files.
- A run **must never** begin until its marker write has finished and succeeded; the run-end write and abandoned-run resolution **must** be waited for.
- The play-time note **must** hold only the profile id and the clock; it **must never** hold pack, position or any other run state.
- A missing, unreadable, older or other-profile play-time note **must** be ignored without error.
- On quit the game **must** only drain the queue and write a final note; it **must never** take a new snapshot, and correctness **must never** depend on quit handling running.
- The writer **must never** call an engine API; anything it needs from the engine (the save folder path) **must** be read on the main thread first.
- The writer **must** be stopped and drained when Play Mode ends, and **must** hold no static state. Stopping it **must** be tied to the teardown of the object that owns it, and a missed stop **must never** keep the game process alive.
- "Single writer" **must** be guaranteed by the writer's own loop, never by assuming which thread runs it.
- The writer **must** catch every error, fail every pending wait and report on the main thread; a waited write **must** have a time limit and fail closed.
- The main thread **must never** block on a write; a waited write completes through a result the Authority layer checks on the main thread.
- The storm clock **must never** depend on the engine's time scale; pause **must** be an explicit state passed to the Simulation. The clock **must** accumulate tick time without rounding each tick to whole milliseconds.
- Taking a snapshot **must not** allocate per piece: pieces are plain value records in contiguous storage, and snapshot and output buffers are reused, with ownership handed to the writer.
- Every change to the home model **must** raise a revision number and return a list of what changed, so views (and later guests) can apply changes without rebuilding the whole home.
- The note interval, storm interval range and strength rules **must** come from data assets.
- `AdvanceTo`, the shelter check and the queue's ordering rules **must** be unit-tested in EditMode with no scene, no thread and no disk.
- The threading, quit and Play Mode exit calls **must** be verified against Unity's documentation for the installed version, and recorded in the engine reference, before the first save story.

## Alternatives Considered

### Alternative 1: A separate file for the home
- **Description**: Keep ADR-0002's profile file for stash and progress; put pieces in a second file written on each build.
- **Pros**: The frequently written file holds only pieces; the profile file is written as rarely as before.
- **Cons**: A build action changes both files (materials leave a container, a piece appears). Two files cannot be replaced in one atomic step, so a crash between them either duplicates materials or spends them for nothing. Containers are pieces, so the split does not even fall cleanly. Fixing it needs a transaction marker across files, which is the complexity this option was meant to avoid.
- **Rejection Reason**: It trades a performance problem that the background writer already solves for a correctness problem in exactly the place the game can least afford one.

### Alternative 2: An append-only log of home changes
- **Description**: Append one small record per action (placed, removed, repaired, gathered) and fold the log into the main file now and then.
- **Pros**: The smallest possible write per action; a natural history for debugging.
- **Cons**: Loading means replaying a log through the rules; a torn last record must be detected; folding the log is a second write path; migrations must handle both the document and old log records; a log is far harder to read and repair by hand than one document. A 2,000-piece document is an estimated few hundred kilobytes, which a background writer handles easily.
- **Rejection Reason**: Much more machinery for a saving that is not needed at this size. It can be revisited if measured write times ever say otherwise.

### Alternative 3: Keep ADR-0002's synchronous write
- **Description**: Change nothing about how the file is written; just add the home to it.
- **Pros**: No threading at all; nothing new to verify.
- **Cons**: Every build, repair and pickup would serialize and flush the whole document on the main thread. The flush to disk alone can take long enough to see, and building is the moment the player is looking most closely.
- **Rejection Reason**: The technical director already ruled this out.

### Alternative 4: Apply storms during the run, as they happen
- **Description**: Resolve each storm at its moment even while the player is on the asteroid, and save then.
- **Pros**: The home model is always current.
- **Cons**: It needs a save during a run, which ADR-0002 forbids for good reason, and a crash after the storm but before the run ends would need its own case. Applying them at run end gives the same result, because the schedule is deterministic, with one write and one case.
- **Rejection Reason**: Same outcome, more states, and it breaks the technical director's "in one step when the run ends".

## Consequences

### Positive
- Building never waits on the disk, and the cost on the main thread does not grow with how the file is written, only with the size of the snapshot.
- A crash at home cannot duplicate or destroy materials.
- There is one rule for storms. Home, run end and crash recovery cannot drift apart, and the rule is testable with no scene.
- Because storms are a pure function of the save, the game can work out in advance what the forecast storm would do, which the forecast and the "a normal run cannot destroy a ready home" rule can use.
- A storm cannot be dodged by quitting or by being away.
- ADR-0002's store, backups, migrations and tests carry over unchanged.

### Negative
- The project now has a background thread. It is one thread with one job, but it is still a class of bug (ordering, shutdown, Play Mode exit) that ADR-0002 did not have.
- A crash at home can undo the last action or two. A crash can also give the player up to one note interval of storm-clock time for free.
- The whole document is rewritten after every action. This is cheap at the design target but it is not free, and the three backups will usually be seconds apart, so they protect against a damaged file, not against an old mistake.
- Grid cells per structure limit how freely pieces can be placed. Accepted by the designer in exchange for a shelter check that needs no physics.
- ADR-0002 must now be read together with this ADR.

## Risks
- **The snapshot costs more than 1 ms at 2,000 pieces.** Mitigation: Verification item 1, measured early in Milestone A with a generated home; if it fails, copy only the sections that changed since the last snapshot. The budget is a target, not yet a measurement.
- **Engine calls for threading, quit and Play Mode exit differ from what is assumed.** Mitigation: none are named here; the queue takes its scheduler as a dependency; Verification items 2 to 4 before the first save story.
- **A write is still in progress when a waited write is requested.** Mitigation: the queue orders them; a waited write completes only when its own snapshot, or a newer one, is on disk. Covered by EditMode tests on the queue.
- **Quit handling does not get time to run.** Mitigation: correctness does not depend on it (Decision 13). The unity-specialist expects no quit callback to run on End Task or logoff, and stopping Play Mode in the editor may need a different hook (general knowledge, not sourced; Verification item 4).
- **The Play Mode test may test nothing.** `StarHaul/ProjectSettings/EditorSettings.asset` currently reads as domain reload still on. Verification item 3 must be run with domain reload switched off, confirmed in the editor. With reload on, a recompile can stop the writer mid-write; the temporary-file replace protects the save.
- **An implementer reaches for a pooled background task.** Those are not one fixed thread and are not cancelled when Play Mode exits (unity-specialist, general knowledge). A dedicated plain thread fits better; either way the single-writer rule comes from the loop.
- **The serializer.** The writer may not call the engine, which rules out the engine's own JSON utility there. No JSON package is in `StarHaul/Packages/manifest.json`; adding one needs the technical director's sign-off (ADR-0002). A hand-written writer over `SaveDocument` avoids both the package and code-stripping risk. No scripting backend or stripping level is set yet; re-test if IL2CPP is chosen.
- **Sending 2,000 pieces to a guest will not fit one unfragmented message.** Netcode's limits are not sourceable from the engine reference and the package is not yet in the manifest. Out of scope until Tier 2a; the revision number and change lists required above keep it open.
- **A player stops the clock by killing the game again and again before the first note.** Possible in principle; each kill gains at most one interval and loses unsaved work. Accepted, in the same class as hand-editing a readable save.
- **The play-time note and the main save disagree after a restore from backup.** The later clock wins, so time is never handed back. Storms that fall in the gap are applied on load by the normal rule.
- **A storm rule changes in a patch and old saves resolve differently.** The saved next storm keeps its time and strength; anything else is a tuning change like any other. A change to the saved fields needs a migration.
- **Storms applied at run end surprise the player.** Design risk, owned by the Storms and HUD design docs: the forecast is shown before launch and the report says what happened.
- **Two thousand pieces is too few or the home view is the real cost.** Not assessed here: rendering and rebuilding the home's views are outside this ADR and have no budget yet.

## GDD Requirements Addressed

The four design docs this ADR unblocks are not written yet; the requirements below come from the concept and the systems index.

| GDD System | Requirement | How This ADR Addresses It |
|------------|-------------|--------------------------|
| systems-index.md (Technical Director Notes, 2026-11-27) | "saving built pieces and their condition; building, repairing and gathering as save points; applying storms that passed during a run in one step when the run ends; the crash case" | Decisions 2, 9, 6 and 8 in that order |
| systems-index.md (Technical Director Notes) | ADR-0002's synchronous whole-file write "will stutter once a home has hundreds of pieces" | Snapshot on the main thread, single background writer, one waiting slot (Decision 10) |
| systems-index.md (Technical Director Notes) | "The roof check is worked out from the piece model, not from physics." | Per-structure grid cells; `IsSheltered` is a pure function of the model (Decisions 2, 7) |
| systems-index.md (Technical Director Notes) | "Home and storm clock live in session-level Simulation state... Pieces are sent as data, not as one networked object each." | Decision 1 |
| systems-index.md (Technical Director Notes) | "Storms only listens for Run Flow's end-of-run event... Building only applies it, through a narrow interface." | `AdvanceTo` at run end; `IStructureDamage` |
| game-concept.md (Open Questions, storms) | "they come every 50 to 70 minutes of play; the clock keeps running during a run... and does not run while the game is closed" | Play-time clock advanced by the Simulation tick; saved schedule (Decisions 4, 5) |
| game-concept.md (Open Questions, storms) | "a stash or furniture counts as sheltered if it is under a roof" | Containers keyed by piece id; the shelter check runs inside storm resolution (Decisions 3, 6, 7) |
| systems-index.md (designer's decisions) | "an abandoned run (quit or crash) counts the time actually played, so the save must note the time as a run goes" | The play-time note (Decision 8) |
| systems-index.md (designer's decisions) | "what the player carries at home is kept, so 'the pack is never saved' becomes 'the pack is not saved during a run'" | `carried` in the save model (Decision 3) |
| game-concept.md (MVP Definition, item 4) | "a persistent stash that is safe when sheltered, and forecast storms" | Decisions 3, 5, 6 |
| game-concept.md (Technical Risks) | "Save migration: patches can break player-built homes." | Pieces saved by stable type id and stable piece id, inside ADR-0002's versioned document |

## Performance Implications
- **CPU**: Main thread, per save point: one snapshot, budget under 1 ms at 2,000 pieces (not measured). Serializing and writing happen on the writer thread. `AdvanceTo` is a comparison per tick when no storm is due.
- **Memory**: Up to three copies of the save model at once (live, being written, waiting). Estimated at a few megabytes at most; not measured.
- **Load Time**: One larger file to read, plus one tiny note. Not measured; rebuilding the home's views is outside this ADR.
- **Network**: None in solo. Sending the home model to guests is out of scope until Tier 2a.

## Migration Plan
No Unity save code and no shipped save exists, so nothing is migrated. ADR-0002's text gets a short note under its Status pointing to this ADR and its list of amended clauses; its status stays Accepted. In the registry, `run_state_saved` is marked superseded and replaced, `persistent_profile` is revised, and ownership entries are added for `home_model` (Building) and `storm_clock` (Storms).

## Validation Criteria
- Building quickly in a generated 2,000-piece home shows no frame-time spike attributable to saving.
- Killing the process at random moments while building never produces a save with materials spent and no piece, or a piece with no materials spent.
- The same save, loaded twice and advanced to the same play time, produces identical storm reports.
- A run that ends after two storms passed applies both in one write, and the result equals staying home for the same play time with no repairs.
- Killing the game during a run: the next start loses the carried items, the clock is within one note interval of the time played, and the storms applied match the forecast.
- `AdvanceTo`, the shelter check and the save queue are covered by EditMode tests with no scene, thread or disk.

## Related
- ADR-0001: Network Model (Accepted) — depends on it
- ADR-0002: Persistence (Accepted) — depends on it and amends the clauses listed under "What this changes in ADR-0002"
- `design/gdd/systems-index.md` — Technical Director Notes and Creative Director Notes, 2026-11-27
- `design/gdd/game-concept.md` — Open Questions (storms), MVP Definition, Technical Risks
- Future: co-op persistence ADR (before Tier 2a); the Save & Load, Building, Stash and Storms design docs
