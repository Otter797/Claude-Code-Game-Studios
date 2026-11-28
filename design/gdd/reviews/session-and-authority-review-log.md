# Review Log: Session & Authority

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: L
Specialists: network-programmer, systems-designer, qa-lead, unity-specialist, game-designer, creative-director (senior)
Blocking items: 11 | Recommended: 14
Summary: The authority model and the save-honesty stance are right, but the state machine and the request-processing model were incomplete: requests were only handled inside ticks, so refusals could never be sent while paused or saving, and several exits (quit during waits, quit to desktop, scene loading) had no transition. Rulings: drain requests every frame; one queue for gameplay, live tuning and joins; Launching and Ending Run hold until the scene load completes; pause stops everything rules read (Presentation may use time scale 0); a persistent "Unsaved changes" mark; the failed run-end Quit is labelled "Quitting now loses this haul" with no ADR-0003 amendment now; crash = death stays, worded "an unfinished run is an unbanked run".
Prior verdict resolved: First review
Findings:
- [BLOCKING] States and Transitions: not closed (Launching/Ending Run to Stopping, Launching Run retry, quit in Starting/Loading/Resolving, quit to desktop)
- [BLOCKING] States and Transitions / R12: async scene load has no state and no failure rule
- [BLOCKING] Core Rules R4 / R6: requests handled only at tick start, so Paused/Saving/Not now refusals never go out
- [BLOCKING] Core Rules R3 / R5: Game Data & Tuning's change queue for live tuning and joins is missing
- [BLOCKING] Core Rules R3 / R4 / R8: sequence numbers undefined; "revision" collides with the catalog revision
- [BLOCKING] Core Rules R9 / Edge Cases: paused flag limited to At Home and In Run contradicts pause during a waited write; Saving vs Paused precedence
- [BLOCKING] Core Rules R9: pause does not stop engine-driven motion (navigation, physics, animation)
- [BLOCKING] Tuning Knobs: no `apply` column; ranges break F1's promise and allow retry_cap < retry_base; `tick_rate_hz` unit; stale "5 × 1/30" sentence
- [BLOCKING] Core Rules R10 / UI Requirements: a repeatedly failing home save is reported once
- [BLOCKING] Edge Cases / Player Fantasy: Quit during run-end retries loses a finished extraction without saying so
- [BLOCKING] Acceptance Criteria: R14 uncovered, R5 table cells without answers, "generic reason" not in the closed list, AC1 unmeasurable, undesigned dependencies not provisional, AC14 wall-clock, AC26 needs a join R1 rules out
- [RECOMMENDED] Formulas F1: frame time must be unscaled; clamp acc to [0, tick_dt)
- [RECOMMENDED] Formulas F2: exact only per hour of ticks; double precision
- [RECOMMENDED] Formulas F3: real time base; stop doubling at the cap; k resets per waited write
- [RECOMMENDED] Formulas F5: pending across the whole retry sequence; Saving refusal before the indicator
- [RECOMMENDED] Core Rules R7: `AdvanceTo` once on entering At Home (first-tick launch ahead of an overdue storm)
- [RECOMMENDED] Core Rules R10: coalesce snapshots per frame; exclude the load from retry rules
- [RECOMMENDED] Formulas F4: minimum note interval
- [RECOMMENDED] UI Requirements: show only reasons the player can act on
- [RECOMMENDED] Core Rules R3: reword "every state change is a request"; frozen flag clients obey
- [RECOMMENDED] Core Rules R1: single-player transport claim belongs to ADR-0001 Verification 1
- [RECOMMENDED] Core Rules R9: focus detection per platform, editor case
- [RECOMMENDED] Open Questions: begin/end intents and per-player request caps before co-op; range-check tolerance
- [RECOMMENDED] Edge Cases: pause buffering as an accepted accessibility trade-off; auto-unpause option deferred
- [RECOMMENDED] Acceptance Criteria: tag milestones; injected clocks; split mixed types; cover R3, R4.6, R9 multi-player, R11, R12 death, R13 drain timeout, every transition
Reviewed-Content-Hash: design/gdd/session-and-authority.md 56052cdb82245100a8deb59e2984580acc240911
Reviewed-Content-Hash: design/registry/entities.yaml b5a525057786c8368c6935448e7676191646fde3
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 22b2414d61b302121046b75b87f54d25e342a7ba
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Note: the target's hash stamps the document as reviewed (before revision 1). Game Data & Tuning is stamped at its revision 2.

