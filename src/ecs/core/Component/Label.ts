import Component from "./Component";

/**
 * Component used give entities a label. Used for debugging and development purposes.
 */
type Label = Component & {
  name: "label";
  text: string;
};

export default Label;
