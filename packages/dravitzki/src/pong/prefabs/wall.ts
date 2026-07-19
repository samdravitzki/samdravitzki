import Position from "@samdravitzki/dufus-engine/src/components/Position";
import createBundle from "@samdravitzki/dufus-engine/src/core/Bundle/createBundle";
import Vector from "@samdravitzki/dufus-engine/src/core/Vector/Vector";
import { Collider } from "@samdravitzki/dufus-engine/src/parts/collision/components/Collider";
import { ShapeStyle } from "@samdravitzki/dufus-engine/src/parts/p5/primitive-renderer/ShapeStyle";
import { Square } from "@samdravitzki/dufus-engine/src/parts/p5/shape-components";

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
