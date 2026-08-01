import { createBundle, Label, Position, Vector } from "@dravitzki/dufus-engine";
import { Circle, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";

export function coin(position: Vector, radius: number) {
  // TODO: rename bundles to prefabs, that you add to the world by calling world.add(prefab)
  return createBundle([
    Position({
      position: position,
    }),
    Circle({
      radius: radius,
    }),
    ShapeStyle({
      fill: "#DAA520",
      strokeWeight: 2,
    }),
    Label({
      text: "coin",
    }),
  ]);
}
