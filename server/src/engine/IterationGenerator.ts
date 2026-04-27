import type { QuestionResult } from './types.js';

export class IterationGenerator {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateRepeatUntil(): QuestionResult {
    const startVal = this.getRandomInt(1, 5);
    const increment = this.getRandomInt(2, 4);
    const limit = this.getRandomInt(15, 25);
    
    const lines: string[] = [];
    const trace: string[] = [];
    
    lines.push(`i ← ${startVal}`);
    trace.push(`1. i starts at ${startVal}`);
    
    lines.push(`count ← 0`);
    trace.push(`2. count starts at 0`);
    
    lines.push(`REPEAT UNTIL (i > ${limit}) {`);
    trace.push(`3. REPEAT UNTIL loop starts. It stops when i > ${limit}.`);
    
    let currentI = startVal;
    let currentCount = 0;
    let loopCount = 0;
    
    while (!(currentI > limit) && loopCount < 20) {
      currentI += increment;
      currentCount += 1;
      loopCount++;
    }
    
    lines.push(`  i ← i + ${increment}`);
    lines.push(`  count ← count + 1`);
    lines.push(`}`);
    lines.push(`DISPLAY(count)`);
    
    trace.push(`The loop ran ${currentCount} times.`);
    trace.push(`Iteration breakdown:`);
    let tempI = startVal;
    for (let k = 1; k <= currentCount; k++) {
      tempI += increment;
      trace.push(`- After iteration ${k}: i = ${tempI}`);
    }
    trace.push(`Final count is ${currentCount}.`);

    return {
      code: lines.join('\n'),
      answer: currentCount,
      explanation: trace.join('\n')
    };
  }

  public generateNestedLoops(): QuestionResult {
    const outerLimit = 3;
    const innerBase = this.getRandomInt(1, 2);
    
    const lines: string[] = [
      `total ← 0`,
      `i ← 1`,
      `REPEAT ${outerLimit} TIMES {`,
      `  j ← 1`,
      `  REPEAT i TIMES {`,
      `    total ← total + j`,
      `    j ← j + 1`,
      `  }`,
      `  i ← i + 1`,
      `}`,
      `DISPLAY(total)`
    ];
    
    let total = 0;
    const trace: string[] = [`1. total = 0, i = 1`];
    
    for (let i = 1; i <= 3; i++) {
      trace.push(`Outer Iteration i=${i}:`);
      for (let j = 1; j <= i; j++) {
        total += j;
        trace.push(`  Inner Loop j=${j}: total becomes ${total}`);
      }
    }
    
    trace.push(`Final DISPLAY value: ${total}`);

    return {
      code: lines.join('\n'),
      answer: total,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return Math.random() > 0.5 ? this.generateRepeatUntil() : this.generateNestedLoops();
  }
}