### Revision 1 — 2026-11-28 (not a review)
Every blocking item revised in the same side session, at the designer's standing approval: per-frame request drain with network handlers that only enqueue; live tuning and joins in the one queue with R5 rows; per-player sequence numbers and a Duplicate reason; Internal error; model and catalog revision streams named; closed transition table (quit from every state with a session, quit to desktop, scene-load hold, failed loads); paused flag in waiting states and Saving before Paused; pause stops rule-relevant motion; derived tick cap, `apply` column, unit `hz`, `retry_base_s ≤ retry_cap_s`, new knob `home_save_fail_block_count`; "Unsaved changes" and the blocking notice; the Quit label; `AdvanceTo` on entering At Home; acceptance criteria rewritten (39, milestone-tagged, with a traceability table). The CD rulings are decisions 8 to 16. Status In Review; a fresh-session `/design-review` decides Approved.

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: M
Specialists: network-programmer, systems-designer, qa-lead, unity-specialist, game-designer, creative-director (senior)
Blocking items: 10 | Recommended: 10
Summary: Re-review of revision 1. The authority model, the request queue, the F1 to F5 math (AC17, AC18, AC27 and AC28 recomputed) and the state model are sound, and most first-review blockers are resolved. What remains is edge-path contracts and drift against the sibling GDDs written since: several quit paths can lose packed items without a word, Player Controller derives freezing from a different source, the request check order is incomplete, and the physics and tick-source constraints that F1 depends on are not stated. Rulings: Stopping drains whatever can still decide the next start and confirms only when the outcome is unconfirmed; one published frozen flag; tick batching for live tuning stays and R3 is reworded; auto-pause on in release, off in editor and development builds; a refusal during a waited write shows "Saving…" at once; physics rules go in now; Save & Load owns the abandoned-run notice text.
Prior verdict resolved: Partly (10 of 11; the closed transition table is still open on quit paths)
Findings:
- [BLOCKING] Core Rules R13 / States and Transitions: quitting At Home with a waited write pending, in Launching Run, during a first run-end write, or in Resolving can lose packed items silently or never complete
- [BLOCKING] Core Rules R3 / R5: two sources of truth for freezing (Player Controller reads session state); "Ignored" cells do not exist
- [BLOCKING] Core Rules R5: check order omits Unknown player, Duplicate, Malformed; whether refusals advance the sequence number; Malformed undefined for absent intents
- [BLOCKING] Core Rules R3: "everything handled in one order" contradicts live tuning batched at the tick
- [BLOCKING] UI Requirements 1 / Formulas F5: refusals in the first 0.3 s of a waited write are silent
- [BLOCKING] Core Rules R9 / Open Questions 1: global scripted physics, stale colliders and NavMeshAgent; two of the three tick sources OQ1 lists cannot follow F1
- [BLOCKING] Core Rules R9: auto-pause default conflicts with player-controller.md; the editor-window focus clause is not implementable reliably
- [BLOCKING] Tuning Knobs: Save & Load's cross-set constraint is broken by legal values; `waited_write_timeout_s` minimum
- [BLOCKING] Dependencies: downstream table stale (Player Controller, Save & Load, Pack, Home Valley exist)
- [BLOCKING] Acceptance Criteria: AC10 cells without answers, AC39 tag, AC25 and AC33 wall-clock, AC15 "both ways", mixed types, AC7 type, AC17 start value, AC34 per-row transitions, stale and missing provisional markers, traceability overclaims
- [RECOMMENDED] Formulas F1: ε as the next double below tick_dt
- [RECOMMENDED] Core Rules R10: no new retry until the previous attempt returns; drop held home save points a waited write covers
- [RECOMMENDED] Core Rules R4 / R8: full-state resync stamped with its revision; revision on each result; payload chunking for the ADR-0001 amendment
- [RECOMMENDED] Core Rules R3: sequence numbers keyed per connection and reset on join; no second result for a resend
- [RECOMMENDED] Core Rules R13: wantsToQuit re-entry guard; NetworkManager.Shutdown before Quit
- [RECOMMENDED] UI Requirements 3: blocking-notice Quit discloses what is lost; run-end Quit label on a death
- [RECOMMENDED] UI Requirements 4: abandoned-run notice owned by Save & Load
- [RECOMMENDED] Formulas F4 / F3: "150 ticks" as a function of tick rate; F3 example with time-outs
- [RECOMMENDED] Core Rules R9: latch focus-loss pause before At Home
- [RECOMMENDED] Edge Cases: pause buffering revisited if a competitive mode arrives
Reviewed-Content-Hash: design/gdd/session-and-authority.md f37a68281a0fd4afd3cb7fba25e689512daff35a
Reviewed-Content-Hash: design/registry/entities.yaml 12cd532b71fc5f95129037b1aa91896d5a34164a
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 22b2414d61b302121046b75b87f54d25e342a7ba
Reviewed-Content-Hash: design/gdd/save-and-load.md 3692fa336df5d234fba17d801f70aeaceb2d4827
Reviewed-Content-Hash: design/gdd/player-controller.md fad56f30e791f7248414a6a5a158c30999392047
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md 220319fd90d8516040a3bcfbd1ab39f474ae1ea0
Reviewed-Content-Hash: docs/engine-reference/unity/modules/networking.md ab0ada43362406731784044326eed68fd25aa3b1

### Revision 2 — 2026-11-28 (not a review)
Every blocking item and every recommended item applied in the same session, at the designer's standing approval: the quit rule (Stopping drains whatever can still decide the next start, confirmation only when a waited write is unconfirmed, one row per state, Resolving capped, Loading at once); one published frozen flag; the full check order with per-connection sequence numbers; live tuning batched at the tick with R3 reworded; auto-pause on in release and off in editor and development builds; "Saving…" at once on a refusal; physics and tick-source rules with OQ1 narrowed; `waited_write_timeout_s` minimum 5; Save & Load owns the abandoned-run notice; downstream table updated; an "Open conflicts flagged to owners" list (Player Controller frozen flag and focus loss, Save & Load retry ranges and notice owner, Game Data & Tuning batching wording). Acceptance criteria rewritten (61, renumbered, one per quit path and per transition row). The CD rulings are decisions 17 to 25. Status In Review; a fresh-session `/design-review` decides Approved. Note: the hashes above stamp the document as reviewed (before this revision).
