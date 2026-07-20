import GateNode, { commonGate } from "./gate";
import {
  World,
  ResourcePool,
  State,
  Bounds,
  Vector,
  Position,
  createBundle,
  tag,
  Part,
} from "@dravitzki/dufus-engine";
import { ShapeStyle, Text } from "@dravitzki/dufus-engine/parts/p5";

function setupGearText(
  world: World,
  resources: ResourcePool,
  state: { "shift-position": State<GateNode> },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  Object.values(commonGate)
    .filter((node) => node.name !== "pass")
    .forEach((node, index, array) => {
      const text = Text({
        text: node.name[0].toUpperCase(),
        align: "center",
        size: 20,
      });

      const style = ShapeStyle({
        fill: [240, 60, 100, 255],
      });

      const centerOffset = Vector.create((array.length - 1) * 30, 0);

      const position = Position({
        position: canvasBounds.center.bottom
          .plus(Vector.create(index * 60, -50))
          .minus(centerOffset),
      });

      world.addBundle(
        createBundle([
          tag("gear-text")(),
          tag(`gear-text-${node.name}`)(),
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
  const gearTextQuery = world.query([ShapeStyle, "entity-id", "gear-text"]);

  for (const [gearTextStyle, entityId] of gearTextQuery) {
    if (
      world
        .entity(entityId)
        .getComponent(`gear-text-${state["shift-position"].value.name}`)
    ) {
      gearTextStyle.componentData.fill = [240, 60, 100, 255];
    } else {
      gearTextStyle.componentData.fill = [0, 0, 25, 255];
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
