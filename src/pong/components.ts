import Component, { component } from "../ecs/core/Component/Component";
import Vector from "../ecs/core/Vector/Vector";

// export type Velocity = Component & {
//   name: "velocity";
//   velocity: Vector;
// };

export const Velocity = component<Vector>({ name: "velocity" });

// export type Speed = {
//   name: "speed";
//   value: number;
// };

export const Speed = component<number>({ name: "speed" });

export const BackboardOwner = component<"player" | "ai">({
  name: "backboard-owner",
});

// export type BackboardComponent = Component & {
//   name: "backboard";
//   owner: "player" | "ai";
// };
