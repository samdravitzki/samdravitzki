import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../ecs/parts/p5/shape-components";
import randomInt from "../lib/randomInt/randomInt";

export function createRandomlyPositionedTextBundle(
  text: string,
  canvasBounds: Bounds,
) {
  const position = Vector.create(
    randomInt(canvasBounds.max.x - canvasBounds.min.x) + canvasBounds.min.x,
    randomInt(canvasBounds.max.y - canvasBounds.min.y) + canvasBounds.min.y,
  );

  const textBundle = createBundle([
    "faded",
    {
      name: "position",
      position,
    } satisfies Position,
    {
      name: "text",
      text: text,
      align: "left",
      size: 25,
    } satisfies Text,
    {
      name: "shape-style",
      fill: [240, 60, 100, 255],
    } satisfies ShapeStyle,
  ]);

  return textBundle;
}
