import { execSync } from 'child_process';
import path from 'path';

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
