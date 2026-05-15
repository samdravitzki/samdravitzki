import { Position } from "../../ecs/components/Position";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import { ShapeStyle } from "../../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../../ecs/parts/p5/shape-components";

function createScore(
  position: Vector,
  align: "left" | "right",
  type: "player-score" | "ai-score",
) {
  return createBundle([
    type,
    {
      name: "position",
      position,
    } satisfies Position,
    {
      name: "text",
      text: "0",
      align,
      size: 25,
    } satisfies Text,
    {
      name: "shape-style",
      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
    } satisfies ShapeStyle,
  ]);
}

export default createScore;
