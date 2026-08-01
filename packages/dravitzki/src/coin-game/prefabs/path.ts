import { createBundle, Label, Position, Vector } from "@dravitzki/dufus-engine";
import { Circle, Line, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";
export function pathNode(position: Vector) {
  return createBundle([
    Position({
      position: position,
    }),
    Label({
      text: "node",
    }),
    Circle({
      radius: 3,
    }),
    ShapeStyle({
      fill: "#ffffff",
    }),
  ]);
}

export function pathEdge(start: Vector, end: Vector) {
  const midPoint = start.plus(end).times(0.5);

  return createBundle([
    Position({
      position: midPoint,
    }),
    Label({
      text: "edge",
    }),
    Line({
      start: start.minus(midPoint),
      end: end.minus(midPoint),
    }),
    ShapeStyle({
      stroke: "#ffffff4f",
      dash: [5, 5],
      strokeWeight: 1,
    }),
  ]);
}
