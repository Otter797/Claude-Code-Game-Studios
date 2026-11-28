# Gate Check: Concept → Systems Design (re-run)

**Date**: 2026-11-27
**Checked by**: gate-check skill
**Workflow tier**: full · **Review mode**: full · **Panel**: 4 of 4
**Previous gate**: `2026-11-26-concept-to-systems-design.md` (CONCERNS, stage not advanced)

## Required Artifacts: 3/3 present

- [x] `design/gdd/game-concept.md`: exists with real content, and no placeholder text was found
- [x] Game pillars defined: five pillars, each with a design test, plus five anti-pillars
- [x] Visual Identity Anchor section exists in `design/gdd/game-concept.md`

## Recommended: 1/1 met

- [x] Concept prototype with a `REPORT.md` showing PROCEED:
      `prototypes/star-haul/REPORT.md` gives the designer's Proceed verdict.
      The hypothesis was only PARTIALLY CONFIRMED.

## Quality Checks: 4/4 passing

- [x] Game concept reviewed with `/design-review`. The fourth review came back
      APPROVED (`design/gdd/reviews/game-concept-review-log.md`, entry at L109).
      This check failed at the 2026-11-26 gate.
- [x] The core loop is described at four time scales
- [x] The target audience is identified
- [x] The Visual Identity Anchor contains a one-line visual rule and three supporting principles

## Director Panel Assessment

**Creative Director (CD-PHASE-GATE): CONCERNS**
Concerns:
1. The run's tension (the core fantasy) is still unproven. The browser-prototype
   retest must be the first work of Systems Design, before any `/design-system`
   run.
2. The systems index does not include the retest gate. *Rejected on
   verification:* `design/gdd/systems-index.md` includes it at L151, L405 and
   L430.
3. The MVP has no lasting ore sink or wealth display to back Pillar 5 ("home is
   the scoreboard"). This is carried forward and gates the Ore & Item Economy
   GDD.
4. CD-PILLARS has not been re-run since the pillars were revised. The art-bible
   rework is still uncommitted.

**Technical Director (TD-PHASE-GATE): READY**
Earlier concerns are resolved. ADR-0001 to ADR-0003 are Accepted, which is
beyond what this gate requires. Notes for later:
- The Netcode package is not installed yet.
- Domain reload is ON.
- Decide oxygen canisters and Burrower drill-stun before the Oxygen and Creature
  AI GDDs.

**Producer (PR-PHASE-GATE): READY**
The earlier conditions are met. Advisories:
- The retest is the first task of the phase and sits on the critical path.
- The 24 MVP GDDs need an estimated 52 to 62 or more design sessions. Treat
  Milestone A's 15 GDDs as the first block, then check pace.
- Decisions needed later: Burrower stun, oxygen canisters, storm strength, and
  mapping the four prototype ores to amber and teal.
- Cosmetic: `prototypes/star-haul/REPORT.md` L126 still says "9 to 12 months".

**Art Director (AD-PHASE-GATE): READY**
The concept's look now agrees with the art bible. It judged the art-bible rework
on disk, which is still in progress. Advisory:
- Update the anchor's "unchanged" note once the rework lands.
- Re-run AD-ART-BIBLE before Pre-Production.

## Blockers

None.

## Concerns

1. The tension retest has not been run. It must come before the first
   `/design-system` run, and in any case before any GDD for Oxygen, Hunter
   Escalation, Mining or Ore & Item Economy.
2. The MVP has no ore sink or wealth display yet, and this gates the Ore & Item
   Economy GDD.
3. CD-PILLARS has not been re-run since the pillars were revised.
4. The art-bible rework is uncommitted, so it needs re-checking (AD-ART-BIBLE)
   once it lands.

## Verdict: CONCERNS

Chain-of-Verification: 5 questions checked, verdict unchanged. Two were answered
against the files:
- grep of the systems index: the retest gate is present
- the concept review log: APPROVED at L109

### Accepted Risks

On 2026-11-27 the designer explicitly accepted concerns 1 to 4 above and chose
to advance to Systems Design ("write the gate report to production/gate-checks/
and move the stage to Systems Design, accepting those concerns").

**Stage advanced:** `project.stage` changed from `Concept` to `Systems Design`.
