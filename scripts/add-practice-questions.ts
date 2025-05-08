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

async function addPracticeQuestions() {
  console.log('Starting to add real estate practice questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define practice questions
  const questions: Question[] = [
    {
      text: "What is a 'listing presentation' in real estate?",
      answer: "A presentation to potential sellers to obtain their listing",
      explanation: "A listing presentation is a formal presentation made by a real estate agent to potential sellers to obtain their listing. During this presentation, the agent showcases their marketing plan, comparative market analysis, proposed listing price, and explains their services, qualifications, and commission structure to convince the sellers to list with them.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A presentation to potential sellers to obtain their listing" },
        { letter: "B", text: "A list of properties currently for sale" },
        { letter: "C", text: "A report of recently sold properties" },
        { letter: "D", text: "An online display of property photos" }
      ]
    },
    {
      text: "What is a 'buyer's letter' (also called a 'love letter') in real estate?",
      answer: "A personal letter from buyers to sellers explaining why they want the house",
      explanation: "A buyer's letter or 'love letter' is a personal message from prospective buyers to sellers explaining why they love the home and why the sellers should choose their offer. While these were once common to help buyers stand out in competitive markets, many real estate associations and professionals now discourage them due to fair housing concerns.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A pre-approval letter from a lender" },
        { letter: "B", text: "A personal letter from buyers to sellers explaining why they want the house" },
        { letter: "C", text: "A contract offered by a buyer" },
        { letter: "D", text: "A letter confirming the buyer's agent representation" }
      ]
    },
    {
      text: "What is a 'pre-inspection' in real estate?",
      answer: "An inspection conducted by the buyer before submitting an offer",
      explanation: "A pre-inspection is a home inspection conducted by the buyer before submitting an offer, rather than after the offer is accepted. This strategy allows buyers to make non-contingent offers in competitive markets, as they already know the property's condition. However, buyers risk spending money on inspections for properties they may not successfully purchase.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An inspection conducted by the seller before listing" },
        { letter: "B", text: "An inspection conducted by the buyer before submitting an offer" },
        { letter: "C", text: "A preliminary walk-through by the real estate agent" },
        { letter: "D", text: "An inspection conducted by the city before occupancy" }
      ]
    },
    {
      text: "What is 'bidding war' in real estate?",
      answer: "Competition among multiple buyers trying to purchase the same property",
      explanation: "A bidding war occurs when multiple buyers compete to purchase the same property, often driving the price above the original asking price. In hot markets, bidding wars can result in homes selling for significantly more than list price. Sellers may deliberately price properties slightly below market value to encourage bidding wars.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Negotiations between buyer and seller" },
        { letter: "B", text: "Competition among multiple buyers trying to purchase the same property" },
        { letter: "C", text: "An auction of foreclosed properties" },
        { letter: "D", text: "Competition among real estate agents for a listing" }
      ]
    },
    {
      text: "What is a 'final walkthrough' in real estate?",
      answer: "A buyer's last inspection of the property before closing",
      explanation: "A final walkthrough is the buyer's last inspection of the property, typically done within 24 hours before closing. Its purpose is to verify that the property is in the agreed-upon condition, all negotiated repairs have been completed, all included items remain, and no damage has occurred since the initial inspection.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The final tour a listing agent gives to potential buyers" },
        { letter: "B", text: "A buyer's last inspection of the property before closing" },
        { letter: "C", text: "The agent's final inspection before listing a property" },
        { letter: "D", text: "An appraisal walkthrough" }
      ]
    },
    {
      text: "What is 'staging' in real estate?",
      answer: "Preparing a home for sale by making it look appealing to the highest number of potential buyers",
      explanation: "Staging is the process of preparing a home for sale by making it aesthetically appealing to the highest number of potential buyers. This may include decluttering, depersonalizing, rearranging or adding furniture, improving lighting, and enhancing curb appeal. Professional staging can help properties sell faster and for higher prices by helping buyers envision themselves living there.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Building a stage for an open house presentation" },
        { letter: "B", text: "Preparing a home for sale by making it look appealing to the highest number of potential buyers" },
        { letter: "C", text: "Setting up a timeline for selling a property" },
        { letter: "D", text: "Arranging properties in order of showing appointments" }
      ]
    },
    {
      text: "What is a 'for sale by owner' (FSBO) transaction?",
      answer: "A property sale conducted without a listing agent",
      explanation: "A 'for sale by owner' (FSBO) transaction is when a property owner sells their home without hiring a listing agent. The seller handles marketing, showings, negotiations, and paperwork themselves, typically to save on commission costs. FSBO sellers may still work with buyer's agents and often pay them a commission, or they may try to sell directly to an unrepresented buyer.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A property sale conducted without a listing agent" },
        { letter: "B", text: "A property only available to cash buyers" },
        { letter: "C", text: "A sale between family members" },
        { letter: "D", text: "A property that can only be purchased by the current tenant" }
      ]
    },
    {
      text: "What is the purpose of a 'broker open house'?",
      answer: "To showcase a property to other real estate agents who may have potential buyers",
      explanation: "A broker open house (or broker's preview) is an event where a listing agent invites other real estate agents to tour and evaluate a newly listed property. The purpose is to expose the property to agents who may have potential buyers, get feedback from industry professionals, and increase the property's visibility within the real estate community.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To showcase a property to other real estate agents who may have potential buyers" },
        { letter: "B", text: "To allow a broker to preview properties before their clients" },
        { letter: "C", text: "To introduce new agents to the brokerage's listings" },
        { letter: "D", text: "To allow brokers to compete for a listing" }
      ]
    },
    {
      text: "What is a 'coming soon' listing in real estate?",
      answer: "A property that is under contract with a listing agent but not yet available for showing or sale",
      explanation: "A 'coming soon' listing is a property that is under contract with a listing agent but not yet available for showing or sale. This pre-market status allows time for staging, repairs, or photography while building anticipation. MLS systems and real estate associations have specific rules about coming soon listings to ensure fair access to all potential buyers.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing that will be available next season" },
        { letter: "B", text: "A property that is under contract with a listing agent but not yet available for showing or sale" },
        { letter: "C", text: "A property that is being built and will be completed soon" },
        { letter: "D", text: "A foreclosure that will be available soon" }
      ]
    },
    {
      text: "What are 'comparables' or 'comps' in real estate?",
      answer: "Recently sold properties similar to the subject property used for pricing and valuation",
      explanation: "Comparables ('comps') are recently sold properties similar to the subject property in location, size, features, and condition. They're used to determine an appropriate listing or offer price through comparative market analysis. Good comps are recent sales (typically within 3-6 months), in the same neighborhood, with similar characteristics to the subject property.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Properties currently listed for sale in the same area" },
        { letter: "B", text: "Recently sold properties similar to the subject property used for pricing and valuation" },
        { letter: "C", text: "Comparable features between different houses" },
        { letter: "D", text: "Competition between similar properties on the market" }
      ]
    },
    {
      text: "What is a 'competitive market analysis' (CMA) in real estate?",
      answer: "An evaluation of similar, recently sold properties to determine a home's approximate value",
      explanation: "A competitive market analysis (CMA) is an evaluation of similar, recently sold properties (comparables) to help determine a home's approximate market value. Real estate agents prepare CMAs for sellers to establish listing prices and for buyers to formulate offers. Unlike formal appraisals, CMAs are informal estimates prepared by agents based on market data.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An analysis of competitor real estate agencies" },
        { letter: "B", text: "An evaluation of similar, recently sold properties to determine a home's approximate value" },
        { letter: "C", text: "A study of market competitiveness in different neighborhoods" },
        { letter: "D", text: "An analysis of how long homes stay on the market before selling" }
      ]
    },
    {
      text: "What is a 'buyer's market' in real estate?",
      answer: "A market condition that favors buyers due to high inventory and low demand",
      explanation: "A buyer's market exists when housing supply exceeds demand, giving buyers an advantage in negotiations. Characteristics include many homes for sale, longer days on market, price reductions, and sellers more willing to offer concessions. Buyers typically have more choices, less competition, and increased negotiating power regarding price and terms.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A store where buyers can purchase real estate supplies" },
        { letter: "B", text: "A market condition that favors buyers due to high inventory and low demand" },
        { letter: "C", text: "A place where buyers can meet with multiple real estate agents" },
        { letter: "D", text: "A website specifically for buyers to browse properties" }
      ]
    },
    {
      text: "What is a 'seller's market' in real estate?",
      answer: "A market condition that favors sellers due to low inventory and high demand",
      explanation: "A seller's market exists when housing demand exceeds supply, giving sellers an advantage in negotiations. Characteristics include few homes for sale, short days on market, multiple offers, homes selling at or above asking price, and limited seller concessions. Sellers typically have more negotiating power, while buyers face more competition and pressure to make strong offers quickly.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A market where only sellers can access listings" },
        { letter: "B", text: "A market condition that favors sellers due to low inventory and high demand" },
        { letter: "C", text: "An event where sellers showcase their properties" },
        { letter: "D", text: "A location where sellers meet to set prices" }
      ]
    },
    {
      text: "What is 'days on market' (DOM) in real estate?",
      answer: "The number of days a property has been actively listed for sale",
      explanation: "Days on market (DOM) measures how long a property has been actively listed for sale. It's an important market indicator that helps assess how quickly properties are selling in a particular market. A low average DOM indicates a hot seller's market, while a high average DOM suggests a slower buyer's market.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The number of days a property has been actively listed for sale" },
        { letter: "B", text: "The number of days it takes to close a transaction" },
        { letter: "C", text: "The specific days when a property is available for showing" },
        { letter: "D", text: "The days that open houses are held" }
      ]
    },
    {
      text: "What is 'absorption rate' in real estate?",
      answer: "The rate at which available homes are sold in a specific market during a given time period",
      explanation: "Absorption rate measures how quickly available homes are sold in a specific market during a given time period, typically expressed in months of inventory. It's calculated by dividing the number of available homes by the number of homes sold per month. A low absorption rate (under 3 months) indicates a seller's market, while a high rate (over 6 months) suggests a buyer's market.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "How quickly moisture absorbs into a property's foundation" },
        { letter: "B", text: "The rate at which available homes are sold in a specific market during a given time period" },
        { letter: "C", text: "How fast a property appreciates in value" },
        { letter: "D", text: "The percentage of a down payment that's applied to the principal" }
      ]
    },
    {
      text: "What is 'list-to-sale price ratio' in real estate?",
      answer: "The percentage of the list price that a property actually sells for",
      explanation: "The list-to-sale price ratio is the percentage of the list price that a property actually sells for. It's calculated by dividing the final sale price by the list price and multiplying by 100. For example, if a home listed for $400,000 sells for $380,000, the ratio is 95%. This metric helps gauge market conditions and pricing strategies.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The ratio of listings to sales in a market" },
        { letter: "B", text: "The percentage of the list price that a property actually sells for" },
        { letter: "C", text: "The ratio of a broker's listings to their sales" },
        { letter: "D", text: "The ratio between listed properties and expired listings" }
      ]
    },
    {
      text: "What is 'price per square foot' in real estate?",
      answer: "A valuation method that divides the property price by its square footage",
      explanation: "Price per square foot is a valuation method calculated by dividing a property's price by its square footage. It provides a standardized comparison between properties of different sizes. While useful as a general metric, it has limitations since it doesn't account for quality differences, lot size, views, or other value factors that aren't directly related to square footage.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A valuation method that divides the property price by its square footage" },
        { letter: "B", text: "The cost to build one square foot of a new home" },
        { letter: "C", text: "The commission earned per square foot sold" },
        { letter: "D", text: "The property tax assessment divided by square footage" }
      ]
    },
    {
      text: "What is a 'kick-out clause' in real estate?",
      answer: "A provision allowing sellers to continue marketing their property while under contract with a contingent offer",
      explanation: "A kick-out clause allows sellers to continue marketing their property while under contract with a buyer who has a home-sale contingency. If the seller receives a better offer, they can give the original buyer a specified time period (typically 48-72 hours) to either remove their contingency and proceed with the purchase or withdraw from the contract, allowing the seller to accept the new offer.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A clause that allows a buyer to back out of a contract for any reason" },
        { letter: "B", text: "A provision allowing sellers to continue marketing their property while under contract with a contingent offer" },
        { letter: "C", text: "A clause that automatically terminates a listing after a certain period" },
        { letter: "D", text: "A clause that removes a real estate agent from a transaction" }
      ]
    },
    {
      text: "What is an 'escalation clause' in a real estate offer?",
      answer: "A provision that automatically increases a buyer's offer by a specified amount over other competing offers",
      explanation: "An escalation clause is a provision in an offer that automatically increases the buyer's offer price by a specified increment above any competing offer, up to a maximum amount. For example, a buyer might offer $300,000 with an escalation clause to beat any other offer by $5,000 up to a maximum of $330,000. This strategy helps buyers remain competitive in multiple-offer situations.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A clause that increases the listing price if multiple offers are received" },
        { letter: "B", text: "A provision that automatically increases a buyer's offer by a specified amount over other competing offers" },
        { letter: "C", text: "A clause that raises the commission rate based on the final sale price" },
        { letter: "D", text: "A provision that increases property taxes gradually over time" }
      ]
    },
    {
      text: "What is a 'backup offer' in real estate?",
      answer: "A secondary offer accepted by a seller in case the primary contract falls through",
      explanation: "A backup offer is a secondary offer accepted by a seller while they already have a property under contract. This offer becomes active only if the primary contract falls through. Backup offers are formally accepted with a backup offer addendum, creating a legally binding contract that automatically moves to primary position if the first deal terminates.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An offer made by a buyer after their first offer is rejected" },
        { letter: "B", text: "A secondary offer accepted by a seller in case the primary contract falls through" },
        { letter: "C", text: "An offer on a property that serves as a backup option for buyers" },
        { letter: "D", text: "A lower offer that the seller will consider if they don't receive higher offers" }
      ]
    },
    {
      text: "What is a 'pocket listing' in real estate?",
      answer: "A property listing that is not entered into the MLS",
      explanation: "A pocket listing (or off-market listing) is a property listing that is not entered into the MLS system. The listing agent keeps it 'in their pocket,' marketing it only to select clients or within their brokerage. While pocket listings offer privacy for sellers, they limit market exposure. Many MLSs now restrict this practice through Clear Cooperation policies requiring listings to be submitted to the MLS within one business day of marketing to the public.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A property listing that is not entered into the MLS" },
        { letter: "B", text: "A small property that fits in your pocket" },
        { letter: "C", text: "A listing that is kept secret from other agents in the same brokerage" },
        { letter: "D", text: "A listing that pays the agent's commission directly from the seller's pocket" }
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
  
  console.log('\n=========== PRACTICE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addPracticeQuestions()
  .then(() => {
    console.log('Practice questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding practice questions:', error);
    process.exit(1);
  });