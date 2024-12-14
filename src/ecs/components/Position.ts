import Vector from "../core/Vector/Vector";
import Component from "../core/Component/Component";

export type Position = Component & {
  name: "position";
  position: Vector;
};
