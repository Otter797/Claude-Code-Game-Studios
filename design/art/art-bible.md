# Art Bible: Star Haul

> **Status**: Draft
> **Owned By**: art-director
> **Last Updated**: 2026-11-27
> **Art Director Sign-Off (AD-ART-BIBLE)**: REVISED 2026-11-27 — after the valley and storm rework the verdict was CONCERNS (Sections 2–8). All six findings were revised: indoor light during storms (2), a storm sound cue (4, 7), the stash sitting under a building's roof (3, 6), damage looks for run-material pieces (3, 8), a standard for haul on display (8), and minor fixes. The Section 8 budgets stay open until the first test asteroid and a test valley are measured.

`/art-bible` writes these nine sections in this order and replaces each
section's `[To be designed]` line as that section is approved. A section still
holding its placeholder is incomplete; a later run fills only those.

## 1. Visual Identity Statement

**Direction: Cargo Is the Colour**

This section is the current word on the look and takes precedence over the
"Visual Identity Anchor" in `design/gdd/game-concept.md`. That anchor originally
described a flat-shaded low-poly world; it was updated on 2026-11-26 to match
and now points here. The rule and its first two principles are unchanged;
principle 3 was restated on 2026-11-27 for the valley home, and storms were
added to principle 2. The look is stylised realism, chosen by the designer after
playing the prototype.

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
creatures, the oxygen gauge when it runs low, and the storm warning. A colour
with a single meaning can be read in the corner of the eye, which is what makes
danger scoutable. A storm is a threat, but it is weather: its warning icon is
magenta, its sky is not. The storm itself is shown by light, value and weather:
the sky darkens, cools and greys, and wind and rain arrive. Serves **Pillar 2,
Risk is a choice**.
*Design test:* when the colour of a gem, a flower, a light or a UI accent is
ambiguous, this principle says choose any hue except magenta.

**3. Home brightens with wealth.** The valley home starts as plain as the valley
around it: a rock-and-stick shelter in the same stone and wood the player
gathered there. It becomes the most colourful place in the game as the haul
comes home. Pieces built from run materials are cleaner, straighter and carry
the hue of what they were made from. Haul on display and the stash the player
places hold the strongest colour. Serves **Pillar 5, Home is the scoreboard**.
*Design test:* when it is ambiguous whether to show wealth as a number or as an
object, this principle says choose the built or displayed object the player can
walk through.

### What "stylised realism" means here

Light and surface are realistic. Shape and colour are stylised. Realistic means
a real sun, cast shadows, and textured rock in natural stone colours that reads
as stone when the player stands next to it. Stylised means simplified, rounded
forms with no fine clutter, a soft pastel cast over those stone colours, a soft
coloured sky, and brightness that comes from light and value instead of strong
colour. The valley follows the same rule: its ground, grass, trees, loose rock
and sticks are matte, natural and simplified, and built pieces grow cleaner and
straighter as their tier rises. This is not photorealism: no scanned grit, no
dirt passes, no noisy detail competing with the ore. It is not low-poly
either: silhouettes are
smooth, surfaces are textured, and facets are reserved for ore alone. The
friendly look carries no promise of safety, which is **Pillar 3, Bright world,
real stakes**.

## 2. Mood & Atmosphere

Mood is carried by light and value, never by environment chroma (Section 1).
Rock stays at or below 20% saturation in every state. Grass and leaves stay at
or below 25%, in an olive hue far from teal (Section 4). Weather can lower
environment saturation but never raise it.

