# Art Bible: Star Haul

> **Status**: Draft
> **Owned By**: art-director
> **Last Updated**: 2026-11-26
> **Art Director Sign-Off (AD-ART-BIBLE)**: REVISED 2026-11-26 — verdict was CONCERNS (Sections 4, 7, 8). Sections 4 (ore tiers, ore versus cream) and 7 (home screens) revised. Section 8 still open: no triangle, memory or particle budgets until the first test asteroid is measured.

`/art-bible` writes these nine sections in this order and replaces each
section's `[To be designed]` line as that section is approved. A section still
holding its placeholder is incomplete; a later run fills only those.

## 1. Visual Identity Statement

**Direction: Cargo Is the Colour**

This section is the current word on the look and takes precedence over the
"Visual Identity Anchor" in `design/gdd/game-concept.md`. That anchor originally
described a flat-shaded low-poly world; it was updated on 2026-11-26 to match
and now points here. The rule and its three principles are unchanged; the look
is stylised realism, chosen by the designer after playing the prototype.

### Visual rule

*The most saturated thing on screen is always something you could carry home.*

This rule settles any colour, material or lighting dispute by asking one
question: does this choice pull the eye away from the loot? If it does, it loses.

### Supporting principles

**1. Loot owns saturation and gloss.** The world is smooth, matte and naturally
coloured. Ore is the only faceted, glossy, fully saturated thing in it, and
richer ore is more saturated, so value is readable at a glance from across a
cave. The pack glows brighter as it fills, so the player sees their own stake
rising. Serves **Pillar 1, The haul is the heartbeat**.
*Design test:* when the finish of a rock, prop or effect is ambiguous, this
principle says choose the duller, matter one, and spend the colour on the cargo.

**2. One hue means danger.** Hot magenta marks threat and nothing else:
creatures, and the oxygen gauge when it runs low. A colour with a single meaning
can be read in the corner of the eye, which is what makes danger scoutable.
Serves **Pillar 2, Risk is a choice**.
*Design test:* when the colour of a gem, a flower, a light or a UI accent is
ambiguous, this principle says choose any hue except magenta.

**3. Home brightens with wealth.** Home starts as plain as the rock outside and
becomes the most colourful place in the game as the haul is stored, displayed
and built into it. Serves **Pillar 5, Home is the scoreboard**.
*Design test:* when it is ambiguous whether to show wealth as a number or as an
object, this principle says choose the coloured object the player can walk past.

### What "stylised realism" means here

Light and surface are realistic. Shape and colour are stylised. Realistic means
a real sun, cast shadows, and textured rock in natural stone colours that reads
as stone when the player stands next to it. Stylised means simplified, rounded
forms with no fine clutter, a soft pastel cast over those stone colours, a soft
coloured sky, and brightness that comes from light and value instead of strong
colour. This is not photorealism: no scanned grit, no dirt passes, no noisy
detail competing with the ore. It is not low-poly either: silhouettes are
smooth, surfaces are textured, and facets are reserved for ore alone. The
friendly look carries no promise of safety, which is **Pillar 3, Bright world,
real stakes**.

## 2. Mood & Atmosphere

Mood is carried by light and value, never by environment chroma (Section 1).
Rock stays at or below 20% saturation in every state.

| State | Emotional target | Lighting | Descriptors | Energy | Mood carrier |
|---|---|---|---|---|---|
| Landing area | Safe, unhurried optimism | Warm high sun, cool sky fill, high-key, soft contrast | Open, airy, sunlit, still | Low | Ship hull lit cream; long clear sightlines |
| Working a seam (mid zones) | Greedy focus with one ear open | Sun shafts through openings, cooler fill, medium contrast | Dappled, hushed, dusty, enclosed | Medium | Ore glints in shafts; pack glow starting |
| Deep zone | Tempted dread | No sun; dim cool ambient, warm helmet lamp, highest contrast | Dark, close, cold, glittering | Medium, taut | Richest ore is the only colour in the dark |
| Hunted / escalation | Rising alarm, "we stayed too long" | Fill dims and cools one step per hunter tier; shadows deepen | Thinning, exposed, urgent, watched | High | Magenta eye-points moving in the dark |
| Run back / extraction | Desperate hope, then release | Travelling from cool dark towards warm light; sun floods on lift-off | Uphill, breathless, brightening | Peak, then drop | Cream ship beacon ahead; pack at full glow |
| Death | Blunt loss, no softening (Pillar 3) | Colour drains to grey value in about a second | Abrupt, silent, flat, cold | Zero | Dropped pack is the last colour, then goes out |
| Home | Earned pride, calm | Warm lamps, low contrast, evening feel | Snug, tidy, warm, growing | Low | Stored ore on shelves colours the room |
| Menus | Quiet anticipation | Home lighting, slightly dimmed | Calm, clear, sparse | Lowest | The player's own stash shelf as backdrop |

