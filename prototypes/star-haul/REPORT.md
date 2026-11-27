<!-- PROTOTYPE - NOT FOR PRODUCTION -->
# Concept Prototype Report: Star Haul (asteroid mining run)

> **Date**: 2026-11-26
> **Prototype Path**: HTML (one-shot, browser, three.js from `vendor/`)
> **Concept File**: design/gdd/game-concept.md and design/game-brief.md

Written after the fact, from the prototype's own evidence files and the
designer's answers on 2026-11-26. Nobody observed the designer's play sessions;
where this report states how play felt, it is the designer's own answer.

---

## Hypothesis

From `config.js` and the brief: *"Is 'one more seam or leave now' tense on a 10 to
15 minute run, and is unpacking at home satisfying enough to go straight back
out?"*

Two parts: (1) the decision to leave is tense; (2) the home payoff pulls the
player back out.

---

## Riskiest Assumption Tested

That a worsening hazard (draining oxygen, creatures that notice noise and sight,
hunters that rise the longer the player stays) makes leaving a hard choice. This
is also the brief's kill condition: *"if leaving the asteroid never feels like a
hard choice after two tuning rounds"*.

**It has not proved out, and it has not been properly tested.** See Result.

---

## Approach

A first-person browser game of one asteroid run and a home room: a safe landing
pad, three zones of rising richness and danger, four ore kinds, a 16-slot pack
with its worth on screen, oxygen, two creature kinds (Burrower, Spitter),
hunters, the ship as the exit, loss of pack and tool on death, a stash and a
bench with two recipes.

**Path chosen:** HTML
**Reason for path:** no engine was chosen when it was built; a browser one-shot
was the fastest way to something playable.

Two iterations followed the designer's feedback (`evidence/changes.tsv`):

1. **Look.** Flat-shaded low-poly pastel was replaced by stylised realism
   (smooth rounded shapes, rock textures, natural stone colours, sunlight with
   soft shadows). Free model packs were brought in; some were rejected by the
   designer and removed.
2. **Behaviour.** Enemies wander and notice the player by sight or noise instead
   of standing still; hunters rise the longer the player stays, each tier faster
   and harder-hitting; ore vibrates under the drill instead of spinning; a real
   drill model; the home rebuilt from workshop models.

**Shortcuts taken (intentional):**
- Solo only; no networking of any kind.
- One fixed, hand-placed layout.
- Free third-party models as stand-ins (`assets/provenance.yaml`).
- Browser storage for the stash; no versioned save.

---

## Result

**What the designer reported (2026-11-26):**

- Tension: asked whether "one more seam or leave now" felt like a tense
  decision, the designer answered **"No, not really."**
- Home payoff: asked whether they got home, unpacked, and wanted to go straight
  back out, the designer answered **"Yes, and I wanted to go again."**
- Play time: **"A few minutes."**
- Overall verdict: **"Proceed."**

**Why a few minutes cannot test part 1.** By the prototype's own tuning, a full
oxygen tank lasts 540 seconds at a walk, the first hunter rises 150 seconds into
a run, and further hunters rise every 70 seconds. The richest ore (Sunstone) is
in the deepest zone and needs the better drill. Most of the pressure the design
relies on had not started within a few minutes of play. The "no" is therefore one
early reading against the hypothesis, not a refutation.

**What the designer's recorded feedback was about** (`design/game-brief.md`,
"After play" lines): the look ("i dont want it so low-poly"), the model packs,
enemies that "should not just be sitting t-posing", hunters that "should be more
dangerous", and ore that should "just vibrate". None of it is about tension or
pacing.

**What the automated check covered** (`evidence/check-run.yaml`,
`evidence/checklist.tsv`): the game boots; a run plays from the title; the check
walked to a seam and drilled one Glint (pack worth 10); oxygen was seen draining.
**Not assessed by any automated run:** creatures waking on noise, death and the
loss of pack and tool, boarding the ship, unpacking, the saved stash, crafting,
and the better drill cutting Sunstone. Those are coded but were never exercised
by the check.

---

## Metrics

