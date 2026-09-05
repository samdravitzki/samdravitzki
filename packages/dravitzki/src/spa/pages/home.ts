import miniApps from "../mini-apps";
import Page from "./Page";

function createMiniAppButton(name: string, symbol: string) {
  return `<button id="${name}-button">${symbol}</button>`;
}

const homePage: Page = (container: HTMLElement, { navigate }) => {
  container.innerHTML = `
    <div>
      <h1>dravitzki.com</h1>
      <p role="doc-subtitle">
        <i>Built by <b>Sam Dravitzki</b> <span class="emoji"></span></i>
      </p>
      <h4>Apps and Games</h4>
      <div
        style="display: flex; gap: 4px; justify-content: center;"
      >
        ${miniApps
          .filter((appInfo) => appInfo.type === "experience")
          .map((appInfo) => createMiniAppButton(appInfo.name, appInfo.symbol))
          .join("")}
      </div>
      <h4>The Lab</h4>
      <div
        style="display: flex; gap: 4px"
      >
        ${miniApps
          .filter(
            (appInfo) => appInfo.type === "experiment/test" || !appInfo.type,
          )
          .map((appInfo) => createMiniAppButton(appInfo.name, appInfo.symbol))
          .join("")}
      </div>
    </div>
`;

  miniApps.forEach((miniApp) => {
    document
      .getElementById(`${miniApp.name}-button`)
      ?.addEventListener("click", () => {
        navigate(`/${miniApp.appId}`);
      });
  });
};

export default homePage;
