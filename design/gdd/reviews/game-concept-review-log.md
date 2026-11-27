# Review Log: Game Concept (Star Haul)

## Review — 2026-11-27 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: XL (full vision; producer should verify)
Specialists: game-designer, economy-designer, systems-designer, producer; senior: creative-director
Blocking items: 4 | Recommended: 6
Summary: The direction holds and the pivot's rules (valley home, forecast storms) are coherent, but several central statements no longer described the game being built: a stale scope record, a hypothesis with no stated limits, text that contradicted the designer's settled stay-home and shelter rules, and a loop and onboarding written for the old game. Milestone A proves the home and the toolchain, not the fantasy; "gets rich" and "one more seam" wait for Milestone B, and the prototype found the run "not really" tense. The 8-section GDD standard was not applied: this is a concept, checked against the concept template (all sections present). Registry empty; values cross-checked by hand against the systems index and ADR-0003.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Risks / Scope Tiers: index called pre-pivot and MVP "not re-sized"; missing Milestones A/B, 14-20 month PR-SCOPE figure, unsized valley-first order
- [BLOCKING] MVP Definition: core hypothesis did not say Milestone A cannot test it; "not really tense" prototype finding not recorded as a risk
- [BLOCKING] Key Dynamics / Long-Term Progression / Core Mechanics / Flow: stay-home described as income (contradicts L346 rule); "intact shelter" vs "under a roof"; failed run "never touches" home
- [BLOCKING] Flow / Core Loop: onboarding and session loop described the old game (no gathering, building, forecast, repair)
- [RECOMMENDED] Scope Tiers: 1b becomes Farm and ship; drop "full house building" from Tier 4; say whether Milestone A is a stopping point
- [RECOMMENDED] Open Questions: name GDD owners for "ready at launch", "normal length", "destroy", interval start (Storms, Building, Run Flow); add invariant "minimum storm interval > longest normal run" (a 55-min planet run can meet two storms)
- [RECOMMENDED] Economy: stronger pieces lower storm cost but never remove it; rock-and-stick repair costs only valley materials; a visible open-ended ore sink in the MVP (Pillar 5)
- [RECOMMENDED] Open Questions: hammer lost on death could cost the home; brief says death loses "pack and tool", concept "everything carried"
- [RECOMMENDED] MDA table: Submission row "with no timers" predates storms
- [RECOMMENDED] Stale lines: ADR-0003 not cited, "low-poly", "toy-box", answered hazard question, "drill is the only tool", Next Steps unticked

Creative-director rulings on specialist disagreements: "ready at launch" undefined = RECOMMENDED (owned by GDDs); stay-home contradiction = BLOCKING; hammer on death = RECOMMENDED (part of the open death-rule question); MVP list = point to the systems index, do not copy it.

Revision applied the same day (designer approved): all 4 blocking items fixed, plus the stale-lines item. Not re-reviewed. The other recommended items are open.

Receipt note: `design/gdd/game-concept.md` is deliberately not stamped, because it was revised after this review; the next `/design-review` will see it as NEW and run in full, as a re-review should.
Reviewed-Content-Hash: design/registry/entities.yaml dfeacb02917f751cb1dfd88cf490c7ec3d8d2d0f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/systems-index.md 428035db4e6d01a929dbc5446096e42d1a97d279
Reviewed-Content-Hash: design/game-brief.md 3ded7adb7a1f925fc10ece4a62db19cab7cdf937
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/REPORT.md 112bd86e49c8a1cfe4ec8de7b41fc285b30de5c3

## Review — 2026-11-27 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: XL (full vision; producer should verify)
Specialists: game-designer, systems-designer, economy-designer, producer; senior: creative-director
Blocking items: 3 | Recommended: 11
Summary: Re-review in a fresh session. The fixes in 1751ea1 worked: pillars, storm rules and the milestone order hold together. Three text problems remained: the 30-second and short-term loops described the old game (rooms, melee) instead of the mining run; "failure never ends a save" had nothing behind it once death takes the tool and storms can empty a roofless stash; and the scope section contradicted itself (producer "did not assess" vs the producer's 14-20 months; cut point "partway through Tier 1" vs after Milestone A, which is not a finished game). Checked against the concept template, not the 8-section GDD standard; registry empty, values checked by hand.
Prior verdict resolved: Partly (items 2 and 3 resolved; item 1 mostly, finished by new blocking 3; item 4 partly, finished by new blocking 1)
Findings:
- [BLOCKING] Core Loop (Moment-to-Moment, Short-Term): describes containers, rooms and melee; no seam loop although the MVP has no weapons and the hypothesis is about seams
- [BLOCKING] Flow / Open Questions: "never ends a save" unbacked; no guarantee a stripped player can rebuild workbench, hammer and drill; death-cost question still open though the brief and ADR-0003 settle it
- [BLOCKING] Scope Risks / Scope Tiers: "not assessed by the producer" vs the producer's MVP figure; stale likeliest cut point; Milestone A vs "each tier is a finished game"
- [RECOMMENDED] Economy: no lasting MVP ore sink, stash total is a number (Pillar 5); gates the Ore & Item Economy GDD
- [RECOMMENDED] Economy: storm damage to strong pieces stays above zero; rock-and-stick repair costs valley materials only; all vs part of an unsheltered stash lost, with a one-storm warning; money in the first game or not
- [RECOMMENDED] Open Questions: hard cap on "normal length" (planets "45+" unbounded); no full-strength storm flattens a fully repaired piece in one hit; launch screen shows "survives N more storms"
- [RECOMMENDED] Core Mechanics L90: say storms during a run are applied when it ends
- [RECOMMENDED] systems-index.md L45 ("competes with getting home to repair the roof") conflicts with the settled rule that a storm never forces a run to end; fix the index
- [RECOMMENDED] MDA Submission row "with no timers"; Autonomy "whether to run at all" vs L356
- [RECOMMENDED] Core Fantasy proof moments and return hooks/long-term goal cite rooms, bosses and crops, absent from the first game
- [RECOMMENDED] Design Risks: the prototype tension retest should gate the Ore & Item Economy GDD and record the kill condition; add it and /estimate to Next Steps
- [RECOMMENDED] Open Questions: how a weaponless player handles creatures (prototype drill stuns); for the Creature AI GDD
- [RECOMMENDED] Scope Tiers: 1a lists MVP systems; Vertical Slice systems 25-28 in no tier; "first game"/MVP/1a/Alpha naming; "4 to 6+ years" pre-pivot; Content Volume and network-ADR lines stale; Storms and Home HUD depend on Run Flow (Milestone B); old PR-SCOPE row superseded
- [RECOMMENDED] Next Steps: leave "Check this concept is complete" unticked until APPROVED

Creative-director rulings on specialist disagreements: scope item = BLOCKING (producer over game-designer); tool recovery = BLOCKING (overrides the first review's RECOMMENDED for hammer-on-death, because storms can now empty a roofless stash); missing ore sink = RECOMMENDED, gates the Ore & Item Economy GDD; mining loop = BLOCKING (Session-Level already splits first game from full game).

Revision applied the same day (designer approved, "Fix all and log it"): all 3 blocking items fixed in `design/gdd/game-concept.md` (Moment-to-Moment and Short-Term rewritten for the mining run with the full-game beat kept; recovery rule "bare hands plus rocks and sticks can always reach a workbench, a hammer and a basic drill", owned by Gathering and Crafting; death-cost question closed as pack, tool and equipped gear; scope preamble, cut point and Milestone A status corrected). Not re-reviewed. Recommended items open.

Receipt note: `design/gdd/game-concept.md` is deliberately not stamped, because it was revised after this review; the next `/design-review` will see it as NEW and run in full.
Reviewed-Content-Hash: design/registry/entities.yaml dfeacb02917f751cb1dfd88cf490c7ec3d8d2d0f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/systems-index.md 428035db4e6d01a929dbc5446096e42d1a97d279
Reviewed-Content-Hash: design/game-brief.md 3ded7adb7a1f925fc10ece4a62db19cab7cdf937
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/REPORT.md 112bd86e49c8a1cfe4ec8de7b41fc285b30de5c3
Reviewed-Content-Hash: production/gate-checks/2026-11-26-concept-to-systems-design.md 19a1d23caf1509c2b2548aadeb8366b0f0cd0bcf