| State | Emotional target | Lighting | Descriptors | Energy | Mood carrier |
|---|---|---|---|---|---|
| Landing area | Safe, unhurried optimism | Warm high sun, cool sky fill, high-key, soft contrast | Open, airy, sunlit, still | Low | Ship hull lit cream; long clear sightlines |
| Working a seam (mid zones) | Greedy focus with one ear open | Sun shafts through openings, cooler fill, medium contrast | Dappled, hushed, dusty, enclosed | Medium | Ore glints in shafts; pack glow starting |
| Deep zone | Tempted dread | No sun; dim cool ambient, warm helmet lamp, highest contrast | Dark, close, cold, glittering | Medium, taut | Richest ore is the only colour in the dark |
| Hunted / escalation | Rising alarm, "we stayed too long" | Fill dims and cools one step per hunter tier; shadows deepen | Thinning, exposed, urgent, watched | High | Magenta eye-points moving in the dark |
| Run back / extraction | Desperate hope, then release | Travelling from cool dark towards warm light; sun floods on lift-off | Uphill, breathless, brightening | Peak, then drop | Cream ship beacon ahead; pack at full glow |
| Death | Blunt loss, no softening (Pillar 3) | Colour drains to grey value in about a second | Abrupt, silent, flat, cold | Zero | Dropped pack is the last colour, then goes out |
| Valley calm (building, gathering) | Earned pride, unhurried making | Warm high sun (about 5000K), cool sky fill, high-key, low contrast | Open, green, sheltered, growing | Low | Haul and ore trim are the only strong colour in a muted green valley |
| Storm on the way | Purposeful hurry: "time to prepare" | Sun still up but dimming as a cloud bank rises over the valley rim; contrast softening | Wind rising, swaying, darkening edge, busy | Medium | Grey cloud wall on one horizon; wind in grass and trees |
| Storm | Holding on; the home under test | No sun. Dim, cool, flat overcast key (about 7500K), low value, low contrast | Grey, wet, loud, battered | High | Under the roof, an interior fill keeps the stash and haul in calm-valley colour while everything outside greys |
| Aftermath | Relief, or the sting of what fell (Pillar 3) | Sun returns, clear and slightly cooler than calm; medium contrast | Washed, still, clear, scarred | Low to medium | Broken and fallen pieces read by shape (Section 3); what survived stands out against the clear sky |
| Menus | Quiet anticipation | The valley's current lighting, slightly dimmed | Calm, clear, sparse | Lowest | The player's own home and stash in the valley, from a fixed view, in its live state: damage and an approaching storm show |

**Rationale.** The run is a trip from warm to cool and back, so depth is felt
without a map (Pillar 2). Escalation changes light quantity, not hue, so magenta
stays the only danger signal. Death removes colour because colour is cargo, and
the cargo is gone. Storms follow the same law: weather changes light, value and
motion, not hue. Magenta appears only on the storm warning icon. When the
warning comes during a run, it is UI only (Section 7). The asteroid's light does
not change, because light changes on the asteroid already mean depth and hunter
escalation.

**Notes.**
- The deep zone's helmet lamp is new to the design with this section; the brief
  and the prototype have no lamp.
- Dimming the fill light per hunter tier is subject to a performance check at
  60 fps (technical-artist). If it fails, escalation keeps its other carriers:
  deepening shadows and the magenta eye-points.
- Storm weather (rain, wind sway on grass and trees, the sky and light blend)
  needs a performance check at 60 fps (technical-artist). If it fails, the storm
  keeps its light and value change and drops rain density first.
- The storm's grey comes from the sky, fog and light, not from a full-screen
  colour grade. Under a roof, interior fill (light probes, or a local volume per
  enclosed space) keeps the stash and haul at about calm-valley value and full
  colour, so stepping inside reads as stepping out of the storm. Cost to be
  checked at 60 fps (technical-artist).
- The valley has no day/night cycle for now (designer, 2026-11-27), so the
  valley rows assume daylight. The old home's "evening, warm lamps" feel is not
  carried over. If a cycle is added later, evening lamps can return as a
  buildable light piece in Beacon Cream.

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
- **The valley** is world: rounded hills, rounded tree canopies on simple
  trunks, grass as soft clumps rather than single blades, round loose rocks, and
  sticks as plain natural lines. No spikes anywhere in nature, because spike is
  threat.
