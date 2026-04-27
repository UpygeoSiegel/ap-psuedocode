import type { QuestionResult } from './types.js';

type Direction = 'North' | 'East' | 'South' | 'West';

interface RobotState {
  x: number;
  y: number;
  dir: Direction;
}

export class RobotGenerator {
  private directions: Direction[] = ['North', 'East', 'South', 'West'];

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private turnLeft(dir: Direction): Direction {
    const idx = this.directions.indexOf(dir);
    return this.directions[(idx + 3) % 4] as Direction;
  }

  private turnRight(dir: Direction): Direction {
    const idx = this.directions.indexOf(dir);
    return this.directions[(idx + 1) % 4] as Direction;
  }

  private moveForward(state: RobotState, gridSize: number): RobotState {
    let { x, y, dir } = state;
    if (dir === 'North' && y < gridSize) y++;
    else if (dir === 'East' && x < gridSize) x++;
    else if (dir === 'South' && y > 1) y--;
    else if (dir === 'West' && x > 1) x--;
    return { x, y, dir };
  }

  public generateRobotTrace(): QuestionResult {
    const gridSize = 5;
    let state: RobotState = {
      x: this.getRandomInt(1, gridSize),
      y: this.getRandomInt(1, gridSize),
      dir: this.directions[this.getRandomInt(0, 3)] as Direction
    };

    const startState = { ...state };
    const commands: string[] = [];
    const trace: string[] = [
      `1. Start at (${state.x}, ${state.y}) facing ${state.dir}.`
    ];

    const numMoves = this.getRandomInt(5, 8);
    
    for (let i = 0; i < numMoves; i++) {
      const rand = Math.random();
      if (rand < 0.6) {
        // Try to move forward, but if blocked, maybe turn instead
        const nextState = this.moveForward(state, gridSize);
        if (nextState.x === state.x && nextState.y === state.y) {
          // Blocked by wall, turn instead
          if (Math.random() < 0.5) {
            state.dir = this.turnLeft(state.dir);
            commands.push('ROTATE_LEFT()');
            trace.push(`${trace.length + 1}. ROTATE_LEFT(): Now facing ${state.dir} at (${state.x}, ${state.y}).`);
          } else {
            state.dir = this.turnRight(state.dir);
            commands.push('ROTATE_RIGHT()');
            trace.push(`${trace.length + 1}. ROTATE_RIGHT(): Now facing ${state.dir} at (${state.x}, ${state.y}).`);
          }
        } else {
          state = nextState;
          commands.push('MOVE_FORWARD()');
          trace.push(`${trace.length + 1}. MOVE_FORWARD(): Now at (${state.x}, ${state.y}) facing ${state.dir}.`);
        }
      } else if (rand < 0.8) {
        state.dir = this.turnLeft(state.dir);
        commands.push('ROTATE_LEFT()');
        trace.push(`${trace.length + 1}. ROTATE_LEFT(): Now facing ${state.dir} at (${state.x}, ${state.y}).`);
      } else {
        state.dir = this.turnRight(state.dir);
        commands.push('ROTATE_RIGHT()');
        trace.push(`${trace.length + 1}. ROTATE_RIGHT(): Now facing ${state.dir} at (${state.x}, ${state.y}).`);
      }
    }

    const code = [
      `// Grid is ${gridSize}x${gridSize}. Bottom-left is (1,1).`,
      `// Robot starts at (${startState.x}, ${startState.y}) facing ${startState.dir}.`,
      ...commands
    ].join('\n');

    const answer = `(${state.x}, ${state.y})`;

    return {
      code,
      answer,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return this.generateRobotTrace();
  }
}
