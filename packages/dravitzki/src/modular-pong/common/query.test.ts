import { component, tag, Vector, World } from "@dravitzki/dufus-engine";
import { describe, expect, it } from "vitest";
import { contactPair, requiredComponent, singleQuery } from "./query";

describe("modular Pong query helpers", () => {
  it("returns the only matching query result", () => {
    expect(singleQuery([["ball"]], "ball")).toEqual(["ball"]);
  });

  it("names the missing singleton in its error", () => {
    expect(() => singleQuery([], "ball")).toThrow(
      "Expected one ball, but none were found",
    );
  });

  it("returns a required typed component", () => {
    const Health = component<number>({ name: "modular-pong-test-health" });
    const world = new World();
    const entity = world.createEntity();
    entity.addComponent(Health(3));

    expect(requiredComponent(entity, Health, "Test entity").componentData).toBe(
      3,
    );
  });

  it("names the missing component in its error", () => {
    const Health = component<number>({ name: "modular-pong-test-health" });
    const world = new World();

    expect(() =>
      requiredComponent(world.createEntity(), Health, "Test entity"),
    ).toThrow("Test entity is missing modular-pong-test-health");
  });

  it("matches collision entities independent of their contact order", () => {
    const Ball = tag("modular-pong-test-ball");
    const Paddle = tag("modular-pong-test-paddle");
    const world = new World();
    const ball = world.createEntity();
    const paddle = world.createEntity();
    ball.addComponent(Ball());
    paddle.addComponent(Paddle());

    const pair = contactPair(
      world,
      {
        type: "enter",
        entityA: paddle.id,
        entityB: ball.id,
        contactPoint: Vector.create(0, 0),
        normal: Vector.create(0, 1),
        penetration: 0,
      },
      Ball,
      Paddle,
    );

    expect(pair).toEqual([ball, paddle]);
  });
});