- **Built pieces** are ours: straight. Tier reads by edge quality.
  Rock-and-stick pieces fit the grid's straight outline but are rough inside it:
  uneven stacked stone, lashed sticks, a slight lean, visible bindings. They are
  made by hand from the valley. Run-material pieces have true straight edges,
  clean right angles and a small bevel, and their ore trim follows those lines
  (Section 1, principle 3).
- **Storm damage changes silhouette**, so the state of the home reads by shape,
  with no colour. After one unrepaired storm, a rock-and-stick piece shows
  chipped edges, a missing stick or stone, and a lean. After the second it falls
  and leaves a low rounded rubble mound, which is world shape again.
  Run-material pieces resist storms (the design says they need little or no
  repair), but when damaged they use the same shape language: chipped edges and
  scraped trim, then the same rubble mound. How often that happens is for the
  Storms design doc. A
  hammer repair restores the straight outline. The number of damage stages
  follows the current rule (falls after 2 unrepaired storms); if storm strength
  varies (open question), the stages may change, but damage still reads by
  shape.
- **The ship** owns the only long straight lines and right angles on the asteroid, so
  the exit reads from any distance (Pillar 2).
- **UI**: rounded rectangles and circles; oxygen is a ring, the pack a filling
  box. Triangles and chevrons appear only on warnings.
- **Hero versus supporting**: ore, creatures, ship and packs are hero shapes
  with a crisp outline against the rock. Rock is supporting: low-contrast,
  broad, quiet. At home, the haul on display and the stash are the heroes. The
  stash piece is the strongest built silhouette and the easiest to read: a clear
  box form. It has no roof of its own; it is safe when it sits under a
  building's roof, and that roof should be visible from outside. Workbenches, furniture
  and structure are supporting: plain, broad and quiet (Pillar 5).

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
| Meadow Sage | `#A0B286` | Grass and leaves: living world. Hue about 85°, saturation 25%, value 70% |
| Stick Wood | `#8C7969` | Trunks, sticks and rock-and-stick pieces: hand-made from the valley. Hue about 28°, saturation 25%, value 55% |

The last two were added on 2026-11-27 for the valley. Both sit at half of tier-1
ore saturation (about 50%). Meadow Sage's hue is about 87° from teal ore (about
172°); Stick Wood is 30 value points below tier-1 amber (85%). There is no storm
swatch: a storm is a lighting state, not a material, so it reuses Deep Slate and
Haze Sky, dimmed. Nine swatches is above the usual five to seven; the two
valley swatches are kept because the valley is a second place with its own
ground.

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
- **Storm warning**: a magenta icon only, on the forecast and the on-the-way
  notification. Never in the sky, clouds, lightning or rain.
- **Built-piece trim**: pieces made from run materials carry their ore's hue as
  trim or inlay only. Trim saturation is at or below 35%, against tier-1 ore at
  about 50%. Trim is matte, has no facets, no glint and no emission, and covers
  no more than about a fifth of a piece's visible face. Examples: amber trim
  `#BFA87C`, teal trim `#74B2AA`. The base of a run-material piece stays within
  the neutral caps (20% or below). If teal turns out to be worth more than amber
  (open question above), trim hue becomes a value signal too.
- **Valley nature**: grass and leaves at or below 25% saturation, olive hue (no
  closer to teal than about 100°). Wood at or below 25%.

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
| Valley, calm | Warm sun, about 5000K | Cool sky | Warmest daylight in the game |
| Valley, storm | Overcast, about 7500K, dim | Grey, flat | Cool dominant |

