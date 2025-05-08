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

async function addPropertyOwnershipQuestions() {
  console.log('Starting to add property ownership questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define property ownership questions
  const questions: Question[] = [
    {
      text: "What is 'alluvion' in property law?",
      answer: "The gradual addition of land by natural water deposits",
      explanation: "Alluvion (also called accretion) is the gradual and imperceptible addition of land by natural deposits of soil through water action. When a river or stream carries soil and deposits it along a property's shore, the landowner gains ownership of this new land. This contrasts with avulsion, which is sudden land changes due to water action.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The gradual addition of land by natural water deposits" },
        { letter: "B", text: "The sudden loss of land due to flooding" },
        { letter: "C", text: "A type of property title defect" },
        { letter: "D", text: "A method of transferring property to heirs" }
      ]
    },
    {
      text: "What does the term 'emblements' refer to in property law?",
      answer: "Annual crops cultivated by human labor that belong to the tenant even after the lease ends",
      explanation: "Emblements are annual crops produced by labor and industry that belong to the tenant who planted them, even if the lease ends before harvest. This doctrine protects farmers who've invested work in crops. Emblements only apply to annual crops requiring cultivation (like corn or wheat), not natural growths (like fruit from trees).",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Decorative elements attached to a property" },
        { letter: "B", text: "Annual crops cultivated by human labor that belong to the tenant even after the lease ends" },
        { letter: "C", text: "Built-in furniture that conveys with real property" },
        { letter: "D", text: "National symbols placed on property" }
      ]
    },
    {
      text: "What is a 'remainder interest' in property?",
      answer: "A future interest that takes effect after a prior estate ends",
      explanation: "A remainder interest is a future interest in property that takes effect after a prior estate (typically a life estate) ends. For example, if property is granted 'to A for life, then to B,' B has a remainder interest that becomes possessory when A dies. Remainder interests can be created in deeds or wills.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The leftover mortgage balance" },
        { letter: "B", text: "A future interest that takes effect after a prior estate ends" },
        { letter: "C", text: "The remaining portion of a subdivided property" },
        { letter: "D", text: "Unpaid property taxes" }
      ]
    },
    {
      text: "What is 'color of title' in property law?",
      answer: "An instrument that appears to convey title but is actually defective",
      explanation: "Color of title refers to a written instrument (like a deed) that appears to transfer property ownership but contains a defect that makes it legally invalid. Despite being defective, color of title can be important for adverse possession claims, as many jurisdictions reduce the required possession period when the possessor has color of title.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A property title document printed on colored paper" },
        { letter: "B", text: "An instrument that appears to convey title but is actually defective" },
        { letter: "C", text: "A title that specifies the paint color requirements for a property" },
        { letter: "D", text: "A newly issued title certificate" }
      ]
    },
    {
      text: "What is a 'profit à prendre' in property law?",
      answer: "The right to take natural resources from another's land",
      explanation: "A profit à prendre (or simply 'profit') is a right to enter another's land and take natural resources like minerals, oil, timber, or game. Unlike an easement, which only allows use of the land, a profit allows removal of something valuable. Profits can exist as standalone interests or alongside easements.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A profit-sharing agreement between co-owners" },
        { letter: "B", text: "The right to take natural resources from another's land" },
        { letter: "C", text: "The profit made when selling property" },
        { letter: "D", text: "A French property deed" }
      ]
    },
    {
      text: "What does 'curtilage' refer to in property law?",
      answer: "The land immediately surrounding a house that is considered part of the home for legal purposes",
      explanation: "Curtilage is the land immediately surrounding a house that is used for household purposes, such as a yard, garden, or driveway. Courts consider curtilage to be part of the home for legal purposes, particularly regarding Fourth Amendment protections against unreasonable searches. The extent of curtilage depends on factors like proximity to the home, enclosures, use, and steps taken to ensure privacy.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The curtains and window treatments that convey with a property" },
        { letter: "B", text: "The land immediately surrounding a house that is considered part of the home for legal purposes" },
        { letter: "C", text: "A specific type of easement for access" },
        { letter: "D", text: "The boundary line between two properties" }
      ]
    },
    {
      text: "What is 'escheat' in property law?",
      answer: "The reversion of property to the state when a person dies without heirs or a will",
      explanation: "Escheat is the reversion of property to the state when a person dies without heirs or a will (intestate), or when the heirs are legally unable to inherit. This prevents property from becoming ownerless. Modern escheat laws typically require the state to hold the property for a period during which heirs can come forward and claim it.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The process of removing a lien from property" },
        { letter: "B", text: "A property tax assessment method" },
        { letter: "C", text: "The reversion of property to the state when a person dies without heirs or a will" },
        { letter: "D", text: "The transfer of property between family members" }
      ]
    },
    {
      text: "What is 'riparian rights' in property law?",
      answer: "The rights of landowners whose property borders flowing water",
      explanation: "Riparian rights are the rights of landowners whose property borders flowing water (rivers, streams, or lakes). These rights typically include access to and use of the waterfront, use of water for reasonable purposes, and protection against water pollution or diversion. Riparian rights are automatically included with ownership of waterfront property.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The rights of landowners whose property borders flowing water" },
        { letter: "B", text: "Rights to harvest ripe fruit on a property" },
        { letter: "C", text: "The right to tear down unauthorized structures on your property" },
        { letter: "D", text: "Protection against flooding damage" }
      ]
    },
    {
      text: "What is 'littoral rights' in property law?",
      answer: "The rights of landowners whose property borders oceans, seas, or large lakes",
      explanation: "Littoral rights are the rights of landowners whose property borders oceans, seas, or large lakes with more or less still waters (as opposed to flowing waters like rivers and streams). These rights include access to the water, use of the water, and accretions to the land. Littoral rights are similar to riparian rights but apply to different water bodies.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The rights of landowners whose property borders oceans, seas, or large lakes" },
        { letter: "B", text: "Rights related to literacy education on the property" },
        { letter: "C", text: "Rights to develop property literally as described in the deed" },
        { letter: "D", text: "Protection from light pollution" }
      ]
    },
    {
      text: "What is a 'tenancy at sufferance'?",
      answer: "A situation where a tenant remains in possession after their lease expires without the landlord's permission",
      explanation: "Tenancy at sufferance occurs when a tenant who had a legal right to possession continues to occupy the property after their lease expires without the landlord's permission or consent. Unlike trespassers, these tenants initially had lawful possession. However, they have no legal right to remain and can be evicted at any time, though formal eviction procedures must still be followed.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A tenancy created by court order during divorce proceedings" },
        { letter: "B", text: "A situation where a tenant remains in possession after their lease expires without the landlord's permission" },
        { letter: "C", text: "A lease that requires tenants to suffer inconveniences during property renovations" },
        { letter: "D", text: "A short-term rental agreement" }
      ]
    },
    {
      text: "What is a 'leasehold estate'?",
      answer: "A tenant's right to exclusive possession of a property for a specific period",
      explanation: "A leasehold estate is a tenant's right to exclusive possession and use of a property for a specified period, based on a lease agreement with the property owner. Unlike freehold estates (like fee simple), leaseholds are temporary interests. The three main types are estate for years (fixed term), periodic tenancy (renews automatically), and tenancy at will (no specific duration).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A tenant's right to exclusive possession of a property for a specific period" },
        { letter: "B", text: "A property that can only be leased, never sold" },
        { letter: "C", text: "Property owned by a leasing company" },
        { letter: "D", text: "A lease with an option to purchase" }
      ]
    },
    {
      text: "What is 'tenancy by the entirety'?",
      answer: "A form of ownership available only to married couples where each spouse owns the entire property",
      explanation: "Tenancy by the entirety is a form of ownership available only to married couples in some states. Under this arrangement, each spouse owns the entire property (not just a share), neither can sell their interest without the other's consent, and the property automatically transfers to the surviving spouse upon death. It also provides protection from creditors of just one spouse.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A form of ownership available only to married couples where each spouse owns the entire property" },
        { letter: "B", text: "A tenancy that includes the entire building and grounds" },
        { letter: "C", text: "Ownership by an entire family" },
        { letter: "D", text: "A form of co-ownership where each tenant owns an equal share" }
      ]
    },
    {
      text: "What is a 'covenant running with the land'?",
      answer: "A promise that binds future owners of the property",
      explanation: "A covenant running with the land is a promise or restriction that binds not just the original parties who made it, but also all future owners of the property. For a covenant to run with the land, it must typically touch and concern the land, the original parties must have intended it to bind successors, and there must be privity of estate between the original parties.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A promise that binds future owners of the property" },
        { letter: "B", text: "A pathway that crosses a property" },
        { letter: "C", text: "A biblical reference in an old property deed" },
        { letter: "D", text: "A marathon race that crosses multiple properties" }
      ]
    },
    {
      text: "What is a 'prescriptive easement'?",
      answer: "An easement acquired by open, continuous, and adverse use of another's property for a statutory period",
      explanation: "A prescriptive easement is an easement acquired by using another's property in an open, continuous, and adverse manner for a statutory period (typically 5-20 years depending on state law). Similar to adverse possession but resulting in an easement rather than ownership. The use must be without permission, as permission would make it a license rather than adverse use.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "An easement granted by a doctor's prescription" },
        { letter: "B", text: "An easement acquired by open, continuous, and adverse use of another's property for a statutory period" },
        { letter: "C", text: "An easement that prescribes specific uses of the property" },
        { letter: "D", text: "An easement granted by court order" }
      ]
    },
    {
      text: "What is 'constructive eviction'?",
      answer: "When a landlord's actions or failure to act makes the property uninhabitable",
      explanation: "Constructive eviction occurs when a landlord's actions or failure to act makes the premises uninhabitable or seriously interferes with the tenant's use, forcing them to leave. Examples include failing to provide heat, water, or electricity, or not addressing serious health or safety issues. When constructively evicted, tenants may terminate their lease without further obligation.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a landlord's actions or failure to act makes the property uninhabitable" },
        { letter: "B", text: "A construction-related reason for eviction" },
        { letter: "C", text: "An eviction carried out by a construction company" },
        { letter: "D", text: "The removal of a construction lien" }
      ]
    },
    {
      text: "What is 'emblements' in property law?",
      answer: "Annual crops that belong to a tenant even after a lease terminates",
      explanation: "Emblements are annual crops produced by a tenant's labor that remain the tenant's property even after the lease terminates unexpectedly. This doctrine protects agricultural tenants who've invested labor in growing crops. It applies only to crops requiring annual cultivation (like corn or wheat), not naturally growing products like fruit from trees.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "Decorative elements on a building's exterior" },
        { letter: "B", text: "Annual crops that belong to a tenant even after a lease terminates" },
        { letter: "C", text: "Flags and symbols placed on property" },
        { letter: "D", text: "Ornamental fixtures that convey with real estate" }
      ]
    },
    {
      text: "What is 'actual notice' in property law?",
      answer: "Direct, personal knowledge of a fact",
      explanation: "Actual notice is direct, personal knowledge of a fact. In property law, it refers to information a person definitely knows, whether through being told directly or personally observing. For example, a buyer has actual notice of an easement if they're explicitly told about it or observe power lines crossing the property. Actual notice binds a person regardless of whether public records exist.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A formal written notification" },
        { letter: "B", text: "Direct, personal knowledge of a fact" },
        { letter: "C", text: "A notice of default sent by certified mail" },
        { letter: "D", text: "Publication in a local newspaper" }
      ]
    },
    {
      text: "What is 'constructive notice' in property law?",
      answer: "Notice presumed by law due to proper recording in public records",
      explanation: "Constructive notice is legal presumption that a person knows information that is properly recorded in public records, whether or not they've actually seen it. Under recording statutes, properly recorded documents (like deeds or mortgages) provide constructive notice to the world of their contents. A buyer is deemed to know about recorded easements or liens even if they never checked the records.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Notice given during construction" },
        { letter: "B", text: "Notice presumed by law due to proper recording in public records" },
        { letter: "C", text: "A notice constructively delivered but not received" },
        { letter: "D", text: "A notice about property under construction" }
      ]
    },
    {
      text: "What are 'appurtenant rights' in property law?",
      answer: "Rights that run with the land and transfer automatically with property ownership",
      explanation: "Appurtenant rights are rights or privileges that are attached to land and transfer automatically when the property is sold. Unlike rights in gross (which belong to a specific person), appurtenant rights benefit the property itself, regardless of who owns it. Examples include appurtenant easements, water rights, and certain covenants.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Rights that must be applied for separately" },
        { letter: "B", text: "Rights that run with the land and transfer automatically with property ownership" },
        { letter: "C", text: "Rights that belong specifically to tenants" },
        { letter: "D", text: "Rights that are apparent upon visual inspection" }
      ]
    },
    {
      text: "What is 'equitable title' in property ownership?",
      answer: "The right to obtain full legal title to property, typically held by a buyer during a purchase transaction",
      explanation: "Equitable title is the beneficial interest and right to obtain full legal ownership of property. In a real estate purchase, the buyer typically gains equitable title when the purchase contract is signed, while the seller retains legal title until closing. Equitable title holders have certain ownership rights even before acquiring legal title.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A title that divides property equally among heirs" },
        { letter: "B", text: "The right to obtain full legal title to property, typically held by a buyer during a purchase transaction" },
        { letter: "C", text: "A title granted by a court of equity rather than a court of law" },
        { letter: "D", text: "A title that represents an equal partnership interest" }
      ]
    },
    {
      text: "What is a 'fee simple determinable' in property ownership?",
      answer: "An estate that automatically terminates if a specified condition occurs",
      explanation: "A fee simple determinable is a type of fee simple estate that automatically terminates if a specified condition occurs. For example, 'to School Board so long as the land is used for educational purposes' creates a fee simple determinable that automatically reverts to the grantor if the property ceases to be used for education. The key phrase 'so long as' indicates this type of estate.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "A fee that can be determined by a court" },
        { letter: "B", text: "An estate that automatically terminates if a specified condition occurs" },
        { letter: "C", text: "A fee established by a professional appraiser" },
        { letter: "D", text: "A simple, one-time fee for property transfer" }
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
  
  console.log('\n=========== PROPERTY OWNERSHIP QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addPropertyOwnershipQuestions()
  .then(() => {
    console.log('Property ownership questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding property ownership questions:', error);
    process.exit(1);
  });