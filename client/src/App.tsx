import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, Trophy, ChevronRight, BarChart3, LogOut, User as UserIcon, BookOpen } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import confetti from 'canvas-confetti';
import TeacherDashboard from './TeacherDashboard';

interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: 'teacher' | 'student';
}

interface Task {
  topic: string;
  goal: number;
  score: number;
}

interface Assignment {
  id: string;
  title: string;
  tasks: Task[];
  penalty: number;
}

interface Question {
  code: string;
  answer: string | number;
  explanation: string;
  topic: string;
}

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Configure axios with token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      fetchUser();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchAssignments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAssignmentId) {
      fetchProgress(selectedAssignmentId);
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    if (question && !feedback && !loading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [question, feedback, loading]);

  const fetchUser = async () => {
    // In a real app, we might have a /me endpoint, 
    // but here we get it from the login response. 
    // If we have a token but no user, we might need to fetch or decode.
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  };

  const handleLoginSuccess = async (response: any) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/google`, {
        credential: response.credential,
        role: role
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('user');
    setSelectedAssignmentId(null);
    setAssignment(null);
    setQuestion(null);
  };

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/student/assignments`);
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments", err);
    }
  };

  const fetchProgress = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE}/student/progress/${id}`);
      setAssignment(res.data);
      if (!question) {
        fetchNextQuestion(id);
      }
    } catch (err) {
      console.error("Error fetching progress", err);
    }
  };

  const fetchNextQuestion = async (id?: string) => {
    const aid = id || selectedAssignmentId;
    if (!aid) return;

    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    
    try {
      const res = await axios.get(`${API_BASE}/question/next/${aid}`);
      setQuestion(res.data);
    } catch (err) {
      console.error("Error fetching question", err);
      if (err.response?.status === 404) {
        setQuestion(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !userAnswer || feedback || !selectedAssignmentId) return;

    try {
      const res = await axios.post(`${API_BASE}/student/question/submit/${selectedAssignmentId}`, {
        answer: userAnswer,
        expected: question.answer
      });

      setFeedback({
        correct: res.data.correct,
        msg: res.data.correct ? 'Correct!' : `Incorrect. The answer was ${question.answer}.`
      });

      setAssignment(prev => prev ? { ...prev, tasks: res.data.progress.tasks } : null);

      if (res.data.correct && res.data.goalReached) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Error submitting answer", err);
    }
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 flex flex-col items-center justify-center">
        <div className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full text-center">
          <h1 className="text-4xl font-black text-blue-900 mb-2 uppercase tracking-tighter">PseudoCode Elite</h1>
          <p className="text-slate-500 mb-10 font-medium">Big Idea 3 Master Class</p>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
            >
              Teacher
            </button>
          </div>

          <div className="flex justify-center">
            <GoogleLogin 
              onSuccess={handleLoginSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
            />
          </div>
          
          <p className="mt-8 text-[10px] text-slate-400 uppercase font-black tracking-widest">Secure Institutional Access Only</p>
        </div>
      </div>
    );
  }

  if (user.role === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <UserIcon size={24} />
            </div>
            <div>
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-xl">{user.name}</h2>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Faculty Dashboard</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={24} />
          </button>
        </header>
        <TeacherDashboard token={token} />
      </div>
    );
  }

  // Student Assignment Selection
  if (!selectedAssignmentId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
           <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">My Assignments</h1>
           <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
             <LogOut size={24} />
           </button>
        </header>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map(a => (
            <button 
              key={a.id}
              onClick={() => setSelectedAssignmentId(a.id)}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-left hover:border-blue-500 transition-all group active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{a.title}</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{a.tasks.length} Learning Targets</p>
            </button>
          ))}
          {assignments.length === 0 && (
            <div className="col-span-full p-20 text-center border-4 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No active assignments found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Student Question View
  if (!assignment) return <div className="p-8 text-center font-bold text-slate-400">Loading Elite Session...</div>;

  const activeTask = assignment.tasks.find(t => t.score < t.goal);
  const isDone = !activeTask;
  const currentTopic = question?.topic || activeTask?.topic || 'Review';

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar Progress */}
      <aside className="lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-8">
          <button 
            onClick={() => setSelectedAssignmentId(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-8"
          >
            <ChevronRight size={14} className="rotate-180" /> Back to List
          </button>

          <div className="flex items-center gap-2 mb-6 text-slate-800 border-b pb-4">
            <BarChart3 size={20} className="text-blue-600" />
            <h2 className="font-black text-sm uppercase tracking-widest">Skill Progress</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            {assignment.tasks.map((task, i) => {
              const taskPercent = Math.min(100, (task.score / task.goal) * 100);
              const isTaskDone = task.score >= task.goal;
              const isActive = activeTask?.topic === task.topic;
              
              return (
                <div key={i} className={`flex flex-col gap-2 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-tight">
                    <span className={isActive ? 'text-blue-800' : 'text-slate-500'}>{task.topic}</span>
                    <span className="text-slate-400">{task.score} / {task.goal}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full transition-all duration-700 ${isTaskDone ? 'bg-green-500' : (isActive ? 'bg-blue-600' : 'bg-slate-300')}`}
                      style={{ width: `${taskPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={handleLogout}
            className="w-full mt-8 py-3 text-xs font-bold text-red-400 hover:bg-red-50 rounded-xl transition-colors border border-dashed border-red-100"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {isDone ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl text-center flex flex-col items-center gap-8 border-4 border-green-50 animate-in fade-in zoom-in duration-500">
            <div className="w-32 h-32 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner scale-110">
              <Trophy size={64} />
            </div>
            <div>
              <h2 className="text-4xl font-black mb-2 text-slate-900 tracking-tighter uppercase">Elite Mastery Achieved</h2>
              <p className="text-slate-500 text-lg max-w-md mx-auto">You've successfully traced through all assigned Big Idea 3 challenges.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setSelectedAssignmentId(null)}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200"
              >
                Back to Assignments
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
               <div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Current Topic</span>
                 <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{currentTopic}</h2>
               </div>
               <div className="text-right">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignment ID</span>
                 <p className="font-mono text-xs text-slate-400 font-bold">#{assignment.id.toString().slice(-6)}</p>
               </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-500">
              <div className="bg-slate-900 p-10 relative">
                <div className="absolute top-6 right-8 text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">Trace and Display</div>
                <pre className="text-blue-400 font-mono text-xl md:text-2xl leading-relaxed whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                  {loading ? (
                    <span className="animate-pulse opacity-50 italic">Synthesizing Elite Challenge...</span>
                  ) : (
                    question?.code || 'Initializing Problem...'
                  )}
                </pre>
              </div>

              <div className="p-10">
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                      Expected Output Value:
                    </label>
                    <input 
                      ref={inputRef}
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      disabled={!!feedback || loading}
                      className={`w-full text-4xl p-6 border-4 rounded-3xl outline-none transition-all font-mono tracking-tight ${
                        feedback 
                          ? (feedback.correct ? 'border-green-500 bg-green-50 text-green-900 shadow-inner' : 'border-red-500 bg-red-50 text-red-900 shadow-inner')
                          : 'border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-12 focus:ring-blue-50'
                      }`}
                      placeholder="?"
                    />
                  </div>

                  {feedback ? (
                    <div className={`p-8 rounded-3xl flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300 border-2 ${feedback.correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-start gap-5">
                        <div className={`shrink-0 p-2 rounded-full ${feedback.correct ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {feedback.correct ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-2xl font-black uppercase tracking-tight ${feedback.correct ? 'text-green-900' : 'text-red-900'}`}>
                            {feedback.msg}
                          </p>
                          <div className={`mt-6 p-6 rounded-2xl font-mono text-sm leading-relaxed border ${feedback.correct ? 'bg-white/60 text-green-800 border-green-200/50' : 'bg-white/60 text-red-800 border-red-200/50'}`}>
                            <p className="font-black mb-4 uppercase text-[10px] tracking-[0.2em] text-slate-400 border-b pb-2">Execution Trace</p>
                            <div className="whitespace-pre-wrap font-bold">
                              {question?.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => fetchNextQuestion()}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                      >
                        NEXT CHALLENGE <ChevronRight size={24} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="submit"
                      disabled={loading || !userAnswer}
                      className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                      {loading ? 'Processing...' : 'Submit Evaluation'}
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
