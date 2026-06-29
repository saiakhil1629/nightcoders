import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import GlassCard from '../../components/GlassCard';
import { BookOpen, Save, Video, Code, Brain, Link as LinkIcon, Sparkles } from 'lucide-react';

const ManageTasks = () => {
  const { token } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  // Flattened Form State
  const [formData, setFormData] = useState({
    day_number: 1,
    study_topic: '',
    video_url: '',
    video_duration: 0,
    notes_url: '',

    // Coding
    coding_title: '',
    coding_difficulty: 'Easy',
    coding_description: '',

    // Aptitude
    aptitude_q: '',
    aptitude_opt0: '',
    aptitude_opt1: '',
    aptitude_opt2: '',
    aptitude_opt3: '',
    aptitude_correct: 0,
    aptitude_exp: '',

    // Reasoning
    reasoning_q: '',
    reasoning_opt0: '',
    reasoning_opt1: '',
    reasoning_opt2: '',
    reasoning_opt3: '',
    reasoning_correct: 0,
    reasoning_exp: '',

    // AI
    ai_title: '',
    ai_desc: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const populateForm = (taskData) => {
    if (!taskData) {
      setFormData({
        day_number: selectedDay,
        study_topic: '', video_url: '', video_duration: 0, notes_url: '',
        coding_title: '', coding_difficulty: 'Easy', coding_description: '',
        aptitude_q: '', aptitude_opt0: '', aptitude_opt1: '', aptitude_opt2: '', aptitude_opt3: '', aptitude_correct: 0, aptitude_exp: '',
        reasoning_q: '', reasoning_opt0: '', reasoning_opt1: '', reasoning_opt2: '', reasoning_opt3: '', reasoning_correct: 0, reasoning_exp: '',
        ai_title: '', ai_desc: ''
      });
      return;
    }

    const cq = taskData.coding_question || {};
    const aq = taskData.aptitude_question || {};
    const rq = taskData.reasoning_question || {};
    const ai = taskData.ai_tool_task || {};

    setFormData({
      day_number: taskData.day_number,
      study_topic: taskData.study_topic || '',
      video_url: taskData.video_url || '',
      video_duration: taskData.video_duration || 0,
      notes_url: taskData.notes_url || '',

      coding_title: cq.title || '',
      coding_difficulty: cq.difficulty || 'Easy',
      coding_description: cq.description || '',

      aptitude_q: aq.question || '',
      aptitude_opt0: aq.options?.[0] || '',
      aptitude_opt1: aq.options?.[1] || '',
      aptitude_opt2: aq.options?.[2] || '',
      aptitude_opt3: aq.options?.[3] || '',
      aptitude_correct: aq.correctOption || 0,
      aptitude_exp: aq.explanation || '',

      reasoning_q: rq.question || '',
      reasoning_opt0: rq.options?.[0] || '',
      reasoning_opt1: rq.options?.[1] || '',
      reasoning_opt2: rq.options?.[2] || '',
      reasoning_opt3: rq.options?.[3] || '',
      reasoning_correct: rq.correctOption || 0,
      reasoning_exp: rq.explanation || '',

      ai_title: ai.title || '',
      ai_desc: ai.description || ''
    });
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setTasks(data.data || []);
        if (data.data.length > 0) {
          const day1 = data.data.find(t => t.day_number === 1);
          if (day1 && selectedDay === 1) populateForm(day1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const handleDaySelect = (dayNum) => {
    setSelectedDay(dayNum);
    const existingTask = tasks.find(t => t.day_number === dayNum);
    populateForm(existingTask || { day_number: dayNum });
    setSaveMessage({ type: '', text: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const formatVideoUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const urlParams = new URL(url).searchParams;
        return `https://www.youtube.com/embed/${urlParams.get('v')}`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaveMessage({ type: '', text: '' });

    const payload = {
      day_number: formData.day_number,
      study_topic: formData.study_topic,
      video_url: formatVideoUrl(formData.video_url),
      video_duration: parseInt(formData.video_duration) || 0,
      notes_url: formData.notes_url,
      coding_question: formData.coding_title ? {
        title: formData.coding_title,
        difficulty: formData.coding_difficulty,
        description: formData.coding_description
      } : null,
      aptitude_question: formData.aptitude_q ? {
        question: formData.aptitude_q,
        options: [formData.aptitude_opt0, formData.aptitude_opt1, formData.aptitude_opt2, formData.aptitude_opt3],
        correctOption: parseInt(formData.aptitude_correct),
        explanation: formData.aptitude_exp
      } : null,
      reasoning_question: formData.reasoning_q ? {
        question: formData.reasoning_q,
        options: [formData.reasoning_opt0, formData.reasoning_opt1, formData.reasoning_opt2, formData.reasoning_opt3],
        correctOption: parseInt(formData.reasoning_correct),
        explanation: formData.reasoning_exp
      } : null,
      ai_tool_task: formData.ai_title ? {
        title: formData.ai_title,
        description: formData.ai_desc
      } : null
    };

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setSaveMessage({ type: 'success', text: `Day ${formData.day_number} Task Saved Successfully!` });
        fetchTasks();
      } else {
        setSaveMessage({ type: 'error', text: data.message || 'Failed to save task' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Network error while saving' });
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 90 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-7xl mx-auto space-y-8">
        
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
                      type="button"
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

              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Study Topic / Title *</label>
                  <input type="text" name="study_topic" value={formData.study_topic} onChange={handleChange} required placeholder="e.g. Introduction to Python Data Types" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Video URL</label>
                    <input type="url" name="video_url" value={formData.video_url} onChange={handleChange} placeholder="Paste YouTube link (auto-embeds)" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Duration (mins)</label>
                    <input type="number" name="video_duration" value={formData.video_duration} onChange={handleChange} min="0" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" /> Notes / Material URL</label>
                  <input type="url" name="notes_url" value={formData.notes_url} onChange={handleChange} placeholder="Link to Google Docs, Notion, or PDF" className="w-full px-4 py-3 bg-white/5 border border-white/10 text-text-primary rounded-xl focus:outline-none focus:border-accent-primary transition-colors" />
                </div>

                {/* CODING SECTION */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-accent-primary uppercase tracking-widest flex items-center gap-2"><Code className="w-4 h-4"/> Coding Question</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Problem Title</label>
                      <input type="text" name="coding_title" value={formData.coding_title} onChange={handleChange} placeholder="e.g. Two Sum" className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Difficulty</label>
                      <select name="coding_difficulty" value={formData.coding_difficulty} onChange={handleChange} className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Problem Description</label>
                    <textarea name="coding_description" value={formData.coding_description} onChange={handleChange} rows="4" placeholder="Write the detailed problem statement..." className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm font-mono" />
                  </div>
                </div>

                {/* APTITUDE SECTION */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-accent-xp uppercase tracking-widest flex items-center gap-2"><Brain className="w-4 h-4"/> Aptitude Question (MCQ)</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Question Text</label>
                    <textarea name="aptitude_q" value={formData.aptitude_q} onChange={handleChange} rows="2" placeholder="e.g. A train running at speed..." className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={`apt_opt_${i}`} className="space-y-1">
                        <label className="text-xs font-semibold text-text-secondary uppercase">Option {i+1}</label>
                        <input type="text" name={`aptitude_opt${i}`} value={formData[`aptitude_opt${i}`]} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Correct Option</label>
                      <select name="aptitude_correct" value={formData.aptitude_correct} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm">
                        <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Explanation (Optional)</label>
                      <input type="text" name="aptitude_exp" value={formData.aptitude_exp} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* REASONING SECTION */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-accent-xp uppercase tracking-widest flex items-center gap-2"><Brain className="w-4 h-4"/> Logical Reasoning (MCQ)</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Question Text</label>
                    <textarea name="reasoning_q" value={formData.reasoning_q} onChange={handleChange} rows="2" placeholder="e.g. If CAT is coded as DBU..." className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(i => (
                      <div key={`res_opt_${i}`} className="space-y-1">
                        <label className="text-xs font-semibold text-text-secondary uppercase">Option {i+1}</label>
                        <input type="text" name={`reasoning_opt${i}`} value={formData[`reasoning_opt${i}`]} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Correct Option</label>
                      <select name="reasoning_correct" value={formData.reasoning_correct} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm">
                        <option value={0}>Option 1</option><option value={1}>Option 2</option><option value={2}>Option 3</option><option value={3}>Option 4</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-text-secondary uppercase">Explanation (Optional)</label>
                      <input type="text" name="reasoning_exp" value={formData.reasoning_exp} onChange={handleChange} className="w-full px-3 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg text-sm" />
                    </div>
                  </div>
                </div>

                {/* AI TOOL SECTION */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Sparkles className="w-4 h-4"/> AI Tool Task</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Task Title</label>
                    <input type="text" name="ai_title" value={formData.ai_title} onChange={handleChange} placeholder="e.g. Chat with ChatGPT about Sorting" className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">Task Instructions</label>
                    <textarea name="ai_desc" value={formData.ai_desc} onChange={handleChange} rows="2" placeholder="e.g. Use ChatGPT to explain..." className="w-full px-4 py-2 bg-black/40 border border-white/10 text-text-primary rounded-lg focus:border-accent-primary text-sm" />
                  </div>
                </div>

                <div className="pt-6 flex justify-end">
                  <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-white font-bold rounded-xl hover:bg-accent-secondary transition-colors disabled:opacity-50">
                    {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Day {selectedDay} Curriculum</>}
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

