import { EngineBuilder } from "../ecs/core/Engine/Engine";
import primitiveRenderer from "../ecs/parts/primitive-renderer/primitive-renderer";

const engine = EngineBuilder.create().build(
  document.getElementById("poisson-disc-sampling-sketch")!
);

engine.part(primitiveRenderer);

engine.run();
