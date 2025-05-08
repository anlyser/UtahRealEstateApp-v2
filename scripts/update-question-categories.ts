import { db } from '../db';
import * as schema from '../shared/schema';
import { eq, like } from 'drizzle-orm';

/**
 * This script updates categories for questions based on the original source file
 * or the content of the question.
 */

async function updateCategories() {
  console.log('Starting to update question categories...');
  
  // Get all uploads to map questions to their source files
  const uploads = await db.select().from(schema.uploads);
  
  // Group uploads by filename patterns
  const practiceFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('practice') || 
    upload.filename.toLowerCase().includes('quiz') || 
    upload.filename.toLowerCase().includes('exam')
  );
  
  const appraisalFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('appraisal') || 
    upload.filename.toLowerCase().includes('valuation')
  );
  
  const propertyFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('property') || 
    upload.filename.toLowerCase().includes('ownership')
  );
  
  const financeFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('finance') || 
    upload.filename.toLowerCase().includes('mortgage') || 
    upload.filename.toLowerCase().includes('loan')
  );
  
  const contractFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('contract') || 
    upload.filename.toLowerCase().includes('agreement') || 
    upload.filename.toLowerCase().includes('repc') || 
    upload.filename.toLowerCase().includes('addendum')
  );
  
  const agencyFiles = uploads.filter(upload => 
    upload.filename.toLowerCase().includes('agency') || 
    upload.filename.toLowerCase().includes('broker') || 
    upload.filename.toLowerCase().includes('agent')
  );
  
  // Maps for category IDs
  const categoryMap: Record<string, number> = {};
  
  // Get all categories to map names to IDs
  const categories = await db.select().from(schema.categories);
  for (const category of categories) {
    categoryMap[category.name] = category.id;
  }
  
  // Output the category map
  console.log('Category map:', categoryMap);
  
  // Update questions based on file origin
  let totalUpdated = 0;
  
  // Update Practice category
  if (categoryMap['Practice']) {
    // Note: We need to check if the schema has a sourceName field, which it doesn't appear to
    // Instead, let's focus on updating questions based on content
    
    // Also update questions with practice-related content
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
    // Update questions with appraisal-related content
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
    for (const file of propertyFiles) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Property Ownership'] })
        .where(eq(schema.questions.sourceName, file.filename));
      
      console.log(`Updated ${result.count} questions from Property file ${file.filename}`);
      totalUpdated += result.count;
    }
    
    // Also update questions with property-related content
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
    for (const file of financeFiles) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Finance'] })
        .where(eq(schema.questions.sourceName, file.filename));
      
      console.log(`Updated ${result.count} questions from Finance file ${file.filename}`);
      totalUpdated += result.count;
    }
    
    // Also update questions with finance-related content
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
    for (const file of contractFiles) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Contracts'] })
        .where(eq(schema.questions.sourceName, file.filename));
      
      console.log(`Updated ${result.count} questions from Contracts file ${file.filename}`);
      totalUpdated += result.count;
    }
    
    // Also update questions with contract-related content
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
    for (const file of agencyFiles) {
      const result = await db
        .update(schema.questions)
        .set({ categoryId: categoryMap['Agency'] })
        .where(eq(schema.questions.sourceName, file.filename));
      
      console.log(`Updated ${result.count} questions from Agency file ${file.filename}`);
      totalUpdated += result.count;
    }
    
    // Also update questions with agency-related content
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