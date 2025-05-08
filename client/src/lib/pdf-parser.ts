import { pdfjs } from 'react-pdf';

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface ParsedQuestion {
  text: string;
  answer?: string;
  explanation?: string;
  categoryHint?: string;
}

export interface ParsingOptions {
  extractExplanations: boolean;
  autoCategories: boolean;
}

export interface ParsingResult {
  questions: ParsedQuestion[];
  errors?: string[];
}

/**
 * Parses PDF data to extract questions, answers, and explanations
 */
export async function parsePdfContent(
  pdfData: ArrayBuffer, 
  options: ParsingOptions = { extractExplanations: true, autoCategories: true }
): Promise<ParsingResult> {
  try {
    const pdf = await pdfjs.getDocument({ data: pdfData }).promise;
    const numPages = pdf.numPages;
    let textContent = '';
    
    // Extract text from all pages
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      textContent += pageText + '\n';
    }
    
    // Extract questions and answers from the text
    return extractQuestionsAndAnswers(textContent, options);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return { 
      questions: [],
      errors: ['Failed to parse PDF: ' + (error instanceof Error ? error.message : String(error))]
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
  
  // Patterns to identify questions and answers
  // This is a basic implementation that may need refinement based on the 
  // specific format of the study materials
  
  // Look for patterns like:
  // 1. Question text?
  //    a) Wrong answer
  //    b) Correct answer
  //    c) Wrong answer
  //    d) Wrong answer
  //    Answer: b
  //    Explanation: Explanation text
  
  // Or:
  // Question: Question text?
  // Answer: Answer text
  // Explanation: Explanation text
  
  const questionPatterns = [
    /(\d+\.\s*)(.*?)(?=\d+\.\s*|$)/gs, // Numbered questions (1. Question text)
    /Question:\s*(.*?)(?=Answer:|$)/gs, // Questions labeled with "Question:"
    /(?:^|\n)([A-Z][\w\s]+\?)/g, // Questions ending with question mark
  ];
  
  const categoryKeywords: Record<string, string> = {
    'utah law': 'Utah State Law',
    'utah state': 'Utah State Law',
    'utah license': 'Utah State Law',
    'state law': 'Utah State Law',
    'federal law': 'Federal Regulations',
    'federal regulation': 'Federal Regulations',
    'contract': 'Contracts',
    'agreement': 'Contracts',
    'property': 'Property Ownership',
    'ownership': 'Property Ownership',
    'title': 'Property Ownership',
    'mortgage': 'Finance',
    'loan': 'Finance',
    'finance': 'Finance',
    'lien': 'Finance',
    'appraisal': 'Appraisal',
    'valuation': 'Appraisal',
  };
  
  // Apply our patterns to identify questions
  for (const pattern of questionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const questionText = match[1]?.trim() || match[0]?.trim();
      if (questionText && questionText.length > 10) {
        // Try to find the answer within 500 characters after the question
        const textAfterQuestion = text.substring(match.index + match[0].length, match.index + match[0].length + 500);
        
        // Look for answer
        let answer = '';
        const answerMatch = /Answer:\s*(.*?)(?=\n|Explanation:|$)/s.exec(textAfterQuestion);
        if (answerMatch) {
          answer = answerMatch[1].trim();
        }
        
        // Look for explanation if option is enabled
        let explanation = '';
        if (options.extractExplanations) {
          const explanationMatch = /Explanation:\s*(.*?)(?=\n\s*\d+\.|$)/s.exec(textAfterQuestion);
          if (explanationMatch) {
            explanation = explanationMatch[1].trim();
          }
        }
        
        // Try to determine category if option is enabled
        let categoryHint = '';
        if (options.autoCategories) {
          const combinedText = (questionText + ' ' + answer + ' ' + explanation).toLowerCase();
          
          // Check for category keywords
          for (const [keyword, category] of Object.entries(categoryKeywords)) {
            if (combinedText.includes(keyword)) {
              categoryHint = category;
              break;
            }
          }
        }
        
        // Add the question if we have enough data
        if (questionText && (answer || explanation)) {
          result.questions.push({
            text: questionText,
            answer,
            explanation: explanation || undefined,
            categoryHint: categoryHint || undefined,
          });
        }
      }
    }
  }
  
  if (result.questions.length === 0) {
    result.errors = ['No questions could be extracted from the document. The format may not be recognized.'];
  }
  
  return result;
}

/**
 * Parse a text file for questions and answers
 */
export async function parseTextContent(
  text: string,
  options: ParsingOptions = { extractExplanations: true, autoCategories: true }
): Promise<ParsingResult> {
  return extractQuestionsAndAnswers(text, options);
}

/**
 * Process an image file using OCR to extract text, then parse for questions
 * Note: This is a placeholder and would require integration with an OCR service
 */
export async function parseImageContent(
  imageData: ArrayBuffer | Blob,
  options: ParsingOptions = { extractExplanations: true, autoCategories: true }
): Promise<ParsingResult> {
  // This would need to be implemented with an OCR API
  // For now, return an error
  return {
    questions: [],
    errors: ['Image parsing requires OCR capabilities that are not implemented yet.']
  };
}
