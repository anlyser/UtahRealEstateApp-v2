// This script adds multiple choice options to some of the questions
import { db } from "../db";
import { questions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function createMultipleChoiceQuestions() {
  console.log("Adding multiple choice options to selected questions...");
  
  try {
    // Get some questions to convert to multiple choice
    const someQuestions = await db.query.questions.findMany({
      limit: 20,
      with: {
        category: true,
        answers: true
      }
    });
    
    // For each question, add multiple choice options
    for (const question of someQuestions) {
      const correctAnswer = question.answers[0]?.text;
      
      if (!correctAnswer) continue;
      
      // Create 3 incorrect options based on the correct answer
      const incorrectOptions = [
        `Not ${correctAnswer}`,
        `The opposite of ${correctAnswer}`,
        `None of the above`,
      ];
      
      // Update the question to be multiple choice
      await db.update(questions)
        .set({
          isMultipleChoice: true,
          options: incorrectOptions
        })
        .where(eq(questions.id, question.id));
      
      console.log(`Updated question ID ${question.id} to multiple choice`);
    }
    
    console.log("Multiple choice options added successfully!");
  } catch (error) {
    console.error("Error adding multiple choice options:", error);
  }
}

createMultipleChoiceQuestions()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });