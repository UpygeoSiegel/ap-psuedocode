export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'teacher' | 'student';
}

export interface Task {
  topic: string;
  goal: number;
}

export interface StudentTaskProgress extends Task {
  score: number;
}

export interface Assignment {
  id: string;
  teacherId: string;
  title: string;
  tasks: Task[];
  penalty: number;
  createdAt: number;
}

export interface StudentProgress {
  userId: string;
  assignmentId: string;
  tasks: StudentTaskProgress[];
  completed: boolean;
  updatedAt: number;
}

export interface DbSchema {
  users: User[];
  assignments: Assignment[];
  progress: StudentProgress[];
}
