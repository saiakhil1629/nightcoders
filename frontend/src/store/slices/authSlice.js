import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('c2c_token');

const initialState = {
  token: token || null,
  isAuthenticated: !!token,
  user: null, // User details
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      localStorage.setItem('c2c_token', action.payload.token);
    },
    loadUserSuccess: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    authFailed: (state, action) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload || 'Authentication Failed';
      localStorage.removeItem('c2c_token');
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('c2c_token');
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateUserXP: (state, action) => {
      if (state.user) {
        state.user.xp = action.payload.xp;
        state.user.level = action.payload.level;
        state.user.streak = action.payload.streak;
        state.user.jobReadyScore = action.payload.jobReadyScore;
      }
    }
  },
});

export const { loginSuccess, loadUserSuccess, authFailed, logout, setLoading, updateUserXP } = authSlice.actions;
export default authSlice.reducer;
