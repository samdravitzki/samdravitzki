import Component from '../Component/Component';

type EntityId = string;

class Entity {
    readonly id: EntityId = window.crypto.randomUUID();
    private _components = new Map<string, Component>();

    get components() {
        return Array.from(this._components.values());
    }

    getComponent(componentName: string) {
        return this._components.get(componentName);
    }

    addComponent(component: Component) {
        const result = this._components.get(component.name);

        if (result !== undefined) {
            throw new Error(`Entity cannot have more than one component of type '${component.name}'`)
        }
        
        this._components.set(component.name, component);
    }

    replaceComponent(component: Component) {
        this._components.set(component.name, component);
    }

    removeComponent(componentName: string) {
        this._components.delete(componentName);
    }
}

export default Entity;
export type { EntityId };
