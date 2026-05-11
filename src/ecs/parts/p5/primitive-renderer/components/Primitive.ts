import Vector from "../../../../core/Vector/Vector";
import Component from "../../../../core/Component/Component";

export type Color = number[] | string;

export type Circle = {
  name: "circle";
  radius: number;
};

export type Line = {
  name: "line";
  start: Vector;
  end: Vector;
};

export type Square = {
  name: "square";
  width: number;
  height: number;
  borderRadius?: number;
};

export type Text = {
  name: "text";
  align: "left" | "right" | "center";
  size: number;
  text: string;
  font?: string;
};

export type ShapeStyle = {
  name: "shape-style";
  stroke?: Color;
  strokeWeight?: number;
  fill?: Color; // Fill doesn't make sense for line
  dash?: number[];
  dashOffset?: number;
};

export type PrimitiveShape = Component & {
  name: "primitive";
  stroke?: Color;
  strokeWeight?: number;
  fill?: false | Color; // Fill doesn't make sense for line
  dash?: number[];
  dashOffset?: number;
} & (
    | {
        type: "circle";
        radius: number;
      }
    | {
        type: "line";
        start: Vector;
        end: Vector;
      }
    | {
        type: "square";
        width: number;
        height: number;
        borderRadius?: number;
      }
    | {
        type: "text";
        align: "left" | "right" | "center";
        size: number;
        text: string;
        font?: string;
      }
  );
