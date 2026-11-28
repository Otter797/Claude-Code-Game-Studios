# Ore & Item Economy

> **Status**: In Review (revision 1, 2026-11-28, after two parallel first `/design-review`s, both NEEDS REVISION; awaiting re-review)
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28 (revision 1)
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

Every holdable definition carries these four fields. This document owns them
on every holdable kind (Game Data & Tuning R2, shared holdable fields), and
Game Data & Tuning validates them; their ranges live once per kind in that
kind's limits set (Game Data & Tuning R1), not on each definition:

| Field | Type | Range (per kind) | Meaning |
|---|---|---|---|
| `stack_max` | int, unit `count` | 1 to 999 | How many fit in one slot of a container with stack scale 1 (R4) |
| `worth` | int, unit `credits` | ore: 1 to 100,000; every other holdable kind: 0 in the MVP | What one unit is worth as haul. Shown to the player as "worth", never as money (R9) |
| `family` | enum: `amber`, `teal`, `none` | ore: `amber` or `teal`; every other kind: `none` | The ore family (R2). Only ore has a family; what a cost is "mainly made of" is computed from the cost (R10), never stored on the item |
| `tier` | int, unit `count` | ore: 1 to 3; every other kind: 0 | The ore tier |

Ore definitions also carry the fields Mining reads (R3). Tool and gear
definitions carry these four fields plus whatever Tools & Gear defines.
Display name, description and icon are display data under the same id (Game
Data & Tuning, R7); the Simulation never reads them.

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
  colours (note: Verdite was the prototype's tier 3 of 4 and is now teal tier
  2). The ids are fixed once released (Game Data & Tuning, R2); whether the
  ids should carry family and tier instead of names is Open Question 2.
- **Worth per tier is the same in both families**, from formula F1. Values are
  provisional until the run's pacing is played in Unity.
