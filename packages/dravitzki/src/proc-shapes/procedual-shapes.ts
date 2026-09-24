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
  ComponentSpec,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  Circle,
  p5Part,
  Polygon,
  ShapeStyle,
} from "@dravitzki/dufus-engine/parts/p5";
import {
  animation,
  createAnimation,
  EasingName,
} from "@dravitzki/dufus-engine/parts/animation";

export default function procedualShapes(parent?: HTMLElement) {
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
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const createVertex = (pos: Vector) =>
        createBundle([
          Position({
            position: canvasBounds.center.center.plus(pos),
          }),
          Circle({
            radius: 5,
          }),
          ShapeStyle({
            fill: "#fff",
          }),
          Label({
            text: "dot",
          }),
        ]);

      // Configuration for the procedural shape
      const sides = 10;
      const maxRadius = radius;
      const radiusPattern = [maxRadius, maxRadius / 2];

      const verts = [];

      for (let i = 0; i < sides; i++) {
        const r = radiusPattern[i % radiusPattern.length];

        const x = p.cos(p.radians(i * (360 / sides))) * r;
        const y = p.sin(p.radians(i * (360 / sides))) * r;

        const vert = Vector.create(x, -y);

        verts.push(vert);

        const vertex = createVertex(vert);
        world.addBundle(vertex);
      }

      const polygon = createBundle([
        Position({
          position: canvasBounds.center.center,
        }),
        Polygon({
          vertices: verts,
        }),
        ShapeStyle({
          stroke: "#fff",
          strokeWeight: 2,
        }),
        Label({
          text: "polygon",
        }),
        Rotation({
          rotation: p.radians(0),
        }),
        tag("animation-target")(),
      ]);

      world.addBundle(polygon);

      const rotationAnimation = animate(Rotation, {
        from: { rotation: 0 },
        to: { rotation: p.radians(360) },
        duration: 2000,
        easing: "easeInOutCirc",
        loop: true,
        target: `animation-target`, // replace with match or query on world
      });

      world.addBundle(rotationAnimation);
    },
  );

  return engine;
}

type AnimationConfig<T> = {
  from: T;
  to: T;
  duration: number;
  target: string;
  easing?: EasingName;
  loop?: boolean;
};

type ComponentData<T> = T extends ComponentSpec<infer U> ? U : never;

function animate<T extends ComponentSpec<any>>(
  Component: T,
  config: AnimationConfig<ComponentData<T>>,
) {
  return createAnimation({
    name: "test",
    Component: Component,
    from: config.from,
    to: config.to,
    target: config.target,
    duration: config.duration,
    loop: config.loop,
    easing: config.easing,
    startTime: Date.now(),
  });
}
