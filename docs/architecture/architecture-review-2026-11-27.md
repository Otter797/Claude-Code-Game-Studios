# Architecture Review Report

Date: 2026-11-27
Mode: full
Workflow: full
Engine: Unity 6.3 LTS (editor 6000.3.29f1)
GDDs Reviewed: 2 (`game-concept.md`, `systems-index.md`). No system GDDs exist.
ADRs Reviewed: 3 (ADR-0001, ADR-0002, ADR-0003; all Accepted)
Freshness check: RECEIPT: NONE (no earlier report).

**Reviewed text: commit `0fd3d6d`.** While this report was awaiting approval, ADR-0003, `docs/registry/architecture.yaml` and `design/gdd/systems-index.md` were amended in response to these findings (commit `f30f343`, "docs: amend ADR-0003 after architecture review"). The amended text was not reviewed here. The receipt below stamps the committed versions of ADR-0003 and the systems index, so the next `/architecture-review` sees them as CHANGED and re-checks findings A to C against the amendment.

**Status after the review (reported by the session that amended ADR-0003, not re-verified here).** ADR-0003 was amended in place and stays Accepted. The technical director's TD-ADR gate returned CONCERNS on the amendment, then APPROVE. Findings reported as addressed:
- **A1 to A5:** the amendment table now lists the ADR-0002 sentences named here and by the technical director.
- **A6:** the play-time note carries a note format version.
- **A7:** `gear` is dropped; every item is saved in exactly one place, a container or `carried`.
- **B1:** loading goes through a new `ISaveQueue.LoadAndWait()` on the writer, with no time-out.
- **B2:** the Authority layer retries failed waited writes.
- **B3:** the writer stays alive after an error.
- **C1:** at run end the Authority layer calls `AdvanceTo` before the haul is placed, all in one write.
- **C2:** a container never outlives its piece. One destroyed by a storm loses its contents and its entry is removed; a player's removal of a non-empty container is refused.

Also changed: the systems-index technical director note on Storms and Run Flow, and four registry entries. Not reported as addressed: C3 (wording), D1, D2, E1 and E3, the NOT ASSESSED items, and the missing pre-gate files. The findings below are kept as they were found.

Reviewed-Content-Hash: docs/architecture/adr-0001-network-model.md cc84170cdb537f0c15976dd57743b457eb7a5897
Reviewed-Content-Hash: docs/architecture/adr-0002-persistence.md fcc09078ab3cf8ce67a91af226183714eb5d29a8
Reviewed-Content-Hash: docs/architecture/adr-0003-home-and-storm-persistence.md a0498c686b28a2db3e28d3de664313f154e7c12c
Reviewed-Content-Hash: design/gdd/game-concept.md 720f5ae367e90b820e1dfa41096ea80667ba62a1
Reviewed-Content-Hash: design/gdd/systems-index.md 783a3928889084cf457ec0241786f2b1cc1cd4cf
Reviewed-Content-Hash: docs/architecture/tr-registry.yaml 0e63d2299c9d2b0e73a69cd1e6b26211fb5503af
Reviewed-Content-Hash: docs/engine-reference/unity/PLUGINS.md 8d99063a63269d629be11e9e00e9f460188b689a
Reviewed-Content-Hash: docs/engine-reference/unity/VERSION.md 93e9a6f3b692583add3b871525c920669ab688bb
Reviewed-Content-Hash: docs/engine-reference/unity/breaking-changes.md fb4b916b76b87bf474a4152ce8c64f7c02e7b747
Reviewed-Content-Hash: docs/engine-reference/unity/current-best-practices.md 764d12ee314452d4d814380074ea157d0984ec37
Reviewed-Content-Hash: docs/engine-reference/unity/deprecated-apis.md a8216efd06ba1b7f2ae3bb16ec8b6d3afe902eb8
Reviewed-Content-Hash: docs/engine-reference/unity/modules/animation.md e0601eeba72565d71e1dd2a8bb267eb966d10a5f
Reviewed-Content-Hash: docs/engine-reference/unity/modules/audio.md 56c04c15cb9a356b87a27df5d0fcf67f18db9302
Reviewed-Content-Hash: docs/engine-reference/unity/modules/input.md 1b64a2381167d17c1b796d4d5f93a7e1fcc651e6
Reviewed-Content-Hash: docs/engine-reference/unity/modules/navigation.md 484a867a2fe1acf86b2071f7950b10afaab8ffab
Reviewed-Content-Hash: docs/engine-reference/unity/modules/networking.md ab0ada43362406731784044326eed68fd25aa3b1
Reviewed-Content-Hash: docs/engine-reference/unity/modules/physics.md 191e8d8d502363a99e80670942d251ef819a3976
Reviewed-Content-Hash: docs/engine-reference/unity/modules/rendering.md 292081320361b18c12715f7ed11dae2a38ba5f2d
Reviewed-Content-Hash: docs/engine-reference/unity/modules/ui.md 87de2ff30ce1c8d9499b6bcf084947201852e6ab
Reviewed-Content-Hash: project.yaml d6492d21289b86523fc38f202ac028de741cb9fb
Reviewed-Content-Hash: .claude/docs/technical-preferences.md 2f78ca754541c5a58b3fc14290f527287793e9e9
Reviewed-Content-Hash: .claude/skills/architecture-review/SKILL.md 8c1dd9d6f27f396e3b769b939de27d780d7c486a
Reviewed-Content-Hash: .claude/skills/architecture-review/references/1-load.md 9a65759ebdbb2cb1f9744775bfed18cb25e76347
Reviewed-Content-Hash: .claude/skills/architecture-review/references/2-extract-requirements.md d08ea0b0e9ab9760b0d8bfe0cd9115f0bc40f8e2
Reviewed-Content-Hash: .claude/skills/architecture-review/references/3-traceability.md bb7b6b65c5e5e5b8869fa692413aa831615dede7
Reviewed-Content-Hash: .claude/skills/architecture-review/references/4-conflicts.md 0d30f8173b23248a32523a365b606dd1ce9642ab
Reviewed-Content-Hash: .claude/skills/architecture-review/references/5-engine.md 9a0de3ccca214e473e9433450462e0c6e57f9de2
Reviewed-Content-Hash: .claude/skills/architecture-review/references/6-document-coverage.md dcce78482ec2ce60048989b6f9d1f797dd0a9a0e
Reviewed-Content-Hash: .claude/skills/architecture-review/references/7-report.md a43e17378df952791974dab5f10d7a98c16156fe
Reviewed-Content-Hash: .claude/skills/architecture-review/references/8-write.md bf6d8946fc7b9e19eda7f65503a5c8f593a0d2b1
Reviewed-Content-Hash: .claude/skills/architecture-review/references/9-handoff.md ade419da14b200ae3bc8d00ed3f2c04707a6275b
Reviewed-Content-Hash: .claude/skills/architecture-review/references/lens-engine.md d7770f2737d185cf51a338aaf550fa01b773fb07

---

## Scope limits (said plainly)

- **System-level requirements: NOT ASSESSED.** 0 of 35 system GDDs are written, so Phase 2 had no Detailed Rules, Formulas, Tuning Knobs or Acceptance Criteria to extract from. The matrix below traces only the requirements stated in the concept and the systems index. No TR-IDs were assigned (the TR registry stays empty; IDs belong to system GDDs).
- **Architecture document coverage: NOT ASSESSED.** There is no `docs/architecture/architecture.md`.
- **Performance budget totals: NOT ASSESSED.** No total frame budget or target frame rate exists (`project.yaml` has no `performance` block); the registry holds one budget (persistence, 1.0 ms), which cannot be summed against anything.
- **GDD revision flags: none possible beyond the concept.** No HIGH-risk engine finding contradicts a concept assumption.

## Traceability Summary (concept and systems-index requirements only)

Total: 22. Covered: 14. Partial: 4. Gaps: 4, all deferred by design to tiers after the MVP.

| # | Source | Requirement | ADR | Status |
|---|---|---|---|---|
| 1 | concept, Technical Risks | All inventory, stash, crafting and world changes go through host-side checks | 0001 | ✅ |
| 2 | concept, MVP 5 | Solo play as a host with one player | 0001 | ✅ |
| 3 | concept, MVP 5 | Versioned save data | 0002 | ✅ |
| 4 | concept, Technical Risks | Save migration must not break player-built homes | 0002, 0003 | ✅ |
| 5 | concept, Flow State | Death costs what was carried and nothing else | 0002 | ✅ |
| 6 | concept, Technical Risks | AI perception on the host only | 0001 | ✅ |
| 7 | concept, Technical Risks | Multiple local instances and a latency simulator early | 0001 | ⚠️ Partial: which package provides the network simulator is unconfirmed (ADR-0001 V3) |
| 8 | concept, Technical Risks | Co-op persistence: whose home and stash, no loot duplication | — | ❌ Deferred to a co-op persistence ADR before Tier 2a |
| 9 | concept, MVP 4 | Persistent stash, safe when sheltered; forecast storms | 0003 | ✅ |
| 10 | concept, Open Questions | Storm clock: 50-70 min of play, runs during runs, not while closed | 0003 | ✅ |
| 11 | index, designer's decisions | An abandoned run counts the time actually played | 0003 | ✅ |
| 12 | index, designer's decisions | Carried items at home are kept | 0003 | ✅ |
| 13 | index, TD notes | Built pieces and condition saved; no stutter at hundreds of pieces | 0003 | ✅ (1 ms budget unmeasured) |
| 14 | index, TD notes | Roof check from the piece model, not physics | 0003 | ✅ |
| 15 | index, TD notes | Storms that passed during a run applied in one step at run end | 0003 | ⚠️ Partial: see finding F2 (order with stash banking not fixed) |
| 16 | concept + index, CD notes | Forecast visible before launch; a normal run cannot destroy a home ready at launch | 0003 | ⚠️ Partial: ADR makes it computable; the rule itself is the Storms design doc's |
| 17 | concept, Technical Considerations | Runtime-rebuilt navigation around player-built structures | — | ❌ Later tiers |
| 18 | concept, Technical Risks | Large worlds: float precision far from origin | — | ❌ Later tiers |
| 19 | concept, Technical Risks | Networked melee with lag compensation | — | ❌ Before Tier 3 |
| 20 | index, TD notes | Home and storm clock in session-level Simulation state; pieces sent as data | 0003 | ✅ |
| 21 | index, CD notes | One hammer action repairs the whole home | 0003 (`TryRepairAll`) | ✅ |
| 22 | ADR-0001 deferral | Home-to-run scene change under a host | 0001 | ⚠️ Partial: deferred to the first gameplay story, to be recorded as an ADR-0001 amendment |

---

## Findings on ADR-0003 (the focus of this review)

### A. Amendment table: ADR-0002 sentences changed but not listed

The table says it covers guideline and interface sentences "because the control manifest is built from all of them". These are missing:

- **A1. ADR-0002 Implementation Guideline:** "Save files **must** be written only on the host, by the persistence service, at the safe points listed above." The play-time note is written on a timer, not at a safe point. The table lists Decision 5's "never on a timer" but not this guideline, so a manifest built from both ADRs keeps a rule that forbids the note.
- **A2. ADR-0002 Decision 4, run start:** "a run marker listing what was taken out of the stash (pack contents are empty at start; the tool and any gear carried)". Under ADR-0003 the marker lists what is *carried*, and the pack need not be empty at start (a player can carry rocks and sticks out of the home). Changed, not listed.
- **A3. ADR-0002 Decision 4, extraction:** "the haul is added to the stash". The stash is now a keyed set of containers; which container receives the haul is not said. Not listed.
- **A4. ADR-0002 Decision 5, the save-point list** ("At run start, at extraction, at death, and after each stash or crafting change at home"). Decision 9 extends it with build, removal, repair, gather and storm resolution. Additive, but the ADR-0002 sentence reads as exhaustive. Not listed.
- **A5. ADR-0002 Key Interfaces, `ISaveStore`:** ADR-0003 Key Interfaces calls `ISaveStore` "ADR-0002's, unchanged", then in the same bullet says it "gains reading and writing the play-time note". That is an interface change, and only the "only caller" row is in the table.
- **A6 (minor). ADR-0002 Decision 3 and its guideline** ("one document" with an integer `formatVersion`; "The save **must** carry `formatVersion`"). The note is a second file with no version, and ADR-0003's rule that it holds "only the profile id and the clock" forbids adding one.

