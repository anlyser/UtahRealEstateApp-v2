import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * This script identifies and removes duplicate questions
 */

async function findAndFixDuplicates() {
  console.log('Starting to identify and fix duplicate questions...');
  
  // Find duplicate questions
  const duplicates = await db.execute(sql`
    SELECT text, COUNT(*) as count, ARRAY_AGG(id) as ids
    FROM questions
    GROUP BY text
    HAVING COUNT(*) > 1
    ORDER BY count DESC
  `);
  
  console.log(`Found ${duplicates.rows.length} sets of duplicate questions`);
  
  if (duplicates.rows.length === 0) {
    console.log('No duplicates found, nothing to fix!');
    return;
  }
  
  // Print some example duplicates
  console.log('\nSome examples of duplicate questions:');
  const exampleCount = Math.min(5, duplicates.rows.length);
  
  for (let i = 0; i < exampleCount; i++) {
    const row = duplicates.rows[i];
    console.log(`"${row.text}" - appears ${row.count} times, IDs: ${row.ids}`);
  }
  
  // Ask if we should proceed with deletion
  const totalDuplicatesToRemove = duplicates.rows.reduce(
    (sum, row) => sum + (row.count - 1),
    0
  );
  
  console.log(`\nFound ${totalDuplicatesToRemove} duplicate records to remove`);
  
  // For each set of duplicates, keep one (the lowest ID) and delete the rest
  let deletedCount = 0;
  
  for (const row of duplicates.rows) {
    const ids = row.ids;
    if (!Array.isArray(ids) || ids.length <= 1) continue;
    
    // Keep the lowest ID, delete the rest
    const lowestId = Math.min(...ids);
    const idsToDelete = ids.filter(id => id !== lowestId);
    
    console.log(`Keeping question ID ${lowestId}, deleting IDs: ${idsToDelete.join(', ')}`);
    
    // First, remove any answers associated with the questions to be deleted
    await db.execute(sql`
      DELETE FROM answers 
      WHERE question_id IN (${sql.join(idsToDelete, sql`, `)})
    `);
    
    // Then, remove any user progress associated with the questions to be deleted
    await db.execute(sql`
      DELETE FROM user_progress 
      WHERE question_id IN (${sql.join(idsToDelete, sql`, `)})
    `);
    
    // Finally, delete the duplicate questions
    const deleteResult = await db.execute(sql`
      DELETE FROM questions 
      WHERE id IN (${sql.join(idsToDelete, sql`, `)})
    `);
    
    deletedCount += deleteResult.rowCount || 0;
  }
  
  console.log(`Successfully deleted ${deletedCount} duplicate questions`);
  
  // Final check to ensure we have no more duplicates
  const checkDuplicates = await db.execute(sql`
    SELECT text, COUNT(*) as count
    FROM questions
    GROUP BY text
    HAVING COUNT(*) > 1
  `);
  
  if (checkDuplicates.rows.length === 0) {
    console.log('All duplicates have been successfully removed!');
  } else {
    console.log(`There are still ${checkDuplicates.rows.length} sets of duplicate questions.`);
  }
  
  // Update category counts in the database
  await updateCategoryCounts();
}

/**
 * Updates the question_count in the categories table
 */
async function updateCategoryCounts() {
  console.log('\nUpdating category question counts...');
  
  // Get current counts by category
  const counts = await db.select({
    categoryId: schema.questions.categoryId,
    count: sql<number>`count(*)`
  })
  .from(schema.questions)
  .groupBy(schema.questions.categoryId);
  
  // Update each category with the correct count
  for (const row of counts) {
    await db
      .update(schema.categories)
      .set({ questionCount: row.count })
      .where(eq(schema.categories.id, row.categoryId));
    
    console.log(`Updated category ID ${row.categoryId} with count ${row.count}`);
  }
  
  // Set count to 0 for any categories that have no questions
  await db.execute(sql`
    UPDATE categories
    SET question_count = 0
    WHERE id NOT IN (SELECT DISTINCT category_id FROM questions)
  `);
  
  console.log('Category counts updated successfully');
}

// Run the script
findAndFixDuplicates()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error fixing duplicates:', error);
    process.exit(1);
  });