import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle2, XCircle, RefreshCw, Trophy, ChevronRight, BarChart3 } from 'lucide-react';
import confetti from 'canvas-confetti';
import TeacherDashboard from './TeacherDashboard';

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

interface Question {
  code: string;
  answer: string | number;
  explanation: string;
  topic: string;
}

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; msg: string } | null>(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAssignment();
  }, []);

  useEffect(() => {
    if (question && !feedback && !loading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [question, feedback, loading]);

  const fetchAssignment = async () => {
    try {
      const res = await axios.get(`${API_BASE}/assignment`);
      setAssignment(res.data);
    } catch (err) {
      console.error("Error fetching assignment", err);
    }
  };

  const startAssignment = () => {
    setShowDashboard(false);
    fetchAssignment();
    fetchNextQuestion();
  };

  const fetchNextQuestion = async () => {
    setLoading(true);
    setFeedback(null);
    setUserAnswer('');
    
    try {
      const res = await axios.get(`${API_BASE}/question/next`);
      setQuestion(res.data);
    } catch (err) {
      console.error("Error fetching question", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !userAnswer || feedback) return;

    try {
      const res = await axios.post(`${API_BASE}/question/submit`, {
        answer: userAnswer,
        expected: question.answer
      });

      setFeedback({
        correct: res.data.correct,
        msg: res.data.correct ? 'Correct!' : `Incorrect. The answer was ${question.answer}.`
      });

      setAssignment(prev => prev ? { ...prev, tasks: res.data.tasks } : null);

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

  const resetAssignment = async () => {
    await axios.post(`${API_BASE}/assignment/reset`);
    fetchAssignment();
    fetchNextQuestion();
  };

  if (showDashboard) {
    return (
      <div className="min-h-screen p-8 bg-slate-50 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black text-blue-900 mb-2 uppercase tracking-tighter">PseudoCode Elite</h1>
        <p className="text-slate-500 mb-8 font-medium">Big Idea 3 Master Class</p>
        <TeacherDashboard onStart={startAssignment} />
      </div>
    );
  }

  if (!assignment) return <div className="p-8 text-center font-bold text-slate-400">Loading Elite Session...</div>;

  const activeTask = assignment.tasks.find(t => t.score < t.goal);
  const isDone = !activeTask;
  const currentTopic = question?.topic || activeTask?.topic || 'Review';

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar Progress */}
      <aside className="lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-8">
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
            onClick={() => setShowDashboard(true)}
            className="w-full mt-8 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-dashed border-blue-200"
          >
            End Session
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
                onClick={resetAssignment}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200"
              >
                Restart Assignment
              </button>
              <button 
                onClick={() => setShowDashboard(true)}
                className="bg-white text-slate-700 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all border-2 border-slate-200"
              >
                New Settings
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
                        onClick={fetchNextQuestion}
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
