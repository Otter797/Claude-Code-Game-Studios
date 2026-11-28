# Input

> **Status**: Designed (pending `/design-review` in a fresh session)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode)
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-27
> **Last Verified**: 2026-11-27
> **Implements Pillar**: Pillar 2 (Risk is a choice); accessibility floor (remappable input)

## Summary

Input turns keys, mouse and (later) gamepad into named actions such as Move,
Look, Use Tool, Interact and Place, decides which actions are live from the
context the player is in (on foot, building, a panel open, a menu), applies the
player's control settings, and lets every action be rebound. It never changes
game state: actions become requests or movement for the systems that own them.
Players feel it as controls that disappear, kept from the prototype that passed
its tension retest, and as a game they can play with keys of their own choice.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `Game Data & Tuning`; `Session & Authority` (soft) · Category: `Core`

## Overview

Input turns what the player's hands do (keys, mouse buttons, mouse movement,
the scroll wheel, and later a gamepad) into named *actions*: Move, Look,
Sprint, Use Tool, Interact, Place, Rotate, Pause and the rest. Every other
system listens for actions, never for keys, so any action can be rebound and a
gamepad can be added without touching a rule. Input also decides which actions
are live at any moment, from the *context* the player is in (walking around,
building, a stash panel open, the pause menu), so the same key can mean
"interact" on foot and something else in a menu without the two ever firing
together. It applies the player's own control settings (sensitivity, invert,
hold or toggle sprint) and releases every held action when the game loses
focus, so nothing sticks. Input sits in the Presentation layer (ADR-0001): it
never changes game state. A pressed action becomes a request to Session &
Authority, or movement handed to Player Controller, and the rules decide what
happens. Without this system every feature would read keys directly, rebinding
would be impossible, and the accessibility floor the project holds to
(remappable input, nothing that needs a fast double press) would have no home.

## Player Fantasy

**Indirect: the player feels the controls disappear.**

**The controls disappear.** The moment this system serves comes about ten
minutes into a run: the pack is nearly full, a burrower rears up, and the
player's hands sprint, turn and drill without a thought about which key does
what. The prototype's tension retest passed with these same basic controls
(WASD, mouse, hold to drill, Shift to sprint), so the Unity build keeps them.
Pillar 2 says *"Danger is always readable"*; a player who is fighting the
controls cannot read anything. Input succeeds when nobody notices it.

**Your hands, your keys** (supporting). Every action can be rebound, sprint
can be a toggle instead of a hold, nothing needs a quick double press, and a
keyboard-only player can look around with the arrow keys. A player who cannot
use the defaults still gets the same game.

What this asks of the rest of the design: every feature names actions, not
keys; no rule depends on how fast the player can press something unless the
design doc says that speed is the point; and every destructive action (removing
a built piece) asks for a deliberate hold, not a tap.

## Detailed Design

### Core Rules

Specialist lenses applied before drafting (Camera/input/controls row):
`game-designer` (primary), `ux-designer` and `gameplay-programmer`
(supporting), matching the systems index's agents for this row. The
game-designer asked that the prototype's proven controls carry over; the
ux-designer set the accessibility floor (remappable, toggle options, no colour
or speed requirements, keyboard-only look); the gameplay-programmer asked that
nothing reads a device directly and that held inputs are released on every
context change. The lenses disagreed on gamepad support in the MVP and on what
Space does; the choices taken for the designer are listed in Open Questions.

**R1. Actions, not keys.** Every input the game responds to is a named action.
Game and UI code read actions only; no code outside this system reads a key,
button or device directly. An action has a *type*:

- **Button** (pressed or not, with press and release moments): Use Tool,
  Interact, Sprint, Place, Pause…
- **Axis 2D** (a direction): Move, Look.
- **Axis 1D** (a signed amount): Cycle (scroll wheel), Turn (keyboard look).

**R2. The MVP action list.** Each action belongs to one or more contexts (R4)
and is owned by the system that decides what it does. Input owns the list's
format, the defaults and the contexts; adding an action is a change to this
document, requested by its owner.

