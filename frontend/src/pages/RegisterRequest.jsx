import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const RegisterRequest = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    gradYear: '2027',
    bio: '',
    skills: '',
    githubUrl: '',
    linkedinUrl: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      setSuccessMsg(data.message || 'Onboarding request submitted! Waiting for Admin verification.');
      // Auto redirect to login after 3.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit registration request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background-void">
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-secondary/10 rounded-full blur-[100px] pointer-events-none animate-glow"></div>

      <div className="max-w-xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:border-accent-primary/40 text-text-primary text-xl font-bold transition-all mb-4">
            ⬅️
          </Link>
          <h2 className="text-3xl font-extrabold font-display text-text-primary tracking-tight">
            Apply to Code2Career Academy
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Fill in your educational profile. Access is granted to verified candidates.
          </p>
        </div>

        <GlassCard className="border border-white/10 shadow-2xl">
          {successMsg ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center text-3xl mx-auto">
                🎉
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary">Application Submitted!</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                {successMsg}
              </p>
              <div className="text-xs text-accent-primary animate-pulse font-medium">
                Redirecting you to Login page shortly...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* General details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Choose a secure password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>

              {/* Education details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">College Name</label>
                  <input
                    type="text"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="e.g. VIT University"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Grad Year</label>
                  <select
                    name="gradYear"
                    value={formData.gradYear}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    <option value="2029">2029</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Branch/Major</label>
                  <input
                    type="text"
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Key Skills (Comma Separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="Python, JS, SQL, CSS"
                  />
                </div>
              </div>

              {/* Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">GitHub Profile URL</label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Short Bio / Ambition</label>
                <textarea
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2 block w-full px-4 py-2.5 rounded-xl bg-background-void border border-border-sleek text-text-primary focus:outline-none focus:border-accent-primary/60 transition-all text-sm resize-none"
                  placeholder="Tell us what you want to achieve in the next 90 days..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white font-display font-bold text-sm tracking-wide shadow-glass-glow transition-all active:scale-98 disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Recruits Application ⚡'}
                </button>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

export default RegisterRequest;
