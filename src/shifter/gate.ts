import Vector from "../ecs/core/Vector/Vector";

type GatePosition =
  | "neutral"
  | "1st"
  | "2nd"
  | "3rd"
  | "4th"
  | "5th"
  | "reverse"
  | "pass";

type Direction = "up" | "down" | "left" | "right";

type Neighbour = {
  dir: Direction;
  node: GateNode;
};

class GateNode {
  neighbours: Readonly<Neighbour>[] = [];

  constructor(
    public readonly name: GatePosition,
    public readonly position: Vector,
  ) {}

  neighborInDirection(dir: Direction): GateNode | undefined {
    return this.neighbours.find((neighbour) => neighbour.dir === dir)?.node;
  }

  toString() {
    return this.name;
  }
}

const first = new GateNode("1st", Vector.create(-60, -100));
const second = new GateNode("2nd", Vector.create(-60, 100));
const passLeft = new GateNode("pass", Vector.create(-60, 0));
const third = new GateNode("3rd", Vector.create(0, -100));
const fourth = new GateNode("4th", Vector.create(0, 100));
const fifth = new GateNode("5th", Vector.create(60, -100));
const reverse = new GateNode("reverse", Vector.create(60, 100));
const passRight = new GateNode("pass", Vector.create(60, 0));
const neutral = new GateNode("neutral", Vector.create(0, 0));

first.neighbours.push({ dir: "down", node: passLeft });
second.neighbours.push({ dir: "up", node: passLeft });
third.neighbours.push({ dir: "down", node: neutral });
fourth.neighbours.push({ dir: "up", node: neutral });
fifth.neighbours.push({ dir: "down", node: passRight });
reverse.neighbours.push({ dir: "up", node: passRight });

passLeft.neighbours.push({ dir: "up", node: first });
passLeft.neighbours.push({ dir: "down", node: second });
passLeft.neighbours.push({ dir: "right", node: neutral });

passRight.neighbours.push({ dir: "up", node: fifth });
passRight.neighbours.push({ dir: "down", node: reverse });
passRight.neighbours.push({ dir: "left", node: neutral });

neutral.neighbours.push({ dir: "up", node: third });
neutral.neighbours.push({ dir: "down", node: fourth });
neutral.neighbours.push({ dir: "left", node: passLeft });
neutral.neighbours.push({ dir: "right", node: passRight });

const commonGate = {
  neutral,
  first,
  passLeft,
  second,
  third,
  fourth,
  fifth,
  passRight,
  reverse,
} as const;

/**
 * Calcuate the path of nodes in the given direction until no more nodes
 * are found in that direction. The returned path includes the starting node.
 * @param from start node
 * @param dir direction to traverse
 * @returns list of nodes in the given direction, starting with the provided node
 */
function nodesInDirection(from: GateNode, dir: Direction) {
  let current = from;
  const path = [current];
  while (current.neighbours.some((neighbour) => neighbour.dir === dir)) {
    const next = current.neighbours.find((neighbour) => neighbour.dir === dir)!;

    path.push(next.node);
    current = next.node;
  }

  return path;
}

function shortestPath(from: GateNode, to: GateNode) {
  const queue = [from];
  const explored = new Set([from]);
  const parentTree: Map<GateNode, GateNode> = new Map();

  while (queue.length > 0) {
    const vert = queue.pop()!;

    if (vert === to) {
      // Build path if discovered target
      const path = [vert];
      let step = vert;
      while (step !== from) {
        const parent = parentTree.get(step)!;
        path.unshift(parent);
        step = parent;
      }

      return path;
    }

    for (const neighbour of vert.neighbours) {
      const adjacentNode = neighbour.node;

      if (!explored.has(adjacentNode)) {
        explored.add(adjacentNode);
        queue.unshift(adjacentNode);
        parentTree.set(adjacentNode, vert);
      }
    }
  }

  return [];
}

export default GateNode;
export { commonGate, shortestPath, nodesInDirection };
export type { GatePosition as GatePosition, Direction, Neighbour };
