# Gathering

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 3 (Bright world, real stakes: a loss never ends a save), Pillar 5 (Home is the scoreboard)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-28 — run in-session as a checklist (no agent spawned). Pillar 3's "never ends a save" is served by rules: gathering needs no tool, is blocked only by a full pack, and keeps the rebuild inside Home Valley's 300 s gathering budget (R1, R8, R9, F2, criterion 20). Pillar 5 by the home being built from units the player carried by hand, with walking to spots kept meaningful (stock, not pick rate, limits a session: F2). Pillar 1 is protected, not weakened: gathered things are worth 0 and never glow (R7). Pillar 2 is untouched (no danger at home from gathering). No anti-pillar crossed: no upkeep, no timer forcing anything, nothing granted. The Player Fantasy's moment (rebuilding after a death) is delivered by R4 and R9, not only by fantasy text.

## Summary

Gathering is how the player picks up rocks and sticks in the home valley: look
at a gather spot within 2.5 m, press E, and the whole spot (up to 3 units, as
much as the pack has room for) goes into the pack at once. It is the faucet
that every first shelter, workbench, hammer and basic drill is built from, and
the reason a death or a storm never ends a save: the valley always grows back.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Home Valley, Pack, Ore & Item Economy, Player Controller, Input`

## Overview

Gathering is the valley's one verb for getting materials: the player walks to a
gather spot (rocks at the foot of the slopes, sticks under the trees: Home
Valley, R4), looks at it, and presses Interact (E). In one step the spot's
units, up to what the pack can hold, move into the pack, a short pick-up
animation plays, and the spot shows what is left. There is no hold, no tool
and no mini-game: gathering is meant to be quick and calm, the rhythm of
"pluck, walk, pluck" between building and crafting.

Underneath, Gathering is a request (`Gather(spotId)`) that the host checks and
applies in one step: the session must be At Home (Session & Authority), the
player in range (this doc), the pack must have room (Ore & Item Economy, F3),
the spot must not be empty (Home Valley, R5). It then takes from the spot and
adds to the pack together, so a spot never loses units the pack did not get.
Home Valley owns the spots, their stock and their regrowth; Pack owns the
container; Gathering owns the action, its targeting, its range, its timing and
its feedback.

Without Gathering, Milestone A has no faucet: nothing could be built, and the
concept's promise that "bare hands plus rocks and sticks can always reach a
workbench, a hammer, a basic drill" (Recovery from failure) would have no rule
behind it. Gathering exists only at home in the MVP; the asteroid has no
gather spots.

## Player Fantasy

**Framing: direct.** The player does this with their own hands, often, and it
must feel good every time.

**Creative-director lens applied** (`lens-creative-director.md`, in-session):

1. **"Two hands and a valley."** *Moment:* after a death, the player arrives
   home with an empty pack and bare hands, walks to the tree line and scoops up
   three sticks, then three more; four minutes later a new basic drill sits on
   the bench. *Pillar 3: "It looks friendly and colourful; it plays
   seriously."* The sting of the loss is real, and the way back is always
   open. Asks of the design: gathering is fast and never blocked by anything
   but a full pack; the rebuild stays well inside the concept's 10 minutes.
2. **"Pluck, walk, pluck."** *Moment:* on a warm valley afternoon the player
   strolls the margin, each press of E a satisfying clack of stones into the
   pack, planning where the next wall goes. *Pillar 5: "Wealth is something you
   see and walk through, not a number."* The home grows from things the player
   carried with their own hands. Asks of the design: crisp, immediate feedback
   and no friction (no hold, no menu).
3. **"Rough start, rich finish."** *Moment:* the player looks from a rock and
   stick lean-to to the glinting amber pieces they just hauled home. *Pillar 1:
   "Home is part of this."* Gathering is the humble baseline that makes the
   haul shine. Asks of the design: gathered things stay plain (worth 0, no
   glow).

**Chosen: 1, "Two hands and a valley", with 2 as its feel** (logged). The
system's most important job is to make every loss recoverable, and its most
frequent job is to be pleasant: the fantasy is the reliable way back, and the
feel is an unhurried, satisfying rhythm. Framing 3 holds through Economy's
rules (worth 0, no glow) rather than anything here.

## Detailed Design

### Core Rules

**Specialist lenses applied** (`lens-specialists.md`, in-session). Category
Gameplay; the closest Section 6 row is *Camera, input, controls* (gathering is
an aimed interaction): game-designer primary, ux-designer and
gameplay-programmer supporting. Economy-designer's faucet view comes from Ore
& Item Economy's R10, already designed.

- **game-designer.** Gathering supports the home loop; its decision is only
  *where to walk next*, which Home Valley's spot layout and regrowth already
  shape. Keep the verb trivially easy: one press per spot, the whole spot at
  once. Warns: a hold or per-unit pick-up makes 80 units of rebuild a chore
  (27 presses already at 3 per spot).
- **ux-designer.** One button (E, shared with every Interact), a prompt only
  when the press would work, a result line that says what happened ("+3
  Rock"), and plain refusals (No room, Already taken). Nothing by colour
  alone: the cream rim is backed by the "E  Gather" prompt.
- **gameplay-programmer.** The take and the add must be one atomic request, or
  a crash between them loses or duplicates units. Targeting by the view ray
  against a sphere per spot (spots have no collision: Home Valley, Edge
  Cases), stopped by any collider in front. A short local lock stops a held or
  mashed E sending a stream of requests.

**Tensions put to the decision** (autonomous: recommended taken, logged):
(a) tap E and take the whole spot (chosen) or hold E for a timed pick-up;
(b) the player keeps moving during the pick-up animation (chosen) or is
rooted for it; (c) gathered units go to the pack only (chosen) or straight to
a nearby stash.

**R1. What can be gathered.** Only gather spots in the home valley (Home
Valley, R4): `gatherable.rock` (gives `material.rock`) and `gatherable.stick`
(gives `material.stick`), 3 units per full spot. There is nothing to gather on
a run in the MVP, and nothing else in the valley (trees, scenery rocks,
grass) is gatherable (Home Valley's decision: sticks are fallen sticks).

**R2. Targeting.** Each frame, Gathering casts Player Controller's view ray up
to `target_ray_m` (4.0 m). The **target** is the first gather spot whose
target sphere (radius `spot_target_radius_m`, 0.6 m, centred on the spot) the
ray enters, provided no collider (terrain, a built piece) is hit first. An
Empty spot is never a target (there is nothing there). If another
interactable (a stash, a workbench) is hit nearer, that one is the Interact
target instead: the nearest hit along the ray wins.

**R3. In range.** A target is *in range* when the player's reported position
(Player Controller, R8) is within `gather_range_m` (2.5 m) of the spot's centre
(F3), the same reach as Pack's pick-up. The interact prompt **"E  Gather"** and
the cream rim (Home Valley, Visual/Audio) are shown only when a spot is
targeted *and* in range.

**R4. The gather request.** Pressing Interact with a spot targeted sends
`Gather(spotId)`. The host checks and applies it in this order, all inside one
accepted request (Session & Authority, R4):

1. **Session.** Home actions are accepted only At Home (Session & Authority's
   intent table: otherwise Not now, Paused, Saving or Wrong place).
2. **Known spot.** An unknown spot id is Malformed (Session & Authority).
3. **Busy.** A second `Gather` from the same player within `gather_lock_s` of
   their last accepted one is refused as **Busy**, with no message (R6).
4. **Too far.** The player is not in range (F3): **Too far**.
5. **Room.** `n = min(yield, room)` (F1), where `room` is the pack's room for
   the spot's material (Ore & Item Economy, F3). If `n` = 0: **No room**
   (Economy's reason); the spot is not touched.
6. **Take.** `p = TakeFromSpot(spotId, n)` (Home Valley, R5). If the spot is
   empty: **Already taken** (Home Valley's reason).
7. **Add.** `Add(material, p)` into the player's pack (Economy, R6); it always
   fits, because `p ≤ n ≤ room`. The Gathering faucet posts `p` (Economy, R10:
   only the units placed).

Steps 6 and 7 are one change list: a save point after the request (Session &
Authority, R10) holds both or neither, so units are never lost or doubled.

**R5. Feedback on a result.** An accepted gather shows **"+p Rock"** or **"+p
Stick"** beside the crosshair for `result_text_s` (1.0 s) and plays the
pick-up animation and sound (Visual/Audio). If the pack's room stopped the
take short of what the spot held, the line reads **"+p Rock (pack full)"**.
Refusals: **No room** and **Already taken** are shown at the same place; Too
far is shown too but is rare (the prompt only appears in range); Busy shows
nothing.

**R6. The gather lock.** After an accepted gather, the player is in **Picking
up** for `gather_lock_s` (0.5 s): the pick-up animation plays and further
Interact presses on gather spots are not sent (the host's Busy check backs
this up). The player keeps full movement, look and sprint, and Interact on a
stash or workbench is still live. A held E does not repeat: each gather needs
a fresh press.

**R7. Where gathered units go.** Always into the gathering player's own pack
(Pack, R2). Never into a stash, never onto the ground. A full pack means No
room: the player empties it at a stash (Stash) or by spending (Building,
Crafting) and comes back. Gathered rocks and sticks have worth 0 (Economy,
R11), so they never make the pack glow or count as haul.

**R8. When gathering is not possible.** Interact does not gather while: a
panel is open (Interact only closes it: Input, R4); the player is in Build
(Interact leaves build mode first: Input); the session is Frozen or paused; or
the player is on a run (no spots). Gathering needs no tool and works with any
tool or bare hands; it does not change the held tool's state (Tools & Gear).

**R9. The rebuild path.** Gathering's share of the concept's 10-minute rebuild
(concept, Recovery from failure; "Owners: ... Gathering and Crafting") is Home
Valley's F4 check (at most `valley_gather_time_max_s`, 300 s), which reads
this doc's pick time `t_pick` (F2). Gathering keeps `t_pick` small enough for
that check to pass with margin.

### States and Transitions

Per player:

| State | Meaning | Interact on a spot |
|---|---|---|
| **No target** | The ray hits no gather spot (or something nearer) | Not a gather |
| **Targeting (out of range)** | A spot is targeted but farther than `gather_range_m` | No prompt; a press is sent and refused Too far |
| **Targeting (in range)** | Spot targeted and in range | Prompt shown; a press sends `Gather` |
| **Picking up** | An accepted gather within the last `gather_lock_s` | Not sent (R6) |

| From | To | Trigger |
|---|---|---|
| No target | Targeting (out / in range) | Ray enters a non-empty spot's sphere with nothing nearer (R2); range by F3 |
| Targeting (out) | Targeting (in) | The player comes within `gather_range_m` |
| Targeting (in) | Targeting (out) | The player moves away |
| Targeting (any) | No target | Ray leaves the sphere, something nearer blocks it, or the spot becomes Empty |
| Targeting (in) | Picking up | `Gather` accepted |
| Picking up | No target / Targeting | `gather_lock_s` passes; the target is re-evaluated (an emptied spot is no longer a target) |

A refused `Gather` changes no state. The spot's own states (Full, Partial,
Empty) are Home Valley's.

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Home Valley (5) | In / out | Spot list and positions, spot state (for targeting), `gatherable` definitions (`gives`, `yield`); out: `TakeFromSpot(spotId, n)`, back `p` or Already taken | Home Valley |
| Pack (8) | Out | `Add(material, p)` into the player's pack | Pack (container), Economy (operation) |
| Ore & Item Economy (4) | In / out | `room` (F3), the `Add` operation, refusal names (No room); out: the Gathering faucet posts `p` (R10) | Economy |
| Player Controller (6) | In | View ray (R2), reported position (R3) | Player Controller |
| Input (3) | In | Interact (E), its contexts and press semantics | Input |
| Session & Authority (2) | In | The request path, the intent table's home-action gate, the save point after a home action (R10) | Session & Authority |
| Game Data & Tuning (1) | In | `tuning.gathering` | GDT (format), this doc (values) |
| Home HUD & Panels (15) | Out | Prompt, result line and refusals (R3, R5) | Home HUD owns the look |
| Visual Feedback & Lighting (25), Audio (26) | Out | Pick-up events (material, `p`, refused or not) | Presentation |
| Crafting (13), Building (11) | Out (indirect) | Rocks and sticks in the pack as costs; the rebuild path time (R9) | Their docs own costs |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable at its minimum, maximum and 0. No feedback loop: gathering
gives worth-0 materials from a stock that Home Valley bounds (its F1, F2), so
it cannot snowball. The stock, supply and rebuild time are Home Valley's
(F1 to F4) and are not restated; `room` is Economy's F3.

### F1. Units requested

The `gather_request_count` formula is defined as:

`n = min(yield, room)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| yield | int, `count` | 1 to 20 | data file (`gatherable` definition, Home Valley) | Units in a full spot |
| room | int, `count` | 0 to 19,980,000 | calculated (Ore & Item Economy, F3, for the spot's material in the pack) | Units of that material the pack can still take |
| n | int, `count` | 0 to `yield` | calculated | Units asked of `TakeFromSpot`; Home Valley returns `p = min(n, remaining)` |

**Output Range:** 0 to `yield` (3 with MVP values). `n` = 0 is refused No room
before Home Valley is called (R4, step 5).
**Boundaries:** asking for `yield` rather than `remaining` is safe: Home
Valley caps it. `room` is never negative (Economy, F3).
**Example:** a pack with 19 sticks in its only stick slot and no empty slot:
room 1 → n = 1 → a full spot gives p = 1, the result reads "+1 Stick (pack
full)" and the spot keeps 2 (Partial). A pack with an empty slot: room ≥ 20 →
n = 3.

