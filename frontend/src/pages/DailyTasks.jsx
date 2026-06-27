import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateUserXP } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import { Code2, Play, Terminal, HelpCircle, FileUp, Sparkles, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const DailyTasks = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Code editor states
  const [code, setCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('Terminal ready. Click "Run Test Cases" to compile.');
  const [runningCode, setRunningCode] = useState(false);

  // MCQ states
  const [quizScore, setQuizScore] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
  const [quizActive, setQuizActive] = useState(false);
  const [answers, setAnswers] = useState({ aptitude: null, reasoning: null });
  const [quizFeedback, setQuizFeedback] = useState('');

  // Assignment states
  const [githubUrl, setGithubUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const fetchTaskDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const queryParams = new URLSearchParams(location.search);
      const dayParam = queryParams.get('day');
      const endpoint = dayParam ? `/api/tasks/day/${dayParam}` : '/api/tasks/today';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load task details');
      }
      setTask(data.task);
      setCompletion(data.completion);

      // Pre-fill editor with standard Python starter code based on title
      const title = data.task.codingQuestion?.title || '';
      if (title.includes('Sum')) {
        setCode("def add_numbers(a, b):\n    # Write python code here\n    return a + b\n");
      } else if (title.includes('Even')) {
        setCode("def is_even(n):\n    # Write python code here\n    return n % 2 == 0\n");
      } else if (title.includes('Factorial')) {
        setCode("def factorial(n):\n    # Write python recursive logic here\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n");
      } else {
        setCode("def solution():\n    # Write python code\n    pass\n");
      }
      
      // Reset quiz and upload states
      setQuizScore(null);
      setAnswers({ aptitude: null, reasoning: null });
      setQuizFeedback('');
      setTimeLeft(300);
      setQuizActive(false);
      setUploadSuccess('');
      setGithubUrl('');
      setFile(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTaskDetails();
    }
  }, [token, location.search]);

  // Quiz Countdown Timer
  useEffect(() => {
    if (!quizActive || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, quizActive]);

  // Handle countdown timeout
  useEffect(() => {
    if (timeLeft === 0 && quizActive) {
      setQuizActive(false);
      setQuizFeedback('⏰ Time is up! Please reset and try again.');
    }
  }, [timeLeft, quizActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCompleteComponent = async (componentName, extraPayload = {}) => {
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dayNumber: task.dayNumber,
          component: componentName,
          ...extraPayload
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to mark completion');
      }

      setCompletion(data.completion);
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
      });

      dispatch(updateUserXP({
        xp: data.user.xp,
        level: data.user.level,
        streak: user.streak,
        jobReadyScore: data.user.jobReadyScore
      }));

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Run python test cases
  const handleRunTestCases = async () => {
    setRunningCode(true);
    setTerminalOutput('Compiling python runtime sandbox...');
    try {
      const response = await fetch('/api/tasks/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dayNumber: task.dayNumber,
          code
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Sandbox compilation timed out');
      }

      setTerminalOutput(data.output);
      
      if (data.passed) {
        // Complete coding task!
        if (!completion?.codingSolved) {
          await handleCompleteComponent('coding');
        }
      }
    } catch (err) {
      console.error(err);
      setTerminalOutput(`❌ Connection Error: ${err.message}`);
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Quiz logic
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (answers.aptitude === null || answers.reasoning === null) {
      setQuizFeedback('⚠️ Please answer both MCQ questions before submitting.');
      return;
    }

    const correctApt = task.aptitudeQuestion.correctOption;
    const correctRea = task.reasoningQuestion.correctOption;

    let score = 0;
    if (parseInt(answers.aptitude) === correctApt) score += 50;
    if (parseInt(answers.reasoning) === correctRea) score += 50;

    setQuizScore(score);
    setQuizActive(false);

    if (score === 100) {
      setQuizFeedback('🎉 Perfect 100/100 Score! All answers correct.');
      if (!completion?.quizSolved) {
        await handleCompleteComponent('quiz', { quizScore: 100 });
        // Mark individual components as complete too
        await handleCompleteComponent('aptitude');
        await handleCompleteComponent('reasoning');
      }
    } else {
      setQuizFeedback(`❌ Score: ${score}/100. Review explanation and retry for full XP credits!`);
    }
  };

  // Handle assignment upload
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess('');
    setErrorMsg('');

    try {
      // Find the V1 assignment in backend
      const resList = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const listData = await resList.json();
      if (!resList.ok || listData.data.length === 0) {
        throw new Error('No assignments scheduled currently');
      }
      
      const assignmentId = listData.data[0]._id; // get first seed assignment

      const formData = new FormData();
      formData.append('assignmentId', assignmentId);
      formData.append('githubUrl', githubUrl);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'File upload failed');
      }

      setUploadSuccess(`🎉 Submitted! ${data.message}`);
      
      // Refetch stats
      dispatch(updateUserXP({
        xp: data.user.xp,
        level: data.user.level,
        streak: user.streak,
        jobReadyScore: user.jobReadyScore
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-5">
          <h1 className="text-3xl font-extrabold font-display text-text-primary flex items-center gap-2">
            <Code2 className="text-accent-primary" /> Learning Workspace
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Write Python code, run tests, solve timed logical quizzes, and upload your capstone projects.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-text-secondary text-sm animate-pulse">
            Configuring coding workspace environment...
          </div>
        ) : !task ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl">
            <span className="text-4xl">🔒</span>
            <h3 className="text-lg font-semibold mt-4">Tasks Locked</h3>
            <p className="text-text-secondary text-sm mt-1">CURRICULUM UNPUBLISHED OR RECRUIT PROFILE UNAPPROVED.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT PANEL: Code Editor & Output (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <GlassCard className="border-white/5 p-0 overflow-hidden flex flex-col h-[580px]">
                
                {/* Editor Tab Header */}
                <div className="flex items-center justify-between bg-black/40 border-b border-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary font-mono">main.py</span>
                    <span className="text-[10px] bg-accent-secondary/20 text-accent-secondary px-2 py-0.5 rounded-full font-bold uppercase">Python 3.x</span>
                  </div>
                  <button
                    onClick={handleRunTestCases}
                    disabled={runningCode}
                    className="px-3.5 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-glass-glow disabled:opacity-50"
                  >
                    {runningCode ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    Run Test Cases
                  </button>
                </div>

                {/* Editor Textarea */}
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 w-full p-4 font-mono text-sm bg-background-void/50 border-0 text-text-primary focus:outline-none focus:ring-0 resize-none leading-relaxed"
                  style={{ tabSize: 4 }}
                />

                {/* Terminal Console View */}
                <div className="h-44 bg-black border-t border-white/5 flex flex-col font-mono text-xs">
                  <div className="flex items-center gap-1.5 bg-white/5 px-4 py-2 text-text-secondary border-b border-white/5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Console Output</span>
                  </div>
                  <pre className="flex-1 p-4 overflow-y-auto text-text-secondary whitespace-pre-wrap leading-relaxed">
                    {terminalOutput}
                  </pre>
                </div>

              </GlassCard>
            </div>

            {/* RIGHT PANEL: MCQ Timed Quiz & Uploads (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. Timed Quiz Block */}
              <GlassCard className="border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="font-bold font-display text-text-primary text-sm flex items-center gap-1.5">
                    <Clock className="text-accent-primary animate-pulse" /> Timed Quiz: Day {task.dayNumber}
                  </h3>
                  
                  {quizActive && (
                    <span className="px-3 py-1 rounded-full bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-bold font-mono">
                      ⏱️ {formatTime(timeLeft)}
                    </span>
                  )}
                </div>

                {!quizActive && quizScore === null ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-xs text-text-secondary">
                      Test your aptitude and logical reasoning with a 5-minute timed challenge to earn +20 XP.
                    </p>
                    <button
                      onClick={() => setQuizActive(true)}
                      className="px-4 py-2 bg-accent-primary text-white text-xs font-bold rounded-xl shadow-glass-glow hover:opacity-90 active:scale-95 transition-all"
                    >
                      🚀 Start 5m Timer
                    </button>
                  </div>
                ) : quizActive ? (
                  <form onSubmit={handleQuizSubmit} className="space-y-4">
                    {/* Aptitude Question */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-accent-xp uppercase">Question 1: Aptitude</span>
                      <p className="text-xs text-text-primary leading-relaxed">{task.aptitudeQuestion?.question}</p>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {task.aptitudeQuestion?.options.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-xs text-text-secondary hover:text-white cursor-pointer bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                            <input
                              type="radio"
                              name="timed_apt"
                              value={idx}
                              checked={answers.aptitude === idx.toString()}
                              onChange={(e) => setAnswers({ ...answers, aptitude: e.target.value })}
                              className="accent-accent-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning Question */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <span className="text-[10px] font-bold text-accent-xp uppercase">Question 2: Reasoning</span>
                      <p className="text-xs text-text-primary leading-relaxed">{task.reasoningQuestion?.question}</p>
                      <div className="grid grid-cols-1 gap-1.5 pt-1">
                        {task.reasoningQuestion?.options.map((opt, idx) => (
                          <label key={idx} className="flex items-center gap-2 text-xs text-text-secondary hover:text-white cursor-pointer bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                            <input
                              type="radio"
                              name="timed_rea"
                              value={idx}
                              checked={answers.reasoning === idx.toString()}
                              onChange={(e) => setAnswers({ ...answers, reasoning: e.target.value })}
                              className="accent-accent-primary"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>

                    {quizFeedback && <p className="text-xs text-red-400 font-semibold text-center mt-2">{quizFeedback}</p>}

                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-accent-primary to-accent-secondary text-white text-xs font-bold rounded-xl transition-all shadow-glass-glow mt-3">
                      Submit Timed Quiz
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-accent-success mx-auto" />
                      <h4 className="font-bold text-sm text-text-primary">Quiz Evaluated</h4>
                      <p className="text-xs text-text-secondary font-mono">{quizFeedback}</p>
                    </div>
                    {quizScore !== 100 && (
                      <button 
                        onClick={() => { setQuizScore(null); setAnswers({ aptitude: null, reasoning: null }); }}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5"
                      >
                        🔄 Retry Quiz
                      </button>
                    )}
                  </div>
                )}
              </GlassCard>

              {/* 2. Assignment Project Submissions */}
              <GlassCard className="border-white/5 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-bold font-display text-text-primary text-sm flex items-center gap-1.5">
                    <FileUp className="text-accent-secondary" /> Submit Weekly Assignments
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Upload capstone files or project links here to earn +100 XP rewards.</p>
                </div>

                <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                  {uploadSuccess && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl">
                      {uploadSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">GitHub Project Link</label>
                    <input
                      type="url"
                      required
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Project PDF Documentation</label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="mt-2 block w-full text-xs text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-text-primary hover:file:bg-white/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-3 bg-white/5 border border-white/10 text-xs font-bold text-text-primary rounded-xl hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {uploading ? 'Uploading Submission...' : '📤 Submit Calculator Assignment'}
                  </button>
                </form>
              </GlassCard>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DailyTasks;
