import p5 from "p5";
import { Part } from "../../core/Part/Part";
import Bounds from "../../core/Bounds/Bounds";
import Label from "../../core/Component/Label";

/**
 * The events the inspector depends on
 * and so requires the engine to emit in order to function
 */
type InspectorEvents = {
  setup: void;
  "world:entity-created": { entityId: string };
  "world:entity-removed": { entityId: string };
  "entity:component-added": { entityId: string; componentName: string };
  "entity:component-removed": { entityId: string; componentName: string };
};

function inspector(parent?: HTMLElement) {
  const part: Part<InspectorEvents> = ({ registerSystem, triggerBuilder }) => {
    registerSystem(
      "entity-debug-panel",
      triggerBuilder.on("setup"),
      (world, resources) => {
        const p = resources.get<p5>("p5");
        const canvasBounds = resources.get<Bounds>("canvas-bounds");

        const entityListWidth = 200;

        const entityListContainer = p.createDiv();
        entityListContainer.position(
          canvasBounds.top.left.x - entityListWidth,
          canvasBounds.top.left.y,
        );
        entityListContainer.style("display", "flex");
        entityListContainer.style("flex-direction", "column");
        entityListContainer.style("align-items", "start");
        entityListContainer.style("width", `${entityListWidth}px`);
        entityListContainer.style("background-color", "#28292e");
        entityListContainer.style("border-radius", "6px");
        entityListContainer.style("line-height", "1");
        entityListContainer.style("font-family", "monospace");
        entityListContainer.id("entity-list-container");

        const entityListTitle = p.createDiv("Entites");
        entityListTitle.style("background-color", "#bbbcc41a");
        entityListTitle.style("width", "100%");
        entityListTitle.parent(entityListContainer);
      },
    );

    registerSystem(
      "add-entity-to-debug-panel",
      triggerBuilder.on("world:entity-created"),
      (world, resources, state, emitter, payload) => {
        const p = resources.get<p5>("p5");
        const { entityId } = payload;

        const entityListContainer = p.select("#entity-list-container");

        if (!entityListContainer) {
          console.warn("Entity list container not found");
          return;
        }

        const shortEntityId = entityId.slice(0, 6);

        const entityContainer = p.createDiv(shortEntityId);
        entityContainer.style("padding-left", "8px");
        entityContainer.parent(entityListContainer);
        entityContainer.attribute("data-id", entityId);
      },
    );

    registerSystem(
      "add-component-to-debug-panel",
      triggerBuilder.on("entity:component-added"),
      (world, resources, state, emitter, payload) => {
        const p = resources.get<p5>("p5");

        const { entityId, componentName } = payload;

        const entityText = p.select(`[data-id="${entityId}"]`);

        if (!entityText) {
          console.warn("Entity text not found for entityId", entityId);
          return;
        }

        const entity = world.entity(entityId);

        if (componentName === "label") {
          const component = entity.getComponent(componentName) as Label;
          entityText.html(`${component.text} (${entityId.slice(0, 3)})`);
          return;
        }
      },
    );

    registerSystem(
      "remove-component-from-debug-panel",
      triggerBuilder.on("entity:component-removed"),
      (world, resources, state, emitter, payload) => {
        const p = resources.get<p5>("p5");

        const { entityId, componentName } = payload;

        if (componentName === "label") {
          const entityText = p.select(`[data-id="${entityId}"]`);
          if (!entityText) {
            return;
          }
          entityText.html(entityId.slice(0, 6));
          return;
        }
      },
    );

    registerSystem(
      "remove-entity-from-debug-panel",
      triggerBuilder.on("world:entity-removed"),
      (world, resources, state, emitter, payload) => {
        const p = resources.get<p5>("p5");
        const { entityId } = payload;

        const entityText = p.select(`[data-id="${entityId}"]`);
        entityText?.remove();
      },
    );
  };

  return part;
}

export default inspector;
