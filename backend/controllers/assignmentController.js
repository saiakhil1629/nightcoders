import supabase from '../config/supabaseClient.js';

// @desc    Submit student assignment (handles PDF uploads, github links)
// @route   POST /api/assignments/submit
// @access  Private/Student
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, githubUrl, portfolioUrl, resumeUrl } = req.body;
    const userId = req.user.id || req.user._id;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: 'Please specify the assignmentId' });
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select('id')
      .eq('id', assignmentId)
      .maybeSingle();

    if (assignmentError || !assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissionData = {
      assignment_id: assignmentId,
      student_id: userId,
      file_url: fileUrl,
      github_url: githubUrl || '',
      portfolio_url: portfolioUrl || '',
      resume_url: resumeUrl || '',
      status: 'Submitted',
      submitted_at: new Date().toISOString()
    };

    // Upsert submission
    const { data: submission, error: submissionError } = await supabase
      .from('assignment_submissions')
      .upsert(submissionData, { onConflict: 'assignment_id,student_id' })
      .select()
      .single();

    if (submissionError) throw submissionError;

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    user.xp = (user.xp || 0) + 50;
      
    const calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > (user.level || 1)) {
      user.level = calculatedLevel;
      user.badges = user.badges || [];
      user.badges.push({
        name: `Level ${calculatedLevel} Explorer`,
        icon: '⭐',
        description: `Reached Level ${calculatedLevel} on the path to career ready.`,
        unlockedAt: new Date().toISOString()
      });
    }

    await supabase.from('users').update({
      xp: user.xp,
      level: user.level,
      badges: user.badges
    }).eq('id', userId);

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully! Earned +50 XP.',
      xpGained: 50,
      user: {
        xp: user.xp,
        level: user.level,
        badges: user.badges
      },
      submission: {
        ...submissionData,
        studentId: submissionData.student_id,
        fileUrl: submissionData.file_url,
        githubUrl: submissionData.github_url,
        portfolioUrl: submissionData.portfolio_url,
        resumeUrl: submissionData.resume_url
      }
    });

  } catch (error) {
    console.error('Submit Assignment Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('assignments')
      .select(`
        *,
        submissions:assignment_submissions(student_id, file_url, github_url, portfolio_url, resume_url, status, grade, score, feedback)
      `)
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    const formattedList = (list || []).map(a => ({
      _id: a.id,
      title: a.title,
      description: a.description,
      dueDate: a.due_date,
      xpReward: a.xp_reward,
      submissions: (a.submissions || []).map(s => ({
        studentId: s.student_id,
        fileUrl: s.file_url,
        githubUrl: s.github_url,
        portfolioUrl: s.portfolio_url,
        resumeUrl: s.resume_url,
        status: s.status,
        grade: s.grade,
        score: s.score,
        feedback: s.feedback
      }))
    }));

    res.status(200).json({ success: true, data: formattedList });
  } catch (error) {
    console.error('Get Assignments Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

