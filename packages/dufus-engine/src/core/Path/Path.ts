import createBundle from "../Bundle/createBundle";
import Vector from "../Vector/Vector";
import World from "../World/World";
import { ShapeStyle } from "../../parts/p5/primitive-renderer/ShapeStyle";
import { Line } from "../../parts/p5/shape-components";
import { Position } from "../../components";

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
        Position({
          position: position,
        }),
        Line({
          start: edge.start,
          end: edge.end,
        }),
        ShapeStyle({
          stroke: color,
          strokeWeight: 2,
          dash,
        }),
      ]),
    );
  }
}

export default Path;
