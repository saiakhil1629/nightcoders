import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import GlassCard from '../../components/GlassCard';
import { BookOpen, Save, Video, Code, Brain, Link as LinkIcon, PlusCircle } from 'lucide-react';

const ManageTasks = () => {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    day_number: 1,
    study_topic: '',
    video_url: '',
    video_duration: 0,
    notes_url: '',
    coding_question: '',
    aptitude_question: '',
    reasoning_question: '',
    ai_tool_task: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTasks(data.data || []);
        if (data.data.length > 0) {
          // Pre-populate form if day 1 exists
          const day1 = data.data.find(t => t.day_number === 1);
          if (day1) setFormData(day1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const handleDaySelect = (dayNum) => {
    setSelectedDay(dayNum);
    const existingTask = tasks.find(t => t.day_number === dayNum);
    if (existingTask) {
      setFormData(existingTask);
    } else {
      setFormData({
        day_number: dayNum,
        study_topic: '',
        video_url: '',
        video_duration: 0,
        notes_url: '',
        coding_question: '',
        aptitude_question: '',
        reasoning_question: '',
        ai_tool_task: ''
      });
    }
    setSaveMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({ type: 'success', text: `Day ${formData.day_number} Task Saved Successfully!` });
        fetchTasks(); // Refresh list
      } else {
        setSaveMessage({ type: 'error', text: data.message || 'Failed to save task' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error while saving' });
    } finally {
      setLoading(false);
    }
  };

  // Generate an array of 90 days for the sidebar
  const days = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-white/5 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-display flex items-center gap-2">
              <BookOpen className="text-accent-primary" /> Manage Curriculum
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Build and assign daily tasks, videos, and questions for the 90-Day Roadmap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Day Selector */}
          <div className="lg:col-span-1">
            <GlassCard className="p-4 max-h-[70vh] overflow-y-auto">
              <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 sticky top-0 bg-background-void/80 backdrop-blur-sm py-2">
                <BookOpen className="w-4 h-4 text-accent-primary" /> Roadmap Days
              </h3>
              <div className="space-y-2">
                {days.map(day => {
                  const isSaved = tasks.some(t => t.day_number === day);
                  return (
                    <button
                      key={day}
                      onClick={() => handleDaySelect(day)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${
                        selectedDay === day 
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' 
                          : 'text-text-secondary hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span>Day {day}</span>
                      {isSaved && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6 md:p-8 relative">
              
              <div className="mb-6 flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-xl font-bold text-text-primary">
                  Editing: Day {selectedDay}
                </h2>
                {saveMessage.text && (
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    saveMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {saveMessage.text}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Study Topic / Title *</label>
                  <input
                    type="text"
                    name="study_topic"
                    value={formData.study_topic}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Introduction to Python Data Types"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Video URL</label>
                    <input
                      type="url"
                      name="video_url"
                      value={formData.video_url}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Duration (mins)</label>
                    <input
                      type="number"
                      name="video_duration"
                      value={formData.video_duration}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Notes / Material URL</label>
                  <input
                    type="url"
                    name="notes_url"
                    value={formData.notes_url}
                    onChange={handleChange}
                    placeholder="Link to Google Docs, Notion, or PDF"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors"
                  />
                </div>

                <div className="border-t border-white/5 pt-6 space-y-6">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest text-accent-primary">Questions & Assignments</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> Coding Question</label>
                    <textarea
                      name="coding_question"
                      value={formData.coding_question}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Write the problem statement here..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors font-mono text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Aptitude Question</label>
                      <textarea
                        name="aptitude_question"
                        value={formData.aptitude_question}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-3.5 h-3.5" /> Reasoning Question</label>
                      <textarea
                        name="reasoning_question"
                        value={formData.reasoning_question}
                        onChange={handleChange}
                        rows="3"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">AI Tool Assignment</label>
                    <textarea
                      name="ai_tool_task"
                      value={formData.ai_tool_task}
                      onChange={handleChange}
                      rows="3"
                      placeholder="e.g. Use ChatGPT to explain sorting algorithms and submit the chat link."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors text-sm"
                    />
                  </div>

                </div>

                <div className="pt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Save className="w-4 h-4" /> Save Day {selectedDay} Curriculum
                      </>
                    )}
                  </button>
                </div>
              </form>

            </GlassCard>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageTasks;
