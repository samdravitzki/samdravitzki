import { Position } from "../ecs/components/Position";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import { Part } from "../ecs/core/Part/Part";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Text } from "../ecs/parts/p5/shape-components";
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
      const text: Text = {
        name: "text",
        text: node.name[0].toUpperCase(),
        align: "center",
        size: 20,
      };

      const style: ShapeStyle = {
        name: "shape-style",
        fill: [240, 60, 100, 255],
      };

      const centerOffset = Vector.create((array.length - 1) * 30, 0);

      const position: Position = {
        name: "position",
        position: canvasBounds.center.bottom
          .plus(Vector.create(index * 60, -50))
          .minus(centerOffset),
      };

      world.addBundle(
        createBundle([
          `gear-text`,
          `gear-text-${node.name}`,
          text,
          position,
          style,
        ]),
      );
    });
}

function currentGearDisplay(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const gearTextQuery = world.query<[ShapeStyle, string]>([
    "shape-style",
    "entity-id",
    "gear-text",
  ]);

  for (const [gearTextStyle, entityId] of gearTextQuery) {
    if (
      world
        .entity(entityId)
        .getComponent(`gear-text-${state["shift-position"].value.name}`)
    ) {
      gearTextStyle.fill = [240, 60, 100, 255];
    } else {
      gearTextStyle.fill = [0, 0, 25, 255];
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
