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

async function addKaplanQuestions() {
  console.log('Starting to add Kaplan Mock Exam questions (fixed version)...');
  
  // Check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Prepare the Kaplan questions (manually extracted from the file)
  const kaplanQuestions: Question[] = [
    {
      text: "The broker receives an earnest money deposit with a written offer to purchase that includes a 10-day acceptance clause. On the fifth day, before the offer is accepted, the buyer notifies the broker that she is withdrawing the offer and demands the return of her earnest money deposit. In this situation, the",
      options: [
        { letter: "A", text: "buyer cannot withdraw the offer because it must be held open for the full 10 days." },
        { letter: "B", text: "buyer can withdraw the offer and is entitled to a refund of the earnest money." },
        { letter: "C", text: "broker can keep the earnest money as compensation for time spent." },
        { letter: "D", text: "seller can accept the offer even after the buyer withdraws it." }
      ],
      answer: "buyer can withdraw the offer and is entitled to a refund of the earnest money.",
      explanation: "An offer can be withdrawn at any time before acceptance, even if it contains an acceptance period. The acceptance period only limits how long the seller has to respond, not how long the buyer must keep the offer open.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "What is the purpose of a plat map?",
      options: [
        { letter: "A", text: "To show property tax assessments" },
        { letter: "B", text: "To display the subdivision of land into lots" },
        { letter: "C", text: "To indicate zoning restrictions" },
        { letter: "D", text: "To document property ownership history" }
      ],
      answer: "To display the subdivision of land into lots",
      explanation: "A plat map is a diagram showing how a tract of land is divided into lots. It shows the boundaries, lot numbers, streets, easements, and sometimes other features like dimensions and setback requirements.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is the primary purpose of a listing agreement?",
      options: [
        { letter: "A", text: "To establish the sale price of the property" },
        { letter: "B", text: "To create a contract between the seller and buyer" },
        { letter: "C", text: "To establish an employment contract between the seller and broker" },
        { letter: "D", text: "To transfer ownership of the property" }
      ],
      answer: "To establish an employment contract between the seller and broker",
      explanation: "A listing agreement is an employment contract between a property owner (seller) and a real estate broker, authorizing the broker to find a buyer for the property under specified terms. It creates an agency relationship.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "What does the term 'procuring cause' mean in real estate?",
      options: [
        { letter: "A", text: "The broker who initially listed the property" },
        { letter: "B", text: "The broker who obtains the final offer on a property" },
        { letter: "C", text: "The uninterrupted series of events leading to a sale" },
        { letter: "D", text: "The agent who shows the property most frequently" }
      ],
      answer: "The uninterrupted series of events leading to a sale",
      explanation: "Procuring cause refers to the uninterrupted series of events that leads to a completed transaction. The broker who is the procuring cause of the sale is generally entitled to the commission, regardless of which broker wrote the final offer.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "Under the terms of a trust established by a will, the trustee is required to sell the real estate the trust holds. The deed that will be delivered at settlement of such a sale is a",
      options: [
        { letter: "A", text: "deed of release." },
        { letter: "B", text: "warranty deed." },
        { letter: "C", text: "trustee's deed." },
        { letter: "D", text: "trustor's deed." }
      ],
      answer: "trustee's deed.",
      explanation: "A trustee's deed is used when property is sold by a trustee acting on behalf of a trust. It conveys the interest that the trust held in the property to the buyer.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "An option is granted when an owner gives the potential purchaser the right to purchase the property",
      options: [
        { letter: "A", text: "at any time or price." },
        { letter: "B", text: "at a fixed price within a certain period of time." },
        { letter: "C", text: "without making any official record of the purchase." },
        { letter: "D", text: "none of these." }
      ],
      answer: "at a fixed price within a certain period of time.",
      explanation: "An option contract gives the potential buyer the right, but not the obligation, to purchase property at a predetermined price within a specified time period. The seller is obligated to sell if the buyer exercises the option.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "Which of the following best defines depreciation?",
      options: [
        { letter: "A", text: "Loss in value from any cause" },
        { letter: "B", text: "Loss in value due to physical deterioration only" },
        { letter: "C", text: "Tax deduction allowed for investment property" },
        { letter: "D", text: "Decrease in value due to poor location" }
      ],
      answer: "Loss in value from any cause",
      explanation: "Depreciation in real estate refers to the loss in value of a property from any cause, including physical deterioration, functional obsolescence, and external/economic obsolescence. The tax concept of depreciation is separate from its appraisal meaning.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "What is the primary purpose of RESPA (Real Estate Settlement Procedures Act)?",
      options: [
        { letter: "A", text: "To prevent discrimination in housing" },
        { letter: "B", text: "To regulate closing procedures and costs" },
        { letter: "C", text: "To establish licensing requirements for agents" },
        { letter: "D", text: "To set standards for property inspections" }
      ],
      answer: "To regulate closing procedures and costs",
      explanation: "RESPA was enacted to provide homebuyers and sellers with information on real estate settlement costs and to eliminate abusive practices in the settlement process. It requires lenders to disclose certain information and prohibits kickbacks.",
      categoryName: "Federal Regulations",
      difficulty: "medium"
    },
    {
      text: "The 'doctrine of emblements' refers to",
      options: [
        { letter: "A", text: "The right to harvest annual crops" },
        { letter: "B", text: "The transfer of riparian rights" },
        { letter: "C", text: "The use of fixtures on property" },
        { letter: "D", text: "The ownership of subsurface minerals" }
      ],
      answer: "The right to harvest annual crops",
      explanation: "The doctrine of emblements gives a tenant farmer who planted crops the right to enter the land and harvest those crops even after the lease has terminated, as long as the termination was not due to the tenant's actions.",
      categoryName: "Property Ownership",
      difficulty: "hard"
    },
    {
      text: "A deed that provides the MOST protection to the grantee is a",
      options: [
        { letter: "A", text: "general warranty deed." },
        { letter: "B", text: "special warranty deed." },
        { letter: "C", text: "quitclaim deed." },
        { letter: "D", text: "trustee's deed." }
      ],
      answer: "general warranty deed.",
      explanation: "A general warranty deed provides the most protection to the buyer (grantee) because it contains the broadest warranties. The grantor warrants against all defects in title for the entire history of the property, not just during their period of ownership.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  // Process each question
  for (const question of kaplanQuestions) {
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
  
  console.log('\n=========== KAPLAN QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addKaplanQuestions()
  .then(() => {
    console.log('Kaplan Mock Exam questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding Kaplan questions:', error);
    process.exit(1);
  });