import Component from "../../../core/Component/Component";

export type Color = number[] | string;

export type ShapeStyle = Component & {
  name: "shape-style";
  stroke?: Color;
  strokeWeight?: number;
  fill?: Color; // Fill doesn't make sense for line
  dash?: number[];
  dashOffset?: number;
};
