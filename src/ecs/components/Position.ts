import Vector from "../../Vector/Vector";
import Component from "../core/Component/Component";

export type Position = Component & {
  name: "position";
  position: Vector;
};
