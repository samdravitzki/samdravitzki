import Component, { component } from "../ecs/core/Component/Component";
import Vector from "../ecs/core/Vector/Vector";

export const Velocity = component<Vector>({ name: "velocity" });

export const Speed = component<number>({ name: "speed" });

export const BackboardOwner = component<"player" | "ai">({
  name: "backboard-owner",
});
