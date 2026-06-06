import Component from "../Component/Component";
import { EventEmitter } from "../System/System";

export type EntityEvents = {
  "entity:component-added": { entityId: string; componentName: string };
  "entity:component-removed": { entityId: string; componentName: string };
  "entity:component-replaced": { entityId: string; componentName: string };
};

type EntityId = string;

class Entity {
  readonly id: EntityId = window.crypto.randomUUID();
  private _components = new Map<string, Component>();

  constructor(private readonly emitter?: EventEmitter<EntityEvents>) {}

  get components() {
    return Array.from(this._components.values());
  }

  hasComponent(componentName: string) {
    return this._components.has(componentName);
  }

  getComponent(componentName: string) {
    return this._components.get(componentName);
  }

  addComponent(component: Component) {
    const result = this._components.get(component.name);

    if (result !== undefined) {
      throw new Error(
        `Entity cannot have more than one component of type '${component.name}'`,
      );
    }

    this._components.set(component.name, component);
    if (this.emitter) {
      this.emitter.emit({
        event: "entity:component-added",
        payload: { entityId: this.id, componentName: component.name },
      });
    }
  }

  replaceComponent(component: Component) {
    this._components.set(component.name, component);
    if (this.emitter) {
      this.emitter.emit({
        event: "entity:component-replaced",
        payload: { entityId: this.id, componentName: component.name },
      });
    }
  }

  removeComponent(componentName: string) {
    this._components.delete(componentName);
    if (this.emitter) {
      this.emitter.emit({
        event: "entity:component-removed",
        payload: { entityId: this.id, componentName: componentName },
      });
    }
  }
}

export default Entity;
export type { EntityId };
