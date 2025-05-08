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

async function addMoreContractQuestions() {
  console.log('Starting to add more real estate contract questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more contract questions
  const questions: Question[] = [
    {
      text: "What is the 'doctrine of merger' in real estate contracts?",
      answer: "The principle that all agreements in a purchase contract merge into the deed at closing",
      explanation: "The doctrine of merger is the legal principle that all agreements in a purchase contract merge into the deed at closing, meaning the deed becomes the final expression of the parties' agreement. After closing, the buyer generally can't make claims based on contract promises unless they were specifically excluded from the merger doctrine or involved fraud. Certain warranties may survive closing if expressly stated in the contract.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The principle that all agreements in a purchase contract merge into the deed at closing" },
        { letter: "B", text: "The combining of two properties into one legal parcel" },
        { letter: "C", text: "When two brokerages merge their operations" },
        { letter: "D", text: "The combination of earnest money deposits into one account" }
      ]
    },
    {
      text: "What is a 'bilateral contract'?",
      answer: "A contract where both parties make promises to each other",
      explanation: "A bilateral contract is an agreement where both parties make promises to each other. In real estate, the standard purchase agreement is bilateral: the buyer promises to pay the purchase price, and the seller promises to deliver marketable title. Each party's promise serves as consideration for the other's promise. Most real estate contracts are bilateral in nature.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract written in two languages" },
        { letter: "B", text: "A contract where both parties make promises to each other" },
        { letter: "C", text: "A contract between two countries" },
        { letter: "D", text: "A contract with two separate closing dates" }
      ]
    },
    {
      text: "What is a 'unilateral contract'?",
      answer: "A contract where only one party makes a promise, which is accepted by the other party's performance",
      explanation: "A unilateral contract is an agreement where only one party makes a promise, which is accepted by the other party's performance rather than by a return promise. A classic example is an option contract where the seller promises to keep an offer open for a specified time, and the buyer accepts by performing the act of paying the option money. Another example is a reward offer, which is accepted by performing the requested act.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract where only one person benefits" },
        { letter: "B", text: "A contract where only one party makes a promise, which is accepted by the other party's performance" },
        { letter: "C", text: "A contract signed by only one party" },
        { letter: "D", text: "A contract for one-sided negotiations" }
      ]
    },
    {
      text: "What is 'specific performance' in real estate contracts?",
      answer: "A legal remedy where the court orders a party to perform their contractual obligations",
      explanation: "Specific performance is an equitable remedy where the court orders a party to fulfill their contractual obligations exactly as promised. In real estate, it's commonly sought when a seller refuses to convey property after a valid contract is formed, as each parcel of real estate is considered unique. This remedy is typically only available when monetary damages would be inadequate to compensate the injured party.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A special performance test for new properties" },
        { letter: "B", text: "A legal remedy where the court orders a party to perform their contractual obligations" },
        { letter: "C", text: "A particular way of executing a contract" },
        { letter: "D", text: "Performance specifications in a construction contract" }
      ]
    },
    {
      text: "What is 'liquidated damages' in a real estate contract?",
      answer: "A specific amount predetermined by the parties as compensation for breach of contract",
      explanation: "Liquidated damages is a specific dollar amount predetermined by the parties in a contract to be paid as compensation for breach. In real estate contracts, the earnest money deposit often serves as liquidated damages if the buyer defaults. For liquidated damages to be enforceable, they must be a reasonable estimate of actual damages (not a penalty) and actual damages must be difficult to calculate at the time of contract formation.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Damages paid in cash rather than property" },
        { letter: "B", text: "A specific amount predetermined by the parties as compensation for breach of contract" },
        { letter: "C", text: "Money held in escrow during the transaction" },
        { letter: "D", text: "Damages calculated by a liquidator after bankruptcy" }
      ]
    },
    {
      text: "What is 'time is of the essence' in a real estate contract?",
      answer: "A clause indicating that contractual deadlines are strict and enforceable",
      explanation: "A 'time is of the essence' clause indicates that contractual time limits and deadlines are strict and enforceable. When this clause is included, missing a deadline constitutes a material breach, potentially allowing the other party to terminate the contract and seek remedies. Without this clause, courts may allow reasonable delays in performance. This clause is common in real estate contracts to ensure timely closing and contingency fulfillment.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A statement indicating the contract must be signed quickly" },
        { letter: "B", text: "A clause indicating that contractual deadlines are strict and enforceable" },
        { letter: "C", text: "A requirement that all parties be on time to closing" },
        { letter: "D", text: "A reference to time zones for contractual deadlines" }
      ]
    },
    {
      text: "What is 'consideration' in a real estate contract?",
      answer: "Something of value exchanged by both parties that makes the contract legally binding",
      explanation: "Consideration is something of value exchanged by both parties that makes a contract legally binding. It can be money, promises, rights, or interests. In real estate contracts, the buyer's consideration is typically the earnest money deposit and promise to pay the purchase price, while the seller's consideration is the promise to convey the property. Without consideration from both parties, an agreement is merely a gift promise and not enforceable as a contract.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The thoughtfulness shown by agents during negotiations" },
        { letter: "B", text: "Something of value exchanged by both parties that makes the contract legally binding" },
        { letter: "C", text: "The price of the property being sold" },
        { letter: "D", text: "A period for buyers to consider their options" }
      ]
    },
    {
      text: "What is a 'void contract'?",
      answer: "A contract that has no legal effect and cannot be enforced by either party",
      explanation: "A void contract has no legal effect and cannot be enforced by either party, as if the contract never existed. Examples include contracts for illegal purposes, contracts signed by minors or mentally incompetent individuals, and contracts created through fraud or duress. Unlike a voidable contract, which can be ratified, a void contract cannot be made valid through any action by the parties.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that has no legal effect and cannot be enforced by either party" },
        { letter: "B", text: "A contract that can be canceled at any time" },
        { letter: "C", text: "A contract with blank spaces" },
        { letter: "D", text: "A contract that has expired" }
      ]
    },
    {
      text: "What is a 'voidable contract'?",
      answer: "A contract that can be legally canceled or enforced at the option of one party",
      explanation: "A voidable contract is a legally binding agreement that can be canceled or enforced at the option of one party, but not the other. Unlike a void contract, a voidable contract is valid until one party elects to void it. Examples include contracts signed under duress, undue influence, or misrepresentation, and contracts with minors (who can void the contract but the adult cannot).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that is automatically void after a certain date" },
        { letter: "B", text: "A contract that can be legally canceled or enforced at the option of one party" },
        { letter: "C", text: "A contract that all parties can void at any time" },
        { letter: "D", text: "A contract that avoids certain legal requirements" }
      ]
    },
    {
      text: "What is an 'executory contract'?",
      answer: "A contract where some or all of the terms remain to be performed",
      explanation: "An executory contract is one where some or all of the terms remain to be performed by at least one party. Most real estate purchase agreements are executory contracts when signed, as the buyer still needs to pay the full purchase price and the seller still needs to deliver the deed. Once all terms have been fulfilled at closing, the contract becomes 'executed.' Understanding this distinction is important for determining rights and remedies during the transaction process.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract signed by an executor of an estate" },
        { letter: "B", text: "A contract where some or all of the terms remain to be performed" },
        { letter: "C", text: "A contract that specifies how it will be executed" },
        { letter: "D", text: "A contract that has been fully completed by both parties" }
      ]
    },
    {
      text: "What is an 'executed contract'?",
      answer: "A contract where all terms and conditions have been fully performed by both parties",
      explanation: "An executed contract is one where all terms and conditions have been fully performed by both parties. In real estate, a purchase contract becomes executed at closing when the buyer pays the full purchase price and the seller delivers the deed transferring title. At this point, the contract's primary purpose has been fulfilled, though some provisions may survive closing if specified (like warranties or indemnification clauses).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract where all terms and conditions have been fully performed by both parties" },
        { letter: "B", text: "A contract that has been signed by all parties" },
        { letter: "C", text: "A contract that has been notarized" },
        { letter: "D", text: "A contract that has been terminated" }
      ]
    },
    {
      text: "What is 'novation' in contract law?",
      answer: "The substitution of a new contract for an old one, with the same parties or different parties",
      explanation: "Novation is the substitution of a new contract for an old one, either between the same parties or involving new parties. It requires the consent of all parties involved. In real estate, novation occurs when a new buyer assumes a seller's mortgage with the lender's agreement, releasing the original borrower from liability. This differs from assignment, where the original party remains secondarily liable if the assignee defaults.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The renewal of an expired contract" },
        { letter: "B", text: "The substitution of a new contract for an old one, with the same parties or different parties" },
        { letter: "C", text: "A novel or unusual contract clause" },
        { letter: "D", text: "The voiding of a contract due to new circumstances" }
      ]
    },
    {
      text: "What is 'assignment' in real estate contracts?",
      answer: "The transfer of contractual rights to another party",
      explanation: "Assignment is the transfer of contractual rights from one party (the assignor) to another (the assignee). In real estate, a buyer might assign their rights in a purchase contract to another buyer. Unless specifically released, the assignor remains secondarily liable if the assignee fails to perform. Many real estate contracts contain clauses restricting assignment without the seller's consent to protect their interests.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The transfer of contractual rights to another party" },
        { letter: "B", text: "A task assigned to one party in a contract" },
        { letter: "C", text: "The designation of property to a specific zone" },
        { letter: "D", text: "The allocation of closing costs between buyer and seller" }
      ]
    },
    {
      text: "What does 'accord and satisfaction' mean in contract law?",
      answer: "An agreement to accept different performance than what was originally required to discharge a contractual obligation",
      explanation: "Accord and satisfaction is an agreement to accept different performance than what was originally required to fully discharge a contractual obligation. The 'accord' is the agreement to accept substitute performance, and the 'satisfaction' occurs when the substitute performance is completed. For example, if a contractor agrees to accept $4,500 instead of the contracted $5,000 due to defects, the debt is considered satisfied when the $4,500 is paid.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An agreement to accept different performance than what was originally required to discharge a contractual obligation" },
        { letter: "B", text: "A musical agreement in a property contract" },
        { letter: "C", text: "The harmonious completion of contract negotiations" },
        { letter: "D", text: "The satisfaction expressed when all parties agree to terms" }
      ]
    },
    {
      text: "What is a 'contingency' in a real estate contract?",
      answer: "A condition that must be met for the contract to become binding or proceed to closing",
      explanation: "A contingency is a condition that must be met for a real estate contract to become fully binding or proceed to closing. Common contingencies include financing (buyer's ability to obtain a loan), home inspection (satisfactory property condition), appraisal (property value meeting purchase price), and sale of buyer's existing home. Contingencies protect the parties by allowing them to exit the contract without penalty if specified conditions aren't met.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A backup plan if the contract falls through" },
        { letter: "B", text: "A condition that must be met for the contract to become binding or proceed to closing" },
        { letter: "C", text: "An emergency fund for unexpected closing costs" },
        { letter: "D", text: "A group of people who may be interested in buying if the current buyer backs out" }
      ]
    },
    {
      text: "What is 'rescission' of a contract?",
      answer: "The cancellation of a contract and return of the parties to their pre-contract positions",
      explanation: "Rescission is the cancellation or termination of a contract with the goal of returning both parties to their pre-contract positions, as if the contract never existed. Rescission may be mutual (both parties agree) or unilateral (initiated by one party due to fraud, misrepresentation, mistake, or other valid grounds). When a contract is rescinded, any money or property exchanged must be returned, including earnest money deposits.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The cancellation of a contract and return of the parties to their pre-contract positions" },
        { letter: "B", text: "The assignment of a contract to a new party" },
        { letter: "C", text: "A revision to the original contract terms" },
        { letter: "D", text: "The successful completion of a contract" }
      ]
    },
    {
      text: "What is a 'covenant' in a real estate contract?",
      answer: "A promise to do or not do something in relation to the property",
      explanation: "A covenant in real estate is a promise to do or not do something in relation to the property. Covenants can be found in contracts, deeds, and other documents. Examples include a promise to maintain property insurance, pay homeowners association dues, or not use the property for commercial purposes. Covenants can 'run with the land' (binding future owners) or be personal (binding only the original parties).",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A religious agreement related to property" },
        { letter: "B", text: "A promise to do or not do something in relation to the property" },
        { letter: "C", text: "The covering that protects the contract document" },
        { letter: "D", text: "A covenant of warranty in a deed" }
      ]
    },
    {
      text: "What is 'estoppel' in real estate contracts?",
      answer: "A legal principle that prevents a person from denying facts they previously represented as true",
      explanation: "Estoppel is a legal principle that prevents a person from denying facts they previously represented as true when another person relied on those representations. In real estate, estoppel certificates are commonly used with leases to confirm lease terms, rent amounts, and the absence of landlord defaults. These certificates 'estop' (prevent) the tenant from later claiming different lease terms or asserting previously unmentioned landlord defaults.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A legal principle that prevents a person from denying facts they previously represented as true" },
        { letter: "B", text: "A clause that stops a contract from being valid" },
        { letter: "C", text: "A form used to stop foreclosure proceedings" },
        { letter: "D", text: "The termination of contractual obligations" }
      ]
    },
    {
      text: "What is 'privity of contract'?",
      answer: "The legal relationship between parties to a contract, allowing them to sue each other for breach",
      explanation: "Privity of contract refers to the legal relationship that exists between the parties who entered into a contract, giving them the right to sue each other for breach of contract. Traditionally, only parties in privity could enforce contract terms. This doctrine has been relaxed in some cases, particularly for intended third-party beneficiaries. In real estate, understanding privity is important when dealing with assignments, property sales with existing contracts, and property warranty issues.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The privacy of contract terms" },
        { letter: "B", text: "The legal relationship between parties to a contract, allowing them to sue each other for breach" },
        { letter: "C", text: "The privilege of entering into a contract" },
        { letter: "D", text: "The priority of one contract over another" }
      ]
    },
    {
      text: "What is a 'rider' in a real estate contract?",
      answer: "An attachment that adds to or modifies the terms of the original contract",
      explanation: "A rider is an attachment added to a contract that adds to or modifies the terms of the original agreement. Riders are often used in real estate to address specific situations not covered in the standard contract. Examples include lead-based paint disclosures, condominium riders, and financing contingency details. To be legally binding, riders must be referenced in the main contract and signed by all parties.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A person who delivers contracts between parties" },
        { letter: "B", text: "An attachment that adds to or modifies the terms of the original contract" },
        { letter: "C", text: "An agent who 'rides along' during property showings" },
        { letter: "D", text: "A clause that automatically renews a contract" }
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
  
  console.log('\n=========== MORE CONTRACT QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreContractQuestions()
  .then(() => {
    console.log('More contract questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more contract questions:', error);
    process.exit(1);
  });