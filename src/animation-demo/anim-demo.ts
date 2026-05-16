import p5 from "p5";
import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import Vector from "../ecs/core/Vector/Vector";
import p5Part from "../ecs/parts/p5/p5-part";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Line } from "../ecs/parts/p5/shape-components";
import { Circle } from "../ecs/parts/p5/shape-components";
import {
  createAnimation,
  Animation,
} from "../ecs/parts/animation/components/Animation";
import animation from "../ecs/parts/animation/animation";

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
    .event("after-update")
    .build();

  engine.part(p5Part([700, 400], parent, palette[200]));
  engine.part(animation());

  const trigger = engine.trigger;

  engine.system("setup-animations", trigger.on("setup"), (world, resources) => {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const basicLoopAnimation = createAnimation({
      name: "basic-loop",
      from: Vector.create(-300, -100).plus(canvasBounds.center.center),
      to: Vector.create(300, -100).plus(canvasBounds.center.center),
      target: `animation-target-1`,
      duration: 2000,
      loop: true,
    });

    const notLoopingAnimation = createAnimation({
      name: "not-looping",
      from: Vector.create(-300, 0).plus(canvasBounds.center.center),
      to: Vector.create(300, 0).plus(canvasBounds.center.center),
      target: `animation-target-2`,
      duration: 2000,
      loop: false,
      easing: "easeOutBounce",
    });

    world.addBundle(basicLoopAnimation);
    world.addBundle(notLoopingAnimation);
  });

  engine.system("setup-animation-path-lines", trigger.on("setup"), (world) => {
    for (const [animation] of world.query<[Animation]>(["animation"])) {
      world.addBundle(
        createBundle([
          {
            name: "position",
            position: new Vector(0, 0),
          } satisfies Position,
          {
            name: "line",
            start: animation.from,
            end: animation.to,
          } satisfies Line,
          {
            name: "shape-style",
            stroke: palette[300],
            strokeWeight: 2,
          } satisfies ShapeStyle,
        ]),
      );
    }
  });

  engine.system(
    "setup-animation-target",
    trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      world.query<[Animation]>(["animation"]).forEach(([animation], i) => {
        world.addBundle(
          createBundle([
            `animation-target-${i + 1}`,
            {
              name: "position",
              position: animation.from.plus(canvasBounds.center.center),
            } satisfies Position,
            {
              name: "circle",
              radius: 10,
            } satisfies Circle,
            {
              name: "shape-style",
              fill: palette[600],
              strokeWeight: 2,
            } satisfies ShapeStyle,
          ]),
        );
      });
    },
  );

  engine.system("animator-ui", trigger.on("setup"), (world, resources) => {
    const p = resources.get<p5>("p5");
    const canvasBounds = resources.get<Bounds>("canvas-bounds");

    const uiContainer = p.createDiv();
    uiContainer.position(0, canvasBounds.max.y, "absolute");
    uiContainer.style("display", "flex");
    uiContainer.style("gap", "10px");
    uiContainer.style("padding", "10px");

    const playButton = p.createButton("play");

    playButton.mousePressed(() => {
      world.query<[Animation]>(["animation"]).forEach(([animation]) => {
        animation.startTime = Date.now();
      });
    });

    playButton.parent(uiContainer);
  });

  return engine;
}
