import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserXP } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import { Sparkles, Send, FileText, Globe, MessageSquare, Brain, Target, RefreshCw } from 'lucide-react';

const AIHub = () => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('interview'); // 'audit' or 'interview'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Resume states
  const [resumeReport, setResumeReport] = useState('');
  const [resumeScore, setResumeScore] = useState(null);

  // Portfolio states
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioReport, setPortfolioReport] = useState('');

  // Chat/Interview states
  const [chatHistory, setChatHistory] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your AI Technical Recruiter. Let's begin the mock interview. Explain the difference between a List and a Tuple in Python, and describe when you would prefer to use one over the other."
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleResumeAudit = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/ai/resume-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to review resume');
      }
      setResumeReport(data.report);
      setResumeScore(data.score || 75);

      // Update local Redux Job Readiness Score
      dispatch(updateUserXP({
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        jobReadyScore: data.jobReadyScore
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioAudit = async (e) => {
    e.preventDefault();
    if (!portfolioUrl) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/ai/portfolio-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url: portfolioUrl })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to critique portfolio');
      }
      setPortfolioReport(data.report);

      dispatch(updateUserXP({
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        jobReadyScore: data.jobReadyScore
      }));

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) return;

    const newMessage = { role: 'user', text: userMessage };
    setChatHistory((prev) => [...prev, newMessage]);
    setUserMessage('');
    setChatLoading(true);

    try {
      // Send chat answer to Gemini
      const response = await fetch('/api/ai/chat-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatHistory.slice(-6) // Send last 6 turns for light context
        })
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Interviewer connection timed out');
      }

      setChatHistory((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: `❌ Network connection failed. Please retry your last answer: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-text-primary flex items-center gap-2">
              <Brain className="text-accent-primary animate-pulse" /> AI Placement Mentor
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Audit your resumes and portfolios, and practice technical interview simulations with our recruiter bot.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('interview')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'interview' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-white'}`}
            >
              <MessageSquare className="w-4 h-4" /> Mock Interview
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${activeTab === 'audit' ? 'bg-accent-primary text-white' : 'text-text-secondary hover:text-white'}`}
            >
              <FileText className="w-4 h-4" /> Profile Auditor
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Tab content 1: Mock Interview */}
        {activeTab === 'interview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Chat Box Panel */}
            <div className="lg:col-span-8">
              <GlassCard className="border-white/5 p-0 flex flex-col h-[520px] overflow-hidden">
                <div className="bg-black/40 border-b border-white/5 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent-success animate-ping"></span>
                    <span className="text-xs font-bold text-text-primary">Recruiter Session Active</span>
                  </div>
                  <button 
                    onClick={() => setChatHistory([{ role: 'assistant', text: "Hello! Let's start the mock interview. Describe the difference between a list and a tuple in Python." }])}
                    className="text-[10px] text-text-secondary hover:text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 transition-all"
                  >
                    🔄 Restart Session
                  </button>
                </div>

                {/* Message Log */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {chatHistory.map((msg, idx) => {
                    const isAssistant = msg.role === 'assistant';
                    return (
                      <div key={idx} className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
                        <div 
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                            isAssistant 
                              ? 'bg-white/5 border border-white/5 text-text-primary rounded-tl-none font-mono whitespace-pre-wrap' 
                              : 'bg-accent-primary text-white rounded-tr-none'
                          }`}
                        >
                          <p className="font-bold text-[9px] uppercase tracking-wider mb-1 opacity-70">
                            {isAssistant ? '⚡ Technical Interviewer' : '👤 Candidate (You)'}
                          </p>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/5 text-text-muted rounded-2xl rounded-tl-none px-4 py-3 text-xs animate-pulse font-mono">
                        ⚙️ Evaluator is formulating response...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleSendMessage} className="bg-black border-t border-white/5 p-4 flex gap-3">
                  <input
                    type="text"
                    required
                    value={userMessage}
                    disabled={chatLoading}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your response here..."
                    className="flex-1 px-4 py-3 text-xs bg-background-void border border-border-sleek text-text-primary placeholder-text-muted rounded-xl focus:outline-none focus:border-accent-primary/60 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={chatLoading || !userMessage.trim()}
                    className="p-3 bg-accent-primary hover:opacity-90 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-glass-glow disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </GlassCard>
            </div>

            {/* Instruction sidebar */}
            <div className="lg:col-span-4">
              <GlassCard className="border-white/5 space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="font-bold font-display text-text-primary text-sm flex items-center gap-1.5">
                    <Target className="text-accent-xp" /> Interview Rules
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Prepare effectively for technical rounds</p>
                </div>

                <div className="space-y-4 text-xs text-text-secondary leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="text-accent-primary">1.</span>
                    <p>Explain time and space complexity (Big O) where applicable for coding answers.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-accent-primary">2.</span>
                    <p>Structure behavioral responses using the **STAR** method (Situation, Task, Action, Result).</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-accent-primary">3.</span>
                    <p>If you don't know the answer, explain your initial thoughts and request prompts.</p>
                  </div>
                  <div className="pt-3 border-t border-white/5 text-[10px] text-text-muted flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-xp animate-pulse" />
                    Completing mock interviews boosts placement scores.
                  </div>
                </div>
              </GlassCard>
            </div>

          </div>
        )}

        {/* Tab content 2: Profile Auditor */}
        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Resume Auditor card */}
            <GlassCard className="border-white/5 space-y-6 flex flex-col">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-lg text-text-primary flex items-center gap-2">
                  <FileText className="text-accent-primary" /> AI Resume Optimizer
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Audit your listed profile details (skills, bio, solved count) using AI models.
                </p>
              </div>

              {resumeReport ? (
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-xs font-semibold text-text-secondary">AI Resume Evaluation Score</span>
                    <span className="font-display font-black text-xl text-accent-success">{resumeScore} / 100</span>
                  </div>
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed h-[240px] overflow-y-auto">
                    {resumeReport}
                  </div>
                  <button
                    onClick={() => setResumeReport('')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5"
                  >
                    🔄 Run Audit Again
                  </button>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-between h-[320px]">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Our AI parses your registered academy profile (college, major, skills, solved questions, streaks) and checks if it matches tier-1 technical requirements.
                  </p>
                  
                  <div className="space-y-3">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-[11px] text-text-muted">
                      💡 Tip: Increase your profile completeness by adding LinkedIn links, GitHub links, and solving coding tasks.
                    </div>
                    
                    <button
                      onClick={handleResumeAudit}
                      disabled={loading}
                      className="w-full py-3.5 bg-accent-primary hover:opacity-90 text-white font-display font-bold text-xs rounded-xl shadow-glass-glow flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Audit Profile Resume
                    </button>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Portfolio Critic card */}
            <GlassCard className="border-white/5 space-y-6 flex flex-col">
              <div className="border-b border-white/5 pb-4">
                <h3 className="font-display font-extrabold text-lg text-text-primary flex items-center gap-2">
                  <Globe className="text-accent-secondary" /> AI Portfolio Architect
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Analyze your deployed web portfolio layout and code presentations.
                </p>
              </div>

              {portfolioReport ? (
                <div className="flex-1 space-y-4">
                  <div className="bg-black/40 border border-white/5 p-4 rounded-2xl font-mono text-xs text-text-secondary whitespace-pre-wrap leading-relaxed h-[290px] overflow-y-auto">
                    {portfolioReport}
                  </div>
                  <button
                    onClick={() => setPortfolioReport('')}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5"
                  >
                    🔄 Run Critique Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePortfolioAudit} className="flex-grow flex flex-col justify-between h-[320px]">
                  <div className="space-y-3">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Enter your portfolio domain name. Gemini reviews your layouts, project lists, and visual setups for creative recruiters.
                    </p>
                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Portfolio Website URL</label>
                      <input
                        type="url"
                        required
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://yourportfolio.dev"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !portfolioUrl}
                    className="w-full py-3.5 bg-accent-secondary hover:opacity-90 text-white font-display font-bold text-xs rounded-xl shadow-glass-glow flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze Portfolio URL
                  </button>
                </form>
              )}
            </GlassCard>

          </div>
        )}

      </div>
    </div>
  );
};

export default AIHub;
