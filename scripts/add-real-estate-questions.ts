import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * This script adds a set of high-quality real estate exam preparation questions
 * with multiple choice options, explanations, and proper categorization.
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

async function addRealEstateQuestions() {
  console.log('Starting to add real estate exam questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define the questions
  const questions: Question[] = [
    {
      text: "Which of the following best describes an 'encumbrance' in real estate?",
      answer: "A claim or liability against a property that may affect its title or value",
      explanation: "Encumbrances include anything that affects the clear title to a property, such as liens, easements, encroachments, or deed restrictions. They may limit the owner's use or reduce the property's value.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A claim or liability against a property that may affect its title or value" },
        { letter: "B", text: "The transfer of property ownership from one party to another" },
        { letter: "C", text: "The process of recording a deed at the county recorder's office" },
        { letter: "D", text: "A formal agreement between a buyer and seller to transfer property" }
      ]
    },
    {
      text: "In Utah, what is the minimum period for adverse possession to claim ownership of property?",
      answer: "7 years",
      explanation: "Utah law requires continuous, open, notorious, and hostile possession of property for at least 7 years, along with payment of all property taxes during that period, to make a claim for adverse possession.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "3 years" },
        { letter: "B", text: "5 years" },
        { letter: "C", text: "7 years" },
        { letter: "D", text: "10 years" }
      ]
    },
    {
      text: "Which of the following describes a 'fee simple absolute' estate?",
      answer: "The most complete form of property ownership with unlimited duration and rights to transfer",
      explanation: "Fee simple absolute is the highest form of ownership interest recognized by law. It gives the owner complete rights to use, possess, and dispose of the property with no time limitations, subject only to government powers.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Ownership that reverts to the grantor when a specified condition occurs" },
        { letter: "B", text: "Ownership for a person's lifetime that terminates upon death" },
        { letter: "C", text: "The most complete form of property ownership with unlimited duration and rights to transfer" },
        { letter: "D", text: "Joint ownership between spouses with right of survivorship" }
      ]
    },
    {
      text: "Under the Real Estate Settlement Procedures Act (RESPA), how many days before closing must the Closing Disclosure be provided to the borrower?",
      answer: "3 business days",
      explanation: "RESPA requires that borrowers receive the Closing Disclosure at least 3 business days before loan consummation (closing). This gives borrowers time to review final loan terms and costs before signing.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "1 business day" },
        { letter: "B", text: "3 business days" },
        { letter: "C", text: "7 business days" },
        { letter: "D", text: "10 business days" }
      ]
    },
    {
      text: "What is the purpose of a property survey in a real estate transaction?",
      answer: "To determine the exact boundaries and location of the property",
      explanation: "A property survey identifies the boundaries, size, and location of a property. It can reveal encroachments, easements, and other issues that might affect ownership rights or property use.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To determine the exact boundaries and location of the property" },
        { letter: "B", text: "To assess the market value of the property" },
        { letter: "C", text: "To identify environmental hazards on the property" },
        { letter: "D", text: "To evaluate the structural condition of buildings on the property" }
      ]
    },
    {
      text: "What type of listing agreement gives the broker the exclusive right to represent the seller, but allows the seller to sell the property without paying a commission?",
      answer: "Exclusive Agency Listing",
      explanation: "In an Exclusive Agency Listing, the broker is the only agent authorized to represent the seller, but the seller reserves the right to sell the property without owing a commission. This differs from an Exclusive Right to Sell listing, where the broker gets a commission regardless of who sells the property.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Open Listing" },
        { letter: "B", text: "Exclusive Right to Sell Listing" },
        { letter: "C", text: "Exclusive Agency Listing" },
        { letter: "D", text: "Net Listing" }
      ]
    },
    {
      text: "In Utah, what is the maximum amount of earnest money a broker can retain as a commission or part of a commission without written permission from the buyer and seller?",
      answer: "$0 (None)",
      explanation: "Under Utah law, a broker cannot retain any portion of the earnest money as a commission or part of a commission without express written permission from both buyer and seller. All earnest money must be properly accounted for according to the terms of the contract.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "$0 (None)" },
        { letter: "B", text: "$500" },
        { letter: "C", text: "$1,000" },
        { letter: "D", text: "Up to 3% of the purchase price" }
      ]
    },
    {
      text: "What is the purpose of a title insurance policy?",
      answer: "To protect against financial loss from defects in title to real property",
      explanation: "Title insurance protects the lender and/or owner against losses arising from defects in title, liens, encumbrances, or other title issues that weren't discovered during the title search. It provides protection from past events, unlike other insurance types that protect against future events.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To insure the property against physical damage" },
        { letter: "B", text: "To protect against financial loss from defects in title to real property" },
        { letter: "C", text: "To guarantee the property value won't decrease" },
        { letter: "D", text: "To ensure the property meets building code requirements" }
      ]
    },
    {
      text: "What is the difference between a general warranty deed and a special warranty deed?",
      answer: "A general warranty deed covers the entire history of the property, while a special warranty deed only covers the period when the grantor owned the property",
      explanation: "A general warranty deed provides the greatest protection to the buyer, with the grantor guaranteeing the title against all defects throughout the property's entire history. A special warranty deed only guarantees against defects that occurred during the grantor's ownership period.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A general warranty deed covers the entire history of the property, while a special warranty deed only covers the period when the grantor owned the property" },
        { letter: "B", text: "A general warranty deed is used for residential properties, while a special warranty deed is used for commercial properties" },
        { letter: "C", text: "A general warranty deed requires notarization, while a special warranty deed does not" },
        { letter: "D", text: "A general warranty deed transfers ownership, while a special warranty deed only grants permission to use the property" }
      ]
    },
    {
      text: "Which financing method allows a buyer to assume the seller's existing mortgage with the same terms and interest rate?",
      answer: "Assumable mortgage",
      explanation: "An assumable mortgage allows a buyer to take over the seller's existing mortgage with the same terms, including the interest rate. This can be beneficial when current market rates are higher than the existing mortgage rate. Not all mortgages are assumable, and lender approval is typically required.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Blanket mortgage" },
        { letter: "B", text: "Purchase money mortgage" },
        { letter: "C", text: "Assumable mortgage" },
        { letter: "D", text: "Package mortgage" }
      ]
    },
    {
      text: "What is an example of a latent defect in a property?",
      answer: "Foundation cracks hidden behind drywall",
      explanation: "A latent defect is a hidden flaw that isn't discoverable through reasonable inspection, such as foundation problems hidden behind walls, termite damage inside walls, or mold behind shower tiles. Sellers and agents have a duty to disclose known latent defects.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A broken window visible during a showing" },
        { letter: "B", text: "Foundation cracks hidden behind drywall" },
        { letter: "C", text: "A leaking roof that shows water stains on the ceiling" },
        { letter: "D", text: "Peeling paint on exterior walls" }
      ]
    },
    {
      text: "In a real estate appraisal, what is the primary purpose of the sales comparison approach?",
      answer: "To estimate a property's value by comparing it to similar recently sold properties",
      explanation: "The sales comparison approach (also called market data approach) determines value by comparing the subject property to similar properties that have recently sold in the area. Adjustments are made for differences between the properties. This is the most common approach for residential properties.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To estimate a property's value based on its potential rental income" },
        { letter: "B", text: "To estimate a property's value by determining the cost to rebuild it from scratch" },
        { letter: "C", text: "To estimate a property's value by comparing it to similar recently sold properties" },
        { letter: "D", text: "To estimate a property's value based on its current tax assessment" }
      ]
    },
    {
      text: "Under the Fair Housing Act, which of the following is NOT a protected class?",
      answer: "Income level",
      explanation: "The Fair Housing Act prohibits discrimination based on race, color, national origin, religion, sex (including gender identity and sexual orientation), familial status, and disability. Income level is not a federally protected class, though landlords cannot discriminate against tenants with housing subsidies in some states and localities.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "National origin" },
        { letter: "B", text: "Religion" },
        { letter: "C", text: "Familial status" },
        { letter: "D", text: "Income level" }
      ]
    },
    {
      text: "In Utah, what agency relationship is created when a real estate agent shows property to a prospective buyer without any written agency agreement?",
      answer: "Limited agent",
      explanation: "In Utah, when a real estate agent shows property to a prospective buyer without a written agency agreement, the agent is considered a limited agent by default. This means the agent has limited fiduciary duties to the buyer and still represents the seller's interests.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Single agent for the buyer" },
        { letter: "B", text: "Single agent for the seller" },
        { letter: "C", text: "Limited agent" },
        { letter: "D", text: "Designated agent" }
      ]
    },
    {
      text: "What is the primary purpose of a home inspection contingency in a real estate purchase contract?",
      answer: "To allow the buyer to cancel the contract or negotiate repairs based on inspection findings",
      explanation: "A home inspection contingency gives buyers the right to have the property professionally inspected and, based on the findings, they can request repairs, ask for a price reduction, or even terminate the contract without penalty within a specified time period.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To allow the seller to back out if the property has defects" },
        { letter: "B", text: "To allow the buyer to cancel the contract or negotiate repairs based on inspection findings" },
        { letter: "C", text: "To ensure the property meets local building codes" },
        { letter: "D", text: "To verify the square footage of the property" }
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
addRealEstateQuestions()
  .then(() => {
    console.log('Real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding real estate questions:', error);
    process.exit(1);
  });