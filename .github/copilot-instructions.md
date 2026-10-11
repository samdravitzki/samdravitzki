# Repository instructions

## Build, test, and lint

This is a pnpm 9 workspace; install dependencies with `pnpm install`.

- `pnpm dev` starts the packages' development servers in parallel.
- `pnpm build` builds all workspace packages.
- `pnpm test` runs both packages' Vitest suites.
- Run one test file with `pnpm --filter dravitzki exec vitest run src/lib/clamp/clamp.test.ts` or `pnpm --filter @dravitzki/dufus-engine exec vitest run src/core/World/World.test.ts`; replace the path with the test to run.
- The `dravitzki` build runs TypeScript and Vite; the engine build runs `tsc --noEmit`.
- CI checks infrastructure with `az bicep build --file iac/main.bicep`. There is no configured JavaScript/TypeScript lint script.

## Architecture

- `packages/dravitzki` is the Vite-built personal site and playground. `src/main.ts` wires the SPA router; `src/spa/mini-apps.ts` is the registry that connects demo IDs, metadata, and app factories to routes. Each demo lives in its own `src/` area and can document its scope and progress in a local `README.md`.
- `packages/dufus-engine` is the shared TypeScript game engine consumed by the playground as the `@dravitzki/dufus-engine` workspace package. It uses an entity-component-system model: `World` owns entities and their components, systems query and update the world, and the engine dispatches registered events and state-triggered systems. Optional parts provide capabilities such as p5 rendering/input, collisions, animation, and the inspector.
- `iac/main.bicep` defines the Azure infrastructure used to host the built static site; CI builds the site artifact before deployment.

## Codebase conventions

- Define ECS components with `component<T>({ name: "..." })` or data-free tags with `tag("...")`. Use the exported component specification both to construct components and to query them; its PascalCase identifier is distinct from its component name.
- Compose an engine with `dufus()`, declaring its events and state via `.event(...)` and `.state(...)`, then `.build()`. Register behavior with `engine.system(name, engine.trigger..., system)` and add optional engine integrations with `engine.part(...)`.
- Keep game behavior in systems operating on the shared `World`, state, and resource pool rather than building game-specific entity inheritance. Use bundles and small prefab helpers where demos assemble entities from related components.
- Demo factories accept an optional parent `HTMLElement` and return an engine. Register a demo in `src/spa/mini-apps.ts` to expose it through the site; page renderers may return a `PageCleanup` function so navigation can release page resources.
- Tests are Vitest `*.test.ts` files colocated with the implementation. Both packages run Vitest in jsdom with V8 coverage enabled.

## Project intent and history

- This is a personal learning space for building original interactive experiences (the author is working toward the "Twenty games challenge"); demos are intentionally experimental and are meant to drive engine features. Engine capabilities are added in response to what a real demo needs, and commit messages often record the gap that motivated a change.
- The engine began inside the site (pong, Dec 2024) and was extracted into `packages/dufus-engine` in July 2026. A strict public API is exposed through the barrel files (`src/index.ts` → `core` and `components`) plus the `exports` subpaths for `parts/*`; export new public APIs from the relevant barrel. Note the `parts/collisions` subpath maps to `src/parts/collision`.
- Dufus is bevy-inspired. Design ideas and known limitations are recorded in code comments, the engine README roadmap, and per-demo READMEs/notes (e.g. `src/pong/notes.md`); check them before reworking an area.

## Engine behavior to know before changing it

- `init` is a required built-in event and fires once when `run()` is called. Engines are single-use: `stop()` clears the world and state so a re-run would otherwise trigger `init` twice. The site stops the running app on navigation (including back/forward).
- Systems execute in registration order for a given event. Parts register systems when `engine.part(...)` is called, so part order matters.
- Name systems explicitly (first argument to `engine.system`). Names are used for logging because function names are not minification-safe.
- State transitions only fire when the value actually changes; setting the same value is a no-op.
- `.when(state).is(x)` runs a system on every event while the state matches; `.enters(x)`/`.exits(x)` run once per transition at the next triggering event.
- Event payloads default to `void`; declare payloads with `.event<"name", Payload>("name")`. `p5Part` emits `setup`, `update`, `after-update`, `fixed-update`, `keyPressed`, `keyReleased` and `click*` events (the app still declares the ones it uses via `.event(...)`); the collision part runs on `fixed-update` (frequency was raised to reduce jitter) rather than `update`.
- Collisions are modelled as entities holding a `CollisionContact` component (not components on the colliding entities), and contacts are cleaned up on `world:entity-removed`.
- `Text` was renamed `Typography` to avoid name conflicts; tag components are omitted from `world.query` results; `world.spit(...)` is the idiomatic way to spawn an entity from components.
- p5 may swallow keypress events; the inspector fields needed special handling for this.

## Site and deployment notes

- The site is a client-side SPA using history routing; `public/staticwebapp.config.json` rewrites unknown paths to `/index.html` so deep links to a demo work on Azure Static Web Apps.
- Every push to `main` deploys directly to production (the `production` environment) after tests/build pass; PRs only run the build workflow. The Azure workflow authenticates via a federated workload identity, with no secrets stored.
- Demos are grouped on the home page by `type` (`"experience"` vs experiment/test) and by `tags` (e.g. `dufus-animations`, `dufus-collisions`); tag a new demo with the engine part it exercises, and mark broken ones with `not-working`. New demos should start from copying `src/project-template`.
- The inspector overlay is included in demos, hidden by default and opened by entering a keyboard code; it is hidden on mobile.
- Dependabot keeps npm packages and GitHub Actions current; major dependency bumps (Vite 8, Vitest 4, TypeScript 6, p5 2) have previously required follow-up fixes.
