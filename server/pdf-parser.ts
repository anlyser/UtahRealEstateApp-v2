import * as fs from 'fs';
import * as path from 'path';
import * as schema from '@shared/schema';
import { db } from '@db';
import { eq, sql } from 'drizzle-orm';

interface ParsedQuestion {
  text: string;
  answer?: string;
  explanation?: string;
  categoryHint?: string;
  options?: Array<{letter: string, text: string}>;
}

export interface ParsingOptions {
  extractExplanations: boolean;
  autoCategories: boolean;
  filename?: string;  // Filename property for better categorization
}

export interface ParsingResult {
  questions: ParsedQuestion[];
  errors?: string[];
}

/**
 * Parses PDF files to extract questions, answers, and explanations
 */
export async function parsePdfFile(
  filePath: string,
  options: ParsingOptions = { extractExplanations: true, autoCategories: true }
): Promise<ParsingResult> {
  try {
    console.log(`Parsing PDF file: ${filePath}`);
    
    // For this simplified example, we'll use a direct text extraction approach
    // In a production environment, you would use a proper PDF parsing library
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Use a simplified text extraction for this prototype
    // Assume this is plain text content from a PDF
    let textContent = fileContent;
    
    // Get filename from the path and add it to options
    const filename = path.basename(filePath);
    const optionsWithFilename = { ...options, filename };
    
    // Extract questions and answers from the text
    return extractQuestionsAndAnswers(textContent, optionsWithFilename);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    // For this prototype, let's create some sample questions
    // to demonstrate functionality
    const sampleQuestions: ParsedQuestion[] = [
      {
        text: "Which of the following is required for a valid real estate contract in Utah?",
        answer: "Written agreement with signatures of all parties",
        explanation: "Utah follows the Statute of Frauds requiring real estate contracts to be in writing and signed by all parties to be enforceable.",
        categoryHint: "Contracts"
      },
      {
        text: "What is the minimum age requirement to obtain a real estate license in Utah?",
        answer: "18 years",
        explanation: "Applicants must be at least 18 years old to be eligible for a real estate license in Utah.",
        categoryHint: "Utah State Law"
      },
      {
        text: "How long is a real estate license valid in Utah before renewal is required?",
        answer: "2 years",
        explanation: "Utah real estate licenses must be renewed every two years with completion of required continuing education.",
        categoryHint: "Utah State Law"
      }
    ];
    
    return { 
      questions: sampleQuestions,
      errors: ['Using sample questions due to PDF parsing error: ' + (error instanceof Error ? error.message : String(error))]
    };
  }
}

/**
 * Extract questions and answers from text content
 */
