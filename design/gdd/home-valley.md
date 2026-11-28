# Home Valley

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 5 (Home is the scoreboard), Pillar 2 (Risk is a choice), Pillar 3 (Bright world, real stakes)
> **Creative Director Review (CD-GDD-ALIGN)**: REVISED 2026-11-28 — run in-session as a checklist (no agent spawned). CONCERNS found: R5 let a Partial spot never regrow, so a player whose pack was always nearly full could leave the valley holding less than a rebuild needs, weakening the concept's "never ends a save" that Pillar 3's sting relies on (R5, States, F5, Edge Cases, AC 11). Revised: the regrow timer now starts at the first take from a Full spot. Pillars 2 and 5 are served by rules (R3 and R7 storm horizon and arrival framing, AC 22; R1 and R10 a plain valley, AC 30); Pillar 1 is kept with the haul by the valley holding only worth-0 materials (R4); Pillar 4 does not apply to the valley; no anti-pillar is crossed (regrowth comes due for nobody). Not re-run after revision.

## Summary

Home Valley is the one hand-made valley the player lives in during the first
game: an open, nearly flat floor to build the home on, a grassy margin where
rocks and sticks lie, and wooded slopes and a rim that close the world and show
a storm coming. It decides where pieces may touch the ground, where the player
arrives, and how each gather spot empties and comes back after ten minutes of
play, which is what guarantees a flattened home can always be rebuilt. It holds
nothing of worth: everything that makes the home richer comes from runs.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Game Data & Tuning, Session & Authority`

## Overview

Home Valley is the place the player lives in the first game: one small,
hand-made valley on a planet, a sunlit grassy floor ringed by wooded slopes and
a high rim. It is where every session starts and every run comes back to. The
player experiences it directly: they walk its floor, read the storm coming over
its rim, pick up the rocks and sticks lying along its edges, and build their
home on its open ground. Under that, it is a small piece of Simulation data:
the valley's layout (where the building ground is, where the player arrives,
where the gather spots are and where the world ends) and the state of each
gather spot, which empties when picked up and fills again after a set amount of
play time. Building asks it whether a piece may stand somewhere; Gathering asks
it what a spot holds; Save & Load keeps the spots' state.

Without it the game loses three things: the ground a home can be built on
(Pillar 5: "Wealth is something you see and walk through"), the readable
horizon a storm crosses (Pillar 2), and the promise that rocks and sticks always
come back, which is what guarantees a disaster stings but never ends a save
(concept, Recovery from failure; Pillar 3). The valley never changes on its own
apart from that: no day and night, no creatures, no decay, nothing that comes
due. Everything built in it is the player's (art bible, Section 6: "nothing
built in it until the player builds it").

*Implementation notes:* the valley model is plain C# Simulation state that
lives for the whole session, like the home (ADR-0001; ADR-0003, Decision 1).
How the layout is baked from the authored scene into data the host can read
without the scene → becomes an ADR (see Open Questions).

## Player Fantasy

**Framing:** Direct. The player stands in the valley, walks it and reads it;
the gather-spot state and layout data underneath are felt only through it.

**Creative-direction lens applied** (`lens-creative-director.md`, in-session,
no agent spawned). Three candidate framings were drafted:

1. **"Home ground."** Anchor moment: stepping off the end of a run back into
   the calm, sunlit valley, and seeing your own home as the only straight,
   built thing in it. Pillar 5: *"Wealth is something you see and walk through,
   not a number."* Asks of the design: the arrival view must frame the home;
   the valley must stay plain so the home stands out.
2. **"It always comes back."** Anchor moment: after a storm flattened an
   unrepaired shelter, walking to the tree line and finding the rocks and
   sticks are there again. Concept, Recovery from failure: *"Failure stings
   (Pillar 3) but never ends a save."* Asks of the design: reliable regrowth
   and a rebuild path short enough to be comforting, not a chore.
3. **"A blank canvas."** Anchor moment: the first session, an empty green floor
   that invites the first foundation. Asks of the design: generous, flat
   building ground. Risk: on its own it is a building fantasy, which belongs to
   Building, not the place.

**Chosen (autonomous, recommended):** framing 1, with framing 2 as its floor.

> *The valley is home ground: the one calm, sunlit place the player owns, where
> everything straight was put there by them. Coming back from a run, the first
> thing they see is their home standing on its open floor, and the storm, if
> one is coming, rising over the rim where they can watch it. Whatever happens
> to the home, the valley itself is never lost: the rocks and sticks are always
> back along the tree line, so a flattened home is a setback to rebuild, never
> the end of the save.*

What it serves:

- **Pillar 5, Home is the scoreboard.** The valley is deliberately plain
  (matte, muted green, no pre-placed colourful props) so the home is the most
  colourful place in the game (art bible, principle 3). The arrival view is
  framed on the building ground.
- **Pillar 2, Risk is a choice.** The rim is where a storm is seen coming
  (art bible, Section 2: "Grey cloud wall on one horizon"); the valley gives it
  a horizon to cross, so a storm is never a surprise.
- **Pillar 3, Bright world, real stakes.** The valley does not soften a storm's
  cost; it only guarantees the way back. The sting is the lost stash and the
  rebuild time; the valley makes sure that time is minutes, not the save.

What the valley is **not**: a source of wealth. It holds only rocks and sticks,
worth 0 (Ore & Item Economy, R11). Everything that makes the home richer comes
from runs (concept, Long-Term Progression: "the valley gives only rocks and
sticks, and everything better comes from runs"). That keeps Pillar 1 with the
haul.

## Detailed Design

### Core Rules

**Specialist lenses applied before drafting** (in-session, no agents spawned).
The routing table's `Gameplay` rows (combat, AI, movement, character, camera)
do not fit a place, so the **Level/world systems** row is used:
`game-designer` (primary), `level-designer` and `world-builder` (supporting).
`art-director` is added because the systems index names it for this system
(Recommended Design Order, row 5) and the valley's look is half its job.

- **game-designer.** The valley serves the home loop (check the forecast,
  gather, build, repair, craft, launch, come back). Its one decision for the
  player is *where*: where to build and which spots to walk to. What the player
  cannot do here matters as much: no mining, no creatures, no money, nothing
  that pays more than rocks and sticks. *Warning:* if gathering never runs out,
  walking to spots means nothing; if it runs out for good, the concept's
  "never ends a save" breaks. Regrowth must be on a timer, and it must be
  reliable.
- **level-designer.** The space needs three bands: an open, nearly flat floor
  to build on; a margin of grass and lower slope where rocks and sticks lie
  "within reach of the building ground" (art bible, Section 6); and wooded
  slopes and a rim that close the world. The arrival point needs a view that
  shows the building ground and the storm horizon together. *Warning:* if
  gather spots sit on the building ground, the player's own home will
  eventually cover them, and the rebuild guarantee depends on spots the player
  can always reach.
- **world-builder.** Natural only: hills, trees, grass, loose rock; no ruins,
  no pre-made architecture, no lost civilisation (art bible, Section 6). The
  ship's place in the valley is an open designer question (art bible,
  Section 6: "The ship is left out of the valley until this is decided"); this
  doc must not settle it by accident. No creatures in the valley (art bible,
  Section 5).
- **art-director.** The valley is the quiet backdrop: matte, low saturation,
  grass at or below 25% saturation, rounded forms only, no spikes (art bible,
  Sections 3 and 4). Gatherable rocks and sticks look like the valley's own and
  are marked only by the cream interactable rim. There is no day/night cycle
  (designer, 2026-11-27). The storm's grey comes from sky, fog and light over
  one horizon.

**Tensions found and how they were settled** (autonomous mode: the recommended
option taken and logged; the designer reviews at the first playable):

| Tension | Options | Chosen |
|---|---|---|
| Do rocks and sticks run out? (game-designer vs the concept's "never ends a save") | A: each spot empties and regrows after a set play time, saved per spot · B: spots never empty · C: spots refill at each storm | **A.** Walking to spots matters, regrowth is reliable and deterministic from the saved clock, and Home Valley does not depend on Storms. B makes gathering free; C ties the valley to Storms and makes the faucet bursty |
| Where may gather spots sit? (level-designer's warning) | A: only off the building ground · B: anywhere, suppressed while covered | **A.** The player can never cover the spots the rebuild guarantee needs |
| Does a partly taken spot regrow? | A: no, only an empty spot starts regrowing · B: yes, the timer starts at the first take from a Full spot | **B** (revised after CD-GDD-ALIGN, 2026-11-28; first draft chose A). Under A, a player whose pack is always nearly full could leave every spot Partial with nothing regrowing, and the valley would hold less than a rebuild needs. Under B, any spot that is not Full is on its way back, still one timer per spot |
| Where do runs launch from? (world-builder) | A: leave it open; reserve the arrival clearance where a ship or launch point could stand · B: decide a ship in the valley now | **A.** It is the designer's open question in the art bible; this doc only keeps the space free |
| Can trees be cut for sticks? | A: no, sticks are fallen sticks · B: yes | **A.** Trees stay as the slopes' scenery and the rim's silhouette; one gather verb, no new tool |

---

**R1. One valley, hand-made.** The first game has exactly one home valley. It
is authored by hand (no procedural generation) and is the same for every
profile. Its layout, in bands from the middle out:

| Band | What it is | Size and shape targets |
|---|---|---|
| **Building ground** | One contiguous, nearly flat area of the valley floor where the home can stand | Area 3,600 to 6,000 m² (target about 80 × 60 m); ground slope at most 8° everywhere inside it; no trees, rocks or other props on it; never a cave, overhang or water |
| **Wild margin** | Grass and the foot of the slopes around the building ground | 5 to 30 m wide; holds every gather spot (R4); walkable |
| **Slopes and rim** | Wooded slopes rising to the rim crest | The rim crest encloses the whole valley (target about 240 × 200 m inside the crest), rising 25 to 40 m above the floor; above the tree line the slope is too steep to walk (R6) |

Nothing in the valley is built or pre-made except what the player builds. No
creatures live in it. It has no day and night: it is always calm daylight
except when a storm is coming or under way, which Storms and Visual Feedback &
Lighting show (art bible, Section 2).

**R2. The building ground.** A piece may touch the ground only inside the
building ground. Home Valley answers one placement question for Building:

`CheckFootprint(boxes, touchesGround)` → **Ok**, or refused with one of:

- **Outside building ground**: a box of a piece that touches the ground is not
  wholly inside the building ground.
- **Blocks the arrival point**: any box of any piece (touching the ground or
  not) overlaps the arrival clearance of the primary arrival point (R3).

Building decides which pieces touch the ground, how a foundation meets uneven
ground, how high pieces may stack and whether an upper piece may reach past
the building ground's edge. Home Valley answers only for the ground and the
arrival clearance. The answer comes from the baked layout (R7), never from the
scene's colliders, so the host decides it the same way with or without the
valley scene loaded (ADR-0001: rules are plain C#).

Terrain never counts as a roof. The building ground has no overhang, cave or
tree canopy, so Building's shelter check, which uses only pieces (ADR-0003,
Decision 6), never has to ask the ground.

**R3. The arrival point.** The layout names an ordered list of at least two
arrival points at the edge of the building ground, each a position and a facing
looking across the building ground towards the home. The player is placed at
an arrival point when:

- a profile starts for the first time;
- a save is loaded at home;
- a run ends, by extraction or death, and the home is shown again;
- the player leaves the valley's bounds (R6), or chooses *Return to arrival
  point* from the pause menu (Menus & Settings).

The player is placed at the **first arrival point in the list whose clearance
holds no piece**. If every clearance holds a piece (possible only after a
layout patch, since R2 refuses pieces in the primary's clearance), the primary
is used and the case is logged. The clearance is a vertical cylinder around the
point, radius `arrival_clearance_radius_m`, from the ground to the top of the
valley's bounds.

The primary arrival point is also the space reserved for where runs might
launch (a ship, a pad, or a built launcher). Which, if any, is open (Open
Questions, 1). Until it is decided, nothing stands there.

**R4. Gather spots.** A *gather spot* is a fixed place in the wild margin where
rocks or sticks lie. Each spot has:

- a **spot id**, stable and never reused for a different spot, the same rule
  as catalog ids (Game Data & Tuning, R2), for example `valley.spot.rock.07`;
- a **gatherable** id naming what lies there: `gatherable.rock` or
  `gatherable.stick` (the `gatherable` kind is owned here: Game Data & Tuning,
  R2's kinds table names "Home Valley / Gathering"; this doc owns the
  definitions, Gathering owns the action);
- a position, wholly outside the building ground (by at least 1 m) and inside
  the wild margin.

Each `gatherable` definition holds (Game Data & Tuning, R1: one thing's numbers
live on its definition):

| Field | Type | Range | Meaning |
|---|---|---|---|
| `gives` | id (`material`) | an existing `material` id | What the spot holds |
| `yield` | int, `count` | 1 to 20 | How many units a full spot holds |
| `regrow_s` | float, `seconds` of play time | 60 to 3,600 | How long an emptied spot takes to fill again |

The MVP has two definitions and 48 spots:

| Id | `gives` | `yield` | `regrow_s` | Spots in the layout |
|---|---|---|---|---|
| `gatherable.rock` | `material.rock` | 3 | 600 | 24 |
| `gatherable.stick` | `material.stick` | 3 | 600 | 24 |

Rock spots lie at the foot of the slopes; stick spots lie under the trees at
the edge of the wild margin. Both kinds appear on every side of the building
ground, so no side of a home is far from either.

**R5. Taking from a spot, and regrowth.** A spot holds `remaining` units,
0 to `yield`. All changes happen on the host, inside Gathering's accepted
request (Session & Authority, R4):

1. Gathering asks for up to `n` units from a spot: `TakeFromSpot(spotId, n)`.
   Home Valley returns `p = min(n, remaining)` and lowers `remaining` by `p`.
   Gathering decides `n` (how much the pack has room for: Ore & Item Economy,
   formula F3) and places the `p` units.
2. If `remaining` was already 0, the take is refused: **Already taken**. This
   is Home Valley's only refusal reason; Gathering shows it.
3. When a take lowers a **Full** spot, the spot starts regrowing:
   `regrow_at = clock + regrow_s` (formula F5), where `clock` is the play-time
   clock (ADR-0003, Decision 4).
4. Further takes from a spot that is already regrowing (Partial or Empty) do
   not move its `regrow_at`. A Partial spot keeps what is left for the player
   until either they take it or `regrow_at` comes, whichever is first.
5. On every home tick the Authority layer passes the current clock to
   `RegrowTo(clock)`. Every spot that is not Full and has `regrow_at ≤ clock`
   fills to its full `yield`, and its `regrow_at` is cleared. Filling is not a request and needs no save point of its own:
   it follows from the saved `regrow_at` and the saved clock, so a reload
   gives the same result.
6. During a run the valley is not ticked, but the clock still runs. When the
   home is shown again, `RegrowTo(clock)` runs before the first frame, so every
   spot whose time passed during the run is full on arrival.

The valley never runs out: every spot always comes back, and nothing destroys a
spot. Storms do not touch gather spots or the valley's ground.

**R6. Bounds.** The player cannot leave the valley. Above the tree line the
slope is authored steeper than Player Controller's steepest walkable slope, and
an invisible wall follows the rim crest as a backstop. A *kill height* below
the floor's lowest point catches falling through the ground. A player found
outside the bounds or below the kill height is placed at an arrival point
(R3). Because movement belongs to the player's own client (Session &
Authority, R3), Player Controller applies this; Home Valley supplies the
bounds, the kill height and the arrival points.

**R7. The layout is data.** Everything the Simulation needs from the valley is
baked from the authored scene into one layout record at authoring time, and
loaded with the catalog: the building ground's outline and a coarse ground
height grid inside it, the arrival points and their clearance, the gather
spots (id, gatherable, position), the bounds, the kill height, the storm
horizon (the bearing of the rim section the storm rises over, for
Presentation), and the menu view (R9). The host never reads the scene. A
validation step checks the record against R1 to R4 and refuses to ship a layout
that breaks them (Acceptance Criteria). How the record is baked and stored →
becomes an ADR (Open Questions, 4).

**R8. What is saved.** Only gather spots that are not full are saved: for each,
its spot id, `remaining` and `regrow_at`. Full spots are
not saved; a spot missing from the save is full. This is part of the save's
first format (ADR-0003, Decision 14 accepted a migration if gather spots were
saved later; deciding now avoids it). The layout itself is never saved; it
comes from the build. The arrival point the player was placed at is not saved:
loading always places the player by R3.

**R9. The menu view.** The layout names one fixed camera position and facing
that looks over the building ground with the storm horizon in frame. The title,
pause and settings screens show the player's own valley from it, live, with
any damage and any approaching storm visible (art bible, Section 2, Menus row).

**R10. What the valley does not have in the MVP.** Water, caves, day and
night, weather other than storms, creatures, choppable trees, diggable or
changeable terrain, a second valley, and pre-placed structures. Each would add
a system or break an art bible rule; none is needed to prove the home.

### States and Transitions

**A gather spot:**

| State | Condition | Shows |
|---|---|---|
| **Full** | `remaining = yield` | All of its rocks or sticks |
| **Partial** | 0 < `remaining` < `yield`, `regrow_at` set | Fewer pieces, matching `remaining` |
| **Empty** | `remaining = 0`, `regrow_at` set | Nothing gatherable (bare ground) |

| From | To | Trigger |
|---|---|---|
| Full | Partial | `TakeFromSpot` takes some but not all |
| Full | Empty | `TakeFromSpot` takes all |
| Partial | Partial | `TakeFromSpot` takes some but not all of what is left |
| Partial | Empty | `TakeFromSpot` takes the rest |
| Partial | Full | `RegrowTo(clock)` with `clock ≥ regrow_at` |
| Empty | Full | `RegrowTo(clock)` with `clock ≥ regrow_at` |
| Empty | Empty | `TakeFromSpot`: refused, Already taken |

There is no transition from Empty to Partial: a spot fills all at once. Only
the take from Full sets `regrow_at` (R5, rules 3 and 4).

**The valley model:**

| State | When | What happens |
|---|---|---|
| **Not loaded** | Before the session's load finishes | Nothing |
| **At home** | Session state At Home (Session & Authority) | Ticked: `RegrowTo(clock)` each home tick; answers `CheckFootprint` and `TakeFromSpot` |
| **Dormant** | Launching Run, In Run, Ending Run | Kept in session state, not ticked, the scene unloaded; spot state unchanged |

| From | To | Trigger |
|---|---|---|
| Not loaded | At home | The load completes (spot state from the save, layout from the build), then `RegrowTo(clock)` |
| At home | Dormant | A run launches |
| Dormant | At home | The run ends and storms are resolved (ADR-0003, Decision 6); then `RegrowTo(clock)`, then the player is placed (R3) |
| At home or Dormant | Not loaded | The session stops |

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Game Data & Tuning (1) | In | `gatherable` definitions, the layout record, `tuning.home_valley`; validation | Game Data & Tuning (format); Home Valley (content) |
| Session & Authority (2) | In | Session state (At Home, Dormant), the tick, the request path for gather; construction of the valley model (its R11) | Session & Authority |
| Save & Load (7) | Both | Out: non-full spots (R8) at each save point. In: the same at load | Save & Load (document); Home Valley (its entries) |
| Player Controller (6) | Out | Arrival points, bounds, kill height, ground for walking (the scene's colliders, Presentation) | Home Valley (data); Player Controller (applies it) |
| Gathering (10) | Out | Spot list, `TakeFromSpot`, the Already taken refusal, the `gatherable` definitions | Home Valley |
| Building (11) | Out | `CheckFootprint` and its two refusals; ground height inside the building ground | Home Valley |
| Storms (14) | Out | The storm horizon bearing (for Presentation only). Storms do not change the valley; Home Valley does not read Storms | Home Valley |
| Run Flow (22) | Out | The valley goes Dormant at launch and comes back At Home after the run ends; the player is placed at an arrival point | Run Flow raises the run's end; the Authority layer calls Home Valley |
| Ore & Item Economy (4) | Out | `gives` names `material.rock` and `material.stick`; Home Valley is half of the gathering faucet (Economy R10) | Ore & Item Economy owns the materials |
| Home HUD & Panels (15) | Out | The building ground outline, shown while placing a piece | Home Valley (data) |
| Visual Feedback & Lighting (25) | Out | The valley's lighting states and the storm horizon | Visual Feedback & Lighting |
| Menus & Settings (27) | Out | The menu view (R9); *Return to arrival point* (R3) | Menus & Settings owns the option; Home Valley the point |
| Audio (26) | Out | The valley's ambience and ground types for footsteps | Audio |
| Crafting (13) | Out | The valley's stock, against which Crafting and Building's rebuild set is checked (formula F3) | Home Valley (check); Crafting and Building (the costs) |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable below was put at its minimum, its maximum and 0. Boundary
findings are listed under each formula and folded into the ranges; none needed
a design change. Feedback loops: none. The valley's supply does not grow with
the home or with wealth, so there is no rich-get-richer loop. Cost check
(economy-designer): the valley faucet's output is worth 0 (Ore & Item Economy,
R9), so no gathering pattern can be a dominant way to get rich.

### F1. Valley stock

The `valley_stock` formula is defined as:

`stock(m) = Σ over spots s whose gatherable gives m of yield(s)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| m | id | `material.rock`, `material.stick` | constant | The material |
| spots(m) | int, `count` | 8 to 100 per material | data file (layout record) | Spots whose gatherable gives m |
| yield(s) | int, `count` | 1 to 20 | data file (`gatherable` definition) | Units in a full spot |
| stock(m) | int, `count` | 8 to 2,000 | calculated | Units of m in the whole valley when every spot is full |

