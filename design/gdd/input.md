# Input

> **Status**: In Review (revision 1, 2026-11-28, after the first `/design-review`, verdict NEEDS REVISION; awaiting re-review)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode). Senior review in `/design-review` 2026-11-28: NEEDS REVISION, see `design/gdd/reviews/input-review-log.md`
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-28 (revision 1)
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
  Interact, Sprint, Place, Pause / Back…
- **Axis 2D** (a direction): Move, Look.
- **Axis 1D** (a signed amount): Cycle (scroll wheel), Turn (keyboard look).

**R2. The MVP action list.** Each action belongs to one or more contexts (R4)
and is owned by the system that decides what it does. Input owns the list's
format, the defaults and the contexts; adding an action is a change to this
document, requested by its owner.

| Action | Type | Contexts | Default (keyboard and mouse) | Owner of what it does |
|---|---|---|---|---|
| Move | Axis 2D (four directions, each bound separately) | On Foot, Build, Run Pack | W A S D (by key position, R6) | Player Controller |
| Look | Axis 2D | On Foot, Build | Mouse movement | Player Controller |
| Turn | Axis 1D | On Foot, Build | Left / Right arrow | Player Controller (keyboard-only look) |
| Look Up/Down | Axis 1D | On Foot, Build | Up / Down arrow | Player Controller |
| Sprint | Button (hold, or toggle by setting) | On Foot, Build, Run Pack | Left Shift | Player Controller, Oxygen |
| Use Tool | Button (hold, or toggle by setting) | On Foot | Left mouse button; F | The equipped tool: Mining (drill), Building (hammer, repair) |
| Interact | Button | On Foot, Build | E | Gathering, Stash, Crafting, Pack (pick up), Run Flow (exits). In Build it first leaves build mode |
| Drop Item | Button | On Foot | G | Pack (drops the selected pack item into the world on a run; at home, Pack decides) |
| Select Tool 1 / 2 / 3 | Button | On Foot | 1 / 2 / 3 | Tools & Gear |
| Cycle Tool | Axis 1D | On Foot | Scroll wheel | Tools & Gear |
| Use Canister | Button | On Foot, Run Pack (run only) | Q | Oxygen |
| Open Pack | Button | On Foot | Tab | Pack |
| Build Mode | Button | On Foot (home only), Build | B | Building |
| Place | Button | Build | Left mouse button; F | Building |
| Rotate Piece | Button | Build | R | Building |
| Cycle Piece | Axis 1D | Build | Scroll wheel; `[` previous, `]` next | Building |
| Remove Piece | Button (hold) | Build | X (hold) | Building |
| Pause / Back | Button | Every context | Escape (always, R7); P | By context, table below |
| Point | Axis 2D | Panel, Run Pack, Menu | Mouse cursor | UI |
| Navigate | Axis 2D | Panel, Run Pack, Menu | Arrow keys | UI (moves the selected slot or button) |
| Click | Button | Panel, Run Pack, Menu | Left mouse button | UI (on the slot or button under the cursor) |
| Confirm | Button | Panel, Run Pack, Menu | Enter (always, R7) | UI (on the selected slot or button) |
| Alternate Click | Button | Panel, Run Pack | Right mouse button | The owning panel (for example Pack: drop on a run) |
| Quick Move | Button | Panel, Run Pack | F; also Left Shift + Left mouse button as a mouse shortcut | The owning panel (moves the selected or hovered stack to the other container) |

**Space is unbound** in the MVP and reserved: if Player Controller adds Jump,
it takes Space, and nothing has to be rebound (Open Questions 1). The keyboard
"do it" key is F in every context: Use Tool on foot, Place in build mode,
Quick Move in a panel.

**What Pause / Back does**, by context. It is one action, so one key never
carries two actions in a context (R7):

| Context | Pause / Back does |
|---|---|
| On Foot | Opens the pause menu (Session & Authority pauses, solo) |
| Build | Leaves build mode (back to On Foot); a second press opens the pause menu |
| Panel, Run Pack | Closes the panel (back to the context it was opened from) |
| Frozen | Opens the pause menu |
| Menu | Goes back one screen; on the pause menu's top screen, unpauses |

A panel also closes on the action that opened it, with its current binding
(Interact for a stash or workbench, Open Pack for the pack), so a player who
rebinds Interact to F opens and closes the stash with F.

"Run only" and "home only" are decided by the owning system, which refuses the
request where it does not apply (Session & Authority's "Can't do that here",
shown as a quiet HUD tick, not a toast); Input does not hide those actions, so
the same key never silently does nothing. Build Mode is a request to Building
like any other: on a run it is refused that way and the context stays On Foot.
Jump and Crouch are not in the MVP list.

**R3. From action to effect.** Input never changes game state (ADR-0001):

- Move, Look, Turn, Look Up/Down and Sprint go to Player Controller, which owns
  movement on the player's own client.
- Every other gameplay action is turned by the owning system's Presentation
  code into a request to Session & Authority, which accepts or refuses it.
- UI actions go to the UI that has focus.

A pressed action is delivered at most once, in the frame it happened; holds
report their state every frame while held. Input is processed in the frame
update (never the fixed update), and every listener reads actions in its frame
update, so a press reaches its listener in the same frame (Game Feel).

