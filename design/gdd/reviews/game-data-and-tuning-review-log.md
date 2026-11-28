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

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: L
Specialists: game-designer, systems-designer, qa-lead, unity-specialist, creative-director (senior)
Blocking items: 12 | Recommended: 14
Summary: Revision 1 resolved all ten first-review blockers; the architecture is sound and no pillar or scope question is open. What remains is precision and contracts: float width, the D2 grid and the D4 byte layout would come out differently for two implementers, R9 check ownership is unclear, and the live-tuning loop lacks a re-injection contract and a safe "keep". Rulings: `live_tuning_enabled` and live re-injection are blocking; the negative-rounding tie rule folds into the D2 grid fix; dev-only out-of-range live edits rejected for MVP (validate-on-save instead); definition-field ranges move to a per-kind limits record in data, keeping the schema number-free.
Prior verdict resolved: Yes (all 10 prior blocking items)
Findings:
- [BLOCKING] Core Rules R3 / Formulas D3, D4: float width never stated; rules view holds floats as double, systems narrow on intake (AC20, AC22 restated)
- [BLOCKING] Formulas D2: `d` not recoverable from stored numbers, default step collapses the grid, absolute epsilon lets a position exceed max, two conflicting tie rules; use a scaled-integer grid, distinct positions clamped to max, one tie rule on the index
- [BLOCKING] Formulas D4: sort key ties for value/min/max/step/unit/apply; type tags, enum/string/id/list/pair and absent-field encoding undefined; golden vector from an independent hasher
- [BLOCKING] Core Rules R3 / R9: no type set for non-numeric definition fields (enum, id(kind), list, record)
- [BLOCKING] Core Rules R1 / R9: definition-field ranges sit on each instance; move to a per-kind limits record; add constraints between fields of one definition
- [BLOCKING] Core Rules R9: check ownership; check 7 unit/type, check 8 ranges/signs, a check for rationale, apply, type, owner and well-formed constraints; AC12 and AC15 name their checks
- [BLOCKING] Core Rules R9: cascade wording contradicts AC5; "a reference to an id that failed check 2 or 3 is not reported"; settle retired references (Edge Cases, AC3)
- [BLOCKING] Tuning Knobs: `live_tuning_enabled` as one data record cannot differ per build and splits the fingerprint; make it compile-time, strip the panel from release, keep it out of the catalog and D4
- [BLOCKING] Core Rules R8 / R11: start-up-scene bootstrap breaks Play-from-any-scene; with domain reload off statics leak; bootstrap via RuntimeInitializeOnLoadMethod, reset at SubsystemRegistration, add an AC
- [BLOCKING] Core Rules R12: no live re-injection contract; name the mechanism, require `apply: restart` for systems that precompute, ask Session & Authority for the live path
- [BLOCKING] Core Rules R12: "keep" writes one value and can leave a broken constraint on disk; validate the whole set and write all or nothing
- [BLOCKING] Dependencies / Interactions: stale (Session & Authority, Input, Ore & Item Economy exist; Input missing; `tuning.economy` should be `tuning.ore_and_item_economy`; Save & Load gets three answers)
- [RECOMMENDED] Core Rules R11: name allowed build-content sources, ban StreamingAssets, CI check that no rules asset is in an Addressables group, display data in separate assets via AssetReference
- [RECOMMENDED] Acceptance Criteria 24: PlayMode test in an IL2CPP player; link.xml for SHA256
- [RECOMMENDED] Acceptance Criteria 33: measure scene deserialisation; budget out of the catalog it measures
- [RECOMMENDED] Core Rules R3 / R9: define "release-candidate build"; gate provisional at build time
- [RECOMMENDED] Core Rules R5 / D1: int64 range arithmetic; add `hz`; rein in `level` (Ore toughness is seconds per piece)
- [RECOMMENDED] Core Rules R3: constraints cannot express Session & Authority's product rule
- [RECOMMENDED] Formulas D1 / D2: "first click only snaps" vs snap-and-move
- [RECOMMENDED] Core Rules R12: validate on asset save in the editor; keep updates rationale and provisional; export changes from development players
- [RECOMMENDED] Core Rules R1: category for player-overridable defaults (look_sens, stick_deadzone)
- [RECOMMENDED] Core Rules R3: make `apply: restart` the safe default
- [RECOMMENDED] Core Rules R9: ownership of shared definition fields across owners (Ore's common fields on tool and gear)
- [RECOMMENDED] Acceptance Criteria: AC13 banker's-rounding case; AC29/32/43 provisional on ADR-0004; R9 asset field a list; split AC40; rename the "Data" type
- [RECOMMENDED] Acceptance Criteria: untested clauses (passed values live, in-session load keeps live values, reset as one revision, R11 remote content); AC25 to AC28 fixes
- [RECOMMENDED] Open Questions: log dev-only out-of-range live edits for after the playable build
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 0a88e110b40895b7451b2759c0c26cf7e215dc3b
Reviewed-Content-Hash: design/registry/entities.yaml 678b96de87a9a61989869e1bc298460ecab0d0bc
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: design/gdd/systems-index.md 56183b7bf4c1fee922bc1f5c5cb438b87736b3ec
Reviewed-Content-Hash: design/gdd/session-and-authority.md 56052cdb82245100a8deb59e2984580acc240911
Reviewed-Content-Hash: design/gdd/input.md f385068b2c3dd573b538fb000c6f5d9a794ed947
Reviewed-Content-Hash: design/gdd/ore-and-item-economy.md b0a3d3490bad7892071a78cd9aa307382ace6c4a
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: prototypes/star-haul/config.js 55a14141ee3b2ccb741b84b9fe7e0e1979f5ce38

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: M
Specialists: game-designer, systems-designer, qa-lead, unity-specialist, creative-director (senior)
Blocking items: 10 | Recommended: 11
Summary: A second, parallel re-review run by the `/design-review` side session (the review recorded above in c02cc46 ran at the same time from another session; both reached NEEDS REVISION with largely the same findings). Nine of ten first-review blockers are resolved; what remains is precision (D2's decimal count and grid, float width, the D4 layout), batch validation of live changes, a safe "keep", live values reaching client-side readers, and drift against the three sibling GDDs now written. Rulings: fail-hard stays; compile-time gate for live tuning; floats are doubles; joins refused by fingerprint, not revision.
Prior verdict resolved: Yes (9 of 10 fully; D2's fix introduced new defects)
Findings:
- [BLOCKING] Formulas D2: `d` taken from min and step only (a 0..1 range with no step gets d = 0 and duplicate positions); define over min, max and effective step with a portable round-trip count, scaled-integer grid, k_max cap
- [BLOCKING] Core Rules R3 / D3 / D4: float precision never stated; rules-view floats are 64-bit doubles from parse
- [BLOCKING] Core Rules R12: requests valid alone can break a constraint together in one batch; re-check the combined revision
- [BLOCKING] Core Rules R12: "keep" can write an asset that fails validation at next start
- [BLOCKING] Core Rules R10 / R12: live changes never reach Input and Player Controller, which read tuning outside the Simulation
- [BLOCKING] Game Feel: "next frame, about 17 ms" contradicts Session & Authority's 30 Hz tick and pause; restate as next tick, "queued (paused)" on the panel
- [BLOCKING] Core Rules R8 / R11: start-up depends on the start-up scene; Play from any scene with domain reload off
- [BLOCKING] Formulas D4: sort key, type tags, enum, absent-field and list encodings unspecified
- [BLOCKING] Dependencies / Interactions / Tuning Knobs: stale against Session & Authority, Input and Ore & Item Economy (`tuning.economy`, prototype ore values, holdable-field ownership)
- [BLOCKING] Acceptance Criteria: AC12 check numbers, AC15 maps to no check, ADR-0004-dependent ACs not provisional, AC9 git history, AC26 split, traceability overclaims (read-once, Addressables group, passed values, load keeps live values, retired message, reset)
- [RECOMMENDED] Tuning Knobs: `live_tuning_enabled` as data contradicts the build provider; compile-time gate
- [RECOMMENDED] Core Rules R12 / Edge Cases: joins refused by fingerprint instead of revision > 1
- [RECOMMENDED] Core Rules R9: unreadable asset cascades into missing-key records
- [RECOMMENDED] Core Rules R3: define release-candidate build and gate provisional at build time
- [RECOMMENDED] Core Rules R3: constraints require same unit and numeric operands
- [RECOMMENDED] Formulas D1: finite(max − min)
- [RECOMMENDED] Dependencies: parser with invariant culture; generated data manifest with a CI check
- [RECOMMENDED] UI Requirements: reset returns to revision 1, never re-reads assets
- [RECOMMENDED] Edge Cases: development-only storm reschedule (deferred to the ADR-0004 list)
- [RECOMMENDED] Core Rules R3: `restart` requires a reason
- [RECOMMENDED] Core Rules R2: retired list cited as R9, defined in R14
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 0a88e110b40895b7451b2759c0c26cf7e215dc3b
Reviewed-Content-Hash: design/registry/entities.yaml b5a525057786c8368c6935448e7676191646fde3
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/session-and-authority.md 56052cdb82245100a8deb59e2984580acc240911
Reviewed-Content-Hash: design/gdd/input.md f385068b2c3dd573b538fb000c6f5d9a794ed947
Reviewed-Content-Hash: design/gdd/ore-and-item-economy.md b0a3d3490bad7892071a78cd9aa307382ace6c4a
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0

### Revision 2 — 2026-11-28 (not a review)
Every blocking item from both 2026-11-28 reviews revised in the same side session, at the designer's standing approval: D2 rebuilt on a scaled-integer grid; doubles throughout; combined-revision check, safe "keep" and "keep set", reset to revision 1, "queued (paused)"; readers outside the Simulation get the published revision; compile-time gate; joins by fingerprint; scene-independent start-up; D4 layout with a type-tag table and hand-written golden hex; R9 field types, check-order and cascade wording (retired references always reported), tuning records under check 4; the per-kind limits set (R1) added by the c02cc46 session kept; shared holdable fields owned by Ore & Item Economy; unit `hz`; stale tables fixed; 11 acceptance criteria added (46 to 55, plus 9b, 26b, 40b) and the traceability table brought up to date. The CD rulings are decisions 18 to 27. Status In Review; a fresh-session `/design-review` decides Approved. Note: the hashes above stamp the documents as reviewed (before this revision), so the next review sees the target as CHANGED.
