import * as fs from 'fs';
import * as path from 'path';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import * as schema from '../shared/schema';
import { parsePdfFile, saveQuestionsToDatabase } from './pdf-parser';

// Directory where downloaded files will be stored
const DOWNLOADS_DIR = './uploads';

// Dropbox shared folder URL
const DROPBOX_FOLDER_URL = 'https://www.dropbox.com/scl/fo/7f81srgwprtku0jb7erg6/ABpaNSJlx58mMhmRNTXs8ag?rlkey=m9z3pmqaazo9wko3yeyo11ivw&st=1ol5h2xa&dl=0';

// Sample files to use if we can't access the Dropbox folder
// All attached asset files that we want to process
const ATTACHED_ASSETS_DIR = './attached_assets';
const EXTRACTED_MATERIALS_DIR = './extracted_materials';

// Define interfaces for our file types
interface DropboxFile {
  name: string;
  url: string;
  mimeType: string;
}

interface AttachedAssetFile {
  name: string;
  sourcePath: string;
  mimeType: string;
}

const SAMPLE_FILES: AttachedAssetFile[] = [
  // Exam Practice PDFs
  {
    name: 'UT_Practice_Exam_3.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/UT PL 00 Practice Exam 3 (2).pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'UT_Practice_Exam_4.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/UT PL 00 Practice Exam 4 (2).pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'UT_Practice_Exam_5.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/UT PL 00 Practice Exam 5 (2).pdf`,
    mimeType: 'application/pdf'
  },
  // Other PDFs
  {
    name: 'Closing_Disclosure.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/201311_cfpb_kbyo_closing-disclosure-seller-only.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Advertising_Guidelines.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Advertising Guidelines.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Trust_Deed.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/All-Inclusive_Trust_Deed.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Settlement_Statement.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/ALTA_Settlement_Statement_Seller_05-01-2015.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Application.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Application.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Assumption_Addendum.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/assumptionaddendum.pdf`,
    mimeType: 'application/pdf'
  },
  {
    name: 'Buyer_Financial_Info.pdf',
    sourcePath: `${ATTACHED_ASSETS_DIR}/buyerfinaninfo.pdf`,
    mimeType: 'application/pdf'
  },
  // Study Guide Images
  {
    name: 'Agency_Basics_Guide_Part1.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Agency-Basics-1-Study-Guide-05-05-2025_05_57_PM_part1.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Agency_Basics_Guide_Part2.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Agency-Basics-1-Study-Guide-05-05-2025_05_57_PM_part2.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Property_Concepts_Guide_Part1.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Concepts-of-Property-Study-Guide-05-05-2025_05_52_PM_part1.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Property_Concepts_Guide_Part2.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Concepts-of-Property-Study-Guide-05-05-2025_05_52_PM_part2.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Review_Guide_1_Part1.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Real-Estate-Pre-Licensing-Review-1-Study-Guide-05-05-2025_06_21_PM_part1.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Review_Guide_1_Part2.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Real-Estate-Pre-Licensing-Review-1-Study-Guide-05-05-2025_06_21_PM_part2.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Review_Guide_1_Part3.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Real-Estate-Pre-Licensing-Review-1-Study-Guide-05-05-2025_06_21_PM_part3.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Review_Guide_2_Part1.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Real-Estate-Pre-Licensing-Review-2-Study-Guide-05-05-2025_06_23_PM_part1.png`,
    mimeType: 'image/png'
  },
  {
    name: 'Review_Guide_2_Part2.png',
    sourcePath: `${ATTACHED_ASSETS_DIR}/Real-Estate-Pre-Licensing-Review-2-Study-Guide-05-05-2025_06_23_PM_part2.png`,
    mimeType: 'image/png'
  }
];

/**
 * Makes sure the downloads directory exists
 */
function ensureDownloadsDir() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
}

/**
 * Fetches the list of files from the Dropbox shared folder
 */