**Rationale.** The run is a trip from warm to cool and back, so depth is felt
without a map (Pillar 2). Escalation changes light quantity, not hue, so magenta
stays the only danger signal. Death removes colour because colour is cargo, and
the cargo is gone.

**Notes.**
- The deep zone's helmet lamp is new to the design with this section; the brief
  and the prototype have no lamp.
- Dimming the fill light per hunter tier is subject to a performance check at
  60 fps (technical-artist). If it fails, escalation keeps its other carriers:
  deepening shadows and the magenta eye-points.

## 3. Shape Language

**Rule: round is world, facet is fortune, spike is threat, straight is ours.**
Four shape families, one meaning each, so shape repeats what colour says.

| Archetype | Thumbnail silhouette | One trait | Communicates |
|---|---|---|---|
| Burrower | Low, wide dome | Oversized shovel claws | Heavy, close-range, comes from below |
| Spitter | Tall, top-heavy | Swollen throat sac on a thin neck | Fragile but dangerous at range |
| Hunter, tiers 1–3 | Lean, forward-leaning wedge | Back spines: one, three, full crest | Speed and intent; count the spines to know the tier |
| Fellow player | Upright capsule | Square pack on the back | Human, friendly, carrying a stake |

- **Creatures** are rounded and matte like the world (Pillar 3: friendly look,
  real stakes), with spikes only on the part that hurts. Spine count makes
  hunter tiers scoutable at distance (Pillar 2).
- **Players** are read by the pack, the only box on a living silhouette, and its
  glow shows each teammate's stake (Pillar 1).
- **Environment**: large rounded boulders and smooth arches; big and medium
  forms only, no small clutter. Passages narrow and ceilings drop with depth, so
  pressure is felt physically. Seams are cracks filled with facets.
- **The ship** owns the only long straight lines and right angles outdoors, so
  the exit reads from any distance (Pillar 2).
- **UI**: rounded rectangles and circles; oxygen is a ring, the pack a filling
  box. Triangles and chevrons appear only on warnings.
- **Hero versus supporting**: ore, creatures, ship and packs are hero shapes
  with a crisp outline against the rock. Rock is supporting: low-contrast,
  broad, quiet. At home, shelves and bench are plain boxes; the displayed
  objects are the heroes (Pillar 5).

**Note on current models.** The Quaternius Squidle (Burrower) and Mushnub
(Spitter) models chosen during the prototype have not been checked against these
silhouettes. They are stand-ins until creatures matching this section exist.

## 4. Color System

Hex values and colourblind pairings in this section are reasoned, not yet run
through a colour-blindness simulator. Verify them when the first HUD and the
first creature are on screen.

### Primary palette

| Name | Hex | Meaning |
|---|---|---|
| Chalk Stone | `#C9BFB4` | Sunlit rock; the neutral everything is judged against |
| Deep Slate | `#4A4E5C` | Deep rock and shadow; "darker rock means richer and riskier" |
| Haze Sky | `#BFD9E6` | Sky and healthy oxygen: air |
| Beacon Cream | `#FFF1D0` | Ship lights, lamps, interactable highlight: safety and "ours" |
| Haul Amber | `#FFAE00` | Top-tier ore and the pack glow: fortune |
| Seam Teal | `#00C2A8` | Second ore family: variety without leaving the loot arc |
| Threat Magenta | `#FF2E93` | Danger only |

### Semantic usage

