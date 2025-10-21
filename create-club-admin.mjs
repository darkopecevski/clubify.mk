/**
 * Create a Club Admin Test User
 *
 * This script creates a test user with club_admin role using Supabase Admin API
 *
 * Usage:
 *   node create-club-admin.mjs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createClubAdmin() {
  try {
    console.log('🚀 Creating club admin user...\n');

    // Step 1: Get a club to assign the admin to
    console.log('📋 Fetching available clubs...');
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(1);

    if (clubsError) throw clubsError;
    if (!clubs || clubs.length === 0) {
      console.error('❌ No active clubs found. Please create a club first.');
      process.exit(1);
    }

    const club = clubs[0];
    console.log(`✅ Found club: ${club.name} (${club.slug})\n`);

    // Step 2: Create the user in Auth
    const email = 'clubadmin@test.com';
    const password = 'Test1234!';

    console.log(`👤 Creating user: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the email
      user_metadata: {
        full_name: 'Club Admin Test User'
      }
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('⚠️  User already exists, fetching existing user...');

        // Get existing user by email
        const { data: userData, error: fetchError } = await supabase.auth.admin.listUsers();

        if (fetchError) throw fetchError;

        const existingUser = userData.users.find(u => u.email === email);

        if (!existingUser) {
          throw new Error(`User with email ${email} exists but could not be found in user list`);
        }

        console.log(`✅ Found existing user: ${existingUser.id}\n`);

        // Step 3: Check if user already has club_admin role
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', existingUser.id)
          .eq('club_id', club.id)
          .eq('role', 'club_admin');

        if (existingRoles && existingRoles.length > 0) {
          console.log('✅ User already has club_admin role for this club');
          console.log('\n🎉 All set! You can now login with:');
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
          console.log(`   Club: ${club.name}`);
          return;
        }

        // Step 4: Add club_admin role to existing user
        console.log('📝 Adding club_admin role to existing user...');
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: existingUser.id,
            club_id: club.id,
            role: 'club_admin'
          });

        if (roleError) throw roleError;

        console.log('✅ Role assigned successfully\n');
        console.log('🎉 All set! You can now login with:');
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   Club: ${club.name}`);
        console.log(`   URL: https://clubifymk.netlify.app/login`);
        return;
      }
      throw authError;
    }

    const user = authData.user;
    console.log(`✅ User created: ${user.id}\n`);

    // Step 3: Create user profile
    console.log('📝 Creating user profile...');
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        full_name: 'Club Admin Test User'
      });

    if (profileError && !profileError.message.includes('duplicate')) {
      throw profileError;
    }
    console.log('✅ Profile created\n');

    // Step 4: Assign club_admin role
    console.log(`📝 Assigning club_admin role for ${club.name}...`);
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        club_id: club.id,
        role: 'club_admin'
      });

    if (roleError) throw roleError;
    console.log('✅ Role assigned successfully\n');

    // Step 5: Verify
    console.log('🔍 Verifying setup...');
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`
        role,
        clubs (name)
      `)
      .eq('user_id', user.id);

    console.log('✅ Verification complete\n');
    console.log('═══════════════════════════════════════');
    console.log('🎉 Club Admin User Created Successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Club: ${club.name}`);
    console.log(`Role: club_admin`);
    console.log('\nLogin at: https://clubifymk.netlify.app/login');
    console.log('Dashboard: https://clubifymk.netlify.app/club');
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createClubAdmin();
