import supabase from '../config/supabaseClient.js';

// @desc    Get all pending student registration requests
// @route   GET /api/admin/pending-requests
// @access  Private/Admin
export const getPendingRequests = async (req, res) => {
  try {
    const { data: pendingStudents, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, profile, xp, level, created_at')
      .eq('role', 'Student')
      .eq('status', 'Pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data: pendingStudents });
  } catch (error) {
    console.error('Get Pending Requests Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Approve/Reject student registration request
// @route   POST /api/admin/resolve-request/:id
// @access  Private/Admin
export const resolveRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const studentId = req.params.id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update. Must be Approved or Rejected' });
    }

    const { data: student, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (fetchError || !student) {
      return res.status(404).json({ success: false, message: 'Student request not found' });
    }

    if (student.role !== 'Student') {
      return res.status(400).json({ success: false, message: 'This user is not a Student role' });
    }

    let updates = { status: status };
    
    // If approved, give them initial welcome badges or points
    if (status === 'Approved' && (student.xp === 0 || !student.xp)) {
      updates.xp = 50; // Welcome XP
      
      const badges = student.badges || [];
      badges.push({
        name: 'Academy Recruit',
        icon: '🛡️',
        description: 'Successfully accepted into Code2Career Academy. The 90-day grind begins.',
        unlockedAt: new Date().toISOString()
      });
      updates.badges = badges;
      updates.job_ready_score = 10; // Starting baseline
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', studentId)
      .select('id, name, email, status')
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: `Student account has been ${status.toLowerCase()}`,
      data: updatedStudent
    });
  } catch (error) {
    console.error('Resolve Request Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all students list
// @route   GET /api/admin/students
// @access  Private/Admin
export const getStudentsList = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, profile, xp, level, created_at, streak, job_ready_score')
      .eq('role', 'Student')
      .order('xp', { ascending: false });

    if (error) throw error;

    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error('Get Students List Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

