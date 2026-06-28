import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserSuccess, authFailed, setLoading } from './store/slices/authSlice';

// Global Layout
import Navbar from './components/Navbar';

// Page Imports
import Login from './pages/Login';
import RegisterRequest from './pages/RegisterRequest';
import Dashboard from './pages/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import Roadmap from './pages/Roadmap';
import Leaderboard from './pages/Leaderboard';
import DailyTasks from './pages/DailyTasks';
import AIHub from './pages/AIHub';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTasks from './pages/admin/ManageTasks';

const App = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('c2c_token');
    
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          dispatch(loadUserSuccess(data.user));
        } else {
          dispatch(authFailed());
          navigate('/login');
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        dispatch(authFailed());
      }
    };

    verifyToken();
  }, [dispatch]);

  // Protected Route Guards
  const StudentRoute = ({ children }) => {
    if (loading) return <div className="p-8 text-center text-sm animate-pulse">Synchronizing Session...</div>;
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (user.role !== 'Student') return <Navigate to="/admin/requests" replace />;
    return children;
  };

  const AdminRoute = ({ children }) => {
    if (loading) return <div className="p-8 text-center text-sm animate-pulse">Synchronizing Session...</div>;
    if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <div className="min-h-screen bg-background-void flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-7xl mx-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register-request" element={<RegisterRequest />} />

          {/* Student Protected Routes */}
          <Route path="/" element={<StudentRoute><Dashboard /></StudentRoute>} />
          <Route path="/dashboard" element={<StudentRoute><Dashboard /></StudentRoute>} />
          <Route path="/roadmap" element={<StudentRoute><Roadmap /></StudentRoute>} />
          <Route path="/tasks" element={<StudentRoute><DailyTasks /></StudentRoute>} />
          <Route path="/ai-hub" element={<StudentRoute><AIHub /></StudentRoute>} />
          <Route path="/leaderboard" element={<StudentRoute><Leaderboard /></StudentRoute>} />
          <Route path="/profile" element={<StudentRoute><Profile /></StudentRoute>} />

          {/* Admin Protected Routes */}
          <Route path="/admin/requests" element={<AdminRoute><ManageStudents /></AdminRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/curriculum" element={<AdminRoute><ManageTasks /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
