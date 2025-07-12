import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from "../src/lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function resetDatabase() {
  try {
    logger.info('Resetting database...');
    
    // Drop all tables
    execSync('yarn prisma db push --force-reset', { stdio: 'inherit' });
    
    // Create fresh migration
    logger.info('Creating fresh migration...');
    execSync('yarn prisma migrate dev --name init', { stdio: 'inherit' });
    
    logger.info('Database reset and migration complete!');
  } catch (error) {
    logger.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 