import Bundle from '../Bundle/Bundle';
import Component from '../Component/Component';
import Entity from '../Entity/Entity';

type EntityId = string;


/**
 * Reason for choosing an ECS approach is that I have worked with alot of game engines before
 * and they are all very inheritance based and I wanted to see how it would work using one
 * that prefers composition over inheritance.
 */
export default class World {
    // Note: This entity array is pretty useless now so i should remove it
    private _entities: Entity[] = [];

    private _components_by_entity = new Map<EntityId, Map<string, Component>>;

    get entities(): Readonly<Entity>[] {
        return this._entities;
    }

    get components(): Readonly<Component>[] {
        const componentMaps = Array.from(this._components_by_entity.values());

        const allComponents = componentMaps.map((component) => {
            return Array.from(component.values());
        }).flat();

        return allComponents;
    }

    addEntity(entity: Entity) {
        this._entities.push(entity);
        this._components_by_entity.set(entity.id, new Map());
    }

    addComponent(entityId: string, component: Component) {
        const entitiesComponents = this._components_by_entity.get(entityId);

        if (!entitiesComponents) {
            throw new Error(`Entity with id ${entityId} does not exist`)
        }

        const result = entitiesComponents.get(component.name);

        if (result !== undefined) {
            throw new Error(`Entity cannot have more than one component of type '${component.name}'`)
        }
        
        entitiesComponents.set(component.name, component);
    }

    addBundle(bundle: Bundle) {
        this.addEntity(bundle.entity);

        bundle.components.forEach((component) => {
            this.addComponent(bundle.entity.id, component);
        });
    }

    replaceComponent(entityId: string, component: Component) {
        const entitiesComponents = this._components_by_entity.get(entityId);

        if (!entitiesComponents) {
            throw new Error(`Entity with id ${entityId} does not exist`)
        }

        entitiesComponents.set(component.name, component);
    }

    removeComponent(entityId: string, component: Component) {
        const entitiesComponents = this._components_by_entity.get(entityId);

        if (!entitiesComponents) {
            throw new Error(`Entity with id ${entityId} does not exist`)
        }

        entitiesComponents.delete(component.name);
    }

    removeEntity(entityId: string) {
        this._entities = this._entities.filter((entity) => entity.id !== entityId);


        const entityExists = this._components_by_entity.has(entityId);

        if (!entityExists) {
            throw new Error(`Entity with id ${entityId} does not exist`)
        }
    
        this._components_by_entity.delete(entityId);
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

        for (var [entityId, entitiesComponents] of this._components_by_entity.entries()) {
            const queriedComponents = query.map((queryItem) => {
                if (queryItem === 'entity-id') {
                    return entityId;
                }

                return entitiesComponents.get(queryItem);
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