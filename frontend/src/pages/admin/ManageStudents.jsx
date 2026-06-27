import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/GlassCard';

const ManageStudents = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // id of current item being processed

  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch('/api/admin/pending-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch pending requests');
      }
      setRequests(data.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || (user && user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [token, user, navigate]);

  const handleResolve = async (id, status) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/resolve-request/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update request');
      }
      // Remove resolved request from state list
      setRequests((prev) => prev.filter((r) => r._id !== id));
      alert(`Success: Student application ${status.toLowerCase()} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background-void py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold font-display text-text-primary tracking-tight">
              Recruit Approval Dashboard
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Verify qualifications, check educational links, and admit candidates to Code2Career Academy.
            </p>
          </div>
          <button 
            onClick={fetchRequests}
            className="self-start px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold transition-all active:scale-95"
          >
            🔄 Refresh List
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-sm font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-text-secondary text-sm animate-pulse">
            Retrieving pending student accounts...
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
            <span className="text-4xl">📁</span>
            <h3 className="text-lg font-display font-semibold text-text-primary mt-4">Queue is Clear!</h3>
            <p className="text-sm text-text-secondary mt-1">No pending student registration applications found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {requests.map((req) => (
              <GlassCard key={req._id} className="border border-white/10 flex flex-col lg:flex-row justify-between gap-6 hover:shadow-lg">
                <div className="space-y-4 flex-1">
                  
                  {/* Name and email */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold font-display text-text-primary">{req.name}</h3>
                      <p className="text-xs text-text-secondary mt-0.5">{req.email}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-accent-xp text-[10px] font-bold uppercase tracking-wider">
                      Pending Approval
                    </span>
                  </div>

                  {/* College Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-text-muted">College:</span>
                      <p className="font-semibold text-text-primary mt-0.5">{req.profile?.college || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Branch:</span>
                      <p className="font-semibold text-text-primary mt-0.5">{req.profile?.branch || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Graduation:</span>
                      <p className="font-semibold text-text-primary mt-0.5">{req.profile?.gradYear || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Bio & Skills */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-text-muted">Applicant Bio:</span>
                      <p className="text-text-secondary mt-1 leading-relaxed">{req.profile?.bio || 'No bio provided.'}</p>
                    </div>
                    <div>
                      <span className="text-text-muted">Core Skills:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {req.profile?.skills?.length > 0 ? (
                          req.profile.skills.map((skill, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20 text-accent-primary font-semibold text-[10px]">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted italic">None specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Links */}
                  <div className="flex gap-4 pt-2">
                    {req.profile?.githubUrl && (
                      <a 
                        href={req.profile.githubUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-accent-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        🔗 GitHub Profile
                      </a>
                    )}
                    {req.profile?.linkedinUrl && (
                      <a 
                        href={req.profile.linkedinUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-accent-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        🔗 LinkedIn Profile
                      </a>
                    )}
                  </div>

                </div>

                {/* Approve/Reject CTA */}
                <div className="flex lg:flex-col justify-end gap-3 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6 min-w-[160px]">
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleResolve(req._id, 'Approved')}
                    className="flex-1 py-3 px-4 rounded-xl bg-accent-success/20 border border-accent-success/20 text-accent-success font-display font-bold text-xs hover:bg-accent-success hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {actionLoading === req._id ? 'Admitting...' : '✅ Admit Recruit'}
                  </button>
                  <button
                    disabled={actionLoading !== null}
                    onClick={() => handleResolve(req._id, 'Rejected')}
                    className="flex-1 py-3 px-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 font-display font-semibold text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    ❌ Reject Request
                  </button>
                </div>

              </GlassCard>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageStudents;
