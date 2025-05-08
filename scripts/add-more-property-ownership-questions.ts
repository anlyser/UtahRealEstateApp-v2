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

async function addMorePropertyOwnershipQuestions() {
  console.log('Starting to add more property ownership questions...');
  
  // First, check existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  const allQuestions = await db.select({ text: schema.questions.text }).from(schema.questions);
  
  for (const q of allQuestions) {
    existingQuestions.add(q.text.toLowerCase().trim());
  }
  
  console.log(`Found ${existingQuestions.size} existing questions in the database`);
  
  // Define more property ownership questions
  const questions: Question[] = [
    {
      text: "What is the difference between 'joint tenancy' and 'tenancy in common'?",
      answer: "Joint tenancy includes rights of survivorship, while tenancy in common does not",
      explanation: "The key difference between joint tenancy and tenancy in common is that joint tenancy includes rights of survivorship, while tenancy in common does not. In joint tenancy, when one owner dies, their interest automatically transfers to the surviving owners. In tenancy in common, each owner can will their share to anyone. Additionally, joint tenancy requires the four unities (time, title, interest, and possession), while tenancy in common allows owners to have different ownership percentages acquired at different times.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Joint tenancy includes rights of survivorship, while tenancy in common does not" },
        { letter: "B", text: "Tenancy in common is only for married couples, while joint tenancy is for unrelated parties" },
        { letter: "C", text: "Joint tenancy is only for commercial property, while tenancy in common is only for residential property" },
        { letter: "D", text: "Tenancy in common requires equal ownership shares, while joint tenancy allows for unequal shares" }
      ]
    },
    {
      text: "What is the primary characteristic of a 'fee simple absolute' estate?",
      answer: "The highest form of ownership with unlimited duration and the fewest restrictions on use, enjoyment, and transferability",
      explanation: "Fee simple absolute is the highest form of ownership interest in real property, characterized by unlimited duration and the fewest restrictions on use, enjoyment, and transferability. The owner has complete rights to use the property, sell it, lease it, mortgage it, or pass it to heirs. It's limited only by government powers (taxation, eminent domain, police power, escheat) and any voluntary restrictions like easements or covenants. This is the most common form of real estate ownership in the United States.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Ownership that automatically transfers to the state upon the owner's death" },
        { letter: "B", text: "The highest form of ownership with unlimited duration and the fewest restrictions on use, enjoyment, and transferability" },
        { letter: "C", text: "Ownership that can never be transferred to another party" },
        { letter: "D", text: "Ownership that terminates after a specified period of time" }
      ]
    },
    {
      text: "What is a 'defeasible fee' in property ownership?",
      answer: "An ownership interest that can be terminated if a specified condition occurs or is violated",
      explanation: "A defeasible fee is an ownership interest that can be terminated if a specified condition occurs or is violated. There are two main types: 1) Fee simple determinable, which automatically terminates upon a specified event (e.g., 'to School Board so long as the land is used for a school'); and 2) Fee simple subject to a condition subsequent, which gives the grantor the right to reclaim the property upon condition violation, but requires action (e.g., 'to School Board, but if the land ceases to be used for a school, grantor may re-enter').",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "An ownership interest that can be terminated if a specified condition occurs or is violated" },
        { letter: "B", text: "A property with defects in the title" },
        { letter: "C", text: "Ownership that automatically transfers to heirs" },
        { letter: "D", text: "A defeated claim to property ownership" }
      ]
    },
    {
      text: "What is 'adverse possession'?",
      answer: "A method of acquiring title to real property by possessing it for a statutory period under certain conditions",
      explanation: "Adverse possession is a legal doctrine that allows a person to acquire title to real property by possessing it for a statutory period (typically 5-20 years depending on state law) under specific conditions. The possession must be: 1) Actual (physically occupying the land), 2) Open and notorious (visible to the community), 3) Exclusive (excluding others), 4) Continuous for the statutory period, 5) Hostile/adverse (without permission), and in some states, 6) Under color of title or with payment of property taxes. This doctrine prevents land from remaining unused indefinitely.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "When a property owner takes legal action against a trespasser" },
        { letter: "B", text: "A method of acquiring title to real property by possessing it for a statutory period under certain conditions" },
        { letter: "C", text: "When a neighboring property owner builds a fence over a boundary line" },
        { letter: "D", text: "Government seizure of private property for public use" }
      ]
    },
    {
      text: "What are the four 'unities' required for joint tenancy?",
      answer: "Time, title, interest, and possession",
      explanation: "The four unities required for joint tenancy are: 1) Time - all joint tenants must acquire their interest at the same time; 2) Title - all joint tenants must acquire title through the same document or instrument; 3) Interest - all joint tenants must have equal ownership shares; 4) Possession - all joint tenants have the right to possess the entire property. If any of these unities is broken, the joint tenancy may convert to a tenancy in common, eliminating right of survivorship.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "Time, title, interest, and possession" },
        { letter: "B", text: "Unity, equality, fraternity, and liberty" },
        { letter: "C", text: "Money, property, intention, and capacity" },
        { letter: "D", text: "Formation, operation, taxation, and dissolution" }
      ]
    },
    {
      text: "What is a 'life estate'?",
      answer: "A property interest limited to the lifetime of the holder or another person",
      explanation: "A life estate is a property interest that grants ownership rights for the duration of a person's lifetime (usually the holder's life or another designated person's life). The life tenant has the right to use, possess, and even rent the property, but cannot sell it or destroy its value. Upon the measuring life's death, the property passes to the remainderman (the person designated to receive the property afterward). Life estates are often used in estate planning to provide for a surviving spouse while ensuring the property ultimately passes to children.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A property interest limited to the lifetime of the holder or another person" },
        { letter: "B", text: "An apartment building designed specifically for senior citizens" },
        { letter: "C", text: "A property owned by a life insurance company" },
        { letter: "D", text: "A property that provides lifetime income for the owner" }
      ]
    },
    {
      text: "What is a 'reversionary interest' in property law?",
      answer: "The future interest retained by a grantor who has given away a lesser estate than they own",
      explanation: "A reversionary interest is the future interest retained by a grantor who has transferred a lesser estate than they own. For example, if a property owner grants a life estate to someone, the owner retains a reversion—the right to retake possession when the life estate ends. Similarly, when conveying a defeasible fee, the grantor retains a reversionary interest that activates if the specified condition is violated. Reversionary interests represent the grantor's remaining ownership rights after transferring less than their full interest.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The future interest retained by a grantor who has given away a lesser estate than they own" },
        { letter: "B", text: "The right to reverse a property transaction within 30 days" },
        { letter: "C", text: "When the direction of property lines is reversed by a surveyor" },
        { letter: "D", text: "A tenant's interest in reversing a landlord's decision" }
      ]
    },
    {
      text: "What is 'accession' in property law?",
      answer: "The right of a property owner to all that is added to their land by natural forces or human labor",
      explanation: "Accession is the right of a property owner to all that is added to their land by natural forces or human labor. It includes: 1) Accretion - gradual addition of land through natural water deposits; 2) Avulsion - sudden addition or loss of land due to water action; 3) Fixtures - items attached to real property that become part of it; and 4) Construction - improvements built on the land. The principle emphasizes that ownership of land includes everything permanently attached to it, above it, and below it.",
      categoryName: "Property Ownership",
      difficulty: "hard",
      options: [
        { letter: "A", text: "The right of a property owner to all that is added to their land by natural forces or human labor" },
        { letter: "B", text: "The process of accessing landlocked property" },
        { letter: "C", text: "Taking possession of abandoned property" },
        { letter: "D", text: "Gaining membership in a homeowners association" }
      ]
    },
    {
      text: "What is a 'bundle of rights' in real estate?",
      answer: "The collection of legal rights associated with property ownership, including the rights to use, possess, sell, lease, and exclude others",
      explanation: "The 'bundle of rights' refers to the collection of legal rights associated with property ownership. These typically include: 1) Right to use the property as desired within legal limitations; 2) Right to possess the property exclusively; 3) Right to dispose of (sell, gift, or transfer) the property; 4) Right to enjoy the fruits or profits from the property; and 5) Right to exclude others from the property. This concept emphasizes that ownership isn't a single right but a collection of rights that can be separated and transferred individually.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A package of utility rights sold with vacant land" },
        { letter: "B", text: "The collection of legal rights associated with property ownership, including the rights to use, possess, sell, lease, and exclude others" },
        { letter: "C", text: "A set of restrictions in a homeowners association" },
        { letter: "D", text: "The paperwork collected during a real estate closing" }
      ]
    },
    {
      text: "What is the difference between real property and personal property?",
      answer: "Real property is land and anything permanently attached to it, while personal property is movable and not attached to land",
      explanation: "Real property is land and anything permanently attached to it (buildings, fixtures, trees, etc.), while personal property (chattels) is movable and not attached to land. Key differences include: 1) Mobility - real property is immovable, personal property is movable; 2) Transfer - real property transfers require written deeds and recording, personal property can often be transferred by simple delivery; 3) Legal treatment - different laws govern each type; 4) Taxation - real property incurs property taxes, personal property usually doesn't (with some exceptions like vehicles).",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "Real property is owned by individuals, while personal property is owned by businesses" },
        { letter: "B", text: "Real property is land and anything permanently attached to it, while personal property is movable and not attached to land" },
        { letter: "C", text: "Real property is tangible, while personal property is intangible" },
        { letter: "D", text: "Real property can be sold, while personal property cannot be sold" }
      ]
    },
    {
      text: "What is 'eminent domain'?",
      answer: "The government's power to take private property for public use with just compensation",
      explanation: "Eminent domain is the government's power to take private property for public use with just compensation to the owner. This power, based on the Fifth Amendment's 'takings clause,' enables essential public projects like highways, schools, and utilities. For a taking to be legal, it must: 1) Be for public use/benefit (broadly interpreted in recent years); 2) Provide just compensation (typically fair market value); and 3) Follow due process. Property owners can challenge whether the taking meets these requirements, particularly the public use requirement.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The government's power to take private property for public use with just compensation" },
        { letter: "B", text: "A property owner's right to prevent trespassing" },
        { letter: "C", text: "The highest level of property control" },
        { letter: "D", text: "The dominant estate in an easement relationship" }
      ]
    },
    {
      text: "What is a 'fixture' in real estate?",
      answer: "An item of personal property that has become permanently attached to real property and is treated as part of the real estate",
      explanation: "A fixture is an item that began as personal property but has become permanently attached to real property and is now legally treated as part of the real estate. Courts typically apply the MARIA test to determine if an item is a fixture: Method of attachment (how permanently it's attached), Adaptation (if it was specifically adapted for the property), Relationship of parties (buyer/seller, landlord/tenant), Intention (whether the installer intended it to be permanent), and Agreement (any written agreements about the item's status).",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "An item of personal property that has become permanently attached to real property and is treated as part of the real estate" },
        { letter: "B", text: "A piece of furniture included in a home sale" },
        { letter: "C", text: "A scheduled appointment to show a property" },
        { letter: "D", text: "A repair that must be completed before closing" }
      ]
    },
    {
      text: "What does 'title' refer to in real estate?",
      answer: "The legal right to ownership and possession of a property",
      explanation: "In real estate, title refers to the legal right to ownership and possession of a property. It represents the owner's bundle of rights, including the rights to use, possess, sell, lease, and exclude others from the property. Unlike physical documents like a deed (which is evidence of title transfer), title is the abstract concept of ownership itself. Title can be held in different ways (e.g., fee simple, leasehold, life estate) and by different ownership structures (e.g., sole ownership, joint tenancy, tenancy in common).",
      categoryName: "Property Ownership",
      difficulty: "easy",
      options: [
        { letter: "A", text: "The legal right to ownership and possession of a property" },
        { letter: "B", text: "The physical document that transfers ownership" },
        { letter: "C", text: "The description of a property on tax records" },
        { letter: "D", text: "The professional designation of a real estate agent" }
      ]
    },
    {
      text: "What is 'escheat' in property law?",
      answer: "The reversion of property to the state when a person dies without a will and without heirs",
      explanation: "Escheat is the reversion of property to the state when a person dies without a will (intestate) and without any legal heirs. It is based on the principle that property should never be without ownership, and when no private owner exists, the state becomes the owner. Before escheat occurs, courts typically conduct thorough searches for potential heirs. In most states, escheated property is held for a period during which heirs can come forward to claim it before it permanently becomes state property.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The reversion of property to the state when a person dies without a will and without heirs" },
        { letter: "B", text: "The process of checking property boundaries" },
        { letter: "C", text: "The legal process of evicting a tenant" },
        { letter: "D", text: "A method of transferring property to avoid taxes" }
      ]
    },
    {
      text: "What is a 'special warranty deed'?",
      answer: "A deed where the grantor warrants only against title defects that occurred during their ownership",
      explanation: "A special warranty deed (also called a limited warranty deed) is a deed where the grantor warrants only against title defects that occurred during their period of ownership, not those that might have existed before they acquired the property. The grantor guarantees they haven't created any title problems but makes no promises about what previous owners might have done. This offers more protection than a quitclaim deed (which provides no warranties) but less than a general warranty deed (which warrants against all defects regardless of when they arose).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A deed that contains special provisions for property use" },
        { letter: "B", text: "A deed where the grantor warrants only against title defects that occurred during their ownership" },
        { letter: "C", text: "A deed used only for commercial properties" },
        { letter: "D", text: "A deed that requires special court approval" }
      ]
    },
    {
      text: "What is a 'general warranty deed'?",
      answer: "A deed where the grantor warrants against all title defects, even those that occurred before their ownership",
      explanation: "A general warranty deed provides the highest level of protection to the buyer, as the grantor warrants against all title defects, even those that occurred before their ownership. The grantor makes six covenants: 1) Covenant of seisin (they own the property), 2) Covenant of right to convey, 3) Covenant against encumbrances (no undisclosed liens), 4) Covenant of quiet enjoyment, 5) Covenant of warranty (will defend title), and 6) Covenant of further assurances (will execute additional documents if needed).",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A deed where the grantor warrants against all title defects, even those that occurred before their ownership" },
        { letter: "B", text: "A deed that guarantees the general condition of the property" },
        { letter: "C", text: "A deed used for transferring government-owned property" },
        { letter: "D", text: "A deed that has been generally accepted by all parties" }
      ]
    },
    {
      text: "What is a 'quitclaim deed'?",
      answer: "A deed that conveys only whatever interest the grantor may have, without warranties or guarantees",
      explanation: "A quitclaim deed conveys only whatever interest the grantor may have in a property, without any warranties or guarantees about the title's quality or the grantor's ownership. The grantor essentially 'quits' any 'claim' they have to the property without promising they actually own anything. Quitclaim deeds are commonly used between family members, to clear up title issues, in divorce settlements, or in situations where the parties trust each other, as they offer the least protection to the grantee among the common deed types.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A deed that terminates a tenant's claim to property" },
        { letter: "B", text: "A deed that conveys only whatever interest the grantor may have, without warranties or guarantees" },
        { letter: "C", text: "A deed used when property taxes have not been paid" },
        { letter: "D", text: "A deed that resolves boundary disputes between neighbors" }
      ]
    },
    {
      text: "What is the 'doctrine of prior appropriation' in water rights?",
      answer: "The principle that those who first put water to beneficial use have priority rights to it ('first in time, first in right')",
      explanation: "The doctrine of prior appropriation is a water rights principle primarily used in western U.S. states, summarized as 'first in time, first in right.' It establishes that those who first put water to beneficial use have priority rights to it, regardless of their proximity to the water source. During shortages, senior water rights holders (those who established rights earlier) receive their full allocation before junior rights holders receive any. This contrasts with the riparian doctrine used in eastern states, where water rights are tied to ownership of land adjacent to water bodies.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The principle that those who first put water to beneficial use have priority rights to it ('first in time, first in right')" },
        { letter: "B", text: "The principle that water rights belong to landowners with property adjacent to water sources" },
        { letter: "C", text: "The idea that government has first claim to all water resources" },
        { letter: "D", text: "The concept that water rights are distributed equally among all property owners in a region" }
      ]
    },
    {
      text: "What is 'partition' in property law?",
      answer: "A legal process to divide jointly owned property when co-owners cannot agree on its use or disposition",
      explanation: "Partition is a legal process to divide jointly owned property when co-owners cannot agree on its use or disposition. There are two types: 1) Partition in kind - physically dividing the property among owners (preferred when feasible); and 2) Partition by sale - selling the property and dividing proceeds when physical division isn't practical or would significantly reduce value. Any co-owner has the absolute right to demand partition, regardless of other owners' wishes, as courts recognize the right not to be forced to maintain unwanted co-ownership.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "A legal process to divide jointly owned property when co-owners cannot agree on its use or disposition" },
        { letter: "B", text: "A wall or barrier that separates two adjoining properties" },
        { letter: "C", text: "The division of a larger property into smaller lots" },
        { letter: "D", text: "A section of a building designated for a specific tenant" }
      ]
    },
    {
      text: "What is 'air rights' in property ownership?",
      answer: "The right to use, occupy, or control the air space above a property",
      explanation: "Air rights refer to the right to use, occupy, or control the air space above a property. Traditionally, property ownership was thought to extend 'from the center of the earth to the heavens,' but modern law has established reasonable limitations, particularly for air travel. Air rights can be sold, leased, or transferred separately from the land below, allowing for developments like high-rise buildings over existing structures, transferable development rights in urban planning, and easements for utility lines or view protection.",
      categoryName: "Property Ownership",
      difficulty: "medium",
      options: [
        { letter: "A", text: "The right to use, occupy, or control the air space above a property" },
        { letter: "B", text: "The right to install air conditioning in a property" },
        { letter: "C", text: "The right to clean air on a property" },
        { letter: "D", text: "The right to ventilation in a building" }
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
  
  console.log('\n=========== MORE PROPERTY OWNERSHIP QUESTIONS ADDED ===========');
  console.log(`Added: ${addedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errorsCount}`);
}

// Run the script
addMorePropertyOwnershipQuestions()
  .then(() => {
    console.log('More property ownership questions successfully added.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error adding more property ownership questions:', error);
    process.exit(1);
  });