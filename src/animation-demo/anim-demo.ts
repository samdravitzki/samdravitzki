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

// https://easings.net/#easeOutElastic
function easeOutElastic(x: number): number {
  const c4 = (1 * Math.PI) / 5;

  return x === 0
    ? 0
    : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

// https://easings.net/#easeOutBounce
function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

// Next step: create second animation that triggers on click of a button
const animation = ({
  from,
  to,
  target,
  duration,
  loop = true,
}: {
  from: Vector;
  to: Vector;
  target: string;
  duration: number;
  loop?: boolean;
}) => {
  const startTime = Date.now();

  function seek(t: number) {
    const easedT = easeInOutCubic(t);
    return Vector.lerp(from, to, easedT);
  }

  function tick() {
    const elapsed = Date.now() - startTime;
    let t = 0;
    if (loop) {
      t = (elapsed % duration) / duration; // Normalize elapsed time to a value between 0 and 1
    } else {
      t = Math.min(elapsed / duration, 1); // Clamp to 1 if elapsed time exceeds duration
    }
    return seek(t);
  }

  return {
    from,
    to,
    target,
    seek,
    tick,
  };
};

const basicLoopAnimation = animation({
  from: Vector.create(-300, -100),
  to: Vector.create(300, -100),
  target: `animation-target-${1}`,
  duration: 2000,
  loop: true,
});

const notLoopingAnimation = animation({
  from: Vector.create(-300, 0),
  to: Vector.create(300, 0),
  target: `animation-target-${2}`,
  duration: 2000,
  loop: false,
});

const animations = [basicLoopAnimation, notLoopingAnimation];

export default function animationDemo(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([700, 400], parent, palette[200]));

  const trigger = engine.trigger;

  engine.system("animate", trigger.on("update"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    for (const animation of animations) {
      const [position] = world.query<[Position]>([
        "position",
        animation.target,
      ])[0];

      const newPos = animation.tick();
      position.position = newPos.plus(canvasBounds.center.center);
    }
  });

  engine.system(
    "setup-animation-path-lines",
    trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      for (const animation of animations) {
        world.addBundle(
          createBundle([
            {
              name: "position",
              position: canvasBounds.center.center,
            },
            {
              name: "primitive",
              type: "line",
              start: animation.from,
              end: animation.to,
              stroke: palette[300],
              strokeWeight: 2,
              fill: false,
            } satisfies PrimitiveShape,
          ]),
        );
      }
    },
  );

  engine.system(
    "setup-animation-target",
    trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      animations.forEach((animation, i) => {
        world.addBundle(
          createBundle([
            `animation-target-${i + 1}`,
            {
              name: "position",
              position: animation.from.plus(canvasBounds.center.center),
            },
            {
              name: "primitive",
              type: "circle",
              radius: 10,
              fill: palette[600],
            } satisfies PrimitiveShape,
          ]),
        );
      });
    },
  );

  return engine;
}