- **Reward**: ore lives in the amber-to-teal hue arc only. Hue names the family,
  saturation names the tier. Violet, pink and red are a keep-out band, so no gem
  can drift towards magenta. The prototype's blue ore is replaced by this arc.

  | Tier | Amber | Teal | Saturation |
  |---|---|---|---|
  | 1 | `#D9B46C` | `#61C2B5` | about 50% |
  | 2 | `#F2BC49` | `#3AC2B0` | about 70% |
  | 3 | `#FFAE00` | `#00C2A8` | 100% |

  **Open design question (designer):** this table treats teal as a different
  material of equal worth per tier. If teal should be rarer or worth more, hue
  becomes a second value code alongside saturation. That is a game-design
  decision, not settled here.

  **Ore versus cream light.** Ore is a surface, cream is a light.
  - Ore is always faceted, glossy with a hard glint, set in a crack in matte
    rock, and never lights the rock around it. In the deep zone a seam is found
    by its glint in the player's lamp, not by its own light. The pack glow is
    unaffected.
  - Cream is always soft-edged, with no facets or glint, lights its
    surroundings, and sits on straight-edged, made things. It is the brightest
    value on screen.

  Tier-1 amber is `#D9B46C` (saturation about 50%, value about 85%) to widen its
  gap from Beacon Cream (saturation 18%, value 100%). A hue shift is not
  available: red is keep-out and yellow-green drifts towards teal. Darker than
  85% would meet Chalk Stone's value.
- **Danger**: magenta as small, soft, pulsing emissive points (eyes, sacs),
  under a tenth of the silhouette, on matte stone-coloured bodies.
- **Safety and exit**: cream light, the brightest value on screen. Safety is
  brightness, not hue, so it never competes with loot.
- **Oxygen**: Haze Sky when healthy, magenta when low, because suffocation is a
  threat.
- **Interactable**: thin cream rim. No new hue is spent.

**The one stated exception to the visual rule.** Threat Magenta is more
saturated than the lowest ore tier, and a creature cannot be carried home. The
designer chose to keep hot magenta for readability (Pillar 2) and to contain it:
small emissive points only, never a surface, never more than a tenth of a
silhouette. Nothing else may claim this exception.

### Temperature by area

| Area | Key light | Fill | Rule |
|---|---|---|---|
| Landing | Warm sun, about 5500K | Cool sky | Warm dominant |
| Mid zones | Warm shafts | Cool, stronger | Balanced |
| Deep | Helmet lamp only, about 4000K | Cold, dim | Cool dominant |
| Home | Lamps, about 3000K | Warm bounce | Warmest in the game |

### UI palette

Cream text on a near-black slate panel (`#1E2029`, UI only, needed for contrast
over the bright landing area). Amber only for haul and pack value; magenta only
for warnings; teal never used as UI chrome. UI colour is flat, with no gloss,
because gloss belongs to ore.

### Colourblind risks and backups

| Pair | Likely fails for | Backup cue |
|---|---|---|
| Magenta threat vs teal ore | Red-green (both shift towards blue-grey) | Motion: threat pulses and moves, ore is static. Shape: soft glow point vs hard facet cluster |
| Magenta threat vs amber ore | Blue-yellow (both shift towards red-pink) | Same motion and shape cues; creature sound cue (audio-director) |
| Oxygen blue to magenta | Red-green | Ring breaks into segments and pulses; warning triangle icon; sound cue (audio-director) |
| Ore tiers by saturation | Low-saturation vision, full colour blindness | Facet count and cluster size rise with tier; brighter glint |
| Hunter tier | Any | Spine count and body size |
| Low-tier amber ore vs cream light | Low-saturation vision, full colour blindness, warm lamp light | Ore: hard facets and glint, casts no light. Cream: soft edge, lights its surroundings, straight-edged source |

## 5. Character Design Direction

### The player

The game is first person, so the player's own character is hands, the drill and
a helmet lamp. Teammates see a rounded, matte suit in stone-neutral tones with
cream trim, and the square pack on the back. Cream is "ours" (Section 4), so
anything cream-lit and straight-edged is a person or the ship. Teammates are
told apart by a shape mark on the pack (stripes, a band, a chevron-free
pattern), never by a new hue, so the palette stays closed and the cue works for
colourblind players. Serves **Pillar 1**: the pack is the most important thing
on a teammate, and its glow shows their stake.

### Telling things apart at a glance

| What | Body | Signal | Never |
|---|---|---|---|
| Creature | Rounded, matte, stone-range colour, at or below 25% saturation | Magenta glow points; spikes on the part that hurts | Gloss, facets, cream light |
| Hunter | Same family, leaner and larger per tier | Spine count; more magenta points per tier, each still small | A new colour per tier |
| Fellow player | Upright, straight-edged pack | Cream lamp, glowing pack | Magenta anywhere on the suit |

*Design test:* when it is unclear whether a new creature feature should be a
colour or a shape, choose the shape. Colour is already spent.

### Pose and motion

Creatures are never still statues. Each has idle behaviour when unaware
(rooting, shifting, looking about), a distinct alerted pose, and a clear wind-up
pose before any attack, held long enough to read. Movement is slightly
exaggerated and readable, not realistic twitching. Serves **Pillar 2**: a
careful player can always see it coming. This also answers the designer's
rejection of enemies "just sitting t-posing waiting to be activated".

