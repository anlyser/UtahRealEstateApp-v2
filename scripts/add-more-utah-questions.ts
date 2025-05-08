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

async function addMoreUtahQuestions() {
  console.log('Starting to add more Utah-specific real estate questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more Utah-specific questions
  const questions: Question[] = [
    {
      text: "What is the standard earnest money amount in Utah residential real estate transactions?",
      answer: "1-3% of the purchase price, though it's negotiable",
      explanation: "In Utah, the standard earnest money deposit for residential transactions typically ranges from 1-3% of the purchase price. However, this amount is entirely negotiable between the parties and can vary based on market conditions, property value, and buyer/seller preferences. In competitive seller's markets, higher earnest money amounts might be offered to make a buyer's offer more attractive.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Always exactly $1,000" },
        { letter: "B", text: "1-3% of the purchase price, though it's negotiable" },
        { letter: "C", text: "10% of the purchase price" },
        { letter: "D", text: "Half of the down payment amount" }
      ]
    },
    {
      text: "In Utah, who typically holds the earnest money deposit?",
      answer: "The title company or real estate brokerage",
      explanation: "In Utah, earnest money is typically held in a trust account by either the title company that will be handling the closing or the real estate brokerage representing either party (often the listing brokerage). The holder of the earnest money acts as a neutral third party who will disburse the funds according to the terms of the contract upon closing or in case of contract termination according to the agreed-upon terms.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The seller" },
        { letter: "B", text: "The buyer's bank" },
        { letter: "C", text: "The title company or real estate brokerage" },
        { letter: "D", text: "The Utah Division of Real Estate" }
      ]
    },
    {
      text: "Under Utah law, what is the maximum permissible late fee for rental payments?",
      answer: "The greater of 10% of the rent amount or $75",
      explanation: "Under Utah Code § 57-22-5.5, landlords may charge a late fee for overdue rent that doesn't exceed the greater of $75 or 10% of the rent amount. This fee must be clearly stated in the written rental agreement, and landlords cannot assess daily late fees that would result in a total fee exceeding this cap. This law provides balance by allowing landlords to incentivize timely payments while protecting tenants from excessive penalties.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "20% of the rent amount" },
        { letter: "B", text: "The greater of 10% of the rent amount or $75" },
        { letter: "C", text: "A maximum of $50" },
        { letter: "D", text: "There is no legal maximum; it can be any amount specified in the lease" }
      ]
    },
    {
      text: "What is the minimum notice period for terminating a month-to-month tenancy in Utah?",
      answer: "15 days",
      explanation: "In Utah, either landlord or tenant must provide at least 15 days' written notice to terminate a month-to-month tenancy under Utah Code § 78B-6-802(1)(b)(i). This notice must end on the final day of a rental period (typically the last day of the month). This is shorter than many states' 30-day requirement. However, lease agreements can specify longer notice periods, and different rules apply to fixed-term leases or situations involving lease violations.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 days" },
        { letter: "B", text: "15 days" },
        { letter: "C", text: "30 days" },
        { letter: "D", text: "60 days" }
      ]
    },
    {
      text: "In Utah, what is the timeframe for a landlord to return a tenant's security deposit after move-out?",
      answer: "30 days, or 15 days if requested in writing by the tenant",
      explanation: "Under Utah Code § 57-17-3, landlords must return the tenant's security deposit (or provide an itemized list of deductions) within 30 days after the tenancy ends. However, if the tenant provides a written request for the deposit return and a forwarding address, the landlord must respond within 15 days of receiving this request. Landlords who fail to comply may be liable for the deposit amount plus a $100 penalty.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "7 days" },
        { letter: "B", text: "14 days" },
        { letter: "C", text: "30 days, or 15 days if requested in writing by the tenant" },
        { letter: "D", text: "45 days" }
      ]
    },
    {
      text: "Under Utah law, what is required for a valid real estate commission agreement?",
      answer: "It must be in writing and signed by the party to be charged",
      explanation: "Under Utah Code § 25-5-4(1)(e), a real estate commission agreement must be in writing and signed by the party to be charged (typically the seller or property owner) to be enforceable. This requirement is part of Utah's Statute of Frauds. Verbal commission agreements are not legally enforceable. The written agreement should clearly specify the commission rate or amount, the services to be performed, and the time period for the agreement.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "It must be in writing and signed by the party to be charged" },
        { letter: "B", text: "It must be verbally agreed to in front of witnesses" },
        { letter: "C", text: "It must be notarized" },
        { letter: "D", text: "It must be filed with the Utah Division of Real Estate" }
      ]
    },
    {
      text: "What is the foreclosure process most commonly used in Utah?",
      answer: "Non-judicial foreclosure",
      explanation: "Utah primarily uses non-judicial foreclosure, a process that allows lenders to foreclose on properties without court involvement if the deed of trust contains a power of sale clause. This process is typically faster and less expensive than judicial foreclosure. The process involves recording a notice of default, waiting a three-month period, publishing a notice of sale, and then conducting a public auction. Judicial foreclosure is also available but used less frequently in Utah.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Judicial foreclosure" },
        { letter: "B", text: "Non-judicial foreclosure" },
        { letter: "C", text: "Strict foreclosure" },
        { letter: "D", text: "Statutory redemption" }
      ]
    },
    {
      text: "What is the legal doctrine of 'prior appropriation' that governs water rights in Utah?",
      answer: "First in time, first in right",
      explanation: "Utah follows the doctrine of 'prior appropriation' for water rights, commonly summarized as 'first in time, first in right.' This means that those who first put water to beneficial use have senior rights over later users. During water shortages, senior water rights holders receive their full allocation before junior rights holders receive any water. This system differs from riparian rights used in eastern states, where water rights are tied to land ownership adjacent to water bodies.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Equal distribution among all users" },
        { letter: "B", text: "First in time, first in right" },
        { letter: "C", text: "Proportional allocation based on property size" },
        { letter: "D", text: "Riparian ownership" }
      ]
    },
    {
      text: "In Utah, what is a 'covenant of warranty' in a warranty deed?",
      answer: "A promise that the grantor will defend the title against all claims",
      explanation: "In Utah, a covenant of warranty in a warranty deed is the grantor's promise to defend the grantee's title against all legitimate claims. If someone challenges the grantee's title based on events that occurred before the property transfer, the grantor is legally obligated to defend the title and compensate the grantee for any losses if the defense is unsuccessful. This covenant provides buyers with the highest level of title protection available in property transfers.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A promise that the property is in good physical condition" },
        { letter: "B", text: "A promise that the grantor will defend the title against all claims" },
        { letter: "C", text: "A guarantee that the property complies with all zoning laws" },
        { letter: "D", text: "A warranty covering mechanical systems for one year" }
      ]
    },
    {
      text: "What is the primary purpose of the 'Utah Fit Premises Act'?",
      answer: "To establish minimum habitability standards for residential rental properties",
      explanation: "The Utah Fit Premises Act (Utah Code § 57-22) establishes minimum habitability standards for residential rental properties. It requires landlords to maintain properties in a condition fit for human habitation, including functioning plumbing, heating, electrical systems, and reasonable cleanliness. The Act also outlines remedies available to tenants when landlords fail to make necessary repairs, including rent abatement, repair-and-deduct options, and in severe cases, termination of the rental agreement.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "To regulate commercial property leases" },
        { letter: "B", text: "To establish minimum habitability standards for residential rental properties" },
        { letter: "C", text: "To establish fitness requirements for real estate licensees" },
        { letter: "D", text: "To mandate physical fitness facilities in all apartment complexes" }
      ]
    },
    {
      text: "What document is used for the majority of residential real estate purchases in Utah?",
      answer: "Real Estate Purchase Contract (REPC)",
      explanation: "The Real Estate Purchase Contract (REPC) is the standard document used for the majority of residential real estate purchases in Utah. This standardized form, approved by the Utah Division of Real Estate and developed by the Utah Association of REALTORS®, contains provisions addressing purchase price, financing, title, inspections, settlement deadlines, and other key terms. Using the standardized REPC helps ensure that transactions include all necessary legal protections and disclosures for both buyers and sellers.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Offer to Purchase" },
        { letter: "B", text: "Real Estate Purchase Contract (REPC)" },
        { letter: "C", text: "Utah Residential Agreement" },
        { letter: "D", text: "Buy-Sell Agreement" }
      ]
    },
    {
      text: "In Utah, what is the standard timeframe for a due diligence period in residential transactions?",
      answer: "Typically 10-14 days, but it's negotiable",
      explanation: "In Utah residential transactions, the due diligence period typically ranges from 10-14 days, though this timeframe is entirely negotiable between buyer and seller. During this period, outlined in the REPC (Real Estate Purchase Contract), buyers can conduct inspections, review HOA documents, research the property, and evaluate financing options. If they discover issues during this time, they can either negotiate repairs, ask for price reductions, or cancel the contract and receive their earnest money back.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "3 days" },
        { letter: "B", text: "7 days" },
        { letter: "C", text: "Typically 10-14 days, but it's negotiable" },
        { letter: "D", text: "30 days" }
      ]
    },
    {
      text: "What is the 'Utah Good Funds Law' in relation to real estate transactions?",
      answer: "A law requiring certain types of funds for real estate closings",
      explanation: "The Utah Good Funds Law (Utah Code § 31A-23a-406) requires that real estate closings be funded only with specific types of 'good funds' that have cleared or are guaranteed to clear. Acceptable funds include wire transfers, certified checks, cashier's checks, or checks drawn on a Utah law firm or title agency's trust account. The law protects all parties by ensuring that transactions close with funds that are immediately available and won't be reversed due to insufficient funds or other issues.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A law requiring certain types of funds for real estate closings" },
        { letter: "B", text: "A requirement that agents donate a portion of commissions to charity" },
        { letter: "C", text: "A regulation covering mortgage interest rates" },
        { letter: "D", text: "A fund that compensates victims of real estate fraud" }
      ]
    },
    {
      text: "What is required on the Utah Seller's Property Condition Disclosure form?",
      answer: "The seller must disclose known material defects",
      explanation: "On the Utah Seller's Property Condition Disclosure form, sellers must disclose all known material defects in the property. This includes issues with the structure, systems (electrical, plumbing, HVAC), water damage, environmental hazards, boundary disputes, and other conditions that might significantly affect the property's value or desirability. Sellers are only required to disclose what they actually know; they aren't obligated to hire inspectors to discover unknown issues, though they cannot knowingly conceal defects.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The seller must guarantee the property has no defects" },
        { letter: "B", text: "The seller must disclose known material defects" },
        { letter: "C", text: "The seller must list all renovations done to the property" },
        { letter: "D", text: "The seller must provide a professional home inspection report" }
      ]
    },
    {
      text: "In Utah, who typically pays for title insurance?",
      answer: "The seller pays for the owner's policy and the buyer pays for the lender's policy",
      explanation: "In Utah, the typical custom is that the seller pays for the owner's title insurance policy (which protects the buyer) and the buyer pays for the lender's title insurance policy (which protects the mortgage lender). However, this arrangement is customary rather than legally required and can be negotiated between the parties. Title insurance protects against financial loss from defects in title and is a standard part of most real estate transactions in Utah.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The buyer pays for both policies" },
        { letter: "B", text: "The seller pays for both policies" },
        { letter: "C", text: "The seller pays for the owner's policy and the buyer pays for the lender's policy" },
        { letter: "D", text: "The lender pays for both policies" }
      ]
    },
    {
      text: "What is the 'implied warranty of habitability' in Utah landlord-tenant law?",
      answer: "A legal doctrine requiring landlords to maintain rental properties in a habitable condition",
      explanation: "The implied warranty of habitability is a legal doctrine requiring landlords to maintain rental properties in a condition fit for human habitation, regardless of what the lease states. In Utah, this is enforced through the Fit Premises Act (Utah Code § 57-22). It requires landlords to provide functioning heating, plumbing, electricity, and hot water, maintain common areas, and promptly address serious health or safety issues. If these standards aren't met, tenants may have remedies including rent abatement or breaking the lease.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A legal doctrine requiring landlords to maintain rental properties in a habitable condition" },
        { letter: "B", text: "A warranty that guarantees tenants can inhabit a property for at least one year" },
        { letter: "C", text: "A required insurance policy for rental properties" },
        { letter: "D", text: "A rule stating that tenants can make their own repairs" }
      ]
    },
    {
      text: "What are 'covenants, conditions, and restrictions' (CC&Rs) in Utah real estate?",
      answer: "Legally enforceable rules governing the use of property in a community",
      explanation: "Covenants, conditions, and restrictions (CC&Rs) are legally enforceable rules governing the use of property within a planned community, subdivision, or condominium development. In Utah, CC&Rs typically regulate aspects like architectural standards, property use, maintenance requirements, parking rules, and pet policies. They're enforced by homeowners associations (HOAs) and are binding on current and future property owners. Potential buyers should carefully review CC&Rs before purchase as they can significantly impact property use and enjoyment.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Optional guidelines that homeowners can choose to follow" },
        { letter: "B", text: "Legally enforceable rules governing the use of property in a community" },
        { letter: "C", text: "Rules that only apply to rental properties" },
        { letter: "D", text: "Temporary restrictions during property development" }
      ]
    },
    {
      text: "What types of properties are exempt from the Utah Residential Rental Practices Act?",
      answer: "Temporary lodging, institutional facilities, and specific agricultural properties",
      explanation: "The Utah Residential Rental Practices Act (Utah Code § 57-22) exempts several property types: 1) Temporary lodging like hotels and motels, 2) Institutional facilities such as hospitals, group homes, and dormitories, 3) Agricultural properties where the primary purpose is farming and the building is incidental to that use, 4) Mobile home parks (covered by separate laws), and 5) Commercial properties. These exemptions recognize that different types of occupancy arrangements warrant different legal frameworks.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Single-family homes and duplexes" },
        { letter: "B", text: "Temporary lodging, institutional facilities, and specific agricultural properties" },
        { letter: "C", text: "Properties built before 1980" },
        { letter: "D", text: "Luxury apartments and condominiums" }
      ]
    },
    {
      text: "Under Utah law, how long does a real estate licensee need to maintain transaction records?",
      answer: "At least three years",
      explanation: "Under Utah Administrative Code R162-2f-401c, real estate licensees must maintain transaction records for at least three years following the closing of a transaction or the failure of a transaction to close. These records must be made available upon request by the Division of Real Estate during this period. The three-year retention requirement ensures documentation is available for potential dispute resolution, audits by the Division, or investigations into alleged misconduct.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "One year" },
        { letter: "B", text: "At least three years" },
        { letter: "C", text: "Five years" },
        { letter: "D", text: "Seven years" }
      ]
    },
    {
      text: "In Utah, what makes a non-competition agreement enforceable for real estate licensees?",
      answer: "It must be reasonable in time and geographic scope and protect legitimate business interests",
      explanation: "In Utah, a non-competition agreement between a broker and real estate agent is enforceable if: 1) It is reasonable in time (typically 1-2 years) and geographic scope (limited to areas where the brokerage actively operates), 2) It protects legitimate business interests like client relationships and confidential information rather than merely preventing competition, 3) It provides consideration (something of value) to the agent, and 4) It doesn't create an undue hardship for the agent or harm the public interest.",
      categoryName: "Utah State Law",
      difficulty: "medium",
      options: [
        { letter: "A", text: "It must be part of a written independent contractor agreement" },
        { letter: "B", text: "It must be reasonable in time and geographic scope and protect legitimate business interests" },
        { letter: "C", text: "It must be filed with the Utah Division of Real Estate" },
        { letter: "D", text: "Non-competition agreements are not enforceable for real estate licensees in Utah" }
      ]
    },
    {
      text: "What is an 'addendum' in Utah real estate contracts?",
      answer: "A separate document that modifies or adds to the terms of a contract",
      explanation: "An addendum in Utah real estate contracts is a separate document that modifies or adds to the terms of the original contract. It becomes part of the legal agreement when signed by all parties. Common addenda to the Utah Real Estate Purchase Contract (REPC) include the Seller Financing Addendum, FHA/VA Loan Addendum, Lead-Based Paint Disclosure for pre-1978 homes, and the Due Diligence Checklist. Addenda allow for customization of the standard contract to address specific circumstances or additional terms.",
      categoryName: "Utah State Law",
      difficulty: "easy",
      options: [
        { letter: "A", text: "A separate document that modifies or adds to the terms of a contract" },
        { letter: "B", text: "An appendix containing the legal description of the property" },
        { letter: "C", text: "Additional commission for the real estate agent" },
        { letter: "D", text: "A supplementary listing agreement" }
      ]
    },
    {
      text: "What is the purpose of the Utah Land Use Development and Management Act (LUDMA)?",
      answer: "To establish procedures for local land use planning and regulation",
      explanation: "The Utah Land Use Development and Management Act (LUDMA, Utah Code § 10-9a and § 17-27a) establishes procedures for municipal and county land use planning and regulation. It provides the legal framework for local governments to create general plans, adopt zoning ordinances, establish subdivision regulations, and make land use decisions. LUDMA balances property owners' rights with community needs by setting standards for land use regulation while ensuring due process through public hearings, appeal procedures, and transparent decision-making.",
      categoryName: "Utah State Law",
      difficulty: "hard",
      options: [
        { letter: "A", text: "To restrict foreign ownership of Utah land" },
        { letter: "B", text: "To establish procedures for local land use planning and regulation" },
        { letter: "C", text: "To manage federal lands within Utah's borders" },
        { letter: "D", text: "To preserve historic landmarks throughout the state" }
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
  
  console.log('\n=========== MORE UTAH QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMoreUtahQuestions()
  .then(() => {
    console.log('More Utah-specific questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more Utah-specific questions:', error);
    process.exit(1);
  });