import createBundle from "../Bundle/createBundle";
import Vector from "../Vector/Vector";
import World from "../World/World";
import {
  Line,
  ShapeStyle,
} from "../../parts/p5/primitive-renderer/components/Primitive";

type PathEdge = { start: Vector; end: Vector };

class Path {
  constructor(private readonly path: Vector[]) {}

  edges() {
    const edges: PathEdge[] = [];

    for (let i = 0; i < this.path.length - 1; i++) {
      edges.push({ start: this.path[i], end: this.path[i + 1] });
    }

    return edges;
  }
}

export function drawDebugPath(
  world: World,
  position: Vector,
  path: Path,
  color: [number, number, number],
  dash: number[] | undefined = undefined,
) {
  for (const edge of path.edges()) {
    world.addBundle(
      createBundle([
        "path-vis",
        {
          name: "position",
          position: position,
        },
        {
          name: "line",
          start: edge.start,
          end: edge.end,
        } satisfies Line,
        {
          name: "shape-style",
          stroke: color,
          strokeWeight: 2,
          dash,
        },
      ]),
    );
  }
}

export default Path;
