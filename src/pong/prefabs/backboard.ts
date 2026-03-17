import createBundle from "../../ecs/core/Bundle/createBundle";
import Vector from "../../ecs/core/Vector/Vector";

function createBackboard(
  position: Vector,
  width: number,
  height: number,
  owner: "player" | "ai"
) {
  return createBundle([
    {
      name: "primitive",
      fill: [352, 94, 100],
      type: "square",
      width,
      height,
    },
    {
      name: "position",
      position,
    },
    {
      name: "collider",
      type: "aabb",
      layer: "wall",
      width,
      height,
    },
    {
      name: "backboard",
      owner,
    },
  ]);
}

export default createBackboard;
