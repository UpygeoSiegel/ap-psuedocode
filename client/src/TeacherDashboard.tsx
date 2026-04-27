import React, { useState } from 'react';
import axios from 'axios';
import { Settings, Play, Plus, Trash2 } from 'lucide-react';

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
  onStart: () => void;
}

interface SelectedTask {
  topic: string;
  goal: number;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onStart }) => {
  const [selectedTasks, setSelectedTasks] = useState<SelectedTask[]>([
    { topic: 'Variables & Math', goal: 5 }
  ]);
  const [penalty, setPenalty] = useState(1);

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
      await axios.post(`${API_BASE}/assignment/setup`, {
        tasks: selectedTasks,
        penalty
      });
      onStart();
    } catch (err) {
      console.error("Error setting up assignment", err);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto border border-slate-200">
      <div className="flex items-center gap-3 mb-8 text-blue-800 border-b pb-4">
        <Settings size={28} />
        <h2 className="text-2xl font-black uppercase tracking-tight">Assignment Builder</h2>
      </div>

      <form onSubmit={handleSetup} className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-700 uppercase text-xs tracking-widest">Selected Skills</h3>
            <button 
              type="button"
              onClick={handleAddTask}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-bold"
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>

          {selectedTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 group">
              <div className="flex-1">
                <select 
                  value={task.topic}
                  onChange={(e) => updateTask(index, 'topic', e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {ALL_TOPICS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase">Goal</label>
                <input 
                  type="number"
                  value={task.goal}
                  onChange={(e) => updateTask(index, 'goal', parseInt(e.target.value))}
                  className="w-16 p-2 border-2 border-slate-200 rounded-lg text-center font-bold text-blue-600 outline-none focus:border-blue-400"
                  min="1"
                />
              </div>
              <button 
                type="button"
                onClick={() => handleRemoveTask(index)}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-between border border-blue-100">
          <div>
            <h4 className="font-bold text-blue-900 text-sm">Penalty for Wrong Answers</h4>
            <p className="text-blue-700 text-xs">Points subtracted when a question is missed.</p>
          </div>
          <input 
            type="number"
            value={penalty}
            onChange={(e) => setPenalty(parseInt(e.target.value))}
            className="w-20 p-3 border-2 border-blue-200 rounded-xl text-center font-black text-blue-800 outline-none focus:border-blue-500"
            min="0"
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-blue-100 active:scale-[0.98]"
        >
          <Play size={24} fill="currentColor" />
          START ELITE PRACTICE
        </button>
      </form>
    </div>
  );
};

export default TeacherDashboard;
