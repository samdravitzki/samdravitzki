import "./style.css";
import app from "./spa/app";
import { PageCleanup } from "./spa/pages/Page";

let currentPageCleanup: PageCleanup | null = null;

function navigate(url: string) {
  // Clean up current page if needed
  if (currentPageCleanup) {
    currentPageCleanup();
    currentPageCleanup = null;
  }

  history.pushState({}, "", url);
  const cleanup = render(url);

  if (cleanup) {
    currentPageCleanup = cleanup;
  }
}

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  // Clean up current page if needed
  if (currentPageCleanup) {
    currentPageCleanup();
    currentPageCleanup = null;
  }

  const cleanup = render(window.location.pathname);
  if (cleanup) {
    currentPageCleanup = cleanup;
  }
});

const appContainer = document.getElementById("app")!;

const render = app(appContainer, navigate);

// Initial render
const initialPageCleanup = render(window.location.pathname);

if (initialPageCleanup) {
  currentPageCleanup = initialPageCleanup;
}
