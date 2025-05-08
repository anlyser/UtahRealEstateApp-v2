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

async function addFinalComprehensiveQuestions() {
  console.log('Starting to add FINAL comprehensive real estate exam questions (Part 3)...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more comprehensive questions
  const questions: Question[] = [
    // Transfer of Title Questions
    {
      text: "What is 'marketable title' in real estate?",
      answer: "Title that is free from reasonable doubt and can be readily sold or mortgaged",
      explanation: "Marketable title is title to a property that is free from significant defects, encumbrances, or legal questions that would make a reasonable buyer hesitate to purchase it. It doesn't need to be perfect, but must be free from reasonable doubt about its validity.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Title that has been listed on the MLS" },
        { letter: "B", text: "Title that is free from reasonable doubt and can be readily sold or mortgaged" },
        { letter: "C", text: "Title owned by a marketing company" },
        { letter: "D", text: "Title that has been reviewed by an attorney" }
      ]
    },
    {
      text: "What is the purpose of a title insurance policy?",
      answer: "To protect against financial loss from defects in title",
      explanation: "Title insurance protects property owners and lenders against financial loss from defects in title, such as liens, encumbrances, or errors in public records. Unlike most insurance policies, title insurance primarily covers events that occurred before the policy was issued.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To provide property insurance" },
        { letter: "B", text: "To protect against financial loss from defects in title" },
        { letter: "C", text: "To guarantee future property value" },
        { letter: "D", text: "To insure mortgage payments" }
      ]
    },
    {
      text: "What is the difference between a lender's title policy and an owner's title policy?",
      answer: "A lender's policy protects only the lender's interest; an owner's policy protects the property owner",
      explanation: "A lender's title policy protects only the mortgage lender's interest in the property, up to the loan amount. An owner's title policy protects the property owner's equity and ownership rights for as long as they (or their heirs) own the property. Both policies are usually purchased at closing.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lender's policy costs more; an owner's policy costs less" },
        { letter: "B", text: "A lender's policy protects only the lender's interest; an owner's policy protects the property owner" },
        { letter: "C", text: "A lender's policy lasts longer; an owner's policy expires when the mortgage is paid" },
        { letter: "D", text: "A lender's policy is required by law; an owner's policy is optional" }
      ]
    },
    {
      text: "What is a 'cloud on title'?",
      answer: "Any claim or encumbrance that may impair the title to real property",
      explanation: "A cloud on title is any claim, encumbrance, or potential legal issue that might impair or affect the title to real property. Examples include liens, judgments, easements, or boundary disputes. These issues must be resolved to provide clear title to the buyer.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Any claim or encumbrance that may impair the title to real property" },
        { letter: "B", text: "A temporary deed restriction" },
        { letter: "C", text: "A problem with the property's septic system" },
        { letter: "D", text: "An issue with zoning regulations" }
      ]
    },
    {
      text: "What is a quitclaim deed used for?",
      answer: "To release a person's interest in a property without providing any warranties or guarantees",
      explanation: "A quitclaim deed transfers whatever interest the grantor may have in a property without any warranties or guarantees about the title. It's often used between family members, to clear up title issues, or when the grantor isn't sure what interest they actually have in the property.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To transfer property with full warranties" },
        { letter: "B", text: "To release a person's interest in a property without providing any warranties or guarantees" },
        { letter: "C", text: "To transfer property to a trust" },
        { letter: "D", text: "To transfer property upon death" }
      ]
    },
    
    // Math Questions
    {
      text: "A rectangular lot measures 125 feet by 150 feet. What is its area in square feet?",
      answer: "18,750 square feet",
      explanation: "To find the area of a rectangle, multiply the length by the width: 125 feet × 150 feet = 18,750 square feet. This calculation gives the total square footage of the lot.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "18,750 square feet" },
        { letter: "B", text: "275 square feet" },
        { letter: "C", text: "1,875 square feet" },
        { letter: "D", text: "27,500 square feet" }
      ]
    },
    {
      text: "A property taxes on a $245,000 property are $2,940 per year. What is the tax rate?",
      answer: "1.2%",
      explanation: "To calculate the tax rate, divide the annual tax amount by the property value: $2,940 ÷ $245,000 = 0.012 or 1.2%. This represents the percentage of the property's value that is paid in taxes annually.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "0.12%" },
        { letter: "B", text: "1.2%" },
        { letter: "C", text: "12%" },
        { letter: "D", text: "0.012%" }
      ]
    },
    {
      text: "If a broker charges a 6% commission on a $320,000 sale, how much commission will be paid?",
      answer: "$19,200",
      explanation: "To calculate the commission, multiply the sales price by the commission rate: $320,000 × 0.06 = $19,200. This is the total commission that will be paid to the broker, who will then typically split it with the agent(s) involved in the transaction.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "$1,920" },
        { letter: "B", text: "$19,200" },
        { letter: "C", text: "$192,000" },
        { letter: "D", text: "$32,000" }
      ]
    },
    {
      text: "A property sold for $250,000. The seller's mortgage payoff was $175,000, and closing costs were $15,000. What were the seller's net proceeds?",
      answer: "$60,000",
      explanation: "To calculate the seller's net proceeds, subtract the mortgage payoff and closing costs from the sale price: $250,000 - $175,000 - $15,000 = $60,000. This represents the amount the seller will receive after all obligations are paid.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "$75,000" },
        { letter: "B", text: "$60,000" },
        { letter: "C", text: "$190,000" },
        { letter: "D", text: "$235,000" }
      ]
    },
    {
      text: "How many acres are in a parcel of land that measures 330 feet by 660 feet?",
      answer: "5 acres",
      explanation: "To calculate acres, divide the square footage by 43,560 (the number of square feet in one acre): (330 feet × 660 feet) ÷ 43,560 = 217,800 ÷ 43,560 = 5 acres.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "2.5 acres" },
        { letter: "B", text: "5 acres" },
        { letter: "C", text: "10 acres" },
        { letter: "D", text: "21.78 acres" }
      ]
    },
    
    // Water Rights and Environmental
    {
      text: "In Utah, what does a water right include?",
      answer: "The right to divert and use a specific amount of water for a beneficial purpose",
      explanation: "In Utah, a water right includes the right to divert and use a specific amount of water for a beneficial purpose, from a particular source, with a specific priority date. The water right is defined by these elements and is considered real property that can be bought, sold, or transferred.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Ownership of the water source itself" },
        { letter: "B", text: "The right to divert and use a specific amount of water for a beneficial purpose" },
        { letter: "C", text: "Unlimited access to any water on the property" },
        { letter: "D", text: "Full control of all water flowing through the property" }
      ]
    },
    {
      text: "What is a 'beneficial use' of water in Utah?",
      answer: "Using water for a purpose that benefits society, such as irrigation, domestic use, or industry",
      explanation: "In Utah water law, beneficial use means using water for a purpose that provides benefits to society, such as irrigation, domestic use, municipal, industrial, power generation, recreation, or wildlife. Water rights in Utah are based on putting water to beneficial use—'use it or lose it.'",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Using water for a purpose that benefits society, such as irrigation, domestic use, or industry" },
        { letter: "B", text: "Using water only for environmental conservation" },
        { letter: "C", text: "Using water in ways that maximize property values" },
        { letter: "D", text: "Using water for recreational purposes only" }
      ]
    },
    {
      text: "What is an environmental impact statement (EIS)?",
      answer: "A document required by the National Environmental Policy Act for federal actions significantly affecting the environment",
      explanation: "An Environmental Impact Statement (EIS) is a detailed document that federal agencies must prepare for major actions significantly affecting the environment. It analyzes the environmental effects of proposed actions and alternatives, enabling informed decision-making and public input on environmental concerns.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A report prepared by a property inspector for a buyer" },
        { letter: "B", text: "A document required by the National Environmental Policy Act for federal actions significantly affecting the environment" },
        { letter: "C", text: "A disclosure form sellers must provide about environmental hazards" },
        { letter: "D", text: "A state permit for properties in flood zones" }
      ]
    },
    {
      text: "What is the purpose of a wetland delineation study?",
      answer: "To identify the boundaries of wetlands and determine if a property is subject to federal wetland regulations",
      explanation: "A wetland delineation study identifies the boundaries and extent of wetlands on a property, determining if it's subject to federal wetland regulations under the Clean Water Act. Development in protected wetlands requires permits from the Army Corps of Engineers and may be restricted or prohibited.",
      categoryName: "Federal Regulations",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To identify the boundaries of wetlands and determine if a property is subject to federal wetland regulations" },
        { letter: "B", text: "To assess flood risk on a property" },
        { letter: "C", text: "To determine if a property is suitable for agricultural use" },
        { letter: "D", text: "To identify water rights associated with a property" }
      ]
    },
    {
      text: "What is a 'watershed'?",
      answer: "An area of land that drains water to a specific body of water",
      explanation: "A watershed is an area of land where all precipitation drains to a common body of water such as a river, lake, or ocean. Watershed boundaries follow topographical features like ridges and hills. Development decisions in one part of a watershed can affect water quality and quantity elsewhere.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A building that stores water" },
        { letter: "B", text: "An area of land that drains water to a specific body of water" },
        { letter: "C", text: "A structure that prevents water damage" },
        { letter: "D", text: "A type of water right" }
      ]
    },
    
    // Property Management and Investment
    {
      text: "What is the vacancy rate of a property?",
      answer: "The percentage of rental units that are unoccupied",
      explanation: "The vacancy rate is the percentage of rental units in a property or market that are unoccupied. It's calculated by dividing the number of vacant units by the total number of units and multiplying by 100. A high vacancy rate may indicate problems with the property or market conditions.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The percentage of rental units that are unoccupied" },
        { letter: "B", text: "The amount of time a unit remains empty between tenants" },
        { letter: "C", text: "The rate at which tenants move out" },
        { letter: "D", text: "The percentage of rent lost due to unpaid rent" }
      ]
    },
    {
      text: "What is a 'cap rate' (capitalization rate) in real estate investing?",
      answer: "The ratio of a property's net operating income to its purchase price or current value",
      explanation: "The capitalization rate (cap rate) is the ratio of a property's annual net operating income (NOI) to its purchase price or current market value. It's calculated as: Cap Rate = NOI ÷ Property Value. The cap rate represents the expected return on an investment property, ignoring financing costs.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The maximum amount that can be charged for rent" },
        { letter: "B", text: "The ratio of a property's net operating income to its purchase price or current value" },
        { letter: "C", text: "The limit on how much a property's value can increase annually" },
        { letter: "D", text: "The percentage of the purchase price required as a down payment" }
      ]
    },
    {
      text: "What is the formula for calculating cash flow from an investment property?",
      answer: "Income - Operating Expenses - Debt Service = Cash Flow",
      explanation: "Cash flow is calculated by subtracting operating expenses and debt service (mortgage payments) from the total income. The formula is: Income - Operating Expenses - Debt Service = Cash Flow. Positive cash flow means the property generates more income than costs; negative means it costs more than it generates.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Income - Operating Expenses - Debt Service = Cash Flow" },
        { letter: "B", text: "Income - Property Taxes = Cash Flow" },
        { letter: "C", text: "Income × Occupancy Rate = Cash Flow" },
        { letter: "D", text: "Income - Depreciation = Cash Flow" }
      ]
    },
    {
      text: "What is 'depreciation' in real estate investment?",
      answer: "A tax deduction that allows investors to recover the cost of income-producing property over time",
      explanation: "Depreciation is a tax deduction that allows real estate investors to recover the cost of income-producing property over its useful life (27.5 years for residential property, 39 years for commercial). It's a non-cash expense that reduces taxable income but doesn't affect actual cash flow.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The decline in a property's market value over time" },
        { letter: "B", text: "A tax deduction that allows investors to recover the cost of income-producing property over time" },
        { letter: "C", text: "The reduction in rent due to property aging" },
        { letter: "D", text: "The decrease in a property's condition due to wear and tear" }
      ]
    },
    {
      text: "What is the 1% rule in rental property investing?",
      answer: "The monthly rent should be at least 1% of the property's purchase price",
      explanation: "The 1% rule is a quick screening tool for rental properties suggesting that monthly rent should be at least 1% of the purchase price (e.g., a $200,000 property should rent for at least $2,000/month). While not a comprehensive analysis, it helps investors quickly identify potentially profitable properties.",
      categoryName: "Appraisal",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Property taxes should not exceed 1% of the property value" },
        { letter: "B", text: "The monthly rent should be at least 1% of the property's purchase price" },
        { letter: "C", text: "Maintenance costs should be limited to 1% of annual rental income" },
        { letter: "D", text: "Property value should appreciate at least 1% annually" }
      ]
    },
    
    // Speciality Areas
    {
      text: "What is the primary advantage of a 1031 exchange in real estate?",
      answer: "It allows investors to defer capital gains taxes when selling one investment property and purchasing another",
      explanation: "A 1031 exchange (named after Section 1031 of the Internal Revenue Code) allows real estate investors to defer capital gains taxes when they sell an investment property and reinvest the proceeds in a similar 'like-kind' property. This enables investors to build wealth by preserving their equity for reinvestment.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "It allows investors to defer capital gains taxes when selling one investment property and purchasing another" },
        { letter: "B", text: "It eliminates all taxes on real estate transactions" },
        { letter: "C", text: "It reduces the down payment needed for investment properties" },
        { letter: "D", text: "It guarantees a 10.31% return on investment" }
      ]
    },
    {
      text: "What is a net lease in commercial real estate?",
      answer: "A lease where the tenant pays some or all of the property expenses in addition to rent",
      explanation: "A net lease is a commercial lease where the tenant pays some or all of the property expenses (like taxes, insurance, maintenance) in addition to rent. Common types include single net (tenant pays taxes), double net (taxes and insurance), and triple net (taxes, insurance, and maintenance).",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lease where the tenant pays some or all of the property expenses in addition to rent" },
        { letter: "B", text: "A lease where the landlord pays all expenses" },
        { letter: "C", text: "A lease calculated after deducting vacancy rates" },
        { letter: "D", text: "A lease with no security deposit required" }
      ]
    },
    {
      text: "What is the primary purpose of a homeowners association (HOA)?",
      answer: "To maintain common areas and enforce rules designed to preserve property values",
      explanation: "A Homeowners Association (HOA) is established to maintain common areas, amenities, and enforce community rules (covenants, conditions, and restrictions) designed to preserve property values and a consistent neighborhood standard. HOAs are typically governed by a board of homeowners elected by community members.",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To collect property taxes" },
        { letter: "B", text: "To maintain common areas and enforce rules designed to preserve property values" },
        { letter: "C", text: "To provide mortgage financing to homeowners" },
        { letter: "D", text: "To represent homeowners in legal disputes" }
      ]
    },
    {
      text: "What is a 'land bank' in real estate?",
      answer: "A public or community-owned entity that acquires, holds, and redevelops vacant or abandoned properties",
      explanation: "A land bank is a public or community-owned entity created to acquire, hold, manage, and sometimes redevelop vacant, abandoned, or foreclosed properties that might otherwise remain unused due to tax liens, title problems, or other issues. Land banks help reduce blight and return properties to productive use.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A public or community-owned entity that acquires, holds, and redevelops vacant or abandoned properties" },
        { letter: "B", text: "A financial institution specializing in land loans" },
        { letter: "C", text: "The practice of purchasing land for future development" },
        { letter: "D", text: "A government agency that registers land ownership" }
      ]
    },
    {
      text: "What is 'affordable housing' typically defined as?",
      answer: "Housing that costs no more than 30% of a household's income",
      explanation: "Affordable housing is generally defined as housing (including utilities) that costs no more than 30% of a household's gross income. When households pay more than this threshold, they're considered 'cost-burdened' and may have difficulty affording other necessities like food, transportation, and healthcare.",
      categoryName: "Federal Regulations",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Housing that costs no more than 30% of a household's income" },
        { letter: "B", text: "Housing priced below market value" },
        { letter: "C", text: "Housing built with government subsidies" },
        { letter: "D", text: "Housing for families earning less than $25,000 annually" }
      ]
    },
    
    // Technology and Marketing
    {
      text: "What is a virtual tour in real estate?",
      answer: "An interactive simulation of a property that allows viewers to move through it remotely",
      explanation: "A virtual tour is an interactive digital simulation of a property that allows potential buyers or renters to move through and explore the space remotely. Technologies used include 360-degree photos, videos, or 3D models. Virtual tours save time by helping buyers pre-screen properties before physical visits.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A video showing only the exterior of a property" },
        { letter: "B", text: "An interactive simulation of a property that allows viewers to move through it remotely" },
        { letter: "C", text: "A series of still photographs with music" },
        { letter: "D", text: "A computer-generated rendering of a future development" }
      ]
    },
    {
      text: "What is 'geofencing' in real estate marketing?",
      answer: "The practice of targeting digital ads to people within a specific geographic area",
      explanation: "Geofencing is a location-based marketing technique that defines virtual boundaries around specific geographic areas and delivers targeted ads to people when they enter those areas. For example, a real estate agent might geofence an open house to send ads to people nearby or target specific neighborhoods.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The practice of targeting digital ads to people within a specific geographic area" },
        { letter: "B", text: "Erecting physical barriers around a property" },
        { letter: "C", text: "Using GPS to create property boundary surveys" },
        { letter: "D", text: "Installing security perimeters around luxury homes" }
      ]
    },
    {
      text: "What is a CRM system in real estate?",
      answer: "Customer Relationship Management software used to organize and maintain client information and interactions",
      explanation: "A Customer Relationship Management (CRM) system is software that helps real estate professionals organize, track, and manage client information, communications, and interactions. It helps agents follow up with leads, schedule reminders, automate marketing, and maintain long-term relationships with clients.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Commercial Real Estate Management" },
        { letter: "B", text: "Customer Relationship Management software used to organize and maintain client information and interactions" },
        { letter: "C", text: "Contract Review Mechanism" },
        { letter: "D", text: "Compliance Regulation Monitoring" }
      ]
    },
    {
      text: "What is an IDX (Internet Data Exchange) in real estate?",
      answer: "A system that allows real estate websites to display MLS listings from other brokerages",
      explanation: "Internet Data Exchange (IDX) is a policy and technology that allows real estate brokers to display each other's listings on their websites. Through IDX, broker websites can show MLS listings from other participating brokers, increasing exposure for all properties while offering consumers convenient access to available properties.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A type of real estate tax deduction" },
        { letter: "B", text: "A system that allows real estate websites to display MLS listings from other brokerages" },
        { letter: "C", text: "An index that tracks real estate market performance" },
        { letter: "D", text: "Software for creating digital floor plans" }
      ]
    },
    {
      text: "What is 'drone photography' used for in real estate?",
      answer: "To capture aerial images and videos of properties and surrounding areas",
      explanation: "Drone photography uses unmanned aerial vehicles to capture high-quality aerial images and videos of properties, highlighting features that ground-level photography can't show effectively. Drones provide unique perspectives of large properties, acreage, outdoor features, neighborhood amenities, and surrounding areas.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "To monitor property for security purposes" },
        { letter: "B", text: "To capture aerial images and videos of properties and surrounding areas" },
        { letter: "C", text: "To measure exact property dimensions" },
        { letter: "D", text: "To deliver documents to clients" }
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
  
  console.log('\n=========== FINAL COMPREHENSIVE QUESTIONS ADDED (Part 3) ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalComprehensiveQuestions()
  .then(() => {
    console.log('Final comprehensive real estate questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final questions:', error);
    process.exit(1);
  });