# Review Log: Input

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: M
Specialists: ux-designer, accessibility-specialist, unity-specialist, qa-lead, game-designer, creative-director (senior)
Blocking items: 9 | Recommended: 12
Summary: The context-map structure is good, but the failures were concrete: Escape and P were bound to two actions in one context against the doc's own rule, opening the pack on a run froze the player while creatures hunt, the re-press rule also stopped Move, scroll handling lost input and wrapped wrongly, and building and panels could not be done without a mouse. Rulings: Pause / Back is one context-dependent action with Escape reserved; the run pack is non-modal; Drop Item added; fresh presses for buttons only; Space left unbound for a future Jump; the tap-or-hold timer cut; the whole MVP keyboard-playable; the missing rebinding screen in the MVP recorded as a gap.
Prior verdict resolved: First review
Findings:
- [BLOCKING] Core Rules R2 / R7: Escape (and P) double-bound to Pause / Back, Close Panel and Cancel; Close Panel defaults do not follow rebinding
- [BLOCKING] Core Rules R4: the pack panel on a run kills Move and Use Canister while creatures hunt
- [BLOCKING] Core Rules R2: no Drop Item action, which the full-pack decision needs
- [BLOCKING] Core Rules R5: the re-press rule also stops Move after a wait or panel
- [BLOCKING] Formulas F5: no remainder (the engine keeps none), negative wrap broken in C#, no sign convention, notch size unresolved
- [BLOCKING] Core Rules R2 / R4: keyboard-only gaps (Place and Cycle Piece mouse-only, panels mouse-only, quick-move a chord, cursor capture needs a click)
- [BLOCKING] Core Rules R10: the UI module's default actions let a gamepad move menus in the MVP
- [BLOCKING] Core Rules R5 / R3: buttons must not fire on a key already held; Move resumes; same-frame delivery needs frame-update processing
- [BLOCKING] Acceptance Criteria: AC1 cannot pass, AC18 misses negative wrap, undesigned dependencies not provisional, AC9 mistyped, AC13 tests nothing, AC14 wall-clock; several rules and edge cases uncovered
- [RECOMMENDED] Core Rules R9 / F1: no action uses tap versus hold; cut F1
- [RECOMMENDED] Core Rules R2: Space as Use Tool collides with a future Jump
- [RECOMMENDED] Formulas F4: mouse delta is raw device counts, not pixels; retune `look_sens`; discard the first delta after capture
- [RECOMMENDED] Edge Cases: cursor-lock loss has no event; poll it; the capture click must not fire Use Tool
- [RECOMMENDED] Edge Cases: a missing mouse side button cannot be detected; fall back only on unresolvable paths or a parse failure
- [RECOMMENDED] UI Requirements: hint strip per context; quiet feedback for refusals and dropped presses
- [RECOMMENDED] Core Rules R4: Frozen closes open panels
- [RECOMMENDED] Core Rules R7: Escape reserved, P removable, Enter always Confirm, each Move direction rebindable
- [RECOMMENDED] Core Rules R8: keyboard look speed setting; invert covers the arrow keys
- [RECOMMENDED] Open Questions: rebinding screen only at Vertical Slice as a recorded gap
- [RECOMMENDED] Open Questions: hold-duration multiplier, split sensitivity, toggle restore, one-handed preset (Alpha)
- [RECOMMENDED] Open Questions: hammer repair versus build mode (Building)
Reviewed-Content-Hash: design/gdd/input.md f385068b2c3dd573b538fb000c6f5d9a794ed947
Reviewed-Content-Hash: design/registry/entities.yaml 91b6aada4b259dfb9ce48d8a77908f108897d523
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 22b2414d61b302121046b75b87f54d25e342a7ba
Reviewed-Content-Hash: design/gdd/session-and-authority.md f37a68281a0fd4afd3cb7fba25e689512daff35a
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Note: the target's hash stamps the document as reviewed (before revision 1); Game Data & Tuning and Session & Authority are stamped at their revised versions.

### Revision 1 — 2026-11-28 (not a review)
Every blocking item revised in the same side session, at the designer's standing approval: Pause / Back with a per-context table, Escape and Enter reserved, panels close on their opening action; a Run Pack context that keeps Move, Sprint and Use Canister live; Drop Item; Navigate, Confirm and Quick Move in panels, Place on F, Cycle Piece on `[` `]`, Space unbound; R5 limited to buttons with Move resuming; R11 cursor capture; F1 and `hold_threshold_s` removed; F5 with its own remainder, sign convention and safe wrap; F4 in raw counts; keyboard-and-mouse-only UI scheme; acceptance criteria rewritten (30, with a traceability table). The CD rulings are decisions 9 to 18. Status In Review; a fresh-session `/design-review` decides Approved.
