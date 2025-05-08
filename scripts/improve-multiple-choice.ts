import { db } from "../db";
import { questions, answers } from "../shared/schema";
import { eq } from "drizzle-orm";

async function improveMultipleChoiceOptions() {
  console.log("Improving multiple choice options...");
  
  // Fetch all multiple choice questions
  const multipleChoiceQuestions = await db.select()
    .from(questions)
    .where(eq(questions.isMultipleChoice, true));
  
  console.log(`Found ${multipleChoiceQuestions.length} multiple choice questions.`);
  
  // Prepare improved options for common real estate questions
  const improvedOptionsMap: Record<number, string[]> = {
    // Improving the options for specific questions based on question IDs
    // The key is the question ID, the value is an array of incorrect options
    
    // Example updates
    3: ["12 hours", "9 hours", "24 hours"], // CE Hours
    4: ["Lien", "Mortgage", "Deed of Trust"], // Foreclosure
    6: ["Verbal agreement with witnesses", "Handshake agreement with deposit", "Signed paper with only buyer signature"], // Contract requirements
    // Add more as needed
  };
  
  // Define better options for common real estate topics
  const topicBasedOptions: Record<string, string[][]> = {
    license: [
      ["1 year", "2 years", "5 years"],
      ["$100", "$150", "$200"],
      ["30 days", "60 days", "90 days"],
      ["State Department", "Department of Commerce", "Attorney General's Office"]
    ],
    property: [
      ["Easement", "License", "Encroachment"],
      ["Fee simple", "Life estate", "Leasehold"],
      ["Joint tenancy", "Tenancy in common", "Tenancy by entirety"],
      ["Adverse possession", "Prescription", "Dedication"]
    ],
    contracts: [
      ["Bilateral", "Unilateral", "Implied"],
      ["Void", "Voidable", "Unenforceable"],
      ["Specific performance", "Liquidated damages", "Nominal damages"],
      ["Option", "Right of first refusal", "Letter of intent"]
    ],
    agency: [
      ["Disclosed dual agent", "Designated agent", "Transaction broker"],
      ["Express", "Implied", "Verbal"],
      ["Special agent", "General agent", "Universal agent"],
      ["Fiduciary", "Customer", "Client"]
    ],
    finance: [
      ["Amortization", "Acceleration", "Alienation"],
      ["Down payment", "Earnest money", "Escrow deposit"],
      ["Conventional", "FHA", "VA"],
      ["Fixed-rate", "Adjustable-rate", "Interest-only"]
    ],
    appraisal: [
      ["Sales comparison approach", "Cost approach", "Income approach"],
      ["Market value", "Assessed value", "Replacement value"],
      ["Appreciation", "Depreciation", "Obsolescence"],
      ["USPAP", "URAR", "FNMA"]
    ]
  };
  
  // Helper function to generate realistic options based on question content
  const generateOptionsForQuestion = (questionText: string, correctAnswer: string): string[] => {
    const text = questionText.toLowerCase();
    
    // Identify the topic
    let topic: string | null = null;
    if (text.includes("license") || text.includes("continuing education") || text.includes("renewal")) {
      topic = "license";
    } else if (text.includes("property") || text.includes("ownership") || text.includes("title")) {
      topic = "property";
    } else if (text.includes("contract") || text.includes("agreement") || text.includes("offer")) {
      topic = "contracts";
    } else if (text.includes("agent") || text.includes("broker") || text.includes("represent")) {
      topic = "agency";
    } else if (text.includes("loan") || text.includes("mortgage") || text.includes("interest") || text.includes("financing")) {
      topic = "finance";
    } else if (text.includes("value") || text.includes("apprais") || text.includes("estimate")) {
      topic = "appraisal";
    }
    
    // If we identified a topic, use its options
    if (topic && topicBasedOptions[topic]) {
      // Get random set of options from the topic
      const optionSet = topicBasedOptions[topic][Math.floor(Math.random() * topicBasedOptions[topic].length)];
      return optionSet;
    }
    
    // Default: create variations for numeric answers
    if (correctAnswer.match(/\d+/)) {
      const numMatch = correctAnswer.match(/\d+/);
      if (numMatch) {
        const num = parseInt(numMatch[0], 10);
        const options = [];
        options.push(correctAnswer.replace(numMatch[0], (num - 2).toString()));
        options.push(correctAnswer.replace(numMatch[0], (num + 2).toString()));
        options.push(correctAnswer.replace(numMatch[0], (num * 2).toString()));
        return options;
      }
    }
    
    // Last resort: generic options
    return [
      "A different valid option",
      "Another plausible choice",
      "A third reasonable alternative"
    ];
  };
  
  // Update questions with better options
  let updatedCount = 0;
  for (const question of multipleChoiceQuestions) {
    try {
      // Get the correct answer
      const [answerRecord] = await db.select()
        .from(answers)
        .where(eq(answers.questionId, question.id));
      
      if (!answerRecord) {
        console.log(`No answer found for question ${question.id}. Skipping.`);
        continue;
      }
      
      let newOptions: string[];
      
      // Use predefined options if available
      if (improvedOptionsMap[question.id]) {
        newOptions = improvedOptionsMap[question.id];
      } else {
        // Generate new options based on question content
        newOptions = generateOptionsForQuestion(question.text, answerRecord.text);
      }
      
      // Update the question with new options
      await db.update(questions)
        .set({ options: newOptions })
        .where(eq(questions.id, question.id));
      
      updatedCount++;
      
      // Log progress occasionally
      if (updatedCount % 5 === 0) {
        console.log(`Updated ${updatedCount}/${multipleChoiceQuestions.length} questions...`);
      }
    } catch (err) {
      console.error(`Error updating question ${question.id}:`, err);
    }
  }
  
  console.log(`Successfully updated ${updatedCount} questions with improved multiple choice options.`);
}

// Run the script
improveMultipleChoiceOptions()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });