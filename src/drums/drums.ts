import * as Tone from "tone";
import { EngineBuilder } from "../ecs/core/Engine/Engine";
import createBundle from "../ecs/core/Bundle/createBundle";
import Vector from "../ecs/core/Vector/Vector";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";
import randomInt from "../lib/randomInt/randomInt";
import { PrimitiveShape } from "../ecs/parts/primitive-renderer/components/Primitive";
import Component from "../ecs/core/Component/Component";

const drums = EngineBuilder.create().build();

/**
 * Used Drumhaus (https://github.com/mxfng/drumhaus/tree/main) an in browser
 * drum machine based on tonejs alot as a reference for this
 */

drums.part(primitiveRenderer);

const clap = new Tone.Sampler({
  urls: {
    ["C2"]: "./samples/drumhaus-paris/paris_clap.wav",
  },
}).toDestination();

drums.system("drum", { event: "keypress" }, (_world, { p }) => {
  clap.triggerAttackRelease("C2", "1n");
});

drums.system(
  "emoji-spawner",
  { event: "keypress" },
  (world, { canvasBounds }) => {
    const position = Vector.create(
      randomInt(canvasBounds.max.x - canvasBounds.min.x),
      randomInt(canvasBounds.max.y - canvasBounds.min.y)
    );

    const clapEmoji = createBundle([
      "emoji",
      {
        name: "position",
        position,
      },
      {
        name: "primitive",
        fill: [240, 60, 100, 255],
        type: "text",
        text: "👏",
        align: "left",
        size: 25,
      },
    ]);

    world.addBundle(clapEmoji);
  }
);

export type EmojiComponent = Component & {
  name: "emoji";
};

/**
 * Fade out any emoji entities over time and when they are no
 * longer visible remove them
 */
drums.system("emoji-fade", { event: "update" }, (world, { p }) => {
  for (const [primitive, entityId] of world.query<
    [PrimitiveShape, string, EmojiComponent]
  >(["primitive", "entity-id", "emoji"])) {
    if (primitive.fill) {
      const [r, g, b, alpha] = primitive.fill;

      const fadeSpeed = 0.4;
      const newAlpha = alpha - p.deltaTime * fadeSpeed;

      if (newAlpha <= 0) {
        world.removeEntity(entityId);
      }

      primitive.fill = [r, g, b, newAlpha];
    }
  }
});

export default drums;