| Metric | Value |
|--------|-------|
| Path used | HTML |
| Iterations to playable | N/A (HTML path); two feedback iterations after the first build |
| Prototype duration | Not recorded |
| Playtesters | 1 internal (the designer) / 0 external |
| Feel assessment | Home payoff made the designer want another run. Leaving did not feel like a hard choice, after a few minutes of play, which is shorter than the 150 s before the first hunter and far shorter than the 540 s oxygen tank |
| Hypothesis verdict | PARTIALLY CONFIRMED, on thin evidence: part 2 confirmed by the designer; part 1 not confirmed and not yet properly tested |

---

## Recommendation: PROCEED (the designer's verdict), with a condition

The designer's verdict is Proceed, and the home payoff, half of the hypothesis,
held up. The other half, the one the whole extraction loop rests on, has one
early "no" and no full-length test.

**Condition before design docs are written for Oxygen, Hunter Escalation and Ore
& Item Economy:** play at least three or four full runs of this prototype (to
death or extraction, ten minutes or more each), then tune `config.js` and play
again, as the brief's build order already says ("Tune the hazard and the walk
back until leaving is a real decision"). The prototype exists, runs in a
browser, and exposes every number. This is an evening's work set against an MVP
the producer sized at 9 to 12 months.

If leaving still never feels like a hard choice after two tuning rounds, the
brief's kill condition applies and the design should change before it is built
in Unity.

---

## If Proceeding

- **Core tuning values (starting points, not proven numbers).** From `config.js`:
  walk 3.8 m/s, sprint 6.2 m/s, full pack slows by 20%; oxygen 540 s per tank,
  sprinting uses 2.4x, gauge turns magenta below 30%; pack 16 slots; ore worth
  10 / 30 / 80 / 220 with drill times 2.0 / 3.0 / 4.4 / 6.0 s; drilling heard
  within 26 m; no creature enters within 34 m of the ship; Burrower 4.4 m/s with
  a 0.55 s wind-up; first hunter at 150 s, then every 70 s, each tier 10% faster
  and 30% harder-hitting, rising 24 m behind the player over 1.6 s.
- **Assumptions confirmed:** unpacking at home is satisfying enough to want
  another run (designer). Stylised realism is the look the designer wants.
- **Assumptions disproved:** flat-shaded low-poly as the look. The concept's
  anchor and the art bible now reflect this.
- **Assumptions not yet tested:** that the hazard makes leaving a hard choice;
  that a run lasts 10 to 15 minutes; that losing pack and tool on death stings
  without feeling unfair; that the walk back matters.
- **Emergent mechanics:** stunning a Burrower by drilling it (0.45 s of drilling
  stuns for 2.6 s; two stuns send it back to sleep) and oxygen canisters (carry
  up to 2, each refills 45%) are in the prototype but are not in the systems
  index. They need a decision before the Creature AI and Oxygen design docs.
- **Art bible differences to resolve:** the prototype's ore is four named kinds
  (Glint, Ember, Verdite, Sunstone); the art bible has two families (amber,
  teal) of three tiers each, and replaces the prototype's blue ore.

> The HTML path cannot settle first-person feel in Unity (controller weight,
> drill feedback). That needs the engine build.

**Next steps:**
1. Play full runs and tune (the condition above).
2. `/design-review design/gdd/game-concept.md` in a fresh session.
3. Re-run `/gate-check systems-design`.
4. `/design-system` in the systems index's order, using these values in the
   Tuning Knobs and Formulas sections.

---

## Lessons Learned

- **What assumptions were broken by actually building this?**
  That the first look (flat-shaded low-poly) was right; the designer rejected it
  on sight. And that standing enemies read as a threat; they read as broken.

- **What surprised us that didn't show up in the brainstorm?**
  How much of the feedback went to look and creature behaviour, and how little
  to the question the prototype was built for. Two iterations were spent on how
  it looks and moves, none on whether leaving is a hard choice.

- **What would we test differently next time?**
  Play to the end of a run before changing the art. State the hypothesis in the
  session and ask it directly after each play, so the report is written from an
  answer and not reconstructed later. Have the automated check wake a creature,
  die once and extract once, so the loop's key moments are at least exercised.

---

> *Prototype code location: `prototypes/star-haul/`*
> *This is a one-shot. It grows only through `/prototype`'s grow step; none of
> its code carries over to the Unity project.*
