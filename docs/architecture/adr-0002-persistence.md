# ADR-0002: Persistence — One Versioned Save, Written at Safe Points on the Host

## Status
Accepted

> **Amended by ADR-0003** (`adr-0003-home-and-storm-persistence.md`, Accepted on
> 2026-11-27). It brings the player-built home, carried items and a storm clock
> into the save, allows a play-time note during a run, and moves the write off
> the main thread. The clauses it changes are listed there under "What this
> changes in ADR-0002" and are in effect. Everything
> else in this ADR stands.

## Date
2026-11-26

## Last Verified
2026-11-26

## Decision Makers
Designer (project owner); drafted with Claude. Reviews on 2026-11-26: unity-specialist (three blocking findings and nine notes, all revised in this text); technical-director gate TD-ADR (CONCERNS: four ordering holes and three minor points, all revised at the designer's direction; the director stated no new review cycle is needed).

## Summary
Star Haul's MVP needs a persistent stash and "versioned save data", and the concept warns that patches can break player-built homes, so the save format and its rules must be fixed before any stash code exists. This ADR decides on one versioned, human-readable save file per installation, written only by the host at safe points, upgraded by numbered migrations, with leaving a run counted as a death.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (editor 6000.3.29f1) |
| **Domain** | Core |
| **Layer** | Foundation |
| **Knowledge Risk** | HIGH — Unity 6.3 LTS is after the LLM knowledge cutoff (VERSION.md) |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `current-best-practices.md`, `deprecated-apis.md`, `breaking-changes.md`, `modules/input.md` (searched for save and serialization guidance; there is no dedicated page) |
| **Post-Cutoff APIs Used** | None mandated. The JSON serializer and the save-folder API are NOT SOURCEABLE from `docs/engine-reference/unity/`; this ADR fixes the format and rules and puts the serializer behind an interface, so the library is chosen and verified at the first save story. |
| **Verification Required** | (1) The chosen serializer round-trips every save type, including keyed collections and nested lists, in a built player as well as in EditMode (code stripping can remove what a serializer needs; no scripting backend is recorded in `project.yaml` yet). (2) The save folder is per-user, writable without admin rights, stable if the company or product name changes, and usable from where the store runs; its path is recorded in the engine reference. (3) Replacing the save file while turning the old one into backup 1 is a single atomic operation on Windows under the project's API compatibility level, with a flush to disk: killing the process at any point never leaves a half-written or missing main save. (6) With two instances on one machine (ADR-0001's smoke test), only the host touches the save. (4) A save from every earlier version loads after migration. (5) The service survives stopping and restarting Play Mode without a domain reload. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 (Accepted) — the stash and crafting are host-owned state, written only through the Authority layer |
| **Enables** | A co-op persistence ADR before Tier 2a (whose home and stash it is, guests carrying items between hosts) |
| **Blocks** | Every stash, crafting, home and progression story |
| **Ordering Note** | Must be Accepted before the first stash or save story. Run-only stories (mining, oxygen, creatures) do not wait on it, except the run-start and run-end hooks. |

## Context

### Problem Statement
The MVP definition requires "a home with a persistent stash and one crafting bench" and "versioned save data". The concept's Technical Risks add: "Save migration: patches can break player-built homes. Version save data from the MVP onward", and, for co-op, "whose home and stash it is, and stopping loot duplication when guests carry items between hosts. Decide before Tier 2a."

An extraction game also has a rule other games do not: loss must stick. A save system that lets a player reload, or quit to escape, removes the stake the whole design rests on (Pillar 3: "Bright world, real stakes").

### Constraints
- ADR-0001: only the host writes game state; rules live in plain C# with no engine dependency.
- One hobby developer; the save must be easy to read and repair by hand during development.
- Full vision adds a player-built home, farm, ship and gear tiers: the format will grow for years.
- Windows desktop; Steam is intended but no cloud-save decision is made here.
- No engine-reference coverage of save APIs for this Unity version.

