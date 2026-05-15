import p5 from "p5";
import { Pane } from "tweakpane";
import Bounds from "../ecs/core/Bounds/Bounds";
import createBundle from "../ecs/core/Bundle/createBundle";
import { EngineBuilder } from "../ecs/core/Engine/EngineBuilder";
import { ResourcePool } from "../ecs/core/Engine/ResourcePool";
import State from "../ecs/core/State/State";
import Vector from "../ecs/core/Vector/Vector";
import World from "../ecs/core/World/World";
import p5Part, { MousePosition } from "../ecs/parts/p5/p5-part";
import poissonDisc from "../lib/poisson-disc/poisson-disc";
import randomDots from "./random-dots/random-dots";
import { Position } from "../ecs/components/Position";
import { ShapeStyle } from "../ecs/parts/p5/primitive-renderer/ShapeStyle";
import { Circle } from "../ecs/parts/p5/shape-components";

const pallete = {
  background: "#151515",
  secondary: "#252525",
  primary: "#F97316",
};

function placeRandomDots(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const dots = randomDots(100, canvasBounds);

  for (const dot of dots) {
    world.addBundle(
      createBundle([
        {
          name: "circle",
          radius: 5,
        } satisfies Circle,
        {
          name: "shape-style",
          stroke: pallete.secondary,
          strokeWeight: 2,
        } satisfies ShapeStyle,
        {
          name: "position",
          position: dot,
        } satisfies Position,
      ]),
    );
  }
}

const DEFAULT_MIN_DISTANCE = 12;
const DEFAULT_SAMPLE_LIMIT = 30;
const DOT_WIDTH = 2;

function createPoissonDot(dot: Vector) {
  return createBundle([
    "poisson-dot",
    {
      name: "position",
      position: dot,
    } satisfies Position,
    {
      name: "circle",
      radius: DOT_WIDTH,
    } satisfies Circle,
    {
      name: "shape-style",
      fill: pallete.primary,
    },
  ]);
}

function placePoissonDots(world: World, resources: ResourcePool) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");

  const dots = poissonDisc(
    canvasBounds,
    DEFAULT_MIN_DISTANCE,
    DEFAULT_SAMPLE_LIMIT,
  );

  for (const dot of dots) {
    world.addBundle(createPoissonDot(dot));
  }
}

export default function poissonDiscSamplingDemoApp(parent?: HTMLElement) {
  const engine = EngineBuilder.create()
    .state("poisson:min-distance", DEFAULT_MIN_DISTANCE)
    .state("poisson:sample-limit", DEFAULT_SAMPLE_LIMIT)
    .event("poisson:config-change")
    .event("setup")
    .event("update")
    .event("after-update")
    .build();

  engine.part(p5Part([500, 500], parent, pallete.background));

  engine.system(
    "place-random-dots",
    engine.trigger.on("setup"),
    placeRandomDots,
  );

  engine.system(
    "place-poisson-dots",
    engine.trigger.on("setup"),
    placePoissonDots,
  );

  engine.system(
    "regenerate-poisson-dots",
    engine.trigger.on("poisson:config-change"),
    (world, resources, state) => {
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const poissonDots = world.query<[Position, string]>([
        "position",
        "entity-id",
        "poisson-dot",
      ]);

      const minDistance = state["poisson:min-distance"].value;
      const sampleLimit = state["poisson:sample-limit"].value;

      const dots = poissonDisc(canvasBounds, minDistance, sampleLimit);

      for (const [index, entity] of poissonDots.entries()) {
        const [position, entityId] = entity;

        const dot = dots[index];

        if (dot) {
          position.position = dot;
        } else {
          // Remove extra dots if the new config results in less dots being generated
          world.removeEntity(entityId);
        }
      }

      // Create new dots if more were generated as a result of the config change
      if (dots.length > poissonDots.length) {
        for (let i = poissonDots.length; i < dots.length; i++) {
          const dot = dots[i];
          world.addBundle(createPoissonDot(dot));
        }
      }
    },
  );

  engine.system(
    "dot-size-hover-effect",
    engine.trigger.on("update"),
    (world, resources) => {
      const p = resources.get<p5>("p5");

      const { x: mouseX, y: mouseY } =
        resources.get<MousePosition>("mouse-position");
      const mousePosition = Vector.create(mouseX, mouseY);

      const HOVER_RADIUS = 100;
      const MAX_SCALE = 3;

      const poissonDots = world.query<[Position, Circle]>([
        "position",
        "circle",
        "poisson-dot",
      ]);

      for (const [position, circle] of poissonDots) {
        const distance = position.position.distance(mousePosition);

        if (distance < HOVER_RADIUS) {
          const scale = 1 + (MAX_SCALE - 1) * (1 - distance / HOVER_RADIUS);
          circle.radius = DOT_WIDTH * scale;
        } else {
          circle.radius = DOT_WIDTH;
        }
      }
    },
  );

  engine.system(
    "setup-debug-gui",
    engine.trigger.on("setup"),
    (world, resources, state, emitter) => {
      const p = resources.get<p5>("p5");
      const canvasBounds = resources.get<Bounds>("canvas-bounds");

      const debugGui = p.createDiv();
      debugGui.position(0, canvasBounds.max.y + 8, "absolute");
      debugGui.style("width", canvasBounds.width + "px");

      const pane = new Pane({
        container: debugGui.elt,
        title: "Poisson Disc Sampling",
      });

      type BindableState = {
        [K in keyof typeof state]: (typeof state)[K] extends State<infer U>
          ? U
          : never;
      };

      const bindableState = Object.fromEntries(
        Object.entries(state).map(([key, state]) => [key, state.value]),
      ) as BindableState;

      const proxiedBindableState = new Proxy(bindableState, {
        set(
          target,
          prop: keyof BindableState,
          value: BindableState[typeof prop],
        ) {
          state[prop].setValue(value);
          target[prop] = value;
          return true;
        },
      });

      pane
        .addBinding(proxiedBindableState, "poisson:min-distance", {
          min: 10,
          max: 50,
        })
        .on("change", (ev) => {
          emitter.emit({
            event: "poisson:config-change",
          });
        });

      pane
        .addBinding(proxiedBindableState, "poisson:sample-limit", {
          min: 1,
          max: 100,
          step: 1,
        })
        .on("change", (ev) => {
          emitter.emit({
            event: "poisson:config-change",
          });
        });

      return () => pane.dispose();
    },
  );

  return engine;
}