function extractQuestionsAndAnswers(
  text: string, 
  options: ParsingOptions
): ParsingResult {
  const result: ParsingResult = {
    questions: [],
  };
  
  // Enhanced implementation with multiple parsing strategies
  
  const categoryKeywords: Record<string, string> = {
    // Utah State Law keywords
    'utah law': 'Utah State Law',
    'utah state': 'Utah State Law',
    'utah license': 'Utah State Law',
    'state law': 'Utah State Law',
    'utah real estate': 'Utah State Law',
    'utah commission': 'Utah State Law',
    'division of real estate': 'Utah State Law',
    'utah code': 'Utah State Law',
    'administrative rules': 'Utah State Law',
    'licensing requirement': 'Utah State Law',
    
    // Federal Regulations keywords
    'federal law': 'Federal Regulations',
    'federal regulation': 'Federal Regulations',
    'respa': 'Federal Regulations',
    'tila': 'Federal Regulations',
    'truth in lending': 'Federal Regulations',
    'fair housing': 'Federal Regulations',
    'equal opportunity': 'Federal Regulations',
    'ada': 'Federal Regulations',
    'americans with disabilities': 'Federal Regulations',
    'antitrust': 'Federal Regulations',
    
    // Contracts keywords
    'contract': 'Contracts',
    'agreement': 'Contracts',
    'offer': 'Contracts',
    'repc': 'Contracts',
    'purchase contract': 'Contracts',
    'addendum': 'Contracts',
    'counteroffer': 'Contracts',
    'contingency': 'Contracts',
    'earnest money': 'Contracts',
    'sales contract': 'Contracts',
    'purchase agreement': 'Contracts',
    'option contract': 'Contracts',
    
    // Property Ownership keywords
    'property': 'Property Ownership',
    'ownership': 'Property Ownership',
    'title': 'Property Ownership',
    'deed': 'Property Ownership',
    'encumbrance': 'Property Ownership',
    'easement': 'Property Ownership',
    'conveyance': 'Property Ownership',
    'fee simple': 'Property Ownership',
    'leasehold': 'Property Ownership',
    'legal description': 'Property Ownership',
    'lot and block': 'Property Ownership',
    'metes and bounds': 'Property Ownership',
    
    // Finance keywords
    'mortgage': 'Finance',
    'loan': 'Finance',
    'finance': 'Finance',
    'lien': 'Finance',
    'interest': 'Finance',
    'apr': 'Finance',
    'escrow': 'Finance',
    'amortization': 'Finance',
    'down payment': 'Finance',
    'closing costs': 'Finance',
    'points': 'Finance',
    'discount points': 'Finance',
    'piti': 'Finance',
    
    // Appraisal keywords
    'appraisal': 'Appraisal',
    'valuation': 'Appraisal',
    'value': 'Appraisal',
    'market value': 'Appraisal',
    'market analysis': 'Appraisal',
    'cma': 'Appraisal',
    'comparative market analysis': 'Appraisal',
    'appraiser': 'Appraisal',
    'depreciation': 'Appraisal',
    'appreciation': 'Appraisal',
    'income approach': 'Appraisal',
    'sales comparison': 'Appraisal',
    'cost approach': 'Appraisal',
    
    // Agency keywords
    'agency': 'Agency',
    'agent': 'Agency',
    'broker': 'Agency',
    'fiduciary': 'Agency',
    'principal': 'Agency',
    'dual agency': 'Agency',
    'designated agency': 'Agency',
    'limited agent': 'Agency',
    'seller agent': 'Agency',
    'buyer agent': 'Agency',
    'transaction broker': 'Agency',
    'brokerage': 'Agency',
    'agency disclosure': 'Agency',
    
    // Taxation keywords
    'tax': 'Taxation',
    'deduction': 'Taxation',
    'depreciation': 'Taxation',
    'assessment': 'Taxation',
    'property tax': 'Taxation',
    'ad valorem': 'Taxation',
    'tax basis': 'Taxation',
    'capital gains': 'Taxation',
    '1031 exchange': 'Taxation',
    'tax lien': 'Taxation',
    
    // Practice keywords
    'practice': 'Practice',
    'exam': 'Practice',
    'test': 'Practice',
    'quiz': 'Practice',
    'practice test': 'Practice',
    'practice quiz': 'Practice',
    'review': 'Practice',
    'sample question': 'Practice',
    'study': 'Practice',
    'assessment': 'Practice'
  };
  
  try {
    // Split text into lines for processing
    let lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // First pass: Look for traditional Q&A format with explicit markers
    const questionsFromMarkers = extractQuestionsByMarkers(lines, options.autoCategories ? categoryKeywords : {});
    if (questionsFromMarkers.length > 0) {
      console.log(`Found ${questionsFromMarkers.length} questions using marker method`);
      result.questions.push(...questionsFromMarkers);
    }
    
    // Second pass: Look for numbered multiple choice questions
    if (result.questions.length === 0) {
      const multipleChoiceQuestions = extractMultipleChoiceQuestions(lines, options.autoCategories ? categoryKeywords : {});
      if (multipleChoiceQuestions.length > 0) {
        console.log(`Found ${multipleChoiceQuestions.length} multiple choice questions`);
        result.questions.push(...multipleChoiceQuestions);
      }
    }
    
    // Third pass: Look for question-answer pairs
    if (result.questions.length === 0) {
      const questionAnswerPairs = extractQuestionAnswerPairs(text, options.autoCategories ? categoryKeywords : {});
      if (questionAnswerPairs.length > 0) {
        console.log(`Found ${questionAnswerPairs.length} question-answer pairs`);
        result.questions.push(...questionAnswerPairs);
      }
    }
    
    // Fourth pass: Look for study guide format (term: definition)
    if (result.questions.length === 0) {
      const studyGuideTerms = extractStudyGuideTerms(lines, options.autoCategories ? categoryKeywords : {});
      if (studyGuideTerms.length > 0) {
        console.log(`Found ${studyGuideTerms.length} study guide terms`);
        result.questions.push(...studyGuideTerms);
      }
    }
    
    // If file has "Quiz" or "Exam" in the name, try one more specific approach
    if (result.questions.length === 0 && options.filename && 
        (options.filename.toLowerCase().includes('quiz') || 
         options.filename.toLowerCase().includes('exam') || 
         options.filename.toLowerCase().includes('practice'))) {
      const practiceQuestions = extractPracticeExamQuestions(text, options.autoCategories ? categoryKeywords : {});
      if (practiceQuestions.length > 0) {
        console.log(`Found ${practiceQuestions.length} practice exam questions`);
        result.questions.push(...practiceQuestions);
      }
    }
    
  } catch (error) {
    console.error('Error extracting questions:', error);
    result.errors = [`Error parsing document: ${error instanceof Error ? error.message : String(error)}`];
  }
  
  // If we couldn't extract any questions, provide some sample questions
  if (result.questions.length === 0) {
    console.log('No questions extracted, using sample questions');
    
    // Generate appropriate sample questions based on the filename
    result.questions = generateContextualSampleQuestions(options.filename || '');
    result.errors = ['Using sample questions because extraction failed or no questions were found in the document.'];
  } else {
    console.log(`Successfully extracted ${result.questions.length} questions`);
  }
  
  return result;
}

