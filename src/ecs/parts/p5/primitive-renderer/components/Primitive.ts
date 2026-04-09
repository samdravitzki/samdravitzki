import Vector from "../../../../core/Vector/Vector";
import Component from "../../../../core/Component/Component";

export type Color = number[] | string;

export type PrimitiveShape = Component & {
  name: "primitive";
  stroke?: Color;
  strokeWeight?: number;
  fill: false | Color; // Fill doesn't make sense for line
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
      }
    | {
        type: "text";
        align: "left" | "right" | "center";
        size: number;
        text: string;
      }
  );
