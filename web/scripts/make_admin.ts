import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function makeAllAdmins() {
  console.log("Fetching users...");
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  console.log(`Found ${users.users.length} users. Elevating privileges...`);
  
  for (const user of users.users) {
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { app_metadata: { ...user.app_metadata, is_admin: true } }
    );
    
    if (updateError) {
      console.error(`Failed to update user ${user.email}:`, updateError);
    } else {
      console.log(`Granted admin rights to: ${user.email}`);
    }
  }
  
  console.log("Done! You may need to sign out and sign back in for the new JWT token to take effect.");
}

makeAllAdmins();
