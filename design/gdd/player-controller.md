# Player Controller

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 2 (Risk is a choice)
> **Creative Director Review (CD-GDD-ALIGN)**: CONCERNS (accepted) 2026-11-28 — run in-session as a checklist (no agent spawned). Pillars 1, 2 and 3 are served by rules, not only the fantasy text: F1 (the pack slows the body; full-pack sprint below burrower speed), R4 (sprint forward only), R6 (unsmoothed look), R12 (no rescue mobility). One concern: R5 applies the pack's slow at home too, so walking a full haul to the stash could make the home payoff (Pillar 5, the concept's "unpacking the haul at home is satisfying") feel sluggish. Accepted for now as one consistent body; recorded as Open Question 8 for the first playable. Pillar 4 does not apply. No anti-pillar is crossed.

## Summary

Player Controller is the player's first-person body: walking at 3.8 m/s,
sprinting forward at 6.2 m/s, slowed by a full pack, looking with an
unsmoothed mouse, falling and colliding, with no jump. It runs on the player's
own client, reports position to the host for range checks, and publishes the
view ray every tool and interaction aims with. Its speeds set the run's
stakes: an empty pack outruns a burrower, a nearly full one cannot.

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

- **Pillar 1.** The pack's fill slows the body (Pack's `full_pack_slow`,
  applied here, F1). The walk back is where "pressure rises with the value
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
| Jump? (ux-designer: building games usually have it · game-designer and gameplay-programmer: it breaks escape speeds and multiplies collision cases) | A: no jump in the MVP; a step-up height and Building's stairs · B: add Jump on Space | **A.** Keeps the speed bracket honest and Input's binding as it is. Building must keep any piece edge the player walks onto at or below the step height, or give stairs (Open Questions, 2) |
| Start and stop (gameplay-programmer: the prototype was instant and tested · ux-designer: instant is twitchy in 3D) | A: instant · B: a short ramp, 0.12 s up and 0.08 s down | **B.** Reads as weight without feeling slow; tunable to 0 |
| Head bob (art and feel vs comfort) | A: none · B: subtle (2 cm), with a player setting to turn it off · C: strong | **B.** The setting belongs to Accessibility & Options; until it exists, the tuning value can be 0 |
| Sprint direction (prototype: any direction · game-designer: backwards sprint lets the player watch the threat while escaping) | A: any direction · B: only while moving forward; strafing and backing up stay at walk speed | **B.** Escaping means turning your back on the danger (Pillar 2: a chosen risk). Oxygen and noise follow the same rule |
| Fall damage | A: none in the MVP · B: damage over a height | **A.** No pits or cliffs are planned in either map; Health & Damage can add it later |

---

**R1. Who runs it.** Player Controller runs on the client that owns the
player (ADR-0001). It reads Input's Move, Look, Turn, Look Up/Down and Sprint
every frame while Input's context is On Foot or Build (Input, R3 and R4), moves
the player's capsule with collision against the world and built pieces, and
reports the resulting position and facing to the Authority layer. On other
peers (co-op, later) the player is shown from those reports. Movement is never
a request, is never refused, and never waits for a tick. Its numbers come from
`tuning.player_controller`, read on every peer (Game Data & Tuning, R10).

**R2. The body.** A standing capsule, `capsule_height` 1.8 m and
`capsule_radius` 0.35 m, with the eye (the camera) at `eye_height` 1.6 m above
the capsule's base. The player never crouches, crawls, swims, climbs or jumps
in the MVP. They can walk up a step of up to `step_offset` 0.45 m without
stopping, and up a slope of up to `slope_limit_deg` 45°. On ground steeper than
that they cannot walk up, and slide down it under gravity (F4).

**R3. Moving.** Each frame:

1. The **target speed** is F1: walk or sprint speed, reduced by the pack's
   fill, times how far the Move axis is pushed.
2. The **target velocity** is that speed along the Move direction, turned by
   the player's facing (yaw only: looking up or down never changes walking
   speed or direction).
3. The current horizontal velocity moves towards the target velocity at the
   rate F2 sets (a short ramp up, a shorter ramp down).
4. Gravity and ground contact are applied (F4), and the capsule is moved by
   the result, sliding along what it hits.

There is no air control difference (the player is only in the air when
falling) and no momentum carried off slopes beyond F2's ramp.

**R4. Sprinting.** The player is **sprinting** while all of these hold:
Sprint is active (held, or toggled on: Input's setting), the Move axis has a
forward component (`move.y` > 0), and the player is on the ground. While
sprinting, F1 uses `sprint_speed` instead of `walk_speed`. Moving sideways or
backwards is always at walk speed, Sprint or not. In toggle mode, Sprint turns
itself off when the Move axis returns to zero, so a player who stops does not
start sprinting again by surprise.

*Sprinting* is published every frame as a flag (and with it, *moving*: horizontal
speed above 0.1 m/s). Oxygen uses it for faster oxygen use (the prototype's
`sprint_oxygen_mult`) and Perception for sprint noise (`sprint_noise`); both
read the same flag, so the player never pays one cost without the other. There
is no stamina in the MVP: oxygen is the cost of sprinting on a run, and at home
sprinting is free.

**R5. The pack's weight.** The pack's fill (0 when empty, 1 when every slot is
full) comes from Pack, which owns both the fill and `full_pack_slow` (Game Data
& Tuning: "Pack owns `full_pack_slow`, passed to Player Controller"). Player
Controller applies it to walking and sprinting alike (F1). At home the pack's
fill slows the player the same way; there is one body.

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
the landing area at the start of a run), Player Controller moves the capsule
there directly: position and facing set, pitch set to 0, velocity set to 0,
sprint toggle off. Each place supplies its arrival points, its bounds and its
kill height. Each frame, if the player is below the kill height or outside the
bounds, Player Controller asks the place where to put them and places them
there (Home Valley, R3 and R6). The player's position is never saved: loading
always places them (Home Valley, R8).

