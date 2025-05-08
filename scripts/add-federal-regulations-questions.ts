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

async function addFederalRegulationsQuestions() {
  console.log('Starting to add federal regulations questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define federal regulations questions
  const questions: Question[] = [
    {
      text: "Which federal law eliminated redlining and prohibited discrimination in lending?",
      answer: "Equal Credit Opportunity Act (ECOA)",
      explanation: "The Equal Credit Opportunity Act (ECOA) of 1974 prohibits discrimination in lending based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance. ECOA eliminated redlining practices where lenders would refuse loans in certain neighborhoods based on demographic characteristics rather than creditworthiness.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Truth in Lending Act (TILA)" },
        { letter: "B", text: "Equal Credit Opportunity Act (ECOA)" },
        { letter: "C", text: "Real Estate Settlement Procedures Act (RESPA)" },
        { letter: "D", text: "Community Reinvestment Act (CRA)" }
      ]
    },
    {
      text: "What federal law requires lenders to provide a written estimate of settlement costs?",
      answer: "Real Estate Settlement Procedures Act (RESPA)",
      explanation: "The Real Estate Settlement Procedures Act (RESPA) requires lenders to provide borrowers with a Loan Estimate within three business days of receiving a loan application. This document outlines the estimated closing costs, helping consumers compare lenders and preventing unexpected fees at closing.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Fair Housing Act" },
        { letter: "B", text: "Truth in Lending Act" },
        { letter: "C", text: "Real Estate Settlement Procedures Act (RESPA)" },
        { letter: "D", text: "Home Mortgage Disclosure Act" }
      ]
    },
    {
      text: "What does TILA-RESPA Integrated Disclosure (TRID) require?",
      answer: "The provision of a Loan Estimate and Closing Disclosure to consumers during the mortgage process",
      explanation: "TRID requires lenders to provide two key documents: the Loan Estimate (given within 3 business days after application) and the Closing Disclosure (provided at least 3 business days before closing). These forms streamline and clarify loan information for consumers, combining requirements from the Truth in Lending Act and RESPA.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The licensing of all mortgage loan originators" },
        { letter: "B", text: "The provision of a Loan Estimate and Closing Disclosure to consumers during the mortgage process" },
        { letter: "C", text: "The reporting of all lending activities to the federal government" },
        { letter: "D", text: "The requirement for all real estate agents to disclose their commissions" }
      ]
    },
    {
      text: "What is the primary purpose of the Home Mortgage Disclosure Act (HMDA)?",
      answer: "To provide public loan data to identify discriminatory lending patterns",
      explanation: "The Home Mortgage Disclosure Act (HMDA) requires many financial institutions to maintain, report, and publicly disclose loan-level information about mortgages. This data helps show whether lenders are serving the housing needs of their communities, gives public officials information to distribute public-sector investments, and identifies possible discriminatory lending patterns.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To set limits on mortgage interest rates" },
        { letter: "B", text: "To provide public loan data to identify discriminatory lending patterns" },
        { letter: "C", text: "To regulate the foreclosure process" },
        { letter: "D", text: "To establish minimum down payment requirements" }
      ]
    },
    {
      text: "The Sherman Antitrust Act prohibits which real estate practice?",
      answer: "Price fixing of commission rates",
      explanation: "The Sherman Antitrust Act prohibits price fixing of commission rates among real estate brokers. Real estate professionals cannot agree on 'standard' commission rates, as this eliminates price competition and harms consumers. Each brokerage must independently establish its commission rates, and rates must be negotiable between brokers and their clients.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Offering buyer agency" },
        { letter: "B", text: "Price fixing of commission rates" },
        { letter: "C", text: "Providing property disclosures" },
        { letter: "D", text: "Marketing properties internationally" }
      ]
    },
    {
      text: "What federal law requires sellers to disclose known lead-based paint hazards in homes built before 1978?",
      answer: "Residential Lead-Based Paint Hazard Reduction Act",
      explanation: "The Residential Lead-Based Paint Hazard Reduction Act of 1992 (also known as Title X) requires sellers and landlords of pre-1978 housing to disclose known lead-based paint and lead-based paint hazards before selling or leasing, provide available records/reports, provide an EPA-approved pamphlet, and allow buyers a 10-day period to conduct a paint inspection or assessment.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Clean Air Act" },
        { letter: "B", text: "Residential Lead-Based Paint Hazard Reduction Act" },
        { letter: "C", text: "Safe Drinking Water Act" },
        { letter: "D", text: "Resource Conservation and Recovery Act" }
      ]
    },
    {
      text: "What is the primary purpose of the Foreign Investment in Real Property Tax Act (FIRPTA)?",
      answer: "To ensure foreign sellers of U.S. real property pay their tax obligations",
      explanation: "FIRPTA ensures foreign persons selling U.S. real property interests pay taxes on gains from those sales. It requires buyers to withhold a percentage of the purchase price (generally 15%) and remit it to the IRS. This withholding serves as an advance payment against the foreign seller's U.S. tax liability, since the IRS might have difficulty collecting from sellers who leave the country after the sale.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To limit foreign ownership of U.S. real estate" },
        { letter: "B", text: "To ensure foreign sellers of U.S. real property pay their tax obligations" },
        { letter: "C", text: "To provide tax incentives for foreign investment in U.S. real estate" },
        { letter: "D", text: "To require registration of all foreign-owned properties" }
      ]
    },
    {
      text: "What does the Community Reinvestment Act (CRA) require of financial institutions?",
      answer: "To meet the credit needs of the communities they serve, including low- and moderate-income neighborhoods",
      explanation: "The Community Reinvestment Act (CRA) requires federally insured depository institutions to meet the credit needs of the communities they serve, including low- and moderate-income neighborhoods. It was enacted to prevent redlining and encourage banks to help meet the credit needs of all segments of their communities through safe and sound lending practices.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To locate branches only in high-income areas" },
        { letter: "B", text: "To meet the credit needs of the communities they serve, including low- and moderate-income neighborhoods" },
        { letter: "C", text: "To provide free financial education to community members" },
        { letter: "D", text: "To invest primarily in government-backed securities" }
      ]
    },
    {
      text: "Which federal law prohibits kickbacks and unearned fees in real estate settlements?",
      answer: "Real Estate Settlement Procedures Act (RESPA)",
      explanation: "Section 8 of RESPA prohibits kickbacks, referral fees, and unearned fees in real estate settlements involving federally related mortgage loans. This provision prevents arrangements where service providers pay for referrals rather than competing on price and quality. Violations can result in significant penalties, including fines up to $10,000 and imprisonment up to one year.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Truth in Lending Act (TILA)" },
        { letter: "B", text: "Real Estate Settlement Procedures Act (RESPA)" },
        { letter: "C", text: "Fair Housing Act" },
        { letter: "D", text: "Equal Credit Opportunity Act" }
      ]
    },
    {
      text: "What does the Americans with Disabilities Act (ADA) require for commercial facilities?",
      answer: "Accessibility for individuals with disabilities",
      explanation: "The ADA requires public accommodations and commercial facilities to be accessible to individuals with disabilities. For real estate, this includes requirements for accessible entrances, pathways, restrooms, and other features. New construction must be fully accessible, while existing facilities must remove barriers when 'readily achievable.' This ensures equal opportunity for people with disabilities.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Accessibility for individuals with disabilities" },
        { letter: "B", text: "Energy efficiency standards" },
        { letter: "C", text: "Earthquake resistance" },
        { letter: "D", text: "Fire safety measures" }
      ]
    },
    {
      text: "Which federal law protects consumers by requiring accurate disclosure of loan costs and terms?",
      answer: "Truth in Lending Act (TILA)",
      explanation: "The Truth in Lending Act (TILA) protects consumers by requiring lenders to provide clear, accurate disclosure of loan terms and costs. Lenders must disclose the annual percentage rate (APR), finance charges, amount financed, total payments, and other key information in a standardized format, allowing consumers to understand the true cost of credit and compare offers from different lenders.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Truth in Lending Act (TILA)" },
        { letter: "B", text: "Real Estate Settlement Procedures Act (RESPA)" },
        { letter: "C", text: "Equal Credit Opportunity Act" },
        { letter: "D", text: "Fair Credit Reporting Act" }
      ]
    },
    {
      text: "Which federal law establishes minimum standards for flood insurance in high-risk zones?",
      answer: "National Flood Insurance Act",
      explanation: "The National Flood Insurance Act established the National Flood Insurance Program (NFIP), which requires properties in FEMA-designated high-risk flood zones with federally backed mortgages to have flood insurance. This program addresses the lack of private flood insurance availability and helps protect property owners from catastrophic losses due to flooding.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Coastal Barrier Resources Act" },
        { letter: "B", text: "Clean Water Act" },
        { letter: "C", text: "National Flood Insurance Act" },
        { letter: "D", text: "Disaster Relief Act" }
      ]
    },
    {
      text: "What does the Fair Credit Reporting Act (FCRA) regulate in real estate transactions?",
      answer: "The collection and use of consumer credit information",
      explanation: "The FCRA regulates how consumer credit information is collected, accessed, and used, including for real estate transactions. It gives consumers the right to access their credit reports, dispute inaccurate information, and receive notice when credit information is used against them. In real estate, this applies to mortgage applications, tenant screening, and other credit-based decisions.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The collection and use of consumer credit information" },
        { letter: "B", text: "The reporting of real estate sales to the IRS" },
        { letter: "C", text: "The credit terms offered by sellers" },
        { letter: "D", text: "The reporting of commission income by real estate agents" }
      ]
    },
    {
      text: "Which federal law protects homeowners from foreclosure without due process?",
      answer: "Due process clauses of the 5th and 14th Amendments",
      explanation: "The due process clauses of the 5th and 14th Amendments to the U.S. Constitution protect homeowners from foreclosure without proper legal procedures. These constitutional protections require notice and an opportunity to be heard before property can be taken. States have implemented these principles through specific foreclosure laws that outline required procedures.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Homeowner Protection Act" },
        { letter: "B", text: "Due process clauses of the 5th and 14th Amendments" },
        { letter: "C", text: "Foreclosure Prevention Act" },
        { letter: "D", text: "Fair Debt Collection Practices Act" }
      ]
    },
    {
      text: "Under the Dodd-Frank Act, which regulatory body oversees consumer financial protection in mortgage lending?",
      answer: "Consumer Financial Protection Bureau (CFPB)",
      explanation: "The Dodd-Frank Act created the Consumer Financial Protection Bureau (CFPB) to oversee consumer financial products and services, including mortgages. The CFPB enforces federal consumer financial laws, promotes transparency, and protects consumers from unfair, deceptive, or abusive practices in mortgage lending and other financial services.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Federal Reserve Board" },
        { letter: "B", text: "Federal Housing Administration" },
        { letter: "C", text: "Consumer Financial Protection Bureau (CFPB)" },
        { letter: "D", text: "Department of Housing and Urban Development" }
      ]
    },
    {
      text: "What is the purpose of the Secure and Fair Enforcement for Mortgage Licensing Act (SAFE Act)?",
      answer: "To establish minimum standards for mortgage loan originators",
      explanation: "The SAFE Act establishes minimum standards for mortgage loan originators (MLOs), including licensing/registration requirements, background checks, education requirements, and a nationwide database. It was designed to enhance consumer protection by ensuring that MLOs meet minimum qualifications and adhere to industry standards.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To establish minimum standards for mortgage loan originators" },
        { letter: "B", text: "To secure mortgages against cybersecurity threats" },
        { letter: "C", text: "To provide federal insurance for mortgage lenders" },
        { letter: "D", text: "To create a national mortgage lending institution" }
      ]
    },
    {
      text: "Which federal law requires property owners to disclose if their property is in a flood zone?",
      answer: "National Flood Insurance Act",
      explanation: "The National Flood Insurance Act, through its reforms and amendments, requires disclosure of a property's flood zone status during real estate transactions. This helps buyers understand flood risks and insurance requirements before purchasing. For properties in Special Flood Hazard Areas with federally backed mortgages, flood insurance is mandatory.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Clean Water Act" },
        { letter: "B", text: "National Flood Insurance Act" },
        { letter: "C", text: "Coastal Zone Management Act" },
        { letter: "D", text: "Environmental Protection Act" }
      ]
    },
    {
      text: "What federal agency administers the Fair Housing Act?",
      answer: "Department of Housing and Urban Development (HUD)",
      explanation: "The Department of Housing and Urban Development (HUD) administers and enforces the Fair Housing Act. HUD investigates complaints of housing discrimination, conducts compliance reviews, provides education and outreach, and can assess penalties for violations. State and local fair housing agencies often work alongside HUD in enforcement efforts.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Department of Housing and Urban Development (HUD)" },
        { letter: "B", text: "Federal Housing Administration (FHA)" },
        { letter: "C", text: "Department of Justice (DOJ)" },
        { letter: "D", text: "Equal Employment Opportunity Commission (EEOC)" }
      ]
    },
    {
      text: "Which is NOT a protected class under the federal Fair Housing Act?",
      answer: "Source of income",
      explanation: "Source of income is not a federally protected class under the Fair Housing Act, though some states and local jurisdictions have added this protection. The federal Fair Housing Act prohibits discrimination based on race, color, religion, sex (including gender identity and sexual orientation), disability, familial status, and national origin.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Race" },
        { letter: "B", text: "Religion" },
        { letter: "C", text: "Familial status" },
        { letter: "D", text: "Source of income" }
      ]
    },
    {
      text: "Under the Interstate Land Sales Full Disclosure Act, what must developers provide to potential buyers?",
      answer: "A property report with detailed information about the development",
      explanation: "The Interstate Land Sales Full Disclosure Act requires developers selling or leasing 100+ unimproved lots to provide potential buyers with a property report containing detailed information about the development, including title information, facilities, utilities, soil and water conditions, and more. This helps protect consumers from fraudulent land sales practices.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Only a simple brochure about the property" },
        { letter: "B", text: "A property report with detailed information about the development" },
        { letter: "C", text: "A federal tax identification number" },
        { letter: "D", text: "A statement of environmental impact only" }
      ]
    },
    {
      text: "What does the Emergency Planning and Community Right-to-Know Act require regarding real estate?",
      answer: "Disclosure of hazardous chemicals stored on commercial and industrial properties",
      explanation: "The Emergency Planning and Community Right-to-Know Act requires facilities to report hazardous chemicals stored or used on site to state and local authorities. For real estate, this affects commercial and industrial properties, creating public records that can be used during due diligence to identify potential environmental concerns with a property.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Disclosure of hazardous chemicals stored on commercial and industrial properties" },
        { letter: "B", text: "Emergency evacuation plans for all residential buildings" },
        { letter: "C", text: "Installation of emergency power generators" },
        { letter: "D", text: "Earthquake resistance certification" }
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
  
  console.log('\n=========== FEDERAL REGULATIONS QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFederalRegulationsQuestions()
  .then(() => {
    console.log('Federal regulations questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding federal regulations questions:', error);
    process.exit(1);
  });