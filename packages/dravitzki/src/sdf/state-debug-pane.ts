import p5 from "p5";
import { Pane } from "tweakpane";
import { ResourcePool } from "@dravitzki/dufus-engine/src/core/Engine/ResourcePool";
import World from "@dravitzki/dufus-engine/src/core/World/World";
import Bounds from "@dravitzki/dufus-engine/src/core/Bounds/Bounds";
import State from "@dravitzki/dufus-engine/src/core/State/State";

function stateDebugPaneSystem(
  world: World,
  resources: ResourcePool,
  state: {
    "sdf-renderer:debug": State<boolean>;
    "sdf-renderer:enabled": State<boolean>;
  },
) {
  const p = resources.get<p5>("p5");
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const debugGui = p.createDiv();
  debugGui.position(0, canvasBounds.max.y + 40, "absolute");
  debugGui.style("width", canvasBounds.width + "px");

  const pane = new Pane({
    container: debugGui.elt,
    title: "Signed distance functions",
  });

  type BindableState = {
    [K in keyof typeof state]: (typeof state)[K] extends State<infer U>
      ? U
      : never;
  };

  const bindableState = Object.fromEntries(
    Object.entries(state).map(([key, state]) => [key, state.value]),
  ) as BindableState;

  const proxiedBindableState = new Proxy(bindableState, {
    set(target, prop: keyof BindableState, value: BindableState[typeof prop]) {
      state[prop].setValue(value);
      target[prop] = value;
      return true;
    },
  });

  for (const key of Object.keys(bindableState)) {
    const binableStateKey = key as keyof BindableState;
    pane.addBinding(proxiedBindableState, binableStateKey);
  }

  return () => pane.dispose();
}

export default stateDebugPaneSystem;
