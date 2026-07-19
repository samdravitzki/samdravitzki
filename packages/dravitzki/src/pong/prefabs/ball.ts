import Position from "@samdravitzki/dufus-engine/src/components/Position";
import createBundle from "@samdravitzki/dufus-engine/src/core/Bundle/createBundle";
import { tag } from "@samdravitzki/dufus-engine/src/core/Component/Component";
import Vector from "@samdravitzki/dufus-engine/src/core/Vector/Vector";
import { Collider } from "@samdravitzki/dufus-engine/src/parts/collision/components/Collider";
import { ShapeStyle } from "@samdravitzki/dufus-engine/src/parts/p5/primitive-renderer/ShapeStyle";
import { Circle } from "@samdravitzki/dufus-engine/src/parts/p5/shape-components";
import { Speed, Velocity } from "../components";

const ballTag = tag("ball");

function createBall(position: Vector) {
  return createBundle([
    ballTag(),
    Circle({
      radius: 5,
    }),
    ShapeStyle({
      stroke: [240, 60, 100],
      strokeWeight: 2,
    }),
    Position({
      position,
    }),
    Velocity(new Vector(-0.5, -0.5)),
    Speed(5),
    Collider({
      type: "aabb",
      width: 10,
      height: 10,
    }),
  ]);
}

export default createBall;
