import * as fs from 'fs';
import * as path from 'path';
import { parsePdfFile, saveQuestionsToDatabase } from '../server/pdf-parser';

/**
 * This script processes PDFs in the extracted_materials directory
 * and sanitizes the text to remove invalid UTF-8 characters
 */

const EXTRACTED_MATERIALS_DIR = './extracted_materials';

// Function to sanitize text of invalid UTF-8 characters
function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Replace NULL bytes and other control characters
  return text
    // Replace NULL bytes
    .replace(/\0/g, '')
    // Replace other control characters except newlines and tabs
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Replace any other invalid UTF-8 sequences
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, '');
}

// Function to sanitize a parsed question
function sanitizeQuestion(question: any): any {
  if (!question) return question;
  
  return {
    ...question,
    text: sanitizeText(question.text),
    answer: question.answer ? sanitizeText(question.answer) : question.answer,
    explanation: question.explanation ? sanitizeText(question.explanation) : question.explanation,
    options: Array.isArray(question.options) 
      ? question.options.map((opt: any) => ({
          letter: opt.letter,
          text: sanitizeText(opt.text)
        }))
      : question.options
  };
}

async function processPdfs() {
  console.log('Starting to process PDFs with text sanitization...');
  
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
  
  // Process 5 PDFs at a time to avoid UTF-8 issues
  const batchSize = 5;
  const numBatches = Math.ceil(files.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, files.length);
    const batchFiles = files.slice(startIndex, endIndex);
    
    console.log(`\nProcessing batch ${batchIndex + 1}/${numBatches} (files ${startIndex + 1}-${endIndex} of ${files.length})`);
    
    for (const file of batchFiles) {
      const filePath = path.join(EXTRACTED_MATERIALS_DIR, file);
      
      console.log(`Processing file: ${file}`);
      
      try {
        // Parse the PDF file
        const result = await parsePdfFile(filePath, {
          extractExplanations: true,
          autoCategories: true,
          filename: file
        });
        
        if (result.questions.length === 0) {
          console.log(`No questions found in ${file}`);
          continue;
        }
        
        console.log(`Extracted ${result.questions.length} questions from ${file}`);
        
        // Sanitize all questions
        const sanitizedQuestions = result.questions.map(q => sanitizeQuestion(q));
        
        // Save questions to database
        const saveResult = await saveQuestionsToDatabase(sanitizedQuestions, file);
        
        console.log(`Added ${saveResult.added} questions to database`);
        console.log(`Skipped ${saveResult.skipped} duplicate questions`);
        
        if (saveResult.errors && saveResult.errors.length > 0) {
          console.log(`Errors during save: ${saveResult.errors.length}`);
          totalErrors += saveResult.errors.length;
        }
        
        totalAdded += saveResult.added;
        totalSkipped += saveResult.skipped;
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        totalErrors++;
      }
    }
    
    // Brief pause between batches to avoid database issues
    console.log('Pausing before next batch...');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n=========== PROCESSING COMPLETE ===========');
  console.log(`Processed ${files.length} PDF files`);
  console.log(`Total questions added: ${totalAdded}`);
  console.log(`Total duplicates skipped: ${totalSkipped}`);
  console.log(`Total errors: ${totalErrors}`);
}

// Run the process
processPdfs()
  .then(() => {
    console.log('PDF processing complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during PDF processing:', error);
    process.exit(1);
  });