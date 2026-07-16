import animationDemo from "../animation-demo/anim-demo";
import cursorActions from "../cursor-actions/cursor-actions";
import { Engine } from "../ecs/core/Engine/Engine";
import pong from "../pong/pong-game";
import projectTemplate from "../project-template/project-template";
import sdf from "../sdf/sdf";
import shifter from "../shifter/shifter";
import snakeGame from "../snake/snake-game";
import poissonDiscSamplingDemo from "../poisson-disk-sampling/poisson-disc-sampling";
import drumsGame from "../drums/drums";
import collisionDemo from "../collision-demo/collision-demo";

export type MiniApp = (parent?: HTMLElement) => Engine<any, any>;

export type MiniAppInfo = {
  name: string;
  symbol: string;
  appId: string;
  controls?: [string, string][];
  app: MiniApp;
};

const miniApps: MiniAppInfo[] = [];

// Disabled because the standard of the rest of the mini apps has surpassed it
// miniApps.push({
//   name: "snake",
//   symbol: "🐍",
//   appId: "snake",
//   controls: [["move", "wasd or arrow keys"]],
//   app: snakeGame,
// });

miniApps.push({
  name: "pong",
  symbol: "🎾",
  appId: "pong",
  controls: [["move paddle", "mouse"]],
  app: pong,
});

miniApps.push({
  name: "poisson-disc-sampling",
  symbol: "⋆.˚",
  appId: "poisson-disc-sampling",
  app: poissonDiscSamplingDemo,
});

miniApps.push({
  name: "drums",
  symbol: "🥁",
  appId: "drums",
  controls: [["hit drum", "any key"]],
  app: drumsGame,
});

miniApps.push({
  name: "shifter",
  symbol: "🕹️",
  appId: "shifter",
  controls: [["move", "wasd or arrow keys"]],
  app: shifter,
});

miniApps.push({
  name: "animation-demo",
  symbol: "⚡",
  appId: "animation-demo-sketch",
  app: animationDemo,
});

miniApps.push({
  name: "cursor-actions",
  symbol: "🖱️",
  appId: "cursor-actions",
  controls: [["interact", "click + drag"]],
  app: cursorActions,
});

miniApps.push({
  name: "sdf",
  symbol: "💧",
  appId: "sdf",
  controls: [["interact", "click + drag"]],
  app: sdf,
});

miniApps.push({
  name: "collision-demo",
  symbol: "💥",
  appId: "collision-demo",
  controls: [["interact", "click + drag"]],
  app: collisionDemo,
});

miniApps.push({
  name: "project-template",
  symbol: "📦",
  appId: "project-template",
  controls: [["nothing", "nothing to see or do here"]],
  app: projectTemplate,
});

export default miniApps;
