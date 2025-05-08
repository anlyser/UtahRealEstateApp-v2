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

async function addMoreComprehensiveQuestions() {
  console.log('Starting to add MORE comprehensive real estate exam questions (Part 2)...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more comprehensive questions
  const questions: Question[] = [
    // More Property Ownership Questions
    {
      text: "What is a fee simple absolute interest in real estate?",
      answer: "The highest form of ownership with unconditional rights",
      explanation: "Fee simple absolute is the most complete form of property ownership, giving the owner unconditional rights to use, possess, sell, lease, or will the property, subject only to government powers (taxation, eminent domain, police power, and escheat).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Ownership that expires upon the owner's death" },
        { letter: "B", text: "The highest form of ownership with unconditional rights" },
        { letter: "C", text: "A temporary right to use property" },
        { letter: "D", text: "Ownership limited by a specific condition" }
      ]
    },
    {
      text: "What is a 'life estate'?",
      answer: "A property interest that lasts for the duration of someone's life",
      explanation: "A life estate gives a person (the life tenant) the right to use and occupy a property for their lifetime, after which the property passes to a designated remainderman. The life tenant has rights to use and profit from the property but cannot damage or sell it.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Ownership that includes only the building, not the land" },
        { letter: "B", text: "A property interest that lasts for the duration of someone's life" },
        { letter: "C", text: "Property held in trust for minor children" },
        { letter: "D", text: "A lease that renews automatically each year" }
      ]
    },
    {
      text: "What type of deed offers the most guarantees to the buyer?",
      answer: "General warranty deed",
      explanation: "A general warranty deed provides the most guarantees to the buyer, as the grantor (seller) warrants against all defects in title for the entire history of the property, not just during their ownership. This includes covenants of seisin, quiet enjoyment, right to convey, freedom from encumbrances, and defense of title.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Quitclaim deed" },
        { letter: "B", text: "Special warranty deed" },
        { letter: "C", text: "General warranty deed" },
        { letter: "D", text: "Grant deed" }
      ]
    },
    {
      text: "What is adverse possession?",
      answer: "A method of acquiring title by openly occupying someone else's property for a statutory period",
      explanation: "Adverse possession allows someone to gain legal ownership of property they don't legally own by openly occupying it for a statutory period (varies by state, typically 7-20 years). The possession must be actual, open, notorious, exclusive, continuous, and hostile (without permission).",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Taking property through eminent domain" },
        { letter: "B", text: "A method of acquiring title by openly occupying someone else's property for a statutory period" },
        { letter: "C", text: "A court-ordered transfer of ownership" },
        { letter: "D", text: "Renting property without a written lease" }
      ]
    },
    {
      text: "What document is used to transfer title to real property?",
      answer: "Deed",
      explanation: "A deed is a legal document that transfers title (ownership) of real property from one party to another. To be valid, it must identify the grantor and grantee, include words of conveyance, provide a legal description of the property, and be signed by the grantor.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Mortgage" },
        { letter: "B", text: "Deed" },
        { letter: "C", text: "Title insurance policy" },
        { letter: "D", text: "Bill of sale" }
      ]
    },
    
    // More Agency Questions
    {
      text: "What is the difference between a general agent and a special agent?",
      answer: "A general agent can act on behalf of the principal in a range of matters; a special agent is limited to a specific transaction",
      explanation: "A general agent has authority to act on behalf of the principal in a variety of matters or business affairs. A special agent is authorized to act only in a specific transaction or for a specific purpose. Real estate agents are typically special agents.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A general agent works full-time; a special agent works part-time" },
        { letter: "B", text: "A general agent can act on behalf of the principal in a range of matters; a special agent is limited to a specific transaction" },
        { letter: "C", text: "A general agent has more education; a special agent has specialized training" },
        { letter: "D", text: "A general agent represents buyers; a special agent represents sellers" }
      ]
    },
    {
      text: "Which of the following is NOT a way that an agency relationship can be terminated?",
      answer: "If the agent buys a property for themselves",
      explanation: "An agency relationship can be terminated by: completion of the task, expiration of the agreement, mutual agreement, death or incapacity of either party, destruction of the property, or by operation of law (bankruptcy, etc.). An agent buying property for themselves doesn't automatically terminate all agency relationships.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Expiration of the agency agreement" },
        { letter: "B", text: "Death of either the principal or agent" },
        { letter: "C", text: "If the agent buys a property for themselves" },
        { letter: "D", text: "By mutual agreement of both parties" }
      ]
    },
    {
      text: "What is a 'designated agency'?",
      answer: "When a broker designates different agents within the same firm to represent the buyer and seller separately",
      explanation: "Designated agency occurs when a real estate broker designates specific agents within the same brokerage to represent the buyer and seller separately. This approach helps manage in-house transactions while minimizing conflicts of interest common in dual agency.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When an agent represents only buyers" },
        { letter: "B", text: "When an agent represents only sellers" },
        { letter: "C", text: "When a broker designates different agents within the same firm to represent the buyer and seller separately" },
        { letter: "D", text: "When two brokers from different firms represent one client" }
      ]
    },
    {
      text: "What is required for an effective agency disclosure in Utah?",
      answer: "Written disclosure to all parties in the transaction before they are asked to sign any agreements",
      explanation: "In Utah, real estate licensees must provide a written agency disclosure to all parties in a transaction before they sign any agreements or contracts. This disclosure must clearly state who the agent represents and obtain acknowledgment from all parties.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Verbal disclosure at the time of closing" },
        { letter: "B", text: "Written disclosure to all parties in the transaction before they are asked to sign any agreements" },
        { letter: "C", text: "Including the disclosure in the fine print of the purchase contract" },
        { letter: "D", text: "Having the information posted in the real estate office" }
      ]
    },
    {
      text: "What is the term for a broker acting as a neutral intermediary in a transaction?",
      answer: "Transaction broker or facilitator",
      explanation: "A transaction broker (or facilitator) acts as a neutral third party who assists both the buyer and seller in completing a real estate transaction but doesn't represent either party in a fiduciary capacity. They provide information and help with paperwork but don't advocate for either side.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Dual agent" },
        { letter: "B", text: "Transaction broker or facilitator" },
        { letter: "C", text: "Cooperating broker" },
        { letter: "D", text: "Independent agent" }
      ]
    },
    
    // More Contracts Questions
    {
      text: "What is a novation in a real estate contract?",
      answer: "The substitution of a new contract for an old one, with all parties agreeing",
      explanation: "Novation is the substitution of a new contract for an existing one, with all parties agreeing to the change. The original contract is extinguished, and a new one takes its place, typically involving a change in the parties (such as a new buyer taking over a contract).",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A minor modification to an existing contract" },
        { letter: "B", text: "The substitution of a new contract for an old one, with all parties agreeing" },
        { letter: "C", text: "The addition of new terms to a contract" },
        { letter: "D", text: "The transfer of rights but not obligations" }
      ]
    },
    {
      text: "What is the Statute of Frauds relevant to real estate?",
      answer: "It requires certain real estate contracts to be in writing to be enforceable",
      explanation: "The Statute of Frauds requires certain contracts, including those for the sale of real estate, to be in writing to be legally enforceable. This prevents fraud and misunderstandings by ensuring important agreements like property sales are documented rather than relying on verbal agreements.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "It establishes penalties for real estate fraud" },
        { letter: "B", text: "It requires certain real estate contracts to be in writing to be enforceable" },
        { letter: "C", text: "It sets minimum standards for real estate advertisements" },
        { letter: "D", text: "It requires all contracts to be notarized" }
      ]
    },
    {
      text: "What is an 'assignment' in a real estate contract?",
      answer: "The transfer of contract rights from one party to another",
      explanation: "An assignment is the transfer of rights (but not obligations) from one party (the assignor) to another (the assignee). In real estate, a buyer might assign their rights under a purchase contract to another buyer, but the original buyer typically remains liable unless released.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A task that must be completed before closing" },
        { letter: "B", text: "The transfer of contract rights from one party to another" },
        { letter: "C", text: "A document specifying which items stay with the property" },
        { letter: "D", text: "A property inspection requirement" }
      ]
    },
    {
      text: "Which of the following would NOT be a valid reason for contract rescission?",
      answer: "A party changes their mind about the transaction",
      explanation: "Contract rescission (cancellation that returns parties to their original positions) is available for reasons like fraud, misrepresentation, mistake, duress, or lack of capacity—but not simply because one party changes their mind. A change of heart doesn't legally justify rescission.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Fraud or misrepresentation" },
        { letter: "B", text: "Mutual mistake about a material fact" },
        { letter: "C", text: "A party changes their mind about the transaction" },
        { letter: "D", text: "One party lacked capacity to contract" }
      ]
    },
    {
      text: "In a real estate contract, what is a 'contingency'?",
      answer: "A condition that must be satisfied for the contract to become binding",
      explanation: "A contingency is a condition that must be met for a contract to become fully binding. Common real estate contingencies include financing approval, satisfactory home inspection, appraisal, and sale of the buyer's current home. If a contingency isn't met, the contract can be terminated without penalty.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A condition that must be satisfied for the contract to become binding" },
        { letter: "B", text: "A penalty for breaching the contract" },
        { letter: "C", text: "The timeline for completing the transaction" },
        { letter: "D", text: "A required disclosure about the property" }
      ]
    },
    
    // More Finance Questions
    {
      text: "What is a 'balloon payment' in a mortgage?",
      answer: "A large final payment due at the end of the loan term",
      explanation: "A balloon payment is a large, lump-sum payment due at the end of a loan term. Balloon mortgages typically feature lower monthly payments during the loan term but require the borrower to pay off the remaining balance in one large payment or refinance the loan.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An extra payment made to reduce principal" },
        { letter: "B", text: "A large final payment due at the end of the loan term" },
        { letter: "C", text: "The initial down payment" },
        { letter: "D", text: "A penalty for paying off the loan early" }
      ]
    },
    {
      text: "What is 'amortization' in a mortgage loan?",
      answer: "The gradual reduction of loan principal over time through regular payments",
      explanation: "Amortization is the process of gradually reducing a loan balance through regular payments that cover both principal and interest. In a fully amortizing loan, each payment reduces the principal by a small amount, with the proportion of principal versus interest changing over the loan term.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The gradual reduction of loan principal over time through regular payments" },
        { letter: "B", text: "The process of determining loan eligibility" },
        { letter: "C", text: "The transfer of a loan to another lender" },
        { letter: "D", text: "The calculation of interest rates" }
      ]
    },
    {
      text: "What is private mortgage insurance (PMI)?",
      answer: "Insurance that protects the lender when the down payment is less than 20%",
      explanation: "Private Mortgage Insurance (PMI) protects the lender against loss if a borrower defaults on a conventional loan with less than a 20% down payment. The borrower pays the premiums, but the insurance benefits the lender. PMI can be removed once the loan-to-value ratio reaches 78-80%.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Insurance that protects the lender when the down payment is less than 20%" },
        { letter: "B", text: "Insurance that pays off the mortgage if the borrower dies" },
        { letter: "C", text: "Insurance that protects the buyer against property defects" },
        { letter: "D", text: "Insurance that covers damage to the property" }
      ]
    },
    {
      text: "What is a 'debt-to-income ratio' in mortgage qualification?",
      answer: "The percentage of a borrower's gross monthly income that goes toward paying debts",
      explanation: "The debt-to-income (DTI) ratio is the percentage of a borrower's gross monthly income that goes toward paying debts. Lenders use this ratio to assess a borrower's ability to repay a mortgage. Generally, a DTI of 43% or less is preferred for most mortgage loans.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The ratio of the loan amount to the property value" },
        { letter: "B", text: "The percentage of a borrower's gross monthly income that goes toward paying debts" },
        { letter: "C", text: "The ratio of fixed to adjustable interest" },
        { letter: "D", text: "The percentage of the mortgage that has been paid off" }
      ]
    },
    {
      text: "What is an 'escrow account' in the context of a mortgage?",
      answer: "An account held by the lender to pay property taxes and insurance",
      explanation: "An escrow account (or impound account) is a separate account maintained by the mortgage servicer to pay property taxes and insurance premiums on behalf of the borrower. The borrower's monthly payment includes these amounts, which are then disbursed when the bills come due.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An account where the down payment is held" },
        { letter: "B", text: "An account held by the lender to pay property taxes and insurance" },
        { letter: "C", text: "A savings account required for loan approval" },
        { letter: "D", text: "An investment account offered by mortgage lenders" }
      ]
    },
    
    // More Practice Questions
    {
      text: "What is a Comparative Market Analysis (CMA) used for?",
      answer: "To estimate a property's value based on similar recently sold properties",
      explanation: "A Comparative Market Analysis (CMA) is a tool used by real estate agents to estimate a property's market value by comparing it to similar properties (comps) that have recently sold in the same area. It helps sellers set appropriate listing prices and helps buyers make competitive offers.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To determine property tax assessments" },
        { letter: "B", text: "To estimate a property's value based on similar recently sold properties" },
        { letter: "C", text: "To evaluate a neighborhood's growth potential" },
        { letter: "D", text: "To calculate mortgage qualification amounts" }
      ]
    },
    {
      text: "What is a 'pocket listing' in real estate?",
      answer: "A listing that is not entered into the MLS",
      explanation: "A pocket listing (or office exclusive) is a property listing that is not shared on the Multiple Listing Service (MLS). The listing agent keeps it 'in their pocket,' marketing it privately to select buyers. This practice has become increasingly restricted due to concerns about fair housing and transparency.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing that is about to expire" },
        { letter: "B", text: "A listing that is not entered into the MLS" },
        { letter: "C", text: "A listing with a very low commission" },
        { letter: "D", text: "A listing that can be shown by appointment only" }
      ]
    },
    {
      text: "What is an 'open listing' in real estate?",
      answer: "A non-exclusive listing where any broker who finds a buyer can earn the commission",
      explanation: "An open listing is a non-exclusive agreement where the seller retains the right to sell the property themselves and can work with multiple brokers simultaneously. The commission is paid only to the broker who actually finds a buyer, creating a 'first-come, first-served' situation.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing where the property is shown during specified 'open house' hours" },
        { letter: "B", text: "A listing without a set expiration date" },
        { letter: "C", text: "A non-exclusive listing where any broker who finds a buyer can earn the commission" },
        { letter: "D", text: "A listing that is open to all qualified buyers" }
      ]
    },
    {
      text: "What is the purpose of a 'lock box' in real estate?",
      answer: "To allow authorized agents access to a property's key for showings",
      explanation: "A lock box (or key box) is a secure container that holds a property key and is typically attached to the front door or nearby. It allows authorized real estate agents to access the key to show the property when the owner or listing agent isn't present, using a special key or electronic access code.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To allow authorized agents access to a property's key for showings" },
        { letter: "B", text: "To secure valuable items during an open house" },
        { letter: "C", text: "To store important documents related to the listing" },
        { letter: "D", text: "To protect a homeowner's mailbox" }
      ]
    },
    {
      text: "What is 'procuring cause' in a real estate commission dispute?",
      answer: "The agent whose efforts primarily led to the completion of the sale",
      explanation: "Procuring cause refers to the agent whose actions were the primary reason the sale was completed. In commission disputes, procuring cause is determined by examining the entire chain of events, not just who showed the property first or who wrote the offer, to determine which agent deserves the commission.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The agent whose efforts primarily led to the completion of the sale" },
        { letter: "B", text: "The agent who first showed the property to the buyer" },
        { letter: "C", text: "The listing agent, regardless of who found the buyer" },
        { letter: "D", text: "The broker who processed the paperwork" }
      ]
    },
    
    // More Appraisal Questions
    {
      text: "What is 'highest and best use' in property appraisal?",
      answer: "The legally permissible and financially feasible use that results in the highest property value",
      explanation: "Highest and best use is the reasonable, legal use of vacant land or an improved property that is physically possible, appropriately supported, financially feasible, and results in the highest value. It's a fundamental concept in real estate appraisal and development.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The most expensive property in a neighborhood" },
        { letter: "B", text: "The legally permissible and financially feasible use that results in the highest property value" },
        { letter: "C", text: "The use that generates the most income" },
        { letter: "D", text: "The use preferred by the local government" }
      ]
    },
    {
      text: "In the Sales Comparison Approach to appraisal, what are 'adjustments'?",
      answer: "Dollar amounts added or subtracted to reflect differences between comparable properties and the subject property",
      explanation: "In the Sales Comparison Approach, adjustments are dollar amounts added or subtracted from the sales prices of comparable properties to account for differences between them and the subject property. These differences may include location, size, features, condition, and sale date.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Changes made to the subject property before valuation" },
        { letter: "B", text: "Dollar amounts added or subtracted to reflect differences between comparable properties and the subject property" },
        { letter: "C", text: "Fluctuations in the real estate market" },
        { letter: "D", text: "Discounts offered by the seller" }
      ]
    },
    {
      text: "What is the 'gross rent multiplier' used for?",
      answer: "To estimate a property's value based on its gross rental income",
      explanation: "The Gross Rent Multiplier (GRM) is a simple method to estimate a property's value by multiplying its gross annual rental income by a factor derived from similar properties. It's calculated by dividing the sales price by the gross annual rental income (GRM = Sales Price ÷ Gross Annual Rent).",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To estimate a property's value based on its gross rental income" },
        { letter: "B", text: "To calculate the return on investment" },
        { letter: "C", text: "To determine the appropriate rental rate" },
        { letter: "D", text: "To predict future appreciation rates" }
      ]
    },
    {
      text: "What is 'functional obsolescence' in real estate appraisal?",
      answer: "Loss in value due to outdated features or poor design relative to current market standards",
      explanation: "Functional obsolescence is the loss in value due to factors within the property itself, such as outdated features, poor design, or layout issues that reduce utility compared to current market standards. Examples include inadequate closet space, outdated kitchens, or poor floor plans.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Loss in value due to outdated features or poor design relative to current market standards" },
        { letter: "B", text: "Loss in value due to physical deterioration" },
        { letter: "C", text: "Loss in value due to negative external factors" },
        { letter: "D", text: "Loss in value due to age alone" }
      ]
    },
    {
      text: "What is the capitalization rate in real estate valuation?",
      answer: "The rate of return expected on a real estate investment property based on the income it produces",
      explanation: "The capitalization (cap) rate is the rate of return expected on a real estate investment property based on the income it generates. It's calculated by dividing the property's net operating income (NOI) by its current market value (Cap Rate = NOI ÷ Market Value).",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The rate of return expected on a real estate investment property based on the income it produces" },
        { letter: "B", text: "The interest rate charged by the mortgage lender" },
        { letter: "C", text: "The rate of property appreciation in a market" },
        { letter: "D", text: "The rate at which a property depreciates for tax purposes" }
      ]
    },
    
    // More Federal Regulations Questions
    {
      text: "What does RESPA (Real Estate Settlement Procedures Act) regulate?",
      answer: "Closing costs and settlement procedures for residential transactions",
      explanation: "RESPA regulates the settlement process for residential real estate transactions involving federally related mortgage loans. It requires lenders to provide borrowers with disclosures about closing costs, prohibits kickbacks, limits escrow account amounts, and regulates servicing and escrow account practices.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Property tax assessments" },
        { letter: "B", text: "Building codes and zoning" },
        { letter: "C", text: "Closing costs and settlement procedures for residential transactions" },
        { letter: "D", text: "Commercial property sales" }
      ]
    },
    {
      text: "What does TILA (Truth in Lending Act) require lenders to disclose to borrowers?",
      answer: "The annual percentage rate (APR) and terms of the loan",
      explanation: "The Truth in Lending Act requires lenders to disclose the annual percentage rate (APR), loan terms, total costs of the loan, and related information to borrowers. TILA's purpose is to promote informed use of consumer credit by requiring clear disclosure of terms and costs.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The annual percentage rate (APR) and terms of the loan" },
        { letter: "B", text: "The lender's profit margin" },
        { letter: "C", text: "The borrower's credit score" },
        { letter: "D", text: "The property's appraised value" }
      ]
    },
    {
      text: "Under the Americans with Disabilities Act (ADA), which properties must be accessible?",
      answer: "Public accommodations and commercial facilities",
      explanation: "The Americans with Disabilities Act (ADA) requires public accommodations (hotels, restaurants, retail stores, etc.) and commercial facilities to be accessible to people with disabilities. It generally doesn't apply to residential properties except for public spaces in multi-family dwellings.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "All properties built after 1990" },
        { letter: "B", text: "Public accommodations and commercial facilities" },
        { letter: "C", text: "Only government buildings" },
        { letter: "D", text: "All single-family homes" }
      ]
    },
    {
      text: "What is the purpose of the Foreign Investment in Real Property Tax Act (FIRPTA)?",
      answer: "To ensure that foreign sellers of U.S. real estate pay taxes on their gains",
      explanation: "FIRPTA requires buyers to withhold a percentage of the sales price when purchasing U.S. real property from foreign persons. This withholding ensures that foreign sellers pay taxes on their U.S. real property gains, as they might otherwise be beyond the reach of IRS collection efforts.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To restrict foreign ownership of U.S. property" },
        { letter: "B", text: "To ensure that foreign sellers of U.S. real estate pay taxes on their gains" },
        { letter: "C", text: "To provide tax incentives for foreign investment" },
        { letter: "D", text: "To require foreign buyers to register their properties" }
      ]
    },
    {
      text: "What federal act requires lenders to evaluate the borrower's ability to repay a loan?",
      answer: "Dodd-Frank Wall Street Reform and Consumer Protection Act",
      explanation: "The Dodd-Frank Act, passed in 2010 after the financial crisis, requires lenders to make a reasonable, good-faith determination of a borrower's ability to repay a mortgage loan. This protects consumers from predatory lending practices and helps prevent another mortgage crisis.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Equal Credit Opportunity Act" },
        { letter: "B", text: "Fair Housing Act" },
        { letter: "C", text: "Real Estate Settlement Procedures Act" },
        { letter: "D", text: "Dodd-Frank Wall Street Reform and Consumer Protection Act" }
      ]
    },
    
    // More Utah Law Questions
    {
      text: "In Utah, what is the function of the Division of Real Estate?",
      answer: "To regulate and license real estate professionals",
      explanation: "The Utah Division of Real Estate regulates and licenses real estate professionals in the state, including agents, brokers, appraisers, and property managers. It also investigates complaints, enforces real estate laws, creates administrative rules, and provides education to the public.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To regulate and license real estate professionals" },
        { letter: "B", text: "To manage state-owned properties" },
        { letter: "C", text: "To collect property taxes" },
        { letter: "D", text: "To approve new developments" }
      ]
    },
    {
      text: "In Utah, what is the minimum age requirement to become a licensed real estate agent?",
      answer: "18 years",
      explanation: "In Utah, applicants for a real estate sales agent license must be at least 18 years old. This is in addition to other requirements including completion of pre-licensing education, passing the state and national portions of the licensing exam, and being sponsored by a licensed broker.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "18 years" },
        { letter: "B", text: "19 years" },
        { letter: "C", text: "21 years" },
        { letter: "D", text: "25 years" }
      ]
    },
    {
      text: "In Utah, what is the standard earnest money deposit amount?",
      answer: "There is no standard amount; it is negotiable",
      explanation: "In Utah, there is no legally required standard amount for earnest money deposits. The amount is negotiable between buyer and seller and varies based on the transaction. Typical amounts might range from 1-3% of the purchase price, but this can vary widely based on market conditions and property type.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "1% of the purchase price" },
        { letter: "B", text: "There is no standard amount; it is negotiable" },
        { letter: "C", text: "$5,000" },
        { letter: "D", text: "3% of the purchase price" }
      ]
    },
    {
      text: "According to Utah law, what is a 'stigmatized property'?",
      answer: "A property that has been the site of a suicide, homicide, or other felony, or has been occupied by someone with a disease not transmitted through occupancy",
      explanation: "In Utah, a 'stigmatized property' is defined as a property that was the site of a homicide, suicide, criminal activity, or occupied by someone with a disease that isn't transmitted through occupancy. Utah law specifically states that these factors are not material facts that must be disclosed by sellers or agents.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A property with structural defects" },
        { letter: "B", text: "A property with environmental contamination" },
        { letter: "C", text: "A property that has been the site of a suicide, homicide, or other felony, or has been occupied by someone with a disease not transmitted through occupancy" },
        { letter: "D", text: "A property that has been foreclosed upon" }
      ]
    },
    {
      text: "In Utah, what is required when a licensee is acting as a principal in a real estate transaction?",
      answer: "Written disclosure that they are licensed and acting on their own behalf",
      explanation: "In Utah, when a real estate licensee is involved in a transaction as a principal (buying or selling property for themselves), they must provide written disclosure of their license status to all parties. This informs others that the licensee has specialized knowledge and is acting on their own behalf, not as an agent.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Nothing; they are acting as a private individual" },
        { letter: "B", text: "Written disclosure that they are licensed and acting on their own behalf" },
        { letter: "C", text: "Permission from their broker" },
        { letter: "D", text: "Approval from the Division of Real Estate" }
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
  
  console.log('\n=========== MORE COMPREHENSIVE QUESTIONS ADDED (Part 2) ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreComprehensiveQuestions()
  .then(() => {
    console.log('Additional comprehensive real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding additional questions:', error);
    process.exit(1);
  });