### Surface

Creature skin is textured and matte, like the rock. Nothing on a creature is
wet, shiny or faceted, because gloss belongs to ore (Section 1).

### Reading against the rock

Stone-coloured creatures on stone-coloured rock risk vanishing, which would
break Pillar 2. A creature's body always sits at least one clear value step away
from the rock around it: darker than Chalk Stone in the lit zones, lighter than
Deep Slate in the deep zone.

*Design test:* a creature standing still must be findable within two seconds by
a player looking towards it from 15 metres. If it is not, change its value, not
its hue.

### Detail at distance

Encounters happen from about 2 to 30 metres. The silhouette, the magenta points
and a hunter's spine count must survive at 30 metres. Skin texture and small
surface detail may drop away beyond about 15 metres. Hands and the drill are
always next to the camera and get the most detail in the game. The 15 m and
30 m figures are working numbers for art, not yet measured against a built map.

## 6. Environment Design Language

### Two kinds of place, one rule

The asteroid is natural: nobody built it, so it has no architecture, only rock.
Everything people made is the ship and the home workshop: plain, straight-edged,
cream-lit, worn but clean. Shape tells the player which they are looking at
(Section 3: round is world, straight is ours), so the exit and home never need a
sign. Serves **Pillar 2**.

### Texture philosophy: real light on simplified surfaces

Rock uses physically based materials with real texture maps, so it responds to
the sun and to shadow like stone. The stylising is in what is kept:

- Broad, low-frequency detail stays: cracks, strata, big chips.
- Fine noise goes: no grit, speckle or dirt passes.
- Rock is always matte. Nothing in the environment has a sharp highlight,
  because a glint is how the player finds ore.
- The pastel cast comes from a light tint on the stone colours and from grading,
  with rock at or below 20% saturation (Section 2).

*Design test:* when a rock material looks more convincing with extra shine or
grime, leave it out. Convincing is not the goal; making the ore the only thing
that sparkles is.

### Prop density by area

| Area | Density | Why |
|---|---|---|
| Landing area | Sparse; long open sightlines | Safety should feel like being able to see everything |
| Mid zones | Medium; large boulders that break sightlines | Cover for the player and hiding room for creatures, so scouting matters |
| Deep zone | Tight walls and low ceilings, very few props | Pressure comes from the space; the ore is the only decoration |
| Home | Starts nearly bare | It fills with what the player brings back, never with pre-placed colourful props |

*Design test:* when an area feels empty and it is tempting to add props, add a
boulder or a sightline break, never small clutter.

The home rule narrows the prototype's furnished workshop: its models may stay,
but furniture is plain and uncoloured, and colour arrives only with the haul
(Section 1, principle 3).

### Environmental storytelling

- Darker rock means richer and riskier, everywhere, with no exceptions.
- Ground a Burrower uses shows claw scoring and burrow mouths.
- Spitter perches show matte, dark stains on the rock below. Never magenta:
  magenta is for the living threat only.
- The ship's cream beacon is visible from the entrance of every zone, so the way
  out is always known.
- A mined seam stays as an empty, cracked socket, so players can read where they
  and others have been.

### Reading against each other

The rock is deliberately the quietest thing on screen: broad, low-contrast,
matte. That is what lets a creature's silhouette (Section 5), a seam's facets
and a teammate's pack stand out against it.

## 7. UI/HUD Visual Direction

### Art view

**Where information lives.** As much as possible is in the world, not on the
screen: ore glints, the ship's cream beacon, a creature's magenta points, a
teammate's glowing pack. The screen carries only what the world cannot show in
first person:

- **Oxygen**: a ring, bottom-left. Haze Sky when healthy, magenta and broken
  into segments when low.
- **Pack**: a filling box with its worth as a number, bottom-right. The number
  is the largest text on screen (Pillar 1).
- **Interact prompt**: a small cream rim and key hint at the centre, only when
  something can be used.

**Typography.** One rounded, humanist sans-serif in medium weight, friendly
without being childish (Pillar 3). Numbers use fixed-width digits so the worth
does not jitter as it counts up. Three sizes only: the worth number, values, and
labels. The typeface itself is not chosen here; selecting and licensing one is a
later step.

**Icons.** Flat, rounded, single-weight outlines. No gloss, no gradients, no
facets, because those belong to ore. Triangles and chevrons appear only on
warnings (Section 3).

