import Component from '../Component/Component';
import Entity from '../Entity/Entity';

/**
 * Reason for choosing an ECS approach is that I have worked with alot of game engines before
 * and they are all very inheritance based and I wanted to see how it would work using one
 * that prefers composition over inheritance.
 */
export default class World {
    private _entities: Entity[] = [];
    private _components: Component[] = [];

    get entities(): Readonly<Entity>[] {
        return this._entities;
    }

    get components(): Readonly<Component>[] {
        return this._components;
    }

    addEntity(entity: Entity) {
        this._entities.push(entity);
    }

    addComponent(component: Component) {
        const result = this
        .query([component.name])
        .filter(entitiesComponents => entitiesComponents[0].entityId === component.entityId);

        if (result.length !== 0) {
            throw new Error(`Entity cannot have more than one component of type '${component.name}'`)
        }
        
        this._components.push(component);
    }

    replaceComponent(component: Component) {
        const matchingComponent = this._components
            .filter(existingComponent => (
                existingComponent.name === component.name 
                && existingComponent.entityId === component.entityId
            ));
        
        if (matchingComponent.length !== 0) {
            const item = matchingComponent[0];
            const index = this._components.indexOf(item)

            if (index > -1) {
                this._components.splice(index, 1);
            }
        }

        this.addComponent(component);
    }

    removeComponent(component: Component) {
        this._components = this._components.filter(c => !(c.entityId === component.entityId && c.name === component.name))
    }

    /**
     * Query the components of entities
     * Given a set of component names retrieve the list of the requested components for
     * each entity with those components
     * 
     * Each set of components returned relates to one entity
     * 
     * You can assume that for each of the components returned are in the order of the
     * supplied component names
     * 
     * (In other words, each resulting array element is the list of compomemts requested 
     * associated with a particular entity that has those components)
     * @param components a list of component names
     */
    query(components: string[]): Component[][] {

        const entityComponentGroups: Record<string, Component[]> = {};

        components.forEach((componentName) => {
            const matchingComponents = this._components.filter((component) => component.name === componentName);

            matchingComponents.forEach((matchedComponent) => {
                if (!entityComponentGroups[matchedComponent.entityId]) {
                    entityComponentGroups[matchedComponent.entityId] = [];
                }
                entityComponentGroups[matchedComponent.entityId].push(matchedComponent);
            });
        });

        const simplifiedEntityComponentGroups = Object.values(entityComponentGroups);

        // Filter out entities that only matched some of the supplied components
        const onlyMatchingComponents = simplifiedEntityComponentGroups
            .filter((group) => {
                const includesAllComponentsRequested = group.every(item => components.includes(item.name));
                const sameLengthAsRequestedComponents = group.length === components.length

                return includesAllComponentsRequested && sameLengthAsRequestedComponents;
            });

        return onlyMatchingComponents;
    }
}