import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import randomInt from "../lib/randomInt/randomInt";

export function createRandomlyPositionedTextBundle(
  text: string,
  canvasBounds: Bounds
) {
  const position = Vector.create(
    randomInt(canvasBounds.max.x - canvasBounds.min.x) + canvasBounds.min.x,
    randomInt(canvasBounds.max.y - canvasBounds.min.y) + canvasBounds.min.y
  );

  const textBundle = createBundle([
    "faded",
    {
      name: "position",
      position,
    },
    {
      name: "primitive",
      fill: [240, 60, 100, 255],
      type: "text",
      text: text,
      align: "left",
      size: 25,
    },
  ]);

  return textBundle;
}
