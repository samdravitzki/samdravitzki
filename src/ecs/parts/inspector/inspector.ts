import { Part } from "../../core/Part/Part";
import Label from "../../core/Component/Label";
import "./inspector.css";
import { Pane } from "tweakpane";

type InspectorEvents = {
  // External events that the inspector listens to
  setup: void;
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

function inspector() {
  const part: Part<InspectorEvents> = ({ registerSystem, triggerBuilder }) => {
    let inspectorRoot: HTMLElement;
    let entityListPanel: HTMLElement;
    let entityComponentListPanel: HTMLElement | null = null;

    registerSystem("debug-panel", triggerBuilder.on("setup"), () => {
      inspectorRoot = document.createElement("div");
      inspectorRoot.classList.add("inspector__root");

      entityListPanel = createInspectorPanelSection({
        title: "World",
      });

      const body = document.body;

      body.appendChild(inspectorRoot);
      inspectorRoot.appendChild(entityListPanel);

      return () => {
        inspectorRoot?.remove();
      };
    });

    registerSystem(
      "add-entity-to-debug-panel",
      triggerBuilder.on("world:entity-created"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        if (!entityListPanel) {
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

        entityListPanel.appendChild(entityListItem);
      },
    );

    registerSystem(
      "add-component-to-debug-panel",
      triggerBuilder.on("entity:component-added"),
      (world, _resources, _state, _emitter, payload) => {
        const { entityId, componentName } = payload;

        if (!entityListPanel) {
          console.warn("Entity list container not found");
          return;
        }

        const entityText = entityListPanel.querySelector<HTMLElement>(
          `[data-id="${entityId}"]`,
        );

        if (!entityText) {
          console.warn("Entity text not found for entityId", entityId);
          return;
        }

        const entity = world.entity(entityId);

        if (componentName === "label") {
          const component = entity.getComponent(componentName) as Label;
          entityText.innerHTML = `
            ${component.text}
            <span style="background-color: #444;color: #fff; padding: 0px 4px; border-radius: 10px;font-size: 0.8em;">
              ${entityId.slice(0, 6)}
            </span>
          `;
          return;
        }

        // Add other components to list of selected components, on the other side remove component from list of selected components when its removted
      },
    );

    registerSystem(
      "remove-component-from-debug-panel",
      triggerBuilder.on("entity:component-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId, componentName } = payload;

        if (!entityListPanel) {
          return;
        }

        if (componentName === "label") {
          const entityText = entityListPanel.querySelector<HTMLElement>(
            `[data-id="${entityId}"]`,
          );
          if (!entityText) {
            return;
          }

          const shortEntityId = entityId.slice(0, 6);
          entityText.textContent = shortEntityId;
          return;
        }
      },
    );

    registerSystem(
      "remove-entity-from-debug-panel",
      triggerBuilder.on("world:entity-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        if (!entityListPanel) {
          return;
        }

        const entityText = entityListPanel.querySelector<HTMLElement>(
          `[data-id="${entityId}"]`,
        );
        entityText?.remove();
      },
    );

    registerSystem(
      "inspect-entity",
      triggerBuilder.on("inspector:entity-selected"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;
        console.log(`${entityId} selected`);

        const entity = world.entity(entityId);
        const title = entity.hasComponent("label")
          ? `${(entity.getComponent("label") as Label).text} (${entityId.slice(0, 3)})`
          : `Entity ${entityId.slice(0, 6)}`;

        if (!entityComponentListPanel) {
          entityComponentListPanel = createInspectorPanelSection({
            title,
          });

          const componentInspectorPanelBody = document.createElement("div");
          componentInspectorPanelBody.classList.add("inspector__panel-body");
          entityComponentListPanel.appendChild(componentInspectorPanelBody);

          inspectorRoot.appendChild(entityComponentListPanel);
        } else {
          const titleElement = entityComponentListPanel.querySelector(
            ".inspector__panel-title",
          )!;

          titleElement.textContent = title;
        }

        const componentInspectorPanels: HTMLElement[] = [];

        for (const component of entity.components) {
          const { name, ...properties } = component;

          if (name === "label" || Object.keys(properties).length === 0) {
            continue;
          }

          const componentInspectorPanel = document.createElement("div");

          const componentTitle = document.createElement("div");
          componentTitle.textContent = name;
          componentInspectorPanel.appendChild(componentTitle);

          // TODO: clean up panes when entity is unselected

          const componentPane = new Pane({
            container: componentInspectorPanel,
          });

          for (const [propertyName, propertyValue] of Object.entries(
            properties,
          )) {
            try {
              componentPane.addBinding(
                component as {
                  name: string;
                } & Record<string, unknown>,
                propertyName,
              );
            } catch (e) {
              console.error(e);
            }
          }

          componentInspectorPanels.push(componentInspectorPanel);
        }

        const bodyElement = entityComponentListPanel.querySelector(
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

  return part;
}

export default inspector;
