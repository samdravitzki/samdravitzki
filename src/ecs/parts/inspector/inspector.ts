import { Part } from "../../core/Part/Part";
import Label from "../../core/Component/Label";
import "./inspector.css";
import { Pane } from "tweakpane";
import Component from "../../core/Component/Component";

type InspectorEvents = {
  // External events that the inspector listens to
  setup: void;
  update: void;
  "world:entity-created": { entityId: string };
  "world:entity-removed": { entityId: string };
  "entity:component-added": { entityId: string; componentName: string };
  "entity:component-removed": { entityId: string; componentName: string };
  // Internal events that the inspector emits
  "inspector:entity-selected": { entityId: string };
};

function createInspectorPanelSection({
  title,
}: {
  title: string;
}): HTMLElement {
  const section = document.createElement("div");
  section.classList.add("inspector__panel");

  const titleElement = document.createElement("div");
  titleElement.classList.add("inspector__panel-title");
  titleElement.textContent = title;

  section.appendChild(titleElement);

  return section;
}

function createEntityListItem(entityId: string): HTMLElement {
  const shortEntityId = entityId.slice(0, 6);

  const entityListItem = document.createElement("div");
  entityListItem.classList.add("inspector__panel-list-item");
  entityListItem.textContent = shortEntityId;
  entityListItem.dataset.id = entityId;

  return entityListItem;
}

function createComponentPane(
  component: Component,
  container: HTMLElement,
): Pane {
  const { name, ...properties } = component;

  const componentPane = new Pane({
    container,
  });

  for (const [propertyName, propertyValue] of Object.entries(properties)) {
    try {
      componentPane.addBinding(component, propertyName);
    } catch (e) {
      // Fallback for any properties types not supported by tweakpane natively
      const fallbackObj = { [propertyName]: String(propertyValue) };
      componentPane.addBinding(fallbackObj, propertyName, {
        readonly: true,
      });
    }
  }

  return componentPane;
}

