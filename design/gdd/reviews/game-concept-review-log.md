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
