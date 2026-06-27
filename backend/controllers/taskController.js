import supabase from '../config/supabaseClient.js';

// Helper to calculate job readiness score
const calculateReadiness = (user) => {
  const codingWeight = Math.min(30, (user.coding_questions_solved || user.codingQuestionsSolved || 0) * 1.5); // Max 30%
  const levelWeight = Math.min(20, (user.level || 1) * 3); // Max 20%
  const streakWeight = Math.min(15, (user.streak || 0) * 1.5); // Max 15%
  
  // Profile completion: check details
  let profileScore = 5; // Baseline
  const p = user.profile || {};
  if (p.githubUrl) profileScore += 5;
  if (p.linkedinUrl) profileScore += 5;
  if (p.portfolioUrl) profileScore += 5;
  if (p.resumeUrl) profileScore += 5;
  if (p.skills && p.skills.length > 0) profileScore += 5;
  const profileWeight = Math.min(20, profileScore); // Max 20%

  const attendanceWeight = Math.min(15, (user.attendance_count || user.attendanceCount || 0) * 3); // Max 15%

  return Math.min(100, Math.round(codingWeight + levelWeight + streakWeight + profileWeight + attendanceWeight));
};

// @desc    Get task details for a specific day
// @route   GET /api/tasks/day/:dayNumber
// @access  Private/Student
export const getTaskByDay = async (req, res) => {
  try {
    const dayNumber = parseInt(req.params.dayNumber);
    const userId = req.user.id || req.user._id;
    
    const { data: task, error: taskError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('day_number', dayNumber)
      .maybeSingle();

    if (taskError || !task) {
      return res.status(404).json({ success: false, message: `Task for Day ${dayNumber} is not published yet.` });
    }

    const { data: completion } = await supabase
      .from('task_completions')
      .select('*')
      .eq('student_id', userId)
      .eq('day_number', dayNumber)
      .maybeSingle();

    res.status(200).json({
      success: true,
      task: {
        ...task,
        dayNumber: task.day_number,
        studyTopic: task.study_topic,
        videoUrl: task.video_url,
        videoDuration: task.video_duration,
        notesUrl: task.notes_url,
        codingQuestion: task.coding_question,
        aptitudeQuestion: task.aptitude_question,
        reasoningQuestion: task.reasoning_question,
        aiToolTask: task.ai_tool_task
      },
      completion: completion ? {
        ...completion,
        dayNumber: completion.day_number,
        videoWatched: completion.video_watched,
        quizSolved: completion.quiz_solved,
        codingSolved: completion.coding_solved,
        aptitudeSolved: completion.aptitude_solved,
        reasoningSolved: completion.reasoning_solved,
        aiTaskSubmitted: completion.ai_task_submitted,
        aiTaskSubmissionUrl: completion.ai_task_submission_url,
        xpEarned: completion.xp_earned,
        quizScore: completion.quiz_score
      } : {
        dayNumber,
        videoWatched: false,
        quizSolved: false,
        codingSolved: false,
        aptitudeSolved: false,
        reasoningSolved: false,
        aiTaskSubmitted: false,
        xpEarned: 0,
        status: 'Pending'
      }
    });
  } catch (error) {
    console.error('Get Task By Day Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get current student's active day tasks
// @route   GET /api/tasks/today
// @access  Private/Student
export const getTodayTask = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { data: completions } = await supabase
      .from('task_completions')
      .select('day_number')
      .eq('student_id', userId)
      .eq('status', 'Completed');

    let currentDay = 1;
    if (completions && completions.length > 0) {
      const maxCompletedDay = Math.max(...completions.map(c => c.day_number));
      currentDay = maxCompletedDay + 1;
    }

    const { data: task } = await supabase
      .from('daily_tasks')
      .select('id')
      .eq('day_number', currentDay)
      .maybeSingle();

    if (!task) {
      currentDay = Math.max(1, currentDay - 1);
    }

    req.params.dayNumber = currentDay;
    return getTaskByDay(req, res);
  } catch (error) {
    console.error('Get Today Task Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Mark task component completed and award XP
// @route   POST /api/tasks/complete
// @access  Private/Student
export const completeTaskComponent = async (req, res) => {
  try {
    const { dayNumber, component, quizScore, submissionUrl } = req.body;
    const userId = req.user.id || req.user._id;

    if (!dayNumber || !component) {
      return res.status(400).json({ success: false, message: 'Please provide dayNumber and component type' });
    }

    const { data: task, error: taskError } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('day_number', parseInt(dayNumber))
      .maybeSingle();

    if (taskError || !task) {
      return res.status(404).json({ success: false, message: 'Daily task reference not found' });
    }

    let { data: completion } = await supabase
      .from('task_completions')
      .select('*')
      .eq('student_id', userId)
      .eq('day_number', parseInt(dayNumber))
      .maybeSingle();

    if (!completion) {
      const initRecord = {
        student_id: userId,
        day_number: parseInt(dayNumber),
        video_watched: false,
        quiz_solved: false,
        quiz_score: 0,
        coding_solved: false,
        aptitude_solved: false,
        reasoning_solved: false,
        ai_task_submitted: false,
        xp_earned: 0,
        status: 'Pending'
      };
      
      const { data: newCompletion, error: insertError } = await supabase
        .from('task_completions')
        .insert([initRecord])
        .select()
        .single();
        
      if (insertError) throw insertError;
      completion = newCompletion;
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    let xpGained = 0;
    
    let updates = {
      user: {
        hours_studied: user.hours_studied || 0,
        coding_questions_solved: user.coding_questions_solved || 0
      },
      completion: { ...completion }
    };

    if (component === 'video' && !completion.video_watched) {
      updates.completion.video_watched = true;
      xpGained += 25;
      updates.user.hours_studied += parseFloat(((task.video_duration || 0) / 60).toFixed(1));
    } else if (component === 'coding' && !completion.coding_solved) {
      updates.completion.coding_solved = true;
      xpGained += 40;
      updates.user.coding_questions_solved += 1;
    } else if (component === 'quiz' && !completion.quiz_solved) {
      updates.completion.quiz_solved = true;
      updates.completion.quiz_score = quizScore || 100;
      xpGained += 20;
    } else if (component === 'aptitude' && !completion.aptitude_solved) {
      updates.completion.aptitude_solved = true;
      xpGained += 15;
    } else if (component === 'reasoning' && !completion.reasoning_solved) {
      updates.completion.reasoning_solved = true;
      xpGained += 15;
    } else if (component === 'aiTask' && !completion.ai_task_submitted) {
      updates.completion.ai_task_submitted = true;
      updates.completion.ai_task_submission_url = submissionUrl || '';
      xpGained += 35;
    }

    if (xpGained > 0) {
      updates.completion.xp_earned = (completion.xp_earned || 0) + xpGained;
      user.xp = (user.xp || 0) + xpGained;

      const isDailyComplete = 
        updates.completion.video_watched && 
        updates.completion.coding_solved && 
        updates.completion.aptitude_solved && 
        updates.completion.reasoning_solved && 
        updates.completion.ai_task_submitted;

      if (isDailyComplete && updates.completion.status !== 'Completed') {
        updates.completion.status = 'Completed';
        updates.completion.xp_earned += 50;
        user.xp += 50;
        xpGained += 50; 
      }

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

      user.job_ready_score = calculateReadiness(user);

      await supabase.from('task_completions').update(updates.completion).eq('id', completion.id);
      
      await supabase.from('users').update({
        xp: user.xp,
        level: user.level,
        badges: user.badges,
        job_ready_score: user.job_ready_score,
        hours_studied: updates.user.hours_studied,
        coding_questions_solved: updates.user.coding_questions_solved
      }).eq('id', user.id);
    }

    res.status(200).json({
      success: true,
      xpGained,
      user: {
        xp: user.xp,
        level: user.level,
        codingQuestionsSolved: updates.user.coding_questions_solved,
        hoursStudied: updates.user.hours_studied,
        jobReadyScore: user.job_ready_score,
        badges: user.badges
      },
      completion: {
        ...updates.completion,
        dayNumber: updates.completion.day_number,
        videoWatched: updates.completion.video_watched,
        quizSolved: updates.completion.quiz_solved,
        codingSolved: updates.completion.coding_solved,
        aptitudeSolved: updates.completion.aptitude_solved,
        reasoningSolved: updates.completion.reasoning_solved,
        aiTaskSubmitted: updates.completion.ai_task_submitted,
        aiTaskSubmissionUrl: updates.completion.ai_task_submission_url,
        xpEarned: updates.completion.xp_earned,
        quizScore: updates.completion.quiz_score
      }
    });
  } catch (error) {
    console.error('Complete Task Component Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get lightweight curriculum roadmap and student completions
// @route   GET /api/tasks/roadmap
// @access  Private/Student
export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const { data: tasks } = await supabase
      .from('daily_tasks')
      .select('day_number, month, study_topic')
      .order('day_number', { ascending: true });

    const { data: completions } = await supabase
      .from('task_completions')
      .select('day_number, status, xp_earned')
      .eq('student_id', userId);

    res.status(200).json({
      success: true,
      tasks: (tasks || []).map(t => ({ dayNumber: t.day_number, month: t.month, studyTopic: t.study_topic })),
      completions: (completions || []).map(c => ({ dayNumber: c.day_number, status: c.status, xpEarned: c.xp_earned }))
    });
  } catch (error) {
    console.error('Get Roadmap Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