**R4. Contexts.** Exactly one context is active at a time, chosen by the first
match in this order:

| Order | Context | Active when | Cursor |
|---|---|---|---|
| 1 | **Menu** | Main menu, pause menu, refused screen, any confirmation dialog | Free |
| 2 | **Frozen** | Session & Authority holds the session (Starting, Loading, Resolving, Launching Run, Ending Run, Stopping) and no menu is open | Hidden; only Pause / Back is live |
| 3 | **Run Pack** | The pack panel is open during a run | Free |
| 4 | **Panel** | A stash, workbench or pack panel is open at home | Free |
| 5 | **Build** | Build mode is on (home only) | Locked to the view |
| 6 | **On Foot** | Otherwise, at home or on a run | Locked to the view |

Only the actions listed for the active context are live; all others are
ignored. **Run Pack is not modal**: while the pack is open on a run the player
can still move, sprint and use a canister, because a full pack is exactly when
creatures are hunting (Pillar 1, Pillar 2); only Look and the tools stop.
Home panels (Panel) are modal: the home has no threat that needs the player
moving. Entering Frozen closes any open panel, so the player returns to On
Foot when the wait ends. Session & Authority's pause turns on the Menu context
through the pause menu. Contexts are local to each player's client; they are
Presentation state and never saved.

**R5. Changing context releases held buttons.** When the context changes,
and when the game window loses focus, every held **Button** action with an
effect is released at once (Use Tool stops, a Remove Piece hold is cancelled,
a toggled Use Tool turns off), and a key still physically held counts again
only after it is released and pressed again, so an effect never carries into a
context the player did not see it start in. Buttons never act on a key that
was already down when they became live. **Axes are not latched**: Move and
Look resume from the keys and mouse as they are, so a player holding W when a
wait ends or a panel closes keeps walking. Sprint in hold mode follows the key
as it is; Sprint in toggle mode resets to off. There is no buffering of presses
across a context change: a press during Frozen is dropped, not replayed (a
quiet "busy" cue shows it was heard).

**R6. Keys by position.** Keyboard defaults are bound by key *position*, not by
the letter printed on the key, so W A S D is Z Q S D on an AZERTY keyboard
without anyone rebinding. Everything that shows a key to the player (control
hints, the rebinding screen) shows the name the player's own keyboard layout
gives that key.

**R7. Rebinding.** Every action can be rebound, keyboard and mouse alike,
including each direction of Move, Turn and Look Up/Down on its own (so
one-handed layouts are possible) and the mouse buttons:

- a binding is set by pressing the new key or button while the rebinding
  screen listens for it;
- within one context, one key or button may be bound to one action only,
  counting each part of a split binding (each Move key) separately; binding a
  key already used in that context asks whether to swap the two bindings or
  cancel (actions in different contexts may share a key, as the left mouse
  button does in On Foot, Build and Panel). Contexts that are live together
  for an action shared between them (Move in On Foot and Run Pack) are checked
  together;
- **Escape is reserved**: it always works as Pause / Back as well as any
  binding Pause / Back has, and no other action can be bound to it. P is an
  ordinary binding of Pause / Back and can be removed. **Enter is reserved**
  the same way for Confirm. So a player can always reach the menu and get out
  of it;
