import { execSync } from 'child_process';
import path from 'path';
import * as dotenv from 'dotenv';
import { assertDevDatabase } from './seed_guard';

// Check once up front so nothing runs (not even partially) against a non-dev database.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
assertDevDatabase(process.env.NEXT_PUBLIC_SUPABASE_URL);

function runScript(scriptName: string) {
  const scriptPath = path.join(__dirname, scriptName);
  console.log(`\n========================================`);
  console.log(`Running ${scriptName}...`);
  console.log(`========================================`);
  execSync(`npx tsx ${scriptPath}`, { stdio: 'inherit' });
}

function main() {
  console.log('Initializing Sequoia Seed Sequence (Restored Firebase Parity - Fixes applied)...\n');
  
  try {
    runScript('seed_clean.ts');
    runScript('seed_users.ts');
    runScript('seed_models.ts');
    runScript('seed_textbooks.ts');
    runScript('seed_content.ts');
    
    console.log('\n✅ All seed scripts completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during seed sequence:', error);
    process.exit(1);
  }
}

main();
