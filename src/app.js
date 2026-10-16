import {
  DEFAULT_CONFIG,
  advanceState,
  restartGame,
  setDirection,
  togglePause
} from "./game.js";

const board = document.querySelector("#game-board");
const score = document.querySelector("#score");
const status = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = restartGame(DEFAULT_CONFIG);
const cells = [];

function buildBoard() {
  board.style.setProperty("--grid-size", String(state.config.columns));

  for (let index = 0; index < state.config.columns * state.config.rows; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.setAttribute("role", "gridcell");
    board.append(cell);
    cells.push(cell);
  }
}

function getCellIndex(position) {
  return position.y * state.config.columns + position.x;
}

function getStatusMessage() {
  if (state.status === "paused") {
    return "Paused. Press Space or the button to continue.";
  }

  if (state.status === "game-over") {
    return state.won
      ? "Board cleared. Press Restart to play again."
      : "Game over. Press Restart or Enter to try again.";
  }

  return "Use arrow keys or WASD. Space pauses.";
}

function render() {
  for (const cell of cells) {
    cell.className = "cell";
  }

  if (state.food) {
    cells[getCellIndex(state.food)].classList.add("cell--food");
  }

  state.snake.forEach((segment, index) => {
    cells[getCellIndex(segment)].classList.add(index === 0 ? "cell--head" : "cell--snake");
  });

  score.textContent = String(state.score);
  status.textContent = getStatusMessage();
  pauseButton.textContent = state.status === "paused" ? "Resume" : "Pause";
}

function queueDirection(directionName) {
  state = setDirection(state, directionName);
  render();
}

function restart() {
  state = restartGame(DEFAULT_CONFIG);
  render();
}

function togglePausedState() {
  state = togglePause(state);
  render();
}

function handleKeydown(event) {
  const key = event.key.toLowerCase();
  const directionByKey = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right"
  };

  if (key in directionByKey) {
    event.preventDefault();
    queueDirection(directionByKey[key]);
    return;
  }

  if (key === " " || key === "p") {
    event.preventDefault();
    togglePausedState();
    return;
  }

  if ((key === "enter" || key === "r") && state.status === "game-over") {
    event.preventDefault();
    restart();
  }
}

buildBoard();
render();

window.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", restart);
pauseButton.addEventListener("click", togglePausedState);

for (const button of controlButtons) {
  button.addEventListener("click", () => {
    queueDirection(button.dataset.direction);
  });
}

window.setInterval(() => {
  state = advanceState(state);
  render();
}, state.config.tickMs);
