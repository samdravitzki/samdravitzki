import drumsGame from "./drums/drums";
import poissonDiscSamplingDemo from "./poisson-disk-sampling/poisson-disc-sampling";
import pongGame from "./pong/pong-game";
import snakeGame from "./snake/snake-game";
import "./style.css";

type MiniApp = {
  run: (parent?: HTMLElement) => void;
  stop: () => void;
};

type MiniAppInfo = {
  name: string;
  symbol: string;
  appId: string;
  app: MiniApp;
};

const pong: MiniAppInfo = {
  name: "pong",
  symbol: "🎾",
  appId: "pong-sketch",
  app: pongGame,
};

const snake: MiniAppInfo = {
  name: "snake",
  symbol: "🐍",
  appId: "snake-sketch",
  app: snakeGame,
};

const poissonDiscSampling: MiniAppInfo = {
  name: "poisson-disc-sampling",
  symbol: "⋆.˚",
  appId: "poisson-disc-sampling-sketch",
  app: poissonDiscSamplingDemo,
};

const drums: MiniAppInfo = {
  name: "drums",
  symbol: "🥁",
  appId: "drum-sketch",
  app: drumsGame,
};

const miniApps: MiniAppInfo[] = [snake, pong, poissonDiscSampling, drums];

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
  "#mini-app-selector-container"
)!.innerHTML = miniApps
  .map((appInfo) => createMiniAppButton(appInfo.name, appInfo.symbol))
  .join("");

document.querySelector<HTMLDivElement>("#mini-app-container")!.innerHTML =
  miniApps.map((appInfo) => createMiniAppSection(appInfo.name)).join("");

// Load persisted state from localStorage
const savedAppState = localStorage.getItem("activeApp");

// Restore app displayed based on saved state
if (savedAppState) {
  const mainContent = document.getElementById("menu")!;
  mainContent.style.display = "none";

  const activeApp = document.getElementById(`${savedAppState}-app`)!;
  activeApp.style.display = "block";

  const appInfo = miniApps.find((info) => info.name === savedAppState);

  if (appInfo) {
    const canvasParent = document.getElementById(`${appInfo.name}-sketch`)!;
    appInfo.app.run(canvasParent);
  }
}

miniApps.forEach((appInfo) => {
  const appElement = document.getElementById(`${appInfo.name}-app`)!;
  const mainContent = document.getElementById("menu")!;

  const canvasParent = document.getElementById(`${appInfo.name}-sketch`)!;

  document
    .getElementById(`${appInfo.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "block";
      mainContent.style.display = "none";
      appInfo.app.run(canvasParent);

      // Save the current active app to localStorage
      localStorage.setItem("activeApp", appInfo.name);
    });

  document
    .getElementById(`exit-${appInfo.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "none";
      mainContent.style.display = "block";

      appInfo.app.stop();

      // Clear the saved app state
      localStorage.removeItem("activeApp");
    });
});
