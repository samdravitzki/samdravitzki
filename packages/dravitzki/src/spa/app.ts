import miniApps from "./mini-apps";
import notFoundPage from "./pages/404";
import homePage from "./pages/home";
import createMiniAppPage from "./pages/mini-app";
import { PageCleanup } from "./pages/Page";

export default function app(
  container: HTMLElement,
  navigate: (pathname: string) => void,
) {
  const miniAppPaths = miniApps.map((miniApp) => `/${miniApp.appId}`);

  const pageActions = {
    navigate,
  };

  const render = (pathname: string): PageCleanup | void => {
    if (pathname === "/") {
      return homePage(container, pageActions);
    }

    if (miniAppPaths.includes(pathname)) {
      const miniAppId = pathname.split("/")[1];
      const miniApp = miniApps.find((miniApp) => miniApp.appId == miniAppId);

      if (miniApp) {
        const miniAppPage = createMiniAppPage(miniApp);
        return miniAppPage(container, pageActions);
      }
    }

    return notFoundPage(container);
  };

  return render;
}
