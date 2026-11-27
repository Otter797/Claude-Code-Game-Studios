# Systems Index: Star Haul

> **Status**: Draft
> **Created**: 2026-11-26
> **Last Updated**: 2026-11-26
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

Star Haul's first game is one loop: drill ore into a limited pack on an asteroid
while oxygen drains and the rock wakes up, get back to the ship, then unpack at
home and craft a better drill. Its systems fall into four groups.

**The ground everything stands on.** *Game Data & Tuning* holds every number and
every ore, tool and recipe definition as data. *Session & Authority* is the
one-player host that every state change passes through (ADR-0001). *Input* maps
keys to actions. *Save & Load* is the versioned save (ADR-0002).

**The run.** *Asteroid World* is the hand-made map: a safe landing area and three
zones of rising richness and danger. *Player Controller* moves the player through
it; *Mining* turns a seam into ore; *Pack* limits what can be carried and shows
its worth; *Tools & Gear* decides what rock can be cut. Pressure comes from
*Oxygen*, *Health & Damage*, *Creature AI* (the Burrower and the Spitter) and
*Hunter Escalation*, the hazard that worsens the longer the player stays.
*Perception* owns noise and sight, so danger can be scouted (Pillar 2). *Run
Flow* is the coordinator: it starts a run, keeps the clock, and ends it by
extraction or death, which is where "whatever you carry is lost" is enforced
(Pillar 3).

**The reason to go back out.** *Ore & Item Economy* sets what each tier is worth
and how rich each zone is; it is what makes "one more seam" a real decision
(Pillar 1). *Stash* keeps what was brought home, and keeps the best-haul and
stash-total records the brief asks for; *Crafting* turns the stash into the
better drill.

**What the player sees and hears.** *Run HUD* carries the worth and the oxygen.
*Home Room* is the home as a place, not a menu: a walk-in room with the bench and
the stash shelves in it, where unpacking plays out with the total counting up and
stored ore is visible on the shelves; panels appear only when something is used
(Pillar 5; art bible Section 7). Building the home is a later system (Home
Building & Farming). *Visual Feedback & Lighting* and *Audio* deliver the polish
of the art bible's promises: the glowing pack, magenta danger, sound as a
warning. Their minimum, the part without which danger cannot be read, is in the
MVP (see the Creative Director Note under Priority Tiers).

**How they relate.** Two systems are read by almost everything and are the most
expensive to get wrong: *Game Data & Tuning* and *Ore & Item Economy*. *Creature
AI* is built on by Hunters now and by the later Stealth and Melee trades.
*Run Flow* is the opposite shape: it depends on six systems and nothing in the
run depends on it except Hunters and the screens, so it is designed late and
kept to a state machine. *Perception* was split out of Creature AI on the
technical director's recommendation, which removed the one near-cycle (Mining
makes the noise that creatures hear).

Systems marked "(inferred)" are not named in the concept or the brief; the game
cannot work without them.

---

## Systems Enumeration

