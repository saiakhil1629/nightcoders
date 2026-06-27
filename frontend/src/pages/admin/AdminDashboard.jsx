import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import GlassCard from '../../components/GlassCard';
import { Search, ChevronDown, User, Shield, TrendingUp, Users, Award, BookOpen, AlertCircle, FileText, Globe, ExternalLink, X } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('xp'); // 'xp', 'jri', 'streak', 'name'
  const [selectedStudent, setSelectedStudent] = useState(null); // Drilldown inspection modal

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/admin/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStudents(data.data || []);
        } else {
          throw new Error(data.message || 'Failed to fetch student cohort list');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  // Calculations for general cohort stats
  const totalStudents = students.length;
  const avgXp = totalStudents 
    ? Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / totalStudents) 
    : 0;
  const avgJri = totalStudents 
    ? Math.round(students.reduce((sum, s) => sum + (s.jobReadyScore || 0), 0) / totalStudents) 
    : 0;
  const avgStreak = totalStudents 
    ? Math.round(students.reduce((sum, s) => sum + (s.streak || 0), 0) / totalStudents) 
    : 0;

  // Search and filtering logic
  const filteredStudents = students
    .filter((student) => {
      const term = searchTerm.toLowerCase();
      const matchName = student.name?.toLowerCase().includes(term);
      const matchEmail = student.email?.toLowerCase().includes(term);
      const matchCollege = student.profile?.college?.toLowerCase().includes(term);
      const matchSkills = student.profile?.skills?.some((s) => s.toLowerCase().includes(term));
      return matchName || matchEmail || matchCollege || matchSkills;
    })
    .sort((a, b) => {
      if (sortBy === 'xp') return (b.xp || 0) - (a.xp || 0);
      if (sortBy === 'jri') return (b.jobReadyScore || 0) - (a.jobReadyScore || 0);
      if (sortBy === 'streak') return (b.streak || 0) - (a.streak || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Title */}
        <div className="border-b border-white/5 pb-4">
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight font-display flex items-center gap-2">
            <TrendingUp className="text-accent-primary" /> Cohort Analytics Hub
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Analyze learning consistency, monitor placement readiness indices, and review individual student profiles.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="border-white/5 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Enrolled Students</p>
              <p className="text-2xl font-black text-text-primary font-display mt-0.5">{totalStudents}</p>
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-xp/10 border border-accent-xp/20 flex items-center justify-center text-accent-xp">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Average XP</p>
              <p className="text-2xl font-black text-text-primary font-display mt-0.5">{avgXp} XP</p>
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Average JRI</p>
              <p className="text-2xl font-black text-text-primary font-display mt-0.5">{avgJri}%</p>
            </div>
          </GlassCard>

          <GlassCard className="border-white/5 p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-streak/10 border border-accent-streak/20 flex items-center justify-center text-accent-streak">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Average Streak</p>
              <p className="text-2xl font-black text-text-primary font-display mt-0.5">{avgStreak} Days</p>
            </div>
          </GlassCard>
        </div>

        {/* Dashboard Grid controls: Search & Table */}
        <GlassCard className="border-white/5 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold font-display text-text-primary">
              Student Cohort Records
            </h2>
            
            {/* Search and Sort filters */}
            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search students, college, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-9 pr-4 py-2 text-xs bg-background-void border border-border-sleek text-text-primary placeholder-text-muted rounded-xl focus:outline-none focus:border-accent-primary/60 transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-background-void border border-border-sleek text-text-primary rounded-xl focus:outline-none focus:border-accent-primary/60 transition-all"
                >
                  <option value="xp">Sort by XP</option>
                  <option value="jri">Sort by JRI Readiness</option>
                  <option value="streak">Sort by Streak</option>
                  <option value="name">Sort by Name</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-3 w-3 h-3 text-text-secondary pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table display */}
          {loading ? (
            <div className="py-12 text-center text-xs text-text-secondary animate-pulse">
              Synchronizing Cohort Records...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-text-muted" />
              No matching student records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    <th className="pb-3.5 pl-2">Name & Info</th>
                    <th className="pb-3.5">College & Major</th>
                    <th className="pb-3.5">Level & XP</th>
                    <th className="pb-3.5">Streak</th>
                    <th className="pb-3.5">Job Readiness (JRI)</th>
                    <th className="pb-3.5 pr-2 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-text-secondary">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 pl-2 font-medium text-text-primary">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-bold text-xs text-accent-primary">
                            {student.name ? student.name[0] : 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-text-primary">{student.name}</p>
                            <p className="text-[10px] text-text-muted">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4">
                        <p className="font-medium text-text-primary">{student.profile?.college || 'N/A'}</p>
                        <p className="text-[10px] text-text-muted">{student.profile?.branch || 'N/A'}</p>
                      </td>

                      <td className="py-4">
                        <span className="font-bold text-accent-xp">⭐ Lvl {student.level || 1}</span>
                        <span className="text-[10px] text-text-muted ml-1">({student.xp || 0} XP)</span>
                      </td>

                      <td className="py-4 font-bold text-accent-streak">
                        🔥 {student.streak || 0} Days
                      </td>

                      <td className="py-4 font-bold">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                          (student.jobReadyScore || 0) >= 80 
                            ? 'bg-green-950/20 border border-green-500/20 text-accent-success'
                            : (student.jobReadyScore || 0) >= 50
                              ? 'bg-yellow-950/20 border border-yellow-500/20 text-accent-xp'
                              : 'bg-red-950/20 border border-red-500/20 text-red-400'
                        }`}>
                          {student.jobReadyScore || 0}% Ready
                        </span>
                      </td>

                      <td className="py-4 pr-2 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:text-white rounded-lg text-[10px] font-semibold transition-all"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Drilldown modal inspection */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <GlassCard className="max-w-2xl w-full border-white/10 p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 border border-white/5 text-text-secondary hover:text-white rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal header */}
              <div className="flex items-start gap-4 border-b border-white/5 pb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-white text-xl font-bold font-display shadow-glass-glow">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-text-primary font-display">{selectedStudent.name}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">{selectedStudent.email} • Student ID: {selectedStudent._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary leading-relaxed">
                {/* Details Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Education details</h4>
                    <p className="text-text-primary font-semibold">{selectedStudent.profile?.college || 'N/A'}</p>
                    <p className="text-[11px] text-text-secondary">{selectedStudent.profile?.branch || 'N/A'} {selectedStudent.profile?.gradYear ? `(Class ${selectedStudent.profile.gradYear})` : ''}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1">Biography</h4>
                    <p className="text-[11px] leading-relaxed text-text-primary italic">
                      "{selectedStudent.profile?.bio || 'No biography written by student.'}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1.5">Skills Checklist</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedStudent.profile?.skills && selectedStudent.profile.skills.length > 0 ? (
                        selectedStudent.profile.skills.map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] text-text-primary font-semibold rounded-md">
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-text-muted">No skills listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Section */}
                <div className="space-y-4 bg-white/5 border border-white/5 p-4 rounded-2xl">
                  <div>
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[10px] mb-1.5">Performance index</h4>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl font-black text-accent-primary font-display">{selectedStudent.jobReadyScore || 0}%</div>
                      <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold">Job Readiness</p>
                        <p className="text-[9px] text-accent-xp font-semibold mt-0.5">⭐ Level {selectedStudent.level || 1} ({selectedStudent.xp || 0} XP)</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3.5">
                    <div>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Streak Count</p>
                      <p className="text-sm font-black text-accent-streak mt-0.5">🔥 {selectedStudent.streak || 0} Days</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Coding solved</p>
                      <p className="text-sm font-black text-text-primary mt-0.5">💻 {selectedStudent.codingQuestionsSolved || 0} Solved</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Video time</p>
                      <p className="text-sm font-black text-text-primary mt-0.5">⏱️ {selectedStudent.hoursStudied || 0} Hrs</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-text-muted uppercase tracking-wider font-semibold">Attended</p>
                      <p className="text-sm font-black text-text-primary mt-0.5">📅 {selectedStudent.attendanceCount || 0} Classes</p>
                    </div>
                  </div>

                  {/* Submission Links */}
                  <div className="border-t border-white/5 pt-3.5 space-y-2">
                    <h4 className="font-bold text-text-primary uppercase tracking-wider text-[9px]">Verified recruiter assets</h4>
                    
                    <div className="flex gap-2">
                      {selectedStudent.profile?.githubUrl ? (
                        <a href={selectedStudent.profile.githubUrl} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-text-primary transition-all">
                          <Globe className="w-3 h-3 text-accent-primary" /> GitHub
                        </a>
                      ) : (
                        <span className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-text-muted opacity-50">
                          No GitHub
                        </span>
                      )}

                      {selectedStudent.profile?.linkedinUrl ? (
                        <a href={selectedStudent.profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-text-primary transition-all">
                          <ExternalLink className="w-3 h-3 text-accent-secondary" /> LinkedIn
                        </a>
                      ) : (
                        <span className="flex-1 py-1.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center gap-1.5 text-[10px] text-text-muted opacity-50">
                          No LinkedIn
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Unlocked badges list */}
              <div className="border-t border-white/5 pt-4 space-y-2.5">
                <h4 className="font-bold font-display text-text-primary uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-accent-xp" /> Student Badges ({selectedStudent.badges?.length || 0})
                </h4>
                {selectedStudent.badges && selectedStudent.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {selectedStudent.badges.map((b, i) => (
                      <span key={i} className="px-2.5 py-1.5 bg-white/5 border border-white/5 hover:border-accent-xp/30 rounded-xl text-[10px] font-semibold text-text-primary flex items-center gap-1">
                        <span>{b.icon || '🛡️'}</span>
                        {b.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-text-muted">No badges unlocked yet on the timeline.</p>
                )}
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
