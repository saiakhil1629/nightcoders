import jwt from 'jsonwebtoken';
import supabase from '../config/supabaseClient.js';
import bcrypt from 'bcryptjs';

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_code2career_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Request account creation (Student Onboarding)
// @route   POST /api/auth/request-access
// @access  Public
export const requestAccess = async (req, res) => {
  try {
    const { name, email, password, college, branch, gradYear, bio, skills, githubUrl, linkedinUrl } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profileData = {
      college: college || '',
      branch: branch || '',
      gradYear: gradYear ? parseInt(gradYear) : null,
      bio: bio || '',
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      githubUrl: githubUrl || '',
      linkedinUrl: linkedinUrl || '',
      portfolioUrl: '',
      resumeUrl: ''
    };

    const { error } = await supabase.from('users').insert([{
      name,
      email,
      password: hashedPassword,
      role: 'Student',
      status: 'Pending',
      profile: profileData,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      job_ready_score: 0,
      coding_questions_solved: 0,
      hours_studied: 0,
      attendance_count: 0
    }]);

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Access request submitted successfully. An administrator will review your application.'
    });
  } catch (error) {
    console.error('Request Access Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Log in user & update daily streak/XP
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check account status
    if (user.role === 'Student' && user.status !== 'Approved') {
      return res.status(403).json({ 
        success: false, 
        message: `Your account registration status is: ${user.status}. Please wait for admin approval.` 
      });
    }

    // Update Daily Streak & Daily Login XP
    const now = new Date();
    let xpGained = 0;
    
    let newStreak = user.streak || 0;
    let newXp = user.xp || 0;
    let newLastLogin = user.last_login_date;
    
    if (!user.last_login_date) {
      newStreak = 1;
      newXp += 15;
      xpGained = 15;
      newLastLogin = now.toISOString();
    } else {
      const lastLogin = new Date(user.last_login_date);
      const lastLoginMidnight = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = Math.abs(nowMidnight - lastLoginMidnight);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        newXp += 15;
        xpGained = 15;
        newLastLogin = now.toISOString();
      } else if (diffDays > 1) {
        newStreak = 1;
        newXp += 15;
        xpGained = 15;
        newLastLogin = now.toISOString();
      }
    }

    let newLevel = user.level || 1;
    let badges = user.badges || [];
    if (xpGained > 0) {
      const calculatedLevel = Math.floor(newXp / 100) + 1;
      if (calculatedLevel > newLevel) {
        newLevel = calculatedLevel;
        badges.push({
          name: `Level ${calculatedLevel} Explorer`,
          icon: '⭐',
          description: `Reached Level ${calculatedLevel} on the path to career ready.`,
          unlockedAt: new Date().toISOString()
        });
      }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        streak: newStreak,
        xp: newXp,
        last_login_date: newLastLogin,
        level: newLevel,
        badges: badges
      })
      .eq('id', user.id);

    if (updateError) throw updateError;
    
    // Update local user object to send back
    user.streak = newStreak;
    user.xp = newXp;
    user.level = newLevel;
    user.badges = badges;

    user.password = undefined;

    res.status(200).json({
      success: true,
      token: generateToken(user.id),
      user,
      xpGained,
      streak: user.streak
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.password = undefined;
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Update current user profile info
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { college, branch, gradYear, bio, skills, githubUrl, linkedinUrl, portfolioUrl } = req.body;
    const userId = req.user.id || req.user._id;

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = user.profile || {};
    
    if (college !== undefined) profile.college = college;
    if (branch !== undefined) profile.branch = branch;
    if (gradYear !== undefined) profile.gradYear = gradYear ? parseInt(gradYear) : null;
    if (bio !== undefined) profile.bio = bio;
    if (skills !== undefined) {
      profile.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (githubUrl !== undefined) profile.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;

    let completenessScore = 0;
    if (profile.githubUrl) completenessScore += 5;
    if (profile.linkedinUrl) completenessScore += 5;
    if (profile.resumeUrl) completenessScore += 5;
    if (profile.portfolioUrl) completenessScore += 5;

    const codingScore = Math.min(30, (user.coding_questions_solved || user.codingQuestionsSolved || 0) * 3);
    const quizScore = 20; 
    const streakScore = Math.min(15, (user.streak || 0) * 3);
    const mockInterviewScore = profile.resumeUrl ? 15 : 0;

    const jobReadyScore = Math.min(100, codingScore + quizScore + streakScore + completenessScore + mockInterviewScore);

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        profile: profile,
        job_ready_score: jobReadyScore
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    if (updatedUser.password) {
      updatedUser.password = undefined;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
