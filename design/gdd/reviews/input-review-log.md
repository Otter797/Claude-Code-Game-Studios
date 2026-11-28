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

## Review — 2026-11-28 — Verdict: NEEDS REVISION
Review mode: full · Workflow: full
Scope signal: M
Specialists: ux-designer, accessibility-specialist, unity-specialist, qa-lead, game-designer, creative-director (senior)
Blocking items: 13 | Recommended: 17
Summary: Re-review of revision 1. Most first-review blockers are resolved, but the context model still contradicts itself. Left Shift does two things in Run Pack, panels close on actions that are not live there, and Build both leaves build mode and opens panels. The toggled-sprint reset fights the Run Pack edge case, and Frozen and pause disagree with Session & Authority's frozen flag. Keyboard-only play has no way to drop a chosen stack on a run, and the R8 settings have no player-facing screen in the MVP. Rulings: Quick Move and its chord leave Run Pack; Open Pack and Interact are close-only in panels; no panels from Build; Drop Item (G) acts on the selected slot in Run Pack; a Locomotion group keeps Move and Sprint live; Frozen is S&A's published flag, cited, not restated; Input owns a fresh-press latch and the busy-cue event (the HUD owns how it looks); `[` and `]` become Next/Previous Piece buttons; ClearToggle for Player Controller; the Remove Piece hold is capped at 1.0 s with a release grace. The MVP Controls page is a scope change left to the designer; the alternative that changes no scope (Open Question 6 widened) is written.
Prior verdict resolved: Partly (4 of 9 fully; Close Panel, Drop Item, keyboard-only and the AC items partly)
Findings:
- [BLOCKING] Core Rules R2 / R7: Left Shift bound to Sprint and to the Quick Move chord in Run Pack; the conflict rule does not count modifiers
- [BLOCKING] Core Rules R2 / R4: panels close on Open Pack and Interact, which are not live in Panel or Run Pack
- [BLOCKING] Core Rules R2 / States / Edge Cases: Build → Panel contradicts "Interact leaves build mode"
- [BLOCKING] Core Rules R2: no keyboard drop of a chosen stack on a run; Drop Item wording disagrees with Pack R5
- [BLOCKING] Core Rules R5 / R8: toggled Sprint resets on every context change, against AC4 and the Run Pack edge case; held Sprint drops when the action map changes
- [BLOCKING] Core Rules R4 / Pause table: Frozen restates S&A's states and opens a pause menu where S&A cannot pause
- [BLOCKING] Core Rules R5 / UI Requirements 6: the busy cue can never trigger
- [BLOCKING] Core Rules R8 / Open Questions 6: R8 settings unreachable in the MVP; only rebinding recorded as a gap
- [BLOCKING] Core Rules R5: a key held across a focus return may read as a fresh press; Input needs its own latch
- [BLOCKING] Core Rules R2 / F5: `[` and `]` on an Axis 1D action step every frame while held
- [BLOCKING] Core Rules R11: cursor-lock-loss detection may never fire on Windows
- [BLOCKING] Core Rules R8: Player Controller's ClearToggle(action) is not defined here
- [BLOCKING] Acceptance Criteria 9: the GIVEN says On Foot and should say Build
- [RECOMMENDED] Core Rules R7: a binding belongs to an action and is checked in every context that has that action
- [RECOMMENDED] Open Questions 1 and 4: close (no jump; Pack R9 answers the panel actions)
- [RECOMMENDED] Dependencies: Pack and Player Controller rows stale
- [RECOMMENDED] Acceptance Criteria 8, 12, 16, 17, 25: provisional marks
- [RECOMMENDED] Acceptance Criteria 2, 20, 23, 24: AC2 gets the full lint list; AC20 bans tap and hold interactions; AC23 uses exact 0.25-notch steps; AC24 counts frames
- [RECOMMENDED] Formulas F5: set the scroll delta behaviour explicitly, give the sign of the engine's value, use an exact ±0.999 clamp
- [RECOMMENDED] Core Rules R2: no key auto-repeat for Navigate in the MVP
- [RECOMMENDED] Core Rules R7: only the main Enter key is reserved
- [RECOMMENDED] UI Requirements 1: the hint strip hides actions that do not apply in the current place
- [RECOMMENDED] UI Requirements 6: how refusals look belongs to the HUDs (drop "not a toast")
- [RECOMMENDED] Core Rules R4: Turn unavailable in Run Pack, recorded as a pillar tension
- [RECOMMENDED] Formulas F2: Remove Piece hold capped at 1.0 s, with a release-grace knob
- [RECOMMENDED] Open Questions: rebinding mechanics; binding mask and default action sources; F4 delta units added to the input spike
- [RECOMMENDED] Open Questions: sibling drift reported to the owners (pack.md "Close Panel" and drop wording, player-controller.md `rad_per_px`, S&A "Not written")
- [RECOMMENDED] Core Rules R2: Build Mode is not an S&A intent class (not taken up in revision 2)
- [RECOMMENDED] UI Requirements 6: a UI criterion for how the busy cue looks (left to the HUD specs)
Reviewed-Content-Hash: design/gdd/input.md 6c2d7fb845c3742dc665e7b98075adc21ce5afcd
Reviewed-Content-Hash: design/registry/entities.yaml dba2667d949f768cd92c4d8899f79aae6e9e338c
Reviewed-Content-Hash: .claude/skills/design-review/SKILL.md 4dcc8b81162613c757144532f1b72708ab3ba27f
Reviewed-Content-Hash: design/gdd/game-data-and-tuning.md 325fb9e5944896335f807db6ead897452855076d
Reviewed-Content-Hash: design/gdd/session-and-authority.md db413ee6b2babe3ac9300429bc1bfce4920f726a
Reviewed-Content-Hash: design/gdd/game-concept.md 938271886e41e9485ac0192a80f58c67d7875873
Reviewed-Content-Hash: design/gdd/pack.md 17efe87b9d5bf2e236506c4e61a72b36cf6c49d5
Reviewed-Content-Hash: design/gdd/player-controller.md f6183f18447fc4afa4f458fe1db828bd49dc9f8a
Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Note: the input.md hash stamps the version that was reviewed (revision 1, before revision 2). Game Data & Tuning, Session & Authority, Player Controller and the registry are stamped at uncommitted working copies that another session was revising at the time. This review ran in the claude/trusting-euler-6drhcf side session; the parallel session took Game Data & Tuning and Session & Authority.

### Revision 2 — 2026-11-28 (not a review)
Every blocking item was revised in the same side session, under the designer's standing approval:
- Quick Move is Panel-only, and modifiers count in binding conflicts.
- Open Pack and Interact are close-only in panels.
- No panels open from Build.
- Drop Item (G) drops the selected slot in Run Pack and is Alternate Click's keyboard default.
- A Locomotion group keeps Move and Sprint live; a toggled Sprint resets only on Panel, Menu or Frozen.
- Frozen cites S&A's frozen flag, and pause works only where S&A allows Paused.
- A fresh-press latch, and a press that captures the cursor never fires an action.
- The busy-cue event, with `busy_cue_interval_s`.
- Next/Previous Piece buttons.
- Focus replaces lock-loss detection until a spike settles it.
- ClearToggle.
- Remove Piece hold of 0.2 to 1.0 s, with `hold_release_grace_s`.
- Open Question 6 widened to all five R8 settings; the MVP Controls page is recorded as awaiting the designer (scope change).
- Acceptance criteria 31 to 39 added and the traceability table corrected.

The CD rulings are decisions 19 to 32. Status In Review; a fresh-session `/design-review` decides Approved.
