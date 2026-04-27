import type { QuestionResult } from './types.js';

export class ListOperationGenerator {
  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public generateEliteLists(): QuestionResult {
    const initialList = [
      this.getRandomInt(10, 20),
      this.getRandomInt(20, 30),
      this.getRandomInt(30, 40)
    ];
    let currentList = [...initialList];
    const trace: string[] = [];
    const lines: string[] = [];

    lines.push(`myList ← [${initialList.join(', ')}]`);
    trace.push(`1. myList is initialized to [${currentList.join(', ')}]`);

    // INSERT(list, i, val)
    const insVal = this.getRandomInt(50, 60);
    const insIdx = 2;
    lines.push(`INSERT(myList, ${insIdx}, ${insVal})`);
    currentList.splice(insIdx - 1, 0, insVal);
    trace.push(`2. INSERT at index ${insIdx} shifts elements right: [${currentList.join(', ')}]`);

    // REMOVE(list, i)
    const remIdx = 4;
    lines.push(`REMOVE(myList, ${remIdx})`);
    const removed = currentList.splice(remIdx - 1, 1);
    trace.push(`3. REMOVE at index ${remIdx} shifts elements left: [${currentList.join(', ')}]`);

    // APPEND(list, val)
    const appIdx = 1;
    lines.push(`APPEND(myList, myList[${appIdx}])`);
    currentList.push(currentList[appIdx - 1]!);
    trace.push(`4. APPEND the value at index ${appIdx} (${currentList[appIdx - 1]}) to the end: [${currentList.join(', ')}]`);

    // Tricky bit: myList[myList[...]] or similar
    const accessIdxValue = 2; // Value at index 2 is now...
    lines.push(`idx ← myList[${accessIdxValue}] MOD 3`);
    let idxVal = (currentList[accessIdxValue - 1]! % 3);
    // Ensure idx is 1, 2, or 3 for valid indexing
    if (idxVal === 0) idxVal = 3; 
    trace.push(`5. idx = myList[${accessIdxValue}] (${currentList[accessIdxValue - 1]}) MOD 3 = ${idxVal}`);

    lines.push(`DISPLAY(myList[idx])`);
    const answer = currentList[idxVal - 1];
    trace.push(`6. DISPLAY value at index ${idxVal}: ${answer}`);

    return {
      code: lines.join('\n'),
      answer: answer!,
      explanation: trace.join('\n')
    };
  }

  public generateNext(): QuestionResult {
    return this.generateEliteLists();
  }
}
