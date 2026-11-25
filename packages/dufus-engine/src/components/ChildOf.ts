import { component } from "../core/Component/Component";
import World from "../core/World/World";

export const ChildOf = component<{ parentId: string }>({ name: "child-of" });


export function* getAncestors(world: World, entityId: string) {
  let currentEntityId = entityId;

  while (true) {
    const entity = world.entity(currentEntityId);
    const parent = entity.getComponent(ChildOf);

    if (!parent) {
      break;
    }

    yield parent.componentData.parentId;
    currentEntityId = parent.componentData.parentId;
  }
}