Numbers are the recommended design order.

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Game Data & Tuning (inferred) | Core | MVP | Not Started | — | — |
| 2 | Session & Authority | Core | MVP | Not Started | — | — |
| 3 | Input (inferred) | Core | MVP | Not Started | — | — |
| 4 | Ore & Item Economy (inferred) | Economy | MVP | Not Started | — | Game Data & Tuning |
| 5 | Asteroid World | Gameplay | MVP | Not Started | — | Game Data & Tuning |
| 6 | Player Controller (inferred) | Gameplay | MVP | Not Started | — | Session & Authority, Game Data & Tuning, Input |
| 7 | Health & Damage (inferred) | Gameplay | MVP | Not Started | — | Session & Authority, Game Data & Tuning |
| 8 | Perception (inferred) | Gameplay | MVP | Not Started | — | Game Data & Tuning, Asteroid World |
| 9 | Save & Load | Persistence | MVP | Not Started | — | Session & Authority, Game Data & Tuning |
| 10 | Pack | Gameplay | MVP | Not Started | — | Session & Authority, Ore & Item Economy |
| 11 | Tools & Gear | Progression | MVP | Not Started | — | Game Data & Tuning, Ore & Item Economy |
| 12 | Oxygen | Gameplay | MVP | Not Started | — | Player Controller, Health & Damage |
| 13 | Creature AI | Gameplay | MVP | Not Started | — | Player Controller, Health & Damage, Asteroid World, Perception |
| 14 | Mining | Gameplay | MVP | Not Started | — | Player Controller, Pack, Tools & Gear, Asteroid World, Ore & Item Economy, Perception |
| 15 | Stash | Economy | MVP | Not Started | — | Save & Load, Pack, Ore & Item Economy |
| 16 | Crafting | Progression | MVP | Not Started | — | Stash, Tools & Gear, Ore & Item Economy |
| 17 | Run Flow | Core | MVP | Not Started | — | Save & Load, Health & Damage, Asteroid World, Pack, Tools & Gear, Stash |
| 18 | Hunter Escalation | Gameplay | MVP | Not Started | — | Creature AI, Run Flow |
| 19 | Run HUD | UI | MVP | Not Started | — | Pack, Oxygen, Mining, Health & Damage, Run Flow |
| 20 | Home Room (inferred) | UI | MVP | Not Started | — | Stash, Crafting, Run Flow |
| 21 | Visual Feedback & Lighting (inferred) | UI | Vertical Slice | Not Started | — | Pack, Creature AI, Hunter Escalation, Asteroid World, Run Flow |
| 22 | Audio | Audio | Vertical Slice | Not Started | — | Mining, Creature AI, Oxygen, Perception, Hunter Escalation, Run Flow |
| 23 | Menus & Settings (inferred) | UI | Vertical Slice | Not Started | — | Input, Save & Load |
| 24 | First-Run Guidance (inferred) | Meta | Vertical Slice | Not Started | — | Run Flow, Mining, Run HUD, Oxygen |
| 25 | Accessibility & Options (inferred) | Meta | Alpha | Not Started | — | Run HUD, Home Room, Menus & Settings, Input |
| 26 | Ship & Destination Map | Progression | Alpha | Not Started | — | Run Flow, Tools & Gear |
| 27 | Home Building & Farming | Progression | Alpha | Not Started | — | Stash, Crafting, Save & Load |
| 28 | Co-op Sessions | Core | Full Vision | Not Started | — | Session & Authority, Save & Load |
| 29 | Stealth & Guard AI | Gameplay | Full Vision | Not Started | — | Perception, Creature AI, Run Flow |
| 30 | Melee Combat & Bosses | Gameplay | Full Vision | Not Started | — | Health & Damage, Creature AI, Tools & Gear |
| 31 | Market & Trading | Economy | Full Vision | Not Started | — | Ore & Item Economy, Stash |

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

> **Producer Note (PR-SCOPE, 2026-11-26): UNREALISTIC** against the concept's
> "2 to 4 months" for the MVP. The producer sized the 20-system MVP at
> **9 to 12 months** for one hobby developer on a first 3D game at `rigor: full`
> with ADR-0001 and ADR-0002, and rated its own confidence Low (no track record
> to calibrate against). **Designer's decision: keep all 20 systems and restate
> the MVP at 9 to 12 months.** Fallback if the build stalls, as the producer
> proposed: merge Input with Player Controller, Ore with Pack and Stash, Mining
> with Tools; grey-box one zone; and move Perception, Creature AI, Hunter
> Escalation and zones two and three to the next tier (about 11 systems, 4 to 6
> months). The producer's stated likely cut point is "halfway through the AI
> work". Later-tier timelines cannot be checked until MVP velocity is known.

> **Creative Director Note** (MVP; CD-SYSTEMS 2026-11-26: CONCERNS, revised):
> minimum danger feedback is part of the MVP. The loop cannot be judged if
> danger cannot be read (Pillar 2); a failed test would blame the loop for
> missing feedback. These are acceptance conditions on existing MVP design docs,
> not a new system:
> - **Pack**: the pack glows brighter as it fills.
> - **Creature AI**: creatures carry the magenta tell; a sound plays when a
>   creature notices the player.
> - **Hunter Escalation**: a warning sound when a hunter tier rises.
> - **Oxygen**: the gauge turns magenta and a warning sound plays when low.
> - **Run HUD**: a cue when the pack is full.
>
> Polish of all of these stays in Visual Feedback & Lighting and Audio (Vertical
> Slice). If the producer's lean fallback is used, this feedback slice is kept.
>
> **Creative Director Note** (MVP): system 20 was renamed from Home Screens to
> Home Room. Pillar 5's own test picks "a workshop you build and stand in" over a
> menu; if the MVP home is menus, the second half of the core hypothesis is not
> tested. This adds level and art work to an MVP the producer already sized as
> unrealistic against the original timeline.
>
> **Creative Director Note** (anti-pillars, to be stated in the design docs):
> Run Flow's clock runs only during a run, and nothing makes the player wait
> between runs. Home Building & Farming (Alpha): crops never die and nothing
> comes due.
>
> Not assessed by the creative director: whether the art bible's specific
> promises are spread correctly across systems (it did not read the art bible).

---

## Dependency Map

### Foundation Layer (no dependencies)

1. Game Data & Tuning — every other system reads its values; gameplay values must be data, not code.
2. Session & Authority — the one-player host all state changes pass through (ADR-0001).
3. Input — actions the player controller and menus are built on.

