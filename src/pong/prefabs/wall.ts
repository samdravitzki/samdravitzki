import { Position } from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";

function createWall(position: Vector, width: number, height: number) {
  return createBundle([
    {
      name: "square",
      width,
      height,
    } satisfies Square,
    {
      name: "shape-style",
      fill: [240, 60, 100],
    } satisfies ShapeStyle,
    {
      name: "collider",
      layer: "wall",
      type: "aabb",
      width: width,
      height: height,
    } satisfies Collider,
    {
      name: "position",
      position,
    } satisfies Position,
  ]);
}

export default createWall;
