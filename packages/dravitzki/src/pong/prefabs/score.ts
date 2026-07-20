import { tag, Vector, createBundle, Position } from "@dravitzki/dufus-engine";
import { ShapeStyle, Typography } from "@dravitzki/dufus-engine/parts/p5";

export const playerScoreTag = tag("player-score");
export const aiScoreTag = tag("ai-score");

function createScore(
  position: Vector,
  align: "left" | "right",
  type: "player-score" | "ai-score",
) {
  return createBundle([
    type === "player-score" ? playerScoreTag() : aiScoreTag(),
    Position({
      position,
    }),
    Typography({
      text: "0",
      align,
      size: 25,
    }),
    ShapeStyle({
      stroke: [240, 60, 100],
      strokeWeight: 2,
      fill: [240, 60, 100],
    }),
  ]);
}

export default createScore;
