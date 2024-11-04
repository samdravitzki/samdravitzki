import p5 from 'p5';
import System, { MousePosition } from '../ecs/System/System';
import World from '../ecs/World/World';
import Bounds from '../Bounds/Bounds';
import Vector from '../Vector/Vector';
import { Position, PrimitiveShape } from './components';


/**
 * Resources:
 * 
 * Global state shared between systems that is not associated with any
 * entity in particular
 * 
 * Resources add the flexibility to break out of the ecs pattern adding 
 * the ability to implement solutions in different ways that may be more 
 * appropiate to solve the problem at hand
 * 
 * Examples of this type of state could be score or the current key pressed 
 * 
 * Reference
 * - https://bevy-cheatbook.github.io/programming/res.html
 * - https://www.gamedev.net/forums/topic/710271-where-should-shared-resources-live-in-an-ecs-engine/
 */
// type Resource = {

// }

/**
 * Conditional Systems:
 * 
 * Implementations of ECS all seem to eventually need a way to orchestrate in what situations 
 * systems will run. Both Unity and Bevy implement a mechanism for doing this with Unitys being
 * Component System Groups and Bevys being States
 * 
 * Reference
 * - https://docs.unity3d.com/Packages/com.unity.entities@1.0/manual/systems-update-order.html
 * - https://github.com/bevyengine/bevy/blob/main/examples/games/game_menu.rs
 * 
 * Currently I am running into an issue where I want the game to have a pause menu and a main menu,
 * but in each menu you want different systems to run and others to stop. It looks like I will need
 * to introduce a similiar concept to orchestrate functions into this codebase to introduce menus.
 * The goal is I should end up with something that can stop the game systems when opening the pause 
 * menu, trigger some systems to run to setup the menu and run systems while the menu is open. Then 
 * when the menu is closed a set of systems runs to close the menu and unpause. This should also
 * be generalised so that it can be applied to other scenarios in which I want to conditionally run
 * systems
 * 
 * These states could be modeled in a simlar way to how they are in react?
 * 
 * An alternative approach to conditional systems is to have multiple worlds and conditions for determining
 * which world is available to the user. The issue for me with this tho is it is almost exactly the same
 * as doing conditional systems except for if you can't have the same systems that run no matter whether
 * the game is paused or not meaning its just seems less flexible
 */

type ApplicationState = 'paused' | 'main-menu' | 'in-game';
type EngineLifecycleEvent = 'start' | 'update';


type SystemRegistration = {
    system: System,
    // run system depending on the application state, if non specified run always
    runCondition?: RunCondition
}

type RunCondition = {
    event: EngineLifecycleEvent;
    state?: ApplicationState;
    trigger?: 'on-enter' | 'on-exit' // When triggers is excluded its run every frame
};

type StateChange = 'on-enter' | 'on-exit';

class State<T> {
    private _value: T;

    private _listeners = new Map<T, Record<StateChange, (() => void)[]>>();

    constructor(startingValue: T) {
        this._value = startingValue;
    }

    get value() {
        return this._value;
    }

    /**
     * Register a callback that will be invoked when the change in
     * state specified by the user occurs
     * 
     * i.e. when a particular state exits, call the supplied function
     * @param stateChange 
     * @param listener 
     */
    registerListener(value: T, stateChange: StateChange, listener: () => void) {
        if (!this._listeners.has(value)) {
            this._listeners.set(value, {
                'on-enter': [],
                'on-exit': []
            });
        }

        // We can assume there is an entry for value because of the above line
        const valueStateListeners = this._listeners.get(value)!;

        valueStateListeners[stateChange].push(listener);
    }

    /**
     * Trigger on-enter listeners asscociated with value of state
     */
    private handleEnter(value: T) {
        const valueStateListeners = this._listeners.get(value)?.['on-enter'];

        if (valueStateListeners !== undefined){
            valueStateListeners.forEach((listener) => listener())
        }
    }

