import type { QuestionResult } from './types.js';

export class RobotGenerator {
  public generateRobotTrace(): QuestionResult {
    // 3x3 Grid
    // (1,3) (2,3) (3,3)
    // (1,2) (2,2) (3,2)
    // (1,1) (2,1) (3,1)
    
    let x = 1;
    let y = 1;
    let direction = 'North'; // North, East, South, West
    
    const lines: string[] = [
      `// Grid is 3x3. Bottom-left is (1,1).`,
      `// Robot starts at (1,1) facing North.`,
      `MOVE_FORWARD()`,
      `ROTATE_RIGHT()`,
      `MOVE_FORWARD()`,
      `MOVE_FORWARD()`,
      `ROTATE_LEFT()`,
      `MOVE_FORWARD()`
    ];
    
    const trace: string[] = [
      `1. Start at (1,1) facing North.`,
      `2. MOVE_FORWARD(): Now at (1,2), facing North.`,
      `3. ROTATE_RIGHT(): Now at (1,2), facing East.`,
      `4. MOVE_FORWARD(): Now at (2,2), facing East.`,
      `5. MOVE_FORWARD(): Now at (3,2), facing East.`,
      `6. ROTATE_LEFT(): Now at (3,2), facing North.`,
      `7. MOVE_FORWARD(): Now at (3,3), facing North.`
    ];
    
    const answer = "(3,3)";

    return {
      code: lines.join('\n'),
      answer,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return this.generateRobotTrace();
  }
}
