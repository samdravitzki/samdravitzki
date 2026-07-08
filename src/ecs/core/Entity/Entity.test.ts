import { describe, test, expect, expectTypeOf } from "vitest";
import Component, { ComponentToken } from "../Component/Component";
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

describe("hasComponent method", () => {
  test("should return true when entity has component with supplied name", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    // ACT
    const result = entity.hasComponent("A");

    // ASSERT
    expect(result).toEqual(true);
  });

  test("should return false when entity does not have component with supplied name", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    // ACT
    const result = entity.hasComponent("B");

    // ASSERT
    expect(result).toEqual(false);
  });

  test("should return true when entity has component with supplied component token", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component<number> = { name: "A", componentData: 12 };
    const componentTokenA = { componentName: "A" } as ComponentToken<number>;
    entity.addComponent(componentA);

    // ACT
    const result = entity.hasComponent(componentTokenA);

    // ASSERT
    expect(result).toEqual(true);
  });

  test("should return false when entity does not have component with supplied component token", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component<number> = { name: "A", componentData: 12 };
    const componentTokenB = { componentName: "B" } as ComponentToken<number>;
    entity.addComponent(componentA);

    // ACT
    const result = entity.hasComponent(componentTokenB);

    // ASSERT
    expect(result).toEqual(false);
  });
});

describe("getComponent method", () => {
  test("should return the component with supplied name", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    // ACT
    const result = entity.getComponent("A");

    // ASSERT
    expect(result?.name).toEqual(componentA.name);
  });

  test("should return undefined when entity does not have component with supplied name", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    // ACT
    const result = entity.getComponent("B");

    // ASSERT
    expect(result).toEqual(undefined);
  });

  test("should return the component with supplied component token", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component<number> = { name: "A", componentData: 12 };
    const componentTokenA = { componentName: "A" } as ComponentToken<number>;
    entity.addComponent(componentA);

    // ACT
    const result = entity.getComponent(componentTokenA);

    // ASSERT
    expect(result?.name).toEqual(componentA.name);
  });

  test("should return undefined when entity does not have component with supplied component token", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component<number> = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    const componentTokenB = { componentName: "B" } as ComponentToken<number>;

    // ACT
    const result = entity.getComponent(componentTokenB);

    // ASSERT
    expect(result).toEqual(undefined);
  });

  test("should return Component<unknown> when entity has component with supplied name", () => {
    const entity = new Entity();

    expectTypeOf(entity.getComponent("A")).toEqualTypeOf<
      Component<unknown> | undefined
    >();
  });

  test("should return Component<T> when entity has component with supplied component token", () => {
    const entity = new Entity();
    const componentTokenA = { componentName: "A" } as ComponentToken<number>;

    expectTypeOf(entity.getComponent(componentTokenA)).toEqualTypeOf<
      Component<number> | undefined
    >();
  });
});

describe("addComponent method", () => {
  test("should add a component", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };

    // ACT
    entity.addComponent(componentA);

    // ASSERT
    expect(entity.components).toEqual([componentA]);
  });

  test("should throw error when component of the same type already exists associated with the same entity", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component = { name: "A", componentData: 12 };
    entity.addComponent(componentA);

    // ACT and ASSERT
    expect(() => entity.addComponent(componentA)).toThrowError();
  });

  test("should emit event when component is added", () => {
    // ARRANGE
    const events: unknown[] = [];
    const emitter = {
      emit: (event: unknown) => events.push(event),
    };
    const entity = new Entity(emitter);
    const componentA: Component = { name: "A", componentData: 12 };

    // ACT
    entity.addComponent(componentA);

    // ASSERT
    expect(events).toEqual([
      {
        event: "entity:component-added",
        payload: { entityId: entity.id, componentName: componentA.name },
      },
    ]);
  });
});

describe("removeComponent method", () => {
  test("should remove component with supplied name from entity", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA = { entityId: entity.id, name: "A", componentData: 12 };

    entity.addComponent(componentA);

    // ACT
    entity.removeComponent(componentA.name);

    // ASSERT
    expect(entity.components).toEqual([]);
  });

  test("should remove component with supplied component token from entity", () => {
    // ARRANGE
    const entity = new Entity();
    const componentA: Component<number> = { name: "A", componentData: 12 };
    const componentTokenA = { componentName: "A" } as ComponentToken<number>;

    entity.addComponent(componentA);

    // ACT
    entity.removeComponent(componentTokenA);

    // ASSERT
    expect(entity.components).toEqual([]);
  });

  test("should emit event when component is removed", () => {
    // ARRANGE
    const events: unknown[] = [];
    const emitter = {
      emit: (event: unknown) => events.push(event),
    };

    const componentA: Component = { name: "A", componentData: 12 };
    const entity = new Entity(
      emitter,
      new Map([[componentA.name, componentA]]),
    );

    // ACT
    entity.removeComponent(componentA.name);

    // ASSERT
    expect(events).toEqual([
      {
        event: "entity:component-removed",
        payload: { entityId: entity.id, component: componentA },
      },
    ]);
  });

  test("should not emit event when component to remove does not exist", () => {
    // ARRANGE
    const events: unknown[] = [];
    const emitter = {
      emit: (event: unknown) => events.push(event),
    };
    const componentA: Component = { name: "A", componentData: 12 };
    const entity = new Entity(
      emitter,
      new Map([[componentA.name, componentA]]),
    );

    // ACT
    entity.removeComponent("B");

    // ASSERT
    expect(events).toEqual([]);
  });
});
