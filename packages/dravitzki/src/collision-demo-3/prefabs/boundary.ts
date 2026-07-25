import {
  Vector,
  createBundle,
  Position,
  Label,
  Bundle,
} from "@dravitzki/dufus-engine";
import { Collider } from "@dravitzki/dufus-engine/parts/collision";
import { Square, ShapeStyle } from "@dravitzki/dufus-engine/parts/p5";

function boundary(position: Vector, width: number, height: number): Bundle[] {
  const borderInset = 50;

  const border = createBundle([
    Position({
      position: position,
    }),
    Square({
      width: width - borderInset,
      height: height - borderInset,
    }),
    ShapeStyle({
      stroke: "#ffffff78",
      strokeWeight: 3,
    }),
    Label({
      text: "border",
    }),
  ]);

  const outerBorder = createBundle([
    Position({
      position: position,
    }),
    Square({
      width: width - borderInset + 10,
      height: height - borderInset + 10,
    }),
    ShapeStyle({
      stroke: "#ffffff78",
      strokeWeight: 2,
    }),
    Label({
      text: "outer-border",
    }),
  ]);

  return [outerBorder, border];
}

export default boundary;
