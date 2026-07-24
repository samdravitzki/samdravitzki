# dufus engine

A data-driven game engine built to make it easy for web developers to prototype games and any other highly interactive experiments.

Prototype ideas quickly with the developer experience you're used to. Once you have something you like select the engine and tooling it best suits

```ts
import { dufus } from "@dravitzki/dufus-engine";

const engine = dufus()
  .event("setup")
  .event("update")
  .event("after-update")
  .build();

engine.part(p5Part([500, 500], parent, "#0A090A"));

// Make a demo that actually does something
engine.system("demo-setup", engine.trigger.on("setup"), () => {});
engine.system("demo-update", engine.trigger.on("update"), () => {});

engine.run();
```

## Installation

In this monorepo, add it as a workspace dependency:

```json
{
  "dependencies": {
    "@dravitzki/dufus-engine": "workspace:*"
  }
}
```

Dufus engine is currently not a published library and so cannot be installed via `npm`. If you want dufus-engine published get in contact and let me know @paulblartsequel

## Features

`@dravitzki/dufus-engine` provides:

- A custom Entity Component System (ECS) with core primitives `Entity`, `Component`, `System`, `World`
- Type-safe engine composition via the `DufusEngineBuilder` or `dufus()`
- Event and state driven system scheduling with triggers
- Optional plugins (called parts) for p5.js, collision, animation, and inspector tooling

## Included Parts

Parts are pluggable extensions that can register systems and setup logic.

- `src/parts/p5`: p5 canvas setup, update events, primitive rendering, input events
- `src/parts/collision`: collider components, contact events
- `src/parts/animation`: tween-like animation components/systems
- `src/parts/inspector`: entity inspector UI

## Why does it exist?

The engine started inside the `dravitzki` (a personal-site and playground) demos and was extracted into a shared package so game/demo code and engine code can evolve separately, and maybe even become something that others can find a use for in their own projects

Goals:

- A clean developer experience any modern web developer would appreciate
- Iterate and extend on engine using real demos and more importantly real games
- Keep gameplay logic modular with ECS composition

## Why's it called that?

If you cant come up with any good reasons to build something it probably isn't a good idea. So if you decide to build it anyways you're probably a dufus

## Package Layout

- `src/core`: engine, world, entity, trigger, state, bundles, math
- `src/components`: shared components (for example `Position`)
- `src/parts`: optional extension modules
- `src/lib`: utility helpers used by engine internals

## Development

```bash
> pnpm --filter @dravitzki/dufus-engine build
> pnpm --filter @dravitzki/dufus-engine test
```

## Current status and roadmap

Grab from the NOTES.md readme

### Roadmap

- parts can handle registering events and state - example issue atm: p5 defines the setup event so you should be able to trigger systems on the setup event without having the register it yourself
- parts can register resources that are typesafe
