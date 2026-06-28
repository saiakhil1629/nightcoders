import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://qjttpookjdfbphqcbtyr.supabase.co',
  'sb_publishable__lhPKxuS-Aryn1s9kdPDeQ_TDg0J7zo'
);

async function test() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);
  } catch (err) {
    console.error("Crash:", err);
  }
}
test();
