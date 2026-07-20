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

  const walls: [number, number][] = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
  ];

  const wallThickness = 20;

  const wallColliders = walls.map(([x, y]) => {
    const wallWidth = x !== 0 ? wallThickness : width - borderInset;
    const wallHeight = y !== 0 ? wallThickness : height - borderInset;

    const wallPosition = new Vector(
      position.x + (x * (width - borderInset + wallWidth)) / 2,
      position.y + (y * (height - borderInset + wallHeight)) / 2,
    );

    return createBundle([
      Position({
        position: wallPosition,
      }),
      Collider({
        type: "aabb",
        width: wallWidth,
        height: wallHeight,
      }),
      Label({
        text: "wall-collider",
      }),
    ]);
  });

  return [outerBorder, border, ...wallColliders];
}

export default boundary;
