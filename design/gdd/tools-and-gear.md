# Tools & Gear

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 3 (Bright world, real stakes), Pillar 5 (Home is the scoreboard)
> **Creative Director Review (CD-GDD-ALIGN)**: APPROVED 2026-11-28 — run in-session as a checklist (no agent spawned). Pillar 1 is served by rules: the better drill alone opens tier 3 ore (R1, F1) and is twice as fast, with a warning if a later tier stops feeling better (F2). Pillar 3 by every carried tool being lost on death and on an abandoned run, the hammer included, with no durability or insurance softening it (R10). Pillar 2 by the launch prompt naming every carried tool and "No drill" (R11), since a hammer adds 0 to at risk. Pillar 5 by tools coming only from recipes and being moved only through stashes, which show their contents in the world (R4; Stash's rule); the "Made, not given" framing is held as a constraint, not left to fantasy text. No anti-pillar crossed: no upkeep (no durability, R2, States), no timer, nothing granted. Pillar 4 is not served directly and need not be.

## Summary

Tools & Gear defines the three MVP tools (the hammer, the basic drill and the
better drill) and the three carried tool slots they sit in, selected with keys
1 to 3 or the scroll wheel and used with the left mouse button. The better
drill mines twice as fast and is the only drill that opens tier 3 ore, so it is
the run's one piece of progression; like the pack, every carried tool is lost
on death, and the basic drill can always be re-made from valley materials.
Gear (wearables) is reserved for Tier 1a.

> **Quick reference** — Layer: `Feature` · Priority: `MVP` · Key deps: `Ore & Item Economy, Game Data & Tuning, Input, Session & Authority`

## Overview

Tools & Gear defines the things the player holds and uses, and the three
carried tool slots they sit in. In the MVP there are three tools: the
**hammer**, which repairs the home after a storm; the **basic drill**, which
mines tier 1 and 2 ore; and the **better drill**, which mines twice as fast and
is the only drill that opens tier 3 ore. Every tool is made at a workbench
(Crafting), lives in one of three tool slots selected with keys 1 to 3 or the
scroll wheel, and is used with Use Tool (left mouse button). What a use *does*
belongs to the system behind the tool's verb: a drill's use goes to Mining, the
hammer's to Building. This document owns what each tool is (its definition
fields: verb, drill tier, drill power), how the player carries, selects and
equips tools, and what happens to them on death: like the pack, every carried
tool is lost (concept, Recovery from failure). *Gear* (wearable suits and
upgrades) is a holdable kind reserved here for Tier 1a's gear tiers; the MVP
defines no gear.

As data, tools are `tool` definitions in the catalog (Game Data & Tuning, R2),
each carrying the four holdable fields Ore & Item Economy owns (`stack_max` 1,
`worth` 0, `family` none, `tier` 0) plus the fields owned here. The tool slots
are one container per player, `carried.<playerId>.tools` (Economy, R4), saved
at home in the save's `carried` part (ADR-0003, Decision 3). For the player,
the system is the hands-and-tool on screen and the choice of what to take out:
the better drill is a teal-ore investment that opens the richest seams and is
gone if the run fails.

Without it the game would have no way to say "a better drill opens harder rock
deeper in" (game brief), no repair for the home, and nothing at risk on a run
but the pack.

## Player Fantasy

**Framing: both.** The player uses tools directly (select, raise, drill,
repair), and beneath that sits a data layer they never see (definitions, tiers,
the slot container). The fantasy is about the first; the second exists to keep
it honest.

**Creative-director lens applied** (`lens-creative-director.md`, in-session):
three candidate framings, each tied to one moment and one pillar.

1. **"The right tool in my hand."** *Moment:* deep on the asteroid, the player
   presses 2 and the better drill rises into view; the sunstone seam that
   refused the basic drill last run now gives, one glowing piece every three
   seconds. *Pillar 1: "Every system exists to make loot more desirable or
   getting it home more tense."* Asks of the design: a visible gate (tier 3
   refuses the basic drill, with a clear reason) and a felt speed step (twice
   as fast).
2. **"Everything I carry can be lost."** *Moment:* at the launch prompt the
   player sees "Better drill, Hammer" in the carried list, and walks back to the
   stash to leave the hammer behind. *Pillar 3: "It looks friendly and
   colourful; it plays seriously."* Asks of the design: tools are lost on
   death with nothing softening it, and what is carried is shown before launch.
