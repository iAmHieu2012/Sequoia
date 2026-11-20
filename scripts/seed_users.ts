import { firebaseAuth, supabase } from './seed_client';

const EMAIL = 'test@sequoia.ai';
const PASSWORD = 'Password@123';

/** Creates the admin test account in Firebase, plus its profile and some progress in Supabase. */
async function seedUsers() {
  console.log('Seeding Users...');
  const auth = firebaseAuth();

  let uid: string;
  try {
    uid = (await auth.getUserByEmail(EMAIL)).uid;
  } catch {
    const created = await auth.createUser({
      email: EMAIL,
      password: PASSWORD,
      emailVerified: true,
      displayName: 'Test User',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    });
    uid = created.uid;
  }
  await auth.setCustomUserClaims(uid, { admin: true });

  const { error: userErr } = await supabase.from('users').upsert({
    id: uid,
    email: EMAIL,
    display_name: 'Test User',
    photo_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  });
  if (userErr) throw userErr;

  console.log('Seeding User Progress...');
  const { error: progErr } = await supabase.from('user_progress').upsert({
    id: uid,
    current_streak: 5,
    longest_streak: 5,
    active_dates: ["2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30", "2026-07-31"],
    completed_article_ids: ["image-classification", "attention-paper"],
    last_active: new Date().toISOString(),
  });
  if (progErr) throw progErr;

  console.log('✅ Users seeded successfully!');
  console.log(`TEST CREDENTIALS: ${EMAIL} / ${PASSWORD}`);
  process.exit(0);
}

seedUsers();
