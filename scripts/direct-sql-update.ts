import { db } from '../db';
import * as schema from '../shared/schema';
import { sql } from 'drizzle-orm';

/**
 * This script uses direct SQL to update question categories
 */

async function updateCategories() {
  console.log('Starting to update question categories with direct SQL...');
  
  // Get all categories to map names to IDs
  const categories = await db.select().from(schema.categories);
  const categoryMap: Record<string, number> = {};
  
  for (const category of categories) {
    categoryMap[category.name] = category.id;
  }
  
  console.log('Category map:', categoryMap);
  
  // First let's check how many questions we have
  const totalCount = await db.select({ count: sql<number>`count(*)` }).from(schema.questions);
  console.log(`Total questions in database: ${totalCount[0].count}`);
  
  // Get counts by category before update
  const beforeCounts = await db.select({
    categoryId: schema.questions.categoryId,
    count: sql<number>`count(*)`
  })
  .from(schema.questions)
  .groupBy(schema.questions.categoryId);
  
  console.log('Questions by category before update:');
  for (const row of beforeCounts) {
    const categoryName = Object.entries(categoryMap).find(([_, id]) => id === row.categoryId)?.[0] || 'Unknown';
    console.log(`${categoryName} (${row.categoryId}): ${row.count}`);
  }
  
  // Update questions with practice-related content
  if (categoryMap['Practice']) {
    // Update questions with practice keywords
    const practiceResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Practice']} 
      WHERE 
        text ILIKE '%practice%' OR 
        text ILIKE '%quiz%' OR 
        text ILIKE '%test%' OR 
        text ILIKE '%exam%' OR
        text ILIKE '%sample%' OR
        text ILIKE '%review%'
    `);
    
    console.log(`Updated questions to Practice category: ${practiceResult.rowCount}`);
  }
  
  // Update questions with appraisal-related content
  if (categoryMap['Appraisal']) {
    const appraisalResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Appraisal']} 
      WHERE 
        text ILIKE '%appraisal%' OR 
        text ILIKE '%appraiser%' OR 
        text ILIKE '%valuation%' OR 
        text ILIKE '%market value%' OR
        text ILIKE '%comparative market analysis%' OR
        text ILIKE '%income approach%' OR
        text ILIKE '%cost approach%'
    `);
    
    console.log(`Updated questions to Appraisal category: ${appraisalResult.rowCount}`);
  }
  
  // Update questions with property-related content
  if (categoryMap['Property Ownership']) {
    const propertyResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Property Ownership']} 
      WHERE 
        text ILIKE '%ownership%' OR
        text ILIKE '%title%' OR
        text ILIKE '%deed%' OR
        text ILIKE '%easement%' OR
        text ILIKE '%encumbrance%' OR
        text ILIKE '%real property%' OR
        text ILIKE '%fee simple%'
    `);
    
    console.log(`Updated questions to Property Ownership category: ${propertyResult.rowCount}`);
  }
  
  // Update questions with finance-related content
  if (categoryMap['Finance']) {
    const financeResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Finance']} 
      WHERE 
        text ILIKE '%mortgage%' OR
        text ILIKE '%loan%' OR
        text ILIKE '%finance%' OR
        text ILIKE '%interest rate%' OR
        text ILIKE '%apr%' OR
        text ILIKE '%escrow%' OR
        text ILIKE '%down payment%' OR
        text ILIKE '%closing costs%'
    `);
    
    console.log(`Updated questions to Finance category: ${financeResult.rowCount}`);
  }
  
  // Update questions with contract-related content
  if (categoryMap['Contracts']) {
    const contractsResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Contracts']} 
      WHERE 
        text ILIKE '%contract%' OR
        text ILIKE '%agreement%' OR
        text ILIKE '%offer%' OR
        text ILIKE '%counteroffer%' OR
        text ILIKE '%addendum%' OR
        text ILIKE '%repc%' OR
        text ILIKE '%earnest money%'
    `);
    
    console.log(`Updated questions to Contracts category: ${contractsResult.rowCount}`);
  }
  
  // Update questions with federal regulation content
  if (categoryMap['Federal Regulations']) {
    const federalResult = await db.execute(sql`
      UPDATE questions 
      SET category_id = ${categoryMap['Federal Regulations']} 
      WHERE 
        text ILIKE '%federal%' OR
        text ILIKE '%respa%' OR
        text ILIKE '%tila%' OR
        text ILIKE '%truth in lending%' OR
        text ILIKE '%fair housing%' OR
        text ILIKE '%americans with disabilities%'
    `);
    
    console.log(`Updated questions to Federal Regulations category: ${federalResult.rowCount}`);
  }
  
  // Get counts by category after update
  const afterCounts = await db.select({
    categoryId: schema.questions.categoryId,
    count: sql<number>`count(*)`
  })
  .from(schema.questions)
  .groupBy(schema.questions.categoryId);
  
  console.log('\nQuestions by category AFTER update:');
  for (const row of afterCounts) {
    const categoryName = Object.entries(categoryMap).find(([_, id]) => id === row.categoryId)?.[0] || 'Unknown';
    console.log(`${categoryName} (${row.categoryId}): ${row.count}`);
  }
  
  console.log('Category update completed successfully');
}

// Run the update
updateCategories()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating categories:', error);
    process.exit(1);
  });