Ambiguity rather than an omission:
- **A7. `gear` vs `carried`.** ADR-0002's `SaveModel` has `gear` (crafted and equipped gear); ADR-0003's `carried` holds "pack, tool, gear". Equipped gear has two possible homes in the save, which is the kind of double entry that duplicates items.

### B. Save queue (Decisions 10, 11 and Key Interfaces)

- **B1 (important). No load path.** The amendment row and the registry (`persistent_profile`) say the queue's writer is the *only* caller of `ISaveStore`, including `Load()`. But `ISaveQueue` offers only `Request`, `RequestAndWait`, `NotePlayTime` and `Drain`: nothing loads. Load also does file work that ADR-0003 keeps off the main thread (migration, the pre-migration copy, reading the note), and Decision 11 says migration is waited for. Either `ISaveQueue` needs a waited load operation, or the Authority layer calls `Load()` before the writer starts, which breaks "only caller".
- **B2 (minor). Who retries a failed waited write.** Decision 11 says failed run-end, abandoned-run and marker-free writes are "retried and reported"; it doesn't say whether the queue retries on its own or the Authority layer re-requests, how often, or whether the clock stays held after the wait has completed with a failure ("held" is stated only "while a waited write is pending").
- **B3 (minor). "A writer that has failed."** Decision 10 says a failed writer fails every waiting write and "the next save point tries again". It does not say whether the writer loop survives or is restarted after an unexpected error. If it dies, every later save point fails too.
- Checked and sound: one pending snapshot plus one pending note, newest-wins only within each kind; the run-start time-out path (a late marker write is overtaken by the marker-free snapshot, either by replacement while pending or by order while in flight); `Request`/`NotePlayTime` refused during a waited write while the clock is held; quit drains without a new snapshot.

### C. Ownership split between Building, Stash and Storms