/**
 * Extract questions by looking for explicit Question/Answer markers
 */
function extractQuestionsByMarkers(lines: string[], categoryKeywords: Record<string, string>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for explicit question markers
    if ((line.startsWith('Q:') || line.startsWith('Question:') || /^\d+[\.\)]/.test(line)) && line.length > 5) {
      let questionText = line.replace(/^Q:|\d+[\.\)]|Question:/, '').trim();
      
      // If the question doesn't end with a question mark, look ahead a few lines to see if it continues
      if (!questionText.endsWith('?')) {
        for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
          const nextLine = lines[j].trim();
          // If we hit another question or an answer, stop
          if (nextLine.startsWith('Q:') || nextLine.startsWith('A:') || 
              nextLine.startsWith('Answer:') || /^\d+[\.\)]/.test(nextLine)) {
            break;
          }
          questionText += ' ' + nextLine;
          i = j; // Skip these lines in the main loop
        }
      }
      
      let answer = '';
      let explanation = '';
      
      // Look ahead for the answer
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        if (nextLine.startsWith('A:') || nextLine.startsWith('Answer:')) {
          answer = nextLine.replace(/^A:|Answer:/, '').trim();
          i = j; // Skip to after the answer in the main loop
          break;
        }
      }
      
      // Look ahead for explanation
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        if (nextLine.startsWith('Explanation:') || nextLine.startsWith('E:')) {
          explanation = nextLine.replace(/^Explanation:|E:/, '').trim();
          i = j; // Skip to after the explanation in the main loop
          break;
        }
      }
      
      // Determine category
      const categoryHint = determineCategoryFromText(questionText + ' ' + answer, categoryKeywords);
      
      // Add if we have a question and answer
      if (questionText && answer) {
        questions.push({
          text: questionText,
          answer,
          explanation: explanation || undefined,
          categoryHint: categoryHint || undefined
        });
      }
    }
  }
  
  return questions;
}

/**
 * Extract multiple choice questions
 */
function extractMultipleChoiceQuestions(lines: string[], categoryKeywords: Record<string, string>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for numbered questions
    const isNumberedQuestion = /^\d+[\.\)]/.test(line) && line.length > 10;
    const isQuestionLine = line.endsWith('?') || isNumberedQuestion;
    
    if (isQuestionLine) {
      let questionText = line.replace(/^\d+[\.\)]/, '').trim();
      let options: { letter: string, text: string }[] = [];
      let correctOption = '';
      let explanation = '';
      
      // Look for options (a, b, c, d, etc.)
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nextLine = lines[j].trim();
        
        if (nextLine.match(/^[A-Da-d][\.\)]/) && nextLine.length > 2) {
          const optionLetter = nextLine[0].toUpperCase();
          const optionText = nextLine.substring(2).trim();
          
          options.push({ letter: optionLetter, text: optionText });
          i = j; // Skip this line in the main loop
        } 
        // If we hit a marker for correct answer
        else if (nextLine.match(/^(Correct Answer|Answer):\s*[A-Da-d]$/i)) {
          correctOption = nextLine.match(/[A-Da-d]$/i)?.[0].toUpperCase() || '';
          i = j; // Skip this line in the main loop
          break;
        }
        // If we hit the next question, stop
        else if (/^\d+[\.\)]/.test(nextLine) || j > i + 6) {
          break;
        }
      }
      
      // If we found options but no marked correct answer, look for indications in the options
      if (options.length > 0 && !correctOption) {
        for (const option of options) {
          if (option.text.includes('(correct)') || option.text.includes('*')) {
            correctOption = option.letter;
            // Clean up the option text
            option.text = option.text.replace(/\(correct\)|\*/g, '').trim();
            break;
          }
        }
      }
      
      // Determine the answer text from the correct option
      let answer = '';
      if (correctOption) {
        const correctOptionObj = options.find(o => o.letter === correctOption);
        if (correctOptionObj) {
          answer = correctOptionObj.text;
        } else {
          answer = correctOption; // Just use the letter if we can't find the text
        }
      }
      
      // Determine category
      const categoryHint = determineCategoryFromText(questionText + ' ' + answer, categoryKeywords);
      
      // Add if we have a question and an answer
      if (questionText && answer) {
        // Only include options if we have at least 2 valid options
        const hasValidOptions = options.length >= 2;
        
        questions.push({
          text: questionText,
          answer,
          explanation: explanation || undefined,
          categoryHint: categoryHint || undefined,
          options: hasValidOptions ? options : undefined
        });
      }
    }
  }
  
  return questions;
}

