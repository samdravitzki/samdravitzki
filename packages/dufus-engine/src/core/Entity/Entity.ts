import Component, {
  ComponentSpec,
  ComponentToken,
} from "../Component/Component";
import { EventEmitter } from "../System/System";

export type EntityEvents = {
  "entity:component-added": { entityId: string; componentName: string };
  "entity:component-removed": { entityId: string; component: Component };
};

type EntityId = string;

class Entity {
  readonly id: EntityId = window.crypto.randomUUID();

  constructor(
    private readonly emitter?: EventEmitter<EntityEvents>,
    private readonly _components: Map<string, Component<unknown>> = new Map(),
  ) {}

  get components() {
    return Array.from(this._components.values());
  }

  hasComponent(componentName: string | ComponentToken<unknown>): boolean {
    if (typeof componentName === "string") {
      return this._components.has(componentName);
    }

    return this._components.has(componentName.componentName);
  }

  getComponent(componentName: string): Component<unknown> | undefined;
  getComponent<T>(componentSpec: ComponentToken<T>): Component<T> | undefined;
  getComponent<T>(
    componentSpec: string | ComponentToken<T>,
  ): Component<unknown> | undefined {
    if (typeof componentSpec === "string") {
      return this._components.get(componentSpec);
    }

    return this._components.get(componentSpec.componentName);
  }

  addComponent(component: Component<unknown>) {
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

  removeComponent(componentName: string | ComponentToken<unknown>) {
    const name =
      typeof componentName === "string"
        ? componentName
        : componentName.componentName;

    const componentToDelete = this._components.get(name);

    if (!componentToDelete) {
      return;
    }

    this._components.delete(name);
    if (this.emitter) {
      this.emitter.emit({
        event: "entity:component-removed",
        payload: { entityId: this.id, component: componentToDelete },
      });
    }
  }
}

export default Entity;
export type { EntityId };
