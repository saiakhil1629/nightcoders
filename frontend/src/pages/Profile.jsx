import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUserSuccess } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';
import { User, Mail, School, BookOpen, Calendar, Shield, Award, CheckCircle, Github, Linkedin, Globe, Edit2, Save, X, Cpu, Clock, TrendingUp, HelpCircle } from 'lucide-react';

const Profile = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    college: user?.profile?.college || '',
    branch: user?.profile?.branch || '',
    gradYear: user?.profile?.gradYear || '',
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    githubUrl: user?.profile?.githubUrl || '',
    linkedinUrl: user?.profile?.linkedinUrl || '',
    portfolioUrl: user?.profile?.portfolioUrl || '',
  });

  if (!user) {
    return (
      <div className="p-8 text-center text-text-secondary animate-pulse">
        Loading Student Analytics...
      </div>
    );
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile info');
      }

      dispatch(loadUserSuccess(data.user));
      setSuccessMsg('Profile and Job-Readiness scores updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Job readiness score details
  const readiness = user.jobReadyScore || 0;
  
  // Calculate category score breakdowns based on actual user metrics
  const codingWeight = Math.min(30, (user.codingQuestionsSolved || 0) * 3);
  const quizWeight = 20; // baseline quiz & tasks completion
  const streakWeight = Math.min(15, (user.streak || 0) * 3);
  const profileWeight = (
    (user.profile?.githubUrl ? 5 : 0) +
    (user.profile?.linkedinUrl ? 5 : 0) +
    (user.profile?.resumeUrl ? 5 : 0) +
    (user.profile?.portfolioUrl ? 5 : 0)
  );
  const mockWeight = user.profile?.resumeUrl ? 15 : 0;

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-display flex items-center gap-2">
              <Award className="text-accent-primary animate-pulse" /> Performance Analytics & Profile
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Visualize your 90-day learning metrics, check job-readiness indices, and optimize recruiters credentials.
            </p>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5 flex items-center gap-2 transition-all active:scale-95 text-text-primary"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile Links
            </button>
          )}
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-accent-success/10 border border-accent-success/20 text-accent-success text-sm font-semibold">
            🎉 {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1 & 2: Analytics & Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Job Readiness Score Gauges */}
            <GlassCard className="border-white/5 p-6 space-y-6">
              <h2 className="text-lg font-bold font-display text-text-primary border-b border-white/5 pb-3">
                Job Readiness Index (JRI)
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Radial SVG Gauge */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      className="stroke-background-cardMuted"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="68"
                      stroke="url(#jriGrad)"
                      strokeWidth="10"
                      fill="transparent"
                      strokeDasharray={427}
                      strokeDashoffset={427 - (427 * readiness) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="jriGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-display font-black text-3xl text-text-primary text-glow-accent">{readiness}%</span>
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">Job Ready</span>
                  </div>
                </div>

                {/* Score Breakdown details */}
                <div className="flex-1 w-full space-y-3.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-secondary">Coding Challenges (30%)</span>
                      <span className="text-text-primary">{codingWeight}/30 XP</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                      <div className="bg-accent-primary h-full rounded-full transition-all duration-500" style={{ width: `${(codingWeight/30)*100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-secondary">Profile completeness (20%)</span>
                      <span className="text-text-primary">{profileWeight}/20 XP</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                      <div className="bg-accent-secondary h-full rounded-full transition-all duration-500" style={{ width: `${(profileWeight/20)*100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-secondary">AI Mock Interview (15%)</span>
                      <span className="text-text-primary">{mockWeight}/15 XP</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                      <div className="bg-accent-success h-full rounded-full transition-all duration-500" style={{ width: `${(mockWeight/15)*100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-secondary">Streaks & Consistency (15%)</span>
                      <span className="text-text-primary">{streakWeight}/15 XP</span>
                    </div>
                    <div className="w-full bg-black/40 rounded-full h-1.5 border border-white/5">
                      <div className="bg-accent-streak h-full rounded-full transition-all duration-500" style={{ width: `${(streakWeight/15)*100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Profile Info Form / Display */}
            <GlassCard className="border-white/5 p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h2 className="text-lg font-bold font-display text-text-primary flex items-center gap-1.5">
                      <Edit2 className="w-4 h-4 text-accent-primary" /> Edit Profile Credentials
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">College Name</label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college}
                        onChange={handleInputChange}
                        placeholder="e.g., Stanford University"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Branch/Major</label>
                      <input
                        type="text"
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        placeholder="e.g., Computer Science"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Graduation Year</label>
                      <input
                        type="number"
                        name="gradYear"
                        value={formData.gradYear}
                        onChange={handleInputChange}
                        placeholder="e.g., 2027"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Skills (Comma Separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="Python, Git, React, SQL"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Short Bio</label>
                      <textarea
                        name="bio"
                        rows="3"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Describe your career focus or technical passion..."
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                        <Github className="w-3 h-3" /> GitHub Link
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                        <Linkedin className="w-3 h-3" /> LinkedIn Link
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Portfolio URL
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.dev"
                        className="mt-2 block w-full px-3.5 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted text-xs focus:outline-none focus:border-accent-primary/60 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-semibold rounded-xl border border-white/5 text-text-secondary transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2 bg-accent-primary hover:opacity-90 active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-glass-glow disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold font-display text-text-primary border-b border-white/5 pb-3">
                    Student Information Card
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <School className="w-4 h-4 mt-0.5 text-accent-primary" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">College & Major</p>
                          <p className="text-xs text-text-primary font-medium mt-0.5">
                            {user.profile?.college || 'Stanford University'}
                          </p>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            {user.profile?.branch || 'Computer Science'} {user.profile?.gradYear ? `(Grad Class ${user.profile.gradYear})` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <BookOpen className="w-4 h-4 mt-0.5 text-accent-secondary" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Technical Skills</p>
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            {user.profile?.skills && user.profile.skills.length > 0 ? (
                              user.profile.skills.map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-text-primary font-medium">
                                  {skill}
                                </span>
                              ))
                            ) : (
                              ['Python', 'DSA', 'Git', 'SQL'].map((skill, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-text-secondary font-medium">
                                  {skill}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <User className="w-4 h-4 mt-0.5 text-accent-xp" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Short Biography</p>
                          <p className="text-xs text-text-primary font-medium mt-1 leading-relaxed">
                            {user.profile?.bio || 'No bio listed yet. Click edit to describe your technical achievements!'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Mail className="w-4 h-4 mt-0.5 text-accent-streak" />
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary">Connected Social Portals</p>
                          <div className="flex gap-2.5 mt-2">
                            {user.profile?.githubUrl ? (
                              <a href={user.profile.githubUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all text-text-primary">
                                <Github className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="p-2 bg-white/5 border border-white/5 rounded-xl opacity-40 text-text-secondary">
                                <Github className="w-4 h-4" />
                              </span>
                            )}

                            {user.profile?.linkedinUrl ? (
                              <a href={user.profile.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all text-text-primary">
                                <Linkedin className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="p-2 bg-white/5 border border-white/5 rounded-xl opacity-40 text-text-secondary">
                                <Linkedin className="w-4 h-4" />
                              </span>
                            )}

                            {user.profile?.portfolioUrl ? (
                              <a href={user.profile.portfolioUrl} target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl transition-all text-text-primary">
                                <Globe className="w-4 h-4" />
                              </a>
                            ) : (
                              <span className="p-2 bg-white/5 border border-white/5 rounded-xl opacity-40 text-text-secondary">
                                <Globe className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>

          </div>

          {/* Column 3: Dashboard Statistics Cards & Badges Shelf */}
          <div className="space-y-8">
            
            {/* Quick Metrics Statistics Grid */}
            <GlassCard className="border-white/5 p-6 space-y-4">
              <h3 className="font-display font-extrabold text-sm text-text-primary flex items-center gap-1.5 border-b border-white/5 pb-2">
                <TrendingUp className="w-4 h-4 text-accent-secondary" /> Learning Stats
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-accent-primary" /> Solved
                  </div>
                  <p className="text-lg font-black text-text-primary mt-1 font-display">{user.codingQuestionsSolved || 0}</p>
                  <p className="text-[9px] text-text-muted">Python exercises</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                    <Clock className="w-3.5 h-3.5 text-accent-streak" /> Studied
                  </div>
                  <p className="text-lg font-black text-text-primary mt-1 font-display">{user.hoursStudied || 0} hrs</p>
                  <p className="text-[9px] text-text-muted">Lecture videos</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-accent-xp" /> Attendance
                  </div>
                  <p className="text-lg font-black text-text-primary mt-1 font-display">{user.attendanceCount || 0}</p>
                  <p className="text-[9px] text-text-muted">Live webinars</p>
                </div>

                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                  <div className="flex items-center gap-1 text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
                    <Shield className="w-3.5 h-3.5 text-accent-success" /> Streaks
                  </div>
                  <p className="text-lg font-black text-text-primary mt-1 font-display">{user.streak || 0} days</p>
                  <p className="text-[9px] text-text-muted">Consistency map</p>
                </div>
              </div>
            </GlassCard>

            {/* Badges Shelf */}
            <GlassCard className="border-white/5 p-6 space-y-4">
              <h3 className="font-display font-extrabold text-sm text-text-primary flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Award className="w-4 h-4 text-accent-xp animate-pulse" /> Unlocked Badges Shelf
              </h3>

              {user.badges && user.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5">
                  {user.badges.map((badge, idx) => (
                    <div key={idx} className="group relative bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-accent-xp/40 hover:bg-accent-xp/5">
                      <span className="text-2xl drop-shadow-[0_4px_10px_rgba(234,179,8,0.2)] animate-bounce">{badge.icon || '🛡️'}</span>
                      <p className="text-[10px] font-bold text-text-primary mt-2 leading-tight">{badge.name}</p>
                      
                      {/* Interactive hover detail tooltip */}
                      <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute z-10 bottom-full mb-2 w-40 bg-black/90 border border-white/10 p-2.5 rounded-xl text-[9px] text-text-secondary text-left shadow-lg">
                        <p className="font-bold text-text-primary mb-1">{badge.name}</p>
                        {badge.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-text-muted text-xs leading-relaxed">
                  🔒 No badges unlocked yet.<br/>Solve coding challenges and daily lessons to trigger achievements!
                </div>
              )}
            </GlassCard>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
