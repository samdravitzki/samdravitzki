import drumsGame from "./drums/drums";
import { Engine } from "./ecs/core/Engine/Engine";
import poissonDiscSamplingDemo from "./poisson-disk-sampling/poisson-disc-sampling";
import pong from "./pong/pong-game";
import shifter from "./shifter/shifter";
import snakeGame from "./snake/snake-game";
import "./style.css";

type MiniApp = (parent?: HTMLElement) => Engine<any, any>;

type MiniAppInfo = {
  name: string;
  symbol: string;
  appId: string;
  app: MiniApp;
};

// Possible categories to display as
// Original games & prototypes, experiments, studies (recreations of games), colleciton of apps related to a subject (i.e. collision detection)

const miniApps: MiniAppInfo[] = [];

miniApps.push({
  name: "snake",
  symbol: "🐍",
  appId: "snake-sketch",
  app: snakeGame,
});

miniApps.push({
  name: "pong",
  symbol: "🎾",
  appId: "pong-sketch",
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
  app: drumsGame,
});

miniApps.push({
  name: "shifter",
  symbol: "🕹️",
  appId: "shifter-sketch",
  app: shifter,
});

function createMiniAppButton(name: string, symbol: string) {
  return `<button id="${name}-button">${symbol}</button>`;
}

function createMiniAppSection(name: string) {
  return `
      <div id="${name}-app" style="display:none;">
        <button id="exit-${name}-button">❌</button>
        <div style="position: relative;" id="${name}-sketch"></div>
      </div>
    `;
}

document.querySelector<HTMLDivElement>(
  "#mini-app-selector-container",
)!.innerHTML = miniApps
  .map((appInfo) => createMiniAppButton(appInfo.name, appInfo.symbol))
  .join("");

document.querySelector<HTMLDivElement>("#mini-app-container")!.innerHTML =
  miniApps.map((appInfo) => createMiniAppSection(appInfo.name)).join("");

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
