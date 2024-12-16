import "./style.css";

type App = {
  name: string;
  symbol: string;
  appId: string;
};

const pong: App = {
  name: "pong",
  symbol: "🎾",
  appId: "pong-sketch",
};

const snake: App = {
  name: "snake",
  symbol: "🐍",
  appId: "snake-sketch",
};

const poissonDiscSampling: App = {
  name: "poisson-disc-sampling",
  symbol: "⋆.˚",
  appId: "poisson-disc-sampling-sketch",
};

const apps: App[] = [snake, pong, poissonDiscSampling];

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="main-content">
      <h1>dravitzki.com</h1>
      ${apps
        .map(
          (app) => `
        <button id="${app.name}-button">${app.symbol}</button>
      `
        )
        .join("")}
    </div>
    ${apps
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

// TODO: Need a more modular way to import games as this is really easy miss (should be as simple as importing something and adding it to a list)
import("./snake/snake-game");
import("./pong/pong-game");
import("./poisson-disk-sampling/poisson-disc-sampling");

// Load persisted state from localStorage
const savedAppState = localStorage.getItem("activeApp");

// Restore app displayed based on saved state
if (savedAppState) {
  const mainContent = document.getElementById("main-content")!;
  mainContent.style.display = "none";

  const activeApp = document.getElementById(`${savedAppState}-app`)!;
  activeApp.style.display = "block";
}

apps.forEach((app) => {
  const appElement = document.getElementById(`${app.name}-app`)!;
  const mainContent = document.getElementById("main-content")!;

  document
    .getElementById(`${app.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "block";
      mainContent.style.display = "none";

      // Save the current active app to localStorage
      localStorage.setItem("activeApp", app.name);
    });

  document
    .getElementById(`exit-${app.name}-button`)
    ?.addEventListener("click", () => {
      appElement.style.display = "none";
      mainContent.style.display = "block";

      // Clear the saved app state
      localStorage.removeItem("activeApp");
    });
});