**R10. When it does not move the player.** Movement and look follow Session &
Authority's session check for movement (its R5): ignored when not in a session
(Off, Starting, Loading, Resolving, Stopping, Refused), frozen while Launching
Run or Ending Run, allowed At Home and In Run unless paused. Frozen and paused
both mean: no movement, no look, no gravity, velocity kept at zero. Input's
Panel and Menu contexts deliver no Move or Look, so opening the pack, a stash
or a menu brings the player to a stop through the ramp-down (F2). When Health
& Damage or Run Flow says the player is dead, movement and look stop at once
until Run Flow ends the run.

**R11. Camera.** One first-person camera at the eye, vertical field of view
`fov_vertical_deg` 70° by default (about 102° horizontal at 16:9). Hands and
the held tool are drawn on their own layer so they never clip into walls (art
bible, Section 5: hands and tool "always next to the camera"). Head bob (F5)
moves the camera up and down a little with each stride while moving on the
ground; it never moves the view ray, so aiming is unaffected. There is no
camera shake from this system; other systems may add their own (for example a
storm or a hit), subject to the same comfort setting.

**R12. What the player cannot do with their body in the MVP.** Jump, crouch,
dodge, climb, swim, fall-damage, push creatures or objects, stand on
creatures, sprint sideways or backwards, or carry momentum. Each would either
change the escape speeds the run depends on or add collision cases the first
3D build cannot afford.

### States and Transitions

| State | Moves and looks | Gravity | Typical cause |
|---|---|---|---|
| **Inactive** | No body in the world | — | Menus before play, loading, a session not running |
| **Grounded** | Yes; sprint allowed | Holds the capsule to the ground | Normal play |
| **Falling** | Look only; Move still steers at the same ramp (R3) but sprint is not allowed | Yes | Walking off an edge, standing on a piece a storm destroyed |
| **Sliding** | Look; Move cannot push up the slope | Yes, along the slope | Ground steeper than `slope_limit_deg` |
| **Frozen** | No | No | Launching Run, Ending Run, paused, dead |

