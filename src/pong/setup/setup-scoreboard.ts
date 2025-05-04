import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import Bounds from "../../ecs/core/Bounds/Bounds";

function setupScoreboardPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  function setupScoreboard(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const scoreXOffset = 5;
    const scoreYOffset = 35;

    const playerScoreBundle = createBundle([
      "player-score",
      {
        name: "position",
        position: new Vector(
          canvasBounds.max.x / 2 - scoreXOffset,
          canvasBounds.min.y + scoreYOffset
        ),
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
        position: new Vector(
          canvasBounds.max.x / 2 + scoreXOffset,
          canvasBounds.min.y + scoreYOffset
        ),
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
  }

  engine.system("setupScoreboard", { event: "start" }, setupScoreboard);
}

export default setupScoreboardPart;
