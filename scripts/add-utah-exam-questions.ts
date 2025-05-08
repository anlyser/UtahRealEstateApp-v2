import { db } from '../db';
import * as schema from '../shared/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * This script adds a comprehensive set of Utah real estate exam questions
 * covering key topics from the state exam.
 */

interface Question {
  text: string;
  answer: string;
  explanation: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: { letter: string; text: string }[];
}

// Function to get or create a category
async function getOrCreateCategory(name: string): Promise<number> {
  // Check if category exists
  const existingCategories = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, name));
  
  if (existingCategories.length > 0) {
    return existingCategories[0].id;
  }
  
  // Create new category
  const [newCategory] = await db
    .insert(schema.categories)
    .values({
      name,
      description: `Questions related to ${name}`,
    })
    .returning();
  
  return newCategory.id;
}

async function addUtahExamQuestions() {
  console.log('Starting to add comprehensive Utah real estate exam questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Agency category questions
  const agencyQuestions: Question[] = [
    {
      text: "What is a dual agency in real estate?",
      answer: "When a single agent represents both the buyer and seller in the same transaction",
      explanation: "Dual agency occurs when a single agent represents both the buyer and seller in the same transaction. This creates potential conflicts of interest and requires written consent from all parties in most states, including Utah.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a single agent represents both the buyer and seller in the same transaction" },
        { letter: "B", text: "When two agents from different brokerages work together on a transaction" },
        { letter: "C", text: "When an agent works exclusively for a buyer" },
        { letter: "D", text: "When an agent represents multiple sellers at the same time" }
      ]
    },
    {
      text: "In a designated agency arrangement, what is true?",
      answer: "Different agents within the same brokerage represent the buyer and seller separately",
      explanation: "In designated agency, a brokerage assigns different agents to represent the buyer and seller separately. This allows a brokerage to handle both sides of a transaction while minimizing conflicts of interest.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The listing agent always represents both buyer and seller" },
        { letter: "B", text: "Different agents within the same brokerage represent the buyer and seller separately" },
        { letter: "C", text: "The broker must remain neutral while agents represent either party" },
        { letter: "D", text: "No written disclosure of the arrangement is required" }
      ]
    },
    {
      text: "What is a 'single agency' relationship in real estate?",
      answer: "When an agent represents only one party in a transaction (either buyer or seller)",
      explanation: "Single agency occurs when a real estate agent represents only one party in a transaction, either the buyer or the seller. The agent owes fiduciary duties only to their client and must act solely in their best interest.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "When an agent represents both buyer and seller in the same transaction" },
        { letter: "B", text: "When an agent represents only one party in a transaction (either buyer or seller)" },
        { letter: "C", text: "When two agents from the same brokerage represent both sides of a transaction" },
        { letter: "D", text: "When a buyer works with multiple agents to find a property" }
      ]
    },
    {
      text: "What is 'limited agency' in Utah real estate?",
      answer: "When an agent or brokerage represents both buyer and seller in the same transaction with their informed consent",
      explanation: "In Utah, limited agency (also called dual agency in other states) occurs when an agent or brokerage represents both the buyer and seller in the same transaction. This requires written informed consent from all parties and limits some of the agent's duties to each client.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When an agent is restricted from showing certain properties" },
        { letter: "B", text: "When an agent represents only buyers but never sellers" },
        { letter: "C", text: "When an agent or brokerage represents both buyer and seller in the same transaction with their informed consent" },
        { letter: "D", text: "When a new agent works under the supervision of a broker" }
      ]
    },
    {
      text: "What does fiduciary duty mean in a real estate agency relationship?",
      answer: "The legal obligation of an agent to act in the best interest of their client",
      explanation: "Fiduciary duty is the highest standard of care in an agency relationship. It requires real estate agents to act solely in their client's best interest, with loyalty, confidentiality, disclosure, obedience, reasonable care, and accounting for all funds.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The requirement to split commissions with other agents" },
        { letter: "B", text: "The legal obligation of an agent to act in the best interest of their client" },
        { letter: "C", text: "The duty to treat all parties fairly regardless of representation" },
        { letter: "D", text: "The obligation to maintain a professional license" }
      ]
    },
    {
      text: "Which of the following is NOT one of the fiduciary duties a real estate agent owes to their client?",
      answer: "Guaranteeing a successful transaction outcome",
      explanation: "Agents do not guarantee transaction outcomes as this is beyond their control. The fiduciary duties include loyalty, confidentiality, disclosure, obedience, reasonable care, and accounting for all funds.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Loyalty" },
        { letter: "B", text: "Confidentiality" },
        { letter: "C", text: "Reasonable care and diligence" },
        { letter: "D", text: "Guaranteeing a successful transaction outcome" }
      ]
    },
    {
      text: "When must a real estate agent provide an agency disclosure form in Utah?",
      answer: "At the first substantive contact with a prospective buyer or seller",
      explanation: "In Utah, real estate agents must provide a written agency disclosure form at the first substantive contact with a prospective buyer or seller. This ensures clients understand who the agent represents before sharing confidential information.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Only when listing a property" },
        { letter: "B", text: "At the first substantive contact with a prospective buyer or seller" },
        { letter: "C", text: "Only at closing" },
        { letter: "D", text: "Only when a buyer makes an offer" }
      ]
    },
    {
      text: "What is a buyer's agent?",
      answer: "An agent who represents only the buyer in a real estate transaction",
      explanation: "A buyer's agent is a real estate professional who works exclusively for the buyer, representing their interests throughout the transaction. They owe fiduciary duties to the buyer and work to help them find suitable properties and negotiate favorable terms.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An agent who represents only the buyer in a real estate transaction" },
        { letter: "B", text: "Any agent who shows property to potential buyers" },
        { letter: "C", text: "An agent who works primarily with first-time homebuyers" },
        { letter: "D", text: "An agent who always offers a commission rebate to buyers" }
      ]
    },
    {
      text: "What happens if a real estate agent engages in undisclosed dual agency in Utah?",
      answer: "They may face license revocation, fines, and potential lawsuits",
      explanation: "Undisclosed dual agency is illegal in Utah and most states. If an agent represents both parties without proper disclosure and consent, they risk severe penalties including license revocation, fines, and civil liability through lawsuits from the affected parties.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Nothing, as long as the transaction closes successfully" },
        { letter: "B", text: "They must split their commission with another agent" },
        { letter: "C", text: "They may face license revocation, fines, and potential lawsuits" },
        { letter: "D", text: "They simply need to disclose it at closing" }
      ]
    },
    {
      text: "What is a transaction broker in real estate?",
      answer: "A facilitator who assists both parties but doesn't represent either as a fiduciary",
      explanation: "A transaction broker (or limited agent in some states) assists both the buyer and seller in a transaction but doesn't represent either party as a fiduciary. They facilitate the transaction while maintaining a neutral position without advocating for either side.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A broker who specializes in commercial transactions" },
        { letter: "B", text: "A facilitator who assists both parties but doesn't represent either as a fiduciary" },
        { letter: "C", text: "A broker who represents multiple buyers at once" },
        { letter: "D", text: "An agent who only handles the paperwork portion of transactions" }
      ]
    },
  ];

  // Property Ownership category questions
  const propertyOwnershipQuestions: Question[] = [
    {
      text: "What does the term 'tenancy in common' mean in real estate?",
      answer: "A form of ownership where multiple owners have undivided interests that can be unequal and can be sold separately",
      explanation: "Tenancy in common allows multiple owners to hold title with undivided interests that can be unequal shares. Each owner can sell or will their share independently, and there is no right of survivorship.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lease arrangement where multiple tenants share a property" },
        { letter: "B", text: "A form of ownership where multiple owners have undivided interests that can be unequal and can be sold separately" },
        { letter: "C", text: "Joint ownership between married couples only" },
        { letter: "D", text: "Ownership that automatically transfers to heirs upon death" }
      ]
    },
    {
      text: "What is a riparian right in real estate?",
      answer: "The right of a property owner whose land borders a natural waterway to use the water",
      explanation: "Riparian rights are granted to property owners whose land borders natural waterways (rivers, streams, lakes). These rights typically include access to and reasonable use of the water while not impeding others' rights to use the water.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The right to build a dock on any waterfront property" },
        { letter: "B", text: "The right of a property owner whose land borders a natural waterway to use the water" },
        { letter: "C", text: "The right to divert water from any source to irrigate property" },
        { letter: "D", text: "The exclusive right to fish in adjacent waters" }
      ]
    },
    {
      text: "What does 'color of title' mean in real estate law?",
      answer: "Appearing to have title to a property based on some written document, which is actually invalid",
      explanation: "Color of title refers to a situation where someone appears to have legal title to a property based on a written document (like a deed), but the document is actually defective or invalid for some reason. This can be relevant in adverse possession claims.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A deed that includes the property's legal description" },
        { letter: "B", text: "Appearing to have title to a property based on some written document, which is actually invalid" },
        { letter: "C", text: "A title that has been verified through a title search" },
        { letter: "D", text: "The right to paint a property any color" }
      ]
    },
    {
      text: "What is a life estate in real estate?",
      answer: "Ownership interest that lasts for the duration of someone's life",
      explanation: "A life estate grants ownership rights to a person (the life tenant) for the duration of their lifetime or someone else's lifetime. Upon death, the property automatically transfers to the remainderman (the person designated to receive the property).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A permanent ownership interest that can never be sold" },
        { letter: "B", text: "Ownership interest that lasts for the duration of someone's life" },
        { letter: "C", text: "A mortgage that is paid off over the borrower's lifetime" },
        { letter: "D", text: "An insurance policy that covers a property for a person's lifetime" }
      ]
    },
    {
      text: "What is the bundle of rights in real estate ownership?",
      answer: "The right to use, possess, control, exclude others from, and dispose of the property",
      explanation: "The bundle of rights refers to the collection of legal rights that come with owning real property. These rights include the right to use the property, possess it, control what happens on it, exclude others from it, and dispose of (sell) it.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only the right to sell the property" },
        { letter: "B", text: "The documents held by the title company" },
        { letter: "C", text: "The right to use, possess, control, exclude others from, and dispose of the property" },
        { letter: "D", text: "The legal right to build any structure on the property" }
      ]
    },
    {
      text: "What is the difference between real property and personal property?",
      answer: "Real property is land and anything permanently attached to it; personal property is movable and not attached to land",
      explanation: "Real property (real estate) consists of land and anything permanently attached to it, like buildings and fixtures. Personal property refers to movable items not permanently attached to land, such as furniture, vehicles, and personal belongings.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Real property is owned by individuals; personal property is owned by businesses" },
        { letter: "B", text: "Real property is land and anything permanently attached to it; personal property is movable and not attached to land" },
        { letter: "C", text: "Real property can be insured; personal property cannot" },
        { letter: "D", text: "Real property is taxable; personal property is never taxed" }
      ]
    },
    {
      text: "What is a fixture in real estate?",
      answer: "Personal property that has been permanently attached to real property and becomes part of it",
      explanation: "A fixture is an item that was once personal property but has been permanently attached to real property (affixed) and is now considered part of the real estate. Common tests for fixtures include method of attachment, adaptability, and intention of the parties.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Any decorative item in a house" },
        { letter: "B", text: "Personal property that has been permanently attached to real property and becomes part of it" },
        { letter: "C", text: "Items that must be repaired before selling a property" },
        { letter: "D", text: "Furniture included in a real estate sale" }
      ]
    },
    {
      text: "Which of the following best describes a 'leasehold estate'?",
      answer: "The right to use and occupy real estate for a fixed period based on a lease agreement",
      explanation: "A leasehold estate is a tenant's right to use and occupy real property for a specified period as established in a lease agreement. Unlike freehold estates, the tenant doesn't own the property but has certain rights to it during the lease term.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Permanent ownership of property with unlimited rights" },
        { letter: "B", text: "Ownership that automatically transfers to heirs" },
        { letter: "C", text: "The right to use and occupy real estate for a fixed period based on a lease agreement" },
        { letter: "D", text: "An estate that can only be owned by a corporation" }
      ]
    },
    {
      text: "What is an easement appurtenant?",
      answer: "An easement that benefits a specific parcel of land and transfers with the property when sold",
      explanation: "An easement appurtenant is attached to land ownership and benefits a specific parcel (the dominant tenement) while burdening another parcel (the servient tenement). It transfers automatically when either property is sold. A common example is a driveway easement that crosses one property to access another.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An easement that benefits a specific person rather than a property" },
        { letter: "B", text: "An easement that benefits a specific parcel of land and transfers with the property when sold" },
        { letter: "C", text: "A temporary easement that expires after a certain period" },
        { letter: "D", text: "An easement created by long-term use rather than by written agreement" }
      ]
    },
    {
      text: "What is a covenant in real estate?",
      answer: "A promise or restriction in a deed or other written instrument affecting the use of real property",
      explanation: "A covenant is a promise or restriction contained in a deed or other written instrument that affects how real property can be used. Covenants may be affirmative (requiring certain actions) or negative (prohibiting certain activities) and often run with the land, binding future owners.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A promise or restriction in a deed or other written instrument affecting the use of real property" },
        { letter: "B", text: "A type of mortgage with special terms" },
        { letter: "C", text: "The meeting where closing documents are signed" },
        { letter: "D", text: "A promise between real estate agents to cooperate" }
      ]
    },
  ];

  // Utah State Law category questions
  const utahLawQuestions: Question[] = [
    {
      text: "What governmental body regulates real estate licensees in Utah?",
      answer: "Utah Division of Real Estate",
      explanation: "The Utah Division of Real Estate, which is part of the Department of Commerce, is responsible for regulating real estate licensees in the state. This includes issuing licenses, enforcing real estate laws, and investigating complaints against licensees.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Utah Department of Housing" },
        { letter: "B", text: "Utah Real Estate Commission" },
        { letter: "C", text: "Utah Division of Real Estate" },
        { letter: "D", text: "Utah Department of Professional Licensing" }
      ]
    },
    {
      text: "In Utah, how often must a real estate license be renewed?",
      answer: "Every 2 years",
      explanation: "Real estate licenses in Utah must be renewed every 2 years. Agents must complete continuing education requirements before renewal, including core and elective course hours.",
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
      text: "What is the minimum age to obtain a real estate license in Utah?",
      answer: "18 years",
      explanation: "To obtain a real estate license in Utah, applicants must be at least 18 years of age, have a high school diploma or equivalent, complete the pre-licensing education, pass a background check, and pass the licensing exam.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "16 years" },
        { letter: "B", text: "18 years" },
        { letter: "C", text: "21 years" },
        { letter: "D", text: "25 years" }
      ]
    },
    {
      text: "Under Utah law, what is required when a real estate agent changes brokerages?",
      answer: "Notify the Division of Real Estate within 10 business days",
      explanation: "When a real estate agent changes brokerages in Utah, they must notify the Division of Real Estate within 10 business days of the change. Their license must be reissued showing the new brokerage before they can conduct business under the new broker.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Notify the Division of Real Estate within 10 business days" },
        { letter: "B", text: "Retake the state licensing exam" },
        { letter: "C", text: "Complete 6 hours of additional continuing education" },
        { letter: "D", text: "Obtain written approval from the previous broker" }
      ]
    },
    {
      text: "In Utah, what form must be used for most residential real estate sales?",
      answer: "Real Estate Purchase Contract (REPC)",
      explanation: "The Real Estate Purchase Contract (REPC) is the standard form used for most residential real estate sales in Utah. This form is approved by the Utah Division of Real Estate and covers the terms and conditions of the purchase agreement.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Listing Agreement" },
        { letter: "B", text: "Real Estate Purchase Contract (REPC)" },
        { letter: "C", text: "Buyer Agency Agreement" },
        { letter: "D", text: "Property Disclosure Statement" }
      ]
    },
    {
      text: "What is the purpose of the Seller's Property Condition Disclosure (SPCD) in Utah?",
      answer: "To disclose known material defects in the property to potential buyers",
      explanation: "The Seller's Property Condition Disclosure (SPCD) in Utah is a form that sellers complete to disclose known material defects and other important information about the property to potential buyers. This helps buyers make informed decisions and protects sellers from future claims of non-disclosure.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To establish the listing price" },
        { letter: "B", text: "To disclose known material defects in the property to potential buyers" },
        { letter: "C", text: "To determine the property tax assessment" },
        { letter: "D", text: "To set the commission rate for the listing agent" }
      ]
    },
    {
      text: "Under Utah law, what is the standard earnest money default provision in the REPC?",
      answer: "Buyer forfeits the earnest money to the seller as liquidated damages",
      explanation: "Under the standard provisions in the Utah Real Estate Purchase Contract (REPC), if the buyer defaults, the seller may retain the earnest money as liquidated damages. This is the default remedy unless the parties have specified otherwise in the contract.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Buyer forfeits the earnest money to the seller as liquidated damages" },
        { letter: "B", text: "Buyer receives the earnest money back in full" },
        { letter: "C", text: "Earnest money is split equally between buyer and seller" },
        { letter: "D", text: "Earnest money is held until a court determines ownership" }
      ]
    },
    {
      text: "What is the maximum fine the Utah Division of Real Estate can impose for a single violation?",
      answer: "$5,000 per violation",
      explanation: "The Utah Division of Real Estate can impose fines of up to $5,000 per violation of real estate laws or rules. For multiple violations, these fines can accumulate, and the Division may also suspend or revoke a license for serious violations.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "$1,000 per violation" },
        { letter: "B", text: "$2,500 per violation" },
        { letter: "C", text: "$5,000 per violation" },
        { letter: "D", text: "$10,000 per violation" }
      ]
    },
    {
      text: "In Utah, how long does a buyer typically have to conduct due diligence under the standard REPC?",
      answer: "The timeframe specified in the contract (typically 10-14 days)",
      explanation: "In the Utah Real Estate Purchase Contract (REPC), the due diligence period is not a fixed timeframe but is negotiable and specified in the contract. Typically, parties agree to 10-14 days, during which the buyer can investigate the property and cancel the contract if they find issues.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 days by law" },
        { letter: "B", text: "7 days by law" },
        { letter: "C", text: "The timeframe specified in the contract (typically 10-14 days)" },
        { letter: "D", text: "30 days by law" }
      ]
    },
    {
      text: "What is a principal broker's responsibility regarding trust accounts in Utah?",
      answer: "Maintain trust accounts and be responsible for all funds deposited",
      explanation: "In Utah, principal brokers are responsible for establishing and maintaining all trust accounts for their brokerage. They must ensure proper handling of all funds deposited, maintain records, and conduct regular reconciliations. They are ultimately responsible for all trust funds even if tasks are delegated.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Delegate all trust account responsibilities to office staff" },
        { letter: "B", text: "Maintain trust accounts and be responsible for all funds deposited" },
        { letter: "C", text: "Allow each agent to maintain their own trust account" },
        { letter: "D", text: "Use trust accounts only for commission payments" }
      ]
    },
  ];

  // Contracts category questions
  const contractsQuestions: Question[] = [
    {
      text: "What is an option contract in real estate?",
      answer: "A contract giving a potential buyer the right, but not the obligation, to purchase property at a specified price within a certain timeframe",
      explanation: "An option contract gives a potential buyer the exclusive right to purchase a property at a predetermined price within a specific time period, usually for a fee. The buyer isn't obligated to complete the purchase, but the seller cannot sell to anyone else during the option period.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that automatically renews each year" },
        { letter: "B", text: "A contract giving a potential buyer the right, but not the obligation, to purchase property at a specified price within a certain timeframe" },
        { letter: "C", text: "A lease agreement with an option to extend the lease term" },
        { letter: "D", text: "A contract that offers the buyer multiple financing options" }
      ]
    },
    {
      text: "What is typically included in an earnest money deposit clause?",
      answer: "The amount of money, who holds it, and what happens to it if the transaction doesn't close",
      explanation: "An earnest money deposit clause specifies the amount of the deposit, who will hold the funds (usually a title company, broker, or escrow agent), when it must be paid, and what happens to the money if the transaction doesn't close, including conditions for refund or forfeiture.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only the amount of the deposit" },
        { letter: "B", text: "The amount of money, who holds it, and what happens to it if the transaction doesn't close" },
        { letter: "C", text: "A requirement that earnest money must be at least 10% of the purchase price" },
        { letter: "D", text: "A guarantee that the buyer will get the earnest money back regardless of circumstances" }
      ]
    },
    {
      text: "What makes a real estate contract legally valid?",
      answer: "Offer, acceptance, consideration, legal purpose, competent parties, and written form",
      explanation: "For a real estate contract to be legally valid, it must include a clear offer and acceptance, consideration (something of value exchanged), a legal purpose, competent parties (mentally capable and of legal age), and be in writing to satisfy the Statute of Frauds.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only the signatures of both parties" },
        { letter: "B", text: "Notarization and recording at the county office" },
        { letter: "C", text: "Offer, acceptance, consideration, legal purpose, competent parties, and written form" },
        { letter: "D", text: "Review by an attorney" }
      ]
    },
    {
      text: "What is a bilateral contract in real estate?",
      answer: "A contract where both parties make promises to each other",
      explanation: "A bilateral contract involves promises made by both parties. Most real estate contracts are bilateral - the seller promises to convey the property and the buyer promises to pay the purchase price, creating mutual obligations.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that can only be used for commercial properties" },
        { letter: "B", text: "A contract where both parties make promises to each other" },
        { letter: "C", text: "A contract where only one party makes a promise" },
        { letter: "D", text: "A contract between two brokerages" }
      ]
    },
    {
      text: "What is an 'as-is' clause in a real estate contract?",
      answer: "A provision stating the seller makes no warranties about the property's condition",
      explanation: "An 'as-is' clause states that the seller is making no warranties regarding the property's condition and will not be responsible for repairs. The buyer accepts the property in its current condition, though this doesn't typically relieve the seller from disclosure obligations regarding known defects.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A provision stating the seller makes no warranties about the property's condition" },
        { letter: "B", text: "A clause requiring the property to meet specific standards" },
        { letter: "C", text: "A requirement that the buyer must order an inspection" },
        { letter: "D", text: "A clause relieving the seller from disclosing known defects" }
      ]
    },
    {
      text: "What does the term 'time is of the essence' mean in a real estate contract?",
      answer: "Deadlines in the contract are strict and must be met",
      explanation: "When a contract states that 'time is of the essence,' it means that all deadlines and timeframes specified in the contract are strict and must be met exactly. Missing a deadline could constitute a breach of contract and may allow the other party to cancel the agreement.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Deadlines in the contract are strict and must be met" },
        { letter: "B", text: "The transaction should close as quickly as possible" },
        { letter: "C", text: "Deadlines can be extended without written agreement" },
        { letter: "D", text: "The property must be vacant by closing" }
      ]
    },
    {
      text: "What is a contingency in a real estate contract?",
      answer: "A condition that must be met for the contract to become binding",
      explanation: "A contingency is a condition included in a contract that must be satisfied for the agreement to become fully binding or to proceed to closing. Common contingencies include financing, inspection, appraisal, and the sale of the buyer's current home.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A condition that must be met for the contract to become binding" },
        { letter: "B", text: "The final walkthrough before closing" },
        { letter: "C", text: "An emergency clause that automatically voids the contract" },
        { letter: "D", text: "The amount of money held in escrow" }
      ]
    },
    {
      text: "What happens if a real estate contract does not specify a closing date?",
      answer: "Courts may imply a reasonable time for performance",
      explanation: "If a real estate contract does not specify a closing date, courts generally hold that the transaction should close within a 'reasonable time.' What constitutes reasonable depends on the circumstances, local customs, and the nature of the transaction.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The contract is automatically void" },
        { letter: "B", text: "Closing must occur within 30 days by law" },
        { letter: "C", text: "Courts may imply a reasonable time for performance" },
        { letter: "D", text: "The seller can set any closing date they want" }
      ]
    },
    {
      text: "What is an executory contract in real estate?",
      answer: "A contract that has been signed but not yet fully performed by all parties",
      explanation: "An executory contract is one that has been properly formed and signed by the parties but has not yet been fully performed or completed. Most real estate purchase contracts are executory from the time of signing until closing.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that has been signed but not yet fully performed by all parties" },
        { letter: "B", text: "A contract that has been voided by one party" },
        { letter: "C", text: "A contract that can be enforced by court order" },
        { letter: "D", text: "A contract signed by an executor of an estate" }
      ]
    },
    {
      text: "What is novation in contract law?",
      answer: "The substitution of a new contract for an old one, with all parties' consent",
      explanation: "Novation is the legal process of substituting a new contract for an old one, with the consent of all parties involved. The new contract replaces the original contract, and the original obligations are extinguished. In real estate, this might occur when a buyer wants to assign their rights to another buyer.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A breach of contract by the seller" },
        { letter: "B", text: "The substitution of a new contract for an old one, with all parties' consent" },
        { letter: "C", text: "An amendment to an existing contract" },
        { letter: "D", text: "When one party assigns their rights to another without the other party's consent" }
      ]
    },
  ];

  // Finance category questions
  const financeQuestions: Question[] = [
    {
      text: "What is a loan-to-value (LTV) ratio?",
      answer: "The percentage of a property's value that is mortgaged",
      explanation: "The loan-to-value (LTV) ratio is calculated by dividing the loan amount by the appraised value or purchase price of the property (whichever is less). It represents the percentage of the property's value that is financed through the mortgage. Lower LTV ratios typically qualify for better loan terms.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The percentage of a property's value that is mortgaged" },
        { letter: "B", text: "The ratio of monthly income to monthly mortgage payment" },
        { letter: "C", text: "The amount of equity a homeowner has built up" },
        { letter: "D", text: "The amount of interest paid over the life of the loan" }
      ]
    },
    {
      text: "What is private mortgage insurance (PMI)?",
      answer: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment",
      explanation: "Private Mortgage Insurance (PMI) is required by lenders for conventional loans when the borrower makes a down payment of less than 20%. It protects the lender against loss if the borrower defaults. The borrower pays the premiums, which can be removed once the loan-to-value ratio reaches 78-80%.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Insurance that protects the borrower if they lose their job" },
        { letter: "B", text: "Insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment" },
        { letter: "C", text: "Insurance that pays off the mortgage if the borrower dies" },
        { letter: "D", text: "Property insurance that covers damage to the home" }
      ]
    },
    {
      text: "What is a debt-to-income (DTI) ratio in mortgage lending?",
      answer: "The percentage of a borrower's gross monthly income that goes toward paying debts",
      explanation: "The debt-to-income (DTI) ratio compares a borrower's total monthly debt payments to their gross monthly income. Lenders use this ratio to assess a borrower's ability to manage monthly payments and repay debts. Most conventional loans require a DTI ratio of 43% or less.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The percentage of a borrower's gross monthly income that goes toward paying debts" },
        { letter: "B", text: "The ratio of a home's value to the borrower's income" },
        { letter: "C", text: "The percentage of a loan that has been paid off" },
        { letter: "D", text: "The ratio of a borrower's assets to their liabilities" }
      ]
    },
    {
      text: "What is a balloon payment in a mortgage?",
      answer: "A large, final payment that pays off the remaining loan balance at the end of the loan term",
      explanation: "A balloon payment is a large, lump-sum payment required at the end of a balloon mortgage to pay off the remaining loan balance. Balloon mortgages typically have short terms (5-7 years) with lower monthly payments, but require refinancing or full payment at maturity.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An extra payment made to reduce principal" },
        { letter: "B", text: "A large, final payment that pays off the remaining loan balance at the end of the loan term" },
        { letter: "C", text: "The initial down payment on a property" },
        { letter: "D", text: "A penalty for paying off a mortgage early" }
      ]
    },
    {
      text: "What is a conforming loan?",
      answer: "A mortgage that meets the guidelines set by Fannie Mae and Freddie Mac and does not exceed the loan limit",
      explanation: "A conforming loan is a mortgage that conforms to the guidelines set by Fannie Mae and Freddie Mac, including loan limits that vary by county. These loans tend to have lower interest rates and are easier to qualify for than non-conforming loans like jumbo mortgages.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A mortgage that meets the guidelines set by Fannie Mae and Freddie Mac and does not exceed the loan limit" },
        { letter: "B", text: "Any government-backed loan" },
        { letter: "C", text: "A loan with a fixed interest rate" },
        { letter: "D", text: "A loan that conforms to the borrower's financial situation" }
      ]
    },
    {
      text: "What is mortgage amortization?",
      answer: "The process of paying off a mortgage through regular payments of principal and interest over time",
      explanation: "Mortgage amortization is the process of gradually paying off a loan through regular payments that include both principal and interest. Early in the loan term, payments are mostly interest, but as the loan matures, more of each payment goes toward the principal balance.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of paying off a mortgage through regular payments of principal and interest over time" },
        { letter: "B", text: "The depreciation of a property's value over time" },
        { letter: "C", text: "The process of refinancing a mortgage to get a lower interest rate" },
        { letter: "D", text: "The accumulation of equity in a property" }
      ]
    },
    {
      text: "What is a HELOC (Home Equity Line of Credit)?",
      answer: "A revolving line of credit secured by the equity in a home",
      explanation: "A Home Equity Line of Credit (HELOC) is a revolving credit line secured by a home's equity. It works similarly to a credit card, allowing borrowers to draw funds as needed up to a set limit during a draw period, then repay during a repayment period. Interest is only paid on the amount borrowed.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A type of first mortgage with variable interest rates" },
        { letter: "B", text: "A revolving line of credit secured by the equity in a home" },
        { letter: "C", text: "A loan used only for home improvements" },
        { letter: "D", text: "A loan that combines a first and second mortgage" }
      ]
    },
    {
      text: "What is an escrow account in mortgage lending?",
      answer: "An account held by the lender to pay property taxes and insurance on behalf of the borrower",
      explanation: "An escrow account (or impound account) is maintained by the mortgage servicer to collect and hold funds from the borrower's monthly payments to pay for property taxes and insurance when they're due. This helps ensure these important costs are paid on time.",
      categoryName: "Finance",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An account where the down payment is held until closing" },
        { letter: "B", text: "An account held by the lender to pay property taxes and insurance on behalf of the borrower" },
        { letter: "C", text: "A savings account required for all FHA loans" },
        { letter: "D", text: "An account where mortgage payments are deposited" }
      ]
    },
    {
      text: "What is a point in mortgage financing?",
      answer: "A fee equal to 1% of the loan amount paid to the lender to reduce the interest rate",
      explanation: "A point (or discount point) is a fee equal to 1% of the mortgage loan amount. Borrowers can choose to pay points upfront in exchange for a lower interest rate over the life of the loan. This is called 'buying down the rate' and can save money long-term for those who plan to stay in the home.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A percentage of the down payment" },
        { letter: "B", text: "A fee equal to 1% of the loan amount paid to the lender to reduce the interest rate" },
        { letter: "C", text: "A measurement of a borrower's credit score" },
        { letter: "D", text: "The interest rate on an adjustable-rate mortgage" }
      ]
    },
    {
      text: "What does loan underwriting involve?",
      answer: "Evaluating a borrower's credit, income, assets, and the property to determine loan approval",
      explanation: "Loan underwriting is the process where lenders evaluate a borrower's eligibility for a loan. Underwriters analyze the borrower's credit history, income, assets, debts, and the property's value and condition to assess risk and determine if the loan meets the lender's guidelines for approval.",
      categoryName: "Finance",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Evaluating a borrower's credit, income, assets, and the property to determine loan approval" },
        { letter: "B", text: "Negotiating the interest rate with the borrower" },
        { letter: "C", text: "Preparing the closing documents" },
        { letter: "D", text: "Selling the loan to investors on the secondary market" }
      ]
    },
  ];

  // Appraisal category questions
  const appraisalQuestions: Question[] = [
    {
      text: "What are the three approaches to value in real estate appraisal?",
      answer: "Sales comparison approach, cost approach, and income approach",
      explanation: "The three main approaches to determining property value are: 1) Sales comparison approach (comparing similar properties that have recently sold), 2) Cost approach (estimating the cost to replace the property minus depreciation), and 3) Income approach (analyzing the property's income potential).",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Sales comparison approach, cost approach, and income approach" },
        { letter: "B", text: "Market approach, replacement approach, and profit approach" },
        { letter: "C", text: "Tax assessment approach, broker price opinion, and automated valuation" },
        { letter: "D", text: "Historical approach, future projection approach, and current market approach" }
      ]
    },
    {
      text: "What is the primary purpose of a real estate appraisal?",
      answer: "To determine the market value of a property",
      explanation: "The primary purpose of a real estate appraisal is to determine the market value of a property - the most probable price a property would bring in a competitive, open market. Appraisals are typically required by lenders before funding a mortgage to ensure the property value supports the loan amount.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To determine the market value of a property" },
        { letter: "B", text: "To establish the listing price" },
        { letter: "C", text: "To calculate property taxes" },
        { letter: "D", text: "To identify all defects in a property" }
      ]
    },
    {
      text: "In the sales comparison approach, what are comparable properties?",
      answer: "Recently sold properties with similar characteristics to the subject property",
      explanation: "In the sales comparison approach, comparable properties (or 'comps') are recently sold properties that have similar characteristics to the subject property being appraised. Appraisers look for comps with similar location, size, age, condition, and features, then make adjustments for differences.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Any properties currently for sale in the same neighborhood" },
        { letter: "B", text: "Recently sold properties with similar characteristics to the subject property" },
        { letter: "C", text: "Properties that have the same tax assessment value" },
        { letter: "D", text: "Only properties built by the same builder" }
      ]
    },
    {
      text: "What is the income approach to value most commonly used for?",
      answer: "Investment properties that generate rental income",
      explanation: "The income approach to value is most commonly used for investment properties that generate rental income, such as apartment buildings, office buildings, retail centers, and other commercial properties. It analyzes the property's income-generating potential to determine its value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Single-family homes" },
        { letter: "B", text: "Vacant land" },
        { letter: "C", text: "Investment properties that generate rental income" },
        { letter: "D", text: "New construction" }
      ]
    },
    {
      text: "What is the cost approach to value in appraisal?",
      answer: "Estimating the cost to rebuild the structure from scratch, plus land value, minus depreciation",
      explanation: "The cost approach estimates a property's value by calculating the cost to construct a new building of similar utility, plus the land value, minus depreciation. This approach is particularly useful for new construction, special-use properties, and properties with few comparable sales.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Analyzing the property's income potential" },
        { letter: "B", text: "Estimating the cost to rebuild the structure from scratch, plus land value, minus depreciation" },
        { letter: "C", text: "Comparing the property to similar recently sold properties" },
        { letter: "D", text: "Determining the cost basis for tax purposes" }
      ]
    },
    {
      text: "What is the gross rent multiplier (GRM) in real estate appraisal?",
      answer: "The ratio of a property's price to its gross rental income",
      explanation: "The gross rent multiplier (GRM) is a simple method used to estimate a property's value based on its rental income. It's calculated by dividing the property's price or value by its annual or monthly gross rental income. Investors use GRM for quick property value comparisons.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The ratio of a property's price to its gross rental income" },
        { letter: "B", text: "The number of years it takes to pay off a mortgage" },
        { letter: "C", text: "The percentage increase in rental rates annually" },
        { letter: "D", text: "The total number of rental units in a building" }
      ]
    },
    {
      text: "What is highest and best use in real estate appraisal?",
      answer: "The reasonable, legal use of vacant land or an improved property that results in the highest value",
      explanation: "Highest and best use is the reasonable, legally permissible, physically possible, financially feasible, and maximally productive use of a property that results in the highest value. Appraisers consider this concept when determining a property's market value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The current use of the property regardless of zoning" },
        { letter: "B", text: "The reasonable, legal use of vacant land or an improved property that results in the highest value" },
        { letter: "C", text: "The most expensive structure that could be built on the land" },
        { letter: "D", text: "The use that would generate the most tax revenue" }
      ]
    },
    {
      text: "What does the term 'functional obsolescence' mean in property appraisal?",
      answer: "A loss in value due to outdated features or poor design relative to market expectations",
      explanation: "Functional obsolescence is a reduction in a property's value due to outdated features, poor design, or functional inadequacies compared to current market expectations and standards. Examples include outdated floor plans, insufficient bathrooms, or inadequate electrical systems.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A loss in value due to outdated features or poor design relative to market expectations" },
        { letter: "B", text: "Physical deterioration of the structure" },
        { letter: "C", text: "Decrease in value due to external factors outside the property" },
        { letter: "D", text: "The normal aging process of a building" }
      ]
    },
    {
      text: "What type of value does an appraisal for mortgage lending purposes typically seek to determine?",
      answer: "Market value",
      explanation: "Appraisals for mortgage lending purposes typically seek to determine the market value of a property - the most probable price a property would sell for in a competitive, open market under normal conditions. This helps lenders ensure the property is adequate security for the loan amount.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Replacement value" },
        { letter: "B", text: "Insurable value" },
        { letter: "C", text: "Market value" },
        { letter: "D", text: "Assessed value" }
      ]
    },
    {
      text: "What is a 'comparable sale adjustment' in the sales comparison approach?",
      answer: "A dollar amount added or subtracted to account for differences between the subject property and comparable properties",
      explanation: "In the sales comparison approach, comparable sale adjustments are dollar amounts added or subtracted from the sale prices of comparable properties to account for differences between them and the subject property. Adjustments might be made for location, size, condition, features, or sale date.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A dollar amount added or subtracted to account for differences between the subject property and comparable properties" },
        { letter: "B", text: "The commission paid to the real estate agent" },
        { letter: "C", text: "The discount given by the seller to close the deal" },
        { letter: "D", text: "An adjustment to the property tax assessment" }
      ]
    },
  ];

  // Federal Regulations category questions
  const federalRegulationsQuestions: Question[] = [
    {
      text: "What federal law prohibits discrimination in housing based on race, color, religion, sex, national origin, familial status, and disability?",
      answer: "Fair Housing Act",
      explanation: "The Fair Housing Act, initially passed in 1968 and amended in 1988, prohibits discrimination in the sale, rental, or financing of housing based on race, color, religion, sex, national origin, familial status, and disability. It is enforced by the Department of Housing and Urban Development (HUD).",
      categoryName: "Federal Regulations",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Truth in Lending Act" },
        { letter: "B", text: "Americans with Disabilities Act" },
        { letter: "C", text: "Fair Housing Act" },
        { letter: "D", text: "Equal Credit Opportunity Act" }
      ]
    },
    {
      text: "What is the purpose of the Real Estate Settlement Procedures Act (RESPA)?",
      answer: "To provide homebuyers and sellers with disclosure of settlement costs and eliminate kickbacks and referral fees",
      explanation: "RESPA was enacted to provide homebuyers and sellers with complete disclosure of settlement costs, eliminate kickbacks and referral fees that increase costs, and prohibit practices like loan steering. It requires lenders to provide a Loan Estimate and Closing Disclosure to borrowers.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To provide homebuyers and sellers with disclosure of settlement costs and eliminate kickbacks and referral fees" },
        { letter: "B", text: "To establish minimum property standards for FHA loans" },
        { letter: "C", text: "To regulate interest rates on mortgage loans" },
        { letter: "D", text: "To establish licensing requirements for real estate agents" }
      ]
    },
    {
      text: "Under the Americans with Disabilities Act (ADA), what is considered a 'reasonable accommodation' for a tenant with a disability?",
      answer: "A change in rules, policies, or services that allows a person with a disability equal opportunity to use and enjoy a dwelling",
      explanation: "A reasonable accommodation is a change in rules, policies, practices, or services that allows a person with a disability equal opportunity to use and enjoy a dwelling. Examples include allowing service animals in a no-pets building or providing a reserved parking space close to the unit.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A change in rules, policies, or services that allows a person with a disability equal opportunity to use and enjoy a dwelling" },
        { letter: "B", text: "Making all units in a building fully wheelchair accessible" },
        { letter: "C", text: "Giving preferential rent to persons with disabilities" },
        { letter: "D", text: "Installing elevators in all multifamily buildings" }
      ]
    },
    {
      text: "What does the Truth in Lending Act (TILA) require lenders to disclose to borrowers?",
      answer: "The terms and costs of the loan, including the APR and finance charges",
      explanation: "The Truth in Lending Act (TILA) requires lenders to provide borrowers with clear disclosure of key terms and costs of the loan, including the annual percentage rate (APR), finance charges, amount financed, total payments, and payment schedule. This helps consumers compare loan offers.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only the interest rate of the loan" },
        { letter: "B", text: "The terms and costs of the loan, including the APR and finance charges" },
        { letter: "C", text: "The lender's profit margin on the loan" },
        { letter: "D", text: "The credit score needed to qualify for the loan" }
      ]
    },
    {
      text: "What federal law requires the disclosure of known lead-based paint hazards in housing built before 1978?",
      answer: "Residential Lead-Based Paint Hazard Reduction Act",
      explanation: "The Residential Lead-Based Paint Hazard Reduction Act (also known as Title X) requires the disclosure of known lead-based paint and lead-based paint hazards in housing built before 1978 before sale or lease. Sellers and landlords must provide specific information and forms to buyers and renters.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Environmental Protection Act" },
        { letter: "B", text: "Consumer Protection Act" },
        { letter: "C", text: "Residential Lead-Based Paint Hazard Reduction Act" },
        { letter: "D", text: "Housing and Urban Development Act" }
      ]
    },
    {
      text: "What federal law regulates the collection, dissemination, and use of consumer credit information?",
      answer: "Fair Credit Reporting Act (FCRA)",
      explanation: "The Fair Credit Reporting Act (FCRA) regulates how consumer credit information is collected, disseminated, and used. It promotes accuracy, fairness, and privacy of information in consumer credit reports and gives consumers the right to access their credit reports and dispute inaccurate information.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Equal Credit Opportunity Act" },
        { letter: "B", text: "Truth in Lending Act" },
        { letter: "C", text: "Fair Credit Reporting Act (FCRA)" },
        { letter: "D", text: "Consumer Credit Protection Act" }
      ]
    },
    {
      text: "Under the Foreign Investment in Real Property Tax Act (FIRPTA), what is generally required when a foreign person sells U.S. real estate?",
      answer: "The buyer must withhold 15% of the sales price and remit it to the IRS",
      explanation: "Under FIRPTA, when a foreign person sells U.S. real property, the buyer generally must withhold 15% of the sales price and remit it to the IRS. This withholding serves as an advance payment against any tax the foreign seller may owe on the gain from the sale.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The buyer must withhold 15% of the sales price and remit it to the IRS" },
        { letter: "B", text: "The foreign seller must obtain special permission to sell" },
        { letter: "C", text: "The transaction must be approved by the State Department" },
        { letter: "D", text: "The property must be listed for sale for at least 60 days" }
      ]
    },
    {
      text: "What is redlining in the context of fair housing?",
      answer: "The illegal practice of refusing to provide loans or services in certain neighborhoods based on racial or ethnic composition",
      explanation: "Redlining is the illegal discriminatory practice where financial institutions refuse or limit loans, mortgages, insurance, or other financial services in specific geographic areas, typically based on the racial or ethnic composition of those neighborhoods rather than economic qualifications of the applicants.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Marking properties that have failed inspection" },
        { letter: "B", text: "The illegal practice of refusing to provide loans or services in certain neighborhoods based on racial or ethnic composition" },
        { letter: "C", text: "Highlighting properties in high-demand areas" },
        { letter: "D", text: "Requiring higher credit scores for certain property types" }
      ]
    },
    {
      text: "What is the primary purpose of the Equal Credit Opportunity Act (ECOA)?",
      answer: "To prohibit discrimination in lending based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance",
      explanation: "The Equal Credit Opportunity Act (ECOA) prohibits creditors from discriminating against credit applicants based on race, color, religion, national origin, sex, marital status, age, or because the applicant receives public assistance. It ensures fair and equal access to credit for all qualified applicants.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To establish minimum credit score requirements" },
        { letter: "B", text: "To regulate interest rates on loans" },
        { letter: "C", text: "To prohibit discrimination in lending based on race, color, religion, national origin, sex, marital status, age, or receipt of public assistance" },
        { letter: "D", text: "To provide government-backed loans to low-income borrowers" }
      ]
    },
    {
      text: "Which federal agency primarily enforces the Fair Housing Act?",
      answer: "Department of Housing and Urban Development (HUD)",
      explanation: "The Department of Housing and Urban Development (HUD) is the primary federal agency responsible for enforcing the Fair Housing Act. HUD investigates fair housing complaints, conducts compliance reviews, and can initiate enforcement actions against those who violate the law.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Federal Housing Administration (FHA)" },
        { letter: "B", text: "Department of Housing and Urban Development (HUD)" },
        { letter: "C", text: "Consumer Financial Protection Bureau (CFPB)" },
        { letter: "D", text: "Federal Trade Commission (FTC)" }
      ]
    },
  ];

  // Practice category questions
  const practiceQuestions: Question[] = [
    {
      text: "What is a CMA (Comparative Market Analysis) in real estate?",
      answer: "An analysis of comparable properties to help determine a property's market value",
      explanation: "A Comparative Market Analysis (CMA) is a report prepared by real estate agents that analyzes similar, recently sold properties (comparables) to help establish a competitive listing price or offer price for a subject property. It's similar to an appraisal but less formal and typically free.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A formal property appraisal required by lenders" },
        { letter: "B", text: "An analysis of comparable properties to help determine a property's market value" },
        { letter: "C", text: "A marketing plan for selling a property" },
        { letter: "D", text: "A certificate of property condition" }
      ]
    },
    {
      text: "What is an MLS (Multiple Listing Service) in real estate?",
      answer: "A database of property listings shared by real estate brokers",
      explanation: "A Multiple Listing Service (MLS) is a private database established by cooperating real estate brokers to share information about properties for sale. It allows brokers to see each other's listings and offer compensation to the broker who brings the buyer, facilitating cooperation between competitors.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A database of property listings shared by real estate brokers" },
        { letter: "B", text: "A type of exclusive listing agreement" },
        { letter: "C", text: "A government agency that regulates real estate sales" },
        { letter: "D", text: "A marketing strategy for luxury properties" }
      ]
    },
    {
      text: "What is 'staging' in real estate sales?",
      answer: "Preparing a property to make it more appealing to potential buyers",
      explanation: "Staging involves preparing and decorating a property to showcase its best features and make it more appealing to potential buyers. This may include decluttering, rearranging furniture, adding decor items, and making minor improvements to help buyers envision themselves living in the space.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Setting up an open house schedule" },
        { letter: "B", text: "Preparing a property to make it more appealing to potential buyers" },
        { letter: "C", text: "Creating a marketing plan in stages" },
        { letter: "D", text: "Building a temporary stage for property presentations" }
      ]
    },
    {
      text: "What is the purpose of a lockbox in real estate practice?",
      answer: "To securely store the key to a property, allowing authorized agents access for showings",
      explanation: "A lockbox is a secure device attached to a property that contains the key to the home. It allows authorized real estate agents to access the property for showings when the seller or listing agent isn't present. Electronic lockboxes track who accesses the property and when.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To securely store the key to a property, allowing authorized agents access for showings" },
        { letter: "B", text: "To store important documents related to the property" },
        { letter: "C", text: "To hold earnest money deposits" },
        { letter: "D", text: "To secure a property's back entrance" }
      ]
    },
    {
      text: "What is a 'net listing' in real estate?",
      answer: "A type of listing where the broker's commission is the amount above a specified net amount to the seller",
      explanation: "A net listing is an arrangement where the broker's commission is the difference between the actual selling price and a net amount the seller agrees to receive. For example, if the seller wants $200,000 net and the property sells for $215,000, the broker's commission would be $15,000. Net listings are prohibited in many states due to potential for abuse.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A listing that can only be viewed online" },
        { letter: "B", text: "A listing where no commission is paid" },
        { letter: "C", text: "A type of listing where the broker's commission is the amount above a specified net amount to the seller" },
        { letter: "D", text: "A listing that is only shown to buyers with pre-approved financing" }
      ]
    },
    {
      text: "What is the purpose of a property disclosure statement?",
      answer: "To inform potential buyers about known material defects and issues with the property",
      explanation: "A property disclosure statement is a document where sellers reveal known material defects and issues with their property to potential buyers. This promotes transparency in the transaction and helps protect sellers from future claims that they concealed problems with the property.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To inform potential buyers about known material defects and issues with the property" },
        { letter: "B", text: "To provide detailed information about the neighborhood" },
        { letter: "C", text: "To set the listing price of the property" },
        { letter: "D", text: "To outline the terms of the agent's commission" }
      ]
    },
    {
      text: "What is 'procuring cause' in real estate?",
      answer: "The agent whose actions were the predominant reason for the buyer purchasing the property",
      explanation: "Procuring cause refers to the broker or agent whose actions were the predominant, uninterrupted cause that led to the buyer purchasing the property. It's often used to determine which agent is entitled to a commission when multiple agents work with the same buyer.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The agent whose actions were the predominant reason for the buyer purchasing the property" },
        { letter: "B", text: "The first agent to show a property to a buyer" },
        { letter: "C", text: "The agent who writes the purchase offer" },
        { letter: "D", text: "The agent who negotiates the best price" }
      ]
    },
    {
      text: "What is a 'for sale by owner' (FSBO) transaction?",
      answer: "When a property owner sells their property without using a real estate agent",
      explanation: "A 'for sale by owner' (FSBO) transaction occurs when property owners sell their homes without hiring a real estate agent to represent them. The owners handle all aspects of the sale themselves, including marketing, showing the property, negotiating, and paperwork, often to avoid paying commission.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "When a broker lists a property they own" },
        { letter: "B", text: "When a property owner sells their property without using a real estate agent" },
        { letter: "C", text: "When a property is sold through an auction" },
        { letter: "D", text: "When a property is sold directly to an investor" }
      ]
    },
    {
      text: "What is a real estate broker's 'fiduciary responsibility'?",
      answer: "The legal obligation to act in the best interest of their client with loyalty, confidentiality, and care",
      explanation: "A real estate broker's fiduciary responsibility is their legal and ethical obligation to act in their client's best interest. This includes duties of loyalty, confidentiality, disclosure, obedience, reasonable care and diligence, and accounting for all funds. These duties place the client's interests above all others, including the broker's own.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The requirement to have errors and omissions insurance" },
        { letter: "B", text: "The legal obligation to act in the best interest of their client with loyalty, confidentiality, and care" },
        { letter: "C", text: "The responsibility to supervise all agents working under them" },
        { letter: "D", text: "The duty to always get the highest price for a seller" }
      ]
    },
    {
      text: "What is a 'buyer's market' in real estate?",
      answer: "A market condition where supply exceeds demand, giving buyers an advantage",
      explanation: "A buyer's market exists when there are more properties for sale than there are buyers, giving purchasers an advantage in negotiations. Characteristics include declining prices, homes staying on the market longer, and sellers offering concessions to attract buyers.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A market where only buyers with cash can purchase properties" },
        { letter: "B", text: "A market condition where supply exceeds demand, giving buyers an advantage" },
        { letter: "C", text: "A market where buyers must be represented by agents" },
        { letter: "D", text: "A market with strictly regulated purchase procedures" }
      ]
    },
  ];

  // Combine all questions into one array
  const combinedQuestions = [
    ...agencyQuestions,
    ...propertyOwnershipQuestions,
    ...utahLawQuestions,
    ...contractsQuestions,
    ...financeQuestions,
    ...appraisalQuestions,
    ...federalRegulationsQuestions,
    ...practiceQuestions
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  // Process each question
  for (const question of combinedQuestions) {
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
  
  console.log('\n=========== QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addUtahExamQuestions()
  .then(() => {
    console.log('Comprehensive Utah real estate exam questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding Utah exam questions:', error);
    process.exit(1);
  });