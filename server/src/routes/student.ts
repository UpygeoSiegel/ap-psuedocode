import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../utils/auth.js';
import { VariableMathGenerator } from '../engine/VariableMathGenerator.js';
import { ListOperationGenerator } from '../engine/ListOperationGenerator.js';
import { IterationGenerator } from '../engine/IterationGenerator.js';
import { ProcedureGenerator } from '../engine/ProcedureGenerator.js';
import { BooleanLogicGenerator } from '../engine/BooleanLogicGenerator.js';
import { RobotGenerator } from '../engine/RobotGenerator.js';
import { EfficiencyGenerator } from '../engine/EfficiencyGenerator.js';

const router = Router();

const generators: Record<string, any> = {
  'Variables & Math': new VariableMathGenerator(),
  'List Operations': new ListOperationGenerator(),
  'Iteration & Loops': new IterationGenerator(),
  'Procedures & Scope': new ProcedureGenerator(),
  'Selection & Logic': new BooleanLogicGenerator(),
  'Robot Navigation': new RobotGenerator(),
  'Algorithmic Efficiency': new EfficiencyGenerator(),
};

router.use(authenticate);

router.get('/assignments', (req: any, res) => {
  res.json(db.get().assignments);
});

router.get('/progress/:assignmentId', (req: any, res) => {
  const { assignmentId } = req.params;
  let progress = db.get().progress.find(p => p.assignmentId === assignmentId && p.userId === req.user.id);
  
  if (!progress) {
    const assignment = db.get().assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    progress = {
      userId: req.user.id,
      assignmentId,
      tasks: assignment.tasks.map(t => ({ ...t, score: 0 })),
      completed: false,
      updatedAt: Date.now()
    };
    
    const data = db.get();
    data.progress.push(progress);
    db.set(data);
  }
  
  res.json(progress);
});

router.get('/question/next/:assignmentId', (req: any, res) => {
  const { assignmentId } = req.params;
  const progress = db.get().progress.find(p => p.assignmentId === assignmentId && p.userId === req.user.id);
  
  if (!progress) return res.status(404).json({ error: 'Progress not found' });
  
  const activeTask = progress.tasks.find(t => t.score < t.goal);
  if (!activeTask) return res.status(404).json({ error: 'Assignment complete' });

  const gen = generators[activeTask.topic] || generators['Variables & Math'];
  const question = gen.generateNext();
  
  res.json({ ...question, topic: activeTask.topic });
});

router.post('/question/submit/:assignmentId', (req: any, res) => {
  const { assignmentId } = req.params;
  const { answer, expected } = req.body;
  const isCorrect = String(answer).trim().toLowerCase() === String(expected).trim().toLowerCase();
  
  const data = db.get();
  const progress = data.progress.find(p => p.assignmentId === assignmentId && p.userId === req.user.id);
  const assignment = data.assignments.find(a => a.id === assignmentId);

  if (!progress || !assignment) return res.status(404).json({ error: 'Not found' });

  const activeTask = progress.tasks.find(t => t.score < t.goal);
  
  if (activeTask) {
    if (isCorrect) {
      activeTask.score += 1;
    } else {
      activeTask.score = Math.max(0, activeTask.score - assignment.penalty);
    }
  }

  progress.completed = progress.tasks.every(t => t.score >= t.goal);
  progress.updatedAt = Date.now();
  
  db.set(data);
  
  res.json({
    correct: isCorrect,
    progress,
    goalReached: progress.completed
  });
});

export default router;