async function fetchFileListFromDropbox(): Promise<{ name: string, url: string, mimeType: string }[]> {
  try {
    console.log('Fetching list of files from Dropbox shared folder...');

    // Modify URL for direct access
    // Convert the shared folder URL to a web page we can scrape
    // Replace dl=0 with dl=0&layout=list to get a list view that's easier to parse
    const webUrl = DROPBOX_FOLDER_URL.replace('dl=0', 'dl=0&layout=list');

    console.log(`Attempting to fetch folder contents from: ${webUrl}`);
    
    // Fetch the folder contents
    const response = await fetch(webUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch folder contents: ${response.status} ${response.statusText}`);
      console.log('Falling back to scrape method...');
      return await scrapeFileListFromDropbox();
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // For debugging
    console.log(`Received HTML page of length: ${html.length} characters`);
    
    // Parse the HTML using regex
    // Look for file data in the page
    const fileDataRegex = /"filename":\s*"([^"]+)",\s*"href":\s*"([^"]+)"/g;
    
    const files: { name: string, url: string, mimeType: string }[] = [];
    let match;
    
    while ((match = fileDataRegex.exec(html)) !== null) {
      const fileName = match[1];
      let fileUrl = match[2];
      
      // Convert the URL to a direct download URL by adding ?dl=1
      fileUrl = fileUrl.includes('?')
        ? fileUrl.replace(/\?.*$/, '?dl=1')
        : fileUrl + '?dl=1';
      
      files.push({
        name: fileName,
        url: fileUrl,
        mimeType: getMimeTypeFromFilename(fileName)
      });
    }
    
    if (files.length > 0) {
      console.log(`Found ${files.length} files in Dropbox folder through direct parsing`);
      return files;
    }
    
    // If we got here, direct parsing didn't work
    console.log('No files found through direct parsing, falling back to scrape method...');
    return await scrapeFileListFromDropbox();
  } catch (error) {
    console.error('Error fetching file list from Dropbox web page:', error);
    // Try scraping the page as fallback
    return await scrapeFileListFromDropbox();
  }
}

/**
 * Scrapes the Dropbox shared folder page to extract file links
 * This is a fallback method when the API approach fails
 */
async function scrapeFileListFromDropbox(): Promise<{ name: string, url: string, mimeType: string }[]> {
  try {
    console.log('Scraping Dropbox folder page for file links...');
    
    // Fetch the folder page HTML
    const response = await fetch(DROPBOX_FOLDER_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch folder page: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Extract file information from the HTML
    // This is a very basic scraper and might break if Dropbox changes their page structure
    const fileRegex = /"filename":\s*"([^"]+)",\s*"href":\s*"([^"]+)"/g;
    const files: { name: string, url: string, mimeType: string }[] = [];
    let match;
    
    while ((match = fileRegex.exec(html)) !== null) {
      const fileName = match[1];
      let fileUrl = match[2];
      
      // Convert to direct download URL
      if (!fileUrl.includes('?dl=1')) {
        fileUrl = fileUrl.includes('?') 
          ? fileUrl.replace('?dl=0', '?dl=1').replace('?', '?dl=1&')
          : fileUrl + '?dl=1';
      }
      
      files.push({
        name: fileName,
        url: fileUrl,
        mimeType: getMimeTypeFromFilename(fileName)
      });
    }
    
    // If we couldn't find any files, try another approach
    if (files.length === 0) {
      const alternativeRegex = /href="([^"]+\/download[^"]*)"[^>]*>([^<]+)<\/a>/g;
      while ((match = alternativeRegex.exec(html)) !== null) {
        const fileUrl = match[1];
        const fileName = match[2].trim();
        
        files.push({
          name: fileName,
          url: fileUrl,
          mimeType: getMimeTypeFromFilename(fileName)
        });
      }
    }
    
    console.log(`Scraped ${files.length} files from Dropbox folder page`);
    return files;
  } catch (error) {
    console.error('Error scraping file list from Dropbox:', error);
    return getHardcodedFileList();
  }
}

/**
 * Determines MIME type based on file extension
 */
function getMimeTypeFromFilename(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  
  switch (extension) {
    case '.pdf':
      return 'application/pdf';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':
      return 'application/msword';
    case '.txt':
      return 'text/plain';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Downloads a file from a URL
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  try {
    console.log(`Downloading file from ${url} to ${destPath}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }
    
    const fileStream = fs.createWriteStream(destPath);
    
    if (!response.body) {
      throw new Error('Response body is null');
    }
    
    // Get a reader from the body stream
    const reader = response.body.getReader();
    let totalBytes = 0;
    
    // Process the stream
    return new Promise((resolve, reject) => {
      fileStream.on('error', (err) => {
        console.error(`Error writing to file: ${err.message}`);
        reject(err);
      });
      
      async function processStream() {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              fileStream.end();
              console.log(`Successfully downloaded ${totalBytes} bytes to ${destPath}`);
              resolve();
              break;
            }
            
            totalBytes += value.length;
            fileStream.write(Buffer.from(value));
          }
        } catch (err) {
          console.error(`Error reading stream: ${err}`);
          fileStream.destroy();
          reject(err);
        }
      }
      
      processStream();
    });
  } catch (error) {
    console.error(`Error downloading file: ${error}`);
    throw error;
  }
}

