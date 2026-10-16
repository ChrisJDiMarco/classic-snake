import test from "node:test";
import assert from "node:assert/strict";

import {
  DIRECTIONS,
  advanceState,
  createInitialState,
  setDirection,
  spawnFood
} from "../src/game.js";

test("createInitialState builds a centered snake with food off the body", () => {
  const state = createInitialState({ columns: 10, rows: 10, tickMs: 100 }, () => 0);

  assert.deepEqual(state.snake, [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]);
  assert.equal(state.direction, DIRECTIONS.right);
  assert.equal(state.status, "running");
  assert.deepEqual(state.food, { x: 0, y: 0 });
});

test("setDirection ignores a direct reversal", () => {
  const state = createInitialState({ columns: 8, rows: 8, tickMs: 100 }, () => 0.5);
  const next = setDirection(state, "left");

  assert.equal(next.nextDirection, null);
});

test("advanceState moves the snake forward without changing score", () => {
  const initial = createInitialState({ columns: 10, rows: 10, tickMs: 100 }, () => 0.9);
  const next = advanceState(initial, () => 0.2);

  assert.deepEqual(next.snake, [
    { x: 6, y: 5 },
    { x: 5, y: 5 },
    { x: 4, y: 5 }
  ]);
  assert.equal(next.score, 0);
  assert.equal(next.status, "running");
});

test("advanceState grows the snake, increments score, and respawns food", () => {
  const initial = {
    config: { columns: 6, rows: 6, tickMs: 100 },
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 }
    ],
    direction: DIRECTIONS.right,
    nextDirection: null,
    food: { x: 3, y: 2 },
    score: 0,
    status: "running",
    won: false
  };

  const next = advanceState(initial, () => 0);

  assert.deepEqual(next.snake, [
    { x: 3, y: 2 },
    { x: 2, y: 2 },
    { x: 1, y: 2 },
    { x: 0, y: 2 }
  ]);
  assert.equal(next.score, 1);
  assert.deepEqual(next.food, { x: 0, y: 0 });
});

test("advanceState ends the game on wall collision", () => {
  const initial = {
    config: { columns: 4, rows: 4, tickMs: 100 },
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 }
    ],
    direction: DIRECTIONS.right,
    nextDirection: null,
    food: { x: 0, y: 0 },
    score: 0,
    status: "running",
    won: false
  };

  const next = advanceState(initial, () => 0.5);

  assert.equal(next.status, "game-over");
});

test("advanceState ends the game on self collision", () => {
  const initial = {
    config: { columns: 6, rows: 6, tickMs: 100 },
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 }
    ],
    direction: DIRECTIONS.up,
    nextDirection: null,
    food: { x: 5, y: 5 },
    score: 0,
    status: "running",
    won: false
  };

  const next = advanceState(initial, () => 0.5);

  assert.equal(next.status, "game-over");
});

test("spawnFood returns null when the board is full", () => {
  const food = spawnFood(
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ],
    { columns: 2, rows: 2, tickMs: 100 },
    () => 0.5
  );

  assert.equal(food, null);
});
