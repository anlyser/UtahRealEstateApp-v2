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

async function addMoreLawQuestions() {
  console.log('Starting to add more real estate law questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more law questions
  const questions: Question[] = [
    {
      text: "Which federal act requires banks to disclose information about their lending patterns to regulators?",
      answer: "Home Mortgage Disclosure Act (HMDA)",
      explanation: "The Home Mortgage Disclosure Act (HMDA) requires many financial institutions to maintain, report, and publicly disclose loan-level information about mortgages. This data helps show whether lenders are serving the housing needs of their communities, gives public officials information to distribute public-sector investments, and helps identify possible discriminatory lending patterns.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Fair Housing Act" },
        { letter: "B", text: "Home Mortgage Disclosure Act (HMDA)" },
        { letter: "C", text: "Equal Credit Opportunity Act" },
        { letter: "D", text: "Community Reinvestment Act" }
      ]
    },
    {
      text: "Under the Foreign Investment in Real Property Tax Act (FIRPTA), what is typically withheld from foreign sellers of U.S. real property?",
      answer: "15% of the sales price",
      explanation: "FIRPTA requires buyers to withhold 15% of the sales price when purchasing U.S. real property from foreign persons. This withholding serves as an advance payment toward the foreign seller's U.S. tax liability. The withholding rate can be reduced under certain circumstances, but 15% is the standard rate since 2016.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "10% of the sales price" },
        { letter: "B", text: "15% of the sales price" },
        { letter: "C", text: "20% of the sales price" },
        { letter: "D", text: "30% of the net gain" }
      ]
    },
    {
      text: "What federal law protects service members from certain financial hardships during military service, including protections against foreclosure?",
      answer: "Servicemembers Civil Relief Act (SCRA)",
      explanation: "The Servicemembers Civil Relief Act (SCRA) provides financial and legal protections for active-duty military personnel. In real estate, it limits interest rates to 6% on pre-service debts, protects against foreclosure without a court order, allows lease termination under certain conditions, and provides eviction protection for service members and their families.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Military Lending Act" },
        { letter: "B", text: "Uniformed Services Employment Act" },
        { letter: "C", text: "Servicemembers Civil Relief Act (SCRA)" },
        { letter: "D", text: "Veterans Benefits Act" }
      ]
    },
    {
      text: "What federal law requires lenders to provide borrowers with a Loan Estimate within three business days of receiving a loan application?",
      answer: "TILA-RESPA Integrated Disclosure Rule (TRID)",
      explanation: "The TILA-RESPA Integrated Disclosure Rule (TRID) requires lenders to provide a Loan Estimate within three business days after receiving a loan application. This document details the estimated loan terms, projected payments, and closing costs, helping borrowers understand the full cost of their mortgage and compare offers from different lenders.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Real Estate Settlement Procedures Act (RESPA)" },
        { letter: "B", text: "Truth in Lending Act (TILA)" },
        { letter: "C", text: "TILA-RESPA Integrated Disclosure Rule (TRID)" },
        { letter: "D", text: "Equal Credit Opportunity Act (ECOA)" }
      ]
    },
    {
      text: "What is the purpose of a 'Closing Disclosure' form under TRID regulations?",
      answer: "To provide final details about loan terms and closing costs before closing",
      explanation: "The Closing Disclosure is a five-page form that provides final details about the mortgage loan, including loan terms, projected monthly payments, and closing costs. Lenders must provide this document to borrowers at least three business days before closing, giving borrowers time to review the final terms and ensure they match the Loan Estimate.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To provide final details about loan terms and closing costs before closing" },
        { letter: "B", text: "To disclose the agent's commission" },
        { letter: "C", text: "To confirm that the property has officially closed" },
        { letter: "D", text: "To document the transfer of funds between parties" }
      ]
    },
    {
      text: "Which federal law prohibits discrimination in mortgage lending based on race, color, religion, sex, or national origin?",
      answer: "Equal Credit Opportunity Act (ECOA)",
      explanation: "The Equal Credit Opportunity Act (ECOA) prohibits discrimination in any aspect of a credit transaction based on race, color, religion, national origin, sex, marital status, age, receipt of public assistance, or exercise of rights under consumer protection laws. In real estate, this applies to mortgage lending, ensuring fair access to financing.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Equal Credit Opportunity Act (ECOA)" },
        { letter: "B", text: "Fair Housing Act" },
        { letter: "C", text: "Community Reinvestment Act" },
        { letter: "D", text: "Federal Fair Lending Act" }
      ]
    },
    {
      text: "Which federal law requires financial institutions to help meet the credit needs of the communities they serve?",
      answer: "Community Reinvestment Act (CRA)",
      explanation: "The Community Reinvestment Act (CRA) encourages depository institutions to help meet the credit needs of the communities they serve, including low- and moderate-income neighborhoods. Regulators assess and rate institutions' CRA performance, and these ratings are considered when approving applications for mergers, acquisitions, and branch openings.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Equal Credit Opportunity Act" },
        { letter: "B", text: "Fair Housing Act" },
        { letter: "C", text: "Community Reinvestment Act (CRA)" },
        { letter: "D", text: "Home Mortgage Disclosure Act" }
      ]
    },
    {
      text: "What federal law addresses deceptive advertising in real estate?",
      answer: "Federal Trade Commission Act",
      explanation: "The Federal Trade Commission Act prohibits unfair or deceptive advertising in all industries, including real estate. This covers false claims about property features, misleading statements about financing terms, deceptive pricing information, and misrepresentations of available services. The FTC can take action against companies and individuals who engage in deceptive advertising practices.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Truth in Advertising Act" },
        { letter: "B", text: "Federal Trade Commission Act" },
        { letter: "C", text: "Real Estate Marketing Act" },
        { letter: "D", text: "Federal Communications Act" }
      ]
    },
    {
      text: "Which federal law established the minimum age for purchasing or consuming alcohol as 21 years?",
      answer: "National Minimum Drinking Age Act",
      explanation: "The National Minimum Drinking Age Act of 1984 established 21 as the minimum legal age for purchasing or publicly consuming alcoholic beverages. Though not directly a real estate law, it affects property owners who sell or serve alcohol, such as restaurants, bars, and event venues, creating compliance requirements for these real estate uses.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Controlled Substances Act" },
        { letter: "B", text: "Federal Alcohol Administration Act" },
        { letter: "C", text: "National Minimum Drinking Age Act" },
        { letter: "D", text: "Alcohol Beverage Control Act" }
      ]
    },
    {
      text: "Which Utah-specific form must be provided to all parties in a real estate transaction at the first meeting?",
      answer: "Agency Disclosure Form",
      explanation: "In Utah, real estate agents must provide the Agency Disclosure Form to all parties at their first meeting. This form explains possible agency relationships (seller's agent, buyer's agent, limited agent, etc.) and must be signed before the parties enter into any binding agreement. This requirement helps ensure consumers understand who the agent represents in the transaction.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Seller's Property Condition Disclosure" },
        { letter: "B", text: "Agency Disclosure Form" },
        { letter: "C", text: "Lead-Based Paint Disclosure" },
        { letter: "D", text: "Buyer Due Diligence Checklist" }
      ]
    },
    {
      text: "In Utah, what is the required renewal period for real estate licenses?",
      answer: "Every two years",
      explanation: "In Utah, real estate licenses must be renewed every two years. Licensees must complete 18 hours of continuing education during each renewal period, including 9 core hours and 9 elective hours. The renewal date is based on the licensee's birth month, with renewal due by the last day of the licensee's birth month.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Every year" },
        { letter: "B", text: "Every two years" },
        { letter: "C", text: "Every three years" },
        { letter: "D", text: "Every four years" }
      ]
    },
    {
      text: "In Utah, what is the minimum amount of continuing education required for a real estate license renewal?",
      answer: "18 hours",
      explanation: "Utah real estate licensees must complete a minimum of 18 hours of continuing education for each renewal period. This includes 9 hours of core topics (specified by the Utah Division of Real Estate) and 9 hours of elective topics. All continuing education must be completed through division-approved education providers.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "12 hours" },
        { letter: "B", text: "15 hours" },
        { letter: "C", text: "18 hours" },
        { letter: "D", text: "24 hours" }
      ]
    },
    {
      text: "In Utah, what form is used for residential real estate purchase transactions?",
      answer: "Real Estate Purchase Contract (REPC)",
      explanation: "In Utah, the standard form used for residential real estate purchase transactions is the Real Estate Purchase Contract (REPC). This standardized form, approved by the Utah Division of Real Estate, includes sections for purchase price, financing, title, inspections, settlement deadlines, and other important terms of the transaction.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Residential Sales Agreement" },
        { letter: "B", text: "Utah Property Transfer Form" },
        { letter: "C", text: "Real Estate Purchase Contract (REPC)" },
        { letter: "D", text: "Uniform Residential Offer to Purchase" }
      ]
    },
    {
      text: "In Utah, what is the typical 'due diligence' period for residential transactions?",
      answer: "The time specified in the REPC (typically 10-14 days)",
      explanation: "In Utah, the due diligence period is negotiable and specified in the Real Estate Purchase Contract (REPC). While there's no legally mandated period, 10-14 days is typical for residential transactions. During this time, buyers can conduct inspections, review HOA documents, research the property, and evaluate their financing options before deciding whether to proceed with the purchase.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 days" },
        { letter: "B", text: "7 days" },
        { letter: "C", text: "The time specified in the REPC (typically 10-14 days)" },
        { letter: "D", text: "30 days" }
      ]
    },
    {
      text: "In Utah, what type of legal theory applies to water rights?",
      answer: "Prior appropriation ('first in time, first in right')",
      explanation: "Utah follows the prior appropriation doctrine for water rights, often summarized as 'first in time, first in right.' This means water rights are prioritized based on when they were first established, with earlier appropriations having senior rights over later ones. In times of shortage, senior water rights are satisfied completely before junior rights receive any water.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Riparian rights" },
        { letter: "B", text: "Prior appropriation ('first in time, first in right')" },
        { letter: "C", text: "Correlative rights" },
        { letter: "D", text: "English common law" }
      ]
    },
    {
      text: "In Utah, what is the administrative body that regulates real estate licensees?",
      answer: "Utah Division of Real Estate",
      explanation: "The Utah Division of Real Estate, part of the Department of Commerce, regulates real estate licensees in Utah. It administers licensing exams, issues licenses, enforces real estate laws and rules, investigates complaints against licensees, and provides education to the public. The Division is overseen by the Real Estate Commission, which establishes policy and rules.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Utah Real Estate Commission" },
        { letter: "B", text: "Utah Department of Real Estate" },
        { letter: "C", text: "Utah Division of Real Estate" },
        { letter: "D", text: "Utah Real Estate Board" }
      ]
    },
    {
      text: "In Utah, what disclosure form is specifically required for vacant land transactions?",
      answer: "Seller's Property Condition Disclosure Form for Land",
      explanation: "In Utah, the Seller's Property Condition Disclosure Form for Land is specifically required for vacant land transactions. This form differs from the standard residential disclosure form and addresses issues specific to land, such as access, water rights, environmental conditions, and encumbrances. Sellers must complete this form truthfully to the best of their knowledge.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Vacant Land Transfer Disclosure" },
        { letter: "B", text: "Seller's Property Condition Disclosure Form for Land" },
        { letter: "C", text: "Utah Land Condition Report" },
        { letter: "D", text: "Unimproved Property Statement" }
      ]
    },
    {
      text: "In Utah, what is the statutory redemption period after a non-judicial foreclosure sale?",
      answer: "None - there is no statutory redemption period",
      explanation: "In Utah, there is no statutory redemption period after a non-judicial foreclosure sale, which is the most common type of foreclosure in the state. Once the trustee's sale is complete, the borrower cannot reclaim the property. In contrast, judicial foreclosures (which are rare in Utah) do provide a six-month redemption period.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "3 months" },
        { letter: "B", text: "6 months" },
        { letter: "C", text: "1 year" },
        { letter: "D", text: "None - there is no statutory redemption period" }
      ]
    },
    {
      text: "In Utah, what is required to create a valid deed?",
      answer: "Written document, grantor and grantee identification, property description, words of conveyance, grantor's signature, and proper delivery and acceptance",
      explanation: "In Utah, a valid deed requires a written document, identification of the grantor (seller) and grantee (buyer), a legal description of the property, words of conveyance expressing intent to transfer ownership, the grantor's signature, and proper delivery to and acceptance by the grantee. While notarization and recording provide additional legal protections, they are not strictly required for validity between the parties.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Written document, grantor and grantee identification, property description, words of conveyance, grantor's signature, and proper delivery and acceptance" },
        { letter: "B", text: "Verbal agreement between buyer and seller witnessed by an attorney" },
        { letter: "C", text: "Only the signature of the grantor on any document describing the property" },
        { letter: "D", text: "Recording at the county recorder's office is the only requirement" }
      ]
    },
    {
      text: "In Utah, what is NOT required to be disclosed about a property during a real estate transaction?",
      answer: "That a former occupant had AIDS",
      explanation: "In Utah, sellers and agents are not required to disclose that a former occupant had AIDS or HIV. Utah law specifically states that this is not a material fact requiring disclosure. Similarly, deaths on the property (including suicide and homicide) and rumored paranormal activity are not considered material facts requiring disclosure under Utah law.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Known material defects in the property" },
        { letter: "B", text: "Existence of a homeowners association" },
        { letter: "C", text: "That a former occupant had AIDS" },
        { letter: "D", text: "Lead-based paint in homes built before 1978" }
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
  
  console.log('\n=========== MORE LAW QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreLawQuestions()
  .then(() => {
    console.log('More law questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more law questions:', error);
    process.exit(1);
  });