- **The families differ by use, not worth.** *Amber is structural*: the run
  materials Building uses for stronger pieces and for repairing them. *Teal is
  technical*: the run materials Crafting uses for tools, canisters and
  workbenches. Building and Crafting set the actual costs; this rule is what
  they must respect. A cost may mix families; its *main* family (R10) must
  match its use. **Both families must keep a recurring use after the home is
  fully built** (R10's coverage rule): the canister and better-drill recipes
  carry an amber share as well as their teal main, so amber is still spent on
  ordinary runs and deaths, not only on repairs that a finished home no longer
  needs.
- **The families are shared by every trade** (Pillar 4: "Debating a material
  only one trade uses or one that links two, this pillar picks the link").
  Later trades (heists, planets) add new ores, tiers or goods *inside* the
  amber and teal families, or a new family that at least two trades produce;
  never a family only one trade can supply. A material that only one trade
  yields must be the input of something another trade's player wants.
- **Worth and exact costs agree through refining.** Worth prices a haul, but
  costs name exact ores, so a pack of tier-3 ore could otherwise be unable to
  pay a tier-1 cost, and the worth readout would tell the player to drop the
  tier-1 ore recipes need. Crafting therefore provides a **refine-down** recipe
  at the workbench for each family: one ore of tier `t` becomes ore of tier
  `t − 1` of the same family, at a rate Crafting sets so that worth never
  rises (no refine-up, and no refine across families). A rich haul can then
  always pay a cheap cost, and worth stays an honest guide to what to keep.
- **Tier 3 needs the better drill.** The ore's `drill_tier` field says the
  lowest drill tier that can mine it; Mining refuses lower ones and Tools &
  Gear defines drill tiers.
- Which ores appear where on the asteroid, and how many, belongs to Asteroid
  World; how a seam turns into pieces belongs to Mining.

**R3. Ore fields Mining reads.** Each ore definition also carries:

| Field | Type | Range | Meaning |
|---|---|---|---|
| `toughness` | float, unit `s` | 0.5 to 20 | Drilling time per piece with a drill of power 1, in seconds. Mining owns the formula that turns it into time for a given drill; this system owns the per-ore value (Game Data & Tuning, R1: one thing's numbers live on its definition) |
| `drill_tier` | int, unit `count` | 1 to 3 | Lowest drill tier that can mine it |

Toughness follows the prototype's curve (2.0, 3.0, 4.4, 6.0 seconds for four
tiers), refitted to three tiers. Tier 3 can only be mined with the better
drill (power 2 in the prototype), so at the weakest drill able to mine each
tier a piece takes 2.0, 3.5 and 3.0 seconds. Provisional.

**R4. Containers.** A *container* is a fixed, ordered list of slots with an
identity. It is described by:

| Property | Type | Set by | Meaning |
|---|---|---|---|
| `container_id` | string | The owning system | Stable id, never reused: a stash's is its piece's id (ADR-0003, Decision 3); a player's carried containers are `carried.<playerId>.pack` and `carried.<playerId>.tools` |
| `owner` | `playerId` or `shared` | The owning system | Carried containers belong to one player; stashes are `shared` (in the home) |
| `slots` | int, 1 to 200 | The owning system (Pack, Stash, Tools & Gear for carried tool slots) | Number of slots |
| `stack_scale` | int, 1 to 100 | The owning system | Multiplies every item's `stack_max` in this container |
| `accepts` | set of holdable kinds | The owning system | Which kinds may enter (a tool slot accepts only `tool`) |

A slot is either **empty** or holds **one holdable id and a count** from 1 to
that slot's *stack cap*, `stack_max × stack_scale` (formula F2). Every slot of
a container has the same scale. Slots are indexed 0 to `slots − 1`; *overflow
slots* (Edge Cases) can sit only after the last index. Containers in the MVP
and their values (each set by its owning design doc; the values here are
provisional starting points):

| Container | Owner | `slots` | `stack_scale` | Accepts | Effect |
|---|---|---|---|---|---|
| A player's pack | Pack | 16 (prototype `pack_slots`) | 1 | ore, material, item | One ore piece per slot, as retested |
| A stash | Stash | 24 | 10 | ore, material, item, tool, gear | A slot holds 10 ore of one kind |
| A player's carried tools | Tools & Gear | 3 (keys 1 to 3, Input) | 1 | tool | One tool per slot |

**Who may touch which container.** A request may take from or add to only the
requesting player's own carried containers and the shared containers its
owning rule allows (a stash at home). No request can spend or move another
player's pack. ADR-0003's single `carried` becomes one set of carried
containers per player, which needs an ADR-0003 amendment before co-op (Open
Questions 10); in the MVP there is one player, so nothing changes on disk.

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
or more; a count of 0 or less, an id the catalog does not know, a `Move` from a
slot to the same container, or the same container listed twice in a
`TakeCost` source list is **Malformed** and never reaches the operation
(Session & Authority, R5). Every operation reports what it moved, and posts it
to the ledger (R7).

| Operation | Effect | All-or-nothing? |
|---|---|---|
| `Add(id, n)` | Puts up to `n` units in: first tops up slots already holding `id` whose count is below the cap, in slot order, then fills empty indexed slots in slot order (never overflow slots). Returns the number placed, `p` (formula F3). The `n − p` units that did not fit stay wherever they came from: an add never destroys anything. Never refused: a container with no room returns 0, and the caller decides whether 0 is a refusal | No: returns `p`, which may be 0 |
| `AddAll(id, n)` | As `Add`, but only if all `n` fit; otherwise changes nothing | Yes: refused with **No room** |
| `Take(id, n)` | Removes `n` units of `id`, from the last matching slot backwards; a slot that reaches 0 becomes empty. Returns the `n` units taken, to be passed to a container, the world or a named sink | Yes: refused with **Not enough** if fewer than `n` are present |
| `Move(from, slot, to, id, n)` | Takes up to `n` units of `id` from one slot of `from` (`n` is clamped to the slot's count) and `Add`s them to `to`, in `Add`'s order (there is no target slot: a drag onto a particular slot is not supported in the MVP); whatever does not fit stays in the source slot. Returns the number moved | No: returns the number moved; refused only as below |
| `TakeCost(cost, sources)` | Takes a whole *cost* (a list of id and count pairs) from an ordered list of distinct containers, drawing each id from the first container first. Returns what was taken | Yes: refused with **Not enough** naming the first missing id in the cost's order if the sources together hold too little of any id |
| `Exchange(cost, sources, out_id, out_n, target)` | Crafting's step: `TakeCost` followed by `AddAll(out_id, out_n)` into `target`, with the room for the output checked on the containers as they would be *after* the cost is taken. Both happen, or neither | Yes: refused with **Not enough** or **No room** |
| `Clear(container, sink)` | Empties every slot into one named sink (R10: death, storm), returning what was removed for the ledger. Moving contents somewhere else is always `Move`, never `Clear` | Yes |
| `Remove(container)` | Deletes an empty container; its `container_id` is never used again | Yes: refused with **Not empty** otherwise |

- *Moves are the only way between containers.* There is no "drop into the
  void": discarding an item is its own request owned by the system that
  allows it (Pack's drop puts it into the world on a run; at home, Stash or
  Pack decide). Anything that leaves a container either enters another one,
  enters the world, or is consumed by a named sink (R10).
- *One step.* An operation and every container it touches change inside one
  Simulation step, and the whole result lands in one snapshot (ADR-0003,
  Decision 3), so a crash can never leave a unit in two places or none.
- *Slot order is stable.* Operations never reorder slots; there is no
  automatic sort. A player-facing sort or split, if wanted later, is a
  separate operation owned by Pack or Stash, not something built from `Move`
  (which has no target slot).
- **Refusal reasons owned here** (a closed list, added to Session & Authority's
  own): **No room** (an `AddAll` or `Exchange` that does not fit, or a `Move`
  whose target has room for no unit), **Not enough [item]** (a `Take`,
  `TakeCost` or `Exchange` short of units, or a `Move` whose source slot is
  empty or holds a different id), **Not empty**, **Can't go there** (the target
  does not accept that kind). When several apply, the first in this order is
  given: **Malformed**, **Can't go there**, **Not enough**, **No room**.

**R7. Conservation and the ledger.** Outside the named faucets (R10), no
operation creates a unit; outside the named sinks, no operation destroys one.
Every operation posts its movements to a **ledger**, a list of events each
holding an id, a count and where the units went from and to: a container, the
*world* (a unit lying on the asteroid or in the valley, owned by Mining, Pack's
drop or Gathering), a faucet or a sink. For every id, the units in all
containers plus the units recorded as in the world plus the units recorded as
consumed by sinks equals the units recorded from faucets. This is the rule
every acceptance test of this document counts against. Picking a unit up from
the world is atomic: it leaves the world in the same step it enters a
container, or not at all.

**R8. Carried versus stored.** What a player holds is *carried*: that player's
pack and carried tool slots (ADR-0003, Decision 3: "every item is saved in
exactly one place, a container or `carried`"). Everything in a stash is
*stored*. On a player's death or an abandoned run, Run Flow calls `Clear(…,
death)` on **that player's** carried containers only; that is the death sink.
A storm calls `Clear(…, storm)` (and `Remove` for a destroyed piece) on an
unsheltered stash through Stash (ADR-0003, Decision 6); that is the storm
sink. Nothing else in the MVP removes stored items without a player's request.

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

- **At risk is more than haul.** Losing a better drill or a canister must not
  read as free. A second readout, **at risk**, shows what the player stands to
  lose on death: the pack's worth plus, for each carried tool and canister,
  the worth of its recipe's inputs (its *replacement worth*, computed from the
  catalog at validation time). At risk is shown, not banked: it is never part
  of haul worth, the best-haul statistic or the pack glow. Pack and Run HUD
  decide how both readouts look.
- **Haul worth is crew-wide.** A run's *haul worth* is the sum of every crew
  member's pack worth at extraction minus the sum at launch, floored at 0 (F5
  applied per pack). Handing ore to a partner during a run cannot inflate it,
  and ore carried out and back is not counted. Run Flow records both sums.

**R10. Faucets, sinks and pacing.** The MVP economy is this closed table. A
system that adds a faucet or a sink adds a row here.

| Flow | Kind | Owner | Recurs? |
|---|---|---|---|
| Gathering rock and stick in the valley | Faucet | Gathering, Home Valley | Endless (the valley never runs out: concept, Recovery from failure) |
| Mining ore on a run | Faucet | Mining, Asteroid World | Each run |
| The output of a craft (a tool, a canister, refined ore) | Faucet | Crafting | Each craft; always paired with its cost in one `Exchange` |
| Building a piece (its cost) | Sink | Building | While the home grows |
| Repairing the home (one action, at a material cost) | Sink | Building | After storms, mostly for starter pieces |
| Crafting a tool, workbench, canister or refined ore (its cost) | Sink | Crafting | Each time a tool is lost, a canister used or ore refined |
| A canister used on a run | Sink (consumed) | Oxygen | Each run that uses one |
| Everything a player carries, on that player's death or an abandoned run | Sink (lost) | Run Flow | Each failed run |
| An unsheltered stash's contents in a storm | Sink (lost) | Storms, through Stash | Rarely; preventable by a roof |
| A unit dropped or left in the world (ore that did not fit, a dropped item) | World (not a sink: it can be picked up again until the run or scene ends, when what is left is lost with the world) | Mining, Pack | When a pack is full |

Rules on the table:

- **Main family.** A cost's *main family* is the family with the largest share
  of the cost's worth (count × worth per family); a cost whose two families
  tie is refused by validation, and a cost of worth 0 (valley materials only)
  has no main family.
- **Recurring or one-off.** Every cost carries a `recurrence` field set by its
  owner: `per_run` (paid on an ordinary run, such as a canister), `per_death`
  (paid after a death, such as re-making a lost drill), `per_storm` (repair)
  or `one_off` (a piece or workbench built once).
- **Coverage.** Each ore family must be the main input of, or a share of at
  least a fifth of the worth of, at least one `per_run` or `per_death` cost, so
  it is still spent after the home is fully built; and the main input of at
  least one `one_off` cost. Data validation checks it (Acceptance Criteria)
  so neither family can become decoration. A `per_storm` repair does not
  count towards the recurring half, because a finished home of run materials
  needs little repair. The Milestone A catalog, which has no ore faucet, is
  exempt.
- **The MVP ceiling is accepted.** Once the home is built in run materials,
  the recurring sinks (canisters, refining, re-making lost drills, repair,
  death) are the only ore sinks, and ore will pile up in the stash for a player
  who rarely dies. That pile must be *visible wealth* (Pillar 5): Stash shows
  its contents in the world, a stash visibly filling with ore, not only as a
  panel (a requirement on the Stash design doc). The pacing report prints the
  projected surplus per run after the ceiling (F4). A placeable ore trophy or
  inlay piece with a rising cost is recorded as the lead candidate for a
  lasting sink (Open Questions 1). Tier 1a's gear tiers are where a lasting
  sink arrives at the latest.
- **No upkeep.** No sink comes due on its own: nothing decays, nothing is
  charged on a timer (anti-pillar). Repair is only needed after a storm, and
  storms are forecast.
- **Rebuild guarantee.** From empty containers, valley materials alone must
  reach a workbench, a hammer, a basic drill and a shelter repair (concept,
  Recovery from failure). This system guarantees it by giving rock and stick
  stack sizes and worth that Building and Crafting can price against
  (`stack_max` 20, worth 0); the costs themselves belong to them. It assumes a
  run on the suit's own oxygen, without a canister, is possible (Oxygen's
  rule), so canisters are not part of the rebuild set.

**R11. Valley materials and other items in the MVP.**

| Id | Kind | Family | Tier | `stack_max` | Worth | Notes |
|---|---|---|---|---|---|---|
| `material.rock` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `material.stick` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `item.canister.oxygen` | item | none | 0 | 2 | 0 | Made by Crafting, used by Oxygen; the stack of 2 matches the prototype's `canister_carry` so a single pack slot holds a run's canisters. Oxygen decides how many may be carried; validation warns when `stack_max` differs from Oxygen's `canister_carry` |

Every ore has `stack_max` 1 (one piece per slot in the pack; ten per stash
slot through the stash's scale). Tools have `stack_max` 1 and worth 0;
their other fields belong to Tools & Gear.

**R12. Milestone A subset.** Milestone A (the valley home) has no runs, so it
uses only rock, stick, the hammer and the basic drill, the pack, stashes,
carried tools and every operation in R6. Ore definitions exist in the catalog
from the start (so Building and Crafting can name ore costs for later pieces),
but no faucet produces ore until Milestone B. The criteria that need ore in
play (worth readout and glow, at risk, haul worth, coverage) are marked [B]
under Acceptance Criteria.

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
| Live | Exists, accepts operations | The owner creates it: a player's pack and carried tool slots with that player's profile; a stash when its piece is built (Stash, Building) | Its owner removes it |
| Removed | Gone; its id is never used again, and any operation naming it is Malformed | `Remove` on an empty container, or `Clear(…, storm)` then `Remove` when a storm destroys its piece (ADR-0003, Decision 3) | Never |

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
| Pack (8) | Out | Each player's pack is a container (16 slots, scale 1); pick-up uses `Add` from the world, drop uses `Take` into the world; worth (F5) for the glow and readout, and at risk (R9) | Pack owns the container's values and its requests |
| Tools & Gear (9) | Out | Carried tool slots are a container; tool and gear definitions carry R1's fields; `drill_tier` on ore is compared with a drill's tier | Tools & Gear owns tool fields and drill tiers |
| Gathering (10) | Out | Faucet: `Add(material.rock or material.stick, n)` into the pack; what does not fit stays in the world | Gathering |
| Building (11) | Out | `TakeCost` for a piece or a repair; `Remove` of an empty container when a stash piece is taken down; must follow R2's family use and R10's coverage, and tag each cost's `recurrence` | Building owns piece costs |
| Stash (12) | Out | Each stash is a shared container (24 slots, scale 10); `Move` between pack and stash; `Clear(…, storm)` and `Remove` for Storms; shows its contents in the world (R10) | Stash owns its containers and its requests |
| Crafting (13) | Out | `Exchange` for every recipe (cost and output in one operation); the refine-down recipes (R2); the amber share in canister and better-drill recipes (R10); `recurrence` on each recipe | Crafting owns recipes |
| Storms (14) | Out (through Stash) | The storm sink: `Clear(…, storm)` on unsheltered stashes, then `Remove` on destroyed ones | Storms decides; Stash performs |
| Home HUD & Panels (15), Run HUD (24) | Out | Container contents (ids and counts), worth totals, refusal reasons; display data by id | HUDs own the look |
| Oxygen (19) | Out | Canister sink: `Take(item.canister.oxygen, 1)` from the user's pack when one is used; `canister_carry` checked against the canister's `stack_max` (R11) | Oxygen |
| Mining (21) | Out | Ore fields `toughness` and `drill_tier`; faucet: `Add(ore.*, 1)` into the miner's pack when a piece breaks free, or the piece goes to the world (ledger, R7) | Mining owns the drilling formula and what happens to a piece that does not fit |
| Run Flow (22) | Out | Death sink: `Clear(…, death)` on the dying player's carried containers; crew haul worth (R9: sums of F5 at launch and extraction) for statistics; the move of the haul into a stash is Stash's | Run Flow |
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
| `W1` | int | 10–100, a multiple of 5 | design guideline (this formula) | Worth of a tier-1 ore piece: 10 |
| `R` | float | 2.5–6 | design guideline (this formula) | Worth ratio between tiers: 3.5 |
| `5` | int | — | constant | Rounding grain, so worths read as round numbers |

**Output Range:** 10, 35, 120 with the values above. With `R` at 2.5: 10, 25,
60; at 6: 10, 60, 360. With `W1` a multiple of 5 and `R` at least 2.5, no tier
floors to 0 and no two tiers tie.

**Example:** `t` = 3: 10 × 3.5² = 122.5; 122.5 / 5 = 24.5, floored to 24; 24 × 5
= **120**.

**Why these numbers.** F1 is a design rule for setting each ore's `worth`
field, not a run-time calculation: the field holds the result, and the
designer may override one ore's worth with a rationale. The test is *worth per
slot*, because what binds a run is the 16-slot pack and the time exposed, not
drilling seconds: worth per slot rises 3.5 times per tier, twelvefold from tier
1 to tier 3, which is what makes dropping cheap ore for a better seam a real
choice (Player Fantasy, framing 3). Tier 1 stays worth a slot because recipes
name it and refine-down makes it from higher tiers, not because of its worth
(R2). Worth per second of drilling, at the weakest drill able to mine each tier
(basic for tiers 1 and 2, better for tier 3), also rises: 10 / 2.0 = 5, 35 /
3.5 = 10 and 120 / (6.0 / 2) = 40 per second, so a deeper seam pays more for
the noise made. The prototype's four tiers ran 5, 10, 18, 37 per second.

**Boundaries.** `t` = 0 is not an ore tier (valley materials have worth 0 by
R11, not by F1). Below `R` 2.5 (outside the range), worth per slot gains too
little per tier to change a decision. Validation reports (does not refuse) an
ore whose worth per second at its weakest capable drill is lower than the tier
below it (Acceptance Criteria 17).

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

`room(id, c) = Σ over indexed slots s of c holding id ( max(0, cap(id, c) − count(s)) ) + empty(c) × cap(id, c)`

`p = 0` if `c` does not accept the kind of `id`; otherwise `p = min(n, room(id, c))`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `n` | int | 1–2,147,483,647 | calculated (the request) | Units offered |
| `count(s)` | int | 1–99,900 | calculated (container state) | Units in a slot holding `id`; can exceed the current cap after a patch (Edge Cases) |
| `empty(c)` | int | 0–slots | calculated (container state) | Empty indexed slots in `c` (overflow slots never count) |
| `cap(id, c)` | int | 1–99,900 | calculated (F2) | Stack cap |
| `p` | int | 0–`n` | calculated | Units placed; `n − p` stay at their source |

**Output Range:** 0 (no room, or the container does not accept the kind) to
`n`; never negative, because a slot at or above its cap (after a patch lowered
the cap) adds 0, not a negative room. `room` is at most 200 × 99,900 = 19,980,000, within a 32-bit integer.

**Example:** a pack (16 slots, scale 1) holding 3 sticks in slot 1, 15 other
slots full of ore, is offered 20 sticks: room = (20 − 3) + 0 × 20 = 17, so
**p = 17**; 3 sticks stay on the ground.

**Boundaries.** `n` = 0 never arrives (Malformed, R6). A full container gives
`room` = 0 and `p` = 0; `AddAll` is then refused with **No room** and `Add`
returns 0 without being refused (the caller decides whether 0 is a refusal:
Mining and Gathering treat it as **No room**).

### F4. Pacing: a cost's price in runs

The price_in_runs formula is defined as:

`H_attempt = H × success_rate`
`worth_price(cost) = Σ over (id, count) in cost ( count × worth(id) ) / H_attempt`
`yield_price(cost) = max over (id, count) in cost ( count / expected_yield(id) )`
`price(cost) = max(worth_price(cost), yield_price(cost))`
`ceiling_runs = Σ over every one-off cost k in the MVP ( price(k) )`

`worth_price` alone treats ore as interchangeable, but nothing converts ore
upward: a cost of 24 seaglass needs 24 seaglass, which may take several runs
even when its worth is small. `yield_price` captures that: how many average
attempts it takes to bring home enough of the scarcest id. `expected_yield`
comes from Asteroid World's ore distribution once it is designed; until then
`yield_price` is not computed and the report says so.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `count` | int | 1–999 | data file (a piece's or recipe's cost) | Units of one input |
| `worth(id)` | int | 0–100,000 | data file (holdable definition) | Worth of one unit |
| `H` | int | 100–5,000 | data file (`pacing_haul_worth`) | Expected haul worth of one *successful* MVP run: 600, an **unmeasured placeholder** |
| `success_rate` | float | 0.1–1 | data file (`pacing_success_rate`) | Share of runs that extract: 0.7, placeholder |
| `H_attempt` | float | 10–5,000 | calculated | Expected haul worth per run attempted, deaths included |
| `expected_yield(id)` | float | > 0 | Asteroid World (not yet designed) | Average units of `id` brought home per attempted run |
| `price` | float | 0 and up | calculated | How many average runs the cost takes |
| `ceiling_runs` | float | 0 and up | calculated | Runs to build everything once |

**Output Range:** 0 for costs paid only in valley materials (worth 0, no ore
yield). Target bands, which Building and Crafting price against, are tuning
values (Tuning Knobs):

| Cost | Band | Why |
|---|---|---|
| A canister (`per_run`) | 0.15 runs or less | Paid most runs; must not tax every outing |
| Re-making a lost drill (`per_death`) | 0.5 to 1.0 runs | Losing the better drill should sting (Pillar 3: "this pillar picks the sting"); the prototype's better drill cost about 0.66 of its retested haul |
| A repair after a storm (`per_storm`) | 0.25 runs or less | Storms are forecast and preventable; repair must not become a chore (systems index: one action repairs the whole home) |
| A one-off piece or workbench | 0.5 to 3 runs | |
| `ceiling_runs` | `pacing_ceiling_runs_min` to `pacing_ceiling_runs_max` (15 to 30, about 4 to 8 hours of 10 to 15-minute runs) | |

A death already costs everything carried, on average about one successful
haul and up to 1,920 worth (a pack of tier 3), plus the drill; the bands do not
claim that a failed run is cheap, only that recovering the *tools* takes a
known amount of play.

**Example:** a better drill costing 8 `ore.seaglass`, 4 `ore.verdite` and 2
`ore.ochre` (teal-main, as R2 asks of a tool, with an amber share): worth
price (80 + 140 + 20) / (600 × 0.7) = 240 / 420 = **0.57 runs**, inside the
`per_death` band.

**Why these numbers.** `H` = 600 is the retest's one measured pack worth, 590
(`prototypes/star-haul/REPORT.md`), rounded, but that pack was valued at the
prototype's four-tier worths (10, 30, 80, 220), not this document's 10, 35,
120, so its value under the new curve is unknown: `H` is a placeholder until
Run Flow logs at least three real successful hauls, and `success_rate` a guess
until it logs attempts. The 15 to 30 run ceiling is a guess at how long the
MVP's progression should last before Tier 1a's gear tiers take over;
provisional, for the designer's review at the first playable. The home is the
host profile's in the MVP; whether a crew shares one home or each player has
their own, and how crew size scales `H`, is the co-op ADR's.

**Boundaries.** `H` is at least 100 and `success_rate` at least 0.1, so
`H_attempt` is at least 10 and never 0. F4 is an observation the data check
prints for every cost (a report, never a refusal: "helpers emit observations,
never verdicts"); a value outside its band is a balance question for the cost's
owner. The report also prints, per family and tier, the share of each cost's
worth, and the projected ore surplus per run once every one-off cost is paid
(`H_attempt` minus the expected recurring spend), so the MVP ceiling is a
known number.

### F5. Worth of a container

The container_worth formula is defined as:

`W(c) = Σ over filled slots s of c ( count(s) × worth(id(s)) )`

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `count(s)` | int | 1–99,900 | calculated (container state) | Units in the slot |
| `worth(id(s))` | int | 0–100,000 | data file | Worth of one unit |
| `W(c)` | int, 64-bit | 0 to about 2 × 10¹² | calculated | Total worth |

**Output Range:** a pack with tier-3 ore in every slot: 16 × 1 × 120 =
1,920. Haul worth (R9) applies F5 to every crew member's pack at launch and at
extraction. An empty container, or one holding only worth-0 items, is 0.

**Example:** a pack with 6 `ore.ochre`, 5 `ore.gild`, 2 `ore.sunstone` and 3
sticks: 60 + 175 + 240 + 0 = **475**.

**Boundaries.** The sum is kept as a 64-bit integer: the theoretical maximum
(200 slots × 99,900 × 100,000) overflows 32 bits even though no MVP container
comes near it. Lifetime haul statistics built from F5 are 64-bit for the same
reason (Save & Load).

## Edge Cases

Systems-designer lens applied to the Core Rules and Formulas as written: zero,
maximum, out of range, two requests at once, a data change under a save, and
degenerate strategies. Revised after the first reviews.

**Full and partial containers**

- **If an ore piece breaks free while the miner's pack has no room** (F3 gives
  0): this system places nothing and destroys nothing; the piece stays in the
  world (ledger, R7). Mining owns what the piece does there and the "pack full"
  cue (Run HUD).
- **If a gather or a move offers more than fits** (F3 gives `p` < `n`): `p`
  units move and `n − p` stay where they were (on the ground, in the source
  slot). The result reports `p` so Presentation can show "3 sticks left".
- **If a craft's output would only fit in a slot its own cost empties**:
  `Exchange` checks the output's room on the containers as they would be after
  the cost is taken, so the craft is accepted; if the output would not fit even
  then, neither happens and the craft is refused with **No room**.
- **If `TakeCost` draws one id from several sources**: the first source in the
  order gives all it has before the next is touched (Building and Crafting
  choose the order, for example pack first, then the nearest stash). Within
  one container, units come from the last matching slot backwards (R6). The
  same container listed twice is Malformed.
- **If a request offers an enormous count** (up to the 32-bit maximum):
  `p` is bounded by `room`, at most 19,980,000 (F3), so nothing overflows.
- **If a `Move` names a source slot holding a different id, or an empty one**:
  refused with **Not enough**; **if its target does not accept the kind**:
  **Can't go there**, which is checked first (R6's precedence).
- **If a `Move` names the same container as source and target**: Malformed;
  rearranging slots is not an MVP feature.

**Two things at once**

- **If two requests touch the same slot in the same tick** (co-op, or a double
  click): Session & Authority runs requests one at a time in arrival order
  (its R4); each operation sees the state the previous one left. The second
  gets what remains, possibly **Not enough** or **No room**. No unit is ever
  moved twice.
- **If a player's request names another player's pack**: refused as
  Malformed (R4, who may touch which container).
- **If a storm clears a stash while the player is on a run**: no request can
  touch a stored container during a run, and the storm is resolved at the end
  of the run (ADR-0003, Decision 6), before the haul is placed. The haul then
  goes wherever Stash puts it, never into a container already removed.
- **If the player removes a stash piece that still holds items**: refused with
  **Not empty** (ADR-0003, Decision 3), unless the Stash design doc first moves
  every unit into the player's carried containers with `Move` in the same step
  and snapshot; if they do not all fit, the removal is refused with **No
  room** and nothing moves. `Clear` is never used to relocate units.

**Data changes under a save**

- **If a patch lowers an item's `stack_max` below a count already saved**: the
  slot keeps its count (nothing is destroyed). `Add` skips that slot while its
  count is at or above the new cap (its room counts as 0, F3); `Take` and
  `Move` out work normally. Save & Load does not split or trim it.
- **If a patch lowers a container's `slots` below a filled slot**: the extra
  filled slots are kept as *overflow slots* after the last index. They accept
  only `Take` and `Move` out, are never counted as empty and never receive an
  `Add`, and are trimmed only from the end once empty, so the indexed slots
  never shift and the save's slot order stays valid. Pack and Stash show them
  as over capacity (UI Requirements).
- **If a holdable id is retired** (Game Data & Tuning, R14): its release must
  include a Save & Load migration that maps it to another id, or removes the
  units with a notice to the player. Catalog validation cannot see migrations
  (they are pure functions on the save), so this is checked by Save & Load's
  migration-coverage test, not here.
- **If a patch changes an ore's `worth`**: saved statistics keep the numbers
  recorded at the time; readouts use the new value from then on.

**Zero and boundaries**

- **If a container holds only worth-0 items**: its worth is 0, so the pack does
  not glow and an extraction with only rocks and sticks records a haul of 0.
- **If a cost is paid only in valley materials**: its price in runs is 0 (F4),
  which is correct for the rebuild set (R10) and reported, not refused.
- **If a cost names the same id twice, or a count of 0, or has two families
  tied for its main family**: data validation refuses the definition, so a
  malformed cost never reaches `TakeCost`.
- **If a recipe for the first drill of tier `k` needs an ore whose `drill_tier`
  is `k` or higher**: that drill could never be made, because its ingredients
  need it. Data validation refuses it (Acceptance Criteria 18). Refined ore
  counts: a recipe may need tier-2 ore that refine-down makes from tier 3 only
  if tier 2 can also be mined with a lower drill.
- **If the kind does not fit the container** (a tool offered to the pack, ore
  to a tool slot): `Add` returns 0 (never refused) and `AddAll` or `Move` is
  refused with **Can't go there**.
- **If an operation names a removed container**: Malformed.

**Degenerate strategies**

- **Inflating the haul by carrying ore out and back, or passing it between
  players.** Haul worth is the crew's total pack worth at extraction minus the
  total at launch, floored at 0 (R9), so neither counts. The pack readout
  during the run still shows the pack's full worth, because that is what the
  player stands to lose.
- **Keeping valuables in the pack at home to dodge storms.** What is carried at
  home is kept by storms (ADR-0003: "what the player carries at home is
  kept"), so the pack is 16 storm-proof slots. *Accepted:* it holds one ore
  piece per slot, it all goes out at risk on the next run unless moved, and a
  roof protects far more. It stays minor only while the pack's `stack_scale` is
  1: raising it would need Storms to cover carried items (a dependency noted
  for the Pack and Storms design docs).
- **Refining to dodge pacing.** Refine-down never raises worth (R2), so it can
  only turn a rich haul into cheaper ore, never the reverse.
- **Stockpiling and never dying.** Once the home is built, ore piles up (the
  accepted MVP ceiling, R10). It is visible in the stash in the world, and is
  the expected end state of the MVP's progression, not an exploit.
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
| `pacing_success_rate` | float | 0.7 | 0.1 | 1 | 0.05 | `share` | `restart` | Every cost looks expensive; deaths over-counted | Deaths ignored; costs look cheap |
| `band_canister_max_runs` | float | 0.15 | 0.01 | 1 | 0.01 | `multiplier` | `restart` | Canisters flagged even when trivial | Canisters tax every run without a flag |
| `band_drill_loss_min_runs` | float | 0.5 | 0.05 | 5 | 0.05 | `multiplier` | `restart` | A lost drill can be nearly free without a flag | Honest drill costs flagged cheap |
| `band_drill_loss_max_runs` | float | 1.0 | 0.05 | 5 | 0.05 | `multiplier` | `restart` | Honest drill costs flagged dear | A lost drill can cost several runs without a flag |
| `band_repair_max_runs` | float | 0.25 | 0.01 | 2 | 0.01 | `multiplier` | `restart` | Repairs flagged even when trivial | Repair becomes a chore without a flag |
| `band_one_off_min_runs` | float | 0.5 | 0.05 | 10 | 0.05 | `multiplier` | `restart` | Trivial pieces never flagged | Honest cheap pieces flagged |
| `band_one_off_max_runs` | float | 3 | 0.05 | 10 | 0.05 | `multiplier` | `restart` | Honest pieces flagged dear | A grind of a piece goes unflagged |

Constraints: `pacing_ceiling_runs_min ≤ pacing_ceiling_runs_max`,
`band_drill_loss_min_runs ≤ band_drill_loss_max_runs`,
`band_one_off_min_runs ≤ band_one_off_max_runs`. Owner: Ore & Item Economy.
Rationale: `pacing_haul_worth` is an **unmeasured placeholder** (the retest's
pack of 590 was valued at the prototype's old worths, F4); the success rate is
a guess; the bands come from F4's table (the run counts are ratios, unit
`multiplier`); the ceiling band is a first guess at 4 to 8 hours of MVP
progression. **All are provisional**
until real runs record haul worths. `pacing_haul_worth` should follow the
typical haul once Run Flow logs it: if the median successful haul moves, F4's
prices move with it.

### Knobs on definitions (Game Data & Tuning, R1: one thing's numbers live on it)

| Field | On | MVP values | Safe range | Too low | Too high | Interacts with |
|---|---|---|---|---|---|---|
| `worth` | each ore | 10 / 35 / 120 per tier (F1) | 1 to 100,000 for ore (in `tuning.ore_limits`) | Deep seams stop paying for their risk; "one more seam" loses its pull | A single seam outweighs the pack; tier-1 ore is kept only because recipes need it | Worth per slot (F1); `pacing_haul_worth` (F4); refine-down rates (R2) |
| `toughness` | each ore | 2.0 / 3.5 / 6.0 s per tier at drill power 1 | 0.5 to 20 s | Drilling is no bet: little noise and time per piece | Seams feel like a chore; hunters arrive before a pack fills | Worth (F1); Mining's drill power; Perception's noise per second of drilling |
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
  coins: each stack lands with its own small sound whose pitch rises with
  tier, in slot order (slot order is stable, R6, so the sequence is the same
  every time). This is Stash's and Audio's to deliver.

## UI Requirements

This system has no screen of its own; it defines what the screens show.

- **Item names, descriptions and icons** come from display data by id (Game
  Data & Tuning, R7). Every holdable has all three before a release build.
- **Counts** are shown as whole numbers; a stack at its cap shows that it is
  full. Overflow slots (Edge Cases) are shown as over capacity, with a clear
  mark that nothing more can be added.
- **At risk** (R9) is shown beside the pack's worth during a run: the pack's
  worth plus the replacement worth of carried tools and canisters, labelled
  as what a death would cost, never as haul.
- **The stash pile is visible in the world** (R10): a stash shows how full it
  is, and with what family, without opening its panel (Stash and Building
  decide how).
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
| R1, R2, Tuning Knobs | Game Data & Tuning | Kinds, id rules, R1 (numbers on definitions), R5 units (`credits`, `count`, `s`), R1 limits sets, R2 shared holdable fields, R7 display data, R9 validation, R14 retired ids | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R6, Edge Cases | Session & Authority | R4 request handling, R5 session check and its refusal list | [session-and-authority.md](session-and-authority.md) |
| R4 | Input | Tool keys 1 to 3, which set the carried tool slots | [input.md](input.md) |
| R2, Visual/Audio | Art bible | Ore colour table, trim rule, colourblind backups | [art-bible.md](../art/art-bible.md) Section 4 |
| R3, F1, F4 | Browser prototype | Toughness and worth curves; retest pack worth 590 | `prototypes/star-haul/config.js`, `prototypes/star-haul/REPORT.md` |
| R8, Interactions | ADR-0003 | Decision 3 (containers, `carried`, the contract's owner), Decision 6 (storm resolution) | [adr-0003](../../docs/architecture/adr-0003-home-and-storm-persistence.md) |
| R5, Edge Cases | ADR-0002 | Stable ids, migrations, best-haul statistics | [adr-0002](../../docs/architecture/adr-0002-persistence.md) |
| R10 | Game concept | Recovery from failure (rebuild guarantee; the valley never runs out), anti-pillars | [game-concept.md](game-concept.md) |

## Acceptance Criteria

QA lens applied to Sections C, D and E as revised: one criterion or more per
core rule and per formula, boundary values for every formula, cross-system
criteria, and a story type for each. **Logic** criteria are EditMode unit
tests on the Simulation or on the validator and pacing-report code (no engine,
no files: ADR-0001), built from factory functions and a minimal cost schema
owned by this document (a list of `{id, count}` with a `recurrence` tag), not
from the shipped catalog or from Building and Crafting's undesigned recipes;
**Config** criteria read the shipped catalog (advisory, a smoke check);
**Integration** needs two systems or the save; **Visual/UI** needs a retained
screenshot in `production/qa/evidence/`. **[B]** marks criteria that need ore
in play and cannot run before Milestone B (R12).

**Holdables and data (R1 to R3, R11)**

1. *(Logic)* **GIVEN** a stash container and the known piece id
   `piece.wall.stick`, **WHEN** `AddAll(piece.wall.stick, 1)` is called,
   **THEN** it is refused with **Can't go there** and the container is
   unchanged; `Add` with the same arguments returns 0 and is not refused.
2. *(Logic)* **GIVEN** holdable definitions with, one per case, `stack_max` 0
   or 1,000; an ore with `worth` 0 or 100,001; a material with `worth` 5; an
   ore with family `none` or a material with family `amber`; an ore with
   `tier` 0 or 4; `toughness` 0.4 or 21; `drill_tier` 0 or 4, **WHEN** the
   catalog is validated, **THEN** each fails, naming the id and the field;
   `stack_max` 1 and 999 and an ore with worth 1 pass.
3. *(Config)* **GIVEN** the shipped catalog, **WHEN** it is loaded, **THEN** it
   holds exactly the six ores of R2 with the family, tier, worth, toughness and
   drill tier in R2's table, and the three items of R11 with their
   `stack_max` and worth 0.
4. *(Logic)* **GIVEN** a canister with `stack_max` 2 and Oxygen's
   `canister_carry` 3, **WHEN** validated, **THEN** a warning names both values
   and the catalog still becomes Ready.

**Containers and operations (R4, R6, F2, F3)**

5. *(Logic)* **GIVEN** a container with scale 1 and one with scale 10, **WHEN**
   the cap is asked for an ore (`stack_max` 1) and for `material.stick`
   (`stack_max` 20), **THEN** the caps are 1 and 10 for the ore and 20 and 200
   for the stick; **GIVEN** `stack_max` 999 and scale 100, **THEN** 99,900.
6. *(Logic)* **GIVEN** a 16-slot pack (scale 1) with 3 sticks in slot 0 and the
   other 15 slots each holding one ore, **WHEN** `Add(material.stick, 20)` is
   called, **THEN** it returns 17, slot 0 holds 20, and the caller still holds
   3 sticks; **WHEN** `Add(material.stick, 2,147,483,647)` is called on an
   empty 200-slot container of scale 100, **THEN** it returns 19,980,000.
7. *(Logic)* **GIVEN** a 4-slot container (scale 1) whose only filled slot is
   slot 2, holding 5 sticks, **WHEN** `Add(material.stick, 30)` is called,
   **THEN** slot 2 is topped up to 20 first, then slot 0 receives 15, and slots
   1 and 3 stay empty.
8. *(Logic)* **GIVEN** a full container, **WHEN** `AddAll(id, 1)` is called,
   **THEN** it is refused with **No room** and every slot is unchanged.
9. *(Logic)* **GIVEN** a container with 4 rocks in slot 0 and 4 in slot 2,
   **WHEN** `Take(material.rock, 6)` is called, **THEN** slot 2 becomes empty,
   slot 0 holds 2 and 6 rocks are returned; **WHEN** `Take(material.rock, 3)` is
   then called, **THEN** it is refused with **Not enough rock** and slot 0
   still holds 2.
10. *(Logic)* **GIVEN** a pack slot with 5 sticks and a stash with room for
    only 2 more sticks, **WHEN** `Move(pack, slot, stash, stick, 5)` is called,
    **THEN** it returns 2 and the pack slot holds 3; **WHEN** `n` is 9, **THEN**
    it is clamped to 5.
11. *(Logic)* **GIVEN** one fixture per case: a `Move` from an empty slot; from
    a slot holding a different id; into a full target; into a target that does
    not accept the kind; from an empty slot into a target that does not accept
    the kind; with the same container as source and target, **THEN** the
    refusals are **Not enough**, **Not enough**, **No room**, **Can't go
    there**, **Can't go there** (precedence) and **Malformed**, and both
    containers are unchanged each time.
12. *(Logic)* **GIVEN** a pack with 3 `ore.gild` and a stash with 5, and a cost
    of 6 `ore.gild` and 1 `ore.verdite` with neither container holding verdite,
    **WHEN** `TakeCost(cost, [pack, stash])` is called, **THEN** it is refused
    with **Not enough verdite** and both containers are unchanged; with one
    verdite added to the stash, the same call takes all 3 from the pack, 3 from
    the stash and the verdite; **GIVEN** `[pack, pack]` as sources, **THEN**
    Malformed.
13. *(Logic)* **GIVEN** a 16-slot pack (scale 1) with 15 slots each holding one
    ore and slot 15 holding 4 `material.stick`, a recipe costing 4
    `material.stick` and producing 1 `tool.hammer` into the pack, **WHEN**
    `Exchange` runs, **THEN** it is accepted and slot 15 holds the hammer;
    **GIVEN** a recipe producing 2 canisters of `stack_max` 1 into the same
    pack, **THEN** it is refused with **No room** and nothing is taken.
14. *(Logic)* **GIVEN** a stash holding items, **WHEN** `Remove` is called,
    **THEN** it is refused with **Not empty**; **WHEN** `Clear(stash, storm)`
    and then `Remove` are called, **THEN** `Clear` returns exactly the units
    that were there, the ledger records them as consumed by the storm sink, the
    container no longer exists, and any later operation naming it is
    Malformed.
15. *(Logic)* **GIVEN** a tool and an ore, **WHEN** `AddAll`, `Add` and `Move`
    offer the tool to the pack and the ore to a carried tool slot, **THEN**
    `AddAll` and `Move` are refused with **Can't go there** and `Add` returns
    0.
16. *(Logic)* **GIVEN** two players' packs, **WHEN** player A's request names
    player B's pack in a `TakeCost` or `Move`, **THEN** it is Malformed and
    nothing changes. *(R4)*

**Conservation and interchangeability (R5, R7)**

17. *(Logic)* **GIVEN** a pack, two stashes, a world stub and a fixed,
    committed list of 1,000 operations covering every operation in R6
    (generated once and stored as a test fixture), **WHEN** they are run in
    order, **THEN** after every operation, for each id, the units in the
    containers plus the ledger's world and sink totals equal the ledger's
    faucet total, and slot order never changes except by the operations'
    stated effects.
18. *(Logic)* **GIVEN** any container, **WHEN** its contents are read for
    saving, **THEN** each slot is either empty or exactly an id and a count;
    no other per-item field exists.

**Worth and pacing (R9, R10, F1, F4, F5)**

19. *(Logic)* **GIVEN** a test catalog where a tier-2 ore's worth per second
    at its weakest capable drill is lower than its tier-1 ore's, **WHEN** the
    catalog is validated, **THEN** the pacing report lists that ore, and the
    catalog still becomes Ready (a report, not a refusal). **[B]** With the
    shipped catalog, the report shows 5, 10 and 40 per second for tiers 1, 2
    and 3 in both families (tier 3 at the better drill's power 2).
20. *(Logic)* **GIVEN** a test recipe whose output is the first drill of tier
    2 and whose inputs include an ore with `drill_tier` 2, **WHEN** the
    catalog is validated, **THEN** validation fails naming the recipe and the
    ore.
21. *(Logic)* **GIVEN** costs built from the minimal cost schema, **WHEN**
    validated: a `per_run` cost and a `per_death` cost whose main family is
    teal and none with an amber share of at least a fifth, **THEN** validation
    fails naming amber (and the same for teal); a set where amber's only
    recurring use is `per_storm` repair also fails; a cost of 2 amber and 2
    teal of equal tier (a tie) fails; **GIVEN** the Milestone A catalog with
    no ore faucet, **THEN** the coverage check is skipped.
22. *(Logic)* **GIVEN** a cost of 8 `ore.seaglass`, 4 `ore.verdite` and 2
    `ore.ochre`, `pacing_haul_worth` 600 and `pacing_success_rate` 0.7, **WHEN**
    the pacing report runs, **THEN** it shows a worth price of 0.571 runs
    (±0.001), "yield price not computed" while no `expected_yield` exists, the
    cost's worth share per family and tier, and the projected surplus line; a
    cost of rock and stick only shows 0; a set with `pacing_ceiling_runs_min`
    31 and `max` 30 fails validation on the constraint. **GIVEN** a fixture
    `expected_yield` of 4 seaglass per run, **THEN** the price is max(0.571,
    8 / 4) = 2.0.
23. *(Logic)* **GIVEN** a pack with 6 `ore.ochre`, 5 `ore.gild`, 2
    `ore.sunstone` and 3 sticks, **WHEN** its worth is asked, **THEN** it is
    475; an empty container is 0; a test container of 200 slots, each holding
    99,900 units of an item of worth 100,000, returns 1,998,000,000,000 with
    no overflow.
24. *(Logic)* **GIVEN** a pack worth 300 and a carried better drill whose
    recipe inputs are worth 240, **WHEN** at risk is asked, **THEN** it is 540;
    the pack's worth and glow input are still 300. *(R9)*
25. *(Logic)* **GIVEN** `HaulWorth(launch_totals, extract_totals)` with player
    A launching with 240 and extracting with 0 after handing the ore to player
    B, who launched with 0 and extracted with 700, **THEN** the crew haul is
    460; launching with 240 and extracting with 200 in total records 0. *(R9)*

**Cross-system (R8, edge cases)**

26. *(Logic)* **GIVEN** player A's and player B's carried containers and a
    stash, **WHEN** `Clear(…, death)` runs for player A's death, **THEN** A's
    pack and tool slots are empty, B's are unchanged, the stash is unchanged,
    and the ledger records A's units as consumed by the death sink. *(R8)*
27. *(Logic)* **GIVEN** a stash slot of 15 sticks built by a test factory with
    a stash cap of 10 (a patched-down `stack_max`), and 2 empty slots, **WHEN**
    `Add(material.stick, 25)` is called, **THEN** it returns 20 (the over-cap
    slot adds 0, the two empty slots take 10 each) and the over-cap slot still
    holds 15; `Take(material.stick, 6)` from it leaves 9.
28. *(Logic)* **GIVEN** a container built with items in slots 12 to 15 and its
    `slots` lowered to 12, **WHEN** `Add` is called for the same ids, **THEN**
    nothing enters slots 12 to 15 and they do not count as empty; **WHEN** the
    items are moved out, **THEN** no item is lost, the slots are trimmed from
    the end once empty, and slots 0 to 11 keep their indices.
29. *(Integration)* **GIVEN** two requests in the same tick, in this arrival
    order, that each move the only 3 sticks from the same stash slot into the
    pack, **WHEN** the tick runs, **THEN** the first moves 3, the second is
    refused with **Not enough stick**, and the total number of sticks is
    unchanged.
30. *(Logic)* **GIVEN** the Milestone A faucet registry (no run systems),
    **THEN** no faucet's output is an `ore.*` id, and the six ore definitions
    are present in the catalog.
31. *(Integration, provisional on Run Flow and Save & Load)* **GIVEN** a run
    in progress with ore and a canister in the pack, a drill in a carried tool
    slot and items in a stash at home, **WHEN** the player dies and the save is
    reloaded, **THEN** every carried container is empty and the stash holds
    exactly what it held at launch. **[B]**

**What the player sees**

32. *(Visual)* **GIVEN** the six ores placed side by side in the mid zone's
    light and again in the helmet lamp in the deep zone, **WHEN** screenshots
    are taken, **THEN** the art lead, without hints, names the family and tier
    of each of the six in both shots; a greyscale copy still shows the tier
    order by facet count and cluster size. Retained in
    `production/qa/evidence/`; art lead sign-off. **[B]**
33. *(UI, provisional on the Run HUD and haul summary UX specs)* **GIVEN** the
    pack readout during a run and the haul summary at extraction, **WHEN**
    screenshots are taken, **THEN** the value is labelled worth, with no
    currency sign and no word "credits", and the at-risk readout is labelled
    as what a death would cost. **[B]**

**Performance**

34. *(Logic, blocking)* **GIVEN** a 200-slot container, **WHEN** 10,000 mixed
    `Add`, `Take` and `Move` calls run after a warm-up, **THEN** they allocate
    no managed memory, measured by the thread's allocated-bytes counter.
35. *(Logic, advisory)* **GIVEN** the same benchmark, **THEN** it finishes in
    under 10 ms in total on the development PC; advisory, because timings vary
    by machine.

**Gaps the QA lens found, and where they went:** the rebuild guarantee (R10)
and the refine-down recipes (R2) cannot be tested here because the costs
belong to Building and Crafting; they are carried to their acceptance criteria
(Open Questions 5). The retired-id migration check belongs to Save & Load's
migration-coverage test (Edge Cases). F1 is a design rule, so it is covered by
criterion 3 (the shipped values) and 19 (the report), not by a run-time test.
Stash's visible pile (R10) is the Stash design doc's criterion.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | **Is the accepted MVP ceiling right, and what is the lasting sink?** Once the home is built in run materials, only recurring sinks take ore (R10). The lead candidate for a lasting sink is a placeable ore trophy or inlay piece with a rising cost (a Building sink the player walks past, not a number); a cost of acting at launch (ship or pad prep) is an option for Run Flow. The pacing report's projected surplus (F4) gives the size of the pile | Designer, Building, Run Flow | First playable of Milestone B |
| 2 | **Ore names and ids** (ochre, gild, sunstone; seaglass, verdite, tidestone) are provisional. The senior review recommends ids that carry family and tier instead of names (for example `ore.amber_t1`), with the names as display data, so a rename never needs a save migration. Not applied here because it changes registry ids, an always-ask schema change: **the designer decides** before the first build that writes a save with ore | Designer | Before the first build that writes a save with ore |
| 3 | **The art bible's open question on teal's worth is answered here** (equal worth per tier; families differ by use). The art bible's note in Section 4 should point to R2 | Art director | Next art bible revision |
| 4 | **The systems index does not list this system for Save & Load (7), Storms (14), Oxygen (19) or Run Flow (22)**, which all use its contract, and row 4 omits Session & Authority (Dependencies). Add them, or note them as implicit as Game Data & Tuning does | Producer (`/map-systems` owns the index) | Before those design docs are written |
| 5 | **The rebuild guarantee and refine-down** (R2, R10) can only be tested where the costs live. The Building and Crafting design docs must each carry an acceptance criterion that the starter set (workbench, hammer, basic drill, one shelter repair) costs only rock and stick; Crafting must define the refine-down recipes and the amber share in the canister and better-drill recipes; every cost carries its `recurrence` tag | Building, Crafting design docs | When they are written |
| 6 | ~~Wording in Game Data & Tuning~~ **Closed (2026-11-28):** Game Data & Tuning's revision 2 renamed the set `tuning.ore_and_item_economy`, put worth on definitions, gave container sizes to their owners and made this system the owner of the four holdable fields on every holdable kind | — | — |
| 7 | **Per-item state.** Tool durability, ore quality or anything else held per unit is out of scope (R5). Tier 1a's gear tiers may want it; it would need a new slot shape and a save migration | Tools & Gear, Save & Load | Before Tier 1a design |
| 8 | **Pacing values** (`pacing_haul_worth` 600 as an unmeasured placeholder, `pacing_success_rate` 0.7, ceiling 15 to 30 runs, the cost bands) and all ore worth and toughness values are provisional until real runs are played in Unity. If playtests find death too soft, raise the drill-loss band before softening anything else (Pillar 3) | Designer, economy review | After Milestone B's first playtests (at least three logged successful hauls) |
| 9 | **The pack is storm-proof at home** (Edge Cases): accepted as minor while the pack's `stack_scale` is 1. The Stash and Storms design docs should confirm they agree | Stash, Storms design docs | When they are written |
| 10 | **One set of carried containers per player.** ADR-0003 saves a single `carried`; co-op needs one per player (R4) and per-player death clears (R8). Needs an ADR-0003 amendment | technical-director, co-op ADR | Before Tier 2a |
| 11 | **Replication of containers**: absolute slot values with a full snapshot on join, no client prediction for containers | network-programmer, co-op ADR | Before Tier 2a |
| 12 | **Tier legibility under the helmet lamp**: the three teal colours share one brightness and differ only by saturation; cluster size and glint should be the primary tier cue (Acceptance Criteria 32) | Art director | Next art bible revision |

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

Added in revision 1 (2026-11-28), from the creative-director's rulings in the
two parallel first `/design-review`s (one recorded in commit aeef1f7, one in
this session); also logged in the decision log:

15. **Amber keeps a recurring use**: coverage counts only `per_run` and
    `per_death` costs, each family needs a main or a fifth-share use there, and
    the canister and better-drill recipes carry an amber share (R2, R10).
    Storm repair needing amber was rejected as upkeep that comes due.
16. **Worth and exact costs agree through refine-down** at the workbench,
    never raising worth (R2).
17. **At risk** shows tools and canisters at replacement worth, apart from
    haul worth and glow (R9).
18. **Haul worth is crew-wide**: total extraction minus total launch, floored
    at 0 (R9).
19. **Containers have ids and owners**; a request can touch only its player's
    carried containers and shared stashes; death clears only the dying
    player's (R4, R8).
20. **Operations made exact**: `Move` carries an id and clamps its count,
    `Exchange` added, `Clear` only into a named sink, a refusal precedence,
    `Add` never refused, F3 clamped, overflow slots after the last index (R6,
    F3, Edge Cases).
21. **A ledger** of faucet, sink and world events backs conservation; craft
    output is a faucet row and the world a tracked place (R7, R10).
22. **F4 rebuilt**: worth per attempt (`H` × success rate), a yield price from
    Asteroid World's distribution, and split bands as tuning values (canister
    ≤ 0.15, lost drill 0.5 to 1.0, repair ≤ 0.25, one-off 0.5 to 3); `H` is
    an unmeasured placeholder.
23. **The ceiling stays accepted**; Stash must show the pile in the world; a
    rising-cost trophy or inlay piece is the lead lasting sink (Open Questions
    1).
24. Toughness is in seconds (`s`), family is limited to ore, and worth limits
    differ by kind (R1, R3); F1's bounds narrowed so no tier floors to 0.
25. **Not applied, for the designer**: ids that carry family and tier instead
    of names (Open Questions 2), because it changes registry ids.
