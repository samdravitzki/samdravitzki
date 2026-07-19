import Position from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";
import { BackboardOwner } from "../components";

function createBackboard(
  position: Vector,
  width: number,
  height: number,
  owner: "player" | "ai",
) {
  return createBundle([
    Square({
      width,
      height,
    }),
    ShapeStyle({
      fill: [352, 94, 100],
    }),
    Position({
      position,
    }),
    Collider({
      type: "aabb",
      layer: "wall",
      width,
      height,
    }),
    BackboardOwner(owner),
  ]);
}

export default createBackboard;
