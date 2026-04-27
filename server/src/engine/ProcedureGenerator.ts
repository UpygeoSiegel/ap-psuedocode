import type { QuestionResult } from './types.js';

export class ProcedureGenerator {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateProcedureTrace(): QuestionResult {
    const p1 = this.getRandomInt(2, 5);
    const p2 = this.getRandomInt(5, 10);
    
    const lines: string[] = [
      `PROCEDURE compute(a, b) {`,
      `  IF (a > b) {`,
      `    RETURN(a - b)`,
      `  }`,
      `  RETURN(b - a)`,
      `}`,
      `x ← ${p1}`,
      `y ← ${p2}`,
      `result ← compute(x * 2, y)`,
      `DISPLAY(result)`
    ];
    
    const arg1 = p1 * 2;
    const arg2 = p2;
    const answer = Math.abs(arg1 - arg2);
    
    const trace: string[] = [
      `1. x is ${p1}, y is ${p2}.`,
      `2. compute is called with arguments (${arg1}, ${arg2}).`,
      `3. Inside compute: a=${arg1}, b=${arg2}.`,
      `4. Is ${arg1} > ${arg2}? ${arg1 > arg2 ? 'Yes' : 'No'}.`,
      `5. compute returns ${answer}.`,
      `6. DISPLAY shows ${answer}.`
    ];

    return {
      code: lines.join('\n'),
      answer,
      explanation: trace.join('\n')
    };
  }

  public generateNestedProcedures(): QuestionResult {
    const val = this.getRandomInt(2, 6);
    
    const lines: string[] = [
      `PROCEDURE double(n) {`,
      `  RETURN(n * 2)`,
      `}`,
      `PROCEDURE addFive(n) {`,
      `  RETURN(n + 5)`,
      `}`,
      `val ← ${val}`,
      `result ← addFive(double(val))`,
      `DISPLAY(result)`
    ];
    
    const mid = val * 2;
    const answer = mid + 5;
    
    const trace: string[] = [
      `1. double(${val}) is called first, returning ${mid}.`,
      `2. addFive(${mid}) is then called with the result of double.`,
      `3. addFive returns ${mid} + 5 = ${answer}.`,
      `4. DISPLAY shows ${answer}.`
    ];

    return {
      code: lines.join('\n'),
      answer,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return Math.random() > 0.5 ? this.generateProcedureTrace() : this.generateNestedProcedures();
  }
}
