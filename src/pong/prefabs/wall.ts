import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";

function createWall(position: Vector, width: number, height: number) {
  return createBundle([
    {
      name: "primitive",
      fill: [240, 60, 100],
      type: "square",
      width,
      height,
    },
    {
      name: "collider",
      layer: "wall",
      type: "aabb",
      width: width,
      height: height,
    },
    {
      name: "position",
      position,
    },
  ]);
}

export default createWall;
