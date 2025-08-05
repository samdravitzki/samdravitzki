import Vector from "../../ecs/core/Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";
import World from "../../ecs/core/World/World";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import Bounds from "../../ecs/core/Bounds/Bounds";
import createScore from "../prefabs/score";

function setupScoreboardPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  function setupScoreboard(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const scoreXOffset = 5;
    const scoreYOffset = 35;

    const playerScoreBundle = createScore(
      new Vector(
        canvasBounds.max.x / 2 - scoreXOffset,
        canvasBounds.min.y + scoreYOffset
      ),
      "right",
      "player-score"
    );

    const aiScoreBundle = createScore(
      new Vector(
        canvasBounds.max.x / 2 + scoreXOffset,
        canvasBounds.min.y + scoreYOffset
      ),
      "left",
      "ai-score"
    );

    world.addBundle(playerScoreBundle);
    world.addBundle(aiScoreBundle);
  }

  engine.system("setupScoreboard", { event: "start" }, setupScoreboard);
}

export default setupScoreboardPart;