Home is no longer "warmest in the game" by lamp light. It is the warmest
daylight (about 5000K against the landing area's 5500K), and its warmth
otherwise comes from haul colour (Section 1, principle 3).

### UI palette

Cream text on a near-black slate panel (`#1E2029`, UI only, needed for contrast
over the bright landing area). Amber only for haul and pack value; magenta only
for warnings; teal never used as UI chrome. UI colour is flat, with no gloss,
because gloss belongs to ore.

Storm forecast: cream text and countdown on the slate panel. The icon turns
magenta only when a storm is on the way; while it is far off, it stays cream.
Strength is shown by a count of filled cream segments or pips, never by how
intense the magenta is. The same readout is used at home, before launch and
during a run. Two things are not settled here: the number of pips depends on
the open storm-strength decision, and the point at which a storm counts as "on
the way" belongs to the Storms design doc.

### Colourblind risks and backups

| Pair | Likely fails for | Backup cue |
|---|---|---|
| Magenta threat vs teal ore | Red-green (both shift towards blue-grey) | Motion: threat pulses and moves, ore is static. Shape: soft glow point vs hard facet cluster |
| Magenta threat vs amber ore | Blue-yellow (both shift towards red-pink) | Same motion and shape cues; creature sound cue (audio-director) |
| Oxygen blue to magenta | Red-green | Ring breaks into segments and pulses; warning triangle icon; sound cue (audio-director) |
| Ore tiers by saturation | Low-saturation vision, full colour blindness | Facet count and cluster size rise with tier; brighter glint |
| Hunter tier | Any | Spine count and body size |
| Low-tier amber ore vs cream light | Low-saturation vision, full colour blindness, warm lamp light | Ore: hard facets and glint, casts no light. Cream: soft edge, lights its surroundings, straight-edged source |
| Storm warning icon vs amber haul readout | Blue-yellow | Shape: the warning uses the triangle or chevron (warnings only, Section 3) plus a storm glyph. Strength is shown by pip count; storm sound cue when the warning appears (audio-director) |
| Meadow Sage grass vs teal ore | Red-green (both drift towards grey-yellow or grey-blue) | Saturation gap (25% vs 50% or more); ore is faceted with a glint, grass is matte and moves in the wind |
| Built-piece trim vs ore of the same hue | All types, and normal vision too (same hue by design) | Trim is matte, flat and runs as straight bands on made pieces; ore is faceted, glossy and set in rock cracks. Saturation gap 35% vs 50% or more |
| Stick Wood vs tier-1 amber ore | Red-green (both read brown-yellow) | Value gap (55% vs 85%); wood is matte, ore glints |

## 5. Character Design Direction

### The player

The game is first person, so the player's own character is hands, the tool in
them (the drill on a run, the hammer at home) and a helmet lamp. Teammates
see a rounded, matte suit in stone-neutral tones with cream trim, and the square pack on the back. Cream is "ours" (Section 4), so
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

In the valley there are no creatures. A teammate (co-op, later) reads against
grass and built pieces the same way as against rock: by the straight-edged pack
and its glow, never by a new hue.

### Detail at distance

Encounters happen from about 2 to 30 metres. The silhouette, the magenta points
and a hunter's spine count must survive at 30 metres. Skin texture and small
surface detail may drop away beyond about 15 metres. Hands and whatever tool
they hold (drill or hammer) are always next to the camera and get the most
detail in the game. The 15 m and 30 m figures are working numbers for art,
not yet measured against a built map.

## 6. Environment Design Language

### Two kinds of place, one rule

The asteroid is natural: nobody built it, so it has no architecture, only rock.
The valley is natural too: hills, trees, grass and loose rock, with nothing
built in it until the player builds it. Everything people made is the ship and
the home the player builds: straight-edged and "ours". There is no pre-made
architecture and no lost civilisation in the valley. The home's story is the
player's own, from a lashed rock-and-stick shelter to clean, trimmed pieces
built from the haul (Section 1, principle 3; Section 3). Shape tells the player
which they are looking at (Section 3: round is world, straight is ours), so the
exit and home never need a sign. Serves **Pillar 2** and **Pillar 5**.

**Open (designer):** where a run starts from in the valley is not designed. If
the ship sits in the valley, it is the one pre-made straight thing there and
carries its cream beacon. If runs launch from something the player builds, or
from a menu, the ship is not in the valley. The ship is left out of the valley
until this is decided.

### Texture philosophy: real light on simplified surfaces

Rock uses physically based materials with real texture maps, so it responds to
the sun and to shadow like stone. The stylising is in what is kept:

- Broad, low-frequency detail stays: cracks, strata, big chips.
- Fine noise goes: no grit, speckle or dirt passes.
- Rock is always matte. Nothing in the environment has a sharp highlight,
  because a glint is how the player finds ore.
- The pastel cast comes from a light tint on the stone colours and from grading,
  with rock at or below 20% saturation (Section 2).

The valley uses the same physically based, matte, low-frequency approach.
Ground and bark keep broad detail (roots, strata, bark ridges) and lose fine
noise. Grass is soft clumps in Meadow Sage that move in the wind, not single
blades. Rock-and-stick pieces use the same stone and Stick Wood materials as the
valley, so they visibly come from it. Run-material pieces have cleaner, even
surfaces, still matte, with flat trim (Section 4). Nothing built is glossy:
gloss belongs to ore.

*Design test:* when a rock material looks more convincing with extra shine or
grime, leave it out. Convincing is not the goal; making the ore the only thing
that sparkles is.

### Prop density by area

| Area | Density | Why |
|---|---|---|
| Landing area | Sparse; long open sightlines | Safety should feel like being able to see everything |
| Mid zones | Medium; large boulders that break sightlines | Cover for the player and hiding room for creatures, so scouting matters |
| Deep zone | Tight walls and low ceilings, very few props | Pressure comes from the space; the ore is the only decoration |
| Valley, wild | Trees on the slopes and rim, open grassy floor; loose rocks and fallen sticks scattered within reach of the building ground | The gatherables are the only props; open ground invites building |
| Valley, home | Starts empty: only what the player builds | It fills with what the player builds and brings back, never with pre-placed colourful props |

*Design test:* when an area feels empty and it is tempting to add props, add a
boulder or a sightline break, never small clutter (gatherable rocks and sticks
are exempt: they are pickups, not clutter).

The prototype's furnished workshop does not carry over: the home is now built by
the player, piece by piece. Furniture and workbenches are pieces the player
places, plain and uncoloured until made from run materials (Section 4,
built-piece trim). Shelves are placed pieces whose stored haul sits on them in
plain view; they are where the haul is displayed (Section 1, principle 3). A
shelf follows the same shelter rule as the stash.

### Environmental storytelling

- Darker rock means richer and riskier, everywhere, with no exceptions.
- Ground a Burrower uses shows claw scoring and burrow mouths.
- Spitter perches show matte, dark stains on the rock below. Never magenta:
  magenta is for the living threat only.
- The ship's cream beacon is visible from the entrance of every zone, so the way
  out is always known.
- A mined seam stays as an empty, cracked socket, so players can read where they
  and others have been.
- A storm's mark stays until repaired: chipped, leaning and fallen pieces
  (Section 3), and rubble where a piece fell. One hammer repair clears it.
- Gatherable rocks and sticks look like the rest of the valley's rocks and
  sticks; the cream interactable rim (Section 4) is what marks them as usable,
  not a different colour or shape.
- Whether the stash is under a roof can be seen from outside, so "is it safe?"
  can be answered by walking around the home.

### Reading against each other

The rock is deliberately the quietest thing on screen: broad, low-contrast,
matte. That is what lets a creature's silhouette (Section 5), a seam's facets
and a teammate's pack stand out against it.

In the valley, grass and ground play the rock's part: quiet, matte, low
saturation, so built pieces, trim and haul stand out, and a storm greys the wild
valley while sheltered loot keeps its colour.

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
- **Storm forecast**: small, top centre, for the whole run (decision below): the
  storm icon, a countdown and the strength pips (Section 4), in cream. When a
  storm is on the way, the icon turns magenta and changes to the warning
  triangle, the words "Storm on the way" slide in beside it for a few seconds,
  and the readout then stays in its on-the-way form until the run ends. It is
  the only HUD element at the top of the screen, so it reads as news from home,
  not part of the run. A sound cue plays as the words slide in (audio-director),
  so the warning is not carried by sight alone.

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

- **Fit.** Four small elements suit a game of deliberate movement and quick
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

A second conflict came with the valley home (2026-11-27). The art view wanted
the storm readout on the run HUD only once a storm is on the way, so the run
screen stays at three elements and feels like it is about the asteroid. The UX
view objected: the storm clock competes with "one more seam" (Pillar 1), and
making the player wait for a notification to learn how long the home has is the
same problem the always-visible oxygen ring solves (Pillar 2).

**Decided by the designer (2026-11-27):** the storm forecast is always visible
during a run, small and cream, and turns magenta only when a storm is on the
way.

### Home screens: art view

**Home is the display, the screen is the label.** The home the player built is
the scoreboard, not a list. A panel appears only when the player steps up to
something and uses it, or while building. Serves **Pillar 5**.

- **Forecast.** Always on screen at home, small, top centre: the storm icon
  (cream while far off, magenta and the warning triangle when on the way), a
  countdown and the strength pips. The sky (Section 2) says the same thing in
  the world.
- **Before launch.** The run's launch confirmation shows the forecast large, on
  the slate panel, before the player commits. Whether it also says "home ready /
  not ready" depends on how the Storms design doc defines a home that is ready.
- **Build menu.** A slim bar of piece icons at the bottom (flat outline icons, as
  above), each with its material cost. The piece being placed is a ghost in the
  world: a cream outline over a faint cream fill when it fits; a grey dashed
  outline with a cross when it does not. Red and magenta are never used for
  "can't place": magenta means threat and red is the ore keep-out band.
- **Unpacking.** The pack empties into the stash piece one ore at a time. One
  number, the stash total, counts up on the slate panel in the same fixed-width
  digits as the run, with the same small pop per ore. This is the payoff of the
  run, so nothing else is on screen while it plays.
- **Stash.** Opened by using the stash piece. A "Sheltered" or "Not sheltered"
  line at the top, then one row per ore: a flat outline icon, a tier mark, how
  many, and what they are worth.
- **Shelves.** Using a shelf opens the same rows as the stash, with the same
  "Sheltered" line; what it holds is shown physically on the shelf, not only in
  the panel.
- **Crafting bench.** One panel. Recipes on the left; on the right the chosen
  recipe, with each ore it needs as an icon and "have / need" numbers. The
  crafted item appears physically on the bench, not in a pop-up.
- **Repair.** Using the hammer shows one small panel: how many pieces are
  damaged and the material cost. One press repairs everything, and the pieces
  snap back to straight in the world (Section 3).
- **After a storm.** If anything was damaged, destroyed or lost, a plain
  statement says what, in grey, the way the death screen does. If the storm
  struck during a run, it is shown on return home.
- **Menus (title, pause, settings).** The slate panel over the live valley
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
- **Building.** Building is long, unhurried work; the build bar and ghost work
  with the keyboard alone (rotate and cycle keys shown), a gamepad later. The
  16 px floor holds on the forecast and the build bar.
- **Storm cues not by colour alone.** "Far off" versus "on the way" is shown by
  colour and by the icon changing to the warning triangle with the words "On
  the way". Strength is pips and a number. "Sheltered" is an icon plus a word.
  Can't-place is a dashed outline plus a cross.
- **No flashing.** The on-the-way notification pulses slowly, no faster than
  about twice a second, and only for its first few seconds.
- **Storm feedback.** The repair cost is shown before the press. The after-storm
  statement says exactly what was hit and why ("not under a roof", "fell after
  two storms").
- **The forecast before launch is required, not decoration.** The rule says the
  forecast is visible before a run is launched, so the launch confirmation
  cannot be skipped without having shown it.

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
Categories: `env`, `ore`, `crea`, `char`, `prop`, `ui`, `vfx`, `bld` (building
pieces) and `veg` (trees and grass). For `bld`, the variant carries tier and
damage stage, for example `bld_wall_rockstick_dmg1.fbx`,
`bld_wall_t2_amber_2k.png`; `veg_tree_a.fbx`. Storm weather uses `vfx`, for
example `vfx_rain_storm`. This applies to art files only; code keeps the
PascalCase rule in `project.yaml`.

**Texture tiers (the art ideal).**

| Tier | Used for | Ideal size |
|---|---|---|
| Surface | Large tiling rock walls and ground; valley ground | 4K (see the decisions below) |
| Hero | Hands, drill, hammer, ore, creatures | 2K |
| Building | Building pieces (walls, floors and roofs are large and seen close) | 2K, one shared set per tier |
| Prop | Small boulders, trees, ship details | 1K |
| UI | Icons and HUD | Vector or one shared atlas |

Grass uses one shared atlas. All rock-and-stick pieces share one texture set;
each run-material tier shares one set, with the trim painted into it, not as a
separate material.

**Damage stages.** Every piece type has three looks: intact, damaged and
fallen. Rock-and-stick pieces are damaged by chipping, a missing stick and a
lean; each run-material tier gets its own damaged look (chipped edges, scraped
trim). Fallen is one shared rubble mound for all, not one per piece. Cost: one
damaged mesh for each piece type in each tier. Silhouette changes are modelled, not painted
(Section 3).

**Displayed haul.** Shelves reuse the ore cluster meshes and ore materials at a
smaller scale; there are no new models or materials. Each shelf shows a fixed
number of slots (working number 8, to be confirmed by the Stash design doc).
Display items are GPU-instanced, kept out of the building-piece count, and
measured in the test valley alongside ADR-0003's 2,000 pieces.

**Texture sets.** Colour, normal and one packed mask per material. Rock
roughness stays high (matte, Section 6); only ore materials may be smooth.

**Levels of detail.** Three levels for creatures, boulders, the ship, building
pieces and trees. Silhouette is kept at every level (Sections 3 and 5). Ore
keeps its facets at every level, because facets are how it is read. Grass thins
out and fades with distance rather than switching models.

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
They are to be set by measuring on the development PC, then written here, at two
points: the first test asteroid, and a test valley with a large home (towards
the 2,000-piece design target in ADR-0003), its vegetation and a storm. The
asteroid measurement does not cover the valley.

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
- **The home's piece count.** ADR-0003's design target is 2,000 pieces. Drawn
  one by one, a full home alone would reach the 2,000 draw-call guess. The
  batching above (and GPU instancing, also listed in `rendering.md`) only helps
  if pieces share materials and stay on standard URP lit materials, which is
  why building pieces share one texture set per tier. Merging pieces into one
  mesh would cut draw calls further, but it fights per-piece damage and repair
  and stops the engine skipping pieces out of view. Unmeasured.
- **Damage variants.** Modelled damage looks roughly double the rock-and-stick
  tier's meshes and their memory, across up to 2,000 placed pieces. Checked in
  the valley measurement (decision below).
- **Vegetation.** Many trees and grass clumps, with wind movement. Unity's
  terrain, grass and wind tools are not covered by the engine reference, so
  nothing about them is asserted here.
- **Storm weather.** Rain particles and overdraw have no budget. `VERSION.md`'s
  Unity 6 summary lists VFX Graph in place of the legacy particle system; that
  is unverified for URP on this version. Changing the sun and shadows at runtime
  for the storm has an unmeasured cost (Section 2's performance note).
- **Unverified, not covered by the engine reference:** texture compression
  formats for Windows, the URP mask-map channel layout, LOD group settings, and
  terrain, grass and wind rendering.

### Conflict and decision

The art view wants 4K tiling rock: the player stands nose-to-rock while
drilling, and the approved source textures are at least that large. The
technical view can neither approve nor refuse it, because there is no memory
ceiling to measure against, and 4K surfaces are the largest single memory cost
in the game.

**Decided by the designer (2026-11-26):** record both. 4K is the ideal and 2K is
the fallback for rock surfaces. Rock is authored at 4K so nothing is lost, and
the shipped size is chosen once the first test asteroid has been measured.

Two more conflicts came with the valley home (2026-11-27).

The art view wants 4K valley ground, because the player builds on it and stands
close to it. The technical view cannot judge it, for the same reason as rock.
**Decided by the designer (2026-11-27):** the rock rule applies. Valley ground
is authored at 4K, and 4K or 2K is shipped once the test valley is measured.

The art view wants a modelled damaged look for every rock-and-stick piece type,
so damage reads by shape. The technical cost is roughly double that tier's
meshes and memory. The alternative was modelled damage for walls and roofs only,
with other pieces shown as a lean or tilt. **Decided by the designer
(2026-11-27):** modelled damage variants for every piece type, with one shared
rubble mound for fallen pieces; the cost is checked in the valley measurement.

## 9. Reference Direction

Six references, each covering one thing the others do not. The first two and
the sixth are the designer's. The other three were proposed by the art director
and approved. The guideline is three to five references. Six exceeds it by the
designer's choice, and none is dropped to fit. All six are described from
memory and were not checked against the games.

**1. Astroneer (designer's reference): sky, daylight and valley ground.**
- Take: the soft gradient sky and the bright, unthreatening daylight on an alien
  surface, for the landing area and valley calm (Section 2). Also its rolling
  ground forms and rounded plants, for the valley (Sections 3 and 6).
- Avoid: its flat-shaded low-poly terrain and its saturated ground and plants.
  Our rock stays textured and at or below 20% saturation. Grass and leaves stay
  olive and at or below 25%.
- Why: it shows that space can read as friendly without promising safety
  (Pillar 3). Its weather is not a reference here; the storm belongs to
  reference 6.

**2. Escape from Tarkov (designer's reference): the Hideout.**
- Take: one idea only. The home visibly upgrades with loot. For us, a bare
  shelter fills with haul shown physically on shelves. Shelves are placed
  pieces, and what they store sits on them where the player can see it
  (Section 1 principle 3, Section 6).
- Avoid: its grimy photoreal surfaces, dense clutter and grid-inventory screens.
  Our wealth is a coloured object on a shelf the player walks past, not a cell
  in a grid.
- Why: loss only weighs something if the stash is a place.
- Unsure: that the Hideout upgrades visibly is confident. How much of it is
  walkable is not. Showing stored loot on shelves is our own idea, not
  Tarkov's; as far as recalled, its stash is a grid screen.

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

**6. The Cycle: Frontier (designer's reference): the storm.**
- Take: a storm that is announced first and then seen arriving. The warning
  comes, then the sky on one horizon darkens, the light flattens, and wind and
  rain rise until the open ground feels hostile. This is for storm on the way
  and storm (Section 2). Our warning is a forecast readout that is always
  visible, also during a run, with magenta only on its icon (Section 7). The
  threat comes from the sky closing in, not from a colour.
- Avoid: its storm as a timer that forces players to leave or ends the session.
  Ours sets a deadline for preparing the home and never forces a run to end; a
  home that was ready at launch survives a normal-length run. Also avoid
  reading any storm damage to the player, such as lightning strikes, as visual
  direction: our storm tests the home, not the player. Avoid any coloured tint
  in its sky, clouds or light. Ours only darkens, cools and greys.
- Why: it shows that a storm can feel dangerous through light and weather alone,
  and that an early warning turns dread into preparation (Pillar 2).
- Unsure: from memory, not checked. Confident that storms were announced ahead
  with an on-screen warning and darkened the world. Not sure whether its storm
  sky had a coloured tint (possibly purple or blue), whether lightning hit
  players and how deadly it was, how far ahead the storm was announced, or
  whether it pushed players to evacuate. It may have changed between live
  seasons. Check against footage before storm effects are built.

**What none of them do.** Star Haul is a soft, sunlit, stone-coloured world, in
the asteroid and in the valley, where the only strong colour is the cargo. That
colour travels with the player, on their back and then onto the shelves of the
home they build.
