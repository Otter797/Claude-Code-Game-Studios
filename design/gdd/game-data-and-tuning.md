# Game Data & Tuning

> **Status**: Designed (pending `/design-review` in a fresh session)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode)
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-27
> **Last Verified**: 2026-11-27
> **Implements Pillar**: Pillar 2 (Risk is a choice), Pillar 3 (Bright world, real stakes); serves every pillar indirectly

## Summary

Game Data & Tuning is where every definition (materials, items, tools,
building pieces, recipes, creatures, storm strengths) and every gameplay number
in Star Haul lives, under stable ids, each number with its safe range, unit,
owner and reason. It checks all of it before the game starts and refuses to run
on a value it cannot trust, hands each system only its own values, and lets the
designer change numbers live in development builds. Players never see it; they
feel that the rules, forecasts and costs are the same every time they play.

> **Quick reference** — Layer: `Foundation` · Priority: `MVP` · Key deps: `None` (upstream); read by every Simulation system · Category: `Core`

## Overview

Game Data & Tuning is the single place where Star Haul's content and numbers
live. It holds two kinds of data. **Definitions** describe the things in the
game: every material, item, tool, building piece, recipe, creature and storm
strength, each under a stable string id such as `ore.cobalt` or
`piece.wall.stick`. **Tuning values** are every number a balance pass would
change: walk speed, oxygen in a full tank, the 50 to 70 minute storm interval,
the cost of a wall. This system defines how both are written, named, checked
and handed to the rest of the game; it does not decide what any of them are.
Each value's meaning and starting number belong to the system that uses it
(Storms owns the storm interval, Building owns piece costs), and that system's
design doc lists it under Tuning Knobs. The player never touches this system.
What they get from it is a game whose rules are the same every time they play,
a forecast that means what it says, and costs that do not shift under them. The
developer gets the other half: no gameplay number is written into code, so a
change to the game's balance is a change to data, checked before the game runs,
and in a development build it can be tried live without a restart. Without this
system every other design doc would invent its own way of storing numbers, the
save could not refer to content safely, and the coding standard "gameplay values
must be data-driven, never hardcoded" would have nothing to point to.

## Player Fantasy

**Indirect: the player experiences what this system guarantees, never the
system itself.**

**The rules hold still.** The moment this system serves is the one before a
choice: the player stands at the run console, sees the next storm's strength and
that it arrives in 14 minutes, looks at the stick walls that took one storm already, and
decides whether there is time for one more run. That decision is only a real
choice if the numbers behind it are the same numbers that were there last
session, and the same ones the forecast was computed from. Pillar 2 says it
directly: *"Danger is always readable and can be scouted before it is lethal."*
A danger is readable only if it behaves the same way each time it is read.

Two supporting lines follow from the same guarantee:

- **Every loss was fair.** Pillar 3 asks the game to keep the sting: *"Debating
  softening a loss to match the art or keeping the sting, this pillar picks the
  sting."* A loss stings in the right way only when the player knows the game
  did not cheat: the hunter rose at the time it always rises, the oxygen ran out
  at the rate it always runs. A game whose numbers drift, or that silently
  substitutes a default for a broken value, turns a fair loss into a bug report.
  This system refuses to start rather than run with a value it cannot trust.
- **Change a number, play it now** (designer-facing). The tension retest passed
  on its second round because every number in the browser prototype could be
  changed while playing. The Unity build keeps that: in a development build the
  designer can change a tuning value mid-session and feel the result on the next
  frame, then keep it.

