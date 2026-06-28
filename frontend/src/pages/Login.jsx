import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginSuccess, authFailed, setLoading } from '../store/slices/authSlice';
import GlassCard from '../components/GlassCard';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        navigate('/admin/requests');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoginLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const errorText = await response.text();
        console.error("Non-JSON response:", errorText);
        throw new Error("Server connection failed. Please ensure the backend is running.");
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      dispatch(loginSuccess({ token: data.token, user: data.user }));
      
      // Flash temporary welcome alert
      if (data.xpGained > 0) {
        alert(`🔥 Streak maintained! You earned +${data.xpGained} XP for today's check-in!`);
      }

      if (data.user.role === 'Admin' || data.user.role === 'SuperAdmin') {
        navigate('/admin/requests');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setLocalError(err.message || 'Server connection failed');
      dispatch(authFailed(err.message));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAutofill = (role) => {
    if (role === 'admin') {
      setEmail('admin@code2career.com');
      setPassword('admin12345');
    } else if (role === 'student') {
      setEmail('alex@career.com');
      setPassword('alex12345');
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-background-void">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[120px] pointer-events-none animate-glow"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-primary to-accent-secondary text-white font-display font-black text-2xl shadow-glass-glow mb-4">
          ⚡
        </div>
        <h2 className="text-3xl font-extrabold font-display text-text-primary tracking-tight">
          Code2Career Academy
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Become job-ready in 90 days. Built for off-campus software jobs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <GlassCard className="border border-white/10 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {localError && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                ⚠️ {localError}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full px-4 py-3 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full px-4 py-3 rounded-xl bg-background-void border border-border-sleek text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full flex justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white font-display font-bold text-sm tracking-wide shadow-glass-glow transition-all active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loginLoading ? 'Authenticating Recruits...' : 'Sign Into Dashboard 🚀'}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-3">
            <div className="text-center text-xs text-text-secondary">
              Don't have credentials?{' '}
              <Link to="/register-request" className="text-accent-primary hover:underline font-semibold">
                Submit an onboarding request
              </Link>
            </div>
            

          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
