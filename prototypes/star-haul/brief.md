# Game Brief: Star Haul

## In your words
"i want a first person colorful space world with farming, crafting and building houses, taking a spaceship to various moons planets and asteroids for various activities such as moons are thievery runs like the game "thief" and planets are bigger maps with mostly melee weapons in an extraction mode with bosses and asteroids can be for mining runs heavy with crafting materials. i want it to be possible to stay on your home planet or home space station the whole game just crafting and farming but encouraged to venture to the planets higher risk higher reward"

1. Danger: "oxygen running out and creatures in the rock"
2. Death: "you lose the pack and the tool"
3. Asteroid: "whichever would be easier to make while focusing on a good quality map design"
4. How hard: "mostly safe spawn then consistent threat afterwards"
5. Goal: "both"
6. Slice or test: "usual"

After play: "i dont want it so low-poly"
After play: "i was thinking a realistic style but that may be too difficult so why not show me some pictures of ideas for the graphics"
After play: picked "B. Stylised realism" from three pictures
After play: "show me only free options"
After play: "i dont like these: Stylized desert stones (OpenGameArt), Lowpoly crystals (OpenGameArt), Alien Bug Animated (OpenGameArt), Sci-Fi Free Transport 3 Set (Fab). use everything else"
After play: "i dont like the look of the home room which pack was used for that?"
After play: "take the kenney kit out and rebuild the home room with the modular space kit"
After play: "then add these: Quaternius Ultimate Monsters, Elijah Cobden rock pack (itch.io)"
After play: picked "Squidle and Mushnub" for the Burrower and the Spitter
After play: "enemies should not just be sitting t-posing waiting to be activated"
After play: "and the enemies that pop up the longer you are on the asteroid should be more dangerous"
After play: "i dont like that the rocks spin when you mine them they could just vibrate"
After play: "find a model for the drill"
After play: "find new more realistic models for the home and ship"
After play: "the game looks absolutely horrible and the sounds are too arcadey"
After play: "everything in the home looks cheap and hastily put together", and the creatures
After play: picked "Tense and atmospheric" for the sounds
After play: picked "Pivot it"
After play: "the home stays but your home is on a planet in a small valley where you can freely build foundations, walls, floors, ceilings, roofs, stairs and other building parts as well as building your basic workbenches. findable in the valley is only rocks and sticks to build the basic house parts and workbenches to prepare for storms and craft basic weapons/drill for runs to the asteroids,planets,moons"
After play: a storm that hits an unprepared home: picked "It damages or destroys what I built"
After play: the stash in a storm: picked "Safe only if sheltered"
After play: how storms arrive: picked "Forecast, with time to prepare"
After play: weapons in the first game: picked "Not in the first game"
After play: where the valley home belongs: picked "In the first game, replacing the home room"
After play: asked whether "one more seam or leave now" felt tense, after a few minutes of play: "No, not really"
After play: asked whether unpacking at home made them want to go straight back out: "Yes, and I wanted to go again"

**Pitch:** Mine a bright little asteroid in first person, fill your pack while your oxygen drains and the rock wakes up, and get back to your ship before you lose it all.

**Genre:** First-person extraction mining (extraction leads what is kept or lost, the exit and the stash; mining leads the dig and the haul)

**Controls:** WASD to move, mouse to look, hold left click to mine, E to pick up and use, Shift to sprint (burns oxygen faster), Tab for the pack *(guessed)*

**Question:** Is "one more seam or leave now" tense on a 10 to 15 minute run, and is unpacking at home satisfying enough to go straight back out?

**Hooks:** Your pack's worth is on screen and climbing; the ore is the only vivid colour in a pastel world; everything you carry, tool included, is gone if you don't make it back.

**Intent:** *payoff builds* (from the concept, design/gdd/game-concept.md)

## Look and references
- Look: Stylised realism. Smooth, rounded, textured rock in natural stone colours with a soft pastel cast, real sunlight and shadows, under a soft coloured sky; not low-poly. Ore is the only faceted, glossy, fully saturated thing, and richer ore is more saturated. Hot magenta means danger and nothing else: the creatures, and your oxygen gauge when low. Signature detail: your pack glows brighter as it fills. Every figure drawn, no emoji, no plain circles.
- References: Astroneer (a colourful, friendly space mood; not its look), Escape from Tarkov (the haul and the loss).
- Models: free CC0 packs (assets/provenance.yaml): Poly Haven's Boulder 01 and two rock surfaces, OpenGameArt's Handpainted style rocks and Lowpoly crystals pack, Poly Haven's workshop models and surfaces for the home room and its Drill 01 for the drill. Elijah Cobden's Stylized Rock Pack (CC-BY: credit required) for every other boulder. Quaternius's Squidle and Mushnub Evolved (CC-BY in the supplied file: credit required) for the Burrower and the Spitter. The ship, drill and home furniture are the game's own shapes.
- View: 3D · Camera: first person.