### Requirements
- The stash is never lost to a crash, a power cut mid-write, or a game update.
- Whatever is carried when a run is left without extracting is lost; the stash is untouched.
- Old saves load in new versions without the player doing anything.
- Save logic is testable without a running game.
- Nothing here may rule out co-op guests keeping their own progress later.

## Decision

**One save file, owned by the host, written at safe points only.**

1. **What is saved.** A single profile: format version, the profile's player identity, stash contents, crafted and equipped gear, unlocked recipes, best-haul and total statistics, and a run marker (see 4). Run state itself (seam damage, creature positions, oxygen, pack) is never saved: a run cannot be resumed.
2. **Where the data comes from.** The Simulation produces and consumes a plain save model (data only, no engine types). A persistence service on the host turns that model into a file and back. The Simulation never touches the disk. Assemblies: the save model, the run hooks, the migrations and a neutral document type live in the Simulation assembly; the file store and the serializer live in a separate Persistence assembly that the Simulation does not reference. The persistence service holds no static state.
3. **Format.** Human-readable JSON, one document, with an integer `formatVersion` at the top. Every collection is keyed by stable string ids (`"ore.cobalt"`, `"tool.drill.basic"`), never by position or by an engine reference, so content can be added, renamed through a migration, or removed.
4. **Leaving a run is a death.** When a run starts, the save is written with a run marker listing what was taken out of the stash (pack contents are empty at start; the tool and any gear carried). The run does not begin until that write has succeeded: if the marker cannot be saved, the player stays at home and is told the save failed. When the player extracts, the haul is added to the stash and the marker is cleared in the same write. When the player dies, the run's statistics are recorded and the marker is cleared in one write, so a death is never later mistaken for an abandoned run. If the game starts and finds a run marker, the run was abandoned by quit or crash: the carried items stay lost, the marker is cleared, and the player is told what happened. There is no way to tell a crash from a quit, by design.
5. **When it is written.** At run start, at extraction, at death, and after each stash or crafting change at home. Every write at home happens after the marker has been cleared. Never on a timer and never during a run.
6. **How it is written.** Write the whole document to a temporary file in the same folder, flush it to disk, then, in a single operation, make the temporary file the main file while the previous main file becomes backup 1. There must be no moment at which the main file is absent. Older backups shift down first; keep three. Only a process that is hosting may open the save store: a client-only process never reads or writes it. A lock file in the save folder stops a second hosting process on the same machine from opening the store; it is refused with a clear message. Writes are synchronous and go through a single writer, so two quick changes can never share the temporary file. A temporary file left over at start-up is deleted, never loaded. A replace that fails because another program holds the file is retried a few times before reporting a failed save. The game never writes on application quit: every safe point has already written. On load, if the main file is missing or unreadable, fall back to the newest readable backup and say so.
7. **Versioning.** Each change to the format adds one migration step, `N → N+1`, a pure function on the parsed document. Loading runs every step from the file's version to the current one. Before the upgraded file is written, the original is copied to a pre-migration file named for its version (`save.v<N>.premigration`), which sits outside the backup rotation and is never deleted by the game. If a pre-migration copy for that version already exists, it is never overwritten. A file with a version newer than the game refuses to load with a clear message; it is never overwritten.
8. **Slots.** One profile. Backups exist for recovery from corruption only and are not offered to the player as restore points.

Out of scope, each needing its own decision before the tier that uses it: co-op guests' progress and item transfer between hosts (before Tier 2a), cloud saves, the layout of a player-built home (Tier 1b), settings and key bindings (these may use the engine's preferences store; they are not game progress).

### Architecture Diagram

```
 Simulation (plain C#)
     |  SaveModel (plain data)   ^ SaveModel
     v                           |
 Persistence service (host only) ---- migrations N -> N+1 (pure functions)
     |  serializer interface     ^
     v                           |
 save.json  <- replace <- save.tmp      backups: save.bak1 .. save.bak3
                                        save.v<N>.premigration (kept, outside rotation)

 Assemblies: Simulation holds SaveModel, SaveDocument, migrations, run hooks.
             Persistence holds the file store and serializer; Simulation does not reference it.
```

