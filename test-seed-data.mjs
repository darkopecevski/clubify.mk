#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing seed data...\n');

// Test training recurrences
const { data: recurrences, error: recError } = await supabase
  .from('training_recurrences')
  .select('*')
  .limit(5);

console.log('📅 Training Recurrences:', recurrences?.length || 0);
if (recurrences?.length > 0) {
  console.log('   Sample:', recurrences[0]);
}

// Test training sessions
const { data: sessions, error: sessError } = await supabase
  .from('training_sessions')
  .select('*')
  .limit(5);

console.log('\n🏃 Training Sessions:', sessions?.length || 0);
if (sessions?.length > 0) {
  console.log('   Sample:', sessions[0]);
}

// Test attendance
const { data: attendance, error: attError } = await supabase
  .from('attendance')
  .select('*')
  .limit(5);

console.log('\n✅ Attendance Records:', attendance?.length || 0);
if (attendance?.length > 0) {
  console.log('   Sample:', attendance[0]);
}

// Test matches
const { data: matches, error: matchError } = await supabase
  .from('matches')
  .select('*')
  .limit(5);

console.log('\n⚽ Matches:', matches?.length || 0);
if (matches?.length > 0) {
  console.log('   Sample:', matches[0]);
}

// Test match squads
const { data: squads, error: squadError } = await supabase
  .from('match_squads')
  .select('*')
  .limit(5);

console.log('\n👥 Match Squads:', squads?.length || 0);
if (squads?.length > 0) {
  console.log('   Sample:', squads[0]);
}

// Test match statistics
const { data: stats, error: statsError } = await supabase
  .from('match_statistics')
  .select('*')
  .limit(5);

console.log('\n📊 Match Statistics:', stats?.length || 0);
if (stats?.length > 0) {
  console.log('   Sample:', stats[0]);
}

console.log('\n' + '='.repeat(50));
if (!recurrences?.length && !sessions?.length && !matches?.length) {
  console.log('❌ No seed data found. Please apply the seed file via Supabase SQL Editor.');
  console.log('📄 File: supabase/seed_training_matches.sql');
} else {
  console.log('✅ Seed data detected! Tables have records.');
}
