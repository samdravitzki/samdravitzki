import createBundle from '../ecs/Bundle/createBundle';
import World from '../ecs/World/World';
import Vector from '../Vector/Vector';

function setupPaddles(world: World) {
    const playerPaddleBundle = createBundle([
        'player',
        'paddle',
        {
            name: 'primitive',
            fill: [240, 60, 100],
            type: 'square',
            width: 5,
            height: 20
        },
        {
            name: 'position',
            position: new Vector(10, 50),
        },
        {
            name: 'speed',
            value: 0.05,
        },
        {
            name: 'velocity',
            velocity: new Vector(0, 3),
        },
        {
            name: 'collider',
            type: 'aabb',
            layer: 'wall',
            width: 5,
            height: 20
        },
    
    ]);
    
    const aiPaddleBundle = createBundle([
        'ai',
        'paddle',
        {
            name: 'primitive',
            fill: [240, 60, 100],
            type: 'square',
            width: 5,
            height: 20
        },
        {
            name: 'position',
            position: new Vector(490, 70),
        },
        {
            name: 'speed',
            value: 0.05,
        },
        {
            name: 'collider',
            type: 'aabb',
            layer: 'wall',
            width: 5,
            height: 20
        }
    ]);
    
    world.addBundle(playerPaddleBundle);
    world.addBundle(aiPaddleBundle);
};

export default setupPaddles;