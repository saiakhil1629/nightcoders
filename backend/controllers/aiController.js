import supabase from '../config/supabaseClient.js';

// Helper to make direct REST call to Gemini API
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey.startsWith('mock_')) {
    console.warn('⚠️ No active Gemini API Key. Triggering local mock AI response...');
    return getMockAiResponse(prompt);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    if (!response.ok || !data.candidates || data.candidates.length === 0) {
      throw new Error(data.error?.message || 'Failed call to Gemini engine');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    console.error('Gemini API Error:', err);
    return `⚠️ AI service is temporarily offline. Fallback suggestions:
- Focus on building clean Python OOP structures.
- Keep algorithms to O(N log N) sorting limits.
- Optimize your LinkedIn summary with keywords like Python, DSA, and Git.`;
  }
};

// Fallback mock AI helper
const getMockAiResponse = (prompt) => {
  const p = prompt.toLowerCase();
  if (p.includes('resume')) {
    return `### 📋 AI Resume Audit Report
- **Strengths**: Your profile lists strong fundamental Python programming skills.
- **Weaknesses**: Missing direct deployment links (e.g. Vercel, Render) and detailed descriptions of algorithms.
- **Key Recommendations**:
  1. Add a dedicated section for "Data Structures & Algorithms" highlighting problem-solving consistency.
  2. Structure project descriptions with the STAR methodology (Situation, Task, Action, Result).
  3. Include GitHub repositories for all core projects.
- **Overall Score**: **74 / 100**`;
  }
  if (p.includes('portfolio')) {
    return `### 🌐 AI Portfolio Audit Report
- **Structure & Layout**: Clean, but needs premium dark themes (e.g. glassmorphism).
- **Project Showcase**: Ensure you embed animated screenshots and links to live demos.
- **Action Items**:
  1. Add a visual roadmap/timeline of your 90-day tech journey.
  2. Embed GitHub badges showing solved issues.
  3. Keep contact links in a clean sticky navigation footer.
- **Overall Score**: **78 / 100**`;
  }
  return `Hello there! I am your AI Career Coach. Let's start our mock interview. 
Question: "Explain the difference between a List and a Tuple in Python, and describe when you would prefer to use one over the other."`;
};

// @desc    Analyze student resume profile details
// @route   POST /api/ai/resume-review
// @access  Private/Student
export const auditResume = async (req, res) => {
  try {
    const student = req.user;
    const userId = student.id || student._id;
    
    // Construct rich prompt using student educational details
    const prompt = `
      Act as an elite technical recruiter and resume reviewer at a top tier software firm.
      Review this student profile and generate a comprehensive resume audit report:
      
      Candidate Name: ${student.name}
      College: ${student.profile?.college || 'N/A'}
      Branch/Major: ${student.profile?.branch || 'N/A'}
      Skills: ${student.profile?.skills?.join(', ') || 'Python, Git'}
      Bio: ${student.profile?.bio || 'Student at Academy'}
      Streaks: ${student.streak} Days Consistency
      Coding solved: ${student.coding_questions_solved || student.codingQuestionsSolved} Problems
      
      Generate the report in Markdown format. Address the following:
      1. Overall Resume Score out of 100 (in bold format like **Score: X/100**).
      2. Strengths of their technical stack and details.
      3. Weaknesses/Gaps that need correction.
      4. Actionable recommendations (e.g. what Python/DSA projects or GitHub details they should add).
      
      Keep feedback highly professional, encouraging, and critical.
    `;

    const report = await callGemini(prompt);
    
    // Parse score from output text if possible
    let score = 75; // Default fallback
    const scoreMatch = report.match(/Score:\s*(\d+)/i) || report.match(/\*\*(\d+)\s*\/\s*100\*\*/);
    if (scoreMatch) {
      score = parseInt(scoreMatch[1]);
    }

    // Fetch up-to-date user from Supabase
    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    let profile = dbUser.profile || {};
    profile.resumeUrl = 'submitted'; // Mark uploaded
    
    let newScore = Math.min(100, (dbUser.job_ready_score || 10) + 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile,
        job_ready_score: newScore
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({ 
      success: true, 
      report, 
      score,
      jobReadyScore: newScore
    });
  } catch (error) {
    console.error('Audit Resume Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Analyze student portfolio website
// @route   POST /api/ai/portfolio-review
// @access  Private/Student
export const auditPortfolio = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide your portfolio website URL' });
    }

    const student = req.user;
    const userId = student.id || student._id;

    const prompt = `
      Act as a senior front-end UI/UX architect and creative director.
      Review the student portfolio link: ${url}
      Student Skills: ${student.profile?.skills?.join(', ') || 'Python, Front-end'}
      
      Generate a portfolio critique report in Markdown:
      1. Overall UI/UX Score out of 100.
      2. Strengths (color scheme, responsiveness cues).
      3. Critical UX issues (load speed hints, layout alignments, readability).
      4. Action items (e.g. how to present coding streaks, where to put GitHub badges).
      
      Give strict constructive feedback.
    `;

    const report = await callGemini(prompt);

    const { data: dbUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    let profile = dbUser.profile || {};
    profile.portfolioUrl = url;
    let newScore = Math.min(100, (dbUser.job_ready_score || 10) + 10);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        profile,
        job_ready_score: newScore
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    res.status(200).json({ 
      success: true, 
      report,
      jobReadyScore: newScore
    });
  } catch (error) {
    console.error('Audit Portfolio Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// @desc    Conversational AI technical mock interview
// @route   POST /api/ai/chat-interview
// @access  Private/Student
export const chatInterview = async (req, res) => {
  try {
    const { message, history } = req.body; // message is candidate answer, history is previous dialogue
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please send your reply message' });
    }

    const student = req.user;
    
    // Construct chat history format
    let historyText = '';
    if (history && history.length > 0) {
      historyText = history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.text}`).join('\n');
    }

    const prompt = `
      You are an interviewer conducting a high-stakes technical mock coding interview.
      Candidate Details:
      - Name: ${student.name}
      - Targeted Skills: ${student.profile?.skills?.join(', ') || 'Python, Software Engineering'}
      
      Guidelines:
      - Ask exactly ONE clear question at a time.
      - First, review and evaluate the Candidate's latest response critically. Highlight if it's correct, partially correct, or missing edge cases.
      - Next, continue the interview by asking the next logical question (either technical coding questions, complexity questions, or behavioral HR questions).
      - Maintain a professional, strict yet supportive tone. Keep replies relatively concise.
      
      Previous Interview Log:
      ${historyText}
      
      Candidate's Latest Response:
      Candidate: ${message}
      
      Interviewer Reply:
    `;

    const reply = await callGemini(prompt);
    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Chat Interview Error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

