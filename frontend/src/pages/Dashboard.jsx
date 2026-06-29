import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateUserXP } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import ProgressRing from '../components/ProgressRing';
import StreakFlame from '../components/StreakFlame';
import { BookOpen, Video, Code, CheckSquare, Brain, Award, Sparkles, Send, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

const Dashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();

  const [task, setTask] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Interaction states
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [aptitudeAnswer, setAptitudeAnswer] = useState(null);
  const [aptitudeResult, setAptitudeResult] = useState(null); // 'Correct' or 'Wrong'
  
  const [reasoningAnswer, setReasoningAnswer] = useState(null);
  const [reasoningResult, setReasoningResult] = useState(null);
  
  const [aiUrl, setAiUrl] = useState('');
  const [aiSubmitting, setAiSubmitting] = useState(false);
  
  const [codingCode, setCodingCode] = useState('');
  const [codingSubmitting, setCodingSubmitting] = useState(false);

  const fetchTodayData = async () => {
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
        throw new Error(data.message || 'Failed to fetch task details');
      }
      setTask(data.task);
      setCompletion(data.completion);
      
      // Reset quiz/submission states
      setAptitudeAnswer(null);
      setAptitudeResult(null);
      setReasoningAnswer(null);
      setReasoningResult(null);
      setAiUrl('');
      setCodingCode('');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodayData();
    }
  }, [token, location.search]);

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
        throw new Error(data.message || 'Failed to update task completion');
      }

      // Update local completion state
      setCompletion(data.completion);

      // Trigger Confetti!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366f1', '#ec4899', '#22c55e', '#eab308']
      });

      // Update global Redux User XP/Level values
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

  // Video completion callback
  const handleVideoWatched = () => {
    setVideoModalOpen(false);
    if (!completion?.videoWatched) {
      handleCompleteComponent('video');
    }
  };

  // Aptitude Submit helper
  const handleAptitudeSubmit = (e) => {
    e.preventDefault();
    if (aptitudeAnswer === null) return;
    
    const correctIdx = task.aptitudeQuestion.correctOption;
    if (parseInt(aptitudeAnswer) === correctIdx) {
      setAptitudeResult('Correct');
      handleCompleteComponent('aptitude');
    } else {
      setAptitudeResult('Wrong');
    }
  };

  // Reasoning Submit helper
  const handleReasoningSubmit = (e) => {
    e.preventDefault();
    if (reasoningAnswer === null) return;
    
    const correctIdx = task.reasoningQuestion.correctOption;
    if (parseInt(reasoningAnswer) === correctIdx) {
      setReasoningResult('Correct');
      handleCompleteComponent('reasoning');
    } else {
      setReasoningResult('Wrong');
    }
  };

  // AI Task Submit helper
  const handleAiTaskSubmit = async (e) => {
    e.preventDefault();
    if (!aiUrl.trim()) return;

    setAiSubmitting(true);
    await handleCompleteComponent('aiTask', { submissionUrl: aiUrl });
    setAiSubmitting(false);
  };

  if (!user) return null;

  const getCompletedCount = () => {
    if (!completion) return 0;
    let count = 0;
    if (completion.videoWatched) count++;
    if (completion.codingSolved) count++;
    if (completion.quizSolved || (completion.aptitudeSolved && completion.reasoningSolved)) count++;
    if (completion.aiTaskSubmitted) count++;
    return count;
  };

  const getCompletionPercentage = () => {
    if (!completion) return 0;
    const count = getCompletedCount();
    return (count / 4) * 100;
  };

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none animate-glow"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-accent-primary/20 border border-accent-primary/20 text-accent-primary text-[10px] font-bold uppercase tracking-wider">
                90-Day Acceleration Journey
              </span>
              <h1 className="text-3xl sm:text-4xl font-black font-display text-glow-accent text-text-primary tracking-tight">
                Welcome back, {user.name}! ✨
              </h1>
              <p className="text-text-secondary text-sm italic max-w-xl">
                "Consistency is the currency of engineering success. Solve today's tasks and get 1% better."
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <StreakFlame count={user.streak || 0} className="py-2.5 px-4 rounded-2xl bg-black/40 border-white/10" />
              <div className="bg-black/40 border border-white/10 py-2.5 px-4 rounded-2xl flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-none">Level</p>
                  <p className="font-display font-black text-sm text-accent-xp mt-0.5">{user.level || 1} <span className="text-xs text-text-secondary">({user.xp || 0} XP)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="border-white/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Job Readiness Score</h4>
              <p className="text-3xl font-black font-display text-text-primary mt-1.5">{user.jobReadyScore || 10}%</p>
              <p className="text-[10px] text-text-secondary mt-1">Based on profile & course metrics</p>
            </div>
            <ProgressRing percentage={user.jobReadyScore || 10} size={70} strokeWidth={7} color="stroke-accent-primary" />
          </GlassCard>

          <GlassCard className="border-white/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Coding Solved</h4>
              <p className="text-3xl font-black font-display text-text-primary mt-1.5">{user.codingQuestionsSolved || 0}</p>
              <p className="text-[10px] text-text-secondary mt-1">Target: 150+ solved</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-xl text-accent-secondary font-bold shadow-glass-glow">
              💻
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Hours Studied</h4>
              <p className="text-3xl font-black font-display text-text-primary mt-1.5">{user.hoursStudied || 0}h</p>
              <p className="text-[10px] text-text-secondary mt-1">Lecture watch-time logs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xl text-accent-xp font-bold">
              ⏱️
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Current Streak</h4>
              <p className="text-3xl font-black font-display text-text-primary mt-1.5">{user.streak || 0} Days</p>
              <p className="text-[10px] text-text-secondary mt-1">Consistency king reward</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl text-accent-streak font-bold animate-pulse">
              🔥
            </div>
          </GlassCard>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-text-secondary text-sm animate-pulse">
            Loading today's training blueprint...
          </div>
        ) : !task ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
            <span className="text-4xl">🏁</span>
            <h3 className="text-xl font-display font-semibold text-text-primary mt-4">90 Days Completed!</h3>
            <p className="text-sm text-text-secondary mt-1">Amazing! You have completed the curriculum or no more tasks are active.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Today's Tasks Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h2 className="text-2xl font-bold font-display text-text-primary flex items-center gap-2">
                    <BookOpen className="text-accent-primary" /> Day {task.dayNumber}: {task.studyTopic}
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">Complete all components to unlock the Daily Consistency Badge</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-secondary">{getCompletedCount()}/4 Done</span>
                  <div className="w-20 bg-white/5 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div className="bg-accent-primary h-full transition-all duration-500" style={{ width: `${getCompletionPercentage()}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Task Cards Grid */}
              <div className="space-y-6">
                
                {/* 1. Video Card */}
                <GlassCard className={`border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${completion?.videoWatched ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl bg-accent-primary/10 text-accent-primary border border-accent-primary/10 ${completion?.videoWatched ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                      {completion?.videoWatched ? <Check className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary flex items-center gap-2">
                        Watch Technical Lecture
                        {completion?.videoWatched && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">COMPLETED</span>}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">Study the core foundations and fundamentals of: {task.studyTopic}</p>
                      <span className="text-[10px] text-text-muted mt-2 block font-semibold">EST. TIME: {task.videoDuration || 15} mins • +25 XP</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 self-start md:self-auto w-full md:w-auto">
                    <button 
                      onClick={() => setVideoModalOpen(true)}
                      className="px-4 py-2.5 rounded-xl bg-accent-primary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-glass-glow"
                    >
                      <Video className="w-4 h-4" /> {completion?.videoWatched ? 'Watch Again' : 'Play Video'}
                    </button>
                    {task.notesUrl && (
                      <a 
                        href={task.notesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" /> Study Materials
                      </a>
                    )}
                  </div>
                </GlassCard>

                {/* 2. Coding Challenge Card */}
                <GlassCard className={`border-white/5 flex flex-col md:flex-row md:items-start justify-between gap-4 ${completion?.codingSolved ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3.5 rounded-2xl bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/10 ${completion?.codingSolved ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                      {completion?.codingSolved ? <Check className="w-6 h-6" /> : <Code className="w-6 h-6" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary flex items-center gap-2">
                        Daily Coding Challenge: {task.codingQuestion?.title || 'Basics'}
                        {completion?.codingSolved && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">SOLVED</span>}
                      </h4>
                      <div className="bg-black/30 border border-white/5 p-3.5 rounded-2xl mt-2 text-xs font-mono text-text-secondary leading-relaxed max-w-xl whitespace-pre-line">
                        {task.codingQuestion?.description}
                      </div>
                      <span className="text-[10px] text-text-muted mt-2.5 block font-semibold uppercase">
                        Difficulty: <span className="text-accent-secondary">{task.codingQuestion?.difficulty}</span> • +40 XP
                      </span>
                    </div>
                  </div>
                  
                  {!completion?.codingSolved ? (
                    <div className="w-full md:w-1/3 flex flex-col gap-2 mt-4 md:mt-0">
                      <textarea
                        value={codingCode}
                        onChange={(e) => setCodingCode(e.target.value)}
                        placeholder="Paste your solution code here..."
                        className="w-full h-24 p-3 bg-black/40 border border-white/10 rounded-xl text-xs text-text-primary font-mono focus:outline-none focus:border-accent-secondary/50 resize-none"
                      />
                      <button 
                        onClick={async () => {
                          if (!codingCode.trim()) return alert("Please paste your solution code first!");
                          setCodingSubmitting(true);
                          await handleCompleteComponent('coding', { codingSubmissionCode: codingCode });
                          setCodingSubmitting(false);
                        }}
                        disabled={codingSubmitting}
                        className="w-full px-4 py-2.5 rounded-xl bg-accent-secondary text-white text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" /> Submit Code
                      </button>
                    </div>
                  ) : (
                    <div className="text-right text-xs">
                      <span className="text-green-400 font-bold block">✅ Solved & Verified</span>
                      {completion.codingSubmissionCode && (
                        <p className="text-[10px] text-text-secondary mt-1 max-w-[200px] truncate inline-block text-right">
                          Code saved successfully.
                        </p>
                      )}
                    </div>
                  )}
                </GlassCard>

                {/* 3. Aptitude & Reasoning Quizzes */}
                <GlassCard className={`border-white/5 space-y-6 ${completion?.aptitudeSolved && completion?.reasoningSolved ? 'opacity-70' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl bg-yellow-500/10 text-accent-xp border border-yellow-500/10 ${(completion?.aptitudeSolved && completion?.reasoningSolved) ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                      {(completion?.aptitudeSolved && completion?.reasoningSolved) ? <Check className="w-6 h-6" /> : <Brain className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary flex items-center gap-2">
                        Aptitude & Logical Reasoning Challenges
                        {(completion?.aptitudeSolved && completion?.reasoningSolved) && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">COMPLETED</span>}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1">Solve the MCQs to optimize analytics and analytical logical reasoning core skills.</p>
                      <span className="text-[10px] text-text-muted mt-2 block font-semibold">XP GAIN: +15 XP each (Total +30 XP)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-4">
                    
                    {/* Aptitude Part */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-accent-xp">Part A: Aptitude</h5>
                      <p className="text-xs text-text-primary leading-relaxed min-h-[36px]">
                        {typeof task.aptitudeQuestion === 'string' ? task.aptitudeQuestion : task.aptitudeQuestion?.question}
                      </p>
                      
                      {completion?.aptitudeSolved ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold">
                          ✅ Correct! {typeof task.aptitudeQuestion === 'object' && task.aptitudeQuestion?.explanation}
                        </div>
                      ) : (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (typeof task.aptitudeQuestion === 'string') {
                            setAptitudeResult('Correct');
                            handleCompleteComponent('aptitude');
                          } else {
                            handleAptitudeSubmit(e);
                          }
                        }} className="space-y-3">
                          {typeof task.aptitudeQuestion === 'object' && task.aptitudeQuestion?.options && (
                            <div className="space-y-2">
                              {task.aptitudeQuestion.options.map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-2 text-xs text-text-secondary hover:text-white cursor-pointer bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                                  <input
                                    type="radio"
                                    name="aptitude"
                                    value={idx}
                                    checked={parseInt(aptitudeAnswer) === idx}
                                    onChange={(e) => setAptitudeAnswer(e.target.value)}
                                    className="accent-accent-primary"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}
                          <button type="submit" className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all">
                            Submit Aptitude
                          </button>
                          {aptitudeResult === 'Wrong' && <p className="text-[10px] text-red-400 font-semibold">❌ Wrong answer. Hint: recalculate CP/Speed ratios!</p>}
                        </form>
                      )}
                    </div>

                    {/* Reasoning Part */}
                    <div className="space-y-3">
                      <h5 className="text-xs font-bold uppercase tracking-wider text-accent-xp">Part B: Logical Reasoning</h5>
                      <p className="text-xs text-text-primary leading-relaxed min-h-[36px]">
                        {typeof task.reasoningQuestion === 'string' ? task.reasoningQuestion : task.reasoningQuestion?.question}
                      </p>

                      {completion?.reasoningSolved ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-semibold">
                          ✅ Correct! {typeof task.reasoningQuestion === 'object' && task.reasoningQuestion?.explanation}
                        </div>
                      ) : (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (typeof task.reasoningQuestion === 'string') {
                            setReasoningResult('Correct');
                            handleCompleteComponent('reasoning');
                          } else {
                            handleReasoningSubmit(e);
                          }
                        }} className="space-y-3">
                          {typeof task.reasoningQuestion === 'object' && task.reasoningQuestion?.options && (
                            <div className="space-y-2">
                              {task.reasoningQuestion.options.map((opt, idx) => (
                                <label key={idx} className="flex items-center gap-2 text-xs text-text-secondary hover:text-white cursor-pointer bg-white/5 border border-white/5 px-3 py-2 rounded-lg">
                                  <input
                                    type="radio"
                                    name="reasoning"
                                    value={idx}
                                    checked={parseInt(reasoningAnswer) === idx}
                                    onChange={(e) => setReasoningAnswer(e.target.value)}
                                    className="accent-accent-primary"
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}
                          <button type="submit" className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg transition-all">
                            Submit Reasoning
                          </button>
                          {reasoningResult === 'Wrong' && <p className="text-[10px] text-red-400 font-semibold">❌ Incorrect index matches. Look closely at alphabetical codes.</p>}
                        </form>
                      )}
                    </div>

                  </div>
                </GlassCard>

                {/* 4. AI Tool Task Card */}
                <GlassCard className={`border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 ${completion?.aiTaskSubmitted ? 'opacity-70' : ''}`}>
                  <div className="flex-1 flex items-start gap-4">
                    <div className={`p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 ${completion?.aiTaskSubmitted ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}`}>
                      {completion?.aiTaskSubmitted ? <Check className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-text-primary flex items-center gap-2">
                        Weekly AI Tool Exercise: {task.aiToolTask?.title}
                        {completion?.aiTaskSubmitted && <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">SUBMITTED</span>}
                      </h4>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed max-w-xl">
                        {task.aiToolTask?.description}
                      </p>
                      <span className="text-[10px] text-text-muted mt-2 block font-semibold">SUBMISSION METHOD: URL link or screenshot URL • +35 XP</span>
                    </div>
                  </div>

                  {!completion?.aiTaskSubmitted ? (
                    <form onSubmit={handleAiTaskSubmit} className="flex gap-2 min-w-[260px] self-start md:self-auto">
                      <input
                        type="url"
                        required
                        value={aiUrl}
                        onChange={(e) => setAiUrl(e.target.value)}
                        placeholder="Paste output URL or Imgur link"
                        className="flex-1 px-3 py-2 text-xs bg-background-void border border-border-sleek text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/60 rounded-xl"
                      />
                      <button 
                        type="submit" 
                        disabled={aiSubmitting}
                        className="p-2.5 rounded-xl bg-accent-primary hover:opacity-90 active:scale-95 transition-all text-white flex items-center justify-center disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="text-right text-xs">
                      <span className="text-green-400 font-bold block">✓ Submitted</span>
                      <a href={completion.aiTaskSubmissionUrl} target="_blank" rel="noreferrer" className="text-accent-primary hover:underline block mt-0.5 font-semibold text-[10px]">
                        Review Submission Link
                      </a>
                    </div>
                  )}
                </GlassCard>

              </div>
            </div>

            {/* Side Information Panels */}
            <div className="space-y-6">
              
              {/* Daily Checklist card */}
              <GlassCard className="border-white/5 space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
                    <CheckSquare className="text-accent-primary" /> Daily Habit Tracker
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">Maintain consistency to gain streak rewards.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs p-1">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] ${completion?.videoWatched ? 'bg-accent-success text-white border-accent-success' : ''}`}>
                        {completion?.videoWatched && '✓'}
                      </span>
                      1. Watch Technical Video
                    </span>
                    <span className="font-semibold text-accent-xp">+25 XP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-1">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] ${completion?.codingSolved ? 'bg-accent-success text-white border-accent-success' : ''}`}>
                        {completion?.codingSolved && '✓'}
                      </span>
                      2. Solve Coding Question
                    </span>
                    <span className="font-semibold text-accent-xp">+40 XP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-1">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] ${completion?.aptitudeSolved ? 'bg-accent-success text-white border-accent-success' : ''}`}>
                        {completion?.aptitudeSolved && '✓'}
                      </span>
                      3. Solve Aptitude Challenge
                    </span>
                    <span className="font-semibold text-accent-xp">+15 XP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-1">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] ${completion?.reasoningSolved ? 'bg-accent-success text-white border-accent-success' : ''}`}>
                        {completion?.reasoningSolved && '✓'}
                      </span>
                      4. Solve Reasoning Challenge
                    </span>
                    <span className="font-semibold text-accent-xp">+15 XP</span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-1">
                    <span className="text-text-secondary flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full border border-white/20 flex items-center justify-center text-[8px] ${completion?.aiTaskSubmitted ? 'bg-accent-success text-white border-accent-success' : ''}`}>
                        {completion?.aiTaskSubmitted && '✓'}
                      </span>
                      5. Submit AI Tool Exercise
                    </span>
                    <span className="font-semibold text-accent-xp">+35 XP</span>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-primary font-bold">
                    <span>Bonus Completion Points:</span>
                    <span className="text-accent-success text-shadow-success">+50 XP</span>
                  </div>
                </div>
              </GlassCard>

              {/* Achievements panel */}
              <GlassCard className="border-white/5 space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
                    <Award className="text-accent-xp" /> Unlocked Achievements
                  </h3>
                  <p className="text-[11px] text-text-secondary mt-0.5">Collect trophies on your 90-day marathon</p>
                </div>

                <div className="space-y-4">
                  {user.badges && user.badges.length > 0 ? (
                    user.badges.map((badge, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 hover:scale-102 transition-all duration-300">
                        <span className="text-2xl">{badge.icon || '🛡️'}</span>
                        <div>
                          <h4 className="text-sm font-bold text-text-primary">{badge.name}</h4>
                          <p className="text-[10px] text-text-secondary mt-0.5">{badge.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-text-muted italic">
                      No achievements unlocked yet. Finish Day 1 to unlock your first recruit badge!
                    </div>
                  )}
                </div>
              </GlassCard>

            </div>

          </div>
        )}

      </div>

      {/* Embedded Video Lecture Glass Modal */}
      {videoModalOpen && task && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-4xl border-white/10 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold font-display text-text-primary flex items-center gap-2">
                📹 Now Playing: {task.studyTopic}
              </h3>
              <button 
                onClick={handleVideoWatched}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10"
              >
                ✕ Close & Complete
              </button>
            </div>
            
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
              <iframe
                className="w-full h-full"
                src={task.videoUrl || 'https://www.youtube.com/embed/kqtD5dpn9C8'}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>

            <p className="text-[10px] text-text-secondary mt-3 italic text-center">
              Close the modal when you have completed viewing to claim your +25 XP rewards.
            </p>
          </GlassCard>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
