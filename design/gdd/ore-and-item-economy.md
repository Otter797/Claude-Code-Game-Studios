# Ore & Item Economy

> **Status**: In Design
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 4 (Three trades, one fortune), Pillar 5 (Home is the scoreboard)
> **Creative Director Review (CD-GDD-ALIGN)**: REVISED 2026-11-28 — run in-session as a checklist (no agent spawned). CONCERNS found: Pillar 4 served only by the fantasy text with no rule (R2 now requires every family to be shared by at least two trades); the recurring-cost band in F4 could soften Pillar 3's sting (now named in Open Question 8). Pillars 1, 2, 3 and 5 and the anti-pillars are otherwise served by rules in R2, R6, R8, R9 and R10. Not re-run after revision.

## Summary

Ore & Item Economy defines everything the player can carry, store and spend:
six ores in two families (amber builds the home, teal makes the tools) and
three tiers whose worth is read from colour, the valley's rock and stick, and
the oxygen canister. It also sets the one container rule that the pack, every
stash and the carried tools all follow, so nothing is ever duplicated or lost
by accident. It exists so a seam's worth can be priced at a glance, a full
pack forces a real choice, and the haul ends up as visible home rather than as
a number. There is no money in the MVP.

> **Quick reference** — Layer: `Core` · Priority: `MVP` · Key deps: `Game Data & Tuning, Session & Authority`

## Overview

Ore & Item Economy defines **what the player can pick up, carry, store and
spend**, and the one set of rules every container in the game follows. It
owns three things. First, the *materials*: the six ores mined on runs (two
families, amber and teal, of three tiers each), the two valley materials (rock
and stick), and the few other items that sit in a container, such as the oxygen
canister. Each has a definition in game data with its worth, how many fit in
one slot, and the fields Mining needs. Second, the *item-container contract*:
a container is a fixed number of slots, each holding a stack of one kind of
thing; adding, taking, moving and clearing work the same way in the pack, in
every stash and in what the player carries, so an item can never be copied or
silently destroyed between them (ADR-0003, Decision 3, names this system as the
contract's owner). Third, the *economy's shape*: where materials come from (the
faucets: gathering in the valley, mining on runs) and where they go (the sinks:
crafting, building, repair, canisters used up, and what is lost on death or to
a storm), with a pacing check that prices every recipe and piece in runs.

The player meets this system directly, without ever seeing it named. It is why
a seam's worth can be read at a glance (the tier is the saturation, the family
is the hue), why the pack fills and a better seam has no room, why a full pack
of top-tier ore is worth a long walk back, and why the haul turns into stronger
walls with amber trim at home rather than into a number. Without it, every
system that holds or spends anything (Pack, Gathering, Building, Stash,
Crafting, Mining, Run Flow, Storms) would invent its own idea of an item, and
the first co-op duplication bug would be designed in. There is **no money in
the MVP**: worth is a readout of what a haul is worth, not a currency, until
Market & Trading (Full Vision) gives it a price.

## Player Fantasy

**Framing: both.** The player engages with this system directly (reading ore,
choosing what to carry, unpacking) and indirectly through the rules beneath
(stacks, slots, nothing duplicated or lost by accident).

**Creative-director lens: three candidate framings considered.**

1. **"I can read a fortune at a glance."** *Moment:* deep in the asteroid, the
   helmet lamp catches a cluster of fully saturated amber facets in a crack,
   and the player knows before drilling that this one seam outweighs half the
   pack. *Pillar:* "The haul is the heartbeat... Every system exists to make
   loot more desirable or getting it home more tense." *Asks of the design:*
   worth must be legible from colour and shape alone, consistently, on every
   ore; the gap between tiers must be big enough to change a decision.
2. **"Every piece of my home came back in my pack."** *Moment:* at home, the
   player builds a wall whose amber trim is the ore they nearly died carrying,
   next to the rock-and-stick shelter it replaces. *Pillar:* "Home is the
   scoreboard: Wealth is something you see and walk through, not a number."
   *Asks of the design:* ore must have a visible use at home, each family a
   distinct one, and the economy must not reduce to a currency counter.
3. **"What I carry is what I stand to lose."** *Moment:* the pack is full, a
   better seam glitters ahead, and dropping two cheap pieces to take it is a
   real trade. *Pillar:* "Bright world, real stakes... Debating softening a loss
   to match the art or keeping the sting, this pillar picks the sting."
   *Asks of the design:* slots must be scarce in the pack, every slot must hold
   a known worth, and the loss on death must be exactly what was carried.

**Chosen (autonomous, recommended): framing 1 as the headline, with 2 as the
payoff and 3 as the cost.** The three are one arc, and this system is the only
one that spans all of it:

> **The scavenger's eye.** You can read a fortune at a glance: the deeper the
> colour, the richer the ore; amber or teal tells you what it will build. Every
> slot in your pack is a choice you can price on sight, every piece you carry
> home becomes something you can stand inside, and everything you are carrying
> is exactly what you stand to lose.

