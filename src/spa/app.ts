import miniApps from "./mini-apps";
import homePage from "./pages/home";
import home from "./pages/home";
import createMiniAppPage from "./pages/mini-app";

export default function app(
  container: HTMLElement,
  navigate: (pathname: string) => void,
) {
  const miniAppPaths = miniApps.map((miniApp) => `/${miniApp.appId}`);

  const pageActions = {
    navigate,
  };

  const render = (pathname: string) => {
    if (pathname === "/") {
      homePage(container, pageActions);
      return;
    }

    if (miniAppPaths.includes(pathname)) {
      const miniAppId = pathname.split("/")[1];
      const miniApp = miniApps.find((miniApp) => miniApp.appId == miniAppId);

      if (miniApp) {
        const miniAppPage = createMiniAppPage(miniApp);
        miniAppPage(container, pageActions);
        return;
      }
    }

    container.innerHTML = "<div> 404 Not Found </div>";
  };

  return render;
}
