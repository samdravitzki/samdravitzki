# @dravitzki/dufus-engine

A lightweight Entity Component System (ECS) engine for building interactive 2D experiments and games.

## What It Is

`@dravitzki/dufus-engine` provides:

- ECS core primitives: `Entity`, `Component`, `System`, `World`
- Type-safe engine composition via `EngineBuilder`
- Event and state driven system scheduling with triggers
- Shared math and geometry utilities (`Vector`, `Bounds`)
- Optional parts for p5 rendering, collision, animation, and inspector tooling

## Why It Exists

The engine started inside the dravitzki demos and was extracted into a shared package so game/demo code and engine code can evolve separately.

Goals:

- Keep gameplay logic modular with ECS composition
- Reuse one engine foundation across many mini-projects
- Iterate on engine design using real demos as proving grounds

## Current Status

- Actively used by demos in `packages/dravitzki/src`
- Uses deep imports (`@dravitzki/dufus-engine/src/...`) while API stabilizes
- Top-level barrel exports are planned, but not the default yet

## Getting Started

### Install

In this monorepo, add it as a workspace dependency:

```json
{
  "dependencies": {
    "@dravitzki/dufus-engine": "workspace:*"
  }
}
```

### Minimal Example (Current API)

```ts
import { EngineBuilder } from "@dravitzki/dufus-engine/src/core/Engine/EngineBuilder";
import { component } from "@dravitzki/dufus-engine/src/core/Component/Component";
import createBundle from "@dravitzki/dufus-engine/src/core/Bundle/createBundle";
import Vector from "@dravitzki/dufus-engine/src/core/Vector/Vector";

const Position = component<{ position: Vector }>({ name: "position" });
const Velocity = component<Vector>({ name: "velocity" });

export default function demo(parent?: HTMLElement) {
  const engine = EngineBuilder.create().event("setup").event("update").build();

  engine.system("spawn", engine.trigger.on("setup"), (world) => {
    world.addBundle(
      createBundle([
        Position({ position: Vector.create(50, 50) }),
        Velocity(Vector.create(1, 0)),
      ]),
    );
  });

  engine.system("move", engine.trigger.on("update"), (world) => {
    for (const [position, velocity] of world.query([Position, Velocity])) {
      position.componentData.position = position.componentData.position.plus(
        velocity.componentData,
      );
    }
  });

  return engine;
}
```

In dravitzki, apps returned from demo functions are started and stopped by the SPA host (`run()`/`stop()`).

## Core Concepts

### Entity

A lightweight identifier that holds components.

### Component

Pure data. Components should not contain behavior.

### System

Behavior that runs when a trigger condition is satisfied. Systems receive:

- `world`
- `resources`
- `state`
- `eventEmitter`
- event `payload`

### World

Stores entities and supports component-based queries with `world.query([...])`.

### Bundle

A set of components that can be spawned together via `world.addBundle(...)`.

### Part

A pluggable extension that can register systems and setup logic.

### State and Trigger

Systems can be gated by event and state conditions:

- `engine.trigger.on("update")`
- `engine.trigger.on("update").when("mode").is("play")`
- `engine.trigger.on("update").when("mode").enters("play")`
- `engine.trigger.on("update").when("mode").exits("play")`

## Included Parts

- `src/parts/p5`: p5 canvas setup, frame events, primitive rendering, input events
- `src/parts/collision`: collider components, contact tracking, collision events
- `src/parts/animation`: tween-like animation components/systems
- `src/parts/inspector`: dev inspector UI integrations

## Demo Guide

The best reference for real-world usage is the collision demo.

### Collision Demo (Recommended First)

Path: `packages/dravitzki/src/collision-demo/collision-demo.ts`

What it demonstrates:

- Defining typed engine events (including `collision` payloads)
- Composing parts (`p5Part`, `collision`, `inspector`)
- Spawning entities with bundles and tags
- Query-driven physics updates (gravity + movement)
- Collision response with depenetration and reflected velocity

### Additional Good References

- `packages/dravitzki/src/project-template/project-template.ts`: minimal app scaffold
- `packages/dravitzki/src/animation-demo/anim-demo.ts`: animation part usage
- `packages/dravitzki/src/cursor-actions/cursor-actions.ts`: input + collision interaction patterns

## Package Layout

- `src/core`: engine, world, entity, trigger, state, bundles, math
- `src/components`: shared components (for example `Position`)
- `src/parts`: optional extension modules
- `src/lib`: utility helpers used by engine internals

## Development

```bash
pnpm --filter @dravitzki/dufus-engine build
pnpm --filter @dravitzki/dufus-engine test
```

## Limitations (Current)

- Deep import paths are required today
- Public top-level API is still evolving
- Some ordering and lifecycle concerns are still tracked as TODOs in code/comments
