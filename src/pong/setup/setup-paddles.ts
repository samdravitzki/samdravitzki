import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";

function setupPaddlesPart<T extends Record<string, unknown>>(
  engine: Engine<T>
) {
  engine.system("setupPaddles", { event: "start" }, (world) => {
    const paddleSize = 40;

    const playerPaddleBundle = createBundle([
      "player",
      "paddle",
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: 5,
        height: paddleSize,
      },
      {
        name: "position",
        position: new Vector(10, 50),
      },
      {
        name: "collider",
        type: "aabb",
        layer: "wall",
        width: 5,
        height: paddleSize,
      },
    ]);

    // The position the ai paddle is aiming to end up in
    const aiPaddleTarget = createBundle([
      "ai-paddle-target",
      {
        name: "position",
        position: new Vector(0, 0),
      },
    ]);

    const aiPaddleBundle = createBundle([
      "ai",
      "paddle",
      {
        name: "primitive",
        fill: [240, 60, 100],
        type: "square",
        width: 5,
        height: paddleSize,
      },
      {
        name: "position",
        position: new Vector(490, 70),
      },
      {
        name: "speed",
        value: 0.01,
      },
      {
        name: "collider",
        type: "aabb",
        width: 5,
        height: paddleSize,
      },
    ]);

    world.addBundle(aiPaddleTarget);
    world.addBundle(playerPaddleBundle);
    world.addBundle(aiPaddleBundle);
  });
}

export default setupPaddlesPart;
