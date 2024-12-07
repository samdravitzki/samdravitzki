import createBundle from "../../ecs/Bundle/createBundle";
import Vector from "../../Vector/Vector";
import engine from "../pong-engine";

engine.system("setupBall", { event: "start" }, (world) => {
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
      position: new Vector(300, 200),
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
