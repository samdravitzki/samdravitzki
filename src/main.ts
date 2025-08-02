import drumsGame from "./drums/drums";
import poissonDiscSamplingDemo from "./poisson-disk-sampling/poisson-disc-sampling";
import pongGame from "./pong/pong-game";
import snakeGame from "./snake/snake-game";
import "./style.css";

type App = {
  run: (parent?: HTMLElement) => void;
  stop: () => void;
};

type AppInfo = {
  name: string;
  symbol: string;
  appId: string;
  app: App;
};

const pong: AppInfo = {
  name: "pong",
  symbol: "🎾",
  appId: "pong-sketch",
  app: pongGame,
};

const snake: AppInfo = {
  name: "snake",
  symbol: "🐍",
  appId: "snake-sketch",
  app: snakeGame,
};

const poissonDiscSampling: AppInfo = {
  name: "poisson-disc-sampling",
  symbol: "⋆.˚",
  appId: "poisson-disc-sampling-sketch",
  app: poissonDiscSamplingDemo,
};

const drums: AppInfo = {
  name: "drums",
  symbol: "🥁",
  appId: "drum-sketch",
  app: drumsGame,
};

const appInfos: AppInfo[] = [snake, pong, poissonDiscSampling, drums];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="main-content">
      <h1>dravitzki.com</h1>
      <p><i>projects</i></p>
      ${appInfos
        .map(
          (appInfo) => `
        <button id="${appInfo.name}-button">${appInfo.symbol}</button>
      `
        )
        .join("")}
    </div>
    ${appInfos
      .map(
        (appInfo) => `
      <div id="${appInfo.name}-app" style="display:none;">
        <button id="exit-${appInfo.name}-button">❌</button>
        <div style="position: relative;" id="${appInfo.name}-sketch"></div>
      </div>
    `
      )
      .join("")}
  </div>
`;

// Load persisted state from localStorage
const savedAppState = localStorage.getItem("activeApp");

// Restore app displayed based on saved state
if (savedAppState) {
  const mainContent = document.getElementById("main-content")!;
  mainContent.style.display = "none";

  const activeApp = document.getElementById(`${savedAppState}-app`)!;
  activeApp.style.display = "block";

  const appInfo = appInfos.find((info) => info.name === savedAppState);

  if (appInfo) {
    const canvasParent = document.getElementById(`${appInfo.name}-sketch`)!;
    appInfo.app.run(canvasParent);
  }
}

appInfos.forEach((appInfo) => {
  const appElement = document.getElementById(`${appInfo.name}-app`)!;
  const mainContent = document.getElementById("main-content")!;

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
