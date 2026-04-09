import p5 from "p5";
import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import Vector from "../ecs/core/Vector/Vector";
import p5Part, { KeypressEvent } from "../ecs/parts/p5/p5-part";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";

// from https://hihayk.github.io/scale/#4/3/64/72/58/8/18/20/17F350/20/243/80/black
const palette = {
  100: "#0A090A",
  200: "#302329",
  300: "#5B383C",
  400: "#8B5848",
  500: "#C19452",
  600: "#D59C66",
  700: "#E6A67D",
  800: "#F2B299",
  900: "#FAC4B8",
};

export default function animationDemo(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event<"keyPressed", KeypressEvent>("keyPressed")
    .event<"keyReleased", KeypressEvent>("keyReleased")
    .event("after-update")
    .build();

  engine.part(p5Part([700, 400], parent, palette[200]));

  const t = engine.trigger;

  engine.system("setup-line", t.on("setup"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    world.addBundle(
      createBundle([
        {
          name: "position",
          position: canvasBounds.center.center,
        },
        {
          name: "primitive",
          type: "line",
          start: Vector.create(-300, 0),
          end: Vector.create(300, 0),
          stroke: palette[300],
          strokeWeight: 2,
          fill: false,
        } satisfies PrimitiveShape,
      ]),
    );
  });

  engine.system("setup-animation-target", t.on("setup"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    world.addBundle(
      createBundle([
        "animation-target",
        {
          name: "position",
          position: canvasBounds.center.center.plus(
            Vector.create(-300 - 10, 0),
          ),
        },
        {
          name: "primitive",
          type: "circle",
          radius: 20,
          fill: palette[600],
          stroke: palette[600],
          strokeWeight: 2,
        } satisfies PrimitiveShape,
      ]),
    );
  });

  engine.system("animate-target", t.on("update"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const p = resources.get<p5>("p5");
    const targetQuery = world.query<[Position]>([
      "position",
      "animation-target",
    ]);

    for (const [position] of targetQuery) {
      const newX = 5 * p.sin(p.millis() / 1000);
      position.position = position.position.plus(Vector.create(newX, 0));
    }
  });

  return engine;
}