3. **"Made, not given."** *Moment:* the first hammer appears on the stick
   workbench, lashed from four sticks; later, a teal-trimmed drill sits on the
   same bench. *Pillar 5: "Wealth is something you see and walk through, not a
   number."* Asks of the design: every tool comes from a recipe and is shown in
   the world, never from a menu (anti-pillar: "NOT gear sold or granted outside
   play").

**Chosen: 1, "The right tool in my hand", with 2 as the decision it creates**
(logged; the designer reviews it at the first playable). The better drill is
the run's one piece of progression in the MVP: it turns "a better drill opens
harder rock deeper in" into a felt moment. Framing 2 is what makes that drill
worth something: taking it out is a stake. Framing 3 holds as a constraint (no
tool is ever granted) rather than as the fantasy.

The fantasy is *competence and reach*, not power: a tool never fights, never
levels up, never wears out. It decides which seams the player can open and
how fast, and its loss is part of the sting.

## Detailed Design

### Core Rules

**Specialist lenses applied** (`lens-specialists.md`, in-session; Section 6
row *Progression, XP, skills*: game-designer primary, systems-designer and
economy-designer supporting).

- **game-designer.** The decision this system creates is *what to take out*:
  the better drill (fast, opens tier 3, costly to lose) or the basic drill
  (cheap, from valley materials), and whether to bring a spare. Keep the
  number of tools tiny so the choice is readable; no tool should be strictly
  dominant *to carry*, which is why losing it must cost. Warns: a hammer that
  is silently lost on a run is a hidden loss (its replacement worth is 0, so
  the at-risk readout shows nothing) and breaks Pillar 2; show it at launch.
- **systems-designer.** Needs: one equipped slot at all times (an empty slot
  means bare hands), a defined equip delay so use cannot start mid-switch, a
  clean begin/end of use (Session & Authority, Open Questions 7: held actions
  as begin and end intents), and a single gate rule for drill tiers that
  Mining applies. Warns: auto-selecting a tool on events (pick-up, launch)
  must never interrupt a use in progress.
- **economy-designer.** Tools are a `per_death` sink (re-making a lost drill:
  Economy, R10) and the teal family's main recurring use. The better drill's
  recipe (Crafting) should land in Economy's "lost drill" band of 0.5 to 1.0
  runs. No durability (Economy, R5: items carry no state), so death is the
  only tool sink, which keeps upkeep out (anti-pillar). Warns: if the basic
  drill could mine tier 3 at all, the better drill becomes a luxury; keep the
  gate hard.

**Tensions put to the decision** (autonomous mode: recommended options taken
and logged): (a) at run launch, equip the best drill automatically (chosen)
or leave the player's selection; (b) let the hammer go on runs, as the
concept says, and list it at launch (chosen) or refuse to launch with it;
(c) tools cannot be used while sprinting (chosen, matching Player
Controller's lowered hands) or may be.

**R1. Tools in the MVP.** Three `tool` definitions:

| Id | Verb | `drill_tier` | `drill_power` | Made from (Crafting owns the recipe) | Role |
|---|---|---|---|---|---|
| `tool.hammer` | `repair` | 0 | 0 | Valley materials (rock and stick) | Repairs the home after a storm (Building, Storms) |
| `tool.drill.basic` | `drill` | 1 | 1.0 | Valley materials (rock and stick) | Mines tier 1 and 2 ore; always re-makeable from nothing |
| `tool.drill.better` | `drill` | 2 | 2.0 | Run ore, mainly teal (Economy, R2: teal is technical) | Mines every MVP ore, twice as fast |

Drill power values are the prototype's (`drill_power` 1, `drill2_power` 2:
Game Data & Tuning, prototype table). Every tool has `stack_max` 1 and worth 0
(Economy, R11), so a tool's at-risk value is its replacement worth (Economy,
R9): 0 for the hammer and basic drill, the better drill's recipe worth for the
better drill.

**R2. Tool definition fields.** Besides the four holdable fields (Economy,
R1), every `tool` definition carries these, owned here. Ranges live once in
the field-limits record `limits.tool`, owned here (Game Data & Tuning, R1),
and the catalog checks every tool against it:

| Field | Type | Range (`limits.tool`) | Meaning |
|---|---|---|---|
| `verb` | enum: `drill`, `repair` | (an enum) | Which system a use goes to: `drill` to Mining, `repair` to Building |
| `drill_tier` | int, unit `count` (as on ores, Economy R3) | 0 to 3, step 1 | Highest ore `drill_tier` this tool can mine (F1). 0 for every non-drill tool |
| `drill_power` | float, unit `level` (scale: 1 = the basic drill) | 0 to 6, step 0.1 | Toughness removed per second of drilling; Mining turns it into time per piece. 0 for every non-drill tool |

Two per-kind rules the data record cannot hold are checked by the Tools &
Gear CI test (Game Data & Tuning, R3): a `drill` tool has `drill_tier` ≥ 1
and `drill_power` ≥ 0.3; a `repair` tool has both at 0. The drill ladder check
(F2) also runs at catalog load. Display name, description, icon and the held
model are display data under the same id (Game Data & Tuning, R7).

**R3. The tool slots.** Each player has one tool container,
`carried.<playerId>.tools`: `tool_slots` slots (3), stack scale 1, accepts
`tool` only (Economy, R4). One tool per slot; the same tool may sit in two
slots (a spare drill). Tools never enter the pack (Pack, R1: it accepts ore,
material and item) and the tool slots never accept anything else. Every change
goes through Economy's container operations inside an accepted request
(Economy, R6; Session & Authority, R4).

**R4. Getting and moving tools.** A tool enters the slots in three ways:

1. **Crafted.** Crafting places the output in the first empty tool slot of the
   crafting player; if none is empty, Crafting's own rule decides (for
   example a stash beside the bench) and it must never destroy the tool.
2. **Moved at home.** In a stash panel, a tool moves between a stash (which
   accepts `tool`: Economy, R4) and the tool slots with Economy's `Move`.
   This is the only way to leave a tool at home.
3. **Restored from a save.** At load, `carried` refills the slots (Save &
   Load).

On a run, tools cannot be moved, dropped or swapped into the pack: there is no
place to put one. Taking a tool out of the game other than by death is not
possible in the MVP.

**R5. One equipped slot.** Exactly one slot index (0 to `tool_slots` − 1) is
*equipped* at any time. If that slot is empty, the player has **bare hands**:
Use Tool does nothing and no tool is drawn (Gathering and pick-up use
Interact, not Use Tool, so bare hands lose nothing). Selection:

- **Select Tool 1 / 2 / 3** (Input) equips that slot, empty or not.
- **Cycle Tool** (scroll wheel, Input) moves to the next or previous
  *non-empty* slot, wrapping; with no tools, it does nothing; with one tool,
  it re-selects that slot (no change).
- Pressing the key of the slot already equipped does nothing.

