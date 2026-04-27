import type { QuestionResult } from './types.js';

export class EfficiencyGenerator {
  public generateBinarySearchProblem(): QuestionResult {
    const listSizes = [100, 500, 1000, 2000];
    const n = listSizes[Math.floor(Math.random() * listSizes.length)] || 100;
    
    const answer = Math.ceil(Math.log2(n));
    
    return {
      code: `// Algorithm Analysis\n// A sorted list contains ${n} items.\n// What is the maximum number of comparisons\n// required to find an item using Binary Search?`,
      answer,
      explanation: `Binary search divides the list in half each time. For a list of size ${n}, we need to find x such that 2^x ≥ ${n}. 2^${answer-1} = ${Math.pow(2, answer-1)}, 2^${answer} = ${Math.pow(2, answer)}. So the answer is ${answer}.`
    };
  }

  public generateLinearVsBinary(): QuestionResult {
    return {
      code: `// Algorithm Comparison\n// Which of the following is true about searching an UNSORTED list?\n// A) Binary search is faster than Linear search\n// B) Linear search is the only option\n// C) Both are equally efficient`,
      answer: "B",
      explanation: `Binary search ONLY works on sorted lists. If the list is unsorted, you must use Linear search.`
    };
  }

  public generateNext(): QuestionResult {
    return Math.random() > 0.5 ? this.generateBinarySearchProblem() : this.generateLinearVsBinary();
  }
}
