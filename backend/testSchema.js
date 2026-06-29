import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function testTaskCompletions() {
  const { data, error } = await supabase
    .from('task_completions')
    .insert([{
      student_id: '5e5bfb5e-1623-48ed-8f7a-47244030b376',
      day_number: 98,
      video_watched: false,
      quiz_solved: false,
      quiz_score: 0,
      coding_solved: false,
      aptitude_solved: false,
      reasoning_solved: false,
      ai_task_submitted: false,
      xp_earned: 0,
      status: 'Pending'
    }])
    .select();

  console.log("Insert Result:", data);
  console.log("Insert Error:", error);
  if(data) await supabase.from('task_completions').delete().eq('day_number', 98);
}

testTaskCompletions();