| From | To | Trigger |
|---|---|---|
| Inactive | Grounded | The place places the player (R9) at session start, load, or run start |
| Grounded | Falling | No ground within `ground_snap_m` below the capsule |
| Grounded | Sliding | Ground under the capsule steeper than `slope_limit_deg` |
| Falling, Sliding | Grounded | Ground at or below `slope_limit_deg` under the capsule |
| Any moving state | Frozen | Pause, Launching Run, Ending Run, or death |
| Frozen | Grounded or Falling | Unpause or the run state allows movement again; the state follows the ground |
| Any | Grounded | Placed by the place (R9), including after out-of-bounds |
| Any | Inactive | The session stops, or the place unloads (the scene change between home and run) |

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Input (3) | In | Move, Look (after Input's F4), Turn, Look Up/Down, Sprint, and the sprint hold or toggle setting | Input |
| Session & Authority (2) | Both | In: session state and pause (movement rules, its R5), the tick rate. Out: position, yaw, pitch, sprinting and moving flags each tick (R8) | Session & Authority |
| Game Data & Tuning (1) | In | `tuning.player_controller`, read on every peer | Game Data & Tuning (format) |
| Pack (8) | In | Fill (0 to 1) and `full_pack_slow` | Pack |
| Home Valley (5), Asteroid World (16) | In | Arrival points or landing area, bounds, kill height; walkable ground (scene colliders) | The place |
| Building (11) | Both | In: built pieces' colliders (walls, floors, stairs). Out: the view ray for placement; the capsule, so Building can refuse a piece that would overlap the player | Building |
| Mining (21), Gathering (10), Stash (12), Crafting (13), Run Flow (22) | Out | The view ray; position for their range checks (host side, from R8) | Each owner (reach and targets) |
| Oxygen (19) | Out | The sprinting flag | Oxygen (what sprinting costs) |
| Perception (18) | Out | The sprinting and moving flags; position | Perception (noise and sight) |
| Creature AI (20) | Out | Position (host side, from R8) | Creature AI. Design intent shared with it: `burrower_speed` sits between walk and sprint speed (F1, Edge Cases) |
| Health & Damage (17), Run Flow (22) | In | Death and run states that freeze movement (R10) | Their owners |
| Run HUD (24) | Out | The walk-back time estimate's inputs (F1's current speed) if the HUD shows one | Run HUD |
| Menus & Settings (27), Accessibility & Options (29) | In | Field of view and head bob settings (when they exist) | Their owners |

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
| sprinting | bool | — | calculated (R4) | Sprint active, moving forward, on the ground |
| s | float, share | 0 to 0.6 | data file (Pack's `full_pack_slow`) | Share of speed lost with a full pack |
| f | float, share | 0 to 1 | calculated (Pack's fill) | How full the pack is |
| \|move\| | float | 0 to 1 | calculated (Input, F3) | How far the Move axis is pushed |
| v_target | float, m/s | 0 to 12 | calculated | The horizontal speed the body ramps towards |

**Output Range:** 0 (no input) to 12 m/s (maximum sprint, empty pack). With
MVP values: empty walk 3.8, empty sprint 6.2, full walk 2.47, full sprint 4.03.
**Boundaries:** `s` at its maximum 0.6 and `f` = 1 leave 40% of speed, so a
full pack never stops the player (the slowest possible is 2 × 0.4 = 0.8 m/s).
`s` = 0 makes the pack weightless, which removes Pillar 1's main movement
cost; the min stays 0 so a playtest can try it. `walk_speed` above
`sprint_speed` would make sprinting slower than walking; Game Data & Tuning's
constraint `walk_speed ≤ sprint_speed` refuses it.
**Example:** pack 12 of 16 slots full (f = 0.75), sprinting:
6.2 × (1 − 0.35 × 0.75) = 6.2 × 0.7375 = **4.57 m/s**, just above the
burrower's 4.4 m/s. At 14 slots (f = 0.875): 6.2 × 0.694 = **4.30 m/s**, below
it. The crossover sits at about 13 of 16 slots, so "one more seam" late in a
run is also "can I still outrun it".

### F2. Ramp to target velocity

The `move_ramp` formula is defined as:

`v_h ← MoveTowards(v_h, v_target_vec, a × dt)`, where
`a = sprint_speed / accel_time` if `|v_target_vec| > |v_h|`, else
`a = sprint_speed / decel_time`; a time of 0 means the velocity is set to the
target at once.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| v_h | vector, m/s | length 0 to 12 | calculated | Current horizontal velocity |
| v_target_vec | vector, m/s | length 0 to 12 | calculated (F1 and R3) | Target horizontal velocity |
| accel_time | float, `s` | 0 to 0.5 | data file | Time from standing to full sprint |
| decel_time | float, `s` | 0 to 0.5 | data file | Time from full sprint to standing |
| dt | float, `s` | 0 to 0.1 | calculated (F6) | This frame's time step |
| a | float, m/s² | 6 and up (3 / 0.5 at the slowest; a time of 0 means instant) | calculated | Ramp rate |

**Output Range:** the velocity reaches any target within `accel_time` (or
`decel_time`), and slower targets sooner: with MVP values a walk start takes
0.074 s, a full sprint start 0.12 s, a stop from sprint 0.08 s.
**Boundaries:** `accel_time` or `decel_time` = 0 would divide by zero; it is
defined as "set at once" instead (the prototype's instant movement). At the
maximum 0.5 s and the minimum sprint 3 m/s, `a` = 6 m/s², the slowest ramp
allowed: still under half a second. Turning around (target opposite the
current velocity) passes through zero at the down rate, then rises at the up
rate, so there is no instant reversal and no overshoot.
**Example:** standing, Move pushed forward, walking: `a` = 6.2 / 0.12 =
51.7 m/s²; after one 1/60 s frame `v_h` = 0.86 m/s; it reaches 3.8 m/s after
5 frames (0.074 s).

### F3. Look

The `look_angles` formula is defined as:

`yaw ← yaw + lx × look_sens + turn × key_turn × dt`
`pitch ← clamp(pitch − ly × look_sens + updown × key_turn × dt, −pitch_max, pitch_max)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| lx, ly | float, pixels | any | calculated (Input, F4: mouse movement after sensitivity and invert) | Look this frame; ly positive is down the screen |
| look_sens | float, rad/px | 0.0005 to 0.006 | data file | Radians per pixel |
| turn, updown | float | −1 to 1 | calculated (Input's Turn and Look Up/Down) | Keyboard look axes; updown positive is up |
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

`grounded: vy = −ground_stick`
`falling or sliding: vy ← max(vy − gravity × dt, −terminal_fall_speed)`
`sliding: v_slide ← v_slide + gravity × sin(θ) × dt` along the slope's downhill direction, capped at `terminal_fall_speed`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| gravity | float, m/s² | 1 to 30 | data file | Gravity's pull (9.81 in both places in the MVP) |
| terminal_fall_speed | float, m/s | 10 to 80 | data file | Fastest fall |
| ground_stick | float, m/s | 0.5 to 5 | data file | Small downward speed that keeps the capsule on the ground over bumps and down steps |
| θ | float, degrees | above `slope_limit_deg` to 90 | calculated | The steep slope's angle |
| vy | float, m/s | −terminal_fall_speed to 0 | calculated | Vertical velocity (never upwards: no jump) |

**Output Range:** vertical speed 0 to 50 m/s down with MVP values. A 10 m fall
takes about 1.4 s and lands at about 14 m/s, with no damage (R12).
**Boundaries:** `gravity` = 0 is outside the range (the player would float off
an edge forever). θ at 90° (a wall) slides at full gravity, which is a fall.
**Example:** walking off a 2 m foundation edge: after 0.64 s the player has
fallen 2 m at 6.3 m/s and is Grounded again.

### F5. Head bob

The `head_bob_offset` formula is defined as:

`bob_y = A × w × sin(2π × d / stride_m)`, where `d` grows by the horizontal
distance moved each frame while Grounded, and `w` eases from 0 to 1 while
moving and back to 0 within 0.15 s of stopping

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| A | float, `m` | 0 to 0.06 | data file (`head_bob_amplitude_m`), times 0 if the player's head-bob setting is off | Bob height |
| stride_m | float, `m` | 0.8 to 3.0 | data file | Distance per full bob |
| w | float | 0 to 1 | calculated | Fade weight |
| d | float, `m` | 0 and up | calculated | Distance walked |
| bob_y | float, `m` | −A to A | calculated | Camera offset; never applied to the view ray (R11) |

**Output Range:** ±2 cm with MVP values, about 2.4 bobs per second at walk
speed and 3.9 at sprint.
**Boundaries:** `A` = 0 turns bob off. `stride_m` small with sprint speed high
(0.8 m at 12 m/s) gives 15 bobs a second, a buzz; the minimum stride keeps it
below that only with MVP speeds, so stride and speeds interact (Tuning Knobs).
**Example:** walking 3.8 m/s with stride 1.6 m: 2.4 bobs per second, peak
2 cm.

### F6. Long-frame clamp

The `move_dt` formula is defined as:

`dt = min(frame_time, max_move_dt)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| frame_time | float, `s` | 0 and up | calculated (the engine's frame time) | Real time since the last frame |
| max_move_dt | float, `s` | 0.02 to 0.2 | data file | Longest step movement may take in one frame |
| dt | float, `s` | 0 to `max_move_dt` | calculated | Step used for F2 to F5 |

**Output Range:** up to 0.1 s with MVP values. A frame longer than that (a
hitch or a load spike) moves the player only 0.1 s worth, so the game runs
slow for that frame instead of tunnelling through a thin wall.
**Boundaries:** at 0.1 s and 12 m/s the capsule moves 1.2 m in one step, more
than a wall's thickness; the `CharacterController` sweep handles it, and the
clamp keeps the step bounded. `frame_time` = 0 moves nothing.
**Example:** a 0.4 s hitch while sprinting moves the player 0.62 m, not 2.48 m.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included.

**Movement and speed**

- **If W and S are both held**: Input cancels them to zero (Input, F3); the
  player stops through the ramp-down.
- **If Sprint is held while moving only sideways or backwards**: walk speed;
  the sprinting flag stays off, so Oxygen and Perception charge nothing.
- **If Sprint is toggled on and the player stops**: the toggle turns off (R4).
  Moving again is at walk speed until Sprint is pressed again.
- **If the pack's fill changes mid-stride** (picking up ore while moving,
  or ore lost): F1's target changes that frame; the ramp (F2) carries the body
  to the new speed, so there is no jolt.
- **If Pack reports a fill outside 0 to 1** (a bug): it is clamped to 0 to 1
  and logged.
- **If `walk_speed` and `sprint_speed` are equal**: valid; sprinting looks the
  same and only costs oxygen and noise. Tuning, not a bug.
- **If the player is falling and holds Sprint**: no sprint while airborne (R4);
  on landing, sprint resumes if still held and moving forward.

**Ground and collision**

- **If the ground has a step higher than `step_offset`** (0.45 m): the player
  stops against it. Building must keep walkable piece edges at or below it or
  provide stairs (Open Questions, 2).
- **If the ground is steeper than `slope_limit_deg`**: the player slides down
  (F4) and cannot walk up. Home Valley's rim and Asteroid World's walls rely on
  this (Home Valley, R6).
- **If the player stands on a piece that a storm destroys**: the piece's
  collider is gone the next frame; the player falls to whatever is below.
  No damage.
- **If Building is asked to place a piece overlapping the player's capsule**:
  Building refuses it (Building's rule; Player Controller supplies the
  capsule). If a piece appears overlapping the capsule anyway (a co-op
  teammate's placement, later), the `CharacterController` pushes the player
  out along the shortest direction on the next move.
- **If a long frame occurs** (over 0.1 s): only 0.1 s of movement is applied
  (F6); no tunnelling.
- **If the player is pushed into a creature**: creatures block like walls in
  the MVP; neither pushes the other. Creature AI decides creature collision.

**Placement and bounds**

- **If the player falls below the kill height or leaves the bounds**: the
  place supplies an arrival point and the player is placed there (R9). At home
  that is Home Valley's R3; on a run it is Asteroid World's decision
  (provisional: the landing area).
- **If the player is placed where the capsule overlaps something**: the place
  is responsible for clear arrival points (Home Valley keeps its clearance
  free); if it overlaps anyway, the first move pushes the player out.
- **If the game loads**: the position was never saved; the place places the
  player (R9).

**States, pause and death**

- **If the game is paused mid-fall**: the player freezes in the air (R10);
  falling resumes from the same speed on unpause.
- **If the window loses focus**: Input drops held keys (Input's rule); the
  player ramps to a stop. The session is not paused unless the player pauses
  (ADR-0003: the clock keeps running in the background).
- **If the player dies mid-sprint**: movement and look stop that frame (R10);
  the sprinting flag goes off, so Oxygen stops charging the sprint cost.
- **If a panel opens while sprinting** (Input switches to Panel context): Move
  and Sprint stop arriving; the player ramps to a stop within `decel_time`.

**Network (co-op later, solo now)**

- **If the client reports a position the host finds out of range for an action**:
  the owning system refuses the action (its range check). Player Controller
  does nothing extra.
- **If the client reports an impossible position** (a cheat or a teleport bug):
  the host trusts it (ADR-0001's accepted shortcut). Revisit before networked
  melee (Open Questions, 5).

**Degenerate strategies checked**

- **Backpedal-sprinting while watching a creature**: not possible (R4).
- **Walking along the rim wall to see over it**: the wall stops the capsule;
  nothing beyond is reachable.
- **Dropping ore to outrun a creature**: allowed and intended. Lightening the
  pack is a real choice (Pack decides whether dropping exists); it costs the
  haul.
- **Standing on a built roof to escape storms or reach the rim**: no jump, so
  only stairs reach a roof; the rim wall still holds (Home Valley, Edge
  Cases).

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Input (3) | Hard | Move, Look, Turn, Look Up/Down, Sprint; the hold or toggle setting (its R2, R3, F3, F4) | Designed. Its R2 says Jump and Crouch are not in the MVP; this doc keeps it so |
| Session & Authority (2) | Hard | Movement rules per session state and pause (its R5); the tick for position reports (R8) | Designed |
| Game Data & Tuning (1) | Hard | `tuning.player_controller`, read on every peer; the constraint `walk_speed ≤ sprint_speed` | Designed (Needs Revision after its re-review; nothing here depends on the items under revision) |
| Pack (8) | Hard | Fill and `full_pack_slow` | Not written: provisional. Pack comes later in the design order, so this doc assumes its contract: a fill from 0 to 1 and `full_pack_slow` as Game Data & Tuning records it. This row's Depends On in the systems index does not list Pack (Open Questions, 3) |
| Home Valley (5) | Hard | Arrival points, bounds, kill height | Designed. Not in this row's Depends On in the systems index (Open Questions, 3) |
| Asteroid World (16) | Hard (Milestone B) | Landing area, bounds, kill height | Not written: provisional |
| Health & Damage (17), Run Flow (22) | Soft | Death and run states that freeze movement | Not written: provisional |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Gathering (10) | Hard | View ray, position | Not written: provisional |
| Building (11) | Hard | View ray for placement; the capsule, to refuse a piece over the player; the step height its pieces must respect | Not written: provisional |
| Oxygen (19) | Hard | Sprinting flag | Not written: provisional |
| Creature AI (20) | Hard | Position; walk and sprint speeds as the bracket for `burrower_speed` | Not written: provisional |
| Mining (21) | Hard | View ray, position | Not written: provisional |
| Perception (18) | Soft | Sprinting and moving flags, position | Not written: provisional. Its index row does not list Player Controller (Open Questions, 3) |
| Stash (12), Crafting (13), Run Flow (22) | Soft | View ray and position for interaction range | Not written: provisional |
| Run HUD (24) | Soft | Current speed, if it shows a walk-back estimate | Not written: provisional |
| Home Valley (5) | Soft | `walk_speed` in its F4 rebuild time; `slope_limit_deg` for its rim | Designed: it names Player Controller in its Interactions and Tuning Knobs, matching |

Bidirectional check: Input lists "Player Controller (6) | Hard | Move, Look,
Turn, Look Up/Down, Sprint", matching. Game Data & Tuning lists "Player
Controller (6) | Hard | `tuning.player_controller`, read on every peer",
matching. Home Valley lists Player Controller as a downstream reader of its
arrival points, bounds and kill height, matching this doc's upstream row.

## Tuning Knobs

### This system's tuning set: `tuning.player_controller`

All in Game Data & Tuning's R3 record shape, read on every peer. Values marked
*prototype* are carried over from `prototypes/star-haul/config.js` (retest
round 2, 2026-11-27); the others are new starting values. All `provisional:
true` until the first playable in Unity: the browser prototype cannot settle
first-person feel (prototype REPORT: "cannot settle first-person feel in
Unity").

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `walk_speed` | float | 3.8 | 2 | 8 | 0.1 | m/s | live | Trudging; walk back too long | A walk outpaces burrowers; no need to sprint | *Prototype.* Below `burrower_speed` 4.4 on purpose |
| `sprint_speed` | float | 6.2 | 3 | 12 | 0.1 | m/s | live | Sprint cannot escape | Even a full pack escapes (F1) | *Prototype.* Above 4.4 empty, below it with a full pack |
| `look_sens` | float | 0.0022 | 0.0005 | 0.006 | 0.0001 | rad/px | live | Sluggish turning | Twitchy aim | *Prototype* |
| `key_turn` | float | 1.9 | 0.5 | 4 | 0.1 | rad/s | live | Keyboard-only players cannot turn in time | Overshoot | *Prototype* |
| `pitch_max` | float | 1.35 | 1.0 | 1.55 | 0.05 | rad | live | Cannot look at the ceiling or floor seams | Near-vertical views feel odd | *Prototype's* clamp |
| `accel_time` | float | 0.12 | 0 | 0.5 | 0.01 | s | live | 0: instant, twitchy | Floaty, unresponsive | Weight without slowness |
| `decel_time` | float | 0.08 | 0 | 0.5 | 0.01 | s | live | 0: instant stop | Slides past cover | Stops a little faster than it starts |
| `gravity` | float | 9.81 | 1 | 30 | 0.1 | m/s² | live | Floaty falls | Harsh snaps down steps | Earth gravity in both places; Asteroid World may ask for its own later (Open Questions, 4) |
| `terminal_fall_speed` | float | 50 | 10 | 80 | 1 | m/s | live | Slow falls look wrong | Tunnelling risk on long falls | Generous; long falls are not planned |
| `ground_stick` | float | 2 | 0.5 | 5 | 0.1 | m/s | live | Bouncing off down-steps | Glued to slopes | Standard for a `CharacterController` |
| `ground_snap_m` | float | 0.1 | 0.02 | 0.5 | 0.01 | m | live | Flickers between Grounded and Falling on bumps | Never falls off small edges | Matches the physics reference's ground check ray |
| `eye_height` | float | 1.6 | 1.4 | 1.75 | 0.05 | m | restart | Feels like crouching; walls tower | Floats above the scene; must stay below `capsule_height` | Average standing eye height |
| `capsule_height` | float | 1.8 | 1.6 | 2.0 | 0.05 | m | restart | Fits under low ceilings it should not | Blocked by low cave ceilings | Standing adult |
| `capsule_radius` | float | 0.35 | 0.25 | 0.5 | 0.01 | m | restart | Slips through gaps between pieces | Snags on door frames | Fits Building's doorways if they are at least 0.9 m wide (Open Questions, 2) |
| `step_offset` | float | 0.45 | 0.1 | 0.6 | 0.05 | m | restart | Stuck on small ledges and foundations | Walks up waist-high blocks; must stay below `capsule_height` | Lets the player step onto a low foundation; Building keeps edges at or below it |
| `slope_limit_deg` | float | 45 | 20 | 60 | 1 | degrees | restart | Cannot climb the valley's gentle slopes | Climbs out of the valley; Home Valley's rim must stay steeper | Home Valley authors its rim steeper than this |
| `fov_vertical_deg` | float | 70 | 55 | 90 | 1 | degrees | live | Cramped, motion sickness risk | Fish-eye; distant seams too small to read | About 102° horizontal at 16:9; a player setting later (Accessibility & Options) |
| `head_bob_amplitude_m` | float | 0.02 | 0 | 0.06 | 0.005 | m | live | 0: off | Nausea | Subtle; a player setting turns it to 0 |
| `stride_m` | float | 1.6 | 0.8 | 3.0 | 0.1 | m | live | Buzzing bob at sprint | Slow, wading bob | About a walking stride |
| `max_move_dt` | float | 0.1 | 0.02 | 0.2 | 0.01 | s | restart | The game slows on ordinary frame drops | Long steps on hitches | One tenth of a second |

**Constraints between keys:** `walk_speed ≤ sprint_speed` (already in Game
Data & Tuning); `eye_height < capsule_height`; `step_offset < capsule_height`.

**Knobs that interact:**

- `walk_speed`, `sprint_speed`, Pack's `full_pack_slow` and Creature AI's
  `burrower_speed` together decide who escapes (F1). Changing any one moves the
  crossover (13 of 16 slots with MVP values). Name all four in any balance
  pass.
- `stride_m` and the speeds together set the bob's rate (F5).
- `slope_limit_deg` must stay below the steepest walls of Home Valley's rim and
  Asteroid World's edges, or the player can climb out.
- `step_offset` and `capsule_radius` constrain Building's piece edges and
  doorways.

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `full_pack_slow` (0.35) and the fill | Pack | F1 |
| Mouse sensitivity multiplier, invert, sprint hold or toggle | Input (player settings) | F3, R4 |
| `burrower_speed` (4.4) | Creature AI | Design intent in F1 |
| `sprint_oxygen_mult`, `sprint_noise` | Oxygen, Perception | Read the sprinting flag (R4) |
| Field of view and head bob as player settings | Accessibility & Options | R11 |

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
| Sprinting | Hands and tool lower and swing faster; field of view does **not** change (no FOV kick: comfort) | Player Controller |
| Full pack | Slower stride; the hand sway slows with speed. No extra effect: speed itself is the signal | Player Controller |
| Landing from a fall | A short dip of the hands (about 0.1 s); no camera shake | Player Controller |
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
and quicker; the suit breathes harder while sprinting on a run (Oxygen may
own the breath, since it signals oxygen cost). A soft landing thud after a
fall. Footstep sound is presentation only: Perception's noise comes from the
sprinting flag, not from the audio.

> 📌 **Asset Spec** — Visual/Audio requirements are defined. After the art
> bible is approved, run `/asset-spec system:player-controller` to produce
> per-asset visual descriptions, dimensions, and generation prompts from this
> section.

## Game Feel

Required for this `Gameplay` system. Measured in the built game, at 60 fps on
the target PC:

- **Input to motion.** A Move key press shows movement in the next rendered
  frame (the ramp starts at once; at 60 fps the first frame moves 0.86 m/s ×
  1/60 s). Mouse look turns the camera in the same frame as the mouse report:
  no smoothing.
- **Weight.** Reaching full walk speed takes about 0.07 s, full sprint 0.12 s,
  stopping 0.08 s (F2). Players should describe the body as "solid", not
  "slippery" or "sluggish" (playtest question).
- **The pack is felt.** With a full pack, a player sprinting back to the ship
  notices they are slower within 3 seconds without looking at the HUD
  (playtest: 4 of 5 testers say so unprompted or when asked "did anything
  change?").
- **Escape is legible.** From 10 m, an empty-pack sprint visibly opens the gap
  on a chasing burrower; with 14 or more of 16 slots full, it visibly closes
  (Creature AI integration test).
- **Comfort.** No forced camera motion from this system beyond a 2 cm bob that
  can be turned off; no FOV change on sprint; horizon always level (no camera
  roll). A 30-minute session should not cause motion sickness in testers who do
  not usually get it from first-person games (playtest question).
- **No snags.** Walking along a built wall, through a 0.9 m doorway, up stairs
  and over foundation edges at or below 0.45 m never stops the player
  unexpectedly (AC 15).

## UI Requirements

Player Controller draws one piece of UI: a small, plain **crosshair dot** at
the screen's centre, showing where the view ray points (R7), in Beacon Cream
with a dark outline so it reads on grass, rock and sky (art bible: cream is
"ours"; never magenta). Systems that target things change how their target is
highlighted (for example the cream interactable rim); they do not change the
dot. The dot can be hidden by an Accessibility & Options setting later. Field
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
| R1, R4, R6, F1, F3 | Input | Actions and contexts (R2 to R4), move vector (F3), look after settings (F4), Jump and Crouch not in the MVP | [input.md](input.md) |
| R1, R8, R10 | Session & Authority | Movement is not a request (R3), movement per session state (R5), tick | [session-and-authority.md](session-and-authority.md) |
| R1, Tuning Knobs | Game Data & Tuning | Record shape (R3), read on every peer, `walk_speed ≤ sprint_speed`, prototype starting values, Pack owns `full_pack_slow` | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R9, Edge Cases | Home Valley | Arrival points (R3), bounds and kill height (R6), position not saved (R8), rim steeper than `slope_limit_deg` | [home-valley.md](home-valley.md) |
| R1, R8 | ADR-0001 | Player movement and look are owner-authoritative; the host trusts reported position | [adr-0001-network-model.md](../../docs/architecture/adr-0001-network-model.md) |
| Edge Cases | ADR-0003 | The clock keeps running with the window in the background | [adr-0003-home-and-storm-persistence.md](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| Player Fantasy, F1 | Game concept | Pillars 1, 2 and 3; "tense and deliberate"; pressure rises with value carried | [game-concept.md](game-concept.md) |
| Visual/Audio, UI | Art bible | Section 5 (the player, detail at distance), Section 4 (Beacon Cream, no magenta) | [art-bible.md](../art/art-bible.md) |
| Tuning Knobs, F1 | Browser prototype | walk 3.8, sprint 6.2, full_pack_slow 0.35, look_sens 0.0022, key_turn 1.9, pitch clamp 1.35, burrower 4.4 | `prototypes/star-haul/config.js`, `index.html` |

## Acceptance Criteria

**QA-lead lens applied** (`lens-qa-lead.md`, against Sections C, D and E as
written). Every core rule R1 to R12 and formula F1 to F6 has at least one
criterion. Story types: **Logic** (EditMode test of the plain movement maths,
which must be written so it can run without a scene), **Integration**
(PlayMode test or documented playtest), **Visual** (retained screenshot),
**Playtest**. Gaps fixed in the first draft: no criterion for sprint toggle
reset; no cross-system check with Pack; "feels solid" moved to a playtest
question.

**Speed and sprint (R3, R4, R5, F1)**

1. **GIVEN** an empty pack and Move fully forward, **WHEN** the player walks
   for 1 s on flat ground, **THEN** horizontal speed is 3.8 m/s ± 0.05 after
   the ramp. *(Logic)*
2. **GIVEN** an empty pack, Sprint held and Move fully forward, **THEN** speed
   is 6.2 m/s ± 0.05; **AND GIVEN** Sprint held and Move only sideways or
   backwards, **THEN** speed is 3.8 m/s and the sprinting flag is off.
   *(Logic)*
3. **GIVEN** Pack reports fill 1.0 with `full_pack_slow` 0.35, **WHEN** the
   player sprints forward, **THEN** speed is 4.03 m/s ± 0.05; **AND GIVEN** fill
   0.75, **THEN** 4.57 m/s ± 0.05; **AND GIVEN** fill 0, **THEN** 6.2 m/s.
   *(Logic; Integration with Pack once Pack exists)*
4. **GIVEN** Move pushed halfway (|move| 0.5), empty pack, walking, **THEN**
   speed is 1.9 m/s ± 0.05. *(Logic)*
5. **GIVEN** Sprint in toggle mode and toggled on while moving forward,
   **WHEN** Move returns to zero and then forward again, **THEN** the player
   walks (3.8 m/s) and the sprinting flag is off. *(Logic)*
6. **GIVEN** the player falling with Sprint held and Move forward, **THEN** the
   sprinting flag is off; **WHEN** they land with both still held, **THEN** it
   turns on that frame. *(Logic)*
7. **GIVEN** Pack reports fill 1.4 (a bug), **THEN** F1 uses 1.0 and one log
   line is written. *(Logic)*

**Ramp (F2)**

8. **GIVEN** standing still, **WHEN** Move goes fully forward while walking,
   **THEN** speed reaches 3.8 m/s within 0.075 s and never exceeds it;
   **WHEN** Move is released from a 6.2 m/s sprint, **THEN** speed reaches 0
   within 0.08 s. *(Logic)*
9. **GIVEN** `accel_time` and `decel_time` set to 0, **WHEN** Move is pressed
   and released, **THEN** speed jumps to target and to 0 in a single frame with
   no division error. *(Logic)*
10. **GIVEN** moving forward at 6.2 m/s, **WHEN** Move flips to fully back,
    **THEN** speed passes through 0 and rises to 3.8 m/s backwards, never
    exceeding the target in either direction. *(Logic)*

**Look (R6, F3)**

11. **GIVEN** a mouse movement of 100 px right at sensitivity 1, **THEN** yaw
    changes by 0.22 rad ± 0.001 in the same frame; **AND GIVEN** 10,000 px
    down, **THEN** pitch stops at −1.35 rad. *(Logic)*
12. **GIVEN** the right arrow held for 1.0 s, **THEN** yaw changes by 1.9 rad
    ± 0.02, whether the frame rate is 30 or 144 fps. *(Logic)*

**Ground, falling, sliding (R2, F4, F6)**

13. **GIVEN** the player walks off a 2 m ledge, **THEN** they land after
    0.64 s ± 0.03 and take no damage. *(Logic or Integration)*
14. **GIVEN** a 50° slope in a test scene, **WHEN** the player walks into it,
    **THEN** they make no upward progress and slide down; **AND GIVEN** a 40°
    slope, **THEN** they walk up it. *(Integration)*
15. **GIVEN** a test scene with a 0.45 m step, a 0.5 m step, a 0.9 m doorway
    and a straight stair, **WHEN** the player walks into each, **THEN** they
    step up the 0.45 m step without stopping, are stopped by the 0.5 m step,
    pass the doorway without snagging and climb the stair. *(Integration)*
16. **GIVEN** a simulated 0.4 s frame while sprinting at 6.2 m/s towards a
    0.2 m thick wall 0.5 m away, **THEN** the player moves at most 0.62 m and
    does not pass through the wall. *(Integration)*
17. **GIVEN** the player standing on a piece, **WHEN** the piece is removed,
    **THEN** they enter Falling the next frame and land on what is below.
    *(Integration with Building)*

**States, placement, reporting (R8, R9, R10)**

18. **GIVEN** the game paused while the player falls at 5 m/s, **WHEN** 10 s
    pass and the game is unpaused, **THEN** the player has not moved while
    paused and resumes falling at 5 m/s. *(Logic)*
19. **GIVEN** the session state Launching Run, Ending Run, or the player dead,
    **WHEN** Move and Look are pressed, **THEN** position and view do not
    change. *(Integration with Session & Authority)*
20. **GIVEN** the player at home below Home Valley's kill height, **THEN**
    within one frame they are at the first free arrival point, facing its
    facing, pitch 0, speed 0, sprint toggle off. *(Integration with Home
    Valley)*
21. **GIVEN** a solo session, **WHEN** the player moves, **THEN** the host's
    record of their position matches the client's within one tick, and the
    sprinting and moving flags match. *(Integration with Session & Authority)*
22. **GIVEN** a stash panel opens while sprinting, **THEN** the player stops
    within 0.08 s and the sprinting flag turns off. *(Integration with Input)*

**View ray, camera, bob (R7, R11, F5)**

23. **GIVEN** any yaw and pitch, **THEN** the published view ray starts at the
    eye (1.6 m above the capsule base) and points through the screen centre;
    head bob never changes it (compare the ray at bob peak and trough).
    *(Logic)*
24. **GIVEN** walking at 3.8 m/s with stride 1.6 m and bob 0.02 m, **THEN** the
    camera's vertical offset peaks at ±0.02 m about 2.4 times per second, and
    returns to 0 within 0.15 s of stopping; **AND GIVEN** bob amplitude 0,
    **THEN** the camera does not move vertically. *(Logic)*
25. **GIVEN** the default settings at 1920 × 1080, **WHEN** a screenshot is
    taken facing a wall at arm's length, **THEN** the hands and tool are
    visible and do not clip into the wall, the crosshair dot is at the centre,
    and the vertical field of view is 70°. *(Visual)*

**Playtest**

26. **GIVEN** five testers on a test asteroid with a burrower, **WHEN** each
    runs back to the ship with an empty pack and again with 14 of 16 slots
    full, **THEN** at least 4 of 5 notice the slower full-pack run unprompted
    or when asked "did anything change?", and the full-pack run is caught by
    a chasing burrower from 10 m while the empty one is not. *(Playtest;
    Milestone B)*
27. **GIVEN** five testers in a 30-minute home session, **WHEN** asked after,
    **THEN** none who do not usually get motion sickness in first-person games
    report it, and at least 4 describe movement as solid or responsive rather
    than floaty, slippery or sluggish. *(Playtest)*

**Performance:** the movement maths for one player costs under 0.05 ms per
frame on the owning client; the `CharacterController` move is one sweep per
frame. The host does no movement work beyond storing the reported position.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | No jump in the MVP is a decision taken on the designer's behalf. Building games often have one; if the designer wants it, Jump takes Space (Input, R2) and the escape-speed bracket must be rechecked (can a jump onto a boulder escape a burrower?). | Designer | First playable |
| 2 | Building must keep any piece edge the player walks onto at or below `step_offset` (0.45 m) or provide stairs, and doorways at least 0.9 m wide for the 0.35 m capsule. Building must also refuse a piece that would overlap the player's capsule. | Building (11) | Building design doc |
| 3 | The systems index's Depends On for this row lists Session & Authority, Game Data & Tuning and Input, but not Pack (fill and `full_pack_slow`) or Home Valley and Asteroid World (arrival points, bounds, kill height). Perception's row does not list Player Controller. Add them, or record why not. | `/map-systems` (producer) | Next systems-index update |
| 4 | Should the asteroid have lower gravity than the valley? A lower `gravity` on the asteroid would change falling feel and could be the place's tuning rather than this system's. MVP: one value, 9.81, in both. | Asteroid World (16), designer | Asteroid World design doc |
| 5 | The host trusts reported positions (ADR-0001). A speed sanity check on the host (refusing actions after an impossible move) is cheap but not needed solo. Revisit with co-op. | network-programmer | Before Tier 2a co-op |
| 6 | Does breathing harder while sprinting belong to Oxygen (it signals oxygen cost) or here? | Oxygen (19), audio-director | Oxygen design doc |
| 7 | All feel values are provisional: the browser prototype could not test first-person feel in Unity. The first playable must re-tune walk, sprint, ramps, FOV and bob. | Designer, game-designer | First Unity playable |
| 8 | Should the full-pack slow apply at home? Walking a full haul from the landing spot to the stash at 35% less speed could make unpacking, the concept's home payoff, feel like a chore. Options if it does: no slow at home, or a lower home value. Kept as one body for now (CD-GDD-ALIGN concern). | Designer | First playable that has runs (Milestone B) |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Overview framed as both the body and its role for other systems.
2. Player Fantasy: "Every step home is heavier", felt as "careful hands,
   steady feet".
3. **No jump, crouch or dodge in the MVP.** *Major: it shapes Building's
   pieces and the escape bracket.*
4. Start and stop ramp of 0.12 s and 0.08 s, instead of the prototype's
   instant movement.
5. Subtle head bob (2 cm), to be switchable off.
6. Sprint only while moving forward; sideways and backwards stay at walk
   speed.
7. No fall damage in the MVP.
8. One gravity value (9.81) for both places.
9. No stamina: oxygen is the sprint cost on a run; sprinting at home is free.
10. Prototype values kept: walk 3.8, sprint 6.2, look 0.0022, key turn 1.9,
    pitch limit 1.35; full-pack slow (Pack's 0.35) applies linearly with fill.
11. New starting values: capsule 1.8 × 0.35 m, eye 1.6 m, step 0.45 m, slope
    limit 45°, vertical FOV 70°.
12. A centre crosshair dot in Beacon Cream; no FOV kick on sprint.
13. Long frames clamped to 0.1 s of movement.
14. The player's position is never saved; each place puts the player at its
    arrival point.
