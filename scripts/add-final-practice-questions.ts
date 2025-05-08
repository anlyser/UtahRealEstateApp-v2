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

async function addFinalPracticeQuestions() {
  console.log('Starting to add final practice questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define final practice questions
  const questions: Question[] = [
    {
      text: "What is 'subrogation' in property insurance?",
      answer: "The right of an insurer to pursue a third party that caused a loss to the insured",
      explanation: "Subrogation is the right of an insurer to pursue a third party that caused a loss to the insured after the insurer has paid the claim. For example, if a neighbor's tree falls and damages your roof, your insurance company pays your claim, then may pursue the neighbor or their insurance company to recover the amount paid. This prevents double recovery by the insured (collecting from both their insurer and the responsible party) and helps hold responsible parties accountable.",
      categoryName: "Practice",
      difficulty: "hard",
      options: [
        { letter: "A", text: "When one insurance company takes over another" },
        { letter: "B", text: "The right of an insurer to pursue a third party that caused a loss to the insured" },
        { letter: "C", text: "Substituting one insurance policy for another" },
        { letter: "D", text: "Subordinating one insurance claim to another" }
      ]
    },
    {
      text: "What is 'manufactured housing' in real estate?",
      answer: "Housing units built entirely in a factory according to HUD Code standards",
      explanation: "Manufactured housing refers to homes built entirely in a factory according to federal building standards known as the HUD Code (established by the National Manufactured Housing Construction and Safety Standards Act of 1974). These homes are constructed on a permanent chassis, transported to the site, and installed. Unlike modular homes (which meet state/local building codes), manufactured homes are identified by a red HUD certification label and data plate. They may be financed with chattel loans (personal property) or real estate loans if permanently affixed to land.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Any home built with manufactured (rather than natural) materials" },
        { letter: "B", text: "Housing units built entirely in a factory according to HUD Code standards" },
        { letter: "C", text: "Homes manufactured or produced before 1960" },
        { letter: "D", text: "Housing built using manufacturing industry specifications" }
      ]
    },
    {
      text: "What is a 'variance' in zoning regulations?",
      answer: "Legal permission to deviate from specific zoning requirements due to unique property circumstances",
      explanation: "A variance is legal permission granted by a zoning board to deviate from specific zoning requirements due to unique property circumstances that would cause undue hardship if the code were strictly applied. For example, if a lot has an unusual shape that prevents meeting setback requirements, the owner might receive a variance allowing construction closer to the property line. To obtain a variance, applicants typically must prove hardship not of their own creation that would prevent reasonable use of the property.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The difference between appraised and market value" },
        { letter: "B", text: "Legal permission to deviate from specific zoning requirements due to unique property circumstances" },
        { letter: "C", text: "The variation in property values within a neighborhood" },
        { letter: "D", text: "A difference of opinion between real estate professionals" }
      ]
    },
    {
      text: "What is a 'certificate of eligibility' in VA loans?",
      answer: "A document that verifies a veteran's eligibility for a VA-guaranteed loan",
      explanation: "A Certificate of Eligibility (COE) is an official document from the Department of Veterans Affairs that verifies a veteran or service member's eligibility for a VA-guaranteed home loan. It confirms military service requirements have been met and shows the entitlement amount available. Veterans, active-duty service members, and some surviving spouses can obtain a COE through the VA's eBenefits portal, VA-approved lenders, or by mail. This certificate is a required document for obtaining a VA loan.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A document that verifies a veteran's eligibility for a VA-guaranteed loan" },
        { letter: "B", text: "A certificate showing a property is eligible for VA financing" },
        { letter: "C", text: "An eligibility form for first-time homebuyers" },
        { letter: "D", text: "A certification that a home meets VA appraisal standards" }
      ]
    },
    {
      text: "What is a 'metes and bounds' description in real estate?",
      answer: "A legal description that defines property boundaries using directions, distances, and landmarks",
      explanation: "A metes and bounds description is a legal method of defining property boundaries using directions, distances, and landmarks. It typically starts at a point of beginning (POB) and traces the perimeter of the property, identifying boundary lines by compass bearings (metes) and measurements (bounds), often referencing natural or artificial monuments. This system, one of the oldest methods of land description, is common in the eastern United States and in irregularly shaped parcels where the rectangular survey system cannot be effectively applied.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A description of property that's bound by walls and fences" },
        { letter: "B", text: "A legal description that defines property boundaries using directions, distances, and landmarks" },
        { letter: "C", text: "A survey method measuring property in meters and property boundaries" },
        { letter: "D", text: "A basic measurement of property size without specific boundaries" }
      ]
    },
    {
      text: "What is a 'plat map' in real estate?",
      answer: "A map showing how a tract of land is divided into lots, with boundaries, easements, and streets",
      explanation: "A plat map is an official document that shows how a tract of land is divided into lots, including boundaries, dimensions, easements, streets, alleys, and other elements. Created during the subdivision process, plats are drawn by surveyors, approved by local governments, and recorded in county land records. They serve as a reference for legal descriptions, provide essential information for title research, and show property relationships with surrounding parcels. Plat maps are particularly important when researching new subdivisions or planned developments.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A floor plan of a platted apartment" },
        { letter: "B", text: "A map showing how a tract of land is divided into lots, with boundaries, easements, and streets" },
        { letter: "C", text: "A plastic-coated map used by outdoor real estate agents" },
        { letter: "D", text: "A map showing the placement of plants on a property" }
      ]
    },
    {
      text: "What is 'functional obsolescence' in property appraisal?",
      answer: "A reduction in value due to outdated or poor design features",
      explanation: "Functional obsolescence is a reduction in property value due to outdated or poor design features that diminish utility or desirability compared to contemporary standards. Examples include outdated floor plans (like closed kitchens in markets preferring open concepts), inadequate closet space, only one bathroom in a four-bedroom house, or outdated electrical systems. Unlike physical deterioration (which can be repaired), functional obsolescence often requires significant redesign or renovation. It's curable when the cost to fix is less than the added value; otherwise, it's incurable.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The natural aging of a building's functions" },
        { letter: "B", text: "A reduction in value due to outdated or poor design features" },
        { letter: "C", text: "When a building no longer functions for its intended purpose" },
        { letter: "D", text: "The retirement of older features in a building" }
      ]
    },
    {
      text: "What is 'external obsolescence' in property appraisal?",
      answer: "A reduction in property value caused by factors outside the property boundaries",
      explanation: "External obsolescence (also called economic or locational obsolescence) is a reduction in property value caused by factors outside the property boundaries. These factors might include proximity to nuisances (airports, highways, industrial areas), neighborhood decline, adverse zoning changes, market conditions, or oversupply of similar properties. Unlike functional obsolescence, external obsolescence cannot be cured by the property owner since the causes lie beyond their control. Appraisers must identify and quantify external factors when determining a property's value.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a property's exterior becomes visibly outdated" },
        { letter: "B", text: "A reduction in property value caused by factors outside the property boundaries" },
        { letter: "C", text: "The process of a building becoming obsolete from the outside in" },
        { letter: "D", text: "When external features are no longer functioning properly" }
      ]
    },
    {
      text: "What is a 'home warranty' in real estate transactions?",
      answer: "A service contract that covers repair or replacement of home systems and appliances for a specified period",
      explanation: "A home warranty is a service contract that covers repair or replacement of home systems (HVAC, electrical, plumbing) and appliances for a specified period, typically one year after purchase. Unlike homeowners insurance (which covers major perils like fire or theft), home warranties address normal wear and tear. Often purchased by sellers as a marketing incentive or by buyers for peace of mind, these plans require payment of a service fee (typically $75-125) for each repair visit. Coverage, exclusions, and terms vary significantly between warranty companies.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A guarantee from the builder that structural defects will be repaired" },
        { letter: "B", text: "A service contract that covers repair or replacement of home systems and appliances for a specified period" },
        { letter: "C", text: "A warranty deed guaranteeing clear title to the home" },
        { letter: "D", text: "Insurance covering the home against natural disasters" }
      ]
    },
    {
      text: "What is a 'mechanic's lien' in real estate?",
      answer: "A legal claim against property by contractors or suppliers who provided labor or materials but weren't paid",
      explanation: "A mechanic's lien is a legal claim against property by contractors, subcontractors, or material suppliers who provided labor or materials for improvements but weren't paid. These liens attach to the property and can prevent its sale or refinancing. Most states require contractors to provide preliminary notices about potential lien rights and have specific time limits for filing liens after work completion. Owners typically protect themselves by obtaining lien waivers from contractors as payment is made and/or using joint checks to ensure subcontractors and suppliers are paid.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lien placed on a car repair garage" },
        { letter: "B", text: "A legal claim against property by contractors or suppliers who provided labor or materials but weren't paid" },
        { letter: "C", text: "A lien placed by a mechanic who worked on the property" },
        { letter: "D", text: "A claim made by a mechanical engineer who designed the property" }
      ]
    },
    {
      text: "What is a 'builder's warranty'?",
      answer: "A guarantee provided by a home builder covering defects in construction",
      explanation: "A builder's warranty is a guarantee provided by a home builder covering defects in materials and workmanship for a specified period after construction. These warranties typically provide different coverage levels and durations for different home components: 1 year for workmanship and materials, 2 years for mechanical systems (electrical, plumbing, HVAC), and 10 years for major structural elements. Some builders provide these warranties directly, while others purchase third-party warranty coverage. Unlike home warranties, builder's warranties specifically address construction defects rather than normal wear and tear.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Insurance that builders must carry while constructing homes" },
        { letter: "B", text: "A guarantee provided by a home builder covering defects in construction" },
        { letter: "C", text: "A warranty for buildings constructed before 1950" },
        { letter: "D", text: "A guarantee that the builder will complete construction by a certain date" }
      ]
    },
    {
      text: "What is a 'punch list' in real estate?",
      answer: "A document listing minor tasks or repairs that need to be completed before final acceptance of construction",
      explanation: "A punch list is a document created near the end of construction listing minor tasks, repairs, or touch-ups that need to be completed before the project is considered finished. It's typically created during a walk-through inspection with the builder or contractor. Items might include touch-up painting, adjusting doors that don't close properly, fixing leaky faucets, or replacing damaged trim. The punch list serves as a checklist for final completion and is often tied to the final payment or occupancy approval for new construction.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A list of agents who have shown a property" },
        { letter: "B", text: "A document listing minor tasks or repairs that need to be completed before final acceptance of construction" },
        { letter: "C", text: "A list of marketing points for a property" },
        { letter: "D", text: "A checklist used during home inspections" }
      ]
    },
    {
      text: "What is a 'right of rescission' in real estate financing?",
      answer: "A borrower's right to cancel certain home loans within three business days after closing",
      explanation: "The right of rescission is a borrower's legal right to cancel certain home loans within three business days after closing without penalty. Established by the Truth in Lending Act, this right applies to refinances, home equity loans, and HELOCs on primary residences, but not to purchase money loans (mortgages to buy homes) or loans on second homes or investment properties. This cooling-off period gives borrowers time to review loan terms and change their mind, protecting consumers from high-pressure tactics or unfavorable terms.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A seller's right to cancel a listing" },
        { letter: "B", text: "A borrower's right to cancel certain home loans within three business days after closing" },
        { letter: "C", text: "A lender's right to rescind a loan approval if conditions change" },
        { letter: "D", text: "An inspector's right to return for a second inspection" }
      ]
    },
    {
      text: "What is 'gentrification' in real estate?",
      answer: "The process of renovating and improving housing and retail in a deteriorated urban area, which often leads to increased property values and displacement of lower-income residents",
      explanation: "Gentrification is the process of renovating and improving housing and retail in a deteriorated urban area, leading to increased property values and an influx of wealthier residents, often displacing lower-income residents. This transformation typically includes renovated housing, new upscale businesses, improved infrastructure, and demographic shifts. While gentrification brings economic benefits (increased tax base, reduced crime, improved properties), it raises social equity concerns about displacement of long-time residents and loss of community culture, making it a controversial topic in urban planning and real estate development.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of renovating and improving housing and retail in a deteriorated urban area, which often leads to increased property values and displacement of lower-income residents" },
        { letter: "B", text: "Converting rural property to residential use" },
        { letter: "C", text: "The practice of marketing luxury properties to wealthy individuals" },
        { letter: "D", text: "A social gathering of real estate professionals to network" }
      ]
    },
    {
      text: "What is a 'triple net lease' (NNN) in commercial real estate?",
      answer: "A lease where the tenant pays all property expenses including taxes, insurance, and maintenance in addition to rent",
      explanation: "A triple net lease (NNN) is a commercial lease where the tenant pays all property expenses—taxes, insurance, and maintenance—in addition to base rent. This transfers virtually all property expenses and responsibilities to the tenant, unlike a gross lease where the landlord covers these costs. Triple net leases are common for single-tenant commercial properties (like standalone retail buildings) and typically have longer terms (10-25 years) with scheduled rent increases. They're attractive to investors seeking stable, passive income with minimal management responsibilities.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A lease where the tenant pays all property expenses including taxes, insurance, and maintenance in addition to rent" },
        { letter: "B", text: "A lease agreement that has been reviewed by three different attorneys" },
        { letter: "C", text: "A lease with three different tenants for the same property" },
        { letter: "D", text: "A lease that expires after three years" }
      ]
    },
    {
      text: "What is 'Section 8 housing'?",
      answer: "A federal housing program that provides rental assistance vouchers to low-income tenants",
      explanation: "Section 8 housing (officially the Housing Choice Voucher Program) is a federal program administered by HUD through local Public Housing Authorities that provides rental assistance to low-income households. Qualified tenants pay approximately 30% of their adjusted income for rent, with the voucher covering the remainder up to a set payment standard. Landlords participate voluntarily and must maintain properties to program standards. This program helps low-income families, elderly, and disabled individuals secure safe, decent housing in the private market that might otherwise be unaffordable to them.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Housing located in section 8 of a city's zoning map" },
        { letter: "B", text: "A federal housing program that provides rental assistance vouchers to low-income tenants" },
        { letter: "C", text: "Housing divided into 8 sections or units" },
        { letter: "D", text: "Housing built under Chapter 8 of the building code" }
      ]
    },
    {
      text: "What is a 'buyer's market' in real estate?",
      answer: "A market condition with more available properties than buyers, giving buyers an advantage",
      explanation: "A buyer's market is a market condition characterized by more available properties than buyers, giving buyers a competitive advantage. Typical features include properties staying on the market longer, price reductions, sellers more willing to negotiate terms, higher housing inventory (typically more than 6 months' supply), and greater concessions from sellers (like paying closing costs or making repairs). Such markets typically occur during economic downturns, periods of high interest rates, or areas experiencing population decline or overbuilding.",
      categoryName: "Practice",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A market condition with more available properties than buyers, giving buyers an advantage" },
        { letter: "B", text: "A store where buyers can purchase real estate directly" },
        { letter: "C", text: "A market limited only to buyers, with no sellers allowed" },
        { letter: "D", text: "A market where buyers must be pre-approved for mortgages" }
      ]
    },
    {
      text: "What is 'universal design' in real estate?",
      answer: "Creating environments and products usable by all people without the need for adaptation",
      explanation: "Universal design is an approach to creating environments and products usable by all people regardless of age, ability, or status, without the need for adaptation or specialized design. In real estate, this includes features like zero-step entrances, lever door handles, wider doorways, curbless showers, varied counter heights, and good lighting. Unlike accessibility modifications (which target specific disabilities), universal design creates spaces comfortable for everyone. As the population ages, universal design has gained popularity for creating homes where people can age in place.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A single design used universally across all properties in a development" },
        { letter: "B", text: "Creating environments and products usable by all people without the need for adaptation" },
        { letter: "C", text: "Architectural designs recognized universally around the world" },
        { letter: "D", text: "A universal standard for home inspections" }
      ]
    },
    {
      text: "What is 'egress' in real estate?",
      answer: "A means of exiting a property or building",
      explanation: "Egress refers to a means of exiting a property or building, which is crucial for safety in emergencies. Building codes specify egress requirements, including minimum window sizes in bedrooms (for emergency escapes), the number and placement of exits, door dimensions, and hallway widths. Proper egress is especially important for legal bedrooms, which must have windows meeting size requirements for emergency escape. Limited or improper egress can affect property value, insurability, financing, and may violate building codes, potentially requiring costly modifications.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A means of exiting a property or building" },
        { letter: "B", text: "The gradual wearing away of property boundaries" },
        { letter: "C", text: "A formal request to enter a property" },
        { letter: "D", text: "An eagle's nest on a property" }
      ]
    },
    {
      text: "What is a 'comprehensive plan' in community development?",
      answer: "A long-range policy document that guides a community's future growth and development",
      explanation: "A comprehensive plan is a long-range policy document that guides a community's future growth and development, typically looking 10-20 years ahead. Developed with public input and adopted by local governments, these plans address land use, transportation, housing, economic development, public facilities, and environmental resources. While not law itself, the comprehensive plan provides the foundation for zoning ordinances, subdivision regulations, and capital improvement plans. Real estate professionals should understand these plans as they influence property values, development opportunities, and investment potential.",
      categoryName: "Practice",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A detailed plan covering all aspects of a single real estate transaction" },
        { letter: "B", text: "A long-range policy document that guides a community's future growth and development" },
        { letter: "C", text: "A plan that comprehensively covers all real estate in a given area" },
        { letter: "D", text: "A comprehensive insurance plan for real estate" }
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
  
  console.log('\n=========== FINAL PRACTICE QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addFinalPracticeQuestions()
  .then(() => {
    console.log('Final practice questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding final practice questions:', error);
    process.exit(1);
  });