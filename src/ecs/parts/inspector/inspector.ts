import { Part } from "../../core/Part/Part";
import Label from "../../core/Component/Label";

/**
 * helper to apply a styles object to an element with typings for autocompletion
 *
 * @param el the element to apply styles to
 * @param styles an object where keys are CSS properties and values are the corresponding CSS values
 * @returns the element with styles applied, for chaining
 */
function applyStyles<T extends HTMLElement>(
  el: T,
  styles: Partial<Record<keyof CSSStyleDeclaration, string>>,
): T {
  Object.entries(styles).forEach(([k, v]) => {
    // cast to any because CSSStyleDeclaration keys are camelCased
    (el.style as any)[k] = v;
  });
  return el;
}

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
  id,
}: {
  title: string;
  id: string;
}): HTMLElement {
  const section = document.createElement("div");
  section.id = `${id}-section`;

  applyStyles(section, {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    borderRadius: "6px",
    lineHeight: "1.2",
    fontFamily: "monospace",
    boxSizing: "border-box",
    color: "#fff",
    fontSize: "11px",
    overflowY: "auto",
  });

  const titleElement = document.createElement("div");
  titleElement.id = `${id}-section-title`;
  titleElement.textContent = title;
  applyStyles(titleElement, {
    backgroundColor: "#bbbcc41a",
    width: "100%",
    borderRadius: "4px 4px 0 0",
    marginBottom: "2px",
    fontSize: "0.95em",
    fontWeight: "600",
    textAlign: "center",
  });

  section.appendChild(titleElement);

  return section;
}

function createEntityListItem(entityId: string): HTMLElement {
  const shortEntityId = entityId.slice(0, 6);

  const entityListItem = document.createElement("div");
  entityListItem.textContent = shortEntityId;
  entityListItem.dataset.id = entityId;
  applyStyles(entityListItem, {
    padding: "0px 8px",
    textAlign: "left",
    overflow: "ellipsis",
    width: "100%",
    cursor: "pointer",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  });

  return entityListItem;
}

function inspector() {
  const part: Part<InspectorEvents> = ({ registerSystem, triggerBuilder }) => {
    registerSystem("debug-panel", triggerBuilder.on("setup"), () => {
      const inspectorPanel = document.createElement("div");
      inspectorPanel.id = "inspector-panel";
      applyStyles(inspectorPanel, {
        position: "fixed",
        height: "500px",
        width: "200px",
        backgroundColor: "#28292e",
        margin: "8px",
        display: "flex",
        flexDirection: "column",
      });

      const entityListContainer = createInspectorPanelSection({
        title: "World",
        id: "entity-list",
      });

      const body = document.body;

      body.appendChild(inspectorPanel);
      inspectorPanel.appendChild(entityListContainer);

      return () => {
        inspectorPanel?.remove();
      };
    });

    registerSystem(
      "add-entity-to-debug-panel",
      triggerBuilder.on("world:entity-created"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        const entityListContainer = document.getElementById(
          "entity-list-section",
        );

        if (!entityListContainer) {
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

        entityListContainer.appendChild(entityListItem);
      },
    );

    registerSystem(
      "add-component-to-debug-panel",
      triggerBuilder.on("entity:component-added"),
      (world, _resources, _state, _emitter, payload) => {
        const { entityId, componentName } = payload;

        const entityListContainer = document.getElementById(
          "entity-list-section",
        );

        if (!entityListContainer) {
          console.warn("Entity list container not found");
          return;
        }

        const entityText = entityListContainer.querySelector<HTMLElement>(
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
            <span style="background-color: #444;color: #fff; padding: 0px 4px; border-radius: 10px;font-size: 0.8em;">${entityId.slice(0, 6)}</span>
          `;
          return;
        }
      },
    );

    registerSystem(
      "remove-component-from-debug-panel",
      triggerBuilder.on("entity:component-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId, componentName } = payload;
        const entityListContainer = document.getElementById(
          "entity-list-section",
        );

        if (!entityListContainer) {
          return;
        }

        if (componentName === "label") {
          const entityText = entityListContainer.querySelector<HTMLElement>(
            `[data-id="${entityId}"]`,
          );
          if (!entityText) {
            return;
          }
          entityText.textContent = entityId.slice(0, 6);
          return;
        }
      },
    );

    registerSystem(
      "remove-entity-from-debug-panel",
      triggerBuilder.on("world:entity-removed"),
      (world, resources, state, emitter, payload) => {
        const { entityId } = payload;

        const entityListContainer = document.getElementById(
          "entity-list-section",
        );

        if (!entityListContainer) {
          return;
        }

        const entityText = entityListContainer.querySelector<HTMLElement>(
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

        let componentInspectorPanel = document.getElementById(
          "component-detail-section",
        );

        const entity = world.entity(entityId);

        const title = entity.hasComponent("label")
          ? `${(entity.getComponent("label") as Label).text} (${entityId.slice(0, 3)})`
          : `Entity ${entityId.slice(0, 6)}`;

        // If the component inspector panel doesn't exist, create it, otherwise update the title
        if (!componentInspectorPanel) {
          componentInspectorPanel = createInspectorPanelSection({
            title: title,
            id: "component-detail",
          });

          const inspectorPanel = document.getElementById("inspector-panel");

          if (!inspectorPanel) {
            console.warn("Inspector panel not found");
            return;
          }

          const componentInspectorPanelBody = document.createElement("div");
          componentInspectorPanelBody.id = "component-detail-section-body";
          componentInspectorPanel.appendChild(componentInspectorPanelBody);

          inspectorPanel.appendChild(componentInspectorPanel);
        } else {
          const componentInspectorPanelTitle = document.getElementById(
            "component-detail-section-title",
          );

          if (!componentInspectorPanelTitle) {
            console.warn("Inspector panel title not found");
            return;
          }
          componentInspectorPanelTitle.textContent = title;
        }

        const components = entity.components;
        components.sort((a, b) => a.name.localeCompare(b.name));

        const children: Node[] = [];

        for (const component of entity.components) {
          const { name, ...properties } = component;

          if (name === "label") {
            continue;
          }

          const componentSection = document.createElement("div");

          const componentTitle = document.createElement("div");
          componentTitle.textContent = name;

          componentSection.appendChild(componentTitle);

          const componentPropertyList = document.createElement("ul");
          componentSection.appendChild(componentPropertyList);

          for (const [propertyName, propertyValue] of Object.entries(
            properties,
          )) {
            const componentProperty = document.createElement("li");
            componentProperty.textContent = `${propertyName}: ${propertyValue}`;
            componentPropertyList.appendChild(componentProperty);
          }

          children.push(componentSection);
        }

        const componentInspectorPanelBody = document.getElementById(
          "component-detail-section-body",
        );

        if (!componentInspectorPanelBody) {
          console.warn("Inspector panel body not found");
          return;
        }

        componentInspectorPanelBody.replaceChildren(...children);
      },
    );
  };

  return part;
}

export default inspector;
