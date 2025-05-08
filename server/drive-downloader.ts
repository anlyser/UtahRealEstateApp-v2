import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as schema from '@shared/schema';
import { db } from '@db';
import { eq } from 'drizzle-orm';
import { parsePdfFile, saveQuestionsToDatabase } from './pdf-parser';

// Base folder URL from the shared drive
const SHARED_FOLDER_URL = 'https://drive.google.com/drive/folders/1lJ79_yoa9giFN1DqY1FwwPs2Z8jQx6Sz';

// Local directory for downloaded files
const DOWNLOADS_DIR = path.join(process.cwd(), 'uploads');

/**
 * Makes sure the downloads directory exists
 */
function ensureDownloadsDir() {
  if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
  }
}

/**
 * Downloads a file from a URL to the specified path
 * with improved error handling for Google Drive rate limiting
 */
function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    let totalBytes = 0;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    
    const attemptDownload = (currentUrl: string) => {
      console.log(`Attempting download from ${currentUrl}, attempt ${retryCount + 1}/${MAX_RETRIES + 1}`);
      
      const req = https.get(currentUrl, (response) => {
        // Check if response is a redirect
        if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 303) {
          if (response.headers.location) {
            console.log(`Following redirect to ${response.headers.location}`);
            // Follow the redirect
            return attemptDownload(response.headers.location);
          }
          return reject(new Error('Redirect location header is missing'));
        }
        
        // Check if we're being rate limited
        if (response.statusCode === 429) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = retryCount * 2000; // Exponential backoff
            console.log(`Rate limited. Retrying in ${delay}ms...`);
            setTimeout(() => attemptDownload(currentUrl), delay);
            return;
          } else {
            return reject(new Error('Failed after maximum number of retries due to rate limiting'));
          }
        }
        
        // For Google Drive, we might get a special case with a page containing a download button
        if (response.headers['content-type']?.includes('text/html') && currentUrl.includes('drive.google.com')) {
          console.log('Received HTML response from Google Drive, extracting direct download link...');
          
          let body = '';
          response.on('data', (chunk) => {
            body += chunk.toString();
          });
          
          response.on('end', () => {
            // Look for the confirmation token in the HTML
            const confirmMatch = body.match(/confirm=([0-9A-Za-z]+)/);
            if (confirmMatch && confirmMatch[1]) {
              const confirmToken = confirmMatch[1];
              const newUrl = `${currentUrl}&confirm=${confirmToken}`;
              console.log(`Found confirmation token, retrying with: ${newUrl}`);
              return attemptDownload(newUrl);
            } else {
              // Try with a different URL format
              const fileIdMatch = currentUrl.match(/id=([^&]+)/);
              if (fileIdMatch && fileIdMatch[1]) {
                const fileId = fileIdMatch[1];
                const altUrl = `https://docs.google.com/uc?export=download&id=${fileId}&confirm=t`;
                console.log(`Trying alternative download URL: ${altUrl}`);
                return attemptDownload(altUrl);
              }
              
              return reject(new Error('Could not extract direct download link from Google Drive response'));
            }
          });
          
          return;
        }
        
        // Handle other non-success status codes
        if (response.statusCode !== 200) {
          return reject(new Error(`Failed to download file, status code: ${response.statusCode}`));
        }
        
        // Get file size for progress tracking
        const fileSize = parseInt(response.headers['content-length'] || '0', 10);
        if (fileSize) {
          console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
        }
        
        // Pipe the response to the file
        response.pipe(file);
        
        // Track download progress
        response.on('data', (chunk) => {
          totalBytes += chunk.length;
          if (fileSize && totalBytes % (fileSize / 10) < chunk.length) {
            // Log progress at roughly 10% intervals
            const percent = Math.round((totalBytes / fileSize) * 100);
            console.log(`Download progress: ${percent}%`);
          }
        });
        
        file.on('finish', () => {
          file.close();
          console.log(`Download complete: ${totalBytes} bytes`);
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(destPath, () => {}); // Delete the file async on error
          reject(err);
        });
      });
      
      req.on('error', (err) => {
        // Handle network errors with retry logic
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = retryCount * 2000; // Exponential backoff
          console.log(`Network error: ${err.message}. Retrying in ${delay}ms...`);
          setTimeout(() => attemptDownload(currentUrl), delay);
        } else {
          fs.unlink(destPath, () => {}); // Delete the file async on error
          reject(new Error(`Failed after ${MAX_RETRIES} retries: ${err.message}`));
        }
      });
      
      // Set a timeout for the request
      req.setTimeout(60000, () => {
        req.destroy();
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = retryCount * 2000; // Exponential backoff
          console.log(`Request timed out. Retrying in ${delay}ms...`);
          setTimeout(() => attemptDownload(currentUrl), delay);
        } else {
          fs.unlink(destPath, () => {}); // Delete the file async on error
          reject(new Error('Request timed out after maximum retries'));
        }
      });
    };
    
    // Start the download process
    attemptDownload(url);
  });
}

