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
  ComponentToken,
  Scale,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import {
  p5Part,
  Polygon,
  ShapeStyle,
  Square,
} from "@dravitzki/dufus-engine/parts/p5";
import { animate, animation } from "@dravitzki/dufus-engine/parts/animation";

export default function procedualShapes2(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());
  engine.part(animation());

  const radius = 225;

  engine.system(
    "setup-track",
    engine.trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");
      const animationBounds = canvasBounds.shrink(50);

      const track = createBundle([
        Position({
          position: canvasBounds.center.center,
        }),
        Square({
          width: animationBounds.width,
          height: animationBounds.height,
        }),
        ShapeStyle({
          stroke: "#5a5a5a73",
          strokeWeight: 2,
        }),
        Label({
          text: "border",
        }),
      ]);

      world.addBundle(track);
    },
  );

  engine.system(
    "draw-procedural-shape",
    engine.trigger.on("setup"),
    (world, resources) => {
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

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
      }

      const animationBounds = canvasBounds.shrink(50);

      const polygon = createBundle([
        Polygon({
          vertices: verts,
        }),
        ShapeStyle({
          stroke: "#fff",
          strokeWeight: 2,
          fill: "#fff",
        }),
        Label({
          text: "polygon",
        }),
        Position({
          position: animationBounds.top.left,
        }),
        Rotation({
          rotation: p.radians(0),
        }),
        Scale(Vector.create(0.1, 0.1)),
        tag("animation-target")(),
      ]);

      world.addBundle(polygon);

      const positionAnimation = animate(Position, {
        keyframes: [
          {
            from: { position: animationBounds.top.left },
            to: { position: animationBounds.top.right },
          },
          {
            from: { position: animationBounds.top.right },
            to: { position: animationBounds.bottom.right },
            easing: "easeInOutCubic",
          },
          {
            from: { position: animationBounds.bottom.right },
            to: { position: animationBounds.bottom.left },
          },
          {
            from: { position: animationBounds.bottom.left },
            to: { position: animationBounds.top.left },
            easing: "easeInOutCubic",
          },
        ],
        duration: 2000,
        easing: "easeInOutCubic",
        loop: true,
        target: `animation-target`, // replace with match or query on world
      });

      world.addBundle(positionAnimation);
    },
  );

  return engine;
}
