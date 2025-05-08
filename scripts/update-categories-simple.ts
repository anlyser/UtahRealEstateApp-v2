import { db } from '../db';
import * as schema from '../shared/schema';
import { like } from 'drizzle-orm';

/**
 * This script updates categories for questions based on the content of the question text.
 */

async function updateCategories() {
  console.log('Starting to update question categories...');
  
  // Maps for category IDs
  const categoryMap: Record<string, number> = {};
  
  // Get all categories to map names to IDs
  const categories = await db.select().from(schema.categories);
  for (const category of categories) {
    categoryMap[category.name] = category.id;
  }
  
  // Output the category map
  console.log('Category map:', categoryMap);
  
  // First let's check some sample questions
  const sampleQuestions = await db.select().from(schema.questions).limit(5);
  console.log('Sample questions:', sampleQuestions);
  
  // Update questions based on content
  let totalUpdated = 0;
  
  // Update Practice category
  if (categoryMap['Practice']) {
    const practiceKeywords = [
      'practice', 'quiz', 'test', 'exam', 'sample', 'review', 'assessment'
    ];
    
    for (const keyword of practiceKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Practice'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Practice category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Appraisal category
  if (categoryMap['Appraisal']) {
    const appraisalKeywords = [
      'appraisal', 'appraiser', 'valuation', 'market value', 'appraise', 
      'comparative market analysis', 'cma', 'income approach', 'cost approach'
    ];
    
    for (const keyword of appraisalKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Appraisal'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Appraisal category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Property Ownership category
  if (categoryMap['Property Ownership']) {
    const propertyKeywords = [
      'ownership', 'title', 'deed', 'easement', 'encumbrance', 'real property',
      'legal description', 'fee simple', 'metes and bounds', 'leasehold'
    ];
    
    for (const keyword of propertyKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Property Ownership'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Property Ownership category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Finance category
  if (categoryMap['Finance']) {
    const financeKeywords = [
      'mortgage', 'loan', 'finance', 'lien', 'interest rate', 'apr', 'escrow',
      'amortization', 'down payment', 'closing costs', 'points', 'loan-to-value'
    ];
    
    for (const keyword of financeKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Finance'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Finance category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Contracts category
  if (categoryMap['Contracts']) {
    const contractKeywords = [
      'contract', 'agreement', 'offer', 'counteroffer', 'addendum', 'repc',
      'purchase agreement', 'sales contract', 'contingency', 'earnest money'
    ];
    
    for (const keyword of contractKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Contracts'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Contracts category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Agency category
  if (categoryMap['Agency']) {
    const agencyKeywords = [
      'agency', 'agent', 'broker', 'fiduciary', 'principal', 'dual agency',
      'limited agent', 'buyer agent', 'seller agent', 'brokerage', 'designated agency'
    ];
    
    for (const keyword of agencyKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Agency'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Agency category`);
      totalUpdated += result.count;
    }
  }
  
  // Update Federal Regulations category
  if (categoryMap['Federal Regulations']) {
    const federalKeywords = [
      'federal', 'respa', 'tila', 'truth in lending', 'fair housing', 
      'equal opportunity', 'ada', 'americans with disabilities'
    ];
    
    for (const keyword of federalKeywords) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Federal Regulations'] })
        .where(like(schema.questions.text, `%${keyword}%`));
      
      console.log(`Updated ${result.count} questions containing "${keyword}" to Federal Regulations category`);
      totalUpdated += result.count;
    }
  }
  
  console.log(`Finished updating categories. Total questions updated: ${totalUpdated}`);
}

// Run the update
updateCategories()
  .then(() => {
    console.log('Category update completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error updating categories:', error);
    process.exit(1);
  });