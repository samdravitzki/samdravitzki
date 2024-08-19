import p5 from 'p5';
import System from '../ecs/System/System';
import World from '../ecs/World/World';
import Bounds from '../Bounds/Bounds';
import Vector from '../Vector/Vector';
import { Collider, Position, PrimitiveShape } from './components';
import Entity from '../ecs/Entity/Entity';
import Component from '../ecs/Component/Component';

export type MousePositionComponent = Component & {
    name: 'mouse-position',
    x: number,
    y: number,
}

/**
 * Built based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class Engine {
    private _world: World = new World();
    private _systems: System[] = [];

    private _element: HTMLElement;

    constructor(element: HTMLElement) {
        this._element = element;
    }

    setWorld(world: World): Engine {
        this._world = world;
        return this;
    }

    addSystem(system: System): Engine {
        this._systems.push(system);
        return this;
    }


    run() {
        const sys = this._systems;
        const wor = this._world;
        new p5(sketch => {
            const p = sketch as unknown as p5;
            const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 250));

            p.setup = function setup() {
                p.createCanvas(...playBounds.size);
                p.colorMode(p.HSB, 360, 100, 100, 100);
                p.noStroke();
                p.rectMode(p.CENTER);

                const inputEntity = new Entity();
                const mousePositionComponent: MousePositionComponent = {
                    name: 'mouse-position',
                    entityId: inputEntity.id,
                    x: 0,
                    y: 0,
                }
                
                wor.addEntity(inputEntity);
                wor.addComponent(mousePositionComponent);
            }

            p.draw = function draw() {
                p.background(240, 90, 60);

                // Mouse position input system
                const [mousePosition] = wor.query(['mouse-position'])[0] as [MousePositionComponent];
                mousePosition.x = p.mouseX;
                mousePosition.y = p.mouseY;

                sys.forEach((system) => system(wor));

                // Render system
                for (const [position, primitive] of wor.query(['position', 'primitive']) as [Position, PrimitiveShape][]) {
                    if (!primitive.strokeWeight) {
                        p.strokeWeight(0);
                    } else {
                        p.strokeWeight(primitive.strokeWeight);
                    }

                    if (!primitive.stroke) {
                        p.noStroke();
                    } else {
                        p.stroke(primitive.stroke);
                    }

                    if (!primitive.fill) {
                        p.noFill()
                    } else {
                        p.fill(primitive.fill)
                    }

                    if (primitive.type === 'circle') {
                        p.circle(position.position.x, position.position.y, primitive.radius * 2);
                    }

                    if (primitive.type === 'line') {
                        p.line(
                            primitive.start.x + position.position.x, primitive.start.y + position.position.y,
                            primitive.end.x + position.position.x, primitive.end.y + position.position.y
                        )
                    }

                    if (primitive.type === 'square') {
                        p.rect(position.position.x, position.position.y, primitive.width, primitive.height)
                    }

                    if (primitive.type === 'text') {
                        p.textSize(primitive.size);

                        if (primitive.align === 'left') p.textAlign(p.LEFT);
                        if (primitive.align === 'right') p.textAlign(p.RIGHT);

                        p.text(primitive.text, position.position.x, position.position.y);
                    }
                }

                // Collider rendering system
                for (const [col, pos] of wor.query(['collider', 'position']) as [Collider, Position][]) {
                    if (col.type === 'aabb') {
                        p.stroke(111, 100, 100);
                        p.strokeWeight(0.5)
                        p.noFill()
                        p.rect(pos.position.x, pos.position.y, col.width, col.height);
                    }
                }
            }
        }, this._element);
    }
}

export default Engine;