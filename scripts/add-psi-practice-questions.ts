import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

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

async function addPSIPracticeQuestions() {
  console.log('Starting to add PSI Practice Exam questions...');
  
  // Check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define PSI practice questions manually based on the exam prep materials
  const psiQuestions: Question[] = [
    // Unit 1: General Principles of Agency
    {
      text: "What is dual agency?",
      options: [
        { letter: "A", text: "When a broker represents both a buyer and seller in the same transaction" },
        { letter: "B", text: "When a broker works for two different brokerages" },
        { letter: "C", text: "When a property has two owners" },
        { letter: "D", text: "When a buyer is purchasing two properties" }
      ],
      answer: "When a broker represents both a buyer and seller in the same transaction",
      explanation: "Dual agency occurs when a broker represents both the buyer and seller in the same transaction. This creates a potential conflict of interest and typically requires written disclosure and consent from both parties.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "What does a real estate agent owe to their client under a fiduciary relationship?",
      options: [
        { letter: "A", text: "Loyalty, obedience, disclosure, confidentiality, accounting, and reasonable care" },
        { letter: "B", text: "Only a duty to find properties" },
        { letter: "C", text: "A guarantee of successful transactions" },
        { letter: "D", text: "Whatever services are mentioned in marketing materials" }
      ],
      answer: "Loyalty, obedience, disclosure, confidentiality, accounting, and reasonable care",
      explanation: "Fiduciary duties can be remembered with the acronym OLDCAR: Obedience, Loyalty, Disclosure, Confidentiality, Accounting, and Reasonable care/skill. These are legal obligations the agent owes to their client.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "Under which type of agency relationship would a real estate broker have the duty to discover and disclose material facts about a property to the principal?",
      options: [
        { letter: "A", text: "Dual agency" },
        { letter: "B", text: "Designated agency" },
        { letter: "C", text: "Single agency" },
        { letter: "D", text: "Transaction brokerage" }
      ],
      answer: "Single agency",
      explanation: "In a single agency relationship, the broker represents only one party (buyer or seller) and has full fiduciary duties to that client, including the duty to discover and disclose material facts about the property to their principal.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "Which of the following relationships includes the fiduciary duty of confidentiality?",
      options: [
        { letter: "A", text: "Facilitator" },
        { letter: "B", text: "Independent contractor" },
        { letter: "C", text: "Agency relationship" },
        { letter: "D", text: "Customer relationship" }
      ],
      answer: "Agency relationship",
      explanation: "An agency relationship includes all fiduciary duties, including confidentiality. The agent must keep the client's confidential information private and not disclose it without permission, except when required by law.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    
    // Unit 2: Contracts
    {
      text: "Which of the following is NOT an essential element of a valid contract?",
      options: [
        { letter: "A", text: "Offer and acceptance" },
        { letter: "B", text: "Consideration" },
        { letter: "C", text: "Written form" },
        { letter: "D", text: "Legal capacity of the parties" }
      ],
      answer: "Written form",
      explanation: "While many real estate contracts must be in writing to be enforceable under the Statute of Frauds, written form is not a universal essential element of all valid contracts. The essential elements are: offer and acceptance, consideration, legal capacity, and lawful purpose.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "What is an option contract in real estate?",
      options: [
        { letter: "A", text: "The right to purchase property at a set price within a specified time period" },
        { letter: "B", text: "A contract with multiple financing options" },
        { letter: "C", text: "A contract that gives the seller options for closing" },
        { letter: "D", text: "A lease with an option to extend" }
      ],
      answer: "The right to purchase property at a set price within a specified time period",
      explanation: "An option contract gives the potential buyer the right, but not the obligation, to purchase a property at a predetermined price within a specified time period. The seller is obligated to sell if the buyer exercises the option.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "What makes a contract voidable?",
      options: [
        { letter: "A", text: "It contains illegal terms" },
        { letter: "B", text: "One party lacks legal capacity" },
        { letter: "C", text: "It is not in writing" },
        { letter: "D", text: "The offer was never accepted" }
      ],
      answer: "One party lacks legal capacity",
      explanation: "A voidable contract is one that can be cancelled by one party due to certain factors like lack of capacity (minors or mentally incompetent individuals), fraud, misrepresentation, duress, or undue influence. The contract is valid until voided.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "What is a bilateral contract?",
      options: [
        { letter: "A", text: "A contract between two countries" },
        { letter: "B", text: "A contract where both parties make promises to each other" },
        { letter: "C", text: "A contract with two separate agreements" },
        { letter: "D", text: "A contract that requires two witnesses" }
      ],
      answer: "A contract where both parties make promises to each other",
      explanation: "A bilateral contract involves mutual promises between two parties, where each party promises to do something in exchange for the other's promise. Most real estate contracts are bilateral, with the buyer promising to pay and the seller promising to convey title.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    
    // Unit 3: Practice of Real Estate
    {
      text: "What is a comparative market analysis (CMA) used for?",
      options: [
        { letter: "A", text: "To determine property tax assessments" },
        { letter: "B", text: "To estimate a property's value for listing purposes" },
        { letter: "C", text: "To calculate mortgage interest rates" },
        { letter: "D", text: "To measure property dimensions" }
      ],
      answer: "To estimate a property's value for listing purposes",
      explanation: "A comparative market analysis (CMA) is a tool used by real estate professionals to estimate a property's value by comparing it to similar properties that have recently sold in the same area. This helps determine an appropriate listing price.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "What does the term 'procuring cause' refer to in real estate?",
      options: [
        { letter: "A", text: "The legal process of eviction" },
        { letter: "B", text: "The real estate professional who is entitled to the commission" },
        { letter: "C", text: "The uninterrupted series of events leading to a completed sale" },
        { letter: "D", text: "The cause of property defects" }
      ],
      answer: "The uninterrupted series of events leading to a completed sale",
      explanation: "Procuring cause refers to the uninterrupted series of events that leads to a completed transaction. The broker who is the procuring cause of the sale is generally entitled to the commission, regardless of which broker wrote the final offer.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "What does net listing mean?",
      options: [
        { letter: "A", text: "A listing with a fixed commission" },
        { letter: "B", text: "A listing where the broker guarantees a minimum price to the seller" },
        { letter: "C", text: "A listing where the broker receives all proceeds above a specified amount" },
        { letter: "D", text: "A listing requiring internet marketing" }
      ],
      answer: "A listing where the broker receives all proceeds above a specified amount",
      explanation: "A net listing is an arrangement where the seller specifies a minimum amount they want to receive from the sale, and the broker keeps any additional amount as commission. This type of listing is illegal in many states due to its potential for abuse.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "What is a pocket listing?",
      options: [
        { letter: "A", text: "A listing for a very small property" },
        { letter: "B", text: "A listing not shared in the MLS" },
        { letter: "C", text: "A listing with a very low commission" },
        { letter: "D", text: "A listing that has expired" }
      ],
      answer: "A listing not shared in the MLS",
      explanation: "A pocket listing (or office exclusive) is a listing that is not entered into the Multiple Listing Service (MLS). The listing broker keeps it 'in their pocket' and markets it privately, often to their own sphere of contacts or within their brokerage.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    
    // Unit 4: Financing
    {
      text: "What is the loan-to-value (LTV) ratio?",
      options: [
        { letter: "A", text: "The percentage of a property's value that is mortgaged" },
        { letter: "B", text: "The ratio of loan applications to loan approvals" },
        { letter: "C", text: "The value of a loan compared to the borrower's income" },
        { letter: "D", text: "The relationship between loan interest and property appreciation" }
      ],
      answer: "The percentage of a property's value that is mortgaged",
      explanation: "The loan-to-value (LTV) ratio is calculated by dividing the loan amount by the appraised value of the property, expressed as a percentage. For example, an $80,000 loan on a $100,000 property would have an 80% LTV ratio.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What is private mortgage insurance (PMI)?",
      options: [
        { letter: "A", text: "Insurance that pays off the mortgage if the borrower dies" },
        { letter: "B", text: "Insurance that protects the lender if the borrower defaults" },
        { letter: "C", text: "Insurance that covers property damage" },
        { letter: "D", text: "Insurance that protects against title defects" }
      ],
      answer: "Insurance that protects the lender if the borrower defaults",
      explanation: "Private Mortgage Insurance (PMI) protects the lender in case the borrower defaults on the loan. It's typically required for conventional loans with less than 20% down payment and can be removed once the LTV ratio reaches 78-80%.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What is a conforming loan?",
      options: [
        { letter: "A", text: "A loan that conforms to the borrower's requirements" },
        { letter: "B", text: "A loan that meets Fannie Mae and Freddie Mac guidelines" },
        { letter: "C", text: "A loan that conforms to FHA standards" },
        { letter: "D", text: "A loan with terms that conform to state regulations" }
      ],
      answer: "A loan that meets Fannie Mae and Freddie Mac guidelines",
      explanation: "A conforming loan is one that meets the guidelines set by Fannie Mae and Freddie Mac, including loan limits and certain underwriting criteria. These loans can be purchased by these government-sponsored enterprises, which helps maintain liquidity in the mortgage market.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What happens during the underwriting process?",
      options: [
        { letter: "A", text: "The title is searched for defects" },
        { letter: "B", text: "The loan officer calculates the borrower's fees" },
        { letter: "C", text: "The lender evaluates the borrower's creditworthiness and the property" },
        { letter: "D", text: "The contract terms are negotiated" }
      ],
      answer: "The lender evaluates the borrower's creditworthiness and the property",
      explanation: "Underwriting is the process where the lender evaluates the risk of making a loan to a specific borrower for a specific property. They analyze the borrower's credit history, income, assets, debts, and property details to determine if the loan meets their criteria.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    
    // Unit 5: Valuation and Market Analysis
    {
      text: "Which appraisal approach is most appropriate for income-producing properties?",
      options: [
        { letter: "A", text: "Sales comparison approach" },
        { letter: "B", text: "Cost approach" },
        { letter: "C", text: "Income capitalization approach" },
        { letter: "D", text: "Replacement approach" }
      ],
      answer: "Income capitalization approach",
      explanation: "The income capitalization approach is most appropriate for income-producing properties like apartment buildings, office buildings, and retail properties. It values a property based on its potential income, applying a capitalization rate to the property's net operating income.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "What is functional obsolescence in appraisal?",
      options: [
        { letter: "A", text: "Physical deterioration of a property" },
        { letter: "B", text: "Loss in value due to factors outside the property" },
        { letter: "C", text: "Loss in value due to outdated or poor design features" },
        { letter: "D", text: "When a property becomes too old to use" }
      ],
      answer: "Loss in value due to outdated or poor design features",
      explanation: "Functional obsolescence refers to a loss in value due to outdated features, poor design, or changes in market preferences that make a property less desirable. Examples include insufficient bathrooms, outdated layouts, or inadequate electrical systems.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "In the cost approach to valuation, what is depreciation?",
      options: [
        { letter: "A", text: "The tax deduction allowed for investment property" },
        { letter: "B", text: "The difference between reproduction cost and market value" },
        { letter: "C", text: "Loss in value from any cause" },
        { letter: "D", text: "The cost of maintaining the property" }
      ],
      answer: "Loss in value from any cause",
      explanation: "In the cost approach to valuation, depreciation refers to any loss in value from any cause, including physical deterioration, functional obsolescence, and external/economic obsolescence. It's subtracted from the cost to build new to estimate current value.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "What does the gross rent multiplier (GRM) measure?",
      options: [
        { letter: "A", text: "The relationship between a property's price and its gross rental income" },
        { letter: "B", text: "The annual increase in rental rates" },
        { letter: "C", text: "The profit margin for rental properties" },
        { letter: "D", text: "The ratio of operating expenses to rental income" }
      ],
      answer: "The relationship between a property's price and its gross rental income",
      explanation: "The Gross Rent Multiplier (GRM) is a simple method for estimating property value based on its rental income. It's calculated by dividing the property's sale price by its annual (or sometimes monthly) gross rental income. It provides a quick way to compare similar properties.",
      categoryName: "Appraisal",
      difficulty: "medium"
    }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  // Process each question
  for (const question of psiQuestions) {
    try {
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
          explanation: question.explanation
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
  
  console.log('\n=========== PSI PRACTICE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addPSIPracticeQuestions()
  .then(() => {
    console.log('PSI Practice Exam questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding PSI practice questions:', error);
    process.exit(1);
  });