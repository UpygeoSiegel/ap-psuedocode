import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Play, Plus, Trash2, ClipboardList, Users, Calendar } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const ALL_TOPICS = [
  'Variables & Math',
  'List Operations',
  'Iteration & Loops',
  'Selection & Logic',
  'Procedures & Scope',
  'Robot Navigation',
  'Algorithmic Efficiency'
];

interface TeacherDashboardProps {
  token: string;
}

interface SelectedTask {
  topic: string;
  goal: number;
}

interface Assignment {
  id: string;
  title: string;
  tasks: SelectedTask[];
  penalty: number;
  createdAt: number;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ token }) => {
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([
    { topic: 'Variables & Math', goal: 5 }
  ]);
  const [title, setTitle] = useState('');
  const [penalty, setPenalty] = useState(1);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'view'>('create');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teacher/assignments`);
      setAssignments(res.data);
    } catch (err) {
      console.error("Error fetching assignments", err);
    }
  };

  const handleAddTask = () => {
    setSelectedTasks([...selectedTasks, { topic: ALL_TOPICS[0]!, goal: 5 }]);
  };

  const handleRemoveTask = (index: number) => {
    setSelectedTasks(selectedTasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof SelectedTask, value: any) => {
    const newTasks = [...selectedTasks];
    newTasks[index] = { ...newTasks[index]!, [field]: value };
    setSelectedTasks(newTasks);
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTasks.length === 0) return;
    try {
      await axios.post(`${API_BASE}/teacher/assignments`, {
        title: title || 'New Assignment',
        tasks: selectedTasks,
        penalty
      });
      setTitle('');
      setSelectedTasks([{ topic: ALL_TOPICS[0]!, goal: 5 }]);
      setPenalty(1);
      fetchAssignments();
      setActiveTab('view');
    } catch (err) {
      console.error("Error setting up assignment", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex bg-white p-1 rounded-2xl shadow-sm mb-8 border border-slate-200">
        <button 
          onClick={() => setActiveTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Plus size={18} /> Create Assignment
        </button>
        <button 
          onClick={() => setActiveTab('view')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeTab === 'view' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ClipboardList size={18} /> Manage Existing
        </button>
      </div>

      {activeTab === 'create' ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-10 text-blue-800 border-b pb-6">
            <Settings size={28} />
            <h2 className="text-2xl font-black uppercase tracking-tight">Assignment Builder</h2>
          </div>

          <form onSubmit={handleSetup} className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignment Title</label>
              <input 
                type="text"
                placeholder="e.g., Unit 3 Review - Iteration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Selected Skills</h3>
                <button 
                  type="button"
                  onClick={handleAddTask}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  <Plus size={16} /> Add Skill
                </button>
              </div>

              <div className="grid gap-4">
                {selectedTasks.map((task, index) => (
                  <div key={index} className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                    <div className="flex-1">
                      <select 
                        value={task.topic}
                        onChange={(e) => updateTask(index, 'topic', e.target.value)}
                        className="w-full bg-transparent font-black text-slate-800 outline-none cursor-pointer text-lg"
                      >
                        {ALL_TOPICS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-1">Goal</label>
                        <input 
                          type="number"
                          value={task.goal}
                          onChange={(e) => updateTask(index, 'goal', parseInt(e.target.value))}
                          className="w-16 p-3 border-2 border-slate-200 rounded-xl text-center font-black text-blue-600 outline-none focus:border-blue-400 bg-white"
                          min="1"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveTask(index)}
                        className="mt-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-3xl flex items-center justify-between border border-blue-100">
              <div>
                <h4 className="font-black text-blue-900 text-sm uppercase tracking-tight">Penalty Intensity</h4>
                <p className="text-blue-700 text-xs font-medium">Points subtracted on incorrect evaluations.</p>
              </div>
              <input 
                type="number"
                value={penalty}
                onChange={(e) => setPenalty(parseInt(e.target.value))}
                className="w-24 p-4 border-2 border-blue-200 rounded-2xl text-center font-black text-blue-800 outline-none focus:border-blue-500 bg-white"
                min="0"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-blue-100 active:scale-[0.98]"
            >
              <Play size={24} fill="currentColor" />
              DEPLOY TO CLASSROOM
            </button>
          </form>
        </div>
      ) : (
        <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {assignments.map(a => (
            <div key={a.id} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">{a.title}</h3>
                <div className="flex flex-wrap gap-4">
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Calendar size={14} /> {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-widest">
                    <ClipboardList size={14} /> {a.tasks.length} Targets
                  </span>
                  <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold uppercase tracking-widest">
                    <Settings size={14} /> Penalty: {a.penalty}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-initial bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <Users size={18} /> Progress
                </button>
              </div>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="p-20 text-center border-4 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No deployed assignments.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
