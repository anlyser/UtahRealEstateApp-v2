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

async function addContractQuestions() {
  console.log('Starting to add real estate contract questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define contract questions
  const questions: Question[] = [
    {
      text: "What is a 'bilateral contract' in real estate?",
      answer: "A contract in which both parties make promises to each other",
      explanation: "A bilateral contract is one in which both parties make promises to each other. In real estate, the purchase contract is bilateral—the buyer promises to pay the purchase price, and the seller promises to deliver marketable title. This mutual exchange of promises creates binding obligations for both parties.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract in which both parties make promises to each other" },
        { letter: "B", text: "A contract signed by two people" },
        { letter: "C", text: "A contract that remains in effect for two years" },
        { letter: "D", text: "A contract that involves two properties" }
      ]
    },
    {
      text: "What is a 'unilateral contract' in real estate?",
      answer: "A contract in which only one party makes a promise, to be performed if the other party chooses to act",
      explanation: "A unilateral contract is one in which only one party makes a promise, to be performed if the other party chooses to act. In real estate, an option contract is unilateral—the seller promises to sell a property at a specific price if the buyer chooses to exercise the option within a specified time frame.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract signed by only one party" },
        { letter: "B", text: "A contract in which only one party makes a promise, to be performed if the other party chooses to act" },
        { letter: "C", text: "A contract involving only one property" },
        { letter: "D", text: "A contract with a one-year term" }
      ]
    },
    {
      text: "What is meant by 'specific performance' in real estate contracts?",
      answer: "A court order requiring the performance of the contract exactly as agreed",
      explanation: "Specific performance is a court-ordered remedy requiring a party to fulfill their contractual obligations exactly as agreed. In real estate, it's often sought when monetary damages wouldn't adequately compensate for breach of contract. Because each parcel of real estate is considered unique, specific performance is more commonly available for real estate contracts than for other types of contracts.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A court order requiring the performance of the contract exactly as agreed" },
        { letter: "B", text: "Performing only certain parts of the contract" },
        { letter: "C", text: "A cash settlement in lieu of completing the contract" },
        { letter: "D", text: "Meeting specific conditions before the contract is valid" }
      ]
    },
    {
      text: "What does 'privity of contract' mean in real estate?",
      answer: "The legal relationship between parties to a contract",
      explanation: "Privity of contract refers to the legal relationship between parties who have entered into a contract. Only those in privity (the parties to the contract) can enforce the contract's terms, with some exceptions. This principle limits a third party's ability to sue for breach of contract, even if they are affected by the contract's performance.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The legal relationship between parties to a contract" },
        { letter: "B", text: "The privacy rights of the parties in a contract" },
        { letter: "C", text: "The timeframe for a contract to be valid" },
        { letter: "D", text: "The personal items included in a real estate sale" }
      ]
    },
    {
      text: "What is a 'contingency' in a real estate contract?",
      answer: "A condition that must be satisfied for the contract to become binding",
      explanation: "A contingency is a condition in a contract that must be satisfied for the contract to become binding. Common real estate contingencies include financing approval, satisfactory home inspection, property appraisal, and sale of the buyer's current home. If a contingency isn't met, the contract can typically be terminated without penalty.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An emergency clause that takes effect if something goes wrong" },
        { letter: "B", text: "A condition that must be satisfied for the contract to become binding" },
        { letter: "C", text: "A partial payment made before closing" },
        { letter: "D", text: "A backup plan if the contract falls through" }
      ]
    },
    {
      text: "What is an 'addendum' in a real estate contract?",
      answer: "An addition to the original contract that becomes part of the agreement",
      explanation: "An addendum is a separate document added to the original contract that introduces additional terms, conditions, or clarifications. Once properly executed by all parties, it becomes part of the legally binding agreement. Addenda are commonly used in real estate to address inspection issues, make repairs, adjust closing dates, or modify other aspects of the transaction.",
      categoryName: "Contracts",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An addition to the original contract that becomes part of the agreement" },
        { letter: "B", text: "A summary of the contract terms" },
        { letter: "C", text: "A statement explaining why a contract was terminated" },
        { letter: "D", text: "The final page of the contract containing signatures" }
      ]
    },
    {
      text: "What is an 'amendment' to a real estate contract?",
      answer: "A change or modification to the terms of an existing contract",
      explanation: "An amendment is a change or modification to the terms of an existing contract. Unlike an addendum, which adds new terms, an amendment alters or removes existing terms. For an amendment to be valid, all parties to the original contract must agree to and sign it, demonstrating mutual consent to the changes.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A change or modification to the terms of an existing contract" },
        { letter: "B", text: "An additional document that expands the contract" },
        { letter: "C", text: "A legal right included in the Constitution" },
        { letter: "D", text: "A clause that automatically updates the contract annually" }
      ]
    },
    {
      text: "What does 'time is of the essence' mean in a real estate contract?",
      answer: "All deadlines and timeframes in the contract are important and must be strictly met",
      explanation: "The phrase 'time is of the essence' means that all deadlines and timeframes specified in the contract are critical and must be strictly met. This clause emphasizes that failure to perform obligations by the specified dates constitutes a material breach of contract, potentially allowing the non-breaching party to terminate the agreement or seek other remedies.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The contract must be completed quickly" },
        { letter: "B", text: "All deadlines and timeframes in the contract are important and must be strictly met" },
        { letter: "C", text: "The contract is only valid for a limited time" },
        { letter: "D", text: "Time extensions are not permitted" }
      ]
    },
    {
      text: "What is 'consideration' in a real estate contract?",
      answer: "Something of value exchanged by the parties to make the contract legally binding",
      explanation: "Consideration is something of value exchanged by the parties that makes a contract legally binding. In real estate, the primary consideration is typically money from the buyer and the property from the seller. Without consideration, a promise is generally unenforceable as a mere gratuitous promise. Earnest money deposits are often the initial consideration in real estate transactions.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The thoughtful evaluation of contract terms" },
        { letter: "B", text: "Something of value exchanged by the parties to make the contract legally binding" },
        { letter: "C", text: "The formal reflection period before signing" },
        { letter: "D", text: "The respect shown by the parties during negotiations" }
      ]
    },
    {
      text: "What is the difference between 'express' and 'implied' contracts?",
      answer: "Express contracts are clearly stated in words; implied contracts are inferred from conduct",
      explanation: "Express contracts are clearly stated in written or verbal form, with specific terms defined. Implied contracts, however, are formed through the conduct of the parties rather than explicit statements. In real estate, most significant contracts must be in writing (express) to be enforceable under the Statute of Frauds.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Express contracts are clearly stated in words; implied contracts are inferred from conduct" },
        { letter: "B", text: "Express contracts are verbal; implied contracts are written" },
        { letter: "C", text: "Express contracts are fast; implied contracts take longer to complete" },
        { letter: "D", text: "Express contracts have specific deadlines; implied contracts do not" }
      ]
    },
    {
      text: "What is a 'void' contract?",
      answer: "A contract that has no legal effect and cannot be enforced by either party",
      explanation: "A void contract has no legal effect from its inception—it's as if it never existed and cannot be enforced by either party. Contracts may be void due to illegality, impossibility of performance, lack of capacity (minor or mentally incompetent person), or other reasons that make them fundamentally unenforceable as a matter of law.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that has no legal effect and cannot be enforced by either party" },
        { letter: "B", text: "A contract that can be canceled by one party" },
        { letter: "C", text: "A contract that hasn't been signed yet" },
        { letter: "D", text: "A contract that's missing certain terms" }
      ]
    },
    {
      text: "What is a 'voidable' contract?",
      answer: "A contract that may be legally canceled or disaffirmed by one of the parties",
      explanation: "A voidable contract is valid but may be legally canceled or disaffirmed by one of the parties. Unlike void contracts, voidable contracts are binding unless the party with the right to void chooses to do so. Examples include contracts entered by minors, contracts induced by fraud or misrepresentation, or those signed under duress.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that's automatically invalid" },
        { letter: "B", text: "A contract that may be legally canceled or disaffirmed by one of the parties" },
        { letter: "C", text: "A contract that expires after a certain period" },
        { letter: "D", text: "A contract without signatures" }
      ]
    },
    {
      text: "What is 'novation' in contract law?",
      answer: "The substitution of a new contract for an old one, with all parties agreeing",
      explanation: "Novation is the substitution of a new contract for an old one, with all parties agreeing to the change. This process completely terminates the original contract and creates a new one, often involving a change in the parties. In real estate, novation might occur when a new buyer takes over a seller's obligations under a contract, with the seller being released from all liability.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A new offer made after a previous one was rejected" },
        { letter: "B", text: "The substitution of a new contract for an old one, with all parties agreeing" },
        { letter: "C", text: "A notification that a contract has been breached" },
        { letter: "D", text: "The renewal of an expired contract" }
      ]
    },
    {
      text: "What is 'duress' in relation to real estate contracts?",
      answer: "Unlawful pressure or coercion that forces someone to enter into a contract against their will",
      explanation: "Duress occurs when a party is forced to enter into a contract due to unlawful pressure or coercion. A contract signed under duress is voidable by the victim. Examples include threats of physical harm, economic pressure, or improper threats of legal action. The pressure must be sufficiently severe to overcome the free will of a reasonable person.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The stress involved in completing a real estate transaction" },
        { letter: "B", text: "Unlawful pressure or coercion that forces someone to enter into a contract against their will" },
        { letter: "C", text: "The difficult conditions a property might be in" },
        { letter: "D", text: "The financial strain of making mortgage payments" }
      ]
    },
    {
      text: "What is 'undue influence' in contract law?",
      answer: "Using a position of trust or power to influence a person to enter a contract that benefits the influencer",
      explanation: "Undue influence occurs when someone in a position of trust, confidence, or authority takes advantage of that relationship to influence another person to enter into a contract that primarily benefits the influencer. Unlike duress, undue influence involves a special relationship between the parties. Contracts made under undue influence are voidable by the victim.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Using a position of trust or power to influence a person to enter a contract that benefits the influencer" },
        { letter: "B", text: "Excessive marketing of a property to potential buyers" },
        { letter: "C", text: "Having a real estate agent help negotiate contract terms" },
        { letter: "D", text: "A strong market influence on property values" }
      ]
    },
    {
      text: "What is 'unconscionability' in real estate contracts?",
      answer: "Terms or conditions so extremely unfair that they shock the conscience",
      explanation: "Unconscionability refers to contract terms or conditions that are so extremely unfair, one-sided, or oppressive that they shock the conscience. Courts may refuse to enforce unconscionable contracts or specific provisions. Unconscionability can be procedural (unfair bargaining process) or substantive (unfair terms). Examples include excessive fees, waiver of fundamental rights, or grossly disproportionate exchanges of value.",
      categoryName: "Contracts",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A failure to disclose material facts" },
        { letter: "B", text: "Terms or conditions so extremely unfair that they shock the conscience" },
        { letter: "C", text: "Failure to read a contract before signing" },
        { letter: "D", text: "A contract signed by someone who was sleeping" }
      ]
    },
    {
      text: "What is an 'executory contract' in real estate?",
      answer: "A contract in which some act remains to be done by one or both parties",
      explanation: "An executory contract is one in which some act remains to be done by one or both parties—the contract has been signed but not yet fully performed. Most real estate purchase contracts are executory until closing, when the deed is delivered to the buyer and funds to the seller. This period between contract signing and closing is sometimes called the 'executory period.'",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract in which some act remains to be done by one or both parties" },
        { letter: "B", text: "A contract signed by an executor of an estate" },
        { letter: "C", text: "A contract with an execution date" },
        { letter: "D", text: "A contract requiring death benefits" }
      ]
    },
    {
      text: "What is an 'executed contract' in real estate?",
      answer: "A contract in which all parties have fully performed their obligations",
      explanation: "An executed contract is one in which all parties have fully performed their obligations, completing all required actions. In real estate, a purchase contract becomes fully executed at closing when the seller delivers the deed and the buyer provides payment. At this point, the contract's terms have been fulfilled, and the agreement is complete.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that has been signed by all parties" },
        { letter: "B", text: "A contract in which all parties have fully performed their obligations" },
        { letter: "C", text: "A contract that has been terminated" },
        { letter: "D", text: "A contract that is about to expire" }
      ]
    },
    {
      text: "What is a 'breach of contract' in real estate?",
      answer: "Failure to perform any term of a contract without a legitimate legal excuse",
      explanation: "A breach of contract occurs when one party fails to perform any term of a contract without a legitimate legal excuse. This can be failure to complete the transaction (material breach) or minor deviations from contract terms (minor breach). When a breach occurs, the non-breaching party may be entitled to remedies such as monetary damages, specific performance, or contract termination.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Failure to perform any term of a contract without a legitimate legal excuse" },
        { letter: "B", text: "Breaking into a property before closing" },
        { letter: "C", text: "A gap in the property's security system" },
        { letter: "D", text: "Tearing up the contract document" }
      ]
    },
    {
      text: "What is a 'rider' in a real estate contract?",
      answer: "An attachment that becomes part of the contract and modifies its terms",
      explanation: "A rider is an attachment to a contract that becomes part of the agreement and modifies its terms. Riders address specific situations or needs that aren't covered in the standard contract form. Common real estate riders include lead-based paint disclosure, property condition disclosure, or special financing terms. All parties must acknowledge and sign riders for them to be enforceable.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A clause within the main body of the contract" },
        { letter: "B", text: "An attachment that becomes part of the contract and modifies its terms" },
        { letter: "C", text: "A real estate agent who brings potential buyers to see properties" },
        { letter: "D", text: "A person who accompanies the inspector during home inspection" }
      ]
    },
    {
      text: "What is an 'option contract' in real estate?",
      answer: "A contract in which a property owner gives another party the right to buy the property at a specified price within a specified time",
      explanation: "An option contract gives a potential buyer the exclusive right, but not the obligation, to purchase a specific property at a predetermined price within a specified time frame. The buyer pays for this right (option fee), which may or may not be credited toward the purchase price. If the buyer doesn't exercise the option before it expires, the seller keeps the option fee and can sell to someone else.",
      categoryName: "Contracts",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A contract that gives the buyer multiple property choices" },
        { letter: "B", text: "A contract in which a property owner gives another party the right to buy the property at a specified price within a specified time" },
        { letter: "C", text: "A listing contract with optional services" },
        { letter: "D", text: "A contract that's optional for both parties to follow" }
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
  
  console.log('\n=========== CONTRACT QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addContractQuestions()
  .then(() => {
    console.log('Contract questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding contract questions:', error);
    process.exit(1);
  });