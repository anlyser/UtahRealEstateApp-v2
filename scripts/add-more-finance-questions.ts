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

async function addMoreFinanceQuestions() {
  console.log('Starting to add more real estate finance questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more finance questions
  const questions: Question[] = [
    {
      text: "What is 'loan-to-value ratio' (LTV)?",
      answer: "The percentage of a property's value that is mortgaged",
      explanation: "The loan-to-value (LTV) ratio is the percentage of a property's appraised value or purchase price that is financed through a mortgage. It's calculated by dividing the loan amount by the property value and multiplying by 100. For example, a $240,000 loan on a $300,000 property has an 80% LTV. Higher LTVs typically require mortgage insurance and may have higher interest rates.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The percentage of a property's value that is mortgaged" },
        { letter: "B", text: "The relationship between the loan interest rate and property value" },
        { letter: "C", text: "The value of a loan after interest is calculated" },
        { letter: "D", text: "The ratio of loan payment to borrower's income" }
      ]
    },
    {
      text: "What does 'amortization' refer to in a mortgage loan?",
      answer: "The gradual reduction of debt through regular payments of principal and interest",
      explanation: "Amortization refers to the process of gradually paying off a debt through regular payments that include both principal and interest. With a typical amortizing mortgage, early payments consist mostly of interest with little principal reduction, but over time, more of each payment goes toward the principal as the loan balance decreases. This process is outlined in an amortization schedule.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The process of paying only interest on a loan" },
        { letter: "B", text: "The gradual reduction of debt through regular payments of principal and interest" },
        { letter: "C", text: "The increase in loan balance over time" },
        { letter: "D", text: "The depreciation of a property's value" }
      ]
    },
    {
      text: "What is a 'balloon payment' in real estate financing?",
      answer: "A large payment due at the end of a loan term, paying off the remaining balance",
      explanation: "A balloon payment is a large payment due at the end of a loan term that pays off the remaining balance. Balloon loans typically feature lower monthly payments during the loan term because they're not fully amortized. For example, a 5-year balloon mortgage might have monthly payments calculated as if it were a 30-year loan, but requires the entire remaining balance to be paid as a lump sum after 5 years.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A one-time payment made at closing" },
        { letter: "B", text: "A large payment due at the end of a loan term, paying off the remaining balance" },
        { letter: "C", text: "A payment that increases each year" },
        { letter: "D", text: "The initial down payment on a property" }
      ]
    },
    {
      text: "What is 'debt-to-income ratio' (DTI)?",
      answer: "The percentage of a borrower's gross monthly income used to pay debts",
      explanation: "The debt-to-income ratio (DTI) is the percentage of a borrower's gross monthly income that goes toward paying debts. Lenders typically calculate two ratios: the front-end ratio (housing expenses only) and back-end ratio (all debts). Most conventional loans require a back-end DTI of 43% or less, though some loans allow higher ratios. DTI is a key factor in determining mortgage qualification and loan amount.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The percentage of a borrower's gross monthly income used to pay debts" },
        { letter: "B", text: "The ratio of debt on a property compared to income generated by the property" },
        { letter: "C", text: "The percentage of a property's value that is financed" },
        { letter: "D", text: "The relationship between total debt and total assets" }
      ]
    },
    {
      text: "What is private mortgage insurance (PMI)?",
      answer: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment",
      explanation: "Private Mortgage Insurance (PMI) protects the lender if a borrower defaults on a conventional loan with a down payment of less than 20%. The borrower pays the premium, but the coverage benefits the lender. PMI allows borrowers to qualify with smaller down payments but increases monthly costs. By law, PMI must be automatically terminated when the loan balance reaches 78% of the original value.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Insurance that protects the borrower if they lose their job" },
        { letter: "B", text: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment" },
        { letter: "C", text: "Insurance that covers a property against physical damage" },
        { letter: "D", text: "Insurance that pays off a mortgage in case of the borrower's death" }
      ]
    },
    {
      text: "What is a 'jumbo loan'?",
      answer: "A mortgage that exceeds the conforming loan limits set by Fannie Mae and Freddie Mac",
      explanation: "A jumbo loan is a mortgage that exceeds the conforming loan limits set by Fannie Mae and Freddie Mac ($726,200 in most areas for 2023, though higher in high-cost areas). Because these loans can't be purchased by Fannie Mae or Freddie Mac, they typically have stricter qualification requirements, larger down payments, and slightly higher interest rates than conforming loans.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A mortgage that exceeds the conforming loan limits set by Fannie Mae and Freddie Mac" },
        { letter: "B", text: "A loan specifically for purchasing large properties" },
        { letter: "C", text: "A loan with an unusually long term, such as 40 or 50 years" },
        { letter: "D", text: "A second mortgage used for home improvements" }
      ]
    },
    {
      text: "What is 'escrow' in mortgage lending?",
      answer: "An account held by a third party that collects funds for taxes and insurance",
      explanation: "In mortgage lending, an escrow account (impound account) is managed by the loan servicer to collect and hold funds from the borrower for property taxes and insurance premiums. The lender collects these expenses as part of the monthly mortgage payment, then pays the bills when due. This protects the lender by ensuring these obligations are met and helps borrowers budget by spreading these costs over the year.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An account held by a third party that collects funds for taxes and insurance" },
        { letter: "B", text: "The final transfer of property ownership" },
        { letter: "C", text: "A method of calculating interest on a loan" },
        { letter: "D", text: "The document that creates a lien on a property" }
      ]
    },
    {
      text: "What is a 'reverse mortgage'?",
      answer: "A loan that allows homeowners 62 or older to convert home equity into cash without monthly payments",
      explanation: "A reverse mortgage is a loan that allows homeowners age 62 or older to convert part of their home equity into cash without selling the home or making monthly mortgage payments. The loan is repaid when the borrower dies, sells the home, or no longer uses it as a primary residence. The most common type is the Home Equity Conversion Mortgage (HECM), insured by the Federal Housing Administration.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan that requires payments to increase over time" },
        { letter: "B", text: "A loan that allows homeowners 62 or older to convert home equity into cash without monthly payments" },
        { letter: "C", text: "A mortgage where the interest rate decreases over time" },
        { letter: "D", text: "A refinance that reduces the loan term" }
      ]
    },
    {
      text: "What does APR stand for in mortgage lending?",
      answer: "Annual Percentage Rate",
      explanation: "APR stands for Annual Percentage Rate. It represents the yearly cost of a loan including interest and certain fees, expressed as a percentage. The APR is typically higher than the note rate because it includes origination fees, discount points, mortgage insurance, and other costs. Federal law requires lenders to disclose the APR to help borrowers compare loan offers on an equivalent basis.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Adjusted Payment Rate" },
        { letter: "B", text: "Annual Principal Reduction" },
        { letter: "C", text: "Annual Percentage Rate" },
        { letter: "D", text: "Approved Property Ratio" }
      ]
    },
    {
      text: "What is 'points' or 'discount points' in mortgage financing?",
      answer: "Prepaid interest that reduces the interest rate on a loan",
      explanation: "Points or discount points are prepaid interest that a borrower can choose to pay at closing to reduce the interest rate on a loan. Each point costs 1% of the loan amount. For example, on a $300,000 loan, one point would cost $3,000 and typically reduce the rate by 0.25%. Paying points makes sense for borrowers planning to keep the loan for a long time, allowing them to recoup the upfront cost through lower monthly payments.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Penalties for late payments" },
        { letter: "B", text: "Prepaid interest that reduces the interest rate on a loan" },
        { letter: "C", text: "Credits given by the seller toward closing costs" },
        { letter: "D", text: "The number of percentage points above prime rate" }
      ]
    },
    {
      text: "What is a 'conforming loan'?",
      answer: "A mortgage that meets the purchasing guidelines of Fannie Mae and Freddie Mac",
      explanation: "A conforming loan is a mortgage that meets the purchasing guidelines (loan limits, credit, documentation requirements) of Fannie Mae and Freddie Mac, government-sponsored enterprises that buy mortgages from lenders. For 2023, the conforming loan limit is $726,200 in most areas (higher in designated high-cost areas). Conforming loans typically offer lower interest rates and fees than non-conforming loans.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A mortgage that meets the purchasing guidelines of Fannie Mae and Freddie Mac" },
        { letter: "B", text: "A loan that conforms to the borrower's specific requests" },
        { letter: "C", text: "A loan modified to meet new regulations" },
        { letter: "D", text: "A loan with a fixed interest rate" }
      ]
    },
    {
      text: "What is an 'assumable mortgage'?",
      answer: "A loan that can be transferred from the current borrower to another person",
      explanation: "An assumable mortgage can be transferred from the current borrower to another person, who takes over the existing loan terms, including the interest rate, remaining balance, and payment schedule. This feature can be valuable when current market rates are higher than the loan's rate. FHA and VA loans are typically assumable, while most conventional loans are not. The assuming borrower must still qualify for the loan.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan that can be transferred from the current borrower to another person" },
        { letter: "B", text: "A mortgage that assumes property values will increase" },
        { letter: "C", text: "A loan where the lender assumes the risk of default" },
        { letter: "D", text: "A mortgage that assumes a variable interest rate" }
      ]
    },
    {
      text: "What is 'impound' or 'escrow' in mortgage lending?",
      answer: "An account maintained by the lender to pay property taxes and insurance",
      explanation: "An impound or escrow account is maintained by the lender or loan servicer to pay property taxes and insurance premiums when they come due. The borrower pays a portion of these costs with each monthly mortgage payment. Impound accounts help ensure these obligations are paid on time, protecting both the lender's security interest and the borrower from tax liens or lapses in insurance coverage.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Money held temporarily during a real estate transaction" },
        { letter: "B", text: "An account maintained by the lender to pay property taxes and insurance" },
        { letter: "C", text: "Funds withheld from a contractor until work is completed" },
        { letter: "D", text: "A deposit held by a landlord" }
      ]
    },
    {
      text: "What is the difference between a 'fixed-rate mortgage' and an 'adjustable-rate mortgage'?",
      answer: "A fixed-rate mortgage maintains the same interest rate throughout the loan term, while an adjustable-rate mortgage has an interest rate that can change periodically",
      explanation: "A fixed-rate mortgage maintains the same interest rate throughout the entire loan term, providing stable, predictable monthly principal and interest payments. An adjustable-rate mortgage (ARM) starts with a fixed rate for an initial period, then adjusts periodically based on market indexes. ARMs typically start with lower rates than fixed-rate mortgages but carry the risk of higher payments later if interest rates rise.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A fixed-rate mortgage maintains the same interest rate throughout the loan term, while an adjustable-rate mortgage has an interest rate that can change periodically" },
        { letter: "B", text: "A fixed-rate mortgage is only available for 30-year terms, while adjustable-rate mortgages can have various terms" },
        { letter: "C", text: "Fixed-rate mortgages are only for first-time homebuyers, while adjustable-rate mortgages are for experienced buyers" },
        { letter: "D", text: "The terms are interchangeable and refer to the same type of loan" }
      ]
    },
    {
      text: "What is a 'good faith estimate' (GFE) in mortgage lending?",
      answer: "A form that lenders must provide to borrowers showing estimated loan costs (now replaced by the Loan Estimate)",
      explanation: "A Good Faith Estimate (GFE) was a form that lenders were required to provide to mortgage applicants within three business days of application, showing estimated closing costs and loan terms. In 2015, the GFE was replaced by the Loan Estimate under the TILA-RESPA Integrated Disclosure (TRID) rules. The Loan Estimate provides similar information in a more consumer-friendly format designed to help borrowers compare loan offers.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A borrower's promise to repay a loan" },
        { letter: "B", text: "A form that lenders must provide to borrowers showing estimated loan costs (now replaced by the Loan Estimate)" },
        { letter: "C", text: "A test of a borrower's honesty during the application process" },
        { letter: "D", text: "A deposit made on a property purchase" }
      ]
    },
    {
      text: "What is a 'subordination clause' in mortgage financing?",
      answer: "A provision that places the lien of a mortgage in a lower priority position than another debt",
      explanation: "A subordination clause is a provision that places the lien of one mortgage in a lower priority position than another debt. This is common when refinancing a first mortgage with a home equity line of credit (HELOC) in second position. The HELOC lender must agree to remain in second position through subordination, allowing the new first mortgage to maintain priority in case of foreclosure.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A provision that places the lien of a mortgage in a lower priority position than another debt" },
        { letter: "B", text: "A clause that gives the lender the right to call the loan due" },
        { letter: "C", text: "A provision that requires subordinate employees to approve loans" },
        { letter: "D", text: "A clause that makes a co-signer secondary in responsibility" }
      ]
    },
    {
      text: "What is 'PITI' in mortgage financing?",
      answer: "Principal, Interest, Taxes, and Insurance - the components of a typical mortgage payment",
      explanation: "PITI stands for Principal, Interest, Taxes, and Insurance—the four components of a typical mortgage payment. Principal and interest are paid to the lender, while property taxes and homeowners insurance are often collected by the lender and held in an escrow account until due. Lenders use PITI to calculate debt-to-income ratios and determine how much a borrower can afford to pay each month.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Property Investment Tax Incentive" },
        { letter: "B", text: "Principal, Interest, Taxes, and Insurance - the components of a typical mortgage payment" },
        { letter: "C", text: "Purchaser's Initial Transaction Investment" },
        { letter: "D", text: "Property Inspection and Title Insurance" }
      ]
    },
    {
      text: "What is a 'bridge loan' in real estate financing?",
      answer: "Short-term financing used until permanent financing is secured or an existing obligation is removed",
      explanation: "A bridge loan is short-term financing used to 'bridge' the gap between the purchase of a new property and the sale of an existing one. It allows buyers to purchase before selling their current home. These loans typically have higher interest rates and fees than conventional mortgages due to their short terms (usually 6-12 months) and higher risk. They're repaid when the existing property sells.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Short-term financing used until permanent financing is secured or an existing obligation is removed" },
        { letter: "B", text: "A loan used to build a bridge or other structure on a property" },
        { letter: "C", text: "A loan that connects two separate properties owned by the same person" },
        { letter: "D", text: "Financing that bridges the gap between a buyer's offer and a seller's asking price" }
      ]
    },
    {
      text: "What is a 'piggyback loan'?",
      answer: "A second mortgage or home equity loan taken out simultaneously with a first mortgage",
      explanation: "A piggyback loan is a second mortgage or home equity loan taken out simultaneously with a first mortgage, usually to avoid paying private mortgage insurance (PMI). The most common arrangement is the '80-10-10' where the buyer puts 10% down, gets a first mortgage for 80% of the purchase price, and a second mortgage for the remaining 10%. This strategy can save on PMI but typically results in a higher interest rate on the second loan.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan that automatically increases each year" },
        { letter: "B", text: "A second mortgage or home equity loan taken out simultaneously with a first mortgage" },
        { letter: "C", text: "A loan where multiple borrowers share responsibility" },
        { letter: "D", text: "A loan that consolidates multiple debts into one payment" }
      ]
    },
    {
      text: "What is 'seasoning' in mortgage lending?",
      answer: "The aging of a loan or the time a borrower has owned a property",
      explanation: "In mortgage lending, seasoning refers to the aging of a loan or the time a borrower has owned a property. Lenders often require loans to be 'seasoned' for a certain period before allowing refinancing or considering certain types of loans. For example, cash-out refinancing may require 6-12 months of seasoning, and certain loan programs may require 2+ years of seasoning after bankruptcy before a borrower can qualify.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The aging of a loan or the time a borrower has owned a property" },
        { letter: "B", text: "Adding special terms to make a loan more attractive" },
        { letter: "C", text: "The process of preparing a home before listing it" },
        { letter: "D", text: "Adjusting a loan's terms based on market conditions" }
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
  
  console.log('\n=========== MORE FINANCE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreFinanceQuestions()
  .then(() => {
    console.log('More finance questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more finance questions:', error);
    process.exit(1);
  });