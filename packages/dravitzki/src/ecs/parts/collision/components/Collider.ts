import { component } from "../../../core/Component/Component";

export type ColliderData = {
  layer?: string;
} & {
  type: "aabb"; // Axis-aligned bounding box (Just a rectangle that doesnt rotate)
  width: number;
  height: number;
};

export const Collider = component<ColliderData>({ name: "collider" });