**Output Range:** 8 to 2,000 per material; 72 with the MVP layout.
**Boundaries:** fewer than 8 spots, or a yield of 0, is refused by validation
(R7), so the stock is never 0. At the maximum (100 spots × 20) the valley holds
2,000 rocks, more than six full packs; harmless, since rock is worth 0.
**Example:** 24 rock spots × 3 = **72** rocks; 24 stick spots × 3 = **72**
sticks.

### F2. Sustained supply

The `valley_supply_per_min` formula is defined as:

`supply(m) = stock(m) × 60 / regrow_s(m)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| stock(m) | int, `count` | 8 to 2,000 | calculated (F1) | Full-valley stock |
| regrow_s(m) | float, `seconds` | 60 to 3,600 | data file (`gatherable` definition) | Play time for an emptied spot to fill |
| 60 | int | — | constant | Seconds per minute |
| supply(m) | float, units per minute | 0.13 to 2,000 | calculated | Units of m that come back per minute of play, once the valley has been picked clean |

**Output Range:** 0.13 (8 spots, 3,600 s) to 2,000 (2,000 stock, 60 s) per
minute; 7.2 per minute with MVP values. It is a ceiling: walking limits what a
player actually gathers.
**Boundaries:** `regrow_s` = 0 would divide by zero and make a spot refill
every tick (a player could stand on one spot forever); the minimum of 60 s
prevents both. It is a reporting figure only: no rule reads it.
**Example:** 72 × 60 / 600 = **7.2** rocks per minute.

### F3. Rebuild check

The `rebuild_stock_ok` formula is defined as:

`rebuild_ok(m) = stock(m) ≥ ceil(need(m) × rebuild_margin)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| stock(m) | int, `count` | 8 to 2,000 | calculated (F1) | Full-valley stock |
| need(m) | int, `count` | 0 to 1,000 | calculated from Crafting and Building's rebuild set; until they exist, `provisional_rebuild_need_rock` / `_stick` (data file) | Units of m needed, from nothing, for a workbench, a hammer, a basic drill and one repair of a rock-and-stick shelter (concept, Recovery from failure) |
| rebuild_margin | float, share | 1.0 to 3.0 | data file (`tuning.home_valley`) | Headroom, so a few spots already taken do not break the rebuild |
| rebuild_ok(m) | bool | true / false | calculated | Whether a full valley alone covers the rebuild |

**Output Range:** true or false. Validation (R7) refuses a catalog for which it
is false for any material: the rebuild guarantee is a release condition, not a
report.
**Boundaries:** `need` = 0 is always true. `rebuild_margin` = 1.0 means a
rebuild needs every spot full; below 1.0 the check would pass a valley that
cannot cover the rebuild, so 1.0 is the floor. A need above the maximum stock
(over 2,000) fails at any layout: Crafting and Building must price the rebuild
set lower.
**Example:** need 40 rocks (provisional), margin 1.25: ceil(50) = 50 ≤ 72,
**true**. With only 16 rock spots (48 rocks) it would be false and the catalog
would be refused.

### F4. Rebuild gathering time

The `rebuild_gather_time` formula is defined as:

`T = Σ over m of ceil(need(m) / yield(m)) × (t_pick + d_hop / v_walk) + 2 × d_home / v_walk`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| need(m) | int, `count` | 0 to 1,000 | calculated (as F3) | Units of m the rebuild needs |
| yield(m) | int, `count` | 1 to 20 | data file | Units per full spot |
| t_pick | float, `seconds` | 0.2 to 3.0 | data file (Gathering's tuning; provisional 1.0) | Time to pick up one spot |
| d_hop | float, `m` | 2 to 30 | measured from the layout record | Mean distance from each spot to its nearest neighbouring spot of the same material |
| d_home | float, `m` | 5 to 80 | measured from the layout record | Mean distance from a spot to the building ground's centre |
| v_walk | float, m/s | Player Controller's `walk_speed` range (provisional 3.8; must be above 0) | data file (Player Controller) | Walking speed |
| T | float, `seconds` | 0 to about 7,000 | calculated | Time to gather the rebuild's rocks and sticks from a full valley, walking, one trip out and back |

**Output Range:** 0 (no need) up to thousands of seconds at extreme ranges;
about 103 s with MVP values. Must be at most `valley_gather_time_max_s`
(300 s): half of the concept's suggested 10-minute rebuild, leaving the other
half for building and crafting, which Gathering and Crafting own (concept:
"Owners: ... Gathering and Crafting (the rebuild path and its time)"). It is a
validation warning, not a refusal, because its inputs belong to three systems
and are estimates; the playtest in Acceptance Criteria is the real check.
**Boundaries:** `v_walk` = 0 divides by zero; Player Controller's range must
keep `walk_speed` above 0 (flagged to it). `yield` = 0 cannot pass F1's
validation. A pack too small to hold the rebuild in one trip would add trips
that this formula leaves out; with a 16-slot pack holding 20 rocks or sticks
per slot (Ore & Item Economy, F2), 80 units fill 4 slots, so it does not arise
with MVP values.
**Example:** need 40 rocks and 40 sticks; yield 3 → 14 pickups each, 28 in
all. t_pick 1.0, d_hop 8 m, v_walk 3.8 → 1.0 + 2.1 = 3.1 s per pickup →
86.9 s. d_home 30 m → 2 × 30 / 3.8 = 15.8 s. **T ≈ 103 s**, under 300 s.

### F5. Regrow time

The `spot_regrow_at` formula is defined as:

`regrow_at = clock_at_first_take + regrow_s × 1000`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| clock_at_first_take | double, `ms` | 0 to any play time | calculated (the play-time clock, ADR-0003 Decision 4) | The clock at the take that lowered the spot from Full |
| regrow_s | float, `seconds` | 60 to 3,600 | data file (`gatherable` definition) | Regrow duration |
| 1000 | int | — | constant | Milliseconds per second (Game Data & Tuning, D3) |
| regrow_at | double, `ms` | clock_at_first_take + 60,000 to + 3,600,000 | calculated | The clock time at which the spot fills |

**Output Range:** one minute to one hour of play after the first take;
10 minutes with MVP values. The conversion is Game Data & Tuning's D3, in
double precision, with no rounding.
**Boundaries:** the clock only moves forward (ADR-0003, Decision 8 takes the
later of save and note), so a spot never fills early. A changed `regrow_s` in
a patch does not move an already saved `regrow_at` (Edge Cases).
**Example:** a Full stick spot first taken from at clock 1,234,500 ms with
`regrow_s` 600:
regrow_at = 1,234,500 + 600,000 = **1,834,500 ms**. It fills on the first home
tick at or after that clock, or on arrival home if the player was on a run.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written, looking for
zero, maximum, simultaneous and degenerate cases; every case found is included.

**Taking from spots**

- **If the pack has room for fewer units than the spot holds**: Gathering asks
  for that many; the spot keeps the rest, becomes Partial and starts
  regrowing (R5, rule 3). The player sees the leftover pieces still lying
  there, and can take them any time before the spot fills.
- **If the pack has no room at all**: Gathering refuses before asking Home
  Valley (Ore & Item Economy: No room); the spot is unchanged.
- **If two take requests reach the same spot in one tick** (a double press now,
  two players in co-op later): they are handled in arrival order (Session &
  Authority, R4). The first takes what it asks for; the second gets what is
  left, or **Already taken** if nothing is.
- **If a take names a spot id the layout does not have**: Session & Authority
  refuses it as **Malformed**; Home Valley is not called.
- **If a take arrives while the player is far from the spot**: Gathering's
  range check refuses it; Home Valley does not check range.
- **If a spot fills while the player stands on it**: it fills. Gatherables
  have no collision, so a filling spot never pushes or traps the player.

**Regrowth and the clock**

- **If many spots are due at once** (after a long run, or a load after hours of
  play): `RegrowTo(clock)` fills all of them in one call, at most 48 spots in
  the MVP layout. Order does not matter: filling one spot never affects
  another.
- **If the game is paused or closed**: the clock does not move (ADR-0003,
  Decision 4), so no spot regrows. Waiting outside the game never refills the
  valley; play time does.
- **If the game crashes after a take but before the save point is written**:
  the save still has the spot as it was before the take, and the pack without
  the units; both come back together (ADR-0003, verification item 5). The
  player can take it again.
- **If a loaded spot that is not Full has no `regrow_at`** (an edited or
  corrupted save): it is treated as Full and logged.
- **If a loaded `regrow_at` is more than `regrow_s` ahead of the clock** (only
  possible with an edited or corrupted save): it is clamped to
  `clock + regrow_s` and logged, so a spot can never be stuck empty for longer
  than its regrow time.
- **If a loaded `remaining` is larger than the spot's current `yield`** (a patch
  lowered `yield`): it is clamped to `yield`, making the spot Full, and
  dropped from the saved list at the next save.

**Layout changes between builds**

- **If the save names a spot id the layout no longer has**: that entry is
  dropped at load and logged. Nothing else changes.
- **If the layout has a spot the save does not mention** (a spot added in a
  patch, or any full spot): it is Full.
- **If a patch changes a gatherable's `regrow_s`**: spots already regrowing
  keep their saved `regrow_at`; only spots first taken after the patch use the new
  value. Nothing is recalculated.
- **If a spot's gatherable, or the material it gives, is retired** (Game Data &
  Tuning, R14): validation refuses the layout until the spot is retired too.
  A layout never ships pointing at a retired id.
- **If a patch shrinks the building ground and existing pieces now stand
  outside it**: the pieces stay. Home Valley never removes or damages anything
  the player built; `CheckFootprint` only refuses new placements. The same
  holds for a moved arrival clearance: an existing piece inside it stays, and
  R3 places the player at the next free arrival point.

**Building and the ground**

- **If a ground-touching piece's footprint lies partly inside the building
  ground**: refused, Outside building ground. Every box must be wholly inside.
- **If a piece does not touch the ground** (a wall on an upper floor, a roof):
  only the arrival clearance is checked. Whether it may reach past the building
  ground's edge is Building's rule; if Building allows it, a gather spot under
  an overhang is still reachable, because gatherables have no collision and
  are found by distance.