/**
 * Processes a downloaded file
 */
async function processDownloadedFile(localPath: string, fileName: string): Promise<void> {
  console.log(`Processing downloaded file: ${fileName}`);
  
  // Determine file type and process accordingly
  if (fileName.toLowerCase().endsWith('.pdf')) {
    try {
      // Create an upload record
      const uploadData: schema.UploadInsert = {
        filename: fileName,
        fileType: 'application/pdf',
        filePath: localPath,
        processed: false,
        extractedData: { status: 'pending' }
      };
      
      const [upload] = await db
        .insert(schema.uploads)
        .values(uploadData)
        .returning();
      
      console.log(`Created upload record with ID ${upload.id}`);
      
      // Parse PDF
      const parseOptions = {
        extractExplanations: true,
        autoCategories: true
      };
      
      const parseResult = await parsePdfFile(localPath, parseOptions);
      
      if (parseResult.questions.length > 0) {
        console.log(`Found ${parseResult.questions.length} questions in file ${fileName}`);
        
        // Save questions to database
        const saveResult = await saveQuestionsToDatabase(parseResult.questions);
        
        // Update upload status
        await db
          .update(schema.uploads)
          .set({
            processed: true,
            extractedData: {
              processedAt: new Date().toISOString(),
              status: 'success',
              questionsExtracted: saveResult.added,
              errors: saveResult.errors || null
            }
          })
          .where(eq(schema.uploads.id, upload.id));
        
        console.log(`Successfully processed file ${fileName}, added ${saveResult.added} questions`);
      } else {
        // No questions found
        await db
          .update(schema.uploads)
          .set({
            processed: true,
            extractedData: {
              processedAt: new Date().toISOString(),
              status: 'error',
              questionsExtracted: 0,
              errors: parseResult.errors || ['No questions found in the document']
            }
          })
          .where(eq(schema.uploads.id, upload.id));
        
        console.log(`No questions found in file ${fileName}`);
      }
    } catch (error) {
      console.error(`Error processing PDF file ${fileName}:`, error);
    }
  } else {
    console.log(`Unsupported file type: ${fileName}`);
  }
}

/**
 * Fallback list of files from Dropbox
 */
function getHardcodedFileList(): DropboxFile[] {
  console.log('Using attached assets file list as fallback');
  
  // Convert AttachedAssetFile[] to DropboxFile[]
  return SAMPLE_FILES.map(file => ({
    name: file.name,
    url: file.sourcePath, // We're using the sourcePath as the URL for processing
    mimeType: file.mimeType
  }));
}

/**
 * Processes all files from the attached_assets and extracted_materials directories
 */