### Key Interfaces
Names are provisional until the first save story; the shapes are the contract.

- `SaveModel` — plain data, no engine types: `formatVersion`, `profileId`, `stash`, `gear`, `recipes`, `stats`, `runMarker`.
- `ISaveStore` — `Load()` returning a result (loaded, loaded-run-abandoned, loaded-from-backup, new, refused-newer-version, refused-locked, unreadable) and `Save(SaveModel)` returning success or failure. The host's Authority layer is its only caller.
- `SaveDocument` — the project's own neutral tree type (object, list, text, number, true/false, empty), defined in the Simulation assembly. Migrations and the save model's mapping work on this type, so no serializer library's type appears in any interface.
- `ISaveSerializer` — text to `SaveDocument` and back. One implementation in the Persistence assembly, chosen at the first save story. It needs a parsed tree and keyed collections; if that means adding a package, the technical director signs off on it.
- `ISaveMigration` — `FromVersion`, and `Apply(SaveDocument)` returning the next version's document.
- `ISaveFiles` — the small file-system surface the store uses (read, write temporary, replace, copy, delete, list), so store logic is tested with an in-memory fake.
- Run hooks on the Simulation — `BeginRun(carried)` and `EndRun(outcome)` for extraction and for death, which produce the model changes for the marker. Both outcomes are save points.

### Implementation Guidelines
- Save files **must** be written only on the host, by the persistence service, at the safe points listed above.
- Simulation code **must never** read or write files; it **must** exchange a `SaveModel` only.
- The save **must** carry `formatVersion`; any change to the format **must** add a migration and a test that loads a stored sample of the previous version.
- Content **must** be referenced in saves by stable string id; an id **must never** be reused for different content.
- The main save **must** be replaced through a temporary file in the same folder; code **must never** write the main file in place.
- A save with a newer version than the game **must never** be overwritten or migrated.
- Run state **must never** be saved; a found run marker **must** resolve as a loss of the carried items.
- Backups **must never** be offered as a way to undo a loss.
- Game progress **must never** be stored in the engine's preferences store.
- A stored sample save of every released format version **must** be kept under `StarHaul/Assets/Tests/`. Migration and store logic **must** be unit-tested against `SaveDocument` values and the in-memory `ISaveFiles` fake; tests that touch real files are integration tests.
- The Simulation assembly **must never** reference the Persistence assembly.
- A run **must never** begin until the run-marker write has succeeded.
- Death **must** be a save point that records the run and clears the marker; home writes **must** happen only after the marker is cleared.
- Making the new file the main file and the old one backup 1 **must** be a single operation; the main file **must never** be absent between steps.
- A client-only process **must never** open the save store; a second hosting process **must** be refused by the lock file.
- An existing pre-migration copy **must never** be overwritten.
- The game **must never** write a save on application quit.
- Saves **must** be written synchronously through a single writer.
- The pre-migration copy **must** sit outside the backup rotation and **must never** be deleted by the game.
- No serializer library type **may** appear in an interface; migrations work on `SaveDocument`.
- The source-generated serializer snippet in `docs/engine-reference/unity/current-best-practices.md` **must never** be used as save guidance: it is unsourced and about a different feature.
- The serializer and the save-folder API **must** be verified against Unity's documentation for the installed version, and recorded in the engine reference, before the first save story.

## Alternatives Considered

### Alternative 1: A binary save format
- **Description**: Serialize the save model to a compact binary file.
- **Pros**: Smaller; faster to read and write; harder for players to edit.
- **Cons**: Opaque during development; migrations are harder to write and to test; a corrupt file cannot be repaired by hand. Editing protection has little value in a game with no player-versus-player and no shared economy yet.
- **Rejection Reason**: The save is small, and readability matters more than size for one developer over a multi-year format.

