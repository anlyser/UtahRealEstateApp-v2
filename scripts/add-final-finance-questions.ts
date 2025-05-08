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

async function addFinalFinanceQuestions() {
  console.log('Starting to add final finance questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define final finance questions
  const questions: Question[] = [
    {
      text: "What is a 'wraparound mortgage'?",
      answer: "A financing method where a new mortgage encompasses an existing mortgage plus additional financing",
      explanation: "A wraparound mortgage is a financing method where a new mortgage encompasses (wraps around) an existing mortgage plus additional financing. The seller continues making payments on the original mortgage while receiving larger payments from the buyer on the wraparound mortgage, profiting from the difference in interest rates. This technique is useful when the original mortgage has a favorable interest rate that the buyer can't obtain in the current market, or when the original mortgage has a due-on-sale clause that would trigger if formally transferred.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A mortgage that covers multiple properties" },
        { letter: "B", text: "A financing method where a new mortgage encompasses an existing mortgage plus additional financing" },
        { letter: "C", text: "A mortgage that wraps around to a second term if not paid off in time" },
        { letter: "D", text: "A mortgage with extensive paperwork that 'wraps around' the closing documents" }
      ]
    },
    {
      text: "What is a 'blanket mortgage'?",
      answer: "A single mortgage that covers multiple properties",
      explanation: "A blanket mortgage is a single financing instrument that covers multiple parcels of real estate. Developers and builders commonly use blanket mortgages to finance several lots or properties simultaneously, providing efficiency and potential cost savings over individual loans. A key feature is the partial release clause, which allows properties to be released from the mortgage lien when sold, without requiring full repayment of the loan. This enables properties to be sold individually while the remaining properties continue to secure the loan.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A mortgage that covers all closing costs" },
        { letter: "B", text: "A single mortgage that covers multiple properties" },
        { letter: "C", text: "A mortgage that provides very comprehensive coverage for the lender" },
        { letter: "D", text: "A mortgage that 'blankets' the borrower with high interest rates" }
      ]
    },
    {
      text: "What is 'hypothecation' in real estate finance?",
      answer: "Pledging property as collateral for a loan without transferring possession or title",
      explanation: "Hypothecation is the practice of pledging property as collateral for a loan without transferring possession or title to the lender. In real estate, a mortgage is the most common form of hypothecation—the borrower maintains ownership and use of the property while the lender holds a security interest. If the borrower defaults, the lender can foreclose on the property. This differs from a pledge, which typically involves transferring possession of personal property collateral to the lender during the loan term.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A theoretical calculation of property value" },
        { letter: "B", text: "Pledging property as collateral for a loan without transferring possession or title" },
        { letter: "C", text: "Creating a hypothetical scenario for mortgage qualification" },
        { letter: "D", text: "The process of establishing a thesis about property values" }
      ]
    },
    {
      text: "What is a 'recourse loan' in real estate financing?",
      answer: "A loan where the borrower is personally liable for the debt beyond the collateral property",
      explanation: "A recourse loan is one where the borrower is personally liable for the debt beyond the collateral property. If the borrower defaults and the foreclosure sale doesn't satisfy the debt, the lender can pursue the borrower's other assets to recover the deficiency. In contrast, with a non-recourse loan, the lender's recovery is limited to the collateral property, regardless of whether its value covers the outstanding loan amount. Most residential mortgages are recourse loans, though some states have anti-deficiency laws limiting recourse in certain foreclosure situations.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan where the borrower is personally liable for the debt beyond the collateral property" },
        { letter: "B", text: "A loan that returns to the lender if the borrower defaults" },
        { letter: "C", text: "A loan that requires multiple courses of action before foreclosure" },
        { letter: "D", text: "A loan where the borrower can recourse to legal action if terms change" }
      ]
    },
    {
      text: "What is a 'portfolio loan' in real estate financing?",
      answer: "A mortgage that the lender keeps in its own investment portfolio rather than selling on the secondary market",
      explanation: "A portfolio loan is a mortgage that the lender keeps in its own investment portfolio rather than selling on the secondary market to entities like Fannie Mae or Freddie Mac. Because these loans aren't sold, they don't need to conform to secondary market requirements. This allows lenders more flexibility in underwriting, potentially benefiting borrowers who don't fit standard qualification criteria (self-employed with variable income, high net worth but low documented income, unique properties, or borrowers with many financed properties).",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan used to purchase a portfolio of investment properties" },
        { letter: "B", text: "A mortgage that the lender keeps in its own investment portfolio rather than selling on the secondary market" },
        { letter: "C", text: "A loan that requires the borrower to maintain a portfolio of investments as collateral" },
        { letter: "D", text: "A loan made to an investment portfolio manager" }
      ]
    },
    {
      text: "What is 'subordination' in mortgage lending?",
      answer: "The process of placing one debt or lien in a lower priority position than another",
      explanation: "Subordination is the process of placing one debt or lien in a lower priority position than another. For example, when refinancing a first mortgage with a home equity line of credit (HELOC) already in place, the HELOC lender may agree to subordinate their lien to remain in second position behind the new first mortgage. Without subordination, the HELOC would automatically move to first position when the original first mortgage is paid off during refinancing, which would be unacceptable to the new first mortgage lender.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of placing one debt or lien in a lower priority position than another" },
        { letter: "B", text: "A relationship between a dominant and subordinate property" },
        { letter: "C", text: "Making mortgage payments to multiple subordinate lenders" },
        { letter: "D", text: "A clause that subordinates the buyer to the seller's demands" }
      ]
    },
    {
      text: "What is 'the rule of 78s' in loan prepayment?",
      answer: "A method of calculating interest rebates on prepaid loans that favors the lender by allocating more interest to the early periods of the loan",
      explanation: "The Rule of 78s (also called the 'sum of digits' method) is a formula for calculating interest rebates when a borrower prepays a loan. It weights interest heavily toward the beginning of the loan term, meaning early payoffs result in less interest savings than would occur with simple interest calculations. For example, on a 12-month loan, it allocates 12/78 of the total interest to the first month, 11/78 to the second month, and so on. This method favors lenders and is now restricted for certain loans by federal regulations.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A rule requiring all loans to be paid in 78 equal installments" },
        { letter: "B", text: "A method of calculating interest rebates on prepaid loans that favors the lender by allocating more interest to the early periods of the loan" },
        { letter: "C", text: "A formula that requires payments to be made on the 7th and 8th of each month" },
        { letter: "D", text: "A rule limiting real estate transactions to 78 days from contract to closing" }
      ]
    },
    {
      text: "What is a 'yield spread premium' in mortgage lending?",
      answer: "Compensation paid by lenders to mortgage brokers for originating loans with interest rates higher than the minimum accepted by the lender",
      explanation: "A yield spread premium (YSP) is compensation paid by lenders to mortgage brokers for originating loans with interest rates higher than the minimum rate the lender would accept. The higher rate provides additional profit to the lender, who shares some with the broker through the YSP. Following the 2008 financial crisis, the Dodd-Frank Act significantly restricted YSPs through loan originator compensation rules, limiting brokers' ability to receive compensation based on loan terms like interest rate, to prevent incentives for placing borrowers in unnecessarily expensive loans.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The highest possible yield on a mortgage investment" },
        { letter: "B", text: "Compensation paid by lenders to mortgage brokers for originating loans with interest rates higher than the minimum accepted by the lender" },
        { letter: "C", text: "The premium charged for loans with high yield potential" },
        { letter: "D", text: "The difference between actual and expected yield on mortgage-backed securities" }
      ]
    },
    {
      text: "What is 'negative amortization'?",
      answer: "A situation where the loan balance increases because the payments are less than the interest accruing on the loan",
      explanation: "Negative amortization occurs when loan payments are less than the interest accruing on the loan, causing the unpaid interest to be added to the principal balance. This increases the loan balance over time rather than reducing it. Negative amortization can happen with payment option ARMs or other loans with payment caps that limit monthly payment increases. These loans can create payment shock when they eventually recast to fully amortize the larger balance, and can lead to borrowers owing more than they originally borrowed.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a borrower makes extra payments to reduce principal more quickly" },
        { letter: "B", text: "A situation where the loan balance increases because the payments are less than the interest accruing on the loan" },
        { letter: "C", text: "An amortization schedule with negative interest rates" },
        { letter: "D", text: "The reduction in loan value due to property depreciation" }
      ]
    },
    {
      text: "What is a 'teaser rate' in adjustable-rate mortgages?",
      answer: "An initially low interest rate offered to entice borrowers that typically adjusts to a higher rate after an introductory period",
      explanation: "A teaser rate is an initially low interest rate offered to entice borrowers into adjustable-rate mortgages (ARMs), which typically adjusts to a higher rate after an introductory period of 1-12 months. These rates are often below market and shouldn't be confused with the initial fixed period of a standard ARM (like the first 5 years of a 5/1 ARM). Teaser rates can make loans appear more affordable initially but may lead to payment shock when the rate adjusts. Following the 2008 financial crisis, regulations significantly restricted their use.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A promotional rate offered for opening a bank account alongside a mortgage" },
        { letter: "B", text: "An initially low interest rate offered to entice borrowers that typically adjusts to a higher rate after an introductory period" },
        { letter: "C", text: "A rate that teases the market average but never quite reaches it" },
        { letter: "D", text: "An advertised rate used to attract buyers but not actually available to most borrowers" }
      ]
    },
    {
      text: "What is a 'satisfaction of mortgage'?",
      answer: "A document stating that a mortgage has been paid in full and the lien has been removed",
      explanation: "A satisfaction of mortgage (also called a mortgage release or discharge of mortgage) is a document stating that a mortgage has been paid in full and the lien has been removed from the property. When a borrower pays off their mortgage, the lender must provide this document, which is then recorded in the county land records to clear the title. Failure to properly record a satisfaction can create title problems when the owner attempts to sell or refinance the property in the future.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A borrower's statement of satisfaction with their mortgage terms" },
        { letter: "B", text: "A document stating that a mortgage has been paid in full and the lien has been removed" },
        { letter: "C", text: "A lender's certification that they're satisfied with a borrower's payment history" },
        { letter: "D", text: "A form indicating the mortgage meets federal standards" }
      ]
    },
    {
      text: "What is 'private mortgage insurance' (PMI)?",
      answer: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment",
      explanation: "Private Mortgage Insurance (PMI) is insurance that protects the lender if a borrower defaults on a conventional loan with a down payment less than 20%. The borrower pays the premiums, but the coverage benefits the lender by reducing their risk. By law, PMI must be automatically terminated when the loan balance reaches 78% of the original value, and borrowers can request cancellation at 80% LTV. This insurance enables many buyers to purchase homes with smaller down payments, though it increases their monthly payment.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Insurance that protects borrowers if they lose their jobs" },
        { letter: "B", text: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment" },
        { letter: "C", text: "Insurance that pays off a borrower's mortgage in case of death" },
        { letter: "D", text: "Private insurance that replaces homeowners insurance on mortgaged properties" }
      ]
    },
    {
      text: "What is a 'good faith estimate' (GFE) in mortgage lending?",
      answer: "A document that lenders provided to borrowers showing estimated closing costs (replaced by the Loan Estimate under TRID)",
      explanation: "A Good Faith Estimate (GFE) was a document that lenders were required to provide to mortgage applicants within three business days of application, showing estimated closing costs. In 2015, the GFE was replaced by the Loan Estimate under the TILA-RESPA Integrated Disclosure (TRID) rule. The purpose of both documents is to help borrowers understand potential costs and compare loan offers from different lenders. The Loan Estimate provides similar information in a more consumer-friendly format with greater accuracy requirements.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A borrower's promise to act in good faith during the mortgage process" },
        { letter: "B", text: "A document that lenders provided to borrowers showing estimated closing costs (replaced by the Loan Estimate under TRID)" },
        { letter: "C", text: "An estimate of the borrower's good faith in repaying the loan" },
        { letter: "D", text: "A lender's pledge to process the loan application in good faith" }
      ]
    },
    {
      text: "What is 'alienation' in the context of a mortgage clause?",
      answer: "The transfer of property ownership from one party to another",
      explanation: "Alienation in mortgage terminology refers to the transfer of property ownership from one party to another. A due-on-sale clause (also called an alienation clause) in a mortgage gives the lender the right to demand full repayment of the loan when the property is sold or transferred. This protects lenders from having their loans assumed by new owners at below-market interest rates. There are exceptions to enforcement, including transfers between spouses, to family trusts, or upon death, as protected by the Garn-St. Germain Act.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The alienation of affection between borrower and lender" },
        { letter: "B", text: "The transfer of property ownership from one party to another" },
        { letter: "C", text: "When extraterrestrials are included in mortgage contracts" },
        { letter: "D", text: "When a property becomes alien or foreign-owned" }
      ]
    },
    {
      text: "What are 'discount points' in mortgage lending?",
      answer: "Upfront fees paid to the lender to reduce the interest rate on a mortgage",
      explanation: "Discount points are upfront fees paid to the lender at closing to reduce the interest rate on a mortgage. Each point costs 1% of the loan amount and typically lowers the rate by 0.25%. For example, on a $300,000 loan, one point would cost $3,000. Paying points makes sense for borrowers who plan to keep the loan for a long time, allowing them to recoup the upfront cost through lower monthly payments. Points are generally tax-deductible as prepaid interest in the year paid.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Upfront fees paid to the lender to reduce the interest rate on a mortgage" },
        { letter: "B", text: "Discounts given to borrowers with excellent credit scores" },
        { letter: "C", text: "Points on a borrower's credit report that are discounted in the approval process" },
        { letter: "D", text: "Fees reduced from closing costs as a gesture of goodwill" }
      ]
    },
    {
      text: "What is 'usury' in lending?",
      answer: "Charging interest above the maximum rate allowed by law",
      explanation: "Usury is the practice of charging interest above the maximum rate allowed by law. Usury laws vary by state, with different caps on interest rates for different types of loans. Lenders charging usurious rates can face penalties including forfeiture of interest, return of excess interest, or in some cases, forfeiture of principal. Most institutional mortgage lenders are exempt from state usury laws due to federal preemption under laws like the Depository Institutions Deregulation and Monetary Control Act of 1980.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Using multiple lenders for the same property" },
        { letter: "B", text: "Charging interest above the maximum rate allowed by law" },
        { letter: "C", text: "The standard use pattern of borrowers paying interest before principal" },
        { letter: "D", text: "The practice of using borrowed money for something other than its intended purpose" }
      ]
    },
    {
      text: "What is a 'construction loan'?",
      answer: "Short-term financing that pays for the construction of a building project, typically converting to a permanent mortgage upon completion",
      explanation: "A construction loan is short-term financing that pays for building a new structure or major renovation. Unlike traditional mortgages that provide funds in a lump sum, construction loans disburse money in draws (incremental payments) as construction phases complete, with inspections required before each payment. These loans typically have higher interest rates than permanent mortgages and shorter terms (usually 12-18 months). Most convert to permanent mortgages upon completion (construction-to-permanent loans), avoiding multiple closing costs.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan to a construction company to purchase equipment" },
        { letter: "B", text: "Short-term financing that pays for the construction of a building project, typically converting to a permanent mortgage upon completion" },
        { letter: "C", text: "A mortgage constructed from multiple smaller loans" },
        { letter: "D", text: "A loan requiring construction of the documents by hand rather than digitally" }
      ]
    },
    {
      text: "What is 'cash-out refinancing'?",
      answer: "Refinancing a mortgage for more than the outstanding balance to convert home equity into cash",
      explanation: "Cash-out refinancing involves replacing an existing mortgage with a new loan for more than the outstanding balance, allowing the borrower to convert home equity into cash. The difference between the new loan amount and the existing mortgage balance (minus closing costs) is paid to the borrower. Homeowners typically use cash-out refinancing for home improvements, debt consolidation, education expenses, or other major costs. Cash-out refinances usually have stricter requirements than rate-and-term refinances, including higher credit scores and lower loan-to-value ratios.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Refinancing a mortgage for more than the outstanding balance to convert home equity into cash" },
        { letter: "B", text: "Paying cash to the lender when refinancing to reduce the loan amount" },
        { letter: "C", text: "Refinancing that requires the borrower to pay closing costs in cash" },
        { letter: "D", text: "Cashing out investment accounts to pay off a mortgage" }
      ]
    },
    {
      text: "What is a 'balloon payment' in real estate financing?",
      answer: "A large, final payment due at the end of a loan term, paying off the remaining balance",
      explanation: "A balloon payment is a large, final payment due at the end of a loan term that pays off the remaining balance. Balloon loans typically feature lower monthly payments during the loan term because they're not fully amortized. For example, a 5-year balloon mortgage might have monthly payments calculated as if it were a 30-year loan, but the entire remaining balance becomes due after 5 years. Borrowers usually plan to refinance or sell before the balloon payment comes due, though this strategy carries risk if refinancing isn't possible.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An inflated payment that occurs when interest rates rise" },
        { letter: "B", text: "A large, final payment due at the end of a loan term, paying off the remaining balance" },
        { letter: "C", text: "A festive reward given when the last mortgage payment is made" },
        { letter: "D", text: "A rapidly growing payment schedule where each payment is larger than the last" }
      ]
    },
    {
      text: "What is 'redlining' in mortgage lending?",
      answer: "The illegal practice of denying loans or financial services to specific neighborhoods based on race or ethnicity",
      explanation: "Redlining is the illegal discriminatory practice of denying loans or financial services to specific neighborhoods based on race or ethnicity rather than individual creditworthiness. The term originated from red lines that lenders would literally draw on maps around minority neighborhoods they refused to serve. Prohibited by the Fair Housing Act and the Community Reinvestment Act, redlining has profound historical impacts on wealth inequality. Though explicit redlining is now illegal, studies show lending patterns still reflect some of these historical patterns in more subtle forms.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The illegal practice of denying loans or financial services to specific neighborhoods based on race or ethnicity" },
        { letter: "B", text: "Marking problematic terms in red ink on loan documents" },
        { letter: "C", text: "The process of designating high-risk lending areas on maps" },
        { letter: "D", text: "A specialized type of property line used in urban areas" }
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
  
  console.log('\n=========== FINAL FINANCE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalFinanceQuestions()
  .then(() => {
    console.log('Final finance questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final finance questions:', error);
    process.exit(1);
  });