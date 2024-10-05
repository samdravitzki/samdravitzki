import { describe, expect, test } from 'vitest';
import World from './World';
import Component from '../Component/Component';
import Bundle from '../Bundle/Bundle';

describe('createEntity method', () => { 
    test('should return new entity', () => {
        // ARRANGE
        const world = new World();

        // ACT
        const entity = world.createEntity();

        // ASSERT
        expect(entity.id).not.toBeNull();
    })
});

describe('addBundle method', () => {
    test('should add entityto world when bundle is added to world', () => {
        // ARRANGE
        const world = new World();

        const bundle: Bundle = {
            components: [],
        };

        // ACT
        world.addBundle(bundle);

        // ASSERT
        expect(world.entities.length).toEqual(1);
    });

    test('should add components from bundle to world', () => {
        // ARRANGE
        const world = new World();
        
        const bundle: Bundle = {
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

describe('removeEntity method', () => {
    test('should remove entity from world with supplied id', () => {
        // ARRANGE
        const world = new World();
        const entity1 = world.createEntity();
        const componentA = { entityId: entity1.id, name: 'A' };
        entity1.addComponent(componentA);

        // ACT
        world.removeEntity(entity1.id);

        // ASSERT
        expect(world.components).toEqual([]);
    });

    test('should remove components from world associated with entity', () => {
        // ARRANGE
        const world = new World();
        const entity1 = world.createEntity();

        // ACT
        world.removeEntity(entity1.id);

        // ASSERT
        expect(world.entities).toEqual([]);
    });
})

describe('entity method', () => { 
    test('should return entity with supplied id', () => {
        // ARRANGE
        const world = new World();
        const entity = world.createEntity();
        // ACT
        const result = world.entity(entity.id)

        // ASSERT
        expect(result.id).toEqual(entity.id);
    });

    test('should throw error if entity with id doesn not exist', () => {
        // ARRANGE
        const world = new World();
        // ACT / ASSERT
        expect(() => world.entity('fake-entity-id')).toThrow(Error);
    })
 })

describe('query method', () => {

    test('should return id of entity when \'entity-id\' is supplied as a query string', () => {
            // ARRANGE
            const componentA1: Component = { name: 'A' };

            const world = new World();
            const entity = world.createEntity();
            entity.addComponent(componentA1);

            // ACT
            const result = world.query(['A', 'entity-id']);

            // ASSERT
            expect(result).toEqual([
                [componentA1, entity.id],
            ]);
    });


    test('should return entities with component when requesting a single component type', () => {
        // ARRANGE
        const componentA1: Component = { name: 'A' };
        const componentA2: Component = { name: 'A' };

        const world = new World();
        const entity1 = world.createEntity();
        const entity2 = world.createEntity();

        entity1.addComponent(componentA1);
        entity2.addComponent(componentA2);
        
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
        const componentA1: Component = { name: 'A' };
        const componentB1: Component = { name: 'B' };
        const componentA2: Component = { name: 'A' };
        const componentB2: Component = { name: 'B' };

        const world = new World();
        const entity1 = world.createEntity();
        const entity2 = world.createEntity();
        entity1.addComponent(componentA1);
        entity1.addComponent(componentB1);
        entity2.addComponent(componentA2);
        entity2.addComponent(componentB2);
        
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
         const componentA1: Component = { name: 'A' };
         const componentB1: Component = { name: 'B' };
         const componentC1: Component = { name: 'C' };

         const world = new World();
         const entity1 = world.createEntity();
         entity1.addComponent(componentA1);
         entity1.addComponent(componentB1);
         entity1.addComponent(componentC1);
         
         // ACT
         const result = world.query(['A', 'B']);
         
         // ASSERT
         expect(result).toEqual([
            [componentA1, componentB1]
         ]);
    });

    test('should only return entities that have all requested components', () => {
        // ARRANGE
        const componentA1: Component = { name: 'A' };
        const componentB1: Component = { name: 'B' };
        const componentA2: Component = { name: 'A' };

        const world = new World();
        const entity1 = world.createEntity();
        const entity2 = world.createEntity();
        entity1.addComponent(componentA1);
        entity1.addComponent(componentB1);
        entity2.addComponent(componentA2);
        
        // ACT
        const result = world.query(['A', 'B']);
        
        // ASSERT
        expect(result).toEqual([
           [componentA1, componentB1]
        ]);
   });
    
    test('should return empty list when requesting a component type that does not exist', () => {
        // ARRANGE
        const componentA1: Component = { name: 'A' };

        const world = new World();
        const entity1 = world.createEntity();
        entity1.addComponent(componentA1);
        
        // ACT
        const result = world.query(['i-dont-exist']);
        
        // ASSERT
        expect(result).toEqual([]);
    });

    test('should return empty list when world has entities with no components', () => {
        // ARRANGE

        const world = new World();
        world.createEntity();
        
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
         const componentA1: Component = { name: 'A' };
         const componentB1: Component = { name: 'B' };
         const componentC1: Component = { name: 'C' };
 
         const world = new World();
         const entity1 = world.createEntity();
         entity1.addComponent(componentA1);
         entity1.addComponent(componentB1);
         entity1.addComponent(componentC1);
         
         // ACT
         const result = world.query(['C', 'B', 'A']);
         
         // ASSERT
         expect(result).toEqual([
            [componentC1, componentB1, componentA1]
         ]);
    })
});