What this asks of the rest of the design: no system may hide a number in code
or in a scene, and no system may treat a tuning value as something the player
can change. Wealth, gear and progress come only from play (anti-pillar: *"NOT
gear sold or granted outside play"*), so release builds read no file a player
could edit.

## Detailed Design

### Core Rules

Specialist lenses applied before drafting (Foundation/Infrastructure row):
`systems-designer` (primary), `gameplay-programmer` and `engine-programmer`
(supporting). Their main points are folded into the rules below: the
systems-designer asked for an exact value record and a closed state list; the
gameplay-programmer asked that each system receive its own tuning by injection,
never through a global lookup, so it stays unit-testable; the engine-programmer
asked that the asset format and loading path go to an ADR rather than this doc.
Where they pulled apart (live tuning is valuable but costly), the choice was
taken on the designer's behalf and is listed in Open Questions.

**R1. Two kinds of data.** Everything this system holds is either a
*definition* (a thing in the game: a material, item, tool, building piece,
recipe, creature, storm strength) or a *tuning value* (a number or switch a
rule reads). Nothing else is game data. Save contents, player progress and
settings are not game data: they belong to Save & Load and Menus & Settings.

**R2. Stable ids.** Every definition has an id of the form
`<kind>.<name>[.<qualifier>…]`:

- lowercase ASCII letters, digits and underscores in each segment; segments
  joined by single dots; 2 to 6 segments; at most 64 characters in total;
- the first segment is a *kind* from the closed list below; adding a kind is a
  change to this document;
- ids are compared exactly (no case folding, no trimming);
- an id, once released in any build, **is never reused** for different
  content (ADR-0002). An id that is taken out of the game moves to the
  *retired list* (R9) and stays there.

| Kind | What it names | Owning system (decides fields and content) |
|---|---|---|
| `ore` | Ores mined on runs | Ore & Item Economy |
| `material` | Non-ore materials (rock, stick, refined goods) | Ore & Item Economy |
| `item` | Anything else that sits in a container (canisters, consumables) | Ore & Item Economy |
| `tool` | Tools: drill tiers, hammer | Tools & Gear |
| `gear` | Wearable gear (Tier 1a and later) | Tools & Gear |
| `piece` | Building pieces | Building |
| `recipe` | Crafting recipes | Crafting |
| `creature` | Creature types | Creature AI |
| `storm` | Storm strength levels | Storms |
| `gatherable` | Things picked up in the valley (rock and stick nodes) | Home Valley / Gathering |
| `zone` | Asteroid zones | Asteroid World |
| `tuning` | Tuning sets (R4) | Each owning system |

Examples consistent with the ADRs: `ore.cobalt`, `tool.drill.basic`,
`piece.wall.stick`, `recipe.drill.better`, `tuning.storms`. The ore names in
the browser prototype (glint, ember, verdite, sunstone) are not ids; Ore &
Item Economy names the real ores.

**R3. A tuning value is a full record, not a bare number.** Every tuning value
carries:

| Field | Rule |
|---|---|
| `key` | snake_case, unique inside its tuning set |
| `type` | `int`, `float` or `bool` |
| `value` | the number in use (for `bool`, true or false) |
| `min`, `max` | the safe range the owning design doc gives; required for `int` and `float`; `min ≤ value ≤ max` (formula D1) |
| `step` | the increment the development tuning panel uses; optional, default (`max − min`) / 100 |
| `unit` | one of the fixed units in R5 |
| `owner` | the system whose design doc defines the value's meaning |
| `rationale` | one line: why this number, or a link to the formula or playtest it came from (design-docs rule: balance values link to their source) |
| `provisional` | true while the value is a placeholder (for example taken from the browser prototype) and the owner's design doc has not set it; false once it has |

This is the browser prototype's `config.js` shape (value, min, max, step),
kept because it worked, with unit, owner and rationale added so a number can
never lose its reason.

**R4. Tuning sets.** Tuning values are grouped into one *tuning set* per
owning system, with the id `tuning.<system>` (for example `tuning.oxygen`,
`tuning.storms`). A system reads only its own set. If a system needs another
system's number (Run HUD showing the oxygen tank size), it gets it from the
owning system's state or interface, never by reading the other set.

**R5. Units.** Data uses one unit per quantity, so no conversion is guessed:

| Quantity | Unit in data | Notes |
|---|---|---|
| Time, duration | `s` (seconds) | Including long ones: the storm interval is 3,000 to 4,200 s. Systems that keep milliseconds convert by formula D3 |
| Distance | `m` | |
| Speed | `m_per_s` | |
| Angle, turn rate | `rad`, `rad_per_s`, `rad_per_px` | |
| Fraction of something | `share` | Always within 0 to 1; never percent |
| Multiplier | `multiplier` | 1 means no change |
| Health and damage | `hp`, `hp_per_s` | |
| Worth | `credits` | |
| Whole things | `count` | Slots, pieces, storms, stuns |
| Rate per second of something else | `per_s` | Noise per second, alert per second |
| Anything else | `ratio` | Unitless; the rationale says what it is |

**R6. What must be data, and the exceptions.** Every number that a balance
pass would change is a tuning value; no gameplay number is written in code, in
a scene or in a prefab. The only numbers that stay in code are *constants*:
format version numbers, unit conversions (1,000 ms in a second), mathematical
constants, and engine plumbing that is not gameplay (layer masks, buffer
sizes). An owning design doc marks such a number `constant` in its Formulas
variable table, so the exception is visible.

**R7. Definitions refer to each other by id only.** A recipe lists its inputs
and output as item ids and counts; a piece lists its cost as material ids and
counts. Simulation-side data never holds an engine asset reference. The look
of a thing (display name, description, icon, mesh, sound) is *display data*,
kept beside the definition under the same id and read only by Presentation.
The Simulation never needs display data.

**R8. The catalog.** At start-up all definitions and tuning sets are loaded
into one *game data catalog*. Once ready, the catalog is read-only for the
session, except for development live tuning (R12), which replaces it with a
new revision rather than changing it. The catalog has two views:

- the **rules view**: definitions and tuning as plain values, with no engine
  type, handed to the Simulation (ADR-0001: *"The Simulation must receive
  tuning as plain config values passed in; it must never read a ScriptableObject
  or other asset itself."*);
- the **display view**: display data keyed by the same ids, for Presentation.

**R9. Validation.** Before the catalog becomes ready, every rule below is
checked, and **every** failure is collected (not just the first):

1. every id is well formed (R2) and unique across the whole catalog;
2. no id appears on the retired list;
3. every id a definition refers to exists and is of the expected kind;
4. every tuning value passes formula D1 (range valid, finite, integral for
   `int`, shares within 0 to 1);
5. every key an owning system declares it needs is present in its set, and no
   set holds a key its owner does not declare (an unknown key is an error, not
   a warning: a misspelt key is the commonest data bug and would otherwise
   leave the real value at its old number);
6. every unit is one of R5's.

**If any check fails, the game does not start.** It shows the data error
screen (UI Requirements) with the full list, and writes it to the log. There
is no silent clamp and no fallback default: running on a value nobody chose
could put wrong storms into a save that cannot be taken back (Pillar 3). The
same validation runs as an automated test on every push, so a broken data
change fails CI long before it reaches a build.

**R10. Systems receive their data; they never look it up.** When the catalog
is ready, the Authority layer builds each Simulation system with its own tuning
set and the definitions it needs, as plain values passed in. No Simulation
system holds a reference to the whole catalog or reads it through a global.
Tests build these values with a factory in test code and never load assets
(coding standards: dependency injection over singletons; fixtures from
factories).

**R11. Release builds read packed data only.** In a release build the catalog
is built only from data packed into the build. The game never reads a loose,
user-editable tuning or definition file. Players cannot change tuning
(anti-pillar: no gear granted outside play), and co-op peers can compare
catalogs (R13).

**R12. Live tuning (development builds only).** In a development build, in a
solo session (one-player host), the designer can change a tuning value while
playing, from the development tuning panel:

1. the panel (Presentation) sends a request: tuning set, key, new value;
2. the Authority layer checks it against D1 and refuses an invalid value with
   the reason shown on the panel;
3. a valid change takes effect at the start of the next Simulation tick: the
   catalog becomes revision n+1 and the owning system is handed its new tuning
   set; the system's state (oxygen left, pieces built, the storm clock) is kept;
4. every change is written to the log as set, key, old value, new value,
   revision;
5. live values are never written to the save and are lost on restart, unless
   the designer uses the editor's "keep" action, which writes the value back
   into the data asset (editor only, as the prototype's panel wrote back to
   `config.js`).

Only tuning values can change live. Definitions (items, pieces, recipes) never
change during a session: a saved item or piece must never point at a
definition that changed under it. Live tuning is not available in release
builds, or in any session with more than one player.

**R13. Every build's catalog has a fingerprint** (formula D4), shown on the
data error screen and in the development panel, and written to the log at
start-up. From Tier 2a, a host compares a joining player's fingerprint with
its own and refuses the join if they differ, because owner-authoritative
movement (ADR-0001) means clients run with their own copy of movement tuning.
In the MVP (solo only) the fingerprint is used for bug reports and support.

**R14. Changing data after release.** A tuning value can change in any patch;
it is not saved, so no migration is needed. A definition's fields can gain new
optional fields freely. Removing or renaming a definition that a save can hold
(materials, items, tools, pieces) needs a Save & Load migration, which maps
the old id to its replacement or removes it; the old id then goes on the
retired list. Renames live only in migrations, never as aliases in the catalog.

### States and Transitions

The catalog has one lifecycle per application run.

| State | Meaning | Who can read it |
|---|---|---|
| **Unloaded** | Application starting; no data | Nobody |
| **Loading** | Data assets being read | Nobody |
| **Validating** | All R9 checks running | Nobody |
| **Ready (revision n)** | Read-only catalog; systems built from it | Authority layer (rules view), Presentation (display view) |
| **Failed** | One or more R9 checks failed | Data error screen only |

| From | To | Trigger | Notes |
|---|---|---|---|
| Unloaded | Loading | Application start | Before the main menu, before any session or save load |
| Loading | Validating | All data read | A data asset that cannot be read at all is recorded as a validation failure, so it reaches Failed through Validating |
| Validating | Ready (revision 1) | Every check passes | Fingerprint computed (D4) and logged |
| Validating | Failed | Any check fails | Terminal for this run: the only exit is quitting the game |
| Ready (n) | Ready (n+1) | A valid live tuning change at a tick boundary | Development builds, solo sessions only (R12). Fingerprint recomputed and shown as modified |
| Ready (n) | Unloaded | Application quit | |

No other transition exists. In particular there is no Ready to Loading
(no reloading data from disk during a session) and no Failed to Ready.

**Ordering with other systems.** The catalog must be Ready before
`ISessionHost.StartSolo()` (ADR-0001) and before the Authority layer calls
`ISaveQueue.LoadAndWait()` (ADR-0003), because the session's Simulation
systems are built from it and the loaded save names content by id. Save
migrations do not read the catalog: they are pure functions on the save
document (ADR-0002), so they stay correct as the catalog changes between
versions.

### Interactions with Other Systems

| System | Direction | What flows | Who owns the interface |
|---|---|---|---|
| Session & Authority | Out | Authority layer loads the catalog, builds each Simulation system with its tuning set and definitions (R10), applies live tuning (R12), compares fingerprints from Tier 2a (R13) | This system defines the catalog and its rules; Session & Authority owns the loading and hand-over code path |
| Ore & Item Economy | Out | `ore`, `material`, `item` definitions; `tuning.economy` (worth per material, container sizes it defines) | Ore & Item Economy owns the fields and values; this system owns ids and validation |
| Home Valley, Gathering | Out | `gatherable` definitions; their tuning sets (respawn, yields) | Owners |
| Player Controller | Out | `tuning.player_controller` (walk and sprint speed, look sensitivity, full-pack slow-down). Read on every peer, since movement is owner-authoritative | Owner |
| Save & Load | Out | Retired list and id lookup (known or unknown) for checking a loaded save; `tuning.save_and_load` (play-time note interval, about 30 s, ADR-0003) | Save & Load decides what to do with an unknown id; this system only answers whether an id is known |
| Tools & Gear | Out | `tool`, `gear` definitions; `tuning.tools_and_gear` | Owner |
| Building | Out | `piece` definitions with their costs (material ids and counts) and condition rules; `tuning.building` | Building owns the piece list and costs (systems index TD note); this system validates the ids they refer to |
| Stash, Crafting | Out | Container definitions from Ore & Item Economy; `recipe` definitions; their tuning sets | Owners |
| Storms | Out | `storm` strength definitions; `tuning.storms` (interval range 3,000 to 4,200 s, strength rules) | Storms owns them (ADR-0003: "The interval range (50 to 70 minutes) and strength rules are tuning data") |
| Asteroid World, Health & Damage, Perception, Oxygen, Creature AI, Mining, Run Flow, Hunter Escalation | Out | Their definitions and tuning sets | Owners |
| Home HUD & Panels, Run HUD, Menus & Settings | Out | Display view (names, descriptions, icons by id) | This system owns the display view's keying by id; the UI systems own layout |
| Development tuning panel (Presentation, development builds only) | In | Live tuning requests: set, key, value | This system owns the request's rules (R12) |

This system calls no other system. Everything flows out of it, apart from live
tuning requests, which come in through the Authority layer.

## Formulas

This system defines no balance curve; its formulas are the numeric rules every
other system's data must satisfy. Boundaries were worked at each variable's
minimum, maximum and 0 (systems-designer lens); the results are in each
formula's notes.

### D1. Tuning value validity

The `is_valid_value` formula is defined as:

`is_valid_value = finite(value) ∧ finite(min) ∧ finite(max) ∧ (min ≤ max) ∧ (min ≤ value ≤ max) ∧ (type = int ⇒ value, min, max are whole numbers) ∧ (unit = share ⇒ 0 ≤ min ∧ max ≤ 1) ∧ (step present ⇒ 0 < step ≤ max − min ∧ (type = int ⇒ step is a whole number))`

For `type = bool` only `value ∈ {true, false}` is checked; there is no range.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| value | int / float | any finite number | data file | The tuning value in use |
| min | int / float | any finite number | data file | Lower end of the safe range, from the owning design doc |
| max | int / float | any finite number, ≥ min | data file | Upper end of the safe range |
| step | int / float | 0 < step ≤ max − min | data file (optional) | Development panel increment; default (max − min) / 100 |
| type | enum | int, float, bool | data file | Kind of value |
| unit | enum | R5 list | data file | Unit of the value |

**Output Range:** true or false. False fails validation (R9) and the game does
not start.
**Boundaries:** `value = min` and `value = max` are valid (closed range).
`min = max` is valid and pins the value; `step` must then be absent, since
D1 requires `step ≤ max − min = 0` and `step > 0`, and the development panel
shows the value read-only. `value = 0` is valid whenever 0 is inside the range;
whether 0 is sensible (a pack of 0 slots) is the owner's range to forbid. NaN
and infinities fail `finite`.
**Example:** `oxygen_seconds`: value 420, min 120, max 1200, step 10, float,
unit `s` → all clauses hold → valid. The same value with min 500 → `value <
min` → invalid; the data error screen reads `tuning.oxygen.oxygen_seconds:
420 is below min 500`.

### D2. Live tuning step (development panel)

The `live_step_value` formula is defined as:

`live_step_value = clamp(min + round((value + n × step − min) / step) × step, min, max)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| value | int / float | min to max | data file / live | Current value |
| n | int | −10 to +10 | calculated | Clicks: ±1 per click, ±10 with the modifier key held |
| step | int / float | 0 < step ≤ max − min | data file | Increment (D1 default when absent) |
| min, max | int / float | as D1 | data file | Safe range |

**Output Range:** always within min to max, always on the step grid counted
from min, so repeated clicks do not drift by rounding error. Typing a value
directly bypasses the grid but is still checked by D1.
**Boundaries:** at `value = max`, `n > 0` returns `max` (no change, not an
error). `n = 0` returns the value snapped to the grid. `step` cannot be 0 (D1),
so the division is always defined. For `int`, a whole-number step keeps the
result whole.
**Example:** `hunter_interval`: value 45, step 5, min 10, max 300. One click
down: 10 + round((45 − 5 − 10) / 5) × 5 = 10 + 6 × 5 = 40. Ten clicks up from
295: 10 + round((295 + 50 − 10) / 5) × 5 = 345 → clamped to 300.

### D3. Seconds in data to milliseconds in a clock

The `seconds_to_play_ms` formula is defined as:

`duration_ms = duration_s × 1000`

computed in double precision, with no rounding at conversion and no rounding
per tick (ADR-0003: the clock *"must accumulate tick time without rounding
each tick to whole milliseconds"*).

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| duration_s | float | owner's min to max (the largest MVP value is the storm interval maximum, 4,200 s) | data file | A duration as written in data (R5: always seconds) |
| 1000 | int | — | constant | Milliseconds per second (R6 exception) |
| duration_ms | double | 0 to 4,200,000 in the MVP | calculated | The same duration on a millisecond clock |

**Output Range:** 0 to 4.2 × 10⁶ ms for MVP data; double precision is exact
for whole milliseconds up to about 9 × 10¹⁵, so no realistic play time loses
precision.
**Boundaries:** `duration_s = 0` gives 0 ms; whether a zero duration is
allowed is the owner's range. Negative durations are possible only if an owner
sets a negative min, which no MVP owner should; an owner that needs one says
why in its rationale.
**Example:** a storm interval drawn as 3,612.5 s becomes 3,612,500 ms on the
storm clock.

### D4. Catalog fingerprint

The `catalog_fingerprint` formula is defined as:

`catalog_fingerprint = H64(canonical_text(rules_view))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| rules_view | catalog | — | calculated | Every definition and tuning value in the rules view (R8); display data is excluded, since a different icon cannot desync a game |
| canonical_text | function | — | constant | Entries sorted by id, then by field or key name in ordinal order; numbers in shortest round-trip decimal form; booleans as `true`/`false`; one entry per line |
| H64 | function | — | constant | A fixed 64-bit hash of the text; the algorithm is chosen in ADR-0004 (recommended: the first 64 bits of SHA-256) |

**Output Range:** a 64-bit value, shown as 16 hexadecimal characters
(for example `3f9a0c11d2e47b80`). Two catalogs with the same rules data always
give the same fingerprint, on every machine and in every build.
**Boundaries:** an empty rules view still has a fingerprint (that of the empty
text), though an empty catalog fails validation for missing keys first. A
change to any single value, id or reference changes the fingerprint; a change
to display data alone does not. Live tuning (R12) changes it; the panel marks
it `modified`. With a few thousand entries, the chance of two different
catalogs sharing a fingerprint is far below one in a billion.
**Example:** changing `tuning.oxygen.oxygen_seconds` from 420 to 430 changes
one line of canonical text and so the whole fingerprint; changing the
oxygen canister's icon does not.

## Edge Cases

Found by walking R1 to R14 and D1 to D4 (systems-designer lens), then checked
against ADR-0001 to ADR-0003.

**Ids and definitions**

- **If two definitions share an id** (even of different kinds, which R2 makes
  impossible unless the kind prefix is also equal): validation fails, listing
  both data assets. Neither wins.
- **If an id differs from another only by letter case or a trailing space**:
  the badly formed one fails R2 (uppercase and spaces are not allowed), so the
  pair can never both load.
- **If a definition uses an id on the retired list**: validation fails with
  `id <x> was retired in <build>; ids are never reused`. The fix is a new id.
- **If a definition refers to an id that does not exist, or to one of the wrong
  kind** (a recipe whose output is `piece.wall.stick`, if recipes may only make
  items): validation fails, naming the referring definition and field.
- **If a definition refers to a retired id**: validation fails the same way; a
  retired id exists only in the retired list, not as content.
- **If a definition is deleted from data without a migration while saves can
  hold it**: the game still starts (the catalog is valid on its own), and Save
  & Load meets an unknown id when loading. This system only answers "unknown";
  Save & Load's design doc decides the outcome. To make this rare, the data
  validation test also fails when an id that existed in the previous released
  build's catalog is neither present nor on the retired list.

**Tuning values**

- **If a value lies outside its range, or min > max, or a number is NaN or
  infinite**: D1 fails, validation fails, the game does not start. No clamp.
- **If a value is exactly at min or max**: valid.
- **If min = max**: valid and pinned; a `step` on it fails D1; the panel shows
  it read-only.
- **If an owning system declares a key that is missing from its set**:
  validation fails (`tuning.storms is missing interval_min_s`). There is no
  default value in code to fall back on.
- **If a set holds a key its owner does not declare** (a typo such as
  `oxygen_secs`): validation fails. The commonest data bug is a misspelt key
  silently leaving the real value unchanged.
- **If a `share` value has a range reaching outside 0 to 1**: D1 fails.
- **If an `int` value, min, max or step has a fraction**: D1 fails.

**Loading and order**

- **If a data asset cannot be read at all** (missing, corrupt): it is recorded
  as a validation failure naming the asset, so the player sees one error
  screen with every problem, not a crash.
- **If anything asks for the catalog before it is Ready** (a save load, a
  session start): this is a programming error. In development builds it stops
  with an error naming the caller; the start-up order (States and Transitions)
  is covered by an acceptance test so it cannot ship.
- **If validation fails in a release build** (it should already have failed in
  CI): the same data error screen, with the fingerprint and the list, and a
  line asking the player to verify the game files. The save is never opened,
  so it cannot be harmed.

**Live tuning (development builds)**

- **If a live change is requested during a waited save, a loading state or a
  run**: it is applied at the next Simulation tick like any other. A pending
  waited write (ADR-0003) holds the clock but not tuning; the change only
  affects how future ticks compute.
- **If a live change alters the storm interval or strength rules**: the next
  storm already scheduled keeps its time and strength (they are saved,
  ADR-0003); the new values apply from the storm after it.
- **If a live change lowers a capacity below what is in use** (pack slots 16 →
  10 with 14 items carried): this system applies the value; what happens to the
  excess is the owning system's edge case (Pack). Owning design docs must say
  what their rules do when a value changes mid-session, or mark the value
  "restart required", in which case the panel shows the change but marks it
  pending until restart.
- **If a second player joins a session with live changes** (Tier 2a): live
  tuning is disabled once more than one player is in the session, and a session
  whose catalog revision is above 1 refuses joins, since the fingerprints no
  longer match.
- **If the designer changes a value live and then quits without "keep"**: the
  value reverts on the next start. Nothing live is ever in the save.

**Degenerate strategies**

- **A player editing game data to give themselves gear or slow the storms**:
  impossible in release builds, which read no loose data file (R11). Editing
  the build's packed data is outside what this system defends; anti-cheat for
  co-op is the security audit's (before Tier 2a).
- No in-game loop can change a tuning value, so no player strategy can produce
  unbounded gain through this system.

## Dependencies

### Upstream (this system depends on)

None among game systems; it is the first system in the design order.

Constraints it must respect, from accepted ADRs:

| Source | Constraint |
|---|---|
| ADR-0001 | The Simulation receives tuning as plain values passed in and never reads an asset itself; the Authority layer loads data assets and hands values over; every tuning value comes from a data asset; Presentation never contains a rule |
| ADR-0002 | Content is referenced in saves by stable string id; an id is never reused; renames go through migrations; migrations are pure functions on the save document |
| ADR-0003 | The storm interval range and strength rules, and the play-time note interval, are tuning data; the next storm already scheduled is saved and keeps its time and strength across a tuning change |

Engine: Unity's data asset and asset loading facilities. The exact format
(ScriptableObject assets, text files, or both), whether loading goes through
Addressables, and the fingerprint hash are implementation choices for a new
ADR (ADR-0004, see Open Questions). No engine reference module covers this
domain (`docs/engine-reference/unity/modules/` has no core or scripting file),
so feasibility was not checked against the pinned engine; the ADR must verify
the chosen APIs for Unity 6.3.

### Downstream (systems that depend on this one)

Every Simulation system is built from this system's data. Hard means the
dependent cannot run without it.

| System | Hard / soft | Interface | Design doc |
|---|---|---|---|
| Session & Authority (2) | Hard | Loads the catalog, builds systems from it (R10), live tuning (R12), fingerprint check (R13) | Not written: provisional |
| Ore & Item Economy (4) | Hard | `ore`, `material`, `item` definitions; `tuning.economy` | Not written: provisional |
| Home Valley (5) | Hard | `gatherable` definitions and placement tuning; `tuning.home_valley` | Not written: provisional |
| Player Controller (6) | Hard | `tuning.player_controller`, read on every peer | Not written: provisional |
| Save & Load (7) | Hard | Id lookup and retired list; `tuning.save_and_load` (play-time note interval) | Not written: provisional |
| Tools & Gear (9) | Hard | `tool`, `gear` definitions; `tuning.tools_and_gear` | Not written: provisional |
| Asteroid World (16) | Hard | `zone` definitions; `tuning.asteroid_world` | Not written: provisional |
| Health & Damage (17) | Hard | `tuning.health_and_damage` | Not written: provisional |
| Perception (18) | Hard | `tuning.perception` | Not written: provisional |
| Pack, Gathering, Building, Stash, Crafting, Storms, Oxygen, Creature AI, Mining, Run Flow, Hunter Escalation (8, 10 to 14, 19 to 23) | Hard | Their definitions and tuning sets | Not written: provisional. Their systems-index rows do not list Game Data & Tuning; see Open Questions |
| Home HUD & Panels, Run HUD, Menus & Settings, Visual Feedback & Lighting, Audio (15, 24 to 27) | Soft | Display view by id; they work with placeholder names and icons | Not written |

**Bidirectional check.** The systems index lists Game Data & Tuning as a
dependency of rows 4, 5, 6, 7, 9, 16, 17 and 18, which matches the table. No
dependent design doc exists yet, so none can be checked; each must list Game
Data & Tuning under its upstream dependencies when written.

## Tuning Knobs

### This system's own settings

This system owns **no gameplay knob**: nothing here changes how the game plays.
Its settings are development and build settings, kept in data like everything
else:

| Setting | Value | Safe range | Too low / off | Too high / on |
|---|---|---|---|---|
| `live_tuning_enabled` | true in development builds, false in release | bool, per build configuration | No live tuning; every change needs a restart (slow tuning loop) | In a release build: players could change tuning. **Must be false in release**; an acceptance criterion checks it |
| `catalog_load_budget_s` | 0.5 s | 0.1 to 2 s | Unreachable with MVP content; false alarms | Start-up feels slow before the main menu |
| `live_step_big_multiplier` | 10 (the `n` of ±10 in D2) | 2 to 50 | Big steps hardly bigger than small ones | One click jumps across most of a range |

`catalog_load_budget_s` is a target the load is measured against (Acceptance
Criteria), not a limit that stops the game.

### The knob convention every design doc follows

Every other design doc's Tuning Knobs section lists its values in the R3
record shape: key, type, value, min, max, step, unit, rationale, and whether
it is still provisional. Each such list **is** that system's tuning set
`tuning.<system>`; this document does not repeat them. A knob owned by one
system is never duplicated in another's set (R4).

### Starting values waiting for their owners

The browser prototype's `config.js` holds about 75 tuned values, two of them
retuned in the passed tension retest (round 2). They are the starting point
for the owners' sets, carried over as `provisional: true` with the rationale
"browser prototype, retest round 2 (2026-11-27)" until each owner's design doc
sets them. The prototype's ranges become each value's min and max unless the
owner changes them. They are listed by owner here so no number is lost;
the values themselves stay in `prototypes/star-haul/config.js` until moved.

| Owning system | Prototype values (key: value) |
|---|---|
| Player Controller | walk_speed 3.8 m/s, sprint_speed 6.2 m/s, look_sens 0.0022 rad/px, key_turn 1.9 rad/s, full_pack_slow 0.35 share (shared rule with Pack; owner to settle) |
| Oxygen | oxygen_seconds 420 s, sprint_oxygen_mult 2.4, oxygen_low 0.3 share, suffocate_dps 12 hp/s, canister_refill 0.45 share, canister_carry 2 |
| Health & Damage | max_health 100 hp |
| Mining | mine_range 3.6 m, drill_power 1, drill2_power 2, tough_* (2.0, 3.0, 4.4, 6.0 s per piece) |
| Pack | pack_slots 16 |
| Ore & Item Economy | value_* (10, 30, 80, 220 credits per piece; ore names provisional) |
| Crafting | drill2_* (8, 5, 2 pieces), canister_* (4, 1 pieces) |
| Perception | hear_radius 26 m, drill_noise 1.0, break_noise 1.6, sprint_noise 1.2, noise_decay 0.4, wake_noise 6 |
| Creature AI | burrower_* (speed 4.4 m/s, bite 22 hp, windup 0.55 s, cooldown 1.5 s, reach 2.3 m, chase_time 16 s, leash 55 m, aggro 6 m, see 10 m, roam 9 m, roam_speed 1.3 m/s), sight_alert 3, stun_drill_time 0.45 s, stun_time 2.6 s, stuns_to_flee 2, spitter_* (see 11 m, range 30 m, interval 2.8 s, flight 1.7 s, splash 3.0 m, damage 18 hp) |
| Hunter Escalation | hunter_first 90 s, hunter_interval 45 s, hunter_speed_step 0.1, hunter_bite_step 0.3, hunter_spawn_dist 24 m, hunter_rise 1.6 s |
| Asteroid World or Run Flow | safe_radius 34 m (owner to settle) |
| Storms | interval 3,000 to 4,200 s (concept and ADR-0003, not from the prototype); strength rules open |
| Save & Load | play-time note interval about 30 s (ADR-0003) |
| Building | "a rock-and-stick shelter falls after 2 storms if not repaired" (concept) becomes condition values in `tuning.building` |

Audio volume (`volume` in the prototype) is a player setting, not tuning: it
belongs to Menus & Settings and is never game data (R1).

## Visual/Audio Requirements

Optional for a `Core` system, and this one has no player-facing visuals or
sound of its own. The display view (R7, R8) carries every other system's names,
icons, meshes and sound references keyed by id; what those look and sound like
is the owning system's and the art bible's. Two screens below are
utilitarian: the data error screen uses the game's standard UI font and
colours at readable size, with no art; the development tuning panel is a
debug overlay and never appears in a release build. No asset spec is needed
for this system.

## Game Feel

Optional for a `Core` system. The feel this system owns is the designer's
tuning loop, not the player's:

- **A live change is felt on the next frame.** A valid change from the panel
  takes effect at the start of the next Simulation tick (R12), so at 60 frames
  per second the designer sees it within about 17 ms of letting go of the
  button.
- **Keeping a value is one action.** The editor's "keep" writes the current
  live value back into its data asset in one step; no copying numbers by hand
  from the panel into an asset.
- **Start-up stays quick.** Loading and validating the catalog fits within
  `catalog_load_budget_s` (0.5 s) at MVP content size.

## UI Requirements

1. **Data error screen (all builds).** Shown when the catalog reaches Failed
   (States and Transitions); the only screen available in that state. It
   shows: a one-line title ("Game data could not be loaded"), the build's
   fingerprint (D4), the number of problems, and a scrolling list with one line
   per failed check (asset, id or key, and the rule broken, as in D1's example).
   Actions: copy the list to the clipboard, open the log folder, quit. In a
   release build it adds a line asking the player to verify the game files. It
   never offers "continue anyway".
2. **Development tuning panel (development builds only, solo sessions).** A
   toggleable overlay listing tuning sets and their values. Each value shows
   key, current value, unit, range, and a provisional marker; it can be
   stepped (D2) or typed. Invalid typed values are refused with the D1 reason.
   Values changed this session are highlighted, with their original value. A
   search field filters by key. "Keep" is offered in the editor only. The panel
   shows the catalog revision and the fingerprint, marked `modified` after any
   live change.

> **📌 UX Flag — Game Data & Tuning**: the data error screen is a player-facing
> screen (rare, but real). It belongs with Menus & Settings' screens: when
> `/ux-design` runs for Menus & Settings, include it. The development tuning
> panel is a developer tool and needs no UX spec.

## Cross-References

| This document references | Where | What it relies on |
|---|---|---|
| `docs/architecture/adr-0001-network-model.md` | Decision 1, Implementation Guidelines | Simulation receives plain tuning values; Authority layer loads data assets; every tuning value from a data asset; owner-authoritative movement (why clients need tuning, R13) |
| `docs/architecture/adr-0002-persistence.md` | Decision 3, 7; Implementation Guidelines | Stable string ids, never reused; renames through migrations; migrations are pure functions |
| `docs/architecture/adr-0003-home-and-storm-persistence.md` | Decisions 5, 8, 15; Risks | Storm interval and strength rules are tuning data; saved next storm keeps its time and strength; play-time note interval is tuning; load order with `LoadAndWait` |
| `design/gdd/game-concept.md` | Pillars 2 and 3; anti-pillars; Open Questions (storms) | The fantasy this system serves; no gear granted outside play; storm facts (50 to 70 minutes, two storms) |
| `design/gdd/systems-index.md` | Row 1; TD notes | This system's place and dependents; Building owns its piece list and costs through this system |
| `prototypes/star-haul/config.js` and `REPORT.md` | Whole file; Tension Retest | The value record shape (R3) and the starting values waiting for their owners |
| Dependent design docs (rows 2 to 27) | Not written yet | Each will own a tuning set and list its knobs in the R3 shape |

## Acceptance Criteria

Checked with the QA lens against Core Rules, Formulas and Edge Cases: every
rule R1 to R14 and formula D1 to D4 has at least one criterion; formula
criteria include a boundary value. **Type**: *Logic* criteria need an
automated EditMode test (under `StarHaul/Assets/Tests/EditMode/`); *Integration*
criteria need an automated test or a documented check; *UI* criteria need a
retained screenshot in `production/qa/evidence/`.

QA lens gaps, stated rather than hidden: R1 (what is not game data) and R6 (no
gameplay number in code) are checked by code review against the control
manifest, not by a test, since "no number in code" cannot be proven by running
the game. R13's join refusal arrives with co-op (Tier 2a) and gets its
criterion in the co-op design doc; the MVP criteria cover the fingerprint
itself (15, 16, 24).

**Ids and validation**

1. **GIVEN** a test catalog with two definitions both using id
   `piece.wall.stick`, **WHEN** it is validated, **THEN** validation fails and
   the error list names both entries. *(Logic; R2, R9)*
2. **GIVEN** definitions with ids `Ore.Cobalt`, `ore..cobalt`, `ore` and a
   65-character id, **WHEN** validated, **THEN** each fails with "badly formed
   id", and `ore.cobalt` passes. *(Logic; R2)*
3. **GIVEN** `ore.cobalt` is on the retired list and a definition uses it,
   **WHEN** validated, **THEN** validation fails with a message containing
   "retired". *(Logic; R2, R9)*
4. **GIVEN** a recipe whose input is `material.missing`, **WHEN** validated,
   **THEN** validation fails naming the recipe and the field. *(Logic; R7, R9)*
5. **GIVEN** a catalog with three different broken entries, **WHEN**
   validated, **THEN** all three appear in the error list (not only the first).
   *(Logic; R9)*
6. **GIVEN** the previous released build's id list contains `item.canister`
   and the current data has neither that definition nor a retired entry for it,
   **WHEN** the data validation test runs, **THEN** it fails naming
   `item.canister`. *(Logic; R14, Edge Cases)*

**Tuning values (D1)**

7. **GIVEN** a float value 420 with min 120 and max 1200, **WHEN** validated,
   **THEN** it passes; **AND GIVEN** the value is 120 or 1200, **THEN** it
   passes; **AND GIVEN** it is 119.9 or 1200.1, **THEN** it fails. *(Logic; D1
   boundaries)*
8. **GIVEN** values that are NaN, +infinity, an `int` of 2.5, a `share` with
   max 1.2, min 10 with max 5, and a step of 0, **WHEN** validated, **THEN**
   each fails D1 with its own message. *(Logic; D1)*
9. **GIVEN** a value with min = max = 5 and no step, **WHEN** validated,
   **THEN** it passes; **AND GIVEN** the same with step 1, **THEN** it fails.
   *(Logic; D1)*
10. **GIVEN** the Storms system declares key `interval_min_s` and the set lacks
    it, **WHEN** validated, **THEN** validation fails with
    `tuning.storms is missing interval_min_s`; **AND GIVEN** the set holds an
    undeclared key `interval_mn_s`, **THEN** validation fails naming it.
    *(Logic; R9 check 5)*
11. **GIVEN** a tuning value with unit `percent`, **WHEN** validated, **THEN**
    it fails (not an R5 unit). *(Logic; R5)*

**Formulas D2 to D4**

12. **GIVEN** value 45, step 5, min 10, max 300, **WHEN** D2 is applied with
    n = −1, **THEN** the result is 40; with n = +10 from 295, **THEN** 300; with
    n = +1 from 300, **THEN** 300. *(Logic; D2)*
13. **GIVEN** a float value stepped up 1,000 times by step 0.1 from 0 within
    range 0 to 200, **WHEN** D2 is applied each time, **THEN** the result equals
    the grid value min + 1000 × step computed in one multiplication (100), not
    the sum of 1,000 additions, so there is no drift.
    *(Logic; D2)*
14. **GIVEN** a duration of 3,612.5 s, **WHEN** converted by D3, **THEN** the
    result is 3,612,500 ms; 0 s gives 0 ms; 4,200 s gives 4,200,000 ms. *(Logic;
    D3)*
15. **GIVEN** the same catalog built twice, in two separate processes, **WHEN**
    fingerprints are computed, **THEN** they are equal; **AND GIVEN** one value
    changes, **THEN** the fingerprint changes; **AND GIVEN** only an icon
    reference changes, **THEN** it does not. *(Logic; D4)*

**Lifecycle, loading and hand-over**

16. **GIVEN** a catalog with one broken value, **WHEN** the game starts,
    **THEN** the data error screen shows the fingerprint and the problem, no
    session starts, the save file's modified time is unchanged, and the only
    actions are copy, open log folder and quit. *(UI + Integration; R9, States)*
17. **GIVEN** a valid catalog, **WHEN** the game starts, **THEN** the log shows
    the catalog reaching Ready before `StartSolo()` and before `LoadAndWait()`
    are called. *(Integration; States ordering)*
18. **GIVEN** each Simulation system's constructor, **WHEN** it is inspected by
    an architecture test, **THEN** it receives its tuning set and definitions as
    parameters, and no Simulation type references the catalog type or an engine
    asset type. *(Logic; R8, R10, ADR-0001)*
19. **GIVEN** MVP content (all sets populated), **WHEN** the catalog loads and
    validates on the minimum spec PC, **THEN** it completes within
    `catalog_load_budget_s` (0.5 s), measured over five starts. *(Integration;
    Game Feel)*

**Live tuning (R12) and builds (R11, R13)**

20. **GIVEN** a development build in a solo session with `oxygen_seconds` 420,
    **WHEN** the designer sets it to 600 on the panel, **THEN** from the next
    tick oxygen drains at the new rate, oxygen already used is kept, the log
    records set, key, 420, 600 and revision 2, and the panel shows the
    fingerprint as `modified`. *(Integration; R12)*
21. **GIVEN** the same session, **WHEN** the designer types 5000 for
    `oxygen_seconds` (max 1200), **THEN** the panel refuses it with the D1
    reason and the revision stays unchanged. *(Logic; R12, D1)*
22. **GIVEN** a live change was made and not kept, **WHEN** the game is
    restarted, **THEN** the value is back to its data asset value and the saved
    file contains no tuning value. *(Integration; R12)*
23. **GIVEN** a live change to the storm interval while a storm is scheduled
    at 3,500,000 ms, **WHEN** the change is applied, **THEN** that storm's time
    and strength are unchanged and the storm after it is drawn from the new
    range. *(Logic; Edge Cases, ADR-0003)*
24. **GIVEN** a release build, **WHEN** it is started, **THEN** the tuning
    panel cannot be opened, `live_tuning_enabled` is false, and placing an
    edited data file beside the executable changes nothing in the fingerprint.
    *(Integration; R11, R12)*
25. **GIVEN** the panel is asked to change a definition (for example a piece's
    cost), **WHEN** the request reaches the Authority layer, **THEN** it is
    refused: only tuning values change live. *(Logic; R12)*

**Cross-system**

26. **GIVEN** Storms is built from a test factory with an interval of 3,000 to
    4,200 s, **WHEN** it schedules 1,000 storms, **THEN** every interval lies
    within 3,000,000 to 4,200,000 ms, showing tuning reached the system through
    injection and D3. *(Logic; R10, D3)*

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Data format and loading: ScriptableObject assets, text (JSON) files, or both; loaded directly or through Addressables; the fingerprint hash (D4); how "keep" writes back in the editor. Becomes **ADR-0004 (game data format)**, verified against Unity 6.3 | technical-director, via `/architecture-decision` | Before the first story that loads data (Milestone A, first sprint) |
| 2 | Eleven systems that read tuning (Pack, Gathering, Building, Stash, Crafting, Storms, Oxygen, Creature AI, Mining, Run Flow, Hunter Escalation; Player Controller already does) do not list Game Data & Tuning in their systems-index "Depends On" column. Add it, or note that every Simulation system depends on it implicitly | producer, at the next `/consistency-check` or `/map-systems` update | Before the Building design doc |
| 3 | Live tuning in co-op development sessions (more than one player): host broadcasts changes, or stays solo-only | network-programmer, in the co-op ADR | Before Tier 2a |
| 4 | Tuning profiles: named sets of overrides for playtest variants or test fixtures (like the prototype's retest rounds) | systems-designer | At the first Milestone A playtest |
| 5 | Which values need "restart required" marks: each owning design doc says when it is written | Each owning system | With each design doc |
| 6 | Shared values with two candidate owners: `full_pack_slow` (Player Controller or Pack) and `safe_radius` (Asteroid World or Run Flow) | Those design docs' authors | When the first of each pair is designed |
| 7 | Display text keys and localisation: display names are written in English now; a key scheme for translation is not designed | Menus & Settings / localization | Vertical Slice |

### Decisions taken on the designer's behalf (2026-11-27, autonomous mode)

The designer said on 2026-11-27 to assume agreement and review after a playable
build exists. These were decided for them and are logged in
`production/session-logs/decision-log.md`; each can be reversed:

1. Overview framed as a data layer, kept at design level (no ADR cited there).
2. Player Fantasy is indirect: "The rules hold still" (Pillar 2), with "Every
   loss was fair" (Pillar 3) and "Change a number, play it now" (designer) as
   supporting lines.
3. A broken data value **stops the game from starting** rather than being
   clamped or replaced by a default (R9).
4. An unknown key in a tuning set is an **error**, not a warning (R9).
5. **Live tuning is included**, in development builds and solo sessions only,
   for tuning values only, never definitions (R12).
6. Each system is handed only its own tuning set; nothing looks tuning up
   through a global (R10).
7. Renames go through Save & Load migrations; the catalog keeps only a retired
   list so ids are never reused (R14).
8. Release builds read packed data only; no player-editable data file (R11).
9. All durations in data are in seconds, shares are 0 to 1, never percent (R5).
10. The asset format and loading path are left to ADR-0004 (Open Question 1).
11. Prototype values carry over as provisional starting values, assigned to
    owners (Tuning Knobs).
