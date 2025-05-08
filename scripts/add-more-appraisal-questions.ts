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

async function addMoreAppraisalQuestions() {
  console.log('Starting to add more real estate appraisal questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more appraisal questions
  const questions: Question[] = [
    {
      text: "What is 'plottage' in real estate appraisal?",
      answer: "The increase in value resulting from combining two or more adjacent lots into one larger lot",
      explanation: "Plottage is the increase in value that results when two or more adjacent parcels are combined into a single, larger parcel. This added value (plottage value) occurs because the larger combined parcel may have more utility and higher value than the sum of the individual lots, allowing for larger development, better site planning, or more efficient use.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The process of mapping a property's boundaries" },
        { letter: "B", text: "The increase in value resulting from combining two or more adjacent lots into one larger lot" },
        { letter: "C", text: "A method of dividing land into smaller parcels" },
        { letter: "D", text: "The value of a property as depicted on a plot plan" }
      ]
    },
    {
      text: "What is 'contribution' in real estate appraisal?",
      answer: "The principle that an improvement's value is based on how much it adds to market value, not its cost",
      explanation: "The principle of contribution states that a property improvement's value is based on how much it adds to the property's market value, not necessarily its cost. For example, a $50,000 swimming pool might only add $25,000 to a home's market value in some neighborhoods, while an $8,000 kitchen update might add $15,000 in value in others.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The amount a homeowner contributes to the down payment" },
        { letter: "B", text: "The principle that an improvement's value is based on how much it adds to market value, not its cost" },
        { letter: "C", text: "Money added to an escrow account" },
        { letter: "D", text: "The portion of a property's value contributed by the land versus the building" }
      ]
    },
    {
      text: "What is 'change' in real estate appraisal principles?",
      answer: "The principle that all properties are subject to continuously changing physical, economic, social, and political forces",
      explanation: "The principle of change (also called the principle of transition) recognizes that all real estate is constantly affected by physical, economic, social, and political forces. These forces can cause neighborhoods to improve or decline, affecting property values. Appraisers must consider these dynamic influences when valuing properties and projecting future values.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The money returned to a buyer during a transaction" },
        { letter: "B", text: "The physical alterations made to a property" },
        { letter: "C", text: "The principle that all properties are subject to continuously changing physical, economic, social, and political forces" },
        { letter: "D", text: "The difference between listing and sale price" }
      ]
    },
    {
      text: "What is 'anticipation' in real estate appraisal?",
      answer: "The principle that value is created by the expectation of future benefits",
      explanation: "The principle of anticipation states that value is created by the expectation of future benefits of ownership. Property values are influenced not just by current conditions, but by anticipated future events, developments, and income. For example, news of a planned highway or commercial development can affect surrounding property values before construction even begins.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The principle that value is created by the expectation of future benefits" },
        { letter: "B", text: "The process of predicting future property tax rates" },
        { letter: "C", text: "The excitement generated by a new property listing" },
        { letter: "D", text: "A method of estimating closing costs" }
      ]
    },
    {
      text: "What is 'conformity' in real estate appraisal?",
      answer: "The principle that maximum value is realized when properties in an area have a reasonable degree of architectural and use homogeneity",
      explanation: "The principle of conformity states that maximum value is achieved when a property reasonably conforms to neighboring properties in terms of architecture, size, age, condition, and use. A very different property may suffer in value (e.g., a small home among mansions or a mansion among small homes). This principle explains why neighborhoods with similar properties often maintain more stable values.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The principle that maximum value is realized when properties in an area have a reasonable degree of architectural and use homogeneity" },
        { letter: "B", text: "The requirement that properties conform to building codes" },
        { letter: "C", text: "The process of adapting a property to match the neighborhood" },
        { letter: "D", text: "Complying with zoning regulations" }
      ]
    },
    {
      text: "What is 'competition' in real estate appraisal principles?",
      answer: "The principle that excess profits tend to generate competition, which eventually reduces profits",
      explanation: "The principle of competition states that excess profits tend to generate competition, which eventually reduces profits to a competitive level. For example, if apartment owners in an area are earning high returns, developers will build more apartments, increasing supply and eventually reducing rents and returns to a stabilized level. This principle helps explain market cycles.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The rivalry between real estate agents for listings" },
        { letter: "B", text: "The principle that excess profits tend to generate competition, which eventually reduces profits" },
        { letter: "C", text: "The bidding process between multiple buyers" },
        { letter: "D", text: "The comparison of similar properties to determine value" }
      ]
    },
    {
      text: "What is 'supply and demand' in real estate appraisal?",
      answer: "The principle that property value increases when demand exceeds supply and decreases when supply exceeds demand",
      explanation: "The principle of supply and demand states that property values increase when demand exceeds supply and decrease when supply exceeds demand. This fundamental economic principle explains how market conditions affect real estate values. Limited housing inventory in a desirable area drives prices up, while overbuilding relative to buyer demand pushes prices down.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The process of supplying information that buyers demand" },
        { letter: "B", text: "The principle that property value increases when demand exceeds supply and decreases when supply exceeds demand" },
        { letter: "C", text: "The requirement to disclose property defects" },
        { letter: "D", text: "The marketing strategy for a property" }
      ]
    },
    {
      text: "What is 'substitution' in real estate appraisal?",
      answer: "The principle that a buyer will pay no more for a property than the cost of acquiring an equally desirable substitute",
      explanation: "The principle of substitution states that a rational buyer will pay no more for a property than the cost of acquiring an equally desirable substitute. This principle forms the basis for all three approaches to value: in the sales comparison approach, comparable properties serve as substitutes; in the cost approach, new construction is a substitute; and in the income approach, alternative investments are substitutes.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Replacing one property feature with another" },
        { letter: "B", text: "The principle that a buyer will pay no more for a property than the cost of acquiring an equally desirable substitute" },
        { letter: "C", text: "Using one appraiser in place of another" },
        { letter: "D", text: "Substituting one valuation method for another" }
      ]
    },
    {
      text: "What is 'increasing and diminishing returns' in real estate?",
      answer: "The principle that adding improvements to a property will increase value only up to a certain point, after which additional investment yields decreasing returns",
      explanation: "The principle of increasing and diminishing returns states that adding improvements to a property will increase value up to a certain point (increasing returns), after which additional investments yield smaller increases or even decreases in value (diminishing returns). For example, upgrading a kitchen might add significant value, but adding a fifth bedroom to a modest neighborhood home might not yield proportional returns.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The fluctuation of property values in the market" },
        { letter: "B", text: "The principle that adding improvements to a property will increase value only up to a certain point, after which additional investment yields decreasing returns" },
        { letter: "C", text: "The pattern of rising and falling interest rates" },
        { letter: "D", text: "The cyclical nature of real estate markets" }
      ]
    },
    {
      text: "What is 'balance' in real estate appraisal?",
      answer: "The principle that maximum value is achieved when the factors of production are in equilibrium",
      explanation: "The principle of balance states that maximum value is achieved when the four factors of production (land, labor, capital, and entrepreneurship) are in proper proportion. For example, an oversized house on a small lot or an elaborate house in a modest neighborhood represents an imbalance. The right combination of lot size, improvements, and amenities maximizes property value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The principle that maximum value is achieved when the factors of production are in equilibrium" },
        { letter: "B", text: "The equality between a buyer's offer and a seller's asking price" },
        { letter: "C", text: "The equal distribution of property features" },
        { letter: "D", text: "A balanced real estate market with neither a buyer's nor seller's advantage" }
      ]
    },
    {
      text: "What is 'surplus productivity' in real estate appraisal?",
      answer: "The principle that the net income remaining after the costs of labor, capital, and coordination have been paid belongs to the land",
      explanation: "The principle of surplus productivity states that after the costs of labor, capital, and entrepreneurship (coordination) have been paid from a property's income, any remaining net income is attributable to the land. This concept explains why land has value—it represents the surplus income or productivity after all other factors of production have been compensated.",
      categoryName: "Appraisal",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Extra profit generated by a real estate investment" },
        { letter: "B", text: "The principle that the net income remaining after the costs of labor, capital, and coordination have been paid belongs to the land" },
        { letter: "C", text: "Excess inventory in the housing market" },
        { letter: "D", text: "Additional features added to a property beyond what's necessary" }
      ]
    },
    {
      text: "What are the three approaches used in real estate appraisal?",
      answer: "Sales comparison approach, cost approach, and income approach",
      explanation: "The three standard approaches to real estate valuation are: 1) Sales Comparison Approach (comparing the subject property to similar recently sold properties), 2) Cost Approach (estimating the cost to replace the improvements plus land value), and 3) Income Approach (analyzing the property's income-generating potential). Appraisers typically use one or more of these approaches depending on property type and available data.",
      categoryName: "Appraisal",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Judicial approach, administrative approach, and market approach" },
        { letter: "B", text: "Sales comparison approach, cost approach, and income approach" },
        { letter: "C", text: "Taxation approach, insurance approach, and mortgage approach" },
        { letter: "D", text: "Physical approach, financial approach, and legal approach" }
      ]
    },
    {
      text: "Which approach to value is most appropriate for appraising a new, custom-built single-family residence?",
      answer: "Cost approach",
      explanation: "The cost approach is most appropriate for appraising new, custom-built homes because there may be few comparable sales for unique properties, and the cost of construction closely reflects current value since there's minimal depreciation. The cost approach estimates value by adding the land value to the cost of constructing the improvements, minus any depreciation.",
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
      text: "Which approach to value is typically most reliable for appraising a tract home in a subdivision with many recent similar sales?",
      answer: "Sales comparison approach",
      explanation: "The sales comparison approach is typically most reliable for appraising tract homes in subdivisions with many recent similar sales. This approach compares the subject property to recently sold comparable properties in the same area, making adjustments for differences. With numerous similar sales available, this approach provides strong market evidence of value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Cost approach" },
        { letter: "B", text: "Income approach" },
        { letter: "C", text: "Sales comparison approach" },
        { letter: "D", text: "Gross rent multiplier approach" }
      ]
    },
    {
      text: "Which approach to value is most appropriate for appraising an office building leased to multiple tenants?",
      answer: "Income approach",
      explanation: "The income approach is most appropriate for appraising income-producing properties like multi-tenant office buildings. This approach analyzes the property's income-generating potential, capitalizing the net operating income or discounting future cash flows to determine value. Since investors buy commercial properties primarily for their income potential, this approach best reflects their market value.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Cost approach" },
        { letter: "B", text: "Sales comparison approach" },
        { letter: "C", text: "Income approach" },
        { letter: "D", text: "Replacement value approach" }
      ]
    },
    {
      text: "What is 'highest and best use' in real estate appraisal?",
      answer: "The reasonable, legal use of vacant land or an improved property that produces the highest value",
      explanation: "Highest and best use is the reasonable, legal use of vacant land or an improved property that is physically possible, appropriately supported, financially feasible, and results in the highest value. This foundational appraisal concept recognizes that land should be valued based on its optimal use rather than its current use if they differ.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The most expensive property in a neighborhood" },
        { letter: "B", text: "The reasonable, legal use of vacant land or an improved property that produces the highest value" },
        { letter: "C", text: "The use preferred by the property owner" },
        { letter: "D", text: "The use that generates the most income without consideration of legality" }
      ]
    },
    {
      text: "What is the first test in determining highest and best use?",
      answer: "Legal permissibility",
      explanation: "Legal permissibility is the first test in determining highest and best use. Before considering any use, it must be legally permitted under current zoning, building codes, environmental regulations, deed restrictions, and other legal constraints. If a use isn't legally permissible, it cannot be the highest and best use regardless of its physical possibility, financial feasibility, or maximized productivity.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Physical possibility" },
        { letter: "B", text: "Financial feasibility" },
        { letter: "C", text: "Maximum productivity" },
        { letter: "D", text: "Legal permissibility" }
      ]
    },
    {
      text: "In the cost approach to value, what are the three types of depreciation?",
      answer: "Physical deterioration, functional obsolescence, and external obsolescence",
      explanation: "The three types of depreciation in the cost approach are: 1) Physical deterioration (wear and tear, aging of the structure), 2) Functional obsolescence (outdated features, poor design relative to market standards), and 3) External obsolescence (negative factors outside the property like economic downturns or undesirable neighboring uses). All three must be estimated and deducted from replacement cost.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Physical deterioration, functional obsolescence, and external obsolescence" },
        { letter: "B", text: "Tax depreciation, building depreciation, and land depreciation" },
        { letter: "C", text: "Linear depreciation, accelerated depreciation, and accumulated depreciation" },
        { letter: "D", text: "Roof depreciation, structural depreciation, and cosmetic depreciation" }
      ]
    },
    {
      text: "What is the formula for calculating value using the income approach's direct capitalization method?",
      answer: "Value = Net Operating Income ÷ Capitalization Rate",
      explanation: "The direct capitalization formula is: Value = Net Operating Income (NOI) ÷ Capitalization Rate. For example, if a property generates $100,000 in NOI and similar properties sell at an 8% cap rate, then Value = $100,000 ÷ 0.08 = $1,250,000. This method converts a single year's income into a value estimate based on the relationship between income and value in the market.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Value = Net Operating Income × Capitalization Rate" },
        { letter: "B", text: "Value = Net Operating Income ÷ Capitalization Rate" },
        { letter: "C", text: "Value = Gross Income × Capitalization Rate" },
        { letter: "D", text: "Value = Gross Income - Capitalization Rate" }
      ]
    },
    {
      text: "What is the formula for calculating the capitalization rate when market value and NOI are known?",
      answer: "Capitalization Rate = Net Operating Income ÷ Value",
      explanation: "The formula for calculating the capitalization rate is: Cap Rate = Net Operating Income (NOI) ÷ Value. For example, if a property sold for $2,000,000 and generates $160,000 in NOI, the cap rate is $160,000 ÷ $2,000,000 = 0.08 or 8%. This indicates the rate of return an investor would expect to receive on the investment.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Capitalization Rate = Value ÷ Net Operating Income" },
        { letter: "B", text: "Capitalization Rate = Net Operating Income ÷ Value" },
        { letter: "C", text: "Capitalization Rate = Value ÷ Gross Income" },
        { letter: "D", text: "Capitalization Rate = Net Operating Income × Value" }
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
  
  console.log('\n=========== MORE APPRAISAL QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreAppraisalQuestions()
  .then(() => {
    console.log('More appraisal questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more appraisal questions:', error);
    process.exit(1);
  });