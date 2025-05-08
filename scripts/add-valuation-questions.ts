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

async function addValuationQuestions() {
  console.log('Starting to add property valuation and appraisal questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more property valuation and appraisal questions
  const questions: Question[] = [
    {
      text: "What is the difference between assessed value and market value?",
      answer: "Assessed value is determined for tax purposes, while market value is what a property would sell for in a competitive market",
      explanation: "Assessed value is a value assigned by the county assessor for tax purposes and may be different from the actual market value. Market value is what a property would reasonably sell for in a competitive, open market with informed buyers and sellers. The assessed value is often a percentage of market value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Assessed value is always higher than market value" },
        { letter: "B", text: "Assessed value is determined for tax purposes, while market value is what a property would sell for in a competitive market" },
        { letter: "C", text: "Assessed value is determined by a real estate agent, while market value is determined by an appraiser" },
        { letter: "D", text: "They are different terms for the same concept" }
      ]
    },
    {
      text: "What is the principle of conformity in real estate appraisal?",
      answer: "Maximum value is realized when a property conforms to neighborhood standards",
      explanation: "The principle of conformity states that maximum value is realized when a property is in harmony with its surroundings. Properties that are too different from the neighborhood standards (either too luxurious or too modest) may not achieve optimal value because they don't conform to market expectations for that location.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "All comparable properties should be the same age" },
        { letter: "B", text: "Maximum value is realized when a property conforms to neighborhood standards" },
        { letter: "C", text: "All properties in a neighborhood should be built in the same style" },
        { letter: "D", text: "Zoning laws should be uniform in a given area" }
      ]
    },
    {
      text: "What is the principle of regression in real estate appraisal?",
      answer: "Higher-value properties are negatively affected by nearby lower-value properties",
      explanation: "The principle of regression states that a higher-value property will be negatively affected (decreased in value) by the presence of nearby lower-value properties. For example, an upscale home surrounded by more modest homes will likely be worth less than if it were in a neighborhood of similarly upscale homes.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Higher-value properties are negatively affected by nearby lower-value properties" },
        { letter: "B", text: "Property values tend to decrease over time" },
        { letter: "C", text: "Real estate markets eventually return to average values" },
        { letter: "D", text: "Older properties are worth less than newer properties" }
      ]
    },
    {
      text: "What is the concept of 'bracketing' in real estate appraisal?",
      answer: "Using comparable properties both higher and lower in value than the subject property",
      explanation: "Bracketing is an appraisal technique where the appraiser selects comparable properties (comps) that are both higher and lower in value or characteristics than the subject property. This creates a range or 'brackets' the value of the subject property, making the final valuation more defensible and accurate.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Using comparable properties both higher and lower in value than the subject property" },
        { letter: "B", text: "Determining the upper and lower limits of possible property values" },
        { letter: "C", text: "Combining multiple valuation approaches" },
        { letter: "D", text: "Dividing a property into separate value segments" }
      ]
    },
    {
      text: "What is the relationship between interest rates and property values, all else being equal?",
      answer: "When interest rates rise, property values tend to decrease",
      explanation: "Generally, when interest rates rise, property values tend to decrease, and when interest rates fall, property values tend to increase. This is because higher interest rates increase the cost of borrowing, reducing the amount buyers can afford to spend on properties, which puts downward pressure on prices.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When interest rates rise, property values tend to increase" },
        { letter: "B", text: "When interest rates rise, property values tend to decrease" },
        { letter: "C", text: "Interest rates have no effect on property values" },
        { letter: "D", text: "Property values determine interest rates" }
      ]
    },
    {
      text: "What method is used to value an income-producing property by dividing its annual income by a capitalization rate?",
      answer: "Direct capitalization",
      explanation: "Direct capitalization is a valuation method that converts a single year's income into a value estimate by dividing the property's net operating income (NOI) by an appropriate capitalization rate. The formula is: Value = NOI ÷ Cap Rate. This approach is commonly used for stabilized income properties.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Gross rent multiplier" },
        { letter: "B", text: "Direct capitalization" },
        { letter: "C", text: "Discounted cash flow analysis" },
        { letter: "D", text: "Cost approach" }
      ]
    },
    {
      text: "What is an 'external obsolescence' in property appraisal?",
      answer: "Loss in value caused by factors outside the property",
      explanation: "External obsolescence (or economic obsolescence) is a loss in property value caused by factors outside the property itself and beyond the owner's control. Examples include nearby nuisances, changing neighborhood characteristics, economic downturns, or undesirable adjacent uses like a new highway or industrial facility.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Loss in value caused by factors outside the property" },
        { letter: "B", text: "Loss in value due to physical deterioration" },
        { letter: "C", text: "Loss in value due to outdated features inside the property" },
        { letter: "D", text: "Loss in value due to poor maintenance" }
      ]
    },
    {
      text: "What is the primary method of valuation for special-purpose properties like churches, schools, or government buildings?",
      answer: "Cost approach",
      explanation: "The cost approach is typically the primary method for valuing special-purpose properties like churches, schools, or government buildings because they rarely sell in the open market and don't generate income. This approach calculates value based on land value plus the cost to build the improvements, minus depreciation.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Sales comparison approach" },
        { letter: "B", text: "Income approach" },
        { letter: "C", text: "Cost approach" },
        { letter: "D", text: "Gross rent multiplier approach" }
      ]
    },
    {
      text: "What does the acronym 'GRM' stand for in real estate appraisal?",
      answer: "Gross Rent Multiplier",
      explanation: "GRM stands for Gross Rent Multiplier, which is a simple method for estimating property value based on its rental income. The GRM is calculated by dividing the property's sales price by its gross annual rental income. For example, if a property sells for $300,000 and generates $30,000 in annual rent, the GRM is 10.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Gross Revenue Method" },
        { letter: "B", text: "Gross Rent Multiplier" },
        { letter: "C", text: "General Real Market" },
        { letter: "D", text: "Geographic Region Measurement" }
      ]
    },
    {
      text: "What is a 'declining balance depreciation method' used for in real estate?",
      answer: "To accelerate depreciation deductions for tax purposes",
      explanation: "Declining balance depreciation is an accelerated depreciation method that allows larger deductions in the earlier years of an asset's life and smaller deductions in later years. In real estate, this method can be used for tax purposes to frontload depreciation deductions, potentially providing greater tax benefits in the early years of ownership.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To accelerate depreciation deductions for tax purposes" },
        { letter: "B", text: "To calculate the decrease in a property's market value over time" },
        { letter: "C", text: "To determine the loss in value due to physical deterioration" },
        { letter: "D", text: "To estimate the remaining economic life of a building" }
      ]
    },
    {
      text: "What is the 'effective age' of a property in appraisal?",
      answer: "The age indicated by the property's condition and utility, which may differ from its actual age",
      explanation: "Effective age refers to the apparent age of a property based on its condition, utility, and functionality, which may differ from its chronological or actual age. A well-maintained older property might have a lower effective age than its actual age, while a poorly maintained newer property might have a higher effective age.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The age of the property when it was last sold" },
        { letter: "B", text: "The age indicated by the property's condition and utility, which may differ from its actual age" },
        { letter: "C", text: "The average age of all properties in the neighborhood" },
        { letter: "D", text: "The age of the property after all renovations are considered" }
      ]
    },
    {
      text: "What is the purpose of a 'reconciliation' in an appraisal report?",
      answer: "To analyze and resolve different value indications from various appraisal methods",
      explanation: "Reconciliation is the final step in the appraisal process where the appraiser analyzes and resolves different value indications derived from various approaches (sales comparison, cost, income) to arrive at a final value conclusion. The appraiser weighs the reliability and applicability of each approach based on property type and available data.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To analyze and resolve different value indications from various appraisal methods" },
        { letter: "B", text: "To compare the appraised value with the assessed value" },
        { letter: "C", text: "To adjust for market fluctuations since the date of the appraisal" },
        { letter: "D", text: "To reconcile the buyer and seller's price expectations" }
      ]
    },
    {
      text: "What does USPAP stand for in real estate appraisal?",
      answer: "Uniform Standards of Professional Appraisal Practice",
      explanation: "USPAP stands for Uniform Standards of Professional Appraisal Practice. These are the quality control standards for real estate appraisers in the United States, developed by The Appraisal Foundation. USPAP contains rules for conducting appraisals ethically and competently, and all certified appraisers must follow these standards.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "United States Property Appraisal Process" },
        { letter: "B", text: "Uniform Standards of Professional Appraisal Practice" },
        { letter: "C", text: "Universal System for Property Assessment Procedures" },
        { letter: "D", text: "Underwriting Standards for Property Appraisal Professionals" }
      ]
    },
    {
      text: "What is a 'restricted appraisal report' under USPAP standards?",
      answer: "A simplified report format with minimal detail intended for client use only",
      explanation: "A restricted appraisal report is the most abbreviated report option under USPAP standards. It contains minimal detail and is intended solely for client use. The report states that understanding the report requires prior knowledge about the property type and market. It's appropriate when the client doesn't need a detailed explanation of the appraiser's analysis.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A simplified report format with minimal detail intended for client use only" },
        { letter: "B", text: "An appraisal restricted to certain property types" },
        { letter: "C", text: "A report that can only be used for certain transactions" },
        { letter: "D", text: "An appraisal with limited liability for the appraiser" }
      ]
    },
    {
      text: "In appraisal, what is 'accrued depreciation'?",
      answer: "The total loss in value from all causes since the property was built",
      explanation: "Accrued depreciation in real estate appraisal represents the total loss in value from all causes since the property was built. It includes physical deterioration (wear and tear), functional obsolescence (outdated features/design), and external obsolescence (negative neighborhood factors). It's most relevant in the cost approach to valuation.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The amount that can be deducted annually for tax purposes" },
        { letter: "B", text: "The total loss in value from all causes since the property was built" },
        { letter: "C", text: "The estimated future decline in value" },
        { letter: "D", text: "The decrease in value due to age only" }
      ]
    },
    {
      text: "What type of value does an appraisal typically estimate?",
      answer: "Market value",
      explanation: "An appraisal typically estimates market value, which is the most probable price a property would bring in an open, competitive market with informed buyers and sellers acting prudently and without undue pressure. This differs from other value types like assessed value, investment value, or insurable value.",
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
      text: "What is the 'income multiplier' in real estate valuation?",
      answer: "A value derived by dividing the property's sales price by its annual income",
      explanation: "The income multiplier is a valuation metric derived by dividing a property's sales price by its annual income (either gross or net). For example, if a property sold for $500,000 and produces $50,000 in annual income, the income multiplier is 10. This simple ratio helps investors quickly compare similar investment properties.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A value derived by dividing the property's sales price by its annual income" },
        { letter: "B", text: "The number of years it takes to double an investment" },
        { letter: "C", text: "The percentage increase in income expected annually" },
        { letter: "D", text: "The rate at which property income typically grows" }
      ]
    },
    {
      text: "What is the purpose of including photos in an appraisal report?",
      answer: "To document the property condition and characteristics at the time of inspection",
      explanation: "Photos in an appraisal report document the property's condition and characteristics at the time of inspection. They provide visual evidence of the property's features, improvements, and any defects, as well as the surrounding area. Photos help support the appraiser's conclusions and give the report's users a better understanding of the property.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To market the property to potential buyers" },
        { letter: "B", text: "To document the property condition and characteristics at the time of inspection" },
        { letter: "C", text: "To fulfill a legal requirement only" },
        { letter: "D", text: "To identify the specific location of the property" }
      ]
    },
    {
      text: "What does an appraiser typically do during an interior inspection of a property?",
      answer: "Measures rooms, notes the quality of construction, and documents features and condition",
      explanation: "During an interior inspection, an appraiser typically measures rooms to verify square footage, notes the quality of construction and materials, documents features and amenities, identifies improvements and renovations, assesses the overall condition, and looks for any defects or issues that might affect value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Only takes photographs" },
        { letter: "B", text: "Measures rooms, notes the quality of construction, and documents features and condition" },
        { letter: "C", text: "Examines only kitchens and bathrooms" },
        { letter: "D", text: "Tests all appliances and mechanical systems" }
      ]
    },
    {
      text: "What is a 'desk appraisal' or 'desktop appraisal'?",
      answer: "An appraisal completed without a physical inspection of the property",
      explanation: "A desk or desktop appraisal is completed without physically inspecting the property. The appraiser relies on data from public records, MLS listings, aerial photographs, and other sources. This type of appraisal is typically less accurate than a full appraisal with inspection but is sometimes used for refinancing or when a full appraisal isn't feasible.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An appraisal completed without a physical inspection of the property" },
        { letter: "B", text: "An appraisal done by a trainee appraiser" },
        { letter: "C", text: "An appraisal that only examines the exterior of a property" },
        { letter: "D", text: "An appraisal conducted by a computer algorithm" }
      ]
    },
    {
      text: "What is an 'as-is' value in appraisal?",
      answer: "The value of a property in its current condition",
      explanation: "As-is value represents the property's value in its current condition, including any defects, damage, or needed repairs. This contrasts with 'as-repaired' or 'as-completed' value, which estimates what the property would be worth after certain repairs or improvements are made. As-is value is important for properties in poor condition or foreclosures.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The value at a previous point in time" },
        { letter: "B", text: "The value of a property in its current condition" },
        { letter: "C", text: "The value based on future improvements" },
        { letter: "D", text: "The value assuming all needed repairs are completed" }
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
  
  console.log('\n=========== VALUATION AND APPRAISAL QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addValuationQuestions()
  .then(() => {
    console.log('Valuation and appraisal questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding valuation questions:', error);
    process.exit(1);
  });