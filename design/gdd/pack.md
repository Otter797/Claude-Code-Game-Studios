# Pack

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 3 (Bright world, real stakes)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-28 — run in-session as a checklist (no agent spawned). Pillar 1 is served by rules: 16 one-ore slots (R1), fill slows the player (R6, F2, with the F4 crossover check), worth is the largest number and the glow is on the player's back (R7, R8). Pillar 3 by the death sink emptying the whole pack (R3, States) with nothing softening it. Pillar 2 by worth and at risk always shown on a run (R8). No drop at home (R5) avoids a hidden loss. No anti-pillar crossed; Pillars 4 and 5 are not served directly and need not be.

## Summary

The Pack is the player's 16-slot carried container: ore goes in as it is mined,
rocks and sticks as they are gathered, and everything in it is lost on death.
It glows amber as ore fills it, slows the player by up to 35% as it fills, and
shows its worth as the largest number on screen. The player picks up loose
items with Interact and drops them on a run with G or a right-click; at home
it empties only into a stash or by spending.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Ore & Item Economy, Session & Authority, Input`

## Overview

The Pack is the box on the player's back: 16 slots that hold everything they
carry except their tools. On a run, ore goes into it as each piece breaks free;
it glows brighter as ore fills it, slows the player as it fills, and is lost
entirely if the player dies or quits before extracting. At home it holds rocks
and sticks gathered from the valley and the haul until it is moved into a
stash. The player uses it constantly: by filling it (Mining and Gathering put
things in), by opening it (Tab) to see and drop what is inside, by picking up
loose items, and by feeling its weight.

Underneath, it is one container in Ore & Item Economy's sense (that doc's R4:
"A player's pack | Pack | 16 | 1 | ore, material, item"). This doc owns its
values, its fill and glow, the pick-up and drop requests, and what the HUD's
pack box shows. It does not own how ore is mined (Mining), what a stash does
(Stash), the death rule (Run Flow), or how fast the player moves (Player
Controller applies the slow this doc defines).

Without it there is no haul: the pack is where "one more seam or leave now"
(the MVP's core hypothesis) is decided, because it fills, it shows the stake,
and it can be lost (Pillar 1, Pillar 3).

## Player Fantasy

**Framing:** Direct. The player watches the pack, chooses what goes in it, and
feels its weight.

**Creative-direction lens applied** (`lens-creative-director.md`, in-session,
no agent spawned). Three candidate framings:

1. **"My fortune, on my back."** Anchor moment: deep in the asteroid, the pack
   box bottom-right reads 590 and glows amber, and the ship is a long walk away.
   Pillar 1: *"Every system exists to make loot more desirable or getting it
   home more tense."* Asks of the design: the worth number is the biggest thing
   on the HUD (art bible, Section 7), the glow is visible in the world, and
   everything in the pack is lost on death.
2. **"Sixteen choices."** Anchor moment: the pack is full, a richer seam is
   right there, and the player opens the pack to drop a cheap ore for it.
   Ore & Item Economy's fantasy: *"every slot in your pack is a choice you can
   price on sight"*. Asks of the design: drop must be quick, ore keeps one slot
   per piece, worth reads by colour.
3. **"Bottomless bag."** Rejected: it removes the choice and the stake (a clash
   with Pillars 1 and 3, not a style choice).

**Chosen (autonomous, recommended):** framing 1, with framing 2 as the
decision it creates.

> *The pack is your fortune made visible and made vulnerable. Every piece of
> ore you break free lands in it with a pop, the number climbs, the glow on
> your back brightens, and your stride gets heavier. When it is full, getting
> more means choosing what to leave behind. When you die, all of it stays on
> the rock.*

What it serves:

- **Pillar 1.** The pack's worth is the largest number on screen and its glow
  is visible on the player's back (a teammate's, later); its fill slows the
  player, so value carried is pressure felt.
- **Pillar 3.** Death or quitting empties it (Run Flow's death sink, Ore & Item
  Economy R8); nothing in this doc softens that.
- **Pillar 2.** The stake is always readable before it is risked: worth and
  "at risk" are always on screen during a run.

## Detailed Design

### Core Rules

**Specialist lenses applied before drafting** (in-session, no agents spawned).
The `Gameplay` routing rows do not name inventory; the closest row is
**Economy, loot, crafting**, used with `game-designer` as primary because the
pack is operated moment to moment: `game-designer` (primary),
`economy-designer`, `systems-designer`, plus `ux-designer` for the panel and
the HUD box.

- **game-designer.** The pack exists for one decision, repeated: take this,
  leave, or swap. Sixteen ore slots and the speed penalty were retested in the
  prototype (round 2: full-pack slow raised from 0.2 to 0.35). *Warning:* any
  auto-sort, auto-drop or "smart" pick-up that decides for the player removes
  the decision.
- **economy-designer.** The pack is the carried half of the economy and the
  only container the death sink touches. Rocks and sticks are worth 0, so a
  pack of rocks must not glow or count as haul (Ore & Item Economy, R9).
  *Warning:* dropping at home would put items in the valley that the save does
  not hold (it keeps containers, not loose items), so they would vanish on
  reload: an unlisted sink.
- **systems-designer.** Every change is an Ore & Item Economy operation inside
  an accepted request; pick-up from the world is atomic (Economy, R7). Fill
  must be counted in slots, not units, or 20 sticks would weigh twenty times
  one ore.
- **ux-designer.** The pack box (bottom-right, art bible Section 7) shows
  worth, fill and glow; the panel on a run must not trap the player (Input:
  "Run Pack is not modal"). Dropping must be one key and must say what it
  dropped.

**Tensions found and how they were settled** (autonomous mode: the recommended
option, logged; the designer reviews at the first playable):

| Tension | Options | Chosen |
|---|---|---|
| What makes the pack glow? (art bible: "glows brighter as it fills" · Economy: only ore glows) | A: slots filled with anything · B: slots holding something worth more than 0 · C: worth | **B.** Brighter as it fills, as the art bible says, and a pack of rocks stays dark, as Economy says. Worth itself is the number |
| What counts as fill for the slow? | A: slots filled · B: units carried · C: worth | **A.** The prototype's rule; a slot of 20 sticks weighs as much as one ore. Simple and readable |
| Dropping at home (economy-designer's warning) | A: drop into the valley as on a run · B: no drop at home; move to a stash instead · C: a discard that destroys | **B.** No loose items at home, so the save loses nothing. A full pack at home is emptied into a stash or spent by building |
| What Drop Item (G) drops with the panel closed | A: the last filled slot · B: a slot selected on the HUD | **A.** "The last thing you picked up", named in the box; the panel can drop any slot |
| Picking up loose items | A: walk over to collect · B: Interact (E) on the item | **B.** Never fills the pack by accident while fleeing; every pick-up is a choice |

---

**R1. The pack container.** Each player has one pack, an Ore & Item Economy
container (its R4) with:

| Property | Value | Notes |
|---|---|---|
| `container_id` | `carried.<playerId>.pack` | Economy, R4 |
| `owner` | that player | Only their own requests touch it (Economy, R4) |
| `slots` | `pack_slots`, 16 | Prototype `pack_slots`, retested |
| `stack_scale` | 1 | One ore piece per slot; 20 rocks or sticks; 2 canisters (Economy, R11) |
| `accepts` | ore, material, item | Tools live in the carried tool slots (Tools & Gear) |

It is created with the profile, never removed, and saved in `carried` at home
(Save & Load, R2). During a run it is not saved; the run marker lists what was
in it at launch (ADR-0003, Decision 3).

**R2. What fills it.** Units enter the pack only through Economy operations in
accepted requests:

- **Mining** adds a piece of ore when it breaks free (`Add(ore, 1)`); if there
  is no room, Mining puts the piece in the world (Economy, Interactions).
- **Gathering** adds rocks or sticks from a valley spot (`Add`, partial).
- **Pick up** (R4) adds a loose unit lying in the world.
- **Stash** moves items from a stash into the pack at home (`Move`).
- **Crafting** may place its output in the pack (`Exchange`), as Crafting
  decides.
- **Run Flow** may place the haul in the pack, if its design does so.

**R3. What empties it.**

- **Drop** (R5) puts units into the world on a run.
- **Stash** moves units from the pack into a stash at home (`Move`, Quick
  Move).
- **Building, Crafting** spend costs from it (`TakeCost`, `Exchange`), in the
  source order they define.
- **Oxygen** takes a canister when one is used (`Take`).
- **Run Flow** clears it on death or an abandoned run (`Clear`, death sink,
  Economy R8).

**R4. Picking up a loose unit.** Loose units lie in the world on a run: ore that
did not fit when mined, and anything dropped. The player looks at one and
presses Interact (E). The request `PickUp(worldUnitId)` is checked by Pack:

1. **Too far** if the player's reported position (Player Controller, R8) is
   more than `pickup_range_m` from the unit. (Refusal reason owned here.)
2. Otherwise `Add` up to the unit's count. If none fits: **No room** (Economy).
   If some fit, the rest stays in the world as a smaller loose unit.
3. The unit leaves the world in the same step (Economy, R7).

At home there are no loose units (R5), so pick-up applies only on a run.
Gathering's valley spots are not loose units; they are Gathering's.

**R5. Dropping.** On a run, the player drops in two ways:

- **Drop Item (G), panel closed:** drops the whole stack in the **last filled
  slot** (the highest-index filled slot, usually the last thing picked up,
  because `Add` fills in slot order). The pack box names what will drop (UI
  Requirements).
- **Alternate Click (right mouse) in the pack panel (Run Pack):** drops the
  whole stack in the clicked slot.

The request `Drop(slot)` takes that slot's whole stack and creates a loose unit
in the world `drop_distance_m` in front of the player, on the ground. It is
refused **Not enough** if the slot is empty (Economy), and **Can't drop here**
at home (refusal reason owned here), shown as "Put it in a stash". A dropped
unit can be picked up again (R4) until the run's world is unloaded, when it is
lost with the world (Economy, R10: not a sink).

**R6. Fill and weight.** The pack's **fill** is the share of its slots that
hold anything (F1), from 0 to 1. Player Controller reads it with
`full_pack_slow` (both owned here) and slows the player by up to 35% (F2;
Player Controller, F1). Fill counts slots, not units: 20 sticks in one slot
weigh as one ore. The slow applies at home and on a run alike (Player
Controller, R5; its Open Question 8 asks whether it should at home).

**R7. Glow.** The pack glows Haul Amber on the player's back (seen by
teammates, later) and its HUD box brightens, in proportion to the share of
slots holding something worth more than 0 (F3). A pack of rocks, sticks and
canisters does not glow. The glow is presentation only; no rule reads it.

**R8. The readouts.** During a run the pack box always shows the pack's
**worth** (Economy, F5), the largest number on screen (art bible, Section 7),
and **at risk** (Economy, R9: worth plus the replacement worth of carried
tools and canisters). At home it shows worth only (nothing is at risk at
home). It also shows fill as filled slots out of 16.

**R9. The pack panel.** Open Pack (Tab) opens the panel:

- **On a run (Run Pack):** not modal. Move, Sprint and Use Canister stay live;
  Look and tools stop; the cursor is free (Input, R4). The panel shows the 16
  slots in slot order (no sorting, Economy R6), each with its item and count,
  the worth and at-risk readouts, and which slot Drop Item (G) would drop.
  Right-click drops (R5).
- **At home (Panel):** modal. The same view without drop; worth only. When a
  stash or workbench is open, its panel shows the pack beside it and owns the
  moves (Stash, Crafting).
- Closing: Open Pack again, Escape, or Close Panel (Input).

**R10. What the pack does not do in the MVP.** No sorting, splitting, slot
dragging, auto-pickup, auto-drop, using items from the pack (canisters are
used with Q, Oxygen), weight per item, or size upgrades. Pack size upgrades
are a Tier 1a gear question (Open Questions, 3).

### States and Transitions

A pack slot is Empty or Filled (Ore & Item Economy, States). The pack:

| State | Meaning | Saved? |
|---|---|---|
| **At home** | Session At Home: pick-up has nothing to pick, drop is refused (Can't drop here), stash and crafting moves allowed | Yes, in `carried` at every save point |
| **On a run** | Session In Run: pick-up and drop allowed | No; the run marker holds its launch contents |
| **Frozen** | Launching Run, Ending Run or paused: every Pack request refused by the session check (Session & Authority, R5) | — |

| From | To | Trigger |
|---|---|---|
| At home | On a run | The run launches; the run marker records the pack's contents (ADR-0003, Decision 3) |
| On a run | At home | Extraction: the pack keeps its contents (the haul is then placed per Run Flow and Stash) |
| On a run | At home, emptied | Death, or an abandoned run found at start-up: `Clear(death)` (Run Flow) |
| At home or On a run | Frozen | Session state or pause |
| Frozen | The state it left | The session allows requests again |

The panel is Closed, Open on a run (not modal) or Open at home (modal).
Entering Frozen closes it (Input).

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Ore & Item Economy (4) | In | The container contract, operations, refusals, worth (F5), at risk (R9) | Ore & Item Economy |
| Session & Authority (2) | In | Requests `PickUp` and `Drop`; the session check; save points at home | Session & Authority |
| Input (3) | In | Open Pack, Drop Item, Interact, Alternate Click; the Run Pack and Panel contexts | Input |
| Player Controller (6) | Both | Out: fill and `full_pack_slow` (R6). In: position for the pick-up range | Pack owns the values; Player Controller applies them |
| Mining (21) | In | `Add(ore, 1)` on break; overflow goes to the world | Mining |
| Gathering (10) | In | `Add` rock or stick | Gathering |
| Stash (12) | Both | `Move` between pack and stash; the stash panel shows the pack | Stash |
| Building (11), Crafting (13) | Out | The pack as a cost source; Crafting's output target | Building, Crafting |
| Oxygen (19) | Out | `Take(item.canister.oxygen, 1)` | Oxygen |
| Run Flow (22) | Both | `Clear(death)`; worth at launch and at extraction for haul worth (Economy, R9) | Run Flow |
| Save & Load (7) | Out | The pack in `carried`, at home | Save & Load (frame); Pack (contents) |
| Run HUD (24), Home HUD & Panels (15) | Out | The pack box: worth, at risk, fill, glow, the next drop | The HUDs place it; Pack defines it |
| Visual Feedback & Lighting (25) | Out | Glow level (F3) | Visual Feedback & Lighting |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable put at its minimum, its maximum and 0. One intended loop: a
fuller pack is slower (F2), which makes carrying more riskier; the player damps
it by leaving or dropping. No positive loop. Worth and at risk are Ore & Item
Economy's (its F5 and R9) and are not restated.

### F1. Fill

The `pack_fill` formula is defined as:

`fill = filled_slots / pack_slots`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| filled_slots | int, `count` | 0 to `pack_slots` | calculated | Slots holding anything (any count) |
| pack_slots | int, `count` | 8 to 40 | data file (`tuning.pack`) | Slots in the pack |
| fill | float, share | 0 to 1 | calculated | How full the pack is |

**Output Range:** 0 (empty) to 1 (every slot used), in steps of 1/16 with MVP
values.
**Boundaries:** `pack_slots` has no 0 in range, so no division by zero.
Overflow slots (Economy, Edge Cases: after a patch lowers capacity) are not
counted, so fill never exceeds 1.
**Example:** 12 slots of ore and 1 slot of 20 sticks: 13 / 16 = **0.8125**.

### F2. Speed factor passed to Player Controller

The `pack_speed_factor` formula is defined as:

`factor = 1 − full_pack_slow × fill`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| full_pack_slow | float, share | 0 to 0.6 | data file (`tuning.pack`) | Share of speed lost when full |
| fill | float, share | 0 to 1 | calculated (F1) | How full the pack is |
| factor | float | 0.4 to 1 | calculated | Multiplier on walk and sprint speed (Player Controller, F1) |

**Output Range:** 1 (empty) to 0.65 (full, MVP value); never below 0.4 at the
range limits, so a full pack never stops the player.
**Boundaries:** `full_pack_slow` = 0 makes the pack weightless (allowed for a
playtest; it removes the escape crossover, F4). At 0.6 a full pack moves at
40% speed.
**Example:** fill 0.8125: 1 − 0.35 × 0.8125 = **0.716**; sprint 6.2 × 0.716 =
4.44 m/s.

### F3. Glow

The `pack_glow` formula is defined as:

`glow = valued_slots / pack_slots`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| valued_slots | int, `count` | 0 to `pack_slots` | calculated | Slots holding an item whose worth is above 0 (ore in the MVP) |
| pack_slots | int, `count` | 8 to 40 | data file | Slots in the pack |
| glow | float, share | 0 to 1 | calculated | Glow level handed to Presentation |

**Output Range:** 0 (no ore) to 1 (every slot ore). Presentation maps it to
brightness (Visual/Audio); the mapping is art, not rules.
**Boundaries:** a pack full of rocks has glow 0 and fill 1: heavy and dark, by
design (Economy, R9). Glow never depends on which ore, so tier reads from the
worth number and the ore's own colour, not the glow.
**Example:** 12 ore and 1 stick slot: glow 12 / 16 = **0.75**.

### F4. Escape crossover (design check)

The `escape_crossover_fill` formula is defined as:

`f* = (1 − burrower_speed / sprint_speed) / full_pack_slow`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| burrower_speed | float, m/s | 1 to 10 | data file (Creature AI) | The fastest chaser in the MVP |
| sprint_speed | float, m/s | 3 to 12 | data file (Player Controller) | Empty-pack sprint |
| full_pack_slow | float, share | 0 to 0.6 | data file | This doc's slow |
| f* | float, share | any; meaningful 0 to 1 | calculated | Fill at which a sprinting player can no longer outrun a burrower |

**Output Range:** 0.83 with MVP values (13.3 of 16 slots). A validation warning
(not a refusal) is raised if `f*` falls outside 0.6 to 0.95: below 0.6 the
player is caught with a half-full pack; above 0.95 (or with `full_pack_slow`
= 0, where `f*` is undefined and treated as infinite) a full pack still
escapes and the pack's weight stops mattering for safety.
**Boundaries:** `burrower_speed ≥ sprint_speed` gives `f*` ≤ 0: even an empty
pack is caught; warned. `full_pack_slow` = 0 divides by zero: reported as "no
crossover".
**Example:** (1 − 4.4 / 6.2) / 0.35 = 0.2903 / 0.35 = **0.829**: with 13 slots
full the player still escapes (4.44 m/s); with 14 (fill 0.875, 4.30 m/s) they
do not.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included.

**Filling**

- **If a piece of ore breaks free with the pack full**: Mining puts it in the
  world at the seam (Economy, Interactions); the player can drop something and
  pick it up (R4, R5).
- **If a pick-up only partly fits** (a dropped stack of 20 sticks, room for
  7): 7 enter, 13 stay in the world as a smaller loose unit.
- **If two players pick up the same loose unit in one tick** (co-op, later):
  arrival order (Session & Authority, R4); the second gets what is left or
  **No room**/nothing. A unit never splits into more than it held.
- **If the player is just outside `pickup_range_m`**: Too far. The interact
  prompt (Gathering's and Pack's shared cream rim) is shown only within range,
  so a refusal is rare.

**Dropping**

- **If Drop Item is pressed with an empty pack**: refused, Not enough; nothing
  shown but a short "Pack empty" hint.
- **If the drop point is inside a wall or off a ledge** (the player faces a
  wall): the unit is placed at the nearest open ground between the player and
  the drop point; never inside geometry.
- **If the player drops a canister**: allowed; it is an item like any other.
- **If the player drops at home**: refused, Can't drop here ("Put it in a
  stash").
- **If loose units are left when the run ends** (extraction or death): they are
  lost with the run's world (Economy, R10: not a sink, not counted as haul).

**Weight and glow**

- **If the pack holds only rocks and sticks**: full weight (fill counts slots),
  no glow. Accepted: rocks are heavy, not valuable.
- **If a patch lowers `pack_slots` below the filled count** (an old save):
  overflow slots (Economy, Edge Cases) hold the extra; fill and glow are capped
  at 1; nothing is deleted. The player empties overflow into a stash.
- **If `full_pack_slow` is set to 0 in a playtest**: no slow; F4 reports no
  crossover.

**Death, quit, launch**

- **If the player dies with the panel open**: the panel closes (Frozen), the
  pack is cleared by Run Flow.
- **If the player quits mid-run**: the next start resolves the run as abandoned
  and the pack's launch contents, already listed in the marker, are lost
  (ADR-0002, Decision 4). Anything picked up during the run was never saved
  and is gone too.
- **If the player launches a run with rocks in the pack**: allowed; they take
  slots and weight on the run and are at risk (worth 0) like everything else
  (ADR-0003, Decision 3: the marker lists them).
- **If the player extracts with a full pack**: the haul is placed per Run Flow
  and Stash; the pack's contents are counted for haul worth before anything
  moves (Economy, R9).

**Degenerate strategies checked**

- **Dropping ore to sprint away, then coming back for it**: allowed and good:
  a real choice with a cost (time, risk of losing it when the run ends).
- **Leaving the pack at home empty to be fast on runs**: the pack starts empty
  anyway; no gain.
- **Stuffing the pack with rocks to "hide" ore worth**: no effect; worth is the
  sum of ore worth.
- **Filling slots with single sticks to block ore pick-up on purpose**: no
  benefit to the player.

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Ore & Item Economy (4) | Hard | Container contract (R4), operations and refusals (R6), worth (F5), at risk (R9), death sink (R8) | Designed (Needs Revision, revised by the review session; this doc uses its revised R4 ids and owners) |
| Session & Authority (2) | Hard | Requests and the session check | Designed (Needs Revision) |
| Input (3) | Hard | Open Pack, Drop Item, Interact, Alternate Click; Run Pack and Panel contexts | Designed (Needs Revision) |
| Player Controller (6) | Soft | Position for the pick-up range | Designed (Needs Revision) |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Player Controller (6) | Hard | Fill and `full_pack_slow` | Designed: its F1 and Tuning Knobs name Pack as owner, matching |
| Gathering (10) | Hard | The pack as the target of `Add` | Not written: provisional |
| Mining (21) | Hard | The pack as the target of `Add(ore, 1)` | Not written: provisional |
| Stash (12) | Hard | The pack beside the stash; `Move` | Not written: provisional |
| Run Flow (22) | Hard | `Clear(death)`; worth at launch and extraction | Not written: provisional |
| Oxygen (19) | Hard | Canisters in the pack | Not written: provisional |
| Run HUD (24), Home HUD & Panels (15) | Hard | The pack box | Not written: provisional |
| Save & Load (7) | Hard | The pack in `carried` | Designed: its R2 names Pack as owner of `carried`, matching |
| Building (11), Crafting (13) | Soft | The pack as a cost source and output target | Not written: provisional |
| Visual Feedback & Lighting (25) | Soft | Glow level | Not written: provisional |

Bidirectional check: Ore & Item Economy's Interactions list "Pack (8) | Out |
Each player's pack is a container (16 slots, scale 1)", matching. Game Data &
Tuning lists `tuning.pack` (pack_slots 16, full_pack_slow 0.35) with Pack as
owner, matching. The systems index lists Pack's Depends On as Session &
Authority and Ore & Item Economy, matching this doc's hard upstreams; Input and
Player Controller are not listed (Open Questions, 4).

## Tuning Knobs

### This system's tuning set: `tuning.pack`

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `pack_slots` | int | 16 | 8 | 40 | 1 | count | restart | Every seam forces a drop; runs end at once | No choice; the 16-slot tension is gone | *Prototype*, retested (Economy, R4) |
| `full_pack_slow` | float | 0.35 | 0 | 0.6 | 0.05 | share | live | Weight not felt; F4 crossover above 0.95 | Trudging; F4 crossover below 0.6 | *Prototype*, raised from 0.2 in retest round 2 |
| `pickup_range_m` | float | 2.5 | 1.0 | 5.0 | 0.1 | m | live | Fiddly pick-ups | Picks up through walls of rock | Arm's reach plus a step; below Mining's 3.6 m |
| `drop_distance_m` | float | 1.0 | 0.5 | 3.0 | 0.1 | m | live | Drops at the feet, hard to see | Drops out of sight | In view, easy to pick up again |

**Constraint:** none between these keys. **Interacts:** `full_pack_slow` with
Player Controller's `sprint_speed` and Creature AI's `burrower_speed` (F4):
name all three in any balance pass. `pack_slots` with every ore's `stack_max`
(Economy): ore at 1 per slot is what makes 16 slots a choice.

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `stack_max` per item, `worth` | Ore & Item Economy | Slot capacity; worth; glow (F3) |
| `sprint_speed` | Player Controller | F4 |
| `burrower_speed` | Creature AI | F4 |
| `canister_carry` | Oxygen | How many canisters may be carried |

## Visual/Audio Requirements

**Art-director lens applied** (`lens-specialists.md`, Visual/Audio row; art
bible Sections 1, 4, 5 and 7 read by heading). Required for this `Gameplay`
system.

**Art bible principles that apply most directly:**

- **Visual rule:** "The most saturated thing on screen is always something you
  could carry home." The pack's glow is Haul Amber `#FFAE00`, "the pack glow:
  fortune" (Section 4).
