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

  public generateReasonableTime(): QuestionResult {
    const types = [
      { q: "A list of size n is processed in n^2 steps.", a: "Reasonable", e: "Polynomial time (n^2, n^3, etc.) is considered 'reasonable' time in CSP." },
      { q: "A list of size n is processed in 2^n steps.", a: "Unreasonable", e: "Exponential time (2^n) is considered 'unreasonable' time because the steps grow too quickly as n increases." },
      { q: "A list of size n is processed in log(n) steps.", a: "Reasonable", e: "Logarithmic time is very efficient and considered reasonable." }
    ];
    const item = types[Math.floor(Math.random() * types.length)]!;
    
    return {
      code: `// Efficiency Concepts\n// Is an algorithm with ${item.q.toLowerCase()} \n// considered to run in 'Reasonable' or 'Unreasonable' time?`,
      answer: item.a,
      explanation: item.e
    };
  }

  public generateNext(): QuestionResult {
    const rand = Math.random();
    if (rand < 0.4) return this.generateBinarySearchProblem();
    if (rand < 0.7) return this.generateLinearVsBinary();
    return this.generateReasonableTime();
  }
}
