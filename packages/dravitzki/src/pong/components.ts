import { component, Vector } from "@dravitzki/dufus-engine";

export const Velocity = component<Vector>({ name: "velocity" });

export const Speed = component<number>({ name: "speed" });

export const BackboardOwner = component<"player" | "ai">({
  name: "backboard-owner",
});
