import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { Part } from "../ecs/core/Part/Part";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import GateNode from "./gate";

function setupGearText(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const text: PrimitiveShape = {
    name: "primitive",
    fill: [240, 60, 100, 255],
    type: "text",
    text: state["shift-position"].value.name,
    align: "center",
    size: 20,
  };

  const position: Position = {
    name: "position",
    position: canvasBounds.center.top.plus(Vector.create(0, 50)),
  };

  world.addBundle(createBundle(["gear-text", text, position]));
}

function currentGearDisplay(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const [gearText] = world.query<[PrimitiveShape]>([
    "primitive",
    "gear-text",
  ])[0];

  if (gearText.type === "text") {
    gearText.text = state["shift-position"].value.name;
  }
}

function gearText() {
  const part: Part<
    { setup: void; update: void },
    { "shift-position": GateNode }
  > = ({ registerSystem, triggerBuilder }) => {
    registerSystem("setupGearText", triggerBuilder.on("setup"), setupGearText);

    registerSystem(
      "display-gear",
      triggerBuilder.on("update"),
      currentGearDisplay,
    );
  };
}