export async function downloadAllFilesFromDropbox(): Promise<void> {
  try {
    console.log('Starting to process attached asset files and extracted materials...');
    ensureDownloadsDir();
    
    // Process files from attached_assets
    const attachedFiles = SAMPLE_FILES;
    console.log(`Found ${attachedFiles.length} files to process from attached_assets`);
    
    // Process each attached asset file
    for (const file of attachedFiles) {
      // Sanitize filename for the destination
      const fileName = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
      const destPath = path.join(DOWNLOADS_DIR, fileName);
      
      // Skip if file already exists and is processed
      if (fs.existsSync(destPath)) {
        console.log(`File ${fileName} already exists, checking if processed...`);
        
        // Check if we've already processed this file recently
        const existingUpload = await db.query.uploads.findFirst({
          where: eq(schema.uploads.filename, fileName)
        });
        
        if (existingUpload && existingUpload.processed) {
          console.log(`File ${fileName} has already been processed, skipping`);
          continue;
        }
      }
      
      try {
        // Copy the file from attached_assets to uploads directory
        if (fs.existsSync(file.sourcePath)) {
          fs.copyFileSync(file.sourcePath, destPath);
          console.log(`Copied ${file.sourcePath} to ${destPath}`);
        } else {
          console.error(`Source file not found: ${file.sourcePath}`);
          continue;
        }
        
        // Process the file
        await processDownloadedFile(destPath, fileName);
      } catch (error) {
        console.error(`Error processing file ${fileName}:`, error);
      }
    }
    
    // Now process files from extracted_materials
    if (fs.existsSync(EXTRACTED_MATERIALS_DIR)) {
      const extractedFiles = fs.readdirSync(EXTRACTED_MATERIALS_DIR);
      console.log(`Found ${extractedFiles.length} files to process from extracted_materials directory`);
      
      // Process each extracted file
      for (const originalFileName of extractedFiles) {
        try {
          const sourcePath = path.join(EXTRACTED_MATERIALS_DIR, originalFileName);
          
          // Skip directories
          if (fs.statSync(sourcePath).isDirectory()) {
            console.log(`Skipping directory: ${sourcePath}`);
            continue;
          }
          
          // Format the destination filename to be more readable
          const cleanFileName = originalFileName.replace(/\s+/g, '_').replace(/[\(\)]/g, '');
          
          // Destination path in the uploads directory
          const destPath = path.join(DOWNLOADS_DIR, cleanFileName);
          
          // Skip if file already exists and is processed
          if (fs.existsSync(destPath)) {
            console.log(`File ${cleanFileName} already exists, checking if processed...`);
            
            // Check if we've already processed this file recently
            const existingUpload = await db.query.uploads.findFirst({
              where: eq(schema.uploads.filename, cleanFileName)
            });
            
            if (existingUpload && existingUpload.processed) {
              console.log(`File ${cleanFileName} has already been processed, skipping`);
              continue;
            }
          }
          
          // Copy the file from extracted_materials to uploads
          fs.copyFileSync(sourcePath, destPath);
          console.log(`Copied ${sourcePath} to ${destPath}`);
          
          // Process the downloaded file
          await processDownloadedFile(destPath, cleanFileName);
        } catch (error) {
          console.error(`Error processing extracted file ${originalFileName}:`, error);
        }
      }
    } else {
      console.log(`Extracted materials directory not found: ${EXTRACTED_MATERIALS_DIR}`);
    }
    
    console.log('File processing complete');
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

/**
 * Generate additional sample files to cover more real estate topics
 */
function generateSampleFiles(): DropboxFile[] {
  return [
    {
      name: 'Utah_Agency_Relationships.pdf',
      url: 'sample/agency',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Real_Estate_Law.pdf',
      url: 'sample/law',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Financing_Options.pdf',
      url: 'sample/financing',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Contracts_Guide.pdf',
      url: 'sample/contracts',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Appraisal_Methods.pdf',
      url: 'sample/appraisal',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Property_Management.pdf',
      url: 'sample/property_management',
      mimeType: 'application/pdf'
    },
    {
      name: 'Utah_Closing_Procedures.pdf',
      url: 'sample/closing',
      mimeType: 'application/pdf'
    }
  ];
}

/**
 * Generate sample content for a given file
 */
function generateSampleContent(fileName: string): string {
  const baseFileName = fileName.toLowerCase().replace(/\.[^/.]+$/, "");
  let content = `Sample Real Estate Study Material: ${fileName}\n\n`;
  
  // Add some questions and answers based on the file name
  if (baseFileName.includes('agency')) {
    content += `
Q: What is a principal in an agency relationship?
A: The principal is the party who engages an agent to act on their behalf and represent their interests.

Q: In a single agency relationship, who does the agent represent?
A: In a single agency relationship, the agent represents only one party in the transaction - either the buyer or the seller, but not both.

Q: What is dual agency in Utah real estate?
A: Dual agency occurs when the same agent or brokerage represents both the buyer and seller in the same transaction. In Utah, this requires written informed consent from all parties.

Q: What duties does a real estate agent owe to their client in Utah?
A: Duties include loyalty, confidentiality, obedience, reasonable care and diligence, accounting, and disclosure of all material facts.

Q: What is the difference between a client and a customer in real estate?
A: A client has an agency relationship with the agent who represents their interests, while a customer receives services without representation.
`;
  } else if (baseFileName.includes('law')) {
    content += `
Q: What law requires real estate agents in Utah to disclose their agency status?
A: The Utah Real Estate Licensing and Practices Act requires agents to disclose their agency status to all parties in a transaction.

Q: Under Utah law, what must be included in a real estate purchase contract?
A: It must include identification of the parties, property description, purchase price, financing terms, closing date, and contingencies.

Q: What is RESPA and how does it affect Utah real estate transactions?
A: RESPA (Real Estate Settlement Procedures Act) is a federal law that requires lenders to provide borrowers with disclosures about settlement costs and prohibits kickbacks.

Q: What are the legal requirements for a real estate listing agreement in Utah?
A: It must be in writing, have a definite termination date, include the listing price, describe the property, and outline the broker's compensation.

Q: What disclosure forms are legally required in Utah real estate transactions?
A: Required disclosures include the Seller Property Condition Disclosure, Lead-Based Paint Disclosure (for pre-1978 homes), and Agency Disclosure.
`;
  } else if (baseFileName.includes('financing')) {
    content += `
Q: What is the difference between a conventional loan and an FHA loan?
A: A conventional loan is not insured by the government, while an FHA loan is insured by the Federal Housing Administration, typically allowing for lower down payments and credit scores.

Q: What is PMI in real estate financing?
A: PMI (Private Mortgage Insurance) is insurance that protects the lender if a borrower defaults on a conventional loan with less than 20% down payment.

Q: What is a loan-to-value ratio (LTV)?
A: The loan-to-value ratio is the percentage of the property's appraised value that is financed by the loan. It's calculated by dividing the loan amount by the property value.

Q: What is an escrow account in mortgage financing?
A: An escrow account is a separate account maintained by the lender to collect and hold funds for property taxes and insurance premiums.

Q: What is a balloon payment?
A: A balloon payment is a large, lump-sum payment due at the end of a loan term, often following a series of smaller periodic payments.
`;
  } else if (baseFileName.includes('contracts')) {
    content += `
Q: What is an earnest money deposit in a real estate contract?
A: Earnest money is a deposit made by the buyer to demonstrate good faith and commitment to purchasing the property.

Q: What is a contingency in a real estate purchase contract?
A: A contingency is a condition that must be met for the contract to become binding, such as financing approval, satisfactory inspection, or appraisal.

Q: What is the purpose of liquidated damages clause in a real estate contract?
A: A liquidated damages clause specifies the amount of damages that a party must pay if they breach the contract, typically allowing the seller to keep the earnest money.

Q: What is an option contract in real estate?
A: An option contract gives the potential buyer the right, but not the obligation, to purchase the property within a specified timeframe for an agreed-upon price.

Q: What is the difference between an assignable and non-assignable contract?
A: An assignable contract allows the buyer to transfer their rights and obligations to another party, while a non-assignable contract prohibits such transfers.
`;
  } else if (baseFileName.includes('appraisal')) {
    content += `
Q: What are the three approaches to value in real estate appraisal?
A: The three approaches are the Sales Comparison Approach, the Cost Approach, and the Income Approach.

Q: What factors does an appraiser consider when using the Sales Comparison Approach?
A: Appraisers consider location, size, condition, age, improvements, amenities, and recent sales of comparable properties.

Q: When is the Income Approach most appropriate for property valuation?
A: The Income Approach is most appropriate for income-producing properties such as apartment buildings, office buildings, and retail centers.

Q: What is the Cost Approach to valuation?
A: The Cost Approach estimates value by calculating the cost to replace or reproduce the improvements on the property, less depreciation, plus the land value.

Q: What is the difference between market value and market price?
A: Market value is the estimated amount a property would sell for in an open market, while market price is the actual amount paid for a property.
`;
  } else if (baseFileName.includes('property_management')) {
    content += `
Q: What is the Utah Fit Premises Act?
A: The Utah Fit Premises Act requires landlords to maintain rental properties in a condition that is fit for human habitation and in compliance with health and safety codes.

Q: What is the legal process for evicting a tenant in Utah?
A: The process includes providing proper notice, filing an eviction lawsuit, attending a court hearing, and if granted, obtaining a writ of restitution.

Q: What must be included in a residential lease agreement in Utah?
A: It must include names of parties, property description, lease term, rent amount, security deposit terms, and maintenance responsibilities.

Q: How much notice must a landlord give to terminate a month-to-month tenancy in Utah?
A: In Utah, a landlord must provide at least 15 days' notice before the end of the rental period to terminate a month-to-month tenancy.

Q: What is a security deposit and what restrictions apply to it in Utah?
A: A security deposit is money collected by a landlord to cover potential damages or unpaid rent. In Utah, there is no statutory limit on the amount, but the landlord must return it within 30 days after the tenant vacates.
`;
  } else if (baseFileName.includes('closing')) {
    content += `
Q: What is a HUD-1 Settlement Statement?
A: The HUD-1 Settlement Statement is a document that itemizes all charges and credits to the buyer and seller in a real estate transaction (now replaced by the Closing Disclosure for most residential transactions).

Q: What is the purpose of a title search before closing?
A: A title search examines public records to confirm the property's legal ownership and uncover any claims, defects, or encumbrances on the property.

Q: What is the role of an escrow agent in a real estate closing?
A: An escrow agent is a neutral third party who holds documents and funds, ensures all conditions are met, and facilitates the closing process.

Q: What is title insurance and why is it important?
A: Title insurance protects against financial loss from defects in title to real property and the invalidity or unenforceability of mortgage liens.

Q: What documents are typically signed at a real estate closing?
A: Documents typically include the deed, mortgage or deed of trust, promissory note, Closing Disclosure, affidavits, and various disclosures.
`;
  } else {
    // Generic questions for any other file type
    content += `
Q: What is the difference between real property and personal property?
A: Real property includes land and anything permanently attached to it, while personal property is movable and not attached to land.

Q: What is the difference between a deed and a title?
A: A deed is the legal document that transfers title or ownership of property from one person to another, while title refers to the legal ownership rights.

Q: What is a lien on real property?
A: A lien is a legal claim against property that serves as security for a debt or obligation and can be placed by creditors, tax authorities, or judgment holders.

Q: What is the purpose of zoning laws?
A: Zoning laws regulate land use by dividing areas into zones with specific permitted uses to control development and protect property values.

Q: What is the difference between joint tenancy and tenancy in common?
A: Joint tenancy includes right of survivorship where a deceased owner's interest passes to surviving owners, while tenancy in common allows each owner to will their share to chosen beneficiaries.
`;
  }
  
  return content;
}