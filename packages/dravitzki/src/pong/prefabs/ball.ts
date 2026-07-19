import Position from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import { tag } from "../../ecs/core/Component/Component";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Circle } from "../../ecs/parts/p5/shape-components";
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
