import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { Map, Lock, CheckCircle2, ChevronRight, Award, Compass } from 'lucide-react';

const Roadmap = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const navigate = useNavigate();

  const fetchRoadmap = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/tasks/roadmap', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve curriculum map');
      }
      setTasks(data.tasks);
      setCompletions(data.completions);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRoadmap();
    }
  }, [token]);

  // Determine current day student is working on
  const getCurrentDay = () => {
    const completedDays = completions
      .filter(c => c.status === 'Completed')
      .map(c => c.dayNumber);
    if (completedDays.length === 0) return 1;
    return Math.max(...completedDays) + 1;
  };

  const currentDayNumber = getCurrentDay();

  // Group tasks by week helper
  const getWeeks = () => {
    const weeks = {};
    for (let i = 1; i <= 13; i++) {
      weeks[i] = [];
    }
    tasks.forEach(t => {
      const weekNum = Math.ceil(t.dayNumber / 7);
      if (weekNum <= 13) {
        weeks[weekNum].push(t);
      }
    });
    return weeks;
  };

  const weeksData = getWeeks();

  const getWeekStatus = (weekNum) => {
    const startDay = (weekNum - 1) * 7 + 1;
    const endDay = weekNum * 7;
    
    // If all tasks in this week are completed
    const weekCompletions = completions.filter(c => c.dayNumber >= startDay && c.dayNumber <= endDay && c.status === 'Completed');
    if (weekCompletions.length === 7) return 'Completed';
    
    // If current student active day lies in this week range
    if (currentDayNumber >= startDay && currentDayNumber <= endDay) return 'Active';
    
    // If future week
    if (startDay > currentDayNumber) return 'Locked';
    
    return 'InProgress';
  };

  const getDayStatus = (dayNum) => {
    const comp = completions.find(c => c.dayNumber === dayNum);
    if (comp?.status === 'Completed') return 'Completed';
    if (dayNum === currentDayNumber) return 'Active';
    if (dayNum > currentDayNumber) return 'Locked';
    return 'InProgress';
  };

  const handleDayClick = (dayNum, status) => {
    if (status === 'Locked') {
      alert('🔒 This daily blueprint is locked. Complete previous days to unlock the path!');
      return;
    }
    navigate(`/dashboard?day=${dayNum}`);
  };

  const getMonthName = (monthNum) => {
    if (monthNum === 1) return 'Month 1: Foundation (Python & Git)';
    if (monthNum === 2) return 'Month 2: Core (DSA & Aptitude)';
    return 'Month 3: Placement (Adv DSA, Resume, Mock Prep)';
  };

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl font-extrabold font-display text-text-primary flex items-center gap-2.5">
            <Compass className="text-accent-primary animate-spin" style={{ animationDuration: '8s' }} /> 90-Day Tech Job Roadmap
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Visual curriculum path to master programming, data structures, aptitude, and land engineering job offers.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-text-secondary text-sm animate-pulse">
            Assembling curriculum timeline...
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Loop through Months */}
            {[1, 2, 3].map((monthNum) => {
              const monthWeeks = monthNum === 1 ? [1, 2, 3, 4] : monthNum === 2 ? [5, 6, 7, 8] : [9, 10, 11, 12, 13];
              
              return (
                <div key={monthNum} className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-white/10 flex-1"></div>
                    <h2 className="text-lg font-black font-display text-accent-xp uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-white/5">
                      {getMonthName(monthNum)}
                    </h2>
                    <div className="h-px bg-white/10 flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {monthWeeks.map((weekNum) => {
                      const status = getWeekStatus(weekNum);
                      const weekDays = weeksData[weekNum] || [];
                      
                      return (
                        <GlassCard 
                          key={weekNum} 
                          className={`border-white/5 space-y-4 transition-all duration-300 ${
                            status === 'Locked' ? 'opacity-50 border-transparent bg-white/[0.01]' : 
                            status === 'Active' ? 'border-accent-primary/40 shadow-glass-glow' : 'border-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div>
                              <h3 className="font-bold font-display text-text-primary text-sm flex items-center gap-1.5">
                                Week {weekNum} Challenge
                                {status === 'Completed' && <span className="text-[9px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">WEEK CLEAR</span>}
                                {status === 'Active' && <span className="text-[9px] bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full font-bold animate-pulse">ACTIVE</span>}
                              </h3>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                {weekNum === 1 ? 'Variables, Loops, Basics' : 
                                 weekNum === 2 ? 'OOP & File Systems' : 
                                 weekNum === 5 ? 'Linear DSA Arrays' : 
                                 weekNum === 9 ? 'Advanced Trees & Graphs' : 'Curriculum Blueprint'}
                              </p>
                            </div>
                            
                            {status === 'Locked' ? (
                              <Lock className="w-4 h-4 text-text-muted" />
                            ) : (
                              <Award className={`w-4 h-4 ${status === 'Completed' ? 'text-accent-xp' : 'text-text-secondary'}`} />
                            )}
                          </div>

                          {/* Days Grid in Week */}
                          <div className="grid grid-cols-1 gap-2.5">
                            {weekDays.length > 0 ? (
                              weekDays.map((day) => {
                                const dayStatus = getDayStatus(day.dayNumber);
                                
                                return (
                                  <div 
                                    key={day._id}
                                    onClick={() => handleDayClick(day.dayNumber, dayStatus)}
                                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                                      dayStatus === 'Locked' ? 'bg-black/10 border-transparent text-text-muted hover:border-transparent' :
                                      dayStatus === 'Active' ? 'bg-accent-primary/10 border-accent-primary/30 text-white font-bold hover:bg-accent-primary/20' :
                                      dayStatus === 'Completed' ? 'bg-green-500/5 border-green-500/10 text-text-secondary hover:bg-green-500/10 hover:text-white' :
                                      'bg-white/5 border-white/5 text-text-primary hover:bg-white/10'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-display font-bold w-5 text-right">D{day.dayNumber}</span>
                                      <span className="truncate max-w-[180px]">{day.studyTopic}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                      {dayStatus === 'Completed' && <CheckCircle2 className="w-4 h-4 text-accent-success" />}
                                      {dayStatus === 'Active' && <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping"></span>}
                                      {dayStatus === 'Locked' && <Lock className="w-3.5 h-3.5 text-text-muted" />}
                                      <ChevronRight className="w-3 h-3 text-text-muted" />
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-4 text-[10px] text-text-muted italic">
                                Days to be scheduled by instructor.
                              </div>
                            )}
                          </div>

                        </GlassCard>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default Roadmap;
