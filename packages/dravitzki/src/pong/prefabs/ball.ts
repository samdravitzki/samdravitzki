import { Collider } from "@dravitzki/dufus-engine/parts/collision";
import { Circle, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
import { Speed, Velocity } from "../components";
import { tag, Vector, createBundle, Position } from "@dravitzki/dufus-engine";

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
