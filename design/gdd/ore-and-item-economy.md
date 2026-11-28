# Ore & Item Economy

> **Status**: In Review (revision 2, 2026-11-28, after the second `/design-review`, verdict NEEDS REVISION; awaiting re-review)
> **Author**: designer + Claude (autonomous mode, designer's standing approval)
> **Last Updated**: 2026-11-28 (revision 2)
> **Last Verified**: 2026-11-28
> **Implements Pillar**: Pillar 1 (The haul is the heartbeat), Pillar 4 (Three trades, one fortune), Pillar 5 (Home is the scoreboard)
> **Creative Director Review (CD-GDD-ALIGN)**: REVISED 2026-11-28 — run in-session as a checklist (no agent spawned). CONCERNS found: Pillar 4 served only by the fantasy text with no rule (R2 now requires every family to be shared by at least two trades); the recurring-cost band in F4 could soften Pillar 3's sting (now named in Open Question 8). Pillars 1, 2, 3 and 5 and the anti-pillars are otherwise served by rules in R2, R6, R8, R9 and R10. Not re-run after revision 1. Second `/design-review` (2026-11-28): the creative-director ruled NEEDS REVISION with nine blocking items and rulings (a) to (n); all are applied in revision 2 (decisions 26 to 39), with the deferred items in Open Questions 1 and 13 to 18.

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
crafting, building, repair, canisters used up, what is lost on death or to
a storm, what is left in the world when a scene ends, and what Save & Load
removes at load), with a pacing report that prices every recipe and piece in
runs.

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
on every holdable kind (Game Data & Tuning R2, shared holdable fields). Their
ranges are not written on each definition. The three numeric ones are limited
once, for every holdable kind alike, in the shared field-limits record
`limits.holdable`, which this document owns (Game Data & Tuning R1), and the
catalog checks every definition against it (Game Data & Tuning R9, checks 4,
6 and 8); `family` is an enum the catalog checks against its list.
`limits.holdable` holds one range per field, not one per kind, so the per-kind
rules in the last column are not catalog data: **the Ore & Item Economy CI
test fails the build** when a definition breaks them (R13; Game Data & Tuning
R3: a rule the data cannot hold is an owner CI test).

| Field | Type | `limits.holdable` (every holdable kind) | Per kind (Ore & Item Economy CI test, R13) | Meaning |
|---|---|---|---|---|
| `stack_max` | int, unit `count` | 1 to 999, step 1 | ore: exactly 1; every other kind: any value in the limits | How many fit in one slot of a container with stack scale 1 (R4) |
| `worth` | int, unit `credits` | 0 to 100,000, step 1 | ore: 1 or more; every other holdable kind: 0 in the MVP | What one unit is worth as haul. Shown to the player as "worth", never as money (R9) |
| `family` | enum: `amber`, `teal`, `none` | (an enum, not limited) | ore: `amber` or `teal`; every other kind: `none` | The ore family (R2). Only ore has a family; what a cost is "mainly made of" is computed from the cost (R10), never stored on the item |
| `tier` | int, unit `level` (a strength with no physical unit, Game Data & Tuning R5; the scale is the ore tier) | 0 to 3, step 1 | ore: 1 to 3; every other kind: 0 | The ore tier |

If Game Data & Tuning later adds per-kind override rows to its limits
records, these per-kind rules move into them and leave the CI test.

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
  at the workbench for each family and each tier above 1: one ore of tier `t`
  becomes `floor(worth(t) / worth(t − 1))` ore of tier `t − 1` of the same
  family, per unit of input. With F1's worths, one tier-3 piece gives 3 tier-2
  pieces (120 worth in, 105 out) and one tier-2 piece gives 3 tier-1 pieces
  (35 in, 30 out). The loss is stated and accepted: 15 of 120 (12.5%) and 5
  of 35 (about 14%), so about 13% of worth per step. Worth therefore never
  rises, and there is no refine-up and no refine across families. A rich haul
  can then always pay a cheap cost, and worth stays an honest guide to what to
  keep. Refining is a conversion, not a use: it never counts towards coverage
  and is not a ceiling sink (R10). The Ore & Item Economy CI test checks every
  recipe whose output is an ore (R13).
- **Tier roles.** Tier 1 is early-game ore and the filler that named recipes
  ask for; tier 3 is score, and the reason to make the better drill. That tier
  3's only use other than score is refining is accepted for the MVP and
  recorded in Open Questions 1.
- **Tier 3 needs the better drill.** The ore's `drill_tier` field says the
  lowest drill tier that can mine it; Mining refuses lower ones and Tools &
  Gear defines drill tiers.
- Which ores appear where on the asteroid, and how many, belongs to Asteroid
  World; how a seam turns into pieces belongs to Mining.

**R3. Ore fields Mining reads.** Each ore definition also carries these two
fields. Their ranges live once in the field-limits record `limits.ore`, owned
by this document (Game Data & Tuning R1), not on each definition, and the
catalog checks every ore against it (Game Data & Tuning R9, checks 4, 6 and
8):

