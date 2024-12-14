import Vector from "../ecs/core/Vector/Vector";

type DirectionValue = "north" | "east" | "south" | "west";

class Direction {
  readonly value: DirectionValue;

  constructor(value: DirectionValue) {
    this.value = value;
  }

  toVector(): Vector {
    switch (this.value) {
      case "north":
        return new Vector(0, -1);
      case "east":
        return new Vector(1, 0);
      case "south":
        return new Vector(0, 1);
      case "west":
        return new Vector(-1, 0);
    }
  }
}

export default Direction;
export type { DirectionValue };
