# Player Controller

> **Status**: In Review (revision 1 applied 2026-11-28 after the design review's NEEDS REVISION; awaiting re-review)
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 2 (Risk is a choice)
> **Creative Director Review (CD-GDD-ALIGN)**: CONCERNS (accepted) 2026-11-28 — run in-session as a checklist (no agent spawned). Pillars 1, 2 and 3 are served by rules, not only the fantasy text: F1 (the pack slows the body; full-pack sprint below burrower speed), R4 (sprint forward only), R6 (unsmoothed look), R12 (no rescue mobility). One concern: R5 applies the pack's slow at home too, so walking a full haul to the stash could make the home payoff (Pillar 5, the concept's "unpacking the haul at home is satisfying") feel sluggish. Accepted for now as one consistent body; recorded as Open Question 8 for the first playable. Pillar 4 does not apply. No anti-pillar is crossed. **Revision 1:** the concern is resolved: the slow now applies on a run only (R5, Open Question 8).

## Summary

Player Controller is the player's first-person body: walking at 3.8 m/s,
sprinting forward at 6.2 m/s, slowed on a run by the pack's fill, looking with
an unsmoothed mouse, falling, sliding and colliding, with no jump. It runs on
the player's own client, reports position to the host for range checks, and
publishes the view ray every tool and interaction aims with. Its speeds set
the run's stakes, written as escape targets: an empty pack outruns a burrower,
a full one is caught within 8 seconds.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Input, Session & Authority, Game Data & Tuning, Pack, Home Valley`

## Overview

Player Controller is the player's body in first person: walking, sprinting,
looking, falling, bumping into rock and walls, and the camera at eye height
that every other system aims through. The player uses it every second of play,
at home and on a run. Its numbers are small and few: a walk speed, a sprint
speed, how much a heavy pack slows you, how fast the view turns. Those numbers
decide most of how the game feels, and they set the stakes the run's other
systems lean on: how long the walk back to the ship takes with a full pack, and
whether you can outrun what is chasing you.

It runs on the player's own client, as ADR-0001 decided ("Player movement and
look | Owning client"): movement is never a request and never waits for the
host. The client reports its position, and the host trusts it for range checks
(pickup, mining, extraction). Player Controller also supplies the *view ray*
(the line from the eye through the centre of the screen) that Mining,
Gathering, Building, Stash and Crafting use to find what the player is looking
at. It does not own the actions themselves (Input does), what the tools do
(their owners), health or death (Health & Damage, Run Flow), or where the
player may go (Home Valley and Asteroid World supply bounds and arrival
points).

## Player Fantasy

**Framing:** Direct. The player feels this system in every step and every turn
of the head.

**Creative-direction lens applied** (`lens-creative-director.md`, in-session,
no agent spawned). Three candidate framings:

1. **"Every step home is heavier."** Anchor moment: turning for the ship with a
   glowing, full pack, and feeling your sprint come out slower than it was on
   the way in. Pillar 1: *"Every system exists to make loot more desirable or
   getting it home more tense."* Asks of the design: the pack's weight must be
   felt in speed, the empty-pack walk must feel brisk, and the difference must
   be obvious within seconds.
2. **"Careful hands, steady feet."** Anchor moment: easing round a boulder,
   looking before stepping into the open. Concept, Moment-to-Moment: *"tense
   and deliberate"*. Asks of the design: precise, unsmoothed look; no slide or
   drift; nothing that makes the body do what the player did not ask.
3. **"A light, quick body."** Anchor moment: darting between rocks. Risk: works
   against Pillar 2's chosen risk and Pillar 1's weight; a body that can always
   escape makes the haul safe.

**Chosen (autonomous, recommended):** framing 1, with framing 2 as how it must
feel moment to moment. Framing 3 is rejected as a clash with Pillars 1 and 2,
not as a style choice.

> *Your body is how you carry your fortune. Empty, you move briskly and turn
> exactly where you look; every step does what you asked. As the pack fills,
> you slow, and the walk back to the ship becomes the price of the haul: with
> a full pack you cannot outrun a burrower, so the choice to stay for one more
> seam is a choice you feel in your legs.*

What it serves:

- **Pillar 1.** On a run, the pack's fill slows the body (Pack's
  `full_pack_slow`, applied here, F1; not at home, R5). The walk back is where "pressure rises with the value
  carried" (concept, Short-Term) is felt, not shown in a number.
- **Pillar 2.** Movement is predictable and readable: the same input always
  gives the same motion, look is never smoothed or accelerated (Input, F4), and
  speeds are fixed, so a player can judge in advance whether they can make it
  back. Danger is something they *chose* to get close to.
- **Pillar 3.** The body does not get a rescue: no dodge, no jump over a
  burrower, no sprint that outpaces a hunter with a full pack. The art is
  friendly; the legs are honest.

## Detailed Design

### Core Rules

**Specialist lenses applied before drafting** (in-session, no agents spawned).
Two routing rows fit (**Animation, character movement** and **Camera, input,
controls**), so their union is used: `game-designer` (primary in both);
`ux-designer` (feel), `gameplay-programmer` (feasibility and feel),
`art-director` (pose and motion), `technical-artist` (rig and camera
constraints).

- **game-designer.** Movement speeds are the run's real clock alongside oxygen:
  walk 3.8 m/s and sprint 6.2 m/s bracket the burrower's 4.4 m/s (prototype,
  retest round 2), so an empty-pack sprint escapes and a walk does not; a full
  pack (35% slower) cannot escape even sprinting (6.2 × 0.65 = 4.0). That is
  intended. *Warning:* anything that adds mobility (jump, dodge, backwards
  sprint while watching the threat) undoes it.
- **ux-designer.** First-person comfort: a steady horizon, no forced camera
  motion, head bob off-able, a field of view wide enough not to feel cramped
  (motion sickness is the main risk for a first-person game). Every movement
  key must do something visible at once. *Warning:* instant start and stop
  feels twitchy in 3D; a short ramp reads as weight.
- **gameplay-programmer.** Owner-side `CharacterController` with manual gravity
  (the documented pattern, physics reference); frame-rate independent; clamp
  very long frames so the capsule cannot pass through thin walls. Movement
  never touches the Simulation. *Warning:* jumping onto built pieces and
  creatures multiplies collision cases for a first 3D game.
- **art-director.** The player's own body is hands, tool and a helmet lamp
  (art bible, Section 5). Teammates later see a rounded suit with the square
  pack; their walk and sprint read by pack bounce. Nothing in this system adds
  colour.
- **technical-artist.** Camera at eye height on the capsule; hands and tool on
  a separate camera layer so they never clip into walls; one field of view.

**Tensions found and how they were settled** (autonomous mode: the recommended
option, logged; the designer reviews at the first playable):

| Tension | Options | Chosen |
|---|---|---|
| Jump? (ux-designer: building games usually have it · game-designer and gameplay-programmer: it breaks escape speeds and multiplies collision cases) | A: no jump in the MVP; a step-up height and Building's stairs · B: add Jump on Space | **A.** A hop adds no horizontal speed, so the escape bracket is not the reason (corrected in revision 1): no jump keeps collision cases within a first 3D build's scope and Building's pieces simple, and Input keeps Space unbound. Building must keep any piece edge the player walks onto at or below the step height, or give stairs (Open Questions, 1 and 2) |
| Start and stop (gameplay-programmer: the prototype was instant and tested · ux-designer: instant is twitchy in 3D) | A: instant · B: a short ramp, 0.12 s up and 0.08 s down | **B.** Reads as weight without feeling slow; tunable to 0 |
| Head bob (art and feel vs comfort) | A: none · B: subtle (2 cm), with a player setting to turn it off · C: strong | **B.** The setting belongs to Accessibility & Options; until it exists, the tuning value can be 0 |
| Sprint direction (prototype: any direction · game-designer: backwards sprint lets the player watch the threat while escaping) | A: any direction · B: only while moving forward; strafing and backing up stay at walk speed | **B.** Escaping means turning your back on the danger (Pillar 2: a chosen risk). Oxygen and noise follow the same rule |
| Fall damage | A: none in the MVP · B: damage over a height | **A.** No pits or cliffs are planned in either map; Health & Damage can add it later |
| *Revision 1.* Pack slow at home (CD-GDD-ALIGN concern; game-designer) | A: everywhere, one body · B: on a run only | **B.** At home there is no threat and no oxygen cost, so the slow would be a tax with no choice; Pillar 1's tension lives on the run and Pillar 5's payoff at home |
| *Revision 1.* How close the race with a burrower is (game-designer: at 14 of 16 slots the gap closes at 0.1 m/s, 100 s from 10 m) | A: keep the prototype numbers · B: set escape targets and re-solve the values | **B.** Targets in R5; the values belong to Pack and Creature AI (Open Questions, 10) |
| *Revision 1.* How the slow grows with fill (game-designer: weight bands · systems-designer: linear is simplest to tune) | A: linear in fill, plus a second cue · B: weight bands | **A**, with the hands lowering and footsteps getting heavier as fill grows (Visual/Audio); bands left to Pack and playtest (Open Questions, 14) |
| *Revision 1.* Sprint threshold (systems-designer, game-designer: near-sideways and light-push sprints) | A: any forward part · B: forward part at least 0.7 | **B.** Allows a keyboard diagonal, refuses strafing and a light push slower than a walk |
| *Revision 1.* Ramp and fill (game-designer) | A: the ramp ignores fill · B: speeding up takes longer with a full pack | **B**, `full_pack_accel_mult` 1.5 on a run; stopping is unchanged |

---

**R1. Who runs it.** Player Controller runs on the client that owns the
player (ADR-0001). It reads Input's Move, Look, Turn, Look Up/Down and Sprint
every frame in Input's On Foot and Build contexts, and Move and Sprint (not
Look) in Run Pack (Input, R3 and R4), moves
the player's capsule with collision against the world and built pieces, and
reports the resulting position and facing to the Authority layer. On other
peers (co-op, later) the player is shown from those reports. Movement is never
a request, is never refused, and never waits for a tick. Its numbers come from
`tuning.player_controller`, read on every peer (Game Data & Tuning, R10), held
as 64-bit floats (its R3) and narrowed to 32-bit at the engine boundary
(`CharacterController`, vectors). A new catalog revision is used from the next
frame; the ramp (F2) absorbs any speed change.

**R2. The body.** A standing capsule, `capsule_height` 1.8 m and
`capsule_radius` 0.35 m, with the eye (the camera) at `eye_height` 1.6 m above
the capsule's base. The player never crouches, crawls, swims, climbs or jumps
in the MVP. They can walk up a step of up to `step_offset` 0.45 m without
stopping, and up a slope of up to `slope_limit_rad` 0.785 rad (45°). On ground
steeper than that they cannot walk up, and slide down it (F4).

*Ground check.* Each frame, after moving, a sphere of the capsule's radius is
cast straight down from the capsule's lower sphere, a distance of
`ground_snap_m` plus the controller's skin width. It reports whether there is
ground and the ground's normal (its slope). The controller's own grounded flag
is not used: it reads true on steep slopes and flickers on bumps.

*Snapping down.* While Grounded and moving, if the cast finds no ground within
`ground_snap_m` but finds walkable ground (slope at or below
`slope_limit_rad`) within `step_offset` below, the capsule is moved down onto
it in the same frame and stays Grounded. Walking down a step or a slope never
counts as a fall.

*Grace.* When there is no ground to stand or snap to, the body starts falling
at once (F4), but the state becomes Falling only after `coyote_time_s` 0.1 s
without ground. During that grace the Grounded flags hold (sprinting, bob,
footsteps), so the sprinting flag, and the oxygen and noise it costs, never
flicker on rough ground.

**R3. Each frame, in this order.** Player Controller runs in the frame update
(never the fixed update), after Input has updated its actions (Input, R3):

1. **Step.** `dt` from F6.
2. **Frozen?** If Frozen (R10), stop here: nothing below runs (no look, no
   movement), and the velocities are kept for when the freeze ends.
3. **Look.** Yaw and pitch from F3 (skipped while dead, R10). Mouse look uses
   this frame's mouse movement and is never clamped by F6; keyboard look uses
   `dt`. Looking before moving means this frame's movement uses this frame's
   facing.
4. **Target.** The target speed (F1) and the target velocity: that speed along
   the Move direction, turned by the facing's yaw only (looking up or down
   never changes walking speed or direction). Dead or no Move: target 0.
5. **Ramp.** The horizontal velocity moves towards the target (F2); while
   Falling at `air_control` of the rate. While Sliding, F4's slide replaces the
   downhill part.
6. **Vertical.** The ground stick, the fall or the slide (F4).
7. **Move.** One `CharacterController.Move` with the combined velocity × `dt`;
   it sweeps the capsule and slides it along what it hits.
8. **Actual velocity.** The horizontal velocity is set to the horizontal
   distance actually moved ÷ `dt`, so walking into a wall leaves the body at
   near zero speed, not at its target. Vertical velocity is set to 0 if the
   move was stopped from below or above.
9. **Ground.** The ground check, snap down and grace (R2) update the state
   (Grounded, Falling, Sliding).
10. **Bounds.** The kill height, bounds and stuck checks (R9).
11. **Presentation.** Head bob, hand sway, hand lowering and landing dip (F5).
12. **Publish.** The view ray (R7), the sprinting and moving flags (R4), and
    the position report (R8).

No momentum is carried off slopes beyond F2's ramp and step 8.

**R4. Sprinting.** The player is **sprinting** while all of these hold:
Sprint is active (held, or toggled on: Input's setting); the Move axis's
forward part is at least `sprint_min_forward` 0.7 (`move.y` ≥ 0.7, which
allows a keyboard diagonal, 0.707, and a stick pushed mostly forward); the
player is Grounded (including the grace, R2); and they are not dead. While
sprinting, F1 uses `sprint_speed` instead of `walk_speed`. Moving sideways,
backwards, at a shallow diagonal or with a light push is at walk speed, Sprint
or not. Sprint is live in On Foot, Build and Run Pack (Input's action table).

*The toggle belongs to Input.* In toggle mode Input holds the toggle (its
settings; its R5 resets it on a context change). Player Controller keeps no
toggle of its own: it asks Input to clear it (a clear-toggle call, Open
Questions 9) when Move returns to zero, when the forward part drops below
`sprint_min_forward`, and when the player is placed (R9), so a player who
stopped or turned aside does not start sprinting again by surprise.

*Sprinting* is published every frame as a flag, and with it *moving*: the
actual horizontal speed (R3, step 8) at or above `moving_threshold` 0.1 m/s. Oxygen uses it for faster oxygen use (the prototype's
`sprint_oxygen_mult`) and Perception for sprint noise (`sprint_noise`); both
read the same flag, so the player never pays one cost without the other. There
is no stamina in the MVP: oxygen is the cost of sprinting on a run, and at home
sprinting is free.

**R5. The pack's weight.** The pack's fill (0 when empty, 1 when full; by Pack
F1 it is slots used ÷ `pack_slots`, so a slot of sticks weighs the same as a
slot of ore) and `full_pack_slow` come
from Pack through a read-only pack-load interface handed to Player Controller
when it is built. Pack owns both (Game Data & Tuning: "Pack owns
`full_pack_slow`, passed to Player Controller"). **The slow applies only on a
run** (Session & Authority's Launching Run, In Run and Ending Run states): at
home F1 and F2 use fill 0, so carrying a haul from the landing spot to the
stash is at full speed (revision 1; Open Question 8 resolved). On a run the
fill slows walking and sprinting alike (F1) and makes speeding up slower (F2).
Until Pack exists, a stub supplies fill 0 and `full_pack_slow` from Game Data
& Tuning's record, so the tuning loader never fails and tests use a fake.

*Escape targets.* The run's escape test, which Pack's `full_pack_slow` and
Creature AI's `burrower_speed` must meet together with this system's speeds:
with a **full pack**, a burrower 10 m behind catches a forward-sprinting
player in **at most 8 s**; with an **empty pack**, the player gains 10 m on it
in **at most 6 s**. With `sprint_speed` 6.2 and `burrower_speed` 4.4, the empty
target is met (1.8 m/s, 5.6 s). The full target needs `full_pack_slow` ≥ 0.492:
the prototype's 0.35 failed (caught after 27 s), so Pack now sets 0.5,
provisional (Pack F5's escape check: caught after 7.7 s). Pack and Creature AI
own those values; AC 9 checks the shipped data (Open Questions, 10). The
targets are provisional until playtest.

**R6. Looking.** Look turns the view by Input's look value times `look_sens`;
Turn and Look Up/Down turn it at `key_turn` per second (F3). Turning left and
right (yaw) is unlimited; looking up and down (pitch) is limited to
`pitch_max` 1.35 rad (about 77°) either way. Look is never smoothed,
accelerated or eased by this system (Input, F4: "never smoothed or accelerated
by this system"); the camera turns in the same frame the mouse moves.

**R7. The view ray.** Every frame Player Controller publishes the view ray:
from the eye, through the centre of the screen, in the facing direction
(yaw and pitch). Systems that act on what the player looks at (Mining,
Gathering, Building, Stash, Crafting, Pack pick-up, Run Flow's exit) cast it
themselves with their own reach and layers. Player Controller does not decide
what is targeted and has no crosshair logic beyond the ray.

**R8. Reporting to the host.** The owning client reports position, yaw, pitch
and the sprinting and moving flags to the host every tick (Session &
Authority's tick rate), as owner-authoritative state (ADR-0001: Netcode's
owner authority mode). The host uses the latest report for range checks; it
does not check speed or collision (accepted shortcut, ADR-0001, to revisit
before networked melee).

**R9. Placing the player.** When the place in play (Home Valley at home,
Asteroid World on a run) says where the player goes (an arrival point at home,
the landing area at the start of a run), Player Controller places the capsule
there: the `CharacterController` is disabled, position and facing are set, and
it is enabled again (a position set on an enabled controller can be undone by
its next move); pitch 0, all velocities 0, the grace timer cleared, and Input
asked to clear the sprint toggle (R4). Placing never changes a freeze reason
(R10): a player placed while frozen stays frozen. If there is no ground under
the point, the player starts Falling.

Each place supplies its arrival points, its bounds (an axis-aligned box) and
its kill height (a height below which the player is lost). After each move
(R3, step 10), if the player is below the kill height or outside the box,
Player Controller asks the place where to put them and places them there
(Home Valley, R3 and R6). The player's position is never saved: loading
always places them (Home Valley, R8).

*Stuck rule.* With no jump, a player can be trapped. If the player has been
Sliding for `stuck_time_s` 3 s without reaching walkable ground (a V between
two steep slopes, say; a fall is not counted, since it ends on the ground or
below the kill height), Player Controller asks the place for the
nearest arrival point, places them there and raises an "Unstuck" notice for
the HUD in play. A player Grounded in a pit or a ring of their own walls is
not detected automatically (they may be standing still on purpose); the pause
menu's return to an arrival point gets them out (Home Valley at home; on a
run Asteroid World and Run Flow decide, Open Questions 11). A capsule still
overlapping a piece one frame after the controller's overlap recovery is also
placed at the nearest arrival point.

**R10. When it does not move the player.** Movement and look follow Session &
Authority's session check for movement (its R5). Not in a session (Off,
Starting, Loading, Resolving, Stopping, Refused) the body is Inactive.
Otherwise the player is **Frozen** while any *freeze reason* is held. The
reasons are a set: *Paused* (the local pause, applied in the same frame on the
pausing player's client), *Saving*, *Launching Run* and *Ending Run* (from the
frozen flag Session & Authority publishes, with its reason). The player leaves
Frozen only when the set is empty: unpausing during Launching Run leaves them
frozen. While Frozen there is no movement, no look, no gravity and no ground
check, and the velocities are **kept, not zeroed**, so a fall paused mid-air
resumes at the same speed.

Input's Panel and Menu contexts deliver no Move or Look, and Run Pack no Look,
so opening a home panel or a menu brings the player to a stop through the
ramp-down (F2); that is not Frozen. On a run, opening the pack does not stop
the player (Run Pack keeps Move and Sprint live, Input R4).

*Dead.* When Health & Damage or Run Flow says the player is dead, input stops
at once (no move target, no look, no sprint), but the body is not frozen:
gravity and collision continue and the horizontal velocity ramps to zero, so a
player who dies mid-air falls and comes to rest on the ground (teammates will
see it in co-op). This lasts until Run Flow ends the run.

**R11. Camera and comfort.** One first-person camera at the eye, vertical
field of view `fov_vertical_rad` 1.222 rad (70°, about 102° horizontal at
16:9). Hands and the held tool are drawn with their own fixed field of view so
they never clip into walls and are not stretched by the player's field of
view setting (art bible, Section 5: hands and tool "always next to the
camera"). Head bob (F5) moves the camera up and down a little with each stride
while Grounded and moving; it never moves the view ray, so aiming is
unaffected. There is no camera roll, no field of view change on sprint and no
camera shake from this system.

*Comfort floor (MVP).* Two player settings must be in the MVP build (Open
Questions, 12):

- **Field of view**: 60° to 90° vertical, default 70°; it overrides the
  designer default.
- **Reduce motion**: on or off, default off. On sets head bob, hand sway and
  the landing dip to 0 (F5), and every other system's camera shake (a storm, a
  hit) must read it and do the same.

Keyboard look speed is already a player setting (Input, settings table). Until
these two settings are in the build, `head_bob_amplitude_m` ships at 0.

**R12. What the player cannot do with their body in the MVP.** Jump, crouch,
dodge, climb, swim, fall-damage, push creatures or objects, stand on
creatures, sprint sideways or backwards, or carry momentum. Each would either
change the escape speeds the run depends on or add collision cases the first
3D build cannot afford.

### States and Transitions

| State | Moves and looks | Vertical motion | Typical cause |
|---|---|---|---|
| **Inactive** | No body: the capsule and camera are disabled; no flags, no reports | — | No session, loading, the scene change between home and run |
| **Grounded** | Yes; sprint allowed | Ground stick (F4) | Normal play, including the grace after losing the ground (R2) |
| **Falling** | Look; Move steers at `air_control` of the ramp rate (F2); no sprint | Gravity from 0 (F4) | Walking off an edge higher than `step_offset`, standing on a piece that is destroyed, placed above empty ground |
| **Sliding** | Look; Move steers only across the slope, never up it; no sprint | Along the slope, capped at `slide_speed_max` (F4) | Ground steeper than `slope_limit_rad` |
| **Frozen** | No; velocities kept, not zeroed | None | Any freeze reason held (R10) |

**Dead** is a flag on top of Grounded, Falling or Sliding, not a state of its
own: input is ignored but the body keeps falling and colliding (R10).

| From | To | Trigger |
|---|---|---|
| Inactive | Grounded, or Falling if there is no ground under the point | The place places the player (R9) at session start, load or run start |
| Grounded | Falling | No walkable ground for `coyote_time_s` and nothing to snap down to (R2) |
| Grounded | Sliding | The ground under the capsule is steeper than `slope_limit_rad` |
| Falling | Grounded | The ground check finds walkable ground within `ground_snap_m` and vertical velocity is 0 or downwards |
| Falling | Sliding | Lands on ground steeper than `slope_limit_rad` |
| Sliding | Grounded | The ground under the capsule is at or below `slope_limit_rad` |
| Sliding | Falling | No ground within `ground_snap_m` (slid off an edge) |
| Grounded, Falling, Sliding | Frozen | A freeze reason is added (R10) |
| Frozen | The state it froze in | The set of freeze reasons becomes empty; the ground is checked again that frame |
| Grounded, Falling, Sliding, Frozen | The same state, at the new place | Placed by the place (R9), including out of bounds and the stuck rule; freeze reasons are not changed |
| Any | Inactive | The session stops, or the place unloads (the scene change between home and run) |

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Input (3) | In | Move, Look (after Input's F4), Turn, Look Up/Down, Sprint, and the sprint hold or toggle setting | Input |
| Session & Authority (2) | Both | In: session state and pause (movement rules, its R5), the tick rate. Out: position, yaw, pitch, sprinting and moving flags each tick (R8) | Session & Authority |
| Game Data & Tuning (1) | In | `tuning.player_controller`, read on every peer | Game Data & Tuning (format) |
| Pack (8) | In | Fill (0 to 1) and `full_pack_slow`, through a read-only pack-load interface; used on a run only (R5) | Pack |
| Home Valley (5), Asteroid World (16) | In | Arrival points or landing area, bounds, kill height; walkable ground (scene colliders) | The place |
| Building (11) | Both | In: built pieces' colliders (walls, floors, stairs). Out: the view ray for placement; the capsule, so Building can refuse a piece that would overlap the player | Building |
| Mining (21), Gathering (10), Stash (12), Crafting (13), Run Flow (22) | Out | The view ray; position for their range checks (host side, from R8) | Each owner (reach and targets) |
| Oxygen (19) | Out | The sprinting flag | Oxygen (what sprinting costs) |
| Perception (18) | Out | The sprinting and moving flags; position | Perception (noise and sight) |
| Creature AI (20) | Out | Position (host side, from R8) | Creature AI. Design intent shared with it: `burrower_speed` sits between walk and sprint speed (F1, Edge Cases) |
| Health & Damage (17), Run Flow (22) | In | Death and run states that freeze movement (R10) | Their owners |
| Run HUD (24), Home HUD & Panels (15) | Out | The "Unstuck" notice (R9); the walk-back estimate's inputs (F1's current speed) if the HUD shows one | The HUD in play |
| Menus & Settings (27), Accessibility & Options (29) | In | Field of view and Reduce motion settings, required in the MVP build (R11) | Their owners |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable put at its minimum, its maximum and 0. Feedback loops: one
intended negative loop, the haul slows the carrier (F1), which raises the risk
of carrying more; nothing damps it except choosing to leave. No positive loop.

### F1. Target speed

The `move_target_speed` formula is defined as:

`v_target = base × (1 − s × f) × |move|`, where `base = sprinting ? sprint_speed : walk_speed`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| walk_speed | float, m/s | 2 to 8 | data file (`tuning.player_controller`) | Walking speed |
| sprint_speed | float, m/s | 3 to 12, and at least `walk_speed` | data file | Sprinting speed (R4) |
| sprinting | bool | — | calculated (R4) | Sprint active, forward part at least `sprint_min_forward`, Grounded, not dead |
| s | float, share | 0 to 0.6 | data file (Pack's `full_pack_slow`) | Share of speed lost with a full pack |
| f | float, share | 0 to 1 | calculated (Pack's fill on a run, clamped to 0 to 1; 0 at home, R5) | How full the pack is |
| \|move\| | float | 0 to 1 | calculated (Input, F3) | How far the Move axis is pushed |
| v_target | float, m/s | 0 to 12 | calculated | The horizontal speed the body ramps towards |

**Output Range:** 0 (no input) to 12 m/s (maximum sprint, empty pack). With
MVP values and Pack's `full_pack_slow` 0.5: empty walk 3.8, empty sprint 6.2,
full walk 1.9, full sprint 3.1 (on a run; at home always the empty values).
The lowest sprint, at `move.y` = `sprint_min_forward` 0.7, is 4.34 m/s empty
and 2.17 m/s full, each still faster than the matching full-push walk (3.8,
1.9), so a sprint never costs oxygen for less speed.
**Boundaries:** `s` at its maximum 0.6 and `f` = 1 leave 40% of speed, so a
full pack never stops the player (the slowest possible is 2 × 0.4 = 0.8 m/s).
`s` = 0 makes the pack weightless, which removes Pillar 1's main movement
cost; the min stays 0 so a playtest can try it. `walk_speed` above
`sprint_speed` would make sprinting slower than walking; Game Data & Tuning's
constraint `walk_speed ≤ sprint_speed` refuses it.
**Example:** pack 8 of 16 slots full (f = 0.5), sprinting on a run:
6.2 × (1 − 0.5 × 0.5) = 6.2 × 0.75 = **4.65 m/s**, above the burrower's
4.4 m/s. At 12 slots (f = 0.75): 6.2 × 0.625 = **3.88 m/s**, below it; caught
from 10 m in 19 s. Full: **3.1 m/s**, caught in 7.7 s. The crossover sits at
about 9.3 of 16 slots, and past it each extra slot shortens the time to be
caught noticeably. With the prototype's 0.35 the crossover sat at about 13
slots but the gap near it changed by only centimetres a second (100 s to be
caught from 10 m at 14 slots), too little to feel; that is why R5 sets escape
targets.

### F2. Ramp to target velocity

The `move_ramp` formula is defined as:

The horizontal velocity `v_h` is split into its part along the target
direction, `v_par` (a signed speed), and the part across it, `v_perp`
(a vector). Each frame:

`v_par ← MoveTowards(v_par, |v_t|, r × dt)`, with `r = a_down` while
`v_par < 0` or `v_par > |v_t|`, else `r = a_up`

`v_perp ← MoveTowards(v_perp, 0, a_down × dt)`

`a_up = sprint_speed / (accel_time × (1 + (full_pack_accel_mult − 1) × f))`,
`a_down = sprint_speed / decel_time`

A time of 0 means that part is set to its target at once. While Falling both
rates are multiplied by `air_control`. With no target (`|v_t|` = 0), `v_par`
is measured along the current velocity and ramps down at `a_down`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| v_h | vector, m/s | length 0 to 12 | calculated (R3, step 8: from the distance actually moved) | Current horizontal velocity |
| v_t | vector, m/s | length 0 to 12 | calculated (F1 and R3) | Target horizontal velocity |
| v_par, v_perp | m/s | −12 to 12; length 0 to 12 | calculated | Parts of `v_h` along and across `v_t` |
| accel_time | float, `s` | 0 to 0.5 | data file | Time from standing to full sprint with an empty pack |
| decel_time | float, `s` | 0 to 0.5 | data file | Time from full sprint to standing |
| full_pack_accel_mult | float, multiplier | 1 to 3 | data file | How much longer speeding up takes with a full pack on a run |
| f | float, share | 0 to 1 | Pack's fill on a run; 0 at home (R5) | How full the pack is |
| air_control | float, share | 0 to 1 | data file | Share of both rates while Falling |
| dt | float, `s` | 0 to `max_move_dt` | calculated (F6) | This frame's time step |
| a_up, a_down | float, m/s² | 2 and up (3 / (0.5 × 3) at the slowest); a time of 0 means instant | calculated | Ramp rates |

**Output Range:** with MVP values and an empty pack, `a_up` = 51.7 m/s² and
`a_down` = 77.5 m/s²: a walk start takes 0.074 s, a full sprint start 0.12 s,
a stop from sprint 0.08 s, a reversal from forward sprint to backwards walk
0.080 + 0.0735 = 0.153 s. On a run with a full pack, `a_up` = 34.4 m/s². In
frames, a walk start reaches 3.8 m/s on the **5th** frame at 60 fps
(0.861 m/s per frame, 0.083 s) and the 11th at 144 fps; a stop from 6.2 m/s
reaches 0 on the 5th frame at 60 fps and the 12th at 144 fps.
**Boundaries:** a time of 0 would divide by zero; it is defined as "set at
once" instead (the prototype's instant movement). At the slowest allowed
values (time 0.5, mult 3, sprint 3) `a_up` = 2 m/s², still reaching walking
speed in about a second. A reversal passes through zero at the down rate and
then rises at the up rate, with no overshoot. A 90° change of direction ramps
the old direction down at `a_down` while the new one rises at `a_up`, so the
speed dips briefly (to about 2.1 m/s at walk) and recovers within 0.074 s.
**Example:** standing, Move pushed forward, walking, empty pack: `a_up` =
6.2 / 0.12 = 51.7 m/s²; after one 1/60 s frame `v_par` = 0.861 m/s; it
reaches 3.8 m/s on the 5th frame (0.074 s in continuous time).

### F3. Look

The `look_angles` formula is defined as:

`yaw ← yaw + lx × look_sens + turn × key_turn × dt`
`pitch ← clamp(pitch − ly × look_sens + updown × key_turn × dt, −pitch_max, pitch_max)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| lx, ly | float, pixels | any | calculated (Input, F4: mouse movement after sensitivity and invert) | Look this frame; ly positive is down the screen |
| look_sens | float, rad/px | 0.0005 to 0.006 | data file | Radians per pixel |
| turn, updown | float | −4 to 4 | calculated (Input's Turn and Look Up/Down, after its keyboard look speed setting, 0.25 to 4, and invert) | Keyboard look axes; updown positive is up |
| key_turn | float, rad/s | 0.5 to 4 | data file | Keyboard turn rate |
| pitch_max | float, rad | 1.0 to 1.55 | data file | Up and down limit |
| yaw | float, rad | wrapped to −π to π | calculated | Facing left and right |
| pitch | float, rad | −pitch_max to pitch_max | calculated | Facing up and down; 0 is level |

**Output Range:** yaw unbounded (wrapped), pitch within ±1.35 rad (±77°) with
MVP values.
**Boundaries:** `pitch_max` above π/2 (1.571) would let the view flip over the
top; the maximum 1.55 stays below it. `look_sens` has no 0 in range, and
Input's sensitivity multiplier has no 0, so look cannot be turned off. Mouse
look is frame-rate independent by nature (pixels moved, not per second);
keyboard look uses `dt`.
**Example:** the mouse moves 100 px right at sensitivity 1: yaw changes by
100 × 0.0022 = **0.22 rad (12.6°)**. Holding the right arrow for 1 s turns
1.9 rad (109°).

### F4. Gravity, falling and sliding

The `vertical_motion` formula is defined as:

`Grounded: vy = −ground_stick` (a small downward move each frame that keeps
the capsule in contact; it is never carried into a fall)
`on leaving the ground: vy = 0`
`Falling: vy ← max(vy − gravity × dt, −terminal_fall_speed)`
`Sliding: v_s ← min(v_s + gravity × sin(θ) × dt, slide_speed_max)`, applied
along the slope's downhill direction (the 3D direction down the surface);
`vy` is not integrated separately while Sliding; Move's part across the slope
still steers through F2, and any part of the ramped velocity pointing uphill
is removed
`on leaving Sliding: v_s = 0` (the horizontal part of the slide is already in
`v_h` through R3, step 8)
`on landing: vy = −ground_stick`

"Leaving the ground" is the moment the ground check first finds no ground:
the body starts falling physically at once, and only the Grounded flags
(sprint, bob, footsteps) wait out the grace (R2).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| gravity | float, m/s² | 1 to 30 | data file | Gravity's pull (9.81 in both places in the MVP) |
| terminal_fall_speed | float, m/s | 10 to 80 | data file | Fastest fall |
| ground_stick | float, m/s | 0.5 to 5 | data file | Small downward speed that keeps the capsule on the ground over bumps |
| slide_speed_max | float, m/s | 1 to 6 | data file | Fastest slide; below `burrower_speed` by design, so a slide is never an escape |
| θ | float, rad | above `slope_limit_rad` to π/2 | calculated (the ground check's normal) | The steep slope's angle |
| vy | float, m/s | −terminal_fall_speed to 0 | calculated | Vertical velocity (never upwards: no jump) |
| v_s | float, m/s | 0 to slide_speed_max | calculated | Slide speed along the slope |

**Output Range:** falls from 0 to 50 m/s down with MVP values; slides from 0
to 3 m/s. A 10 m fall takes 1.43 s and lands at 14.0 m/s, with no damage
(R12).
**Boundaries:** `gravity` = 0 is outside the range (the player would float off
an edge forever). θ near π/2 (a wall) is not walkable ground: the cast hits it
side-on and the state is Falling. A slide never exceeds `slide_speed_max`
however long the slope.
**Example:** walking off a 2 m foundation edge: `vy` starts at 0, the player
falls 2 m in 0.639 s and lands at 6.26 m/s. A 50° slope (0.873 rad): the slide
gains 9.81 × 0.766 = 7.51 m/s² and reaches its 3 m/s cap after 0.40 s.

### F5. Head bob

The `head_bob_offset` formula is defined as:

`bob_y = A × w × sin(2π × d / stride_m)` (the camera, up and down)
`sway_x = S × w × sin(π × d / stride_m)` (the hands, side to side)
`hands_y = −(sprinting ? L_s : 0) × w − (on a run ? L_f × f : 0) − dip`

where:

- `d ← (d + min(horizontal distance moved, bob_max_rate × stride_m × dt)) mod (2 × stride_m)`,
  advanced only while Grounded; `d` keeps its value while stopped, so the
  stride resumes where it left off.
- `w ← MoveTowards(w, (Grounded and moving) ? 1 : 0, dt / bob_fade_s)`: a
  linear fade in and out.
- `dip`: on landing (Falling to Grounded) with a downward speed of at least
  2 m/s, `dip` is set to `land_dip_m × min(1, |vy| / 10)` and falls linearly
  to 0 over `land_dip_s`. It moves the hands only, never the camera.
- With the player's **Reduce motion** setting on (R11), `A`, `S` and `dip` are
  0.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| A | float, `m` | 0 to 0.06 | data file (`head_bob_amplitude_m`), 0 with Reduce motion | Bob height |
| S | float, `m` | 0 to 0.04 | data file (`hand_sway_m`), 0 with Reduce motion | Hand sway |
| L_s | float, `m` | 0 to 0.12 | data file (`sprint_hand_lower_m`) | How far the hands drop while sprinting: the visible sign of a sprint |
| L_f | float, `m` | 0 to 0.08 | data file (`fill_hand_lower_m`) | How far the hands drop with a full pack on a run |
| stride_m | float, `m` | 0.8 to 3.0 | data file | Distance per full bob |
| bob_max_rate | float, per second | 2 to 8 | data file | Most bobs per second, at any speed |
| bob_fade_s | float, `s` | 0.05 to 0.5 | data file | Fade in and out time |
| w | float | 0 to 1 | calculated | Fade weight |
| d | float, `m` | 0 to 2 × stride_m | calculated | Stride phase |
| bob_y, sway_x, hands_y | float, `m` | ±A, ±S, 0 to −0.3 | calculated | Offsets; never applied to the view ray (R11) |

**Output Range:** ±2 cm of bob with MVP values, about 2.4 bobs per second at
walk speed and 3.9 at sprint, never more than 5.
**Boundaries:** `A` = 0 turns bob off. The rate cap stops the buzz a short
stride and a fast sprint would make (0.8 m at 12 m/s would be 15 per second;
capped at 5). `d` wraps, so it never loses precision over a long session.
**Example:** walking 3.8 m/s with stride 1.6 m: 2.4 bobs per second, peak
2 cm; stopping fades the bob out in 0.15 s.

### F6. Long-frame clamp

The `move_dt` formula is defined as:

`dt = min(frame_time, max_move_dt)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| frame_time | float, `s` | 0 and up | calculated (the engine's frame time) | Real time since the last frame |
| max_move_dt | float, `s` | 0.05 to 0.2 | data file | Longest step movement may take in one frame |
| dt | float, `s` | 0 to `max_move_dt` | calculated | Step used for F2, F4, F5 and keyboard look (F3) |

**Output Range:** up to 0.1 s with MVP values. A frame longer than that (a
hitch or a load spike) moves the player only 0.1 s worth, so the player never
jumps a long way in one frame. It is not about tunnelling:
`CharacterController.Move` sweeps the capsule, so a long step still stops at a
wall. At 30 fps (0.033 s) and above the clamp never acts.
**Boundaries:** `frame_time` = 0 moves nothing and changes nothing. Below
10 fps the player moves slower than real time while the Simulation (oxygen,
creatures) keeps real time: an accepted disadvantage on very slow machines in
the MVP (Open Questions, 17). The controller's minimum move distance is set to
0, so very small moves are never dropped.
**Example:** a 0.4 s hitch while sprinting moves the player 0.62 m, not 2.48 m.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included. Revised after the 2026-11-28 design review.

**Movement and speed**

- **If W and S are both held**: Input cancels them to zero (Input, F3); the
  player stops through the ramp-down.
- **If Sprint is held while moving sideways, backwards, at a shallow diagonal
  or with a light push** (`move.y` below `sprint_min_forward`): walk speed; the
  sprinting flag stays off, so Oxygen and Perception charge nothing, and the
  hands stay up, which is the sign that no sprint is happening.
- **If Sprint is toggled on and the player stops or turns aside**: Player
  Controller asks Input to clear the toggle (R4). Moving forward again is at
  walk speed until Sprint is pressed again.
- **If the pack's fill changes mid-stride on a run** (picking up ore while
  moving, or dropping it): F1's target changes that frame; the ramp (F2)
  carries the body to the new speed, so there is no jolt. At home the fill is
  ignored (R5).
- **If Pack reports a fill outside 0 to 1** (a bug): it is clamped to 0 to 1
  and logged once per distinct bad value, not every frame.
- **If `walk_speed` and `sprint_speed` are equal**: valid; sprinting looks the
  same and only costs oxygen and noise. Tuning, not a bug.
- **If the player is falling and holds Sprint**: no sprint while Falling (R4);
  on landing, sprint resumes in the first Grounded frame if still held and
  pushing forward.
- **If the player sprints into a wall**: the actual speed (R3, step 8) drops
  to near zero, so *moving* turns off and Perception hears no footsteps from a
  player standing against a wall.
- **If the player opens the pack on a run while sprinting** (Run Pack
  context): Move and Sprint stay live (Input, R4), so they keep running at the
  same speed; only Look stops. **If a home panel opens while sprinting**
  (Panel context): Move and Sprint stop arriving and the player ramps to a
  stop within `decel_time`.

**Ground and collision**

- **If the ground has a step up higher than `step_offset`** (0.45 m): the
  player stops against it. Building must keep walkable piece edges at or below
  it or provide stairs (Open Questions, 2).
- **If the player walks down a step or a slope**: the snap-down (R2) keeps
  them Grounded for any drop up to `step_offset` onto walkable ground, so
  sprint, bob and footsteps never flicker. A drop higher than that is a fall.
- **If the ground is steeper than `slope_limit_rad`**: the player slides down
  at up to `slide_speed_max` (F4) and cannot walk up. Home Valley's rim and
  Asteroid World's walls rely on this (Home Valley, R6).
- **If two steep slopes meet in a V and the player slides into it**: they
  keep sliding without ever reaching walkable ground; after `stuck_time_s` the
  stuck rule places them at the nearest arrival point (R9).
- **If the player is in a pit deeper than `step_offset`, or walled in by
  their own pieces**: they are Grounded and cannot get out on foot. The pause
  menu's return to an arrival point gets them out (Home Valley at home; on a
  run, Asteroid World and Run Flow decide, Open Questions 11).
- **If the player stands on a piece that a storm destroys**: the piece's
  collider is gone the next frame; after the grace the player falls to
  whatever is below. No damage.
- **If Building is asked to place a piece overlapping the player's capsule**:
  Building refuses it (Building's rule; Player Controller supplies the
  capsule). If a piece appears overlapping the capsule anyway (a co-op
  teammate's placement, later), the controller's overlap recovery pushes the
  player out on the next move; if the overlap is deep (the capsule inside a
  piece), it may push the wrong way, so after one frame still overlapping the
  player is placed at the nearest arrival point (R9).
- **If a long frame occurs** (over `max_move_dt`): only `max_move_dt` of
  movement is applied (F6); the sweep still stops the player at walls.
- **If the player is pushed into a creature**: creatures block like walls in
  the MVP; neither pushes the other. Creature AI decides creature collision.

**Placement and bounds**

- **If the player falls below the kill height or leaves the bounds**: the
  place supplies an arrival point and the player is placed there (R9). At home
  that is Home Valley's R3; on a run it is Asteroid World's decision
  (provisional: the nearest arrival point, never a free trip to the ship
  while a creature hunts the player).
- **If the player is placed where the capsule overlaps something**: the place
  is responsible for clear arrival points (Home Valley keeps its clearance
  free); if it overlaps anyway, the deep-overlap rule above applies.
- **If the player is placed while frozen** (out of bounds during a save, say):
  the pose changes and the player stays Frozen until every freeze reason
  clears (R9, R10).
- **If the game loads**: the position was never saved; the place places the
  player (R9).

**States, pause and death**

- **If the game is paused mid-fall**: the player freezes in the air (R10);
  falling resumes from the same speed on unpause.
- **If the player unpauses during Launching Run or a save**: they stay Frozen
  until that reason also clears (R10).
- **If the window loses focus**: Input releases held buttons (Input, R5). With
  Session & Authority's auto-pause on (its default, its R9), the game pauses
  and the player freezes; with it off, Move still follows the keys as they are
  and a released key ramps the player to a stop.
- **If the player dies mid-sprint**: input stops that frame (R10); the
  sprinting flag goes off, so Oxygen stops charging the sprint cost; the body
  ramps to a stop.
- **If the player dies mid-air or on a slope**: the body keeps falling or
  sliding until it rests on the ground (R10); it is not frozen in the air.
- **If the player is dead and the game is paused**: Frozen wins while paused;
  on unpause the body continues as a dead body.

**Network (co-op later, solo now)**

- **If the client reports a position the host finds out of range for an action**:
  the owning system refuses the action (its range check). Player Controller
  does nothing extra. With latency, a legitimate action may race the position
  stream; the tolerance band for that is a co-op item (Open Questions, 5).
- **If the client reports an impossible position** (a cheat or a teleport bug):
  the host trusts it (ADR-0001's accepted shortcut). Revisit before co-op
  (Open Questions, 5).
- **If a new catalog revision arrives mid-run** (live tuning, development
  builds): the new values are used from the next frame (R1); the ramp absorbs
  a speed change. Values marked `restart` wait for a restart.

**Degenerate strategies checked**

- **Backpedal-sprinting or strafe-sprinting while watching a creature**: not
  possible (R4: forward part at least 0.7).
- **Walking along the rim wall to see over it**: the wall stops the capsule;
  nothing beyond is reachable.
- **Dropping ore to outrun a creature**: allowed and intended. Lightening the
  pack is a real choice (Pack decides whether dropping exists); it costs the
  haul.
- **Standing on a built roof to escape storms or reach the rim**: no jump, so
  only stairs reach a roof; the rim wall still holds (Home Valley, Edge
  Cases).
- **Sliding down a slope to escape**: slides are capped below
  `burrower_speed` (F4).
- **Holding Sprint everywhere at home**: allowed. Sprinting at home costs
  nothing (no oxygen, no threat), so it is a convenience, not a strategy.
- **Using the stuck rule or the return to an arrival point to flee to the
  ship on a run**: the run's version must not lead to the ship while a
  creature hunts the player (Open Questions, 11).

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Input (3) | Hard | Move, Look, Turn, Look Up/Down, Sprint; contexts On Foot, Build, Run Pack (Move and Sprint only); the sprint hold or toggle setting and its keyboard look speed setting (its R2 to R5, F3, F4); a call to clear the sprint toggle (requested, Open Questions 9) | Designed (Needs Revision after its review). Space stays unbound: no jump |
| Session & Authority (2) | Hard | Movement rules per session state and pause (its R5); the frozen flag with its reason (pause, saving, launching or ending run); auto-pause on focus loss (its R9); the tick for position reports (R8) | In review |
| Game Data & Tuning (1) | Hard | `tuning.player_controller`, read on every peer; the constraints `walk_speed ≤ sprint_speed` and `eye_height < capsule_height`; its units (R5), which need an acceleration unit for `gravity` (Open Questions, 13) | In review (Needs Revision after its re-review) |
| Pack (8) | Hard | A read-only pack-load interface: fill (0 to 1, exactly defined by Pack) and `full_pack_slow`; the escape targets (R5) | Designed (Pack R6 provides this interface, F1 the fill, F5 the escape check). Until Pack is built, a stub supplies fill 0. Not in this row's Depends On in the systems index (Open Questions, 3) |
| Home Valley (5) | Hard | Arrival points, bounds (a box), kill height, the pause menu's return to an arrival point | Designed. Not in this row's Depends On in the systems index (Open Questions, 3) |
| Asteroid World (16) | Hard (Milestone B) | Landing area, arrival points, bounds, kill height; no V-crevices in walkable areas | Not written: provisional |
| Health & Damage (17), Run Flow (22) | Soft | Death (input stops, the body still falls), run states that freeze movement, the run's way out when stuck | Not written: provisional |
| Menus & Settings (27) | Hard (comfort floor) | Field of view and Reduce motion settings, needed in the MVP build (R11, Open Questions 12) | Not written; Vertical Slice in the systems index |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Gathering (10) | Hard | View ray, position | Not written: provisional |
| Building (11) | Hard | View ray for placement; the capsule, to refuse a piece over the player; the step height and doorway width its pieces must respect | Not written: provisional |
| Oxygen (19) | Hard | Sprinting flag | Not written: provisional |
| Creature AI (20) | Hard | Position; walk and sprint speeds for the escape targets (R5); a directional chase sound from behind (Open Questions, 15) | Not written: provisional |
| Mining (21) | Hard | View ray, position; no pits deeper than `step_offset` without a way out (Open Questions, 11) | Not written: provisional |
| Perception (18) | Soft | Sprinting and moving flags, position | Not written: provisional. Its index row does not list Player Controller (Open Questions, 3) |
| Stash (12), Crafting (13), Run Flow (22) | Soft | View ray and position for interaction range | Not written: provisional |
| Run HUD (24), Home HUD & Panels (15) | Soft | The "Unstuck" notice (R9); current speed, if a walk-back estimate is shown | Not written: provisional |
| Audio | Soft | Footstep timing and ground type, heavier steps with fill on a run, the landing thud (Visual/Audio) | Not written: provisional |
| Home Valley (5) | Soft | `walk_speed` in its F4 rebuild time (unslowed at home, matching R5); `slope_limit_rad` for its rim | Designed: it names Player Controller in its Interactions and Tuning Knobs, matching |

Bidirectional check: Input lists "Player Controller | Out | Move, Look (after
F4), Turn, Look Up/Down, Sprint", matching. Game Data & Tuning lists Player
Controller as reading `tuning.player_controller` on every peer, matching.
Session & Authority lists Player Controller (owner-authoritative movement;
frozen while paused or saving), matching R10. Home Valley lists Player
Controller as a downstream reader of its arrival points, bounds and kill
height, matching this doc's upstream row; its Dependencies row still says
"Not written", which is stale (Open Questions, 3).

## Tuning Knobs

### This system's tuning set: `tuning.player_controller`

All in Game Data & Tuning's R3 record shape and R5 units, read on every peer,
held as 64-bit floats and narrowed to 32-bit at the engine boundary. Values
marked *prototype* are carried over from `prototypes/star-haul/config.js`
(retest round 2, 2026-11-27); the others are new starting values. All
`provisional: true` until the first playable in Unity: the browser prototype
cannot settle first-person feel (prototype REPORT: "cannot settle first-person
feel in Unity"). Angles are stored in radians (R5 has no degrees); the degrees
in brackets are for reading only.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `walk_speed` | float | 3.8 | 2 | 8 | 0.1 | `m_per_s` | live | Trudging; walk back too long | A walk outpaces burrowers; no need to sprint | *Prototype.* Below `burrower_speed` 4.4 on purpose; Home Valley's F4 divides by it, and the min keeps it above 0 |
| `sprint_speed` | float | 6.2 | 3 | 12 | 0.1 | `m_per_s` | live | An empty pack cannot escape (fails R5's empty target) | A full pack escapes (fails R5's full target) | *Prototype.* With burrower 4.4, an empty pack gains 10 m in 5.6 s |
| `sprint_min_forward` | float | 0.7 | 0.3 | 1 | 0.05 | `share` | live | Near-sideways sprints; below 0.61 a light-push sprint is slower than a walk | Above 0.707 a keyboard diagonal cannot sprint | Allows a keyboard diagonal (0.707), refuses strafing and light pushes |
| `look_sens` | float | 0.0022 | 0.0005 | 0.006 | 0.0001 | `rad_per_px` | live | Sluggish turning | Twitchy aim | *Prototype.* Players scale it with Input's mouse sensitivity |
| `key_turn` | float | 1.9 | 0.5 | 4 | 0.1 | `rad_per_s` | live | Keyboard-only players cannot turn in time | Overshoot | *Prototype.* Players scale it with Input's keyboard look speed (0.25 to 4) |
| `pitch_max` | float | 1.35 | 1.0 | 1.55 | 0.05 | `rad` | live | Cannot look at the ceiling or floor seams | Near-vertical views feel odd | *Prototype's* clamp (77°). A live decrease clamps pitch at once, a one-frame snap in development builds only |
| `accel_time` | float | 0.12 | 0 | 0.5 | 0.01 | `s` | live | 0: instant, twitchy | Floaty, unresponsive | Weight without slowness |
| `decel_time` | float | 0.08 | 0 | 0.5 | 0.01 | `s` | live | 0: instant stop | Slides past cover | Stops a little faster than it starts |
| `full_pack_accel_mult` | float | 1.5 | 1 | 3 | 0.1 | `multiplier` | live | 1: a full pack feels as nimble as an empty one | Sluggish starts under threat | A full pack takes 1.5× as long to reach its (lower) top speed: the weight is felt in the start, not only the speed |
| `air_control` | float | 0.3 | 0 | 1 | 0.05 | `share` | live | 0: no steering in a fall | Full steering in the air | Falls are short (no jump); a little steering avoids feeling stuck |
| `gravity` | float | 9.81 | 1 | 30 | 0.01 | `m_per_s2` (requested, Open Questions 13) | live | Floaty falls | Harsh drops | Earth gravity in both places; Asteroid World may ask for its own later (Open Questions, 4) |
| `terminal_fall_speed` | float | 50 | 10 | 80 | 1 | `m_per_s` | live | Long falls look slow | Long falls look like teleports between frames (no gameplay effect: `Move` sweeps) | Generous; long falls are not planned |
| `slide_speed_max` | float | 3 | 1 | 6 | 0.1 | `m_per_s` | live | Steep slopes feel sticky | A slide becomes an escape | Below `burrower_speed` 4.4, so a slide is never an escape |
| `ground_stick` | float | 2 | 0.5 | 5 | 0.1 | `m_per_s` | live | Bouncing over bumps | Glued to slopes | Standard for a `CharacterController` |
| `ground_snap_m` | float | 0.1 | 0.02 | 0.5 | 0.01 | `m` | live | Flickers between Grounded and Falling on bumps | Lands early, hovering | The ground check's tolerance (R2); stepping down reaches `step_offset` |
| `coyote_time_s` | float | 0.1 | 0 | 0.3 | 0.01 | `s` | live | 0: sprint and footsteps flicker on rough ground | Flags lag a real fall | Holds the Grounded flags over small gaps; the body falls at once |
| `moving_threshold` | float | 0.1 | 0.01 | 0.5 | 0.01 | `m_per_s` | live | Tiny drift counts as moving (noise) | Slow walking counts as still | Actual speed at or above it publishes *moving* |
| `eye_height` | float | 1.6 | 1.4 | 1.6 | 0.05 | `m` | live | Feels like crouching | (max 1.6 keeps the camera at least 0.15 m below the lowest capsule top, so it never clips a ceiling) | Average standing eye height; a change moves the camera the next frame |
| `capsule_height` | float | 1.8 | 1.75 | 2.0 | 0.05 | `m` | restart | Fits under low ceilings it should not | Blocked by low cave ceilings | Standing adult. **Restart:** a live resize can embed the capsule in a ceiling or a built piece, and Building's clearance checks read it when they are built |
| `capsule_radius` | float | 0.35 | 0.25 | 0.4 | 0.01 | `m` | restart | Slips through gaps between pieces | Snags on door frames | At its max, 0.8 m plus skin still fits the 0.9 m doorway (Open Questions, 2). **Restart:** as `capsule_height` |
| `step_offset` | float | 0.45 | 0.1 | 0.6 | 0.05 | `m` | live | Stuck on small ledges and foundations | Walks up waist-high blocks | Lets the player step onto a low foundation; Building keeps edges at or below it. Below the capsule height by range, as the engine requires |
| `slope_limit_rad` | float | 0.785 | 0.349 | 1.047 | 0.017 | `rad` | live | Cannot climb the valley's gentle slopes (below 20°) | Climbs out of the valley (above 60°) | 45°. Home Valley authors its rim steeper than this |
| `fov_vertical_rad` | float | 1.222 | 0.96 | 1.571 | 0.017 | `rad` | live | Cramped, motion sickness risk | Fish-eye; distant seams too small | 70° (about 102° horizontal at 16:9). The designer default; the player's field of view setting (60° to 90°) overrides it (R11) |
| `head_bob_amplitude_m` | float | 0.02 | 0 | 0.06 | 0.005 | `m` | live | 0: off | Nausea | Subtle; Reduce motion sets it to 0, and the build ships it at 0 until that setting is in the build (R11) |
| `hand_sway_m` | float | 0.015 | 0 | 0.04 | 0.005 | `m` | live | Hands look frozen | Distracting | Reduce motion sets it to 0 |
| `sprint_hand_lower_m` | float | 0.06 | 0 | 0.12 | 0.01 | `m` | live | Sprint not visible (there is no field of view change) | Tool leaves the screen | The visible sign of a sprint |
| `fill_hand_lower_m` | float | 0.03 | 0 | 0.08 | 0.01 | `m` | live | The weight has only one cue | Tool leaves the screen | A second cue for a full pack on a run |
| `land_dip_m` | float | 0.04 | 0 | 0.1 | 0.01 | `m` | live | No landing feedback | Jarring | Hands only; Reduce motion sets it to 0 |
| `land_dip_s` | float | 0.1 | 0.05 | 0.3 | 0.01 | `s` | live | Snaps | Floaty | |
| `stride_m` | float | 1.6 | 0.8 | 3.0 | 0.1 | `m` | live | Fast bob | Slow, wading bob | About a walking stride |
| `bob_fade_s` | float | 0.15 | 0.05 | 0.5 | 0.01 | `s` | live | Bob pops on and off | Bob lingers after stopping | |
| `bob_max_rate` | float | 5 | 2 | 8 | 0.5 | `per_s` | live | Sprint bob looks slow | Buzz | Caps the bob's frequency at any speed and stride |
| `stuck_time_s` | float | 3 | 1 | 10 | 0.5 | `s` | live | Placed away while still sliding out of a real slope | Trapped players wait too long | Time Sliding without reaching walkable ground before the stuck rule places the player (R9) |
| `max_move_dt` | float | 0.1 | 0.05 | 0.2 | 0.01 | `s` | live | The game slows on frame drops | Long jumps on hitches | Read every frame |

**Constraints between keys:** `walk_speed ≤ sprint_speed` (already in Game
Data & Tuning); `eye_height < capsule_height` (holds by the ranges; kept as a
guard if the ranges change). The escape targets (R5) involve other sets'
values, which a constraint may not (Game Data & Tuning, R3), so an EditMode
data test checks them instead (Acceptance Criteria, 9).

**Knobs that interact:**

- `walk_speed`, `sprint_speed`, Pack's `full_pack_slow` and Creature AI's
  `burrower_speed` together decide who escapes (F1, R5's escape targets).
  Name all four in any balance pass; AC 9 checks them.
- `slide_speed_max` must stay below `burrower_speed`.
- `stride_m`, the speeds and `bob_max_rate` together set the bob's rate (F5).
- `slope_limit_rad` must stay below the steepest walls of Home Valley's rim and
  Asteroid World's edges, or the player can climb out.
- `step_offset` and `capsule_radius` constrain Building's piece edges and
  doorways.

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `full_pack_slow` (0.5, provisional; was 0.35) and the fill (slots used ÷ `pack_slots`) | Pack | F1, F2 |
| Mouse sensitivity multiplier, invert, sprint hold or toggle | Input (player settings) | F3, R4 |
| `burrower_speed` (4.4) | Creature AI | Design intent in F1 |
| `sprint_oxygen_mult`, `sprint_noise` | Oxygen, Perception | Read the sprinting flag (R4) |
| Keyboard look speed | Input (player setting) | F3 |
| Field of view and Reduce motion as player settings | Menus & Settings, Accessibility & Options | R11, F5 |

## Visual/Audio Requirements

**Art-director lens applied** (`lens-specialists.md`, Visual/Audio row; art
bible Sections 1 to 5 read by heading). Required for this `Gameplay` system.

**Art bible principles that apply most directly:**

- **Section 5, The player:** in first person the player is "hands, the tool in
  them ... and a helmet lamp". Teammates (later) see a rounded, matte suit in
  stone-neutral tones with cream trim and the square pack; they are told apart
  by a shape mark on the pack, never a new hue.
- **Section 5, Detail at distance:** hands and the held tool "are always next
  to the camera and get the most detail in the game".
- **Principle 1:** nothing on the player's body is glossy or saturated except
  what they carry (the pack's glow is Pack's).

**Visual feedback for this system's events:**

| Event | What the player sees | Owner of the asset |
|---|---|---|
| Walking | Hands and tool sway gently with each stride, in step with head bob (F5) | Player Controller (motion); Tools & Gear (the tool model) |
| Sprinting | Hands and tool lower by `sprint_hand_lower_m` and swing faster, **only while the sprinting flag is on**, so Shift held while strafing visibly does nothing; field of view does **not** change (no FOV kick: comfort) | Player Controller |
| Full pack (on a run) | Slower stride and slower starts; the hands sit lower by up to `fill_hand_lower_m` as the pack fills. Speed is not the only cue | Player Controller |
| Landing from a fall | A short dip of the hands (`land_dip_m`, `land_dip_s`, F5); no camera shake | Player Controller |
| Unstuck (R9) | A short notice on the HUD ("Unstuck") after the stuck rule places the player | The HUD in play |
| Teammate (co-op later) | Walk and sprint animations on the suit, the pack bouncing with stride; sprint reads by a forward lean | Player Controller (animation set) |
| Helmet lamp | Not in the valley's daylight; on the asteroid its cone follows the view ray | Visual Feedback & Lighting |

**Animation constraints:** first-person hand motion is driven by speed and
stride (F5), so it slows with a full pack without a separate animation. No
animation ever moves the view ray. The teammate body set (walk, sprint, idle,
fall) is needed only when co-op arrives (Tier 2a); the MVP needs only the
first-person hands.

**Audio:** footsteps every half stride (two per F5 cycle) while Grounded and
moving, chosen by ground type: grass and dirt in the valley, stone on the
asteroid, wood or stone on built floors depending on the piece (the places and
Building tag ground types; Audio owns the sounds). Sprint footsteps are louder
and quicker; on a run footsteps grow heavier with the pack's fill, a second
cue for the weight besides speed; the suit breathes harder while sprinting on
a run (Oxygen may own the breath, since it signals oxygen cost). A soft
landing thud after a fall. Footstep sound is presentation only: Perception's
noise comes from the sprinting flag, not from the audio. Because sprinting
means turning your back on the danger, a burrower chasing from behind must be
audible and directional (a requirement on Creature AI and Audio, Open
Questions 15). Reduce motion (R11) silences nothing; it only stops motion.

> 📌 **Asset Spec** — Visual/Audio requirements are defined. After the art
> bible is approved, run `/asset-spec system:player-controller` to produce
> per-asset visual descriptions, dimensions, and generation prompts from this
> section.

## Game Feel

Required for this `Gameplay` system. Measured in the built game, at 60 fps on
the target PC:

- **Input to motion.** A Move key press shows movement in the next rendered
  frame (the ramp starts at once; at 60 fps the first frame adds 0.86 m/s).
  Mouse look turns the camera in the same frame as the mouse report: no
  smoothing.
- **Weight.** Full walk speed in 0.074 s (the 5th frame at 60 fps), full
  sprint in 0.12 s, a stop in 0.08 s (F2); on a run with a full pack, starts
  take 1.5× as long. Players should describe the body as "solid", not
  "slippery" or "sluggish" (AC 45).
- **The pack is felt on a run.** After the pack fills naturally over a run,
  testers describing the walk back mention being slower or heavier, with
  speed, starts, lower hands and heavier footsteps as cues (AC 44).
- **Escape is legible.** With an empty pack, a sprint gains 10 m on a chasing
  burrower in under 6 s; with a full pack, the burrower catches up from 10 m
  within 8 s (R5, AC 9, AC 44).
- **Comfort.** No forced camera motion from this system beyond a 2 cm bob that
  Reduce motion turns off; no FOV change on sprint; horizon always level (no
  camera roll); field of view adjustable from 60° to 90° (R11). Discomfort
  is measured with motion-sensitive testers included, at home and on a run
  (AC 45).
- **No snags.** Walking along a built wall, through a 0.9 m doorway, up stairs,
  up foundation edges at or below 0.45 m and down any step at or below it
  never stops the player or drops them into a fall (AC 23, AC 24).

## UI Requirements

Player Controller draws one piece of UI: a small, plain **crosshair dot** at
the screen's centre, showing where the view ray points (R7). It is a fixed
mark drawn by this system's camera rig, with no targeting logic (R7 still
holds: what is targeted is each system's business). It is 6 px across at
1080p with a 1 px dark outline, scaled with the UI scale setting, in Beacon
Cream so it reads on grass, rock and sky (art bible: cream is "ours"; never
magenta); the outline keeps it visible on cream-lit surfaces (AC 43). Systems
that target things change how their target is highlighted; they do not change
the dot. A shared in-reach highlight that tells "in reach" from "out of reach"
by shape or thickness, not hue, belongs in the interaction pattern library
(Open Questions, 16). The dot can be hidden by a player setting later. Field
of view and head bob settings belong to Menus & Settings and Accessibility &
Options; this doc only names their ranges (Tuning Knobs).

> 📌 **UX Flag — Player Controller**: This system has UI requirements. In
> Phase 4 (Pre-Production), run `/ux-design` to create a UX spec for each
> screen or HUD element this system contributes to **before** writing epics:
> the crosshair in `design/ux/hud.md`, and the field of view and head bob
> options in the settings screen. Stories that reference UI should cite
> `design/ux/[screen].md`, not the GDD directly.

## Cross-References

| This doc | References | Mechanic, value or rule | Where |
|---|---|---|---|
| R1, R4, R6, F1, F3 | Input | Actions and contexts including Run Pack (R2 to R4), releases on context change and focus loss (R5), the sprint toggle and keyboard look speed settings, move vector (F3), look after settings (F4), Space unbound | [input.md](input.md) |
| R1, R8, R10 | Session & Authority | Movement is not a request (R3), movement per session state and the frozen flag (R5), auto-pause on focus loss (R9), tick | [session-and-authority.md](session-and-authority.md) |
| R1, Tuning Knobs | Game Data & Tuning | Record shape, 64-bit floats and constraints (R3), units (R5), read on every peer (R10), live changes and `apply` (R12), `walk_speed ≤ sprint_speed`, prototype starting values, Pack owns `full_pack_slow` | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R9, Edge Cases | Home Valley | Arrival points (R3), bounds and kill height (R6), position not saved (R8), rim steeper than `slope_limit_rad`; the pause menu's return to an arrival point | [home-valley.md](home-valley.md) |
| R1, R8 | ADR-0001 | Player movement and look are owner-authoritative; the host trusts reported position | [adr-0001-network-model.md](../../docs/architecture/adr-0001-network-model.md) |
| R5, F1, F2 | Pack | Fill and `full_pack_slow` (owner), the escape targets this doc asks of it | [pack.md](pack.md) |
| Edge Cases | ADR-0003 | The clock keeps running with the window in the background | [adr-0003-home-and-storm-persistence.md](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| Player Fantasy, F1 | Game concept | Pillars 1, 2 and 3; "tense and deliberate"; pressure rises with value carried | [game-concept.md](game-concept.md) |
| Visual/Audio, UI | Art bible | Section 5 (the player, detail at distance), Section 4 (Beacon Cream, no magenta) | [art-bible.md](../art/art-bible.md) |
| Tuning Knobs, F1 | Browser prototype | walk 3.8, sprint 6.2, full_pack_slow 0.35, look_sens 0.0022, key_turn 1.9, pitch clamp 1.35, burrower 4.4 | `prototypes/star-haul/config.js`, `index.html` |

## Acceptance Criteria

**QA-lead lens applied** (`lens-qa-lead.md`, against Sections C, D and E as
written), and rewritten after the 2026-11-28 design review. Every core rule R1
to R12, formula F1 to F6 and state transition has at least one criterion.

**Story types** (project testing standards): **Logic**, an EditMode test of
the plain movement class (F1 to F6, R2's grace, R4, R10's freeze reasons),
which takes `dt`, the input values, the pack-load interface and the ground
contact as injected inputs, so it runs without a scene or a
`CharacterController`; **Integration**, a PlayMode test, or a documented
playtest where marked; **Visual**, a retained screenshot in
`production/qa/evidence/` with lead sign-off. Logic tests drive a fixed `dt`
(1/60 unless stated), so frame counts are exact.

**Speed and sprint (R3, R4, R5, F1)**

1. **GIVEN** fill 0, walking, `move` (0, 1), **WHEN** 60 frames run, **THEN**
   horizontal speed is 3.8 m/s ± 0.01. *(Logic)*
2. **GIVEN** Sprint held, **WHEN** `move` is (0, 1), **THEN** speed is
   6.2 ± 0.01 and the sprinting flag is on; **WHEN** (1, 0) or (0, −1), **THEN**
   3.8 ± 0.01 and off; **WHEN** (0.707, 0.707), **THEN** on; **WHEN** `move.y`
   is 0.69, **THEN** off, and at 0.70, on. *(Logic)*
3. **GIVEN** In Run, a fake pack-load with `full_pack_slow` 0.35, sprinting
   forward, **WHEN** fill is 1.0, 0.75 and 0, **THEN** speed is 4.03, 4.57 and
   6.20 ± 0.01; **AND GIVEN** At Home with fill 1.0, **THEN** 6.20 ± 0.01.
   *(Logic)*
4. **GIVEN** walking, fill 0, **WHEN** `|move|` is 0.5, **THEN** speed is
   1.90 ± 0.01; **WHEN** `|move|` is 0, **THEN** 0. *(Logic)*
5. **GIVEN** toggle mode with sprint toggled on and a fake Input, **WHEN**
   `move` returns to (0, 0), or `move.y` drops to 0.5, **THEN** Player
   Controller calls Input's clear-toggle once and the sprinting flag is off;
   **WHEN** `move` returns to (0, 1) without a new Sprint press, **THEN** speed
   settles at 3.8. *(Logic)*
6. **GIVEN** Falling with Sprint held and `move` (0, 1), **THEN** the flag is
   off; **WHEN** the injected ground makes the state Grounded, **THEN** it is
   on in that first Grounded frame. *(Logic)*
7. **GIVEN** a fake pack-load reporting fill 1.4 for 100 frames, **THEN** F1
   uses 1.0 and exactly one log line is written; **AND GIVEN** −0.2, **THEN**
   F1 uses 0. *(Logic)*
8. **GIVEN** actual horizontal speed 0.09 m/s, **THEN** *moving* is off; at
   0.11 m/s, on. *(Logic)*
9. **GIVEN** the shipped data (`sprint_speed`, Creature AI's `burrower_speed`,
   Pack's `full_pack_slow`), **WHEN** the escape check runs, **THEN**
   `10 / (sprint_speed − burrower_speed)` ≤ 6 s **and**
   `10 / (burrower_speed − sprint_speed × (1 − full_pack_slow))` ≤ 8 s with a
   positive divisor. *(Logic, EditMode data test; passes with Pack's 0.5:
   7.7 s and 5.6 s; failed with the prototype 0.35)*

**Ramp (F2)**

10. **GIVEN** standing, empty pack, walking, **WHEN** `move` goes to (0, 1),
    **THEN** speed is below 3.8 after frame 4, exactly 3.8 after frame 5, and
    never above it; at `dt` 1/144, exactly 3.8 after frame 11. **WHEN** `move`
    is released from 6.2, **THEN** speed is 0 after frame 5 (1/60) and after
    frame 12 (1/144). *(Logic)*
11. **GIVEN** sprinting forward at 6.2, **WHEN** `move` flips to (0, −1)
    walking, **THEN** speed passes through 0 and reaches 3.8 backwards after
    0.153 s ± one frame, and `|v_h|` is never above 6.2. *(Logic)*
12. **GIVEN** walking forward at 3.8, **WHEN** `move` changes to (1, 0),
    **THEN** the forward part is 0 within 0.049 s ± one frame and the sideways
    part reaches 3.8 within 0.074 s ± one frame. *(Logic)*
13. **GIVEN** `accel_time` and `decel_time` 0, **WHEN** Move is pressed and
    released, **THEN** speed equals the target in the same frame and 0 on
    release, with no NaN or infinity. *(Logic)*
14. **GIVEN** In Run with fill 1 and `full_pack_accel_mult` 1.5, **WHEN** the
    player starts walking, **THEN** the first frame adds 0.574 m/s ± 0.001
    (34.4 m/s²); **AND GIVEN** At Home with fill 1, **THEN** it adds
    0.861 ± 0.001. *(Logic)*
15. **GIVEN** Falling from standing with `air_control` 0.3, **WHEN** `move` is
    (0, 1), **THEN** the first frame adds 0.258 m/s ± 0.001. *(Logic)*

**Look (R6, F3)**

16. **GIVEN** a look input of 100 px right, **THEN** yaw changes by
    0.22 rad ± 0.0001 in the same frame; **AND GIVEN** 10,000 px down or up,
    **THEN** pitch stops at −1.35 or +1.35; **AND GIVEN** yaw at 3.10 and
    20 px right, **THEN** yaw wraps to −3.139 ± 0.001. *(Logic)*
17. **GIVEN** Turn at 1, **WHEN** 30 frames of `dt` 1/30 run, and separately
    144 frames of `dt` 1/144, **THEN** yaw changes by 1.9 rad ± 0.001 in both.
    *(Logic)*
18. **GIVEN** the Run Pack context, **WHEN** the mouse moves and Move and
    Sprint are held, **THEN** yaw and pitch do not change while the player
    keeps moving and sprinting. *(Integration with Input)*

**Ground, falling, sliding (R2, F4, F6)**

19. **GIVEN** walking off a 2 m ledge, **THEN** vertical velocity is 0 in the
    frame the ground is lost, and the player lands after 0.639 s ± one frame
    at 6.26 ± 0.1 m/s with no damage. *(Logic for the formula; Integration in
    a test scene with ± 0.03 s)*
20. **GIVEN** a 100 m fall, **THEN** downward speed never exceeds 50 m/s.
    *(Logic)*
21. **GIVEN** an injected 50° slope, **WHEN** the player slides, **THEN** the
    slide speed rises by 0.125 m/s per frame (7.51 m/s²), never exceeds
    3.0 m/s, and no separate vertical gravity is added. *(Logic)*
22. **GIVEN** a test scene with 44° and 46° slopes, **WHEN** the player holds
    `move` (0, 1) into each for 2 s, **THEN** they walk up the 44° slope and
    make zero uphill progress on the 46° slope, sliding down. *(Integration)*
23. **GIVEN** a test scene with a 0.44 m step up, a 0.55 m step up, a 0.45 m
    step down and a 40° downhill, **WHEN** the player sprints over each,
    **THEN** they step up 0.44 m without stopping, are stopped by 0.55 m, and
    stay Grounded with the sprinting flag on in every frame of the step down
    and the downhill. *(Integration)*
24. **GIVEN** a 0.9 m doorway and a straight stair, **WHEN** the player walks
    through and up, **THEN** they never stop unexpectedly. *(Integration)*
25. **GIVEN** the injected ground absent for 0.09 s, **THEN** the state stays
    Grounded and the sprinting flag on; absent for 0.11 s, **THEN** Falling
    (and the body has been falling from the first frame). *(Logic)*
26. **GIVEN** sprinting into a wall, **THEN** within 2 frames of contact the
    actual speed is under 0.1 m/s and *moving* is off. *(Integration)*
27. **GIVEN** `frame_time` 0.016, 0.1 and 0.4, **THEN** `dt` is 0.016, 0.1 and
    0.1; **AND GIVEN** a 0.4 s frame while sprinting at 6.2 with no wall,
    **THEN** the player moves 0.62 ± 0.01 m; **AND GIVEN** `frame_time` 0,
    **THEN** nothing moves, nothing is NaN and the bob is unchanged. *(Logic)*
28. **GIVEN** the player standing on a piece, **WHEN** the piece is removed,
    **THEN** they start falling that frame, are Falling after the grace, and
    land on what is below. *(Integration with Building, when it exists)*

**States, placement, reporting (R8, R9, R10)**

29. **GIVEN** the freeze reasons Paused and Launching Run both held, **WHEN**
    Paused is removed, **THEN** the player is still Frozen; **WHEN** Launching
    Run is removed, **THEN** they move again. *(Logic)*
30. **GIVEN** falling at 5 m/s, **WHEN** paused for 10 s and unpaused,
    **THEN** the position did not change while paused and vertical velocity is
    −5 m/s in the first frame after. *(Logic)*
31. **GIVEN** each of Session & Authority's states Starting, Loading,
    Saving, Launching Run, Ending Run and Stopping, **WHEN** Move and Look are
    held, **THEN** position and view do not change. *(Integration with Session
    & Authority)*
32. **GIVEN** the player dies mid-air while sprinting, **THEN** the sprinting
    flag is off that frame, Move and Look are ignored, and the body falls and
    comes to rest on the ground. *(Logic)*
33. **GIVEN** the player at home below Home Valley's kill height, or outside
    its bounds box, **THEN** within one frame they are at an arrival point,
    facing its facing, pitch 0, velocity 0, Input's clear-toggle called, and
    their freeze reasons unchanged (placed while frozen, still frozen).
    *(Integration with Home Valley)*
34. **GIVEN** session start and a load, **THEN** the player goes from Inactive
    to Grounded at an arrival point; **AND GIVEN** an arrival point with no
    ground beneath it in a test scene, **THEN** Falling. *(Integration)*
35. **GIVEN** a test scene with a V between two 60° slopes, **WHEN** the
    player slides into it, **THEN** after 3 s ± one frame of Sliding without
    walkable ground they are placed at the nearest arrival point and the
    "Unstuck" notice is raised. *(Integration)*
36. **GIVEN** a session that stops, **THEN** the capsule and camera are
    disabled, both flags are off and no position report is sent. *(Integration)*
37. **GIVEN** a development build walking at 3.8, **WHEN** live tuning sets
    `walk_speed` to 5.0, **THEN** the target is 5.0 from the next frame and the
    speed ramps up by at most 0.861 m/s per frame; **AND WHEN**
    `capsule_height` is changed live, **THEN** the capsule does not change
    until a restart. *(Integration with Game Data & Tuning and Session &
    Authority)*
38. **GIVEN** a solo session and, separately, a simulated second peer,
    **WHEN** the player moves, **THEN** the host's stored position is within
    0.01 m of the last position the client sent, never older than one tick
    interval, and yaw, pitch and both flags match. *(Integration with Session
    & Authority)*
39. **GIVEN** sprinting at home, **WHEN** a stash panel opens, **THEN** the
    player is stopped after 5 frames at 60 fps and the flag is off; **AND
    GIVEN** sprinting on a run, **WHEN** the pack panel opens, **THEN** speed
    and the flag are unchanged. *(Integration with Input)*

**View ray, camera, presentation (R7, R11, F5)**

40. **GIVEN** any yaw, pitch and bob phase, **THEN** the view ray's origin is
    the capsule base + (0, `eye_height`, 0) and its direction is
    Euler(pitch, yaw) × forward, both within 1e-4, the same at bob peak and
    trough. *(Logic)*
41. **GIVEN** walking at 3.8 m/s, stride 1.6 m, amplitude 0.02 m, for 10 s,
    **THEN** the largest `|bob_y|` is between 0.0195 and 0.02 m with
    47 ± 1 zero crossings; **WHEN** the player stops, **THEN** `w` is 0 within
    0.15 s; **AND** there is no bob while Falling or Sliding; **AND GIVEN**
    Reduce motion on with nonzero tuning, **THEN** bob, sway and dip are 0;
    **AND GIVEN** 12 m/s with stride 0.8, **THEN** at most 5 bobs per second.
    *(Logic)*
42. **GIVEN** the field of view setting at its default, 60° and 90°, **THEN**
    the camera's vertical field of view reads 70°, 60° and 90° from the next
    frame, and the hands' field of view does not change. *(Integration)*
43. **GIVEN** default settings at 1920 × 1080, **WHEN** screenshots are taken
    with the capsule touching a wall, against bright sky, a cream-lit wall and
    a dark cave, and while sprinting, **THEN** the hands and tool are visible
    and never clip into the wall, the crosshair dot is centred and readable on
    all three backgrounds, and the hands sit visibly lower while sprinting.
    *(Visual)*

**Playtest** *(Integration, documented playtest)*

44. **GIVEN** five testers on a test asteroid, a burrower starting 10 m
    behind, **WHEN** each sprints for the ship with an empty pack and again
    with a full pack, **THEN** none is caught over 60 m empty and every one is
    caught within 8 s ± 1 full (timed by the game); **AND GIVEN** a natural
    fill over at least 5 minutes, **WHEN** asked "describe the walk back",
    **THEN** at least 4 of 5 mention being slower or heavier. *(Milestone B)*
45. **GIVEN** ten testers, at least two of whom report motion sensitivity,
    in 30-minute sessions split between home and a run, half with head bob on
    and half off, **WHEN** each rates discomfort from 0 to 10 at 10, 20 and
    30 minutes, **THEN** the mean is at most 2, no tester stops early, and at
    least 7 describe movement as solid or responsive rather than floaty,
    slippery or sluggish.

**Performance**

46. **GIVEN** the target PC, **WHEN** a profiler marker wraps the movement
    maths for 600 frames, **THEN** its average is under 0.05 ms; the host does
    no movement work beyond storing the reported position. *(Integration)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | No jump in the MVP is a decision taken on the designer's behalf. A hop adds no horizontal speed, so it would not break the escape bracket; the reasons are collision scope and keeping Building's pieces simple. If the designer wants it, Jump takes Space (Input, R2), and the stuck cases (pits, enclosures) mostly go away. | Designer | First playable |
| 2 | Building must keep any piece edge the player walks onto at or below `step_offset` (0.45 m) or provide stairs, keep doorways at least 0.9 m wide for the capsule (radius at most 0.4), and refuse a piece that would overlap the player's capsule. | Building (11) | Building design doc |
| 3 | The systems index's Depends On for this row lists Session & Authority, Game Data & Tuning and Input, but not Pack, Home Valley or Asteroid World. Perception's row does not list Player Controller. Home Valley's Dependencies still calls Player Controller "Not written". Add them, or record why not. | `/map-systems` (producer) | Next systems-index update |
| 4 | Should the asteroid have lower gravity than the valley? It would change falling feel and could be the place's tuning rather than this system's. MVP: one value, 9.81, in both. | Asteroid World (16), designer | Asteroid World design doc |
| 5 | **Co-op networking (deferred, not blocking the solo MVP).** For an ADR-0001 amendment before Tier 2a: (a) placement as a host-to-owner call carrying a placement number, applied with the network transform's teleport so other peers snap; reports older than the current number are ignored; (b) the player object persists across scene loads with its body disabled while Inactive, or is despawned and respawned; (c) the network tick set equal to `tick_rate_hz`, position and yaw on the network transform, pitch and both flags in one owner-writable network variable; the host reads the latest report, not the interpolated one; (d) a range-check tolerance band, so a request racing the position stream is not refused; (e) the host ignores reports while a player is frozen or dead; (f) Oxygen and Perception read sprinting through a host-side motion interface, so a later speed check can replace the reported flag; (g) a speed sanity check exempt across a placement; (h) network tuning (interpolation buffer, tolerances) in Session & Authority's set. | network-programmer, technical-director | Before Tier 2a co-op |
| 6 | Does breathing harder while sprinting belong to Oxygen (it signals oxygen cost) or here? | Oxygen (19), audio-director | Oxygen design doc |
| 7 | All feel values are provisional: the browser prototype could not test first-person feel in Unity. The first playable must re-tune walk, sprint, ramps, field of view and bob. | Designer, game-designer | First Unity playable |
| 8 | **Resolved in revision 1 (2026-11-28):** the full-pack slow applies on a run only (R5). At home there is no threat and no oxygen cost, so the slow would be a tax with no choice, and unpacking the haul (Pillar 5) stays brisk. Taken on the designer's behalf on the creative director's recommendation. | Designer (to confirm) | First playable that has runs |
| 9 | Input owns the sprint toggle. Player Controller needs a call on Input to clear it (on stopping, turning aside and placement, R4). Add it to Input's revision. | Input (3) | Input revision |
| 10 | **Escape targets (R5).** A full pack is caught from 10 m in at most 8 s; an empty pack gains 10 m in at most 6 s. With `sprint_speed` 6.2 and `burrower_speed` 4.4, Pack's `full_pack_slow` must be at least 0.492. The prototype's 0.35 failed (caught after 27 s); Pack now sets 0.5, provisional (caught after 7.7 s; a full-pack walk becomes 1.9 m/s), and its F5 warns outside the targets. Remaining: Creature AI must keep `burrower_speed` within the targets, and Game Data & Tuning's starting-values table still says 0.35 (Pack's Open Question 7). The targets themselves are the designer's, provisional until playtest. | Creature AI (20), Game Data & Tuning (1), designer | Creature AI design doc; playtest |
| 11 | **Getting unstuck on a run, and not making traps.** Asteroid World and Run Flow decide the run's "return to an arrival point" (it must not be a free trip to the ship: never the landing area while a creature hunts the player). Mining must not leave a pit deeper than `step_offset` without a way out, and Asteroid World keeps V-crevices of slopes over `slope_limit_rad` out of walkable areas. | Asteroid World (16), Run Flow (22), Mining (21) | Their design docs |
| 12 | **Comfort floor in the MVP build.** Field of view (60° to 90°) and Reduce motion (R11) must ship in the MVP, but Menus & Settings is Vertical Slice in the systems index. Put them in the pause menu's options for the MVP, or move Menus & Settings into the MVP. Every system with camera shake must read Reduce motion. Until they exist, head bob ships at 0. | producer, Menus & Settings (27), Accessibility & Options (29) | Before the first playable |
| 13 | Game Data & Tuning's R5 has no unit for acceleration. `gravity` needs `m_per_s2` (min ≥ 0) added to R5 in that document's revision. | Game Data & Tuning (1) | Its revision 2 |
| 14 | How the slow grows with fill: linear (chosen for now) or weight bands (Light, Laden, Overloaded) with a cue at each band edge. What fill counts is settled: slots used ÷ `pack_slots` (Pack F1). | Pack (8), designer | Playtest |
| 15 | Forward-only sprint means running home without looking back, which is only fair if the pursuer can be heard: a burrower chasing from behind needs a directional sound audible from at least 10 m. | Creature AI (20), audio-director | Creature AI design doc |
| 16 | The crosshair and reach: a shared in-reach highlight for every targeting system (shape or thickness, not hue) in `design/ux/interaction-patterns.md`, and a one-time hint the first time Sprint is held without pushing forward ("Sprint works forward only"). | ux-designer | `/ux-design` for the HUD |
| 17 | Below 10 fps the long-frame clamp (F6) slows the player while the Simulation keeps real time. Accepted for the MVP; sub-step movement if playtests on minimum hardware show it matters. | performance-analyst | First performance pass |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Overview framed as both the body and its role for other systems.
2. Player Fantasy: "Every step home is heavier", felt as "careful hands,
   steady feet".
3. **No jump, crouch or dodge in the MVP.** *Major: it shapes Building's
   pieces.* Rationale corrected in revision 1: collision scope and Building,
   not the escape bracket.
4. Start and stop ramp of 0.12 s and 0.08 s, instead of the prototype's
   instant movement.
5. Subtle head bob (2 cm), switchable off by Reduce motion.
6. Sprint only while pushing forward; sideways and backwards stay at walk
   speed.
7. No fall damage in the MVP.
8. One gravity value (9.81) for both places.
9. No stamina: oxygen is the sprint cost on a run; sprinting at home is free.
10. Prototype values kept: walk 3.8, sprint 6.2, look 0.0022, key turn 1.9,
    pitch limit 1.35; the pack's slow applies linearly with fill.
11. New starting values: capsule 1.8 × 0.35 m, eye 1.6 m, step 0.45 m, slope
    limit 45°, vertical field of view 70°.
12. A centre crosshair dot in Beacon Cream; no field of view change on sprint.
13. Long frames clamped to 0.1 s of movement.
14. The player's position is never saved; each place puts the player at its
    arrival point.

**Revision 1 (after the 2026-11-28 design review):**

15. **The full-pack slow applies on a run only** (Open Questions 8 resolved).
    *Major: it changes Pillar 1's reach and Home Valley's walking times.*
16. **Escape targets** set as 8 s (full pack caught) and 6 s (empty pack gains
    10 m); Pack accepted and set `full_pack_slow` 0.5. *Major: it changes run
    balance.*
17. The slow stays linear in fill, with a second cue (hands lower, heavier
    footsteps); weight bands left to Pack and playtest.
18. Sprint needs a forward part of at least 0.7 (`sprint_min_forward`).
19. A full pack makes speeding up slower (`full_pack_accel_mult` 1.5).
20. A stuck rule: placed at the nearest arrival point after 3 s Sliding
    without walkable ground; pits and enclosures rely on the pause
    menu's return.
21. A dead player's body keeps falling and colliding; it is not frozen in the
    air.
22. A paused fall keeps its speed; freezing is a set of reasons.
23. A comfort floor in the MVP: field of view and Reduce motion settings; head
    bob 0 until they ship.
24. Air control of 30% while falling.
25. Angles stored in radians to fit Game Data & Tuning's units.