Reference feel: the instant value read of loot rarity colours in extraction
games (Escape from Tarkov's "is this worth a slot?" moment), and Astroneer's
resources that become the base you walk around in. What creates the feeling is
the same in both: a value judgement made in under a second, then a decision
that costs something.

**What this fantasy is not.** Not a spreadsheet: the player never needs a
number to know which ore is better (the pack worth readout confirms, it does
not inform). Not a currency fantasy: in the MVP nothing is bought, and wealth
is shown by the home, the stash and the pack glow (Pillar 5).

## Detailed Design

### Core Rules

**Specialist lenses applied before drafting** (routing row Economy, loot,
crafting): `economy-designer` (primary), `systems-designer` and
`game-designer` (supporting).

- **economy-designer.** Every faucet needs a sink. MVP faucets: gathering (rock,
  stick; endless and slow, by the concept's rule that the valley can never be
  used up) and mining (ore; only on runs). Sinks found: building pieces,
  repair, crafting tools and canisters, canisters used up on runs, drills and
  carried items lost on death, unsheltered stash contents lost to storms.
  *Warning (carried from the concept review):* none of these is a lasting ore
  sink once the home is fully built in run materials and spare drills sit in
  the stash; the MVP has a ceiling. *Warning:* the art bible leaves open
  whether teal is worth more than amber; if the two families are worth the
  same and are used for the same things, one of them is decoration.
- **systems-designer.** One container rule, used everywhere, or duplication
  bugs follow. Integer counts only, no fractions of an item. Every operation is
  all-or-nothing or says exactly how much moved; an add never destroys what
  does not fit. Items must be interchangeable (no per-item state) or the save
  and the stack rule both get harder. *Warning:* one stack size everywhere
  means either the pack holds far more ore than the retested 16 pieces, or the
  stash fills after three runs.
- **game-designer.** The retested tension depends on 16 ore pieces filling the
  pack; keep "one piece, one slot" in the pack. The player's decision at a seam
  is worth against room and risk; the decision at home is which family to
  spend on what. Players must not be able to sort, split or juggle their way
  out of a full pack. A choice between families is only interesting if each
  builds something the other cannot.

**Where they pulled apart, and what was chosen** (autonomous, recommended
options; listed again under Open Questions):

1. *Stack size, pack versus stash* (game-designer against systems-designer).
   Options: one stack size everywhere (simple; breaks the pack's tension or
   floods the stash); per-container stack scale (one rule, one multiplier per
   container). **Chosen: per-container stack scale** (R4). The pack keeps
   "one ore piece, one slot"; a stash slot holds ten.
2. *Teal's worth* (art bible open question). Options: equal worth per tier,
   families differ by use; teal rarer and worth more; one family only in the
   MVP. **Chosen: equal worth per tier, families differ by use** (R2). Hue
   then names the use and saturation names the worth, as the art bible's table
   already assumes, and the player has a reason to want both.
3. *The lasting ore sink* (economy-designer warning). Options: accept an MVP
   ceiling with recurring sinks and a pacing target, and let Tier 1a's gear
   tiers add the lasting sink; add an ore upkeep cost at home; add a
   display-only sink. **Chosen: accept the ceiling, with recurring sinks and a
   pacing target** (R10, formula F4). An upkeep cost would break the
   anti-pillar ("nothing comes due"); a display-only sink is a scoreboard that
   is a number (Pillar 5). The designer reviews this at the first playable.

---

**R1. Holdable things.** A *holdable* is a definition that can sit in a
container. Holdable kinds are `ore`, `material`, `item`, `tool` and `gear`
(the kinds of Game Data & Tuning, R2). No other kind is ever in a container:
pieces, recipes, creatures, storms, gatherables and zones are not things a
player holds. A built piece's materials are spent when it is placed, not held
by the piece.

Every holdable definition carries these fields, defined here and validated
by Game Data & Tuning (R9) like any other numeric field:

| Field | Type | Range | Meaning |
|---|---|---|---|
| `stack_max` | int, `count` | 1 to 999 | How many fit in one slot of a container with stack scale 1 (R4) |
| `worth` | int, `credits` | 0 to 100,000 | What one unit is worth as haul. Shown to the player as "worth", never as money (R9) |
| `family` | id-like name or `none` | `amber`, `teal`, `none` | The ore family (R2); `none` for everything that is not ore or made mainly from one family |
| `tier` | int, `count` | 0 to 3 | 0 for valley materials and anything without a tier; 1 to 3 for ore |

Ore definitions also carry the fields Mining reads (R3). Tool and gear
definitions carry these four fields plus whatever Tools & Gear defines; this
document owns only the four. Display name, description and icon are display
data under the same id (Game Data & Tuning, R7); the Simulation never reads
them.

**R2. The ores: two families, three tiers.** The MVP has six ores. *Hue names
the family; saturation names the tier* (art bible, Section 4: "Hue names the
family, saturation names the tier").

| Id | Family | Tier | Art bible colour | Worth | Toughness | Drill tier needed |
|---|---|---|---|---|---|---|
| `ore.ochre` | amber | 1 | `#D9B46C` | 10 | 2.0 | 1 (basic) |
| `ore.gild` | amber | 2 | `#F2BC49` | 35 | 3.5 | 1 (basic) |
| `ore.sunstone` | amber | 3 | `#FFAE00` | 120 | 6.0 | 2 (better) |
| `ore.seaglass` | teal | 1 | `#61C2B5` | 10 | 2.0 | 1 (basic) |
| `ore.verdite` | teal | 2 | `#3AC2B0` | 35 | 3.5 | 1 (basic) |
| `ore.tidestone` | teal | 3 | `#00C2A8` | 120 | 6.0 | 2 (better) |

- **Names are provisional** and replace the prototype's four (Glint, Ember,
  Verdite, Sunstone); two prototype names are kept where they fit the new
  colours. The ids are fixed once released (Game Data & Tuning, R2).
- **Worth per tier is the same in both families**, from formula F1. Values are
  provisional until the run's pacing is played in Unity.
- **The families differ by use, not worth.** *Amber is structural*: the run
  materials Building uses for stronger pieces and for repairing them. *Teal is
  technical*: the run materials Crafting uses for tools, canisters and
  workbenches. Building and Crafting set the actual costs; this rule is what
  they must respect (R10's coverage check enforces that each family has a
  recurring use). A cost may mix families; its *main* family must match its
  use.
- **The families are shared by every trade** (Pillar 4: "Debating a material
  only one trade uses or one that links two, this pillar picks the link").
  Later trades (heists, planets) add new ores, tiers or goods *inside* the
  amber and teal families, or a new family that at least two trades produce;
  never a family only one trade can supply. A material that only one trade
  yields must be the input of something another trade's player wants.
- **Tier 3 needs the better drill.** The ore's `drill_tier` field says the
  lowest drill tier that can mine it; Mining refuses lower ones and Tools &
  Gear defines drill tiers.
- Which ores appear where on the asteroid, and how many, belongs to Asteroid
  World; how a seam turns into pieces belongs to Mining.

**R3. Ore fields Mining reads.** Each ore definition also carries:

| Field | Type | Range | Meaning |
|---|---|---|---|
| `toughness` | float, `level` | 0.5 to 20 | Drilling work per piece: seconds per piece with a drill of power 1. Mining owns the formula that turns it into time; this system owns the per-ore value (Game Data & Tuning, R1: one thing's numbers live on its definition) |
| `drill_tier` | int, `count` | 1 to 3 | Lowest drill tier that can mine it |

Toughness follows the prototype's curve (2.0, 3.0, 4.4, 6.0 seconds for four
tiers), refitted to three tiers so the top tier keeps its 6-second cost at
the basic drill's power and halves with the better drill. Provisional.

**R4. Containers.** A *container* is a fixed, ordered list of slots. It is
described by:

| Property | Type | Set by | Meaning |
|---|---|---|---|
| `slots` | int, 1 to 200 | The owning system (Pack, Stash, Tools & Gear for carried tool slots) | Number of slots |
| `stack_scale` | int, 1 to 100 | The owning system | Multiplies every item's `stack_max` in this container |
| `accepts` | set of holdable kinds | The owning system | Which kinds may enter (a tool slot accepts only `tool`) |

A slot is either **empty** or holds **one holdable id and a count** from 1 to
that slot's *stack cap*, `stack_max × stack_scale` (formula F2). Every slot of
a container has the same scale. Containers in the MVP and their values (each
set by its owning design doc; the values here are provisional starting
points):

| Container | Owner | `slots` | `stack_scale` | Accepts | Effect |
|---|---|---|---|---|---|
| The pack | Pack | 16 (prototype `pack_slots`) | 1 | ore, material, item | One ore piece per slot, as retested |
| A stash | Stash | 24 | 10 | ore, material, item, tool, gear | A slot holds 10 ore of one kind |
| Carried tools | Tools & Gear | 3 (keys 1 to 3, Input) | 1 | tool | One tool per slot |

**R5. Items are interchangeable.** Every unit of a holdable is the same as
every other unit of that id. Nothing a player holds carries its own state in
the MVP: no durability, no quality, no owner, no stored charge. A slot is
fully described by an id and a count, and a container by its list of slots.
This keeps the save small and makes duplication checks a matter of counting.
Per-item state (for example tool durability) would need a new slot shape and a
save migration; it is out of scope (Open Questions).

**R6. The container operations.** Every change to any container goes through
one of these operations, called only by the owning system's rules inside an
accepted request (Session & Authority, R4). All counts are whole numbers of 1
or more; a count of 0 or less, or an id the catalog does not know, is
**Malformed** and never reaches the operation (Session & Authority, R5).

| Operation | Effect | All-or-nothing? |
|---|---|---|
| `Add(id, n)` | Puts up to `n` units in: first tops up slots already holding `id`, in slot order, then fills empty slots in slot order. Returns the number placed, `p` (formula F3). The `n − p` units that did not fit stay wherever they came from: an add never destroys anything | No: returns `p`, which may be less than `n` |
| `AddAll(id, n)` | As `Add`, but only if all `n` fit; otherwise changes nothing | Yes |
| `Take(id, n)` | Removes `n` units of `id`, from the last matching slot backwards; a slot that reaches 0 becomes empty | Yes: refused with **Not enough** if fewer than `n` are present |
| `Move(from, slot, to, n)` | Takes up to `n` units from one slot of `from` and `Add`s them to `to`; whatever does not fit stays in the source slot | No: returns the number moved |
| `TakeCost(cost, sources)` | Takes a whole *cost* (a list of id and count pairs) from an ordered list of containers, drawing each id from the first container first | Yes: refused with **Not enough** naming the first missing id if the sources together hold too little of any id |
| `Clear(container)` | Empties every slot and returns what was removed | Yes |
| `Remove(container)` | Deletes an empty container | Yes: refused with **Not empty** otherwise |

- *Moves are the only way between containers.* There is no "drop into the
  void": discarding an item is its own request owned by the system that
  allows it (Pack's drop puts it into the world on a run; at home, Stash or
  Pack decide). Anything that leaves a container either enters another one,
  enters the world, or is consumed by a named sink (R10).
- *One step.* An operation and every container it touches change inside one
  Simulation step, and the whole result lands in one snapshot (ADR-0003,
  Decision 3), so a crash can never leave a unit in two places or none.
- *Slot order is stable.* Operations never reorder slots; there is no
  automatic sort. A player-facing sort or split, if wanted, is a separate
  request owned by Pack or Stash and built from `Move`.
- **Refusal reasons owned here** (a closed list, added to Session & Authority's
  own): **No room** (an `AddAll` that does not fit, or a `Move` whose target
  has no room for any unit), **Not enough [item]** (a `Take` or `TakeCost`
  short of units, or a `Move` whose source slot is empty or holds a different
  id from the one requested), **Not empty**, **Can't go there** (the target
  does not accept that kind).

**R7. Conservation.** Outside the named faucets (R10), no operation creates a
unit; outside the named sinks, no operation destroys one. For every operation,
the total count of each id across all containers, the world and the sinks is
the same before and after. This is the rule every acceptance test of this
document counts against.

**R8. Carried versus stored.** What the player holds is *carried*: the pack and
the carried tool slots (ADR-0003, Decision 3: "every item is saved in exactly
one place, a container or `carried`"). Everything in a stash is *stored*.
On death or an abandoned run, Run Flow calls `Clear` on every carried
container; that is the death sink. A storm calls `Clear` (and `Remove` for a
destroyed piece) on an unsheltered stash through Stash (ADR-0003, Decision 6);
that is the storm sink. Nothing else in the MVP removes stored items without a
player's request.

**R9. Worth is a readout, not money.** The worth of a container is the sum of
its units' worth (formula F5). It is used for: the pack's worth readout and
glow (Pack, Run HUD), the haul total at extraction and the best-haul statistic
(Run Flow, Save & Load: ADR-0002's "best-haul and total statistics"), and the
pacing check (R10). It is never spent and never earned on its own: nothing in
the MVP buys or sells. Valley materials, tools, gear and canisters have worth
0 in the MVP, so a pack full of rocks reads as worthless haul and only ore
makes the pack glow (art bible: ore is "the only faceted, glossy, fully
saturated thing" in the world). Market & Trading (Full Vision) may later turn
worth into a price; until then the player-facing word is "worth", never
"credits" or a currency sign.

**R10. Faucets, sinks and pacing.** The MVP economy is this closed table. A
system that adds a faucet or a sink adds a row here.

| Flow | Kind | Owner | Recurs? |
|---|---|---|---|
| Gathering rock and stick in the valley | Faucet | Gathering, Home Valley | Endless (the valley never runs out: concept, Recovery from failure) |
| Mining ore on a run | Faucet | Mining, Asteroid World | Each run |
| Building a piece (its cost) | Sink | Building | While the home grows |
| Repairing the home (one action, at a material cost) | Sink | Building | After storms, mostly for starter pieces |
| Crafting a tool, workbench or canister (its cost) | Sink | Crafting | Each time a tool is lost or a canister used |
| A canister used on a run | Sink (consumed) | Oxygen | Each run that uses one |
| Everything carried, on death or an abandoned run | Sink (lost) | Run Flow | Each failed run |
| An unsheltered stash's contents in a storm | Sink (lost) | Storms, through Stash | Rarely; preventable by a roof |

Rules on the table:

- **Coverage.** Each ore family must be the main input of at least one cost
  the player pays more than once (repair or a lost tool or a canister), and of
  at least one one-off cost (a piece or workbench). Data validation checks it
  (Acceptance Criteria) so neither family can become decoration.
- **The MVP ceiling is accepted.** Once the home is built in run materials,
  the recurring sinks (canisters, re-making lost drills, repair, death) are the
  only ore sinks, and ore will pile up in the stash for a player who rarely
  dies. That pile is itself visible wealth in the home (Pillar 5). Tier 1a's
  gear tiers are where a lasting sink arrives. The pacing target (formula F4)
  sets how many runs the MVP's one-off costs should take, so the ceiling is
  reached at a planned point, not by accident.
- **No upkeep.** No sink comes due on its own: nothing decays, nothing is
  charged on a timer (anti-pillar). Repair is only needed after a storm, and
  storms are forecast.
- **Rebuild guarantee.** From empty containers, valley materials alone must
  reach a workbench, a hammer, a basic drill and a shelter repair (concept,
  Recovery from failure). This system guarantees it by giving rock and stick
  stack sizes and worth that Building and Crafting can price against
  (`stack_max` 20, worth 0); the costs themselves belong to them.

**R11. Valley materials and other items in the MVP.**

| Id | Kind | Family | Tier | `stack_max` | Worth | Notes |
|---|---|---|---|---|---|---|
| `material.rock` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `material.stick` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `item.canister.oxygen` | item | none | 0 | 2 | 0 | Made by Crafting, used by Oxygen; the stack of 2 matches the prototype's `canister_carry` so a single pack slot holds a run's canisters. Oxygen decides how many may be carried |

Every ore has `stack_max` 1 (one piece per slot in the pack; ten per stash
slot through the stash's scale). Tools have `stack_max` 1 and worth 0;
their other fields belong to Tools & Gear.

**R12. Milestone A subset.** Milestone A (the valley home) has no runs, so it
uses only rock, stick, the hammer and the basic drill, the pack, stashes,
carried tools and every operation in R6. Ore definitions exist in the catalog
from the start (so Building and Crafting can name ore costs for later pieces),
but no faucet produces ore until Milestone B.

### States and Transitions

Items have no state (R5). Slots have two states, and containers have a short
life owned by the system that creates them.

**A slot**

| State | Holds | Becomes |
|---|---|---|
| Empty | Nothing | Filled, when an `Add` or `Move` places at least one unit |
| Filled | One id, count 1 to stack cap | Empty, when a `Take`, `Move` or `Clear` brings the count to 0; stays Filled while the count changes |

A Filled slot never changes id: to hold a different id it must become Empty
first. "Full" (count equal to the cap) is not a state; it is a test (F3).

**A container**

| State | Meaning | Entered when | Left when |
|---|---|---|---|
| Live | Exists, accepts operations | The owner creates it: the pack and carried tool slots with the profile; a stash when its piece is built (Stash, Building) | Its owner removes it |
| Removed | Gone; its id is never used again | `Remove` on an empty container, or `Clear` then `Remove` when a storm destroys its piece (ADR-0003, Decision 3) | Never |

There is no "locked" state. Whether a request may touch a container at a given
moment is the session check (Session & Authority, R5: home actions are refused
during a run, run actions at home), not a property of the container. Stored
containers are not touched during a run because no request can reach them; a
storm resolved at the end of the run (ADR-0003, Decision 6) clears them
through Stash, inside the run-end order.

### Interactions with Other Systems

Every interaction is a plain call on the Simulation side (ADR-0001); no system
reads another's containers except through these.

| System | Direction | What flows | Owner of the interface |
|---|---|---|---|
| Game Data & Tuning (1) | In | Holdable definitions (`ore.*`, `material.*`, `item.*`, plus the common fields on `tool.*` and `gear.*`), validated before the session starts; `tuning.ore_and_item_economy` | Game Data & Tuning owns loading and validation; this document owns the fields and their ranges |
| Session & Authority (2) | In / out | Container operations run only inside an accepted request; this system's refusal reasons (R6) are returned as the owning system's reason | Session & Authority |
| Pack (8) | Out | The pack is a container (16 slots, scale 1); pick-up uses `Add`, drop uses `Take`; worth (F5) for the glow and readout | Pack owns the container's values and its requests |
| Tools & Gear (9) | Out | Carried tool slots are a container; tool and gear definitions carry R1's fields; `drill_tier` on ore is compared with a drill's tier | Tools & Gear owns tool fields and drill tiers |
| Gathering (10) | Out | Faucet: `Add(material.rock or material.stick, n)` into the pack; what does not fit stays in the world | Gathering |
| Building (11) | Out | `TakeCost` for a piece or a repair; `Remove` of an empty container when a stash piece is taken down; must follow R2's family use and R10's coverage | Building owns piece costs |
| Stash (12) | Out | Each stash is a container (24 slots, scale 10); `Move` between pack and stash; `Clear`/`Remove` for Storms | Stash owns its containers and its requests |
| Crafting (13) | Out | `TakeCost` for a recipe's inputs, then `AddAll` of its output; refused together if the output has nowhere to go | Crafting owns recipes |
| Storms (14) | Out (through Stash) | The storm sink: `Clear` on unsheltered stashes, `Clear` + `Remove` on destroyed ones | Storms decides; Stash performs |
| Home HUD & Panels (15), Run HUD (24) | Out | Container contents (ids and counts), worth totals, refusal reasons; display data by id | HUDs own the look |
| Oxygen (19) | Out | Canister sink: `Take(item.canister.oxygen, 1)` from the pack when one is used | Oxygen |
| Mining (21) | Out | Ore fields `toughness` and `drill_tier`; faucet: `Add(ore.*, 1)` into the pack when a piece breaks free | Mining owns the drilling formula and what happens to a piece that does not fit |
| Run Flow (22) | Out | Death sink: `Clear` on carried containers; the haul's worth at extraction (F5) for statistics; the move of the haul into a stash is Stash's | Run Flow |
| Save & Load (7) | Out | Container contents as id and count per slot, in slot order; ids are stable and never reused (ADR-0002) | Save & Load owns the format |
| Market & Trading (35, Full Vision) | Out, later | Worth as the base of a price | Market & Trading |

## Formulas

Systems-designer and economy-designer lenses applied: every formula below was
worked at its minimum, its maximum and at zero; the boundary findings are
listed after each one. All counts and worth values are integers; no formula
here uses floating point at run time (F1 and F4 are design-time and
validation-time only).

### F1. Worth per tier

The worth_per_tier formula is defined as:

`worth(t) = floor( W1 × R^(t − 1) / 5 ) × 5`, for `t` = 1, 2, 3

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `t` | int | 1–3 | data file (the ore's `tier`) | Ore tier |
| `W1` | int | 1–100 | design guideline (this formula) | Worth of a tier-1 ore piece: 10 |
| `R` | float | 1.5–6 | design guideline (this formula) | Worth ratio between tiers: 3.5 |
| `5` | int | — | constant | Rounding grain, so worths read as round numbers |

**Output Range:** 10, 35, 120 with the values above. With `R` at 1.5: 10, 15,
20; at 6: 10, 60, 360.

**Example:** `t` = 3: 10 × 3.5² = 122.5; 122.5 / 5 = 24.5, floored to 24; 24 × 5
= **120**.

**Why these numbers.** F1 is a design rule for setting each ore's `worth`
field, not a run-time calculation: the field holds the result, and the
designer may override one ore's worth with a rationale. The test is *worth per
second of drilling* with the basic drill's power, which must roughly double per
tier so a deeper, more dangerous seam pays more for the time spent and the
noise made: tier 1 is 10 / 2.0 = 5 per second, tier 2 is 35 / 3.5 = 10, tier 3
is 120 / 6.0 = 20. The prototype's four tiers ran 5, 10, 18, 37 per second, and
its retested pack was worth 590. *Worth per slot* also rises twelvefold from
tier 1 to tier 3, which is what makes dropping cheap ore for a better seam a
real choice in a 16-slot pack (Player Fantasy, framing 3).

**Boundaries.** `t` = 0 is not an ore tier (valley materials have worth 0 by
R11, not by F1). With `R` below 2, worth per second falls with tier once
toughness rises (tier 3 at `R` 1.5 is 20 / 6.0 = 3.3 per second): deeper seams
would pay less for more risk. With the current toughness values (each tier
about 1.75 times the last), worth per second rises at all only when `R` is
above about 1.75, and doubles per tier at `R` = 3.5. Validation reports (does not refuse) an ore whose worth per
toughness is lower than the tier below it (Acceptance Criteria 17).

### F2. Stack cap

The stack_cap formula is defined as:

`cap(id, c) = stack_max(id) × stack_scale(c)`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `stack_max(id)` | int | 1–999 | data file (holdable definition) | Units per slot at scale 1 |
| `stack_scale(c)` | int | 1–100 | data file (the owning system's container values) | The container's multiplier |

**Output Range:** 1 to 99,900, within a 32-bit integer. Typical: an ore in the
pack, 1 × 1 = 1; an ore in a stash, 1 × 10 = 10; rock in a stash, 20 × 10 =
200.

**Example:** `material.stick` in the pack: 20 × 1 = **20** per slot.

**Boundaries.** Both factors are at least 1, so the cap is never 0 and every
accepted kind always fits in an empty slot.

### F3. How many units an add places

The add_placed formula is defined as:

`room(id, c) = Σ over slots s of c holding id ( cap(id, c) − count(s) ) + empty(c) × cap(id, c)`

`p = 0` if `c` does not accept the kind of `id`; otherwise `p = min(n, room(id, c))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `n` | int | 1–2,147,483,647 | calculated (the request) | Units offered |
| `count(s)` | int | 1–cap | calculated (container state) | Units in a slot holding `id` |
| `empty(c)` | int | 0–slots | calculated (container state) | Empty slots in `c` |
| `cap(id, c)` | int | 1–99,900 | calculated (F2) | Stack cap |
| `p` | int | 0–`n` | calculated | Units placed; `n − p` stay at their source |

**Output Range:** 0 (no room, or the container does not accept the kind) to
`n`. `room` is at most 200 × 99,900 = 19,980,000, within a 32-bit integer.

**Example:** a pack (16 slots, scale 1) holding 3 sticks in slot 1, 15 other
slots full of ore, is offered 20 sticks: room = (20 − 3) + 0 × 20 = 17, so
**p = 17**; 3 sticks stay on the ground.

**Boundaries.** `n` = 0 never arrives (Malformed, R6). A full container gives
`room` = 0 and `p` = 0; `AddAll` is then refused with **No room** and `Add`
returns 0 without being refused (the caller decides whether 0 is a refusal:
Mining and Gathering treat it as **No room**).

### F4. Pacing: a cost's price in runs

The price_in_runs formula is defined as:

`price(cost) = Σ over (id, count) in cost ( count × worth(id) ) / H`

`ceiling_runs = Σ over every one-off cost k in the MVP ( price(k) )`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `count` | int | 1–999 | data file (a piece's or recipe's cost) | Units of one input |
| `worth(id)` | int | 0–100,000 | data file (holdable definition) | Worth of one unit |
| `H` | int | 100–5,000 | data file (`pacing_haul_worth`) | Expected haul worth of one successful MVP run: 600 |
| `price` | float | 0 and up | calculated | How many average successful runs the cost takes |
| `ceiling_runs` | float | 0 and up | calculated | Successful runs to build everything once |

**Output Range:** 0 for costs paid only in valley materials (worth 0). Target
bands, which Building and Crafting price against: a recurring cost
(repair after a storm, re-making a lost better drill, a canister) at **0.25 or
less**, so a failed run or a storm never costs more than one good run to
recover; a one-off piece or workbench at **0.5 to 3**; `ceiling_runs` between
`pacing_ceiling_runs_min` and `pacing_ceiling_runs_max` (**15 to 30**, about
4 to 8 hours of 10 to 15-minute runs).

**Example:** a better drill costing 8 `ore.seaglass`, 4 `ore.verdite` and 2
`ore.ochre` (teal-main, as R2 asks of a tool; no tier-3 ore, which only the
better drill can mine): (80 + 140 + 20) / 600 = **0.4 runs**. Above the 0.25
recurring band: Crafting would either cut it or accept that losing the better
drill costs nearly half a run. The report shows it; the designer decides.

**Why these numbers.** `H` = 600 is the retest's only measured pack worth, 590
(`prototypes/star-haul/REPORT.md`), rounded; it is provisional until Run Flow
records real haul worths. The 15 to 30 run ceiling is a guess at how long the
MVP's progression should last before Tier 1a's gear tiers take over;
provisional, for the designer's review at the first playable.

**Boundaries.** `H` is at least 100, so no division by zero. F4 is an
observation the data check prints for every cost (a report, never a refusal:
"helpers emit observations, never verdicts"); a value outside its band is a
balance question for the cost's owner.

### F5. Worth of a container

The container_worth formula is defined as:

`W(c) = Σ over filled slots s of c ( count(s) × worth(id(s)) )`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `count(s)` | int | 1–99,900 | calculated (container state) | Units in the slot |
| `worth(id(s))` | int | 0–100,000 | data file | Worth of one unit |
| `W(c)` | int, 64-bit | 0 to about 2 × 10¹² | calculated | Total worth |

**Output Range:** the pack, with tier-3 ore in every slot: 16 × 1 × 120 =
1,920. An empty container, or one holding only worth-0 items, is 0.

**Example:** a pack with 6 `ore.ochre`, 5 `ore.gild`, 2 `ore.sunstone` and 3
sticks: 60 + 175 + 240 + 0 = **475**.

**Boundaries.** The sum is kept as a 64-bit integer: the theoretical maximum
(200 slots × 99,900 × 100,000) overflows 32 bits even though no MVP container
comes near it. Lifetime haul statistics built from F5 are 64-bit for the same
reason (Save & Load).

## Edge Cases

Systems-designer lens applied to the Core Rules and Formulas as written: zero,
maximum, out of range, two requests at once, a data change under a save, and
degenerate strategies. Every case found is included (autonomous mode).

**Full and partial containers**

- **If an ore piece breaks free while the pack has no room** (F3 gives 0): this
  system places nothing and destroys nothing; the piece stays in the world.
  Mining owns what the piece does there and the "pack full" cue (Run HUD).
- **If a gather or a move offers more than fits** (F3 gives `p` < `n`): `p`
  units move and `n − p` stay where they were (on the ground, in the source
  slot). The result reports `p` so Presentation can show "3 sticks left".
- **If a craft's output would only fit in a slot its own cost empties**: the
  room check for the output is made on the containers as they would be *after*
  `TakeCost`. Crafting runs `TakeCost` and `AddAll` as one operation; if
  `AddAll` would fail, neither happens and the craft is refused with **No room**.
- **If `TakeCost` draws one id from several sources**: the first source in the
  order gives all it has before the next is touched (Building and Crafting
  choose the order, for example pack first, then the nearest stash). Within
  one container, units come from the last matching slot backwards (R6).
- **If a request offers an enormous count** (up to the 32-bit maximum):
  `p` is bounded by `room`, at most 19,980,000 (F3), so nothing overflows.

**Two things at once**

- **If two requests touch the same slot in the same tick** (co-op, or a double
  click): Session & Authority runs requests one at a time in arrival order
  (its R4); each operation sees the state the previous one left. The second
  gets what remains, possibly **Not enough** or **No room**. No unit is ever
  moved twice.
- **If a storm clears a stash while the player is on a run**: no request can
  touch a stored container during a run, and the storm is resolved at the end
  of the run (ADR-0003, Decision 6), before the haul is placed. The haul then
  goes wherever Stash puts it, never into a container already removed.
- **If the player removes a stash piece that still holds items**: refused with
  **Not empty** (ADR-0003, Decision 3), unless the Stash design doc moves the
  contents into what is carried in the same step and snapshot.

**Data changes under a save**

- **If a patch lowers an item's `stack_max` below a count already saved**: the
  slot keeps its count (nothing is destroyed). `Add` to that slot is refused
  while its count is at or above the new cap; `Take` and `Move` out work
  normally. Save & Load does not split or trim it.
- **If a patch lowers a container's `slots` below a filled slot**: the extra
  filled slots are kept as *overflow slots* that accept only `Take` and `Move`
  out, and disappear when empty. Nothing new can be put in them. Pack and Stash
  show them as over capacity (UI Requirements).
- **If a holdable id is retired** (Game Data & Tuning, R14): its release must
  include a Save & Load migration that maps it to another id, or removes the
  units with a notice to the player. A retired holdable id with neither is a
  validation error, so the build cannot ship.
- **If a patch changes an ore's `worth`**: saved statistics keep the numbers
  recorded at the time; readouts use the new value from then on.

**Zero and boundaries**

- **If a container holds only worth-0 items**: its worth is 0, so the pack does
  not glow and an extraction with only rocks and sticks records a haul of 0.
- **If a cost is paid only in valley materials**: its price in runs is 0 (F4),
  which is correct for the rebuild set (R10) and reported, not refused.
- **If a cost names the same id twice, or a count of 0**: data validation
  refuses the definition (one entry per id, counts of 1 or more), so a
  malformed cost never reaches `TakeCost`.
- **If a recipe for the first drill of tier `k` needs an ore whose `drill_tier`
  is `k` or higher**: that drill could never be made, because its ingredients
  need it. Data validation refuses it (Acceptance Criteria 18).
- **If the kind does not fit the container** (a tool offered to the pack, ore
  to a tool slot): `Add` places 0 and `AddAll` or `Move` is refused with
  **Can't go there**.

**Degenerate strategies**

- **Inflating the haul by carrying ore out and back.** If the player launches
  with ore in the pack and extracts with it, the best-haul statistic would
  count ore that never came from the run. *Resolution:* the *haul worth* of a
  run is the worth of the pack at extraction minus its worth at launch,
  floored at 0 (F5 applied twice; Run Flow records both). The pack readout
  during the run still shows the pack's full worth, because that is what the
  player stands to lose.
- **Keeping valuables in the pack at home to dodge storms.** What is carried at
  home is kept by storms (ADR-0003: "what the player carries at home is
  kept"), so the pack is 16 storm-proof slots. *Accepted:* it holds one ore
  piece per slot, it all goes out at risk on the next run unless moved, and a
  roof protects far more. It is a minor edge, not a dominant strategy; noted
  for the Stash and Storms design docs.
- **Stockpiling and never dying.** Once the home is built, ore piles up (the
  accepted MVP ceiling, R10). It is visible in the stash, and is the expected
  end state of the MVP's progression, not an exploit.
- **Splitting stacks to fake room.** Not possible: operations never split a
  stack into a new slot except to fill an empty slot when the existing stacks
  are full, and there is no player split action in the MVP.

## Dependencies

### Upstream (this system depends on)

| System | Hard / soft | Interface | Design doc |
|---|---|---|---|
| Game Data & Tuning (1) | Hard | Loads and validates every holdable definition and `tuning.ore_and_item_economy`; hands them over as plain values (its R10); the kinds `ore`, `material`, `item` are assigned to this system by its R2 | [game-data-and-tuning.md](game-data-and-tuning.md) (in review) |
| Session & Authority (2) | Hard, Authority side only | Container operations run only inside a request it has accepted (its R4, R5); the rules themselves never depend on it (ADR-0001's assembly rule, as the systems index notes) | [session-and-authority.md](session-and-authority.md) |

Constraints from accepted ADRs:

| Source | Constraint |
|---|---|
| ADR-0001 | Container rules are Simulation code in plain C#, unit-tested without the engine; every change goes through the host |
| ADR-0002 | Items are saved by stable string id; ids are never reused; renames go through migrations |
| ADR-0003, Decision 3 | Every item is saved in exactly one place, a container or `carried`; containers are keyed by their piece's id; a container never outlives its piece; this system owns the item-container contract Building uses to refuse or remove |

Engine: none. This system is rules and data only. No engine reference module
covers it (`docs/engine-reference/unity/modules/` has no scripting or core
file), so nothing was checked against the pinned engine, and nothing here
needs an engine feature.

### Downstream (systems that depend on this one)

| System | Hard / soft | Interface | Design doc |
|---|---|---|---|
| Pack (8) | Hard | The pack container; `Add`, `Take`, F5 worth | Not written: provisional |
| Tools & Gear (9) | Hard | Carried tool slots; R1's fields on tool and gear definitions; ore `drill_tier` | Not written: provisional |
| Gathering (10) | Hard | Rock and stick definitions; `Add` into the pack | Not written: provisional |
| Building (11) | Hard | `TakeCost`, `Remove`; family use (R2) and coverage (R10) for piece and repair costs | Not written: provisional |
| Stash (12) | Hard | Stash containers; `Move`, `Clear`, `Remove` | Not written: provisional |
| Crafting (13) | Hard | `TakeCost` + `AddAll` as one operation; family use and coverage for recipes; F4 pacing bands | Not written: provisional |
| Mining (21) | Hard | `toughness`, `drill_tier`; `Add(ore, 1)` | Not written: provisional |
| Storms (14) | Soft (through Stash) | The storm sink | Not written: provisional |
| Oxygen (19) | Hard | `item.canister.oxygen`; `Take` when used | Not written: provisional |
| Run Flow (22) | Hard | `Clear` on carried containers at death; haul worth (F5 at launch and extraction) | Not written: provisional |
| Save & Load (7) | Hard | Container contents as id and count per slot; retired-id migrations for holdables | Not written: provisional |
| Home HUD & Panels (15), Run HUD (24) | Soft | Contents, worth, refusal reasons, display data | Not written |
| Market & Trading (35, Full Vision) | Soft | Worth as a price base | Not written |

**Bidirectional check.** The systems index lists Ore & Item Economy as a
dependency of rows 8, 9, 10, 11, 12, 13, 21 and 35, which matches the table.
It does not list it for Storms, Oxygen, Run Flow or Save & Load: Storms
reaches containers through Stash; Oxygen's canister, Run Flow's death clear
and Save & Load's slot format each use this system's contract directly, and
their design docs should list it when written (Open Questions 4). Game Data &
Tuning lists this system as a hard dependent (`ore`, `material`, `item`
definitions) and Session & Authority lists the owning systems' `Try…` methods,
which call these operations; both match.

## Tuning Knobs

### This system's tuning set: `tuning.ore_and_item_economy`

These values are read only by data validation's pacing report (F4); nothing at
run time reads them, so a change takes effect at the next start-up.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high |
|---|---|---|---|---|---|---|---|---|---|
| `pacing_haul_worth` | int | 600 | 100 | 5,000 | 50 | `credits` | `restart` | Every cost looks expensive in runs; owners under-price | Every cost looks cheap; the MVP ceiling arrives early |
| `pacing_ceiling_runs_min` | int | 15 | 1 | 200 | 1 | `count` | `restart` | The report never flags a progression that is too short | Every honest progression is flagged short |
| `pacing_ceiling_runs_max` | int | 30 | 1 | 200 | 1 | `count` | `restart` | Every honest progression is flagged long | The report never flags a grind |

Constraint: `pacing_ceiling_runs_min ≤ pacing_ceiling_runs_max`. Owner: Ore &
Item Economy. Rationale: `pacing_haul_worth` is the retest's measured pack
worth of 590, rounded (`prototypes/star-haul/REPORT.md`); the ceiling band is a
first guess at 4 to 8 hours of MVP progression. **All three are provisional**
until real runs record haul worths. `pacing_haul_worth` should follow the
typical haul once Run Flow logs it: if the median successful haul moves, F4's
prices move with it.

### Knobs on definitions (Game Data & Tuning, R1: one thing's numbers live on it)

| Field | On | MVP values | Safe range | Too low | Too high | Interacts with |
|---|---|---|---|---|---|---|
| `worth` | each ore | 10 / 35 / 120 per tier (F1) | 1 to 100,000 for ore | Deep seams stop paying for their risk; "one more seam" loses its pull | A single seam outweighs the pack; tier-1 ore is never worth a slot | Toughness (worth per second, F1); `pacing_haul_worth` (F4) |
| `toughness` | each ore | 2.0 / 3.5 / 6.0 per tier | 0.5 to 20 | Drilling is no bet: little noise and time per piece | Seams feel like a chore; hunters arrive before a pack fills | Worth (F1); Mining's drill power; Perception's noise per second of drilling |
| `drill_tier` | each ore | 1 / 1 / 2 per tier | 1 to 3 | Top tier needs no better drill; the drill recipe loses its point | A tier that no MVP drill can mine | Tools & Gear's drill tiers; Acceptance Criteria 18 |
| `stack_max` | every holdable | ore 1, rock and stick 20, canister 2, tools 1 | 1 to 999 | Rock and stick fill the pack before a wall is affordable | Ore stacks in the pack and the 16-slot tension is gone | Every container's `stack_scale` (F2) |
| `worth` | valley materials, items, tools | 0 | 0 in the MVP | — | Rocks count as haul; the pack glows with sticks | Pack glow, haul statistics |

### Knobs owned elsewhere (pointed to, not duplicated)

| Value | Owner | Starting value | Effect here |
|---|---|---|---|
| Pack `slots` (`pack_slots`) and `stack_scale` | Pack (`tuning.pack`) | 16, 1 | The run's main scarcity |
| Stash `slots` and `stack_scale` | Stash (`tuning.stash`) | 24, 10 | How often the player builds another stash |
| Carried tool `slots` | Tools & Gear (`tuning.tools_and_gear`) | 3 | Matches keys 1 to 3 (Input) |
| How many canisters may be taken on a run (`canister_carry`) | Oxygen (`tuning.oxygen`) | 2 | Separate from the canister's `stack_max` |
| Every piece, repair and recipe cost | Building, Crafting | — | Priced against F4's bands; must satisfy R2 and R10

## Visual/Audio Requirements

Optional for the Economy category, written because the ores are the most
watched objects in the game. Art-director lens applied with art bible
Sections 1 to 4.

**Visual: the ores.**

- **Family by hue, tier by saturation** (art bible, Section 4, "Semantic
  usage": "Hue names the family, saturation names the tier"), using the six
  colours in R2's table exactly. Violet, pink and red stay out of the ore arc,
  so no ore can read as a threat.
- **Tier backups that survive colour blindness** (art bible, "Colourblind
  risks and backups": "Facet count and cluster size rise with tier; brighter
  glint"). Every tier is told apart by facet count and cluster size as well as
  saturation (Acceptance Criteria 29).
- **Ore is a surface, not a light** (art bible: ore "never lights the rock
  around it"; in the deep zone "a seam is found by its glint in the player's
  lamp"). Ore is faceted, glossy, set in cracks in matte rock.
- **Ore never moves when idle** (retest note, `prototypes/star-haul/REPORT.md`:
  the designer disliked the ore moving on its own). It shakes and cracks only
  under the drill (Mining owns that feedback).
- **Valley materials are matte and neutral** (art bible: wood at or below 25%
  saturation), never faceted, so a rock or stick can never be mistaken for
  ore.
- **Ore at home becomes trim** on pieces built from it (art bible, "Built-piece
  trim": the ore's hue as matte trim at or below 35% saturation, no more than a
  fifth of a piece's face). Building owns the pieces; this system's family
  rule (R2) is why amber trim marks structural pieces and teal trim marks
  workbenches and tool racks.
- **Icons** for each holdable share the same code: family hue, tier by
  saturation and a facet-count mark, so the pack and stash panels read the
  same way as the world.

**Audio.**

- An ore piece entering the pack has a short pickup sound whose pitch or
  layer rises with tier, so a tier-3 piece is heard as well as seen. A refused
  pickup (**No room**) has its own soft, distinct sound (Pack and Run HUD own
  the cue; this system supplies the tier and the reason).
- No sound for worth-0 materials beyond a plain pickup.
- Audio direction belongs to the Audio system (26, Vertical Slice); these are
  requirements on it.

> 📌 **Asset Spec**: Visual/Audio requirements are defined. After the art bible
> is approved, run `/asset-spec system:ore-and-item-economy` to produce
> per-asset visual descriptions, dimensions, and generation prompts from this
> section.

## Game Feel

Optional for this category; written because two moments depend on it.

- **The read.** A seam's tier must be readable at the distance the player
  decides to approach it: from 10 m in mid-zone light and in the helmet lamp's
  reach in the deep zone. The target is under a second from seeing the seam to
  knowing its tier, without a tooltip. Verified by playtest question, not
  automation: "Did you know which seams were worth more before you drilled
  them?"
- **The full pack.** A refused pickup must be felt at once (sound and the Run
  HUD's cue on the same frame as the refusal) and never mistaken for a missed
  drill. The piece that did not fit stays visibly in the world, so the choice
  to come back for it, or to drop something, is the player's.
- **The unpack.** Moving the haul into the stash should feel like counting
  coins: each stack lands with its own small sound, higher tiers last. This is
  Stash's and Audio's to deliver; this system orders the contents by slot so
  the sequence is stable.

## UI Requirements

This system has no screen of its own; it defines what the screens show.

- **Item names, descriptions and icons** come from display data by id (Game
  Data & Tuning, R7). Every holdable has all three before a release build.
- **Counts** are shown as whole numbers; a stack at its cap shows that it is
  full. Overflow slots (Edge Cases) are shown as over capacity, with a clear
  mark that nothing more can be added.
- **Worth** is labelled "worth", shown in amber (art bible UI palette: "Amber
  only for haul and pack value"), never with a currency sign or the word
  "credits" (R9; Acceptance Criteria 30).
- **Refusal reasons** owned here (No room, Not enough [item], Not empty, Can't
  go there) have short player-facing texts with the item's display name filled
  in, and are localisable.
- **Costs** (pieces, repairs, recipes) are shown as icon and count pairs, with
  what the player has beside what is needed, and the missing ones marked by
  shape as well as colour (accessibility floor: nothing by colour alone).

> 📌 **UX Flag — Ore & Item Economy**: This system has UI requirements. In
> Pre-Production, run `/ux-design` to create a UX spec for each screen or HUD
> element this system contributes to (the pack panel, stash panel, cost
> display, pack worth readout) **before** writing epics. Stories that reference
> UI should cite `design/ux/[screen].md`, not the GDD directly.

## Cross-References

| This document | References | What | Where |
|---|---|---|---|
| R1, R2, Tuning Knobs | Game Data & Tuning | Kinds, id rules, R1 (numbers on definitions), R5 units (`credits`, `count`, `level`), R7 display data, R9 validation, R14 retired ids | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R6, Edge Cases | Session & Authority | R4 request handling, R5 session check and its refusal list | [session-and-authority.md](session-and-authority.md) |
| R4 | Input | Tool keys 1 to 3, which set the carried tool slots | [input.md](input.md) |
| R2, Visual/Audio | Art bible | Ore colour table, trim rule, colourblind backups | [art-bible.md](../art/art-bible.md) Section 4 |
| R3, F1, F4 | Browser prototype | Toughness and worth curves; retest pack worth 590 | `prototypes/star-haul/config.js`, `prototypes/star-haul/REPORT.md` |
| R8, Interactions | ADR-0003 | Decision 3 (containers, `carried`, the contract's owner), Decision 6 (storm resolution) | [adr-0003](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| R5, Edge Cases | ADR-0002 | Stable ids, migrations, best-haul statistics | [adr-0002](../../docs/architecture/adr-0002-persistence.md) |
| R10 | Game concept | Recovery from failure (rebuild guarantee; the valley never runs out), anti-pillars | [game-concept.md](game-concept.md) |

## Acceptance Criteria

QA lens applied to Sections C, D and E as written: one criterion or more per
core rule and per formula, boundary values for every formula, cross-system
criteria, and a story type for each. **Logic** criteria are EditMode unit
tests on the Simulation (no engine, no files: ADR-0001); **Integration** needs
two systems or the save; **Config** is a data-validation check; **Visual/UI**
needs a retained screenshot in `production/qa/evidence/`. Test fixtures build
containers and definitions from factory functions, not from the shipped
catalog, except where a criterion names the shipped data.

**Holdables and data (R1 to R3, R11)**

1. *(Logic)* **GIVEN** a stash container and the known piece id
   `piece.wall.stick`, **WHEN** `AddAll(piece.wall.stick, 1)` is called,
   **THEN** it is refused with **Can't go there** and the container is
   unchanged; `Add` with the same arguments returns 0.
2. *(Config)* **GIVEN** a holdable definition with `stack_max` 0, or `worth`
   −1, or `tier` 4, **WHEN** the catalog is validated, **THEN** validation
   fails and the message names the id and the field; a definition with
   `stack_max` 1 and 999 passes.
3. *(Config)* **GIVEN** the shipped catalog, **WHEN** it is loaded, **THEN** it
   holds exactly the six ores of R2 with the family, tier, worth, toughness and
   drill tier in R2's table, and the three items of R11 with their
   `stack_max` and worth 0.
4. *(Config)* **GIVEN** the shipped catalog, **WHEN** every holdable with
   family `none` and every tool is checked, **THEN** each has worth 0.

**Containers and operations (R4, R6, F2, F3)**

5. *(Logic)* **GIVEN** a container with scale 1 and one with scale 10, **WHEN**
   the cap is asked for an ore (`stack_max` 1) and for `material.stick`
   (`stack_max` 20), **THEN** the caps are 1 and 10 for the ore and 20 and 200
   for the stick.
6. *(Logic)* **GIVEN** a 16-slot pack (scale 1) with 3 sticks in slot 1 and the
   other 15 slots each holding one ore, **WHEN** `Add(material.stick, 20)` is
   called, **THEN** it returns 17, slot 1 holds 20, and the caller still holds
   3 sticks.
7. *(Logic)* **GIVEN** a 4-slot container (scale 1) whose only filled slot is
   slot 3, holding 5 sticks, **WHEN** `Add(material.stick, 30)` is
   called, **THEN** slot 3 is topped up to 20 first, then slot 1 receives 15,
   and slots 2 and 4 stay empty.
8. *(Logic)* **GIVEN** a full container, **WHEN** `AddAll(id, 1)` is called,
   **THEN** it is refused with **No room** and every slot is unchanged.
9. *(Logic)* **GIVEN** a container with 4 rocks in slot 1 and 4 in slot 3,
   **WHEN** `Take(material.rock, 6)` is called, **THEN** slot 3 becomes empty
   and slot 1 holds 2; **WHEN** `Take(material.rock, 3)` is then called,
   **THEN** it is refused with **Not enough rock** and slot 1 still holds 2.
10. *(Logic)* **GIVEN** a pack slot with 5 sticks and a stash with room for
    only 2 more sticks, **WHEN** `Move` of 5 from that slot to the stash is
    called, **THEN** it returns 2 and the pack slot holds 3.
11. *(Logic)* **GIVEN** a pack with 3 `ore.gild` and a stash with 5, and a cost
    of 6 `ore.gild` and 1 `ore.verdite` with neither container holding verdite,
    **WHEN** `TakeCost(cost, [pack, stash])` is called, **THEN** it is refused
    with **Not enough verdite** and both containers are unchanged; with one
    verdite added to the stash, the same call takes all 3 from the pack, 3 from
    the stash and the verdite.
12. *(Logic)* **GIVEN** a full pack whose cost for a craft takes every unit
    from one slot, and an output that fits only in that slot, **WHEN** the
    craft's `TakeCost` + `AddAll` runs, **THEN** it is accepted and the output
    is in that slot; with an output that would need two slots, it is refused
    with **No room** and nothing is taken.
13. *(Logic)* **GIVEN** a stash holding items, **WHEN** `Remove` is called,
    **THEN** it is refused with **Not empty**; **WHEN** `Clear` and then
    `Remove` are called, **THEN** `Clear` returns exactly the units that were
    there and the container no longer exists.
14. *(Logic)* **GIVEN** a tool offered to the pack and an ore offered to a
    carried tool slot, **WHEN** `AddAll` is called for each, **THEN** each is
    refused with **Can't go there**.

**Conservation and interchangeability (R5, R7)**

15. *(Logic)* **GIVEN** a pack, two stashes and a fixed, committed list of
    1,000 operations covering every operation in R6 (generated once and stored
    as a test fixture, not generated at test time), **WHEN** they are run in
    order, **THEN** after every operation the total of each id across the
    containers plus the units recorded as given to the world or to a sink
    equals the starting total plus the units recorded from faucets.
16. *(Logic)* **GIVEN** any container, **WHEN** its contents are read for
    saving, **THEN** each slot is either empty or exactly an id and a count;
    no other per-item field exists.

**Worth and pacing (R9, R10, F1, F4, F5)**

17. *(Config)* **GIVEN** a test catalog where a tier-2 ore's worth per
    toughness is lower than its tier-1 ore's, **WHEN** the catalog is
    validated, **THEN** the pacing report lists that ore, and the catalog
    still becomes Ready (a report, not a refusal). With the shipped catalog,
    the report shows 5, 10 and 20 worth per toughness for tiers 1, 2 and 3 in
    both families.
18. *(Config)* **GIVEN** a test recipe whose output is the first drill of tier
    2 and whose inputs include an ore with `drill_tier` 2, **WHEN** the
    catalog is validated, **THEN** validation fails naming the recipe and the
    ore.
19. *(Config)* **GIVEN** a test catalog in which no recurring cost (repair,
    a tool recipe or the canister recipe) has amber as its main family, **WHEN**
    it is validated, **THEN** validation fails naming the family amber; the
    same holds for teal and for one-off costs.
20. *(Config)* **GIVEN** a cost of 8 `ore.seaglass`, 4 `ore.verdite` and 2
    `ore.ochre` and `pacing_haul_worth` 600, **WHEN** the pacing report runs,
    **THEN** it shows a price of 0.4 runs; a cost of rock and stick only shows
    0; a set with `pacing_ceiling_runs_min` 31 and `max` 30 fails validation on
    the constraint.
21. *(Logic)* **GIVEN** a pack with 6 `ore.ochre`, 5 `ore.gild`, 2
    `ore.sunstone` and 3 sticks, **WHEN** its worth is asked, **THEN** it is
    475; an empty container is 0; a test container of 200 slots, each holding
    99,900 units of an item of worth 100,000, returns 1,998,000,000,000 with
    no overflow.

**Cross-system (R8, edge cases)**

22. *(Integration)* **GIVEN** a run in progress with ore and a canister in the
    pack, a drill in a carried tool slot and items in a stash at home, **WHEN**
    the player dies, **THEN** every carried container is empty, the stash
    holds exactly what it held at launch, and the units cleared are recorded
    as the death sink.
23. *(Integration)* **GIVEN** a run launched with 2 `ore.sunstone` (worth 240)
    already in the pack, **WHEN** the player extracts with a pack worth 700,
    **THEN** the recorded haul worth is 460; launching with 240 and extracting
    with 200 records 0.
24. *(Integration)* **GIVEN** a save with a stash slot of 15 sticks and a patch
    that lowers `material.stick`'s `stack_max` so the stash cap becomes 10,
    **WHEN** the save is loaded, **THEN** the slot still holds 15, an `Add` of
    sticks to that slot places 0 there, and `Take(material.stick, 6)` leaves 9.
25. *(Integration)* **GIVEN** a save with items in pack slots 13 to 16 and a
    patch that lowers the pack to 12 slots, **WHEN** the save is loaded and the
    player moves those items out, **THEN** no item is lost, nothing can be
    added to slots 13 to 16, and each disappears once empty.
26. *(Config)* **GIVEN** a build whose retired list contains a holdable id with
    no Save & Load migration for it, **WHEN** the catalog is validated, **THEN**
    validation fails naming the id.
27. *(Integration)* **GIVEN** two requests in the same tick that each move the
    only 3 sticks from the same stash slot into the pack, **WHEN** the tick
    runs, **THEN** the first moves 3, the second is refused with **Not enough
    stick** (its source slot is empty), and the total number of sticks is
    unchanged.
28. *(Logic)* **GIVEN** Milestone A content (no run systems), **WHEN** the
    catalog loads and a full home session is played in a test, **THEN** the
    six ore definitions are present and no operation ever adds an ore.

**What the player sees**

29. *(Visual)* **GIVEN** the six ores placed side by side in the asteroid's
    lighting, **WHEN** a screenshot is taken, **THEN** family is told apart by
    hue (amber or teal) and tier by saturation, facet count and cluster size,
    matching the art bible's table; a greyscale copy of the same screenshot
    still shows the tier order by facet count and size. Retained in
    `production/qa/evidence/`; art lead sign-off.
30. *(UI)* **GIVEN** the pack readout during a run and the haul summary at
    extraction, **WHEN** screenshots are taken, **THEN** the value is labelled
    worth, with no currency sign and no word "credits".

**Performance**

31. *(Logic, advisory)* **GIVEN** a 200-slot container, **WHEN** 10,000 mixed
    `Add`, `Take` and `Move` calls run in an EditMode benchmark, **THEN** they
    allocate no managed memory after warm-up and finish in under 10 ms in
    total on the development machine. Advisory, because timings vary by
    machine; the allocation part is blocking.

**Gaps the QA lens found, and where they went:** the rebuild guarantee (R10)
cannot be tested here because the costs belong to Building and Crafting; it
is carried to their acceptance criteria (Open Questions 5). F1 is a design
rule, so it is covered by criterion 3 (the shipped values) and 17 (the
report), not by a run-time test.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | **Is the accepted MVP ceiling right?** Once the home is built in run materials, only recurring sinks take ore (R10). Is a stash that fills up good enough as the MVP's end state, or does the MVP need a lasting ore sink before Tier 1a? | Designer | First playable of Milestone B |
| 2 | **Ore names** (ochre, gild, sunstone; seaglass, verdite, tidestone) are provisional. They must be fixed before the first release that saves them, because ids are never reused | Designer, writer | Before the first build that writes a save with ore |
| 3 | **The art bible's open question on teal's worth is answered here** (equal worth per tier; families differ by use). The art bible's note in Section 4 should point to R2 | Art director | Next art bible revision |
| 4 | **The systems index does not list this system for Save & Load (7), Storms (14), Oxygen (19) or Run Flow (22)**, which all use its contract (Dependencies). Add it to those rows, or note it as implicit as Game Data & Tuning does | Producer (`/map-systems` owns the index) | Before those design docs are written |
| 5 | **The rebuild guarantee** (R10) can only be tested where the costs live. The Building and Crafting design docs must each carry an acceptance criterion that the starter set (workbench, hammer, basic drill, one shelter repair) costs only rock and stick | Building, Crafting design docs | When they are written |
| 6 | **Wording in Game Data & Tuning to align with this document.** (a) Its Interactions and Downstream tables name this system's set `tuning.economy`; its own R4 rule gives `tuning.ore_and_item_economy`, used here. (b) Its Interactions table says that set holds "worth per material, container sizes it defines" and that Stash and Crafting get "container definitions from Ore & Item Economy"; here worth is a field on each definition (its own R1) and each container's size is set by the system that owns the container (R4). Game Data & Tuning should follow both | Game Data & Tuning | Its next revision |
| 7 | **Per-item state.** Tool durability, ore quality or anything else held per unit is out of scope (R5). Tier 1a's gear tiers may want it; it would need a new slot shape and a save migration | Tools & Gear, Save & Load | Before Tier 1a design |
| 8 | **Pacing values** (`pacing_haul_worth` 600, ceiling 15 to 30 runs) and all ore worth and toughness values are provisional until real runs are played in Unity. In particular, the recurring band (0.25 runs or less) keeps a lost better drill cheap, which could soften the sting of death that Pillar 3 asks for ("this pillar picks the sting"); the retest only recorded that losing the pack "did not feel too harsh". If playtests find death too soft, raise the band before softening anything else | Designer, economy review | After Milestone B's first playtests |
| 9 | **The pack is storm-proof at home** (Edge Cases): accepted as minor. The Stash and Storms design docs should confirm they agree | Stash, Storms design docs | When they are written |

### Decisions taken on the designer's behalf (2026-11-28, autonomous mode)

The designer's standing instruction (2026-11-27) is to take the recommended
option and review everything at the first playable. Each is also in the
decision log.

1. **Framing**: both data layer and player effect (Overview, Player Fantasy).
2. **Player Fantasy**: "the scavenger's eye", with the home payoff and the
   carried-loss cost as one arc.
3. **Six ores**, two families of three tiers, matching the art bible's table;
   names provisional.
4. **Equal worth per tier across families; amber is structural, teal is
   technical** (answers the art bible's open question).
5. **Per-container stack scale**: the pack keeps one ore piece per slot as
   retested; a stash slot holds ten.
6. **Interchangeable items**, no per-item state in the MVP.
7. **No money in the MVP**: worth is a readout, labelled "worth".
8. **Accept the MVP ceiling** with recurring sinks and a pacing target, instead
   of an upkeep cost or a display-only sink. Marked major in the log; Open
   Question 1.
9. **Worth curve** 10, 35, 120 (ratio 3.5), so worth per second of drilling
   doubles per tier.
10. **Pacing bands** as a report, never a refusal.
11. **Haul worth** is extraction minus launch, floored at 0.
12. **The storm-proof pack at home** is accepted as a minor edge.
13. **Missing index dependencies** raised as a question, not edited.
14. **All optional sections** written.