/**
 * Extract question-answer pairs from free text
 */
function extractQuestionAnswerPairs(text: string, categoryKeywords: Record<string, string>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Look for question-answer patterns in the text
  const questionRegex = /(?:^|\n|\r)([^.?!]*\?)\s*([^?]*?)(?=\n|$|\r|\?)/g;
  let match;
  
  while ((match = questionRegex.exec(text)) !== null) {
    const questionText = match[1].trim();
    let answerText = match[2].trim();
    
    // Skip very short questions or answers
    if (questionText.length < 10 || answerText.length < 3) {
      continue;
    }
    
    // Determine category
    const categoryHint = determineCategoryFromText(questionText + ' ' + answerText, categoryKeywords);
    
    questions.push({
      text: questionText,
      answer: answerText,
      explanation: undefined,
      categoryHint: categoryHint || undefined
    });
  }
  
  return questions;
}

/**
 * Extract term-definition pairs from study guides
 */
function extractStudyGuideTerms(lines: string[], categoryKeywords: Record<string, string>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for terms with definitions (Term: Definition format)
    const termMatch = line.match(/^([^:]{3,50}):\s*(.+)$/);
    
    if (termMatch) {
      const term = termMatch[1].trim();
      const definition = termMatch[2].trim();
      
      // Skip if either part is too short
      if (term.length < 3 || definition.length < 10) {
        continue;
      }
      
      // Convert to a question format
      const questionText = `What is ${term}?`;
      
      // Determine category
      const categoryHint = determineCategoryFromText(term + ' ' + definition, categoryKeywords);
      
      questions.push({
        text: questionText,
        answer: definition,
        explanation: undefined,
        categoryHint: categoryHint || undefined
      });
    }
  }
  
  return questions;
}

/**
 * Special extraction for practice exam questions
 */
function extractPracticeExamQuestions(text: string, categoryKeywords: Record<string, string>): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  try {
    // Split by blocks that might be questions
    const blocks = text.split(/\n\s*\n/);
    
    for (const block of blocks) {
      // Basic check if it might be a question (has a number at the start)
      if (/^\s*\d+/.test(block)) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length < 2) continue;
        
        const firstLine = lines[0];
        const questionNumberMatch = firstLine.match(/^\s*(\d+)/);
        
        if (questionNumberMatch) {
          const questionNumber = questionNumberMatch[1];
          let questionText = firstLine.replace(/^\s*\d+[\.\)]\s*/, '');
          
          // Look for options in the following lines
          const options: {letter: string, text: string}[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            const optionMatch = line.match(/^\s*([A-Da-d])[\.\)]\s*(.+)/);
            
            if (optionMatch) {
              options.push({
                letter: optionMatch[1].toUpperCase(),
                text: optionMatch[2].trim()
              });
            }
          }
          
          // If we have options, look for any indicators of the correct answer
          let correctLetter = '';
          
          // Look for answer indicators like "Answer: B" or "1) C"
          for (const line of lines) {
            if (line.match(/Answer:\s*([A-Da-d])/i)) {
              const answerMatch = line.match(/Answer:\s*([A-Da-d])/i);
              if (answerMatch) {
                correctLetter = answerMatch[1].toUpperCase();
                break;
              }
            } else if (line.match(new RegExp(`${questionNumber}\\)\\s*([A-Da-d])`, 'i'))) {
              const answerMatch = line.match(new RegExp(`${questionNumber}\\)\\s*([A-Da-d])`, 'i'));
              if (answerMatch) {
                correctLetter = answerMatch[1].toUpperCase();
                break;
              }
            }
          }
          
          // If no direct answer indicator, look for * or (correct)
          if (!correctLetter && options.length > 0) {
            for (const option of options) {
              if (option.text.includes('*') || option.text.includes('(correct)')) {
                correctLetter = option.letter;
                // Clean up the text
                option.text = option.text.replace(/\*|\(correct\)/g, '').trim();
                break;
              }
            }
          }
          
          // Get the answer text from the correct letter
          let answerText = '';
          if (correctLetter) {
            const correctOption = options.find(opt => opt.letter === correctLetter);
            if (correctOption) {
              answerText = correctOption.text;
            }
          }
          
          // If we still don't have an answer, just use the first option as a fallback
          if (!answerText && options.length > 0) {
            answerText = options[0].text;
          }
          
          // Determine category if auto-categorization is enabled
          const categoryHint = determineCategoryFromText(questionText, categoryKeywords);
          
          // Only add if we have both a question and answer
          if (questionText && answerText) {
            // Only include options if we have at least 2 valid options
            const hasValidOptions = options.length >= 2;
            
            questions.push({
              text: questionText,
              answer: answerText,
              explanation: undefined,
              categoryHint,
              options: hasValidOptions ? options : undefined
            });
          }
        }
      }
    }
    
    return questions;
  } catch (error) {
    console.error('Error in extractPracticeExamQuestions:', error);
    return [];
  }
}

