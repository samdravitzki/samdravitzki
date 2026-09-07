import { component } from "../core/Component/Component";

export type RotationData = {
  rotation: number;
};

export const Rotation = component<RotationData>({ name: "rotation" });
