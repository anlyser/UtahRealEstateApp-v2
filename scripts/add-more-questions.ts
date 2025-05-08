import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * This script adds more high-quality real estate exam preparation questions
 * specific to Utah real estate licensing exams.
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

async function addMoreQuestions() {
  console.log('Starting to add more Utah real estate exam questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define additional Utah-specific questions
  const questions: Question[] = [
    {
      text: "Under Utah law, how many hours of continuing education are required for a real estate license renewal?",
      answer: "18 hours",
      explanation: "In Utah, real estate licensees must complete 18 hours of continuing education during each two-year renewal period. This includes 9 core hours and 9 elective hours.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "9 hours" },
        { letter: "B", text: "12 hours" },
        { letter: "C", text: "18 hours" },
        { letter: "D", text: "24 hours" }
      ]
    },
    {
      text: "In Utah, what is the required length of the pre-licensing education course for a sales agent?",
      answer: "120 hours",
      explanation: "Utah requires prospective real estate sales agents to complete 120 hours of pre-licensing education before taking the state licensing exam.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "60 hours" },
        { letter: "B", text: "90 hours" },
        { letter: "C", text: "120 hours" },
        { letter: "D", text: "150 hours" }
      ]
    },
    {
      text: "According to Utah law, which of the following is NOT a requirement for obtaining a real estate license?",
      answer: "Be a Utah resident for at least 6 months",
      explanation: "Utah doesn't have a residency requirement for real estate licensees. Applicants must be at least 18 years old, have a high school diploma or equivalent, complete required education, pass background checks, and pass the licensing exam.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Be at least 18 years of age" },
        { letter: "B", text: "Complete required pre-licensing education" },
        { letter: "C", text: "Pass a background check" },
        { letter: "D", text: "Be a Utah resident for at least 6 months" }
      ]
    },
    {
      text: "Under Utah law, how long does a real estate licensee have to notify the Division of Real Estate of a change in their principal broker?",
      answer: "10 business days",
      explanation: "In Utah, agents must inform the Division of Real Estate of any change in principal broker within 10 business days of the change.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 business days" },
        { letter: "B", text: "10 business days" },
        { letter: "C", text: "30 calendar days" },
        { letter: "D", text: "60 calendar days" }
      ]
    },
    {
      text: "What is the purpose of the Utah Real Estate Recovery Fund?",
      answer: "To compensate consumers who have suffered monetary damages due to fraud, misrepresentation, or deceit by a real estate licensee",
      explanation: "The Utah Real Estate Recovery Fund provides financial assistance to consumers who have suffered monetary damages due to fraud, misrepresentation, or deceit by a real estate licensee when the licensee is unable to pay a court judgment.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To compensate consumers who have suffered monetary damages due to fraud, misrepresentation, or deceit by a real estate licensee" },
        { letter: "B", text: "To provide unemployment benefits to real estate agents during market downturns" },
        { letter: "C", text: "To fund the operations of the Utah Division of Real Estate" },
        { letter: "D", text: "To pay for continuing education for real estate licensees" }
      ]
    },
    {
      text: "What is the definition of 'adverse material fact' in Utah real estate law?",
      answer: "A fact that, if disclosed, might cause a buyer to make a different decision about purchasing the property",
      explanation: "An adverse material fact is information about a property that could significantly affect its value or a buyer's decision to purchase it. Agents have a duty to disclose known adverse material facts.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Any fact that makes a property less marketable" },
        { letter: "B", text: "A fact that, if disclosed, might cause a buyer to make a different decision about purchasing the property" },
        { letter: "C", text: "Information that is only known to the seller" },
        { letter: "D", text: "Physical defects that are visible during a property inspection" }
      ]
    },
    {
      text: "In Utah, what document must a real estate agent provide to prospective buyers and sellers at the first meeting?",
      answer: "State-approved agency disclosure form",
      explanation: "Utah law requires real estate agents to provide a state-approved agency disclosure form to prospective buyers and sellers at the first meeting. This form explains the types of agency relationships and the duties owed to clients.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Seller's property disclosure form" },
        { letter: "B", text: "State-approved agency disclosure form" },
        { letter: "C", text: "Lead-based paint disclosure" },
        { letter: "D", text: "Buyer's financial qualification statement" }
      ]
    },
    {
      text: "What is the legal term for the right of government to take private property for public use with just compensation?",
      answer: "Eminent domain",
      explanation: "Eminent domain is the power of the government to take private property for public use with payment of just compensation. It is a fundamental power of government and is often used for public projects like highways or utilities.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Escheat" },
        { letter: "B", text: "Police power" },
        { letter: "C", text: "Eminent domain" },
        { letter: "D", text: "Adverse possession" }
      ]
    },
    {
      text: "Which of the following best describes 'escheat' in real estate law?",
      answer: "The reversion of property to the state when an owner dies without heirs or a will",
      explanation: "Escheat is the reversion of property to the state when a property owner dies without heirs or a valid will. It prevents property from being ownerless and allows the state to take possession.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The reversion of property to the state when an owner dies without heirs or a will" },
        { letter: "B", text: "The right of a property owner to use their property as they choose" },
        { letter: "C", text: "The government's power to take private property for public use" },
        { letter: "D", text: "A restriction on property use due to zoning regulations" }
      ]
    },
    {
      text: "What type of mortgage allows the interest rate to change periodically based on market conditions?",
      answer: "Adjustable-rate mortgage (ARM)",
      explanation: "An adjustable-rate mortgage (ARM) features an interest rate that changes periodically based on an index that reflects market conditions. ARMs typically start with a lower interest rate than fixed-rate mortgages but may increase over time.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Fixed-rate mortgage" },
        { letter: "B", text: "Adjustable-rate mortgage (ARM)" },
        { letter: "C", text: "Balloon mortgage" },
        { letter: "D", text: "Interest-only mortgage" }
      ]
    },
    {
      text: "What is the term for the amount of time it would take to sell all currently listed properties if no new listings were added to the market?",
      answer: "Absorption rate",
      explanation: "The absorption rate measures how long it would take to sell all currently listed properties in a market at the current pace of sales, assuming no new listings are added. It's calculated by dividing the total number of available homes by the average number of sales per month.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Days on market" },
        { letter: "B", text: "List-to-sale ratio" },
        { letter: "C", text: "Absorption rate" },
        { letter: "D", text: "Turnover rate" }
      ]
    },
    {
      text: "What is the term for the difference between the market value of a property and the amount owed on the mortgage?",
      answer: "Equity",
      explanation: "Equity is the difference between the current market value of a property and the amount still owed on the mortgage. It represents the portion of the property that the owner truly 'owns.'",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Amortization" },
        { letter: "B", text: "Equity" },
        { letter: "C", text: "Escrow" },
        { letter: "D", text: "Principal" }
      ]
    },
    {
      text: "In real estate, what is a 'pocket listing'?",
      answer: "A property listing that is not entered into the MLS",
      explanation: "A pocket listing (also called an off-market listing) is a property listing retained by the listing broker and not entered into the Multiple Listing Service (MLS), making it accessible only to select buyers or agents. This practice is increasingly being regulated or restricted by many real estate associations.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A property listing that is not entered into the MLS" },
        { letter: "B", text: "A property listing that has expired" },
        { letter: "C", text: "A property that is being sold by the owner without an agent" },
        { letter: "D", text: "A listing with a reduced commission structure" }
      ]
    },
    {
      text: "What is the purpose of a property inspection contingency in a Utah REPC (Real Estate Purchase Contract)?",
      answer: "To allow the buyer to have the property professionally inspected and cancel the contract or request repairs based on the findings",
      explanation: "A property inspection contingency in a Utah REPC gives the buyer the right to have the property professionally inspected within a specified time period and, based on the inspection results, to request repairs, ask for a price reduction, or cancel the contract without penalty.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To give the seller time to make repairs before closing" },
        { letter: "B", text: "To allow the buyer to have the property professionally inspected and cancel the contract or request repairs based on the findings" },
        { letter: "C", text: "To ensure the property meets local building codes" },
        { letter: "D", text: "To give the lender time to approve the property value" }
      ]
    },
    {
      text: "Under the Utah Residential Rental Act, how much notice must a landlord give before entering a tenant's rental unit for non-emergency repairs or inspections?",
      answer: "24 hours",
      explanation: "According to the Utah Residential Rental Act, landlords must provide tenants with at least 24 hours' notice before entering the rental unit for non-emergency repairs, inspections, or showing the property to prospective tenants or buyers.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "No notice required" },
        { letter: "B", text: "12 hours" },
        { letter: "C", text: "24 hours" },
        { letter: "D", text: "48 hours" }
      ]
    }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  // Process each question
  for (const question of questions) {
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
  
  console.log('\n=========== QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreQuestions()
  .then(() => {
    console.log('Additional real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding additional questions:', error);
    process.exit(1);
  });