import { firebaseAuth, supabase } from './seed_client';

/** Deletes ALL Firebase users and all rows in the Supabase tables. Development only. */
async function clean() {
  console.log('Clearing existing databanks...');

  const auth = firebaseAuth();
  let pageToken: string | undefined;
  do {
    const page = await auth.listUsers(1000, pageToken);
    if (page.users.length > 0) await auth.deleteUsers(page.users.map(u => u.uid));
    pageToken = page.pageToken;
  } while (pageToken);

  // Supabase refuses a delete without a filter; neq('id', 'dummy') matches every row.
  // Deleting users cascades to user_progress; deleting articles cascades to article_contents.
  await supabase.from('users').delete().neq('id', 'dummy');
  await supabase.from('articles').delete().neq('id', 'dummy');
  await supabase.from('topics').delete().neq('id', 'dummy');
  await supabase.from('models').delete().neq('id', 'dummy');
  await supabase.from('textbooks').delete().neq('id', 'dummy');
  await supabase.from('cosmos_maps').delete().neq('id', 'dummy');

  console.log('✅ Clean completed successfully!');
  process.exit(0);
}

clean();