| Field | Type | Range (in `limits.ore`) | Meaning |
|---|---|---|---|
| `toughness` | float, unit `s` | 0.5 to 20, step 0.1 | Drilling time per piece with a drill of power 1, in seconds. Mining owns the formula that turns it into time for a given drill; this system owns the per-ore value (Game Data & Tuning, R1: one thing's numbers live on its definition) |
| `drill_tier` | int, unit `count` | 1 to 3, step 1 | Lowest drill tier that can mine it |

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
or more. A call is **Malformed** (Session & Authority's `malformed`, its R5)
and never reaches the operation if it names: a count of 0 or less; an id the
catalog does not know; a container that has been removed (States); another
player's carried container (R4, who may touch which container); a slot index
that names no slot of the container (below 0, or past its last indexed or
overflow slot); a `Move` whose source and target are the same container
(except a `Move` out of an overflow slot into its own container, below); or
the same container listed twice in the source list of a `TakeCost` or an
`Exchange`. Every operation reports what it moved, and posts it to the ledger
(R7).

| Operation | Effect | All-or-nothing? |
|---|---|---|
| `Add(id, n)` | Puts up to `n` units in: first tops up indexed slots already holding `id` whose count is below the cap, in slot order (never an overflow slot), then fills empty indexed slots in slot order (never overflow slots). Returns the number placed, `p` (formula F3). The `n − p` units that did not fit stay wherever they came from: an add never destroys anything. Never refused: a container with no room returns 0, and the caller decides whether 0 is a refusal | No: returns `p`, which may be 0 |
| `AddAll(id, n)` | As `Add`, but only if all `n` fit; otherwise changes nothing | Yes: refused with `no_room` |
| `Take(id, n)` | Removes `n` units of `id`, counting every slot holding `id`, overflow slots included, and drawing from the last matching slot backwards (so overflow slots first, the last one first, shrinking it); a slot that reaches 0 becomes empty, and an overflow slot that reaches 0 is removed at once (Edge Cases). Returns the `n` units taken, to be passed to a container, the world or a named sink | Yes: refused with `not_enough` if fewer than `n` are present, overflow units counted |
| `TakeSlot(container, slot)` | Takes the whole stack in one slot (indexed or overflow) and returns it, to be passed to a container, the world or a named sink; posts a ledger row as `Take` does. Pack's drop of a chosen slot uses it (Pack R5) | Yes: refused with `not_enough` if the slot is empty; a slot index that names no slot is Malformed |
| `Move(from, slot, to, id, n)` | Takes up to `n` units of `id` from one slot of `from` (`n` is clamped to the slot's count) and `Add`s them to `to`, in `Add`'s order (there is no target slot: a drag onto a particular slot is not supported in the MVP); whatever does not fit stays in the source slot. Returns the number moved. A `Move` from an overflow slot into its own container's indexed slots is allowed, the one exception to the same-container rule, so an over-capacity stack can come back in when room appears | No: returns the number moved; refused only as below |
| `TakeCost(cost, sources)` | Takes a whole *cost* (a list of id and count pairs) from an ordered list of distinct containers, drawing each id from the first container first, and within a container in `Take`'s order (overflow slots first). Returns what was taken | Yes: refused with `not_enough` naming the first missing id in the cost's order if the sources together, overflow units counted, hold too little of any id |
| `Exchange(cost, sources, out_id, out_n, target)` | Crafting's step: `TakeCost` followed by `AddAll(out_id, out_n)` into `target`, with the room for the output checked on the containers as they would be *after* the cost is taken. Both happen, or neither. A recipe whose output id is also one of its cost ids fails the Ore & Item Economy CI test (R13), so it never reaches `Exchange` | Yes: refused with `cant_go_there` (the target does not accept the output's kind), `not_enough` or `no_room`, in the precedence below; nothing is taken on any refusal |
| `Clear(container, sink)` | Empties every slot, overflow slots included, into one named sink (R10: death, storm), returning what was removed for the ledger. Moving contents somewhere else is always `Move`, never `Clear` | Yes |
| `Remove(container)` | Deletes an empty container (no filled indexed slot and no overflow slot); its `container_id` is never used again | Yes: refused with `not_empty` otherwise, including when only an overflow slot is filled |

- *Moves are the only way between containers.* There is no "drop into the
  void": discarding an item is its own request owned by the system that
  allows it (Pack's drop puts a chosen slot into the world on a run with
  `TakeSlot`; at home, Stash or Pack decide). Anything that leaves a container either enters another one,
  enters the world, or is consumed by a named sink (R10).
- *One step.* An operation and every container it touches change inside one
  Simulation step, and the whole result lands in one snapshot (ADR-0003,
  Decision 3), so a crash can never leave a unit in two places or none.
- *Slot order is stable.* Operations never reorder slots; there is no
  automatic sort. A player-facing sort or split, if wanted later, is a
  separate operation owned by Pack or Stash, not something built from `Move`
  (which has no target slot).
- **Refusal reasons owned here** (a closed list, added to Session & Authority's
  own). Each has a stable *reason-code id*, which the rules return and the
  acceptance tests assert, and a *display name*, which is UI text (localised,
  with the item's display name filled in) and is never compared by code:

  | Reason-code id | Display name | When |
  |---|---|---|
  | `no_room` | No room | An `AddAll` or `Exchange` whose output does not fit, or a `Move` whose target has room for no unit |
  | `not_enough` | Not enough [item] | A `Take`, `TakeSlot`, `TakeCost` or `Exchange` short of units (a `TakeSlot` on an empty slot), or a `Move` whose source slot is empty or holds a different id |
  | `not_empty` | Not empty | A `Remove` of a container with any filled slot, overflow slots included |
  | `cant_go_there` | Can't go there | The target does not accept that kind: an `AddAll`, a `Move`, or an `Exchange`'s output |

  When several apply, the first in this order is given: `malformed`
  (Session & Authority's), `cant_go_there`, `not_enough`, `no_room`.

**R7. Conservation and the ledger.** Outside the named faucets (R10), no
operation creates a unit; outside the named sinks, no operation destroys one.
Every operation posts its movements to a **ledger**, a list of events each
holding an id, a count and where the units went from and to: a container, the
*world* (a unit lying on the asteroid or in the valley, owned by Mining, Pack's
drop or Gathering), a faucet or a sink. For every id, the units in all
containers plus the units recorded as in the world plus the units recorded as
consumed by sinks equals the units recorded from faucets. This is the rule
every acceptance test of this document counts against. Picking a unit up from
the world is atomic, per unit: when a world stack of `n` units is offered and
`Add` places `p`, exactly `p` leave the world in the same step they enter the
container, and the world stack keeps `n − p`. Units still in the world when
the run or scene ends are posted to the *left in the world* sink, and stacks
Save & Load deletes or cannot place at load to the *removed at load* sink
(R10), so no unit leaves the economy outside a named sink.

**R8. Carried versus stored.** What a player holds is *carried*: that player's
pack and carried tool slots (ADR-0003, Decision 3: "every item is saved in
exactly one place, a container or `carried`"). Everything in a stash is
*stored*. On a player's death or an abandoned run, Run Flow calls `Clear(…,
death)` on **that player's** carried containers only; that is the death sink.
A storm calls `Clear(…, storm)` (and `Remove` for a destroyed piece) on an
unsheltered stash through Stash (ADR-0003, Decision 6); that is the storm
sink. Nothing else in the MVP removes stored items without a player's
request, except Save & Load's removed-at-load row (R10).

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
  its *replacement worth*. The replacement worth of an id is that of the
  cheapest recipe that makes it: the worth of the recipe's inputs, with any
  crafted input valued by its own replacement worth (summed recursively),
  divided by the recipe's `out_n`. An id that no recipe makes has replacement
  worth 0, so a tool made only from valley materials shows 0 on purpose (its
  inputs are worth 0). It is computed once from the catalog when it is
  loaded; the Ore & Item Economy CI test refuses recipe cycles (R13), so the
  sum always ends. At risk is shown, not banked: it is never part of haul
  worth, the best-haul statistic or the pack glow. Pack and Run HUD decide
  how both readouts look.
- **Haul worth is crew-wide.** A run's *haul worth* is the sum of every crew
  member's pack worth at extraction minus the sum at launch, floored at 0 (F5
  applied per pack). Handing ore to a partner during a run cannot inflate it,
  and ore carried out and back is not counted. Run Flow records both sums.
- **Best haul is solo or crew.** Each profile records its best haul tagged
  `solo` or `crew`; a crew haul never overwrites the solo best, because a crew
  hauls more than one player can. Save & Load stores both and Run Flow tags
  each run.

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
| A unit dropped or left in the world (ore that did not fit, a dropped item) | World (not a sink: it can be picked up again until the run or scene ends) | Mining, Pack | When a pack is full |
| Left in the world: whatever world units remain when the run or scene ends | Sink (lost), posted to the ledger at scene end | Run Flow | Each run that leaves something behind |
| Removed at load: stacks Save & Load deletes (a retired id mapped to nothing) or cannot place at load | Sink (lost), posted to the ledger at load | Save & Load | Rarely; only after a data change |

Gathering's faucet row posts only `p`, the units it placed, never the `n`
offered: what did not fit was never taken from the valley's spot.

Rules on the table:

- **Main family.** A cost's *main family* is the family with the largest share
  of the cost's worth (count × worth per family); a cost whose two families
  tie fails the Ore & Item Economy CI test (R13), and a cost of worth 0
  (valley materials only) has no main family.
- **Recurring or one-off.** Every cost carries a `recurrence` field set by its
  owner: `per_run` (paid on an ordinary run, such as a canister), `per_death`
  (paid after a death, such as re-making a lost drill), `per_storm` (repair)
  or `one_off` (a piece or workbench built once). A cost with a missing or
  unknown `recurrence` fails the CI test.
- **Coverage.** Each ore family must be the main input of, or a share of at
  least a fifth of the worth of, at least one `per_run` or `per_death` cost, so
  it is still spent after the home is fully built; and the main input of at
  least one `one_off` cost. The Ore & Item Economy CI test fails the build
  when either half fails for either family (R13), so neither family can become
  decoration. A `per_storm` repair does not count towards the recurring half,
  because a finished home of run materials needs little repair. A recipe
  whose output is an ore of the same family as one of its inputs (a
  refine-down, R2) never counts towards coverage; this is a rule derived from
  the recipe, not a `recurrence` value. The Milestone A catalog, which has no
  ore faucet, is exempt.
- **The MVP ceiling is accepted.** Once the home is built in run materials,
  the recurring sinks (canisters, re-making lost drills, repair, death) are
  the only ore sinks, and ore will pile up in the stash for a player who
  rarely dies. Refining is not a ceiling sink: it skims about 13% of worth per
  step and keeps the rest as ore (R2). Coverage counts whether a recurring use
  *exists*, not how often it is paid: a player who never takes a canister and
  never dies spends no amber at all. That is part of the accepted ceiling, and
  the per-family surplus in F4 makes it visible; requiring a recurring amber
  use that every player must pay would be a scope change and waits for Open
  Questions 1's lasting sink. The pile must be *visible wealth* (Pillar 5):
  Stash shows its contents in the world, a stash visibly filling with ore, not
  only as a panel (a requirement on the Stash design doc). The Ore pacing
  report (advisory, never fails the build) prints the projected surplus per
  family per run after the ceiling (F4). A placeable ore trophy or
  inlay piece with a rising cost is recorded as the lead candidate for a
  lasting sink (Open Questions 1). Tier 1a's gear tiers are where a lasting
  sink arrives at the latest.
- **No upkeep.** No sink comes due on its own: nothing decays, nothing is
  charged on a timer (anti-pillar). Repair is only needed after a storm, and
  storms are forecast.
- **Rebuild guarantee.** From empty containers, valley materials alone must
  reach a workbench, a hammer, a basic drill and a shelter repair (concept,
  Recovery from failure). This system supplies the stack sizes and worth that
  Building and Crafting price against (rock and stick: `stack_max` 20, worth
  0); the costs themselves belong to them, and Home Valley's rebuild check
  (its F3) proves the valley holds enough. It assumes a
  run on the suit's own oxygen, without a canister, is possible (Oxygen's
  rule), so canisters are not part of the rebuild set.

**R11. Valley materials and other items in the MVP.**

| Id | Kind | Family | Tier | `stack_max` | Worth | Notes |
|---|---|---|---|---|---|---|
| `material.rock` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `material.stick` | material | none | 0 | 20 | 0 | Gathered in the valley; endless |
| `item.canister.oxygen` | item | none | 0 | 2 | 0 | Made by Crafting, used by Oxygen; the stack of 2 matches the prototype's `canister_carry` so a single pack slot holds a run's canisters. Oxygen decides how many may be carried; the Ore pacing report (advisory, never fails the build) prints both values when `stack_max` differs from Oxygen's `canister_carry` (R13) |

Every ore has `stack_max` 1 (one piece per slot in the pack; ten per stash
slot through the stash's scale), which the Ore & Item Economy CI test checks
(R1, R13). Tools have `stack_max` 1 and worth 0;
their other fields belong to Tools & Gear.

**R12. Milestone A subset.** Milestone A (the valley home) has no runs, so it
uses only rock, stick, the hammer and the basic drill, the pack, stashes,
carried tools and every operation in R6. Ore definitions exist in the catalog
from the start (so Building and Crafting can name ore costs for later pieces),
but no faucet produces ore until Milestone B. The criteria that need ore *in
play* (mined on a run, or shown in a run's readouts and screenshots) are
marked [B] under Acceptance Criteria. Fixture-based Logic tests that build
ore in a test (worth, at risk, haul worth, coverage, the pacing report) are
not [B] and run from Milestone A.

**R13. Checks: the Ore & Item Economy CI test and the Ore pacing report.** The
runtime catalog only passes or fails, and it checks only what data can hold:
every numeric field against `limits.holdable` and `limits.ore`, the `family`
enum, references, and the constraints inside `tuning.ore_and_item_economy`
(Game Data & Tuning R9, checks 4 to 9b); there is no warning tier. A rule the
data cannot hold (across kinds, definitions, sets or systems) is an *owner CI
test*: an EditMode test that reads the loaded catalog, lives outside the
catalog, and may be advisory (Game Data & Tuning R3). This system has two
owner CI tests and nothing else at run time:

- **The Ore & Item Economy CI test** (blocking; story type Logic). The Ore &
  Item Economy CI test fails the build when any of these fails, naming the
  definition and the rule:
  1. *Per-kind ranges* (R1): ores have `tier` 1 to 3, `worth` 1 or more,
     `stack_max` 1 and family `amber` or `teal`; materials, items, tools and
     gear have `tier` 0, `worth` 0 and family `none`.
  2. *Coverage* (R10), including a missing or unknown `recurrence`.
  3. *Main-family tie* (R10).
  4. *First-drill recipe* (Edge Cases): the recipe for the first drill of tier
     `k` needs no ore whose `drill_tier` is `k` or higher.
  5. *Refine-down* (R2): every recipe whose output is an ore takes only ore of
     the output's family, exactly one tier above the output, and gives
     `floor(worth(t) / worth(t − 1))` units per input unit, so its output
     worth is no more than its input worth.
  6. *Replacement-worth cycles* (R9): no recipe needs, directly or through
     crafted inputs, the id it makes.
  7. *Output also a cost* (R6, `Exchange`): no recipe's output id is one of
     its cost ids.
- **The Ore pacing report** (advisory, never fails the build: "helpers emit
  observations, never verdicts"). The Ore pacing report prints: worth per
  second for every ore at its weakest capable drill, and any ore below the
  tier beneath it (F1); the canister's `stack_max` beside Oxygen's
  `canister_carry` when they differ (R11); and F4 for every cost (price in
  runs against its band, unreachable costs, `ceiling_runs`, the worth share
  per family and tier, and the surplus per family). It is the only reader of
  `tuning.ore_and_item_economy` (whether such CI-only keys belong in the
  runtime catalog is Open Questions 13).
- *A cost that names the same id twice, or a count of 0,* is not checked
  here: it stays a Crafting and Building test, on the costs they own.

### States and Transitions

Items have no state (R5). Slots have two states, and containers have a short
life owned by the system that creates them.

**A slot**

| State | Holds | Becomes |
|---|---|---|
| Empty | Nothing | Filled, when an `Add` or `Move` places at least one unit |
| Filled | One id, count 1 to stack cap | Empty, when a `Take`, `TakeSlot`, `TakeCost`, `Move` or `Clear` brings the count to 0; stays Filled while the count changes |
| Overflow (only after the last index, Edge Cases) | One id and a count, kept after a patch lowered `slots` | Removed at once when a `Take`, `TakeSlot`, `TakeCost`, `Move` or `Clear` brings its count to 0; never Empty, never filled or topped up by an `Add` |

A Filled slot never changes id: to hold a different id it must become Empty
first. "Full" (count equal to the cap) is not a state; it is a test (F3).
There are no empty overflow slots: one that empties is removed in the same
step, and the overflow slots after it close up; the indexed slots never
shift.

**A container**

| State | Meaning | Entered when | Left when |
|---|---|---|---|
| Live | Exists, accepts operations | The owner creates it: a player's pack and carried tool slots with that player's profile; a stash when its piece is built (Stash, Building) | Its owner removes it |
| Removed | Gone; its id is never used again, and any operation naming it (a second `Remove` included) is Malformed | `Remove` on an empty container (no filled indexed or overflow slot), or `Clear(…, storm)` then `Remove` when a storm destroys its piece (ADR-0003, Decision 3) | Never |

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
| Game Data & Tuning (1) | In | Holdable definitions (`ore.*`, `material.*`, `item.*`, plus the common fields on `tool.*` and `gear.*`), checked by the catalog against `limits.holdable` and `limits.ore` before the session starts (its R9); `tuning.ore_and_item_economy`, read only by the Ore pacing report | Game Data & Tuning owns loading and the catalog checks; this document owns the fields, `limits.holdable`, `limits.ore`, the Ore & Item Economy CI test and the Ore pacing report (R13) |
| Session & Authority (2) | In / out | Container operations run only inside an accepted request; this system's reason-code ids (R6: `no_room`, `not_enough`, `not_empty`, `cant_go_there`) are returned as the owning system's reason, beside Session & Authority's `malformed` | Session & Authority |
| Home Valley (5) | In / out | Its gatherables give `material.rock` and `material.stick` (half of the gathering faucet, R10); its rebuild check (its F3) reads their stack sizes and worth and proves the valley holds enough for the rebuild set | Home Valley owns gatherables and the rebuild check; this document owns the materials |
| Pack (8) | Out | Each player's pack is a container (16 slots, scale 1); pick-up uses `Add` from the world (per unit, R7), drop of a chosen slot uses `TakeSlot` into the world (Pack R5); worth (F5) for the glow and readout, and at risk (R9) | Pack owns the container's values and its requests |
| Tools & Gear (9) | Out | Carried tool slots are a container; tool and gear definitions carry R1's fields; `drill_tier` on ore is compared with a drill's tier | Tools & Gear owns tool fields and drill tiers |
| Gathering (10) | Out | Faucet: `Add(material.rock or material.stick, n)` into the pack; the faucet row posts only the `p` placed, and what does not fit stays in the valley's spot | Gathering |
| Building (11) | Out | `TakeCost` for a piece or a repair; `Remove` of an empty container when a stash piece is taken down; must follow R2's family use and R10's coverage, and tag each cost's `recurrence` | Building owns piece costs |
| Stash (12) | Out | Each stash is a shared container (24 slots, scale 10); `Move` between pack and stash; `Clear(…, storm)` and `Remove` for Storms; shows its contents in the world (R10) | Stash owns its containers and its requests |
| Crafting (13) | Out | `Exchange` for every recipe (cost and output in one operation; the cost goes to the Crafting sink and the output comes from the Crafting faucet, R10); the refine-down recipes at R2's rate; the amber share in canister and better-drill recipes (R10); `recurrence` on each recipe; the Ore & Item Economy CI test's recipe rules (R13) | Crafting owns recipes |
| Storms (14) | Out (through Stash) | The storm sink: `Clear(…, storm)` on unsheltered stashes, then `Remove` on destroyed ones | Storms decides; Stash performs |
| Home HUD & Panels (15), Run HUD (24) | Out | Container contents (ids and counts), worth totals, refusal reasons; display data by id | HUDs own the look |
| Oxygen (19) | Out | Canister sink: `Take(item.canister.oxygen, 1)` from the user's pack when one is used; `canister_carry` compared with the canister's `stack_max` by the Ore pacing report (R11, R13) | Oxygen |
| Mining (21) | Out | Ore fields `toughness` and `drill_tier`; faucet: `Add(ore.*, 1)` into the miner's pack when a piece breaks free, or the piece goes to the world (ledger, R7) | Mining owns the drilling formula and what happens to a piece that does not fit |
| Run Flow (22) | Out | Death sink: `Clear(…, death)` on the dying player's carried containers, on a death or an abandoned run; the left-in-the-world sink at scene end (R10); crew haul worth (R9: sums of F5 at launch and extraction) and the best haul tagged solo or crew, for statistics; the move of the haul into a stash is Stash's | Run Flow |
| Save & Load (7) | Out | Container contents as id and count per slot, in slot order; ids are stable and never reused (ADR-0002); the removed-at-load sink (R10); best haul solo and crew (R9) | This system owns the slot shape (id and count per slot, slot order); Save & Load owns the file format |
| Market & Trading (35, Full Vision) | Out, later | Worth as the base of a price | Market & Trading |

## Formulas

Systems-designer and economy-designer lenses applied: every formula below was
worked at its minimum, its maximum and at zero; the boundary findings are
listed after each one. All counts and worth values are integers; no formula
here uses floating point at run time (F1 and F4 are computed only at design
time and by the Ore pacing report, R13). Every `count × worth` product, and
every sum of them, is done in 64-bit integers.

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
little per tier to change a decision. The Ore pacing report (advisory, never
fails the build) prints an ore whose worth per second at its weakest capable
drill is lower than the tier below it (R13; Acceptance Criteria 19 and 36).

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
`room` = 0 and `p` = 0; `AddAll` is then refused with `no_room` and `Add`
returns 0 without being refused (the caller decides whether 0 is a refusal:
Mining and Gathering treat it as `no_room`).

### F4. Pacing: a cost's price in runs

The price_in_runs formula is defined as:

`H_attempt = H × success_rate`
`worth_price(cost) = Σ over (id, count) in cost ( count × worth(id) ) / H_attempt`
`yield_price(cost) = max over ore ids in cost ( count_id / expected_yield(id) )`, or 0 if the cost holds no ore
`price(cost) = max(worth_price(cost), yield_price(cost))`, or *unreachable* if an ore id in the cost has `expected_yield` 0
`ceiling_runs = Σ over one-off costs k ( max( Σworth_k / H_attempt , max over ore ids in k of count_id,k / expected_yield(id) ) )`
`surplus_f = H_attempt × share_f − [ Σ per_run_f + (1 − success_rate) × Σ per_death_f + storm_rate × Σ per_storm_f ]`

`worth_price` alone treats ore as interchangeable, but nothing converts ore
upward: a cost of 24 seaglass needs 24 seaglass, which may take several runs
even when its worth is small. `yield_price` captures that: how many average
attempts it takes to bring home enough of the scarcest ore. It is a max over
**ore ids only**: valley materials have no yield and are skipped. An ore with
`expected_yield` 0 (placed nowhere) makes the cost *unreachable*, which the
report flags instead of dividing; an ore with no `expected_yield` recorded yet
is skipped and named. `expected_yield` comes from Asteroid World's ore
distribution once it is designed; until then `yield_price` is not computed
and the report says so. In `ceiling_runs`, **each recipe's first craft counts
as `one_off`, whatever its `recurrence`** (the first better drill is built
once before it is ever re-made). `surplus_f` is printed per family: the
family's expected haul worth per attempted run minus its expected recurring
spend, so the MVP ceiling (R10) is a known number for amber and for teal.

**Variables:**
| Variable | Type | Range | Source | Description |
|----------|------|-------|--------|-------------|
| `count` | int | 1–999 | data file (a piece's or recipe's cost) | Units of one input |
| `worth(id)` | int | 0–100,000 | data file (holdable definition) | Worth of one unit |
| `H` | int | 100–5,000 | data file (`pacing_haul_worth`) | Expected haul worth of one *successful* MVP run: 600, an **unmeasured placeholder** |
| `success_rate` | float | 0.1–1 | data file (`pacing_success_rate`) | Share of runs that extract: 0.7, placeholder |
| `H_attempt` | float | 10–5,000 | calculated | Expected haul worth per run attempted, deaths included |
| `count_id`, `count_id,k` | int | 1–999 | data file | Units of ore id `id` in the cost (in one-off cost `k`) |
| `Σworth_k` | int, 64-bit | 0 and up | calculated | Worth of one-off cost `k`: Σ count × worth |
| `expected_yield(id)` | float | ≥ 0 | Asteroid World (not yet designed) | Average units of ore `id` brought home per attempted run; 0 makes a cost needing it unreachable |
| `price` | float | 0 and up, or unreachable | calculated | How many average runs the cost takes |
| `ceiling_runs` | float | 0 and up | calculated | Runs to build everything once (each recipe's first craft counted as one-off) |
| `share_f` | float | 0–1 | Asteroid World's distribution (not yet designed) | Family `f`'s expected share of haul worth; until it exists `surplus_f` is not computed and the report says so |
| `Σ per_run_f`, `Σ per_death_f`, `Σ per_storm_f` | int, 64-bit | 0 and up | calculated (costs and their `recurrence`) | Worth of family `f`'s ore summed over every cost of that `recurrence` |
| `storm_rate` | float | ≥ 0 | Storms (owner; storms per attempted run) | How often a storm repair falls due |
| `surplus_f` | float | at most 5,000; unbounded below | calculated | Family `f`'s worth left over per attempted run once every one-off cost is paid; negative means the family is spent faster than it is mined |

**Output Range:** 0 for costs paid only in valley materials (worth 0, no ore
id, so no yield price). `surplus_f` is at most `H_attempt` (5,000, with
`share_f` 1 and no recurring spend) and has no floor; a negative value is
printed as a deficit, not clamped, because it is an observation. Target bands, which Building and Crafting price against, are tuning
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

**Example:** a better drill costing 6 `ore.seaglass`, 3 `ore.verdite` and 2
`ore.gild`, tagged `per_death` (teal-main, as R2 asks of a tool, with an
amber share that passes coverage): worth 60 + 105 + 70 = 235; amber share
70 / 235 = 29.8%, at least a fifth; worth price 235 / (600 × 0.7) = 235 / 420
= **0.560 runs**, inside the `per_death` band. With an `expected_yield` of 4
seaglass per run (and none yet for verdite and gild), price = max(0.560,
6 / 4) = **1.5 runs**. Its first craft adds 0.560 to `ceiling_runs` (before
yields exist) as a one-off.

**Surplus example** (placeholder values): `H_attempt` 420, `share_amber` 0.5,
amber worth in `per_run` costs 10, in `per_death` costs 70 (the drill above),
in `per_storm` costs 35, `storm_rate` 0.1: spend = 10 + 0.3 × 70 + 0.1 × 35 =
10 + 21 + 3.5 = 34.5; `surplus_amber` = 210 − 34.5 = **175.5 worth per run**.

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
`H_attempt` is at least 10 and never 0; `expected_yield` 0 is never divided
by (unreachable). The `count × worth` products are 64-bit: one stash slot of
99,900 units of worth 100,000 is about 10¹⁰, past 32 bits before any sum. F4
is printed for every cost by the Ore pacing report (advisory, never fails the
build: "helpers emit observations, never verdicts"); a value outside its band
is a balance question for the cost's owner. The report also prints, per
family and tier, the share of each cost's worth, every unreachable cost, and
`surplus_f` for each family.

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

**Boundaries.** Each `count(s) × worth(id(s))` product is computed in 64
bits, not only the sum (one slot of 99,900 × 100,000 ≈ 10¹⁰ already
overflows 32 bits). The sum is kept as a 64-bit integer: the theoretical maximum
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
  cue (Run HUD). If it is still in the world when the run or scene ends, Run
  Flow posts it to the left-in-the-world sink (R10).
- **If a gather or a move offers more than fits** (F3 gives `p` < `n`): `p`
  units move and `n − p` stay where they were (on the ground, in the source
  slot). The result reports `p` so Presentation can show "3 sticks left".
- **If a craft's output would only fit in a slot its own cost empties**:
  `Exchange` checks the output's room on the containers as they would be after
  the cost is taken, so the craft is accepted; if the output would not fit even
  then, neither happens and the craft is refused with `no_room`. If the target
  does not accept the output's kind (a tool into the pack), it is refused with
  `cant_go_there` and nothing is taken.
- **If `TakeCost` draws one id from several sources**: the first source in the
  order gives all it has before the next is touched (Building and Crafting
  choose the order, for example pack first, then the nearest stash). Within
  one container, units come from the last matching slot backwards, overflow
  slots first (R6). The same container listed twice, in `TakeCost` or
  `Exchange`, is Malformed.
- **If a request offers an enormous count** (up to the 32-bit maximum):
  `p` is bounded by `room`, at most 19,980,000 (F3), so nothing overflows.
- **If a `Move` names a source slot holding a different id, or an empty one**:
  refused with `not_enough`; **if its target does not accept the kind**:
  `cant_go_there`, which is checked first (R6's precedence).
- **If a `Move` names the same container as source and target**: Malformed;
  rearranging slots is not an MVP feature. The one exception is a `Move` out
  of an overflow slot into the same container's indexed slots (R6).
- **If a `TakeSlot` names an empty slot**: `not_enough`; a slot index that
  names no slot: Malformed.

**Two things at once**

- **If two requests touch the same slot in the same tick** (co-op, or a double
  click): Session & Authority runs requests one at a time in arrival order
  (its R4); each operation sees the state the previous one left. The second
  gets what remains, possibly `not_enough` or `no_room`. No unit is ever
  moved twice.
- **If a player's request names another player's pack**: refused as
  Malformed (R4, who may touch which container).
- **If a storm clears a stash while the player is on a run**: no request can
  touch a stored container during a run, and the storm is resolved at the end
  of the run (ADR-0003, Decision 6), before the haul is placed. The haul then
  goes wherever Stash puts it, never into a container already removed.
- **If the player removes a stash piece that still holds items**: refused with
  `not_empty` (ADR-0003, Decision 3), unless the Stash design doc first moves
  every unit into the player's carried containers with `Move` in the same step
  and snapshot; if they do not all fit, the removal is refused with
  `no_room` and nothing moves. `Clear` is never used to relocate units.

**Data changes under a save**

- **If a patch lowers an item's `stack_max` below a count already saved**: the
  slot keeps its count (nothing is destroyed). `Add` skips that slot while its
  count is at or above the new cap (its room counts as 0, F3); `Take` and
  `Move` out work normally. Save & Load does not split or trim it.
- **If a patch lowers a container's `slots` below a filled slot**: the extra
  filled slots are kept, in their order, as *overflow slots* after the last
  index; extra empty slots are dropped (a container with items in slots 12, 14
  and 15, slot 13 empty, lowered to 12 slots, has three overflow slots). They
  accept only `Take`, `TakeSlot`, `TakeCost`, `Clear` and `Move` out, and are
  drawn first, the last one first (R6); a `Move` from one into the same
  container's indexed slots is allowed. They are never counted as empty and
  are never topped up or filled by an `Add`. An overflow slot that empties is
  removed at once, so there are no dead slots, the indexed slots never shift
  and the save's slot order stays valid. A container with a filled overflow
  slot cannot be removed (`not_empty`). Pack and Stash show them as over
  capacity (UI Requirements).
- **If a holdable id is retired** (Game Data & Tuning, R14): its release must
  include a Save & Load migration that maps it to another id, or removes the
  units with a notice to the player; removed units go to the removed-at-load
  sink (R10).
- **If Save & Load deletes a stack at load or cannot place it** (an id it does
  not know, or a removed piece's items with nowhere to go): those units are
  posted to the removed-at-load sink (R10), so the ledger still balances. Catalog validation cannot see migrations
  (they are pure functions on the save), so this is checked by Save & Load's
  migration-coverage test, not here.
- **If a patch changes an ore's `worth`**: saved statistics keep the numbers
  recorded at the time; readouts use the new value from then on.

**Zero and boundaries**

- **If a container holds only worth-0 items**: its worth is 0, so the pack does
  not glow and an extraction with only rocks and sticks records a haul of 0.
- **If a cost is paid only in valley materials**: its price in runs is 0 (F4),
  which is correct for the rebuild set (R10); the Ore pacing report prints 0.
- **If a cost needs an ore whose `expected_yield` is 0**: the Ore pacing
  report shows the cost as unreachable and never divides by 0 (F4).
- **If a cost names the same id twice, or a count of 0**: Crafting's and
  Building's own tests refuse it (they own the costs; R13), so a malformed
  cost never reaches `TakeCost`. **If two families tie for its main family**:
  the Ore & Item Economy CI test fails the build (R13).
- **If a recipe's output id is also one of its cost ids**: the Ore & Item
  Economy CI test fails the build (R13), so an `Exchange` never takes and
  gives the same id.
- **If a recipe for the first drill of tier `k` needs an ore whose `drill_tier`
  is `k` or higher**: that drill could never be made, because its ingredients
  need it. The Ore & Item Economy CI test fails the build (R13; Acceptance
  Criteria 20). Refined ore
  counts: a recipe may need tier-2 ore that refine-down makes from tier 3 only
  if tier 2 can also be mined with a lower drill.
- **If the kind does not fit the container** (a tool offered to the pack, ore
  to a tool slot): `Add` returns 0 (never refused) and `AddAll`, `Move` or an
  `Exchange` output is refused with `cant_go_there`. Gear follows `accepts`
  the same way: the pack refuses it, a stash accepts it.
- **If an operation names a removed container** (a second `Remove`
  included): Malformed.

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
- **Refining to dodge pacing or coverage.** Refine-down gives
  `floor(worth(t) / worth(t − 1))` units and loses about 13% of worth per
  step (R2), so it can only turn a rich haul into cheaper ore, never the
  reverse; it never counts towards coverage (R10), and the CI test refuses a
  refine recipe that breaks R2's rate (R13).
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
| Game Data & Tuning (1) | Hard | Loads every holdable definition, `limits.holdable`, `limits.ore` and `tuning.ore_and_item_economy` and checks them (its R9; cross-kind and cross-system rules are this system's CI test, its R3); hands them over as plain values (its R10); the kinds `ore`, `material`, `item` are assigned to this system by its R2 | [game-data-and-tuning.md](game-data-and-tuning.md) (in review) |
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
| Home Valley (5) | Soft | Rock and stick definitions its gatherables give; their stack sizes and worth for its rebuild check (its F3) | [home-valley.md](home-valley.md) |
| Pack (8) | Hard | The pack container; `Add`, `TakeSlot` for drops, F5 worth, at risk | [pack.md](pack.md) |
| Tools & Gear (9) | Hard | Carried tool slots; R1's fields on tool and gear definitions; ore `drill_tier` | Not written: provisional |
| Gathering (10) | Hard | Rock and stick definitions; `Add` into the pack | Not written: provisional |
| Building (11) | Hard | `TakeCost`, `Remove`; family use (R2) and coverage (R10) for piece and repair costs | Not written: provisional |
| Stash (12) | Hard | Stash containers; `Move`, `Clear`, `Remove` | Not written: provisional |
| Crafting (13) | Hard | `Exchange`; family use and coverage for recipes; refine-down at R2's rate; the CI test's recipe rules (R13); F4 pacing bands | Not written: provisional |
| Mining (21) | Hard | `toughness`, `drill_tier`; `Add(ore, 1)` | Not written: provisional |
| Storms (14) | Soft (through Stash) | The storm sink | Not written: provisional |
| Oxygen (19) | Hard | `item.canister.oxygen`; `Take` when used | Not written: provisional |
| Run Flow (22) | Hard | `Clear` on carried containers at death or abandon; the left-in-the-world sink; haul worth (F5 at launch and extraction); best haul solo or crew | Not written: provisional |
| Save & Load (7) | Hard | Container contents as id and count per slot (this system's slot shape); retired-id migrations for holdables; the removed-at-load sink; best haul solo and crew | [save-and-load.md](save-and-load.md) |
| Home HUD & Panels (15), Run HUD (24) | Soft | Contents, worth, refusal reasons, display data | Not written |
| Market & Trading (35, Full Vision) | Soft | Worth as a price base | Not written |

**Bidirectional check.** The systems index lists Ore & Item Economy as a
dependency of rows 8, 9, 10, 11, 12, 13, 21 and 35, which matches the table.
It does not list it for Storms, Oxygen, Run Flow or Save & Load: Storms
reaches containers through Stash; Oxygen's canister and Run Flow's death clear
use this system's contract directly, and their design docs should list it
when written (Open Questions 4). The written docs already do: Pack lists this
system as a hard upstream ([pack.md](pack.md), Dependencies), Save & Load
lists it in its Interactions as the owner of the slot format
([save-and-load.md](save-and-load.md)), and Home Valley lists it for the
materials its gatherables give ([home-valley.md](home-valley.md)). Game Data &
Tuning lists this system as a hard dependent (`ore`, `material`, `item`
definitions) and Session & Authority lists the owning systems' `Try…` methods,
which call these operations; both match.

## Tuning Knobs

### This system's tuning set: `tuning.ore_and_item_economy`

These values are read only by the Ore pacing report (F4, R13); nothing at
run time reads them, so a change takes effect at the next start-up. Whether
such CI-only keys belong in the runtime catalog is Open Questions 13.

| Key | Type | Value | Min | Max | Step | Unit | Apply | Too low | Too high |
|---|---|---|---|---|---|---|---|---|---|
| `pacing_haul_worth` | int | 600 | 100 | 5,000 | 50 | `credits` | `restart` | Every cost looks expensive in runs; owners under-price | Every cost looks cheap; the MVP ceiling arrives early |
| `pacing_ceiling_runs_min` | float | 15 | 1 | 200 | 1 | `level` | `restart` | The report never flags a progression that is too short | Every honest progression is flagged short |
| `pacing_ceiling_runs_max` | float | 30 | 1 | 200 | 1 | `level` | `restart` | Every honest progression is flagged long | The report never flags a grind |
| `pacing_success_rate` | float | 0.7 | 0.1 | 1 | 0.05 | `share` | `restart` | Every cost looks expensive; deaths over-counted | Deaths ignored; costs look cheap |
| `band_canister_max_runs` | float | 0.15 | 0.01 | 1 | 0.01 | `level` | `restart` | Canisters flagged even when trivial | Canisters tax every run without a flag |
| `band_drill_loss_min_runs` | float | 0.5 | 0.05 | 5 | 0.05 | `level` | `restart` | A lost drill can be nearly free without a flag | Honest drill costs flagged cheap |
| `band_drill_loss_max_runs` | float | 1.0 | 0.05 | 5 | 0.05 | `level` | `restart` | Honest drill costs flagged dear | A lost drill can cost several runs without a flag |
| `band_repair_max_runs` | float | 0.25 | 0.01 | 2 | 0.01 | `level` | `restart` | Repairs flagged even when trivial | Repair becomes a chore without a flag |
| `band_one_off_min_runs` | float | 0.5 | 0.05 | 10 | 0.05 | `level` | `restart` | Trivial pieces never flagged | Honest cheap pieces flagged |
| `band_one_off_max_runs` | float | 3 | 0.05 | 10 | 0.05 | `level` | `restart` | Honest pieces flagged dear | A grind of a piece goes unflagged |

Constraints: `pacing_ceiling_runs_min ≤ pacing_ceiling_runs_max`,
`band_drill_loss_min_runs ≤ band_drill_loss_max_runs`,
`band_one_off_min_runs ≤ band_one_off_max_runs`. Owner: Ore & Item Economy.
Rationale: `pacing_haul_worth` is an **unmeasured placeholder** (the retest's
pack of 590 was valued at the prototype's old worths, F4); the success rate is
a guess; the bands come from F4's table. Every runs-valued key (the six bands
and the two ceiling keys) is measured in *average runs* and uses Game Data &
Tuning's `level` unit (float, min ≥ 0), whose rationale names the scale:
"average runs". `multiplier` would be wrong, since 1 is not "no change" for a
band; a `runs` unit may be requested from Game Data & Tuning later (Open
Questions 14). The ceiling band is a first guess at 4 to 8 hours of MVP
progression. **All are provisional**
until real runs record haul worths. `pacing_haul_worth` should follow the
typical haul once Run Flow logs it: if the median successful haul moves, F4's
prices move with it.

### Knobs on definitions (Game Data & Tuning, R1: one thing's numbers live on it)

| Field | On | MVP values | Safe range | Too low | Too high | Interacts with |
|---|---|---|---|---|---|---|
| `worth` | each ore | 10 / 35 / 120 per tier (F1) | 1 to 100,000 for ore (`limits.holdable` allows 0 to 100,000 for every holdable; ore's floor of 1 is the Ore & Item Economy CI test, R13) | Deep seams stop paying for their risk; "one more seam" loses its pull | A single seam outweighs the pack; tier-1 ore is kept only because recipes need it | Worth per slot (F1); `pacing_haul_worth` (F4); refine-down rates (R2) |
| `toughness` | each ore | 2.0 / 3.5 / 6.0 s per tier at drill power 1 | 0.5 to 20 s (`limits.ore`) | Drilling is no bet: little noise and time per piece | Seams feel like a chore; hunters arrive before a pack fills | Worth (F1); Mining's drill power; Perception's noise per second of drilling |
| `drill_tier` | each ore | 1 / 1 / 2 per tier | 1 to 3 (`limits.ore`) | Top tier needs no better drill; the drill recipe loses its point | A tier that no MVP drill can mine | Tools & Gear's drill tiers; Acceptance Criteria 20 |
| `stack_max` | every holdable | ore 1, rock and stick 20, canister 2, tools 1 | 1 to 999 (`limits.holdable`); ore exactly 1 (CI test, R13) | Rock and stick fill the pack before a wall is affordable | Ore stacks in the pack and the 16-slot tension is gone | Every container's `stack_scale` (F2) |
| `worth` | valley materials, items, tools | 0 | 0 in the MVP (CI test, R13; `limits.holdable` itself allows up to 100,000) | — | Rocks count as haul; the pack glows with sticks | Pack glow, haul statistics |

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
  saturation (Acceptance Criteria 32).
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

- An ore piece entering the pack has a short pickup cue whose pitch rises
  with **the piece's tier**, so a tier-3 piece is heard as well as seen. This
  per-piece cue is owned here. Pack's worth band drives a separate
  pack-fullness layer, never the pickup pitch (a note for Pack and Audio;
  Pack's owner aligns pack.md). A refused pickup (`no_room`) has its own soft,
  distinct sound (Pack and Run HUD own the refusal cue; this system supplies
  the tier and the reason).
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
  "credits" (R9; Acceptance Criteria 33).
- **Refusal reasons** owned here (`no_room`, `not_enough`, `not_empty`,
  `cant_go_there`, R6) have short player-facing display names (No room, Not
  enough [item], Not empty, Can't go there) with the item's display name
  filled in, and are localisable. The display strings belong to UI; code and
  tests use only the ids.
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
| R1, R2, R3, R13, Tuning Knobs | Game Data & Tuning | Kinds, id rules, R1 (numbers on definitions; field-limits records `limits.holdable`, owned here, and `limits.ore`), R2 shared holdable fields and the `limits` kind, R3 (rules across sets or systems are owner CI tests; the runtime catalog only passes or fails), R5 units (`credits`, `count`, `level`, `s`, `share`), R7 display data, R9 checks 4, 6, 8 and 9, R14 retired ids | [game-data-and-tuning.md](game-data-and-tuning.md) |
| R6, R10, Interactions | Pack | R5 drop of a chosen slot (`TakeSlot`); Open Question 1, a home discard (Open Questions 15) | [pack.md](pack.md) |
| R7, R10, Interactions | Save & Load | Slot format owned here, file format there; removal at load; 64-bit statistics | [save-and-load.md](save-and-load.md) |
| R10, Interactions | Home Valley | Gatherables; F3 rebuild check | [home-valley.md](home-valley.md) |
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
tests on the Simulation, on the Ore & Item Economy CI test's rules or on the
Ore pacing report's code (R13; no engine,
no files: ADR-0001), built from factory functions and a minimal cost schema
owned by this document (a list of `{id, count}` with a `recurrence` tag), not
from the shipped catalog or from Building and Crafting's undesigned recipes;
**Config** criteria read the shipped catalog (advisory, a smoke check);
**Integration** needs two systems or the save; **Visual/UI** needs a retained
screenshot in `production/qa/evidence/`. **[B]** marks criteria that need ore
*in play* and cannot run before Milestone B (R12); fixture-based Logic tests
are not [B]. Refusals are asserted by reason-code id (R6), never by display
string.

**Holdables and data (R1 to R3, R11)**

1. *(Logic)* **GIVEN** a stash container and the known piece id
   `piece.wall.stick`, **WHEN** `AddAll(piece.wall.stick, 1)` is called,
   **THEN** it is refused with `cant_go_there` and the container is
   unchanged; `Add` with the same arguments returns 0 and is not refused.
2. *(Logic)* **GIVEN** holdable definitions checked by the catalog against
   `limits.holdable` and `limits.ore` (Game Data & Tuning R9, check 8), one per
   case: `stack_max` 0 or 1,000; `worth` −1 or 100,001; `tier` −1 or 4;
   `toughness` 0.4 or 21; `drill_tier` 0 or 4, **THEN** each fails naming the
   id and the field; `stack_max` 1 and 999, `worth` 0 and 100,000, `tier` 0
   and 3, `toughness` 0.5 and 20 and `drill_tier` 1 and 3 pass. **GIVEN**
   definitions that pass the catalog, run through the Ore & Item Economy CI
   test's per-kind rules (R1, R13), one per case: an ore with `worth` 0,
   `tier` 0, `stack_max` 2 or family `none`; a material with `worth` 5, `tier`
   1 or family `amber`; a tool with `tier` 1, **THEN** each fails naming the
   id, the kind and the field; an ore with `worth` 1, an ore with `worth`
   100,000, ores with `tier` 1 and `tier` 3 (each `stack_max` 1, family
   `amber`), and a material with `tier` 0, `worth` 0 and family `none` pass.
3. *(Config)* **GIVEN** the shipped catalog, **WHEN** it is loaded, **THEN** it
   holds exactly the six ores of R2 with the family, tier, worth, toughness and
   drill tier in R2's table, and the three items of R11 with their
   `stack_max` and worth 0.
4. *(Logic)* **GIVEN** a canister with `stack_max` 2 and Oxygen's
   `canister_carry` 3, **WHEN** the Ore pacing report runs, **THEN** it prints
   both values and the build is not failed; **GIVEN** `canister_carry` 2
   (equal), **THEN** nothing is printed for the canister.

**Containers and operations (R4, R6, F2, F3)**

5. *(Logic)* **GIVEN** a container with scale 1 and one with scale 10, **WHEN**
   the cap is asked for an ore (`stack_max` 1) and for `material.stick`
   (`stack_max` 20), **THEN** the caps are 1 and 10 for the ore and 20 and 200
   for the stick; **GIVEN** `stack_max` 999 and scale 100, **THEN** 99,900.
6. *(Logic)* **GIVEN** a 16-slot pack (scale 1) with 3 sticks in slot 0 and the
   other 15 slots each holding one ore, **WHEN** `Add(material.stick, 20)` is
   called, **THEN** it returns 17, slot 0 holds 20, and the caller still holds
   3 sticks; **WHEN** `Add(test item, 2,147,483,647)` is called for a factory
   test item of `stack_max` 999 on an empty 200-slot container of scale 100,
   **THEN** it returns 19,980,000 (999 × 100 × 200).
7. *(Logic)* **GIVEN** a 4-slot container (scale 1) whose only filled slot is
   slot 2, holding 5 sticks, **WHEN** `Add(material.stick, 30)` is called,
   **THEN** slot 2 is topped up to 20 first, then slot 0 receives 15, and slots
   1 and 3 stay empty.
8. *(Logic)* **GIVEN** a full container, **WHEN** `AddAll(id, 1)` is called,
   **THEN** it is refused with `no_room` and every slot is unchanged.
9. *(Logic)* **GIVEN** a container with 4 rocks in slot 0 and 4 in slot 2,
   **WHEN** `Take(material.rock, 6)` is called, **THEN** slot 2 becomes empty,
   slot 0 holds 2 and 6 rocks are returned; **WHEN** `Take(material.rock, 3)` is
   then called, **THEN** it is refused with `not_enough` naming
   `material.rock` and slot 0 still holds 2.
10. *(Logic)* **GIVEN** a pack slot with 5 sticks and a stash with room for
    only 2 more sticks, **WHEN** `Move(pack, slot, stash, stick, 5)` is called,
    **THEN** it returns 2 and the pack slot holds 3; **GIVEN** a pack slot with
    5 sticks and a target with room for 20, **WHEN** `n` is 9, **THEN** it
    returns 5 and the source slot becomes empty.
11. *(Logic)* **GIVEN** one fixture per case: a `Move` from an empty slot; from
    a slot holding a different id; into a full target; into a target that does
    not accept the kind; from an empty slot into a target that does not accept
    the kind; with the same container as source and target, **THEN** the
    refusals are `not_enough`, `not_enough`, `no_room`, `cant_go_there`,
    `cant_go_there` (precedence) and `malformed`, and both containers are
    unchanged each time.
12. *(Logic)* **GIVEN** a pack with 3 `ore.gild` and a stash with 5, and a cost
    of 6 `ore.gild` and 1 `ore.verdite` with neither container holding verdite,
    **WHEN** `TakeCost(cost, [pack, stash])` is called, **THEN** it is refused
    with `not_enough` naming `ore.verdite` and both containers are unchanged;
    with one verdite added to the stash, the same call takes all 3 from the
    pack, 3 from the stash and the verdite; **GIVEN** `[pack, pack]` as
    sources, **THEN** `malformed`.
13. *(Logic)* **GIVEN** a 24-slot stash (scale 10) whose slots 0 to 22 are
    each full of ore and whose slot 23 holds 4 `material.stick`, and a recipe
    costing 4 `material.stick` from `[stash]` and producing 1 `tool.hammer`
    into the stash, **WHEN** `Exchange` runs, **THEN** it is accepted and slot
    23 holds the hammer; **GIVEN** the same stash and a recipe producing 11 of
    a factory test tool of `stack_max` 1 (cap 10 in the stash, so two slots),
    **THEN** it is refused with `no_room` and nothing is taken; **GIVEN** the
    hammer recipe with a pack as target (the pack does not accept tools),
    **THEN** it is refused with `cant_go_there` and nothing is taken.
14. *(Logic)* **GIVEN** a stash holding items, **WHEN** `Remove` is called,
    **THEN** it is refused with `not_empty`; **WHEN** `Clear(stash, storm)`
    and then `Remove` are called, **THEN** `Clear` returns exactly the units
    that were there, the ledger records them as consumed by the storm sink, the
    container no longer exists, and any later operation naming it (a second
    `Remove` included) is `malformed`.
15. *(Logic)* **GIVEN** a tool and an ore, **WHEN** `AddAll`, `Add` and `Move`
    offer the tool to the pack and the ore to a carried tool slot, **THEN**
    `AddAll` and `Move` are refused with `cant_go_there` and `Add` returns
    0.
16. *(Logic)* **GIVEN** two players' packs, **WHEN** player A's request names
    player B's pack in a `TakeCost` or `Move`, **THEN** it is `malformed` and
    nothing changes. *(R4)*

**Conservation and interchangeability (R5, R7)**

17. *(Logic)* **GIVEN** a pack, two stashes, a world stub and a fixed,
    committed list of 1,000 operations covering every operation in R6
    (generated once and stored as a test fixture), whose starting contents are
    posted to the ledger from a test faucet at step 0, **WHEN** they are run
    in order, **THEN** after every operation, for each id, the units in the
    containers plus the ledger's world and sink totals equal the ledger's
    faucet total, and every slot not named by the operation's stated effect
    is byte-identical to its state before the operation.
18. *(Logic)* **GIVEN** any container, **WHEN** its contents are read for
    saving, **THEN** each slot is either empty or exactly an id and a count;
    no other per-item field exists.

**Worth and pacing (R9, R10, F1, F4, F5)**

19. *(Logic)* **GIVEN** a test catalog where a tier-2 ore's worth per second
    at its weakest capable drill is lower than its tier-1 ore's, **WHEN** the
    Ore pacing report runs, **THEN** it lists that ore, the build is not
    failed, and the catalog still becomes Ready (a report, not a refusal).
    (The shipped catalog's values moved to criterion 36.)
20. *(Logic, provisional on Tools & Gear's drill tiers)* **GIVEN** a test
    recipe whose output is the first drill of tier 2 and whose inputs include
    an ore with `drill_tier` 2, **WHEN** the Ore & Item Economy CI test runs,
    **THEN** it fails naming the recipe and the ore; the same recipe with only
    `drill_tier` 1 ore passes.
21. *(Logic)* **GIVEN** cost sets built from the minimal cost schema, **WHEN**
    the Ore & Item Economy CI test's coverage and main-family rules run (R10,
    R13): a passing set (a `per_death` cost of 6 `ore.seaglass`, 3
    `ore.verdite` and 2 `ore.gild`, amber 70 of 235 = 29.8%; one `one_off`
    cost mainly amber; one `one_off` cost mainly teal) passes. Changed one
    case at a time: amber's only recurring share at exactly a fifth (a
    `per_run` cost of 8 `ore.seaglass` and 2 `ore.ochre`, 20 of 100 = 20%)
    passes, and just below (2 `ore.gild`, 2 `ore.tidestone`, 1 `ore.verdite`
    and 2 `ore.seaglass`, 70 of 365 = 19.2%) fails naming amber; the same for
    teal; amber's only recurring use a `per_storm` repair fails; amber's only
    recurring use a refine-down recipe (1 `ore.sunstone` → 3 `ore.gild`,
    tagged `per_run`) fails, because refining never counts; no `one_off` cost
    mainly amber fails naming amber (the one-off half), though the recurring
    half passes; a cost with a missing or an unknown `recurrence` fails naming
    the cost; a cost of 2 `ore.ochre` and 2 `ore.seaglass` (20 and 20, a tie)
    fails; a cost of 10 `ore.ochre` and 1 `ore.tidestone` (100 amber, 120
    teal) has main family teal. **GIVEN** the Milestone A catalog with no ore
    faucet, **THEN** the coverage rule is skipped.
22. *(Logic)* **GIVEN** a `per_death` cost of 6 `ore.seaglass`, 3
    `ore.verdite` and 2 `ore.gild` (a set that passes coverage, criterion 21),
    `pacing_haul_worth` 600 and `pacing_success_rate` 0.7, **WHEN** the Ore
    pacing report runs, **THEN** it shows a worth price of 0.560 runs
    (± 0.001), "yield price not computed" while no `expected_yield` exists,
    the cost's worth share per family and tier (teal 165, amber 70), the cost
    counted once as one-off in `ceiling_runs` (its first craft), and a
    surplus line per family; a cost of rock and stick only shows 0. **GIVEN**
    a fixture `expected_yield` of 4 seaglass per run and none for verdite and
    gild, **THEN** the price is max(0.560, 6 / 4) = 1.5 and verdite and gild
    are named as skipped; **GIVEN** `expected_yield` 0 for verdite, **THEN**
    the cost is shown as unreachable and no division happens. **GIVEN** the
    same passing set with `pacing_ceiling_runs_min` 31 and
    `pacing_ceiling_runs_max` 30, **WHEN** the catalog is checked, **THEN** it
    fails on the set constraint (Game Data & Tuning R9, check 9b) and the
    error names `pacing_ceiling_runs_min`; with 30 and 30 it passes.
23. *(Logic)* **GIVEN** a pack with 6 `ore.ochre`, 5 `ore.gild`, 2
    `ore.sunstone` and 3 sticks, **WHEN** its worth is asked, **THEN** it is
    475; an empty container is 0; a test container of 200 slots, each holding
    99,900 units of a factory item of worth 100,000 (built by a factory that
    skips catalog checks), returns 1,998,000,000,000 with no overflow.
24. *(Logic)* **GIVEN** a pack worth 300 and a carried better drill whose
    recipe inputs are worth 235, **WHEN** at risk is asked, **THEN** it is 535;
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
    items are moved out, **THEN** no item is lost, each overflow slot is
    removed as soon as it empties, and slots 0 to 11 keep their indices.
29. *(Integration)* **GIVEN** two requests in the same tick, in this arrival
    order, that each move the only 3 sticks from the same stash slot into the
    pack, **WHEN** the tick runs, **THEN** the first moves 3, the second is
    refused with `not_enough` naming `material.stick`, and the total number of
    sticks is unchanged.
30. *(Logic)* **GIVEN** the Milestone A faucet registry (no run systems),
    **THEN** no faucet's output is an `ore.*` id, and the six ore definitions
    are present in the catalog.
31. *(Integration, provisional on Run Flow)* **GIVEN** a run
    in progress with ore and a canister in the pack, a drill in a carried tool
    slot and items in a stash at home, **WHEN** the player dies and the save is
    reloaded, **THEN** every carried container is empty and the stash holds
    exactly what it held at launch. **[B]**

**What the player sees**

32. *(Visual, provisional on Asteroid World's zones and the helmet lamp)*
    **GIVEN** the six ores placed side by side in the mid zone's light and
    again in the helmet lamp in the deep zone, **WHEN** screenshots are taken,
    **THEN** an unhinted viewer (the art lead) names the family of each and
    orders 6 of 6 ores correctly by tier in both shots; a greyscale copy still
    shows the tier order by facet count and cluster size. Retained in
    `production/qa/evidence/`; art lead sign-off. **[B]**
33. *(UI, provisional on the Run HUD and haul summary UX specs)* **GIVEN** the
    pack readout during a run and the haul summary at extraction, **WHEN**
    screenshots are taken, **THEN** the value is labelled worth, with no
    currency sign and no word "credits", and the at-risk readout is labelled
    as what a death would cost. **[B]**

**Performance**

34. *(Logic, blocking)* **GIVEN** a 200-slot container and a ledger
    preallocated for at least 10,000 events, **WHEN** 10,000 mixed `Add`,
    `Take` and `Move` calls run after a warm-up of 1,000 calls, **THEN** they
    allocate no managed memory, measured by the thread's allocated-bytes
    counter.
35. *(Logic, advisory)* **GIVEN** the same benchmark, **THEN** it finishes in
    under 10 ms in total on the development PC; advisory, because timings vary
    by machine.

**Added in revision 2**

36. *(Config, provisional on Mining's drilling formula and Tools & Gear's
    drill power)* **GIVEN** the shipped catalog, **WHEN** the Ore pacing
    report runs, **THEN** it shows 5, 10 and 40 worth per second for tiers 1,
    2 and 3 in both families (tier 3 at the better drill's power 2).
37. *(Logic)* **GIVEN** test recipes run through the Ore & Item Economy CI
    test's refine-down rule (R2, R13), **THEN** 1 `ore.sunstone` → 3
    `ore.gild` (120 in, 105 out) and 1 `ore.gild` → 3 `ore.ochre` (35 in, 30
    out) pass; 1 `ore.sunstone` → 4 `ore.gild` (worth rises to 140), 1
    `ore.sunstone` → 2 `ore.gild` (below R2's rate), 1 `ore.sunstone` → 9
    `ore.ochre` (two tiers down) and 1 `ore.gild` → 3 `ore.seaglass` (across
    families) each fail naming the recipe.
38. *(Logic)* **GIVEN** a 16-slot pack with 4 sticks in slot 3, **WHEN**
    `TakeSlot(pack, 3)` is called, **THEN** it returns 4 sticks, slot 3 is
    empty and the ledger holds one row of 4 sticks out of the pack; **WHEN**
    it is called again on slot 3, **THEN** `not_enough` and nothing changes;
    **WHEN** it names slot 16 or −1 on that pack (no overflow slots), **THEN**
    `malformed`.
39. *(Logic)* **GIVEN** one call per case: an unknown id; a count of 0; a
    count of −1; a removed container (including a second `Remove`); another
    player's pack; a slot index past the last slot; an `Exchange` whose
    sources list the same stash twice, **THEN** each is `malformed` and no
    container or ledger row changes.
40. *(Logic)* **GIVEN** a container of 12 indexed slots, slot 5 holding 3
    sticks, and two overflow slots holding 4 and 2 sticks (cap 20), **WHEN**
    `Add(material.stick, 10)` is called, **THEN** only slot 5 and empty
    indexed slots receive sticks, never an overflow slot; **WHEN**
    `Take(material.stick, 3)` is called on the starting container, **THEN** it
    draws the last overflow slot first (2, which is removed at once), then 1
    from the other, leaving one overflow slot of 3; `Take(material.stick, 9)`
    counts all 9 and succeeds, while 10 is `not_enough`; `TakeCost` draws
    overflow first the same way; `Move` from an overflow slot into the same
    container's indexed slots is accepted; `Remove` on a container whose only
    filled slot is an overflow slot is `not_empty`.
41. *(Logic)* **GIVEN** a container built with items in slots 12, 14 and 15,
    slot 13 empty, and `slots` lowered to 12, **THEN** it has exactly three
    overflow slots holding the former slots 12, 14 and 15 in that order, and
    no empty overflow slot.
42. *(Logic)* **GIVEN** a world stack of 5 sticks and a pack with room for 3,
    **WHEN** it is picked up, **THEN** 3 enter the pack and leave the world in
    one step, the world stack keeps 2, and no faucet row is posted; **GIVEN**
    a gather offering 5 sticks with room for 3, **THEN** the Gathering faucet
    row posts 3, not 5.
43. *(Logic)* **GIVEN** an accepted `Exchange` of 4 sticks for 1 hammer,
    **THEN** the ledger holds 4 sticks to the Crafting sink and 1 hammer from
    the Crafting faucet, and conservation (R7) holds; **GIVEN** a test recipe
    whose output id is also one of its cost ids, **WHEN** the Ore & Item
    Economy CI test runs, **THEN** it fails naming the recipe.
44. *(Logic)* **GIVEN** a world stub holding 3 ore at scene end, **WHEN** the
    left-in-the-world sink is posted, **THEN** the ledger moves 3 from world
    to that sink and conservation holds; **GIVEN** a stack the load step
    deletes or cannot place, **THEN** it is posted to the removed-at-load
    sink and conservation holds.
45. *(Integration, provisional on Stash)* **GIVEN** a stash piece holding
    items, **WHEN** its removal is requested and everything fits in the
    player's carried containers, **THEN** every unit is moved with `Move` and
    the container removed in one step; **WHEN** not everything fits, **THEN**
    the removal is refused with `no_room` and nothing moves.
46. *(Logic)* **GIVEN** a pack worth 300, a carried better drill made by two
    test recipes with inputs worth 235 and 300, two canisters from a recipe
    with inputs worth 20 and `out_n` 2, and a hammer made only of rock and
    stick, **WHEN** at risk is asked, **THEN** it is 300 + 235 + 2 × 10 + 0 =
    555; **GIVEN** two recipes that each need the other's output, **WHEN** the
    Ore & Item Economy CI test runs, **THEN** it fails naming both.
47. *(Logic)* **GIVEN** player A abandons a run carrying ore and a drill,
    **WHEN** Run Flow's abandon calls `Clear(…, death)`, **THEN** A's carried
    containers are empty and the ledger records the units in the death sink.
48. *(Logic)* **GIVEN** a gear item, **WHEN** `AddAll` offers it to the pack,
    **THEN** `cant_go_there` and `Add` returns 0; **WHEN** `AddAll` offers it
    to a stash, **THEN** it is accepted.

**Traceability** (every rule, formula, state and edge case to its criteria):

| Item | Criteria |
|---|---|
| R1 holdable fields, `limits.holdable`, per-kind rules | 1, 2, 3, 48 |
| R2 ores, refine-down rate, tier roles | 3, 37; refine recipes themselves: Crafting (Open Questions 5) |
| R3 `limits.ore` | 2, 3 |
| R4 containers, `accepts`, who may touch | 1, 13, 15, 16, 39, 48 |
| R5 interchangeable | 18 |
| R6 operations, Malformed list, reason codes, precedence | 6 to 16, 38, 39, 40, 43 |
| R7 ledger, atomic pick-up, world and load sinks | 14, 17, 42, 43, 44 |
| R8 death and storm sinks, abandoned run | 14, 26, 31, 47 |
| R9 worth, at risk, replacement worth, crew haul | 23, 24, 25, 46; best haul solo or crew: Save & Load and Run Flow |
| R10 coverage, main family, refine exclusion, sinks, ceiling | 21, 22, 30, 43, 44; rebuild guarantee: Home Valley F3, Building, Crafting |
| R11 canister vs `canister_carry` (both sides) | 3, 4 |
| R12 Milestone A | 21 (skip), 30 |
| R13 CI test rules 1 to 7; pacing report | 2, 21, 20, 37, 46, 43; 4, 19, 22, 36 |
| F1 | 3, 19, 36 |
| F2 | 5 |
| F3 | 6, 7, 8, 27 |
| F4 (worth price, yield, unreachable, ceiling, surplus) | 22 |
| F5 | 23 |
| States: slot, overflow slot, container | 14, 28, 40, 41 |
| Edge Cases: full and partial | 6, 10, 11, 12, 13, 42 |
| Edge Cases: two at once, another player's pack, stash removal | 16, 29, 39, 45 |
| Edge Cases: data changes (over-cap, overflow, load removal) | 27, 28, 40, 41, 44; retired ids: Save & Load |
| Edge Cases: zero and boundaries | 1, 15, 20, 22, 39, 43, 48; cost with same id twice or count 0: Crafting and Building tests |
| Performance | 34, 35 |

**Gaps the QA lens found, and where they went:** the rebuild guarantee (R10)
cannot be tested here because the costs belong to Building and Crafting and
sufficiency to Home Valley's F3; it is carried to their acceptance criteria
(Open Questions 5). Refine-down's rule is tested here (37); the recipes
themselves are Crafting's. The retired-id migration check belongs to Save &
Load's migration-coverage test (Edge Cases). F1 is a design rule, so it is
covered by criteria 3 and 36 (the shipped values) and 19 (the report), not by
a run-time test. Stash's visible pile (R10) is the Stash design doc's
criterion.

## Open Questions

| # | Question | Owner | Resolve by |
|---|---|---|---|
| 1 | **Is the accepted MVP ceiling right, and what is the lasting sink?** Once the home is built in run materials, only recurring sinks take ore (R10). The lead candidate for a lasting sink is a placeable ore trophy or inlay piece with a rising cost (a Building sink the player walks past, not a number); a cost of acting at launch (ship or pad prep) is an option for Run Flow. The Ore pacing report's surplus per family (F4) gives the size of the pile. Also open here (revision 2): tier 3's only non-score use is refining (R2), accepted for the MVP; coverage counts existence, not frequency, so a required recurring amber use would be a scope change that waits for the lasting sink (R10); and equal worth per tier misprices the families once the home is built (amber's use ends, teal's continues), which an in-run "home needs" cue from Crafting or the Run HUD could correct | Designer, Building, Run Flow, Crafting, Run HUD | First playable of Milestone B |
| 2 | **Ore names and ids** (ochre, gild, sunstone; seaglass, verdite, tidestone) are provisional. The senior review recommends ids that carry family and tier instead of names (for example `ore.amber_t1`), with the names as display data, so a rename never needs a save migration. Not applied here because it changes registry ids, an always-ask schema change: **the designer decides** before the first build that writes a save with ore | Designer | Before the first build that writes a save with ore |
| 3 | **The art bible's open question on teal's worth is answered here** (equal worth per tier; families differ by use). The art bible's note in Section 4 should point to R2 | Art director | Next art bible revision |
| 4 | **The systems index does not list this system for Save & Load (7), Storms (14), Oxygen (19) or Run Flow (22)**, which all use its contract, and row 4 omits Session & Authority (Dependencies). Pack's and Save & Load's design docs now list this system themselves; the index rows still need adding, or noting as implicit as Game Data & Tuning does | Producer (`/map-systems` owns the index) | Before those design docs are written |
| 5 | **The rebuild guarantee and refine-down recipes** (R2, R10) can only be tested where the costs live. The Building and Crafting design docs must each carry an acceptance criterion that the starter set (workbench, hammer, basic drill, one shelter repair) costs only rock and stick, which Home Valley's F3 checks against the valley's stock; Crafting must define the refine-down recipes at R2's rate (checked by the CI test, criterion 37), the amber share in the canister and better-drill recipes, and tests that no cost names an id twice or a count of 0; every cost carries its `recurrence` tag | Building, Crafting design docs | When they are written |
| 6 | ~~Wording in Game Data & Tuning~~ **Closed (2026-11-28):** Game Data & Tuning's revision 2 renamed the set `tuning.ore_and_item_economy`, put worth on definitions, gave container sizes to their owners and made this system the owner of the four holdable fields on every holdable kind | — | — |
| 7 | **Per-item state.** Tool durability, ore quality or anything else held per unit is out of scope (R5). Tier 1a's gear tiers may want it; it would need a new slot shape and a save migration | Tools & Gear, Save & Load | Before Tier 1a design |
| 8 | **Pacing values** (`pacing_haul_worth` 600 as an unmeasured placeholder, `pacing_success_rate` 0.7, ceiling 15 to 30 runs, the cost bands) and all ore worth and toughness values are provisional until real runs are played in Unity. If playtests find death too soft, raise the drill-loss band before softening anything else (Pillar 3) | Designer, economy review | After Milestone B's first playtests (at least three logged successful hauls) |
| 9 | **The pack is storm-proof at home** (Edge Cases): accepted as minor while the pack's `stack_scale` is 1. The Stash and Storms design docs should confirm they agree | Stash, Storms design docs | When they are written |
| 10 | **One set of carried containers per player.** ADR-0003 saves a single `carried`; co-op needs one per player (R4) and per-player death clears (R8). Needs an ADR-0003 amendment | technical-director, co-op ADR | Before Tier 2a |
| 11 | **Replication of containers**: absolute slot values with a full snapshot on join, no client prediction for containers | network-programmer, co-op ADR | Before Tier 2a |
| 12 | **Tier legibility under the helmet lamp**: the three teal colours share one brightness and differ only by saturation; cluster size and glint should be the primary tier cue (Acceptance Criteria 32) | Art director | Next art bible revision |
| 13 | **CI-only keys in the runtime catalog.** `tuning.ore_and_item_economy` is read only by the Ore pacing report (R13), never at run time. Does it belong in the runtime catalog, given Game Data & Tuning's rule that the schema matches the code that reads it? | Game Data & Tuning | Before the pacing report is implemented |
| 14 | **A `runs` unit.** The pacing bands and ceiling keys use `level` with "average runs" as the scale (Tuning Knobs); a dedicated `runs` unit (float, min ≥ 0) may be requested in Game Data & Tuning's R5 | Game Data & Tuning | Next Game Data & Tuning revision |
| 15 | **A home discard as a sink row** (Pack's Open Question 1): rocks and sticks only, discarded at home when a full pack has no stash. If wanted, it becomes a new sink row in R10 | Designer, Pack | First playable |
| 16 | **At-risk readout at the launch prompt**: show what the player stands to lose before launching | Run Flow | When Run Flow is designed |
| 17 | **Tier-legibility playtest criterion**: new players read tiers at 10 m and in lamp light (amber tiers 2 and 3 are close under a warm lamp); add as a playtest criterion beside criterion 32 | Designer, Art director | Milestone B's first playtests |
| 18 | **Stash display and overflow of the haul**: whether the visible stash pile shows tier as well as family, and where the haul goes when every stash is full | Stash design doc | When it is written |

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
   rises per tier (5, 10, 40 per second).
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
    differ by kind (R1, R3); F1's bounds narrowed so no tier floors to 0. (How
    the per-kind limits are checked: decision 26.)
25. **Not applied, for the designer**: ids that carry family and tier instead
    of names (Open Questions 2), because it changes registry ids.

Added in revision 2 (2026-11-28), from the creative-director's rulings in the
second `/design-review`; also logged in the decision log:

26. **(a) Limits aligned with Game Data & Tuning** — *for designer review.*
    `limits.holdable` limits `stack_max` 1 to 999, `worth` 0 to 100,000 and
    `tier` 0 to 3; `limits.ore` holds `toughness` (0.5 to 20, `s`) and
    `drill_tier` (1 to 3, `count`); the per-kind rules are a blocking Ore & Item
    Economy CI test, moving into Game Data & Tuning if it adds per-kind rows
    (R1, R3, R13).
27. **(b) Two tiers of checks**: a blocking Ore & Item Economy CI test and an
    advisory Ore pacing report, both owner CI tests (Game Data & Tuning R3);
    nothing extra at run time. Same-id-twice costs stay Crafting's and
    Building's tests (R13).
28. **(c) Coverage example rebuilt**: 6 seaglass, 3 verdite, 2 gild, tagged
    `per_death`: worth 235, amber 29.8%, 0.560 runs (F4, criteria 21, 22).
29. **(d) Refine-down rate fixed** at `floor(worth(t) / worth(t − 1))` per
    unit, about 13% loss per step; refining never counts for coverage and is
    not a ceiling sink; tier 3's only non-score use being refining is
    accepted (R2, R10, Open Questions 1).
30. **(e) Sink rows added**: left in the world (Run Flow, at scene end) and
    removed at load (Save & Load); Gathering posts only `p` (R7, R8, R10).
31. **(f) `TakeSlot(container, slot)` added** — *for designer review*: a new
    operation taking a slot's whole stack, for Pack's drop (R6).
32. **(g) F4 corrected**: yield price over ore ids only, `expected_yield` 0
    is unreachable, each recipe's first craft counts as one-off, and a
    per-family surplus with Storms' `storm_rate`.
33. **(h) Band units**: every runs-valued knob uses `level` (scale: average
    runs); a `runs` unit may be requested later (Open Questions 14).
34. **(i) Replacement worth**: cheapest recipe, recursive through crafted
    inputs, divided by `out_n`; no recipe gives 0; cycles fail the CI test
    (R9).
35. **(j) Reason-code ids** `no_room`, `not_enough`, `cant_go_there`,
    `not_empty` beside Session & Authority's `malformed`; criteria assert ids,
    display strings are UI's (R6).
36. **(k) Traceability table** added after the criteria.
37. **(l) Overflow slots**: never topped up, drawn first by `Take` and
    `TakeCost`, removed at once when empty, may `Move` into their own
    container, and block `Remove` (R6, States, Edge Cases).
38. **(m) Coverage counts existence, not frequency**: accepted as part of the
    MVP ceiling, shown by the per-family surplus (R10). *Not applied, for
    designer sign-off:* an explicit `conversion` recurrence tag; refining is
    excluded by a derived rule instead.
39. **(n) Best haul** recorded solo or crew, a crew haul never overwriting the
    solo best (R9); the pickup cue is pitched by the piece's tier, and Pack's
    worth band drives a separate pack-fullness layer (Visual/Audio).
