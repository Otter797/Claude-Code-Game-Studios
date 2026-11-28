# Game Data & Tuning

> **Status**: In Review (revision 2, 2026-11-28, after the second `/design-review`, verdict NEEDS REVISION; awaiting re-review)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-27 (run in-session by `/design-system` as a checklist, no agent spawned; autonomous mode). Senior review in `/design-review`: NEEDS REVISION 2026-11-27 and again 2026-11-28, see `design/gdd/reviews/game-data-and-tuning-review-log.md`
> **Author**: designer + Claude (design-system, autonomous mode)
> **Last Updated**: 2026-11-28 (revision 2)
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

Where a number belongs: a number that describes **one thing** (a creature's
speed and bite, an ore's toughness and worth, a recipe's input counts) is a
*field of that thing's definition*; a number that describes **a rule** (the
oxygen tank size, the storm interval, how fast noise decays) is a *tuning
value*. A family of keys with one entry per thing (`tough_*`, `value_*`,
`burrower_*`, `spitter_*`) is a sign the numbers belong on definitions;
recipe costs (`drill2_*`, `canister_*`) are `recipe` definitions, not tuning.
Every numeric definition field is checked by the same formula as a tuning
value (D1), so moving a number between the two never loosens its checks. A
definition field's range, unit and step are written **once per kind and
field**, not on each definition: each kind that has numeric fields has a
*limits set* `tuning.<kind>_limits` (for example `tuning.ore_limits`), owned
by the kind's owner, holding one R3 record per numeric field (its `value` is
the default shown to authors, and is not read by any rule). Each definition
then holds only the numbers themselves, so no single ore can widen its own
range.

A tuning value that a player may adjust (look sensitivity, a stick dead
zone) is the **designer's default**. Menus & Settings stores the player's own
setting separately and passes it in; the tuning value is never changed by the
player, and the player's setting is never game data.

**R2. Stable ids.** Every definition has an id of the form
`<kind>.<name>[.<qualifier>…]`:

- the whole id matches
  `^[a-z][a-z0-9_]*(\.[a-z0-9][a-z0-9_]*){1,5}$` and is at most 64 characters:
  lowercase ASCII letters, digits and underscores; segments joined by single
  dots; 2 to 6 segments; no empty segment, no leading or trailing dot, no
  segment starting with an underscore, and the kind segment starts with a
  letter;
- the first segment is a *kind* from the closed list below; adding a kind is a
  change to this document;
- ids are compared exactly (no case folding, no trimming);
- an id, once released in any build, **is never reused** for different
  content (ADR-0002). An id that is taken out of the game moves to the
  *retired list* (R14) and stays there.

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

**Fields shared across kinds.** The *holdable* kinds (`ore`, `material`,
`item`, `tool`, `gear`) all carry four common fields, `stack_max`, `worth`,
`family` and `tier`, because every container treats them alike. Ore & Item
Economy owns those four fields on every holdable kind; the kind's owner in the
table above owns every other field (Tools & Gear owns a drill's power, not its
`stack_max`). No other field is shared between owners.

Examples consistent with the ADRs: `ore.cobalt`, `tool.drill.basic`,
`piece.wall.stick`, `recipe.drill.better`, `tuning.storms`. The ore names in
the browser prototype (glint, ember, verdite, sunstone) are not ids; Ore &
Item Economy names the real ores.

**R3. A tuning value is a full record, not a bare number.** Every tuning value
carries:

| Field | Rule |
|---|---|
| `key` | snake_case, unique inside its tuning set |
| `type` | `int`, `float` or `bool`. A `float` is parsed straight into a 64-bit double and stays a double everywhere in the catalog, the panel and the fingerprint; no value is ever held as a 32-bit float |
| `value` | the number in use (for `bool`, true or false) |
| `min`, `max` | the safe range the owning design doc gives; required for `int` and `float`; `min ≤ value ≤ max` (formula D1). Written with at most 9 decimal places |
| `step` | the increment the development tuning panel uses; optional; at least 10⁻⁹ and at most 9 decimal places. When absent, the *effective step* is used: for `float`, (`max − min`) / 100; for `int`, max(1, round_half_up((`max − min`) / 100)). The effective step is checked by D1 like a written one. When `min = max` there is no step and the value is read-only on the panel |
| `unit` | one of the fixed units in R5, allowed for this `type` (R5 table) |
| `owner` | the system whose design doc defines the value's meaning; written once per tuning set and inherited by its values |
| `apply` | when a live change takes effect (R12): `live` (next Simulation tick), `next_run` (at the next run launch or return home) or `restart` (pending until the game restarts). Optional, default `live`; the owning design doc sets `next_run` or `restart` for any value whose change would contradict state already built from it, and gives the reason in the rationale. A system that precomputes something from a value at construction (a lookup table, a grid) marks that value `restart` unless its design doc says how it rebuilds on a live change |
| `rationale` | one line: why this number, or a link to the formula or playtest it came from (design-docs rule: balance values link to their source). Must be non-empty once `provisional` is false; while provisional it may be the carry-over note |
| `provisional` | true while the value is a placeholder (for example taken from the browser prototype) and the owner's design doc has not set it; false once it has. A release-candidate build fails its data validation if any value is still provisional |

A tuning set may also carry an optional **`constraints`** list: rules between
two keys of the same set, each written `key op key` with `op` one of `<`,
`≤`, `=`, `≥`, `>` (for example `walk_speed ≤ sprint_speed`,
`interval_min_s ≤ interval_max_s`). Both keys of a constraint must be
numeric and of the same unit, and `=` is allowed only between `int` values.
Constraints are checked by R9 on the values in use, and again whenever live
tuning makes a new revision (R12). A rule between values of different sets is
not allowed (R4: one owner per value).

This is the browser prototype's `config.js` shape (value, min, max, step),
kept because it worked, with unit, owner, apply and rationale added so a
number can never lose its reason.

**R4. Tuning sets.** Tuning values are grouped into one *tuning set* per
owning system, with the id `tuning.<system>` (for example `tuning.oxygen`,
`tuning.storms`). `<system>` is the system's name from the systems index in
snake_case (`tuning.player_controller`, `tuning.tools_and_gear`). A system
reads only its own set.

**One owner per value.** Every value lives in exactly one set. If another
system needs it, either for display (Run HUD showing the oxygen tank size) or
for a rule two systems must agree on numerically (Player Controller's speed
penalty for a full pack), the Authority layer passes that one value into the
second system's constructor from the owner's set (R10); the second system
never reads the other set and never keeps its own copy. Validation fails if
the same key name appears in two sets, so owners name keys specifically
(`hear_radius`, not `radius`). Owners decided for the values the
prototype shared (provisional, reversible when those design docs are
written): **Pack owns `full_pack_slow`**, passed to Player Controller;
**Run Flow owns `safe_radius`**, passed to Asteroid World; **Perception owns
the noise values** (`hear_radius`, `*_noise`, `noise_decay`, `wake_noise`),
passed to Creature AI where it needs them.

**R5. Units.** Data uses one unit per quantity, so no conversion is guessed.
Each unit allows only certain types and signs; D1 checks them against `min`
(and so against the value):

| Quantity | Unit in data | Allowed type | Allowed range | Notes |
|---|---|---|---|---|
| Time, duration | `s` (seconds) | float | min ≥ 0 | Including long ones: the storm interval is 3,000 to 4,200 s. Systems that keep milliseconds convert by formula D3 |
| Distance | `m` | float | min ≥ 0 | |
| Speed | `m_per_s` | float | min ≥ 0 | |
| Angle | `rad` | float | any | |
| Turn rate, look sensitivity | `rad_per_s`, `rad_per_px` | float | min ≥ 0 | |
| Fraction of something | `share` | float | 0 ≤ min, max ≤ 1 | Never percent |
| Multiplier | `multiplier` | float | min > 0 | 1 means no change |
| Health and damage | `hp`, `hp_per_s` | float or int | min ≥ 0 | |
| Worth | `credits` | int | min ≥ 0 | |
| Whole things | `count` | int | min ≥ 0 | Slots, pieces, storms, stuns |
| Rate per second of something else | `per_s` | float | min ≥ 0 | Noise per second, alert per second |
| Strength of something with no physical unit | `level` | float or int | min ≥ 0 | Noise amounts, alert thresholds, drill power; the rationale names the scale |
| Frequency | `hz` | int | min > 0 | Whole events per second, such as Session & Authority's tick rate |
| Switch | `none` | bool | (no range) | The only unit a `bool` may have, and only a `bool` may have it |

There is no catch-all unit. A quantity none of these fits is a change to this
table, made in this document, so unit checks keep their meaning. An owner that
truly needs a negative value for a unit marked `min ≥ 0` cannot have one
without changing this table.

`int` values, mins, maxes and steps lie within −2,147,483,648 to
2,147,483,647 (a 32-bit integer).

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

**The catalog is plain values, read once.** Loading reads each data asset one
time and copies what it holds into the catalog's own immutable plain values.
After that nothing reads the authoring assets again, and nothing at run time
ever writes to them: not the Simulation, not live tuning (R12), not
Presentation. The only thing that writes an authoring asset is the editor's
explicit "keep" action (R12 step 6). This matters in the Unity editor, where
a change to an asset during Play Mode would otherwise stay in the asset after
Play Mode ends. The catalog is an instance owned by the session start-up code,
never a static or global, so it is rebuilt cleanly each time the game starts
or Play Mode is entered.