**Motion.** Calm and short. The worth ticks up with a small pop for each ore;
the pack box brightens as it fills; nothing else bounces. On death the HUD
drains to grey with the world.

### UX view

- **Fit.** Three small elements suit a game of deliberate movement and quick
  glances. The style causes no problem in menus or at home.
- **Accessibility floor.**
  - Text is never smaller than 16 px at 1080p, scales with resolution, and has a
    UI scale setting.
  - All text sits on the near-black slate panel from Section 4. Cream text
    directly over the sunlit landing area would not be readable.
  - Nothing relies on colour alone: low oxygen also segments the ring, shows a
    warning triangle and plays a sound; ore tiers in the pack show a tier mark
    as well as colour.
  - The low-oxygen pulse is slow, no faster than about twice a second. No
    flashing.
  - Prompts show the key actually bound, and must work for keyboard and mouse
    now and a gamepad later.
- **Feedback.** Every pickup changes the number and the box at the same moment,
  so the player always sees what they gained.

### Conflict and decision

The art view wanted the whole HUD to fade out when nothing is changing, so the
bright world fills the view. The UX view objected: oxygen is the clock of the
whole run, and hiding it while idle makes the player act to see how long they
have, which works against Pillar 2.

**Decided by the designer (2026-11-26):** the oxygen ring is always visible. The
pack box fades when idle and reappears on any pickup or when the pack is opened.

### Home screens: art view

**Home is the display, the screen is the label.** The stash is the shelves the
player walks past, not a list. A panel appears only when the player steps up to
something and uses it. Serves **Pillar 5**.

- **Unpacking.** The pack empties onto the shelves one ore at a time. One
  number, the stash total, counts up on the slate panel in the same fixed-width
  digits as the run, with the same small pop per ore. This is the payoff of the
  run, so nothing else is on screen while it plays.
- **Stash.** Opened by using a shelf. One row per ore: a flat outline icon, a
  tier mark, how many, and what they are worth.
- **Crafting bench.** One panel. Recipes on the left; on the right the chosen
  recipe, with each ore it needs as an icon and "have / need" numbers. The
  crafted item appears physically on the bench, not in a pop-up.
- **Menus (title, pause, settings).** The slate panel over the dimmed home
  backdrop from Section 2. Same typeface, no ornament.
- **After a death or an abandoned run.** A plain statement of what was lost, in
  grey, with no softening and no consolation (Pillar 3).

### Home screens: UX view

- **Fit.** These are the long-reading screens. Rows keep the 16 px floor, and
  every panel works with the keyboard alone now and a gamepad later; the mouse
  is never required.
- **Not colour alone.** "Have / need" is shown as numbers plus a tick when met.
  The focused row is marked by a cream rim and a shape change, not colour only.
  Recipes the player can make now are listed first.
- **Feedback.** The loss screen says exactly what was lost and why: died, or
  left the run (ADR-0002).

### Home screens: conflict and decision

The art view wanted the unpacking count-up always played in full, because it is
the reward. The UX view objected: with a full pack on the tenth run of an
evening, a count-up that cannot be hurried becomes a wait.

**Decided by the designer (2026-11-26):** the count-up always plays, and holding
a key runs it fast. It is never skipped outright.

## 8. Asset Standards

### Art view

**Formats.** Models as FBX. Textures as PNG (TGA where an alpha channel
matters), EXR for sky and lighting images. Original source files are kept, never
only the export.

**Naming.** `[category]_[name]_[variant]_[size].[ext]`, lower case, for example
`env_boulder_a_2k.png`, `ore_amber_t3_1k.png`, `crea_burrower_idle.fbx`.
Categories: `env`, `ore`, `crea`, `char`, `prop`, `ui`, `vfx`. This applies to
art files only; code keeps the PascalCase rule in `project.yaml`.

**Texture tiers (the art ideal).**

| Tier | Used for | Ideal size |
|---|---|---|
| Surface | Large tiling rock walls and ground | 4K (see the decision below) |
| Hero | Hands, drill, ore, creatures | 2K |
| Prop | Furniture, small boulders, ship details | 1K |
| UI | Icons and HUD | Vector or one shared atlas |

**Texture sets.** Colour, normal and one packed mask per material. Rock
roughness stays high (matte, Section 6); only ore materials may be smooth.

**Levels of detail.** Three levels for creatures, boulders and the ship.
Silhouette is kept at every level (Sections 3 and 5). Ore keeps its facets at
every level, because facets are how it is read.

