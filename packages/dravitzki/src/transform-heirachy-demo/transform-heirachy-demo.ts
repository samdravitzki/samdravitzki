import {
  dufus,
  Bounds,
  Position,
  Label,
  tag,
  Rotation,
  Vector,
  ChildOf,
} from "@dravitzki/dufus-engine";
import { animation, animate } from "@dravitzki/dufus-engine/parts/animation";
import { inspector } from "@dravitzki/dufus-engine/parts/inspector";
import { p5Part, ShapeStyle, Square } from "@dravitzki/dufus-engine/parts/p5";

export default function transformHeirachyDemo(parent?: HTMLElement) {
  const engine = dufus()
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, [0, 0, 14]));
  engine.part(inspector());
  engine.part(animation());


  engine.system(
    "template-info",
    engine.trigger.on("setup"),
    (world, resources) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");
      const boxAInset = 250;
      const boxBInset = 400;
      const boxCInset = 510;

      const boxA = world.spit([
        Position({
          position: canvasBounds.center.center,
        }),
        Rotation({
          rotation: 0,
        }),
        Square({
          width: canvasBounds.width - boxAInset,
          height: canvasBounds.height - boxAInset,
        }),
        ShapeStyle({
          fill: "#fff",
        }),
        Label({
          text: "boxA",
        }),
        tag(`animation-target-box-a`)(),
      ]);

      world.addBundle(
        animate(Rotation, {
          from: { rotation: 0 },
          to: { rotation: 2 * Math.PI },
          duration: 3000,
          target: `animation-target-box-a`,
          loop: true,
        }),
      );

      const boxB = world.spit([
        ChildOf({
          parentId: boxA.id,
        }),
        Position({
          position: Vector.create(100, 0),
        }),
        Rotation({
          rotation: 0,
        }),
        Square({
          width: canvasBounds.width - boxBInset,
          height: canvasBounds.height - boxBInset,
        }),
        ShapeStyle({
          fill: "#c96565",
        }),
        Label({
          text: "boxB",
        }),
        tag(`animation-target-box-b`)(),
      ]);

      world.addBundle(
        animate(Rotation, {
          from: { rotation: 0 },
          to: { rotation: 2 * Math.PI },
          duration: 3000,
          target: `animation-target-box-b`,
          loop: true,
        }),
      );

      world.spit([
        ChildOf({
          parentId: boxB.id,
        }),
        Position({
          position: Vector.create(0, 50),
        }),
        Rotation({
          rotation: 0,
        }),
        Square({
          width: canvasBounds.width - boxCInset,
          height: canvasBounds.height - boxCInset,
        }),
        ShapeStyle({
          fill: "#d61515",
        }),
        Label({
          text: "boxC1",
        }),
        tag(`animation-target-box-c`)(),
      ]);

      world.addBundle(
        animate(Rotation, {
          from: { rotation: 0 },
          to: { rotation: 2 * Math.PI },
          duration: 3000,
          target: `animation-target-box-c`,
          loop: true,
        }),
      );

      world.spit([
        ChildOf({
          parentId: boxB.id,
        }),
        Position({
          position: Vector.create(0, -50),
        }),
        Rotation({
          rotation: 0,
        }),
        Square({
          width: canvasBounds.width - boxCInset,
          height: canvasBounds.height - boxCInset,
        }),
        ShapeStyle({
          fill: "#d61515",
        }),
        Label({
          text: "boxC2",
        }),
        tag(`animation-target-box-c`)(),
      ]);

      world.addBundle(
        animate(Rotation, {
          from: { rotation: 0 },
          to: { rotation: 2 * Math.PI },
          duration: 3000,
          target: `animation-target-box-c`,
          loop: true,
        }),
      );
    },
  );

  return engine;
}
