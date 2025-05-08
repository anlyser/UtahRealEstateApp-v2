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

async function addFinalAgencyQuestions() {
  console.log('Starting to add final agency questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define final agency questions
  const questions: Question[] = [
    {
      text: "What are the differences between a buyer's agent, seller's agent, and dual agent?",
      answer: "A buyer's agent represents the buyer's interests, a seller's agent represents the seller's interests, and a dual agent represents both parties with limitations",
      explanation: "A buyer's agent owes fiduciary duties exclusively to the buyer and works to secure the best terms for them. A seller's agent (listing agent) owes fiduciary duties exclusively to the seller and works to secure the best terms and highest price for them. A dual agent represents both buyer and seller in the same transaction, which creates an inherent conflict of interest as the agent cannot fully advocate for either party. Dual agents must maintain neutrality and confidentiality for both parties, with limitations on the advice they can provide.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A buyer's agent represents the buyer's interests, a seller's agent represents the seller's interests, and a dual agent represents both parties with limitations" },
        { letter: "B", text: "The terms refer to the same role but in different states" },
        { letter: "C", text: "They represent different levels of licensing, with dual agent being the highest level" },
        { letter: "D", text: "A buyer's agent works for buyers, a seller's agent works for title companies, and a dual agent works for mortgage companies" }
      ]
    },
    {
      text: "What is the purpose of an agency disclosure form?",
      answer: "To inform consumers about the types of agency relationships available and which type is being established in their transaction",
      explanation: "An agency disclosure form serves to inform consumers about the types of agency relationships available (buyer's agency, seller's agency, dual agency, etc.) and which type is being established in their transaction. It explains each party's rights and responsibilities, helping consumers make informed decisions about representation. In most states, agents are required by law to provide this disclosure at first substantive contact with a client or customer. The disclosure is not an agency agreement itself, but rather an educational document describing possible relationships.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To establish a commission rate between the broker and agent" },
        { letter: "B", text: "To inform consumers about the types of agency relationships available and which type is being established in their transaction" },
        { letter: "C", text: "To disclose the agent's licensing status" },
        { letter: "D", text: "To inform the seller about the buyer's financial qualifications" }
      ]
    },
    {
      text: "What is 'subagency' in real estate?",
      answer: "When one broker cooperates with another broker to represent the same principal",
      explanation: "Subagency occurs when one broker (usually the listing broker) allows another broker to act as an extension of their agency relationship with the principal (usually the seller). The subagent owes the same fiduciary duties to the principal as the original agent. Once common, subagency has fallen out of favor because it created confusion about representation, as agents working with buyers were legally the seller's subagents and owed their loyalty to the seller, not the buyer. Today, buyer agency and designated agency have largely replaced subagency in residential transactions.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When one broker cooperates with another broker to represent the same principal" },
        { letter: "B", text: "When an agent works under a broker's supervision" },
        { letter: "C", text: "When an agent represents a client in a secondary market" },
        { letter: "D", text: "A lesser form of agency with fewer responsibilities" }
      ]
    },
    {
      text: "What is 'latent defect disclosure' as it relates to real estate agency?",
      answer: "The agent's obligation to disclose known hidden property defects that wouldn't be discovered during a reasonable inspection",
      explanation: "Latent defect disclosure refers to the agent's legal and ethical obligation to disclose known hidden property defects that wouldn't be discovered during a reasonable inspection. Unlike patent (obvious) defects, latent defects aren't visible or readily discoverable—examples include foundation issues, past flooding, mold behind walls, or unpermitted work. Failing to disclose known latent defects can result in legal liability for both the seller and agent, including claims for fraud, misrepresentation, or breach of fiduciary duty.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The agent's obligation to disclose known hidden property defects that wouldn't be discovered during a reasonable inspection" },
        { letter: "B", text: "A form that protects agents from liability for defects discovered after closing" },
        { letter: "C", text: "Disclosure of defects that emerge later (latent) in the transaction" },
        { letter: "D", text: "A disclosure made by home inspectors about potential future problems" }
      ]
    },
    {
      text: "What is a 'single agency' in real estate?",
      answer: "When an agent or brokerage represents only one party in a transaction (either buyer or seller, but not both)",
      explanation: "Single agency occurs when an agent or brokerage represents only one party in a transaction—either the buyer or the seller, but not both. This traditional form of representation allows the agent to be a fiduciary advocate solely for their client's interests without conflicts of interest. The agent can provide unrestricted advice on pricing, negotiating strategies, and other confidential matters without concern about divided loyalties. Single agency offers the clearest alignment of interests between agent and client.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When only one agent is involved in the entire transaction" },
        { letter: "B", text: "When an agent or brokerage represents only one party in a transaction (either buyer or seller, but not both)" },
        { letter: "C", text: "When a broker has only one agent working for them" },
        { letter: "D", text: "When an agent is single and not married" }
      ]
    },
    {
      text: "What is 'negligent misrepresentation' in real estate agency?",
      answer: "When an agent makes a false statement believing it to be true, but without reasonable grounds for that belief",
      explanation: "Negligent misrepresentation occurs when an agent makes a false statement believing it to be true, but without reasonable grounds for that belief. Unlike fraudulent misrepresentation, negligent misrepresentation doesn't require intent to deceive—only a failure to exercise reasonable professional care in verifying information. For example, if an agent tells a buyer a property is zoned commercial without checking, relying on the seller's word, that could constitute negligent misrepresentation. Agents have a professional duty to verify material information they communicate to clients.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When an agent deliberately deceives a client" },
        { letter: "B", text: "When an agent makes a false statement believing it to be true, but without reasonable grounds for that belief" },
        { letter: "C", text: "When an agent fails to show a property to a qualified buyer" },
        { letter: "D", text: "When an agent accidentally misplaces client documents" }
      ]
    },
    {
      text: "What is 'undisclosed dual agency' in real estate?",
      answer: "When an agent represents both the buyer and seller in a transaction without informing both parties and obtaining their consent",
      explanation: "Undisclosed dual agency occurs when an agent represents both the buyer and seller in a transaction without informing both parties and obtaining their informed consent. This practice is illegal in all states and constitutes a serious breach of fiduciary duty. It creates an inherent conflict of interest, as the agent cannot fully advocate for both parties' opposing interests. Undisclosed dual agency can result in rescission of the transaction, commission forfeiture, damages, license suspension or revocation, and even criminal penalties in some jurisdictions.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When an agent represents both the buyer and seller in a transaction without informing both parties and obtaining their consent" },
        { letter: "B", text: "A type of agency disclosed only to the broker, not to clients" },
        { letter: "C", text: "When an agent represents two buyers competing for the same property" },
        { letter: "D", text: "A legal form of dual agency that doesn't require written consent" }
      ]
    },
    {
      text: "What is 'customer service' versus 'client service' in real estate agency?",
      answer: "Customers receive limited services without fiduciary duties, while clients receive full representation with fiduciary duties",
      explanation: "In real estate agency, customers receive limited services without fiduciary duties, while clients receive full representation with fiduciary duties. A customer relationship involves honesty, disclosure of material facts, and basic assistance, but the agent doesn't advocate for the customer's best interests or keep their confidential information private. A client relationship involves loyalty, confidentiality, disclosure, obedience, reasonable care, and accounting—the full fiduciary duties. The distinction is crucial as it determines the agent's legal obligations and potential liability.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Customers receive services for free, while clients pay for services" },
        { letter: "B", text: "Customers receive limited services without fiduciary duties, while clients receive full representation with fiduciary duties" },
        { letter: "C", text: "The terms are interchangeable in real estate" },
        { letter: "D", text: "Customers are first-time homebuyers, while clients are experienced buyers" }
      ]
    },
    {
      text: "What is 'termination of agency' in real estate?",
      answer: "The ending of the agency relationship between principal and agent",
      explanation: "Termination of agency is the ending of the agency relationship between principal and agent. Agency can terminate through: 1) Completion of the task (property is sold or purchased), 2) Expiration of the agreement term, 3) Mutual agreement to terminate, 4) Unilateral termination by either party (subject to potential damages), 5) Death or incapacity of either party, 6) Destruction of the property, 7) Bankruptcy of either party, or 8) Impossibility of performance. Upon termination, the agent's authority to act on behalf of the principal ends, although certain duties may continue.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The ending of the agency relationship between principal and agent" },
        { letter: "B", text: "When an agent is fired by their broker" },
        { letter: "C", text: "When an agent terminates a listing because the seller is difficult" },
        { letter: "D", text: "When an agent terminates their real estate license" }
      ]
    },
    {
      text: "What is a 'broker price opinion' (BPO) in real estate?",
      answer: "An estimate of property value provided by a real estate broker or agent",
      explanation: "A broker price opinion (BPO) is an estimate of property value provided by a real estate broker or agent based on their market knowledge, comparable sales analysis, and property inspection. Unlike a formal appraisal, a BPO doesn't typically include as detailed a property inspection or analysis and is often less expensive and faster to obtain. BPOs are commonly used by lenders for portfolio evaluations, short sales, or other situations requiring value estimates without formal appraisals. State laws vary regarding who can perform BPOs and for what purposes.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A broker's commission on a sale" },
        { letter: "B", text: "An estimate of property value provided by a real estate broker or agent" },
        { letter: "C", text: "The price a broker charges for their services" },
        { letter: "D", text: "A broker's opinion about whether to accept an offer" }
      ]
    },
    {
      text: "What is 'respondeat superior' in real estate agency law?",
      answer: "The legal doctrine making brokers liable for the actions of their agents performed within the scope of their employment",
      explanation: "Respondeat superior (Latin for 'let the master answer') is the legal doctrine that makes brokers vicariously liable for the actions of their agents performed within the scope of their employment or agency relationship. Even if a broker had no knowledge of or participation in an agent's misconduct, the broker can still be held legally responsible. This doctrine is why brokers must supervise their agents' activities, provide proper training, and implement risk management procedures. It's also why brokers typically require agents to carry errors and omissions insurance.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The requirement that agents must respond to all inquiries from superiors" },
        { letter: "B", text: "The legal doctrine making brokers liable for the actions of their agents performed within the scope of their employment" },
        { letter: "C", text: "A rule requiring brokers to respond to all agent questions" },
        { letter: "D", text: "The hierarchy of responsibility in a real estate office" }
      ]
    },
    {
      text: "What is a 'broker's lien' in real estate?",
      answer: "A legal claim against property for unpaid commission",
      explanation: "A broker's lien is a legal claim against property for unpaid commission. In states with broker lien laws, brokers who aren't paid their earned commission can file a lien against the property to secure payment. The specifics vary by state, but typically brokers must have a written commission agreement, provide notice before filing, and file within a specified time period. This remedy was created because without lien rights, brokers' only recourse was to sue for breach of contract, which could be time-consuming and difficult to collect even with a favorable judgment.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A legal claim against property for unpaid commission" },
        { letter: "B", text: "A broker's right to withhold property keys until closing" },
        { letter: "C", text: "A lean or slender broker" },
        { letter: "D", text: "A lien placed by a broker against an agent's commission" }
      ]
    },
    {
      text: "What is a 'buyer brokerage agreement'?",
      answer: "A contract establishing an agency relationship between a buyer and a broker",
      explanation: "A buyer brokerage agreement is a contract establishing an agency relationship between a buyer and a broker, outlining the terms under which the broker will represent the buyer in purchasing property. The agreement typically specifies: 1) Whether representation is exclusive or non-exclusive, 2) Duration of the agreement, 3) Broker's duties and services, 4) Compensation structure, 5) Property specifications the buyer seeks, and 6) Termination provisions. Unlike seller agency, which has traditionally been formalized in writing, buyer agency agreements became common only in recent decades as buyer representation gained recognition.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract establishing an agency relationship between a buyer and a broker" },
        { letter: "B", text: "An agreement between competing buyers for the same property" },
        { letter: "C", text: "A contract between two brokers to represent a buyer together" },
        { letter: "D", text: "An agreement a buyer signs at closing" }
      ]
    },
    {
      text: "What is 'apparent agency' in real estate?",
      answer: "A situation where a person appears to be an agent based on the principal's actions, creating agency by estoppel",
      explanation: "Apparent agency (also called agency by estoppel) occurs when a person appears to be an agent based on the principal's actions or representations, leading third parties to reasonably believe an agency relationship exists. Even if no actual agency relationship was intended, the principal may be bound by the apparent agent's actions. For example, if a broker allows an unlicensed assistant to show properties and negotiate with customers while identifying them as an 'agent,' the broker may be liable for their actions through apparent agency.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An obviously visible 'For Sale' sign indicating agency" },
        { letter: "B", text: "A situation where a person appears to be an agent based on the principal's actions, creating agency by estoppel" },
        { letter: "C", text: "An agency relationship that only appears briefly at open houses" },
        { letter: "D", text: "When an agent is apparently working but actually on vacation" }
      ]
    },
    {
      text: "What is 'material fact' in real estate agency?",
      answer: "Information that might affect a client's decision-making process, which agents have a duty to disclose",
      explanation: "A material fact in real estate agency is information that might significantly affect a client's decision-making process, which agents have a duty to disclose. Material facts include property defects, environmental hazards, legal issues affecting the property, neighborhood conditions that substantially impact value, and anything else a reasonable person would want to know before making a decision. The failure to disclose material facts can result in legal liability for agents, including claims for misrepresentation, fraud, or breach of fiduciary duty.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Facts about what materials were used in construction" },
        { letter: "B", text: "Information that might affect a client's decision-making process, which agents have a duty to disclose" },
        { letter: "C", text: "Property features described in marketing materials" },
        { letter: "D", text: "Physical attributes of the property that can be seen during inspection" }
      ]
    },
    {
      text: "What is 'fiduciary duty' in real estate agency?",
      answer: "The highest standard of care owed by an agent to their principal",
      explanation: "Fiduciary duty is the highest standard of care owed by an agent to their principal, requiring the agent to act in the principal's best interest with loyalty and good faith. These duties typically include: 1) Loyalty - putting the principal's interests above all others, including the agent's own; 2) Confidentiality - protecting the principal's private information; 3) Disclosure - revealing all relevant information; 4) Obedience - following lawful instructions; 5) Reasonable care and diligence; and 6) Accounting - properly handling the principal's money and property.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The highest standard of care owed by an agent to their principal" },
        { letter: "B", text: "An optional level of service that agents can provide for an additional fee" },
        { letter: "C", text: "The responsibility to put a client's funds in a fiduciary account" },
        { letter: "D", text: "The duty to follow the Realtor® Code of Ethics" }
      ]
    },
    {
      text: "What is a 'breach of fiduciary duty' in real estate agency?",
      answer: "When an agent fails to fulfill their obligations of loyalty, confidentiality, disclosure, obedience, reasonable care, or accounting",
      explanation: "A breach of fiduciary duty occurs when a real estate agent fails to fulfill their obligations of loyalty, confidentiality, disclosure, obedience, reasonable care, or accounting owed to their principal. Examples include: Self-dealing or representing conflicting interests without disclosure and consent; Revealing confidential information; Failing to disclose material facts; Disregarding lawful instructions; Negligence in performing duties; or Mishandling client funds. Such breaches can result in commission forfeiture, damages, license discipline, and in severe cases, criminal charges.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a client breaks a contract with their agent" },
        { letter: "B", text: "When an agent fails to fulfill their obligations of loyalty, confidentiality, disclosure, obedience, reasonable care, or accounting" },
        { letter: "C", text: "When a fiduciary bank account has insufficient funds" },
        { letter: "D", text: "When an agent breaches a security system to access a property" }
      ]
    },
    {
      text: "What is the purpose of E&O (errors and omissions) insurance in real estate?",
      answer: "To protect real estate professionals from financial losses due to claims of negligence or inadequate work",
      explanation: "Errors and Omissions (E&O) insurance protects real estate professionals from financial losses due to claims of negligence, mistakes, or inadequate work. It covers legal defense costs and damages awarded in covered claims, such as failure to disclose property defects, negligent property value recommendations, missed deadlines, or unintentional violations of fair housing laws. Many brokerages require agents to carry E&O insurance, and some states mandate it for licensees. While it doesn't cover intentional wrongdoing or criminal acts, E&O insurance is essential risk management for real estate professionals.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To compensate clients when agents make errors in listings" },
        { letter: "B", text: "To protect real estate professionals from financial losses due to claims of negligence or inadequate work" },
        { letter: "C", text: "To insure brokerages against employee theft" },
        { letter: "D", text: "To provide health insurance for real estate agents" }
      ]
    },
    {
      text: "What is a 'designated agent' in real estate?",
      answer: "A specific agent appointed by a broker to represent either the buyer or seller exclusively when the brokerage represents both parties in a transaction",
      explanation: "A designated agent is a specific agent appointed by a broker to represent either the buyer or seller exclusively when the brokerage represents both parties in a transaction. This approach allows brokerages to handle both sides of a transaction without creating a dual agency situation at the individual agent level. The broker assigns different agents to each party, and confidential information is not shared between them. However, the broker still has a dual agency role overseeing both agents, which creates some potential for conflicts of interest despite the separation at the agent level.",
      categoryName: "Agency",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An agent who has received a special designation or certification" },
        { letter: "B", text: "A specific agent appointed by a broker to represent either the buyer or seller exclusively when the brokerage represents both parties in a transaction" },
        { letter: "C", text: "An agent designated to handle a specific type of property" },
        { letter: "D", text: "The designated successor to a broker if they retire" }
      ]
    },
    {
      text: "What is the difference between a 'real estate agent' and a 'real estate broker' in most states?",
      answer: "A broker has advanced education and experience, can work independently, and can oversee agents, while agents must work under a broker's supervision",
      explanation: "A real estate agent (or salesperson) is licensed to represent clients in real estate transactions but must work under a broker's supervision. A broker has additional education, experience, and has passed a more comprehensive exam. Brokers can work independently, own their brokerage, and supervise agents. They have greater legal responsibility, including responsibility for their agents' actions. In most states, becoming a broker requires 1-3 years of experience as an agent, additional education hours, and passing a broker's exam.",
      categoryName: "Agency",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The terms are interchangeable with no legal distinction" },
        { letter: "B", text: "A broker has advanced education and experience, can work independently, and can oversee agents, while agents must work under a broker's supervision" },
        { letter: "C", text: "Agents can only work with buyers, while brokers can work with sellers" },
        { letter: "D", text: "Brokers are limited to commercial properties, while agents handle residential properties" }
      ]
    },
    {
      text: "What does 'antitrust law' prohibit in real estate?",
      answer: "Price fixing, market allocation, group boycotts, and other anti-competitive behaviors",
      explanation: "Antitrust laws prohibit anti-competitive behaviors in real estate, including: 1) Price fixing - brokers agreeing on commission rates rather than competing (e.g., 'standard' rates); 2) Market allocation - dividing territories or customers among competitors; 3) Group boycotts - collectively refusing to do business with specific individuals or companies; and 4) Tie-in arrangements - forcing purchase of one service to get another. Violations can result in severe penalties including triple damages, criminal prosecution, fines, and imprisonment. Even casual conversations about 'standard' commissions can create antitrust liability.",
      categoryName: "Agency",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Price fixing, market allocation, group boycotts, and other anti-competitive behaviors" },
        { letter: "B", text: "Building homes that don't meet trust standards" },
        { letter: "C", text: "Selling property without trusting the buyer" },
        { letter: "D", text: "Acting against the interests of a trust that owns property" }
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
  
  console.log('\n=========== FINAL AGENCY QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalAgencyQuestions()
  .then(() => {
    console.log('Final agency questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final agency questions:', error);
    process.exit(1);
  });