- **C1 (important). Run-end order is not fixed.** Key Interfaces says the run-end snapshot is taken after "every Simulation listener to the end of the run (the stash banking the haul, Storms advancing the clock)". Both listen to the same event, in an unspecified order. If the haul is banked first into an unsheltered container and the storm then empties it, the haul is lost; if storms resolve first, it is not. That breaks the ADR's own claim that `AdvanceTo` is deterministic and its validation criterion that a run ending after two storms "equals staying home for the same play time". Storms resolving before the haul is banked is the order that matches staying home.
- **C2 (important). Contents of a container whose piece is gone.** Containers are keyed by piece id. When a storm destroys a stash piece, or the player removes one with `TryRemove`, nothing says what happens to its contents. Building may not call Stash; Decision 6 runs the shelter check "against the pieces still standing", so a destroyed container is in neither set. Its contents are left orphaned (or duplicated, if a removed piece's materials are also refunded). The registry has no owner entry for container contents.
- **C3 (nit).** Decision 6 calls `AdvanceTo` "a pure function of the model", but it changes Building's and Stash's state. "Deterministic" is the property the ADR relies on.
- Checked and sound: Storms → Building (`IStructureDamage`, shelter query) and Storms → Stash (clearing call) are one-way; Run Flow never calls Storms; Save & Load depends on none of them; the systems index agrees (Storms depends on Building and Stash, not the reverse).

### D. Smaller points
- **D1.** `ISaveQueue` and the writer thread are not assigned to an assembly (ADR-0002 Decision 2 assigns everything else).
- **D2.** Gather is a save point, but gather points are not saved (deferred to the Home Valley design doc). Until that doc decides, reloading respawns everything gathered. Acknowledged in the ADR; noted so the Home Valley doc picks it up.

## Cross-ADR Conflicts

No two ADRs claim the same state, and no dependency cycle exists. The amendment-table omissions (A1 to A5) are the only cross-ADR contradictions: each leaves an ADR-0002 rule in force that ADR-0003 has actually changed. They are not blocking if fixed before `/create-control-manifest`, which would otherwise copy both versions.

## ADR Dependency Order (from `adr-dep-graph.sh`)

Edges: 0002 → 0001, 0003 → 0001, 0003 → 0002. No cycles; every ADR declares its dependencies.
1. ADR-0001 Network Model (Foundation, no dependencies)
2. ADR-0002 Persistence (requires 0001)
3. ADR-0003 Home and Storm Persistence (requires 0001, 0002)

All dependencies are Accepted.

## Engine Compatibility

- ADRs with an Engine Compatibility section: 3 of 3. All name Unity 6.3 LTS, 6000.3.29f1. No stale version.
- Deprecated APIs: none used. ADR-0001 mentions UNet and the old RPC attributes only to forbid them.
- Post-cutoff APIs: only ADR-0001 (Netcode for GameObjects 3.2.1, from Unity's manual). No conflicting assumptions between ADRs.

### Engine Specialist Findings
- **E1 (ADR-0001, stale).** "The version that actually resolves in this project is NOT ASSESSED: no Unity project exists yet." The project now exists, and `StarHaul/Packages/manifest.json` has no Netcode package. ADR-0001 Verification item 4 is still open, and must be done before the first networked story. (Verified in the manifest.)
- **E2 (ADR-0003, verified).** "The project runs in the background": `runInBackground: 1` in `ProjectSettings.asset`. Domain reload: `m_EnterPlayModeOptionsEnabled: 1` with `m_EnterPlayModeOptions: 0`, which reads as domain reload still ON, as the ADR's risk says. ADR-0001 V5, ADR-0002 V5 and ADR-0003 V3 all need it switched off before they test anything.
- **E3 (ADR-0003, unverified).** The ADR rules out the engine's JSON utility on the writer because the writer may not call the engine. Unity's scripting reference has, from general knowledge, described `JsonUtility` as callable from background threads. The conclusion still holds, because that utility cannot serialize keyed collections, which ADR-0002 requires. The stated reason should be checked when the serializer is chosen. Not sourced from `docs/engine-reference/unity/`.
- No anti-patterns from the Unity lens were found (no `Find`/`SendMessage` wiring, no `Resources.Load`, no `DontDestroyOnLoad` scene pattern, no state in UI).

---

## Verdict: CONCERNS

Not PASS, because the architecture document was not assessed, there are no system GDDs, and 4 requirements are only partly covered. Not FAIL: no Foundation or Core requirement is uncovered, and no two ADRs claim the same state. The verdict rests on ADR-0003's open points: B1, C1 and C2 are real contract or determinism holes, and A1 to A5 must be fixed before the control manifest is generated.

### Recommended fixes (to be made through `/architecture-decision`, not by this review)
1. ADR-0003: add rows A1 to A5 (and decide A6) to "What this changes in ADR-0002"; settle A7 (`gear` vs `carried`).
2. ADR-0003: give `ISaveQueue` a waited load, or restate who calls `Load()` (B1); update the `persistent_profile` and `save_request` registry entries to match.
3. ADR-0003: fix the run-end order, storms before the haul is banked (C1).
4. ADR-0003 (or the Stash design doc, with an ADR line pointing to it): say what happens to a container's contents when its piece is destroyed or removed, and register an owner for container contents (C2).
5. ADR-0001: refresh the "no Unity project exists yet" line when the Netcode package is added (E1).

### Required ADRs
None new for the MVP. Deferred by design: co-op persistence (before Tier 2a), transport and session (before Tier 2a), networked melee (before Tier 3), large worlds and runtime navigation (later tiers).