| Action | Type | Contexts | Default (keyboard and mouse) | Owner of what it does |
|---|---|---|---|---|
| Move | Axis 2D | On Foot, Build | W A S D (by key position, R6) | Player Controller |
| Look | Axis 2D | On Foot, Build | Mouse movement | Player Controller |
| Turn | Axis 1D | On Foot, Build | Left / Right arrow | Player Controller (keyboard-only look) |
| Look Up/Down | Axis 1D | On Foot, Build | Up / Down arrow | Player Controller |
| Sprint | Button (hold, or toggle by setting) | On Foot | Left Shift | Player Controller, Oxygen |
| Use Tool | Button (hold) | On Foot | Left mouse button; Space | The equipped tool: Mining (drill), Building (hammer, repair) |
| Interact | Button | On Foot | E | Gathering, Stash, Crafting, Pack (pick up), Run Flow (exits) |
| Select Tool 1 / 2 / 3 | Button | On Foot | 1 / 2 / 3 | Tools & Gear |
| Cycle Tool | Axis 1D | On Foot | Scroll wheel | Tools & Gear |
| Use Canister | Button | On Foot (run only) | Q | Oxygen |
| Open Pack | Button | On Foot | Tab | Pack |
| Build Mode | Button | On Foot (home only), Build | B | Building |
| Place | Button | Build | Left mouse button | Building |
| Rotate Piece | Button | Build | R | Building |
| Cycle Piece | Axis 1D | Build | Scroll wheel | Building |
| Remove Piece | Button (hold) | Build | X (hold) | Building |
| Pause / Back | Button | Every context | Escape; P | Session & Authority (pause), UI (back) |
| Point | Axis 2D | Panel, Menu | Mouse cursor | UI |
| Click | Button | Panel, Menu | Left mouse button | UI |
| Alternate Click | Button | Panel, Menu | Right mouse button | UI (owning panel decides) |
| Modifier | Button | Panel | Left Shift | UI (for example quick-move, owning panel decides) |
| Close Panel | Button | Panel | Escape; E; Tab | UI |
| Navigate, Confirm, Cancel | Axis 2D, Button, Button | Menu | Arrows; Enter; Escape | UI |

