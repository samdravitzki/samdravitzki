import { Collider } from "@dravitzki/dufus-engine/parts/collision";
import { Square, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
import { BackboardOwner } from "../components";
import { Vector, createBundle, Position } from "@dravitzki/dufus-engine";

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