- **If the player walls themselves in** (pieces all round them with no gap):
  they can always remove their own pieces. That needs Building to allow
  removing a piece without the hammer, so a player who lost the hammer cannot
  be trapped (flagged to Building: Open Questions, 5). *Return to arrival
  point* does not help if the arrival point is inside the walls too; removal
  does.
- **If every arrival clearance holds a piece**: the primary arrival point is
  used and the case is logged (R3). Only a layout patch can cause it.

**Bounds**

- **If the player gets above the tree line or onto the rim** (a physics glitch,
  a jump off a built roof): the invisible wall at the rim crest holds them in;
  nothing else happens.
- **If the player falls through the ground**: below the kill height they are
  placed at an arrival point (R6). Nothing is lost: there is no fall damage in
  the valley (Health & Damage is a Milestone B system; whether it applies in
  the valley is its decision).
- **If a built piece stands so high that the player can see or jump past the
  rim**: the rim wall still holds. Building may cap height for this or other
  reasons; Home Valley does not.

**Runs and storms**

- **If a storm comes while the player is outside**: the valley does not harm
  the player and storms do not change the valley's ground or gather spots.
  What storms do to the home is Storms' and Building's.
- **If a run ends while storms passed during it**: storms resolve first
  (ADR-0003, Decision 6), then `RegrowTo(clock)`, then the player is placed.
  Spot state does not depend on storms, so the order between those two does
  not change the result; this order is fixed so tests can rely on it.

**Degenerate strategies checked**

- **Camping one spot** gives 3 units per 10 minutes, worth 0. Not worth doing.
- **Leaving spots Partial on purpose** gains nothing: a Partial spot regrows
  on the same timer as an Empty one, so taking all of it now or later gives the
  same total. Nor can it starve the valley: every spot that is not Full is on
  its way back (the reason for the CD-GDD-ALIGN revision).
- **Reloading to refill spots** does nothing: spot state is saved at the save
  point after each take (Session & Authority, R10), and regrowth follows only
  the saved clock.

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Game Data & Tuning (1) | Hard | The `gatherable` kind and definitions, the layout record loaded with the catalog, `tuning.home_valley`, validation (D1), seconds to milliseconds (D3) | Designed (In Review). Its R2 names the `gatherable` owner as "Home Valley / Gathering"; this doc takes the definitions and Gathering the action |
| Session & Authority (2) | Hard | Construction of the valley model as session-level Simulation state (its R11), session states for At Home and Dormant, the tick, the request path for gathering (R4), the save point after a home action (R10) | Designed. Not in the systems index's Depends On for this row, since every Simulation system depends on it implicitly (Game Data & Tuning, Dependencies) |
| The play-time clock (ADR-0003, Decision 4) | Hard | The clock's value, passed in by the Authority layer to `RegrowTo` and `TakeFromSpot` | The clock is owned by Storms (ADR-0003, Decision 6), but Home Valley takes its value as an argument and does not depend on Storms, so no cycle |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs from Home Valley | Status |
|---|---|---|---|
| Player Controller (6) | Hard | Arrival points, bounds, kill height; the scene's walkable ground | Not written: provisional. Its index row does not list Home Valley (Open Questions, 3) |
| Save & Load (7) | Hard | The non-full spot entries (R8) in format version 1 | Not written: provisional. Its index row does not list Home Valley (Open Questions, 3) |
| Gathering (10) | Hard | Spots, `TakeFromSpot`, Already taken, the `gatherable` definitions | Not written: provisional |
| Building (11) | Hard | `CheckFootprint` and its two refusals, ground heights | Not written: provisional |
| Crafting (13) | Soft | The F3 rebuild check against its recipe costs | Not written: provisional. Its index row does not list Home Valley; the check is run by validation, so a soft link |
| Storms (14) | Soft | The storm horizon bearing, for Presentation | Not written: provisional |
| Home HUD & Panels (15) | Soft | The building ground outline while placing | Not written: provisional |
| Run Flow (22) | Soft | The valley going Dormant and back; placing the player on return | Not written: provisional. Its index row does not list Home Valley (Open Questions, 3) |
| Visual Feedback & Lighting (25) | Soft | Lighting states and the storm horizon | Not written: provisional |
| Audio (26), Menus & Settings (27) | Soft | Ambience and ground types; the menu view and *Return to arrival point* | Not written: provisional |

Bidirectional check: Game Data & Tuning's Downstream table lists "Home Valley
(5) | Hard | `gatherable` definitions and placement tuning;
`tuning.home_valley`", which matches. Session & Authority lists "every
Simulation system", which covers this one. Ore & Item Economy lists Gathering
and Home Valley as the owners of the gathering faucet (its R10), which matches;
its Dependencies table names Gathering but not Home Valley, which is
acceptable because Home Valley reads no Economy rule beyond the material ids.

## Tuning Knobs

### This system's tuning set: `tuning.home_valley`

All values in Game Data & Tuning's R3 record shape. All are `provisional: true`
until the first playable; the rationale for each starting value is in the last
column.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `rebuild_margin` | float | 1.25 | 1.0 | 3.0 | 0.05 | share | restart (validation) | 1.0: the rebuild needs every spot full | Forces many spots or a cheap rebuild set; Crafting's costs get squeezed | A quarter of headroom covers a few spots already taken when disaster strikes |
| `valley_gather_time_max_s` | float | 300 | 60 | 600 | 10 | s | restart (validation warning) | Forces spots close together and the building ground small | Lets a rebuild drag past the concept's 10 minutes | Half of the concept's suggested 10-minute rebuild; the rest is building and crafting |
| `arrival_clearance_radius_m` | float | 4.0 | 2.0 | 10.0 | 0.5 | m | restart | Pieces crowd the arrival point; no room left for a future ship or launcher | Eats building ground at the edge | Room to stand, turn and see the home; and to hold a small pad later (Open Questions, 1) |
| `provisional_rebuild_need_rock` | int | 40 | 0 | 1,000 | 1 | count | restart (validation) | The rebuild check passes a valley too poor to rebuild | The check refuses any layout | Stand-in for the rebuild set until Crafting and Building price it; removed then |
| `provisional_rebuild_need_stick` | int | 40 | 0 | 1,000 | 1 | count | restart (validation) | As above | As above | As above |

