import type { QuestionResult } from './types.js';

export class VariableMathGenerator {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateEliteMath(): QuestionResult {
    const v1 = 'x';
    const v2 = 'y';
    
    let val1 = this.getRandomInt(12, 25);
    let val2 = this.getRandomInt(3, 6);
    
    const lines: string[] = [];
    const trace: string[] = [];

    lines.push(`${v1} ← ${val1}`);
    trace.push(`1. ${v1} is initialized to ${val1}`);

    lines.push(`${v2} ← ${val2}`);
    trace.push(`2. ${v2} is initialized to ${val2}`);

    lines.push(`${v1} ← ${v1} MOD ${v2}`);
    const modResult = val1 % val2;
    trace.push(`3. ${v1} = ${val1} MOD ${val2} = ${modResult}`);
    val1 = modResult;

    if (val1 < 3) {
      lines.push(`IF (${v1} < 3) {`);
      lines.push(`  ${v2} ← ${v1} * 10`);
      val2 = val1 * 10;
      trace.push(`4. Since ${v1} < 3 is true, ${v2} = ${val1} * 10 = ${val2}`);
      
      lines.push(`  IF (${v2} > 15) {`);
      if (val2 > 15) {
        lines.push(`    ${v1} ← ${v2} - 5`);
        val1 = val2 - 5;
        trace.push(`5. Since ${v2} > 15 is true, ${v1} = ${val2} - 5 = ${val1}`);
      } else {
        lines.push(`    ${v1} ← ${v2} + 5`);
        val1 = val2 + 5;
        trace.push(`5. Since ${v2} > 15 is false, ${v1} = ${val2} + 5 = ${val1}`);
      }
      lines.push(`  }`);
      lines.push(`} ELSE {`);
      lines.push(`  ${v2} ← ${v1} + 5`);
      lines.push(`}`);
    } else {
      lines.push(`IF (${v1} < 3) {`);
      lines.push(`  ${v2} ← ${v1} * 10`);
      lines.push(`} ELSE {`);
      lines.push(`  ${v1} ← ${v1} * 2`);
      val1 = val1 * 2;
      trace.push(`4. Since ${v1} < 3 is false, ${v1} = ${val1/2} * 2 = ${val1}`);
      
      lines.push(`  ${v2} ← ${v1} + 3`);
      val2 = val1 + 3;
      trace.push(`5. ${v2} = ${val1} + 3 = ${val2}`);
      lines.push(`}`);
    }

    lines.push(`${v1} ← ${v1} + ${v2}`);
    const finalV1 = val1 + val2;
    trace.push(`6. ${v1} = ${val1} + ${val2} = ${finalV1}`);
    val1 = finalV1;

    lines.push(`DISPLAY(${v1})`);
    trace.push(`7. DISPLAY final value of ${v1}: ${val1}`);

    return {
      code: lines.join('\n'),
      answer: val1,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return this.generateEliteMath();
  }
}
