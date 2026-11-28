# Review Log: Ore & Item Economy

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: L
Specialists: economy-designer, game-designer, systems-designer, qa-lead, network-programmer, creative-director (senior)
Blocking items: 13 | Recommended: 9
Summary: The core model is sound and serves the pillars: one container rule, whole interchangeable items, all-or-nothing operations, conservation, the per-container stack scale that keeps one ore piece per pack slot, and a closed faucet and sink table. What blocks is spec gaps that would become real bugs (F3's room can go negative, Move and Clear are under-specified, containers have no owner in co-op) and one design contradiction: the player prices slots by worth, but costs are paid in exact ores, so the readout tells the player to drop tier-1 ore that recipes need. Rulings: haul worth is crew-wide (extraction minus launch summed over the crew, floored at 0); the worth-versus-exact-ore decision is blocking, with a refine-down recipe at a workbench recommended; the amber sink is recommended, not blocking; container identity and the death sink's scope belong here (blocking), while disconnect handling goes to Session & Authority and the replication model to a co-op ADR.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas F3 / Core Rules R6 / Edge Cases: a slot above a patched-down cap makes `cap − count` negative, so `room` and `p` can go negative and Add removes units; clamp with `max(0, cap − count)`, Add skips slots at or over cap, rewrite AC24
- [BLOCKING] Core Rules R6: Move has no expected id although its refusal assumes one, no destination rule, `from == to` undefined, an `accepts` failure could read No room; the "sort or split built from Move" claim cannot hold
- [BLOCKING] Core Rules R6 / Edge Cases: Clear returns removed units to nowhere; the stash-into-carried edge case (Clear then Add) can destroy units outside a sink; Clear empties only into a named sink, relocation is always Move
- [BLOCKING] Core Rules R4 / R8: containers have no id or owner; "the pack" is singular; requests are not limited to the requester's own containers (TakeCost could spend another player's pack); death must clear only the dying player's carried containers; ADR-0003's singular `carried` needs an amendment
- [BLOCKING] Edge Cases (degenerate strategies): haul worth must be crew-wide extraction minus launch, floored at 0, so handing ore to a partner cannot inflate it
- [BLOCKING] Core Rules R2 / R9 / Formulas F4: worth that only drives the glow and best haul contradicts exact-ore costs; decide how worth relates to costs (refine-down recipe recommended) and record it
- [BLOCKING] Formulas F4: `H` = 600 came from the prototype's four-tier worths, not 10/35/120; make it stage-dependent or recompute it; state whether the home is per crew or per player; account for crew size and success rate
- [BLOCKING] Core Rules R10 / AC19: "main family" undefined (use largest worth share, ties refused); costs need a recurring or one-off tag; exempt the Milestone A catalog
- [BLOCKING] Core Rules R7 / R10 / AC15: no faucet or sink row for ore dropped or left in the world; no ledger for AC15 to count against; Take and TakeCost do not say what they return
- [BLOCKING] Core Rules R6 / AC12: TakeCost plus AddAll as one step is not an operation R6 defines; add Exchange and give AC12 fixture values
- [BLOCKING] Core Rules R1 / R3 / Tuning Knobs: align with Game Data & Tuning's revision: `family` typed and limited to ore, per-kind worth limits (ore 1 to 100,000; non-ore 0) instead of 0 to 100,000 and 1 to 100,000, `toughness` unit `s` (or a work unit) instead of `level`; re-check when that revision lands
- [BLOCKING] Core Rules R3 / Formulas F1 / AC17: tier 3 cannot be mined with the basic drill, so the "6-second cost at the basic drill's power" and worth per second are stated at a drill power the player never has; restate each tier at the weakest drill able to mine it
- [BLOCKING] Acceptance Criteria: AC17 to 20 and AC26 test validator code and should be Logic, not Config (advisory); AC28 needs a committed request fixture and is Integration; split AC31 into a blocking allocation check and an advisory timing on a named machine
- [RECOMMENDED] Formulas F1: bounds let tier-1 worth floor to 0 and tiers tie; narrow `W1` to 10 to 100 and `R` to 2.5 to 6, round to nearest
- [RECOMMENDED] Core Rules R10: coverage should need a recurring sink with expected frequency above 0 on a successful run (amber's repair-only use piles up); recipe tracking on the Run HUD; zone family weighting to Asteroid World
- [RECOMMENDED] Formulas F4 / Tuning Knobs: recurring and one-off bands belong in tuning knobs; their rationale is wrong (death loses up to 1,920 worth); the GDD's own drill example sits outside its band
- [RECOMMENDED] Visual/Audio / Game Feel: make cluster size and glint the primary tier cue, with a measurable AC; saturation alone washes out under the lamp
- [RECOMMENDED] Edge Cases: overflow slots contradict R4's fixed slot list, `empty(c)`, Take order and the save format
- [RECOMMENDED] Core Rules R6 / R7: replication by absolute slot values with a full snapshot on join, no client prediction for containers, atomic world pick-up as an R7 invariant
- [RECOMMENDED] Acceptance Criteria: test the Logic parts of AC22, 25, 26 and 30 now and defer the rest; AC23 as a formula test; assert reason codes not display text; cover storm sink, Move refusals, `n` = int max, range validation
- [RECOMMENDED] Game Feel / Core Rules R9: "higher tiers last" contradicts stable slot order; say whether the at-risk readout includes tools
- [RECOMMENDED] Housekeeping: unit `credits` to `worth`; registry category `consumable` for the canister versus kind `item`; systems index row 4 omits Session & Authority; warn when canister `stack_max` differs from `canister_carry`
Note: Game Data & Tuning and Session & Authority were read at their committed versions (HEAD 2905cf6), because both had uncommitted revisions in progress in another session; their stamps below are those committed blobs.
Reviewed-Content-Hash: design/gdd/ore-and-item-economy.md b0a3d3490bad7892071a78cd9aa307382ace6c4a
Reviewed-Content-Hash: design/registry/entities.yaml b5a525057786c8368c6935448e7676191646fde3
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 0a88e110b40895b7451b2759c0c26cf7e215dc3b
Reviewed-Content-Hash: design/gdd/session-and-authority.md 56052cdb82245100a8deb59e2984580acc240911
Reviewed-Content-Hash: design/gdd/home-valley.md 5c961ce5cd566ede00ea37f3a102576775aebcbe
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/REPORT.md b037c022c36f2e2eceecc23d22e0e9fbcbaf8f06

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: M
Specialists: economy-designer, systems-designer, game-designer, qa-lead, creative-director (senior)
Blocking items: 7 | Recommended: 12
Summary: A second, parallel first review run by the `/design-review` side session (the entry above ran at the same time from another session; both reached NEEDS REVISION with overlapping findings). The structure is sound, but the doc did not yet hold Pillar 4: amber had nothing recurring to spend on once the home is built, and worth-0 gear made losses read as free (Pillar 3). F4 rested on a death cost and a haul size nobody measured, and the operations and acceptance criteria were imprecise. Rulings: amber keeps a recurring use through an amber share in canister and better-drill recipes (storm-repair upkeep rejected); an at-risk readout; the ceiling stays accepted with a visible pile in the stash and a rising-cost trophy sink queued; per-id yield pricing written now; split bands; H labelled unmeasured; ids that carry family and tier recommended (left for the designer, since it changes registry ids).
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules R2 / R10: amber has no recurring sink once the home is built; coverage counts existence, not frequency
- [BLOCKING] Core Rules R9: tools and canisters at worth 0 make losing them read as free
- [BLOCKING] Formulas F4: fungible-worth pricing although ore cannot be converted; recurring band rests on a false premise; H = 600 from the prototype's old worths
- [BLOCKING] Core Rules R6 / F3: Move without an id and with `from == to` undefined, negative room for over-cap slots, overflow slots against stable order, duplicate TakeCost sources, no refusal precedence, "Add refused" against F3
- [BLOCKING] Core Rules R7 / R10: craft output creates units with no faucet row; craft step not an operation; no ledger for conservation tests
- [BLOCKING] Core Rules R10: "main family" and recurring versus one-off undefined
- [BLOCKING] Acceptance Criteria: AC24 over-cap case, AC28 not deterministic, AC31 mixed blocking and advisory, Move refusals and Exchange uncovered
- [RECOMMENDED] Core Rules R2: ids as names force a migration on rename (designer decides)
- [RECOMMENDED] Formulas F1: bounds let tier 1 floor to 0; justify by worth per slot, not drilling seconds
- [RECOMMENDED] Edge Cases: retired-id migration check belongs to Save & Load
- [RECOMMENDED] Interactions: tool and gear common fields against Game Data & Tuning R2 (settled there)
- [RECOMMENDED] Edge Cases: co-op haul inflation (crew-wide haul)
- [RECOMMENDED] Edge Cases: stash removal into carried must not overflow
- [RECOMMENDED] Core Rules R10: quantify the post-ceiling surplus; require the stash pile to be visible in the world
- [RECOMMENDED] Core Rules R11: canister stack tied to Oxygen's carry limit
- [RECOMMENDED] Edge Cases: storm-proof pack only while stack scale is 1
- [RECOMMENDED] Core Rules R10: rebuild guarantee assumes a run on the tank alone
- [RECOMMENDED] Visual/Audio: teal tiers share one brightness; tier distinction under the lamp
- [RECOMMENDED] Acceptance Criteria: Logic cores for Run Flow and Save & Load criteria; validation ranges; list Milestone A deferrals
Reviewed-Content-Hash: design/gdd/ore-and-item-economy.md b0a3d3490bad7892071a78cd9aa307382ace6c4a
Reviewed-Content-Hash: design/registry/entities.yaml 91b6aada4b259dfb9ce48d8a77908f108897d523
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 22b2414d61b302121046b75b87f54d25e342a7ba
Reviewed-Content-Hash: design/gdd/session-and-authority.md f37a68281a0fd4afd3cb7fba25e689512daff35a
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/REPORT.md b037c022c36f2e2eceecc23d22e0e9fbcbaf8f06
Note: the target and registry hashes stamp them as reviewed (before revision 1).

### Revision 1 — 2026-11-28 (not a review)
Every blocking item from both 2026-11-28 reviews revised in the same side session, at the designer's standing approval: amber share in canister and better-drill recipes with frequency-aware coverage and `recurrence` tags; refine-down so worth and exact costs agree (the other review's worth-versus-exact-ore blocker); at risk; crew-wide haul worth; container ids and owners, per-player death clears (ADR-0003 amendment raised); `Move` with an id, `Exchange`, `Clear` into a named sink, refusal precedence, F3 clamped, overflow slots after the last index; the ledger; main family and recurrence defined; F4 rebuilt (worth per attempt, yield price, split bands as tuning values, surplus line); typed `family`, per-kind worth limits, toughness in seconds, tier 3 restated at the better drill; F1 bounds narrowed; acceptance criteria rewritten (35); registry `price_in_runs` and `container_worth` notes updated. Ids carrying family and tier left for the designer (Open Questions 2). The CD rulings are decisions 15 to 25. Status In Review; a fresh-session `/design-review` decides Approved.
