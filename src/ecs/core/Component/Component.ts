type Component<T = unknown> = {
  name: string;
  componentData: T;
};

declare const componentBrandTypeId: unique symbol; // = Symbol.for("dufus/component");

type ComponentBrand<T> = {
  readonly [componentBrandTypeId]: T;
};

/**
 *
 * Used to query for components of a given type
 *
 * NOTE: A type brand is required so that typescript can differentate between different component tokens,
 * as without the brand there would be no use in the type for the generic parmater T, making
 * them all structurally equivalent and thus the same type.
 */
type ComponentToken<T> = ComponentBrand<T> & {
  componentName: string;
};

/**
 *
 * Used create new instances of a component of a given type
 *
 * @param componentData The data associated with the component (not required for void componentData)
 * @returns A new component instance
 */
type ComponentConstructor<T> = {
  (...args: T extends void ? [] : [componentData: T]): Component<T>;
};

/**
 * Combines a component token and constructor into a single type
 *
 * Components should be created and queried for using ComponentSpec, and not ComponentToken or
 * ComponentConstructor directly.
 *
 * The spec being responsible for both construction and querying of components of a given type
 * simplies dufus engine as it allows us to assume the type a component will have when querying
 * for it. We can gaurantee the result will have the correct type as the spec was used to create
 * the component in the first place.
 */
type ComponentSpec<T> = ComponentConstructor<T> & ComponentToken<T>;

/**
 * Creates a new component specification.
 *
 * A specification can be used to create new components of a given type...
 *
 * ```
 * const Position = component<{ x: number; y: number }>({ name: 'position' });
 * ```
 *
 * *Where the specification name follows pascal case to differentiate it from the component name*
 *
 * Create a new component using the specification...
 *
 * ```
 * const position = Position({ x: 10, y: 20 });
 * ```
 *
 *
 * The specification can also be used to query for entities that have the component...
 *
 * ```
 * const entitiesWithPosition = world.query([Position]);
 * ```
 *
 *
 * @param config Configuration object for the component
 * @returns A component specification
 */
function component<T>(config: { name: string }) {
  const componentConstructor: ComponentConstructor<T> = (
    ...args: T extends void ? [] : [componentData: T]
  ) => {
    const componentData = args[0] as T;
    return {
      componentData: componentData,
      name: config.name,
    };
  };

  const token = {
    componentName: config.name,
  } as ComponentToken<T>;

  const spec: ComponentSpec<T> = Object.assign(componentConstructor, token);

  return spec;
}

/**
 * Convenience function to create a tag component, which is just a component that has no data associated with it.
 *
 * @param name component name
 * @returns component with no data
 */
function tag(name: string): ComponentSpec<void> {
  return component({ name });
}

export default Component;
export { component, tag };
export type { ComponentSpec, ComponentToken };
