import Bundle from "../Bundle/Bundle";
import Component, {
  ComponentSpec,
  ComponentToken,
} from "../Component/Component";
import { EventEmitter } from "../Engine/EventEmitter";
import Entity, { EntityEvents, EntityId } from "../Entity/Entity";

export type WorldEvents = {
  "world:entity-created": { entityId: string };
  "world:entity-removed": { entityId: string };
} & EntityEvents;

/**
 * Reason for choosing an ECS approach is that I have worked with alot of game engines before
 * and they are all very inheritance based and I wanted to see how it would work using one
 * that prefers composition over inheritance.
 */

/**
 * The world contains a collection of entities and their associated compoenents
 * and provides the ability to query over them. Systems read and mutate the state
 * of the world implementing the logic to create a game.
 */
export default class World {
  private _entities = new Map<EntityId, Entity>();

  constructor(private readonly emitter?: EventEmitter<WorldEvents>) {}

  get entities(): string[] {
    return Array.from(this._entities.keys());
  }

  get components(): Readonly<Component>[] {
    const entities = Array.from(this._entities.values());
    const allComponents = entities.map((entity) => entity.components).flat();
    return allComponents;
  }

  /**
   * Create an entity and add it to the world
   * @returns the entity added to the world
   */
  createEntity(): Entity {
    const entity = new Entity(this.emitter);
    this._entities.set(entity.id, entity);
    if (this.emitter) {
      this.emitter.emit({
        event: "world:entity-created",
        payload: { entityId: entity.id },
      });
    }
    return entity;
  }

  /**
   * Get entity with supplied id
   */
  entity(id: string): Entity {
    const entity = this._entities.get(id);

    if (!entity) {
      throw new Error(`Entity with id ${id} does not exist`);
    }

    return entity;
  }

  addBundle(bundle: Bundle) {
    const entity = this.createEntity();

    bundle.components.forEach((component) => {
      entity.addComponent(component);
    });
  }

  removeEntity(entityId: string) {
    const entityExists = this._entities.has(entityId);

    if (!entityExists) {
      throw new Error(`Entity with id ${entityId} does not exist`);
    }

    this._entities.delete(entityId);
    if (this.emitter) {
      this.emitter.emit({
        event: "world:entity-removed",
        payload: { entityId },
      });
    }
  }

  // TODO: Revisit this query logic as its currenly messy and difficult to understand
  /**
   * Query the components of entities
   * Given a set of component names retrieve the list of the requested components for
   * each entity with those components
   *
   * You can assume that for each of the components returned are in the order of the
   * supplied component names
   *
   * (In other words, each resulting array element is the list of compomemts requested
   * associated with a particular entity that has those components)
   * @param query a list of components to query for (if 'entity-id' is supplied the it will return the entities id)
   */
  query<const T extends Query>(q: T): QueryResult<T>[] {
    const result: QueryResult<T>[] = [];

    for (var [entityId, entitiesComponents] of this._entities.entries()) {
      const queryResult = q.map((queryItem) => {
        if (queryItem === "entity-id") {
          return entityId;
        }

        if (typeof queryItem === "string") {
          return entitiesComponents.getComponent(queryItem);
        }

        return entitiesComponents.getComponent(queryItem.componentName);
      });

      const hasAllComponents = queryResult.every(
        (queriedComponent) => queriedComponent !== undefined,
      );

      if (hasAllComponents && queryResult.length > 0) {
        result.push(
          queryResult.filter(
            // Filter out tag components
            (item) =>
              !(typeof item === "object" && item.componentData === undefined),
          ) as QueryResult<T>,
        );
      }
    }

    return result;
  }
}

export type Query = readonly (ComponentToken<unknown> | "entity-id" | string)[];

// Filters out any `never` types from a tuple type
export type WithoutNever<T extends readonly unknown[]> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? [First] extends [never]
    ? WithoutNever<Rest>
    : [First, ...WithoutNever<Rest>]
  : [];

// prettier-ignore
export type QueryResultItem<T> =
  T extends ComponentToken<infer U> ? U extends void 
    ? never 
    : Component<U>: 
  T extends "entity-id" ? string : 
  T extends string ? Component<unknown>
    : never;

// prettier-ignore
export type QueryResult<T extends readonly unknown[]> = WithoutNever<{
  [Index in keyof T]: QueryResultItem<T[Index]>
}>;
