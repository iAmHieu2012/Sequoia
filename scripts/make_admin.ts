import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

/**
 * Grants admin rights to ONE user, identified by email.
 * Usage: npx tsx scripts/make_admin.ts you@example.com
 */

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npx tsx scripts/make_admin.ts <email>");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function makeAdmin(targetEmail: string) {
  console.log(`Target database: ${new URL(supabaseUrl!).hostname}`);

  // listUsers is paginated; walk the pages until the email is found.
  const perPage = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("Error fetching users:", error);
      process.exit(1);
    }

    const user = data.users.find(u => u.email?.toLowerCase() === targetEmail);
    if (user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { app_metadata: { ...user.app_metadata, is_admin: true } }
      );
      if (updateError) {
        console.error(`Failed to update ${targetEmail}:`, updateError);
        process.exit(1);
      }
      console.log(`Granted admin rights to: ${targetEmail}`);
      console.log("Sign out and back in for the new token to take effect.");
      return;
    }

    if (data.users.length < perPage) break;
  }

  console.error(`No user found with email: ${targetEmail}`);
  process.exit(1);
}

makeAdmin(email);