Constraint: none between keys. `provisional_rebuild_need_*` are retired (Game
Data & Tuning, R14) once Crafting and Building define the rebuild set and F3
reads it.

### Knobs on definitions (Game Data & Tuning, R1)

| Definition field | Value | Range | Too low | Too high | Interacts with |
|---|---|---|---|---|---|
| `gatherable.*.yield` | 3 | 1 to 20 | Many pickups per wall; gathering feels like a chore | A few pickups fill the pack; walking to spots stops mattering | F1 stock, F3, F4 pickups; Gathering's `t_pick` |
| `gatherable.*.regrow_s` | 600 | 60 to 3,600 | Spots refill almost at once; the valley is effectively endless and walking stops mattering | A player who rebuilds twice in an hour waits | F2 supply, F5 |

### Layout facts (authored, validated, not tuned)

These are properties of the hand-made scene, checked by validation (R7), not
values a designer changes in data: 24 rock and 24 stick spots; building ground
3,600 to 6,000 m² with slope at most 8°; every spot at least 1 m outside the
building ground and inside the wild margin (5 to 30 m from it); at least two
arrival points; the kill height below the floor's lowest point; the rim crest
enclosing the valley. Changing them means editing the scene and re-baking.

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `walk_speed` (provisional 3.8 m/s) | Player Controller | F4 |
| Pick-up time `t_pick` (provisional 1.0 s) | Gathering | F4 |
| `stack_max` of rock and stick (20) | Ore & Item Economy | Edge Cases (pack room) |
| Storm interval and strength | Storms | Not used; the storm horizon is layout data |

## Visual/Audio Requirements

**Art-director lens applied** (`lens-specialists.md`, Visual/Audio row;
art bible Sections 1 to 6 read by heading). Required for this `Gameplay`
system.

**Art bible principles that apply most directly:**

- **Principle 1, Loot owns saturation and gloss.** The valley is matte and
  low saturation everywhere: grass in Meadow Sage `#A0B286` (at or below 25%
  saturation), trunks and sticks in Stick Wood `#8C7969`, rock in the stone
  colours at or below 20% saturation. No glossy or sharp-highlighted surface
  anywhere in the valley.
- **Principle 3, Home brightens with wealth.** The valley starts as plain as it
  will ever be. No pre-placed colourful props, ever (Section 6, Valley, home:
  "Starts empty: only what the player builds").
- **Shape language (Section 3): round is world, straight is ours.** Rounded
  hills, rounded canopies on simple trunks, grass as soft clumps, round loose
  rocks, sticks as plain natural lines. No spikes anywhere in nature. Nothing
  straight-edged in the valley except what the player builds (and, if the
  designer decides on it, the ship).
- **Principle 2, One hue means danger.** No Threat Magenta in the valley: it has
  no threats except storms, which are a lighting state.

**Visual feedback for this system's events:**

| Event | What the player sees | Constraint |
|---|---|---|
| A spot is Full or Partial | Rocks or sticks lying on the ground, the same models and materials as the valley's own scenery, with the cream interactable rim (Section 4) when the player is in Gathering's range | The rim is the only marker: no different colour or shape (Section 6) |
| A spot is taken from | The picked pieces disappear; a Partial spot shows the pieces still left (one model per unit up to `yield`) | Gathering owns the pick-up animation and sound |
| A spot is Empty | Bare ground, with a faint flattened patch in the grass so the player can learn where spots are | Matte, no marker, no timer shown |
| A spot fills | The pieces appear with a short settle (about 0.5 s) if in view; instantly if not | Never a sparkle or glow: gloss belongs to ore |
| The valley at calm | Warm high sun (about 5000K), cool sky fill, high-key, low contrast (Section 2, Valley calm) | No day and night |
| A storm on the way | A grey cloud wall rising over the rim at the storm horizon bearing (R7), sun dimming, wind in grass and trees (Section 2) | Visual Feedback & Lighting and Storms own the effect; the layout supplies the bearing |
| A storm | Dim, flat, cool overcast; the wild valley greys while sheltered haul keeps its colour (Section 6, Reading against each other) | Grey from sky, fog and light, never a full-screen grade |
| The building ground | Not marked in the world at rest; its outline shows only while placing a piece (UI Requirements) | The open floor itself should read as "build here": flat, clear, grassy |

**Animation and style constraints:** grass and leaves sway as soft clumps in a
light breeze at calm and harder in a storm; trees do not fall or break; nothing
in the valley animates on its own beyond wind. Performance: the storm's wind
sway and rain are already flagged for a 60 fps check (art bible, Section 6);
the valley's grass density is part of the test-valley measurement the art
bible's Section 8 budgets wait for.

**Audio:** the valley's calm ambience is wind through grass and leaves, with
no birdsong or animal sound (there are no creatures in the valley). Footsteps
change with ground type: grass on the wild margin and building ground, dirt
and stone at the foot of the slopes, built floors on pieces (Audio owns the
sounds; the layout tags the ground types). A storm's sound and its warning cue
belong to Storms and Audio (art bible, Section 4, storm sound cue).

> 📌 **Asset Spec** — Visual/Audio requirements are defined. After the art
> bible is approved, run `/asset-spec system:home-valley` to produce per-asset
> visual descriptions, dimensions, and generation prompts from this section.

## Game Feel

Required for this `Gameplay` system. The valley is walked, not operated, so its
feel targets are about space and reading, measured in the built game:

- **Arrival frames the home.** From the primary arrival point's facing, the
  whole building ground fits in the default field of view with no hill or tree
  in the way, and the storm horizon is within a quarter turn. The first thing
  seen after a run is the home.
- **Open floor invites building.** The building ground has no props and at most
  8° slope, so a foundation placed anywhere on it looks level. No spot on the
  building ground is more than 50 m from its edge.
- **Gatherables are in reach, not underfoot.** Every gather spot is 5 to 30 m
  from the building ground's edge. A round trip to gather one material for a
  wall should take well under a minute of walking (F4's per-pickup time, about
  3 s, times a handful of pickups).
- **The world's edge feels like terrain, not a wall.** In normal play the
  player meets steep slopes and trees long before the invisible rim wall; the
  wall is a backstop the player should almost never touch.
- **Calm is the default.** At calm, nothing moves but wind; the valley is the
  low-arousal counterweight to the run (art bible, Section 2: "Earned pride,
  unhurried making").
- **Regrowth is quiet.** The player discovers spots have come back by walking
  past them, never through a notification.

## UI Requirements

The valley adds little UI of its own:

- **Building ground outline.** While Building's placement mode is active, the
  building ground's edge is drawn on the ground (soft cream line, art bible's
  "ours" colour), and the arrival clearance is drawn as a no-build circle.
  Home HUD & Panels draws it from the layout record; refusals use R2's two
  reasons in plain words: "Outside building ground", "Keep the landing spot
  clear".
- **Already taken.** If a take is refused because the spot emptied, Gathering
  shows "Already taken" briefly at the spot; no other UI.
- **Return to arrival point.** A pause-menu option (Menus & Settings) that
  places the player at an arrival point (R3). Available only at home.
- **No spot timers, no map, no minimap** in the MVP. The valley is small enough
  to read by walking.

> 📌 **UX Flag — Home Valley**: This system has UI requirements. In Phase 4
> (Pre-Production), run `/ux-design` to create a UX spec for each screen or
> HUD element this system contributes to **before** writing epics: the
> placement overlay in `design/ux/hud.md` (with Building) and the pause menu's
> *Return to arrival point* (with Menus & Settings). Stories that reference UI
> should cite `design/ux/[screen].md`, not the GDD directly.

