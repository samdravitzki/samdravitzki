import Vector from "../../../core/Vector/Vector";
import { component } from "../../../core/Component/Component";

export type CollisionContactData = {
  // The ids of the entities colliding
  entityA: string;
  entityB: string;
  // The collision point of the entity in local space
  contactPoint: Vector;
  // The normal of the point collided with
  normal: Vector;
  // The depth in which the collision occured
  penetration: number;
};

export const CollisionContact = component<CollisionContactData>({
  name: "collision-contact",
});
