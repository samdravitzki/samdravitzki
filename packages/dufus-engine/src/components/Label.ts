import { component } from "../core/Component/Component";

/**
 * Component used give entities a label. Used for debugging and development purposes.
 */
export type LabelData = {
  text: string;
};

export const Label = component<LabelData>({ name: "label" });
