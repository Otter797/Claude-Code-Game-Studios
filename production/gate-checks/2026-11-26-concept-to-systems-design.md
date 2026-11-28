# Gate Check: Concept → Systems Design

**Date**: 2026-11-26
**Checked by**: gate-check skill
**Workflow tier**: full · **Review mode**: full · **Panel**: 4 of 4

## Required Artifacts: 3/3 present

- [x] `design/gdd/game-concept.md` — exists with real content; no placeholder text found
- [x] Game pillars defined — five pillars, each with a design test, plus five anti-pillars
- [x] Visual Identity Anchor section exists in `design/gdd/game-concept.md`

## Recommended: 0/1 met

- [ ] Concept prototype with a `REPORT.md` showing PROCEED — `prototypes/star-haul/`
      exists and was played by the designer, but has no `REPORT.md`. Asked on
      2026-11-26, the designer's verdict was "Proceed".

## Quality Checks: 3/4 passing

- [ ] Game concept reviewed with `/design-review` — **FAILED**. The designer
      confirmed on 2026-11-26 that it has not been run.
- [x] Core loop is described and understood (four time scales)
- [x] Target audience is identified
- [x] Visual Identity Anchor contains a one-line visual rule and three supporting principles

## Director Panel Assessment

**Creative Director (CD-PHASE-GATE): CONCERNS**
Required artifacts present; pillars falsifiable and reflected in the systems
index. Concerns: (1) the concept has never had a `/design-review`, and CD-PILLARS
was not re-run after revisions; (2) the concept disagrees with the art bible on
the look, and it should be checked that loot still "owns saturation and gloss" in
a realistic style; (3) the 20-system MVP puts pressure on Pillar 4 ("a trade
ships only when it plays well alone") by delaying the point where mining alone is
tested as fun. Recommended writing the mining-loop GDDs first and recording the
prototype verdict in a `REPORT.md`.

**Technical Director (TD-PHASE-GATE): CONCERNS**
The concept is buildable on Unity 6.3 LTS; ADR-0001 and ADR-0002 are Accepted
ahead of schedule. Concerns: (1) no `/design-review`; (2) the concept's Technical
Considerations still say the engine is "Undecided"; (3) no prototype `REPORT.md`;
(4) carry-forward: the networking and save GDDs should list floating origin and
host-only perception as constraints.

**Producer (PR-PHASE-GATE): CONCERNS**
Concerns: (1) the concept and the systems index give different MVPs (five items
at 2 to 4 months versus 20 systems at 9 to 12 months); (2) the MVP grew after an
UNREALISTIC scope verdict and was not re-sized; (3) no `/design-review`; (4) no
prototype `REPORT.md`; (5) the Systems Design workload (20 eight-section GDDs,
each reviewed, then a cross-GDD review) is large for one hobby developer. Clears
when the concept's MVP section matches the systems index and `/design-review`
has been run on the concept.

**Art Director (AD-PHASE-GATE): CONCERNS**
Required visual items met. Concerns: (1) the concept's anchor describes a look
the game no longer has ("chunky, rounded and flat-shaded"), with no pointer to
the art bible that supersedes it; (2) the look decision has no prototype record;
(3) no `/design-review`. Noted, not findings at this gate: art bible Section 8
has no budgets yet, and AD-ART-BIBLE was not re-run after its revisions.

## Blockers

None.

## Concerns

1. The concept has not been through `/design-review` (raised by all four directors).
2. The concept is out of date in four places, each confirmed in the file on
   2026-11-26: line 244 (world "chunky, rounded and flat-shaded"), line 297 (art
   style "flat-shaded low-poly"), line 295 (engine "Undecided"), line 379 (MVP
   "2 to 4 months").
3. Two MVP definitions exist: the concept's and the systems index's.
4. The MVP was not re-sized after Home Room and the minimum feedback slice were added.
5. No prototype `REPORT.md`; the designer's "Proceed" is recorded only here.

## Recommendations

- Update the four stale passages in the concept to match the art bible, the
  engine choice and the systems index.
- Run `/design-review design/gdd/game-concept.md` in a fresh session.
- Write `prototypes/star-haul/REPORT.md` recording the Proceed verdict and what
  the prototype answered.
- Re-run `/gate-check systems-design` afterwards.

## Verdict: CONCERNS

Chain-of-Verification: 5 questions checked — verdict unchanged. Two were
answered by re-reading `design/gdd/game-concept.md`: the four stale passages are
real, and the document has no placeholder content.

**Stage not advanced.** The designer chose to fix the concept first;
`project.stage` remains `Concept`.
