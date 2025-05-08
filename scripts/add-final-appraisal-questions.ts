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

async function addFinalAppraisalQuestions() {
  console.log('Starting to add final appraisal questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define final appraisal questions
  const questions: Question[] = [
    {
      text: "What is a 'gross rent multiplier' (GRM) in real estate appraisal?",
      answer: "A method of estimating property value by multiplying the gross annual rental income by a factor",
      explanation: "The Gross Rent Multiplier (GRM) is a simple method of estimating property value by multiplying the gross annual rental income by a factor derived from sales of comparable properties. The formula is: GRM = Sale Price ÷ Gross Annual Rent. For example, if similar properties sell for 8 times their gross annual rent, a property generating $30,000 in annual rent might be valued at $240,000. While easy to calculate, GRM has limitations—it doesn't account for operating expenses, vacancy rates, or property-specific factors affecting net income.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A method of estimating property value by multiplying the gross annual rental income by a factor" },
        { letter: "B", text: "The rental income multiplied by the number of gross square feet" },
        { letter: "C", text: "A gross exaggeration of potential rental income" },
        { letter: "D", text: "A multiplier used to convert net income to gross income" }
      ]
    },
    {
      text: "What is 'economic life' in property appraisal?",
      answer: "The period during which a property can generate income in excess of operating expenses",
      explanation: "Economic life refers to the period during which a property can generate income in excess of operating expenses. It's often shorter than the physical life of a structure because a building may become functionally or economically obsolete while still physically sound. For example, an office building might be physically sound for 60+ years but have an economic life of only 30-40 years due to changing technology, design preferences, or market conditions. Economic life is a key factor in depreciation calculations in the cost approach to value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The period until a building physically deteriorates completely" },
        { letter: "B", text: "The period during which a property can generate income in excess of operating expenses" },
        { letter: "C", text: "The economic impact of a building on the local community" },
        { letter: "D", text: "The time it takes for a property to pay for itself through rental income" }
      ]
    },
    {
      text: "What is 'economic obsolescence' in property appraisal?",
      answer: "A loss in value due to factors external to the property",
      explanation: "Economic obsolescence (also called external obsolescence) is a loss in property value due to factors external to the property itself and beyond the owner's control. These factors might include adverse zoning changes, neighborhood decline, proximity to nuisances (e.g., highways, airports, industrial facilities), general economic downturns, or market oversupply. Unlike physical deterioration or functional obsolescence, economic obsolescence cannot be cured by the property owner since the causes originate outside the property boundaries.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a property becomes too expensive to maintain" },
        { letter: "B", text: "A loss in value due to factors external to the property" },
        { letter: "C", text: "The economic downturn of older properties" },
        { letter: "D", text: "When a property's economic usefulness has ended" }
      ]
    },
    {
      text: "What is 'regression analysis' in real estate appraisal?",
      answer: "A statistical technique that measures correlations between property characteristics and sales prices",
      explanation: "Regression analysis is a statistical technique that measures correlations between property characteristics (independent variables) and sales prices (dependent variable). This approach helps appraisers quantify the impact of specific features on value—for example, determining that each additional bedroom adds $15,000 to value in a particular market. Increasingly used in automated valuation models, regression analysis provides more objective adjustments than traditional paired sales analysis, though it requires sufficient data points (comparable sales) and statistical expertise to implement properly.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The process of properties regressing to a lower value over time" },
        { letter: "B", text: "A statistical technique that measures correlations between property characteristics and sales prices" },
        { letter: "C", text: "When appraisers return to previous methods of valuation" },
        { letter: "D", text: "Analyzing how quickly property values decline in a neighborhood" }
      ]
    },
    {
      text: "What is the 'cost approach' to value in appraisal?",
      answer: "A valuation method that estimates property value by calculating the cost to replace improvements minus depreciation, plus land value",
      explanation: "The cost approach estimates property value by calculating the cost to replace the improvements, subtracting depreciation, and adding land value. The formula is: Value = Replacement Cost - Depreciation + Land Value. This approach is particularly useful for new or special-purpose properties with few comparable sales. It's based on the premise that a rational buyer wouldn't pay more for an existing property than it would cost to build an equivalent one. The cost approach requires estimating current construction costs, measuring all forms of depreciation, and determining land value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A valuation method that estimates property value by calculating the cost to replace improvements minus depreciation, plus land value" },
        { letter: "B", text: "The approach that costs the least to implement" },
        { letter: "C", text: "Valuing a property based solely on the cost of materials" },
        { letter: "D", text: "The approach that considers what it cost the original builder to construct the property" }
      ]
    },
    {
      text: "What is the 'income approach' to value in appraisal?",
      answer: "A valuation method that estimates property value based on its income-generating potential",
      explanation: "The income approach estimates property value based on its income-generating potential. It's primarily used for commercial and investment properties. The two main methods are: 1) Direct Capitalization, which converts a single year's net operating income into value using a capitalization rate (Value = NOI ÷ Cap Rate); and 2) Discounted Cash Flow analysis, which projects income and expenses over a holding period, then discounts these cash flows to present value. The income approach is most relevant when buyers are primarily motivated by investment returns rather than personal use.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A method focusing exclusively on the income of potential buyers" },
        { letter: "B", text: "A valuation method that estimates property value based on its income-generating potential" },
        { letter: "C", text: "An approach that values property based on the appraiser's income" },
        { letter: "D", text: "Determining value based on neighborhood income levels" }
      ]
    },
    {
      text: "What is a 'capitalization rate' (cap rate) in real estate valuation?",
      answer: "The ratio of a property's net operating income to its purchase price or value",
      explanation: "A capitalization rate (cap rate) is the ratio of a property's net operating income (NOI) to its purchase price or value, expressed as a percentage: Cap Rate = NOI ÷ Value. For example, a property generating $100,000 in NOI with a value of $1,250,000 has an 8% cap rate. Higher cap rates suggest higher risk and return potential, while lower cap rates typically indicate lower risk and lower return. Cap rates vary by property type, location, condition, tenant quality, and market conditions, serving as a quick measure of a property's potential return on investment.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The rate at which a property appreciates in value" },
        { letter: "B", text: "The ratio of a property's net operating income to its purchase price or value" },
        { letter: "C", text: "The maximum rate allowed for capitalizing expenses" },
        { letter: "D", text: "The rate of return on capital improvements" }
      ]
    },
    {
      text: "What is 'depreciation' in the context of real estate appraisal?",
      answer: "The loss in property value from any cause",
      explanation: "In real estate appraisal, depreciation refers to the loss in property value from any cause, not just age-related wear. The three types are: 1) Physical deterioration - wear and tear or structural damage; 2) Functional obsolescence - outdated features or poor design relative to market standards; and 3) External obsolescence - adverse factors outside the property like neighborhood decline or market conditions. When using the cost approach, appraisers must estimate these forms of depreciation to adjust the replacement cost of improvements to reflect the property's current market value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A tax deduction for investment property" },
        { letter: "B", text: "The loss in property value from any cause" },
        { letter: "C", text: "The systematic allocation of a building's cost over its IRS-defined useful life" },
        { letter: "D", text: "A decrease in property values due to economic recession" }
      ]
    },
    {
      text: "What is a 'paired sales analysis' in real estate appraisal?",
      answer: "A technique that compares sales of similar properties to determine the value contribution of a specific feature",
      explanation: "Paired sales analysis is a technique that compares sales of similar properties to isolate and determine the value contribution of a specific feature or characteristic. Ideally, the appraiser finds two recently sold properties identical in all respects except for the feature being analyzed. The difference in sales prices represents the market value of that feature. For example, comparing two similar homes where one has a pool and one doesn't helps determine the value contribution of the pool. In practice, perfect pairs are rare, so appraisers often analyze multiple pairs and adjust for minor differences.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Analyzing two competing offers on the same property" },
        { letter: "B", text: "A technique that compares sales of similar properties to determine the value contribution of a specific feature" },
        { letter: "C", text: "Comparing properties that were sold twice within a short period" },
        { letter: "D", text: "A method where two appraisers separately value the same property" }
      ]
    },
    {
      text: "What is the 'principle of contribution' in real estate appraisal?",
      answer: "The concept that the value of a component is measured by its contribution to the whole property's value, not its cost",
      explanation: "The principle of contribution states that the value of a component or improvement is measured by its contribution to the total property value, not by its cost. For example, a $50,000 swimming pool might only add $25,000 to a home's market value in some neighborhoods, while an $8,000 kitchen update might add $15,000 in value. This principle explains why over-improving a property (adding features beyond what's typical for the neighborhood) often doesn't yield proportional value increases, as improvements contribute value only to the extent that they align with market preferences.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The concept that the value of a component is measured by its contribution to the whole property's value, not its cost" },
        { letter: "B", text: "The requirement that all parties contribute to the appraisal fee" },
        { letter: "C", text: "The idea that all property features contribute equally to value" },
        { letter: "D", text: "The principle that neighboring properties contribute to each other's values" }
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
  
  console.log('\n=========== FINAL APPRAISAL QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalAppraisalQuestions()
  .then(() => {
    console.log('Final appraisal questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final appraisal questions:', error);
    process.exit(1);
  });