/**
 * Determine appropriate category from text based on keywords
 */
function determineCategoryFromText(text: string, categoryKeywords: Record<string, string>, filename?: string): string | undefined {
  const lowerText = text.toLowerCase();
  
  // First check the text content for category keywords
  for (const [keyword, category] of Object.entries(categoryKeywords)) {
    if (lowerText.includes(keyword)) {
      return category;
    }
  }
  
  // If a filename is provided and no category was found in the text, check the filename
  if (filename) {
    const lowerFilename = filename.toLowerCase();
    
    // Check for practice quizzes first
    if (lowerFilename.includes('practice') || lowerFilename.includes('quiz') || lowerFilename.includes('exam')) {
      return 'Practice';
    }
    
    // Check for appraisal related files
    if (lowerFilename.includes('appraisal') || lowerFilename.includes('valuation')) {
      return 'Appraisal';
    }
    
    // Check for property related files
    if (lowerFilename.includes('property') || lowerFilename.includes('ownership')) {
      return 'Property Ownership';
    }
    
    // Check for contracts related files
    if (lowerFilename.includes('contract') || lowerFilename.includes('agreement') || 
        lowerFilename.includes('repc') || lowerFilename.includes('addendum')) {
      return 'Contracts';
    }
    
    // Check for finance related files
    if (lowerFilename.includes('finance') || lowerFilename.includes('mortgage') || 
        lowerFilename.includes('loan') || lowerFilename.includes('lien')) {
      return 'Finance';
    }
    
    // Check for agency related files
    if (lowerFilename.includes('agency') || lowerFilename.includes('broker') || 
        lowerFilename.includes('agent')) {
      return 'Agency';
    }
    
    // Default to Utah State Law for most files if no other category matches
    return 'Utah State Law';
  }
  
  return undefined;
}

/**
 * Generate sample questions based on the file name to provide context-relevant samples
 */
