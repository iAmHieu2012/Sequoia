import { firebaseAuth } from './seed_client';

/**
 * Grants admin rights to ONE user, identified by email, by setting the Firebase custom claim `admin`.
 * Usage: npx tsx scripts/make_admin.ts you@example.com
 */

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: npx tsx scripts/make_admin.ts <email>");
  process.exit(1);
}

async function makeAdmin(targetEmail: string) {
  const auth = firebaseAuth();
  console.log(`Firebase project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  let user;
  try {
    user = await auth.getUserByEmail(targetEmail);
  } catch {
    console.error(`No Firebase user with email: ${targetEmail}. Sign in on the site once first.`);
    process.exit(1);
  }

  await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true });
  console.log(`Granted admin rights to: ${targetEmail} (${user.uid})`);
  console.log("Takes effect when the token renews (within an hour), or sign out and back in.");
  process.exit(0);
}

makeAdmin(email);
