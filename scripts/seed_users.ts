import { supabase } from './seed_client';

async function seedUsers() {
  console.log('Seeding Users...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'test@sequoia.ai',
    password: 'Password@123',
    email_confirm: true,
    user_metadata: { name: 'Test User', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    app_metadata: { is_admin: true }
  });

  let userId = '';
  if (authError && authError.message.includes('already exists')) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const existing = users.users.find(u => u.email === 'test@sequoia.ai');
    if (existing) userId = existing.id;
  } else if (authData?.user) {
    userId = authData.user.id;
  }
  
  if (!userId) {
    throw new Error('Could not determine userId for test@sequoia.ai');
  }

  // Wait for trigger to create profile and progress
  await new Promise(resolve => setTimeout(resolve, 1000));
  const now = new Date().toISOString();
  
  console.log('Seeding User Progress...');
  const userProgress = {
      current_streak: 5,
      longest_streak: 5,
      active_dates: ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"],
      completed_article_ids: ["image-classification", "attention-paper"],
      last_active: now
  };
  const { error: progErr } = await supabase.from('user_progress').update(userProgress).eq('id', userId);
  if (progErr) throw progErr;

  console.log('✅ Users seeded successfully!');
  console.log('TEST CREDENTIALS: test@sequoia.ai / Password@123');
  process.exit(0);
}

seedUsers();
