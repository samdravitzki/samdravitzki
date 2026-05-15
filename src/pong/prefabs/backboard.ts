import { Position } from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { Collider } from "../../ecs/parts/collision/components/Collider";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "../../ecs/parts/p5/shape-components";

function createBackboard(
  position: Vector,
  width: number,
  height: number,
  owner: "player" | "ai",
) {
  return createBundle([
    {
      name: "square",
      width,
      height,
    } satisfies Square,
    {
      name: "shape-style",
      fill: [352, 94, 100],
    } satisfies ShapeStyle,
    {
      name: "position",
      position,
    } satisfies Position,
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width,
      height,
    } satisfies Collider,
    {
      name: "backboard",
      owner,
    },
  ]);
}

export default createBackboard;