- rebinding is a player setting, saved with the other settings (Menus &
  Settings; settings may use the engine's preferences store, ADR-0002), never in
  the game save;
- "Reset to defaults" restores every binding at once, or one action at a time.

The rebinding screen itself belongs to Menus & Settings (Vertical Slice); this
system provides the rules and the data from the MVP, so bindings can be set in
a development build and the rules can be tested before the screen exists. The
MVP therefore ships without a player-facing rebinding screen; this is a
recorded gap in the accessibility floor (Open Questions 6).

**R8. Player control settings Input applies.** These are player settings
(stored by Menus & Settings), applied here before an action is delivered:

| Setting | Values | Default | Effect |
|---|---|---|---|
| Mouse sensitivity | multiplier 0.1 to 5 | 1.0 | Multiplies Look (F4). Player Controller's tuning turns the result into an angle |
| Keyboard look speed | multiplier 0.25 to 4 | 1.0 | Multiplies Turn and Look Up/Down before Player Controller's `key_turn` |
| Invert vertical look | on / off | off | Flips Look's vertical part (F4) and Look Up/Down |
| Sprint mode | hold / toggle | hold | Toggle: one press starts sprinting, the next stops; R5 resets it on context change |
| Use Tool mode | hold / toggle | hold | Toggle: one press starts drilling, the next stops; R5 turns it off on context change |

Hold-type actions that a design doc makes deliberate (Remove Piece) do **not**
get a toggle: the hold is the safety.

**R9. Deliberate holds, and no tap-or-hold keys.** Actions that need a
deliberate hold (Remove Piece) report hold progress from 0 to 1 over a
duration their owner sets (F2), so the HUD can show it filling; releasing early
cancels with no effect. **No key carries both a tap meaning and a hold
meaning**, unless the tap fires on press (so it is never delayed until
release). No action in the game requires a double press. Input therefore has
no general tap-or-hold timer.

**R10. Devices in the MVP.** The MVP supports keyboard and mouse only. Gamepad
support is designed in (no rule names a device, F3 already defines stick
handling) and gets its default layout with Accessibility & Options (Alpha). A
gamepad connected to an MVP build is ignored without error: the game's own
actions and the UI's navigation use only the keyboard-and-mouse scheme (the
engine's default UI actions, which include gamepad navigation, are replaced).
Steam Input and other remapping layers are not designed here.

**R11. Capturing the cursor.** On Foot and Build lock the cursor to the view.
Before it is first captured, a "click or press any key to look" hint shows;
any key or click captures it, and the click that captures it never also fires
Use Tool. The keyboard look actions work whether or not the cursor is
captured. Losing the cursor lock without a focus change (another program takes
the cursor) is detected by checking the lock state each frame and is treated
as a focus loss (R5). The first mouse movement after the cursor is captured
again is discarded, so the view never jumps.

### States and Transitions

The context (R4) is Input's only state. It is not a free-standing state
machine: it is recomputed every frame from Session & Authority's session state
and the Presentation flags (menu open, panel open, build mode on, run or
home), by R4's order. Any change between two frames triggers R5.

| From | To | Trigger | Notes |
|---|---|---|---|
| On Foot | Build | Build Mode pressed at home and accepted by Building | Refused on a run or by Building: no change |
| Build | On Foot | Build Mode, Pause / Back or Interact pressed | Interact then acts on its target on the next press |
| On Foot, Build | Panel | A panel opens at home (Interact on a stash or workbench, Open Pack) | Cursor freed; modal |
| On Foot | Run Pack | Open Pack on a run | Cursor freed; Move, Sprint and Use Canister stay live |
| Panel, Run Pack | The context it was opened from | Pause / Back, or the action that opened it | |
| Any but Menu | Frozen | Session & Authority enters a waiting state | Held buttons released; open panels closed |
| Frozen | On Foot (or Build if build mode is still on) | The wait ends | Fresh presses needed for buttons (R5); Move resumes |
| Any | Menu | Pause / Back with nothing else to close, window loses focus with auto-pause on, a dialog opens | |
| Menu | Previous context | Unpause, dialog closed | Held buttons released again |

### Interactions with Other Systems

| System | Direction | What flows | Interface owner |
|---|---|---|---|
| Player Controller | Out | Move, Look (after F4), Turn, Look Up/Down, Sprint, every frame in On Foot and Build | Input owns the action values; Player Controller owns speeds, sensitivity tuning (`look_sens`, `key_turn`) and feel |
| Session & Authority | In / Out | In: the session state (to pick Frozen) and pause. Out: Pause / Back; gameplay actions become requests through each owner's Presentation code | Session & Authority owns requests and pause; Input owns contexts |
| Building, Tools & Gear, Mining, Gathering, Stash, Crafting, Pack, Oxygen, Run Flow | Out | Their actions (R2), and hold progress for deliberate holds (F2) | Each owner decides what its action does and when it is refused |
| Home HUD & Panels, Run HUD | In / Out | In: panel open or closed, build mode. Out: the active context and the display name of each action's current binding, for control hints | HUD owns layout; Input owns binding names |
| Menus & Settings | In / Out | Stores bindings and the R8 settings; hosts the rebinding screen | Menus & Settings owns storage and screens; Input owns the rules (R7) |
| Accessibility & Options | Out | Gamepad layout, further assistive options (Alpha) | Accessibility & Options |
| Game Data & Tuning | In | `tuning.input` (F3, F5 values), read every frame on the player's machine; new values the frame a live tuning revision arrives (Game Data & Tuning R10) | Game Data & Tuning |

## Formulas

Values marked `data file` live in `tuning.input` (Game Data & Tuning); values
marked `setting` are player settings (R8). Boundaries worked at minimum,
maximum and 0.

### F1. Tap or hold (removed in revision 1)

No action distinguishes a tap from a hold (R9), so Input has no tap-or-hold
timer and no `hold_threshold_s`. The number is kept free so later documents do
not reuse "F1" for something else.

### F2. Hold progress for deliberate holds

The `hold_progress` formula is defined as:

`hold_progress = clamp((now_s − pressed_at_s) / hold_duration_s, 0, 1)`

The action fires once when `hold_progress` reaches 1; releasing (or R5) before
then cancels it with no effect.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| hold_duration_s | float | 0.2–3 | data file (owner's tuning set, e.g. Building's remove hold) | How long the deliberate hold lasts |
| now_s, pressed_at_s | double | — | calculated | Real time now and when the button went down (real time, so a pause cannot stretch a hold; a pause also changes context, which cancels it, R5) |

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

where `dx`, `dy` are the mouse movement this frame in the device's raw counts
(the engine's mouse delta, which does not depend on screen resolution or
desktop scaling). Player Controller then multiplies by its `look_sens` tuning
(radians per count). The browser prototype's `look_sens` (0.0022 per CSS
pixel) does not carry over and must be retuned at the first input story. The
first delta after the cursor is captured again is discarded (R11).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| dx, dy | float | any | calculated | Raw mouse movement since the last frame, in device counts |
| m | float | 0.1–5 | setting (Mouse sensitivity) | Player's multiplier, default 1 |
| invert | bool | — | setting (Invert vertical look) | Default off |

