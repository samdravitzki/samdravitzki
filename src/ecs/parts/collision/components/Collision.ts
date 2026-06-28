import Vector from "../../../core/Vector/Vector";
import Component from "../../../core/Component/Component";

export type CollisionContact = Component & {
  // The ids of the entities colliding
  entityA: string;
  entityB: string;
  name: "collision-contact";
  // The collision point of the entity in local space
  contactPoint: Vector;
  // The normal of the point collided with
  normal: Vector;
  // The depth in which the collision occured
  penetration: number;
};
