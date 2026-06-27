import supabase from '../config/supabaseClient.js';

// @desc    Get monthly leaderboard standings sorted by XP
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('users')
      .select('id, name, avatar_url, xp, level, streak, job_ready_score')
      .eq('role', 'Student')
      .order('xp', { ascending: false });

    if (error) throw error;
    
    // Map avatar_url and job_ready_score to camelCase for the frontend
    const formattedList = (list || []).map(student => ({
      _id: student.id, // Keeping _id for frontend compatibility if it relies on it
      name: student.name,
      avatarUrl: student.avatar_url || '',
      xp: student.xp || 0,
      level: student.level || 1,
      streak: student.streak || 0,
      jobReadyScore: student.job_ready_score || 0
    }));

    res.status(200).json({
      success: true,
      data: formattedList
    });
  } catch (error) {
    console.error('Get Leaderboard Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
