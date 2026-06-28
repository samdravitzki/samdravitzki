import { describe, test, expect } from "vitest";
import Component from "../Component/Component";
import Entity from "./Entity";

describe("Entity constructor", () => {
  test("should be constructed with a random id", () => {
    // ARRANGE
    // ACT
    const entity1 = new Entity();
    const entity2 = new Entity();

    // ASSERT
    expect(entity1.id).not.toEqual(entity2.id);
  });
});

describe("getComponent method", () => {
  test("should return the component with supplied name", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A" };
    entity.addComponent(componentA);

    // ACT
    const result = entity.getComponent("A");

    // ASSERT
    expect(result?.name).toEqual(componentA.name);
  });
});

describe("addComponent method", () => {
  test("should add a component", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A" };

    // ACT
    entity.addComponent(componentA);

    // ASSERT
    expect(entity.components).toEqual([componentA]);
  });

  // Based on https://stackoverflow.com/questions/20720360/ecs-can-an-entity-have-more-than-one-component-of-given-type
  test("should throw error when component of the same type already exists associated with the same entity", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A" };
    entity.addComponent(componentA);

    // ACT and ASSERT
    expect(() => entity.addComponent(componentA)).toThrowError();
  });
});

describe("removeComponent method", () => {
  test("should remove supplied component from entity", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA = { entityId: entity.id, name: "A" };

    entity.addComponent(componentA);

    // ACT
    entity.removeComponent(componentA.name);

    // ASSERT
    expect(entity.components).toEqual([]);
  });
});