**Output Range:** proportional to mouse movement, never smoothed or
accelerated by this system, so the same hand movement always turns the same
amount.
**Boundaries:** no movement gives (0, 0). The setting's range has no 0, so look
can never be turned off by accident. At `m = 5` and a `look_sens` of 0.0022
rad per count, 100 counts turn 1.1 rad (63°), a fast but usable extreme.
**Example:** dx 40, dy −10, m 1.5, invert off → (60, −15) counts; times 0.0022
→ 0.132 rad right, 0.033 rad up.

### F5. Scroll steps

The `cycle_steps` formula is defined as, for one frame:

```
acc_notches = acc_notches + scroll_delta / notch_size
cycle_steps = clamp(trunc(acc_notches), −max_steps_per_frame, max_steps_per_frame)
acc_notches = acc_notches − cycle_steps   (then clamped to the open range −1 to 1)
```

applied by the owner as `index' = ((index + cycle_steps) mod count + count) mod count`,
which stays in 0 … count − 1 for negative steps too (a plain `%` in C# returns
−1 for −1 % 3). `acc_notches` is Input's own remainder: the engine reports
scroll as a per-frame amount and keeps no remainder. It is cleared to 0 on
every context change.

**Sign convention:** turning the wheel towards the player (down) is +1, the
next tool or piece; away (up) is −1, the previous. The `]` and `[` keys give
+1 and −1 directly.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| scroll_delta | float | any | calculated | Scroll wheel movement this frame, in the engine's units |
| notch_size | float | > 0 | constant | Scroll amount of one wheel notch as the engine reports it on each platform; an engine fact, not a design value. Measured and recorded in the engine reference **before the first input story** (Open Question 5) |
| acc_notches | float | −1 to 1 between frames | calculated | Unspent part of a notch carried to the next frame, so slow touchpad scrolling still steps |
| max_steps_per_frame | int | 1–5 | data file | Most steps one frame can take |
| count | int | ≥ 1 | calculated | Number of tools or pieces to cycle through |

**Output Range:** −`max_steps_per_frame` to +`max_steps_per_frame` steps per
frame; wraps around at both ends.
**Boundaries:** a touchpad sending a fifth of a notch per frame steps once
every five frames. A flick of 6 notches in one frame with
`max_steps_per_frame` 1 gives one step and keeps the rest only up to one notch
(the clamp), so a flick never skips across the whole list. With `count = 1`,
any step leaves the index 0.
**Example:** one notch down with 3 tools at index 2 → ((2 + 1) mod 3 + 3) mod 3
= 0; one notch up at index 0 → ((0 − 1) mod 3 + 3) mod 3 = 2.

## Edge Cases

**Focus and context**

- **If the window loses focus while a key is held** (alt-tab mid-drill): every
  held button is released (R5); with auto-pause on (Session & Authority,
  default on), the pause menu opens. Returning needs fresh presses: the drill
  does not restart because the key was still down. In co-op, where the session
  cannot pause, focus loss still releases held buttons; the game keeps running.
- **If the context changes while Use Tool is held or toggled on** (a panel
  opens, a run ends): Use Tool stops; to drill again, press again.
- **If a Remove Piece hold is in progress when the context changes**: it is
  cancelled at its current progress; nothing is removed.
- **If W is held when a wait ends or a panel closes**: Move resumes at once
  from the key as it is (R5); the player does not stand still.
- **If a key is pressed during Frozen** (the "Saving…" wait): it is dropped,
  not replayed when the wait ends; a quiet "busy" cue shows it was heard.
  Pause / Back still works.
- **If a panel is open when a wait begins** (the run ends with the pack open):
  Frozen closes it; after the wait the player is On Foot.
- **If Sprint is in toggle mode and the player opens a home panel**: sprint
  ends (R5); the toggle starts off again afterwards. In Run Pack, Sprint stays
  live, so an open pack does not end a toggled sprint.
- **If the pack is opened on a run while a creature attacks**: the player can
  still move, sprint and use a canister (R4, Run Pack); they cannot look around
  or use a tool until the pack closes.
- **If a panel was opened from Build**: closing it returns to Build.

**Bindings**

- **If the player binds a key already used by another action in the same
  context**: the rebinding screen asks whether to swap the two bindings or
  cancel; the conflict is never saved. Each Move key counts on its own.
- **If the player tries to bind an action to Escape or Enter**: refused; they
  are reserved for Pause / Back and Confirm (R7).
- **If the player removes P from Pause / Back**: allowed; Escape still works.
- **If a saved binding names a path the engine cannot resolve** (a device
  layout that no longer exists): that action falls back to its default
  binding, and the player is told once which actions were reset. (A missing
  mouse side button cannot be detected, because the generic mouse always has
  one; the binding simply never fires, and the player can rebind it.)
- **If the saved bindings are unreadable** (the saved text fails to parse):
  all bindings fall back to defaults, with one message; the game save is not
  affected (bindings are settings).
