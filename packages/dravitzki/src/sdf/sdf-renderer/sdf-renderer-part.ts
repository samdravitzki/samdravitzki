import { Part } from "@samdravitzki/dufus-engine/src/core/Part/Part";
import sdfRendererSystem, { sdfRendererSetupSystem } from "./sdf-renderer";

function sdfRendererPart() {
  const part: Part<
    {
      setup: void;
      "after-update": void;
    },
    {
      "sdf-renderer:debug": boolean;
      "sdf-renderer:enabled": boolean;
    }
  > = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "sdf-renderer-setup",
      triggerBuilder.on("setup"),
      sdfRendererSetupSystem,
    );
    registerSystem(
      "sdf-renderer",
      triggerBuilder.on("after-update"),
      sdfRendererSystem,
    );
  };

  return part;
}

export default sdfRendererPart;
