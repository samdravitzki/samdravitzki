import Bounds from "../../ecs/core/Bounds/Bounds";
import createBundle from "../../ecs/core/Bundle/createBundle";
import Engine from "../../ecs/core/Engine/Engine";
import { ResourcePool } from "../../ecs/core/Engine/ResourcePool";
import { onStart, onUpdate } from "../../ecs/core/Engine/SystemTrigger";
import State from "../../ecs/core/State/State";
import Vector from "../../ecs/core/Vector/Vector";
import World from "../../ecs/core/World/World";
import { PrimitiveShape } from "../../ecs/parts/p5/primitive-renderer/components/Primitive";

export type Keypress = {
  key: string;
  time: number;
};

export default function bpmCounterPart<T extends { bpm: number }>(
  engine: Engine<T>
) {
  function setupBpmText(world: World, resources: ResourcePool) {
    const canvasBounds = resources.get<Bounds>("canvas-bounds");
    const textBundle = createBundle([
      "bpm-text",
      {
        name: "position",
        position: canvasBounds.top.left.plus(Vector.create(10, 30)),
      },
      {
        name: "primitive",
        fill: [240, 60, 100, 255],
        type: "text",
        text: "0",
        align: "left",
        size: 25,
      },
    ]);

    world.addBundle(textBundle);
  }

  function updateBpmText(world: World, {}, state: { bpm: State<number> }) {
    const [bpmText] = world.query<[PrimitiveShape]>([
      "primitive",
      "bpm-text",
    ])[0];

    if (bpmText.type === "text") {
      // Each press atm triggers two beats atm (all the second beats triggered by a keypress is empty atm)
      const halfBpm = Math.round(state.bpm.value);

      bpmText.text = `${halfBpm.toString()} bpm`;
    }
  }

  engine.system("bpm-text", onStart(), setupBpmText);
  engine.system("bpm-counter", onUpdate(), updateBpmText);
}
