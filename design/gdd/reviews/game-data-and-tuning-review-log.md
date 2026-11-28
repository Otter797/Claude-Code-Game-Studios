# Review Log: Game Data & Tuning

## Review — 2026-11-27 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: L
Specialists: game-designer, systems-designer, qa-lead, unity-specialist, creative-director (senior)
Blocking items: 10 | Recommended: 6
Summary: The architecture is sound and serves Pillar 2: one validated catalog, fail-hard on bad data, each system handed only its own set, and the Simulation never reading assets. But formulas D1, D2 and D4 and the acceptance criteria are not yet precise enough to code or test against. Unity 6.3 constraints (ScriptableObject mutation in Play Mode, an error screen loaded without Addressables, the scope of "packed" data) must also be stated before ADR-0004. Rulings on the specialists' disagreements: keep fail-hard in every build; specify D4 and the retired list now but defer the R13 join check; add an `apply` field to R3 now and leave profiles open; assign shared values provisionally (Pack owns `full_pack_slow`, Run Flow owns `safe_radius`).
Prior verdict resolved: First review
Findings:
- [BLOCKING] Formulas D2: an off-grid max breaks the step grid and the rounding mode is unspecified; use an integer grid index with round-half-up, round results to the step's decimals, and make the panel read-only when min = max
- [BLOCKING] Formulas D1 / Core Rules R3: the default step (max − min)/100 is fractional for int ranges and is never validated
- [BLOCKING] Formulas D1 / Core Rules R5: no type and sign table per unit (share+int, bool with a range, negative counts, hp, seconds or credits, multiplier ≤ 0); the `ratio` catch-all defeats unit checks
- [BLOCKING] Formulas D4: canonical text is not portable across Mono and IL2CPP; hash the IEEE bits, normalise −0, fix the ordering, add a golden vector
- [BLOCKING] Core Rules R8/R12: authoring assets must be read once into immutable values; only "keep" writes back (Play Mode ScriptableObject edits persist in the Editor, so AC22 would fail)
- [BLOCKING] UI Requirements / States: the catalog source and data error screen must load without Addressables, with hard-coded English strings; Ready never waits on display assets
- [BLOCKING] Core Rules R11: overstates "packed"; reword to "never reads data outside its own build content", put tamper-proofing out of scope, and keep catalog data out of remote content updates
- [BLOCKING] Core Rules R9: missing key uniqueness within a set, definition field completeness and unknown fields, a per-field expected-kind table, check order and cascade suppression, and where key declarations live
- [BLOCKING] Core Rules R12: live-tuning concurrency; one Authority queue, at most one revision per tick, saves record no revision
- [BLOCKING] Acceptance Criteria: the claim "every rule has a criterion" is false (R3, R4, R7, R8); fix AC13, 15, 16, 17, 18 and 19, split AC24, classify real-asset tests as Integration, mark AC23 and AC26 provisional on Storms; plus the schema items from the rulings (`apply` field in R3, one-owner rule and no-duplicate-key check in R4)
- [RECOMMENDED] Core Rules R3: optional cross-key `constraints` list (walk ≤ sprint, interval_min ≤ interval_max, leash > aggro > see)
- [RECOMMENDED] Tuning Knobs: stat blocks and recipes belong on definitions, not tuning (tough_*, burrower_*, spitter_*, drill2_*, canister_*)
- [RECOMMENDED] Core Rules R3: make `provisional` gate release-candidate builds; lighten the per-record boilerplate
- [RECOMMENDED] Open Questions: close OQ2 by stating that every Simulation system depends on this one implicitly
- [RECOMMENDED] Core Rules R2: give the id grammar as a regex and widen AC2's cases
- [RECOMMENDED] Dependencies: hand to ADR-0004 the three-assembly split (rule on Vector3/Mathf in the Simulation), no static catalog, an awaited bootstrap gating StartSolo/LoadAndWait, and a parser that rejects unknown and missing fields
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 138b8598e89fb6496fb3f169bf9473c264b2a1e9
Reviewed-Content-Hash: design/registry/entities.yaml dfeacb02917f751cb1dfd88cf490c7ec3d8d2d0f
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: design/gdd/systems-index.md 68291e60595039beeb36f59448e859fbe2019d93
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/config.js 55a14141ee3b2ccb741b84b9fe7e0e1979f5ce38

### Revision 1 — 2026-11-27 (not a review)
All 10 blocking items and the recommended items revised in the same session, at the designer's request ("Revise it here"). The creative-director's rulings (a)-(d) were applied as decided; the GDD lists them as decisions 12-17. Recommended items included: the cross-key `constraints` list, numbers for one thing moved onto definitions, `provisional` gating release candidates, OQ2 closed, the R2 regex, and the ADR-0004 hand-offs. Deferred as nice-to-haves: tuning profiles (OQ4), a display-coverage check, and retired-list tooling. Acceptance Criteria rewritten (45 criteria, with a traceability table). Status set to In Review; a fresh-session `/design-review` decides Approved.