### Alternative 2: The engine's preferences store for everything
- **Description**: Keep stash and progress as keys in the engine's per-user preferences.
- **Pros**: Nothing to build; no file handling.
- **Cons**: On Windows it is the registry: no atomic multi-key write, no backups, size limits, awkward to version, and unsuitable for a stash and a built home.
- **Rejection Reason**: It cannot meet the "never lost" requirement or carry a growing format.

### Alternative 3: Save continuously, including run state
- **Description**: Autosave during runs so a crash resumes where the player was.
- **Pros**: Kindest to crashes.
- **Cons**: Much more state to save and restore under a networked host; invites quitting to reroll danger; contradicts the designer's rule that leaving a run is a death.
- **Rejection Reason**: Against the chosen rule and far more work.

## Consequences

### Positive
- Loss is enforced by the save itself, not by trusting the game to stay running.
- A stash survives crashes mid-write and every future update.
- The save can be read, diffed and fixed in a text editor during development.
- Save logic is plain data plus pure functions, so it is cheap to test.

### Negative
- A genuine crash during a run costs the player their pack and tool. This will feel unfair when it happens and should be said plainly in the game.
- Every format change costs a migration and a stored sample, forever.
- A readable save is easy to edit. Accepted for now; revisit if a shared economy or leaderboards ever exist.
- Three backups triple the (small) disk use.

## Risks
- **The crash rule produces real anger if the game is unstable.** Mitigation: stability before content; the abandoned-run message names the rule; revisit only with playtest evidence.
- **A migration bug destroys saves.** Mitigation: the original is backed up before any migration writes; stored samples of every version are loaded in tests.
- **The serializer cannot handle a save type on this engine version.** Mitigation: Verification item 1 before the first save story; the serializer sits behind an interface.
- **Replace-in-one-step is not truly atomic on some file systems.** Mitigation: Verification item 3; backups cover the gap.
- **A player can dodge a loss by deleting the main save during a run**, because backup 1 is then the pre-run save. Accepted, in the same class as hand-editing a readable save: there is no player-versus-player and no shared economy. Revisit if either appears.
- **Cloud sync could restore an older file or sync the backups.** Not assessed; out of scope until a cloud-save decision.
- **Co-op needs per-player data the single profile did not anticipate.** Mitigation: the save carries a profile identity and stable ids from version 1, and the co-op persistence ADR is required before Tier 2a.

## GDD Requirements Addressed

| GDD System | Requirement | How This ADR Addresses It |
|------------|-------------|--------------------------|
| game-concept.md (MVP Definition, item 4) | "A home with a persistent stash and one crafting bench" | Stash, gear and recipes are in the save model, written after each change at home |
| game-concept.md (MVP Definition, item 5) | "versioned save data" | `formatVersion` plus numbered migrations from version 1 |
| game-concept.md (Technical Risks) | "Save migration: patches can break player-built homes. Version save data from the MVP onward." | Step-by-step migrations, stable string ids, stored samples of every version |
| game-concept.md (Flow State Design) | "death costs what was carried and nothing else. The stash and home are untouched" | Run marker: carried items are committed as at risk when the run starts; the stash is never touched by a run's failure |
| game-concept.md (Technical Risks) | "Persistence in co-op: whose home and stash it is... Decide before Tier 2a." | Deferred by design to its own ADR; profile identity and stable ids keep it open |

## Performance Implications
- **CPU**: One small document serialized at safe points only. Not measured; expected negligible.
- **Memory**: The save model is a copy of stash and progress data. Small.
- **Load Time**: One file read plus any migrations at start-up. Expected negligible.
- **Network**: None. Saves are host-local.

## Migration Plan
No existing Unity code or saves. The browser prototype's stored stash is not carried over.

## Validation Criteria
- Killing the game process at any moment never loses the stash.
- Killing it during a run loses the pack and tool, and the next start says so.
- A version-1 sample save still loads after the format has changed twice.
- Save and migration tests run in EditMode with no scene.

## Related
- ADR-0001: Network Model (Accepted) — this ADR depends on it
- `design/gdd/game-concept.md` — MVP Definition, Technical Risks, Flow State Design
- Future: co-op persistence ADR (before Tier 2a)