- **If the keyboard layout changes while playing** (AZERTY to QWERTY):
  positional bindings (R6) keep working; control hints update to the new key
  names on their next refresh.

**Simultaneous input**

- **If opposite movement keys are held together**: that axis is 0 (F3).
- **If Use Tool's two bindings (left mouse and F) are both held and one is
  released**: Use Tool stays held until both are released.
- **If two actions in the same context share no key but fire in the same
  frame** (Interact and Use Tool): both are delivered; each owner's request is
  handled in arrival order by Session & Authority.
- **If the scroll wheel spins hard**: at most `max_steps_per_frame` steps per
  frame, and at most one notch carried over (F5), so one flick does not skip
  across the whole piece list.
- **If a touchpad scrolls in small amounts**: the remainder carries over
  (F5), so slow scrolling still steps.

**Devices**

- **If a gamepad is connected to an MVP build**: ignored, no error, no prompt,
  and it does not move through menus (R10).
- **If the mouse is unplugged**: keyboard look (Turn, Look Up/Down) still
  works; Use Tool and Place still have F; Cycle Piece has `[` and `]`; panels
  and menus work with Navigate, Confirm and Quick Move. The whole game can be
  played from the keyboard.
- **If the cursor lock is lost without a focus change** (another program steals
  the cursor): detected by checking the lock state each frame, and treated as a
  focus loss (R11).
- **If the click that captures the cursor lands while a tool is equipped**: it
  only captures the cursor; it does not drill (R11).

**Degenerate strategies**

- **Macros or auto-clickers**: nothing in the MVP rewards press speed (R9), so
  a macro gains nothing a hold or toggle does not already give.

## Dependencies

### Upstream (this system depends on)

