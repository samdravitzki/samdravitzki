import "./style.css";
import app from "./spa/app";

function navigate(url: string) {
  history.pushState({}, "", url);
  render(url);
}

// Handle browser back/forward buttons
window.addEventListener("popstate", () => {
  render(window.location.pathname);
});

const appContainer = document.getElementById("app")!;

const render = app(appContainer, navigate);

// Initial render
render(window.location.pathname);
