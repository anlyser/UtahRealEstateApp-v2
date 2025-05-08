import * as fs from 'fs';
import * as path from 'path';
import { db } from '../db';
import * as schema from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

interface Question {
  text: string;
  answer: string;
  explanation: string;
  categoryName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: { letter: string; text: string }[];
}

// Function to get or create a category
async function getOrCreateCategory(name: string): Promise<number> {
  // Check if category exists
  const existingCategories = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, name));
  
  if (existingCategories.length > 0) {
    return existingCategories[0].id;
  }
  
  // Create new category
  const [newCategory] = await db
    .insert(schema.categories)
    .values({
      name,
      description: `Questions related to ${name}`,
    })
    .returning();
  
  return newCategory.id;
}

async function addKaplanQuestions() {
  console.log('Starting to add Kaplan Mock Exam questions...');
  
  // Check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Prepare the Kaplan questions (manually extracted from the file)
  const kaplanQuestions: Question[] = [
    // Additional questions from the Kaplan Mock Exam
    {
      text: "A father conveyed the family home to his daughter by will as a pur autre vie estate for the life of her mother. If the daughter should die before the mother, who gains possession of the property?",
      options: [
        { letter: "A", text: "Remainderman" },
        { letter: "B", text: "Mother" },
        { letter: "C", text: "Father's other children" },
        { letter: "D", text: "Daughter's heirs" }
      ],
      answer: "Daughter's heirs",
      explanation: "In a pur autre vie estate (an estate for the life of another), if the holder dies before the measuring life ends, the interest passes to the holder's heirs until the measuring life (in this case, the mother) ends.",
      categoryName: "Property Ownership",
      difficulty: "hard"
    },
    {
      text: "A man owned two acres of land. He sold one acre to a neighbor and reserved for himself an appurtenant easement over his neighbor's land for ingress and egress. The man's land",
      options: [
        { letter: "A", text: "is the servient tenement." },
        { letter: "B", text: "can be cleared of the easement when the man sells the withheld acre to a third party." },
        { letter: "C", text: "is the dominant tenement." },
        { letter: "D", text: "is subject to an easement in gross." }
      ],
      answer: "is the dominant tenement.",
      explanation: "In an appurtenant easement, the property that benefits from the easement is the dominant tenement, while the property burdened by the easement is the servient tenement. Here, the man's retained acre benefits from the easement over the neighbor's land.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "In a limited partnership,",
      options: [
        { letter: "A", text: "the number of investors is limited to 10." },
        { letter: "B", text: "the general partners run the business." },
        { letter: "C", text: "all the partners participate in running the business." },
        { letter: "D", text: "investors may participate with only a small amount of capital but with unlimited liability." }
      ],
      answer: "the general partners run the business.",
      explanation: "In a limited partnership, the general partners manage the business and have unlimited liability, while limited partners are investors who have limited liability and do not participate in management decisions.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "Which of the following parcels of land is the smallest?",
      options: [
        { letter: "A", text: "Two sections" },
        { letter: "B", text: "Two square miles" },
        { letter: "C", text: "1,280 acres" },
        { letter: "D", text: "5% of a township" }
      ],
      answer: "5% of a township",
      explanation: "A section is 640 acres, so two sections equal 1,280 acres. A square mile is also 640 acres, so two square miles also equal 1,280 acres. A township is 36 square miles or 23,040 acres, so 5% would be 1,152 acres, making it the smallest option.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "The current property taxes on a parcel are $1,743.25 and have not been paid. If the sale is to be closed on August 12, what is the approximate tax proration that will be charged to the seller based on a 360-day year?",
      options: [
        { letter: "A", text: "$1,074" },
        { letter: "B", text: "$1,104" },
        { letter: "C", text: "$1,220" },
        { letter: "D", text: "$668" }
      ],
      answer: "$1,074",
      explanation: "To calculate the tax proration: Through August 12 is 224 days (Jan 1 to Aug 12 using a 30-day month). $1,743.25 ÷ 360 days = $4.84 per day. $4.84 × 224 days = $1,084.16, which is closest to $1,074.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "A home mortgage loan closed on July 1 for $765,000 at 5.5% interest amortized over 25 years at $4,697.77 per month. Using a 360-day year, what would the principal amount be after the monthly payment was made August 1?",
      options: [
        { letter: "A", text: "$764,936.30" },
        { letter: "B", text: "$764,106.25" },
        { letter: "C", text: "$763,808.48" },
        { letter: "D", text: "$754,275.00" }
      ],
      answer: "$763,808.48",
      explanation: "Step 1: Calculate interest for July: $765,000 × 0.055 ÷ 12 = $3,506.25. Step 2: Calculate principal reduction: $4,697.77 - $3,506.25 = $1,191.52. Step 3: Calculate new principal: $765,000 - $1,191.52 = $763,808.48.",
      categoryName: "Finance",
      difficulty: "hard"
    },
    {
      text: "An appraiser estimated the replacement cost new of a building at $560,000. The building has an estimated economic life of 40 years and an estimated remaining life of 30 years. What is the current value of the building?",
      options: [
        { letter: "A", text: "$140,000" },
        { letter: "B", text: "$392,000" },
        { letter: "C", text: "$420,000" },
        { letter: "D", text: "$560,000" }
      ],
      answer: "$420,000",
      explanation: "Using straight-line depreciation: The building has been standing for 10 years (40 years economic life - 30 years remaining). Depreciation is 10 years ÷ 40 years = 25%. Value after depreciation is $560,000 × (1 - 0.25) = $560,000 × 0.75 = $420,000.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "A business tenant pays 2% of his total gross sales volume as rent, with a minimum base rental of $1,000 per month. In the past year, his sales totaled $435,000. How much rent did he pay?",
      options: [
        { letter: "A", text: "$12,000" },
        { letter: "B", text: "$8,460" },
        { letter: "C", text: "$8,700" },
        { letter: "D", text: "$20,700" }
      ],
      answer: "$8,700",
      explanation: "Percentage rent calculation: $435,000 × 0.02 = $8,700. Since this is higher than the minimum base rental of $1,000 per month ($12,000 per year), the tenant pays $8,700.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "A lease provides that the tenant pays $760 minimum rent per month plus 4% of the gross sales in excess of $150,000 per year. If the tenant paid a total rent of $20,520 last year, what was the gross sales volume?",
      options: [
        { letter: "A", text: "$150,000" },
        { letter: "B", text: "$435,000" },
        { letter: "C", text: "$285,000" },
        { letter: "D", text: "$513,000" }
      ],
      answer: "$435,000",
      explanation: "Step 1: Calculate base rent: $760 × 12 = $9,120. Step 2: Calculate percentage rent: $20,520 - $9,120 = $11,400. Step 3: Since percentage rent is 4% of sales over $150,000, then $11,400 ÷ 0.04 = $285,000 in excess sales. Step 4: Total sales = $150,000 + $285,000 = $435,000.",
      categoryName: "Practice",
      difficulty: "hard"
    },
    {
      text: "According to a broker's comparative market analysis (CMA), a property is worth $225,000. The homeowner bought the property for $190,000 and added $50,000 in improvements, for a total of $240,000. The property sold for $222,500. Which amount represents the property's market price?",
      options: [
        { letter: "A", text: "$190,000" },
        { letter: "B", text: "$222,500" },
        { letter: "C", text: "$225,000" },
        { letter: "D", text: "$240,000" }
      ],
      answer: "$222,500",
      explanation: "Market price is the actual amount a buyer pays for a property in an arm's-length transaction. In this case, the property sold for $222,500, which is the market price, regardless of the CMA estimate or the owner's investment.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "A suburban home with four bedrooms and only one bathroom suffers from what condition?",
      options: [
        { letter: "A", text: "Curable physical deterioration" },
        { letter: "B", text: "Incurable physical deterioration" },
        { letter: "C", text: "Functional obsolescence" },
        { letter: "D", text: "External obsolescence" }
      ],
      answer: "Functional obsolescence",
      explanation: "Functional obsolescence refers to a loss in value due to outdated features or poor design within the property itself. A four-bedroom home with only one bathroom does not meet modern expectations and standards, creating a functional deficiency.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "A house sold for $180,000 and the buyer obtained an FHA-insured mortgage loan for $120,000. If the lender charged two discount points, the buyer would pay",
      options: [
        { letter: "A", text: "$1,200." },
        { letter: "B", text: "$1,000." },
        { letter: "C", text: "$2,400." },
        { letter: "D", text: "$1,800." }
      ],
      answer: "$2,400.",
      explanation: "Discount points are calculated as a percentage of the loan amount. Each point equals 1% of the loan. For two points: $120,000 × 0.02 = $2,400.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "A buyer bought a house for $125,000. The house, which had originally sold for $118,250, appraised for $122,500. Based on these facts, if the buyer applies for an 80% mortgage, what will be the amount of the loan?",
      options: [
        { letter: "A", text: "$94,600" },
        { letter: "B", text: "$98,000" },
        { letter: "C", text: "$100,000" },
        { letter: "D", text: "$106,750" }
      ],
      answer: "$98,000",
      explanation: "The loan amount is 80% of the purchase price or appraised value, whichever is lower. Since the purchase price ($125,000) is higher than the appraised value ($122,500), the loan would be based on the appraised value: $122,500 × 0.80 = $98,000.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "In what way does a deed of trust differ from a mortgage?",
      options: [
        { letter: "A", text: "Number of parties involved in the loan" },
        { letter: "B", text: "Obligation of the borrower to repay the funds" },
        { letter: "C", text: "Redemption rights allowed after foreclosure" },
        { letter: "D", text: "Time period permitted to cure a default" }
      ],
      answer: "Number of parties involved in the loan",
      explanation: "A deed of trust involves three parties: the borrower (trustor), the lender (beneficiary), and a neutral third party (trustee) who holds legal title until the loan is paid. A mortgage involves only two parties: the borrower (mortgagor) and the lender (mortgagee).",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "A document that protects against hidden risks such as forgeries and loss due to defects in the title, subject to specific exceptions, is called",
      options: [
        { letter: "A", text: "a chain of title." },
        { letter: "B", text: "a title insurance policy." },
        { letter: "C", text: "an abstract of title." },
        { letter: "D", text: "a certificate of title." }
      ],
      answer: "a title insurance policy.",
      explanation: "A title insurance policy provides financial protection against loss due to title defects, liens, and other encumbrances that may not have been discovered during the title search. The other options are documents that show title history but don't provide financial protection.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "The type of title insurance that will protect the owner and heirs is called",
      options: [
        { letter: "A", text: "a lender's policy." },
        { letter: "B", text: "a leasehold policy." },
        { letter: "C", text: "an owner's policy." },
        { letter: "D", text: "a certificate of sale policy." }
      ],
      answer: "an owner's policy.",
      explanation: "An owner's title insurance policy protects the property owner and their heirs against covered title defects for as long as they own the property. A lender's policy only protects the lender's interest, not the owner's.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "The clause in the deed that defines the ownership is the",
      options: [
        { letter: "A", text: "granting clause." },
        { letter: "B", text: "habendum clause." },
        { letter: "C", text: "appurtenance clause." },
        { letter: "D", text: "acknowledgment." }
      ],
      answer: "habendum clause.",
      explanation: "The habendum clause (often beginning with 'to have and to hold') defines the extent of ownership being transferred and any limitations on that ownership. The granting clause identifies the parties and conveys the property, but the habendum clause specifies the type of estate.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "A woman bought acreage but never saw it and did not use it; although, she regularly paid the real estate taxes on it. Without her knowledge, a man moved his mobile home onto the property, drilled a well for water, and lived there for many years. The man may have become the owner of the acreage if he complied with state laws regarding",
      options: [
        { letter: "A", text: "adverse possession." },
        { letter: "B", text: "intestate succession." },
        { letter: "C", text: "the statute of frauds." },
        { letter: "D", text: "the statute of limitations." }
      ],
      answer: "adverse possession.",
      explanation: "Adverse possession allows someone to claim ownership of land if they openly occupy it without permission for a statutory period (varies by state), typically requiring possession that is actual, open, notorious, exclusive, continuous, and hostile to the true owner's rights.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "A grantor does NOT wish to convey certain property rights. The grantor may note the exceptions in the",
      options: [
        { letter: "A", text: "a separate document." },
        { letter: "B", text: "purchase agreement." },
        { letter: "C", text: "listing agreement." },
        { letter: "D", text: "deed of conveyance." }
      ],
      answer: "deed of conveyance.",
      explanation: "When a grantor wishes to retain certain property rights, such as mineral rights or an easement, these exceptions should be specifically noted in the deed of conveyance, which is the legal document that transfers ownership.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "In which of the following situations could a quitclaim deed NOT be used?",
      options: [
        { letter: "A", text: "To convey title" },
        { letter: "B", text: "To release a nominal real estate interest" },
        { letter: "C", text: "To remove a cloud on title" },
        { letter: "D", text: "To warrant that a title is valid" }
      ],
      answer: "To warrant that a title is valid",
      explanation: "A quitclaim deed conveys whatever interest the grantor may have without warranties or guarantees. It cannot be used to warrant that a title is valid, as it makes no promises about the quality of the title being transferred.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "Under the terms of a trust established by a will, the trustee is required to sell the real estate the trust holds. The deed that will be delivered at settlement of such a sale is a",
      options: [
        { letter: "A", text: "deed of release." },
        { letter: "B", text: "warranty deed." },
        { letter: "C", text: "trustee's deed." },
        { letter: "D", text: "trustor's deed." }
      ],
      answer: "trustee's deed.",
      explanation: "A trustee's deed is used when property is sold by a trustee acting on behalf of a trust. It conveys the interest that the trust held in the property to the buyer.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "An option is granted when an owner gives the potential purchaser the right to purchase the property",
      options: [
        { letter: "A", text: "at any time or price." },
        { letter: "B", text: "at a fixed price within a certain period of time." },
        { letter: "C", text: "without making any official record of the purchase." },
        { letter: "D", text: "none of these." }
      ],
      answer: "at a fixed price within a certain period of time.",
      explanation: "An option contract gives the potential buyer the right, but not the obligation, to purchase property at a predetermined price within a specified time period. The seller is obligated to sell if the buyer exercises the option.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "Which of the following best defines depreciation?",
      options: [
        { letter: "A", text: "Loss in value from any cause" },
        { letter: "B", text: "Loss in value due to physical deterioration only" },
        { letter: "C", text: "Tax deduction allowed for investment property" },
        { letter: "D", text: "Decrease in value due to poor location" }
      ],
      answer: "Loss in value from any cause",
      explanation: "Depreciation in real estate refers to the loss in value of a property from any cause, including physical deterioration, functional obsolescence, and external/economic obsolescence. The tax concept of depreciation is separate from its appraisal meaning.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "What is the primary purpose of RESPA (Real Estate Settlement Procedures Act)?",
      options: [
        { letter: "A", text: "To prevent discrimination in housing" },
        { letter: "B", text: "To regulate closing procedures and costs" },
        { letter: "C", text: "To establish licensing requirements for agents" },
        { letter: "D", text: "To set standards for property inspections" }
      ],
      answer: "To regulate closing procedures and costs",
      explanation: "RESPA was enacted to provide homebuyers and sellers with information on real estate settlement costs and to eliminate abusive practices in the settlement process. It requires lenders to disclose certain information and prohibits kickbacks.",
      categoryName: "Federal Regulations",
      difficulty: "medium"
    },
    {
      text: "The 'doctrine of emblements' refers to",
      options: [
        { letter: "A", text: "The right to harvest annual crops" },
        { letter: "B", text: "The transfer of riparian rights" },
        { letter: "C", text: "The use of fixtures on property" },
        { letter: "D", text: "The ownership of subsurface minerals" }
      ],
      answer: "The right to harvest annual crops",
      explanation: "The doctrine of emblements gives a tenant farmer who planted crops the right to enter the land and harvest those crops even after the lease has terminated, as long as the termination was not due to the tenant's actions.",
      categoryName: "Property Ownership",
      difficulty: "hard"
    },
    {
      text: "A deed that provides the MOST protection to the grantee is a",
      options: [
        { letter: "A", text: "general warranty deed." },
        { letter: "B", text: "special warranty deed." },
        { letter: "C", text: "quitclaim deed." },
        { letter: "D", text: "trustee's deed." }
      ],
      answer: "general warranty deed.",
      explanation: "A general warranty deed provides the most protection to the buyer (grantee) because it contains the broadest warranties. The grantor warrants against all defects in title for the entire history of the property, not just during their period of ownership.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "The broker receives an earnest money deposit with a written offer to purchase that includes a 10-day acceptance clause. On the fifth day, before the offer is accepted, the buyer notifies the broker that she is withdrawing the offer and demands the return of her earnest money deposit. In this situation, the",
      options: [
        { letter: "A", text: "buyer cannot withdraw the offer because it must be held open for the full 10 days." },
        { letter: "B", text: "buyer can withdraw the offer and is entitled to a refund of the earnest money." },
        { letter: "C", text: "broker can keep the earnest money as compensation for time spent." },
        { letter: "D", text: "seller can accept the offer even after the buyer withdraws it." }
      ],
      answer: "buyer can withdraw the offer and is entitled to a refund of the earnest money.",
      explanation: "An offer can be withdrawn at any time before acceptance, even if it contains an acceptance period. The acceptance period only limits how long the seller has to respond, not how long the buyer must keep the offer open.",
      categoryName: "Contracts",
      difficulty: "medium"
    },
    {
      text: "What is the purpose of a plat map?",
      options: [
        { letter: "A", text: "To show property tax assessments" },
        { letter: "B", text: "To display the subdivision of land into lots" },
        { letter: "C", text: "To indicate zoning restrictions" },
        { letter: "D", text: "To document property ownership history" }
      ],
      answer: "To display the subdivision of land into lots",
      explanation: "A plat map is a diagram showing how a tract of land is divided into lots. It shows the boundaries, lot numbers, streets, easements, and sometimes other features like dimensions and setback requirements.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is the primary purpose of a listing agreement?",
      options: [
        { letter: "A", text: "To establish the sale price of the property" },
        { letter: "B", text: "To create a contract between the seller and buyer" },
        { letter: "C", text: "To establish an employment contract between the seller and broker" },
        { letter: "D", text: "To transfer ownership of the property" }
      ],
      answer: "To establish an employment contract between the seller and broker",
      explanation: "A listing agreement is an employment contract between a property owner (seller) and a real estate broker, authorizing the broker to find a buyer for the property under specified terms. It creates an agency relationship.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "What does the term 'procuring cause' mean in real estate?",
      options: [
        { letter: "A", text: "The broker who initially listed the property" },
        { letter: "B", text: "The broker who obtains the final offer on a property" },
        { letter: "C", text: "The uninterrupted series of events leading to a sale" },
        { letter: "D", text: "The agent who shows the property most frequently" }
      ],
      answer: "The uninterrupted series of events leading to a sale",
      explanation: "Procuring cause refers to the uninterrupted series of events that leads to a completed transaction. The broker who is the procuring cause of the sale is generally entitled to the commission, regardless of which broker wrote the final offer.",
      categoryName: "Practice",
      difficulty: "medium"
    },
      explanation: "Sales associates always act on behalf of their broker, not directly with clients. The broker is the one who has the contractual relationship with the property owner.",
      categoryName: "Agency",
      difficulty: "medium"
    },
    {
      text: "The commission on the sale of a house is $9,410, and 30% goes to the broker who listed the property. Of the remainder, the broker whose sales associate completed the transaction gets 45%, and the sales associate receives the balance. How much does the sales associate who made the sale receive?",
      options: [
        { letter: "A", text: "$4,389" },
        { letter: "B", text: "$3,728" },
        { letter: "C", text: "$3,622.85" },
        { letter: "D", text: "$2,425" }
      ],
      answer: "$3,622.85",
      explanation: "Step 1: $9,410 × 0.30 = $2,823 (listing broker's share). Step 2: $9,410 - $2,823 = $6,587 (remaining amount). Step 3: $6,587 × 0.45 = $2,964.15 (selling broker's share). Step 4: $6,587 - $2,964.15 = $3,622.85 (sales associate's share).",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "The type of real estate ownership that is MOST all-inclusive is a",
      options: [
        { letter: "A", text: "life estate." },
        { letter: "B", text: "fee simple estate." },
        { letter: "C", text: "conditional fee estate" },
        { letter: "D", text: "reversionary interest." }
      ],
      answer: "fee simple estate.",
      explanation: "Fee simple estate is the highest form of ownership in real estate, giving the owner complete and unrestricted rights to the property, including the right to sell, lease, or transfer it at will.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is a deed of trust?",
      options: [
        { letter: "A", text: "A document that transfers real property upon death" },
        { letter: "B", text: "A security instrument that involves three parties" },
        { letter: "C", text: "A method to avoid probate" },
        { letter: "D", text: "A form of joint ownership" }
      ],
      answer: "A security instrument that involves three parties",
      explanation: "A deed of trust is a security instrument used in some states instead of a mortgage. It involves three parties: the borrower (trustor), the lender (beneficiary), and a neutral third party (trustee) who holds legal title until the loan is paid.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What is the purpose of a quitclaim deed?",
      options: [
        { letter: "A", text: "To provide full title warranties" },
        { letter: "B", text: "To release any interest the grantor may have in a property" },
        { letter: "C", text: "To transfer ownership to a trust" },
        { letter: "D", text: "To establish a life estate" }
      ],
      answer: "To release any interest the grantor may have in a property",
      explanation: "A quitclaim deed conveys only whatever interest the grantor may have in the property, if any, without warranties or guarantees. It's often used to clear up title issues or to release potential claims.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is an encumbrance in real estate?",
      options: [
        { letter: "A", text: "A claim or liability that affects or limits title to property" },
        { letter: "B", text: "A type of ownership interest" },
        { letter: "C", text: "A form of deed" },
        { letter: "D", text: "The process of transferring property" }
      ],
      answer: "A claim or liability that affects or limits title to property",
      explanation: "An encumbrance is anything that affects or limits the title to property, such as liens, easements, or restrictive covenants. It can affect the property's value or transferability.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is a title insurance policy?",
      options: [
        { letter: "A", text: "A document establishing property ownership" },
        { letter: "B", text: "Protection against physical damage to property" },
        { letter: "C", text: "Insurance that protects against title defects" },
        { letter: "D", text: "A type of homeowners insurance" }
      ],
      answer: "Insurance that protects against title defects",
      explanation: "Title insurance is a policy that protects the insured (either the lender or the owner) against financial loss due to defects in the title, such as liens, encumbrances, or ownership disputes that weren't discovered during the title search.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What is an appurtenant easement?",
      options: [
        { letter: "A", text: "An easement that benefits a specific parcel of land" },
        { letter: "B", text: "An easement that benefits a specific person" },
        { letter: "C", text: "A temporary right of way" },
        { letter: "D", text: "A government restriction on property use" }
      ],
      answer: "An easement that benefits a specific parcel of land",
      explanation: "An appurtenant easement is attached to the land and transfers with it when ownership changes. It benefits a specific parcel of land (the dominant tenement) and burdens another parcel (the servient tenement).",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What does the doctrine of adverse possession allow?",
      options: [
        { letter: "A", text: "The right to exclude others from your property" },
        { letter: "B", text: "The right to obtain title to another's property through open possession" },
        { letter: "C", text: "The right to use another's property with permission" },
        { letter: "D", text: "The right to challenge zoning regulations" }
      ],
      answer: "The right to obtain title to another's property through open possession",
      explanation: "Adverse possession allows someone to gain legal title to property they do not own by openly possessing it continuously for a statutory period (varies by state) without the owner's permission, paying property taxes, and treating it as their own.",
      categoryName: "Property Ownership",
      difficulty: "medium"
    },
    {
      text: "What is the purpose of a comparative market analysis (CMA)?",
      options: [
        { letter: "A", text: "To determine property tax value" },
        { letter: "B", text: "To establish a listing price for a property" },
        { letter: "C", text: "To verify a buyer's financing" },
        { letter: "D", text: "To calculate mortgage interest rates" }
      ],
      answer: "To establish a listing price for a property",
      explanation: "A comparative market analysis (CMA) is prepared by real estate agents to help sellers determine an appropriate listing price by analyzing similar properties that have recently sold, are pending sale, or are currently on the market.",
      categoryName: "Appraisal",
      difficulty: "medium"
    },
    {
      text: "What is the difference between actual cash value and replacement cost in insurance?",
      options: [
        { letter: "A", text: "Actual cash value includes depreciation, replacement cost does not" },
        { letter: "B", text: "Replacement cost is always lower than actual cash value" },
        { letter: "C", text: "Actual cash value is used only for commercial properties" },
        { letter: "D", text: "There is no difference; the terms are interchangeable" }
      ],
      answer: "Actual cash value includes depreciation, replacement cost does not",
      explanation: "Actual cash value (ACV) is the cost to replace the item minus depreciation for age and condition, while replacement cost provides enough to replace the item at current prices without deducting for depreciation.",
      categoryName: "Finance",
      difficulty: "medium"
    },
    {
      text: "What is the purpose of a property disclosure statement?",
      options: [
        { letter: "A", text: "To establish the sale price" },
        { letter: "B", text: "To inform buyers about known property defects" },
        { letter: "C", text: "To verify the boundaries of the property" },
        { letter: "D", text: "To estimate property taxes" }
      ],
      answer: "To inform buyers about known property defects",
      explanation: "A property disclosure statement is a document where sellers reveal known material defects in the property to potential buyers. This provides transparency and reduces the seller's liability for undisclosed issues.",
      categoryName: "Practice",
      difficulty: "medium"
    },
    {
      text: "What is the Fair Housing Act designed to prevent?",
      options: [
        { letter: "A", text: "Property tax increases" },
        { letter: "B", text: "Discrimination in housing" },
        { letter: "C", text: "Mortgage fraud" },
        { letter: "D", text: "Landlord-tenant disputes" }
      ],
      answer: "Discrimination in housing",
      explanation: "The Fair Housing Act prohibits discrimination in the sale, rental, or financing of housing based on race, color, national origin, religion, sex, familial status, or disability. It aims to provide equal housing opportunities for all.",
      categoryName: "Federal Regulations",
      difficulty: "medium"
    },
    {
      text: "What is RESPA (Real Estate Settlement Procedures Act)?",
      options: [
        { letter: "A", text: "A law requiring home inspections" },
        { letter: "B", text: "A federal law regulating closing procedures and costs" },
        { letter: "C", text: "A state licensing requirement" },
        { letter: "D", text: "A voluntary industry standard" }
      ],
      answer: "A federal law regulating closing procedures and costs",
      explanation: "RESPA is a federal law that requires lenders to provide borrowers with information about real estate settlement costs and prohibits certain practices, such as kickbacks, to protect consumers in the home buying process.",
      categoryName: "Federal Regulations",
      difficulty: "medium"
    }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorsCount = 0;
  
  // Process each question
  for (const question of kaplanQuestions) {
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
  
  console.log('\n=========== KAPLAN QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addKaplanQuestions()
  .then(() => {
    console.log('Kaplan Mock Exam questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding Kaplan questions:', error);
    process.exit(1);
  });