### Core Layer (depends on foundation)

1. Ore & Item Economy — depends on: Game Data & Tuning
2. Asteroid World — depends on: Game Data & Tuning
3. Player Controller — depends on: Session & Authority, Game Data & Tuning, Input
4. Health & Damage — depends on: Session & Authority, Game Data & Tuning
5. Perception — depends on: Game Data & Tuning, Asteroid World
6. Save & Load — depends on: Session & Authority, Game Data & Tuning

### Feature Layer (depends on core)

1. Pack — depends on: Session & Authority, Ore & Item Economy
2. Tools & Gear — depends on: Game Data & Tuning, Ore & Item Economy
3. Oxygen — depends on: Player Controller, Health & Damage
4. Creature AI — depends on: Player Controller, Health & Damage, Asteroid World, Perception
5. Mining — depends on: Player Controller, Pack, Tools & Gear, Asteroid World, Ore & Item Economy, Perception
6. Stash — depends on: Save & Load, Pack, Ore & Item Economy
7. Crafting — depends on: Stash, Tools & Gear, Ore & Item Economy
8. Run Flow — depends on: Save & Load, Health & Damage, Asteroid World, Pack, Tools & Gear, Stash
9. Hunter Escalation — depends on: Creature AI, Run Flow

### Presentation Layer (depends on features)

1. Run HUD — depends on: Pack, Oxygen, Mining, Health & Damage, Run Flow
2. Home Room — depends on: Stash, Crafting, Run Flow
3. Visual Feedback & Lighting — depends on: Pack, Creature AI, Hunter Escalation, Asteroid World, Run Flow
4. Audio — depends on: Mining, Creature AI, Oxygen, Perception, Hunter Escalation, Run Flow
5. Menus & Settings — depends on: Input, Save & Load

### Polish Layer (depends on everything)

1. First-Run Guidance — depends on: Run Flow, Mining, Run HUD, Oxygen
2. Accessibility & Options — depends on: Run HUD, Home Room, Menus & Settings, Input

### Later tiers

1. Ship & Destination Map — depends on: Run Flow, Tools & Gear
2. Home Building & Farming — depends on: Stash, Crafting, Save & Load
3. Co-op Sessions — depends on: Session & Authority, Save & Load. **Blocked** on a future ADR covering guests' progress and whose stash it is (ADR-0002).
4. Stealth & Guard AI — depends on: Perception, Creature AI, Run Flow
5. Melee Combat & Bosses — depends on: Health & Damage, Creature AI, Tools & Gear
6. Market & Trading — depends on: Ore & Item Economy, Stash

### Technical Director Notes (TD-SYSTEM-BOUNDARY, 2026-11-26: CONCERNS)

The director found the structure sound ("None of them needs a restructure").
Conditions for the design docs:

- **Perception was split out of Creature AI** on its recommendation. Mining and
  Player Controller send noise events to Perception; Mining does not depend on
  Creature AI.
