import Position from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";

function createWall(position: Vector, width: number, height: number) {
  return createBundle([
    Square({
      width,
      height,
    }),
    ShapeStyle({
      fill: [240, 60, 100],
    }),
    Collider({
      layer: "wall",
      type: "aabb",
      width: width,
      height: height,
    }),
    Position({
      position,
    }),
  ]);
}

export default createWall;
