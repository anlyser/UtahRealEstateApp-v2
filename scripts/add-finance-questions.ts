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

async function addFinanceQuestions() {
  console.log('Starting to add real estate finance questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define finance questions
  const questions: Question[] = [
    {
      text: "What is the difference between a conforming loan and a non-conforming loan?",
      answer: "A conforming loan meets the guidelines set by Fannie Mae and Freddie Mac; a non-conforming loan does not",
      explanation: "A conforming loan meets the purchase guidelines established by Fannie Mae and Freddie Mac, including loan limits and credit requirements. Non-conforming loans exceed these limits ('jumbo loans') or don't meet other criteria. Conforming loans typically offer better rates and terms because they can be sold on the secondary market.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A conforming loan meets the guidelines set by Fannie Mae and Freddie Mac; a non-conforming loan does not" },
        { letter: "B", text: "A conforming loan is backed by the FHA; a non-conforming loan is conventional" },
        { letter: "C", text: "A conforming loan has a fixed rate; a non-conforming loan has an adjustable rate" },
        { letter: "D", text: "A conforming loan requires a 20% down payment; a non-conforming loan allows less" }
      ]
    },
    {
      text: "What is a 'discount point' in mortgage financing?",
      answer: "A fee paid to the lender at closing to reduce the interest rate",
      explanation: "A discount point is a fee paid to the lender at closing to reduce the interest rate on the mortgage. One point equals 1% of the loan amount. By paying points upfront, borrowers can secure a lower interest rate over the life of the loan, potentially saving money if they plan to keep the loan for many years.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A fee paid to the lender at closing to reduce the interest rate" },
        { letter: "B", text: "A reduction in the down payment requirement" },
        { letter: "C", text: "A discount on closing costs" },
        { letter: "D", text: "A reduced price negotiated by the buyer's agent" }
      ]
    },
    {
      text: "What is a 'rate lock' in mortgage financing?",
      answer: "A lender's guarantee that the interest rate will not change for a specified period",
      explanation: "A rate lock is a lender's guarantee that the borrower's interest rate will not change for a specified period, typically 30, 45, 60, or 90 days. Rate locks protect borrowers from rising interest rates during the loan application and processing period, providing certainty about monthly payments.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lender's guarantee that the interest rate will not change for a specified period" },
        { letter: "B", text: "A fee charged by the lender to process the loan" },
        { letter: "C", text: "A restriction on refinancing within a certain time period" },
        { letter: "D", text: "A limit on how much the interest rate can adjust annually" }
      ]
    },
    {
      text: "What is the typical term of a conventional fixed-rate mortgage?",
      answer: "30 years",
      explanation: "The most common term for a conventional fixed-rate mortgage in the United States is 30 years. This longer term results in lower monthly payments, making homeownership more affordable. Other common terms include 15 years (higher payments but less total interest) and 20 years (a middle ground).",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "10 years" },
        { letter: "B", text: "15 years" },
        { letter: "C", text: "30 years" },
        { letter: "D", text: "40 years" }
      ]
    },
    {
      text: "What is a 'prepayment penalty' in mortgage financing?",
      answer: "A fee charged for paying off a mortgage before the end of the term",
      explanation: "A prepayment penalty is a fee some lenders charge if a borrower pays off their mortgage early, either through refinancing, selling the property, or making large additional principal payments. These penalties protect lenders from lost interest revenue. Many loans today don't have prepayment penalties, and they're restricted on certain loan types.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A fee charged for paying off a mortgage before the end of the term" },
        { letter: "B", text: "A penalty for making a late payment" },
        { letter: "C", text: "An extra fee for processing the loan paperwork early" },
        { letter: "D", text: "A charge for applying for the loan before approval" }
      ]
    },
    {
      text: "What is the purpose of 'escrow' in a mortgage payment?",
      answer: "To collect and hold funds for property taxes and insurance",
      explanation: "Mortgage escrow accounts collect and hold funds for property taxes and insurance as part of the borrower's monthly payment. The lender then pays these bills when they come due. This system ensures these important obligations are paid on time, protecting both the lender's interest in the property and the borrower from missed payments.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To collect and hold funds for property taxes and insurance" },
        { letter: "B", text: "To save for future home improvements" },
        { letter: "C", text: "To pay the real estate agent's commission" },
        { letter: "D", text: "To cover potential foreclosure costs" }
      ]
    },
    {
      text: "What is a 'HELOC' in real estate finance?",
      answer: "Home Equity Line of Credit",
      explanation: "A HELOC (Home Equity Line of Credit) is a revolving line of credit secured by the equity in a home. It functions like a credit card, allowing homeowners to borrow up to a set limit, repay, and borrow again. HELOCs typically have variable interest rates and are often used for home improvements, education costs, or debt consolidation.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Home Equity Line of Credit" },
        { letter: "B", text: "Housing Emergency Loan Option Contract" },
        { letter: "C", text: "Home Equity Loan on Completion" },
        { letter: "D", text: "Housing Endowment Loan Organization Commission" }
      ]
    },
    {
      text: "What is 'mortgage interest tax deduction'?",
      answer: "A tax benefit allowing homeowners to deduct mortgage interest paid from their taxable income",
      explanation: "The mortgage interest tax deduction is a benefit that allows homeowners to deduct the interest paid on their mortgage from their taxable income. This can result in a lower tax bill and is one of the financial advantages of homeownership. However, it's only beneficial if the taxpayer itemizes deductions rather than taking the standard deduction.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A tax benefit allowing homeowners to deduct mortgage interest paid from their taxable income" },
        { letter: "B", text: "A reduction in interest rates for borrowers with good credit" },
        { letter: "C", text: "A tax credit for first-time homebuyers" },
        { letter: "D", text: "An interest rebate program offered by lenders" }
      ]
    },
    {
      text: "What is a 'piggyback loan' in mortgage financing?",
      answer: "A second mortgage or HELOC taken out at the same time as the first mortgage",
      explanation: "A piggyback loan is a second mortgage or HELOC taken out simultaneously with the first mortgage. The most common arrangement is the 80-10-10, where the first mortgage is for 80% of the purchase price, the piggyback loan for 10%, and the down payment is 10%. This approach can help borrowers avoid private mortgage insurance.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A loan that combines a mortgage and home equity loan" },
        { letter: "B", text: "A second mortgage or HELOC taken out at the same time as the first mortgage" },
        { letter: "C", text: "A loan that requires the borrower to pay twice a month" },
        { letter: "D", text: "A loan that carries forward from one property to another" }
      ]
    },
    {
      text: "What is 'PITI' in mortgage payments?",
      answer: "Principal, Interest, Taxes, and Insurance",
      explanation: "PITI stands for Principal, Interest, Taxes, and Insurance—the four components of a typical mortgage payment. Principal reduces the loan balance, interest is the cost of borrowing, taxes are property taxes, and insurance includes homeowners insurance and possibly PMI. Lenders use PITI to calculate affordability ratios like debt-to-income.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Property Investment Tax Index" },
        { letter: "B", text: "Principal, Interest, Taxes, and Insurance" },
        { letter: "C", text: "Payment Insurance and Title Indemnity" },
        { letter: "D", text: "Primary Installment Term Indicator" }
      ]
    },
    {
      text: "What is the primary advantage of a 15-year mortgage compared to a 30-year mortgage?",
      answer: "Less total interest paid over the life of the loan",
      explanation: "The primary advantage of a 15-year mortgage is that the borrower pays significantly less total interest over the life of the loan compared to a 30-year mortgage. This is due to both the shorter loan term and typically lower interest rates. However, 15-year mortgages have higher monthly payments, which can affect affordability.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Lower monthly payments" },
        { letter: "B", text: "Less total interest paid over the life of the loan" },
        { letter: "C", text: "Lower down payment requirements" },
        { letter: "D", text: "No private mortgage insurance required" }
      ]
    },
    {
      text: "What is an 'assumable mortgage'?",
      answer: "A mortgage that can be taken over by a buyer from the seller",
      explanation: "An assumable mortgage allows a buyer to take over the seller's existing mortgage with its current interest rate, term, and balance. This can be advantageous when current interest rates are higher than the rate on the assumable loan. Not all mortgages are assumable; FHA and VA loans typically are, while conventional loans often are not.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A mortgage that can be taken over by a buyer from the seller" },
        { letter: "B", text: "A mortgage that automatically renews at the end of its term" },
        { letter: "C", text: "A mortgage with an interest rate that adjusts based on assumptions about future rates" },
        { letter: "D", text: "A mortgage that doesn't require proof of income" }
      ]
    },
    {
      text: "What is 'LTV' in mortgage financing?",
      answer: "Loan-to-Value ratio",
      explanation: "LTV (Loan-to-Value) ratio is the relationship between the loan amount and the appraised value of the property, expressed as a percentage. For example, an $80,000 loan on a $100,000 property has an 80% LTV. Lenders use LTV to assess lending risk—higher LTVs represent greater risk and may require mortgage insurance or higher interest rates.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Long Term Valuation" },
        { letter: "B", text: "Loan-to-Value ratio" },
        { letter: "C", text: "Lifetime Total Variance" },
        { letter: "D", text: "Lender's Title Verification" }
      ]
    },
    {
      text: "What is the primary purpose of the Truth in Lending Act (TILA) in mortgage financing?",
      answer: "To ensure borrowers receive clear information about loan terms and costs",
      explanation: "The Truth in Lending Act (TILA) requires lenders to provide clear, accurate disclosure of key loan terms and costs, enabling borrowers to comparison shop and make informed decisions. TILA mandates disclosure of the APR, finance charges, amount financed, total payments, and other critical information in a standardized format.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To set interest rate caps" },
        { letter: "B", text: "To ensure borrowers receive clear information about loan terms and costs" },
        { letter: "C", text: "To establish down payment requirements" },
        { letter: "D", text: "To regulate mortgage brokers" }
      ]
    },
    {
      text: "What is a 'subordination clause' in a mortgage?",
      answer: "A provision that establishes the priority of liens on a property",
      explanation: "A subordination clause establishes the priority order of liens on a property. It's typically used when a property has multiple loans secured against it, establishing which lender has first claim to the property in case of default. When refinancing a first mortgage with a home equity loan in place, a subordination agreement ensures the new first mortgage maintains priority.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A provision that establishes the priority of liens on a property" },
        { letter: "B", text: "A clause that allows the lender to change the interest rate" },
        { letter: "C", text: "A provision that requires additional collateral" },
        { letter: "D", text: "A clause that restricts prepayment of the loan" }
      ]
    },
    {
      text: "What is the 'acceleration clause' in a mortgage?",
      answer: "A provision that allows the lender to demand full repayment if the borrower defaults",
      explanation: "An acceleration clause is a provision in a mortgage that allows the lender to demand immediate full repayment of the loan balance if the borrower defaults on the terms, typically by missing payments. This clause gives the lender the right to 'accelerate' the due date of all remaining payments, initiating the foreclosure process.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A provision that allows the lender to demand full repayment if the borrower defaults" },
        { letter: "B", text: "A clause that allows for faster payment processing" },
        { letter: "C", text: "A provision that increases the interest rate over time" },
        { letter: "D", text: "A clause that speeds up the loan approval process" }
      ]
    },
    {
      text: "What is 'negative amortization' in a mortgage?",
      answer: "When the loan balance increases because the monthly payment doesn't cover all the interest due",
      explanation: "Negative amortization occurs when the monthly payment is less than the interest accrued, causing the unpaid interest to be added to the principal balance. This results in the loan balance increasing over time rather than decreasing. This can happen with certain adjustable-rate or payment-option loans and can lead to owing more than the original loan amount.",
      categoryName: "Finance",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When the loan balance increases because the monthly payment doesn't cover all the interest due" },
        { letter: "B", text: "When the property value decreases below the loan amount" },
        { letter: "C", text: "When the interest rate becomes negative" },
        { letter: "D", text: "When the lender charges a prepayment penalty" }
      ]
    },
    {
      text: "What is a 'cash-out refinance'?",
      answer: "Refinancing for more than the balance owed and taking the difference in cash",
      explanation: "A cash-out refinance involves taking out a new mortgage for more than the current loan balance and receiving the difference in cash. Homeowners use this to access equity for home improvements, debt consolidation, or other financial needs. The new loan replaces the existing mortgage, typically with different terms and often a higher balance.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Refinancing for more than the balance owed and taking the difference in cash" },
        { letter: "B", text: "Refinancing with no closing costs" },
        { letter: "C", text: "Paying cash to reduce the loan balance when refinancing" },
        { letter: "D", text: "Refinancing a property and selling it immediately" }
      ]
    },
    {
      text: "What is an 'escrow waiver' in mortgage financing?",
      answer: "An agreement that allows the borrower to pay property taxes and insurance directly instead of through the lender",
      explanation: "An escrow waiver allows borrowers to pay property taxes and insurance premiums directly rather than having them collected monthly and paid by the lender through an escrow account. Lenders often require a lower LTV ratio (typically 80% or less) and may charge a fee or slightly higher interest rate to approve an escrow waiver.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agreement that allows the borrower to pay property taxes and insurance directly instead of through the lender" },
        { letter: "B", text: "A document that excuses the buyer from having an escrow closing" },
        { letter: "C", text: "A waiver that eliminates the need for an escrow company" },
        { letter: "D", text: "An agreement that reduces the escrow deposit amount" }
      ]
    },
    {
      text: "What is a 'good faith estimate' in mortgage financing?",
      answer: "A document that provides an estimate of closing costs and loan terms",
      explanation: "A Good Faith Estimate (GFE) is a document that provides borrowers with an estimate of the closing costs and loan terms for their mortgage. Lenders must provide this within three business days of receiving a loan application. The GFE helps borrowers understand potential costs and compare offers from different lenders. It has been replaced by the Loan Estimate form under newer TRID regulations.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A document that provides an estimate of closing costs and loan terms" },
        { letter: "B", text: "An agreement showing the lender is operating in good faith" },
        { letter: "C", text: "A guarantee of interest rates" },
        { letter: "D", text: "A pre-approval letter from the lender" }
      ]
    },
    {
      text: "What is 'APR' in mortgage financing?",
      answer: "Annual Percentage Rate, which includes the interest rate plus other loan costs",
      explanation: "APR (Annual Percentage Rate) represents the true cost of borrowing, expressed as a yearly rate. Unlike the simple interest rate, APR includes the interest rate plus other loan costs such as points, mortgage insurance, and certain closing costs. This provides a more comprehensive view of the loan's cost, allowing for more accurate comparison between loan offers.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Annual Percentage Rate, which includes the interest rate plus other loan costs" },
        { letter: "B", text: "Annual Property Rate, which is the yearly cost of property taxes" },
        { letter: "C", text: "Adjustable Payment Rate, which is how much payments can change yearly" },
        { letter: "D", text: "Approved Principal Reduction, which is how quickly the loan balance decreases" }
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
  
  console.log('\n=========== FINANCE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinanceQuestions()
  .then(() => {
    console.log('Finance questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding finance questions:', error);
    process.exit(1);
  });