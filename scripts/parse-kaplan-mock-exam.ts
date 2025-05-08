import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * This script parses the Kaplan Mock Exam questions from the text file
 * and adds them to the database with proper formatting
 */

interface Question {
  text: string;
  answer: string;
  explanation: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: { letter: string; text: string }[];
}

// Function to get or create a category
async function getOrCreateCategory(name: string): Promise<number> {
  // Check if category exists
  const existingCategories = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, name));
  
  if (existingCategories.length > 0) {
    return existingCategories[0].id;
  }
  
  // Create new category
  const [newCategory] = await db
    .insert(schema.categories)
    .values({
      name,
      description: `Questions related to ${name}`,
    })
    .returning();
  
  return newCategory.id;
}

async function parseKaplanMockExam() {
  console.log('Starting to parse Kaplan Mock Exam questions...');
  
  // Path to the mock exam file
  const filePath = path.join('./attached_assets', 'Pasted-Modern-Real-Estate-Practice-Nineteenth-Edition-2014-Kaplan-Inc-Mock-Exam-1-1-The-rights-of-o-1746545034138.txt');
  
  // Read the file
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n');
  
  // Check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Category mapping
  const categoryMap: Record<string, string> = {
    'rights of ownership': 'Property Ownership',
    'real property': 'Property Ownership',
    'improvement': 'Property Ownership',
    'agency': 'Agency',
    'fiduciary': 'Agency',
    'commission': 'Practice',
    'broker': 'Agency',
    'estate': 'Property Ownership',
    'easement': 'Property Ownership',
    'fee simple': 'Property Ownership',
    'joint tenancy': 'Property Ownership',
    'survey': 'Property Ownership',
    'option': 'Contracts',
    'earnest money': 'Contracts',
    'contract': 'Contracts',
    'listing': 'Agency',
    'deed': 'Property Ownership',
    'title': 'Property Ownership',
    'mortgage': 'Finance',
    'loan': 'Finance',
    'financing': 'Finance',
    'lender': 'Finance',
    'appraisal': 'Appraisal',
    'value': 'Appraisal',
    'tax': 'Finance',
    'escrow': 'Finance',
    'disclosure': 'Federal Regulations',
    'fair housing': 'Federal Regulations',
    'real estate settlement': 'Federal Regulations',
    'statute of frauds': 'Contracts',
    'trust': 'Finance'
  };
  
  // Parse questions
  const questions: Question[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let currentOptions: {letter: string; text: string}[] = [];
  
  // First pass: Extract questions and options
  let questionNumber = 0;
  let inQuestion = false;
  let currentQuestionText = '';
  let currentOptionLetter = '';
  let currentOptionText = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and headers
    if (line === '' || line.includes('Modern Real Estate Practice') || line.includes('Kaplan')) {
      continue;
    }
    
    // Check if this is a new question
    const questionMatch = line.match(/^(\d+)\.\s+(.*)/);
    
    if (questionMatch) {
      // Save the previous question if there is one
      if (currentQuestion && currentOptions.length > 0) {
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion as Question);
      }
      
      // Start a new question
      questionNumber = parseInt(questionMatch[1]);
      currentQuestionText = questionMatch[2];
      
      // Continue reading the question text until we reach options
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().match(/^[a-d]\.\s+/i)) {
        const nextLine = lines[j].trim();
        if (nextLine !== '' && 
            !nextLine.includes('Modern Real Estate Practice') && 
            !nextLine.includes('Kaplan')) {
          currentQuestionText += ' ' + nextLine;
        }
        j++;
      }
      
      // Determine category based on keywords in the question
      let categoryName = 'Practice'; // Default category
      for (const [keyword, category] of Object.entries(categoryMap)) {
        if (currentQuestionText.toLowerCase().includes(keyword.toLowerCase())) {
          categoryName = category;
          break;
        }
      }
      
      currentQuestion = {
        text: currentQuestionText,
        categoryName,
        difficulty: 'medium', // Default difficulty
        explanation: ''  // No explanations provided in the file
      };
      
      currentOptions = [];
      inQuestion = true;
      
      // Skip to the next line as we've already processed this one
      continue;
    }
    
    // Check if this is an option
    const optionMatch = line.match(/^([a-d])\.\s+(.*)/i);
    
    if (optionMatch && inQuestion) {
      currentOptionLetter = optionMatch[1].toUpperCase();
      currentOptionText = optionMatch[2];
      
      // Check if the option continues on the next line
      let j = i + 1;
      while (j < lines.length && 
             !lines[j].trim().match(/^[a-d]\.\s+/i) && 
             !lines[j].trim().match(/^\d+\.\s+/)) {
        const nextLine = lines[j].trim();
        if (nextLine !== '' && 
            !nextLine.includes('Modern Real Estate Practice') && 
            !nextLine.includes('Kaplan')) {
          currentOptionText += ' ' + nextLine;
        }
        j++;
      }
      
      currentOptions.push({
        letter: currentOptionLetter,
        text: currentOptionText
      });
    }
  }
  
  // Save the last question
  if (currentQuestion && currentOptions.length > 0) {
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion as Question);
  }
  
  // Second pass: Find answers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for answer keys like "1. a"
    const answerMatch = line.match(/^(\d+)\.\s+([a-d])$/i);
    
    if (answerMatch) {
      const qNum = parseInt(answerMatch[1]);
      const answerLetter = answerMatch[2].toLowerCase();
      
      // Find the corresponding question
      const questionIndex = questions.findIndex(q => q.text.startsWith(`${qNum}.`));
      
      if (questionIndex !== -1) {
        // Find the option with this letter
        const answerOption = questions[questionIndex].options.find(
          opt => opt.letter.toLowerCase() === answerLetter
        );
        
        if (answerOption) {
          questions[questionIndex].answer = answerOption.text;
        }
      }
    }
  }
  
  // Filter out questions without answers
  const validQuestions = questions.filter(q => q.answer && q.options.length >= 2);
  
  console.log(`Parsed ${validQuestions.length} valid questions from the file`);
  
  // Add questions to database
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  for (const question of validQuestions) {
    try {
      // Strip question number from start if present
      question.text = question.text.replace(/^\d+\.\s+/, '');
      
      // Check if this question already exists
      const normalizedText = question.text.toLowerCase().trim();
      if (existingQuestions.has(normalizedText)) {
        console.log(`Skipping duplicate question: "${question.text.substring(0, 50)}..."`);
        skippedCount++;
        continue;
      }
      
      // Get the category ID
      const categoryId = await getOrCreateCategory(question.categoryName);
      
      // Insert the question
      const [savedQuestion] = await db
        .insert(schema.questions)
        .values({
          text: question.text,
          categoryId: categoryId,
          difficulty: question.difficulty,
          hasImage: false,
          isMultipleChoice: true,
          options: question.options
        })
        .returning();
      
      // Insert the answer
      await db
        .insert(schema.answers)
        .values({
          questionId: savedQuestion.id,
          text: question.answer,
          explanation: question.explanation || "This is a practice exam question from Modern Real Estate Practice."
        });
      
      // Update the category count
      await db
        .update(schema.categories)
        .set({ 
          questionCount: sql`${schema.categories.questionCount} + 1` 
        })
        .where(eq(schema.categories.id, categoryId));
      
      // Update the set of existing questions to avoid duplicates within this batch
      existingQuestions.add(normalizedText);
      
      addedCount++;
      console.log(`Added question: "${question.text.substring(0, 50)}..."`);
    } catch (error) {
      console.error('Error adding question:', error);
      errorsCount++;
    }
  }
  
  console.log('\n=========== KAPLAN QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
parseKaplanMockExam()
  .then(() => {
    console.log('Kaplan Mock Exam questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error parsing Kaplan Mock Exam:', error);
    process.exit(1);
  });