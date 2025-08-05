import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";

function createScore(
  position: Vector,
  align: "left" | "right",
  type: "player-score" | "ai-score"
) {
  return createBundle([
    type,
    {
      name: "position",
      position,
    },
    {
      name: "primitive",
      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
      type: "text",
      text: "0",
      align,
      size: 25,
    },
  ]);
}

export default createScore;
