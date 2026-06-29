import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testTaskInsert() {
  const taskData = {
    day_number: 99,
    month: 4,
    study_topic: 'JSON Test',
    video_url: '',
    video_duration: 0,
    notes_url: '',
    coding_question: { title: "Test", description: "Test", difficulty: "Easy" },
    aptitude_question: { question: "Q", options: ["A", "B", "C", "D"], correctOption: 1, explanation: "Exp" },
    reasoning_question: null,
    ai_tool_task: null
  };

  const { data, error } = await supabase
    .from('daily_tasks')
    .insert([taskData])
    .select()
    .single();

  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Insert successful!", data);
    
    // cleanup
    await supabase.from('daily_tasks').delete().eq('day_number', 99);
  }
}
testTaskInsert();
