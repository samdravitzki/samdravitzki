import { component } from "../../../core/Component/Component";

// TODO: switch to only hex as tweakpane renders it by default and no need for the array form really
export type Color = number[] | string;

export type ShapeStyleData = {
  stroke?: Color;
  strokeWeight?: number;
  fill?: Color; // Fill doesn't make sense for line
  dash?: number[];
  dashOffset?: number;
};

export const ShapeStyle = component<ShapeStyleData>({ name: "shape-style" });
