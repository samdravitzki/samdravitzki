import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { Part } from "../ecs/core/Part/Part";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import { PrimitiveShape } from "../ecs/parts/p5/primitive-renderer/components/Primitive";
import GateNode, { commonGate } from "./gate";

function setupGearText(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  Object.values(commonGate)
    .filter((node) => node.name !== "pass")
    .forEach((node, index, array) => {
      const text: PrimitiveShape = {
        name: "primitive",
        fill: [240, 60, 100, 255],
        type: "text",
        text: node.name[0].toUpperCase(),
        align: "center",
        size: 20,
      };

      const centerOffset = Vector.create((array.length - 1) * 30, 0);

      const position: Position = {
        name: "position",
        position: canvasBounds.center.top
          .plus(Vector.create(index * 60, 50))
          .minus(centerOffset),
      };

      world.addBundle(
        createBundle([`gear-text`, `gear-text-${node.name}`, text, position]),
      );
    });
}

function currentGearDisplay(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const gearTextQuery = world.query<[PrimitiveShape, string]>([
    "primitive",
    "entity-id",
    "gear-text",
  ]);

  for (const [gearText, entityId] of gearTextQuery) {
    if (
      world
        .entity(entityId)
        .getComponent(`gear-text-${state["shift-position"].value.name}`)
    ) {
      gearText.fill = [240, 60, 100, 255];
    } else {
      gearText.fill = [0, 0, 25, 255];
    }
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

  return part;
}

export default gearText;
