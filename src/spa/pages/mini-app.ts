import { MiniAppInfo } from "../mini-apps";
import Page from "./Page";

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

function createMiniAppPage(miniApp: MiniAppInfo): Page {
  return (container, { navigate }) => {
    container.innerHTML = `<div id="${miniApp.name}-app">
      <button id="exit-${miniApp.name}-button" style="margin-bottom: 4px;">❌</button>
      <div style="position: relative;" id="${miniApp.name}-sketch"></div>
      ${miniApp.controls ? createControlInfo(miniApp.controls) : ""}
    </div>`;

    const canvasParent = document.getElementById(`${miniApp.name}-sketch`)!;

    const app = miniApp.app(canvasParent);
    app.run();

    document
      .getElementById(`exit-${miniApp.name}-button`)
      ?.addEventListener("click", () => {
        navigate("/");
      });

    return () => {
      app.stop();
    };
  };
}

export default createMiniAppPage;
