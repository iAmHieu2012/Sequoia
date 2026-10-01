import { supabase } from './seed_client';

async function clean() {
  console.log('Clearing existing databanks...');
  const { data: users } = await supabase.auth.admin.listUsers();
  if (users?.users) {
    for (const u of users.users) {
      await supabase.auth.admin.deleteUser(u.id);
    }
  }
  
  await supabase.from('topics').delete().neq('id', 'dummy'); 
  await supabase.from('models').delete().neq('id', 'dummy');
  await supabase.from('textbooks').delete().neq('id', 'dummy');
  await supabase.from('cosmos_maps').delete().neq('id', 'dummy');
  await supabase.from('articles').delete().neq('id', 'dummy');
  await supabase.from('article_contents').delete().neq('id', 'dummy');
  await supabase.from('users').delete().neq('id', 'dummy');
  
  console.log('✅ Clean completed successfully!');
  process.exit(0);
}

clean();
