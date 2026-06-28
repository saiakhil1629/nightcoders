import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const profileData = {
    college: 'Test College',
    branch: 'CS',
    gradYear: 2026,
    bio: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: ''
  };

  const { error } = await supabase.from('users').insert([{
    name: 'Test User',
    email: 'test5@test.com',
    password: 'hashedpassword',
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

  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Insert successful!");
  }
}
testInsert();