- **Section 5:** the pack is "the only box on a living silhouette", square and
  straight-edged, and "its glow shows each teammate's stake".
- **Section 7:** the pack box sits bottom-right, "a filling box with its worth
  as a number"; the worth is "the largest text on screen"; "The worth ticks up
  with a small pop for each ore; the pack box brightens as it fills"; on death
  "the HUD drains to grey with the world".

**Visual feedback for this system's events:**

| Event | What the player sees | Constraint |
|---|---|---|
| Ore enters the pack | The piece flies to the pack (Mining owns the flight); the worth number ticks up with a small pop; one more slot segment fills in the box | Fixed-width digits, so the number does not jitter |
| Rock, stick or canister enters | A slot segment fills; no pop on the worth, no glow change | Worth 0 must look like worth 0 |
| Glow rises (F3) | The box's amber brightens; on a teammate (later) the pack's back panel glows amber, visible at 30 m (Section 5, Detail at distance) | Uses bloom (art bible, Section 8: bloom-dependent glow needs the performance check) |
| Drop | The stack appears on the ground in front with a soft thud; the worth ticks down; the slot empties | No magenta, no warning colour: dropping is a choice, not a danger |
| Pick-up refused (No room, Too far) | A short text hint at the centre ("Pack full", "Too far") | Not by colour alone |
| Death | The box drains to grey with the world (Section 7) | — |
| Pack panel | Slate panel (Section 7, home screens), 16 slots in a 4 × 4 grid in slot order, item icons with counts, worth and at risk at the top, the next-drop slot outlined in cream | Item icons follow Section 7: flat, rounded outlines; ore icons carry the ore's colour, the only colour in the panel |

