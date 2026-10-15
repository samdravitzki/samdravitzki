import {
  Component,
  ComponentToken,
  Entity,
  World,
} from "@dravitzki/dufus-engine";
import { CollisionContactEvent } from "@dravitzki/dufus-engine/parts/collisions";

export function requiredComponent<T>(
  entity: Entity,
  component: ComponentToken<T>,
  description: string,
): Component<T> {
  const result = entity.getComponent(component);

  if (!result) {
    throw new Error(`${description} is missing ${component.componentName}`);
  }

  return result;
}

export function contactPair<T, U>(
  world: World,
  contact: CollisionContactEvent,
  first: ComponentToken<T>,
  second: ComponentToken<U>,
): [Entity, Entity] | undefined {
  const entityA = world.entity(contact.entityA);
  const entityB = world.entity(contact.entityB);

  if (entityA.hasComponent(first) && entityB.hasComponent(second)) {
    return [entityA, entityB];
  }

  if (entityB.hasComponent(first) && entityA.hasComponent(second)) {
    return [entityB, entityA];
  }
}

export function contactEntity<T>(
  world: World,
  contact: CollisionContactEvent,
  component: ComponentToken<T>,
): Entity | undefined {
  const entityA = world.entity(contact.entityA);
  const entityB = world.entity(contact.entityB);

  if (entityA.hasComponent(component)) {
    return entityA;
  }

  if (entityB.hasComponent(component)) {
    return entityB;
  }
}

export function singleQuery<T extends readonly unknown[]>(
  results: T[],
  description: string,
): T {
  const result = results[0];

  if (!result) {
    throw new Error(`Expected one ${description}, but none were found`);
  }

  return result;
}