**Export.** One unit is one metre. Pivot at the base for anything that stands on
the ground. One material per mesh where the look allows.

### Technical view

**Budgets the project states** (`.claude/docs/technical-preferences.md`;
`project.yaml` has no `performance` block):

- 60 fps, a 16.6 ms frame.
- 2,000 draw calls per frame, recorded there as "a starting guess, not
  measured".
- **No memory ceiling is set. No triangle budget is set for any asset category.
  No particle or overdraw budget is set.**

This section therefore gives no triangle counts and no texture memory limit.
They are to be set by measuring the first test asteroid on the development PC,
then written here.

**Constraints that follow from what is stated.**

- **Draw calls.** One material per mesh, shared materials across rocks, and a
  shared UI atlas all serve the 2,000 budget. Trade-off: merging many rocks into
  one mesh cuts draw calls but stops the engine skipping the ones out of view.
- **Batching.** `docs/engine-reference/unity/modules/rendering.md` lists the SRP
  Batcher and GPU Resident Drawer for cutting draw calls. Keeping to the
  standard URP lit materials, instead of a custom shader per asset, is what lets
  them work. The exact conditions are unverified against Unity's documentation
  for this version.
- **Shadows and lights.** The template's sun casts real-time shadows to 50 m.
  The helmet lamp (Section 2) would be a second shadow-casting light, and the
  per-tier dimming is a lighting change at runtime. Both costs are unmeasured.
- **Glow.** Magenta points and the pack glow rely on bloom, which the template
  already has on.
- **Unverified, not covered by the engine reference:** texture compression
  formats for Windows, the URP mask-map channel layout, and LOD group settings.

### Conflict and decision

The art view wants 4K tiling rock: the player stands nose-to-rock while
drilling, and the approved source textures are at least that large. The
technical view can neither approve nor refuse it, because there is no memory
ceiling to measure against, and 4K surfaces are the largest single memory cost
in the game.

**Decided by the designer (2026-11-26):** record both. 4K is the ideal and 2K is
the fallback for rock surfaces. Rock is authored at 4K so nothing is lost, and
the shipped size is chosen once the first test asteroid has been measured.

## 9. Reference Direction

Five references, each covering one thing the others do not. The first two are
the designer's; the other three were proposed by the art director and approved.
All five are described from memory and were not checked against the games.

**1. Astroneer (designer's reference): the sky and daylight.**
- Take: the soft gradient sky and the bright, unthreatening daylight on an alien
  surface, for the landing area (Section 2).
- Avoid: its flat-shaded low-poly terrain and its saturated ground. Our rock
  stays textured and at or below 20% saturation.
- Why: it shows that space can read as friendly without promising safety
  (Pillar 3).

**2. Escape from Tarkov (designer's reference): the Hideout.**
- Take: a bare shelter that becomes visibly lit and furnished as loot is put
  into it, for home (Section 1 principle 3, Section 6).
- Avoid: its grimy photoreal surfaces, dense clutter and grid-inventory screens.
  Our wealth is a coloured object on a shelf.
- Why: loss only weighs something if the stash is a place.
- Unsure: that the Hideout upgrades visibly is confident; how much of it is
  walkable is not.

**3. Mirror's Edge (2008): saturation as a reserved resource.**
- Take: a near-neutral world where one strong colour is spent on a single class
  of object, for ore (Section 1 principle 1, Section 4).
- Avoid: there, colour is a navigation aid on glossy white architecture. Ours is
  the material of the reward itself, on warm matte stone.
- Why: it shows that a quiet world makes a small amount of colour readable at
  distance.

**4. The Witness: real light on simplified forms.**
- Take: large clean shapes with no fine noise, lit by a convincing sun and soft
  bounce, for rock (Section 6).
- Avoid: its saturated-everywhere palette and near-textureless surfaces. Our
  stone keeps cracks and strata.
- Why: it is the closest precedent for "stylised realism" that is not low-poly.
- Unsure: the look is confident; how its lighting was produced is not.

**5. Superhot: one colour means threat.**
- Take: enemies own a single hue that nothing else in the world uses, for
  magenta (Sections 4 and 5).
- Avoid: its enemies are fully coloured and faceted. Ours carry magenta only as
  small glowing points on matte bodies, because facets belong to ore.
- Why: a colour with one meaning can be read in peripheral vision (Pillar 2).

**What none of them do.** Star Haul is a soft, sunlit, stone-coloured world
where the only strong colour is the cargo. That colour travels with the player,
on their back and then onto their shelves.
