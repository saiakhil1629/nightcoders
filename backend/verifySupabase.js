import dotenv from 'dotenv';
dotenv.config();

import supabase from './config/supabaseClient.js';

async function verifySupabase() {
  console.log("Verifying Supabase Connection...");
  console.log("URL:", process.env.SUPABASE_URL);
  
  if (!process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
    console.error("❌ ERROR: SUPABASE_ANON_KEY is not set correctly in .env");
    return;
  }

  try {
    // Attempt to fetch 1 row from users table to see if it works
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
      console.error("❌ ERROR connecting to Supabase or querying 'users' table:");
      console.error(error);
    } else {
      console.log("✅ SUCCESS: Successfully connected to Supabase!");
      console.log("Users table data sample:", data);
    }
  } catch (err) {
    console.error("❌ Unexpected Error:", err);
  }
}

verifySupabase();
