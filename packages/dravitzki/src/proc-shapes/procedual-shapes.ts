import p5 from "p5";
import {
  dufus,
  Bounds,
  createBundle,
  Position,
  Label,
  Vector,
  tag,
} from "@dravitzki/dufus-engine";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import { Circle, p5Part, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";

export default function procedualShapes(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());

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
          stroke: "#ffffff78",
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
          radius: 10,
        }),
        ShapeStyle({
          fill: "#fff",
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

        t += p.deltaTime * 0.05;

        position.componentData.position = canvasBounds.center.center.plus(
          Vector.create(x, -y),
        );
      }
    },
  );

  return engine;
}