function generateContextualSampleQuestions(filename: string): ParsedQuestion[] {
  const lowerFilename = filename.toLowerCase();
  
  // Default questions
  const defaultQuestions: ParsedQuestion[] = [
    {
      text: "Which of the following is required for a valid real estate contract in Utah?",
      answer: "Written agreement with signatures of all parties",
      explanation: "Utah follows the Statute of Frauds requiring real estate contracts to be in writing and signed by all parties to be enforceable.",
      categoryHint: "Contracts",
      options: [
        { letter: "A", text: "Verbal agreement between parties" },
        { letter: "B", text: "Written agreement with signatures of all parties" },
        { letter: "C", text: "Notary public seal" },
        { letter: "D", text: "Attorney approval" }
      ]
    },
    {
      text: "What is the minimum age requirement to obtain a real estate license in Utah?",
      answer: "18 years",
      explanation: "Applicants must be at least 18 years old to be eligible for a real estate license in Utah.",
      categoryHint: "Utah State Law",
      options: [
        { letter: "A", text: "16 years" },
        { letter: "B", text: "18 years" },
        { letter: "C", text: "21 years" },
        { letter: "D", text: "25 years" }
      ]
    },
    {
      text: "How long is a real estate license valid in Utah before renewal is required?",
      answer: "2 years",
      explanation: "Utah real estate licenses must be renewed every two years with completion of required continuing education.",
      categoryHint: "Utah State Law",
      options: [
        { letter: "A", text: "1 year" },
        { letter: "B", text: "2 years" },
        { letter: "C", text: "3 years" },
        { letter: "D", text: "5 years" }
      ]
    }
  ];
  
  // Contract-related questions
  if (lowerFilename.includes('contract') || lowerFilename.includes('repc') || lowerFilename.includes('agreement')) {
    return [
      {
        text: "What is the purpose of an earnest money deposit in a Utah real estate contract?",
        answer: "To show the buyer's good faith intention to complete the purchase",
        explanation: "Earnest money demonstrates the buyer's commitment and becomes part of the down payment if the sale proceeds.",
        categoryHint: "Contracts"
      },
      {
        text: "In Utah, what happens to earnest money if the buyer fails to perform without a valid contingency?",
        answer: "The seller may retain it as liquidated damages",
        explanation: "According to standard REPC terms, if the buyer fails to complete the purchase without a valid contingency, the earnest money can be retained by the seller as damages.",
        categoryHint: "Contracts"
      },
      {
        text: "What is a 'time is of the essence' clause in a Utah real estate contract?",
        answer: "It means all deadlines in the contract are material and must be strictly met",
        explanation: "This clause emphasizes that deadlines are critical, and failure to meet them can constitute a breach of contract.",
        categoryHint: "Contracts"
      }
    ];
  }
  
  // Finance-related questions
  else if (lowerFilename.includes('financ') || lowerFilename.includes('mortgage') || lowerFilename.includes('loan')) {
    return [
      {
        text: "What is the difference between a fixed-rate mortgage and an adjustable-rate mortgage?",
        answer: "A fixed-rate mortgage maintains the same interest rate for the life of the loan, while an adjustable-rate mortgage has an interest rate that can change periodically",
        explanation: "Fixed-rate mortgages provide payment stability, while ARMs typically offer lower initial rates that can increase or decrease based on market conditions.",
        categoryHint: "Finance"
      },
      {
        text: "What is PMI in real estate financing?",
        answer: "Private Mortgage Insurance, required for conventional loans with less than 20% down payment",
        explanation: "PMI protects the lender if the borrower defaults on the loan. It's typically required when the down payment is less than 20% of the purchase price.",
        categoryHint: "Finance"
      },
      {
        text: "What is an escrow account in mortgage financing?",
        answer: "An account maintained by the lender to pay property taxes and insurance",
        explanation: "The lender collects monthly payments for property taxes and insurance along with the mortgage payment, then pays these bills when they come due.",
        categoryHint: "Finance"
      }
    ];
  }
  
  // Agency-related questions
  else if (lowerFilename.includes('agency') || lowerFilename.includes('broker') || lowerFilename.includes('agent')) {
    return [
      {
        text: "What is the difference between a single agent and a dual agent in Utah?",
        answer: "A single agent represents only one party in a transaction, while a dual agent represents both buyer and seller",
        explanation: "Dual agency requires written informed consent from all parties and limits the agent's ability to fully represent either party's interests.",
        categoryHint: "Agency"
      },
      {
        text: "What duties does a real estate agent owe to their client in Utah?",
        answer: "Loyalty, confidentiality, obedience, reasonable care and diligence, accounting, and disclosure",
        explanation: "These fiduciary duties require the agent to act in the best interest of their client throughout the transaction.",
        categoryHint: "Agency"
      },
      {
        text: "What is a limited agent in Utah real estate?",
        answer: "An agent who represents both the buyer and seller with limitations on confidentiality and loyalty",
        explanation: "Limited agency allows an agent to facilitate a transaction for both parties, but with restrictions on what information can be disclosed to each party.",
        categoryHint: "Agency"
      }
    ];
  }
  
  // Property-related questions
  else if (lowerFilename.includes('property') || lowerFilename.includes('ownership') || lowerFilename.includes('title')) {
    return [
      {
        text: "What is the difference between real property and personal property?",
        answer: "Real property is land and anything permanently attached to it, while personal property is movable and not attached to land",
        explanation: "The distinction is important for determining how property is transferred, taxed, and legally treated.",
        categoryHint: "Property Ownership"
      },
      {
        text: "What is an easement in real estate?",
        answer: "A right to use another person's land for a specific purpose",
        explanation: "Common examples include utility easements, right-of-way easements, and private easements between neighbors.",
        categoryHint: "Property Ownership"
      },
      {
        text: "What is the difference between joint tenancy and tenancy in common?",
        answer: "Joint tenancy includes right of survivorship, while tenancy in common allows each owner to will their share to chosen beneficiaries",
        explanation: "In joint tenancy, when one owner dies, their interest automatically passes to the surviving owners. In tenancy in common, each owner can pass their interest to heirs.",
        categoryHint: "Property Ownership"
      }
    ];
  }
  
  // Law-related questions
  else if (lowerFilename.includes('law') || lowerFilename.includes('legal') || lowerFilename.includes('regulation')) {
    return [
      {
        text: "What is the purpose of the Real Estate Settlement Procedures Act (RESPA)?",
        answer: "To ensure consumers receive information about settlement costs and to prohibit kickbacks",
        explanation: "RESPA requires lenders to provide loan cost information to borrowers and prohibits certain practices like kickbacks for referrals.",
        categoryHint: "Federal Regulations"
      },
      {
        text: "What disclosure is required for homes built before 1978 under federal law?",
        answer: "Lead-Based Paint Disclosure",
        explanation: "Sellers and landlords must disclose known lead-based paint hazards and provide buyers and tenants with available reports and an EPA pamphlet.",
        categoryHint: "Federal Regulations"
      },
      {
        text: "What Utah-specific disclosure must sellers provide to buyers?",
        answer: "Seller Property Condition Disclosure (SPCD)",
        explanation: "This form requires sellers to disclose known material defects and other important property information to potential buyers.",
        categoryHint: "Utah State Law"
      }
    ];
  }
  
  // Appraisal-related questions
  else if (lowerFilename.includes('appraisal') || lowerFilename.includes('valu')) {
    return [
      {
        text: "What are the three approaches to value in real estate appraisal?",
        answer: "Sales Comparison Approach, Cost Approach, and Income Approach",
        explanation: "These three methods are used by appraisers to determine a property's value from different perspectives.",
        categoryHint: "Appraisal"
      },
      {
        text: "When is the Income Approach most appropriate for property valuation?",
        answer: "When appraising income-producing properties like apartment buildings or commercial properties",
        explanation: "The Income Approach values property based on its potential to generate income and is most relevant for investment properties.",
        categoryHint: "Appraisal"
      },
      {
        text: "What is the difference between market value and market price?",
        answer: "Market value is the estimated amount a property would sell for under typical market conditions, while market price is the actual amount paid",
        explanation: "Market value is an opinion based on analysis, while market price is the actual transaction amount, which may be influenced by atypical conditions.",
        categoryHint: "Appraisal"
      }
    ];
  }
  
  // Practice exam questions
  else if (lowerFilename.includes('practice') || lowerFilename.includes('exam') || lowerFilename.includes('quiz')) {
    return [
      {
        text: "Under which type of listing agreement does the broker earn a commission regardless of who sells the property?",
        answer: "Exclusive Right to Sell",
        explanation: "In an Exclusive Right to Sell listing, the broker receives a commission even if the seller finds the buyer without the broker's assistance.",
        categoryHint: "Agency"
      },
      {
        text: "What type of deed provides the greatest protection to the buyer?",
        answer: "General Warranty Deed",
        explanation: "A General Warranty Deed provides the most extensive guarantees, including protection against all title defects, even those from before the seller owned the property.",
        categoryHint: "Property Ownership"
      },
      {
        text: "A buyer's agent showing properties to their client owes what duty regarding property defects?",
        answer: "Duty to disclose known material defects",
        explanation: "A buyer's agent must disclose any material defects they know about that could affect the buyer's decision to purchase a property.",
        categoryHint: "Agency"
      }
    ];
  }
  
  // Default to general questions if no specific category is matched
  return defaultQuestions;
}

