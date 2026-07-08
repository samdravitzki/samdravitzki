import { component } from "../../core/Component/Component";
import Vector from "../../core/Vector/Vector";

export type CircleData = {
  radius: number;
};

export type LineData = {
  start: Vector;
  end: Vector;
};
export type SquareData = {
  width: number;
  height: number;
  borderRadius?: number;
};
export type TextData = {
  align: "left" | "right" | "center";
  size: number;
  text: string;
  font?: string;
};

export const Circle = component<CircleData>({ name: "circle" });
export const Line = component<LineData>({ name: "line" });
export const Square = component<SquareData>({ name: "square" });
export const Text = component<TextData>({ name: "text" });
