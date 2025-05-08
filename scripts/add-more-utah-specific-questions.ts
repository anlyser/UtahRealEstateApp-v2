import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

// Helper function to get category ID or create if it doesn't exist
async function getOrCreateCategory(categoryName: string): Promise<number> {
  // First try to find the category
  const existingCategory = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, categoryName))
    .limit(1);
  
  if (existingCategory.length > 0) {
    return existingCategory[0].id;
  }
  
  // If it doesn't exist, create it
  const [newCategory] = await db
    .insert(schema.categories)
    .values({
      name: categoryName,
      description: `Questions related to ${categoryName}`,
      questionCount: 0
    })
    .returning();
  
  return newCategory.id;
}

// Define the Question interface
interface Question {
  text: string;
  answer: string;
  explanation: string;
  categoryName: string;
  difficulty: string;
  options: { letter: string; text: string }[];
}

async function addMoreUtahSpecificQuestions() {
  console.log('Starting to add MORE Utah-specific real estate exam questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define Utah-specific questions
  const questions: Question[] = [
    {
      text: "In Utah, what is the name of the standard form used for residential real estate purchase contracts?",
      answer: "REPC (Real Estate Purchase Contract)",
      explanation: "In Utah, the standard form for residential real estate purchases is called the Real Estate Purchase Contract (REPC). This standardized form is approved by the Utah Division of Real Estate and is used for most residential transactions in the state.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "REPC (Real Estate Purchase Contract)" },
        { letter: "B", text: "UPCA (Utah Property Contract Agreement)" },
        { letter: "C", text: "URPA (Utah Residential Purchase Agreement)" },
        { letter: "D", text: "USPC (Utah Standard Purchase Contract)" }
      ]
    },
    {
      text: "In Utah, what disclosure form is specifically required for vacant land transactions?",
      answer: "Seller's Property Condition Disclosure for Land",
      explanation: "In Utah, the Seller's Property Condition Disclosure for Land is specifically required for vacant land transactions. This form differs from the standard residential SPCD and addresses land-specific issues like access, water rights, environmental conditions, and encumbrances.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Vacant Land Transfer Disclosure" },
        { letter: "B", text: "Seller's Property Condition Disclosure for Land" },
        { letter: "C", text: "Utah Raw Land Condition Report" },
        { letter: "D", text: "Unimproved Property Statement" }
      ]
    },
    {
      text: "Under Utah law, how long does a buyer typically have to conduct a due diligence evaluation of a property?",
      answer: "The time period specified in the REPC",
      explanation: "In Utah, the buyer's due diligence period is not set by law but is negotiable and specified in the Real Estate Purchase Contract (REPC). This period allows the buyer to investigate the property's condition, review HOA documents, conduct inspections, etc., before becoming fully committed to the purchase.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "10 days" },
        { letter: "B", text: "15 days" },
        { letter: "C", text: "The time period specified in the REPC" },
        { letter: "D", text: "30 days" }
      ]
    },
    {
      text: "In Utah, what is the Lead-Based Paint Disclosure required for?",
      answer: "Homes built before 1978",
      explanation: "The Lead-Based Paint Disclosure is required for homes built before 1978. This requirement is actually federal (not specific to Utah), and it requires sellers to disclose known lead-based paint hazards, provide buyers with available reports, and give buyers a 10-day opportunity to test for lead.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "All homes" },
        { letter: "B", text: "Homes built before 1978" },
        { letter: "C", text: "Homes built before 1990" },
        { letter: "D", text: "Only multi-family properties" }
      ]
    },
    {
      text: "What form must Utah real estate licensees provide to all parties at first meeting?",
      answer: "Agency Disclosure Form",
      explanation: "In Utah, real estate licensees must provide the Agency Disclosure Form to all parties at their first meeting. This form explains the possible agency relationships (principal agent, limited agent, etc.) and must be signed before the parties enter into a binding agreement.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Property Condition Disclosure" },
        { letter: "B", text: "Agency Disclosure Form" },
        { letter: "C", text: "Lead-Based Paint Disclosure" },
        { letter: "D", text: "Buyer Due Diligence Checklist" }
      ]
    },
    {
      text: "In Utah, what is the statutory minimum age for signing a binding real estate contract?",
      answer: "18 years",
      explanation: "In Utah, as in most states, the statutory minimum age for signing a binding real estate contract is 18 years. Individuals under 18 (minors) are generally not considered to have legal capacity to enter into contracts, and any contracts they sign may be voidable.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "16 years" },
        { letter: "B", text: "18 years" },
        { letter: "C", text: "19 years" },
        { letter: "D", text: "21 years" }
      ]
    },
    {
      text: "In Utah, how often are property taxes typically paid?",
      answer: "Annually, due by November 30",
      explanation: "In Utah, property taxes are paid annually and are due by November 30th of each year. If not paid by this date, the taxes become delinquent and penalties and interest begin to accrue. Most mortgage lenders collect property taxes as part of the monthly mortgage payment and pay them through an escrow account.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Monthly" },
        { letter: "B", text: "Quarterly" },
        { letter: "C", text: "Semiannually" },
        { letter: "D", text: "Annually, due by November 30" }
      ]
    },
    {
      text: "In Utah, what type of deed is typically used in most residential real estate closings?",
      answer: "Warranty Deed",
      explanation: "In Utah, a Warranty Deed is typically used in most residential real estate closings. This deed provides the greatest protection to the buyer, as the seller warrants they have clear title to the property, have the right to convey it, and will defend the title against claims of third parties.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Quitclaim Deed" },
        { letter: "B", text: "Special Warranty Deed" },
        { letter: "C", text: "Warranty Deed" },
        { letter: "D", text: "Bargain and Sale Deed" }
      ]
    },
    {
      text: "Under Utah law, when must a seller's property condition disclosure be provided to the buyer?",
      answer: "Before the buyer makes an offer",
      explanation: "Under Utah law, the seller's property condition disclosure should be provided to the buyer before they make an offer. This allows the buyer to make an informed decision when determining their offer price and terms, and ensures they're aware of any known issues with the property.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "After the offer is accepted" },
        { letter: "B", text: "Before the buyer makes an offer" },
        { letter: "C", text: "At closing" },
        { letter: "D", text: "Within 10 days of signing the REPC" }
      ]
    },
    {
      text: "In Utah, what is considered a 'material fact' that must be disclosed in a real estate transaction?",
      answer: "Any fact that would affect a reasonable person's decision to complete the transaction",
      explanation: "In Utah, a material fact is any information that would affect a reasonable person's decision to complete a real estate transaction or affect the value or desirability of the property. Examples include structural issues, water damage, or boundary disputes. Agents and sellers must disclose all known material facts.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only facts specified in the state disclosure form" },
        { letter: "B", text: "Any fact that would affect a reasonable person's decision to complete the transaction" },
        { letter: "C", text: "Only defects visible during a standard inspection" },
        { letter: "D", text: "Only issues that affect the structural integrity of the home" }
      ]
    },
    {
      text: "In Utah, what is required for a valid real estate contract under the Statute of Frauds?",
      answer: "It must be in writing and signed by the party to be charged",
      explanation: "Under Utah's Statute of Frauds, all real estate contracts must be in writing and signed by the party to be charged (the party against whom enforcement is sought) to be legally enforceable. Verbal agreements for the sale of real estate are not enforceable in court.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "It must be in writing and signed by the party to be charged" },
        { letter: "B", text: "It must be notarized" },
        { letter: "C", text: "It must be reviewed by an attorney" },
        { letter: "D", text: "It must include a deed description" }
      ]
    },
    {
      text: "In Utah, what is the deadline for a buyer to respond to a seller's multiple counter offer?",
      answer: "The deadline specified in the counter offer",
      explanation: "In Utah, the deadline for a buyer to respond to a seller's multiple counter offer is whatever deadline is specified in that counter offer. If no deadline is specified, a reasonable time is implied. Multiple counter offers are used when sellers receive multiple offers and want to counter more than one of them.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "24 hours" },
        { letter: "B", text: "48 hours" },
        { letter: "C", text: "The deadline specified in the counter offer" },
        { letter: "D", text: "72 hours" }
      ]
    },
    {
      text: "What is the Utah Real Estate Recovery Fund?",
      answer: "A fund that compensates consumers who suffer monetary loss due to fraud by a licensed real estate agent",
      explanation: "The Utah Real Estate Recovery Fund is established by the Division of Real Estate to compensate consumers who suffer monetary losses due to fraud, misrepresentation, or deceit by a licensed real estate agent. Consumers must first obtain a court judgment against the licensee before applying to the fund.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A fund that compensates consumers who suffer monetary loss due to fraud by a licensed real estate agent" },
        { letter: "B", text: "An insurance fund for real estate brokers" },
        { letter: "C", text: "A retirement fund for real estate professionals" },
        { letter: "D", text: "A fund that pays for continuing education for agents" }
      ]
    },
    {
      text: "In Utah, who typically pays for the owner's title insurance policy?",
      answer: "The seller",
      explanation: "In Utah, by custom (not law), the seller typically pays for the owner's title insurance policy. This varies in different parts of the country, but in Utah, the seller usually pays for the owner's policy while the buyer pays for the lender's policy if they're obtaining a mortgage.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The buyer" },
        { letter: "B", text: "The seller" },
        { letter: "C", text: "The lender" },
        { letter: "D", text: "Split 50/50 between buyer and seller" }
      ]
    },
    {
      text: "What is the standard commission rate for real estate transactions in Utah?",
      answer: "There is no standard rate; commissions are negotiable",
      explanation: "There is no standard commission rate for real estate transactions in Utah. Commission rates are negotiable between the broker and the client, and fixing commission rates would violate federal antitrust laws. Any agent who claims there is a 'standard' rate is misrepresenting the facts.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "6%" },
        { letter: "B", text: "7%" },
        { letter: "C", text: "5%" },
        { letter: "D", text: "There is no standard rate; commissions are negotiable" }
      ]
    },
    {
      text: "In Utah, what is the purpose of a 'Notice of Default'?",
      answer: "To notify a borrower that they are in default on their mortgage and foreclosure proceedings may begin",
      explanation: "In Utah, a Notice of Default is a document filed by a lender to officially notify a borrower that they are in default on their mortgage loan. This is the first formal step in the foreclosure process, and it's typically filed after the borrower has missed several payments.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To notify a seller that a buyer cannot obtain financing" },
        { letter: "B", text: "To notify a buyer that a home inspection found defects" },
        { letter: "C", text: "To notify a borrower that they are in default on their mortgage and foreclosure proceedings may begin" },
        { letter: "D", text: "To notify an agent that their client is terminating their agreement" }
      ]
    },
    {
      text: "In Utah, what document grants the authority to foreclose on a property?",
      answer: "Deed of Trust",
      explanation: "In Utah, a Deed of Trust is the document that grants the authority to foreclose on a property if the borrower defaults on their loan. Utah uses a non-judicial foreclosure process, meaning foreclosures can proceed without court involvement when secured by a Deed of Trust with a power of sale clause.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Mortgage" },
        { letter: "B", text: "Deed of Trust" },
        { letter: "C", text: "Promissory Note" },
        { letter: "D", text: "Warranty Deed" }
      ]
    },
    {
      text: "In Utah, what is the reinstatement period in a foreclosure?",
      answer: "Up until the trustee's sale",
      explanation: "In Utah, the borrower has the right to reinstate their loan (bring it current by paying all past due amounts plus costs) at any time up until the trustee's sale. This differs from some states that have a specific reinstatement period that ends before the actual foreclosure sale.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "30 days from the Notice of Default" },
        { letter: "B", text: "90 days from the Notice of Default" },
        { letter: "C", text: "Up until the trustee's sale" },
        { letter: "D", text: "There is no reinstatement period" }
      ]
    },
    {
      text: "In Utah, what is the redemption period after a foreclosure sale?",
      answer: "There is no redemption period for non-judicial foreclosures",
      explanation: "In Utah, there is no redemption period after a non-judicial foreclosure sale (which is the most common type of foreclosure in Utah). This means the borrower cannot reclaim the property after the trustee's sale is complete. Only judicial foreclosures in Utah have a redemption period.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "6 months" },
        { letter: "B", text: "3 months" },
        { letter: "C", text: "1 year" },
        { letter: "D", text: "There is no redemption period for non-judicial foreclosures" }
      ]
    },
    {
      text: "Under Utah law, how long must a real estate agent keep transaction records?",
      answer: "At least 3 years from the date of closing",
      explanation: "Under Utah Administrative Rules, real estate licensees must maintain all transaction records for at least three years from the date of closing or, if the transaction didn't close, from the date of the event that terminated the transaction. This includes all contracts, disclosures, and communications.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "At least 1 year from the date of closing" },
        { letter: "B", text: "At least 3 years from the date of closing" },
        { letter: "C", text: "At least 5 years from the date of closing" },
        { letter: "D", text: "At least 7 years from the date of closing" }
      ]
    },
    {
      text: "What is the Utah Division of Real Estate's position on virtual assistants helping with real estate activities?",
      answer: "Virtual assistants cannot perform activities requiring a real estate license",
      explanation: "The Utah Division of Real Estate has clarified that virtual assistants, whether domestic or foreign-based, cannot perform activities requiring a real estate license. They can handle administrative tasks, but cannot engage in negotiating, showing properties, advising clients, or other licensed activities.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Virtual assistants can perform any real estate activities under the licensee's supervision" },
        { letter: "B", text: "Virtual assistants cannot perform activities requiring a real estate license" },
        { letter: "C", text: "Virtual assistants can only be used for social media marketing" },
        { letter: "D", text: "Virtual assistants are completely prohibited in real estate transactions" }
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
  
  console.log('\n=========== MORE UTAH-SPECIFIC QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreUtahSpecificQuestions()
  .then(() => {
    console.log('Additional Utah-specific real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding Utah-specific questions:', error);
    process.exit(1);
  });