/**
 * Creates a category if it doesn't already exist
 */
async function getOrCreateCategory(name: string): Promise<schema.Category> {
  // Check if category exists
  const existingCategories = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, name));
  
  if (existingCategories.length > 0) {
    return existingCategories[0];
  }
  
  // Create new category
  const [newCategory] = await db
    .insert(schema.categories)
    .values({
      name,
      description: `Questions related to ${name}`,
    })
    .returning();
  
  return newCategory;
}

/**
 * Saves parsed questions to the database
 */
export async function saveQuestionsToDatabase(
  questions: ParsedQuestion[],
  sourceFilename?: string
): Promise<{ added: number; skipped: number; errors?: string[] }> {
  const errors: string[] = [];
  let addedCount = 0;
  let skippedCount = 0;
  
  try {
    // First check for existing questions to avoid duplicates
    const existingQuestions = new Set<string>();
    const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
    
    for (const q of allQuestions) {
      existingQuestions.add(q.text.toLowerCase().trim());
    }
    
    console.log(`Found ${existingQuestions.size} existing questions in the database`);
    
    // Process each question
    for (const question of questions) {
      try {
        // Skip questions that are too short
        if (!question.text || question.text.length < 10) {
          skippedCount++;
          continue;
        }
        
        // Check if this question already exists (case-insensitive comparison)
        const normalizedText = question.text.toLowerCase().trim();
        if (existingQuestions.has(normalizedText)) {
          console.log(`Skipping duplicate question: "${question.text.substring(0, 50)}..."`);
          skippedCount++;
          continue;
        }
        
        // Add to our set to prevent duplicates within the current batch
        existingQuestions.add(normalizedText);
        
        // Determine if this is a multiple choice question
        const isMultipleChoice = Array.isArray(question.options) && question.options.length > 0;
        
        // Determine category
        let categoryId = 1; // Default category ID
        
        if (question.categoryHint) {
          const category = await getOrCreateCategory(question.categoryHint);
          categoryId = category.id;
        }
        
        // If we have a filename, try to determine category from it
        if (sourceFilename) {
          const lowerFilename = sourceFilename.toLowerCase();
          
          // Check practice/quiz files
          if (lowerFilename.includes('practice') || lowerFilename.includes('quiz') || 
              lowerFilename.includes('exam')) {
            const practiceCategory = await getOrCreateCategory('Practice');
            categoryId = practiceCategory.id;
          }
          // Check for appraisal files
          else if (lowerFilename.includes('appraisal') || lowerFilename.includes('valuation')) {
            const appraisalCategory = await getOrCreateCategory('Appraisal');
            categoryId = appraisalCategory.id;
          }
          // Check for property files
          else if (lowerFilename.includes('property') || lowerFilename.includes('ownership')) {
            const propertyCategory = await getOrCreateCategory('Property Ownership');
            categoryId = propertyCategory.id;
          }
          // Check for finance files
          else if (lowerFilename.includes('mortgage') || lowerFilename.includes('loan') || 
                  lowerFilename.includes('financ')) {
            const financeCategory = await getOrCreateCategory('Finance');
            categoryId = financeCategory.id;
          }
          // Check for contract files
          else if (lowerFilename.includes('contract') || lowerFilename.includes('agreement') || 
                  lowerFilename.includes('addendum') || lowerFilename.includes('repc')) {
            const contractsCategory = await getOrCreateCategory('Contracts');
            categoryId = contractsCategory.id;
          }
          // Check for federal regulation files
          else if (lowerFilename.includes('federal') || lowerFilename.includes('respa') || 
                  lowerFilename.includes('tila') || lowerFilename.includes('fair housing')) {
            const federalCategory = await getOrCreateCategory('Federal Regulations');
            categoryId = federalCategory.id;
          }
        }
        
        // Create the question
        const [newQuestion] = await db
          .insert(schema.questions)
          .values({
            text: question.text,
            categoryId,
            difficulty: 'medium', // Default difficulty
            isMultipleChoice: isMultipleChoice,
            options: isMultipleChoice ? question.options : [],
          })
          .returning();
        
        // Create the answer
        await db
          .insert(schema.answers)
          .values({
            questionId: newQuestion.id,
            text: question.answer || 'No answer provided',
            explanation: question.explanation,
          });
        
        // Update category question count
        await db
          .update(schema.categories)
          .set({ 
            questionCount: sql`${schema.categories.questionCount} + 1` 
          })
          .where(eq(schema.categories.id, categoryId));
        
        addedCount++;
      } catch (error) {
        console.error('Error saving question:', error);
        errors.push(`Failed to save question: ${question.text.substring(0, 30)}...`);
      }
    }
    
    return { 
      added: addedCount, 
      skipped: skippedCount,
      errors: errors.length > 0 ? errors : undefined 
    };
  } catch (error) {
    console.error('Error in batch question saving:', error);
    return { 
      added: addedCount, 
      skipped: skippedCount,
      errors: [`Failed to complete question import: ${error instanceof Error ? error.message : String(error)}`] 
    };
  }
}