import Vector from "../ecs/core/Vector/Vector";

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

export default Path;
