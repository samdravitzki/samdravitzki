import p5 from "p5";
import {
  dufus,
  Bounds,
  createBundle,
  Position,
  Label,
  Vector,
  tag,
  Rotation,
  Scale,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  Circle,
  p5Part,
  Polygon,
  ShapeStyle,
} from "@dravitzki/dufus-engine/parts/p5";
import { animate, animation } from "@dravitzki/dufus-engine/parts/animation";

export default function animationDemo4(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());
  engine.part(animation());

  const orbitingBallTag = tag("orbiting-ball");

  const radius = 225;

  engine.system(
    "setup-track",
    engine.trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const track = createBundle([
        Position({
          position: canvasBounds.center.center,
        }),
        Circle({
          radius: radius,
        }),
        ShapeStyle({
          stroke: "#5a5a5a",
          strokeWeight: 2,
        }),
        Label({
          text: "border",
        }),
      ]);

      world.addBundle(track);

      const orbitingBall = createBundle([
        Position({
          position: canvasBounds.center.center.plus(Vector.create(0, -radius)),
        }),
        Circle({
          radius: 5,
        }),
        ShapeStyle({
          fill: "#5a5a5a",
        }),
        orbitingBallTag(),
        Label({
          text: "orbiting ball",
        }),
      ]);

      world.addBundle(orbitingBall);
    },
  );

  let t = 0;

  engine.system(
    "update-orbit",
    engine.trigger.on("update"),
    (world, resources) => {
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      for (const [position] of world.query([Position, orbitingBallTag])) {
        const x = p.cos(p.radians(t)) * radius;
        const y = p.sin(p.radians(t)) * radius;

        position.componentData.position = canvasBounds.center.center.plus(
          Vector.create(x, -y),
        );
      }

      t += p.deltaTime * 0.05;
    },
  );

  engine.system(
    "draw-procedural-shape",
    engine.trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const directions = [
        Vector.create(1, 0),
        Vector.create(0, 1),
        Vector.create(-1, 0),
        Vector.create(0, -1),
      ];

      directions.forEach((dir, index) => {
        const pos = Vector.create(radius * dir.x, radius * dir.y);

        // circle end
        world.spit(
          Circle({
            radius: radius / 10,
          }),
          ShapeStyle({
            fill: "#fff",
          }),
          Label({
            text: "polygon",
          }),
          Position({
            position: canvasBounds.center.center,
          }),
          Scale(Vector.create(1, 1)),
          tag(`animation-target-end-${index}`)(),
        );

        const stretchHeight = radius / 10;

        // stretch
        world.spit(
          Polygon({
            vertices: [
              Vector.create(0, -stretchHeight),
              Vector.create(0, -stretchHeight),
              Vector.create(0, stretchHeight),
              Vector.create(0, stretchHeight),
            ],
          }),
          ShapeStyle({
            fill: "#fff",
          }),
          Label({
            text: "polygon",
          }),
          Position({
            position: canvasBounds.center.center,
          }),
          Scale(Vector.create(1, 1)),
          tag(`animation-target-stretch-${index}`)(),
        );

        // circle start
        world.spit([
          Circle({
            radius: radius / 10,
          }),
          ShapeStyle({
            fill: "#fff",
          }),
          Label({
            text: "polygon",
          }),
          Position({
            position: canvasBounds.center.center,
          }),
          Scale(Vector.create(1, 1)),
          tag(`animation-target-start-${index}`)(),
        ]);

        // animate position
        world.addBundle(
          animate(Position, {
            keyframes: [
              {
                from: { position: canvasBounds.center.center },
                to: { position: canvasBounds.center.center.plus(pos) },
                easing: "easeInOutCubic",
              },
              {
                to: { position: canvasBounds.center.center.plus(pos) },
              },
            ],
            duration: 1000,
            target: `animation-target-end-${index}`,
            loop: true,
          }),
        );

        world.addBundle(
          animate(Position, {
            keyframes: [
              {
                from: { position: canvasBounds.center.center },
                to: { position: canvasBounds.center.center },
              },
              {
                to: { position: canvasBounds.center.center.plus(pos) },
                easing: "easeInOutCubic",
              },
            ],
            duration: 1000,
            target: `animation-target-start-${index}`,
            loop: true,
          }),
        );

        // animate stretch
        world.addBundle(
          animate(Polygon, {
            keyframes: [
              {
                from: {
                  vertices:
                    Math.abs(dir.x) === 1
                      ? [
                          Vector.create(0, -stretchHeight),
                          Vector.create(0, -stretchHeight),
                          Vector.create(0, stretchHeight),
                          Vector.create(0, stretchHeight),
                        ]
                      : [
                          Vector.create(-stretchHeight, 0),
                          Vector.create(-stretchHeight, 0),
                          Vector.create(stretchHeight, 0),
                          Vector.create(stretchHeight, 0),
                        ],
                },
                to: {
                  vertices:
                    Math.abs(dir.x) === 1
                      ? [
                          Vector.create(0, -stretchHeight),
                          Vector.create(radius * dir.x, -stretchHeight),
                          Vector.create(radius * dir.x, stretchHeight),
                          Vector.create(0, stretchHeight),
                        ]
                      : [
                          Vector.create(-stretchHeight, 0),
                          Vector.create(-stretchHeight, radius * dir.y),
                          Vector.create(stretchHeight, radius * dir.y),
                          Vector.create(stretchHeight, 0),
                        ],
                },
                easing: "easeInOutCubic",
              },
              {
                to: {
                  vertices:
                    Math.abs(dir.x) === 1
                      ? [
                          Vector.create(radius * dir.x, -stretchHeight),
                          Vector.create(radius * dir.x, -stretchHeight),
                          Vector.create(radius * dir.x, stretchHeight),
                          Vector.create(radius * dir.x, stretchHeight),
                        ]
                      : [
                          Vector.create(-stretchHeight, radius * dir.y),
                          Vector.create(-stretchHeight, radius * dir.y),
                          Vector.create(stretchHeight, radius * dir.y),
                          Vector.create(stretchHeight, radius * dir.y),
                        ],
                },
                easing: "easeInOutCubic",
              },
            ],
            duration: 1000,
            target: `animation-target-stretch-${index}`,
            easing: "linear",
            loop: true,
          }),
        );
      });
    },
  );

  return engine;
}
