import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import Engine from "../ecs/core/Engine/Engine";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { onStart } from "../ecs/core/Engine/SystemTrigger";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part from "../ecs/parts/p5/p5-part";
import primitiveRendererPart from "../ecs/parts/p5/primitive-renderer/primitive-renderer";
import poissonDisc from "../lib/poisson-disc/poisson-disc";
import randomDots from "./random-dots/random-dots";

function placeRandomDots(
  world: World,
  resources: ResourcePool,
  { dotCount }: { dotCount: State<number> }
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const dots = randomDots(dotCount.value, canvasBounds);

  for (const dot of dots) {
    world.addBundle(
      createBundle([
        {
          name: "primitive",
          stroke: [240, 60, 70],
          strokeWeight: 2,
          fill: false,
          type: "circle",
          radius: 5,
        },
        {
          name: "position",
          position: dot,
        },
      ])
    );
  }
}

function placePoissonDots(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const dots = poissonDisc(canvasBounds);

  const dotWidth = 2;

  for (const dot of dots) {
    world.addBundle(
      createBundle([
        {
          name: "primitive",
          stroke: [345, 80, 100],
          strokeWeight: 2,
          fill: [345, 80, 100],
          type: "circle",
          radius: dotWidth,
        },
        {
          name: "position",
          position: dot.plus(Vector.create(dotWidth, dotWidth)),
        },
      ])
    );
  }
}

// NOTE: This App class was made temporarily, I think I should come up with a more
// defined concept for this that reduces the requirement to repeat this for
// every game
class PoissonDiscSamplingDemoApp {
  private _engine?: Engine<any>;

  run(parent?: HTMLElement) {
    const engine = EngineBuilder.create().state("dotCount", 100).build();
    engine.part(p5Part([500, 500], parent));
    engine.system("place-random-dots", onStart(), placeRandomDots);
    engine.system("place-poisson-dots", onStart(), placePoissonDots);

    this._engine = engine;

    engine.run();
  }

  stop() {
    this._engine?.stop();
  }
}

export default new PoissonDiscSamplingDemoApp();
