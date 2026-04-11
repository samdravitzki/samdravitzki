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

const startTime = Date.now();

// https://easings.net/#easeInOutCubic
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

// https://easings.net/#easeInOutSine
function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

// https://easings.net/#easeInOutCirc
function easeInOutCirc(x: number): number {
  return x < 0.5
    ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
    : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
}

const animation = () => {
  const start = Vector.create(-300, 100);
  const end = Vector.create(300, -100);

  function seek(t: number) {
    // ease out
    const easedT = easeInOutCubic(t);

    return Vector.lerp(start, end, easedT);
  }

  return {
    start,
    end,
    speed: 0.0003,
    seek,
  };
};

const animationProperties = animation();

export default function animationDemo(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([700, 400], parent, palette[200]));

  const trigger = engine.trigger;

  engine.system("setup-line", trigger.on("setup"), (world, resources) => {
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
          start: animationProperties.start,
          end: animationProperties.end,
          stroke: palette[300],
          strokeWeight: 2,
          fill: false,
        } satisfies PrimitiveShape,
      ]),
    );
  });

  engine.system(
    "setup-animation-target",
    trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      world.addBundle(
        createBundle([
          "animation-target",
          {
            name: "position",
            position: animationProperties.start.plus(
              canvasBounds.center.center,
            ),
          },
          {
            name: "primitive",
            type: "circle",
            radius: 20,
            fill: palette[600],
            strokeWeight: 3,
          } satisfies PrimitiveShape,
        ]),
      );
    },
  );

  engine.system("animate", trigger.on("update"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const targetQuery = world.query<[Position]>([
      "position",
      "animation-target",
    ]);

    for (const [position] of targetQuery) {
      const speed = animationProperties.speed;
      const t = ((Date.now() - startTime) * speed) % 1; // use Date.now() as incrementing value to se=ek animation and normalize a value between 0 and 1
      const newPos = animationProperties.seek(t);

      position.position = newPos.plus(canvasBounds.center.center);
    }
  });

  return engine;
}