| System or decision | Hard / soft | Interface |
|---|---|---|
| Game Data & Tuning (#1) | Hard | `tuning.input` holds `stick_deadzone` and `max_steps_per_frame`; live changes arrive with each published catalog revision (its R10) |
| Session & Authority (#2) | Soft | The session state, read to choose the Frozen context; Input still works in menus with no session |
| ADR-0001 | Hard | Input is Presentation: it raises requests and hands movement to Player Controller; it never changes game state |
| Engine | Hard | The Input System package (the legacy Input Manager is deprecated, `docs/engine-reference/unity/modules/input.md`): actions, control schemes, positional keys, interactive rebinding, saved binding overrides. The module's samples include direct device reads, which this design forbids for game code (R1). The installed package version is not yet verified |

The systems index lists no upstream system for row 3; see Open Questions.

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Design doc |
|---|---|---|---|
| Player Controller (6) | Hard | Move, Look, Turn, Look Up/Down, Sprint (R3, F3, F4); `look_sens` must be retuned for raw mouse counts (F4) | [player-controller.md](player-controller.md) |
| Menus & Settings (27) | Hard | Rebinding rules and data (R7), the R8 settings, Menu context | Not written |
| Accessibility & Options (29) | Hard | Rebinding, toggle modes, gamepad layout (R10) | Not written |
| Building, Tools & Gear, Mining, Gathering, Stash, Crafting, Pack, Oxygen, Run Flow | Hard | Their actions (R2); hold progress (F2) | Not written |
| Home HUD & Panels, Run HUD | Soft | Active context; binding display names for control hints | Not written |
| First-Run Guidance (28) | Soft | Binding names in hints | Not written |

**Bidirectional check.** The systems index lists Input under rows 6, 27 and 29,
matching the table. Player Controller is now written; the rest are not.

## Tuning Knobs

`tuning.input`, in Game Data & Tuning's record shape; all `provisional: true`
until playtested in Unity.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `stick_deadzone` | float | 0.15 | 0.05 | 0.4 | 0.01 | `share` | `live` | Worn sticks drift the view | Small stick movements ignored | Unused until gamepad support (Alpha); a typical radial dead zone. The designer's default: a player setting may override it later (Game Data & Tuning R1) |
| `max_steps_per_frame` | int | 1 | 1 | 5 | 1 | `count` | `live` | A fast flick is slow to move through a long list | One flick skips past the wanted piece | MVP lists are short (2 tools, a handful of pieces); one step a frame is precise |

Owner: Input. `hold_threshold_s` was removed in revision 1 with F1 (R9).

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
- **Deliberate holds fill visibly.** A deliberate hold (Remove Piece) shows
  its progress from the first frame (F2), and no key ever waits for a release
  to decide what a press meant (R9).

## UI Requirements

1. **Control hints** (Home HUD, Run HUD, First-Run Guidance): a hint strip for
   each context lists its live actions (including B, Q, Tab, R and holding X)
   with the player's current binding, by its name on the player's keyboard
   layout (R6), and updates immediately after a rebind.
2. **Hold progress ring** for deliberate holds (F2).
3. **Rebinding screen** (Menus & Settings, Vertical Slice): every action in R2
   by context, its binding, "press a key" listening state, the swap-or-cancel
   conflict prompt (R7), reset one or all, and the R8 settings.
4. **Bindings-reset notice** when saved bindings could not be used (Edge Cases).
5. **"Click or press any key to look" hint** before the cursor is first
   captured (R11).
6. **Quiet feedback** for refused "run only" or "home only" actions (a HUD
   tick, not a toast) and for presses dropped during Frozen (a "busy" cue).

> **📌 UX Flag — Input**: items 1, 3, 4, 5 and 6 are player-facing. Include them when
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
input devices (the Input System's test fixture) and an injected clock, no scene
where possible; *Integration* criteria need a PlayMode test or a documented
check; *UI* criteria need a retained screenshot in `production/qa/evidence/`.
Criteria marked **(provisional on X)** cannot be finished until X's design doc
exists; their Logic part is written now against fakes. The traceability table
at the end maps every rule, formula, state and edge case to its criteria.

**Actions and contexts**

1. **GIVEN** each context in turn (On Foot, Build, Run Pack, Panel, Menu,
   Frozen), **WHEN** each default key and button in R2's table is pressed,
   **THEN** exactly the action the table lists for that context fires (for
   Pause / Back, with the meaning in its context table), and no action from
   another context fires. *(Logic; R2, R4)*
2. **GIVEN** an automated search of the game code outside the Input system,
   **WHEN** it runs in CI, **THEN** it finds no direct read of a keyboard,
   mouse or gamepad device (`Keyboard.current`, `Mouse.current`,
   `Gamepad.current` and similar). *(Integration, CI lint; R1)*
3. **GIVEN** On Foot at home, **WHEN** a stash panel opens, **THEN** the
   context is Panel, the cursor is free, and Move and Use Tool no longer fire;
   closing it with Pause / Back or with the action that opened it returns to On
   Foot with the cursor locked; **GIVEN** the panel was opened from Build,
   **THEN** closing returns to Build. *(Logic; R2, R4, States)*
4. **GIVEN** a run, **WHEN** the pack is opened, **THEN** the context is Run
   Pack, Move, Sprint and Use Canister still fire, Look and Use Tool do not, and
   a toggled sprint stays on. *(Logic; R4)*
5. **GIVEN** Session & Authority enters Ending Run with the pack open and W
   and E held, **WHEN** Use Tool and Interact are pressed during the wait,
   **THEN** neither fires, the pack panel is closed, Pause / Back still opens
   the menu, and after the wait neither press is replayed, the context is On
   Foot, and Move resumes at once from the held W. *(Logic; R4, R5)*
6. **GIVEN** each priority pair of R4 (a menu open during Frozen; a panel open
   when Frozen starts; build mode on with a panel open), **THEN** the active
   context is the higher one in R4's order. *(Logic; R4)*
7. **GIVEN** Use Tool held and drilling, **WHEN** the window loses focus and
   comes back with the button still down, **THEN** Use Tool was released at the
   focus loss and does not fire again until released and pressed again; with
   auto-pause on, the Menu context opened at the focus loss. *(Integration;
   R5; provisional on Menus & Settings for the auto-pause setting)*
8. **GIVEN** a fake Oxygen request handler that refuses at home, **WHEN** Use
   Canister is pressed at home, **THEN** the request is raised (not hidden) and
   its refusal reaches the HUD feedback model; **GIVEN** B pressed on a run,
   **THEN** Building's fake refuses and the context stays On Foot.
   *(Logic; R2)*
9. **GIVEN** On Foot, **WHEN** Pause / Back is pressed in Build, **THEN** the
   context is On Foot with no menu; a second press opens the pause menu.
   *(Logic; R2, States)*
10. **GIVEN** a press in a frame, **WHEN** its listener runs, **THEN** the
    listener records the same frame number as the press, and the press is
    delivered once only. *(Integration; R3, Game Feel)*

**Keys, rebinding and settings**

11. **GIVEN** an AZERTY layout, **WHEN** the player presses the keys in the
    QWERTY W A S D positions (Z Q S D), **THEN** Move responds and the binding
    display name for forward is "Z". *(Logic; R6)*
12. **GIVEN** Interact bound to E, **WHEN** Interact is rebound to F through
    the rebinding rules, **THEN** F triggers Interact, E does nothing in On
    Foot, the binding display name is "F", the stash panel closes on F, and the
    saved overrides reload with F after a simulated restart. *(Logic; R2, R7)*
13. **GIVEN** the player binds Sprint to E in On Foot (used by Interact),
    **WHEN** confirming, **THEN** the rule returns a conflict naming Interact
    and the stored bindings never hold two actions on one key in one context;
    binding the W part of Move to E conflicts the same way; **GIVEN** E is bound
    in Panel only, **THEN** binding it in On Foot raises no conflict.
    *(Logic; R7)*
14. **GIVEN** an attempt to bind any action to Escape or Enter, **THEN** it is
    refused; **GIVEN** Pause / Back rebound to F1 and P removed, **THEN** F1 and
    Escape both work as Pause / Back and P does nothing. *(Logic; R7)*
15. **GIVEN** saved overrides naming a path the engine cannot resolve, **WHEN**
    the game starts, **THEN** that action uses its default and one notice
    event names it; **GIVEN** unreadable overrides text, **THEN** all defaults
    and one notice, and the game save is untouched. *(Logic; Edge Cases)*
16. **GIVEN** Sprint mode toggle, **WHEN** Shift is pressed, **THEN** sprint
    starts; pressed again, it stops; a home panel opening while sprinting ends
    it. **GIVEN** Use Tool mode toggle, **THEN** one press starts drilling, the
    next stops, and a context change turns it off. *(Logic; R5, R8)*
17. **GIVEN** the settings schema, **THEN** it offers a toggle for exactly
    Sprint and Use Tool, and Remove Piece has none. *(Logic; R8)*
18. **GIVEN** mouse sensitivity set to 0.05 or 6, **THEN** it is clamped to 0.1
    and 5; **GIVEN** keyboard look speed 2 and invert on, **THEN** Turn values
    double and Up arrow looks down. *(Logic; R8)*

**Formulas and holds**

19. **GIVEN** Remove Piece with a 0.6 s hold and an injected clock, **WHEN**
    held 0.3 s, **THEN** progress is 0.5; released at 0.4 s, **THEN** nothing
    fires; held 0.6 s, **THEN** it fires once and not again while still held;
    **GIVEN** a context change at 0.4 s, **THEN** it is cancelled. *(Logic; F2,
    R9, R5)*
20. **GIVEN** the R2 action list, **THEN** no key is bound to an action with a
    tap meaning and another with a hold meaning in the same context. *(Logic;
    R9)*
21. **GIVEN** W and D held, **THEN** move is (0.707, 0.707) ±0.001; W and S
    held, **THEN** the forward part is 0; no keys, **THEN** (0, 0). **GIVEN** a
    stick at 0.1 with dead zone 0.15, **THEN** 0; at 0.15, **THEN** 0; at 0.575,
    **THEN** length 0.5 ±0.001; at 1.0, **THEN** length 1. *(Logic; F3)*
22. **GIVEN** dx 40, dy −10, sensitivity 1.5, invert off, **THEN** look_input
    is (60, −15); with invert on, **THEN** (60, 15); the same input twice in a
    row gives the same output (no smoothing); the first delta after the cursor
    is captured again is 0. *(Logic; F4, R11)*
23. **GIVEN** 3 tools at index 2 and one notch down, **THEN** index 0;
    **GIVEN** index 0 and one notch up, **THEN** index 2; **GIVEN** `count` 1,
    **THEN** index 0 always; **GIVEN** 0.2 notch per frame, **THEN** one step on
    the fifth frame; **GIVEN** a flick of 6 notches in one frame with
    `max_steps_per_frame` 1, **THEN** one step that frame and at most one more
    the next; **GIVEN** a context change, **THEN** the remainder is 0.
    *(Logic; F5; provisional on Open Question 5 for `notch_size`)*

**Devices, cursor and cross-system**

24. **GIVEN** an MVP build and a simulated gamepad, **WHEN** 30 s of scripted
    gamepad input is played in a PlayMode test, **THEN** zero actions are
    delivered, menus do not move, and the log has no error or warning.
    *(Integration; R10)*
25. **GIVEN** the mouse device removed in a PlayMode test, **WHEN** the player
    uses the arrow keys, F, `[`, `]`, Navigate, Confirm and Quick Move, **THEN**
    they can look around, drill, enter build mode, cycle and place a piece, and
    move a stack from the pack to a stash. *(Integration; R2, Edge Cases)*
26. **GIVEN** the cursor not yet captured, **WHEN** a key is pressed, **THEN**
    the cursor is captured; **WHEN** instead the left mouse button captures it
    with a drill equipped, **THEN** Use Tool does not fire; **GIVEN** the lock is
    lost without a focus change, **THEN** within one frame it is treated as a
    focus loss. *(Logic; R11)*
27. **GIVEN** both Use Tool bindings held, **WHEN** one is released, **THEN**
    Use Tool stays held until both are released. *(Logic; Edge Cases)*
28. **GIVEN** a test catalog setting `max_steps_per_frame` to 3 and
    `stick_deadzone` to 0.2, **WHEN** Input is built, **THEN** F5 and F3 use
    them (tuning reached Input through its own set), and a live revision
    changing `max_steps_per_frame` to 2 takes effect the frame it is
    published. *(Logic; Game Data & Tuning R10)*
29. **GIVEN** the On Foot, Build, Run Pack and Panel contexts, **THEN**
    screenshots show each context's hint strip with its live actions and
    current bindings, the "click or press any key to look" hint, and, after an
    AZERTY layout switch, "Z" for forward. *(UI; UI Requirements 1 and 5, R6;
    provisional on the Home HUD & Panels and Run HUD UX specs)*
30. **GIVEN** the rebinding screen, **THEN** screenshots show the listening
    state, the swap-or-cancel prompt and the bindings-reset notice. *(UI; UI
    Requirements 3 and 4; provisional on Menus & Settings, Vertical Slice)*

**Traceability**

| Rule, formula, state or edge case | Criteria |
|---|---|
| R1 Actions, not keys | 2 |
| R2 Action list, Pause / Back table, closing panels | 1, 3, 8, 9, 12, 25 |
| R3 Delivery | 10 |
| R4 Contexts, Run Pack, priority | 1, 3, 4, 5, 6 |
| R5 Releasing buttons, axes resume | 5, 7, 16, 19 |
| R6 Keys by position | 11, 29 |
| R7 Rebinding, reserved keys | 12, 13, 14 |
| R8 Settings | 16, 17, 18 |
| R9 Deliberate holds, no tap-or-hold keys | 19, 20 |
| R10 Devices | 24 |
| R11 Cursor capture | 22, 26 |
| F2, F3, F4, F5 | 19; 21; 22; 23 |
| States and transitions | 3, 4, 5, 9 |
| Edge cases: focus, Frozen, panels, bindings, devices, simultaneous input | 5, 7, 15, 25, 26, 27 |
| UI Requirements 1 to 6 | 29, 19 (ring model), 30, 30, 29, 8 |

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Jump and Crouch: does the player jump (stairs, terrain)? Space is kept unbound so Jump can take it without any rebinding (R2) | Player Controller design doc | When Player Controller is designed |
| 2 | Gamepad default layout and stick feel; Steam Input support | Accessibility & Options, with Player Controller | Alpha |
| 3 | The systems index lists no upstream system for row 3; this document reads `tuning.input` (Game Data & Tuning) and the session state (Session & Authority, soft). Add Game Data & Tuning to row 3's "Depends On" | producer, at the next `/consistency-check` or `/map-systems` update | Before stories |
| 4 | What Click, Confirm, Alternate Click and Quick Move do in each panel (pick up, place, split, drop) is the Stash and Pack design docs' call; Input provides the actions and their single-key defaults | Stash, Pack design docs | When designed |
| 5 | `notch_size` in F5 depends on what the engine reports per scroll notch on each platform; measure it and record it in the engine reference | gameplay-programmer | **Before** the first input story |
| 6 | **Rebinding without a screen in the MVP.** Remappable input is part of the accessibility floor, but the rebinding screen arrives with Menus & Settings at Vertical Slice; until then bindings can be changed only in development builds. Accepted as a recorded gap, not an accident | Menus & Settings, accessibility | Vertical Slice |
| 7 | **Ping** (co-op): reserve an action and a default key when co-op is designed | Co-op Sessions | Before Tier 2a |
| 8 | Hammer repair (Use Tool on foot) versus build mode: how the two relate | Building design doc | When Building is designed |
| 9 | Further assistive options: a player multiplier for deliberate-hold durations or an arm-then-confirm alternative, split horizontal and vertical mouse sensitivity, restoring a toggle after a context change, a one-handed preset | Accessibility & Options | Alpha |

### Decisions taken on the designer's behalf (2026-11-27, autonomous mode)

Logged in `production/session-logs/decision-log.md`; each can be reversed:

1. Player Fantasy is indirect: "The controls disappear", supported by "Your
   hands, your keys".
2. Keyboard and mouse only in the MVP; gamepad designed in and laid out in
   Alpha (R10).
3. The prototype's controls carry over: WASD, mouse or arrow keys to look, hold
   left click **or Space** to use the tool, Shift to sprint, E to interact,
   Escape or P to pause (R2). (Space superseded by decision 13: F instead)
4. Build mode on B, rotate on R, cycle pieces with the scroll wheel, remove a
   piece by **holding** X; oxygen canister on Q; pack on Tab; tools on 1 to 3
   (R2).
5. Sprint and Use Tool are holds by default, each with a toggle setting; Remove
   Piece has no toggle (R8).
6. No presses are buffered across a context change, and every held action is
   released on focus loss or context change (R5).
7. Keys are bound by position, so AZERTY works without rebinding (R6).
8. Pause / Back can never be unbound, and Escape always works (R7).

Added in revision 1 (2026-11-28), from the creative-director's rulings in the
first `/design-review`; also logged in the decision log:

9. **Pause / Back is one action** whose meaning depends on the context; Close
   Panel and Cancel are folded into it, and a panel also closes on the action
   that opened it. Escape and Enter are reserved (R2, R7).
10. **The pack on a run is not modal** (Run Pack): Move, Sprint and Use
    Canister stay live; home panels stay modal (R4).
11. **Drop Item** on G (and Alternate Click in the pack panel) (R2).
12. **Fresh presses only for buttons**; Move and Look resume from the keys as
    they are; a toggled Sprint resets (R5).
13. **Space is unbound**, kept for a future Jump; the keyboard "do it" key is
    F (Use Tool, Place, Quick Move) (R2).
14. **The tap-or-hold timer is cut** (F1, `hold_threshold_s`); no key carries
    both a tap and a hold meaning unless the tap fires on press (R9).
15. **The whole MVP is playable from the keyboard**: Place on F, Cycle Piece on
    `[` `]`, Navigate, Confirm and Quick Move in panels, any key captures the
    cursor (R2, R11).
16. **Scroll keeps its own remainder** and wraps correctly for negative steps
    (F5); `notch_size` is measured before stories.
17. **The UI uses a keyboard-and-mouse-only scheme** in the MVP, so a gamepad
    cannot move menus (R10).
18. A keyboard look speed setting is added, and invert covers the arrow keys
    (R8). The missing rebinding screen in the MVP is a recorded gap (Open
    Questions 6).
