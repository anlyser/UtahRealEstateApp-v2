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

async function addMoreFederalQuestions() {
  console.log('Starting to add more federal regulation questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more federal regulation questions
  const questions: Question[] = [
    {
      text: "Under the Americans with Disabilities Act (ADA), what is a 'reasonable accommodation' in housing?",
      answer: "A change in rules, policies, practices, or services necessary for a person with a disability to have equal opportunity to use and enjoy a dwelling",
      explanation: "A reasonable accommodation under the ADA and Fair Housing Act is a change in rules, policies, practices, or services necessary for a person with a disability to have equal opportunity to use and enjoy a dwelling. Examples include allowing service animals in a no-pets building, providing designated parking spaces, or permitting physical modifications to a unit. Accommodations are considered 'reasonable' unless they impose an undue financial or administrative burden on the housing provider or fundamentally alter the nature of operations.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A change in rules, policies, practices, or services necessary for a person with a disability to have equal opportunity to use and enjoy a dwelling" },
        { letter: "B", text: "An accommodation that costs less than $500 to implement" },
        { letter: "C", text: "Installing wheelchair ramps in every building" },
        { letter: "D", text: "Making all entrances handicap accessible" }
      ]
    },
    {
      text: "Under the Truth in Lending Act (TILA), what is the primary purpose of the Loan Estimate?",
      answer: "To provide borrowers with detailed information about loan terms and estimated costs before they commit to a mortgage",
      explanation: "The Loan Estimate's primary purpose under TILA is to provide borrowers with detailed information about loan terms and estimated costs before they commit to a mortgage. This standardized three-page form must be provided within three business days after a loan application is submitted. It shows key details like loan amount, interest rate, monthly payments, estimated closing costs, and potential changes over time, allowing borrowers to understand their loan terms and comparison shop between lenders.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To provide borrowers with detailed information about loan terms and estimated costs before they commit to a mortgage" },
        { letter: "B", text: "To legally bind lenders to the exact terms presented" },
        { letter: "C", text: "To establish the final costs at closing" },
        { letter: "D", text: "To determine if a borrower qualifies for a mortgage" }
      ]
    },
    {
      text: "What is the purpose of the Secure and Fair Enforcement for Mortgage Licensing Act (SAFE Act)?",
      answer: "To establish minimum standards for state licensing and registration of mortgage loan originators",
      explanation: "The SAFE Act was enacted in 2008 to establish minimum standards for state licensing and registration of mortgage loan originators (MLOs). It aims to enhance consumer protection by requiring MLOs to be licensed through the Nationwide Mortgage Licensing System and Registry (NMLS), pass criminal background checks, complete pre-licensure education, pass a written test, and meet continuing education requirements. The Act helps prevent fraud and ensures MLOs meet minimum competency and ethical standards.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To prevent foreclosures during economic downturns" },
        { letter: "B", text: "To establish minimum standards for state licensing and registration of mortgage loan originators" },
        { letter: "C", text: "To secure mortgage documents against identity theft" },
        { letter: "D", text: "To regulate mortgage interest rates" }
      ]
    },
    {
      text: "What is a key provision of the Interstate Land Sales Full Disclosure Act (ILSA)?",
      answer: "It requires developers of certain interstate land sales to register with HUD and provide property reports to potential buyers",
      explanation: "A key provision of ILSA is that it requires developers selling or leasing 25 or more unimproved lots across state lines to register their subdivision with HUD and provide comprehensive property reports to potential buyers before sale. These reports must disclose important information about the land, including title status, road access, utilities, flood hazards, and developer obligations. The Act aims to prevent fraud and misrepresentation in interstate land sales through mandatory disclosure requirements.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "It prohibits the sale of land across state lines without congressional approval" },
        { letter: "B", text: "It requires developers of certain interstate land sales to register with HUD and provide property reports to potential buyers" },
        { letter: "C", text: "It imposes a federal tax on interstate property transactions" },
        { letter: "D", text: "It mandates that all interstate land must be zoned for commercial use" }
      ]
    },
    {
      text: "Under the Dodd-Frank Wall Street Reform and Consumer Protection Act, what is the 'ability-to-repay' rule?",
      answer: "Lenders must verify that borrowers have the financial ability to repay their mortgage loans",
      explanation: "The 'ability-to-repay' rule under Dodd-Frank requires mortgage lenders to make a reasonable, good-faith determination that borrowers have the financial ability to repay their loans. Lenders must verify and document income, assets, employment, credit history, monthly expenses, and debt obligations. The rule aims to prevent the kind of irresponsible lending that contributed to the 2008 financial crisis by ensuring borrowers aren't given loans they cannot afford, protecting both consumers and the mortgage market stability.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Borrowers must demonstrate their ability to repay a loan by making a 20% down payment" },
        { letter: "B", text: "Lenders must verify that borrowers have the financial ability to repay their mortgage loans" },
        { letter: "C", text: "Mortgage loans cannot exceed 30% of a borrower's income" },
        { letter: "D", text: "Borrowers must prove they can repay the loan within 15 years" }
      ]
    },
    {
      text: "What is the primary purpose of the Home Mortgage Disclosure Act (HMDA)?",
      answer: "To provide public data that helps determine if financial institutions are serving their communities' housing needs and to identify potential discriminatory lending patterns",
      explanation: "HMDA's primary purpose is to provide public loan data that helps determine if financial institutions are serving their communities' housing needs and to identify potential discriminatory lending patterns. It requires many financial institutions to maintain, report, and publicly disclose loan-level information about mortgages, including applicant demographics (race, ethnicity, gender), loan type, amount, property location, and approval/denial status. This transparency helps regulators monitor fair lending compliance and enables community organizations to identify neighborhoods needing investment.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To limit the number of home mortgages in any given area" },
        { letter: "B", text: "To provide public data that helps determine if financial institutions are serving their communities' housing needs and to identify potential discriminatory lending patterns" },
        { letter: "C", text: "To disclose mortgage interest rates to consumers" },
        { letter: "D", text: "To establish maximum fees lenders can charge for home loans" }
      ]
    },
    {
      text: "What does the TILA-RESPA Integrated Disclosure (TRID) rule require?",
      answer: "Lenders must provide borrowers with integrated disclosure forms at specific times during the mortgage process",
      explanation: "The TRID rule requires lenders to provide borrowers with integrated disclosure forms at specific times during the mortgage process. These forms are the Loan Estimate (provided within 3 business days after application) and the Closing Disclosure (provided at least 3 business days before closing). TRID consolidated and simplified the previously separate TILA and RESPA disclosures to make mortgage information clearer for consumers, showing loan terms, projected payments, closing costs, and other critical information in a standardized format.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Borrowers must receive counseling before applying for high-cost mortgages" },
        { letter: "B", text: "Lenders must provide borrowers with integrated disclosure forms at specific times during the mortgage process" },
        { letter: "C", text: "Lenders must disclose their company's financial records to borrowers" },
        { letter: "D", text: "Real estate agents must disclose all potential environmental hazards" }
      ]
    },
    {
      text: "Under the Real Estate Settlement Procedures Act (RESPA), what is a prohibited kickback?",
      answer: "Giving or receiving anything of value in exchange for referrals of settlement service business",
      explanation: "Under RESPA Section 8, a prohibited kickback is giving or receiving anything of value (money, favors, special rates, etc.) in exchange for referrals of settlement service business. For example, a title company cannot pay a real estate agent for referring clients, and a lender cannot give a real estate agent gift cards for mortgage referrals. These prohibitions aim to prevent inflated settlement costs caused by referral fees that would ultimately be paid by consumers. Violations can result in significant penalties including fines and imprisonment.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Giving or receiving anything of value in exchange for referrals of settlement service business" },
        { letter: "B", text: "Returning unused funds to borrowers after closing" },
        { letter: "C", text: "A lender providing a discount for using their preferred title company" },
        { letter: "D", text: "Charging less than the market rate for services" }
      ]
    },
    {
      text: "What is a key requirement of the Flood Disaster Protection Act for properties in Special Flood Hazard Areas?",
      answer: "Lenders must require flood insurance for properties in Special Flood Hazard Areas with federally backed mortgages",
      explanation: "A key requirement of the Flood Disaster Protection Act is that lenders must require flood insurance for properties located in Special Flood Hazard Areas (as designated by FEMA) when the mortgage is federally backed or regulated. The required coverage must be at least equal to the outstanding principal balance or the maximum coverage limit under the National Flood Insurance Program, whichever is less. This requirement aims to protect both property owners and lenders from financial losses due to flood damage.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Properties cannot be sold unless they're elevated above the flood plain" },
        { letter: "B", text: "Lenders must require flood insurance for properties in Special Flood Hazard Areas with federally backed mortgages" },
        { letter: "C", text: "All properties in flood zones must be sold at a discount" },
        { letter: "D", text: "Special building permits must be obtained from FEMA" }
      ]
    },
    {
      text: "Under the Fair Housing Act, what does 'familial status' protect against?",
      answer: "Discrimination against families with children under 18",
      explanation: "Under the Fair Housing Act, 'familial status' protects against discrimination toward families with children under 18, including pregnant women and people in the process of securing legal custody of children. Housing providers cannot refuse to rent or sell, charge higher prices, impose different terms or conditions, make discriminatory statements, or steer families with children away from certain housing or neighborhoods. Limited exemptions exist for qualified senior housing communities that meet specific requirements under the Housing for Older Persons Act.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Discrimination against unmarried couples" },
        { letter: "B", text: "Discrimination against families with children under 18" },
        { letter: "C", text: "Discrimination based on family wealth" },
        { letter: "D", text: "Discrimination against extended family living arrangements" }
      ]
    },
    {
      text: "What does the Federal Fair Housing Act require regarding reasonable modifications for persons with disabilities?",
      answer: "Housing providers must allow persons with disabilities to make reasonable physical modifications to their dwelling at the tenant's expense",
      explanation: "The Federal Fair Housing Act requires housing providers to allow persons with disabilities to make reasonable physical modifications to their dwelling at the tenant's expense. These modifications may include installing ramps, widening doorways, installing grab bars, or adapting bathrooms or kitchens. While the tenant typically pays for these modifications, the landlord cannot refuse permission for necessary modifications and might be required to permit changes to common areas. In federally subsidized housing, the housing provider may be responsible for the modification costs.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Housing providers must make all units fully accessible" },
        { letter: "B", text: "Housing providers must allow persons with disabilities to make reasonable physical modifications to their dwelling at the tenant's expense" },
        { letter: "C", text: "Housing providers must pay for all modifications requested by tenants with disabilities" },
        { letter: "D", text: "Housing providers must have at least 10% of units designated for persons with disabilities" }
      ]
    },
    {
      text: "What does the Federal Lead Disclosure Rule require for housing built before 1978?",
      answer: "Sellers and landlords must disclose known lead-based paint hazards and provide available reports before the sale or lease",
      explanation: "The Federal Lead Disclosure Rule requires that before the sale or lease of housing built before 1978, sellers and landlords must: 1) Disclose known lead-based paint or lead-based paint hazards, 2) Provide available records and reports about lead-based paint, 3) Provide the EPA-approved lead hazard information pamphlet, and 4) Include specific warning language in the contract and retain signed acknowledgment. The rule aims to protect buyers and renters from exposure to lead, which can cause serious health problems, especially in children.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "All lead paint must be removed before sale" },
        { letter: "B", text: "Sellers and landlords must disclose known lead-based paint hazards and provide available reports before the sale or lease" },
        { letter: "C", text: "Properties must be tested for lead before listing" },
        { letter: "D", text: "Lead disclosure is only required for properties built before 1950" }
      ]
    },
    {
      text: "What is 'steering' under the Fair Housing Act?",
      answer: "Directing prospective homebuyers or renters to or away from certain neighborhoods based on protected characteristics",
      explanation: "Steering under the Fair Housing Act is the illegal practice of directing prospective homebuyers or renters to or away from neighborhoods based on race, color, religion, national origin, sex, disability, or familial status. Examples include showing Hispanic buyers homes only in predominantly Hispanic neighborhoods or telling families with children that they would be 'more comfortable' in certain areas. Even if motivated by good intentions, steering violates fair housing laws because it limits housing choices based on protected characteristics rather than client preferences.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Helping clients find neighborhoods that match their stated preferences" },
        { letter: "B", text: "Directing prospective homebuyers or renters to or away from certain neighborhoods based on protected characteristics" },
        { letter: "C", text: "Providing transportation to clients during property showings" },
        { letter: "D", text: "Guiding clients toward properties within their budget" }
      ]
    },
    {
      text: "Under the Servicemembers Civil Relief Act (SCRA), what protection is provided regarding residential leases?",
      answer: "Service members can terminate residential leases early upon receiving military orders for a permanent change of station or deployment",
      explanation: "The SCRA allows service members to terminate residential leases early without penalty upon receiving permanent change of station (PCS) orders or deployment orders of 90 days or more. To exercise this right, the service member must provide written notice to the landlord along with a copy of the military orders. The lease termination becomes effective 30 days after the next rent payment is due following notice delivery. This protection ensures military personnel aren't financially penalized for lease obligations when required to relocate for service.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Service members cannot be evicted under any circumstances" },
        { letter: "B", text: "Service members can terminate residential leases early upon receiving military orders for a permanent change of station or deployment" },
        { letter: "C", text: "Landlords must reserve apartments for returning service members" },
        { letter: "D", text: "Service members receive a 50% discount on rent" }
      ]
    },
    {
      text: "What is a primary purpose of the Interstate Land Sales Full Disclosure Act?",
      answer: "To protect consumers from fraud and abusive practices in the sale or lease of undeveloped land",
      explanation: "The primary purpose of the Interstate Land Sales Full Disclosure Act is to protect consumers from fraud and abusive practices in the sale or lease of undeveloped land. Enacted in 1968 in response to widespread land scams, the Act requires developers selling or leasing 25 or more unimproved lots to register with HUD and provide detailed property reports to potential buyers before purchase. These reports must accurately disclose property characteristics, available utilities, access roads, flood risks, and developer obligations to ensure buyers can make informed decisions.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To regulate interstate highways near land developments" },
        { letter: "B", text: "To protect consumers from fraud and abusive practices in the sale or lease of undeveloped land" },
        { letter: "C", text: "To prevent foreign investors from purchasing U.S. land" },
        { letter: "D", text: "To establish standardized zoning laws across state lines" }
      ]
    },
    {
      text: "Under the Gramm-Leach-Bliley Act, what are financial institutions required to do regarding consumer privacy?",
      answer: "Provide privacy notices explaining information-sharing practices and allow customers to opt out of certain information sharing with third parties",
      explanation: "The Gramm-Leach-Bliley Act requires financial institutions (including mortgage brokers, real estate settlement providers, and appraisers) to provide privacy notices explaining their information-collection and sharing practices, and allow customers to opt out of certain information sharing with third parties. They must also implement security programs to protect consumers' personal information from unauthorized access. These requirements aim to give consumers control over their personal financial information while allowing legitimate information sharing for business purposes.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Never share any customer information under any circumstances" },
        { letter: "B", text: "Provide privacy notices explaining information-sharing practices and allow customers to opt out of certain information sharing with third parties" },
        { letter: "C", text: "Delete all customer information after three years" },
        { letter: "D", text: "Share information only with federal regulators" }
      ]
    },
    {
      text: "What is a 'disparate impact' claim under the Fair Housing Act?",
      answer: "A claim that a seemingly neutral policy or practice disproportionately affects a protected group without legitimate justification",
      explanation: "A disparate impact claim under the Fair Housing Act challenges a policy or practice that appears neutral but disproportionately affects a protected group without legitimate justification. Unlike disparate treatment claims that require proving discriminatory intent, disparate impact claims focus on discriminatory effects regardless of intent. For example, a rental policy requiring a minimum income of 3.5 times the rent might have a disparate impact on single parents or people with disabilities, who statistically have lower incomes, even if not intentionally discriminatory.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A claim that housing providers charge different prices to different protected groups" },
        { letter: "B", text: "A claim that a seemingly neutral policy or practice disproportionately affects a protected group without legitimate justification" },
        { letter: "C", text: "A claim that marketing was not equally distributed across different neighborhoods" },
        { letter: "D", text: "A claim that a housing provider made discriminatory statements" }
      ]
    },
    {
      text: "Under the Federal Fair Housing Act, which of the following is NOT a protected class?",
      answer: "Source of income",
      explanation: "Source of income is not a federally protected class under the Fair Housing Act, which prohibits discrimination based on race, color, religion, sex, disability, familial status, and national origin. This means federal law doesn't prohibit landlords from refusing to rent to someone because they receive housing vouchers, social security, alimony, or other specific income types. However, some states and local jurisdictions have enacted their own fair housing laws that do include source of income as a protected class.",
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
      text: "What is a 'qualified written request' under the Real Estate Settlement Procedures Act?",
      answer: "A written correspondence from a borrower to a loan servicer requesting information or asserting an error related to loan servicing",
      explanation: "A qualified written request (QWR) under RESPA is a written correspondence from a borrower to a loan servicer that either requests information or asserts an error related to loan servicing. The correspondence must include the borrower's name, information identifying the account, and a statement of reasons for believing an error exists or a request for specific information. Once received, the servicer must acknowledge the QWR within 5 business days and respond substantively within 30 business days (with a possible 15-day extension).",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A formal legal request filed with a court" },
        { letter: "B", text: "A written correspondence from a borrower to a loan servicer requesting information or asserting an error related to loan servicing" },
        { letter: "C", text: "A written demand for modification of loan terms" },
        { letter: "D", text: "A settlement statement prepared by a qualified closing agent" }
      ]
    },
    {
      text: "Under the Fair Credit Reporting Act, what is the time limit for reporting most negative information on a consumer's credit report?",
      answer: "7 years",
      explanation: "Under the Fair Credit Reporting Act, most negative information can remain on a consumer's credit report for 7 years. This includes late payments, collections, charge-offs, foreclosures, and short sales. Chapter 7 bankruptcies can be reported for 10 years, while Chapter 13 bankruptcies follow the standard 7-year reporting period. Tax liens can remain until paid plus 7 years. These time limits ensure that consumers aren't indefinitely penalized for past financial difficulties while still providing creditors with relevant credit history information.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 years" },
        { letter: "B", text: "5 years" },
        { letter: "C", text: "7 years" },
        { letter: "D", text: "10 years" }
      ]
    },
    {
      text: "What does the Federal Do Not Call Registry prohibit?",
      answer: "Telemarketers from calling registered phone numbers, with certain exceptions",
      explanation: "The Federal Do Not Call Registry prohibits telemarketers from calling phone numbers that consumers have registered, with certain exceptions. Exceptions include calls from organizations with which the consumer has an established business relationship (within 18 months), calls to which the consumer has given prior written consent, and calls from political organizations, charities, and telephone surveyors. This registry, managed by the Federal Trade Commission, helps protect consumers from unwanted telemarketing calls and gives them control over who may contact them by phone.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "All unsolicited phone calls" },
        { letter: "B", text: "Telemarketers from calling registered phone numbers, with certain exceptions" },
        { letter: "C", text: "Realtors from cold-calling potential clients" },
        { letter: "D", text: "All automated telephone systems" }
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
  
  console.log('\n=========== MORE FEDERAL QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreFederalQuestions()
  .then(() => {
    console.log('More federal regulation questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more federal regulation questions:', error);
    process.exit(1);
  });