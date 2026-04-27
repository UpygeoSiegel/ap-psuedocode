import express from 'express';
import cors from 'cors';
import { VariableMathGenerator } from './engine/VariableMathGenerator.js';
import { ListOperationGenerator } from './engine/ListOperationGenerator.js';
import { IterationGenerator } from './engine/IterationGenerator.js';
import { ProcedureGenerator } from './engine/ProcedureGenerator.js';
import { BooleanLogicGenerator } from './engine/BooleanLogicGenerator.js';
import { RobotGenerator } from './engine/RobotGenerator.js';
import { EfficiencyGenerator } from './engine/EfficiencyGenerator.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const mathGen = new VariableMathGenerator();
const listGen = new ListOperationGenerator();
const iterGen = new IterationGenerator();
const procGen = new ProcedureGenerator();
const boolGen = new BooleanLogicGenerator();
const robotGen = new RobotGenerator();
const effGen = new EfficiencyGenerator();

interface Task {
  topic: string;
  goal: number;
  score: number;
}

interface Assignment {
  id: number;
  tasks: Task[];
  penalty: number;
}

let currentAssignment: Assignment = {
  id: 1,
  tasks: [
    { topic: 'Variables & Math', goal: 5, score: 0 }
  ],
  penalty: 1
};

app.get('/api/assignment', (req, res) => {
  res.json(currentAssignment);
});

app.post('/api/assignment/setup', (req, res) => {
  const { tasks, penalty } = req.body;
  currentAssignment = {
    id: Date.now(),
    tasks: tasks.map((t: any) => ({ ...t, score: 0 })),
    penalty: parseInt(penalty)
  };
  res.json(currentAssignment);
});

app.get('/api/question/next', (req, res) => {
  const activeTask = currentAssignment.tasks.find(t => t.score < t.goal);
  if (!activeTask) {
    return res.status(404).json({ error: 'Assignment complete' });
  }

  let question;
  switch (activeTask.topic) {
    case 'Variables & Math': question = mathGen.generateNext(); break;
    case 'List Operations': question = listGen.generateNext(); break;
    case 'Iteration & Loops': question = iterGen.generateNext(); break;
    case 'Procedures & Scope': question = procGen.generateNext(); break;
    case 'Selection & Logic': question = boolGen.generateNext(); break;
    case 'Robot Navigation': question = robotGen.generateNext(); break;
    case 'Algorithmic Efficiency': question = effGen.generateNext(); break;
    default: question = mathGen.generateNext();
  }
  
  res.json({ ...question, topic: activeTask.topic });
});

app.post('/api/question/submit', (req, res) => {
  const { answer, expected } = req.body;
  const isCorrect = String(answer).trim().toLowerCase() === String(expected).trim().toLowerCase();
  
  const activeTask = currentAssignment.tasks.find(t => t.score < t.goal);
  
  if (activeTask) {
    if (isCorrect) {
      activeTask.score += 1;
    } else {
      activeTask.score = Math.max(0, activeTask.score - currentAssignment.penalty);
    }
  }
  
  res.json({
    correct: isCorrect,
    tasks: currentAssignment.tasks,
    goalReached: currentAssignment.tasks.every(t => t.score >= t.goal)
  });
});

app.post('/api/assignment/reset', (req, res) => {
  currentAssignment.tasks.forEach(t => t.score = 0);
  res.json(currentAssignment);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
