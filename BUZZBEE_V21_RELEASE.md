# BuzzBee Business OS v20.3.2 — Apple Design Global Rollout

Material Design 3 remains BuzzBee's structural component foundation. v21 adds a global Apple-inspired behavioral layer across the Business OS: immediate press feedback, calmer spring-like response curves, optical typography, translucent hierarchy, depth, focus states, table/input feedback, dark-mode depth and accessibility equivalents for reduced motion, reduced transparency and increased contrast.

The rollout is global through `apple-design-v21.css`, imported after the previous fluid layer so every operational module inherits the behavior without duplicating module CSS.

Validation: `npm run apple:audit`, then `npm run build` and `npm run release:audit`.
