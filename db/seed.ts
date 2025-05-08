import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting seed process...");

    // Check if we already have categories
    const existingCategories = await db.select().from(schema.categories);
    
    if (existingCategories.length > 0) {
      console.log("Database already has categories, skipping category seeding.");
    } else {
      // Seed categories
      console.log("Seeding categories...");
      const categoriesData = [
        { name: "Utah State Law", description: "Utah-specific real estate laws and regulations" },
        { name: "Federal Regulations", description: "Federal laws affecting real estate transactions" },
        { name: "Contracts", description: "Real estate contracts and agreements" },
        { name: "Property Ownership", description: "Types of ownership and property rights" },
        { name: "Finance", description: "Real estate finance and mortgage topics" },
        { name: "Practice", description: "Real estate practice and procedures" },
        { name: "Appraisal", description: "Property valuation and appraisal methods" },
      ];

      for (const category of categoriesData) {
        await db.insert(schema.categories).values(category);
      }
      console.log("Categories seeded successfully.");
    }

    // Check if we already have questions
    const existingQuestions = await db.select().from(schema.questions);
    
    if (existingQuestions.length > 0) {
      console.log("Database already has questions, skipping question seeding.");
    } else {
      // Seed some sample questions for testing
      console.log("Seeding sample questions...");
      
      const categories = await db.select().from(schema.categories);
      const categoryMap = new Map(categories.map(c => [c.name, c.id]));

      // Sample questions and answers for each category
      const questionsData = [
        {
          text: "Which federal law requires lenders to provide borrowers with information about the terms and costs of consumer credit?",
          categoryId: categoryMap.get("Federal Regulations") || 2,
          answer: {
            text: "Truth in Lending Act (TILA)",
            explanation: "The Truth in Lending Act (TILA) is a federal law enacted in 1968 that requires lenders to provide standardized information about the terms and costs of credit to borrowers. It promotes the informed use of consumer credit by requiring disclosures about loan terms and costs."
          }
        },
        {
          text: "Under Utah law, what is the time period for a buyer to conduct due diligence in a residential real estate transaction?",
          categoryId: categoryMap.get("Utah State Law") || 1,
          answer: {
            text: "As specified in the REPC, typically 10-14 days",
            explanation: "The Utah Real Estate Purchase Contract (REPC) allows buyers to specify a due diligence period, commonly between 10-14 days, during which they can investigate the property's condition and review all relevant documents."
          }
        },
        {
          text: "In Utah, how many hours of continuing education are required for real estate license renewal?",
          categoryId: categoryMap.get("Utah State Law") || 1,
          answer: {
            text: "18 hours",
            explanation: "Utah real estate licensees must complete 18 hours of continuing education every two years for license renewal, including 9 hours of core topics and 9 hours of electives."
          }
        },
        {
          text: "What is the name for the right of a lender to take possession of the collateral in the event of default?",
          categoryId: categoryMap.get("Finance") || 5,
          answer: {
            text: "Foreclosure",
            explanation: "Foreclosure is the legal process by which a lender takes possession of a property when the borrower fails to make mortgage payments. It allows the lender to sell the property to recover the unpaid loan balance."
          }
        },
        {
          text: "What type of listing agreement gives a broker the exclusive right to earn a commission regardless of who sells the property?",
          categoryId: categoryMap.get("Contracts") || 3,
          answer: {
            text: "Exclusive Right to Sell",
            explanation: "An Exclusive Right to Sell listing agreement guarantees the broker a commission if the property sells during the listing period, regardless of who finds the buyer, even if the seller finds the buyer independently."
          }
        }
      ];

      // Insert sample questions and answers
      for (const question of questionsData) {
        const [insertedQuestion] = await db
          .insert(schema.questions)
          .values({
            text: question.text,
            categoryId: question.categoryId,
          })
          .returning();

        await db.insert(schema.answers).values({
          questionId: insertedQuestion.id,
          text: question.answer.text,
          explanation: question.answer.explanation,
        });
      }

      // Update question counts for each category
      for (const category of categories) {
        const count = await db
          .select({ count: schema.questions })
          .from(schema.questions)
          .where(eq(schema.questions.categoryId, category.id));
        
        await db
          .update(schema.categories)
          .set({ questionCount: count.length })
          .where(eq(schema.categories.id, category.id));
      }

      console.log("Sample questions seeded successfully.");
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
