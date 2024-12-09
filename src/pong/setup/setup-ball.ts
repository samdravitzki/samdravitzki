import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../Vector/Vector";
import Engine from "../../ecs/core/Engine/Engine";

function setupBallPart<T extends Record<string, unknown>>(engine: Engine<T>) {
  engine.system("setupBall", { event: "start" }, (world, { canvasBounds }) => {
    const ballBundle = createBundle([
      "ball",
      {
        name: "primitive",
        stroke: [240, 60, 100],
        strokeWeight: 2,
        fill: false,
        type: "circle",
        radius: 5,
      },
      {
        name: "position",
        position: new Vector(canvasBounds.max.x / 2, canvasBounds.max.y / 2),
      },
      {
        name: "velocity",
        velocity: new Vector(-0.5, -0.5),
      },
      {
        name: "speed",
        value: 5,
      },
      {
        name: "collider",
        type: "aabb",
        width: 10,
        height: 10,
      },
    ]);

    world.addBundle(ballBundle);
  });
}

export default setupBallPart;
