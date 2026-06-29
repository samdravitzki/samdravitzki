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
  "entity:component-removed": { entityId: string; component: Component };
  // Internal events that the inspector emits
  "inspector:entity-selected": { entityId: string };
};

function createInspectorPanelSection({
  title,
  onClose,
}: {
  title: string;
  onClose?: () => void;
}): HTMLElement {
  const section = document.createElement("div");
  section.classList.add("inspector__panel");

  const titleSection = document.createElement("div");
  titleSection.classList.add("inspector__panel-title-section");
  section.appendChild(titleSection);

  const titleElement = document.createElement("span");
  titleElement.classList.add("inspector__panel-title");
  titleElement.textContent = title;
  titleSection.appendChild(titleElement);

  // Add close button if onClose is provided
  if (onClose) {
    const closeButton = document.createElement("button");
    closeButton.classList.add("inspector__panel-close-button");
    closeButton.textContent = "×"; // Close icon
    closeButton.addEventListener("click", () => {
      onClose();
    });
    titleSection.appendChild(closeButton);
  }

  section.appendChild(titleSection);

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

function isTagComponent(component: Component): boolean {
  const { name, ...properties } = component;
  return Object.keys(properties).length === 0;
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

      const worldPanelBody = document.createElement("div");
      worldPanelBody.classList.add("inspector__panel-body");
      worldPanel.appendChild(worldPanelBody);

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

        const worldPanelBody = worldPanel.querySelector(
          ".inspector__panel-body",
        )!;

        const entityListItem = createEntityListItem(entityId);

        entityListItem.addEventListener("click", () => {
          emitter.emit({
            event: "inspector:entity-selected",
            payload: { entityId },
          });
        });

        worldPanelBody.appendChild(entityListItem);
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

        const entity = world.entity(entityId);

        if (componentName === "label") {
          if (!worldPanel) {
            console.warn("Entity list panel not found");
            return;
          }

          const entityText = worldPanel.querySelector<HTMLElement>(
            `.inspector__panel-list-item[data-id="${entityId}"]`,
          );

          if (!entityText) {
            console.warn("Entity text not found for entityId", entityId);
            return;
          }

          const component = entity.getComponent(componentName) as Label;

          entityText.innerHTML = `
            ${component.text}
            <span class="inspector__badge">
              ${entityId.slice(0, 6)}
            </span>
          `;
          return;
        }

        if (
          entityInspectorPanel &&
          entityInspectorPanel.dataset.entity === entityId
        ) {
          const component = entity.getComponent(componentName);

          if (!component) {
            console.warn(
              `component ${componentName} not found on entity ${entityId}`,
            );
            return;
          }

          const { name, ...properties } = component;

          const isTag = isTagComponent(component);

          if (isTag) {
            const entityInspectorPanelTagList =
              entityInspectorPanel.querySelector(
                ".inspector__panel-entity-tag-list",
              )!;

            const tagComponent = document.createElement("div");
            tagComponent.textContent = componentName;
            tagComponent.classList.add("inspector__panel-tag-component");
            tagComponent.classList.add("inspector__badge");
            tagComponent.dataset.component = componentName;
            entityInspectorPanelTagList.appendChild(tagComponent);
          } else {
            const entityInspectorPanelBody = entityInspectorPanel.querySelector(
              ".inspector__panel-body",
            )!;

            const componentInspectorPanel = document.createElement("div");
            componentInspectorPanel.dataset.component = componentName;
            componentInspectorPanel.classList.add("inspector__panel-component");
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
          }
        }
      },
    );

    registerSystem(
      "remove-component-from-component-list",
      triggerBuilder.on("entity:component-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId, component } = payload;

        if (
          entityInspectorPanel &&
          entityInspectorPanel.dataset.entity === entityId
        ) {
          const componentName = component.name;

          const isTag = isTagComponent(component);

          if (isTag) {
            const tagComponent = document.querySelector<HTMLElement>(
              `.inspector__panel-tag-component[data-component="${componentName}"]`,
            );
            tagComponent?.remove();
          } else {
            const componentPanel = document.querySelector<HTMLElement>(
              `.inspector__panel-component[data-component="${componentName}"]`,
            );
            componentPanel?.remove();

            const componentPane = componentPanes.get(componentName);
            componentPane?.dispose();

            componentPanes.delete(componentName);
          }
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
            onClose: () => {
              entityInspectorPanel?.remove();
              entityInspectorPanel = null;
            },
          });

          entityInspectorPanel.classList.add("inspector__panel-entity");

          const componentInspectorPanelTagList = document.createElement("div");
          componentInspectorPanelTagList.classList.add(
            "inspector__panel-entity-tag-list",
          );
          entityInspectorPanel.appendChild(componentInspectorPanelTagList);

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
        const componentTags: HTMLElement[] = [];

        for (const component of entity.components) {
          const { name, ...properties } = component;

          if (name === "label") {
            continue;
          }

          if (isTagComponent(component)) {
            const tagComponent = document.createElement("div");
            tagComponent.textContent = name;
            tagComponent.classList.add("inspector__panel-tag-component");
            tagComponent.classList.add("inspector__badge");
            tagComponent.dataset.component = name;

            componentTags.push(tagComponent);
          } else {
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
        }

        const inspectorPanelBody = entityInspectorPanel.querySelector(
          ".inspector__panel-body",
        )!;

        inspectorPanelBody.replaceChildren(...componentInspectorPanels);

        const inspectorPanelTagList = entityInspectorPanel.querySelector(
          ".inspector__panel-entity-tag-list",
        )!;
        inspectorPanelTagList.replaceChildren(...componentTags);
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
