import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import GlassCard from '../components/GlassCard';
import { Trophy, Flame, Target, Star, Crown } from 'lucide-react';

const Leaderboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/leaderboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve standings');
      }
      setStandings(data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLeaderboard();
    }
  }, [token]);

  if (!user) return null;

  // Separate top 3 podium candidates from remainder list
  const podiums = standings.slice(0, 3);
  // Re-order podiums visually as: [2nd, 1st, 3rd] for standard podium layout
  const visualPodiums = [];
  if (podiums[1]) visualPodiums.push({ ...podiums[1], rank: 2 });
  if (podiums[0]) visualPodiums.push({ ...podiums[0], rank: 1 });
  if (podiums[2]) visualPodiums.push({ ...podiums[2], rank: 3 });

  const remainder = standings.slice(3);

  // Find active student rank
  const activeStudentIndex = standings.findIndex((s) => s._id === user._id);
  const activeStudentRank = activeStudentIndex !== -1 ? activeStudentIndex + 1 : 'N/A';

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-text-primary flex items-center gap-2">
              <Trophy className="text-accent-xp" /> Cohort Leaderboard
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Monthly rankings based on completed daily tasks, solved coding questions, and check-in streaks. Resets on July 1st.
            </p>
          </div>
          
          {/* User's Current Rank Card */}
          <div className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-accent-primary/15 border border-accent-primary/20 flex items-center gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider leading-none">Your Rank</p>
              <p className="font-display font-extrabold text-sm text-text-primary mt-0.5">#{activeStudentRank} in Cohort</p>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-text-secondary text-sm animate-pulse">
            Retrieving global cohort standings...
          </div>
        ) : standings.length === 0 ? (
          <div className="text-center py-16 text-xs text-text-muted italic">
            No students found in cohort yet.
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Top 3 Podium visual block */}
            {podiums.length > 0 && (
              <div className="flex flex-col sm:flex-row items-end justify-center gap-6 sm:gap-4 pt-12 pb-6 max-w-2xl mx-auto">
                
                {/* Visual Order loop: [2nd, 1st, 3rd] */}
                {visualPodiums.map((runner) => {
                  const isFirst = runner.rank === 1;
                  const borderGlow = 
                    runner.rank === 1 ? 'border-yellow-500/40 shadow-xp-glow bg-yellow-500/5' :
                    runner.rank === 2 ? 'border-slate-300/30 bg-slate-300/5' : 'border-amber-700/20 bg-amber-700/5';
                  
                  return (
                    <div 
                      key={runner._id} 
                      className={`flex flex-col items-center w-full sm:w-1/3 p-5 rounded-2xl border ${borderGlow} relative ${
                        isFirst ? 'sm:order-2 order-1 sm:-translate-y-4 shadow-lg scale-105 z-10' : 
                        runner.rank === 2 ? 'sm:order-1 order-2' : 'sm:order-3 order-3'
                      }`}
                    >
                      {/* Crown on 1st Place */}
                      {isFirst && (
                        <Crown className="w-6 h-6 text-accent-xp absolute -top-4.5 animate-bounce fill-current" />
                      )}
                      
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-background-card to-background-cardMuted border border-white/10 flex items-center justify-center text-2xl font-black relative shadow-inner">
                        {runner.rank === 1 ? '🥇' : runner.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      
                      <h3 className="font-display font-bold text-text-primary text-sm mt-3 text-center truncate w-full">
                        {runner.name}
                        {runner._id === user._id && <span className="text-[9px] text-accent-primary ml-1 block">(You)</span>}
                      </h3>
                      
                      <p className="text-[10px] text-text-secondary mt-0.5">Level {runner.level}</p>

                      <div className="mt-4 flex items-center gap-1 text-accent-xp font-display font-extrabold text-sm">
                        <Star className="w-4 h-4 fill-current" /> {runner.xp} <span className="text-[10px] text-text-secondary font-medium">XP</span>
                      </div>

                      <div className="flex gap-3 mt-3 pt-3 border-t border-white/5 w-full text-center justify-center text-[10px] text-text-secondary">
                        <div className="flex items-center gap-0.5" title="Streak">
                          <Flame className="w-3.5 h-3.5 text-accent-streak fill-current" /> {runner.streak}d
                        </div>
                        <div className="flex items-center gap-0.5" title="Readiness">
                          <Target className="w-3.5 h-3.5 text-accent-primary" /> {runner.jobReadyScore}%
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            )}

            {/* Ranks 4 and below table list */}
            {remainder.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest pl-1">Standings</h3>
                <div className="space-y-2">
                  {remainder.map((row, index) => {
                    const rankNum = index + 4;
                    const isSelf = row._id === user._id;
                    
                    return (
                      <div 
                        key={row._id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          isSelf ? 'bg-accent-primary/10 border-accent-primary/30 shadow-glass-glow' : 'bg-background-card/50 border-white/5 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="font-display font-bold text-xs text-text-muted w-5 text-right">#{rankNum}</span>
                          <div>
                            <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                              {row.name}
                              {isSelf && <span className="text-[8px] bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded font-bold uppercase">YOU</span>}
                            </h4>
                            <p className="text-[10px] text-text-secondary mt-0.5">Level {row.level || 1} • {row.jobReadyScore || 0}% Job Ready</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs">
                          <div className="flex items-center gap-1 text-text-secondary" title="Streak">
                            <Flame className="w-3.5 h-3.5 text-accent-streak" />
                            <span className="font-semibold">{row.streak || 0}d</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-accent-xp font-display font-bold" title="Total Experience Points">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{row.xp || 0} XP</span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;
