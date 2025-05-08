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

async function addAgencyQuestions() {
  console.log('Starting to add real estate agency questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define agency questions
  const questions: Question[] = [
    {
      text: "What does 'caveat emptor' mean in real estate?",
      answer: "Let the buyer beware",
      explanation: "Caveat emptor is a Latin phrase meaning 'let the buyer beware.' It suggests that buyers should inspect properties carefully before purchasing, as they assume responsibility for the property's condition. While disclosure laws have mitigated this principle, buyers should still thoroughly investigate properties, as sellers aren't obligated to disclose non-material facts.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Let the buyer beware" },
        { letter: "B", text: "Let the seller beware" },
        { letter: "C", text: "Buyer and seller are equal" },
        { letter: "D", text: "The contract is void" }
      ]
    },
    {
      text: "What is the difference between a client and a customer in real estate agency?",
      answer: "A client is represented by the agent with fiduciary duties; a customer is not represented but is treated honestly and fairly",
      explanation: "A client has an agency relationship with the agent, who provides fiduciary duties (loyalty, confidentiality, disclosure, obedience, reasonable care, and accounting). A customer has no agency relationship with the agent and receives no fiduciary duties, though the agent must still treat them honestly and fairly.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A client is represented by the agent with fiduciary duties; a customer is not represented but is treated honestly and fairly" },
        { letter: "B", text: "A client pays for services; a customer doesn't" },
        { letter: "C", text: "A client buys property; a customer sells property" },
        { letter: "D", text: "A client has a written contract; a customer has a verbal agreement" }
      ]
    },
    {
      text: "What is a 'latent defect' in real estate?",
      answer: "A hidden defect that cannot be discovered through reasonable inspection",
      explanation: "A latent defect is a hidden flaw in a property that is not discoverable through reasonable inspection by the buyer or their representative. Examples include foundation issues behind walls, termite damage in inaccessible areas, or underground water problems. Sellers and their agents typically must disclose known latent defects, as buyers cannot be expected to discover them.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A visible problem with the property" },
        { letter: "B", text: "A hidden defect that cannot be discovered through reasonable inspection" },
        { letter: "C", text: "A defect that develops after the sale" },
        { letter: "D", text: "A problem that appears only in certain seasons" }
      ]
    },
    {
      text: "What is a 'patent defect' in real estate?",
      answer: "An obvious defect that can be discovered through reasonable inspection",
      explanation: "A patent defect is an obvious, visible issue with a property that can be discovered through reasonable inspection. Examples include cracks in walls, broken windows, or visible water damage. Sellers generally aren't required to disclose patent defects since buyers can easily discover them through visual inspection or due diligence.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A defect caused by government regulations" },
        { letter: "B", text: "An obvious defect that can be discovered through reasonable inspection" },
        { letter: "C", text: "A defect that has been legally registered" },
        { letter: "D", text: "A defect that requires professional expertise to identify" }
      ]
    },
    {
      text: "What is a 'puffing statement' in real estate?",
      answer: "An exaggerated statement of opinion that is not a material fact",
      explanation: "Puffing statements are exaggerated opinions, sales talk, or hyperbole that don't constitute material facts. Examples include 'best neighborhood in town' or 'most beautiful view.' These statements aren't considered misrepresentation because they're subjective opinions rather than factual claims, and reasonable people don't rely on them for decision-making.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An exaggerated statement of opinion that is not a material fact" },
        { letter: "B", text: "A false statement about a property" },
        { letter: "C", text: "A statement that hides a material defect" },
        { letter: "D", text: "Information provided in a property disclosure statement" }
      ]
    },
    {
      text: "What is 'procuring cause' in real estate agency?",
      answer: "The agent whose efforts resulted in the sale",
      explanation: "Procuring cause refers to the agent whose actions were the predominant, direct, and effective reason the sale occurred. In commission disputes, procuring cause determines which agent deserves the commission. Factors considered include who first showed the property, maintained continuous involvement, overcame objections, and brought about the successful transaction.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The agent whose efforts resulted in the sale" },
        { letter: "B", text: "The agent who first introduced the buyer to the property" },
        { letter: "C", text: "The agent who writes the purchase contract" },
        { letter: "D", text: "The agent who conducts the final walkthrough" }
      ]
    },
    {
      text: "What is a 'net listing' in real estate?",
      answer: "A listing where the broker's commission is the amount above a specified net amount to the seller",
      explanation: "A net listing is an arrangement where the broker's commission is everything above a specified net amount the seller wants to receive. For example, if the seller wants $200,000 net and the property sells for $220,000, the broker receives $20,000. Net listings are prohibited or discouraged in many states due to potential conflicts of interest and ethical concerns.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing where the broker's commission is the amount above a specified net amount to the seller" },
        { letter: "B", text: "A listing contract available on the internet" },
        { letter: "C", text: "A listing where the commission is paid after deducting marketing expenses" },
        { letter: "D", text: "A listing where multiple brokers share the commission" }
      ]
    },
    {
      text: "What is an 'exclusive right to sell' listing?",
      answer: "A listing where the broker gets paid regardless of who finds the buyer, including the seller",
      explanation: "An exclusive right to sell listing guarantees the broker a commission regardless of who finds the buyer—even if the seller finds a buyer independently. This is the most common listing type, providing the strongest protection for the listing broker's commission. It incentivizes the broker to market the property extensively since their commission is secured.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing where only one broker can show the property" },
        { letter: "B", text: "A listing where the broker gets paid regardless of who finds the buyer, including the seller" },
        { letter: "C", text: "A listing where the broker can sell only to specific buyers" },
        { letter: "D", text: "A listing restricted to luxury properties" }
      ]
    },
    {
      text: "What is an 'exclusive agency' listing?",
      answer: "A listing where the broker gets paid if any broker finds a buyer, but not if the seller finds the buyer",
      explanation: "In an exclusive agency listing, the listing broker gets paid if any broker finds a buyer, but not if the seller finds a buyer independently. This differs from an exclusive right to sell listing, where the broker gets paid regardless of who finds the buyer. Exclusive agency listings are less common, as they provide less commission security for the broker.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing available only to one agency" },
        { letter: "B", text: "A listing where the broker gets paid if any broker finds a buyer, but not if the seller finds the buyer" },
        { letter: "C", text: "A listing where the broker represents only one party" },
        { letter: "D", text: "A listing that can't be shared with other brokers" }
      ]
    },
    {
      text: "What is an 'open listing' in real estate?",
      answer: "A non-exclusive listing where any broker who brings a buyer gets the commission",
      explanation: "An open listing is non-exclusive, allowing the seller to list with multiple brokers simultaneously and pay a commission only to the broker who actually sells the property. The seller also reserves the right to sell the property themselves without owing any commission. Open listings are rarely used by brokers because they provide minimal commission security.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing available to the public without a broker" },
        { letter: "B", text: "A non-exclusive listing where any broker who brings a buyer gets the commission" },
        { letter: "C", text: "A listing with an open house every weekend" },
        { letter: "D", text: "A listing with no expiration date" }
      ]
    },
    {
      text: "What is 'stigmatized property' in real estate?",
      answer: "Property psychologically impacted by events such as murder, suicide, or paranormal beliefs",
      explanation: "A stigmatized property is one that has psychological impacts not related to physical condition, such as being the site of a murder, suicide, alleged paranormal activity, or having a notorious former occupant. Disclosure requirements for stigmatized properties vary by state. Some states require disclosure of certain stigmas, while others specifically exempt them from material fact disclosure.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Property in an undesirable location" },
        { letter: "B", text: "Property with severe physical defects" },
        { letter: "C", text: "Property psychologically impacted by events such as murder, suicide, or paranormal beliefs" },
        { letter: "D", text: "Property with environmental contamination" }
      ]
    },
    {
      text: "What is 'commingling' in real estate?",
      answer: "Mixing client funds with personal or business funds",
      explanation: "Commingling is the unethical and often illegal practice of mixing client funds (like earnest money deposits) with an agent's personal or brokerage funds. Real estate professionals must maintain separate trust or escrow accounts for client funds. Commingling is a serious violation of fiduciary duty and can result in license suspension or revocation.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Mixing client funds with personal or business funds" },
        { letter: "B", text: "Combining multiple properties in one listing" },
        { letter: "C", text: "Working with multiple clients at once" },
        { letter: "D", text: "Sharing commission with unlicensed individuals" }
      ]
    },
    {
      text: "What is 'conversion' in real estate ethics?",
      answer: "The illegal use of client funds for personal purposes",
      explanation: "Conversion is the illegal and unethical misappropriation or theft of client funds for personal use. It's a step beyond commingling, where the agent actually uses the client's money. Conversion is a serious breach of fiduciary duty and typically results in license revocation, potential criminal charges, and civil liability.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The illegal use of client funds for personal purposes" },
        { letter: "B", text: "Changing a property from residential to commercial use" },
        { letter: "C", text: "Converting square feet to acres in property descriptions" },
        { letter: "D", text: "Changing from one listing type to another" }
      ]
    },
    {
      text: "What is 'antitrust' in real estate?",
      answer: "Laws that prohibit anti-competitive behavior like price fixing",
      explanation: "Antitrust laws prohibit business practices that reduce competition and harm consumers. In real estate, antitrust violations include commission price fixing (brokers agreeing on standard rates), market allocation (dividing territories), group boycotts (refusing to cooperate with certain firms), and tying arrangements (forcing purchase of one service to get another).",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Laws that require trust accounts for client funds" },
        { letter: "B", text: "Laws that prohibit anti-competitive behavior like price fixing" },
        { letter: "C", text: "Regulations against property flipping" },
        { letter: "D", text: "Rules against misusing the term 'trust' in marketing" }
      ]
    },
    {
      text: "What is 'subagency' in real estate?",
      answer: "When an agent working with a buyer is legally a subagent of the seller",
      explanation: "Subagency is an agency relationship where an agent working with a buyer is legally an agent of the seller, owing fiduciary duties to the seller, not the buyer. This creates a situation where both the listing agent and the subagent represent the seller's interests. Subagency was once common but has largely been replaced by buyer agency and transaction brokerage due to consumer confusion and liability concerns.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When an agent hires another agent to help with a transaction" },
        { letter: "B", text: "When an agent working with a buyer is legally a subagent of the seller" },
        { letter: "C", text: "When one agent works under another agent's supervision" },
        { letter: "D", text: "When an agent represents multiple parties in the same transaction" }
      ]
    },
    {
      text: "What is a 'material fact' in real estate disclosure?",
      answer: "Information that might affect a buyer's decision to purchase or the price they would pay",
      explanation: "A material fact is information that could significantly influence a buyer's decision to purchase a property or the price they would be willing to pay. Material facts include property defects, boundary disputes, zoning issues, or environmental hazards. Agents and sellers have a legal and ethical duty to disclose all known material facts, even if they negatively impact the sale.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Facts about the construction materials used in the home" },
        { letter: "B", text: "Information that might affect a buyer's decision to purchase or the price they would pay" },
        { letter: "C", text: "Data about the property's square footage" },
        { letter: "D", text: "Information included in property marketing materials" }
      ]
    },
    {
      text: "What is 'agency coupled with an interest' in real estate?",
      answer: "An agency relationship where the agent has a financial interest in the property",
      explanation: "Agency coupled with an interest occurs when an agent has a personal financial interest in the property being sold. This creates a special type of agency that cannot be revoked by the principal. For example, if a broker lends money to the seller and is given agency authority to sell the property to recoup the loan, the seller cannot terminate the agency until the broker's interest is satisfied.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An agency relationship where the agent has a financial interest in the property" },
        { letter: "B", text: "An agency relationship that includes property management" },
        { letter: "C", text: "An agency relationship where the agent is also a friend of the client" },
        { letter: "D", text: "An agency relationship that involves both buying and selling services" }
      ]
    },
    {
      text: "What is a 'facilitator' or 'transaction broker' in real estate?",
      answer: "A neutral third party who assists both buyer and seller without fiduciary duties to either",
      explanation: "A facilitator or transaction broker is a neutral third party who assists both the buyer and seller in completing a transaction without representing either party in a fiduciary capacity. Unlike an agent, a facilitator does not owe fiduciary duties to either party but still must deal honestly and fairly with both sides and disclose known material facts.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agent who works only with first-time homebuyers" },
        { letter: "B", text: "A neutral third party who assists both buyer and seller without fiduciary duties to either" },
        { letter: "C", text: "A real estate attorney who prepares closing documents" },
        { letter: "D", text: "An agent who specializes in facilitating complex transactions" }
      ]
    },
    {
      text: "What is a 'cooperating broker' in real estate?",
      answer: "A broker who finds a buyer for another broker's listing",
      explanation: "A cooperating broker (often called a selling broker) is one who finds a buyer for another broker's listing. The listing broker typically offers to share a portion of their commission with any cooperating broker who brings a successful buyer. This cooperative system, often facilitated through MLS, expands market exposure for sellers and inventory access for buyers.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Two brokers who share an office" },
        { letter: "B", text: "A broker who finds a buyer for another broker's listing" },
        { letter: "C", text: "Brokers who collaborate on marketing materials" },
        { letter: "D", text: "A broker who helps another broker with paperwork" }
      ]
    },
    {
      text: "What is 'designated agency' in real estate?",
      answer: "When a broker assigns different agents within the same firm to represent the buyer and seller separately",
      explanation: "Designated agency occurs when a broker assigns different agents within the same brokerage to represent the buyer and seller separately in the same transaction. Each designated agent owes fiduciary duties only to their assigned client. This approach helps manage in-house transactions while minimizing the conflicts of interest that can arise with dual agency.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a broker assigns different agents within the same firm to represent the buyer and seller separately" },
        { letter: "B", text: "When an agent is designated as a specialist in certain property types" },
        { letter: "C", text: "When a broker selects an agent to be their successor" },
        { letter: "D", text: "When an agent is assigned to a specific geographic territory" }
      ]
    },
    {
      text: "What is the primary duty of a listing agent?",
      answer: "To represent the seller's best interests",
      explanation: "The primary duty of a listing agent is to represent the seller's best interests throughout the transaction. This includes helping determine an appropriate listing price, marketing the property effectively, negotiating favorable terms for the seller, and fulfilling all fiduciary duties (loyalty, confidentiality, disclosure, obedience, reasonable care, and accounting).",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To find qualified buyers" },
        { letter: "B", text: "To represent the seller's best interests" },
        { letter: "C", text: "To ensure the property sells quickly" },
        { letter: "D", text: "To coordinate property showings" }
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
  
  console.log('\n=========== AGENCY QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addAgencyQuestions()
  .then(() => {
    console.log('Agency questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding agency questions:', error);
    process.exit(1);
  });