import * as fs from 'fs';
import * as path from 'path';
import { parsePdfFile, saveQuestionsToDatabase } from '../server/pdf-parser';

/**
 * This script processes all PDFs in the extracted_materials directory
 * and saves the extracted questions to the database
 */

const EXTRACTED_MATERIALS_DIR = './extracted_materials';

async function processAllPdfs() {
  console.log('Starting to process all PDFs in extracted_materials directory...');
  
  // Ensure the directory exists
  if (!fs.existsSync(EXTRACTED_MATERIALS_DIR)) {
    console.error(`Directory ${EXTRACTED_MATERIALS_DIR} does not exist.`);
    return;
  }
  
  // Get all PDF files
  const files = fs.readdirSync(EXTRACTED_MATERIALS_DIR)
    .filter(file => file.toLowerCase().endsWith('.pdf'));
  
  console.log(`Found ${files.length} PDF files to process`);
  
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  // Process each file
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(EXTRACTED_MATERIALS_DIR, file);
    
    console.log(`\nProcessing file ${i + 1}/${files.length}: ${file}`);
    
    try {
      // Parse the PDF file
      const result = await parsePdfFile(filePath, {
        extractExplanations: true,
        autoCategories: true,
        filename: file
      });
      
      console.log(`Extracted ${result.questions.length} questions from ${file}`);
      
      if (result.questions.length > 0) {
        // Save questions to database
        const saveResult = await saveQuestionsToDatabase(result.questions, file);
        
        console.log(`Added ${saveResult.added} questions to database`);
        console.log(`Skipped ${saveResult.skipped} duplicate questions`);
        
        if (saveResult.errors && saveResult.errors.length > 0) {
          console.error(`Errors during save: ${saveResult.errors.length}`);
          totalErrors += saveResult.errors.length;
        }
        
        totalAdded += saveResult.added;
        totalSkipped += saveResult.skipped;
      } else {
        console.log(`No questions found in ${file}`);
        
        if (result.errors && result.errors.length > 0) {
          console.error(`Errors during extraction: ${result.errors}`);
          totalErrors += result.errors.length;
        }
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      totalErrors++;
    }
  }
  
  console.log('\n=========== PROCESSING COMPLETE ===========');
  console.log(`Processed ${files.length} PDF files`);
  console.log(`Total questions added: ${totalAdded}`);
  console.log(`Total duplicates skipped: ${totalSkipped}`);
  console.log(`Total errors: ${totalErrors}`);
}

// Run the process
processAllPdfs()
  .then(() => {
    console.log('PDF processing complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during PDF processing:', error);
    process.exit(1);
  });