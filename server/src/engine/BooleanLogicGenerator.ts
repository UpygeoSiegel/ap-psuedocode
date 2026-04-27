import type { QuestionResult } from './types.js';

export class BooleanLogicGenerator {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateComplexLogic(): QuestionResult {
    const x = this.getRandomInt(1, 15);
    const y = this.getRandomInt(1, 15);
    
    const cond1 = x > 10;
    const cond2 = y < 5;
    const cond3 = (x + y) === 15;
    
    const lines: string[] = [
      `x ← ${x}`,
      `y ← ${y}`,
      `DISPLAY((x > 10 AND y < 5) OR NOT (x + y = 15))`
    ];
    
    const part1 = cond1 && cond2;
    const part2 = !cond3;
    const answer = part1 || part2;
    const answerStr = String(answer).toUpperCase();
    
    const trace: string[] = [
      `1. x = ${x}, y = ${y}`,
      `2. Evaluating (x > 10 AND y < 5):`,
      `   - x > 10 is ${cond1}`,
      `   - y < 5 is ${cond2}`,
      `   - (x > 10 AND y < 5) is ${part1}`,
      `3. Evaluating NOT (x + y = 15):`,
      `   - x + y = ${x + y}`,
      `   - (x + y = 15) is ${cond3}`,
      `   - NOT (x + y = 15) is ${part2}`,
      `4. (${part1} OR ${part2}) is ${answerStr}.`
    ];

    return {
      code: lines.join('\n'),
      answer: answerStr,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return this.generateComplexLogic();
  }
}
