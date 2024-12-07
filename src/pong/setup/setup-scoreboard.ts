import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../Vector/Vector";
import Engine from "../Engine";

function setupScoreboardPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  engine.system("setupScoreboard", { event: "start" }, (world) => {
    const playerScoreBundle = createBundle([
      "player-score",
      {
        name: "position",
        position: new Vector(245, 35),
      },
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: "text",
        text: "0",
        align: "right",
        size: 25,
      },
    ]);

    const aiScoreBundle = createBundle([
      "ai-score",
      {
        name: "position",
        position: new Vector(255, 35),
      },
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: [240, 60, 100],
        type: "text",
        text: "0",
        align: "left",
        size: 25,
      },
    ]);

    world.addBundle(playerScoreBundle);
    world.addBundle(aiScoreBundle);
  });
}

export default setupScoreboardPart;
