import poissonDiscSamplingDemo from "./poisson-disk-sampling/poisson-disc-sampling";
import pongGame from "./pong/pong-game";
import snakeGame from "./snake/snake-game";
import "./style.css";

type AppInfo = {
  name: string;
  symbol: string;
  appId: string;
  app: any;
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

const appInfos: AppInfo[] = [snake, pong, poissonDiscSampling];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="main-content">
      <h1>dravitzki.com</h1>
      ${appInfos
        .map(
          (app) => `
        <button id="${app.name}-button">${app.symbol}</button>
      `
        )
        .join("")}
    </div>
    ${appInfos
      .map(
        (app) => `
      <div id="${app.name}-app" style="display:none;">
        <button id="exit-${app.name}-button">❌</button>
        <div style="position: relative;" id="${app.appId}"></div>
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
    const canvasParent = document.getElementById(`${appInfo.name}-sketch`);
    appInfo.app.run(canvasParent);
  }
}

appInfos.forEach((appInfo) => {
  const appElement = document.getElementById(`${appInfo.name}-app`)!;
  const mainContent = document.getElementById("main-content")!;

  const canvasParent = document.getElementById(`${appInfo.name}-sketch`);

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
