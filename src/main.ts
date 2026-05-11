import animationDemo from "./animation-demo/anim-demo";
import drumsGame from "./drums/drums";
import { Engine } from "./ecs/core/Engine/Engine";
import poissonDiscSamplingDemo from "./poisson-disk-sampling/poisson-disc-sampling";
import pong from "./pong/pong-game";
import projectTemplate from "./project-template/project-template";
import sdf from "./sdf/sdf";
import shifter from "./shifter/shifter";
import snakeGame from "./snake/snake-game";
import "./style.css";

type MiniApp = (parent?: HTMLElement) => Engine<any, any>;

type MiniAppInfo = {
  name: string;
  symbol: string;
  appId: string;
  controls?: [string, string][];
  app: MiniApp;
};

// Possible categories to display as
// Original games & prototypes, experiments, studies (recreations of games), colleciton of apps related to a subject (i.e. collision detection)

const miniApps: MiniAppInfo[] = [];

miniApps.push({
  name: "snake",
  symbol: "🐍",
  appId: "snake-sketch",
  controls: [["move", "wasd or arrow keys"]],
  app: snakeGame,
});

miniApps.push({
  name: "pong",
  symbol: "🎾",
  appId: "pong-sketch",
  controls: [["move paddle", "mouse"]],
  app: pong,
});

miniApps.push({
  name: "poisson-disc-sampling",
  symbol: "⋆.˚",
  appId: "poisson-disc-sampling-sketch",
  app: poissonDiscSamplingDemo,
});

miniApps.push({
  name: "drums",
  symbol: "🥁",
  appId: "drums-sketch",
  controls: [["hit drum", "any key"]],
  app: drumsGame,
});

miniApps.push({
  name: "shifter",
  symbol: "🕹️",
  appId: "shifter-sketch",
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
  name: "sdf",
  symbol: "💧",
  appId: "sdf-sketch",
  app: sdf,
});

miniApps.push({
  name: "project-template",
  symbol: "📦",
  appId: "project-template-sketch",
  controls: [["nothing", "nothing to see or do here"]],
  app: projectTemplate,
});

function createMiniAppButton(name: string, symbol: string) {
  return `<button id="${name}-button">${symbol}</button>`;
}

function createMiniAppSection({ name, controls }: MiniAppInfo) {
  return `
      <div id="${name}-app" style="display:none;">
          <button id="exit-${name}-button" style="margin-bottom: 4px;">❌</button>
          <div style="position: relative;" id="${name}-sketch"></div>
          ${controls ? createControlInfo(controls) : ""}
      </div>
    `;
}

// Simple control helper info listed horzontally as key values in monospace font with key same size but wrapped in a box with radius, no border
function createControlInfo(controls: [string, string][]) {
  return `
    <div style="display: flex; gap: 16px;">
      ${controls
        .map(
          ([action, control]) => `
        <div style="display: flex; gap: 8px; align-items: center; font-family: monospace;">
          <div style="background-color: #313131; border-radius: 4px; padding: 4px 8px;">${action}</div>
          <div>${control}</div>
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

document.querySelector<HTMLDivElement>(
  "#mini-app-selector-container",
)!.innerHTML = miniApps
  .map((appInfo) => createMiniAppButton(appInfo.name, appInfo.symbol))
  .join("");

document.querySelector<HTMLDivElement>("#mini-app-container")!.innerHTML =
  miniApps.map((appInfo) => createMiniAppSection(appInfo)).join("");

const savedAppState = localStorage.getItem("activeApp");

miniApps.forEach((appInfo) => {
  const appElement = document.getElementById(`${appInfo.name}-app`)!;
  const mainContent = document.getElementById("menu")!;

  const canvasParent = document.getElementById(`${appInfo.name}-sketch`)!;

  let app: Engine<any, any> | null = null;

  document
    .getElementById(`${appInfo.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "block";
      mainContent.style.display = "none";
      // Start app and save the current active app to localStorage
      app = appInfo.app(canvasParent);
      app.run();
      localStorage.setItem("activeApp", appInfo.name);
    });

  document
    .getElementById(`exit-${appInfo.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "none";
      mainContent.style.display = "block";

      // Stop app and clear the saved app state
      if (app) {
        app.stop();
        app = null;
      }
      localStorage.removeItem("activeApp");
    });

  // Restore app displayed based on saved state
  if (savedAppState && savedAppState === appInfo.name) {
    mainContent.style.display = "none";
    appElement.style.display = "block";
    if (appInfo) {
      app = appInfo.app(canvasParent);
      app.run();
    }
  }
});