**Start-up does not depend on a scene.** The catalog is built by start-up code
that runs whichever scene Play Mode or the player starts in (the editor's Play
button is often pressed in the valley or an asteroid scene, not the start-up
scene), and schemas hold no mutable static state. Entering Play Mode with
domain reload turned off therefore still builds a fresh catalog each time,
with nothing left over from the last session. How the bootstrap is hooked in
is ADR-0004's.

**R9. Validation.** Before the catalog becomes ready, every rule below is
checked, and **every** failure is collected (not just the first).

**Where the schema lives (one schema, not two).** Each owning system declares,
in its own code, a *schema*: the list of keys its tuning set must hold, and
for each kind of definition it owns, the list of fields with their type and,
for a field that refers to another definition, the kind it must refer to (a
recipe's inputs and output refer to `ore`, `material` or `item`). A field's
type is one of: `int`, `float` or `bool` (numbers checked against the kind's
limits set, R1); `enum` with its closed list of names (a family: `amber`,
`teal`, `none`); `id` with the kind or kinds it must refer to; `list` of one
of these; or `record`, a fixed set of named fields of these types (a recipe
input `{id, count}`). A schema may also declare constraints between numeric
fields of one definition (a creature's `see_m ≤ leash_m`), written like R3's
set constraints. A schema holds names, types and kinds only, never a number:
the numbers, ranges, units and rationale live in data (definition fields'
ranges in the kind's limits set, R1). Validation compares the data against
these schemas. The schema is what the owner's code reads, so a key can never be
present in code but missing in data, or the other way round, without
failing here.

The checks run in this order. A later check skips any entry that already
failed an earlier one, so one mistake is reported once, not as a cascade:
a definition whose own id failed check 2 is skipped by checks 4 to 9, and a
reference to an id that failed check 2 is not reported again at check 5 (a
badly formed id is reported as badly formed, not also as a missing reference
everywhere it is used). A reference to a *retired* id is always reported at
check 5, since nothing may refer to a retired id, even when a definition
wrongly reusing that id was already reported at check 3:

1. **Readable**: every data asset can be read; one that cannot is reported by
   asset name. Everything that asset should have held (its definitions, or
   the keys of its tuning set) is skipped by later checks, so an unreadable
   set is not also reported as every one of its keys missing.
2. **Ids**: every id is well formed (R2), of a kind in R2's list, and unique
   across the whole catalog.
3. **Retired**: no id appears on the retired list (R14).
4. **Fields**: every definition has every field its owner's schema requires,
   no field its schema does not declare, and each field of the declared type;
   and every tuning record has the fields R3 requires for its type (`type`;
   `min`, `max` and `unit` for numbers; an inherited `owner`; an `apply` that
   is one of the three; a non-empty `rationale` once `provisional` is false).
5. **References**: every id a definition refers to exists, is not retired,
   and is of the kind the schema expects for that field.
6. **Tuning keys**: every key the owner's schema declares is present in its
   set, keys are unique within the set, no set holds a key its schema does
   not declare (an unknown key is an error, not a warning: a misspelt key is
   the commonest data bug and would otherwise leave the real value at its old
   number), and no key name appears in two sets (R4).
7. **Units**: every unit is one of R5's and allowed for the value's type.
8. **Values**: every tuning value and numeric definition field passes formula
   D1, including its effective step (R3).
9. **Constraints**: every `constraints` rule of every set holds (R3).
10. **Release only**: in a release-candidate build, no value is
    `provisional` (R3). A *release-candidate build* is one made by the
    release step (any build meant for players outside the team, external
    playtests included). The release step runs this check before it builds,
    so a provisional value fails the build itself rather than showing testers
    an error screen.

Each failure is reported as a structured record (check number, data asset,
id or set, field or key, and a message), so tests compare records, not
wording; the data error screen and the log print the message.

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

**Readers outside the Simulation.** Two consumers read tuning outside the
host's Simulation tick: Input (`tuning.input`) and Player Controller
(`tuning.player_controller`, plus Pack's `full_pack_slow`), which run every
frame on each player's own machine because movement is owner-authoritative
(ADR-0001). The Authority layer hands them their values the same way, as plain
values from the catalog revision it publishes. When live tuning makes a new
revision (R12), the host publishes it and these readers switch to the new
values in the frame it arrives; there is no second path for them.

**R11. Release builds read only their own build content.** In a release build
the catalog is built only from data that shipped as part of the build. The game
never reads a tuning or definition file from anywhere else: not a loose file
beside the executable, not the user's folders, not a download. Remote content
updates (for example an Addressables content update) never carry rules data,
so the fingerprint (R13) always identifies the build. This removes any
supported way for a player to change tuning (anti-pillar: no gear granted
outside play) and lets co-op peers compare catalogs. Live tuning (R12) is
gated at compile time: its panel and change path exist only in the editor and
development builds, and are not compiled into a release player at all; no
data value can turn them on. The list of data assets the catalog reads is
generated from the data folder, and a CI check fails if a data asset is
missing from it or is assigned to an Addressables group. It is **not**
tamper-proofing: a player who edits the installed build's own files can
change it, and defending against that is out of scope for this system (see
Edge Cases, Degenerate strategies).

**Loading does not depend on Addressables.** The catalog's data and everything
the data error screen needs (its UI, font and text) are reached directly from
the start-up scene, not through Addressables or any other loader that can
itself fail, so a loading failure can always be shown. The error screen's text
is fixed English in code, since localisation also loads through Addressables.
Addressables may serve the display view's icons, meshes and sounds, loaded
when needed; the catalog becomes Ready without waiting for any display asset.

**R12. Live tuning (development builds only).** In a development build, in a
solo session (one-player host), the designer can change a tuning value while
playing, from the development tuning panel:

1. the panel (Presentation) sends a request: tuning set, key, new value;
2. the Authority layer checks it against D1 and the set's constraints (R3)
   and refuses an invalid value with the reason shown on the panel;
3. valid requests wait in the Authority layer's single **change queue**
   (Session & Authority's request queue). At the start of each Simulation
   tick, every request queued since the last tick is applied in arrival order
   as **one** new revision: the catalog becomes revision n+1 (a new immutable
   catalog; revision n is not changed) and each affected owning system is
   handed its new tuning set, or the single values passed from it (R4), and
   the readers outside the Simulation get it as R10 says. If two requests
   change the same key in one tick, the later one wins. **The combined
   revision is checked again** (D1 and every constraint of each changed set)
   before it is applied: a request that would break a rule together with the
   ones before it is refused with the reason shown on the panel and logged,
   and the rest still apply. The systems' state (oxygen left, pieces built,
   the storm clock) is kept. While no tick runs (paused, waiting on a save,
   in a menu), requests stay queued and the panel shows them as "queued
   (paused)";
4. a value marked `apply: next_run` is queued but held until the next run
   launch or return home, and is checked again with the catalog of that
   moment when it is applied; one marked `apply: restart` is never applied in
   the session: the panel shows it as pending, and it takes effect only if
   "keep" writes it and the game restarts;
5. every change is written to the log as a structured event: set, key, old
   value, new value, revision;
6. live values are never written to the save, and a save records no catalog
   revision or fingerprint, so loading a save never depends on what was tuned
   live. Live values are lost on restart, unless the designer uses the
   editor's "keep" action, which writes the value back into the data asset
   (editor only, as the prototype's panel wrote back to `config.js`).
   **"Keep" checks before it writes**: it runs D1 and the set's constraints
   on the asset's values with the kept values in place, and refuses with the
   reason if they fail (for example keeping a walk speed of 7 while the asset
   still holds a sprint speed of 6); "keep set" writes every changed value of
   the set at once. So "keep" can never save data that will not start.
   Loading a save inside a session keeps the session's live values;
7. the panel's "reset" for a set returns its values to those of revision 1
   (the catalog as loaded at start-up), as one live change; it never reads
   the authoring assets again (R8).

Only tuning values can change live. Definitions (items, pieces, recipes) never
change during a session: a saved item or piece must never point at a
definition that changed under it. Live tuning is not available in release
builds, or in any session with more than one player. A join request goes
through the same queue, so a join and a live change in the same tick are
handled in arrival order: the join is refused if the session's current
fingerprint differs from that of revision 1 when it is handled (Edge Cases),
so a set reset to its loaded values does not lock joins out.

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

Two committed files make this checkable, both plain text with one id per line,
kept in the repository beside the data:

- the **retired list**, append-only: CI fails if a line is removed or changed.
  Each line carries the id and the build it was retired in. It starts empty.
- the **released ids list**, regenerated by the release step from the
  catalog that shipped. The data validation test fails when an id on it is
  neither in the current data nor on the retired list. Before the first
  release it is empty and the check passes trivially. This proves "a released
  id still exists or is retired"; "never reused for different content" is
  kept by review, since meaning cannot be checked mechanically.

Tuning keys and tuning set ids are never saved, so they are not retired: a
removed key may be reused, though the owner should avoid it.

Save & Load asks the catalog about an id and gets one of three answers:
*known*, *retired* or *unknown*. What it does with each is Save & Load's
design.

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
systems are built from it and the loaded save names content by id. This is
enforced, not a convention: the start-up code awaits Ready before it calls
either, and both refuse to run (with an error naming the caller) if the
catalog is not Ready. If the catalog reaches Failed, neither is ever called. Save
migrations do not read the catalog: they are pure functions on the save
document (ADR-0002), so they stay correct as the catalog changes between
versions.

### Interactions with Other Systems

| System | Direction | What flows | Who owns the interface |
|---|---|---|---|
| Session & Authority | Out | Authority layer loads the catalog, builds each Simulation system with its tuning set and definitions (R10), applies live tuning through its request queue (R12), publishes the catalog revision, compares fingerprints from Tier 2a (R13) | This system defines the catalog and its rules; Session & Authority owns the loading, queue and hand-over code path |
| Ore & Item Economy | Out | `ore`, `material`, `item` definitions and the four holdable fields on `tool` and `gear` (R2); `tuning.ore_and_item_economy` (pacing report values). Worth is a field on each definition (R1), and each container's size belongs to the system that owns the container | Ore & Item Economy owns the fields and values; this system owns ids and validation |
| Input | Out | `tuning.input`, read every frame on each player's machine; new values the frame a new revision arrives (R10) | Input |
| Home Valley, Gathering | Out | `gatherable` definitions; their tuning sets (respawn, yields) | Owners |
| Player Controller | Out | `tuning.player_controller` (walk and sprint speed, look sensitivity), plus Pack's `full_pack_slow` passed in (R4). Read on every peer, since movement is owner-authoritative; new values the frame a new revision arrives (R10) | Owner |
| Save & Load | Out | Retired list and id lookup (known, retired or unknown, R14) for checking a loaded save; `tuning.save_and_load` (play-time note interval, about 30 s, ADR-0003) | Save & Load decides what to do with each answer; this system only answers |
| Tools & Gear | Out | `tool`, `gear` definitions; `tuning.tools_and_gear` | Owner |
| Building | Out | `piece` definitions with their costs (material ids and counts) and condition rules; `tuning.building` | Building owns the piece list and costs (systems index TD note); this system validates the ids they refer to |
| Stash, Crafting | Out | Their container sizes (in their own tuning sets, following Ore & Item Economy's container rule); `recipe` definitions; their tuning sets | Owners |
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

For `type = int` or `float`:

`is_valid_value = finite(value, min, max, max − min) ∧ (min ≤ max) ∧ (min ≤ value ≤ max) ∧ unit_allows(unit, type, min, max) ∧ (type = int ⇒ value, min, max are whole numbers within the 32-bit range) ∧ decimals(min), decimals(max), decimals(step) ≤ 9 ∧ (min < max ⇒ 10⁻⁹ ≤ eff_step ≤ max − min ∧ (max − min) / eff_step ≤ 100,000 ∧ (type = int ⇒ eff_step is a whole number)) ∧ (min = max ⇒ step absent)`

where `eff_step` is the written `step`, or the default from R3 when absent,
`unit_allows` is the R5 table's type and range column, and `decimals(x)` is
the number of decimal places in the shortest decimal text that reads back as
exactly the same double (computed by a portable routine that never uses the
runtime's number formatting, which differs between Mono and IL2CPP; D4). The
100,000 cap keeps the panel's list of positions (D2) small.

For `type = bool`: `is_valid_value = value ∈ {true, false} ∧ unit = none ∧
min, max and step are all absent`.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| value | int / float / bool | any finite number, or true/false | data file | The tuning value in use |
| min | int / float | any finite number allowed by the unit | data file | Lower end of the safe range, from the owning design doc |
| max | int / float | any finite number, ≥ min, allowed by the unit | data file | Upper end of the safe range |
| step | int / float | 0 < step ≤ max − min | data file (optional) | Development panel increment |
| eff_step | int / float | as step | calculated | `step` if present, else the R3 default (float: (max − min) / 100; int: max(1, round_half_up((max − min) / 100))) |
| type | enum | int, float, bool | data file | Kind of value |
| unit | enum | R5 list | data file | Unit of the value |

**Output Range:** true or false. False fails validation (R9) and the game does
not start.
**Boundaries:** `value = min` and `value = max` are valid (closed range).
`min = max` is valid and pins the value; a written `step` then fails, there
is no effective step, and the development panel shows the value read-only.
An `int` range of 0 to 16 with no step gets an effective step of
max(1, round_half_up(0.16)) = 1, not 0.16. An `int` range of 0 to 1 gets 1,
which equals max − min and is valid. `value = 0` is valid whenever 0 is
inside the range; whether 0 is sensible (a pack of 0 slots) is the owner's
range to forbid. NaN and infinities fail `finite`. A value need not lie on
the step grid; the first panel click snaps it to the grid (D2).
**Example:** `oxygen_seconds`: value 420, min 120, max 1200, step 10, float,
unit `s` → all clauses hold → valid. The same value with min 500 → `value <
min` → invalid; the data error screen reads `tuning.oxygen.oxygen_seconds:
420 is below min 500`.

### D2. Live tuning step (development panel)

The panel steps along a fixed list of *positions* P, counted from min, worked
in whole numbers scaled by 10^d so no rounding error can creep in:

`d = max(decimals(min), decimals(max), decimals(eff_step))` (at most 9, D1)
`S = 10^d`; `m = min × S`, `M = max × S`, `e = eff_step × S`, each rounded to the nearest whole number (64-bit)
`k_max = floor((M − m) / e)` (whole-number division)
`g(k) = (m + k × e) / S` for k = 0 … k_max
`P = [g(0), g(1), …, g(k_max)]`, followed by `max` if `m + k_max × e < M`
`i = index of the position in P nearest to value` (an exact tie takes the higher position)
`live_step_value = P[clamp(i + n, 0, length(P) − 1)]`

Each position is computed from min with one multiplication on whole numbers,
never by adding steps one after another, and divided by S once at the end. So
a step of 0.1 gives 0.3, not 0.30000000000000004; a float range of 0 to 1 with
no written step (effective step 0.01) gets d = 2 and 101 distinct positions;
and the stored value, the panel and the fingerprint (D4) all see the same
double. No position can exceed max, because the grid stops at the last whole
step that fits in the scaled integers.

`round_half_up` (used for the R3 default step) and the tie rule above both
round halves **up**, away from min. This is stated because the C# default
(`Math.Round`) rounds halves to the nearest even number; the implementation
must use `MidpointRounding.AwayFromZero` or equivalent.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| value | int / float | min to max | data file / live | Current value |
| n | int | −M to +M, M = `live_step_big_multiplier` | calculated | Clicks: ±1 per click, ±M with the modifier key held |
| eff_step | int / float | 0 < eff_step ≤ max − min | data file / R3 default | Increment |
| min, max | int / float | as D1, min < max | data file | Safe range |
| d | int | 0 to 9 | calculated | Most decimal places among min, max and the effective step (D1's `decimals`) |
| S, m, M, e | int (64-bit) | m, M within ±9.2 × 10¹⁸ | calculated | Scale factor and the scaled min, max and step |
| k_max | int | 1 to 100,000 | calculated | Last whole step that fits in the range; exact, since it is whole-number division (0 to 0.3 with step 0.1 gives 3, not 2) |
| P | list | 2 or more positions | calculated | The grid, plus max as its last position when max is off the grid |

**Output Range:** always one of the positions in P: within min to max, on
the grid or exactly max. Up and down are symmetric: one click up then one
click down always returns to the same position.
**Boundaries:** when `min = max` the panel is read-only and D2 is never
used. At the last position, `n > 0` returns it unchanged (not an error); at
the first, `n < 0` does the same. `n = 0` snaps an off-grid value to its
nearest position. When (max − min) is not a whole number of steps, max is an
extra last position: with min 0, max 10, step 3, P is 0, 3, 6, 9, 10, so one
click up from 9 gives 10 and one click down from 10 gives 9. For `int`, a
whole-number min and step keep every position whole, and max is whole.
Typing a value directly bypasses the grid but is still checked by D1 and the
set's constraints.
**Example:** `hunter_interval`: value 45, step 5, min 10, max 300, so P is
10, 15, … 300 (59 positions) and 45 is position 7. One click down: position 6
= 10 + 6 × 5 = 40. Ten clicks up from 295 (position 57): position
clamp(67, 0, 58) = 58 = 300.

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
allowed is the owner's range. Negative durations cannot reach D3: unit `s`
requires min ≥ 0 (R5), so D1 rejects them. A duration whose seconds have no
exact binary form (3,612.7 s) gives a millisecond value a hair away from the
decimal one (3,612,700.0000000005); tests compare such values within 10⁻⁶ ms.
**Example:** a storm interval drawn as 3,612.5 s becomes 3,612,500 ms on the
storm clock.

### D4. Catalog fingerprint

The `catalog_fingerprint` formula is defined as:

`catalog_fingerprint = first_8_bytes(SHA256(canonical_bytes(rules_view)))`, read big-endian

`canonical_bytes` is a fixed byte layout, never formatted numbers, because
C# number formatting differs between Unity's Mono (editor) and IL2CPP
(player) runtimes:

1. Every **attribute** of the rules view becomes one record with three names
   and a value: the entry's id (a definition id, or a tuning set id), the
   field or key name, and the attribute name (`value`, `min`, `max`, `step`,
   `unit`, `apply` for a tuning key; `value` for a definition field), then a
   one-byte type tag and the value.
2. Records are sorted by id, then by field or key name, then by attribute
   name, comparing UTF-8 bytes (ordinal; ids, keys and attribute names are
   ASCII, R2 and R3).
3. Type tags and encodings:

   | Tag | Type | Bytes |
   |---|---|---|
   | 0 | absent (a `step` not written) | nothing |
   | 1 | int | 8-byte little-endian two's complement |
   | 2 | double | the 8 bytes of its IEEE 754 bit pattern, little-endian, with −0 written as +0 (NaN cannot occur, D1) |
   | 3 | bool | one byte, 0 or 1 |
   | 4 | string (ids, and enum values such as `unit` and `apply` written as their ASCII names) | 4-byte little-endian length, then UTF-8 bytes |
   | 5 | list | 4-byte little-endian count, then each item in the order written in data (list order can carry meaning); an item that is a pair such as a recipe input `{id, count}` is written as its parts in declared order, each with its own tag |

   Names (id, key, attribute) are written as tag 4 strings.
4. `apply` is always written as its value in use, so an `apply` left at its
   default and one written as `live` give the same bytes; an absent `step`
   is written as tag 0, not as its effective step. The value in use, min,
   max, step, unit and apply are each an attribute, so a change to a range
   also changes the fingerprint. Rationale, provisional and owner are not
   rules and are excluded, as is all display data.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| rules_view | catalog | — | calculated | Every definition and tuning value in the rules view (R8); display data is excluded, since a different icon cannot desync a game |
| canonical_bytes | function | — | constant | The byte layout above |
| SHA256 | function | — | constant | The standard SHA-256 hash; only the first 8 bytes are kept |

**Output Range:** a 64-bit value, shown as 16 lowercase hexadecimal
characters (for example `3f9a0c11d2e47b80`). Two catalogs with the same rules
data always give the same fingerprint, on every machine, in the editor and in
every build, because no step depends on culture, formatting or runtime.
**Boundaries:** an empty rules view still has a fingerprint (that of zero
bytes), though an empty catalog fails validation for missing keys first. A
change to any single value, range, id or reference changes the fingerprint; a
change to display data, rationale or the provisional flag alone does not. The
order in which entries appear in the data files does not change it (step 2
sorts them). Live tuning (R12) changes it; the panel marks it `modified`. The
fingerprint detects mismatched data; it is not a security measure, and 64
bits are ample for that.
**Example:** changing `tuning.oxygen.oxygen_seconds` from 420 to 430 changes
the 8 value bytes of one record and so the whole fingerprint; changing the
oxygen canister's icon does not. A golden test fixes the expected canonical
bytes (committed as hex, written by hand from this layout) and the expected
fingerprint of a small committed fixture catalog, so the first implementation
is checked against the specification, not only against itself (Acceptance
Criteria).

## Edge Cases

Found by walking R1 to R14 and D1 to D4 (systems-designer lens), then checked
against ADR-0001 to ADR-0003.

**Ids and definitions**

- **If two definitions have the same id string**: validation fails (R9 check
  2), listing both data assets. Neither wins. (Two definitions of different
  kinds can never collide, since the kind is the id's first segment.)
- **If one id is badly formed and other definitions refer to it**: it is
  reported once, as badly formed (check 2); the references to it are not
  reported again as missing (R9 check order).
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
- **If an `int` value has no step and a small range** (pack slots 0 to 16):
  the effective step is 1, never a fraction (R3).
- **If a unit does not suit the type or sign** (a `share` declared `int`, a
  `bool` with a range, a `count` with min −1, a `multiplier` with min 0):
  D1 fails (R5 table).
- **If two values break a constraint of their set** (walk speed 7 with sprint
  speed 6, when the set says `walk_speed ≤ sprint_speed`): validation fails
  (R9 check 9), naming both keys. A live change that would break it is
  refused like an out-of-range value.
- **If a value is still `provisional` in a release-candidate build**:
  validation fails (R9 check 10). Development builds allow it.

**Loading and order**

- **If a data asset cannot be read at all** (missing, corrupt): it is recorded
  as a validation failure naming the asset, so the player sees one error
  screen with every problem, not a crash.
- **If Addressables cannot initialise**: the catalog still loads and the game
  still starts, since neither the catalog nor the error screen goes through
  Addressables (R11); only display assets (icons, meshes, sounds) are missing,
  and that is the display systems' edge case.
- **If anything asks for the catalog before it is Ready** (a save load, a
  session start): this is a programming error. In every build the call is
  refused with an error naming the caller; the start-up order (States and
  Transitions) is covered by an acceptance test so it cannot ship.
- **If validation fails in a release build** (it should already have failed in
  CI): the same data error screen, with the fingerprint and the list, and a
  line asking the player to verify the game files. The save is never opened,
  so it cannot be harmed.

**Live tuning (development builds)**

- **If a live change is requested during a waited save, a loading state or a
  run**: it is queued and applied at the next Simulation tick like any other
  (R12). A pending waited write (ADR-0003) holds the clock but not tuning; the
  change only affects how future ticks compute. The save being written holds
  no tuning and no revision, so it is the same whichever revision is current.
- **If several live changes arrive in one tick**: they become one revision,
  applied in arrival order; a later change to the same key wins (R12).
- **If a save is loaded inside a session that has live changes**: the live
  values stay; the save never carried tuning, so nothing is restored over them.
- **If a live change alters the storm interval or strength rules**: the next
  storm already scheduled keeps its time and strength (they are saved,
  ADR-0003); the new values apply from the storm after it.
- **If a live change lowers a capacity below what is in use** (pack slots 16 →
  10 with 14 items carried): this system applies the value; what happens to the
  excess is the owning system's edge case (Pack). Owning design docs must say
  what their rules do when a value changes mid-session, or set the value's
  `apply` field (R3) to `next_run` (applied at the next run launch or return
  home) or `restart` (shown pending on the panel, never applied in the
  session).
- **If a second player joins a session with live changes** (Tier 2a): live
  tuning is disabled once more than one player is in the session, and a session
  whose current fingerprint differs from revision 1's refuses joins, since the
  fingerprints no longer match. A session whose changes were all reset to the
  loaded values has revision 1's fingerprint again and accepts joins.
- **If two live changes are each valid alone but break a constraint
  together** (walk 5 and sprint 6, then "sprint → 5" and "walk → 6" in one
  tick): the combined revision is checked before it is applied (R12); "walk →
  6" is refused with the constraint's reason, "sprint → 5" applies.
- **If the designer keeps one value whose constraint partner was changed only
  live**: "keep" refuses, naming the constraint, and offers "keep set" (R12
  step 6).
- **If the game is paused, or a save wait holds the tick, when a live change
  is made**: it waits in the queue, the panel shows "queued (paused)", and it
  applies on the first tick after.
- **If a live change alters a value read on the player's own machine** (walk
  speed, look sensitivity): Player Controller and Input switch to it in the
  frame the new revision arrives (R10).
- **If the designer changes a value live and then quits without "keep"**: the
  value reverts on the next start. Nothing live is ever in the save.

**Degenerate strategies**

- **A player editing game data to give themselves gear or slow the storms**:
  release builds offer no supported way, since they read no data from outside
  their own build content (R11). Editing the installed build's own files (for
  example local Addressables bundles or packed assets) is possible and is
  outside what this system defends; anti-cheat for co-op is the security
  audit's (before Tier 2a).
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

This document already fixes some constraints that ADR-0004 must respect: the
catalog is read once into immutable plain values and authoring assets are
never written at run time except by "keep" (R8); the catalog and the error
screen load without Addressables (R11); the fingerprint hashes bytes, not
formatted numbers (D4); the retired and released ids lists are committed text
files (R14); the catalog is never static (R8). ADR-0004 must also decide:

- **Assemblies.** The intended split is three assemblies: plain data types
  (definitions, tuning records) with no engine references; the Simulation,
  referencing only the data assembly; and the loader and catalog, which may
  reference the engine. The compiler then enforces R10. The ADR rules whether
  the Simulation may use engine value types such as `Vector3` or `Mathf`; if it
  may, the architecture test (Acceptance Criteria 29) bans `UnityEngine.Object` types instead of
  all engine references.
- **Parser.** Unity's own serialisation and `JsonUtility` silently ignore
  unknown fields and fill in missing ones, which would defeat R9 checks 4 and
  6. The chosen format must hold tuning sets as lists of key and value records
  (not one typed field per value), read by a parser that reports unknown and
  missing fields.
  The practical result is likely text assets read by a custom parser, which
  must read numbers with the invariant culture so a player on a German locale
  reads "0.35" correctly.
- **Start-up.** An awaited start-up step that gates `StartSolo()` and
  `LoadAndWait()` on Ready (States and Transitions), hooked in so it runs
  whichever scene Play Mode or the player starts in, with domain reload on or
  off (R8).
- **Build gating and manifest.** How the live tuning code is compiled out of
  release players (R11), how the release-candidate check runs before the build
  (R9 check 10), and how the data asset list is generated and checked in CI
  (R11).
- **Development-only storm reschedule.** Whether the development panel gets
  a "reschedule next storm from current values" action, so a storm tuning
  change can be felt without waiting up to 70 minutes (Edge Cases).

### Downstream (systems that depend on this one)

Every Simulation system is built from this system's data. Hard means the
dependent cannot run without it.

| System | Hard / soft | Interface | Design doc |
|---|---|---|---|
| Session & Authority (2) | Hard | Loads the catalog, builds systems from it (R10), live tuning through its request queue (R12), fingerprint check (R13) | [session-and-authority.md](session-and-authority.md) (in review) |
| Input (3) | Hard | `tuning.input`, read every frame on each player's machine (R10) | [input.md](input.md) (in review) |
| Ore & Item Economy (4) | Hard | `ore`, `material`, `item` definitions; the four holdable fields on `tool` and `gear` (R2); `tuning.ore_and_item_economy` | [ore-and-item-economy.md](ore-and-item-economy.md) (in review) |
| Home Valley (5) | Hard | `gatherable` definitions and placement tuning; `tuning.home_valley` | Not written: provisional |
| Player Controller (6) | Hard | `tuning.player_controller`, read on every peer | Not written: provisional |
| Save & Load (7) | Hard | Id lookup and retired list; `tuning.save_and_load` (play-time note interval) | Not written: provisional |
| Tools & Gear (9) | Hard | `tool`, `gear` definitions; `tuning.tools_and_gear` | Not written: provisional |
| Asteroid World (16) | Hard | `zone` definitions; `tuning.asteroid_world` | Not written: provisional |
| Health & Damage (17) | Hard | `tuning.health_and_damage` | Not written: provisional |
| Perception (18) | Hard | `tuning.perception` | Not written: provisional |
| Pack, Gathering, Building, Stash, Crafting, Storms, Oxygen, Creature AI, Mining, Run Flow, Hunter Escalation (8, 10 to 14, 19 to 23) | Hard | Their definitions and tuning sets | Not written: provisional. Their systems-index rows do not list Game Data & Tuning because every Simulation system depends on it implicitly (see below) |
| Home HUD & Panels, Run HUD, Menus & Settings, Visual Feedback & Lighting, Audio (15, 24 to 27) | Soft | Display view by id; they work with placeholder names and icons | Not written |

**Bidirectional check.** The systems index lists Game Data & Tuning as a
dependency of rows 4, 5, 6, 7, 9, 16, 17 and 18, which matches the table.
Session & Authority, Input and Ore & Item Economy are now written, and each
lists Game Data & Tuning upstream.
**Every Simulation system depends on Game Data & Tuning implicitly**, whether
or not its systems-index row says so; the index lists it only where it is the
system's first or main data dependency, and `/consistency-check` should not
flag the others. No dependent design doc exists yet, so none can be checked;
each must list Game Data & Tuning under its upstream dependencies when written.

## Tuning Knobs

### This system's own settings

This system owns **no gameplay knob**: nothing here changes how the game plays.
Its settings are development and build settings, kept in data like everything
else:

They form the set `tuning.game_data`, in the R3 record shape:

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low / off | Too high / on |
|---|---|---|---|---|---|---|---|---|---|
| `live_tuning_enabled` | bool | true | — | — | — | `none` | `restart` | No live tuning even in development builds; every change needs a restart (slow tuning loop) | Live tuning in development builds and the editor. It can never turn live tuning on in a release player, where the code is not compiled in (R11); it is only an extra off-switch |
| `catalog_load_budget_s` | float | 0.5 | 0.1 | 2 | 0.1 | `s` | `restart` | Unreachable with MVP content; false alarms | Start-up feels slow before the main menu |
| `live_step_big_multiplier` | int | 10 (the M of D2) | 2 | 50 | 1 | `count` | `live` | Big steps hardly bigger than small ones | One click jumps across most of a range |

Owner: Game Data & Tuning. Rationale: `catalog_load_budget_s` keeps start-up
well under a second before the main menu; `live_step_big_multiplier` matches
the prototype panel's ×10 modifier. None is provisional.
`catalog_load_budget_s` is a target the load is measured against (Acceptance
Criteria), not a limit that stops the game.

### The knob convention every design doc follows

Every other design doc's Tuning Knobs section lists its values in the R3
record shape: key, type, value, min, max, step, unit, apply, rationale, and
whether it is still provisional, plus any constraints between its keys.
Numbers that describe one thing go on that thing's definitions instead
(R1). Each such list **is** that system's tuning set
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
Where R1 says a number belongs on a definition, the "Lands as" column says so.

| Owning system | Prototype values (key: value) | Lands as |
|---|---|---|
| Player Controller | walk_speed 3.8 m/s, sprint_speed 6.2 m/s, look_sens 0.0022 rad/px, key_turn 1.9 rad/s | `tuning.player_controller`, with constraint `walk_speed ≤ sprint_speed` |
| Pack | pack_slots 16, full_pack_slow 0.35 share (Pack owns it, R4; passed to Player Controller) | `tuning.pack` |
| Oxygen | oxygen_seconds 420 s, sprint_oxygen_mult 2.4, oxygen_low 0.3 share, suffocate_dps 12 hp/s, canister_refill 0.45 share, canister_carry 2 | `tuning.oxygen` (canister_refill may move to the canister's `item` definition; Oxygen decides) |
| Health & Damage | max_health 100 hp | `tuning.health_and_damage` |
| Mining | mine_range 3.6 m | `tuning.mining` |
| Tools & Gear | drill_power 1, drill2_power 2 | fields of the `tool.drill.*` definitions |
| Ore & Item Economy | **Set by its design doc** (2026-11-28): six ores with `worth` and `toughness` fields replace the prototype's four `tough_*` and `value_*` values. Source of truth: `design/gdd/ore-and-item-economy.md` R2 and `design/registry/entities.yaml` | fields of the `ore.*` definitions |
| Crafting | drill2_* (8, 5, 2 pieces), canister_* (4, 1 pieces) | inputs of `recipe.*` definitions |
| Perception | hear_radius 26 m, drill_noise 1.0, break_noise 1.6, sprint_noise 1.2, noise_decay 0.4, wake_noise 6 | `tuning.perception` (Perception owns them, R4; passed to Creature AI) |
| Creature AI | burrower_* (speed 4.4 m/s, bite 22 hp, windup 0.55 s, cooldown 1.5 s, reach 2.3 m, chase_time 16 s, leash 55 m, aggro 6 m, see 10 m, roam 9 m, roam_speed 1.3 m/s), spitter_* (see 11 m, range 30 m, interval 2.8 s, flight 1.7 s, splash 3.0 m, damage 18 hp) | fields of the `creature.burrower` and `creature.spitter` definitions (the definition schema may carry constraints such as see ≤ leash) |
| Creature AI | sight_alert 3, stun_drill_time 0.45 s, stun_time 2.6 s, stuns_to_flee 2 | `tuning.creature_ai` |
| Hunter Escalation | hunter_first 90 s, hunter_interval 45 s, hunter_speed_step 0.1, hunter_bite_step 0.3, hunter_spawn_dist 24 m, hunter_rise 1.6 s | `tuning.hunter_escalation` |
| Run Flow | safe_radius 34 m (Run Flow owns it, R4; passed to Asteroid World) | `tuning.run_flow` |
| Storms | interval 3,000 to 4,200 s (concept and ADR-0003, not from the prototype); strength rules open | `tuning.storms` (interval_min_s, interval_max_s, constraint `interval_min_s ≤ interval_max_s`); strength levels as `storm.*` definitions |
| Save & Load | play-time note interval about 30 s (ADR-0003) | `tuning.save_and_load` |
| Building | "a rock-and-stick shelter falls after 2 storms if not repaired" (concept) | condition values in `tuning.building`, or fields of `piece.*` definitions if they differ per piece |

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

- **A live change is felt on the next tick.** A valid change from the panel
  takes effect at the start of the next Simulation tick (R12): at Session &
  Authority's default 30 ticks per second, within about 33 ms of letting go of
  the button. Values read on the player's machine (walk speed, look
  sensitivity) change the frame the new revision arrives. While the game is
  paused (including auto-pause when focus moves to the editor) the panel shows
  the change as "queued (paused)" rather than appearing to do nothing.
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
   never offers "continue anyway", in any build: a playtest run on data that
   failed validation would produce observations nobody can trust. The screen,
   its font and its text are reached directly from the start-up scene, never
   through Addressables, and its text is fixed English (R11).
2. **Development tuning panel (development builds only, solo sessions).** A
   toggleable overlay listing tuning sets and their values. Each value shows
   key, current value, unit, range, apply mode, and a provisional marker; it
   can be stepped (D2) or typed. Invalid typed values are refused with the D1
   or constraint reason. Values changed this session are highlighted, with
   their original value; values waiting for `next_run` or `restart` are
   marked pending, and changes waiting for a tick are marked "queued
   (paused)". A "reset" action per set returns its values to revision 1's (as
   one live change; R12 step 7). A search field filters by key. "Keep" and
   "keep set" are offered in the editor only, and refuse with the reason when
   the asset would fail validation (R12 step 6). The panel shows the catalog
   revision and the fingerprint, marked `modified` whenever it differs from
   revision 1's.

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

Checked with the QA lens and revised after the first `/design-review`. The
traceability table at the end maps every rule, formula and state to its
criteria. **Types:**

- *Logic*: an automated EditMode test under `StarHaul/Assets/Tests/EditMode/`,
  built from in-memory fixtures made by factory functions; it reads no file.
- *Data*: an automated EditMode test that reads the committed game data and
  list files (`StarHaul/Assets/Tests/EditMode/DataValidation/`). It reads
  files, so it is kept apart from the Logic tests and counts as Integration.
- *Integration*: an automated PlayMode or player test, or, where named, a
  documented check whose record goes in `production/qa/evidence/`.
- *Performance*: a measurement in a built player against a stated budget.
- *UI*: a retained screenshot in `production/qa/evidence/`.

Tests assert on validation failure *records* (R9: check number, asset, id or
set, field or key), not on message wording, except where a criterion quotes a
message. Criteria marked **(provisional on X)** cannot be written until X's
design doc exists and are not counted as ready.

R1 (what is not game data) and R6 (no gameplay number in code) are checked by
code review against the control manifest, since "no number in code" cannot be
proven by running the game. R13's join refusal against a peer's fingerprint
arrives with co-op (Tier 2a) and gets its criterion in the co-op design doc.

**Ids, references and validation (R2, R9, R14)**

1. **GIVEN** two definitions in different fixture assets, both with id
   `piece.wall.stick`, **WHEN** validated, **THEN** there is exactly one
   check-2 record, naming both assets. *(Logic; R2, R9)*
2. **GIVEN** definitions with the ids `Ore.Cobalt`, `ore..cobalt`, `ore`,
   `ore.`, `ore._x`, `9ore.x`, `foo.bar` (unknown kind), `ore.a.b.c.d.e.f`
   (7 segments), `ore.cöbalt`, ` ore.cobalt` and a 65-character id, **WHEN**
   validated, **THEN** each gives one check-2 record; **AND** `ore.cobalt`,
   `ore.a.b.c.d.e` (6 segments) and a 64-character id pass. *(Logic; R2)*
3. **GIVEN** `ore.cobalt` is on the retired list, **WHEN** a definition uses
   that id, **THEN** there is a check-3 record; **AND WHEN** a recipe refers
   to `ore.cobalt`, **THEN** there is a check-5 record for the recipe's
   field. *(Logic; R9, R14)*
4. **GIVEN** a recipe whose input is `material.missing`, **WHEN** validated,
   **THEN** there is a check-5 record naming the recipe and the field;
   **AND GIVEN** a recipe whose output is `piece.wall.stick` while the
   recipe schema expects `ore`, `material` or `item`, **THEN** there is a
   check-5 wrong-kind record. *(Logic; R7, R9)*
5. **GIVEN** a catalog with three unrelated mistakes (a badly formed id, a
   value above its max, an undeclared key), **WHEN** validated, **THEN**
   there are exactly 3 records; **AND GIVEN** a badly formed id `Ore.X` that
   two recipes refer to, **THEN** there is exactly 1 record (no cascade).
   *(Logic; R9)*
6. **GIVEN** a definition missing a field its schema requires, one with a
   field its schema does not declare, and one with a field of the wrong
   type, **WHEN** validated, **THEN** each gives one check-4 record.
   *(Logic; R9)*
7. **GIVEN** a fixture loader that reports one asset as unreadable, **WHEN**
   the catalog loads, **THEN** there is one check-1 record naming the asset,
   the other assets are still validated and their mistakes reported, the
   catalog is Failed, and no exception escapes. *(Logic; R9, States)*
8. **GIVEN** the committed game data, **WHEN** the data validation test
   runs, **THEN** it reports no record. *(Data; R9: this is the test that
   runs on every push)*
9. **GIVEN** a released ids list containing `item.canister` and data with
   neither that definition nor a retired entry for it, **WHEN** the data
   validation test runs, **THEN** it fails naming `item.canister`; **AND
   GIVEN** an empty released ids list, **THEN** that check passes. *(Data;
   R14)*
9b. **GIVEN** a commit whose retired list has one line removed, and another
    whose retired list has one line changed, compared with the parent commit,
    **WHEN** the CI retired-list script runs, **THEN** it fails for both and
    passes for a commit that only appends a line. *(Integration, CI script
    reading git history; R14)*
10. **GIVEN** a catalog with `ore.cobalt` defined and `ore.glint` retired,
    **WHEN** Save & Load asks about `ore.cobalt`, `ore.glint` and
    `ore.nothing`, **THEN** the answers are known, retired and unknown.
    *(Logic; R14)*

**Tuning values (D1, R3, R4, R5)**

11. **GIVEN** a float value 420 with min 120 and max 1200, **WHEN**
    validated, **THEN** it passes, and so do 120 and 1200; 119.9 and 1200.1
    fail; **AND GIVEN** an int `count` with min 0 and max 16, **THEN** 0 and
    16 pass and 17 fails. *(Logic; D1 boundaries)*
12. **GIVEN** one fixture value per case below, **WHEN** validated, **THEN**
    each gives exactly one record, with the check number shown. *(Logic; D1,
    R5; parameterised, one case per line)*

    | Case | Check |
    |---|---|
    | a `share` of type `int`; a `bool` with unit `s`; unit `percent` | 7 (unit not allowed for the type) |
    | NaN; +infinity; a float range of −1.7 × 10³⁰⁸ to 1.7 × 10³⁰⁸ (max − min overflows) | 8 |
    | an `int` value of 2.5; an `int` min of 0.5; an `int` step of 0.5; an `int` value of 3,000,000,000 | 8 |
    | a `share` with max 1.2; a `share` with min −0.1; a `count` with min −1; a `multiplier` with min 0 | 8 (unit's allowed range) |
    | min 10 with max 5; step 0; step −1; step greater than max − min; step 10⁻¹⁰; a min of 0.1234567891 (10 decimals); a range of 0 to 1 with step 10⁻⁶ (more than 100,000 positions) | 8 |
    | a `bool` with a min | 8 |
13. **GIVEN** min = max = 5 with no step, **WHEN** validated, **THEN** it
    passes and the panel model marks it read-only; **AND GIVEN** the same
    with step 1, **THEN** it fails; **AND GIVEN** no step on an `int` range 0
    to 16, a `float` range 0 to 200, an `int` range 0 to 1 and an `int` range
    0 to 250, **THEN** the effective steps are 1, 2, 1 and 3 (round half up:
    2.5 → 3, not banker's 2) and all pass; **AND GIVEN** a written step equal
    to max − min, **THEN** it passes. *(Logic; D1, R3)*
14. **GIVEN** one value for every unit in the R5 table, each with an allowed
    type, **WHEN** validated, **THEN** all pass; **AND GIVEN** the units
    `percent` and `ratio`, **THEN** each gives a check-7 record. *(Logic; R5;
    parameterised over the table)*
15. **GIVEN** tuning records with, one per case: no `type`; an `int` with no
    min; one with no max; one with no unit; an `apply` of `later`;
    `provisional` false and an empty rationale; and a set with no `owner`,
    **WHEN** validated, **THEN** each gives exactly one check-4 record.
    *(Logic; R3, R9)*
16. **GIVEN** the Storms schema declares `interval_min_s` and the set lacks
    it, **WHEN** validated, **THEN** there is a check-6 record whose message
    is `tuning.storms is missing interval_min_s`; **AND GIVEN** the set holds
    an undeclared key `interval_mn_s`, **THEN** a check-6 record names it;
    **AND GIVEN** a key appearing twice in one set, **THEN** a check-6 record;
    **AND GIVEN** `full_pack_slow` in both `tuning.pack` and
    `tuning.player_controller`, **THEN** a check-6 record naming both sets.
    *(Logic; R4, R9)*
17. **GIVEN** a set with the constraint `walk_speed ≤ sprint_speed`, **WHEN**
    walk speed is 7 and sprint speed 6, **THEN** a check-9 record names both
    keys; **AND WHEN** both are 6, **THEN** it passes; **AND GIVEN** each of
    the five operators, **THEN** its equal-values case passes or fails as the
    operator says; **AND GIVEN** a constraint between keys of different units,
    a constraint using `=` between floats, or one naming a key of another set,
    **THEN** each gives a check-9 record. *(Logic; R3, R9)*
18. **GIVEN** one value marked `provisional`, **WHEN** validated as a
    release-candidate build, **THEN** there is a check-10 record; **AND WHEN**
    validated as a development build, **THEN** it passes. *(Logic; R3, R9)*

**Formulas D2 to D4**

19. **GIVEN** min 10, max 300, step 5, **WHEN** D2 is applied, **THEN**: from
    45 with n = −1 the result is 40; from 295 with n = +10, 300; from 300 with
    n = +1, 300; from 10 with n = −1, 10; from 47 with n = 0, 45; **AND GIVEN**
    min 0, max 10, step 3, **THEN** from 9 with n = +1 the result is 10 and
    from 10 with n = −1 it is 9; **AND GIVEN** min 0, max 10, step 1, **THEN**
    from 2.5 with n = 0 the result is 3 (ties go up); **AND GIVEN** min 0,
    max 0.3, step 0.1, **THEN** P has exactly 4 positions, the last exactly
    0.3; **AND GIVEN** a float range 0 to 1 with no step, **THEN** P has 101
    distinct positions and one click up from 0 gives exactly 0.01. *(Logic;
    D2)*
20. **GIVEN** min 0, max 200, step 0.1, starting at 0, **WHEN** D2 is
    applied with n = +1 one thousand times, **THEN** after the third call the
    result equals the double literal 0.3 exactly, after every call k it
    equals `round_to(k × 0.1, 1)` exactly, and after the last it equals 100
    exactly; every value is held as a double. *(Logic; D2: positions are
    computed, not accumulated)*
21. **GIVEN** `live_step_big_multiplier` 10, **WHEN** a modifier click is
    made, **THEN** n = +10; **AND GIVEN** it is 50, **THEN** n = +50; **AND
    GIVEN** it is 51 or 1, **THEN** `tuning.game_data` fails D1. *(Logic; D2,
    Tuning Knobs)*
22. **GIVEN** durations of 3,612.5 s, 0 s, 4,200 s and 3,612.7 s, **WHEN**
    converted by D3, **THEN** the results are exactly 3,612,500 ms, 0 ms and
    4,200,000 ms, and 3,612,700 ms within 10⁻⁶ ms. *(Logic; D3)*
23. **GIVEN** the committed golden fixture catalog, **WHEN** its canonical
    bytes and fingerprint are computed, **THEN** the bytes equal the committed
    hex (written by hand from D4's layout) and the fingerprint equals the
    committed 16-character literal; the same catalog with its entries in
    shuffled order gives the same literal; a change to one value, one min, the
    order of a recipe's inputs or an `apply` value gives a different
    fingerprint; a change only to an icon, a rationale, an owner or a
    provisional flag gives the same; an `apply` left at its default and one
    written as `live` give the same; a float written as −0 gives the same as
    +0. *(Logic; D4)*
24. **GIVEN** the same golden fixture, **WHEN** the golden test runs in an
    IL2CPP Windows player build, **THEN** it gives the same literal as in the
    editor. *(Integration, automated player test; D4)*

**Lifecycle, loading and hand-over (States, R8, R10, R11)**

25. **GIVEN** a catalog with one broken value and fake `ISessionHost` and
    `ISaveQueue` that count calls, **WHEN** start-up runs, **THEN** the
    catalog is Failed and both call counts are 0; **AND WHEN** a live change
    is then requested, **THEN** it is refused; **AND** reflection finds no
    reload operation on the catalog or its loader (Failed has no exit, and no
    state returns to Loading). *(Logic; States)*
26. **GIVEN** a valid catalog and fakes that record the catalog's state at
    the moment they are called, **WHEN** start-up runs, **THEN** both
    `StartSolo()` and `LoadAndWait()` see Ready, and one structured start-up
    event carrying the fingerprint is emitted at Ready. *(Logic; States
    ordering, R13)*
26b. **GIVEN** the catalog in each of Unloaded, Loading, Validating and
    Failed, **WHEN** the start-up code's catalog guard is asked whether a
    session may start or a save may load, **THEN** it answers no with an error
    naming the caller; in Ready it answers yes. The real refusal inside
    `StartSolo()` and `LoadAndWait()` is tested by Session & Authority.
    *(Logic; States ordering)*
27. **GIVEN** a development build and a release build, each with one broken
    value, **WHEN** started, **THEN** screenshots show the data error screen
    with its title, fingerprint, problem count, the problem line and exactly
    three actions (copy, open log folder, quit), and the release one also
    shows the "verify the game files" line. *(UI; UI Requirements 1)*
28. **GIVEN** a development player whose Addressables initialisation is made
    to fail, **WHEN** it starts with one broken value, **THEN** the data error
    screen still appears; **AND WHEN** it starts with valid data, **THEN** the
    catalog reaches Ready. *(Integration, documented check; R11)*
29. **GIVEN** the Simulation assembly named in ADR-0004, **WHEN** an
    architecture test reflects over it, **THEN** no constructor parameter,
    field or property has the catalog type, a `UnityEngine.Object` type or a
    `ScriptableObject` type, and the assembly does not reference the loader
    assembly; every Simulation system's constructor takes its tuning set and
    definitions as parameters. *(Logic; R8, R10, ADR-0001; provisional on ADR-0004 for the assembly names)*
30. **GIVEN** a Ready catalog at revision 1 and a reference held to it,
    **WHEN** a live change makes revision 2, **THEN** the held revision 1
    still reads the old value, and the catalog's rules-view types expose no
    public setter (checked by reflection). *(Logic; R8)*
31. **GIVEN** a definition with display data, **WHEN** the catalog is built,
    **THEN** its rules-view entry carries no display field, and the display
    view returns the display data under the same id. *(Logic; R7, R8)*
32. **GIVEN** the editor in Play Mode with `oxygen_seconds` 420 in its data
    asset, **WHEN** it is changed live to 600 and Play Mode ends without
    "keep", **THEN** the data asset's file is byte-identical to before; **AND
    WHEN** the same is done with "keep", **THEN** the asset reads 600.
    *(Integration, editor test or documented check; R8, R12; provisional on ADR-0004 for the write-back)*
33. **GIVEN** MVP content (all sets populated) in an IL2CPP Windows
    development player on the reference machine (the development PC until a
    performance budget names a minimum spec), **WHEN** the time from the
    first catalog read to Ready is measured over 5 cold starts, **THEN** the
    median is at most `catalog_load_budget_s` and no start exceeds twice it.
    *(Performance, ADVISORY until a minimum spec exists; Game Feel; provisional on MVP content existing)*

**Live tuning (R12) and builds (R11)**

34. **GIVEN** the Authority layer's tuning-apply step with a fake Oxygen
    system and a tick stub, and `oxygen_seconds` 420, **WHEN** a change to
    600 is queued during tick 100, **THEN** the system still has 420 during
    tick 100 and has 600 from tick 101; the oxygen already used is unchanged;
    a structured event records `tuning.oxygen`, `oxygen_seconds`, 420, 600,
    revision 2; and the fingerprint differs from revision 1's. *(Logic; R12)*
35. **GIVEN** the same, **WHEN** 5000 is typed for `oxygen_seconds` (max
    1200), **THEN** it is refused with the message `5000 is above max 1200`
    and the revision is unchanged; **AND WHEN** a change would break a
    constraint of the set, **THEN** it is refused the same way. *(Logic; R12,
    D1, R3)*
36. **GIVEN** two valid changes queued in one tick, **WHEN** the tick starts,
    **THEN** the revision rises by exactly 1; **AND GIVEN** both change the
    same key, **THEN** the later value is in use; **AND GIVEN** walk 5 and
    sprint 6 with the constraint `walk_speed ≤ sprint_speed`, and "sprint →
    5" then "walk → 6" queued in one tick, **THEN** "sprint → 5" applies,
    "walk → 6" is refused with a check-9 record naming both keys, and
    revision 2 holds walk 5 and sprint 5. *(Logic; R12)*
37. **GIVEN** a value marked `apply: next_run`, **WHEN** it is changed live,
    **THEN** it is not applied until the next run-launch or return-home
    event; **AND GIVEN** a value marked `apply: restart`, **THEN** it is
    never applied in the session and is reported pending. *(Logic; R3, R12)*
38. **GIVEN** a request to change a definition (a piece's cost), **WHEN** it
    reaches the Authority layer, **THEN** it is refused with a
    definitions-are-fixed result and the revision is unchanged. *(Logic; R12)*
39. **GIVEN** a fake session with two players, **WHEN** a live change is
    requested, **THEN** it is refused; **AND GIVEN** a solo session at
    revision 2 whose fingerprint differs from revision 1's, **WHEN** a join is
    requested, **THEN** it is refused; **AND GIVEN** a session at revision 3
    whose changes were all reset to the loaded values, **THEN** a join is
    accepted for checking; **AND GIVEN** a solo session at revision 1 where a
    join and a live change are queued in that order in one tick, **THEN** the
    join is handled first and the change is then refused. *(Logic; R12, Edge
    Cases)*
40. **GIVEN** a session at revision 3 and a spy save store, **WHEN** a save
    is written, **THEN** the saved model contains no tuning key, no revision
    and no fingerprint; **AND WHEN** that save is loaded inside the same
    session, **THEN** the session's live values are unchanged. *(Logic; R12
    step 6)*
40b. **GIVEN** a development build where a value was changed live and not
    kept, **WHEN** the game is restarted, **THEN** the value is back to its
    data asset value. *(Integration, documented check; R12)*
41. **GIVEN** a development build with one value changed live and one
    pending, **WHEN** the panel is opened, **THEN** a screenshot shows each
    value's key, value, unit, range, apply mode and provisional marker, the
    changed value highlighted with its original, the pending marker, the
    revision and the fingerprint marked `modified`. *(UI; UI Requirements 2)*
42. **GIVEN** a release player build, **WHEN** its compiled assemblies are
    inspected, **THEN** no live tuning panel or change-queue type for tuning
    exists in them; **AND GIVEN** `live_tuning_enabled` false in a development
    build, **THEN** the panel does not open; set true in data for a release
    build, **THEN** nothing changes. *(Integration, automated build check;
    R11, Tuning Knobs; provisional on ADR-0004 for the gating mechanism)*
43. **GIVEN** a release player, **WHEN** a modified tuning data file (in the
    format ADR-0004 chooses) is placed beside the executable and in the
    player's persistent data folder and the game is started, **THEN** the
    logged fingerprint equals that of an unmodified start, and pressing the
    panel's toggle key opens nothing. *(Integration, documented check with
    screenshot; R11, R12; provisional on ADR-0004)*

**Cross-system**

44. **GIVEN** Storms built from a test factory with an interval of 3,000 to
    4,200 s and a seeded generator, **WHEN** the generator returns 0.0 and
    then 1.0, **THEN** the intervals are exactly 3,000,000 and 4,200,000 ms;
    **AND WHEN** it schedules 1,000 storms from a fixed seed, **THEN** every
    interval lies within those bounds. *(Logic; R10, D3; provisional on the
    Storms design doc)*
45. **GIVEN** a live change to the storm interval while the next storm is
    scheduled at 3,500,000 ms, **WHEN** the change is applied, **THEN** that
    storm's time and strength are unchanged and the storm after it is drawn
    from the new range. *(Logic; Edge Cases, ADR-0003; provisional on the
    Storms design doc)*

**Added in revision 2**

46. **GIVEN** the asset values walk 5 and sprint 6 with the constraint
    `walk_speed ≤ sprint_speed`, and live values walk 7 and sprint 8, **WHEN**
    "keep" is used on walk alone, **THEN** it is refused naming the
    constraint and the asset's file is byte-identical to before; **WHEN**
    "keep set" is used, **THEN** both values are written. *(Integration,
    editor test or documented check; R12 step 6; provisional on ADR-0004 for
    the write-back)*
47. **GIVEN** the Authority layer's apply step with fake Player Controller
    and Input readers outside the tick, and Pack's `full_pack_slow` passed to
    Player Controller, **WHEN** a change to `walk_speed`, Input's
    `stick_deadzone` and `full_pack_slow` makes a new revision, **THEN** each reader
    holds the new value in the frame the revision is published, Player
    Controller gets `full_pack_slow` in the same frame as Pack, and none of
    them reads the catalog. *(Logic; R10, R12 step 3)*
48. **GIVEN** the editor with domain reload turned off, **WHEN** Play Mode is
    entered from the valley scene (not the start-up scene) twice in a row,
    **THEN** the catalog reaches Ready both times, as a new instance with
    revision 1, and no value from the first session is present in the
    second. *(Integration, editor PlayMode test; R8)*
49. **GIVEN** a fake loader that counts reads, **WHEN** the catalog loads and
    then three live changes are applied and a set is reset, **THEN** each data
    asset was read exactly once, and the reset set equals revision 1's values.
    *(Logic; R8, R12 step 7, UI Requirements 2)*
50. **GIVEN** the project's data folder, **WHEN** the CI manifest check runs,
    **THEN** it fails if a data asset is missing from the generated list or is
    assigned to an Addressables group, and passes otherwise. *(Integration,
    CI script; R11; provisional on ADR-0004)*
51. **GIVEN** `ore.glint` on the retired list with the build `0.3.0`, **WHEN**
    a definition uses that id, **THEN** the check-3 record's message names
    `0.3.0`. *(Logic; R14)*
52. **GIVEN** the panel's "reset" for one set with two changed values,
    **WHEN** it is used, **THEN** the catalog revision rises by exactly one.
    *(Logic; UI Requirements 2)*
53. **GIVEN** the game paused with a live change queued, **THEN** the panel
    model reports it as "queued (paused)" and it applies on the first tick
    after unpausing. *(Logic; R12 step 3)*
54. **GIVEN** a release-candidate build step and one provisional value,
    **WHEN** the build runs, **THEN** it fails before producing a player,
    naming the value. *(Integration, build script; R9 check 10; provisional on
    ADR-0004)*
55. **GIVEN** an unreadable tuning set asset whose owner's schema declares
    five keys, **WHEN** validated, **THEN** there is one check-1 record and no
    check-6 record for that set. *(Logic; R9 check order)*

**Traceability**

| Rule, formula or state | Criteria |
|---|---|
| R1 What is game data, limits sets | Code review (control manifest); limits checked through 6 and 12 |
| R2 Ids, shared holdable fields | 1, 2; shared fields by the owners' schemas (6) |
| R3 Value record, double floats, apply, constraints, provisional | 13, 15, 17, 18, 20, 35, 37 |
| R4 Tuning sets, one owner | 16 |
| R5 Units | 12, 14 |
| R6 No gameplay number in code | Code review (control manifest) |
| R7 Ids only, display data apart | 4, 31 |
| R8 Catalog, immutable, read once, scene-independent start-up | 29, 30, 31, 32, 48, 49 |
| R9 Validation, check order, release-candidate gate | 1 to 9, 12, 15 to 18, 54, 55 |
| R10 Systems receive their data, readers outside the Simulation | 29, 44, 47 |
| R11 Build content only, compile-time gate, manifest | 28, 42, 43, 50 |
| R12 Live tuning, batch check, keep, reset, queued while paused | 32, 34 to 41, 40b, 43, 46, 47, 49, 52, 53 |
| R13 Fingerprint shown and logged (MVP part) | 23, 26, 27, 34, 41 |
| R14 Retired and released ids | 3, 9, 9b, 10, 51 |
| D1 | 11 to 13, 21, 35 |
| D2 | 19, 20, 21 |
| D3 | 22, 44 |
| D4 | 23, 24 |
| States: Loading → Failed, Failed terminal | 7, 25 |
| States: Ready before StartSolo / LoadAndWait | 26, 26b |
| States: Ready n → n+1 | 30, 34, 36 |
| Game Feel: load budget | 33 |

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | Data format and loading: ScriptableObject assets, text (JSON) files, or both; how "keep" writes back in the editor; the assembly split and whether the Simulation may use engine value types; the parser. Becomes **ADR-0004 (game data format)**, verified against Unity 6.3, within the constraints listed under Dependencies (catalog loads without Addressables, fingerprint per D4, read-once immutable values) | technical-director, via `/architecture-decision` | Before the first story that loads data (Milestone A, first sprint) |
| 2 | ~~Systems-index dependencies for the eleven systems that read tuning~~ **Closed (revision 1):** every Simulation system depends on this one implicitly (Dependencies, bidirectional check) | — | — |
| 3 | Live tuning in co-op development sessions (more than one player): host broadcasts changes, or stays solo-only. **Solo-only until decided**; no downstream design doc may assume otherwise | network-programmer, in the co-op ADR | Before Tier 2a |
| 4 | Tuning profiles: named sets of overrides for playtest variants or test fixtures (like the prototype's retest rounds). Whatever is chosen, every override must pass D1 and the set's constraints, and the profile's name must appear in the log and the fingerprint | systems-designer | At the first Milestone A playtest |
| 5 | Which values use `apply: next_run` or `restart` (R3): each owning design doc says when it is written | Each owning system | With each design doc |
| 6 | ~~Shared values with two candidate owners~~ **Decided provisionally (revision 1):** Pack owns `full_pack_slow`, Run Flow owns `safe_radius`, Perception owns the noise values (R4). Reversible when those design docs are written | Those design docs' authors may revise | When the first of each pair is designed |
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
8. Release builds read only their own build content; no player-editable data file (R11; wording made exact in revision 1).
9. All durations in data are in seconds, shares are 0 to 1, never percent (R5).
10. The asset format and loading path are left to ADR-0004 (Open Question 1).
11. Prototype values carry over as provisional starting values, assigned to
    owners (Tuning Knobs).

Added in revision 1 (2026-11-27), from the creative-director's rulings in the
first `/design-review`; also logged in the decision log:

12. **No "run anyway"** on failed validation in any build, including
    development; validation reports every problem in one pass instead (R9,
    UI Requirements). Review after a playable build: this may clash with the
    designer's tuning habits.
13. Every tuning value gets an **`apply` field** (`live`, `next_run`,
    `restart`; default `live`) now, before any data exists (R3). Tuning
    profiles stay open (Open Question 4).
14. **Shared values get one owner now**, provisionally: Pack owns
    `full_pack_slow`, Run Flow owns `safe_radius`, Perception owns the noise
    values; no key may appear in two sets (R4). Review after a playable build.
15. The fingerprint hashes bytes, not formatted numbers, and the retired and
    released ids lists are committed files specified now; the co-op join
    check and any retired-list tooling wait for Tier 2a (D4, R13, R14).
16. Numbers that describe one thing live on its definition, not in tuning;
    the prototype's per-creature, per-ore and recipe families move there (R1,
    Tuning Knobs).
17. There is no catch-all unit; `ratio` is replaced by `level` and `none`,
    each with allowed types and signs (R5).

Added in revision 2 (2026-11-28), from the creative-director's rulings in the
second `/design-review` (both the review recorded in commit c02cc46 and this
session's parallel review); also logged in the decision log:

18. **Fail-hard at start-up stays**; "keep" is the safety valve and checks the
    whole set before it writes (R12 step 6).
19. **Floats are 64-bit doubles** from parse onward (R3); D2 works on a
    scaled-integer grid (D2); D4's byte layout is fully specified (D4).
20. **A live revision is re-checked as a whole**; a later request that breaks
    a constraint with earlier ones is refused (R12 step 3).
21. **Live tuning reaches Input and Player Controller** through the same
    published revision, in the frame it arrives (R10).
22. **Live tuning is gated at compile time**; `live_tuning_enabled` is only an
    extra off-switch (R11, Tuning Knobs).
23. **Joins are refused by fingerprint**, not by revision number (R12).
24. **Start-up runs from any scene**, with domain reload on or off (R8).
25. **Definition-field ranges live in a per-kind limits set** (R1, added by
    the parallel review session and kept), with typed non-numeric fields and
    in-definition constraints in the schema (R9).
26. **Ore & Item Economy owns the four holdable fields** on every holdable
    kind (R2); the unit `hz` is added (R5).
27. Deferred as recommended: a development-only storm reschedule action
    (Dependencies, ADR-0004 list), validating assets when saved in the editor,
    and dev-only out-of-range live edits.