- **Rules never depend on Session & Authority.** Where a system lists it as a
  dependency, that means its networked (Authority) part only; Simulation code
  must not reference it (ADR-0001's assembly rule). Game Data & Tuning has the
  same split: plain config types in the Simulation, asset loading in Authority.
- **`IWorldQuery` has no single owner.** Each Simulation system defines its own
  part (`DrillHit` in Mining, `PathDistance` in Creature AI, noise and sight in
  Perception); Session & Authority provides the implementations.
- **Run marker.** The begin-run and end-run hooks belong to Run Flow. Save & Load
  owns only the store and migrations and must never depend on Run Flow.
- **One death path.** Oxygen has no link to Run Flow, which holds only if Oxygen
  kills by dealing damage through Health & Damage. The Oxygen design doc must
  commit to that. Not assessed by the director: the concept says almost nothing
  about oxygen.
- **Run Flow stays a state machine**: the clock, the extraction and death
  transitions, and the marker hooks. Zone layout belongs to Asteroid World;
  moving the haul into the stash belongs to Stash. Run Flow must never read
  escalation state.

---

## Recommended Design Order

| Order | System | Priority | Layer | Agent(s) | Est. Effort |
|-------|--------|----------|-------|----------|-------------|
| 1 | Game Data & Tuning | MVP | Foundation | systems-designer, lead-programmer | M |
| 2 | Session & Authority | MVP | Foundation | network-programmer, technical-director | L |
| 3 | Input | MVP | Foundation | ux-designer, gameplay-programmer | S |
| 4 | Ore & Item Economy | MVP | Core | economy-designer | M |
| 5 | Asteroid World | MVP | Core | level-designer, art-director | L |
| 6 | Player Controller | MVP | Core | game-designer, gameplay-programmer | M |
| 7 | Health & Damage | MVP | Core | systems-designer | S |
| 8 | Perception | MVP | Core | ai-programmer, game-designer | M |
| 9 | Save & Load | MVP | Core | lead-programmer | L |
| 10 | Pack | MVP | Feature | game-designer | S |
| 11 | Tools & Gear | MVP | Feature | systems-designer | S |
| 12 | Oxygen | MVP | Feature | systems-designer | S |
| 13 | Creature AI | MVP | Feature | ai-programmer, game-designer | L |
| 14 | Mining | MVP | Feature | game-designer, gameplay-programmer | M |
| 15 | Stash | MVP | Feature | economy-designer | S |
| 16 | Crafting | MVP | Feature | economy-designer, systems-designer | S |
| 17 | Run Flow | MVP | Feature | game-designer, lead-programmer | M |
| 18 | Hunter Escalation | MVP | Feature | ai-programmer, systems-designer | M |
| 19 | Run HUD | MVP | Presentation | ux-designer, ui-programmer | S |
| 20 | Home Room | MVP | Presentation | ux-designer, level-designer, ui-programmer | L |
| 21 | Visual Feedback & Lighting | Vertical Slice | Presentation | art-director, technical-artist | M |
| 22 | Audio | Vertical Slice | Presentation | audio-director, sound-designer | M |
| 23 | Menus & Settings | Vertical Slice | Presentation | ux-designer, ui-programmer | S |
| 24 | First-Run Guidance | Vertical Slice | Polish | ux-designer, game-designer | S |
| 25 | Accessibility & Options | Alpha | Polish | accessibility-specialist | S |
| 26 | Ship & Destination Map | Alpha | Feature | game-designer | L |
| 27 | Home Building & Farming | Alpha | Feature | game-designer, systems-designer | L |
| 28 | Co-op Sessions | Full Vision | Feature | network-programmer | L |
| 29 | Stealth & Guard AI | Full Vision | Feature | ai-programmer, level-designer | L |
| 30 | Melee Combat & Bosses | Full Vision | Feature | game-designer, ai-programmer | L |
| 31 | Market & Trading | Full Vision | Feature | economy-designer | M |

Effort estimates: S = 1 session, M = 2-3 sessions, L = 4+ sessions. A "session"
is one focused design conversation producing a complete GDD. These are design
effort, not build effort; the Producer Note above covers build time.

ADR-0001 and ADR-0002 are already Accepted and cover much of the technical side
of Session & Authority and Save & Load; their design docs state the player-facing
rules and tuning, and must not contradict the ADRs.

---

## Circular Dependencies

- None remaining. One near-cycle was found and removed: Mining makes noise that
  creatures hear, and creatures threaten the mining player. Perception now owns
  the noise-event contract (position, loudness); Mining and Player Controller
  emit to it and Creature AI reads from it, so neither depends on the other.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| Session & Authority | Technical | A networked host on a post-cutoff engine version, on the developer's first 3D game; every mechanic pays its cost | ADR-0001's fallback (in-process host behind `ISessionHost`); reassess after the first mechanic is built end to end |
| Creature AI and Perception | Scope | The largest share of MVP work; the producer's likely cut point is "halfway through the AI work", which leaves a broken game | Design one creature fully before the second; the producer's lean fallback moves AI to the next tier |
| Ore & Item Economy | Design | Read by Pack, Tools & Gear, Mining, Stash and Crafting; wrong numbers make "one more seam" a non-decision everywhere. Open question from the art bible: is teal worth the same as amber per tier? | Start from the prototype's `config.js` values; `/balance-check` before stories |
| Run Flow | Design | Six dependencies; where ADR-0002's "leaving a run is a death" rule lands; risk of absorbing other systems' rules | Design it after its dependencies; keep it a state machine (TD note) |
| Asteroid World | Scope | One hand-made map with a landing area and three zones is a large content job for a first 3D level; the brief asks for "good quality map design" | Grey-box first; zones two and three are the first cut if time runs short |
| The MVP as a whole | Scope | 20 systems, sized at 9 to 12 months against a concept estimate of 2 to 4; that sizing predates Home Room becoming a walk-in room and the minimum feedback slice, both of which add work | The Producer Note's fallback; re-estimate once the first three systems are built |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 31 |
| Design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0/20 |
| Vertical Slice systems designed | 0/4 |

---

## Next Steps

- [x] Review and approve this systems enumeration (designer, 2026-11-26)
- [ ] Design MVP-tier systems first (use `/design-system [system-name]`), starting with Game Data & Tuning
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/gate-check technical-setup` when MVP systems are designed
- [ ] Validate the highest-risk systems with `/vertical-slice` before committing to Production
