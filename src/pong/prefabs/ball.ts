import { Position } from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import {
  Circle,
  ShapeStyle,
} from "../../ecs/parts/p5/primitive-renderer/components/Primitive";

function createBall(position: Vector) {
  return createBundle([
    "ball",
    {
      name: "circle",
      radius: 5,
    } satisfies Circle,
    {
      name: "shape-style",
      stroke: [240, 60, 100],
      strokeWeight: 2,
    } satisfies ShapeStyle,
    {
      name: "position",
      position,
    } satisfies Position,
    {
      name: "velocity",
      velocity: new Vector(-0.5, -0.5),
    },
    {
      name: "speed",
      value: 5,
    },
    {
      name: "collider",
      type: "aabb",
      width: 10,
      height: 10,
    } satisfies Collider,
  ]);
}

export default createBall;
