import Bundle from '../Bundle/Bundle';
import Component from '../Component/Component';
import Entity, { EntityId } from '../Entity/Entity';


/**
 * Global state shared between systems that is not associated with any
 * entity in particular
 * 
 * Resources add the flexibility to break out of the ecs pattern adding 
 * the ability to implement solutions in different ways that may be more 
 * appropiate to solve the problem at hand
 * 
 * Examples of this type of state could be score or the current key pressed 
 * 
 * Reference
 * - https://bevy-cheatbook.github.io/programming/res.html
 * - https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
 */
// type Resource = {

// }

/**
 * Reason for choosing an ECS approach is that I have worked with alot of game engines before
 * and they are all very inheritance based and I wanted to see how it would work using one
 * that prefers composition over inheritance.
 */
export default class World {
    private _entities = new Map<EntityId, Entity>;

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
        const entity = new Entity();
        this._entities.set(entity.id, entity);
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
            throw new Error(`Entity with id ${entityId} does not exist`)
        }
    
        this._entities.delete(entityId);
    }

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
    query<T extends (EntityId | Component)[]>(query: string[]): T[] {

        const result: T[] = [];

        for (var [entityId, entitiesComponents] of this._entities.entries()) {
            const queriedComponents = query.map((queryItem) => {
                if (queryItem === 'entity-id') {
                    return entityId;
                }

                return entitiesComponents.getComponent(queryItem);
            })

            const hasAllComponents = queriedComponents
                .every((queriedComponent) => queriedComponent !== undefined);

            if (hasAllComponents && queriedComponents.length > 0) {
                result.push(queriedComponents as T);
            }
        }

        return result;
    }
}