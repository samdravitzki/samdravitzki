import { Vector, createBundle, Position } from "@dravitzki/dufus-engine";
import { Collider } from "@dravitzki/dufus-engine/parts/collision";
import { Square, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";

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