## First minute
You step out of your ship onto a sunlit pastel asteroid, drill in hand, oxygen full. A glossy blue seam glints a few steps away. You hold the drill on it, the rock cracks in stages, ore pops out and flies into your pack, and the pack's worth ticks up for the first time. A second seam glints further in, past the edge of the safe landing area, where the rock is darker and something magenta stirs.

## Challenge
The landing area is safe. Beyond it the threat is constant: oxygen drains the whole run, and creatures wander the rock and come for you when they hear drilling or see you, so the richest seams, deepest in, are the most dangerous to work. The longer you stay, the worse it gets: from about two and a half minutes in, a hunter rises behind you every minute or so, each one faster and harder-hitting than the last. Running out of oxygen or being killed loses the pack and the tool; you start the next run with a basic drill. Later, a better drill opens harder rock deeper in.

## Core loop
- Mine a seam: the rock cracks, ore flies into the pack, its worth climbs, and the noise may wake what sleeps nearby.
- Decide: go deeper for richer ore with less oxygen, or walk back to the ship.
- Reach the ship and fly home: the pack empties into the stash one ore at a time, the total counting up.
- At the bench, craft better gear from ore, then go out again. Die, and the pack and tool are gone.

## Goal & fail state
- Goal: bring home enough ore to craft the better drill, which cuts rock the basic one can't; after that, see how rich you can get (best haul and stash total kept).
- Fail: oxygen hits zero or a creature kills you. The pack and tool are lost; the stash is safe.

## Features
- [x] First-person mining: rock cracks in stages, ore flies to the pack
- [x] One hand-made asteroid: a safe landing area, three zones of rising richness and danger *(provisional)*
- [x] Oxygen that drains all run and faster when sprinting
- [x] Creatures that wander the rock and notice you by noise or sight, 2 kinds
- [x] Hunters: tougher creatures that rise the longer you stay, each tier faster and harder-hitting
- [x] A limited pack with its worth on screen
- [ ] The ship as the exit; death loses pack and tool
- [ ] Home: a saved stash and one crafting bench with the better drill (thin stand-in)
- [ ] Home valley: a small valley on a planet; gather rocks and sticks; build freely (foundations, walls, floors, ceilings, roofs, stairs) and set up basic workbenches
- [ ] Storms: always forecast with time to prepare; they damage or destroy what is not built for them; the stash is safe only when sheltered

## Your systems
- mining runs · in the slice
- crafting · thin stand-in *(guessed)*
- home valley on a planet (was: home space station) · the designer's pivot, not built yet
- taking a spaceship · thin stand-in *(guessed)*
- farming · later
- building houses · in the first game (the designer's pivot), not built yet
- moon thievery runs · later
- planet melee extraction with bosses · later

## Keep
-

## Avoid
- "so low-poly"
- Stylized desert stones, Lowpoly crystals (the single-pack one), Alien Bug Animated, Sci-Fi Free Transport 3 Set: "i dont like these"
- Enemies "just sitting t-posing waiting to be activated"
- Ore that spins when mined: "they could just vibrate"
- Kenney's Space Station Kit in the home room: "i dont like the look of the home room"
- Player-versus-player; busywork upkeep at home (nothing decays by itself, nothing comes due; forecast storms are the one threat); a fixed story campaign; timers that force a run (from the concept's anti-pillars, as revised 2026-11-26)
- A home that "looks cheap and hastily put together"
- Sounds that are "too arcadey"

## Out of scope
- Online co-op: needs a server, so not built; this build is solo
- Farming: add it as a feature
- Weapons: not in the first game
- Moon heists, planet melee runs and bosses: grow it
- A flyable ship and destination map: grow it
- More asteroids, more tool and gear tiers: grow it
- A grid pack where items fit by shape, gear that wears down: change it after play

## Build order
1. The slice: one asteroid run from landing to the ship, with oxygen, creatures and loss, then home to unpack and craft the better drill.
2. Tune the hazard and the walk back until leaving is a real decision.

---
**Kill condition:** if leaving the asteroid never feels like a hard choice after two tuning rounds *(guessed)*

**Who it's for / what they feel:** Achievers who love extraction games; the thrill of getting out with a good haul.

**Games you love / don't:** Love Tarkov (extreme depth), Dark and Darker (depth, good melee), Astroneer (colourful space look); don't love Sid Meier's Civilization.
