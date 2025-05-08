import { db } from '../db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This script clears all questions and answers from the database
 * to prepare for importing new content
 */

async function clearDatabase() {
  console.log('Starting database cleanup...');
  
  try {
    // First delete all answers (due to foreign key constraints)
    console.log('Deleting answers...');
    await db.delete(schema.answers);
    
    // Then delete all questions
    console.log('Deleting questions...');
    await db.delete(schema.questions);
    
    // Reset category question counts
    console.log('Resetting category question counts...');
    await db.update(schema.categories)
      .set({ questionCount: 0 });
    
    // Check if progress table exists before trying to clear it
    try {
      console.log('Clearing user progress...');
      // Use a safe query that won't fail if table doesn't exist
      await db.execute(sql`DELETE FROM "progress" WHERE TRUE`);
    } catch (err) {
      console.log('Progress table might not exist, continuing...');
    }
    
    // Clear saved questions
    try {
      console.log('Clearing saved questions...');
      await db.execute(sql`DELETE FROM "saved_questions" WHERE TRUE`);
    } catch (err) {
      console.log('Saved questions table might not exist, continuing...');
    }
    
    console.log('Database cleanup complete!');
  } catch (error) {
    console.error('Error during database cleanup:', error);
  }
}

// Run the cleanup
clearDatabase()
  .then(() => {
    console.log('All questions and related data have been removed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during cleanup process:', error);
    process.exit(1);
  });