# Systems Index: Star Haul

> **Status**: Draft
> **Created**: 2026-11-26
> **Last Updated**: 2026-11-27 (reworked for the designer's pivot: the home is a buildable valley, built first)
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

Star Haul's first game has two halves that feed each other: a home the player
builds and defends, and runs out to an asteroid for what the home cannot provide.
The designer chose to build the home first.

**The ground everything stands on.** *Game Data & Tuning* holds every number and
every item, piece and recipe definition as data. *Session & Authority* is the
one-player host that every state change passes through (ADR-0001). *Input* maps
keys to actions. *Save & Load* is the versioned save (ADR-0002), which must now
also hold everything the player has built.

**The valley home (Milestone A).** *Home Valley* is the place: a small valley on
a planet, with its terrain, its buildable ground, and the only things found
there, rocks and sticks. *Gathering* picks those up into the *Pack*. *Building*
lets the player snap together foundations, walls, floors, ceilings, roofs,
stairs, workbenches and furniture; it tracks each piece's condition, repairs it
with the hammer from *Tools & Gear*, and answers the question the rest of the
home depends on: is this under a roof? *Stash* is a storage piece the player
places. *Crafting* happens at workbenches the player builds. *Storms* arrive
every 50 to 70 minutes of play, always forecast: a rock-and-stick shelter falls
after two storms if it is not repaired, and a stash or furniture that is not
under a roof loses out (Pillar 2: the danger is readable; Pillar 5: the home is
the scoreboard, and now it can be lost). One repair action with the hammer
fixes the whole home. Materials brought back from runs build stronger pieces
that need little or no repair, which is how the haul pays into the home. *Ore & Item Economy* defines the
materials and what an item container is. *Home HUD & Panels* shows the build
menu, the forecast, and the stash and crafting panels.

**The asteroid run (Milestone B).** *Asteroid World* is the hand-made map.
*Mining* turns a seam into ore; *Oxygen*, *Health & Damage*, *Creature AI* and
*Hunter Escalation* supply the pressure; *Perception* owns noise and sight;
*Run Flow* starts a run, keeps its clock and ends it by extraction or death,
which is where "whatever you carry is lost" is enforced (Pillar 3). The storm
clock keeps running during a run and the *Run HUD* warns when one is on the way,
so "one more seam" (Pillar 1) competes with getting home to repair the roof.

**How they relate.** *Building* is the main bottleneck: Stash, Crafting, Storms,
the home HUD and saving all read its piece model, so it is the most expensive
system to get wrong. *Game Data & Tuning* and *Ore & Item Economy* are read by
almost everything. *Run Flow* is the opposite shape, a coordinator that depends
on many systems and is designed late. Two near-cycles were found and removed by
contracts (see Circular Dependencies).

Systems marked "(inferred)" are not named in the concept or the brief; the game
cannot work without them.

---

## Systems Enumeration

Numbers are the recommended design order. Systems 1 to 15 are Milestone A (the
valley home); 16 to 24 are Milestone B (the asteroid run).

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Game Data & Tuning (inferred) | Core | MVP | Not Started | — | — |
| 2 | Session & Authority | Core | MVP | Not Started | — | — |
| 3 | Input (inferred) | Core | MVP | Not Started | — | — |
| 4 | Ore & Item Economy (inferred) | Economy | MVP | Not Started | — | Game Data & Tuning |
| 5 | Home Valley | Gameplay | MVP | Not Started | — | Game Data & Tuning |
| 6 | Player Controller (inferred) | Gameplay | MVP | Not Started | — | Session & Authority, Game Data & Tuning, Input |
| 7 | Save & Load | Persistence | MVP | Not Started | — | Session & Authority, Game Data & Tuning |
| 8 | Pack | Gameplay | MVP | Not Started | — | Session & Authority, Ore & Item Economy |
| 9 | Tools & Gear | Progression | MVP | Not Started | — | Game Data & Tuning, Ore & Item Economy |
| 10 | Gathering | Gameplay | MVP | Not Started | — | Player Controller, Home Valley, Pack, Ore & Item Economy |
| 11 | Building | Progression | MVP | Not Started | — | Player Controller, Home Valley, Tools & Gear, Ore & Item Economy, Save & Load |
| 12 | Stash | Economy | MVP | Not Started | — | Building, Save & Load, Pack, Ore & Item Economy |
| 13 | Crafting | Progression | MVP | Not Started | — | Building, Stash, Tools & Gear, Ore & Item Economy |
| 14 | Storms | Gameplay | MVP | Not Started | — | Building, Stash, Home Valley, Save & Load, Run Flow |
| 15 | Home HUD & Panels (inferred) | UI | MVP | Not Started | — | Building, Storms, Stash, Crafting, Gathering, Run Flow |
| 16 | Asteroid World | Gameplay | MVP | Not Started | — | Game Data & Tuning |
| 17 | Health & Damage (inferred) | Gameplay | MVP | Not Started | — | Session & Authority, Game Data & Tuning |
| 18 | Perception (inferred) | Gameplay | MVP | Not Started | — | Game Data & Tuning, Asteroid World |
| 19 | Oxygen | Gameplay | MVP | Not Started | — | Player Controller, Health & Damage |
| 20 | Creature AI | Gameplay | MVP | Not Started | — | Player Controller, Health & Damage, Asteroid World, Perception |
| 21 | Mining | Gameplay | MVP | Not Started | — | Player Controller, Pack, Tools & Gear, Asteroid World, Ore & Item Economy, Perception |
| 22 | Run Flow | Core | MVP | Not Started | — | Save & Load, Health & Damage, Asteroid World, Pack, Tools & Gear, Stash |
| 23 | Hunter Escalation | Gameplay | MVP | Not Started | — | Creature AI, Run Flow |
| 24 | Run HUD | UI | MVP | Not Started | — | Pack, Oxygen, Mining, Health & Damage, Run Flow, Storms |
| 25 | Visual Feedback & Lighting (inferred) | UI | Vertical Slice | Not Started | — | Pack, Creature AI, Hunter Escalation, Asteroid World, Home Valley, Storms, Run Flow |
| 26 | Audio | Audio | Vertical Slice | Not Started | — | Mining, Creature AI, Oxygen, Perception, Hunter Escalation, Storms, Run Flow |
| 27 | Menus & Settings (inferred) | UI | Vertical Slice | Not Started | — | Input, Save & Load |
| 28 | First-Run Guidance (inferred) | Meta | Vertical Slice | Not Started | — | Gathering, Building, Storms, Run Flow, Mining, Run HUD, Oxygen |
| 29 | Accessibility & Options (inferred) | Meta | Alpha | Not Started | — | Run HUD, Home HUD & Panels, Menus & Settings, Input |
| 30 | Ship & Destination Map | Progression | Alpha | Not Started | — | Run Flow, Tools & Gear |
| 31 | Farming | Progression | Alpha | Not Started | — | Building, Stash, Save & Load |
| 32 | Co-op Sessions | Core | Full Vision | Not Started | — | Session & Authority, Save & Load |
| 33 | Stealth & Guard AI | Gameplay | Full Vision | Not Started | — | Perception, Creature AI, Run Flow |
| 34 | Melee Combat & Bosses | Gameplay | Full Vision | Not Started | — | Health & Damage, Creature AI, Tools & Gear |
| 35 | Market & Trading | Economy | Full Vision | Not Started | — | Ore & Item Economy, Stash |

---

## Categories

| Category | Description | Typical Systems |
|----------|-------------|-----------------|
| **Core** | Foundation systems everything depends on | Player controller, input, physics, camera, scene management, state machine |
| **Gameplay** | The systems that make the game fun | Combat, AI, stealth, movement abilities, interaction |
| **Progression** | How the player grows over time | XP/leveling, skill trees, unlocks, achievements, reputation |
| **Economy** | Resource creation and consumption | Currency, loot, crafting, shops, item database, drop tables |
| **Persistence** | Save state and continuity | Save/load, settings, cloud sync, profile management |
| **UI** | Player-facing information displays | HUD, menus, inventory screen, dialogue UI, map, notifications |
| **Audio** | Sound and music systems | Music manager, SFX bus, ambient audio, adaptive music, voice |
| **Meta** | Systems outside the core game loop | Analytics, tutorials/onboarding, accessibility options, photo mode |

Narrative is not used: the concept has no story campaign (anti-pillar).

---

## Priority Tiers

| Tier | Definition | Target Milestone | Design Urgency |
|------|------------|------------------|----------------|
| **MVP** | Required for the core loop to function. Without these, you can't test "is this fun?" | First playable prototype | Design FIRST |
| **Vertical Slice** | Required for one complete, polished area. Demonstrates the full experience. | Vertical slice / demo | Design SECOND |
| **Alpha** | All features present in rough form. Complete mechanical scope, placeholder content OK. | Alpha milestone | Design THIRD |
| **Full Vision** | Polish, edge cases, nice-to-haves, and content-complete features. | Beta / Release | Design as needed |

**The MVP is built as two playable milestones** (designer's decision,
2026-11-27):

- **Milestone A, the valley home** (systems 1 to 15): gather rocks and sticks,
  build, set up workbenches, craft a hammer and a basic drill, and keep the home
  standing through storms.
- **Milestone B, the asteroid run** (systems 16 to 24): the mining run, with the
  storm clock still running at home.

> **Producer Note (PR-SCOPE, 2026-11-27): UNREALISTIC.** The producer sized the
> 24-system MVP as one milestone at **14 to 20 months** solo, low confidence (no
> velocity data, a first 3D game, the persistence ADR unwritten, the tension
> half of the hypothesis unproven). Its recommendation was to split the MVP with
> the **asteroid run first** (10 to 15 months in total), because "the valley
> home should not be built on top of an unproven run". **The designer chose to
> split it with the valley home first. That order was not sized by the
> producer.** Its nearest figure, 5 to 8 months for the valley half, assumed the
> foundation systems were already built; valley-first also carries them.
>
> **Risk accepted by the designer:** the run's tension, the unproven half of the
> core hypothesis, is not tested in Unity until Milestone B. It can still be
> tested cheaply now in the browser prototype (full runs, then tuning
> `config.js`); see `prototypes/star-haul/REPORT.md`.
>
> Other options the producer gave, not taken: one lean MVP of about 15 systems
> (8 to 11 months, nothing playable until the end); running the MVP at
> `workflow: standard` to save 1 to 2 months of documents (the designer kept
> `full`).

> **Creative Director Note** (MVP; CD-SYSTEMS 2026-11-26, on the previous
> version of this index): minimum danger feedback is part of the MVP. The loop
> cannot be judged if danger cannot be read (Pillar 2). These are acceptance
> conditions on existing design docs, not a new system:
> - **Pack**: the pack glows brighter as it fills.
> - **Creature AI**: creatures carry the magenta tell; a sound plays when a
>   creature notices the player.
> - **Hunter Escalation**: a warning sound when a hunter tier rises.
> - **Oxygen**: the gauge turns magenta and a warning sound plays when low.
> - **Run HUD**: a cue when the pack is full.
> - **Storms** (added with the pivot): the forecast and the on-the-way
>   notification are readable at home and during a run.
>
> **Creative Director Note** (anti-pillars, to be stated in the design docs):
> nothing at home decays by itself and nothing comes due; storms are the one
> threat, always forecast. No timers force a run. Farming (Alpha): crops never
> die.
>
> **Creative Director Note** (MVP; CD-SYSTEMS 2026-11-27, on this reworked
> index: CONCERNS, revised with the designer's decisions below, not re-run).
> "The system breakdown itself holds up"; the concerns were what Milestone A
> delivers and how storms are tuned.
>
> - **Milestone A is not evidence that the game works.** It is a
>   gather-build-and-survive game with no runs: no haul, no stake the player
>   chooses, no way to get rich (Pillar 1 lives entirely in Milestone B). Its
>   exit criteria must not be read as a test of the core hypothesis.
> - **The haul must pay into the home (designer: yes).** Rock-and-stick pieces
>   are the starter tier and fall after 2 unrepaired storms. Pieces made with
>   materials from runs are stronger and need little or no repair. **Building**
>   owns the tiers and which materials each needs; **Ore & Item Economy** owns
>   the materials. This is an MVP requirement, landing in Milestone B when runs
>   exist; Milestone A's Building design doc must leave room for it.
> - **Repair must not be a chore (designer: one action repairs the whole
>   home).** A single repair action with the hammer, at a material cost, fixes
>   everything damaged. Without this and the stronger tiers, repair every one or
>   two storms "is busywork upkeep by any reading" and breaks the rewritten
>   anti-pillar.
> - **Storm rules (designer: all three), acceptance conditions on Storms, Home
>   HUD & Panels and Run HUD:** the storm's strength is always shown; the
>   forecast is visible before the player launches a run; a run of normal length
>   cannot destroy a home that was ready at launch. Without them a storm during
>   a run becomes a timer that forces the run to end.
> - **The stay-home path arrives with Farming (Alpha), not in the first game
>   (designer's decision).** In the MVP a player who never leaves can keep a
>   basic home standing but cannot progress. The design docs must not claim
>   otherwise.
> - Still open: how strong storms are and whether strength varies.
>
> Not assessed by the creative director: Milestone A's schedule (no estimate
> exists for the valley-first order).

---

## Dependency Map

### Foundation Layer (no dependencies)

1. Game Data & Tuning — every other system reads its values; gameplay values must be data, not code.
2. Session & Authority — the one-player host all state changes pass through (ADR-0001).
3. Input — actions the player controller and menus are built on.

### Core Layer (depends on foundation)

1. Ore & Item Economy — depends on: Game Data & Tuning
2. Home Valley — depends on: Game Data & Tuning
3. Asteroid World — depends on: Game Data & Tuning
4. Player Controller — depends on: Session & Authority, Game Data & Tuning, Input
5. Health & Damage — depends on: Session & Authority, Game Data & Tuning
6. Perception — depends on: Game Data & Tuning, Asteroid World
7. Save & Load — depends on: Session & Authority, Game Data & Tuning

### Feature Layer (depends on core)

1. Pack — depends on: Session & Authority, Ore & Item Economy
2. Tools & Gear — depends on: Game Data & Tuning, Ore & Item Economy
3. Gathering — depends on: Player Controller, Home Valley, Pack, Ore & Item Economy
4. Building — depends on: Player Controller, Home Valley, Tools & Gear, Ore & Item Economy, Save & Load
5. Stash — depends on: Building, Save & Load, Pack, Ore & Item Economy
6. Crafting — depends on: Building, Stash, Tools & Gear, Ore & Item Economy
7. Oxygen — depends on: Player Controller, Health & Damage
8. Creature AI — depends on: Player Controller, Health & Damage, Asteroid World, Perception
9. Mining — depends on: Player Controller, Pack, Tools & Gear, Asteroid World, Ore & Item Economy, Perception
10. Run Flow — depends on: Save & Load, Health & Damage, Asteroid World, Pack, Tools & Gear, Stash
11. Storms — depends on: Building, Stash, Home Valley, Save & Load, Run Flow
12. Hunter Escalation — depends on: Creature AI, Run Flow

### Presentation Layer (depends on features)

1. Home HUD & Panels — depends on: Building, Storms, Stash, Crafting, Gathering, Run Flow
2. Run HUD — depends on: Pack, Oxygen, Mining, Health & Damage, Run Flow, Storms
3. Visual Feedback & Lighting — depends on: Pack, Creature AI, Hunter Escalation, Asteroid World, Home Valley, Storms, Run Flow
4. Audio — depends on: Mining, Creature AI, Oxygen, Perception, Hunter Escalation, Storms, Run Flow
5. Menus & Settings — depends on: Input, Save & Load

### Polish Layer (depends on everything)

1. First-Run Guidance — depends on: Gathering, Building, Storms, Run Flow, Mining, Run HUD, Oxygen
2. Accessibility & Options — depends on: Run HUD, Home HUD & Panels, Menus & Settings, Input

### Later tiers

1. Ship & Destination Map — depends on: Run Flow, Tools & Gear
2. Farming — depends on: Building, Stash, Save & Load
3. Co-op Sessions — depends on: Session & Authority, Save & Load. **Blocked** on a future ADR covering guests' progress and whose home and stash it is.
4. Stealth & Guard AI — depends on: Perception, Creature AI, Run Flow
5. Melee Combat & Bosses — depends on: Health & Damage, Creature AI, Tools & Gear
6. Market & Trading — depends on: Ore & Item Economy, Stash

**Milestone A note.** Storms and Home HUD & Panels list Run Flow, which is a
Milestone B system. In Milestone A there are no runs, so their design docs must
work with no run in progress and state what changes when Run Flow exists.

### Technical Director Notes (TD-SYSTEM-BOUNDARY)

**2026-11-27, on the valley-home map: CONCERNS.** "The boundaries hold up and
nothing needs restructuring"; no cycle found. Conditions:

- **A new ADR on home and storm persistence is required before the Building,
  Stash, Storms and Save & Load design docs can be finished.** ADR-0002 put the
  layout of a player-built home out of scope, saves only at safe points, and
  writes the whole file synchronously, which "will stutter once a home has
  hundreds of pieces". The ADR must cover: saving built pieces and their
  condition; building, repairing and gathering as save points; applying storms
  that passed during a run in one step when the run ends; the crash case.
- **Designer's decisions for that ADR (2026-11-27):** pieces snap to each other;
  the storm clock counts only time spent playing, never while the game is
  closed; an abandoned run (quit or crash) counts the time actually played, so
  the save must note the time as a run goes; what the player carries at home is
  kept, so "the pack is never saved" becomes "the pack is not saved during a run".
- **The roof check is worked out from the piece model, not from physics.** The
  home scene is not loaded during a run, and a physics check would need a scene
  in tests. This is why pieces snap.
- **Home and storm clock live in session-level Simulation state,** never in
  scene objects; the home is rebuilt from the model when its scene loads. Pieces
  are sent as data, not as one networked object each.
- **Building owns its piece list and costs** (data through Game Data & Tuning);
  Ore & Item Economy owns only the materials and the item-container contract.
- **Storms only listens for Run Flow's end-of-run event.** Run Flow must never
  call Storms. Storms decides how much damage; Building only applies it, through
  a narrow interface.
- **Building is not split yet.** If its design doc outgrows its size, condition
  and repair become a separate Structure Integrity system.
- Not assessed: a performance budget for the number of pieces in a home; none
  exists.

**2026-11-26, still in force for the run systems:**

- Perception was split out of Creature AI. Mining and Player Controller send
  noise events to Perception.
- Rules never depend on Session & Authority; where a system lists it, that means
  its networked (Authority) part only (ADR-0001's assembly rule). Game Data &
  Tuning has the same split.
- `IWorldQuery` has no single owner; each Simulation system defines its own part.
- The run-marker hooks belong to Run Flow; Save & Load must never depend on Run
  Flow.
- One death path: Oxygen kills by dealing damage through Health & Damage. The
  Oxygen design doc must commit to that.
- Run Flow stays a state machine. Zone layout belongs to Asteroid World; moving
  the haul into a stash belongs to Stash.

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Game Data & Tuning | MVP | Foundation | systems-designer, lead-programmer | M |
| 2 | Session & Authority | MVP | Foundation | network-programmer, technical-director | L |
| 3 | Input | MVP | Foundation | ux-designer, gameplay-programmer | S |
| 4 | Ore & Item Economy | MVP | Core | economy-designer | M |
| 5 | Home Valley | MVP | Core | level-designer, art-director | L |
| 6 | Player Controller | MVP | Core | game-designer, gameplay-programmer | M |
| 7 | Save & Load | MVP | Core | lead-programmer | L |
| 8 | Pack | MVP | Feature | game-designer | S |
| 9 | Tools & Gear | MVP | Feature | systems-designer | S |
| 10 | Gathering | MVP | Feature | game-designer | S |
| 11 | Building | MVP | Feature | game-designer, gameplay-programmer, systems-designer | L |
| 12 | Stash | MVP | Feature | economy-designer | M |
| 13 | Crafting | MVP | Feature | economy-designer, systems-designer | S |
| 14 | Storms | MVP | Feature | game-designer, systems-designer | M |
| 15 | Home HUD & Panels | MVP | Presentation | ux-designer, ui-programmer | M |
| 16 | Asteroid World | MVP | Core | level-designer, art-director | L |
| 17 | Health & Damage | MVP | Core | systems-designer | S |
| 18 | Perception | MVP | Core | ai-programmer, game-designer | M |
| 19 | Oxygen | MVP | Feature | systems-designer | S |
| 20 | Creature AI | MVP | Feature | ai-programmer, game-designer | L |
| 21 | Mining | MVP | Feature | game-designer, gameplay-programmer | M |
| 22 | Run Flow | MVP | Feature | game-designer, lead-programmer | M |
| 23 | Hunter Escalation | MVP | Feature | ai-programmer, systems-designer | M |
| 24 | Run HUD | MVP | Presentation | ux-designer, ui-programmer | S |
| 25 | Visual Feedback & Lighting | Vertical Slice | Presentation | art-director, technical-artist | M |
| 26 | Audio | Vertical Slice | Presentation | audio-director, sound-designer | M |
| 27 | Menus & Settings | Vertical Slice | Presentation | ux-designer, ui-programmer | S |
| 28 | First-Run Guidance | Vertical Slice | Polish | ux-designer, game-designer | S |
| 29 | Accessibility & Options | Alpha | Polish | accessibility-specialist | S |
| 30 | Ship & Destination Map | Alpha | Feature | game-designer | L |
| 31 | Farming | Alpha | Feature | game-designer, systems-designer | M |
| 32 | Co-op Sessions | Full Vision | Feature | network-programmer | L |
| 33 | Stealth & Guard AI | Full Vision | Feature | ai-programmer, level-designer | L |
| 34 | Melee Combat & Bosses | Full Vision | Feature | game-designer, ai-programmer | L |
| 35 | Market & Trading | Full Vision | Feature | economy-designer | M |

Effort estimates: S = 1 session, M = 2-3 sessions, L = 4+ sessions. A "session"
is one focused design conversation producing a complete GDD. These are design
effort, not build effort; the Producer Note above covers build time.

**Before design doc 7 (Save & Load):** write the home and storm persistence ADR
(`/architecture-decision`). Design docs 11, 12 and 14 also wait on it.

ADR-0001 and ADR-0002 are Accepted; design docs must not contradict them.
ADR-0002 will be amended or superseded in part by the new ADR.

---

## Circular Dependencies

None remaining. Two near-cycles were found and removed:

- **Stash and Building.** Building needs materials that may sit in a stash, and
  a stash is a built piece. Ore & Item Economy owns an "item container"
  contract; Pack and Stash both implement it. Building takes materials from
  containers through that contract and never refers to Stash. Stash depends on
  Building, not the reverse.
- **Mining and Creature AI.** Mining makes noise that creatures hear, and
  creatures threaten the mining player. Perception owns the noise-event
  contract; Mining and Player Controller emit to it and Creature AI reads from
  it.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Building | Technical / Scope | The costliest system and the main bottleneck: snapping, per-piece condition, repair, the roof check, host authority and versioned saves; five systems read its piece model | Design the piece model first; keep damage and repair behind a narrow interface; split out Structure Integrity if the design doc outgrows its size |
| Save & Load, with the new ADR | Technical | ADR-0002 does not cover built structures, the storm clock or storms during a run; four design docs are blocked until a new ADR exists | Write the ADR before design doc 7 |
| Storms | Design | Storms can destroy what the player built and take an unsheltered stash; they run during runs. If they feel unfair or like a chore, they break the rewritten anti-pillars | Always forecast, with strength shown; one repair action fixes the whole home; stronger tiers from run materials need little or no repair; test the 50 to 70 minute cycle and the two-storm rule early in Milestone A |
| Session & Authority | Technical | A networked host on a post-cutoff engine version, on the developer's first 3D game; every mechanic pays its cost | ADR-0001's fallback (in-process host behind `ISessionHost`); reassess after the first mechanic is built end to end |
| The asteroid run's tension | Design | The unproven half of the core hypothesis ("No, not really" after a few minutes of play). With the valley built first it is not tested in Unity until Milestone B | Test it now in the browser prototype: full runs, then tune `config.js` (`prototypes/star-haul/REPORT.md`) |
| Creature AI and Perception | Scope | The largest share of Milestone B; the producer's earlier likely cut point was "halfway through the AI work" | Design one creature fully before the second |
| Ore & Item Economy | Design | Read by Pack, Tools & Gear, Gathering, Building, Stash, Crafting and Mining. Open question from the art bible: is teal worth the same as amber per tier? | Start from the prototype's `config.js` values; `/balance-check` before stories |
| Home Valley and Asteroid World | Scope | Two hand-made maps on a first 3D game | Grey-box both; the asteroid can be cut to the landing area plus one zone |
| The MVP as a whole | Scope | 24 systems; 14 to 20 months as one milestone per the producer, low confidence; the valley-first split is not sized | Two playable milestones; re-estimate after the first three systems are built; `/scope-check` after any cut |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 35 |
| Design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0/24 |
| Vertical Slice systems designed | 0/4 |

---

## Next Steps

- [x] Review and approve this systems enumeration (designer, 2026-11-27)
- [ ] Write the home and storm persistence ADR (`/architecture-decision`)
- [ ] Design MVP-tier systems first (use `/design-system [system-name]`), starting with Game Data & Tuning
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/gate-check technical-setup` when MVP systems are designed
- [ ] Validate the highest-risk systems with `/vertical-slice` before committing to Production
