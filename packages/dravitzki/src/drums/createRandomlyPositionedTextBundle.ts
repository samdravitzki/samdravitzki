import Position from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { tag } from "../ecs/core/Component/Component";
import Vector from "../ecs/core/Vector/Vector";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../ecs/parts/p5/shape-components";
import randomInt from "../lib/randomInt/randomInt";

export const fadedTag = tag("faded");

export function createRandomlyPositionedTextBundle(
  text: string,
  canvasBounds: Bounds,
) {
  const position = Vector.create(
    randomInt(canvasBounds.max.x - canvasBounds.min.x) + canvasBounds.min.x,
    randomInt(canvasBounds.max.y - canvasBounds.min.y) + canvasBounds.min.y,
  );

  const textBundle = createBundle([
    fadedTag(),
    Position({
      position,
    }),
    Text({
      text: text,
      align: "left",
      size: 25,
    }),
    ShapeStyle({
      fill: [240, 60, 100, 255],
    }),
  ]);

  return textBundle;
}
