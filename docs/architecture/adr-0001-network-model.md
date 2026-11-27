# ADR-0001: Network Model — Host-Authoritative Co-op, Solo as a One-Player Host

## Status
Accepted

## Date
2026-11-26

## Last Verified
2026-11-26

## Decision Makers
Designer (project owner); drafted with Claude. Reviews on 2026-11-26: unity-specialist (no blocking findings; notes incorporated), technical-director gate TD-ADR (CONCERNS; all five flagged items revised at the designer's direction, not re-run after revision).

## Summary
Star Haul commits to online co-op "designed in from the first real build" while the MVP ships solo, so the way game state is owned and changed must be fixed before any gameplay code exists. This ADR decides that every build runs as a host-authoritative session on Unity's Netcode for GameObjects, that solo play is a real host with one player, and that game rules live in plain C# kept apart from both networking and presentation.

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Unity 6.3 LTS (editor 6000.3.29f1) |
| **Domain** | Networking |
| **Layer** | Foundation |
| **Knowledge Risk** | HIGH — Unity 6.3 LTS is after the LLM knowledge cutoff (VERSION.md) |
| **References Consulted** | `docs/engine-reference/unity/VERSION.md`, `modules/networking.md`, `PLUGINS.md`, `current-best-practices.md`, `deprecated-apis.md`, `breaking-changes.md` |
| **Post-Cutoff APIs Used** | Netcode for GameObjects (`com.unity.netcode.gameobjects`). Read on 2026-11-26 from Unity's manual for package 3.2.1 (https://docs.unity3d.com/Packages/com.unity.netcode.gameobjects@3.2/manual/): supports Unity 6.0 and later; RPCs are declared with `[Rpc(SendTo.Server)]` and an `Rpc` method-name suffix (the project reference shows only the older `[ServerRpc]`/`[ClientRpc]`); `SinglePlayerTransport` runs a single-player session as a host; `NetworkTransform` has a server (default) or owner authority mode in client-server topology. The version that actually resolves in this project is NOT ASSESSED: no Unity project exists yet. |
| **Verification Required** | (1) A solo host on `SinglePlayerTransport` opens no socket, shows no firewall prompt and adds no perceptible start-up time. (2) Two local players can join one host using Multiplayer Play Mode (documented: up to four on one device). (3) Artificial latency and packet loss can be applied with the Network Simulator tooling; which package provides it for the resolved version is not yet confirmed. (4) The resolved Netcode version and its assembly name are recorded in `docs/engine-reference/unity/modules/networking.md` before the control manifest mandates any API. (5) A session can be stopped and started again in Play Mode without a domain reload. |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | None |
| **Enables** | A later transport and session ADR (Steam networking or relay, lobbies, joining) before Tier 2a; a persistence ADR (save format, versioning, whose stash it is in co-op) before the home and stash are built |
| **Blocks** | All MVP gameplay code: mining, pack, oxygen, creatures, hunters, extraction, stash, crafting |
| **Ordering Note** | Must be Accepted before the first gameplay story. The persistence ADR is on the MVP critical path (stash and versioned saves are MVP item 5): it must be Accepted before any stash or save story, not merely before the home is built. |

## Context

### Problem Statement
The concept (`design/gdd/game-concept.md`, Technical Risks) records a decision already taken: "Co-op cannot be bolted on later... build for it from day one. All inventory, stash, crafting and world changes go through host-side checks even in solo play, with game state kept apart from presentation. A short ADR on the network model comes before any MVP code." The MVP definition adds: "Solo play running as a host with one player, with versioned save data", and "Co-op play itself" is explicitly not in the MVP (it is Tier 2a).

So the question is not whether to plan for co-op, but what concretely exists in the first build: which library, who owns which state, and what rules keep a solo-only MVP from quietly growing code that cannot be networked.

### Constraints
- One developer, first first-person 3D game; hobby project. Complexity that does not pay for itself in the MVP is a real risk to finishing it.
- Players versus AI only; no player-versus-player (anti-pillar). Cheat resistance between players is not a goal; host-side checks exist for correctness and to prevent loot duplication, not for anti-cheat.
- Engine pinned to Unity 6.3 LTS, C#, URP. The engine reference for networking is thin and dated 2026-02-13.
- Project coding standards: public methods unit-testable, dependency injection over singletons, gameplay values data-driven.
- Platform: Windows desktop; Steam is the intended store but no store or transport decision is made here.

### Requirements
- Solo play must work offline, start as fast as a non-networked game, and never show a network error.
- Every change to pack, stash, crafting and world state must pass through one host-side path.
- AI perception and decisions run in one place only (concept: "guard perception runs on the host only").
- Rules must be testable without a running network session.
- Adding a second player at Tier 2a must not require rewriting the mining game.

## Decision

Every Star Haul build runs a **host-authoritative session on Netcode for GameObjects**. Solo play starts a host with exactly one player. The code is split into three layers with one-way dependencies.

1. **Simulation (plain C#).** The rules: pack capacity and worth, oxygen drain, mining progress, ore yield, creature and hunter decisions, damage, extraction, stash, crafting. No dependency on the Netcode package and none on scene objects beyond data passed in. Unit-tested directly. Tuning values come from data assets, not constants. Where a rule needs a fact about the physical world (can this creature see the player, did it hear the drill, how far is the path, what did the drill ray hit), it asks through a world-query interface it owns; it never calls physics or navigation itself.
2. **Authority (networked components).** Thin components that receive a player's request, ask the Simulation whether it is allowed, apply the result, and publish the resulting state as replicated state. They hold no rules of their own. The components exist on every peer so clients can read the replicated state; every write is gated to the host. On the host this layer also implements the world-query interface with Unity physics and navigation and passes it into the Simulation: it answers questions of fact, and the Simulation decides what the answer means.
3. **Presentation (every client, including the host's own).** Views, audio, VFX, HUD and input. Reads replicated state and raises requests. Never changes game state directly.

Ownership of state:

| State | Authority | Why |
|---|---|---|
| Pack contents, worth, tool, oxygen, health | Host | Loss-on-death and loot rules must have one truth |
| Ore seams, rock damage stages, dropped ore | Host | World changes must match for everyone |
| Creatures and hunters (perception, movement, attacks) | Host | Concept: AI runs on the host only |
| Run clock, hunter escalation, extraction | Host | One clock decides the worsening hazard |
| Stash and crafting | Host | Prevents duplication; persistence follows the host's save |
| Player movement and look | Owning client | No player-versus-player, so trust is acceptable and movement stays responsive without prediction code. This is a deliberate deviation from the project reference, which recommends server-authoritative movement; it uses the documented owner authority mode. Consequence accepted: the host trusts the position a client reports when it checks range for pickup, mining and extraction. Revisit before networked melee (Tier 3) |

Solo sessions use the package's `SinglePlayerTransport`, assigned before the host starts; multiplayer sessions assign the real transport instead. The rest of the code cannot tell which is in use.

Deferred to the first gameplay story, because they need the package in hand: whether each ore seam is its own networked object or seams are one replicated collection (this decides what a late joiner sees), how the home-to-run scene change is driven under a host, and whether the Simulation is ticked from the host's frame update, fixed update or the network tick. The seam and scene answers shape `ISessionHost` and spawn order, so they **must** be recorded as an amendment to this ADR, not only in story notes.

Out of scope here, each needing its own ADR before the tier that uses it: transport beyond the default (Steam networking, relay), lobbies and joining, crew size, whose home and stash it is when guests join, save format and versioning, lag compensation for melee.

### Architecture Diagram

```
 Input / HUD / Views / Audio / VFX          (Presentation — every client)
        | requests            ^ replicated state
        v                     |
 Networked authority components             (Authority — on every peer;
        | "may I? / apply"    ^ result        writes on the host only)
        | world facts on request (physics, navigation — host only)
        v                     |
 Rules: pack, oxygen, mining, AI, stash     (Simulation — plain C#, no Netcode)
        ^
        | tuning values, passed in by the Authority layer
 Data assets (config)
```

Solo: one process is host and its own only client. Co-op (Tier 2a): the same host, plus remote clients running Presentation only.

### Key Interfaces
Names are provisional until the first story; the shapes are the contract.

- `IRunSimulation` — plain C# entry point the Authority layer calls: `TryMine(playerId, seamId, dt)`, `TryPickUp(playerId, itemId)`, `Tick(dt)`, each returning a result value that says what changed or why it was refused. `playerId` is a Simulation-owned identity type, not the network client id, because persistence will need identity that outlives a connection.
- `IWorldQuery` — owned by the Simulation, implemented by the Authority layer on the host: `HasLineOfSight(from, to)`, `HeardNoise(listener, source, loudness)`, `PathDistance(from, to)`, `DrillHit(origin, direction, range)`. Returns facts only. Tests supply a fake.
- `ISessionHost` — the only way game code starts or stops a session: `StartSolo()`, later `StartHosted()` / `Join()`. Wraps the Netcode manager so nothing else touches its singleton, and chooses the transport.
- Request path — a client-to-host call per player intent (mine, pick up, extract, craft). The host validates through `IRunSimulation` and never trusts a client-supplied result.
- State path — replicated values or host-to-client events for everything Presentation shows (pack worth, oxygen, seam stage, creature state).

### Implementation Guidelines
- Game state **must** change only on the host, through the Authority layer calling the Simulation.
- Presentation code **must never** write game state, and **must never** contain a rule (a threshold, a cost, a yield).
- Simulation code **must never** reference the Netcode package, `MonoBehaviour` lifecycle, or scene singletons; it **must** be constructible in an EditMode test.
- The Simulation **must** live in its own assembly definition with no reference to the Netcode assembly, so a forbidden reference fails to compile.
- The Simulation **must** receive tuning as plain config values passed in; it **must never** read a ScriptableObject or other asset itself. The Authority layer loads the data assets and hands the values over.
- Tests **must** sit under `StarHaul/Assets/Tests/EditMode/` (or `PlayMode/`) with their own assembly definition; anywhere else they are not compiled and report "0 tests, Passed".
- Every networked object **must** have its network component on the prefab root and be registered with the session's prefab list.
- New RPCs **must** use the `[Rpc(...)]` attribute form. Code samples in `docs/engine-reference/unity/modules/networking.md` **must never** be copied as they stand: they use the older RPC attributes and the deprecated legacy input API.
- Solo play **must** go through `ISessionHost.StartSolo()` and the same request path as co-op; there **must never** be a separate "offline" code path for a rule.
- Code **must never** access the Netcode manager's singleton outside the `ISessionHost` implementation.
- AI perception and decisions **must** run on the host only.
- Physics and navigation queries that feed a rule **must** go through `IWorldQuery`; the Authority layer **must never** turn a query result into a decision itself.
- The two-instance smoke test uses the package's real default transport, not `SinglePlayerTransport`, so a firewall prompt is expected there.
- UNet **must never** be used (deprecated per engine reference).
- Every tuning value **must** come from a data asset.
- Before the first networked story, the installed Netcode version's API **must** be checked against Unity's documentation for that version and recorded in `docs/engine-reference/unity/modules/networking.md`.

## Alternatives Considered

### Alternative 1: Authority seam only, no netcode package in the MVP
- **Description**: Build the same Simulation and request path in plain C#, with a local in-process "host" object, and choose a networking library at Tier 2a.
- **Pros**: Least to learn now; no package risk on a post-cutoff engine version; faster first playable; the library choice is made with more knowledge.
- **Cons**: "Solo as a host with one player" is never actually exercised, so assumptions that only break under a real session (spawn order, ownership, replicated-state timing, what a late joiner sees) stay hidden until Tier 2a, when the game is much larger. Presentation code tends to grow direct references to local objects that later have to be replaced by replicated state.
- **Rejection Reason**: The concept's own risk statement is that co-op cannot be bolted on later; a seam that has never carried a real session is the bolt-on risk in a smaller form. It remains the fallback if the Netcode package proves unworkable on 6000.3.

### Alternative 2: A third-party stack (Mirror or Photon)
- **Description**: Use a community or commercial networking library instead of Unity's own.
- **Pros**: Mature, widely used; some offer hosted relay out of the box.
- **Cons**: Not covered by the project's engine reference beyond a one-line mention; another vendor and licence to track; Photon's model is service-centred, which pulls against "fully playable solo, offline".
- **Rejection Reason**: No requirement here that the official package fails to meet, and the project's reference material and specialist agents are built around Unity's own stack.

### Alternative 3: Dedicated server
- **Description**: A separate server process owns the session; all players are clients.
- **Pros**: Cleanest authority; no host advantage.
- **Cons**: Hosting cost and operations for a hobby project; solo play would need a local server process.
- **Rejection Reason**: The concept specifies host-authoritative crews; nothing in a players-versus-AI game needs more.

## Consequences

### Positive
- The MVP proves "solo as a host" on day one instead of promising it.
- Rules are testable without a scene or a session, which fits the project's test standards.
- Tier 2a becomes "let a second client join" plus transport and persistence decisions, not a rewrite.
- One place for each rule: no divergence between an offline and an online path.

### Negative
- Every mechanic costs more to build: a request, a host check and replicated state, where a solo game would set a field.
- The developer must learn a networking package on a post-cutoff engine version while also learning first-person 3D.
- Iteration is slower: a session must start before anything runs, and some bugs appear only with two instances.
- Owner-authoritative movement is a known shortcut that will need revisiting for melee.

## Risks
- **The Netcode package version for 6000.3 differs from the reference notes.** Mitigation: verify the API against Unity's docs before the first networked story and update the engine reference; the Simulation layer has no exposure to it.
- **Solo-as-host has a visible cost (firewall prompt, start-up delay).** Mitigation: `SinglePlayerTransport` for solo sessions, checked by Verification item 1; if it cannot be made invisible, fall back to Alternative 1's in-process host behind `ISessionHost` without touching the other layers. Note the editor on the development machine was installed without admin rights and has no firewall rule, so a prompt during multiplayer testing is expected.
- **The session wrapper holds static state across Play Mode runs.** Mitigation: Verification item 5.
- **The three-layer discipline erodes under time pressure.** Mitigation: the control manifest states the must / must never rules; code review checks them; Simulation lives in its own assembly so a forbidden reference fails to compile.
- **Co-op is never tested because the MVP is solo.** Mitigation: a two-instance smoke test on one machine becomes part of the MVP's definition of done, even though co-op is not a shipped feature.
- **Scope: this may cost the MVP weeks.** Mitigation: the fallback above; reassess after the first mechanic (mining into the pack) is built end to end.

## GDD Requirements Addressed

| GDD System | Requirement | How This ADR Addresses It |
|------------|-------------|--------------------------|
| game-concept.md (Technical Risks) | "All inventory, stash, crafting and world changes go through host-side checks even in solo play, with game state kept apart from presentation." | Authority layer is the only writer; Simulation and Presentation are separate layers |
| game-concept.md (MVP Definition, item 5) | "Solo play running as a host with one player" | `ISessionHost.StartSolo()` starts a real one-player host; no offline rule path |
| game-concept.md (Technical Considerations) | "Host-authoritative co-op. Solo play runs as a host with one player, from the first build." | Host-authoritative session on Netcode for GameObjects from the first build |
| game-concept.md (Technical Risks) | "AI under netcode: guard perception runs on the host only." | AI perception and decisions are host-owned state |
| game-concept.md (Technical Risks) | "Testing multiplayer alone: needs multiple local instances and a latency simulator early." | Verification items 2 and 3; two-instance smoke test in the MVP's definition of done |

Not addressed here, by design: versioned save data and co-op persistence (separate ADR), networked melee (Tier 3).

## Performance Implications
- **CPU**: One extra hop per player action and per-tick replication for a handful of objects; expected to be negligible at MVP scale. Not measured.
- **Memory**: The package plus replicated-state bookkeeping; expected small. Not measured.
- **Load Time**: Session start added to entering a run. Must be imperceptible in solo (Verification item 1).
- **Network**: None in solo. Co-op bandwidth is out of scope until Tier 2a.

## Migration Plan
No existing Unity code. The browser prototype in `prototypes/star-haul/` is a reference for behaviour and tuning numbers only; none of its code carries over.

## Validation Criteria
- The first mechanic (mine a seam, ore enters the pack, worth updates) works in solo through the request path, with its rules covered by EditMode tests that create no scene and no session.
- A second local instance can join and sees the same seam stages and creature positions.
- A solo player cannot tell a session was started.
- No file under the Simulation assembly references the Netcode package.

## Related
- `design/gdd/game-concept.md` — Technical Considerations, Risks, MVP Definition
- `design/game-brief.md` — the first playable loop
- `docs/engine-reference/unity/modules/networking.md`
- Future: transport and session ADR; persistence ADR
