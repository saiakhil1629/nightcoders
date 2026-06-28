import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import StreakFlame from './StreakFlame';

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated || !user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 border-b border-white/5 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center font-display font-black text-lg text-white shadow-glass-glow group-hover:scale-105 transition-all duration-300">
            ⚡
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent group-hover:opacity-90">
            Code2Career <span className="text-accent-primary font-medium text-sm ml-0.5">Academy</span>
          </span>
        </Link>

        {/* Navigation Routes */}
        <div className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          {user.role === 'Student' ? (
            <>
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/dashboard') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/roadmap" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/roadmap') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                90-Day Roadmap
              </Link>
              <Link 
                to="/tasks" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/tasks') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Daily Tasks
              </Link>
              <Link 
                to="/ai-hub" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/ai-hub') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                AI Mentor
              </Link>
              <Link 
                to="/leaderboard" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/leaderboard') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Leaderboard
              </Link>
              <Link 
                to="/profile" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/profile') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/admin/requests" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/admin/requests') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Verify Recruits ({user.role})
              </Link>
              <Link 
                to="/admin/dashboard" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/admin/dashboard') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Analytics
              </Link>
              <Link 
                to="/admin/curriculum" 
                className={`px-4 py-2 rounded-xl transition-all ${isActive('/admin/curriculum') ? 'bg-white/10 text-white border border-white/5' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
              >
                Manage Curriculum
              </Link>
            </>
          )}
        </div>

        {/* Actions & Avatar indicators */}
        <div className="flex items-center gap-4">
          {user.role === 'Student' && (
            <div className="hidden sm:flex items-center gap-3">
              {/* Streaks */}
              <StreakFlame count={user.streak || 0} />
              
              {/* Level indicator */}
              <div className="px-3 py-1.5 rounded-full bg-yellow-950/20 border border-yellow-500/20 text-accent-xp flex items-center gap-1.5 text-xs font-semibold">
                <span>⭐ Level {user.level || 1}</span>
                <span className="text-text-secondary">({user.xp || 0} XP)</span>
              </div>
            </div>
          )}

          {/* User profile dropdown trigger */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-text-primary leading-tight">{user.name}</p>
              <p className="text-[10px] text-text-secondary uppercase tracking-wider">{user.role}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-95"
            >
              Sign Out
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
};

export default Navbar;