    /**
     * Trigger on-exit listeners asscociated with value of state
     */
    private handleExit(value: T) {
        const valueStateListeners = this._listeners.get(value)?.['on-exit'];

        if (valueStateListeners !== undefined){
            valueStateListeners.forEach((listener) => listener())
        }
    }

    setValue(value: T) {
        this.handleEnter(value);
        this._value = value;
        this.handleExit(value);
    }

}

/**
 * Designed based bevy ecs app builder api https://bevy-cheatbook.github.io/programming/app-builder.html
 */
class Engine {
    private _world = new World();
    private _systems = new Map<EngineLifecycleEvent, SystemRegistration[]>();

    // Need to generalise this to support any states created by the user of the Engine class
    private _applicationState = new State<ApplicationState>('main-menu');

    private _element: HTMLElement;

    constructor(element: HTMLElement) {
        this._element = element;
    }

    

    addSystem(condition: RunCondition, system: System): Engine {
        const eventSystems = this._systems.get(condition.event);

        const systemRegistration = {
            system,
            runCondition: condition,
        }

        if (!eventSystems) {
            this._systems.set(condition.event, [systemRegistration]);
        } else {
            eventSystems.push(systemRegistration)
        }
        
        return this;
    }

    addSystems(condition: RunCondition, systems: System[]) {
        systems.forEach((system) => {
            this.addSystem(condition, system);
        })

        return this;
    }


    run() {
        // Have to rescope this because the p5 callback hs its own this
        const self = this;

        new p5(sketch => {
            const p = sketch as unknown as p5;
            const playBounds = Bounds.create(Vector.create(0, 0), Vector.create(500, 250));

            p.setup = function setup() {
                p.createCanvas(...playBounds.size);
                p.colorMode(p.HSB, 360, 100, 100, 100);
                p.noStroke();
                p.rectMode(p.CENTER);

                const mousePosition: MousePosition = {
                    x: 0,
                    y: 0,
                };

                const eventTriggeredSystems = self._systems.get('update')?.filter((reg) => (
                    reg.runCondition?.trigger !== undefined
                ));

                if (eventTriggeredSystems !== undefined) {
                    eventTriggeredSystems?.forEach(({ system, runCondition }) => {
                        if (runCondition?.trigger === undefined || runCondition.state === undefined) {
                            return;
                        }
                        // Not sure but the mouse position passed to this system might be out of date
                        self._applicationState.registerListener(runCondition.state, runCondition.trigger, () => system(self._world, { mousePosition }))
                    });
                }


                const startSystems = self._systems.get('start') ?? [];

                startSystems.forEach(({ system }) => system(self._world, { mousePosition }));

                let button = p.createButton('start game');
                button.position(0, 250, 'absolute');

                button.mousePressed(() => {
                    const appState = self._applicationState.value;
                    console.log(appState);

                    if (appState === 'in-game') {
                        self._applicationState.setValue('main-menu');
                        return;
                    };

                    if (appState === 'main-menu') {
                        self._applicationState.setValue('in-game');
                        return;
                    };
                })
            }

            p.draw = function draw() {
                p.background(240, 90, 60);

                const updateSystems = self._systems.get('update') ?? [];

                const mousePosition: MousePosition = {
                    x: p.mouseX,
                    y: p.mouseY,
                };

                updateSystems.forEach(({ system, runCondition }) => {
                    if (runCondition === undefined 
                        || (runCondition.state === self._applicationState.value 
                            && (runCondition.trigger === undefined))
                        ) {
                        system(self._world, { mousePosition });
                    }
                });

                // Render system
                for (const [position, primitive] of self._world.query<[Position, PrimitiveShape]>(['position', 'primitive'])) {
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
                // for (const [col, pos] of wor.query(['collider', 'position']) as [Collider, Position][]) {
                //     if (col.type === 'aabb') {
                //         p.stroke(111, 100, 100);
                //         p.strokeWeight(0.5)
                //         p.noFill()
                //         p.rect(pos.position.x, pos.position.y, col.width, col.height);
                //     }
                // }
            }
        }, this._element);
    }
}

export default Engine;