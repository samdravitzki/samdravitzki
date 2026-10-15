import { Bounds, Part, ResourcePool, State, World } from "@dravitzki/dufus-engine";
import p5 from "p5";
import { ApplicationState, Score } from "../../common/types";

const mainMenuId = "modular-pong-main-menu";
const gameMenuId = "modular-pong-game-menu";
const endMenuId = "modular-pong-end-menu";

type AppState = State<ApplicationState>;

export const menuPart = (): Part<
  { setup: void; update: void },
  {
    "app-state": ApplicationState;
    "render-trajectory": boolean;
    score: Score;
  }
> => {
  return ({ triggerBuilder, registerSystem }) => {
    registerSystem(
      "modular-pong:create-menus",
      triggerBuilder.on("setup"),
      createMenus,
    );
    registerSystem(
      "modular-pong:show-main-menu",
      triggerBuilder.on("update").when("app-state").enters("main-menu"),
      showMainMenu,
    );
    registerSystem(
      "modular-pong:hide-main-menu",
      triggerBuilder.on("update").when("app-state").exits("main-menu"),
      hideMainMenu,
    );
    registerSystem(
      "modular-pong:show-game-menu",
      triggerBuilder.on("update").when("app-state").enters("in-game"),
      showGameMenu,
    );
    registerSystem(
      "modular-pong:hide-game-menu",
      triggerBuilder.on("update").when("app-state").enters("end"),
      hideGameMenu,
    );
    registerSystem(
      "modular-pong:show-end-menu",
      triggerBuilder.on("update").when("app-state").enters("end"),
      showEndMenu,
    );
    registerSystem(
      "modular-pong:hide-end-menu",
      triggerBuilder.on("update").when("app-state").exits("end"),
      hideEndMenu,
    );
  };
};

export function createMenus(
  _world: World,
  resources: ResourcePool,
  state: {
    "app-state": AppState;
    "render-trajectory": State<boolean>;
    score: State<Score>;
  },
) {
  const canvasBounds = resources.get<Bounds>("canvas-bounds");
  const p = resources.get<p5>("p5");

  const mainMenu = p.createDiv();
  mainMenu.position(0, 0, "absolute");
  mainMenu.size(...canvasBounds.size);
  mainMenu.style("display", "flex");
  mainMenu.style("place-content", "center");
  mainMenu.style("align-items", "center");
  mainMenu.id(mainMenuId);
  const startButton = p.createButton("Start a game!");
  startButton.parent(mainMenu);
  startButton.mousePressed(() => state["app-state"].setValue("in-game"));
  mainMenu.hide();

  const gameMenu = p.createDiv();
  gameMenu.position(canvasBounds.bottom.left.x, canvasBounds.bottom.left.y + 4);
  gameMenu.style("width", "100%");
  gameMenu.id(gameMenuId);
  const gameMenuContainer = p.createDiv();
  gameMenuContainer.style("display", "flex");
  gameMenuContainer.style("flex-direction", "row-reverse");
  gameMenuContainer.style("gap", "4px");
  gameMenuContainer.parent(gameMenu);
  const pauseButton = p.createButton("pause");
  pauseButton.parent(gameMenuContainer);
  pauseButton.mousePressed(() => {
    if (state["app-state"].value === "in-game") {
      state["app-state"].setValue("paused");
      return;
    }

    if (state["app-state"].value === "paused") {
      state["app-state"].setValue("in-game");
    }
  });
  const trajectoryButton = p.createButton("trajectory");
  trajectoryButton.parent(gameMenuContainer);
  trajectoryButton.mousePressed(() => {
    state["render-trajectory"].setValue(!state["render-trajectory"].value);
  });
  gameMenu.hide();

  const endMenu = p.createDiv();
  endMenu.position(0, 0, "absolute");
  endMenu.size(...canvasBounds.size);
  endMenu.style("display", "flex");
  endMenu.style("flex-direction", "column");
  endMenu.style("place-content", "center");
  endMenu.style("align-items", "center");
  endMenu.style("color", "white");
  endMenu.id(endMenuId);
  const message = p.createDiv();
  message.class("message");
  message.parent(endMenu);
  const resetButton = p.createButton("Okay, thanks for the game I guess...");
  resetButton.parent(endMenu);
  resetButton.mousePressed(() => {
    state["app-state"].setValue("main-menu");
    state.score.setValue([0, 0]);
  });
  endMenu.hide();
}

function menu(resources: ResourcePool, id: string) {
  return resources.get<p5>("p5").select(`#${id}`);
}

export function showMainMenu(_world: World, resources: ResourcePool) {
  menu(resources, mainMenuId)?.show();
}

export function hideMainMenu(_world: World, resources: ResourcePool) {
  menu(resources, mainMenuId)?.hide();
}

export function showGameMenu(_world: World, resources: ResourcePool) {
  menu(resources, gameMenuId)?.show();
}

export function hideGameMenu(_world: World, resources: ResourcePool) {
  menu(resources, gameMenuId)?.hide();
}

export function showEndMenu(
  _world: World,
  resources: ResourcePool,
  state: { score: State<Score> },
) {
  const [playerScore, aiScore] = state.score.value;
  const message = resources
    .get<p5>("p5")
    .select(`#${endMenuId} > .message`);

  message?.html(
    `<p>${
      playerScore > aiScore ? "You won, Nice! 🔥" : "You lost, to an ai 😔"
    }</p>`,
  );
  menu(resources, endMenuId)?.show();
}

export function hideEndMenu(_world: World, resources: ResourcePool) {
  menu(resources, endMenuId)?.hide();
}
