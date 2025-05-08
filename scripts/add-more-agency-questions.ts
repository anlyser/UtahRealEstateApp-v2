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

async function addMoreAgencyQuestions() {
  console.log('Starting to add more real estate agency questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more agency questions
  const questions: Question[] = [
    {
      text: "What is 'vicarious liability' in real estate agency?",
      answer: "Legal responsibility of a broker for the acts of agents working under their supervision",
      explanation: "Vicarious liability is the legal responsibility a broker has for the acts of the agents working under their supervision. This is based on the legal principle of respondeat superior ('let the master answer'). Even if the broker didn't participate in or know about an agent's action, they can be held legally responsible, which is why brokers must properly train and supervise their agents.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Legal responsibility of a buyer for the acts of their agent" },
        { letter: "B", text: "Legal responsibility of a broker for the acts of agents working under their supervision" },
        { letter: "C", text: "The seller's responsibility to supervise the agent" },
        { letter: "D", text: "A substitute liability policy used by real estate agencies" }
      ]
    },
    {
      text: "What is a 'dual agent'?",
      answer: "An agent who represents both buyer and seller in the same transaction",
      explanation: "A dual agent is a real estate agent who represents both the buyer and seller in the same transaction. This creates a potential conflict of interest since the agent must try to secure the best terms for both parties whose interests are inherently opposed. Dual agency requires informed consent from both parties and is illegal in some states due to these conflicts.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An agent who represents both buyer and seller in the same transaction" },
        { letter: "B", text: "An agent who works for two different brokerages" },
        { letter: "C", text: "An agent who represents a married couple" },
        { letter: "D", text: "An agent with two professional designations" }
      ]
    },
    {
      text: "What is 'designated agency'?",
      answer: "When different agents from the same brokerage represent the buyer and seller separately",
      explanation: "Designated agency occurs when a real estate broker assigns different agents within the same brokerage to represent the buyer and seller separately in the same transaction. This allows a brokerage to handle both sides of a transaction while minimizing conflict of interest concerns since different individuals represent each party, though the broker must still maintain confidentiality between the agents.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When different agents from the same brokerage represent the buyer and seller separately" },
        { letter: "B", text: "When an agent is designated to work exclusively with luxury properties" },
        { letter: "C", text: "When a broker designates specific areas for agents to work in" },
        { letter: "D", text: "When a buyer designates which agent they want to work with" }
      ]
    },
    {
      text: "What is 'express agency'?",
      answer: "An agency relationship created by written or oral agreement",
      explanation: "Express agency is an agency relationship created by explicit written or oral agreement between the principal and agent. In real estate, most agency relationships are express and documented in writing through listing agreements for sellers or buyer representation agreements for buyers. Express agency clearly establishes the rights and responsibilities of both parties.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agency relationship created by written or oral agreement" },
        { letter: "B", text: "A fast-moving real estate agency" },
        { letter: "C", text: "An agency specializing in express services" },
        { letter: "D", text: "An agent who expresses opinions strongly" }
      ]
    },
    {
      text: "What is 'implied agency'?",
      answer: "An agency relationship created by the actions of the parties rather than by explicit agreement",
      explanation: "Implied agency is an agency relationship created by the actions and conduct of the parties rather than through explicit agreement. For example, if an agent shows properties exclusively to a buyer, discusses negotiation strategies, and offers advice on offers, a court might find implied agency even without a signed agreement. This is why agents should clarify relationships early to avoid unintended agency.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agency created by law rather than agreement" },
        { letter: "B", text: "An agency relationship created by the actions of the parties rather than by explicit agreement" },
        { letter: "C", text: "A non-binding agency relationship" },
        { letter: "D", text: "A temporary agency arrangement" }
      ]
    },
    {
      text: "What is 'puffing' in real estate?",
      answer: "Exaggeration about a property's features that would not mislead a reasonable person",
      explanation: "Puffing refers to exaggerations or vague commendations about a property's features that would not mislead a reasonable person. It's considered sales talk or opinion rather than a statement of fact. Examples include saying a house is 'gorgeous' or in the 'best neighborhood.' Unlike misrepresentation, puffing is generally not actionable legally, though the line between puffing and misrepresentation can be subjective.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Exaggeration about a property's features that would not mislead a reasonable person" },
        { letter: "B", text: "Making up information about a property" },
        { letter: "C", text: "Using air pumps to make furniture look fuller for staging" },
        { letter: "D", text: "Spraying air fresheners before an open house" }
      ]
    },
    {
      text: "What is 'procuring cause' in real estate?",
      answer: "The uninterrupted series of events that leads to a completed transaction",
      explanation: "Procuring cause refers to the uninterrupted series of events or efforts that lead directly to a completed transaction. It's used to determine which agent is entitled to a commission when multiple agents work with the same buyer or property. The procuring cause agent is the one whose actions were the predominant, initiating reason why the buyer purchased the property, which can involve factors beyond simply showing the property first.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The uninterrupted series of events that leads to a completed transaction" },
        { letter: "B", text: "The cause of a property's defect" },
        { letter: "C", text: "The methodology used to procure new listings" },
        { letter: "D", text: "The reason a buyer decides to purchase a home" }
      ]
    },
    {
      text: "What is a 'pocket listing'?",
      answer: "A property listing that is not entered into the MLS",
      explanation: "A pocket listing is a property listing where the seller has signed a listing agreement with a broker but the property is not entered into the Multiple Listing Service (MLS). The listing is kept 'in the broker's pocket' and marketed privately to select buyers or agents. While this offers privacy, it typically results in less market exposure. NAR rules now require MLS participants to submit listings within one business day of marketing a property publicly.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A property listing that is not entered into the MLS" },
        { letter: "B", text: "A listing that an agent keeps in their pocket notebook" },
        { letter: "C", text: "A small property that can fit in your pocket" },
        { letter: "D", text: "A listing that requires minimal commission" }
      ]
    },
    {
      text: "What does 'FSBO' stand for in real estate?",
      answer: "For Sale By Owner",
      explanation: "FSBO (pronounced 'fizbo') stands for 'For Sale By Owner' and refers to a property being sold directly by the owner without the representation of a real estate agent or broker. Owners choose this approach typically to avoid paying commission, though they still often pay commission to a buyer's agent. FSBOs face challenges in pricing, marketing, negotiation, and handling the complex paperwork and legal requirements.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "For Sale By Office" },
        { letter: "B", text: "For Sale By Owner" },
        { letter: "C", text: "Fast Sale Best Offer" },
        { letter: "D", text: "First Showing Brings Offer" }
      ]
    },
    {
      text: "What is the 'standard of care' in real estate agency?",
      answer: "The degree of care and skill expected of a reasonable, professional real estate agent",
      explanation: "The standard of care in real estate agency is the degree of care, diligence, and skill that a reasonably prudent real estate professional would exercise under similar circumstances. Agents are expected to possess specialized knowledge of real estate practices, market conditions, and relevant laws. Failure to meet this standard (such as misrepresenting facts, failing to disclose known defects, or giving improper advice) may constitute negligence.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The minimum level of care required by law" },
        { letter: "B", text: "The degree of care and skill expected of a reasonable, professional real estate agent" },
        { letter: "C", text: "A standardized rating system for real estate agents" },
        { letter: "D", text: "The care provided to a seller's property during showings" }
      ]
    },
    {
      text: "What is 'limited agency' in real estate?",
      answer: "A type of dual agency where the agent's role is restricted to avoid conflicts of interest",
      explanation: "Limited agency (also called 'transaction brokerage' in some states) is a type of dual agency where an agent's role is intentionally restricted to minimize conflicts of interest when representing both buyer and seller in the same transaction. The agent typically acts more as a neutral facilitator than a fiduciary, providing limited representation to both parties with their informed consent. This allows one agent to complete the transaction while reducing liability.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agency relationship that expires after a short period" },
        { letter: "B", text: "A type of dual agency where the agent's role is restricted to avoid conflicts of interest" },
        { letter: "C", text: "An agreement that limits the agent's liability" },
        { letter: "D", text: "An agency relationship that only covers certain properties" }
      ]
    },
    {
      text: "What is an 'exclusive right to sell' listing?",
      answer: "A listing agreement where one broker has the exclusive right to earn a commission, regardless of who finds the buyer",
      explanation: "An exclusive right to sell listing is an agreement where one broker has the exclusive right to earn a commission during the listing period, regardless of who finds the buyer—even if the seller finds the buyer independently. This is the most common type of listing agreement and provides the strongest protection for the broker's commission, encouraging them to invest maximum effort and resources in marketing the property.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A listing agreement where one broker has the exclusive right to earn a commission, regardless of who finds the buyer" },
        { letter: "B", text: "A listing that can only be shown by the listing agent" },
        { letter: "C", text: "A listing that gives the agent the right to sell the property at any price" },
        { letter: "D", text: "A listing that cannot be shown to more than one buyer at a time" }
      ]
    },
    {
      text: "What is an 'exclusive agency' listing?",
      answer: "A listing where the broker earns a commission unless the seller finds the buyer themselves",
      explanation: "An exclusive agency listing is an agreement where the broker is the only agent authorized to sell the property, but the seller reserves the right to sell the property themselves without owing a commission. The broker earns a commission on any sale except when the seller personally finds a buyer without the broker's assistance. This arrangement is less common than exclusive right to sell listings because it provides less protection for the broker's commission.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing where only the broker's agency can represent the seller" },
        { letter: "B", text: "A listing where the broker earns a commission unless the seller finds the buyer themselves" },
        { letter: "C", text: "A listing that gives exclusive marketing rights to one agency" },
        { letter: "D", text: "A listing that can only be sold to pre-approved buyers" }
      ]
    },
    {
      text: "What is an 'open listing'?",
      answer: "A non-exclusive listing where the seller can list with multiple brokers and only pays commission to the one who brings a buyer",
      explanation: "An open listing is a non-exclusive agreement where the seller can list their property with multiple brokers simultaneously and only pays commission to the broker who brings a buyer. The seller also reserves the right to sell the property themselves without owing any commission. This arrangement is rarely used by brokers as it provides minimal protection for their marketing efforts and potential commission.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A non-exclusive listing where the seller can list with multiple brokers and only pays commission to the one who brings a buyer" },
        { letter: "B", text: "A property that is open for showing anytime without appointment" },
        { letter: "C", text: "A listing that is openly advertised to the public" },
        { letter: "D", text: "A property with an open house scheduled" }
      ]
    },
    {
      text: "What is 'caveat emptor'?",
      answer: "Let the buyer beware - the principle that buyers are responsible for determining a property's condition",
      explanation: "Caveat emptor is Latin for 'let the buyer beware,' a legal principle stating that buyers are responsible for examining and determining a property's condition before purchase. While this principle has historically placed the burden on buyers, modern real estate law has shifted toward increased seller disclosure requirements, though buyers still have responsibility to perform due diligence through inspections and research.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Let the buyer beware - the principle that buyers are responsible for determining a property's condition" },
        { letter: "B", text: "The requirement that sellers must disclose all defects" },
        { letter: "C", text: "A legal document warning buyers of potential issues" },
        { letter: "D", text: "A type of buyer's market" }
      ]
    },
    {
      text: "What is 'commingling' in real estate agency?",
      answer: "Mixing client funds with an agent's personal or business funds",
      explanation: "Commingling is the unethical and often illegal practice of mixing client funds (like earnest money deposits) with an agent's personal or business operating funds. Real estate laws require client funds to be kept in separate trust or escrow accounts. Commingling is a serious violation that can result in license suspension or revocation, as it creates risk of misuse of client funds and complicates proper accounting.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Mixing client funds with an agent's personal or business funds" },
        { letter: "B", text: "Combining multiple properties in one listing" },
        { letter: "C", text: "Living in a property that you're selling" },
        { letter: "D", text: "Representing multiple clients at once" }
      ]
    },
    {
      text: "What is 'conversion' in real estate agency law?",
      answer: "The unauthorized use of client funds for personal purposes",
      explanation: "Conversion in real estate agency law refers to the unauthorized and illegal use of client funds for personal purposes. This occurs when an agent or broker takes money that belongs to clients (such as earnest money deposits or rental income) and uses it for their own benefit. Conversion is essentially theft and constitutes a serious violation of fiduciary duty that typically results in license revocation and potential criminal charges.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of converting a property from residential to commercial use" },
        { letter: "B", text: "The unauthorized use of client funds for personal purposes" },
        { letter: "C", text: "Converting leads into clients" },
        { letter: "D", text: "Changing a listing from exclusive to open" }
      ]
    },
    {
      text: "What is a 'facilitator' or 'transaction broker' in real estate?",
      answer: "A neutral third party who assists both buyer and seller without representing either as a fiduciary",
      explanation: "A facilitator or transaction broker is a neutral third party who assists both buyer and seller in completing a real estate transaction without representing either as a fiduciary. Unlike a traditional agent, they don't advocate for either party but instead focus on processing the transaction efficiently. This role is recognized in many states as an alternative to traditional agency or dual agency, with obligations to deal honestly and fairly with both parties.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agent who only handles the paperwork in a transaction" },
        { letter: "B", text: "A neutral third party who assists both buyer and seller without representing either as a fiduciary" },
        { letter: "C", text: "A mortgage broker who facilitates the loan process" },
        { letter: "D", text: "An agent who specializes in facilitating communication between parties" }
      ]
    },
    {
      text: "What are the primary fiduciary duties that an agent owes a client?",
      answer: "Loyalty, obedience, disclosure, confidentiality, accountability, and reasonable care and diligence",
      explanation: "The primary fiduciary duties an agent owes a client are often remembered by the acronym 'OLDCAR': Loyalty (putting client's interests first), Obedience (following lawful instructions), Disclosure (revealing material facts), Confidentiality (protecting private information), Accountability (handling money and documents properly), and Reasonable care and diligence (using professional knowledge and skills). These core duties form the foundation of the agent-client relationship.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Loyalty, obedience, disclosure, confidentiality, accountability, and reasonable care and diligence" },
        { letter: "B", text: "Marketing, selling, negotiating, and closing" },
        { letter: "C", text: "Honesty, integrity, knowledge, and service" },
        { letter: "D", text: "Representation, advertising, showing, and settlement" }
      ]
    },
    {
      text: "When does an agency relationship typically terminate?",
      answer: "Upon completion of the task, expiration of the agreement, mutual agreement, death of either party, destruction of the property, or bankruptcy of either party",
      explanation: "An agency relationship typically terminates when: 1) The specified task is completed (e.g., property is sold), 2) The agreement expires, 3) Both parties mutually agree to terminate, 4) Either party dies or becomes incapacitated, 5) The subject property is destroyed, or 6) Either party files for bankruptcy. While parties can also unilaterally terminate an agency agreement, this may have legal and financial consequences depending on the contract terms.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only when the listing expires" },
        { letter: "B", text: "When either party decides to end it for any reason" },
        { letter: "C", text: "Upon completion of the task, expiration of the agreement, mutual agreement, death of either party, destruction of the property, or bankruptcy of either party" },
        { letter: "D", text: "Never - once established, an agency relationship cannot be terminated" }
      ]
    },
    {
      text: "What is a 'net listing'?",
      answer: "A listing where the broker's commission is the amount above a net price set by the seller",
      explanation: "A net listing is an arrangement where the broker's commission is the amount above a net price set by the seller. For example, if the seller wants to net $300,000, the broker keeps anything above that amount as commission. This creates a potential conflict of interest as the broker is incentivized to sell at the lowest price acceptable to the seller. Due to this ethical concern, net listings are illegal in many states.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A listing agreement that yields no commission" },
        { letter: "B", text: "A listing where the broker's commission is the amount above a net price set by the seller" },
        { letter: "C", text: "A listing that is advertised only on the internet" },
        { letter: "D", text: "A listing with a net-zero carbon footprint" }
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
  
  console.log('\n=========== MORE AGENCY QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreAgencyQuestions()
  .then(() => {
    console.log('More agency questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more agency questions:', error);
    process.exit(1);
  });