**R6. Equipping takes time.** A change of equipped tool starts the
**Equipping** state for `equip_time_s` (0.3 s, F3): the old tool lowers and
the new one rises. Use Tool cannot begin while Equipping; a Use Tool held
through the change begins the moment Equipping ends (it is not dropped). A
change while a use is in progress ends the use first (an *end* intent to the
verb's owner), then equips. Selecting bare hands also takes `equip_time_s`
(the tool lowers).

**R7. Automatic equips.** The game equips a tool for the player at two
moments, and only when no use is in progress:

- **Arriving on a run** (Run Flow's arrival): the drill with the highest
  `drill_tier` in the slots; ties go to the lower slot index. With no drill,
  the selection is unchanged.
- **Arriving home** (after extraction, a load, or a new game): the hammer if
  one is carried, else the lowest non-empty slot, else bare hands.

No other event changes the selection: crafting a tool, moving one at the
stash, or a tool appearing in an empty equipped slot does not re-select (a
tool moved into the equipped empty slot is simply drawn, after
`equip_time_s`). The equipped index is **not saved**; R7's home rule sets it
at every load, so the save format gains no field.

**R8. Using a tool.** Use Tool (Input: hold, or toggle by setting) on the
equipped tool, when the tool is **Ready**:

1. On press (or toggle on), Tools & Gear sends a *begin* intent to the verb's
   owner, carrying the tool id, its `drill_tier` and `drill_power`, and the
   player's view ray (Player Controller). On release (or toggle off, or R5 of
   Input releasing it), it sends the *end* intent.
2. The owner decides everything that follows: what is in reach, what the use
   does, and any refusal and its message. Mining refuses an ore whose
   `drill_tier` is above the tool's (F1) with **"Needs a better drill"**;
   Building decides what the hammer repairs (one repair action fixes the
   whole home: concept; art bible, Section 7, Repair).
3. A `repair` tool on a run, or a `drill` tool at home, has nothing to act on
   in the MVP: the owner refuses with no effect, and the hand animation plays
   a short empty swing so the press is not silent.

**R9. When tools cannot be used.** Use Tool is not live, and a use in progress
ends, while: the player is sprinting (Player Controller's sprinting flag; the
hands are lowered); a panel is open (Input, R4: Look and tools stop, including
the Run Pack panel); the session is Frozen (Session & Authority, R3); or the
player is dead. A Use Tool held through any of these does not resume by
itself: Input's latch (its R5) requires a fresh press.

**R10. Death and abandoned runs.** On death, Run Flow empties the tool slots
with Economy's `Clear(death)` together with the pack (Economy, R8): every
carried tool is lost, the hammer included if it was taken. An abandoned run
(quit or crash) loses them the same way at the next start, because the run
marker lists everything carried at launch (ADR-0003, Decision 3). Tools left
in a stash are never at risk. After a death the player arrives home with bare
hands and rebuilds the basic drill from valley materials (concept, Recovery
from failure; Home Valley, F3).

**R11. Launch shows the tools.** Before a run launches, the launch prompt
(Run Flow) lists every carried tool by name, the hammer included, beside the
pack's worth and at risk. A hammer or basic drill adds 0 to at risk (their
inputs are worth 0), so the list is the only place a hammer on a run is
visible; it must be shown (Pillar 2: the risk is readable). Launching with
no drill is allowed (risk is a choice) and the prompt says **"No drill"**.

**R12. Gear is reserved.** `gear` is a holdable kind in the catalog (Game Data
& Tuning, R2) owned here, with no definitions in the MVP and no gear slot. Its
fields, slots and effects are designed with Tier 1a's gear tiers (concept,
Scope Tiers). Until then the catalog accepts zero `gear` definitions, and a
stash's `accepts` list keeps `gear` so no container contract changes later
(Economy, R4).

### States and Transitions

Per player, the *held tool* is in one of these states:

| State | Meaning | Use Tool | Drawn |
|---|---|---|---|
| **Bare hands** | Equipped slot is empty | Does nothing | Hands only |
| **Equipping** | A change is under way (`equip_time_s`) | Cannot begin; a held press waits | Old tool lowering, new one rising |
| **Ready** | A tool is in hand, nothing stops its use | Live | Tool raised |
| **Using** | A begin intent was sent and no end yet | Held | Tool working (owner's animation) |
| **Stowed** | R9 applies: sprinting, panel open, Frozen or dead | Not live | Tool lowered (sprint) or hidden (panel, Frozen, dead) |

| From | To | Trigger | Notes |
|---|---|---|---|
| Any | Equipping | Selection changes (R5, R7) | From Using, the end intent is sent first (R6) |
| Equipping | Ready | `equip_time_s` passes and the slot holds a tool | A held Use Tool then begins at once (R6) |
| Equipping | Bare hands | `equip_time_s` passes and the slot is empty | |
| Ready | Using | Use Tool pressed (or toggled on) | Begin intent to the verb's owner (R8) |
| Using | Ready | Use Tool released (or toggled off) | End intent |
| Ready, Using, Equipping | Stowed | R9 applies | Using sends its end intent; Equipping finishes its timer while Stowed |
| Stowed | Ready / Bare hands | R9 stops applying | Never back to Using: a fresh press is needed (Input's latch) |
| Any | Bare hands | Death clears the slots (R10) | No end intent is needed: the run is over |
| Bare hands | Equipping | A tool arrives in the equipped empty slot (R4) | Drawn after `equip_time_s`; no selection change |

There is no Broken or Worn state: tools have no durability (Economy, R5).

### Interactions with Other Systems

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Game Data & Tuning (1) | In | `tool` and `gear` definitions; `limits.tool`; `tuning.tools_and_gear` | This doc owns the fields and values; GDT owns ids, loading and validation |
| Ore & Item Economy (4) | In | The four holdable fields; the container contract and operations (R4, R6); replacement worth for at risk (R9); the death sink (R8) | Economy |
| Session & Authority (2) | In | Requests for select, use begin and end; the Frozen flag | Session & Authority |
| Input (3) | In | Use Tool, Select Tool 1 to 3, Cycle Tool; contexts and the latch (R4, R5) | Input owns the actions; this doc decides what select and cycle do |
| Player Controller (6) | In | The view ray (passed on in begin intents); the sprinting flag (R9); hand sway and lowering | Player Controller |
| Save & Load (7) | Both | The tool slots in `carried`, at home only | Save & Load writes; this doc owns the contents |
| Mining (21) | Out | Begin and end intents for `drill` tools, with `drill_tier` and `drill_power`; the gate F1 | Mining owns reach, drilling time and the refusal message |
| Building (11) | Out | Begin and end intents for `repair` tools | Building owns what the hammer repairs and its cost |
| Crafting (13) | Out | Tool slots as a craft's output target | Crafting owns recipes and where an output goes when the slots are full |
| Stash (12) | Out | Tool slots beside the stash for `Move` | Stash owns the panel |
| Run Flow (22) | Out | The tools listed at launch (R11); `Clear(death)` of the slots (R10); arrival moment for R7 | Run Flow |
| Run HUD (24), Home HUD & Panels (15) | Out | Slot contents, equipped index, state | The HUDs own the look |
| Visual Feedback & Lighting (25) | Out | Held-tool state for hands and model | Presentation |
| Ship & Destination Map (30), Melee Combat & Bosses (34) | Out (later) | Drill tiers as gates for destinations; weapons as a later verb | Their design docs |

## Formulas

**Systems-designer lens applied** (`lens-systems-designer.md`, in-session):
every variable put at its minimum, its maximum and 0. No feedback loop: tools
do not improve with use, and the only loop they join is Economy's (better
drill → tier 3 ore → teal → re-make the drill after a death), which death
damps. Replacement worth and at risk are Economy's (R9, F5) and are not
restated. How long a piece takes to drill is Mining's formula; F2 assumes it
is `toughness / drill_power`, as Economy's R3 defines toughness ("drilling
time per piece with a drill of power 1").

### F1. Drill gate

The `drill_gate` formula is defined as:

`can_mine = (verb = drill) AND (drill_tier_tool ≥ drill_tier_ore)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| verb | enum | `drill`, `repair` | data file (tool definition) | The tool's verb (R2) |
| drill_tier_tool | int, `count` | 0 to 3 | data file (tool definition) | Highest ore tier the tool opens |
| drill_tier_ore | int, `count` | 1 to 3 | data file (ore definition, Economy R3) | Lowest drill tier that can mine the ore |
| can_mine | bool | true / false | calculated | Whether Mining may start on this ore with this tool |

**Output Range:** true or false. Mining applies it at every begin intent and
refuses with "Needs a better drill" when false for a `drill` tool.
**Boundaries:** a non-drill tool (tier 0) is always false; the ore range
starts at 1, so no ore is mineable by bare hands or the hammer. A drill of
tier 3 opens every ore in the limits.
**Example:** basic drill (tier 1) on `ore.sunstone` (tier 2): 1 ≥ 2 is false,
refused. Better drill (tier 2) on it: true.

### F2. Drill ladder check (design check)

The `drill_ladder_check` formula is defined as:

`ladder_ratio_n = min_power(tier n + 1) / max_power(tier n)` for each pair of consecutive drill tiers present, and
`slowest_piece_s = max over ores o ( toughness_o / min_power(drills with drill_tier ≥ drill_tier_o) )`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| min_power(tier), max_power(tier) | float, `level` | 0.3 to 6 | data file (drill definitions) | Lowest and highest `drill_power` among drills of that tier |
| toughness_o | float, `s` | 0.5 to 20 | data file (ore definition, Economy R3) | Drilling time per piece at power 1 |
| min_power(drills with drill_tier ≥ drill_tier_o) | float, `level` | 0.3 to 6 | calculated | The weakest drill able to mine ore o |
| min_ladder_ratio | float | 1.1 to 4 | data file (`tuning.tools_and_gear`) | Smallest speed step a new drill tier must give (1.5) |
| max_piece_s | float, `s` | 2 to 15 | data file (`tuning.tools_and_gear`) | Longest acceptable time per piece at the weakest able drill (6.0) |
| ladder_ratio_n | float | 0.05 to 20 | calculated | How much faster the next tier is |
| slowest_piece_s | float, `s` | 0.08 to 67 | calculated | The slowest piece in the game at the weakest drill that can mine it |

**Output Range:** with MVP values `ladder_ratio_1` = 2.0 / 1.0 = **2.0**, and
`slowest_piece_s` = **3.5 s** (gild and verdite, 3.5 / 1.0; sunstone and
tidestone give 6.0 / 2.0 = 3.0 s). A catalog-load validation warning (not a
refusal) is raised when any `ladder_ratio_n` is below `min_ladder_ratio` (the
next drill does not feel better), when `slowest_piece_s` is above
`max_piece_s` (a seam drags on the run clock), or when an ore has no drill
able to mine it (reported by id as *unmineable*; allowed, since a later tier
may add the drill).
**Boundaries:** `drill_power` is at least 0.3 for any drill (R2's CI rule),
so no division by zero. With one drill tier only, no ratio exists and only
`slowest_piece_s` is checked.
**Example:** a designer lowers the better drill to power 1.4: ratio 1.4 < 1.5
→ warning "Better drill only 1.4× faster"; sunstone then takes 6.0 / 1.4 =
4.3 s, still under 6.0.

### F3. Equip timing

The `equip_ready` formula is defined as:

`ready_tick = change_tick + ceil(equip_time_s × tick_rate_hz)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| change_tick | int, `count` | 0 and up | calculated | Simulation tick at which the selection changed |
| equip_time_s | float, `s` | 0.1 to 1.0 | data file (`tuning.tools_and_gear`) | Time to lower one tool and raise the next |
| tick_rate_hz | int, `hz` | 20 to 60 | data file (Session & Authority, `tick_rate_hz`) | Simulation ticks per second |
| ready_tick | int, `count` | change_tick + 2 and up | calculated | First tick at which Use Tool may begin |

**Output Range:** 9 ticks (0.3 s) with MVP values (0.3 × 30 = 9); 2 ticks at
the minimum (0.1 s at 20 Hz), 60 at the maximum (1.0 s at 60 Hz).
**Boundaries:** rounding up means the delay is never shorter than set. A new
selection before `ready_tick` restarts the count from its own tick (Edge
Cases).
**Example:** selection changes at tick 1,200: Use Tool may begin at tick
1,209; a press held since tick 1,203 begins at 1,209.

## Edge Cases

**Systems-designer lens applied** to Sections C and D as written; every case
found is included.

**Selecting**

- **If a select key is pressed while Equipping**: Equipping restarts toward
  the new slot, with a full `equip_time_s` from that press (F3). Spamming keys
  only delays the tool; there is no gain.
- **If Cycle Tool is used while Equipping**: it steps from the slot being
  equipped, not the old one, so two quick notches move two slots.
- **If the equipped slot is emptied** (the tool moved to a stash at home): the
  move happens with a panel open (Stowed); when the panel closes the player
  has bare hands. The selection does not jump to another tool.
- **If a tool is moved into the equipped empty slot**: it is drawn after
  `equip_time_s` (States: Bare hands → Equipping), with no change of
  selection.
- **If Use Tool is pressed with bare hands**: nothing happens and no message
  is shown; it is not a refusal.

**Using**

- **If the selection changes during a use** (a key, the scroll wheel): the end
  intent is sent first, then Equipping starts (R6). Mining keeps whatever
  progress rules it owns.
- **If Sprint starts during a use**: the use ends (R9); in toggle mode the
  toggle turns off, so stopping the sprint never restarts drilling by itself.
- **If the window loses focus during a use**: Input releases Use Tool (its
  R5), which sends the end intent.
- **If the hammer is used on a run, or a drill at home**: the owner refuses
  with no effect and the hands play a short empty swing (R8). No message; the
  hotbar already shows what is in hand.
- **If the basic drill is aimed at tier 3 ore**: Mining refuses with "Needs a
  better drill" (F1), shown once per press, never repeated every tick.

**Launching and dying**

- **If a run launches with no drill**: allowed; the launch prompt says "No
  drill" (R11). On arrival R7 leaves the selection unchanged. The player can
  still gather nothing and extract; risk is a choice.
- **If a run launches with only the hammer**: as above, and the hammer is
  listed at launch and lost if the player dies.
- **If two drills share the highest tier at arrival**: R7 equips the one in
  the lower slot index.
- **If the player dies during Equipping or a use**: the slots are cleared
  (R10); no end intent is sent because the run is over; the player arrives
  home with bare hands.
- **If the game is quit or crashes during a run**: the next start resolves an
  abandoned run, and the tools listed in the run marker are lost (ADR-0003,
  Decision 3); the notice lists them (Save & Load, R4).

**Storage and data**

- **If a craft makes a tool with all tool slots full**: Crafting's rule
  places it (for example in a stash) or refuses the craft with "No room"
  before spending anything; a tool is never destroyed (R4).
- **If a stash holding tools is lost in a storm** (unsheltered: Storms and
  Stash): the tools in it are lost with everything else in it. Tools have no
  special protection.
- **If a save names a tool id that no longer exists**: Save & Load removes it
  and shows its notice (Save & Load, R5); the slot is empty.
- **If a patch lowers `tool_slots` below the number filled**: the extra tools
  sit in overflow slots (Economy, Edge Cases); they cannot be selected or
  used, Cycle Tool skips them, and the stash panel lets the player move them
  into a stash. Nothing is deleted.
- **If a tool definition has `drill_power` 0 with verb `drill`**: the Tools &
  Gear CI test fails the build (R2); the catalog never loads it.

**Degenerate strategies checked**

- **Carrying two better drills**: no benefit (tools do not wear out) and
  twice the loss on death. Allowed.
- **Leaving the better drill at home and mining tier 1 and 2 only**: a real,
  safer choice; the gate (F1) keeps tier 3 out of reach.
- **Switch-cancelling to skip a wind-up**: no gain; a use cannot begin while
  Equipping, and Mining owns any drilling progress.
- **Storing every tool to protect it, then re-making a basic drill for each
  run**: allowed and intended; the basic drill costs only valley materials,
  which is the recovery guarantee working.

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Status |
|---|---|---|---|
| Game Data & Tuning (1) | Hard | `tool` and `gear` definitions, `limits.tool`, `tuning.tools_and_gear`; display data (R7) | Designed (Needs Revision) |
| Ore & Item Economy (4) | Hard | Holdable fields (R1), ore `drill_tier` and `toughness` (R3), container contract and operations (R4, R6), death sink (R8), replacement worth (R9) | Designed (Needs Revision) |
| Session & Authority (2) | Hard | Requests; the Frozen flag; `tick_rate_hz` | Designed (Needs Revision) |
| Input (3) | Hard | Use Tool, Select Tool 1 to 3, Cycle Tool; contexts; the latch | Designed (Needs Revision) |
| Save & Load (7) | Hard | The tool slots in `carried` at home | Designed |
| Player Controller (6) | Soft | View ray (passed on), sprinting flag, hand motion | Designed (being revised in another session) |

### Downstream (systems that depend on this one)

| System | Hard / soft | What it needs | Status |
|---|---|---|---|
| Mining (21) | Hard | Begin and end intents with `drill_tier`, `drill_power`; F1 | Not written: provisional |
| Building (11) | Hard | Begin and end intents for the hammer (`repair`) | Not written: provisional |
| Crafting (13) | Hard | The tool slots as an output target; tool ids for recipes | Not written: provisional |
| Run Flow (22) | Hard | Tools listed at launch (R11); `Clear(death)` on the slots (R10); arrival for R7 | Not written: provisional |
| Stash (12) | Hard | The tool slots beside the stash for `Move` | Not written: provisional |
| Run HUD (24), Home HUD & Panels (15) | Hard | Slot contents, equipped index, state | Not written: provisional |
| Save & Load (7) | Hard | Tool slots' contents | Designed: its R2 names Tools & Gear as an owner of `carried`, matching |
| Visual Feedback & Lighting (25) | Soft | Held-tool state | Not written: provisional |
| Ship & Destination Map (30), Melee Combat & Bosses (34) | Soft (later) | Drill tiers; a later weapon verb | Not written |

Bidirectional check: Game Data & Tuning's Interactions list "Tools & Gear |
Out | `tool`, `gear` definitions; `tuning.tools_and_gear` | Owner",
matching. Ore & Item Economy's R4 names Tools & Gear as owner of the carried
tool slots (3, scale 1, accepts `tool`), matching R3. Input names Tools & Gear
as owner of Select Tool and Cycle Tool, and Mining and Building as the users
of Use Tool, matching R8's routing. Save & Load's R2 lists Pack and Tools &
Gear as owners of `carried`, matching. The systems index lists only Game Data
& Tuning and Ore & Item Economy as Depends On; Session & Authority, Input and
Save & Load are missing (Open Questions, 4).

## Tuning Knobs

### This system's tuning set: `tuning.tools_and_gear`

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high | Rationale |
|---|---|---|---|---|---|---|---|---|---|---|
| `tool_slots` | int | 3 | 1 | 6 | 1 | count | restart | Cannot carry a drill and the hammer together | Number keys run out; the carry choice disappears | Economy's provisional value; keys 1 to 3 (Input) |
| `equip_time_s` | float | 0.3 | 0.1 | 1.0 | 0.05 | s | live | Swaps feel weightless and unreadable | Swapping feels sluggish; a creature lands a bite mid-swap | A visible lower-and-raise without slowing an escape |
| `min_ladder_ratio` | float | 1.5 | 1.1 | 4 | 0.1 | share | live | A new drill tier barely feels better | Every new tier must be huge; tuning room is gone | Validation only (F2); 2.0 passes with margin |
| `max_piece_s` | float | 6.0 | 2 | 15 | 0.5 | s | live | Warns on ordinary ores | Seams that eat the run clock pass silently | Validation only (F2); the toughest ore takes 6.0 s at power 1, so a drill tier that could mine it at power 1 would sit exactly at the limit |

**Constraint:** none between these keys. **Interacts:** `drill_power` on each
drill with every ore's `toughness` (Economy) and Mining's time formula (F2):
name both in any balance pass. `equip_time_s` with Creature AI's bite
wind-up (0.55 s): a swap must stay shorter than a wind-up so swapping is
never a death sentence.

### Knobs on definitions (Game Data & Tuning, R1)

| Field | On | Value | Range (`limits.tool`) | Rationale |
|---|---|---|---|---|
| `drill_power` | `tool.drill.basic` / `tool.drill.better` | 1.0 / 2.0 | 0 to 6, step 0.1 | Prototype (`drill_power`, `drill2_power`) |
| `drill_tier` | `tool.drill.basic` / `tool.drill.better` | 1 / 2 | 0 to 3 | Matches the ores' `drill_tier` (Economy, R2): tier 3 ore needs the better drill |

### Knobs owned elsewhere (pointed to, not duplicated)

| Knob | Owner | Used here in |
|---|---|---|
| `stack_max`, `worth` of tools | Ore & Item Economy | R1 |
| `toughness`, `drill_tier` of ores | Ore & Item Economy | F1, F2 |
| Tool recipes (`recipe.drill.*`, `recipe.hammer`) | Crafting | R1, R4 |
| `tick_rate_hz` | Session & Authority | F3 |
| `mine_range` | Mining | R8 |

## Visual/Audio Requirements

**Art-director lens applied** (`lens-specialists.md`, Visual/Audio row;
art bible Sections 1 to 5 read by heading). Category Progression makes this
section optional; it is written because the held tool is on screen for the
whole game.

**Art bible principles that apply**

- **Section 1, rule 1, "Loot owns saturation and gloss."** Tools are not loot:
  every tool is matte, in stone and wood tones. The better drill, made mainly
  from teal ore, carries a **desaturated teal trim**, never faceted or glossy,
  so ore stays the only vivid thing on screen.
- **Section 1, rule 2, "One hue means danger."** No tool uses magenta, and no
  tool effect (sparks, refusal) uses it.
- **Section 5, The player:** the player is "hands, the tool in them (the drill
  on a run, the hammer at home) and a helmet lamp"; R7's automatic equips put
  exactly that on screen at each arrival.
