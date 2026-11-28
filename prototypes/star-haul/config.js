// PROTOTYPE - NOT FOR PRODUCTION
// Question: Is 'one more seam or leave now' tense on a 10 to 15 minute run, and is unpacking at home satisfying enough to go straight back out?
// Date: 2026-11-26
// Every tuning value lives here, each with value, min, max and step. The game reads them live
// through tune.<name> (index.html); the tweak panel, an add-on, writes them back here.
window.CONFIG = {
  seed: 1, // every gameplay random call reads rng(), seeded from this (or ?seed= in the address)
  volume: { value: 0.5, min: 0, max: 1, step: 0.05 },

  // ---- Moving ----
  walk_speed: { value: 3.8, min: 2, max: 8, step: 0.1 },          // m/s
  sprint_speed: { value: 6.2, min: 3, max: 12, step: 0.1 },       // m/s
  full_pack_slow: { value: 0.35, min: 0, max: 0.6, step: 0.05 },  // share of speed lost with a full pack (was 0.2; retest round 2)
  look_sens: { value: 0.0022, min: 0.0005, max: 0.006, step: 0.0001 }, // radians per mouse pixel
  key_turn: { value: 1.9, min: 0.5, max: 4, step: 0.1 },          // radians/s with the arrow keys

  // ---- Oxygen and health ----
  oxygen_seconds: { value: 420, min: 120, max: 1200, step: 10 },  // a full tank at a walk, in seconds (was 540; retest round 2)
  sprint_oxygen_mult: { value: 2.4, min: 1, max: 5, step: 0.1 },  // oxygen use while sprinting
  oxygen_low: { value: 0.3, min: 0.1, max: 0.6, step: 0.05 },     // gauge turns magenta below this share
  suffocate_dps: { value: 12, min: 2, max: 50, step: 1 },         // health lost per second at zero oxygen
  max_health: { value: 100, min: 20, max: 300, step: 5 },
  canister_refill: { value: 0.45, min: 0.1, max: 1, step: 0.05 }, // share of a tank one canister gives back
  canister_carry: { value: 2, min: 0, max: 5, step: 1 },          // canisters taken on a run at most

  // ---- Mining and the pack ----
  mine_range: { value: 3.6, min: 2, max: 8, step: 0.1 },          // m
  drill_power: { value: 1, min: 0.3, max: 4, step: 0.1 },         // basic drill: toughness cut per second
  drill2_power: { value: 2, min: 0.5, max: 6, step: 0.1 },        // better drill
  pack_slots: { value: 16, min: 4, max: 40, step: 1 },            // ore pieces the pack holds
  tough_glint: { value: 2.0, min: 0.5, max: 10, step: 0.1 },      // seconds per piece with the basic drill
  tough_ember: { value: 3.0, min: 0.5, max: 10, step: 0.1 },
  tough_verdite: { value: 4.4, min: 0.5, max: 12, step: 0.1 },
  tough_sunstone: { value: 6.0, min: 0.5, max: 16, step: 0.1 },   // needs the better drill
  value_glint: { value: 10, min: 1, max: 100, step: 1 },          // credits per piece
  value_ember: { value: 30, min: 1, max: 200, step: 1 },
  value_verdite: { value: 80, min: 1, max: 500, step: 5 },
  value_sunstone: { value: 220, min: 1, max: 1000, step: 10 },

  // ---- Crafting costs (ore pieces) ----
  drill2_glint: { value: 8, min: 0, max: 40, step: 1 },
  drill2_ember: { value: 5, min: 0, max: 40, step: 1 },
  drill2_verdite: { value: 2, min: 0, max: 20, step: 1 },
  canister_glint: { value: 4, min: 0, max: 20, step: 1 },
  canister_ember: { value: 1, min: 0, max: 20, step: 1 },

  // ---- Noise: what wakes the rock ----
  hear_radius: { value: 26, min: 8, max: 60, step: 1 },           // m; drilling is heard this far
  drill_noise: { value: 1.0, min: 0.1, max: 4, step: 0.1 },       // noise per second of drilling, at the creature
  break_noise: { value: 1.6, min: 0, max: 6, step: 0.1 },         // noise burst when a piece breaks free
  sprint_noise: { value: 1.2, min: 0, max: 4, step: 0.1 },        // noise per second sprinting within 12 m
  noise_decay: { value: 0.4, min: 0.05, max: 2, step: 0.05 },     // noise lost per second
  wake_noise: { value: 6, min: 2, max: 20, step: 0.5 },           // noise at which a creature wakes
  safe_radius: { value: 34, min: 10, max: 60, step: 1 },          // m around the ship no creature enters

  // ---- Burrower: the one that chases ----
  burrower_speed: { value: 4.4, min: 1, max: 10, step: 0.1 },     // m/s (faster than a walk, slower than a sprint)
  burrower_bite: { value: 22, min: 5, max: 80, step: 1 },         // damage
  burrower_windup: { value: 0.55, min: 0.2, max: 1.5, step: 0.05 }, // s it rears before it bites
  burrower_cooldown: { value: 1.5, min: 0.5, max: 4, step: 0.1 }, // s between bites
  burrower_reach: { value: 2.3, min: 1, max: 5, step: 0.1 },      // m
  burrower_chase_time: { value: 16, min: 4, max: 60, step: 1 },   // s before it gives up
  burrower_leash: { value: 55, min: 15, max: 120, step: 1 },      // m from its hole before it gives up
  stun_drill_time: { value: 0.45, min: 0.1, max: 2, step: 0.05 }, // s of drilling it to stun it
  stun_time: { value: 2.6, min: 0.5, max: 8, step: 0.1 },         // s it stays stunned
  stuns_to_flee: { value: 2, min: 1, max: 6, step: 1 },           // stuns before it goes back to sleep

  burrower_aggro: { value: 6, min: 0, max: 20, step: 0.5 },         // m; inside this it charges at once, any facing (retest round 2, 2026-11-27; 0 = off)
  burrower_see: { value: 10, min: 3, max: 30, step: 1 },            // m; it notices you this close, if it faces you
  sight_alert: { value: 3, min: 0.5, max: 12, step: 0.5 },          // alert gained per second while it sees you
  burrower_roam: { value: 9, min: 0, max: 30, step: 1 },            // m it wanders from its patch
  burrower_roam_speed: { value: 1.3, min: 0.2, max: 4, step: 0.1 }, // m/s while calm

  // ---- Hunters: what comes the longer you stay ----
  hunter_first: { value: 90, min: 20, max: 600, step: 10 },         // s into a run before the first one rises (was 150; retest round 2)
  hunter_interval: { value: 45, min: 10, max: 300, step: 5 },       // s between hunters (was 70; retest round 2)
  hunter_speed_step: { value: 0.1, min: 0, max: 0.5, step: 0.01 },  // each tier is this much faster
  hunter_bite_step: { value: 0.3, min: 0, max: 1, step: 0.05 },     // each tier bites this much harder
  hunter_spawn_dist: { value: 24, min: 8, max: 60, step: 1 },       // m behind you it rises
  hunter_rise: { value: 1.6, min: 0.3, max: 5, step: 0.1 },         // s it takes to climb out: your warning

  // ---- Spitter: the one that lobs ----
  spitter_see: { value: 11, min: 4, max: 30, step: 1 },           // m; this close it wakes on sight
  spitter_range: { value: 30, min: 10, max: 60, step: 1 },        // m; it sleeps again beyond this
  spitter_interval: { value: 2.8, min: 0.8, max: 8, step: 0.1 },  // s between globs
  spitter_flight: { value: 1.7, min: 0.6, max: 4, step: 0.1 },    // s a glob is in the air
  spitter_splash: { value: 3.0, min: 1, max: 8, step: 0.1 },      // m
  spitter_damage: { value: 18, min: 5, max: 80, step: 1 },
};
