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

async function addFinalContractQuestions() {
  console.log('Starting to add final contract questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define final contract questions
  const questions: Question[] = [
    {
      text: "What is a 'force majeure' clause in a contract?",
      answer: "A provision that excuses performance when certain unforeseeable circumstances beyond the parties' control make performance impossible",
      explanation: "A force majeure clause excuses contract performance when certain unforeseeable circumstances beyond the parties' control make performance impossible or impracticable. Common force majeure events include natural disasters, wars, government actions, strikes, and epidemics. These clauses allocate risk between parties when extreme events occur and typically specify what events qualify, notification requirements, and consequences (contract termination, suspension, or extension). Courts generally interpret these clauses narrowly, requiring the event to be truly unforeseeable and beyond reasonable control.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A clause requiring all parties to use maximum effort to fulfill the contract" },
        { letter: "B", text: "A provision that excuses performance when certain unforeseeable circumstances beyond the parties' control make performance impossible" },
        { letter: "C", text: "A clause giving the stronger party more control in the transaction" },
        { letter: "D", text: "A provision forcing mandatory arbitration for disputes" }
      ]
    },
    {
      text: "What is 'mutual assent' in contract formation?",
      answer: "Agreement by all parties to the same terms, typically manifested through offer and acceptance",
      explanation: "Mutual assent, also called 'meeting of the minds,' is a fundamental requirement for contract formation where all parties agree to the same terms. It's typically manifested through the process of offer and acceptance. The offering party proposes specific terms, and the accepting party agrees to those exact terms without modification. If the accepting party changes any terms, it constitutes a counteroffer rather than acceptance. Mutual assent focuses on objective manifestations of intent rather than subjective, unexpressed intentions.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Agreement by all parties to the same terms, typically manifested through offer and acceptance" },
        { letter: "B", text: "A provision for resolving disputes through a neutral third party" },
        { letter: "C", text: "The mutual exchange of driver's licenses during contract signing" },
        { letter: "D", text: "A guarantee that both parties will benefit equally from the contract" }
      ]
    },
    {
      text: "What is a 'statute of frauds' in relation to real estate contracts?",
      answer: "A legal requirement that certain contracts, including those for real estate, must be in writing to be enforceable",
      explanation: "The statute of frauds is a legal requirement that certain contracts, including those for interests in real estate, must be in writing to be enforceable in court. This requirement exists in all states and typically applies to real estate purchase agreements, long-term leases (usually over one year), and easements. The writing must generally identify the parties, describe the property, state essential terms like price, and be signed by the party against whom enforcement is sought (typically the seller).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A law prescribing penalties for fraudulent real estate transactions" },
        { letter: "B", text: "A legal requirement that certain contracts, including those for real estate, must be in writing to be enforceable" },
        { letter: "C", text: "A clause protecting against misrepresentation in contracts" },
        { letter: "D", text: "A law requiring real estate agents to verify the identity of all parties" }
      ]
    },
    {
      text: "What is an 'option contract' in real estate?",
      answer: "An agreement giving the option holder the right, but not the obligation, to purchase property at specified terms within a set timeframe",
      explanation: "An option contract in real estate gives the option holder the right, but not the obligation, to purchase property at specified terms within a set timeframe. The property owner (optionor) is obligated to sell if the option is exercised but cannot sell to anyone else during the option period. The option holder (optionee) typically pays an option fee for this right, which is usually non-refundable but may be applied to the purchase price if the option is exercised.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract with optional provisions that can be accepted or rejected" },
        { letter: "B", text: "An agreement giving the option holder the right, but not the obligation, to purchase property at specified terms within a set timeframe" },
        { letter: "C", text: "A contract that gives buyers the option to back out for any reason" },
        { letter: "D", text: "A financing option offered by sellers" }
      ]
    },
    {
      text: "What is a 'right of first refusal' in real estate contracts?",
      answer: "A contractual right giving a party the option to purchase property before it can be sold to a third party",
      explanation: "A right of first refusal is a contractual right giving a party (often a tenant, neighbor, or business partner) the opportunity to purchase property before it can be sold to a third party. If the owner decides to sell, they must first offer the property to the holder of the right on the same terms they would accept from another buyer. Unlike an option, the right is only triggered when the owner decides to sell. This right is often included in leases, business agreements, or separate contracts between neighboring property owners.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The right to refuse any contract terms you disagree with" },
        { letter: "B", text: "A contractual right giving a party the option to purchase property before it can be sold to a third party" },
        { letter: "C", text: "The first opportunity to refuse an offer before it goes to another buyer" },
        { letter: "D", text: "The right to be the first to make an offer on a property" }
      ]
    },
    {
      text: "What is 'specific performance' as a remedy for breach of contract?",
      answer: "A court order requiring the breaching party to fulfill their contractual obligations exactly as promised",
      explanation: "Specific performance is an equitable remedy where a court orders the breaching party to fulfill their contractual obligations exactly as promised, rather than paying monetary damages. In real estate, it's a common remedy because each parcel of land is considered unique, making monetary damages potentially inadequate. Courts typically grant specific performance for real estate contracts when: 1) The contract is valid and enforceable, 2) The terms are clear and definite, 3) Monetary damages would be inadequate, and 4) The court can effectively supervise the performance.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A court order requiring the breaching party to fulfill their contractual obligations exactly as promised" },
        { letter: "B", text: "A financial penalty for breach of contract" },
        { letter: "C", text: "A performance checklist that specifies each party's obligations" },
        { letter: "D", text: "A specialized performance bond for real estate transactions" }
      ]
    },
    {
      text: "What makes a contract 'unconscionable'?",
      answer: "It is so unfair and one-sided that it shocks the conscience, often involving unequal bargaining power",
      explanation: "An unconscionable contract is one that is so unfair and one-sided that it 'shocks the conscience,' typically involving grossly unequal bargaining power and terms that unreasonably favor the stronger party. Courts analyze both procedural unconscionability (unfairness in the formation process, like high-pressure tactics or hidden terms) and substantive unconscionability (unfairness in the actual terms). If a court finds a contract unconscionable, it may refuse to enforce it entirely or strike only the unconscionable provisions.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "It contains provisions that are illegal" },
        { letter: "B", text: "It is so unfair and one-sided that it shocks the conscience, often involving unequal bargaining power" },
        { letter: "C", text: "The parties were not aware they were entering into a contract" },
        { letter: "D", text: "It was signed while one party was unconscious" }
      ]
    },
    {
      text: "What is the 'parol evidence rule' in contract law?",
      answer: "A rule that prevents parties from introducing external evidence to contradict or modify the terms of a complete and integrated written contract",
      explanation: "The parol evidence rule prevents parties from introducing external evidence (like prior discussions or agreements) to contradict or modify the terms of a complete, integrated written contract. The rule assumes that parties include all important terms in their final written agreement. However, it doesn't prevent evidence that: 1) Explains ambiguous terms, 2) Shows the contract is invalid due to fraud, mistake, or duress, 3) Proves a condition precedent to the contract's effectiveness, or 4) Demonstrates a later modification after the contract was signed.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A rule that prevents parties from introducing external evidence to contradict or modify the terms of a complete and integrated written contract" },
        { letter: "B", text: "A rule requiring all evidence to be submitted under oath" },
        { letter: "C", text: "A requirement that oral contracts must be verified by witnesses" },
        { letter: "D", text: "A rule against hearsay evidence in contract disputes" }
      ]
    },
    {
      text: "What constitutes a 'material breach' of contract?",
      answer: "A substantial failure to perform that defeats the essential purpose of the contract",
      explanation: "A material breach is a substantial failure to perform that defeats the essential purpose of the contract and justifies the non-breaching party in terminating the agreement and pursuing remedies. Factors courts consider in determining materiality include: 1) The extent the injured party is deprived of an expected benefit, 2) Whether the injured party can be adequately compensated, 3) The extent the breaching party will suffer forfeiture, 4) The likelihood the breaching party will cure the failure, and 5) The breaching party's good faith and fair dealing.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Any deviation from the contract terms, no matter how minor" },
        { letter: "B", text: "A substantial failure to perform that defeats the essential purpose of the contract" },
        { letter: "C", text: "A breach involving building materials" },
        { letter: "D", text: "Failure to provide proper documentation during the transaction" }
      ]
    },
    {
      text: "What is a 'condition precedent' in a real estate contract?",
      answer: "An event that must occur before a party is obligated to perform their contractual duties",
      explanation: "A condition precedent is an event that must occur before a party is obligated to perform their contractual duties. In real estate contracts, common conditions precedent include: 1) The buyer obtaining financing, 2) A satisfactory property inspection, 3) The property appraising at or above the purchase price, 4) The seller providing clear title, or 5) The buyer selling their current home. If the condition isn't satisfied, the party protected by the condition is typically relieved of their performance obligation without breaching the contract.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An event that must occur before a party is obligated to perform their contractual duties" },
        { letter: "B", text: "A precedent set by previous real estate contracts in the area" },
        { letter: "C", text: "A condition that takes precedence over other conditions" },
        { letter: "D", text: "A warning statement that precedes the main contract terms" }
      ]
    },
    {
      text: "What is a 'counter offer' in contract law?",
      answer: "A response to an offer that proposes different terms, rejecting the original offer and creating a new one",
      explanation: "A counter offer is a response to an offer that proposes different terms, effectively rejecting the original offer and creating a new one. When a party receives an offer and changes any term (price, closing date, property inclusions, contingencies, etc.), they've made a counter offer rather than an acceptance. The original offeror is no longer bound by their offer and can accept, reject, or counter the new offer. This process continues until parties reach agreement on all terms or negotiations end without agreement.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A competing offer from another party" },
        { letter: "B", text: "A response to an offer that proposes different terms, rejecting the original offer and creating a new one" },
        { letter: "C", text: "An offer that counts as the final one in a negotiation" },
        { letter: "D", text: "An offer made at a customer service counter" }
      ]
    },
    {
      text: "What does 'integration' mean in relation to written contracts?",
      answer: "The concept that a written contract contains the final and complete agreement between the parties",
      explanation: "Integration refers to the concept that a written contract contains the final and complete agreement between the parties, superseding all prior negotiations, understandings, or agreements. A fully integrated contract is intended to be the complete expression of the parties' agreement, while a partially integrated contract is intended to be final but not complete. Integration is important for applying the parol evidence rule, which limits the admissibility of evidence outside the written contract to interpret or supplement its terms.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The process of combining multiple contracts into one" },
        { letter: "B", text: "The concept that a written contract contains the final and complete agreement between the parties" },
        { letter: "C", text: "The inclusion of integration clauses that define how the contract integrates with laws" },
        { letter: "D", text: "The process of integrating a contract into public records" }
      ]
    },
    {
      text: "What is 'anticipatory repudiation' (or anticipatory breach) in contract law?",
      answer: "When a party clearly indicates they will not perform their contractual obligations before performance is due",
      explanation: "Anticipatory repudiation (or anticipatory breach) occurs when a party clearly indicates—through words or actions—that they will not perform their contractual obligations before performance is due. When this happens, the non-breaching party can: 1) Treat the contract as terminated and immediately sue for damages, 2) Wait until performance is actually due to see if the repudiating party changes their mind, or 3) In some cases, demand adequate assurance of performance. This doctrine prevents the non-breaching party from having to wait until the actual breach to take action.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When a party expects the other party to breach in the future" },
        { letter: "B", text: "When a party clearly indicates they will not perform their contractual obligations before performance is due" },
        { letter: "C", text: "Breaching a contract before signing it" },
        { letter: "D", text: "Breaking a contract due to anticipated problems with the property" }
      ]
    },
    {
      text: "What is the 'mailbox rule' in contract law?",
      answer: "An acceptance becomes effective when dispatched (mailed), not when received, if acceptance by mail is reasonable",
      explanation: "The mailbox rule (also called the 'posting rule') states that an acceptance becomes legally effective when properly dispatched (mailed, emailed, etc.), not when received by the offeror, if acceptance by that method is reasonable. This creates a binding contract upon dispatch, even if the acceptance is lost or delayed. The rule is an exception to the general principle that communication is effective upon receipt and applies only to acceptances, not to offers, revocations, or rejections, which are effective only upon receipt.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A rule requiring all contract notices to be sent by certified mail" },
        { letter: "B", text: "An acceptance becomes effective when dispatched (mailed), not when received, if acceptance by mail is reasonable" },
        { letter: "C", text: "A regulation requiring mailboxes to be accessible for delivering contract documents" },
        { letter: "D", text: "A rule stating that contracts must be mailed within a mailbox to be valid" }
      ]
    },
    {
      text: "What is the difference between an 'express contract' and an 'implied contract'?",
      answer: "An express contract is formed by words (oral or written), while an implied contract is formed by conduct",
      explanation: "An express contract is formed through words—either written or oral—where parties clearly state their agreement to specific terms. An implied contract (specifically, an implied-in-fact contract) is formed through conduct, where parties' actions indicate mutual agreement though they haven't explicitly stated all terms. Both types are legally enforceable, though express contracts are easier to prove. A third category, implied-in-law contracts (or quasi-contracts), aren't true contracts but are imposed by courts to prevent unjust enrichment.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An express contract is formed by words (oral or written), while an implied contract is formed by conduct" },
        { letter: "B", text: "Express contracts are written, while implied contracts are verbal" },
        { letter: "C", text: "Express contracts are legally binding, while implied contracts are not" },
        { letter: "D", text: "Express contracts are used for commercial property, while implied contracts are used for residential property" }
      ]
    },
    {
      text: "What is 'duress' in the context of contract law?",
      answer: "Unlawful pressure or coercion that forces someone to enter into a contract against their will",
      explanation: "Duress occurs when unlawful pressure or coercion forces someone to enter into a contract against their will, effectively eliminating free choice. It typically involves threats of physical harm, severe economic pressure, or improper threats of legal action. A contract signed under duress is voidable at the option of the coerced party. Courts examine factors like the seriousness of the threat, available alternatives to the coerced party, and whether the threat was legitimate (like threatening to sue if there's a valid legal claim).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A situation where a contract must be signed under time pressure" },
        { letter: "B", text: "Unlawful pressure or coercion that forces someone to enter into a contract against their will" },
        { letter: "C", text: "The stress caused by complex contract negotiations" },
        { letter: "D", text: "A clause specifying how long a contract remains in effect" }
      ]
    },
    {
      text: "What is 'misrepresentation' in contract law?",
      answer: "A false statement of material fact that induces someone to enter into a contract",
      explanation: "Misrepresentation is a false statement of material fact that induces someone to enter into a contract. There are three types: 1) Fraudulent misrepresentation - knowingly making a false statement with intent to deceive; 2) Negligent misrepresentation - making a statement without reasonable grounds for believing it's true; and 3) Innocent misrepresentation - unknowingly making a false statement. Depending on the type and jurisdiction, remedies may include contract rescission, damages, or both.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Errors in how a party is represented in contract documents" },
        { letter: "B", text: "A false statement of material fact that induces someone to enter into a contract" },
        { letter: "C", text: "When an agent misrepresents their client in a transaction" },
        { letter: "D", text: "Poor representation by an attorney during contract negotiations" }
      ]
    },
    {
      text: "What is 'promissory estoppel' in contract law?",
      answer: "A doctrine that makes a promise enforceable when the promisee reasonably relies on it to their detriment, even without traditional contract elements",
      explanation: "Promissory estoppel is a doctrine that makes a promise enforceable when the promisee reasonably relies on it to their detriment, even when traditional contract elements (like consideration) may be missing. It requires: 1) A clear and definite promise, 2) Reasonable and foreseeable reliance by the promisee, 3) Actual reliance, and 4) Injustice that can only be avoided by enforcing the promise. Courts typically limit relief to reliance damages rather than the full benefit of the bargain.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A doctrine that makes a promise enforceable when the promisee reasonably relies on it to their detriment, even without traditional contract elements" },
        { letter: "B", text: "A clause preventing parties from breaking promises in a contract" },
        { letter: "C", text: "A legal principle that prevents people from denying facts they previously admitted" },
        { letter: "D", text: "A penalty imposed for breaking a contractual promise" }
      ]
    },
    {
      text: "What is a 'covenant against encumbrances' in a deed?",
      answer: "A promise that there are no undisclosed liens, easements, or restrictions on the property",
      explanation: "A covenant against encumbrances is a promise by the grantor (seller) that the property has no undisclosed liens, easements, mortgages, or restrictions that would affect its value or the grantee's use and enjoyment. This covenant protects the buyer from discovering unexpected limitations on the property after purchase. If undisclosed encumbrances exist, the buyer can sue for damages—typically the cost to remove the encumbrance or the reduction in property value. This is one of the six common covenants in a general warranty deed.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A promise not to build fences or enclosures on the property" },
        { letter: "B", text: "A promise that there are no undisclosed liens, easements, or restrictions on the property" },
        { letter: "C", text: "A restriction against building any structures on the property" },
        { letter: "D", text: "A guarantee that the property boundaries are accurately described" }
      ]
    },
    {
      text: "What is an 'adhesion contract' in real estate?",
      answer: "A standardized contract drafted by one party (typically with stronger bargaining power) that offers the other party only the choice to accept or reject the entire contract",
      explanation: "An adhesion contract is a standardized contract drafted by one party (typically with stronger bargaining power) that offers the other party only the choice to accept or reject the entire contract without the ability to negotiate terms. Examples in real estate include standard mortgages, leases, and some purchase agreements. While not automatically unenforceable, courts scrutinize adhesion contracts more closely and may refuse to enforce provisions that are unconscionable, violate public policy, or defeat the weaker party's reasonable expectations.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A contract that sticks to the original terms regardless of changing circumstances" },
        { letter: "B", text: "A standardized contract drafted by one party (typically with stronger bargaining power) that offers the other party only the choice to accept or reject the entire contract" },
        { letter: "C", text: "A contract that is attached or adhered to another contract" },
        { letter: "D", text: "A contract that uses adhesive to attach signatures rather than ink" }
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
  
  console.log('\n=========== FINAL CONTRACT QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalContractQuestions()
  .then(() => {
    console.log('Final contract questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final contract questions:', error);
    process.exit(1);
  });