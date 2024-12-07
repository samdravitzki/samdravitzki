import Component from "../../../core/Component/Component";

export type Collider = Component & {
  name: "collider";
  layer?: string;
} & {
  type: "aabb"; // Axis-aligned bounding box (Just a rectangle that doesnt rotate)
  width: number;
  height: number;
};