- **Section 5, Detail at distance:** hands and the held tool are hero assets
  (Section 8: Hero tier, 2K), always next to the camera.
- **Section 3, Shape Language:** valley-made tools read as lashed and rough
  (a rock head bound to a stick haft); the better drill reads as machined, with
  straight edges and cream fittings (cream is "ours", Section 4).

**Events and their feedback**

| Event | Visual | Audio | Owner |
|---|---|---|---|
| Equip (R6) | Old tool lowers out of view and the new one rises over `equip_time_s`; bare hands open | A short soft clack per tool type (wood knock for valley tools, metal latch for the better drill) | This doc (timing); Presentation |
| Using a drill | Mining's drilling animation and particles | Mining's drill sound; the better drill is pitched higher so the step is heard | Mining |
| Using the hammer at home | A raised swing; Building's repair panel and pieces snapping straight (art bible, Section 7, Repair) | A solid hammer knock | Building |
| Empty use (R8: hammer on a run, drill at home) | A short empty swing or a two-frame drill spin-up that stops | A dry click, quiet | This doc |
| Tier gate refusal (F1) | Drill bites, stalls, recoils slightly; no sparks of a new hue | A dull clunk | Mining (message), this doc (recoil) |
| Stowed while sprinting (R9) | Hands lower (Player Controller's `sprint_hand_lower_m`) | None | Player Controller |
| Tools lost on death | Death screen lists them in grey with the pack (art bible, Section 7) | None beyond the death sting | Run Flow |

📌 **Asset Spec**: Visual/Audio requirements are defined. After the art bible
is approved, run `/asset-spec system:tools-and-gear` for the hammer, the two
drills and their hotbar icons.

## Game Feel

- **Response.** A Use Tool press reaches the verb owner as a begin intent on
  the next simulation tick (at 30 Hz, within 34 ms), with the hand animation
  starting on the same rendered frame as the press (presentation does not
  wait for the tick).
- **Weight of a swap.** 0.3 s to change tools (F3): long enough to see and
  hear, shorter than a burrower's 0.55 s wind-up, so swapping to the drill
  while a creature closes is tense but never a death sentence.
- **The better drill must feel better.** Pieces break at twice the rate and the
  drill note is higher; a designer lowering its power below 1.5× gets a
  warning (F2). Playtest question: does the first tier 3 seam feel like a
  reward for the drill?
- **No dead presses.** Every Use Tool press with a tool in hand gives a
  response: a use, a refusal clunk, or an empty swing (R8). Bare hands are the
  one silent case, and the hotbar shows them.
- **Sprint versus tool.** Hands drop when sprinting and the tool cannot be
  used (R9): drilling or running is a visible either-or.

## UI Requirements

- **Hotbar.** Three slots, bottom centre, on the Run HUD and the Home HUD:
  each shows the tool's icon and its key number (1 to 3); an empty slot shows
  the number only. The equipped slot is marked by a thicker cream outline and
  a slight raise, never by colour alone (accessibility floor). While Equipping,
  the outline moves at once to the new slot.
- **Refusals.** "Needs a better drill" is Mining's message, shown near the
  crosshair once per press. Tools & Gear adds no message of its own; empty uses
  are silent apart from their sound (R8).
- **Launch prompt** (Run Flow): carried tools listed by name, the hammer
  included, and "No drill" when no drill is carried (R11).
- **Stash panel** (Stash, Home HUD & Panels): the three tool slots appear as a
  row beside the pack so tools can be moved with Economy's `Move`. Overflow
  tool slots (Edge Cases) appear after them, marked as overflow.
- **Death screen** (Run Flow): lost tools listed in grey with the pack.

📌 **UX Flag, Tools & Gear**: this system has UI requirements. In
Pre-Production, run `/ux-design` for the Run HUD and Home HUD hotbar and the
launch prompt **before** writing epics; stories should cite
`design/ux/[screen].md`, not this document.

## Cross-References

| Document | Section | What this doc relies on |
|---|---|---|
| `design/gdd/game-concept.md` | Recovery from failure; MVP scope; anti-pillars | Tools lost on death, the hammer only if taken; the drill and hammer are the only tools; no gear granted outside play |
| `design/game-brief.md` | Run loop | "A better drill opens harder rock deeper in"; death loses the pack and the tool |
| `design/gdd/ore-and-item-economy.md` | R1, R3, R4, R5, R6, R8, R9, R10, R11 | Holdable fields, ore `drill_tier` and `toughness`, the tool slot container (3, scale 1), no item state, operations, death sink, replacement worth, `per_death` recurrence |
| `design/gdd/game-data-and-tuning.md` | R1, R2, R3, R7; prototype table | `tool` and `gear` kinds owned here; limits records; owner CI tests; display data; `drill_power` 1 and `drill2_power` 2 |
| `design/gdd/input.md` | Action table; R4, R5 | Use Tool, Select Tool 1 to 3, Cycle Tool; tools stop in panels; release and latch |
| `design/gdd/session-and-authority.md` | R3, R4; `tick_rate_hz`; Open Questions 7 | Requests, Frozen, begin and end intents for held actions |
| `design/gdd/player-controller.md` | View ray; sprinting flag; hand motion | Passed on in begin intents; R9 |
| `design/gdd/save-and-load.md` | R2, R4, R5 | `carried` ownership; abandoned-run notice; removed ids |
| `design/gdd/pack.md` | R1 | The pack refuses tools |
| `design/gdd/home-valley.md` | F3; Open Questions 5 | Rebuild set includes a hammer and a basic drill; removing pieces must not need the hammer |
| `docs/architecture/adr-0003-home-and-storm-persistence.md` | Decision 3 | Carried items saved at home, listed in the run marker, lost on an abandoned run |
| `design/art/art-bible.md` | Sections 1, 3, 5, 7, 8 | Loot owns saturation; no magenta; hands and tool; repair panel; Hero tier |

## Acceptance Criteria

**QA lens applied** (`lens-qa-lead.md`, in-session) against Sections C, D and
E as written: every core rule and formula has a criterion; F1 to F3 are tested
at a boundary; criteria 12, 13, 15, 16 and 18 to 21 cross into dependencies.
Slots are named by their key, 1 to 3 (index 0 to 2 in R5).
*(Logic)* needs an automated test; *(Integration)* an integration test or
documented playtest; *(Visual)* and *(UI)* a retained screenshot.

1. **GIVEN** the MVP catalog, **WHEN** it loads, **THEN** `tool.hammer`,
   `tool.drill.basic` and `tool.drill.better` exist with verb, `drill_tier`
   and `drill_power` exactly as in R1, and each has `stack_max` 1 and worth 0.
   *(Logic)*
2. **GIVEN** a `drill` tool with `drill_power` 0, or a `repair` tool with
   `drill_tier` 1, **WHEN** the Tools & Gear CI test runs, **THEN** it fails
   naming the id. *(Logic)*
3. **GIVEN** a player's tool slots, **THEN** the container is
   `carried.<playerId>.tools` with 3 slots, scale 1; adding
   `material.rock` is refused with Can't go there, and adding `tool.hammer`
   to the pack is refused the same way. *(Logic)*
4. **GIVEN** slot 2 empty and slot 1 equipped with a drill, **WHEN** Select
   Tool 2 is pressed, **THEN** after 9 ticks the state is Bare hands and a Use
   Tool press sends no intent. *(Logic)*
5. **GIVEN** tools in slots 1 and 3 and slot 1 equipped, **WHEN** Cycle Tool
   moves one notch down, **THEN** slot 3 is equipped; one more notch equips
   slot 1. **GIVEN** no tools, **THEN** a notch changes nothing. *(Logic)*
6. **GIVEN** a selection change at tick 1,200 at 30 Hz with `equip_time_s`
   0.3, **WHEN** Use Tool has been held since tick 1,203, **THEN** the begin
   intent is sent at tick 1,209 and not before. **GIVEN** `equip_time_s` 0.1
   at 20 Hz, **THEN** the delay is 2 ticks. *(Logic)*
7. **GIVEN** Equipping toward slot 2 started at tick 100, **WHEN** Select Tool
   3 is pressed at tick 105, **THEN** slot 3 becomes Ready at tick 114. *(Logic)*
8. **GIVEN** a drill in use, **WHEN** Select Tool 1 is pressed, **THEN** the
   end intent is sent before Equipping begins, in the same tick. *(Logic)*
9. **GIVEN** slots [hammer, basic drill, better drill] with slot 1 equipped,
   **WHEN** the player arrives on a run, **THEN** slot 3 is equipped. **GIVEN**
   two better drills in slots 1 and 3, **THEN** slot 1. **GIVEN** no drill,
   **THEN** the selection is unchanged. *(Logic)*
10. **GIVEN** the player arrives home with a hammer in slot 2, **THEN** slot 2
    is equipped; with no hammer and a drill in slot 3 only, slot 3; with no
    tools, Bare hands. *(Logic)*
11. **GIVEN** the equipped slot is empty, **WHEN** Crafting places a tool in
    it, **THEN** the tool is Ready 9 ticks later and the equipped index has
    not changed; **WHEN** a tool is crafted into a different empty slot,
    **THEN** the selection does not change. *(Logic)*
12. **GIVEN** a save written with slots [basic drill, hammer] and slot 1
    equipped, **WHEN** it is loaded, **THEN** slot 2 (the hammer) is equipped
    and the save file holds no equipped-slot field. *(Integration with Save &
    Load)*
13. **GIVEN** the better drill Ready on a run, **WHEN** Use Tool is pressed,
    **THEN** Mining receives one begin intent carrying `tool.drill.better`,
    `drill_tier` 2, `drill_power` 2.0 and the view ray, and one end intent on
    release. *(Integration with Mining)*
14. **GIVEN** F1, **THEN** basic drill on `ore.sunstone` is false, better drill
    on it is true, the hammer on `ore.ochre` is false, and a tier 3 drill on a
    tier 3 ore is true. *(Logic)*
15. **GIVEN** the basic drill aimed at a sunstone seam, **WHEN** Use Tool is
    held for 2 s, **THEN** "Needs a better drill" is shown once and no piece
    breaks. *(Integration with Mining)*
16. **GIVEN** the hammer Ready at home with damaged pieces, **WHEN** Use Tool
    is pressed, **THEN** Building receives the begin intent and opens its
    repair panel. *(Integration with Building)*
17. **GIVEN** the hammer equipped on a run, **WHEN** Use Tool is pressed,
    **THEN** nothing in the world changes, the empty swing plays and no
    message is shown. *(Visual)*
18. **GIVEN** a drill in use, **WHEN** Sprint starts, **THEN** the end intent
    is sent and Use Tool is not live; **WHEN** Sprint stops with Use Tool still
    held, **THEN** no begin intent is sent until Use Tool is pressed again; in
    toggle mode the toggle is off. *(Integration with Player Controller and
    Input)*
19. **GIVEN** a drill in use on a run, **WHEN** the Run Pack panel opens,
    **THEN** the end intent is sent and the tool is hidden until the panel
    closes. *(Integration with Input and Pack)*
20. **GIVEN** a run with the better drill and the hammer carried, **WHEN** the
    player dies, **THEN** the tool slots are empty at home, the state is Bare
    hands, and before death the at-risk readout included the better drill's
    replacement worth. *(Integration with Run Flow and Economy)*
21. **GIVEN** a run launched with a basic drill, **WHEN** the game is killed
    and restarted, **THEN** the abandoned-run notice lists the basic drill and
    the tool slots are empty. *(Integration with Save & Load)*
22. **GIVEN** a launch with the hammer and no drill, **WHEN** the launch
    prompt shows, **THEN** it lists "Hammer" and "No drill". *(UI)*
23. **GIVEN** MVP values, **WHEN** the catalog loads, **THEN** F2 reports
    ladder ratio 2.0 and slowest piece 3.5 s with no warning; **GIVEN** the
    better drill at power 1.4, **THEN** a ladder warning names it; **GIVEN** an
    ore with `drill_tier` 3 and no tier 3 drill, **THEN** it is reported
    unmineable and the catalog still loads. *(Logic)*
24. **GIVEN** a save with 3 tools and `tool_slots` patched to 2, **WHEN** it
    loads, **THEN** the third tool is in an overflow slot, cannot be selected,
    Cycle Tool skips it, and it can be moved to a stash; nothing is deleted.
    *(Logic)*
25. **GIVEN** the hotbar on the Run HUD, **WHEN** slot 2 is equipped and slot 3
    is empty, **THEN** slot 2 has the thicker outline and raise, and slot 3
    shows only "3". *(UI)*
26. **GIVEN** 10,000 ticks of selecting and cycling in a built player, **THEN**
    the selection logic makes no managed allocation per tick in steady state.
    *(Logic, performance)*

## Open Questions

| # | Question | Owner | Target |
|---|---|---|---|
| 1 | Where a crafted tool goes when the crafting player's tool slots are full (a stash beside the bench, or the craft refused before spending). R4 requires only that it is never destroyed. | Crafting | Crafting design doc |
| 2 | The better drill's recipe cost should land in Economy's "lost drill" band of 0.5 to 1.0 runs (Economy, F4). The prototype's 8, 5 and 2 pieces need mapping to the new ores, mainly teal. | Crafting, with Ore & Item Economy | Crafting design doc; `/balance-check` |
| 3 | Run Flow's launch prompt must list carried tools and say "No drill" (R11); the death screen lists lost tools. | Run Flow; ux-designer | Run Flow design doc; `/ux-design` |
| 4 | The systems index's Depends On for Tools & Gear lists Game Data & Tuning and Ore & Item Economy only; Session & Authority, Input and Save & Load are hard dependencies too. | `/map-systems` (producer) | Next systems-index update |
| 5 | Player Controller should confirm that tools are stowed while the sprinting flag is on (R9) and that the flag is readable by this system. | Player Controller revision | Its revision, in progress |
| 6 | F2 assumes Mining's drilling time is `toughness / drill_power`. If Mining defines it otherwise, F2 must read Mining's formula. | Mining | Mining design doc |
| 7 | Gear for Tier 1a: fields, slots, a suit's oxygen, pack size upgrades (Pack, Open Questions 3). | Designer | Tier 1a planning |
| 8 | Should the better drill be louder (more noise per second), making speed a noise trade? Out of the MVP unless the first playtest finds the better drill strictly dominant. | Perception, Mining; designer | First Milestone B playtest |
| 9 | Drilling a creature stuns it in the prototype (`stun_drill_time` 0.45 s). The drill's begin intent goes to Mining; Mining and Creature AI must agree who handles a creature in the ray. | Mining, Creature AI | Their design docs |
| 10 | Removing a built piece must not need the hammer (Home Valley, Open Questions 5); the hammer's verb stays `repair`. | Building | Building design doc |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

Taken under the designer's standing approval, each the recommended option, each
logged. The designer reviews them at the first playable.

1. Player Fantasy: "The right tool in my hand", with "Everything I carry can be
   lost" as the decision it creates.
2. Three MVP tools (hammer, basic drill, better drill) with the prototype's
   drill powers 1 and 2.
3. Three tool slots, Economy's provisional value, keys 1 to 3.
4. An empty equipped slot is bare hands; Cycle Tool skips empty slots, number
   keys do not.
5. Equipping takes 0.3 s, shorter than the burrower's wind-up.
6. The best drill is equipped automatically on arriving on a run; the hammer on
   arriving home.
7. The equipped slot is not saved, so the save format gains no field.
8. The hammer may go on a run and is listed at launch; launching with no drill
   is allowed and shown.
9. Tools cannot be used while sprinting.
10. No durability: death is the only tool sink (Economy, R5).
11. Gear is a reserved kind with no MVP definitions.
12. The drill ladder check (F2) warns and never refuses.
13. Drilling time stays Mining's formula; this doc owns tier, power and the
    gate.