"Run only" and "home only" are decided by the owning system, which refuses the
request where it does not apply (Session & Authority's "Can't do that here");
Input does not hide those actions, so the same key never silently does nothing.
Jump and Crouch are not in the MVP list; if the Player Controller design doc
adds Jump, it takes Space and Use Tool keeps the left mouse button only.

**R3. From action to effect.** Input never changes game state (ADR-0001):

- Move, Look, Turn, Look Up/Down and Sprint go to Player Controller, which owns
  movement on the player's own client.
- Every other gameplay action is turned by the owning system's Presentation
  code into a request to Session & Authority, which accepts or refuses it.
- UI actions go to the UI that has focus.

A pressed action is delivered at most once, in the frame it happened; holds
report their state every frame while held.

**R4. Contexts.** Exactly one context is active at a time, chosen by the first
match in this order:

| Order | Context | Active when | Cursor |
|---|---|---|---|
| 1 | **Menu** | Main menu, pause menu, refused screen, any confirmation dialog | Free |
| 2 | **Frozen** | Session & Authority holds the session (Starting, Loading, Resolving, Launching Run, Ending Run, Stopping) and no menu is open | Hidden; only Pause / Back is live |
| 3 | **Panel** | A stash, workbench, pack or other panel is open | Free |
| 4 | **Build** | Build mode is on (home only) | Locked to the view |
| 5 | **On Foot** | Otherwise, at home or on a run | Locked to the view |

Only the actions listed for the active context are live; all others are
ignored. Session & Authority's pause turns on the Menu context through the
pause menu. Contexts are local to each player's client; they are Presentation
state and never saved.

**R5. Changing context releases everything held.** When the context changes,
and when the game window loses focus, every held action is released at once
(Use Tool stops, Sprint ends, a Remove Piece hold is cancelled). A key still
physically held after the change counts again only after it is released and
pressed again, so an action never carries into a context the player did not
see it start in. There is no buffering of presses across a context change: a
press during Frozen is dropped, not replayed.

**R6. Keys by position.** Keyboard defaults are bound by key *position*, not by
the letter printed on the key, so W A S D is Z Q S D on an AZERTY keyboard
without anyone rebinding. Everything that shows a key to the player (control
hints, the rebinding screen) shows the name the player's own keyboard layout
gives that key.

**R7. Rebinding.** Every action can be rebound, keyboard and mouse alike:

- a binding is set by pressing the new key or button while the rebinding
  screen listens for it;
- within one context, one key or button may be bound to one action only;
  binding a key already used in that context asks whether to swap the two
  bindings or cancel (actions in different contexts may share a key, as the left
  mouse button does in On Foot, Build and Panel);
- **Pause / Back can never be left unbound**, and Escape always works as Pause /
  Back as well as its binding, so a player can always reach the menu;
- rebinding is a player setting, saved with the other settings (Menus &
  Settings; settings may use the engine's preferences store, ADR-0002), never in
  the game save;
- "Reset to defaults" restores every binding at once, or one action at a time.

The rebinding screen itself belongs to Menus & Settings (Vertical Slice); this
system provides the rules and the data from the MVP, so bindings can be set in
a development build and the rules can be tested before the screen exists.

**R8. Player control settings Input applies.** These are player settings
(stored by Menus & Settings), applied here before an action is delivered:

| Setting | Values | Default | Effect |
|---|---|---|---|
| Mouse sensitivity | multiplier 0.1 to 5 | 1.0 | Multiplies Look (F4). Player Controller's tuning turns the result into an angle |
| Invert vertical look | on / off | off | Flips Look's vertical part (F4) |
| Sprint mode | hold / toggle | hold | Toggle: one press starts sprinting, the next stops; R5 still ends it on context change |
| Use Tool mode | hold / toggle | hold | Toggle: one press starts drilling, the next stops |

Hold-type actions that a design doc makes deliberate (Remove Piece) do **not**
get a toggle: the hold is the safety.

**R9. Tap and hold.** A Button action is a *tap* if released before
`hold_threshold_s` and a *hold* once held that long (F1). Actions that need a
deliberate hold (Remove Piece) report hold progress from 0 to 1 over a
duration their owner sets (F2), so the HUD can show it filling; releasing early
cancels with no effect. No action in the game requires a double press or a
press faster than once per `hold_threshold_s`.

**R10. Devices in the MVP.** The MVP supports keyboard and mouse only. Gamepad
support is designed in (no rule names a device, F3 already defines stick
handling) and gets its default layout with Accessibility & Options (Alpha). A
gamepad connected to an MVP build is ignored without error. Steam Input and
other remapping layers are not designed here.

### States and Transitions

The context (R4) is Input's only state. It is not a free-standing state
machine: it is recomputed every frame from Session & Authority's session state
and the Presentation flags (menu open, panel open, build mode on), by R4's
order. Any change between two frames triggers R5.

| From | To | Trigger | Notes |
|---|---|---|---|
| On Foot | Build | Build Mode pressed at home | Building may refuse (for example while carrying nothing it can build); then no change |
| Build | On Foot | Build Mode or Pause / Back pressed | Pause / Back in Build leaves build mode first; a second press opens the pause menu |
| On Foot, Build | Panel | A panel opens (Interact on a stash or workbench, Open Pack) | Cursor freed |
| Panel | On Foot or Build | Close Panel, Pause / Back | Returns to the context the panel was opened from |
| Any but Menu | Frozen | Session & Authority enters a waiting state | Held actions released |
| Frozen | Previous context | The wait ends | Fresh presses needed (R5) |
| Any | Menu | Pause / Back with nothing else to close, window loses focus with auto-pause on, a dialog opens | |
| Menu | Previous context | Unpause, dialog closed | Held actions released again |

### Interactions with Other Systems

| System | Direction | What flows | Interface owner |
|---|---|---|---|
| Player Controller | Out | Move, Look (after F4), Turn, Look Up/Down, Sprint, every frame in On Foot and Build | Input owns the action values; Player Controller owns speeds, sensitivity tuning (`look_sens`, `key_turn`) and feel |
| Session & Authority | In / Out | In: the session state (to pick Frozen) and pause. Out: Pause / Back; gameplay actions become requests through each owner's Presentation code | Session & Authority owns requests and pause; Input owns contexts |
| Building, Tools & Gear, Mining, Gathering, Stash, Crafting, Pack, Oxygen, Run Flow | Out | Their actions (R2), and hold progress for deliberate holds (F2) | Each owner decides what its action does and when it is refused |
| Home HUD & Panels, Run HUD | In / Out | In: panel open or closed, build mode. Out: the active context and the display name of each action's current binding, for control hints | HUD owns layout; Input owns binding names |
| Menus & Settings | In / Out | Stores bindings and the R8 settings; hosts the rebinding screen | Menus & Settings owns storage and screens; Input owns the rules (R7) |
| Accessibility & Options | Out | Gamepad layout, further assistive options (Alpha) | Accessibility & Options |
| Game Data & Tuning | In | `tuning.input` (F1, F3, F5 values) | Game Data & Tuning |

## Formulas

Values marked `data file` live in `tuning.input` (Game Data & Tuning); values
marked `setting` are player settings (R8). Boundaries worked at minimum,
maximum and 0.

### F1. Tap or hold

The `press_kind` formula is defined as:

`press_kind = hold if (now_s − pressed_at_s) ≥ hold_threshold_s, else tap (decided at release)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| now_s, pressed_at_s | float | — | calculated | Real time now and when the button went down (real time, so pause does not stretch a press) |
| hold_threshold_s | float | 0.1–0.6 | data file | Time at which a press becomes a hold |

**Output Range:** tap or hold. A press becomes a hold the moment the threshold
is reached, without waiting for release; a tap is known only at release.
**Boundaries:** exactly at the threshold counts as a hold. A threshold of 0.1
makes almost every press a hold; 0.6 makes holds feel sluggish. A press cut by
R5 (context change) is neither: it is cancelled.
**Example:** threshold 0.25 s: a 0.18 s press of E is a tap (Interact); a 0.3 s
press becomes a hold at 0.25 s.

### F2. Hold progress for deliberate holds

The `hold_progress` formula is defined as:

`hold_progress = clamp((now_s − pressed_at_s) / hold_duration_s, 0, 1)`

The action fires once when `hold_progress` reaches 1; releasing (or R5) before
then cancels it with no effect.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| hold_duration_s | float | 0.2–3 | data file (owner's tuning set, e.g. Building's remove hold) | How long the deliberate hold lasts |
| now_s, pressed_at_s | float | — | calculated | As F1 |

**Output Range:** 0 to 1, rising linearly; fires exactly once per hold.
**Boundaries:** `hold_duration_s` cannot be 0 (range starts at 0.2), so the
division is defined. Holding past 1 does not fire again; a new press is needed.
**Example:** Remove Piece with a 0.6 s hold: at 0.3 s progress is 0.5 (the HUD
ring is half full); released at 0.4 s, nothing is removed.

### F3. Movement direction

The `move_vector` formula is defined as:

- keyboard: `raw = (right − left, forward − back)`; `move = raw / max(1, |raw|)`
- stick (from Alpha): `move = 0 if |s| < dz, else (s / |s|) × min(1, (|s| − dz) / (1 − dz))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| right, left, forward, back | int | 0 or 1 | calculated | Whether each Move key is held |
| s | vector2 | each part −1 to 1 | calculated | Raw stick position |
| dz | float | 0.05–0.4 | data file (`stick_deadzone`) | Radial dead zone |
| move | vector2 | length 0 to 1 | calculated | Direction and amount handed to Player Controller |

**Output Range:** a vector no longer than 1. Diagonal keyboard movement is
not faster than straight (length 1, not 1.41).
**Boundaries:** opposite keys together (W and S) cancel to 0 on that axis. No
keys: (0, 0). A stick inside the dead zone gives 0; at the dead zone's edge the
output starts from 0, not from `dz`, so there is no jump. `dz` is below 1, so
`1 − dz` is never 0.
**Example:** W and D held: raw (1, 1), length 1.414 → move (0.707, 0.707).

### F4. Look after player settings

The `look_input` formula is defined as:

`look_input = (dx × m, dy × m × (invert ? −1 : 1))`

where `dx`, `dy` are the mouse movement this frame in pixels. Player Controller
then multiplies by its `look_sens` tuning (radians per pixel).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| dx, dy | float | any | calculated | Raw mouse movement since the last frame, in pixels |
| m | float | 0.1–5 | setting (Mouse sensitivity) | Player's multiplier, default 1 |
| invert | bool | — | setting (Invert vertical look) | Default off |

**Output Range:** proportional to mouse movement, never smoothed or
accelerated by this system, so the same hand movement always turns the same
amount.
**Boundaries:** no movement gives (0, 0). The setting's range has no 0, so look
can never be turned off by accident. At `m = 5` and the prototype's `look_sens`
(0.0022 rad/px), 100 pixels turn 1.1 rad (63°), a fast but usable extreme.
**Example:** dx 40, dy −10, m 1.5, invert off → (60, −15) px; times 0.0022 →
0.132 rad right, 0.033 rad up.

### F5. Scroll steps

The `cycle_steps` formula is defined as, for one frame:

`cycle_steps = clamp(round(scroll_delta / notch_size), −max_steps_per_frame, max_steps_per_frame)`

applied by the owner as `index' = (index + cycle_steps) mod count`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| scroll_delta | float | any | calculated | Scroll wheel movement this frame |
| notch_size | float | — | constant | Scroll amount of one wheel notch as the engine reports it; an engine fact, not a design value (verified at the first input story, Open Question 5) |
| max_steps_per_frame | int | 1–5 | data file | Most steps one frame can take |
| count | int | ≥ 1 | calculated | Number of tools or pieces to cycle through |

**Output Range:** −`max_steps_per_frame` to +`max_steps_per_frame` steps per
frame; wraps around at both ends.
**Boundaries:** less than half a notch gives 0 steps (accumulated to the next
frame by the engine's own scroll value). With `count = 1`, any step leaves the
index unchanged.
**Example:** one notch down with 3 tools at index 2 → index (2 + 1) mod 3 = 0.

## Edge Cases

**Focus and context**

- **If the window loses focus while a key is held** (alt-tab mid-drill): every
  held action is released (R5); with auto-pause on, the pause menu opens.
  Returning needs fresh presses: the drill does not restart because the key was
  still down.
- **If the context changes while Use Tool is held** (a panel opens from an
  Interact, a run ends): Use Tool stops; to drill again, press again.
- **If a Remove Piece hold is in progress when the context changes**: it is
  cancelled at its current progress; nothing is removed.
- **If a key is pressed during Frozen** (the "Saving…" wait): it is dropped,
  not replayed when the wait ends. Pause / Back still works.
- **If Sprint is in toggle mode and the player opens a panel**: sprint ends
  (R5); the toggle starts off again afterwards.

**Bindings**

- **If the player binds a key already used by another action in the same
  context**: the rebinding screen asks whether to swap the two bindings or
  cancel; the conflict is never saved.
- **If the player tries to leave Pause / Back unbound**: refused; Escape always
  works as Pause / Back in any case.
- **If a saved binding names a key that no longer exists** (a different
  keyboard, a removed mouse with side buttons): that action falls back to its
  default binding, and the player is told once which actions were reset.
- **If the saved bindings are unreadable**: all bindings fall back to defaults,
  with one message; the game save is not affected (bindings are settings).
- **If the keyboard layout changes while playing** (AZERTY to QWERTY):
  positional bindings (R6) keep working; control hints update to the new key
  names on their next refresh.

**Simultaneous input**

- **If opposite movement keys are held together**: that axis is 0 (F3).
- **If Use Tool's two bindings (left mouse and Space) are both held and one is
  released**: Use Tool stays held until both are released.
- **If two actions in the same context share no key but fire in the same
  frame** (Interact and Use Tool): both are delivered; each owner's request is
  handled in arrival order by Session & Authority.
- **If the scroll wheel spins hard**: at most `max_steps_per_frame` steps per
  frame (F5), so one flick does not skip across the whole piece list.

**Devices**

- **If a gamepad is connected to an MVP build**: ignored, no error, no prompt.
- **If the mouse is unplugged**: keyboard look (Turn, Look Up/Down) still
  works; Use Tool still has Space; Place has no default keyboard key, so Build
  mode shows the binding as unassigned and the rebinding screen can give it one.
- **If the cursor lock is lost without a focus change** (another program steals
  the cursor): treated as a focus loss.

**Degenerate strategies**

- **Macros or auto-clickers**: nothing in the MVP rewards press speed (R9), so
  a macro gains nothing a hold or toggle does not already give.

## Dependencies

### Upstream (this system depends on)

| System or decision | Hard / soft | Interface |
|---|---|---|
| Game Data & Tuning (#1) | Hard | `tuning.input` holds `hold_threshold_s`, `stick_deadzone`, `max_steps_per_frame` |
| Session & Authority (#2) | Soft | The session state, read to choose the Frozen context; Input still works in menus with no session |
| ADR-0001 | Hard | Input is Presentation: it raises requests and hands movement to Player Controller; it never changes game state |
| Engine | Hard | The Input System package (the legacy Input Manager is deprecated, `docs/engine-reference/unity/modules/input.md`): actions, control schemes, positional keys, interactive rebinding, saved binding overrides. The module's samples include direct device reads, which this design forbids for game code (R1). The installed package version is not yet verified |

The systems index lists no upstream system for row 3; see Open Questions.

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Design doc |
|---|---|---|---|
| Player Controller (6) | Hard | Move, Look, Turn, Look Up/Down, Sprint (R3, F3, F4) | Not written |
| Menus & Settings (27) | Hard | Rebinding rules and data (R7), the R8 settings, Menu context | Not written |
| Accessibility & Options (29) | Hard | Rebinding, toggle modes, gamepad layout (R10) | Not written |
| Building, Tools & Gear, Mining, Gathering, Stash, Crafting, Pack, Oxygen, Run Flow | Hard | Their actions (R2); hold progress (F2) | Not written |
| Home HUD & Panels, Run HUD | Soft | Active context; binding display names for control hints | Not written |
| First-Run Guidance (28) | Soft | Binding names in hints | Not written |

**Bidirectional check.** The systems index lists Input under rows 6, 27 and 29,
matching the table. No dependent design doc exists yet.

## Tuning Knobs

`tuning.input`, in Game Data & Tuning's record shape; all `provisional: true`
until playtested in Unity.

| Key | Type | Value | Min | Max | Step | Unit | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|
| `hold_threshold_s` | float | 0.25 | 0.1 | 0.6 | 0.05 | s | Ordinary presses register as holds | Holds feel slow to start | Common default for tap versus hold; long enough that a tap is never mistaken |
| `stick_deadzone` | float | 0.15 | 0.05 | 0.4 | 0.01 | share | Worn sticks drift the view | Small stick movements ignored | Unused until gamepad support (Alpha); a typical radial dead zone |
| `max_steps_per_frame` | int | 1 | 1 | 5 | 1 | count | A fast flick is slow to move through a long list | One flick skips past the wanted piece | MVP lists are short (2 tools, a handful of pieces); one step a frame is precise |

Owned elsewhere and pointed to, not duplicated: look sensitivity and keyboard
turn speed (`look_sens`, `key_turn`, Player Controller); deliberate-hold
durations such as Remove Piece (Building); the R8 settings (player settings,
Menus & Settings).

## Visual/Audio Requirements

Optional for a `Core` system. Input has no visuals or sounds of its own. It
supplies two things the HUD shows: the current binding's display name for each
action (control hints such as "E  Gather") and deliberate-hold progress (F2)
for a filling ring. How they look follows the art bible's UI rules; no asset
spec is needed.

## Game Feel

Optional for a `Core` system; input latency is a feel target only this system
can own:

- **Same-frame delivery.** An action pressed during a frame is delivered to its
  listener in that frame's update; Input adds no frame of delay of its own.
- **No smoothing or acceleration on Look** (F4). Smoothing belongs, if anywhere,
  to Player Controller's feel decisions, never hidden in input.
- **Holds start on time.** A hold registers at `hold_threshold_s` (0.25 s)
  without waiting for release.

## UI Requirements

1. **Control hints** (Home HUD, Run HUD, First-Run Guidance) show the player's
   current binding for an action, by its name on the player's keyboard layout
   (R6), and update immediately after a rebind.
2. **Hold progress ring** for deliberate holds (F2).
3. **Rebinding screen** (Menus & Settings, Vertical Slice): every action in R2
   by context, its binding, "press a key" listening state, the swap-or-cancel
   conflict prompt (R7), reset one or all, and the R8 settings.
4. **Bindings-reset notice** when saved bindings could not be used (Edge Cases).
5. **"Click to look" hint** before the cursor is first captured, as in the
   prototype.

> **📌 UX Flag — Input**: items 1, 3 and 4 are player-facing. Include them when
> `/ux-design` runs for Home HUD & Panels, Run HUD and Menus & Settings, and in
> the project-wide accessibility requirements
> (`design/accessibility-requirements.md`, not yet written).

## Cross-References

| This document references | Where | What it relies on |
|---|---|---|
| `docs/architecture/adr-0001-network-model.md` | Decision 3 (Presentation) | Input raises requests and never writes state; movement is owned by the player's client |
| `docs/architecture/adr-0002-persistence.md` | Out of scope list | Settings and key bindings are not game progress and may use the preferences store |
| `design/gdd/game-data-and-tuning.md` | Tuning sets, record shape | `tuning.input`; knobs pointed to, not duplicated |
| `design/gdd/session-and-authority.md` | States and Transitions, R5, R9 | Waiting states map to Frozen; refusals for wrong place; pause and auto-pause |
| `design/gdd/game-concept.md` | Pillar 2 | Readable danger needs controls that disappear |
| `prototypes/star-haul/index.html` | Controls text and handlers | The proven defaults: WASD, mouse or arrows to look, hold left click or Space to drill, Shift to sprint, E to interact, P or Escape to pause, release on blur |
| `docs/engine-reference/unity/modules/input.md` | Overview, Rebinding | Input System package; rebinding and saved overrides |

## Acceptance Criteria

**Type**: *Logic* criteria need an automated EditMode test with simulated
input (no scene where possible); *Integration* criteria need a PlayMode test
or documented check; *UI* criteria need a retained screenshot in
`production/qa/evidence/`. QA lens: every rule R1 to R10 and formula F1 to F5
has at least one criterion; R1's "no direct device reads" is also checked by a
code search in review.

**Actions and contexts**

1. **GIVEN** the On Foot context, **WHEN** each default key in R2's table for
   On Foot is pressed, **THEN** exactly its action fires and no action from
   another context fires. Repeated for Build, Panel and Menu. *(Logic; R2, R4)*
2. **GIVEN** a search of the game code outside the Input system, **WHEN** run in
   review, **THEN** it finds no direct read of a keyboard, mouse or gamepad
   device. *(Code review; R1)*
3. **GIVEN** On Foot with a panel opening, **WHEN** the panel opens, **THEN**
   the context is Panel, the cursor is free, and Move and Use Tool no longer
   fire. Closing it returns to On Foot with the cursor locked. *(Logic; R4,
   States)*
4. **GIVEN** Session & Authority enters Ending Run, **WHEN** the player presses
   Use Tool and Interact, **THEN** neither fires, Pause / Back still opens the
   menu, and after the wait ends neither press is replayed. *(Logic; R4, R5)*
5. **GIVEN** Use Tool held and drilling, **WHEN** the window loses focus and
   comes back with the key still down, **THEN** Use Tool was released at the
   focus loss and does not fire again until the key is released and pressed
   again. *(Integration; R5)*
6. **GIVEN** a Use Canister press at home, **WHEN** it is delivered, **THEN**
   Oxygen's request is refused with "Can't do that here" rather than the key
   doing nothing silently. *(Integration; R2, with Session & Authority)*

**Keys, rebinding and settings**

7. **GIVEN** an AZERTY layout, **WHEN** the player presses the keys in the
   QWERTY W A S D positions (Z Q S D), **THEN** Move responds, and the control
   hint shows "Z" for forward. *(Integration + UI; R6)*
8. **GIVEN** Interact bound to E, **WHEN** the player rebinds Interact to F,
   **THEN** F triggers Interact, E does nothing in On Foot, the hint shows "F",
   and after a restart F still triggers Interact. *(Integration + UI; R7)*
9. **GIVEN** the player binds Sprint to E in On Foot (used by Interact),
   **WHEN** confirming, **THEN** they are asked to swap or cancel, and no state
   with both on E is ever saved. **GIVEN** E is bound in Panel to Close Panel,
   **THEN** binding it in On Foot raises no conflict. *(Logic; R7)*
10. **GIVEN** the player tries to unbind Pause / Back, **THEN** it is refused;
    **GIVEN** Pause / Back is rebound to F1, **THEN** both F1 and Escape open
    the pause menu. *(Logic; R7)*
11. **GIVEN** saved bindings naming a mouse side button on a machine without
    one, **WHEN** the game starts, **THEN** that action uses its default and one
    notice names it. **GIVEN** an unreadable bindings file, **THEN** all
    defaults and one notice, and the game save is untouched. *(Integration +
    UI; Edge Cases)*
12. **GIVEN** Sprint mode set to toggle, **WHEN** Shift is tapped, **THEN**
    sprint starts; tapped again, it stops; opening a panel while sprinting ends
    it. *(Logic; R8, R5)*
13. **GIVEN** Use Tool mode set to toggle, **WHEN** the setting is inspected
    for Remove Piece, **THEN** no toggle option exists for it. *(Logic; R8)*

**Formulas**

14. **GIVEN** `hold_threshold_s` 0.25, **WHEN** E is pressed for 0.18 s,
    **THEN** a tap; for exactly 0.25 s, **THEN** a hold registered at 0.25 s,
    before release. *(Logic; F1)*
15. **GIVEN** Remove Piece with a 0.6 s hold, **WHEN** held 0.3 s, **THEN**
    progress is 0.5; released at 0.4 s, **THEN** nothing fires; held 0.6 s,
    **THEN** it fires once and not again while still held. *(Logic; F2, R9)*
16. **GIVEN** W and D held, **THEN** move is (0.707, 0.707) ±0.001; W and S held,
    **THEN** the forward part is 0; no keys, **THEN** (0, 0). **GIVEN** a stick
    at 0.1 with dead zone 0.15, **THEN** 0; at 0.15, **THEN** 0; at 1.0,
    **THEN** length 1. *(Logic; F3)*
17. **GIVEN** dx 40, dy −10, sensitivity 1.5, invert off, **THEN** look_input
    is (60, −15); with invert on, **THEN** (60, 15); the same input twice in a
    row gives the same output (no smoothing). *(Logic; F4)*
18. **GIVEN** 3 tools at index 2 and one notch down, **THEN** index 0; **GIVEN**
    a flick of 6 notches in one frame with `max_steps_per_frame` 1, **THEN** one
    step that frame. *(Logic; F5)*

**Devices and cross-system**

19. **GIVEN** an MVP build with a gamepad connected, **WHEN** its buttons and
    sticks are used, **THEN** nothing happens and no error or prompt appears.
    *(Integration; R10)*
20. **GIVEN** the mouse is disconnected, **WHEN** the player uses the arrow
    keys and Space, **THEN** they can look around and drill. *(Integration; R2,
    Edge Cases)*
21. **GIVEN** a test catalog setting `hold_threshold_s` to 0.4, **WHEN** Input
    is built, **THEN** F1 uses 0.4 (tuning reached Input through its own set).
    *(Logic; Game Data & Tuning hand-over)*
22. **GIVEN** a key pressed in a frame, **WHEN** its listener runs, **THEN** it
    receives the action in that same frame. *(Integration; Game Feel)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Jump and Crouch: does the player jump (stairs, terrain)? If Player Controller adds Jump, it takes Space and Use Tool loses its Space binding (R2) | Player Controller design doc | When Player Controller is designed |
| 2 | Gamepad default layout and stick feel; Steam Input support | Accessibility & Options, with Player Controller | Alpha |
| 3 | The systems index lists no upstream system for row 3; this document reads `tuning.input` (Game Data & Tuning) and the session state (Session & Authority, soft). Add Game Data & Tuning to row 3's "Depends On" | producer, at the next `/consistency-check` or `/map-systems` update | Before stories |
| 4 | Which key confirms panel item moves (quick-move with Shift + click is assumed) is the Stash and Pack design docs' call; Input provides Click, Alternate Click and Modifier | Stash, Pack design docs | When designed |
| 5 | `notch_size` in F5 depends on what the engine reports per scroll notch; verify at the first input story and record in the engine reference | gameplay-programmer | First input story |

### Decisions taken on the designer's behalf (2026-11-27, autonomous mode)

Logged in `production/session-logs/decision-log.md`; each can be reversed:

1. Player Fantasy is indirect: "The controls disappear", supported by "Your
   hands, your keys".
2. Keyboard and mouse only in the MVP; gamepad designed in and laid out in
   Alpha (R10).
3. The prototype's controls carry over: WASD, mouse or arrow keys to look, hold
   left click **or Space** to use the tool, Shift to sprint, E to interact,
   Escape or P to pause (R2).
4. Build mode on B, rotate on R, cycle pieces with the scroll wheel, remove a
   piece by **holding** X; oxygen canister on Q; pack on Tab; tools on 1 to 3
   (R2).
5. Sprint and Use Tool are holds by default, each with a toggle setting; Remove
   Piece has no toggle (R8).
6. No presses are buffered across a context change, and every held action is
   released on focus loss or context change (R5).
7. Keys are bound by position, so AZERTY works without rebinding (R6).
8. Pause / Back can never be unbound, and Escape always works (R7).
