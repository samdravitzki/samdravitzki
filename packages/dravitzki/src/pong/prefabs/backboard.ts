import Position from "@samdravitzki/dufus-engine/src/components/Position";
import createBundle from "@samdravitzki/dufus-engine/src/core/Bundle/createBundle";
import Vector from "@samdravitzki/dufus-engine/src/core/Vector/Vector";
import { Collider } from "@samdravitzki/dufus-engine/src/parts/collision/components/Collider";
import { ShapeStyle } from "@samdravitzki/dufus-engine/src/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "@samdravitzki/dufus-engine/src/parts/p5/shape-components";
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
