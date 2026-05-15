import Vector from "../../core/Vector/Vector";

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
