import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";

function createBall(position: Vector) {
  return createBundle([
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
      position,
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
}

export default createBall;