/**
 * Transforms a Google Drive view URL to a direct download URL
 * Note: Uses special parameters to improve handling of large files
 */
function getDirectDownloadUrl(driveUrl: string): string {
  // Extract the file ID from the Google Drive URL
  const fileIdMatch = driveUrl.match(/[-\w]{25,}/);
  if (!fileIdMatch) {
    throw new Error('Invalid Google Drive URL, could not extract file ID');
  }
  
  const fileId = fileIdMatch[0];
  
  // Use special parameters to handle large files and avoid Google Drive warning page
  // confirm=t bypasses the virus scan warning for large files
  // The authuser and the usp parameters help with public files
  return `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}&authuser=0&usp=sharing`;
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
 * Download all files from the shared Drive folder manually
 * This is a temporary solution until we implement the Google Drive API
 */
export async function downloadManualFilesList(): Promise<void> {
  try {
    ensureDownloadsDir();
    
    // In a real implementation, we would use the Google Drive API to list files
    // For this prototype, we'll use a comprehensive hardcoded list of files from the shared folder
    const files = [
      // Utah Real Estate Exam Prep materials
      {
        url: 'https://drive.google.com/file/d/1eNUdElZgszRhq9_wiuM17jvPCBrxBRvj/view?usp=sharing',
        name: 'utah_real_estate_sample_1.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1AxZ2xU7sYxO-l8CxYrKH2QL4Pls-KXFI/view?usp=sharing',
        name: 'utah_real_estate_sample_2.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1J0uB2PxCN4L8SocQaQNHtdMsZ8X9JBYT/view?usp=sharing',
        name: 'utah_real_estate_sample_3.pdf'
      },
      // Additional Utah real estate materials
      {
        url: 'https://drive.google.com/file/d/1lqTJfmUGQpPQdI9qDLF7zJH7pB1qDGMw/view?usp=sharing',
        name: 'utah_real_estate_practice_questions.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1Bx9tFMm-yFPx5K4tkbn7M2Y9bXj4pBQy/view?usp=sharing',
        name: 'utah_real_estate_law_review.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1N7wZj1S-e5EFPaA5MnLIQS_aoFVdF0Gi/view?usp=sharing',
        name: 'utah_real_estate_key_concepts.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1qQ4eA05R8sZ9bkZ8DHb34nN0Jw2F2i28/view?usp=sharing',
        name: 'utah_real_estate_math_problems.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1VDr67Yj7XDhG-dKmTFxEEWTvXBw81rSc/view?usp=sharing',
        name: 'utah_real_estate_financing.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1ZkY3j2Q3jW3eH-4KzTfq9M8JcqeTwW7T/view?usp=sharing',
        name: 'utah_real_estate_contracts.pdf'
      },
      {
        url: 'https://drive.google.com/file/d/1efyE2XC4XG7JJwt5DqpNMz4xhZTcgkGJ/view?usp=sharing',
        name: 'utah_real_estate_final_review.pdf'
      }
    ];
    
    console.log(`Downloading ${files.length} files from shared folder...`);
    
    // Process each file
    for (const file of files) {
      const destPath = path.join(DOWNLOADS_DIR, file.name);
      
      // Skip if file already exists
      if (fs.existsSync(destPath)) {
        console.log(`File ${file.name} already exists, skipping download`);
        await processDownloadedFile(destPath, file.name);
        continue;
      }
      
      try {
        // Convert Google Drive view URL to direct download URL
        const downloadUrl = getDirectDownloadUrl(file.url);
        
        console.log(`Downloading ${file.name} from ${downloadUrl}`);
        
        // Download the file
        await downloadFile(downloadUrl, destPath);
        console.log(`Downloaded ${file.name} to ${destPath}`);
        
        // Process the downloaded file
        await processDownloadedFile(destPath, file.name);
      } catch (error) {
        console.error(`Error downloading file ${file.name}:`, error);
      }
    }
    
    console.log('File download and processing complete');
  } catch (error) {
    console.error('Error downloading files from shared folder:', error);
  }
}

/**
 * Manual download function that downloads a specific file from Google Drive
 */
export async function downloadManualFile(url: string, fileName: string): Promise<string | null> {
  try {
    ensureDownloadsDir();
    
    const destPath = path.join(DOWNLOADS_DIR, fileName);
    
    // Skip if file already exists
    if (fs.existsSync(destPath)) {
      console.log(`File ${fileName} already exists, skipping download`);
      return destPath;
    }
    
    // Convert Google Drive view URL to direct download URL
    const downloadUrl = getDirectDownloadUrl(url);
    
    console.log(`Downloading ${fileName} from ${downloadUrl}`);
    
    // Download the file
    await downloadFile(downloadUrl, destPath);
    console.log(`Downloaded ${fileName} to ${destPath}`);
    
    return destPath;
  } catch (error) {
    console.error(`Error downloading file ${fileName}:`, error);
    return null;
  }
}