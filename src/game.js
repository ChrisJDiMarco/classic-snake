export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

export const DEFAULT_CONFIG = {
  columns: 20,
  rows: 20,
  tickMs: 140
};

function toKey(position) {
  return `${position.x},${position.y}`;
}

export function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

export function isOppositeDirection(currentDirection, nextDirection) {
  return (
    currentDirection.x + nextDirection.x === 0 &&
    currentDirection.y + nextDirection.y === 0
  );
}

export function getNextHeadPosition(head, direction) {
  return {
    x: head.x + direction.x,
    y: head.y + direction.y
  };
}

export function spawnFood(snake, config, rng = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const available = [];

  for (let y = 0; y < config.rows; y += 1) {
    for (let x = 0; x < config.columns; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * available.length);
  return available[index];
}

export function createInitialState(config = DEFAULT_CONFIG, rng = Math.random) {
  const centerX = Math.floor(config.columns / 2);
  const centerY = Math.floor(config.rows / 2);
  const snake = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY }
  ];

  return {
    config,
    snake,
    direction: DIRECTIONS.right,
    nextDirection: null,
    food: spawnFood(snake, config, rng),
    score: 0,
    status: "running",
    won: false
  };
}

export function restartGame(config = DEFAULT_CONFIG, rng = Math.random) {
  return createInitialState(config, rng);
}

export function setDirection(state, directionName) {
  const requestedDirection = DIRECTIONS[directionName];
  if (!requestedDirection || state.status === "game-over") {
    return state;
  }

  const currentDirection = state.nextDirection ?? state.direction;
  if (isOppositeDirection(currentDirection, requestedDirection)) {
    return state;
  }

  if (
    currentDirection.x === requestedDirection.x &&
    currentDirection.y === requestedDirection.y
  ) {
    return state;
  }

  return {
    ...state,
    nextDirection: requestedDirection
  };
}

export function togglePause(state) {
  if (state.status === "running") {
    return { ...state, status: "paused" };
  }

  if (state.status === "paused") {
    return { ...state, status: "running" };
  }

  return state;
}

export function advanceState(state, rng = Math.random) {
  if (state.status !== "running") {
    return state;
  }

  const direction = state.nextDirection ?? state.direction;
  const nextHead = getNextHeadPosition(state.snake[0], direction);
  const hitWall =
    nextHead.x < 0 ||
    nextHead.y < 0 ||
    nextHead.x >= state.config.columns ||
    nextHead.y >= state.config.rows;

  if (hitWall) {
    return {
      ...state,
      direction,
      nextDirection: null,
      status: "game-over"
    };
  }

  const willEat = positionsEqual(nextHead, state.food);
  const collisionBody = willEat ? state.snake : state.snake.slice(0, -1);
  const hitSelf = collisionBody.some((segment) => positionsEqual(segment, nextHead));

  if (hitSelf) {
    return {
      ...state,
      direction,
      nextDirection: null,
      status: "game-over"
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willEat) {
    nextSnake.pop();
  }

  const nextFood = willEat ? spawnFood(nextSnake, state.config, rng) : state.food;
  const won = willEat && nextFood === null;

  return {
    ...state,
    snake: nextSnake,
    direction,
    nextDirection: null,
    food: nextFood,
    score: state.score + (willEat ? 1 : 0),
    status: won ? "game-over" : "running",
    won
  };
}