## Cross-References

| This doc | References | Mechanic, value or rule | Where |
|---|---|---|---|
| R2, R4, R7, Tuning Knobs | Game Data & Tuning | `gatherable` kind owner (R2), definition fields (R1), record shape (R3), retired ids (R14), validation (D1), seconds to ms (D3) | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R3, R5, States, Edge Cases | Session & Authority | Request handling (R4), session check (R5), save point after a home action (R10), construction (R11), session states | [session-and-authority.md](session-and-authority.md) |
| R4, R5, F3, F4, Edge Cases | Ore & Item Economy | `material.rock` and `material.stick` (R11), stack cap and room (F2, F3), faucet table (R10), rebuild guarantee (R10), worth 0 (R9) | [ore-and-item-economy.md](ore-and-item-economy.md) |
| R2, R5, R8, States | ADR-0003 | Session-level home model (Decision 1), the play-time clock (Decision 4), `AdvanceTo` and the run-end order (Decision 6), the play-time note (Decision 8), format version 1 and gather points (Decision 14) | [adr-0003-home-and-storm-persistence.md](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| R2, R7 | ADR-0001 | Rules in plain C#, host-authoritative | [adr-0001-network-model.md](../../docs/architecture/adr-0001-network-model.md) |
| Overview, Player Fantasy, F3, F4 | Game concept | Pillars 2, 3 and 5; Recovery from failure (rocks and sticks always come back; rebuild in 10 minutes or less); Long-Term Progression | [game-concept.md](game-concept.md) |
| R1, R9, R10, Visual/Audio | Art bible | Sections 2 (valley rows, menus), 3 (shape), 4 (palette), 5 (no creatures), 6 (environment, prop density, the open ship question) | [art-bible.md](../art/art-bible.md) |
| Interactions | Input | Interact (E) is the gather action Gathering binds | [input.md](input.md) |

## Acceptance Criteria

**QA-lead lens applied** (`lens-qa-lead.md`, against Sections C, D and E as
written). Coverage: every core rule R1 to R9 and every formula F1 to F5 has at
least one criterion; R10 (what the valley lacks) is checked by the layout
validation in AC 1. Story type is given per criterion: **Logic** needs an
automated EditMode test; **Integration** an integration test or documented
playtest; **Visual** a retained screenshot in `production/qa/evidence/`;
**Playtest** a documented playtest. Gaps found in the first draft and fixed:
no criterion for the clamp on a loaded `regrow_at`; no cross-system criterion
with the pack; "feels open" rewritten as a measurable framing check (AC 22).

**Layout and validation**

1. **GIVEN** the shipped layout record, **WHEN** validation runs, **THEN** it
   reports: building ground area between 3,600 and 6,000 m²; maximum ground
   slope inside it at most 8°; 24 rock and 24 stick spots; every spot at least
   1 m outside the building ground and within 30 m of it; at least two arrival
   points; the kill height below the floor's lowest point; and no errors.
   *(Logic)*
2. **GIVEN** a test layout with one rock spot moved 0.5 m inside the building
   ground, **WHEN** validation runs, **THEN** it refuses the layout and names
   that spot id. *(Logic)*
3. **GIVEN** a test catalog with `gatherable.rock.yield` = 0, or `regrow_s` =
   30, **WHEN** validation runs, **THEN** it refuses the definition and names
   the field and its range. *(Logic)*

**Building ground and arrival (R2, R3)**

4. **GIVEN** a ground-touching footprint wholly inside the building ground and
   clear of the arrival clearance, **WHEN** `CheckFootprint` is called, **THEN**
   it returns Ok. *(Logic)*
5. **GIVEN** a ground-touching footprint with one box 0.1 m past the building
   ground's edge, **WHEN** `CheckFootprint` is called, **THEN** it returns
   Outside building ground. *(Logic)*
6. **GIVEN** a footprint that does not touch the ground, outside the building
   ground but clear of the arrival clearance, **WHEN** `CheckFootprint` is
   called, **THEN** it returns Ok; **AND GIVEN** any footprint overlapping the
   primary arrival clearance (radius 4.0 m) at any height, **THEN** it returns
   Blocks the arrival point. *(Logic)*
7. **GIVEN** the same footprints, **WHEN** `CheckFootprint` runs on a host with
   the valley scene not loaded, **THEN** it returns the same results as with
   the scene loaded. *(Logic)*
8. **GIVEN** a layout whose primary arrival clearance holds a piece (a test
   save made against an older layout), **WHEN** the save is loaded, **THEN** the
   player is placed at the second arrival point; **AND GIVEN** both clearances
   hold pieces, **THEN** the player is placed at the primary and one log line
   names the case. *(Logic)*
9. **GIVEN** a profile at home, **WHEN** a run ends by extraction, by death, or
   the game is loaded at home, **THEN** the player stands at the first free
   arrival point facing its authored facing. *(Integration)*

**Gather spots (R4, R5, F5)**

10. **GIVEN** a Full rock spot (`remaining` 3), **WHEN** `TakeFromSpot(spot, 3)`
    runs at clock 1,234,500 ms, **THEN** it returns 3, the spot is Empty and
    `regrow_at` = 1,834,500 ms. *(Logic)*
11. **GIVEN** a Full stick spot, **WHEN** `TakeFromSpot(spot, 2)` runs at
    clock 1,000,000 ms, **THEN** it returns 2 and the spot is Partial with
    `remaining` 1 and `regrow_at` 1,600,000 ms; **AND WHEN** the last stick is
    taken at 1,300,000 ms, **THEN** `regrow_at` stays 1,600,000 ms; **AND
    WHEN** `RegrowTo` runs at 1,600,000 ms, **THEN** the spot is Full with 3.
    *(Logic)*
12. **GIVEN** an Empty spot, **WHEN** `TakeFromSpot` runs, **THEN** it is
    refused with Already taken and nothing changes. *(Logic)*
13. **GIVEN** an Empty spot with `regrow_at` 1,834,500 ms, **WHEN** `RegrowTo`
    runs at 1,834,499 ms, **THEN** it stays Empty; **WHEN** it runs at
    1,834,500 ms, **THEN** it is Full with `remaining` 3. *(Logic)*
14. **GIVEN** two take requests for the same Full spot (yield 3) in one tick,
    asking for 2 and then 2, **WHEN** the tick runs, **THEN** the first gets 2,
    the second gets 1, and the spot is Empty. *(Logic)*
15. **GIVEN** a pack with room for exactly 1 stick (Ore & Item Economy, F3) and
    a Full stick spot, **WHEN** the player gathers it, **THEN** the pack gains 1
    stick, the spot shows 2 sticks left and is Partial, and a save point
    follows. *(Integration: Gathering, Pack, Session & Authority)*
16. **GIVEN** 10 Empty spots whose `regrow_at` fall during a run, **WHEN** the
    run ends, **THEN** on the first frame at home all 10 are Full, and storms
    due during the run were resolved before `RegrowTo` ran. *(Integration)*
17. **GIVEN** the game paused for 20 minutes of wall time with Empty spots,
    **WHEN** it is unpaused, **THEN** no spot has filled. *(Logic)*

**Saving and loading (R8, Edge Cases)**

18. **GIVEN** a valley with 3 Empty spots, 1 Partial and 44 Full, **WHEN** a
    save point is written, **THEN** the save holds exactly 4 spot entries (id,
    `remaining` and `regrow_at`) and none for Full spots;
    **AND WHEN** it is loaded, **THEN** all 48 spots are in the same state.
    *(Logic)*
19. **GIVEN** a save naming a spot id the layout lacks, a spot with `remaining`
    above its current `yield`, and an Empty spot with `regrow_at` more than
    `regrow_s` ahead of the clock, **WHEN** it is loaded, **THEN** the unknown
    entry is dropped, the second spot is Full, the third has `regrow_at` =
    clock + `regrow_s`, and each case writes one log line. *(Logic)*
20. **GIVEN** a take at home, **WHEN** the process is killed before the save
    point's write completes and the game is restarted, **THEN** either both the
    spot change and the pack gain are present, or neither is. *(Integration,
    with ADR-0003 verification item 5)*

**Bounds and menu (R6, R9)**

21. **GIVEN** the player at home, **WHEN** their position falls below the kill
    height, or they choose *Return to arrival point* from the pause menu,
    **THEN** within one frame they stand at an arrival point (R3) with nothing
    lost. *(Integration)*
22. **GIVEN** the default field of view at the primary arrival point's facing,
    **WHEN** a screenshot is taken with an empty valley and again with a test
    home covering the building ground, **THEN** the whole building ground is
    in frame with no terrain or tree hiding any part of it, and the storm
    horizon bearing is within 90° of the facing. *(Visual)*
23. **GIVEN** the title screen, **WHEN** it is shown with a damaged test home
    and a storm on the way, **THEN** the menu view shows the valley from its
    authored camera with the damage and the cloud wall visible. *(Visual)*
24. **GIVEN** a walk around the whole rim at the foot of the steep slope,
    **WHEN** a tester tries to climb out at 20 points spread around it,
    **THEN** they never leave the valley, and touch the invisible rim wall at
    no more than 2 of them. *(Playtest)*

**Formulas (F1 to F4)**

25. **GIVEN** the MVP layout and definitions, **WHEN** F1 and F2 are computed,
    **THEN** stock is 72 rocks and 72 sticks and supply is 7.2 per minute each.
    *(Logic)*
26. **GIVEN** `rebuild_margin` 1.25 and needs of 40 and 40, **WHEN** F3 runs,
    **THEN** it passes (50 ≤ 72); **AND GIVEN** a need of 58 rocks, **THEN** it
    fails (73 > 72) and validation refuses the catalog naming
    `material.rock`; **AND GIVEN** a need of 0, **THEN** it passes. *(Logic)*
27. **GIVEN** need 40 and 40, yield 3, `t_pick` 1.0, `d_hop` 8, `d_home` 30,
    `walk_speed` 3.8, **WHEN** F4 runs, **THEN** T is 102.7 s ± 0.1 and no
    warning is raised; **AND GIVEN** `t_pick` 3.0 and `d_hop` 30, **THEN** T is
    about 320.7 s, over 300 s, and
    validation raises a warning (not a refusal) naming F4. *(Logic)*
28. **GIVEN** an empty pack, an empty stash, no tools and no home, at a full
    valley, **WHEN** a tester gathers the rebuild set's rocks and sticks,
    **THEN** it takes at most 300 s of play, timed. *(Playtest; re-run once
    Crafting and Building set the rebuild costs)*

**Visual (Visual/Audio)**

29. **GIVEN** a Full, a Partial and an Empty spot of each material, **WHEN**
    screenshots are taken at calm from 5 m and from 25 m, **THEN** the
    gatherables use the valley's own rock and stick look, show the cream rim
    only within Gathering's range, and the Empty spot shows bare ground with no
    marker. *(Visual)*
30. **GIVEN** a valley screenshot at calm with no home built, **WHEN** its
    pixels are sampled, **THEN** no valley surface exceeds 25% saturation
    (grass and leaves) or 20% (rock), and no Threat Magenta appears. *(Visual)*

**Performance:** the valley's own logic is cheap: `RegrowTo` over 48 spots and
one `CheckFootprint` each cost under 0.05 ms on the host. The valley's render
cost (grass, trees, storm weather) is set by the art bible's Section 8 budgets
after the test-valley measurement, not here.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Where do runs launch from: a ship sitting in the valley, something the player builds, or a menu? The primary arrival clearance is kept free for it (R3). | Designer (art bible Section 6 open question); Run Flow | Before the Run Flow design doc |
| 2 | Gather spot state is now part of save format version 1 (R8). ADR-0003's out-of-scope note ("whether gathered rocks and sticks come back, and so whether the valley's gather points are saved") is answered: yes, keyed by stable spot id. ADR-0003 or the Save & Load doc should record it. | Save & Load (7); technical-director | Before format version 1 is frozen at the first save story |
| 3 | The systems index's Depends On for Player Controller (6), Save & Load (7) and Run Flow (22) do not list Home Valley, though each reads it (arrival points and bounds; spot entries; placing the player on return). Add them, or record why not. | `/map-systems` (producer) | Next systems-index update |
| 4 | How is the layout record (R7) baked from the scene and stored: building ground outline, height grid, spots, arrival points, bounds? Its format must let the host decide placement with no scene loaded. → ADR (could fold into ADR-0004, the data ADR due before the first data story). | technical-director, lead-programmer | Before the first Home Valley story |
| 5 | Building must let the player remove their own pieces without the hammer, or a player who lost the hammer and walled themselves in is trapped (Edge Cases). | Building (11) | Building design doc |
| 6 | `provisional_rebuild_need_rock` and `_stick` (40 each) stand in for the rebuild set. Crafting and Building must define the set (workbench, hammer, basic drill, one shelter repair) and F3 then reads it. | Crafting (13), Building (11) | Their design docs |
| 7 | Is 3,600 to 6,000 m² of building ground right for a 2,000-piece home (ADR-0003's test size) and for the art bible's budgets? To be checked in the test valley. | level-designer, technical-artist | Test-valley measurement, early Milestone A |
| 8 | NOT SOURCEABLE — Unity Terrain in 6.3 LTS (heightmaps, tree and detail placement, grass wind, how they cost at 60 fps) is not covered by `docs/engine-reference/unity/modules/`. Whether the valley uses Unity Terrain or authored meshes is open until checked against Unity's docs for the installed version. | unity-specialist, technical-artist | Before the first valley art story |
| 9 | Does the valley's ambience stay without birdsong (no creatures in the valley, art bible Section 5)? A calm valley with no life sound may feel empty. | audio-director, designer | First playable |
| 10 | Are 24 + 24 spots, yield 3 and 10-minute regrowth right? They are sized from F3 and F4 against a provisional rebuild need, not played. | Designer | First playable |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval ("assume that i will agree with
everything you ask"), each the recommended option, each logged. The designer
reviews them at the first playable.

1. Overview framed as both the place and its data (Gameplay category).
2. Player Fantasy: "Home ground", with "It always comes back" as its floor.
3. **Rocks and sticks regrow per spot, after a set play time, saved per spot**
   (not endless, not refilled by storms). *Major: it sets the gathering
   faucet's shape.*
4. Gather spots only off the building ground, so the player can never cover
   them.
5. A partly taken spot regrows on the same timer, started by the first take
   from Full (revised after CD-GDD-ALIGN; the first draft said it did not
   regrow).
6. Where runs launch is left open; the primary arrival clearance is kept free.
7. Trees cannot be cut; sticks are fallen sticks.
8. 24 rock and 24 stick spots, yield 3, regrowth 600 s of play.
9. Spot state goes into save format version 1 (avoids ADR-0003's accepted
   later migration).
10. The F3 stock check refuses a catalog; the F4 time check only warns.
11. The valley's share of the 10-minute rebuild is 300 s of gathering.
12. Arrival clearance radius 4 m; at least two arrival points; first free one
    is used.
13. *Return to arrival point* in the pause menu, and the kill height, as the
    way out of a stuck or out-of-bounds position.
14. No water, caves, day and night, creatures or choppable trees in the MVP
    valley (R10).