function inspector() {
  const part: Part<InspectorEvents> = ({ registerSystem, triggerBuilder }) => {
    let inspectorRoot: HTMLElement;
    let worldPanel: HTMLElement;
    let entityInspectorPanel: HTMLElement | null = null;

    let componentPanes = new Map<string, Pane>();

    registerSystem("debug-panel", triggerBuilder.on("setup"), () => {
      inspectorRoot = document.createElement("div");
      inspectorRoot.classList.add("inspector__root");

      worldPanel = createInspectorPanelSection({
        title: "World",
      });

      worldPanel.classList.add("inspector__panel-world");

      const body = document.body;

      body.appendChild(inspectorRoot);
      inspectorRoot.appendChild(worldPanel);

      return () => {
        inspectorRoot?.remove();
      };
    });

    registerSystem(
      "add-entity-to-entity-list",
      triggerBuilder.on("world:entity-created"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        if (!worldPanel) {
          console.warn("Entity list container not found");
          return;
        }

        const entityListItem = createEntityListItem(entityId);

        entityListItem.addEventListener("click", () => {
          emitter.emit({
            event: "inspector:entity-selected",
            payload: { entityId },
          });
        });

        worldPanel.appendChild(entityListItem);
      },
    );

    registerSystem(
      "remove-entity-from-entity-list",
      triggerBuilder.on("world:entity-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        if (!worldPanel) {
          return;
        }

        const entityText = worldPanel.querySelector<HTMLElement>(
          `[data-id="${entityId}"]`,
        );
        entityText?.remove();
      },
    );

    registerSystem(
      "add-component-to-component-list",
      triggerBuilder.on("entity:component-added"),
      (world, _resources, _state, _emitter, payload) => {
        const { entityId, componentName } = payload;
        // console.log("add", componentName, entityId.slice(0, 6));

        const entity = world.entity(entityId);

        const compoenentPanel = document.querySelector<HTMLElement>(
          `.inspector__panel-component[data-component="${componentName}"]`,
        );

        if (compoenentPanel) {
          // Component already exists i.e. a component replace occured
          return;
        }

        if (componentName === "label") {
          if (!worldPanel) {
            console.warn("Entity list panel not found");
            return;
          }

          const entityText = worldPanel.querySelector<HTMLElement>(
            `[data-id="${entityId}"]`,
          );

          if (!entityText) {
            console.warn("Entity text not found for entityId", entityId);
            return;
          }

          const component = entity.getComponent(componentName) as Label;

          entityText.innerHTML = `
            ${component.text}
            <span style="background-color: #444;color: #fff; padding: 0px 4px; border-radius: 10px;font-size: 0.8em;">
              ${entityId.slice(0, 6)}
            </span>
          `;
          return;
        }

        if (!entityInspectorPanel) {
          return;
        }

        const component = entity.getComponent(componentName);

        if (!component) {
          console.warn(
            `component ${componentName} not found on entity ${entityId}`,
          );
          return;
        }

        const { name, ...properties } = component;

        if (Object.keys(properties).length === 0) {
          return;
        }

        const entityInspectorPanelBody = entityInspectorPanel.querySelector(
          ".inspector__panel-body",
        )!;

        const componentInspectorPanel = document.createElement("div");
        componentInspectorPanel.dataset.component = componentName;
        componentInspectorPanel.classList.add("inspector__panel-component");

        const componentTitle = document.createElement("div");
        componentTitle.textContent = componentName;
        componentInspectorPanel.appendChild(componentTitle);

        const componentPane = createComponentPane(
          component,
          componentInspectorPanel,
        );

        entityInspectorPanelBody.appendChild(componentInspectorPanel);

        componentPanes.set(componentName, componentPane);

        // Add other components to list of selected components, on the other side remove component from list of selected components when its removted
      },
    );

    registerSystem(
      "remove-component-from-component-list",
      triggerBuilder.on("entity:component-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId, componentName } = payload;
        // console.log("remove", componentName, entityId.slice(0, 6));

        if (!entityInspectorPanel) {
          return;
        }

        if (entityInspectorPanel.dataset.entity === entityId) {
          const compoenentPanel = document.querySelector<HTMLElement>(
            `.inspector__panel-component[data-component="${componentName}"]`,
          );
          compoenentPanel?.remove();

          const componentPane = componentPanes.get(componentName);
          componentPane?.dispose();

          componentPanes.delete(componentName);
        }
      },
    );

    registerSystem("updateComponentPanes", triggerBuilder.on("update"), () => {
      for (const pane of componentPanes.values()) {
        pane.refresh();
      }
    });

    registerSystem(
      "inspect-entity",
      triggerBuilder.on("inspector:entity-selected"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;
        console.log(`${entityId} selected`);

        // clean up any existing component panes
        for (const pane of componentPanes.values()) {
          pane.dispose();
        }

        componentPanes = new Map();

        const entity = world.entity(entityId);
        const title = entity.hasComponent("label")
          ? `${(entity.getComponent("label") as Label).text} (${entityId.slice(0, 3)})`
          : `Entity ${entityId.slice(0, 6)}`;

        if (!entityInspectorPanel) {
          entityInspectorPanel = createInspectorPanelSection({
            title,
          });

          entityInspectorPanel.classList.add("inspector__panel-entity");

          const componentInspectorPanelBody = document.createElement("div");
          componentInspectorPanelBody.classList.add("inspector__panel-body");
          entityInspectorPanel.dataset.entity = entityId;
          entityInspectorPanel.appendChild(componentInspectorPanelBody);

          inspectorRoot.appendChild(entityInspectorPanel);
        } else {
          const entityInspectorTitle = entityInspectorPanel.querySelector(
            ".inspector__panel-title",
          )!;
          entityInspectorPanel.dataset.entity = entityId;

          entityInspectorTitle.textContent = title;
        }

        const componentInspectorPanels: HTMLElement[] = [];

        for (const component of entity.components) {
          const { name, ...properties } = component;

          if (name === "label" || Object.keys(properties).length === 0) {
            continue;
          }

          const componentInspectorPanel = document.createElement("div");
          componentInspectorPanel.dataset.component = name;
          componentInspectorPanel.classList.add("inspector__panel-component");

          const componentTitle = document.createElement("div");
          componentTitle.textContent = name;
          componentInspectorPanel.appendChild(componentTitle);

          const componentPane = createComponentPane(
            component,
            componentInspectorPanel,
          );

          componentInspectorPanels.push(componentInspectorPanel);
          componentPanes.set(name, componentPane);
        }

        const bodyElement = entityInspectorPanel.querySelector(
          ".inspector__panel-body",
        )!;

        bodyElement.replaceChildren(...componentInspectorPanels);
      },
    );
  };

  // Next
  // - need the inspector to listen to changes in the state of components and update the component properties displayed
  // - display component properties using tweakpane
  // - add hover effects to the entity list
  // - fix bug: Cannot enter text using keyboard into the number fields
  // - test: adding label at runtime to entity and checking entity panel title updates and entity in list, then reverse when removing the label component

  return part;
}

export default inspector;
