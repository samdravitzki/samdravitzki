import { component } from "../core/Component/Component";

/**
 * Component used give entities a label. Used for debugging and development purposes.
 */
type LabelData = {
  text: string;
};

const Label = component<LabelData>({ name: "label" });

export default Label;
export { type LabelData };
