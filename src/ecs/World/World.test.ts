import { describe, expect, test } from 'vitest';
import World from './World';
import Entity from '../Entity/Entity';
import Component from '../Component/Component';

describe('query method', () => {

    test('should return entities when requesting a single component type', () => {
        // ARRANGE
        const entity1 = new Entity();
        const entity2 = new Entity();
        const componentA1: Component = { entityId: entity1.id, name: 'A' }
        const componentA2: Component = { entityId: entity2.id, name: 'A' }

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(componentA1);
        world.addComponent(componentA2);
        
        // ACT
        const result = world.query(['A']);
        
        // ASSERT
        expect(result).toEqual([
            [componentA1],
            [componentA2],
        ]);
    });

    test('should return entities when requesting multiple component type', () => {
        // ARRANGE
        const entity1 = new Entity();
        const entity2 = new Entity();
        const componentA1: Component = { entityId: entity1.id, name: 'A' };
        const componentB1: Component = { entityId: entity1.id, name: 'B' };
        const componentA2: Component = { entityId: entity2.id, name: 'A' };
        const componentB2: Component = { entityId: entity2.id, name: 'B' };

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(componentA1);
        world.addComponent(componentB1);
        world.addComponent(componentA2);
        world.addComponent(componentB2);
        
        // ACT
        const result = world.query(['A', 'B']);
        
        // ASSERT
        expect(result).toEqual([
            [componentA1, componentB1],
            [componentA2, componentB2],
        ])
    });

    test('should only return requested components of entities', () => {
         // ARRANGE
         const entity1 = new Entity();
         const componentA1: Component = { entityId: entity1.id, name: 'A' };
         const componentB1: Component = { entityId: entity1.id, name: 'B' };
         const componentC1: Component = { entityId: entity1.id, name: 'C' };

         const world = new World();
         world.addEntity(entity1);
         world.addComponent(componentA1);
         world.addComponent(componentB1);
         world.addComponent(componentC1);
         
         // ACT
         const result = world.query(['A', 'B']);
         
         // ASSERT
         expect(result).toEqual([
            [componentA1, componentB1]
         ]);
    });

    test('should only return entities that have all requested components', () => {
        // ARRANGE
        const entity1 = new Entity();
        const entity2 = new Entity();
        const componentA1: Component = { entityId: entity1.id, name: 'A' };
        const componentB1: Component = { entityId: entity1.id, name: 'B' };
        const componentA2: Component = { entityId: entity2.id, name: 'A' };

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(componentA1);
        world.addComponent(componentB1);
        world.addComponent(componentA2);
        
        // ACT
        const result = world.query(['A', 'B']);
        
        // ASSERT
        expect(result).toEqual([
           [componentA1, componentB1]
        ]);
   });
    
    test('should return empty list when requesting a component type that does not exist', () => {
        // ARRANGE
        const entity1 = new Entity();
        const componentA1: Component = { entityId: entity1.id, name: 'A' };

        const world = new World();
        world.addEntity(entity1);
        world.addComponent(componentA1);
        
        // ACT
        const result = world.query(['i-dont-exist']);
        
        // ASSERT
        expect(result).toEqual([]);
    });

    test('should return empty list when world has entities with no components', () => {
        // ARRANGE
        const entity1 = new Entity();

        const world = new World();
        world.addEntity(entity1);
        
        // ACT
        const result = world.query([]);
        
        // ASSERT
        expect(result).toEqual([]);
    });

    test('should return empty list when world has no entities or components', () => {
        // ARRANGE
        const world = new World();
        
        // ACT
        const result = world.query([]);
        
        // ASSERT
        expect(result).toEqual([]);
    });

    test('should return components in requested order', () => {
         // ARRANGE
         const entity1 = new Entity();
         const componentA1: Component = { entityId: entity1.id, name: 'A' };
         const componentB1: Component = { entityId: entity1.id, name: 'B' };
         const componentC1: Component = { entityId: entity1.id, name: 'C' };
 
         const world = new World();
         world.addEntity(entity1);
         world.addComponent(componentA1);
         world.addComponent(componentB1);
         world.addComponent(componentC1);
         
         // ACT
         const result = world.query(['C', 'B', 'A']);
         
         // ASSERT
         expect(result).toEqual([
            [componentC1, componentB1, componentA1]
         ]);
    })
});