**Audio:** a small, bright pop for each ore entering (pitch rising slightly
with the pack's worth band, so a rich pack sounds richer); a dull tap for rocks
and sticks; a soft thud for a drop; a muted "full" knock when a pick-up or a
mined piece finds no room. The pack makes no sound the creatures hear in the
MVP (Perception owns noise; carrying is silent).

> 📌 **Asset Spec** — Visual/Audio requirements are defined. After the art
> bible is approved, run `/asset-spec system:pack` to produce per-asset visual
> descriptions, dimensions, and generation prompts from this section.

## Game Feel

Required for this `Gameplay` system.

- **Every gain is felt.** Each ore entering the pack produces the pop, the
  tick and a filled segment within one frame of Mining's add (no batching).
- **The stake is glanceable.** Worth, at risk and fill are readable in under
  half a second without opening the panel; the worth number is the largest
  text on screen.
- **Dropping is instant.** Drop Item (G) acts on the press with no hold and no
  confirmation; the box names what will drop, so there is nothing to confirm.
- **Weight is felt in the legs, not shown in a meter.** No weight bar: the
  slow (F2) is the feedback (Player Controller, Game Feel: noticed within 3 s).
- **The panel never traps.** On a run, opening the pack never stops the
  player's legs (Input: Run Pack is not modal); closing it returns the view at
  once.

## UI Requirements

- **Pack box (HUD, bottom-right):** worth (largest text), at risk (run only,
  smaller), filled slots "13 / 16" as 16 segments, amber brightness from F3,
  and the item that Drop Item (G) would drop with its key hint. Placed by Run
  HUD on a run and Home HUD & Panels at home.
- **Pack panel:** 4 × 4 slots in slot order, icon and count per slot, worth and
  at risk, next-drop outline; right-click drops (run only); keyboard Navigate
  and Confirm reach every slot (Input). At home, no drop.
- **Hints:** "Pack full", "Too far", "Pack empty", "Put it in a stash", each a
  short centre text for about 1.5 s.
- **Interact prompt on a loose unit:** the shared cream rim and "E  Pick up
  [item] × [count]", only within `pickup_range_m`.

> 📌 **UX Flag — Pack**: This system has UI requirements. In Phase 4
> (Pre-Production), run `/ux-design` to create a UX spec for each screen or
> HUD element this system contributes to **before** writing epics: the pack
> box in `design/ux/hud.md` and the pack panel. Stories that reference UI
> should cite `design/ux/[screen].md`, not the GDD directly.

## Cross-References

| This doc | References | Mechanic, value or rule | Where |
|---|---|---|---|
| R1 to R5, F3 | Ore & Item Economy | Container contract (R4), operations and refusals (R6), ledger and world (R7), death sink (R8), worth and at risk (R9, F5), loose units not a sink (R10), stack sizes (R11) | [ore-and-item-economy.md](ore-and-item-economy.md) |
| R4, R5, R9 | Input | Open Pack (Tab), Drop Item (G), Interact (E), Alternate Click; Run Pack not modal | [input.md](input.md) |
| R4, R5, States | Session & Authority | Requests, the session check | [session-and-authority.md](session-and-authority.md) |
| R6, F2, F4 | Player Controller | F1 applies the factor; position for range; sprint speed | [player-controller.md](player-controller.md) |
| R1, States | Save & Load | `carried` part (R2) | [save-and-load.md](save-and-load.md) |
| R1, States, Edge Cases | ADR-0002, ADR-0003 | Leaving a run is a death; the marker lists the pack at launch; the pack is not saved during a run | [adr-0003-home-and-storm-persistence.md](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| Tuning Knobs | Game Data & Tuning | `tuning.pack` starting values; Pack owns `full_pack_slow` | [game-data-and-tuning.md](game-data-and-tuning.md) |
| Visual/Audio, UI | Art bible | Visual rule, Haul Amber, Sections 5 and 7 | [art-bible.md](../art/art-bible.md) |
| Player Fantasy | Game concept | Pillars 1, 2, 3; core hypothesis | [game-concept.md](game-concept.md) |

## Acceptance Criteria

**QA-lead lens applied** (`lens-qa-lead.md`). Every rule R1 to R10 and formula
F1 to F4 has at least one criterion. Story types: **Logic** (EditMode, against
the container model), **Integration**, **Visual**, **Playtest**. Gaps fixed in
the first draft: no criterion for the drop point inside a wall; no conservation
check across a drop and pick-up.

**Container (R1, R2, R3)**

1. **GIVEN** a new profile, **THEN** its pack has id
   `carried.<playerId>.pack`, 16 empty slots, scale 1, and accepts ore,
   material and item but refuses a tool with Can't go there. *(Logic)*
2. **GIVEN** an empty pack, **WHEN** Mining adds `ore.ochre` 16 times, **THEN**
   16 slots each hold 1; **WHEN** a 17th breaks free, **THEN** the pack is
   unchanged and Mining reports the piece to the world. *(Logic, with Mining's
   contract)*
3. **GIVEN** a pack with 3 sticks in slot 0, **WHEN** Gathering adds 20 sticks,
   **THEN** slot 0 holds 20 and slot 1 holds 3. *(Logic)*

**Pick-up and drop (R4, R5)**

4. **GIVEN** on a run a loose `ore.gild` 2.0 m away, **WHEN** the player picks
   it up, **THEN** it is in the pack and gone from the world in the same tick;
   **AND GIVEN** it is 3.0 m away, **THEN** the request is refused Too far.
   *(Logic + Integration)*
5. **GIVEN** a loose stack of 20 sticks and room for 7, **WHEN** picked up,
   **THEN** 7 enter and a loose stack of 13 remains. *(Logic)*
6. **GIVEN** on a run a pack whose highest filled slot holds `ore.verdite`,
   **WHEN** Drop Item is pressed, **THEN** that slot empties and a loose
   `ore.verdite` lies 1.0 m in front of the player on the ground; **AND WHEN**
   it is picked up again, **THEN** the ledger shows world → pack → world →
   pack and no unit was created or lost. *(Logic)*
7. **GIVEN** the pack panel open on a run, **WHEN** slot 4 is right-clicked,
   **THEN** slot 4's whole stack is dropped. *(Integration)*
8. **GIVEN** at home, **WHEN** Drop Item is pressed, **THEN** the request is
   refused Can't drop here and the hint "Put it in a stash" shows. *(Logic)*
9. **GIVEN** an empty pack on a run, **WHEN** Drop Item is pressed, **THEN** it
   is refused Not enough and "Pack empty" shows. *(Logic)*
10. **GIVEN** the player facing a wall 0.4 m away, **WHEN** they drop, **THEN**
    the unit lies on open ground between player and wall, not inside it.
    *(Integration)*
11. **GIVEN** loose units left in the world, **WHEN** the run ends by
    extraction, **THEN** they are not in any container or the haul worth.
    *(Integration with Run Flow)*

**Fill, slow and glow (R6, R7, F1, F2, F3)**

12. **GIVEN** 12 ore slots and 1 stick slot, **THEN** fill is 0.8125, the speed
    factor 0.716 (± 0.001) and glow 0.75. *(Logic)*
13. **GIVEN** 16 slots of rock, **THEN** fill 1, factor 0.65, glow 0. *(Logic)*
14. **GIVEN** an empty pack, **THEN** fill 0, factor 1, glow 0. *(Logic)*
15. **GIVEN** `pack_slots` lowered to 12 under a save with 14 filled slots,
    **THEN** fill and glow are 1, and the 2 extra stacks sit in overflow slots
    untouched. *(Logic)*
16. **GIVEN** fill 0.8125, **WHEN** the player sprints forward, **THEN** Player
    Controller's speed is 4.44 m/s ± 0.05. *(Integration with Player
    Controller)*

**Readouts and panel (R8, R9)**

17. **GIVEN** on a run a pack with 6 ochre, 5 gild, 2 sunstone and 3 sticks and
    a basic drill carried, **THEN** the box shows worth 475 and at risk 475 plus
    the drill's replacement worth (Economy, R9), and "14 / 16" filled
    segments. *(Logic + Visual)*
18. **GIVEN** at home, **THEN** the box shows worth and fill but not at risk.
    *(Visual)*
19. **GIVEN** the pack panel open on a run, **WHEN** the player holds W and
    Shift, **THEN** they move and sprint; the view does not turn with the mouse.
    *(Integration with Input)*

**Death and launch (States)**

20. **GIVEN** a pack with ore on a run, **WHEN** the player dies, **THEN** the
    pack is empty, the ledger records a death sink for every unit, and the panel
    is closed. *(Integration with Run Flow)*
21. **GIVEN** 40 rocks in the pack at home, **WHEN** a run launches, **THEN** the
    run marker lists them; **AND WHEN** the process is killed and restarted,
    **THEN** they are lost and listed in the abandoned-run notice. *(Integration
    with Save & Load)*

**Design check and feel (F4)**

22. **GIVEN** sprint 6.2, burrower 4.4, slow 0.35, **WHEN** validation runs,
    **THEN** F4 reports 0.829 and no warning; **AND GIVEN** slow 0.6, **THEN**
    0.484 and a warning; **AND GIVEN** slow 0, **THEN** "no crossover" and a
    warning. *(Logic)*
23. **GIVEN** the default HUD at 1920 × 1080, **WHEN** screenshots are taken with
    an empty pack, a pack of rocks and a pack of 12 ore, **THEN** the worth is
    the largest text, the rocks pack has no amber glow, and the ore pack's box
    is visibly brighter. *(Visual)*
24. **GIVEN** five testers on a test asteroid, **WHEN** asked after a run,
    **THEN** at least 4 can say their pack's worth at the moment they turned
    back without opening the panel. *(Playtest; Milestone B)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | No drop at home: a player whose pack is full of rocks, with no stash yet, can only build or craft to make room. Is a home discard (rocks and sticks only, a new sink row in Ore & Item Economy R10) wanted? | Designer, Ore & Item Economy | First playable |
| 2 | Does the haul at extraction go into the pack or straight to a stash? Run Flow and Stash decide; the pack works either way (ADR-0003, Decision 6). | Run Flow (22), Stash (12) | Their design docs |
| 3 | Pack size upgrades (more slots) are a natural Tier 1a gear item. Out of the MVP; `pack_slots` stays a tuning value until then. | Designer, Tools & Gear | Tier 1a planning |
| 4 | The systems index's Depends On for Pack lists Session & Authority and Ore & Item Economy but not Input (Open Pack, Drop Item) or Player Controller (position for range). Add them, or record why not. | `/map-systems` (producer) | Next systems-index update |
| 5 | Should glow use worth instead of ore-slot count, so a pack of tier-3 ore glows brighter than tier-1? Kept by slot count for readability; the worth number carries tier. | art-director, designer | First playable with runs |
| 6 | The pop's pitch rising with worth band needs a band definition (Audio). | audio-director | Audio design doc |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Player Fantasy: "My fortune, on my back", with "Sixteen choices" as the
   decision it creates.
2. Glow by the share of slots holding something worth more than 0.
3. Fill counts slots, not units (the prototype's rule).
4. **No drop at home.** *Major: a full pack at home empties only into a stash
   or by spending.*
5. Drop Item (G) drops the whole stack in the last filled slot; the panel drops
   any slot by right-click.
6. Loose items are picked up with Interact, never by walking over them.
7. Prototype values kept: 16 slots, full-pack slow 0.35.
8. Pick-up range 2.5 m; drop distance 1.0 m.
9. The escape crossover (F4) is a validation warning outside 0.6 to 0.95.
10. No sorting, splitting, dragging, auto-pickup or size upgrades in the MVP.
