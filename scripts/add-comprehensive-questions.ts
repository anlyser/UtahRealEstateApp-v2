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

async function addComprehensiveQuestions() {
  console.log('Starting to add comprehensive real estate exam questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define the comprehensive questions across all key topic areas
  const questions: Question[] = [
    // Property Ownership & Land Use
    {
      text: "What is the term for the right to use another's land for a specific purpose?",
      answer: "Easement",
      explanation: "An easement is a non-possessory right to use or enter onto another person's property without possessing it. Common examples include utility easements, right-of-way easements, and solar easements.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Easement" },
        { letter: "B", text: "License" },
        { letter: "C", text: "Covenant" },
        { letter: "D", text: "Restriction" }
      ]
    },
    {
      text: "When a property owner dies without a will, the property is distributed according to:",
      answer: "Laws of intestate succession",
      explanation: "Intestate succession laws determine how property is distributed when someone dies without a will. These laws vary by state but typically distribute property to the closest living relatives in a predetermined order.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Probate court discretion" },
        { letter: "B", text: "Laws of intestate succession" },
        { letter: "C", text: "The executor's decision" },
        { letter: "D", text: "Federal inheritance guidelines" }
      ]
    },
    {
      text: "Which ownership form allows property to pass to the surviving owner without going through probate?",
      answer: "Joint tenancy with right of survivorship",
      explanation: "Joint tenancy with right of survivorship means that when one owner dies, their interest automatically transfers to the surviving owner(s), bypassing probate. This provides a simple, automatic transfer of ownership upon death.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Tenancy in common" },
        { letter: "B", text: "Joint tenancy with right of survivorship" },
        { letter: "C", text: "Severalty" },
        { letter: "D", text: "Tenancy at will" }
      ]
    },
    {
      text: "What is the full bundle of rights associated with property ownership?",
      answer: "Possession, control, enjoyment, exclusion, and disposition",
      explanation: "The complete bundle of rights in real property ownership includes: possession (the right to occupy), control (the right to manage), enjoyment (the right to use), exclusion (the right to prevent others from entering), and disposition (the right to sell or transfer).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Possession, control, enjoyment, exclusion, and disposition" },
        { letter: "B", text: "Ownership, usage, sale, rent, and transfer" },
        { letter: "C", text: "Acquisition, improvement, mortgage, lease, and sale" },
        { letter: "D", text: "Title, deed, mortgage, lien, and easement" }
      ]
    },
    {
      text: "What type of property ownership is created when title is held by one person?",
      answer: "Severalty",
      explanation: "Severalty (or ownership in severalty) means the property is owned by one person or entity alone. The term comes from 'sever' or 'separate,' indicating the ownership is separate from others.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Joint tenancy" },
        { letter: "B", text: "Tenancy in common" },
        { letter: "C", text: "Severalty" },
        { letter: "D", text: "Tenancy by the entirety" }
      ]
    },
    
    // Laws of Agency
    {
      text: "In which type of agency relationship does an agent represent both the buyer and seller in the same transaction?",
      answer: "Dual agency",
      explanation: "Dual agency occurs when one agent represents both the buyer and seller in the same transaction. This creates potential conflicts of interest and requires full disclosure and informed consent from both parties. Some states prohibit dual agency.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Single agency" },
        { letter: "B", text: "Designated agency" },
        { letter: "C", text: "Dual agency" },
        { letter: "D", text: "Transaction brokerage" }
      ]
    },
    {
      text: "Which of the following is NOT a fiduciary duty of a real estate agent to their client?",
      answer: "Disclosure of client's confidential information to other parties",
      explanation: "A fiduciary duty requires agents to act in their client's best interest. Disclosing a client's confidential information to other parties would violate the fiduciary duties of confidentiality and loyalty. Proper fiduciary duties include care, loyalty, obedience, disclosure, accounting, and confidentiality.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Loyalty to the client" },
        { letter: "B", text: "Obedience to the client's lawful instructions" },
        { letter: "C", text: "Disclosure of client's confidential information to other parties" },
        { letter: "D", text: "Accounting for all money received" }
      ]
    },
    {
      text: "At what point is an agency relationship typically created?",
      answer: "When an agency agreement is signed",
      explanation: "An agency relationship is formally established when both parties sign an agency agreement. This creates a fiduciary relationship between the agent and principal, with specific legal duties and responsibilities.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "When an agent first shows a property" },
        { letter: "B", text: "When a buyer makes an offer" },
        { letter: "C", text: "When an agency agreement is signed" },
        { letter: "D", text: "When the agent receives compensation" }
      ]
    },
    {
      text: "What type of agent owes fiduciary duties primarily to the seller?",
      answer: "Listing agent",
      explanation: "A listing agent (or seller's agent) works for and represents the seller's interests in a real estate transaction. They owe fiduciary duties to the seller and must work to get the best price and terms for their client.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Buyer's agent" },
        { letter: "B", text: "Transaction broker" },
        { letter: "C", text: "Listing agent" },
        { letter: "D", text: "Dual agent" }
      ]
    },
    {
      text: "What does the term 'vicarious liability' refer to in real estate?",
      answer: "A broker's responsibility for the actions of their agents",
      explanation: "Vicarious liability refers to a broker's legal responsibility for the professional actions of the sales agents working under their supervision. This is why brokers must properly train and supervise their agents to minimize potential liability.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An agent's liability for their client's actions" },
        { letter: "B", text: "A broker's responsibility for the actions of their agents" },
        { letter: "C", text: "A seller's liability for property defects" },
        { letter: "D", text: "A buyer's responsibility for their agent's commission" }
      ]
    },
    
    // Contracts and Relationships
    {
      text: "What makes a contract legally enforceable?",
      answer: "Offer, acceptance, consideration, legal purpose, competent parties",
      explanation: "For a contract to be legally enforceable, it must have five essential elements: a valid offer, acceptance of that offer, consideration (something of value exchanged), a legal purpose, and competent parties (legal age and sound mind).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only a written document" },
        { letter: "B", text: "Only the signatures of both parties" },
        { letter: "C", text: "Offer, acceptance, consideration, legal purpose, competent parties" },
        { letter: "D", text: "Only a verbal agreement between parties" }
      ]
    },
    {
      text: "Which of the following would make a contract void?",
      answer: "Illegal purpose",
      explanation: "A contract with an illegal purpose is automatically void and unenforceable. For example, a contract to sell a property for illegal activities would be void from the beginning, as if it never existed.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Mutual mistake" },
        { letter: "B", text: "Minor's signature" },
        { letter: "C", text: "Illegal purpose" },
        { letter: "D", text: "Failure to meet a contingency" }
      ]
    },
    {
      text: "What is liquidated damages in a real estate contract?",
      answer: "A predetermined amount that a buyer forfeits if they breach the contract",
      explanation: "Liquidated damages is a specific amount agreed upon in advance that the buyer will forfeit to the seller if the buyer fails to complete the purchase. It saves both parties from having to calculate actual damages and provides certainty about the consequences of a breach.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A predetermined amount that a buyer forfeits if they breach the contract" },
        { letter: "B", text: "The total damages determined by a court" },
        { letter: "C", text: "The amount a seller must pay if they breach" },
        { letter: "D", text: "The cost to repair property defects" }
      ]
    },
    {
      text: "What is an option contract in real estate?",
      answer: "An agreement giving a potential buyer the right, but not the obligation, to purchase property within a specified time period",
      explanation: "An option contract gives a potential buyer the exclusive right to purchase a property within a specific time frame for a predetermined price. The buyer pays for this option but isn't obligated to complete the purchase.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that automatically renews each year" },
        { letter: "B", text: "An agreement giving a potential buyer the right, but not the obligation, to purchase property within a specified time period" },
        { letter: "C", text: "A lease agreement with an option to extend" },
        { letter: "D", text: "A contract that can be assigned to another buyer" }
      ]
    },
    {
      text: "What happens if a real estate contract doesn't specify a closing date?",
      answer: "Courts will impose a reasonable time for performance",
      explanation: "If a real estate contract doesn't specify a closing date, courts will generally impose a 'reasonable time' for performance based on the circumstances. What constitutes a reasonable time depends on the nature of the transaction and local practices.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The contract is automatically void" },
        { letter: "B", text: "Closing must occur within 30 days" },
        { letter: "C", text: "Courts will impose a reasonable time for performance" },
        { letter: "D", text: "The buyer can choose any date" }
      ]
    },
    
    // Real Estate Finance
    {
      text: "Which type of loan features payments that remain the same throughout the life of the loan?",
      answer: "Fixed-rate mortgage",
      explanation: "A fixed-rate mortgage maintains the same interest rate throughout the entire term of the loan, resulting in consistent payment amounts. This provides stability and predictability for the borrower's budget planning.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Adjustable-rate mortgage" },
        { letter: "B", text: "Balloon mortgage" },
        { letter: "C", text: "Fixed-rate mortgage" },
        { letter: "D", text: "Interest-only mortgage" }
      ]
    },
    {
      text: "What is the name of the entity that purchases conforming loans from mortgage lenders?",
      answer: "Fannie Mae or Freddie Mac",
      explanation: "Fannie Mae (Federal National Mortgage Association) and Freddie Mac (Federal Home Loan Mortgage Corporation) are government-sponsored enterprises that purchase conforming loans from mortgage lenders, providing liquidity to the mortgage market.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Federal Housing Administration (FHA)" },
        { letter: "B", text: "Veterans Administration (VA)" },
        { letter: "C", text: "Fannie Mae or Freddie Mac" },
        { letter: "D", text: "Department of Housing and Urban Development (HUD)" }
      ]
    },
    {
      text: "What is the purpose of mortgage insurance?",
      answer: "To protect the lender against default",
      explanation: "Mortgage insurance protects the lender—not the borrower—in case the borrower defaults on the loan. It's typically required for loans with a down payment less than 20% and allows lenders to offer loans with lower down payments while managing their risk.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To protect the lender against default" },
        { letter: "B", text: "To pay off the mortgage if the borrower dies" },
        { letter: "C", text: "To protect the buyer against property defects" },
        { letter: "D", text: "To insure the property against damage" }
      ]
    },
    {
      text: "Which of these loan types typically has the lowest down payment requirement?",
      answer: "FHA loan",
      explanation: "FHA loans, backed by the Federal Housing Administration, typically require down payments as low as 3.5% of the purchase price, making them popular for first-time homebuyers with limited savings. FHA loans also have more flexible credit requirements than conventional loans.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Conventional loan" },
        { letter: "B", text: "FHA loan" },
        { letter: "C", text: "Jumbo loan" },
        { letter: "D", text: "Portfolio loan" }
      ]
    },
    {
      text: "What is 'equity' in real estate finance?",
      answer: "The difference between a property's market value and the amount owed on the mortgage",
      explanation: "Equity is the homeowner's financial interest in the property, calculated as the difference between the property's current market value and the outstanding mortgage balance. Equity increases as the mortgage is paid down and/or the property value increases.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The amount of the down payment" },
        { letter: "B", text: "The difference between a property's market value and the amount owed on the mortgage" },
        { letter: "C", text: "The total amount of interest paid over the life of the loan" },
        { letter: "D", text: "The monthly mortgage payment" }
      ]
    },
    
    // Settlement and Closing
    {
      text: "What document provides a detailed accounting of all fees and costs in a real estate transaction?",
      answer: "Closing Disclosure",
      explanation: "The Closing Disclosure is a five-page form that provides final details about the mortgage loan, including loan terms, projected monthly payments, and closing costs. It replaced the HUD-1 Settlement Statement for most residential transactions in 2015.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Loan Estimate" },
        { letter: "B", text: "Closing Disclosure" },
        { letter: "C", text: "Title Insurance Policy" },
        { letter: "D", text: "Deed of Trust" }
      ]
    },
    {
      text: "Who typically conducts real estate closings in Utah?",
      answer: "Title companies",
      explanation: "In Utah, real estate closings are typically conducted by title companies, which handle the escrow process, prepare documents, conduct title searches, and facilitate the closing. This differs from some states where attorneys are required to conduct closings.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Real estate agents" },
        { letter: "B", text: "Attorneys" },
        { letter: "C", text: "Title companies" },
        { letter: "D", text: "Loan officers" }
      ]
    },
    {
      text: "What is a 'dry closing' in real estate?",
      answer: "A closing where documents are signed but funds aren't disbursed until later",
      explanation: "A dry closing occurs when documents are signed but funds aren't disbursed immediately. This might happen when there are conditions that need to be met after signing but before money changes hands, like waiting for loan funding.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A closing that doesn't require witnesses" },
        { letter: "B", text: "A closing where documents are signed but funds aren't disbursed until later" },
        { letter: "C", text: "A closing without a mortgage" },
        { letter: "D", text: "A closing where all parties aren't physically present" }
      ]
    },
    {
      text: "What is 'proration' in the context of a real estate closing?",
      answer: "The division of expenses between buyer and seller based on date of ownership",
      explanation: "Proration is the process of dividing ongoing expenses (like property taxes, HOA fees, or rent) between the buyer and seller based on their periods of ownership. The seller typically pays for expenses up to the closing date, and the buyer pays thereafter.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The division of expenses between buyer and seller based on date of ownership" },
        { letter: "B", text: "The allocation of commission between agents" },
        { letter: "C", text: "The adjustment of interest rates by the lender" },
        { letter: "D", text: "The reduction of closing costs for first-time buyers" }
      ]
    },
    {
      text: "What is the purpose of a title search before closing?",
      answer: "To discover any liens, encumbrances, or defects in the title",
      explanation: "A title search examines public records to confirm the seller's legal right to sell the property and to identify any liens, encumbrances, or defects that could affect the new owner's rights. This helps protect the buyer from future legal issues.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To determine the property's market value" },
        { letter: "B", text: "To discover any liens, encumbrances, or defects in the title" },
        { letter: "C", text: "To verify the buyer's credit history" },
        { letter: "D", text: "To calculate property taxes" }
      ]
    },
    
    // Valuation and Appraisal
    {
      text: "Which appraisal approach analyzes what it would cost to replace a property?",
      answer: "Cost approach",
      explanation: "The cost approach estimates property value by calculating what it would cost to rebuild the structure from scratch, plus the value of the land, minus depreciation. It's particularly useful for new or unique properties with few comparables.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Sales comparison approach" },
        { letter: "B", text: "Income approach" },
        { letter: "C", text: "Cost approach" },
        { letter: "D", text: "GRM approach" }
      ]
    },
    {
      text: "What is the definition of 'market value' in real estate appraisal?",
      answer: "The most probable price a property would bring in an open market",
      explanation: "Market value is the most probable price a property would bring in an open, competitive market, assuming both buyer and seller are acting knowledgeably and prudently, with neither under undue duress, and allowing a reasonable time for exposure in the market.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The price set by the seller" },
        { letter: "B", text: "The most probable price a property would bring in an open market" },
        { letter: "C", text: "The cost to rebuild the property" },
        { letter: "D", text: "The assessed value for tax purposes" }
      ]
    },
    {
      text: "What is the principle of substitution in real estate appraisal?",
      answer: "A buyer will pay no more for a property than the cost of an equally desirable substitute",
      explanation: "The principle of substitution states that a rational buyer will pay no more for a property than the cost of acquiring an equally desirable substitute. This principle underlies the sales comparison approach to appraisal.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A buyer will pay no more for a property than the cost of an equally desirable substitute" },
        { letter: "B", text: "Properties decline in value over time due to wear and tear" },
        { letter: "C", text: "The value of a property is affected by surrounding properties" },
        { letter: "D", text: "The highest return comes from the best use of a property" }
      ]
    },
    {
      text: "Which valuation approach would be most appropriate for an apartment building?",
      answer: "Income approach",
      explanation: "The income approach is most appropriate for income-producing properties like apartment buildings. It values a property based on its potential to generate income, typically by capitalizing the net operating income or discounting future cash flows.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Sales comparison approach" },
        { letter: "B", text: "Cost approach" },
        { letter: "C", text: "Income approach" },
        { letter: "D", text: "Gross rent multiplier approach" }
      ]
    },
    {
      text: "What is the principle of progression in real estate appraisal?",
      answer: "A lower-value property is positively affected by higher-value properties nearby",
      explanation: "The principle of progression states that the value of a lower-value property is positively affected by the presence of higher-value properties in the same area. This is why a modest home in an upscale neighborhood may be worth more than an identical home in a less desirable area.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A lower-value property is positively affected by higher-value properties nearby" },
        { letter: "B", text: "Property values increase over time due to inflation" },
        { letter: "C", text: "Improvements add value equal to their cost" },
        { letter: "D", text: "The value of land and buildings increases at the same rate" }
      ]
    },
    
    // Fair Housing Laws
    {
      text: "Which federal law prohibits discrimination in housing based on race, color, religion, sex, familial status, national origin, and disability?",
      answer: "Fair Housing Act",
      explanation: "The Fair Housing Act, passed in 1968 and amended several times since, prohibits discrimination in the sale, rental, or financing of housing based on race, color, religion, sex, disability, familial status, or national origin.",
      categoryName: "Federal Regulations",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Americans with Disabilities Act" },
        { letter: "B", text: "Equal Credit Opportunity Act" },
        { letter: "C", text: "Fair Housing Act" },
        { letter: "D", text: "Civil Rights Act" }
      ]
    },
    {
      text: "What is 'steering' in real estate?",
      answer: "Directing clients toward or away from certain neighborhoods based on protected characteristics",
      explanation: "Steering is the illegal practice of directing clients toward or away from certain neighborhoods based on their race, religion, or other protected characteristics. It's a violation of the Fair Housing Act even if done with good intentions.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Directing clients toward or away from certain neighborhoods based on protected characteristics" },
        { letter: "B", text: "Showing a buyer only properties they can afford" },
        { letter: "C", text: "Helping buyers find properties in their preferred school districts" },
        { letter: "D", text: "Advising clients on the best direction for their investment" }
      ]
    },
    {
      text: "What must a landlord allow for a tenant with a disability?",
      answer: "Reasonable accommodations and modifications",
      explanation: "Landlords must allow tenants with disabilities to make reasonable modifications to their living space (at the tenant's expense) and must make reasonable accommodations in rules, policies, or services when necessary for the disabled person to use the housing on an equal basis.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only service animals, not emotional support animals" },
        { letter: "B", text: "Any modification regardless of cost" },
        { letter: "C", text: "Reasonable accommodations and modifications" },
        { letter: "D", text: "Reduced rent" }
      ]
    },
    {
      text: "Which of the following is NOT a protected class under the federal Fair Housing Act?",
      answer: "Age",
      explanation: "Age is not a protected class under the federal Fair Housing Act. The protected classes are race, color, religion, national origin, sex, disability, and familial status. However, the Housing for Older Persons Act creates exemptions for certain age-restricted communities.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Religion" },
        { letter: "B", text: "Familial status" },
        { letter: "C", text: "Age" },
        { letter: "D", text: "National origin" }
      ]
    },
    {
      text: "What is 'blockbusting' in real estate?",
      answer: "Inducing owners to sell by suggesting that people of a particular race are moving into the neighborhood",
      explanation: "Blockbusting is the illegal practice of persuading homeowners to sell their properties at low prices by suggesting that people of a different race, religion, or ethnic background are moving into the neighborhood, potentially causing property values to decline.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Inducing owners to sell by suggesting that people of a particular race are moving into the neighborhood" },
        { letter: "B", text: "Refusing to show properties in certain neighborhoods" },
        { letter: "C", text: "Charging higher rents to families with children" },
        { letter: "D", text: "Denying housing based on criminal history" }
      ]
    },
    
    // Utah-Specific Laws
    {
      text: "In Utah, how often must real estate licensees renew their licenses?",
      answer: "Every 2 years",
      explanation: "In Utah, real estate licenses must be renewed every 2 years. Licensees must complete 18 hours of continuing education during each renewal period, including 9 core hours and 9 elective hours.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Every year" },
        { letter: "B", text: "Every 2 years" },
        { letter: "C", text: "Every 3 years" },
        { letter: "D", text: "Every 4 years" }
      ]
    },
    {
      text: "What disclosure form is required for most residential real estate sales in Utah?",
      answer: "Seller's Property Condition Disclosure Form",
      explanation: "In Utah, sellers are required to complete a Seller's Property Condition Disclosure Form (SPCD) for most residential property sales. This form discloses known material defects in the property to potential buyers.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Lead-Based Paint Disclosure" },
        { letter: "B", text: "Agency Disclosure Form" },
        { letter: "C", text: "Seller's Property Condition Disclosure Form" },
        { letter: "D", text: "Buyer Due Diligence Checklist" }
      ]
    },
    {
      text: "In Utah, what water right principle is followed?",
      answer: "Prior appropriation (first in time, first in right)",
      explanation: "Utah follows the prior appropriation doctrine for water rights, which is often summarized as 'first in time, first in right.' This means earlier water claims have priority over later ones, regardless of proximity to the water source.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Riparian rights" },
        { letter: "B", text: "Prior appropriation (first in time, first in right)" },
        { letter: "C", text: "Equal sharing" },
        { letter: "D", text: "Correlative rights" }
      ]
    },
    {
      text: "What is the required number of pre-licensing education hours for a real estate sales agent in Utah?",
      answer: "120 hours",
      explanation: "In Utah, prospective real estate sales agents must complete 120 hours of approved pre-licensing education before they can take the state licensing exam. This education covers principles, practices, and legal aspects of real estate.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "60 hours" },
        { letter: "B", text: "90 hours" },
        { letter: "C", text: "120 hours" },
        { letter: "D", text: "150 hours" }
      ]
    },
    {
      text: "According to Utah law, how long does a buyer have to conduct inspections under a standard REPC (Real Estate Purchase Contract)?",
      answer: "Buyer Due Diligence Deadline as specified in the contract",
      explanation: "In Utah's standard REPC, the buyer has until the Buyer Due Diligence Deadline (as specified in the contract) to complete all inspections and reviews. This deadline is negotiable and agreed upon by both parties when the contract is created.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "10 days from acceptance" },
        { letter: "B", text: "14 days from acceptance" },
        { letter: "C", text: "Buyer Due Diligence Deadline as specified in the contract" },
        { letter: "D", text: "30 days from acceptance" }
      ]
    },
    
    // Real Estate Math
    {
      text: "A property listed for $250,000 sells for $235,000. What is the sales price as a percentage of list price?",
      answer: "94%",
      explanation: "To calculate this, divide the sales price by the list price: $235,000 ÷ $250,000 = 0.94 or 94%. This percentage shows how close the final sales price was to the original asking price.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "90%" },
        { letter: "B", text: "92%" },
        { letter: "C", text: "94%" },
        { letter: "D", text: "96%" }
      ]
    },
    {
      text: "If a property's annual rental income is $24,000 and expenses are $9,000, what is the net operating income (NOI)?",
      answer: "$15,000",
      explanation: "Net Operating Income (NOI) is calculated by subtracting operating expenses from rental income: $24,000 - $9,000 = $15,000. NOI represents the property's income after operating expenses but before mortgage payments and income taxes.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "$9,000" },
        { letter: "B", text: "$15,000" },
        { letter: "C", text: "$24,000" },
        { letter: "D", text: "$33,000" }
      ]
    },
    {
      text: "A commission of $10,500 was paid on a sale of $350,000. What was the commission rate?",
      answer: "3%",
      explanation: "To calculate the commission rate, divide the commission amount by the sales price: $10,500 ÷ $350,000 = 0.03 or 3%. This represents the percentage of the sales price that was paid as commission.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "2.5%" },
        { letter: "B", text: "3%" },
        { letter: "C", text: "3.5%" },
        { letter: "D", text: "4%" }
      ]
    },
    {
      text: "A property sells for $425,000 with a 6% commission split equally between the listing and buyer's agents. How much does each agent's broker receive?",
      answer: "$12,750",
      explanation: "First calculate the total commission: $425,000 × 6% = $25,500. When split equally, each side receives $25,500 ÷ 2 = $12,750. This amount goes to each broker, who then splits it with their agent according to their agreement.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "$12,750" },
        { letter: "B", text: "$15,300" },
        { letter: "C", text: "$25,500" },
        { letter: "D", text: "$6,375" }
      ]
    },
    {
      text: "What is the loan-to-value ratio on a $300,000 property with a $240,000 mortgage?",
      answer: "80%",
      explanation: "The loan-to-value (LTV) ratio is calculated by dividing the loan amount by the property value: $240,000 ÷ $300,000 = 0.80 or 80%. This ratio is used by lenders to assess lending risk and determine if mortgage insurance is required.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "75%" },
        { letter: "B", text: "80%" },
        { letter: "C", text: "85%" },
        { letter: "D", text: "90%" }
      ]
    },
    
    // Property Management
    {
      text: "What is the primary purpose of a security deposit in a rental agreement?",
      answer: "To protect the landlord against damage or unpaid rent",
      explanation: "A security deposit is primarily collected to protect the landlord against property damage beyond normal wear and tear, unpaid rent, or other breaches of the lease agreement. It provides financial security without requiring landlords to pursue legal action for minor damages.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To protect the landlord against damage or unpaid rent" },
        { letter: "B", text: "To pay for routine maintenance" },
        { letter: "C", text: "To cover utility costs" },
        { letter: "D", text: "To serve as the last month's rent" }
      ]
    },
    {
      text: "In property management, what is the formula for calculating the occupancy rate?",
      answer: "(Number of rented units ÷ Total number of units) × 100",
      explanation: "The occupancy rate is calculated by dividing the number of rented units by the total number of available units, then multiplying by 100 to get a percentage. This metric helps property managers evaluate the performance of a rental property.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "(Number of rented units ÷ Total number of units) × 100" },
        { letter: "B", text: "(Number of vacant units ÷ Total number of units) × 100" },
        { letter: "C", text: "(Rental income ÷ Potential rental income) × 100" },
        { letter: "D", text: "(Number of tenants ÷ Building capacity) × 100" }
      ]
    },
    {
      text: "According to Utah law, how much notice must a landlord provide before entering a tenant's rental unit for non-emergency maintenance?",
      answer: "24 hours",
      explanation: "In Utah, landlords must provide at least 24 hours' notice before entering a tenant's rental unit for non-emergency maintenance, inspections, or showing the property to prospective tenants or buyers. This respects the tenant's right to quiet enjoyment of the property.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "No notice required" },
        { letter: "B", text: "12 hours" },
        { letter: "C", text: "24 hours" },
        { letter: "D", text: "48 hours" }
      ]
    },
    
    // Environmental Issues
    {
      text: "Which federal law requires disclosure of known lead-based paint hazards when selling a home built before 1978?",
      answer: "Residential Lead-Based Paint Hazard Reduction Act",
      explanation: "The Residential Lead-Based Paint Hazard Reduction Act (also known as Title X) requires sellers, landlords, and agents to disclose known lead-based paint hazards in housing built before 1978, provide educational materials to buyers and renters, and allow a 10-day period for lead inspections.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Clean Air Act" },
        { letter: "B", text: "Safe Drinking Water Act" },
        { letter: "C", text: "Residential Lead-Based Paint Hazard Reduction Act" },
        { letter: "D", text: "Resource Conservation and Recovery Act" }
      ]
    },
    {
      text: "Which environmental issue refers to water collecting in a depression and flowing across a property?",
      answer: "Surface water runoff",
      explanation: "Surface water runoff occurs when water from rain or melting snow flows over the ground instead of being absorbed. This can cause drainage problems, erosion, flooding, and property damage, particularly when altered by development or construction.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Water table rise" },
        { letter: "B", text: "Groundwater contamination" },
        { letter: "C", text: "Surface water runoff" },
        { letter: "D", text: "Wetland encroachment" }
      ]
    },
    {
      text: "What is a Phase I Environmental Site Assessment used for in real estate?",
      answer: "To identify potential or existing environmental contamination liabilities",
      explanation: "A Phase I Environmental Site Assessment investigates a property's current and historical uses to identify potential environmental contamination. It typically includes records review, site visits, and interviews, but not actual testing of soil, water, or materials.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To identify potential or existing environmental contamination liabilities" },
        { letter: "B", text: "To test for radon gas in residential properties" },
        { letter: "C", text: "To evaluate energy efficiency" },
        { letter: "D", text: "To assess flood risk" }
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
  
  console.log('\n=========== COMPREHENSIVE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addComprehensiveQuestions()
  .then(() => {
    console.log('Comprehensive real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding comprehensive questions:', error);
    process.exit(1);
  });