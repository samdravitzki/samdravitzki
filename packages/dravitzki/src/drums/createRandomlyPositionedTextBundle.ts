import {
  tag,
  Bounds,
  Vector,
  createBundle,
  Position,
} from "@dravitzki/dufus-engine";
import randomInt from "../lib/randomInt/randomInt";
import { ShapeStyle, Typography } from "@dravitzki/dufus-engine/parts/p5";

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
    Typography({
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
