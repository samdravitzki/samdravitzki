import createBundle from '../ecs/Bundle/createBundle';
import World from '../ecs/World/World';
import Vector from '../Vector/Vector';


function setupBoundaries(world: World) {
    const northWallBundle = createBundle([
        {
            name: 'primitive',
            fill:  [240, 60, 100],
            type: 'square',
            width: 500,
            height: 10
        },
        {
            name: 'position',
            position: new Vector(250, 5),
        },
        {
            name: 'collider',
            layer: 'wall',
            type: 'aabb',
            width: 500,
            height: 10
        }
    ]);
    
    const southWallBundle = createBundle([
        {
            name: 'primitive',
            fill:  [240, 60, 100],
            type: 'square',
            width: 500,
            height: 10
        },
        {
            name: 'position',
            position: new Vector(250, 245),
        },
        {
            name: 'collider',
            type: 'aabb',
            layer: 'wall',
            width: 500,
            height: 10
        },
    ]);
    
    const centerLineBundle = createBundle([
        {
            name: 'primitive',
            stroke: [240, 60, 100],
            strokeWeight: 2,
            fill:  [240, 60, 100],
            type: 'line',
            start: new Vector(0, -125),
            end: new Vector(0, 125)
        },
        {
            name: 'position',
            position: new Vector(250, 125),
        },
    ]);
    
    const leftBackboardBundle = createBundle([
        {
            name: 'primitive',
            fill:  [352, 94, 100],
            type: 'square',
            width: 5,
            height: 250
        },
        {
            name: 'position',
            position: new Vector(2.5, 125),
        },
        {
            name: 'collider',
            type: 'aabb',
            layer: 'wall',
            width: 5,
            height: 230
        },
        {
            name: 'backboard',
            owner: 'player',
        },
    ]);
    
    const rightBackboardBundle = createBundle([
        {
            name: 'primitive',
            fill:  [352, 94, 100],
            type: 'square',
            width: 5,
            height: 250
        },
        {
            name: 'position',
            position: new Vector(497.5, 125),
        },
        {
            name: 'collider',
            type: 'aabb',
            layer: 'wall',
            width: 5,
            height: 230
        },
        {
            name: 'backboard',
            owner: 'ai',
        },
    ]);

    world.addBundle(northWallBundle);
    world.addBundle(southWallBundle);
    world.addBundle(centerLineBundle);
    world.addBundle(leftBackboardBundle);
    world.addBundle(rightBackboardBundle);
}

export default setupBoundaries;