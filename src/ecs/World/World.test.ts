import { describe, expect, test } from 'vitest';
import World from './World';
import Entity from '../Entity/Entity';
import Component from '../Component/Component';
import Bundle from '../Bundle/Bundle';

describe('addComponent method', () => {
    test('should add a component', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentA: Component = { name: 'A' };
        
        world.addEntity(entity1);

        // ACT
        world.addComponent(entity1.id, componentA);

        // ASSERT
        expect(world.components).toEqual([componentA])
    });

    // Based on https://stackoverflow.com/questions/20720360/ecs-can-an-entity-have-more-than-one-component-of-given-type
    test('should throw error when component of the same type already exists associated with the same entity', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentA: Component = { name: 'A' };

        world.addEntity(entity1);
        world.addComponent(entity1.id, componentA);

        // ACT and ASSERT
        expect(() => world.addComponent(entity1.id, componentA)).toThrowError()
    })
});

describe('replaceComponent method', () => {
    test('should add a component', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentA: Component = { name: 'A' };
        
        world.addEntity(entity1);

        // ACT
        world.replaceComponent(entity1.id, componentA);

        // ASSERT
        expect(world.components).toEqual([componentA])
    });

    test('should replace component when one already exists associated with the same entity', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentAV1 = { name: 'A', value: 1 };
        const componentAV2 = { name: 'A', value: 2 };
        
        world.addEntity(entity1);
        world.addComponent(entity1.id, componentAV1)

        // ACT
        world.replaceComponent(entity1.id, componentAV2);

        // ASSERT
        expect(world.components).toEqual([componentAV2])
    });

    test('should cause existing components to be removed', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentAV1 = { name: 'A', value: 1 };
        const componentAV2 = { name: 'A', value: 2 };
        const componentB = { name: 'B' };
        
        world.addEntity(entity1);
        world.addComponent(entity1.id, componentAV1)
        world.addComponent(entity1.id, componentB)

        // ACT
        world.replaceComponent(entity1.id, componentAV2);

        // ASSERT
        expect(world.components).toEqual([componentAV2, componentB])
    });
});

describe('addBundle method', () => {
    test('should add entity from bundle to world', () => {
        // ARRANGE
        const world = new World();

        const bundle: Bundle = {
            entity: new Entity(),
            components: [],
        };

        // ACT
        world.addBundle(bundle);

        // ASSERT
        expect(world.entities).toEqual([bundle.entity]);
    });

    test('should add components from bundle to world', () => {
        // ARRANGE
        const world = new World();
        
        const bundleEntity = new Entity();
        const bundle: Bundle = {
            entity: bundleEntity,
            components: [
                { name: 'A' },
                { name: 'B' },
            ],
        };

        // ACT
        world.addBundle(bundle);

        // ASSERT
        expect(world.components).toEqual(bundle.components);
    });
});

describe('removeComponent method', () => {
    test('should remove supplied component from world', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentA = { entityId: entity1.id, name: 'A' };

        world.addEntity(entity1);
        world.addComponent(entity1.id, componentA);

        // ACT
        world.removeComponent(entity1.id, componentA);

        // ASSERT
        expect(world.components).toEqual([]);
    });
});

describe('removeEntity method', () => {
    test('should remove entity from world with supplied id', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        const componentA = { entityId: entity1.id, name: 'A' };
        world.addEntity(entity1);
        world.addComponent(entity1.id, componentA);

        // ACT
        world.removeEntity(entity1.id);

        // ASSERT
        expect(world.components).toEqual([]);
    });

    test('should remove components from world associated with entity', () => {
        // ARRANGE
        const world = new World();
        const entity1 = new Entity();
        world.addEntity(entity1);

        // ACT
        world.removeEntity(entity1.id);

        // ASSERT
        expect(world.entities).toEqual([]);
    });
})

describe('query method', () => {

    test('should return entities with component when requesting a single component type', () => {
        // ARRANGE
        const entity1 = new Entity();
        const entity2 = new Entity();
        const componentA1: Component = { name: 'A' };
        const componentA2: Component = { name: 'A' };

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(entity1.id, componentA1);
        world.addComponent(entity2.id, componentA2);
        
        // ACT
        const result = world.query(['A']).map(({ components }) => components);
        
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
        const componentA1: Component = { name: 'A' };
        const componentB1: Component = { name: 'B' };
        const componentA2: Component = { name: 'A' };
        const componentB2: Component = { name: 'B' };

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(entity1.id, componentA1);
        world.addComponent(entity1.id, componentB1);
        world.addComponent(entity2.id, componentA2);
        world.addComponent(entity2.id, componentB2);
        
        // ACT
        const result = world.query(['A', 'B']).map(({ components }) => components);;
        
        // ASSERT
        expect(result).toEqual([
            [componentA1, componentB1],
            [componentA2, componentB2],
        ])
    });

    test('should only return requested components of entities', () => {
         // ARRANGE
         const entity1 = new Entity();
         const componentA1: Component = { name: 'A' };
         const componentB1: Component = { name: 'B' };
         const componentC1: Component = { name: 'C' };

         const world = new World();
         world.addEntity(entity1);
         world.addComponent(entity1.id, componentA1);
         world.addComponent(entity1.id, componentB1);
         world.addComponent(entity1.id, componentC1);
         
         // ACT
         const result = world.query(['A', 'B']).map(({ components }) => components);;
         
         // ASSERT
         expect(result).toEqual([
            [componentA1, componentB1]
         ]);
    });

    test('should only return entities that have all requested components', () => {
        // ARRANGE
        const entity1 = new Entity();
        const entity2 = new Entity();
        const componentA1: Component = { name: 'A' };
        const componentB1: Component = { name: 'B' };
        const componentA2: Component = { name: 'A' };

        const world = new World();
        world.addEntity(entity1);
        world.addEntity(entity2);
        world.addComponent(entity1.id, componentA1);
        world.addComponent(entity1.id, componentB1);
        world.addComponent(entity2.id, componentA2);
        
        // ACT
        const result = world.query(['A', 'B']).map(({ components }) => components);;
        
        // ASSERT
        expect(result).toEqual([
           [componentA1, componentB1]
        ]);
   });
    
    test('should return empty list when requesting a component type that does not exist', () => {
        // ARRANGE
        const entity1 = new Entity();
        const componentA1: Component = { name: 'A' };

        const world = new World();
        world.addEntity(entity1);
        world.addComponent(entity1.id, componentA1);
        
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
        const result = world.query([]).map(({ components }) => components).flat();
        
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
         const componentA1: Component = { name: 'A' };
         const componentB1: Component = { name: 'B' };
         const componentC1: Component = { name: 'C' };
 
         const world = new World();
         world.addEntity(entity1);
         world.addComponent(entity1.id, componentA1);
         world.addComponent(entity1.id, componentB1);
         world.addComponent(entity1.id, componentC1);
         
         // ACT
         const result = world.query(['C', 'B', 'A']).map(({ components }) => components);;
         
         // ASSERT
         expect(result).toEqual([
            [componentC1, componentB1, componentA1]
         ]);
    })
});