import engine from "./pong-engine";

engine.system(
  "createGameMenu",
  {
    event: "start",
  },
  (_world, { p }, state) => {
    // Need to figure out how to remove having to request state from a map like this
    const appState = state["app-state"];
    const renderTrajectory = state["render-trajectory"];

    const gameMenu = p.createDiv();
    gameMenu.position(0, 250, "absolute");
    gameMenu.id("game-menu");

    const pauseButton = p.createButton("pause");
    pauseButton.parent(gameMenu);

    pauseButton.mousePressed(() => {
      if (appState.value === "in-game") {
        appState.setValue("paused");
        return;
      }

      if (appState.value === "paused") {
        appState.setValue("in-game");
        return;
      }
    });

    const trajectoryButton = p.createButton("trajectory");
    trajectoryButton.parent(gameMenu);

    trajectoryButton.mousePressed(() => {
      renderTrajectory.setValue(!renderTrajectory.value);
    });

    gameMenu.hide();
  }
);

engine.system("createEndMenu", { event: "start" }, (world, { p }, state) => {
  const appState = state["app-state"];

  const endMenu = p.createDiv();
  endMenu.position(0, 0, "absolute");
  endMenu.size(500, 250);
  endMenu.style("display", "flex");
  endMenu.style("flex-direction", "column");
  endMenu.style("place-content", "center");
  endMenu.style("align-items", "center");
  endMenu.style("color", "white");
  endMenu.id("end-menu");

  const messageDiv = p.createDiv();
  messageDiv.class("message");
  messageDiv.parent(endMenu);

  const resetButton = p.createButton("Okay, thanks for the game I guess...");
  resetButton.parent(endMenu);

  resetButton.mousePressed(() => {
    appState.setValue("main-menu");
    state.score.setValue([0, 0]);
  });

  // Hide menu by default and show when needed so it can be treated like a resueable component
  endMenu.hide();
});

engine.system("createMainMenu", { event: "start" }, (_world, { p }, state) => {
  const appState = state["app-state"];

  const mainMenu = p.createDiv();
  mainMenu.position(0, 0, "absolute");
  mainMenu.size(500, 250);
  mainMenu.style("display", "flex");
  mainMenu.style("place-content", "center");
  mainMenu.style("align-items", "center");
  mainMenu.id("main-menu");

  const startGameButton = p.createButton("Start a game!");
  startGameButton.parent(mainMenu);
  startGameButton.mousePressed(() => {
    appState.setValue("in-game");
  });

  // Hide menu by default and show when needed so it can be treated like a resueable component
  mainMenu.hide();
});

engine.system(
  "showMainMenu",
  {
    event: "update",
    condition: {
      state: "app-state",
      value: "main-menu",
      only: "on-enter",
    },
  },
  (_world, { p }) => {
    const mainMenu = p.select("#main-menu");
    mainMenu?.show();
  }
);