### F2. Pick time and pick rate (design check)

The `gather_pick_rate` formula is defined as:

`t_pick = gather_lock_s + aim_s` and `rate = yield / (t_pick + d_hop / v_walk)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| gather_lock_s | float, `s` | 0.1 to 1.5 | data file (`tuning.gathering`) | Pick-up animation and lock (R6) |
| aim_s | float, `s` | 0 to 2 | data file (`tuning.gathering`, report only) | Estimated time to turn to and aim at the next spot; an estimate, not a rule |
| t_pick | float, `s` | 0.1 to 3.5 | calculated | Time per spot excluding walking; read by Home Valley's F4 |
| yield | int, `count` | 1 to 20 | data file (Home Valley) | Units per full spot |
| d_hop | float, `m` | 2 to 30 | measured (Home Valley's layout record) | Mean distance between neighbouring spots of a material |
| v_walk | float, m/s | above 0 | data file (Player Controller, `walk_speed`) | Walking speed |
| rate | float, units/s | 0.03 to 10 | calculated | Units per second while full spots last |

**Output Range:** with MVP values `t_pick` = 0.5 + 0.5 = **1.0 s** (the value
Home Valley's F4 assumed) and rate = 3 / (1.0 + 8 / 3.8) = **0.97 units/s**
(about 58 per minute). That is about eight times Home Valley's sustained supply
of 7.2 per minute per material (its F2), on purpose: the valley's stock, not
the pick rate, limits a long gathering session, so walking to fresh spots
matters. A validation warning (not a refusal) is raised when `t_pick` makes
Home Valley's F4 exceed `valley_gather_time_max_s`.
**Boundaries:** `v_walk` must be above 0 (Player Controller's range). With
`gather_lock_s` 1.5 and `aim_s` 2, `t_pick` = 3.5 s and Home Valley's F4 for
the MVP rebuild becomes 28 × (3.5 + 2.1) + 15.8 ≈ 173 s, still under 300 s.
**Example:** see Output Range.

### F3. In range

The `gather_in_range` formula is defined as:

`in_range = |p_player − c_spot| ≤ gather_range_m`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| p_player | vector, `m` | inside the valley bounds | calculated (Player Controller's reported position, R8) | The player's position (feet) |
| c_spot | vector, `m` | in the wild margin | data file (Home Valley layout record) | The spot's centre |
| gather_range_m | float, `m` | 1.0 to 5.0 | data file (`tuning.gathering`) | Reach |
| in_range | bool | true / false | calculated | Whether a gather may be accepted |

**Output Range:** true or false; checked on the host at every `Gather` and on
the client for the prompt.
**Boundaries:** the distance is 3D, so a spot on a slope above the player
counts its height. At 1.0 m the player must stand nearly on the spot.
**Example:** player at (0, 0, 0), spot at (2.0, 0.3, 1.0): distance √5.09 =
2.26 m ≤ 2.5, in range.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included.

**The request**

- **If the pack is full of other things**: No room; the spot is untouched
  (R4, step 5).
- **If the pack has room for fewer units than the spot holds**: the pack fills
  (F1), the result says "(pack full)", and the spot keeps the rest as Partial
  and starts regrowing if it was Full (Home Valley, R5).
- **If the spot empties between targeting and pressing** (another player in
  co-op later; a double press): Already taken, shown at the crosshair.
- **If E is mashed**: one gather per `gather_lock_s`; extra presses are not
  sent (R6), and any that reach the host are refused Busy silently.
- **If the player walks out of range during the pick-up animation**: nothing
  changes; the take and add happened at the press.
- **If the game is killed right after a gather**: the save point holds the take
  and the add together, or neither (R4); the player never loses the units from
  both the spot and the pack, and never has them twice.
- **If a home save is pending** (a waited write): the request is refused
  Saving (Session & Authority); the player presses again a moment later.

**Targeting**

- **If a built wall stands between the player and a spot**: the ray hits the
  wall first; the spot is not targeted (R2). No gathering through walls.
- **If a spot and a stash are both on the ray**: the nearest hit is the
  Interact target (R2).
- **If two spot spheres overlap on the ray**: the nearer sphere entry wins.
- **If a spot fills while targeted**: the prompt stays; the next gather takes
  the full `yield`.
- **If the player is in range but looking away**: no target, no prompt; facing
  the spot is required. There is no auto-target.

**Context**

- **If a panel is open or the player is in Build**: Interact closes the panel
  or leaves Build (Input); it never gathers in the same press.
- **If the player is sprinting**: gathering works; the pick-up animation plays
  over the lowered hands.
- **If a storm arrives during a pick-up**: no effect; storms do not touch
  spots (Home Valley, R5).
- **If the spot's gatherable or material is retired by a patch**: Home Valley
  removes or remaps the spot (its Edge Cases); Gathering never targets a spot
  the layout no longer has.

**Degenerate strategies checked**

- **Gathering endlessly to fill stashes with rocks**: allowed and harmless;
  rocks are worth 0 and the stock is bounded by regrowth (Home Valley, F2).
  Stash space is the only cost.
- **Camping a single spot**: it gives nothing until it regrows (600 s); moving
  on is always better.
- **Gathering to "hide" a pack's worth**: worth is ore only (Economy, R9).

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Home Valley (5) | Hard | Spots, `gatherable` definitions, `TakeFromSpot`, Already taken | Designed |
| Pack (8) | Hard | The pack as the target of `Add` | Designed |
| Ore & Item Economy (4) | Hard | `room` (F3), `Add` (R6), No room, the faucet row (R10) | Designed (Needs Revision) |
| Player Controller (6) | Hard | View ray, reported position | Designed (being revised in another session) |
| Input (3) | Hard | Interact, contexts | Designed (Needs Revision) |
| Session & Authority (2) | Hard | Requests, home-action gate, save point (R10) | Designed (Needs Revision) |
| Game Data & Tuning (1) | Hard | `tuning.gathering` | Designed (Needs Revision) |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Building (11), Crafting (13) | Hard | Rocks and sticks reaching the pack; the rebuild path (R9) | Not written: provisional |
| Home Valley (5) | Soft | `t_pick` for its F4 | Designed: its F4 names "Gathering's tuning; provisional 1.0", matching F2 |
| Home HUD & Panels (15) | Hard | Prompt, result line, refusals | Not written: provisional |
| Visual Feedback & Lighting (25), Audio (26) | Soft | Pick-up events | Not written: provisional |

Bidirectional check: Home Valley's Interactions list "Gathering (10) | Out |
Spot list, `TakeFromSpot`, the Already taken refusal, the `gatherable`
definitions", matching. Pack's R2 lists "Gathering adds rocks or sticks from a
valley spot (`Add`, partial)", matching. Ore & Item Economy's Interactions
list Gathering's faucet posting only `p`, matching R4. Player Controller lists
Gathering as a user of the view ray and position, matching. Input lists
Gathering as an owner of Interact's effect, matching. The systems index lists
Player Controller, Home Valley, Pack and Ore & Item Economy as Depends On;
Input is missing (Open Questions, 2).

## Tuning Knobs

### This system's tuning set: `tuning.gathering`

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `gather_range_m` | float | 2.5 | 1.0 | 5.0 | 0.1 | m | live | Fiddly; the player stands on spots | Gathering from across a path; spots blur together | Same as Pack's `pickup_range_m` |
| `target_ray_m` | float | 4.0 | 2.0 | 8.0 | 0.1 | m | live | The rim appears late when walking up | Distant spots flicker as targets out of range | A bit beyond reach so the target is ready as the player arrives |
| `spot_target_radius_m` | float | 0.6 | 0.2 | 1.5 | 0.05 | m | live | Hard to aim at a few sticks | Neighbouring spots steal the target | About the size of a pile of three |
| `gather_lock_s` | float | 0.5 | 0.1 | 1.5 | 0.05 | s | live | Pick-up feels weightless; requests stream | Gathering feels sluggish | Long enough to read the animation |
| `aim_s` | float | 0.5 | 0 | 2 | 0.1 | s | live (report only) | F2 under-states the pick time | F2 over-states it | An estimate for F2; no rule reads it |
| `result_text_s` | float | 1.0 | 0.5 | 3.0 | 0.1 | s | live | The "+3 Rock" line is missed | Lines pile up on repeated gathers | One beat after each pick |

**Constraint:** `target_ray_m ≥ gather_range_m` (a target must exist before it
is in range). **Interacts:** `gather_lock_s` and `aim_s` with Home Valley's
`yield`, layout and `valley_gather_time_max_s` through F2 and Home Valley's
F4; `gather_range_m` with Pack's `pickup_range_m` (keep them equal so every
Interact feels the same reach).

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `yield`, `regrow_s`, `valley_gather_time_max_s` | Home Valley | F1, F2, R9 |
| `stack_max` of rock and stick | Ore & Item Economy | F1 (through `room`) |
| `pack_slots` | Pack | F1 (through `room`) |
| `walk_speed` | Player Controller | F2 |

## Visual/Audio Requirements

**Art-director lens applied** (`lens-specialists.md`, Visual/Audio row; art
bible Sections 1 to 6 read by heading). Required for a Gameplay system.

**Art bible principles that apply**

- **Section 1, rule 1, "Loot owns saturation and gloss."** Rocks and sticks
  are matte and stone- or wood-coloured, exactly like the valley's scenery;
  nothing about a gather flashes or glows.
- **Section 2, Valley calm:** "earned pride, unhurried making". The pick-up is
  soft and quick, never punchy; no screen shake, no particle bursts.
- **Section 4, cream is "ours"** and **Section 6:** gatherables look like the
  rest of the valley's rocks and sticks; the cream interactable rim, shown only
  when targeted and in range, is the one marker (Home Valley, Visual/Audio).
- **Section 5, The player:** first person, hands and tool; the pick-up uses
  the free hand so the held tool stays visible.

**Events and their feedback**

| Event | Visual | Audio | Owner |
|---|---|---|---|
| Spot targeted and in range | Cream rim on the pile; "E  Gather" prompt | None | This doc (rule), Home Valley (rim look) |
| Gather accepted | The free hand reaches down; the picked pieces lift and vanish into the pack over `gather_lock_s`; remaining pieces stay (Home Valley: one model per unit) | Rock: two or three stone clacks. Stick: a dry wooden rustle-knock. Pitch varies slightly per pick so repeats never sound identical | This doc; Presentation |
| "+3 Rock" result | Short line beside the crosshair, fades over `result_text_s` | None beyond the pick sound | Home HUD & Panels |
| Pack filled by this gather ("pack full") | Same as accepted, plus the result line's "(pack full)" | A softer, duller final clack | This doc |
| No room | The hand reaches and stops short; line "No room" | A muted thud | This doc |
| Already taken | Line "Already taken" | A faint scrape | This doc |

📌 **Asset Spec**: Visual/Audio requirements are defined. After the art bible
is approved, run `/asset-spec system:gathering` for the pick-up hand
animation and the gather sounds.

## Game Feel

- **Instant.** The pack box updates and the sound plays on the frame the host
  accepts (solo: the next tick, within 34 ms at 30 Hz); the animation starts on
  the press frame. A gather never waits on an animation to count.
- **Rhythm.** About one spot per 3 s while walking between neighbours (F2):
  press, walk, press. The lock (0.5 s) is shorter than the walk to the next
  spot, so it is never felt as a wait.
- **No friction.** No hold, no root, no confirmation, no tool switch.
  Movement, look and sprint stay live.
- **Readable fullness.** The "(pack full)" line and duller clack say why the
  pile was not all taken before the player wonders.
- **Playtest question:** does gathering 80 units for a rebuild feel like a
  pleasant stroll (target) or a chore? Measure the time against Home Valley's
  F4 (about 103 s of gathering).

## UI Requirements

- **Prompt:** "E  Gather" near the crosshair, shown only when a spot is
  targeted and in range (R3); the key label follows the player's binding
  (Input).
- **Result line:** "+p Rock" / "+p Stick", with "(pack full)" when the pack
  stopped the take (R5); refusals "No room", "Already taken", "Too far" in the
  same place. Plain words, no icons alone; the material name carries the
  meaning, not a colour.
- **Pack box:** the Home HUD's pack box updates its fill (Pack); no extra
  gathering counter.
- **No map, no spot timers** (Home Valley, UI Requirements).
- **Localisation:** the result line needs plural forms per language ("+1
  Stick", "+3 Sticks"); leave room for longer words.

📌 **UX Flag, Gathering**: this system has UI requirements. In Pre-Production,
run `/ux-design` for the Home HUD (prompt and result line) **before** writing
epics; it should share the interaction prompt pattern with Pack's pick-up and
the stash and workbench prompts (Player Controller, Open Questions 16).

## Cross-References

| Document | Section | What this doc relies on |
|---|---|---|
| `design/gdd/game-concept.md` | Recovery from failure; Onboarding curve | Rocks and sticks always come back; Gathering and Crafting own the rebuild path |
| `design/gdd/home-valley.md` | R4, R5, F2, F4, Edge Cases, Visual/Audio | Spots, `TakeFromSpot`, Already taken, regrowth, supply, rebuild gather time reading `t_pick`, no collision on spots, the cream rim |
| `design/gdd/pack.md` | R2, R4 | Gathering adds to the pack; pick-up reach 2.5 m |
| `design/gdd/ore-and-item-economy.md` | R6, R10, R11, F3 | `Add`, faucet posts `p`, rock and stick (stack 20, worth 0), `room` |
| `design/gdd/player-controller.md` | R8; view ray | Reported position; targeting |
| `design/gdd/input.md` | Action table; R4 | Interact; panels and Build consume it |
| `design/gdd/session-and-authority.md` | R4, R10; intent table | Requests, home-action gate, save point |
| `design/gdd/tools-and-gear.md` | R8 | Gathering needs no tool and leaves the held tool alone |
| `design/art/art-bible.md` | Sections 1, 2, 4, 5, 6 | Matte gatherables, valley calm, cream rim, hands |

## Acceptance Criteria

**QA lens applied** (`lens-qa-lead.md`, in-session) against Sections C, D and
E as written: every rule and formula has a criterion, F1 and F3 at a
boundary; criteria 6, 9, 10, 11, 18 and 19 cross into dependencies.

1. **GIVEN** a full rock spot (3) in range and an empty pack, **WHEN**
   Interact is pressed, **THEN** the pack holds 3 `material.rock`, the spot is
   Empty, and "+3 Rock" is shown. *(Integration with Home Valley and Pack)*
2. **GIVEN** a pack whose only stick slot holds 19 and no empty slot, **WHEN**
   a full stick spot is gathered, **THEN** the slot holds 20, the spot holds 2,
   and "+1 Stick (pack full)" is shown. *(Logic)*
3. **GIVEN** a pack with no room for rock, **WHEN** a rock spot is gathered,
   **THEN** "No room" is shown and the spot still holds 3. *(Logic)*
4. **GIVEN** an Empty spot, **THEN** it is not targeted and no prompt shows;
   **GIVEN** a `Gather` request for it sent anyway, **THEN** it is refused
   Already taken. *(Logic)*
5. **GIVEN** a spot 2.4 m from the player, **THEN** it is in range; at 2.6 m a
   request is refused Too far and no prompt shows. *(Logic)*
6. **GIVEN** a built wall between player and spot, **WHEN** the player looks
   at the spot through it, **THEN** the spot is not targeted. *(Integration
   with Building)*
7. **GIVEN** a stash 1.5 m and a spot 2.2 m along the view ray, **WHEN**
   Interact is pressed, **THEN** the stash is the target. *(Logic)*
8. **GIVEN** an accepted gather at time 0, **WHEN** Interact is pressed again
   at 0.3 s on another full spot, **THEN** no request is sent; at 0.55 s the
   gather is accepted. A request forced at 0.3 s is refused Busy with no
   message. *(Logic)*
9. **GIVEN** the session in Launching Run, a waited write pending, paused, or
   on a run, **WHEN** a `Gather` is sent, **THEN** it is refused Not now,
   Saving, Paused or Wrong place respectively and nothing changes.
   *(Integration with Session & Authority)*
10. **GIVEN** a gather accepted, **WHEN** the process is killed at any moment
    after it and the game restarts, **THEN** either the spot lost 3 and the
    pack gained 3, or neither did. *(Integration with Save & Load)*
11. **GIVEN** a gather that places p units, **THEN** the Gathering faucet row
    posts exactly p. *(Integration with Ore & Item Economy)*
12. **GIVEN** F1, **THEN** yield 3 and room 0 gives 0; room 1 gives 1; room 17
    gives 3; yield 20 and room 25 gives 20. *(Logic)*
13. **GIVEN** MVP values, **WHEN** the catalog loads, **THEN** F2 reports
    `t_pick` 1.0 s and rate 0.97 units/s (± 0.01), and Home Valley's F4 reports
    about 103 s with no warning. *(Logic)*
14. **GIVEN** a panel open, **WHEN** Interact is pressed while looking at a
    spot, **THEN** the panel closes and nothing is gathered. **GIVEN** Build,
    **THEN** Build is left and nothing is gathered. *(Integration with Input)*
15. **GIVEN** the hammer equipped, **WHEN** a spot is gathered, **THEN** the
    gather succeeds and the hammer is still equipped and Ready afterwards.
    *(Integration with Tools & Gear)*
16. **GIVEN** the player sprinting past a spot in range, **WHEN** Interact is
    pressed, **THEN** the gather is accepted and sprint continues. *(Logic)*
17. **GIVEN** E held down over a full spot, **THEN** exactly one gather
    happens until E is released and pressed again. *(Logic)*
18. **GIVEN** a targeted spot in range, **THEN** the cream rim and "E  Gather"
    show; out of range, neither shows. *(UI)*
19. **GIVEN** an accepted rock gather, **THEN** the hand animation plays, the
    picked pieces leave the pile, and the remaining pieces stay visible.
    *(Visual)*
20. **GIVEN** an empty pack, an empty stash, no tools and no home, **WHEN** a
    tester gathers 40 rocks and 40 sticks, **THEN** it takes 300 s or less of
    play. *(Playtest, with Home Valley's criterion)*
21. **GIVEN** 1,000 gathers in a row in a built player, **THEN** each accepted
    gather costs under 0.1 ms on the main thread excluding the save snapshot.
    *(Logic, performance)*

## Open Questions

| # | Question | Owner | Target |
|---|---|---|---|
| 1 | Home Valley's F4 lists `t_pick` as "Gathering's tuning; provisional 1.0". F2 now defines it as `gather_lock_s + aim_s` = 1.0; Home Valley's variable table should point to F2. | Home Valley owner | Next Home Valley revision |
| 2 | The systems index's Depends On for Gathering omits Input (and Session & Authority, implicit for every Simulation system). | `/map-systems` (producer) | Next systems-index update |
| 3 | Should later destinations have gatherables (loose rubble on asteroids, plants on planets)? Out of the MVP; the request shape already allows other spot owners. | Designer | Tier 1a planning |
| 4 | Accessibility: an option to gather repeatedly while E is held (one gather per lock), for players who find repeated presses hard. | Accessibility & Options | Alpha |
| 5 | The shared interaction prompt and nearest-hit priority (R2) across Gathering, Pack, Stash and Crafting belong in one interaction-patterns spec. | ux-designer | `/ux-design` for the Home HUD |
| 6 | Co-op: two players on one spot already resolve by arrival order; per-player packs need Economy's ADR-0003 amendment (Economy, Open Questions 10). | network-programmer | Before Tier 2a |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Player Fantasy: "Two hands and a valley", with "Pluck, walk, pluck" as its
   feel.
2. One tap of E takes the whole spot (up to the pack's room); no hold.
3. The player keeps moving during the 0.5 s pick-up.
4. Gathered units go to the pack only.
5. Reach 2.5 m, the same as Pack's pick-up.
6. Targeting by the view ray against a 0.6 m sphere per spot, blocked by
   colliders; nearest hit wins among interactables.
7. `t_pick` = 0.5 s lock + 0.5 s aim estimate = 1.0 s, matching Home Valley's
   F4.
8. A second gather within the lock is refused Busy silently.
9. Result line "+p Rock" with "(pack full)" when the pack stopped the take.
