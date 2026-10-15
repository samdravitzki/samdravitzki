# Modular Pong

Modular Pong is a feature-equivalent, side-by-side implementation of the existing
[Pong](../pong/README.md) demo. It retains the menu, pause control, mouse-driven
player paddle, AI paddle, scoring, increasing ball speed, trajectory toggle, and
end state. The original Pong is intentionally unchanged so the two implementations
can be compared directly.

## What changed

| Original responsibility | Modular Pong module | Why |
| --- | --- | --- |
| Components and role strings spread between the game and prefabs | `components.ts` | One domain vocabulary; component tokens replace role-name strings. |
| Low-level entity assembly | `prefabs.ts` | Factories only construct related components. |
| Arena coordinates and spawning | `scene.ts` | Scene layout is separate from gameplay behavior. |
| Collision rules, scoring, movement, and scoreboard updates | `gameplay.ts` | Game rules are grouped without owning setup or UI. |
| Mouse movement and paddle bounds | `input.ts` | Input handling has a focused boundary. |
| Menus and state-transition presentation | `menu.ts` | UI owns p5 DOM IDs and state-driven visibility. |
| Raycast prediction and debug lines | `trajectory.ts` | Debug visualization no longer sits beside core game rules. |
| Feature-owned system registration | `parts.ts` | Each independent feature registers its own systems through a Dufus `Part`. |
| Engine setup and part composition | `modular-pong.ts` | This is a deliberately thin composition root. Part order documents and preserves system execution order. |

`query.ts` contains the small local helpers that make expected entities and collision
pairs explicit. `contactPair()` replaces each repeated “resolve both IDs, find the
ball, find the other entity” sequence. `requiredComponent()` and `singleQuery()`
fail with a named invariant when required game entities are missing, rather than
hiding the assumption behind a non-null assertion.

## Dufus observations

This structure does not require a Dufus change. The existing `World`, components,
states, and system registration are enough to define local module boundaries.

The implementation does expose possible engine improvements:

- `Part` currently registers systems but cannot own the events, state, or resources
  required by a feature, so the composition root still declares all of them.
- Queries are positional and require a local `singleQuery()` invariant to express
  singleton expectations.
- Collision contacts supply entity IDs; `contactPair()` is a local pattern matcher
  that could become an engine-level helper if multiple demos need richer matching.

Those are design candidates, not changes made by this demo. The local helpers remain
the lower-risk choice until another demo demonstrates the same need.

## Part folder layout

Each Dufus part now owns a folder under `parts/`. Its `index.ts` contains both the
part registration and the systems it registers, so a feature's lifecycle and
behavior can be read together:

| Part folder | Responsibility |
| --- | --- |
| `parts/scene` | Scene setup and its scene-only prefab factories. |
| `parts/menu` | Menu creation and state-driven visibility. |
| `parts/gameplay` | Scoring, collision rules, and scoreboard updates. |
| `parts/paddle` | Player input, AI paddle movement, and paddle bounds. |
| `parts/ball` | Ball movement. |
| `parts/trajectory` | Raycast prediction and debug trajectory rendering. |

`common/` holds contracts used by more than one part: component tokens,
application types, and query helpers. The composition root remains
`modular-pong.ts`; it imports the folders and keeps their registration order
explicit.
