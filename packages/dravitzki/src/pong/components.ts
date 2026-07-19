import Component, { component } from "@samdravitzki/dufus-engine/src/core/Component/Component";
import Vector from "@samdravitzki/dufus-engine/src/core/Vector/Vector";

export const Velocity = component<Vector>({ name: "velocity" });

export const Speed = component<number>({ name: "speed" });

export const BackboardOwner = component<"player" | "ai">({
  name: "backboard-owner",
});
