"""
Lógica del juego de la serpiente.
"""
import random
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Tuple, Optional


class Direction(str, Enum):
    UP = "up"
    DOWN = "down"
    LEFT = "left"
    RIGHT = "right"


@dataclass
class GameState:
    """Estado del juego."""
    grid_width: int = 20
    grid_height: int = 16
    snake: List[Tuple[int, int]] = field(default_factory=list)
    food: Tuple[int, int] = (0, 0)
    direction: Direction = Direction.RIGHT
    next_direction: Direction = Direction.RIGHT
    score: int = 0
    game_over: bool = False
    speed_ms: int = 150

    def to_dict(self) -> dict:
        return {
            "gridWidth": self.grid_width,
            "gridHeight": self.grid_height,
            "snake": self.snake,
            "food": list(self.food),
            "direction": self.direction.value,
            "score": self.score,
            "gameOver": self.game_over,
            "speedMs": self.speed_ms,
        }


class SnakeGame:
    def __init__(self, grid_width: int = 20, grid_height: int = 16):
        self.grid_width = grid_width
        self.grid_height = grid_height
        self.state = GameState(grid_width=grid_width, grid_height=grid_height)
        self._spawn_snake()
        self._spawn_food()

    def _spawn_snake(self) -> None:
        cx = self.grid_width // 2
        cy = self.grid_height // 2
        self.state.snake = [(cx - 2, cy), (cx - 1, cy), (cx, cy)]
        self.state.direction = Direction.RIGHT
        self.state.next_direction = Direction.RIGHT
        self.state.score = 0
        self.state.game_over = False
        self.state.speed_ms = 150

    def _spawn_food(self) -> None:
        while True:
            x = random.randint(0, self.grid_width - 1)
            y = random.randint(0, self.grid_height - 1)
            if (x, y) not in self.state.snake:
                self.state.food = (x, y)
                break

    def set_direction(self, direction: str) -> None:
        if self.state.game_over:
            return
        try:
            new = Direction(direction)
        except ValueError:
            return
        opposite = {
            Direction.UP: Direction.DOWN,
            Direction.DOWN: Direction.UP,
            Direction.LEFT: Direction.RIGHT,
            Direction.RIGHT: Direction.LEFT,
        }
        if opposite.get(self.state.direction) != new:
            self.state.next_direction = new

    def tick(self) -> Optional[GameState]:
        if self.state.game_over:
            return self.state

        self.state.direction = self.state.next_direction
        head = self.state.snake[0]
        dx, dy = {
            Direction.UP: (0, -1),
            Direction.DOWN: (0, 1),
            Direction.LEFT: (-1, 0),
            Direction.RIGHT: (1, 0),
        }[self.state.direction]

        new_head = (
            (head[0] + dx) % self.grid_width,
            (head[1] + dy) % self.grid_height,
        )

        if new_head in self.state.snake:
            self.state.game_over = True
            return self.state

        self.state.snake.insert(0, new_head)

        if new_head == self.state.food:
            self.state.score += 10
            self.state.speed_ms = max(60, self.state.speed_ms - 5)
            self._spawn_food()
        else:
            self.state.snake.pop()

        return self.state

    def reset(self) -> GameState:
        self._spawn_snake()
        self._spawn_food()
        return self.state
