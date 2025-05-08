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

async function addMorePracticeQuestions() {
  console.log('Starting to add more real estate practice questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more practice questions
  const questions: Question[] = [
    {
      text: "What is a 'kick-out clause' in a real estate contract?",
      answer: "A clause allowing sellers to continue marketing the property while accepting an offer contingent on the sale of the buyer's home",
      explanation: "A kick-out clause (also called a 'right of first refusal' or '72-hour clause') allows sellers to continue marketing their property while under contract with a buyer whose offer is contingent on selling their existing home. If the seller receives another acceptable offer, they can give the first buyer a specified time period (often 72 hours) to either remove their home sale contingency or be 'kicked out' of the contract.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A clause allowing sellers to continue marketing the property while accepting an offer contingent on the sale of the buyer's home" },
        { letter: "B", text: "A clause giving tenants the right to terminate a lease early" },
        { letter: "C", text: "A provision removing a buyer from consideration if they miss a deadline" },
        { letter: "D", text: "A commission that 'kicks' additional money to the broker" }
      ]
    },
    {
      text: "What is a 'bill of sale' in a real estate transaction?",
      answer: "A document transferring ownership of personal property included with the real estate",
      explanation: "A bill of sale is a document that transfers ownership of personal property (chattel) from the seller to the buyer. In real estate transactions, it's used to convey items that aren't permanently attached to the property and therefore aren't automatically included in the deed, such as appliances, furniture, or equipment. A clear bill of sale helps prevent disputes about what personal property was intended to be included in the sale.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The final statement showing all closing costs" },
        { letter: "B", text: "A document transferring ownership of personal property included with the real estate" },
        { letter: "C", text: "A detailed list of all repairs needed on the property" },
        { letter: "D", text: "The document showing the property tax bill" }
      ]
    },
    {
      text: "What does 'FIRPTA' refer to in real estate transactions?",
      answer: "Foreign Investment in Real Property Tax Act, requiring withholding of taxes when foreign persons sell U.S. real estate",
      explanation: "FIRPTA (Foreign Investment in Real Property Tax Act) requires buyers to withhold a portion of the purchase price (typically 15%) when purchasing U.S. real estate from foreign sellers. This withheld amount is sent to the IRS as an advance payment toward any taxes the foreign seller might owe on the sale. The withholding requirement ensures that foreign sellers can't avoid U.S. tax liability on their real estate profits by leaving the country.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "First-time Investment Real Property Tax Assessment" },
        { letter: "B", text: "Foreign Investment in Real Property Tax Act, requiring withholding of taxes when foreign persons sell U.S. real estate" },
        { letter: "C", text: "Federal Insurance Requirements for Property Transaction Agents" },
        { letter: "D", text: "Foreclosure Intervention and Residential Property Tax Assistance" }
      ]
    },
    {
      text: "What is a 'certificate of occupancy' (CO)?",
      answer: "A document issued by a local government verifying a building is safe for occupancy",
      explanation: "A certificate of occupancy (CO) is an official document issued by a local government agency (typically the building department) verifying that a building complies with applicable building codes and laws, and is safe for occupancy. COs are required for new construction and often for properties undergoing substantial renovation or change of use. In many jurisdictions, it's illegal to occupy a building without a valid CO.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A document issued by a local government verifying a building is safe for occupancy" },
        { letter: "B", text: "A document certifying how many people can legally occupy a property" },
        { letter: "C", text: "A certificate showing the occupancy rate of rental properties in an area" },
        { letter: "D", text: "A verification that a property has been continuously occupied" }
      ]
    },
    {
      text: "What is a 'lis pendens' in real estate?",
      answer: "A recorded notice of pending litigation affecting title to real property",
      explanation: "Lis pendens (Latin for 'suit pending') is a recorded notice in the public records informing potential buyers that there is pending litigation affecting title to the property. It serves as a warning that anyone acquiring an interest in the property takes it subject to the outcome of the lawsuit. Lis pendens are commonly filed in foreclosure actions, divorce proceedings involving property division, and specific performance lawsuits.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A lien for unpaid property taxes" },
        { letter: "B", text: "A recorded notice of pending litigation affecting title to real property" },
        { letter: "C", text: "A list of pending offers on a property" },
        { letter: "D", text: "A pending security interest on a property" }
      ]
    },
    {
      text: "What is 'reconciliation' in the appraisal process?",
      answer: "The process of analyzing and weighing the results from different valuation approaches to arrive at a final value opinion",
      explanation: "Reconciliation is the final step in the appraisal process where the appraiser analyzes and weighs the results from different valuation approaches (sales comparison, cost, and income approaches) to arrive at a final value opinion. During reconciliation, the appraiser considers the reliability, applicability, and quality of data used in each approach, giving more weight to the approach most appropriate for the subject property and market conditions.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of analyzing and weighing the results from different valuation approaches to arrive at a final value opinion" },
        { letter: "B", text: "Balancing the buyer's and seller's interests in a transaction" },
        { letter: "C", text: "The process of matching bank statements with transaction records" },
        { letter: "D", text: "Resolving discrepancies in property measurements" }
      ]
    },
    {
      text: "What is a 'referral fee' in real estate?",
      answer: "Compensation paid to a licensed real estate professional for referring a client to another licensee",
      explanation: "A referral fee is compensation paid to a licensed real estate professional for referring a client to another licensee. These fees are common when agents refer clients to licensees in other geographic areas or with specialized expertise. Important legal requirements for referral fees include: 1) Both parties must be licensed real estate professionals, 2) There must be an agreement between the licensees, 3) The fee must be disclosed to all parties, and 4) The referring agent cannot engage in any activities requiring a license.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A fee paid by a buyer to view property listings" },
        { letter: "B", text: "Compensation paid to a licensed real estate professional for referring a client to another licensee" },
        { letter: "C", text: "A fee charged to reference property records" },
        { letter: "D", text: "Money paid to a homeowner for referring neighbors to the same agent" }
      ]
    },
    {
      text: "What is 'blockbusting' in real estate?",
      answer: "The illegal practice of inducing owners to sell by suggesting that people of a particular race, religion, or national origin are moving into the neighborhood",
      explanation: "Blockbusting is the illegal practice of inducing panic selling by suggesting to homeowners that people of a particular race, religion, or national origin are moving into the neighborhood and property values will decline as a result. This discriminatory tactic, prohibited by the Fair Housing Act, was historically used by unscrupulous real estate agents to generate commissions from rapid turnover of properties and often led to rapid neighborhood demographic changes and declining property values.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of developing an entire city block at once" },
        { letter: "B", text: "The illegal practice of inducing owners to sell by suggesting that people of a particular race, religion, or national origin are moving into the neighborhood" },
        { letter: "C", text: "A marketing strategy targeting an entire neighborhood with the same sales pitch" },
        { letter: "D", text: "The practice of building similar houses in a subdivision" }
      ]
    },
    {
      text: "What is 'steering' in real estate?",
      answer: "The illegal practice of directing prospective homebuyers to or away from neighborhoods based on their protected characteristics",
      explanation: "Steering is the illegal discriminatory practice of directing prospective homebuyers toward or away from specific neighborhoods based on their race, color, religion, national origin, sex, familial status, or disability (protected characteristics under the Fair Housing Act). Examples include showing only certain neighborhoods to minority homebuyers or making comments like 'this neighborhood would be perfect for your family' or 'you wouldn't be comfortable in that area.' Real estate professionals must show all available properties meeting clients' objective criteria.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Guiding clients to properties within their budget" },
        { letter: "B", text: "The illegal practice of directing prospective homebuyers to or away from neighborhoods based on their protected characteristics" },
        { letter: "C", text: "Physically directing traffic during an open house" },
        { letter: "D", text: "The process of navigating a complex real estate transaction" }
      ]
    },
    {
      text: "What is 'redlining' in real estate?",
      answer: "The illegal practice of denying services like mortgages to residents of certain areas based on race or ethnicity",
      explanation: "Redlining is the illegal discriminatory practice of denying or limiting financial services like mortgages to specific neighborhoods, typically because of race or ethnicity rather than legitimate financial factors. The term originated from the literal red lines banks would draw on maps around neighborhoods they refused to serve, typically minority areas. Though explicitly banned by the Fair Housing Act and Equal Credit Opportunity Act, studies show forms of redlining still persist in more subtle ways.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Marking property boundaries with red markers" },
        { letter: "B", text: "The illegal practice of denying services like mortgages to residents of certain areas based on race or ethnicity" },
        { letter: "C", text: "Identifying problems in a home inspection report with red ink" },
        { letter: "D", text: "Charging higher prices to customers based on their negotiation skills" }
      ]
    },
    {
      text: "What is a 'seller's market' in real estate?",
      answer: "A market condition with more buyers than available properties, giving sellers an advantage",
      explanation: "A seller's market is a market condition characterized by more buyers than available properties, giving sellers a competitive advantage. Typical features include multiple offers on properties, homes selling at or above asking price, quick sales with short days-on-market, low housing inventory (typically less than 6 months' supply), and less negotiating leverage for buyers. Such markets typically occur during economic growth periods, when interest rates are low, or in desirable areas with limited housing stock.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A market where only sellers can participate" },
        { letter: "B", text: "A market condition with more buyers than available properties, giving sellers an advantage" },
        { letter: "C", text: "A marketplace where sellers trade properties with each other" },
        { letter: "D", text: "A market dominated by seller financing options" }
      ]
    },
    {
      text: "What is a 'buyer's market' in real estate?",
      answer: "A market condition with more available properties than buyers, giving buyers an advantage",
      explanation: "A buyer's market is a market condition characterized by more available properties than buyers, giving buyers a competitive advantage. Typical features include properties staying on the market longer, price reductions, sellers more willing to negotiate terms, higher housing inventory (typically more than 6 months' supply), and greater concessions from sellers (like paying closing costs or making repairs). Such markets typically occur during economic downturns, periods of high interest rates, or areas experiencing population decline.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A market condition with more available properties than buyers, giving buyers an advantage" },
        { letter: "B", text: "A market where only buyers can participate" },
        { letter: "C", text: "A marketplace specifically for first-time homebuyers" },
        { letter: "D", text: "A market dominated by buyer's agents" }
      ]
    },
    {
      text: "What is 'absorption rate' in real estate?",
      answer: "The rate at which available properties are sold in a specific market during a given time period",
      explanation: "Absorption rate measures how quickly available properties are sold in a specific market during a given time period, typically expressed as the number of months it would take to sell the current inventory at the current sales pace. For example, if an area has 100 homes for sale and sells 20 homes per month, the absorption rate is 5 months (100 ÷ 20 = 5). Generally, less than 6 months of inventory indicates a seller's market, while more than 6 months suggests a buyer's market.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The rate at which available properties are sold in a specific market during a given time period" },
        { letter: "B", text: "How quickly a property absorbs water during flooding" },
        { letter: "C", text: "The percentage of a down payment that's absorbed by closing costs" },
        { letter: "D", text: "The rate at which new construction absorbs vacant land" }
      ]
    },
    {
      text: "What is a 'CMA' in real estate?",
      answer: "Comparative Market Analysis - an evaluation of similar properties to determine an appropriate listing or offer price",
      explanation: "A Comparative Market Analysis (CMA) is an evaluation of similar, recently sold properties ('comparables' or 'comps') used to determine an appropriate listing or offer price for a subject property. Unlike a formal appraisal, a CMA is typically prepared by a real estate agent and considers active listings, pending sales, sold properties, and expired listings. A thorough CMA adjusts for differences between the subject property and comparables, much like an appraiser would.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Certified Marketing Approach" },
        { letter: "B", text: "Comparative Market Analysis - an evaluation of similar properties to determine an appropriate listing or offer price" },
        { letter: "C", text: "Current Market Assessment" },
        { letter: "D", text: "Contract Management Agreement" }
      ]
    },
    {
      text: "What is 'days on market' (DOM) in real estate?",
      answer: "The number of days from when a property is listed for sale until it goes under contract",
      explanation: "Days on Market (DOM) measures the number of days from when a property is listed for sale until it goes under contract with a buyer. This metric indicates market conditions and individual property marketability. Low average DOM in an area suggests a seller's market with high demand, while high DOM indicates a buyer's market or potential issues with pricing, condition, or location of specific properties.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The number of days that open houses are held" },
        { letter: "B", text: "The number of days from when a property is listed for sale until it goes under contract" },
        { letter: "C", text: "The period a new agent must work in the market" },
        { letter: "D", text: "The number of days allowed for property inspections" }
      ]
    },
    {
      text: "What is a 'short sale' in real estate?",
      answer: "A sale where the lender agrees to accept less than the mortgage balance due",
      explanation: "A short sale occurs when a property is sold for less than the outstanding mortgage balance, with the lender agreeing to accept this reduced amount as full or partial satisfaction of the debt. Short sales typically occur when the homeowner is in financial distress and cannot afford the mortgage, but foreclosure hasn't yet happened. The process requires lender approval and can be complex and time-consuming, often taking several months as the lender evaluates whether accepting a short sale is preferable to foreclosure.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A sale that closes in less than 30 days" },
        { letter: "B", text: "A sale where the lender agrees to accept less than the mortgage balance due" },
        { letter: "C", text: "A sale of a property that was owned for less than one year" },
        { letter: "D", text: "A quick sale without contingencies" }
      ]
    },
    {
      text: "What is 'REO' in real estate?",
      answer: "Real Estate Owned - property owned by a lender after an unsuccessful foreclosure auction",
      explanation: "REO (Real Estate Owned) refers to property owned by a lender (typically a bank) after an unsuccessful foreclosure auction where no buyer bid the minimum amount to cover the outstanding loan. At this point, the lender removes the existing liens and transfers the property to their REO department to be marketed and sold, often at a discount. REO properties are attractive to some buyers because they offer clear title and the opportunity for potential value, though they're typically sold 'as-is.'",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Real Estate Options" },
        { letter: "B", text: "Real Estate Owned - property owned by a lender after an unsuccessful foreclosure auction" },
        { letter: "C", text: "Regional Estate Organization" },
        { letter: "D", text: "Real Estate Oversight - a regulatory body for real estate transactions" }
      ]
    },
    {
      text: "What is 'MLS' in real estate?",
      answer: "Multiple Listing Service - a database of properties listed for sale by member real estate brokers",
      explanation: "MLS (Multiple Listing Service) is a database and cooperative system where member real estate brokers share information about properties they've listed for sale. By listing on the MLS, a broker can expose their seller's property to all other member brokers who might have interested buyers. The MLS promotes cooperation between competing brokers by establishing frameworks for offering compensation and sharing accurate, detailed property information, ultimately serving the best interests of both buyers and sellers.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Multiple Listing Service - a database of properties listed for sale by member real estate brokers" },
        { letter: "B", text: "Multiple Loan Sources" },
        { letter: "C", text: "Market Listing Standards" },
        { letter: "D", text: "Maximum Listing Strategy" }
      ]
    },
    {
      text: "What is 'IDX' in real estate?",
      answer: "Internet Data Exchange - the technology and rules allowing MLS listings to be displayed on member brokers' websites",
      explanation: "IDX (Internet Data Exchange) refers to the technology, policies, and rules allowing MLS participants to display each other's listings on their websites. It enables brokers to show all participating MLS listings on their own sites, greatly expanding the online exposure of listed properties. IDX has become standard practice in most markets, though there are specific rules about how property information can be displayed and requirements for regular data updates to maintain accuracy.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Individual Data Extraction" },
        { letter: "B", text: "Internet Data Exchange - the technology and rules allowing MLS listings to be displayed on member brokers' websites" },
        { letter: "C", text: "Internal Document X-reference" },
        { letter: "D", text: "International Data eXamination" }
      ]
    },
    {
      text: "What is 'encroachment' in real estate?",
      answer: "When a structure or improvement from one property extends onto another property without permission",
      explanation: "Encroachment occurs when a structure or improvement from one property physically extends over or onto neighboring property without permission, such as a fence built over a property line or a roof overhang extending into adjacent airspace. Encroachments can create title issues, complicate property sales, reduce property values, and lead to legal disputes. They're typically discovered during surveys and may be resolved through boundary agreements, easements, removal of the encroachment, or occasionally through adverse possession claims.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of enclosing a porch to create more living space" },
        { letter: "B", text: "When a structure or improvement from one property extends onto another property without permission" },
        { letter: "C", text: "A restriction on how close to a property line a building can be constructed" },
        { letter: "D", text: "The gradual advance of commercial properties into residential neighborhoods" }
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
  
  console.log('\n=========== MORE PRACTICE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMorePracticeQuestions()
  .then(() => {
    console.log('More practice questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more practice questions:', error);
    process.exit(1);
  });