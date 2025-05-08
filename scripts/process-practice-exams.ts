import * as fs from 'fs';
import * as path from 'path';
import { parsePdfFile, saveQuestionsToDatabase } from '../server/pdf-parser';

/**
 * This script processes only the practice exam PDFs that we know work properly
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

// Function to check if text looks like real content or binary/garbage data
function isRealContent(text: string): boolean {
  if (!text || text.length < 10) return false;
  
  // Count readable ASCII characters
  const readableChars = text.replace(/[^a-zA-Z0-9 .,?!;:'"-]/g, '').length;
  
  // If less than 70% of content is readable, it's probably not real text
  return (readableChars / text.length) > 0.7;
}

async function processPracticeExams() {
  console.log('Starting to process practice exam PDFs...');
  
  // List of specific practice exam files we want to process
  const practiceExamFiles = [
    'UT PL 00 Practice Exam 3 (2).pdf',
    'UT PL 00 Practice Exam 4 (2).pdf',
    'UT PL 00 Practice Exam 5 (2).pdf'
  ];
  
  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (const file of practiceExamFiles) {
    const filePath = path.join(EXTRACTED_MATERIALS_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }
    
    console.log(`\nProcessing practice exam: ${file}`);
    
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
      
      // Filter out binary/garbage data
      const validQuestions = result.questions.filter(q => isRealContent(q.text));
      
      console.log(`Extracted ${result.questions.length} questions from ${file}`);
      console.log(`After filtering: ${validQuestions.length} valid questions`);
      
      if (validQuestions.length === 0) {
        console.log('No valid questions after filtering, skipping file');
        continue;
      }
      
      // Sanitize all questions
      const sanitizedQuestions = validQuestions.map(q => sanitizeQuestion(q));
      
      // Force the category to be Practice for these files
      const practiceQuestions = sanitizedQuestions.map(q => ({
        ...q,
        categoryHint: 'Practice'
      }));
      
      // Save questions to database
      const saveResult = await saveQuestionsToDatabase(practiceQuestions, file);
      
      console.log(`Added ${saveResult.added} questions to database`);
      console.log(`Skipped ${saveResult.skipped} duplicate questions`);
      
      if (saveResult.errors && saveResult.errors.length > 0) {
        console.log(`Errors during save: ${saveResult.errors.length}`);
        console.log(saveResult.errors);
        totalErrors += saveResult.errors.length;
      }
      
      totalAdded += saveResult.added;
      totalSkipped += saveResult.skipped;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
      totalErrors++;
    }
  }
  
  console.log('\n=========== PROCESSING COMPLETE ===========');
  console.log(`Processed ${practiceExamFiles.length} practice exam files`);
  console.log(`Total questions added: ${totalAdded}`);
  console.log(`Total duplicates skipped: ${totalSkipped}`);
  console.log(`Total errors: ${totalErrors}`);
}

// Run the process
processPracticeExams()
  .then(() => {
    console.log('Practice exam processing complete.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error during practice exam processing:', error);
    process.exit(1);
  });