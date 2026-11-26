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

**Pitch:** Mine a bright little asteroid in first person, fill your pack while your oxygen drains and the rock wakes up, and get back to your ship before you lose it all.

**Genre:** First-person extraction mining (extraction leads what is kept or lost, the exit and the stash; mining leads the dig and the haul)

**Controls:** WASD to move, mouse to look, hold left click to mine, E to pick up and use, Shift to sprint (burns oxygen faster), Tab for the pack *(guessed)*

**Question:** Is "one more seam or leave now" tense on a 10 to 15 minute run, and is unpacking at home satisfying enough to go straight back out?

**Hooks:** Your pack's worth is on screen and climbing; the ore is the only vivid colour in a pastel world; everything you carry, tool included, is gone if you don't make it back.

**Intent:** *payoff builds* (from the concept, design/gdd/game-concept.md)

## Look and references
- Look: Stylised realism. Smooth, rounded, textured rock in natural stone colours with a soft pastel cast, real sunlight and shadows, under a soft coloured sky; not low-poly. Ore is the only faceted, glossy, fully saturated thing, and richer ore is more saturated. Hot magenta means danger and nothing else: the creatures, and your oxygen gauge when low. Signature detail: your pack glows brighter as it fills. Every figure drawn, no emoji, no plain circles.
- References: Astroneer (a colourful, friendly space mood; not its look), Escape from Tarkov (the haul and the loss).
- Models: free CC0 packs (assets/provenance.yaml): Poly Haven's Boulder 01 and two rock surfaces, OpenGameArt's Handpainted style rocks and Lowpoly crystals pack, Kenney's Modular Space Kit for the home room's shell and hatch. Elijah Cobden's Stylized Rock Pack (CC-BY: credit required) for every other boulder. Quaternius's Squidle and Mushnub Evolved (CC-BY in the supplied file: credit required) for the Burrower and the Spitter. The ship, drill and home furniture are the game's own shapes.
- View: 3D · Camera: first person.

## First minute
You step out of your ship onto a sunlit pastel asteroid, drill in hand, oxygen full. A glossy blue seam glints a few steps away. You hold the drill on it, the rock cracks in stages, ore pops out and flies into your pack, and the pack's worth ticks up for the first time. A second seam glints further in, past the edge of the safe landing area, where the rock is darker and something magenta stirs.

## Challenge
The landing area is safe. Beyond it the threat is constant: oxygen drains the whole run, and creatures sleep in the rock and wake from mining noise near them, so the richest seams, deepest in, are the most dangerous to work. Running out of oxygen or being killed loses the pack and the tool; you start the next run with a basic drill. Later, a better drill opens harder rock deeper in.

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
- [ ] Creatures in the rock that wake from mining noise, 2 kinds *(guessed)*
- [x] A limited pack with its worth on screen
- [ ] The ship as the exit; death loses pack and tool
- [ ] Home: a saved stash and one crafting bench with the better drill (thin stand-in)

## Your systems
- mining runs · in the slice
- crafting · thin stand-in *(guessed)*
- home space station · thin stand-in *(guessed)*
- taking a spaceship · thin stand-in *(guessed)*
- farming · later
- building houses · later
- moon thievery runs · later
- planet melee extraction with bosses · later

## Keep
-

## Avoid
- "so low-poly"
- Stylized desert stones, Lowpoly crystals (the single-pack one), Alien Bug Animated, Sci-Fi Free Transport 3 Set: "i dont like these"
- Kenney's Space Station Kit in the home room: "i dont like the look of the home room"
- Player-versus-player; mandatory home chores; a fixed story campaign; timers that force a run (from the concept's anti-pillars)

## Out of scope
- Online co-op: needs a server, so not built; this build is solo
- Farming, house building: add it as a feature
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
