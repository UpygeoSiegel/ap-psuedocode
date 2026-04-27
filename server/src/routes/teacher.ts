import { Router } from 'express';
import { db } from '../db.js';
import { authenticate } from '../utils/auth.js';
import type { Assignment } from '../models/types.js';

const router = Router();

router.use(authenticate);

// Middleware to ensure role is teacher
const isTeacher = (req: any, res: any, next: any) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  next();
};

router.get('/assignments', isTeacher, (req: any, res) => {
  const assignments = db.get().assignments.filter(a => a.teacherId === req.user.id);
  res.json(assignments);
});

router.post('/assignments', isTeacher, (req: any, res) => {
  const { title, tasks, penalty } = req.body;
  
  const newAssignment: Assignment = {
    id: Math.random().toString(36).substr(2, 9),
    teacherId: req.user.id,
    title: title || 'New Assignment',
    tasks,
    penalty: parseInt(penalty) || 0,
    createdAt: Date.now()
  };

  const data = db.get();
  data.assignments.push(newAssignment);
  db.set(data);
  res.json(newAssignment);
});

router.get('/progress/:assignmentId', isTeacher, (req: any, res) => {
  const { assignmentId } = req.params;
  const progress = db.get().progress.filter(p => p.assignmentId === assignmentId);
  const users = db.get().users;
  
  const report = progress.map(p => {
    const user = users.find(u => u.id === p.userId);
    return {
      ...p,
      userName: user?.name,
      userEmail: user?.email
    };
  });
  
  res.json(report);
});

export default router;
