import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import * as storage from "./storage";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";
import * as schema from "@shared/schema";
import { z } from "zod";

// Set up multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiPrefix = "/api";
  
  // Helper function to handle errors
  const asyncHandler = (fn: Function) => (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((err) => {
      console.error("API Error:", err);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message || "Something went wrong" 
      });
    });
  };
  
  // Get device ID from request
  const getDeviceId = (req: Request): string => {
    const deviceId = req.headers["x-device-id"] as string;
    if (!deviceId) {
      throw new Error("Device ID is required");
    }
    return deviceId;
  };

  // Categories routes
  app.get(`${apiPrefix}/categories`, asyncHandler(async (req, res) => {
    const categories = await storage.categoryStorage.getAll();
    res.json(categories);
  }));

  app.get(`${apiPrefix}/categories/:id`, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const category = await storage.categoryStorage.getById(id);
    
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    
    res.json(category);
  }));

  app.post(`${apiPrefix}/categories`, asyncHandler(async (req, res) => {
    try {
      const data = schema.categoryInsertSchema.parse(req.body);
      const category = await storage.categoryStorage.create(data);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      throw err;
    }
  }));

  // Questions routes
  app.get(`${apiPrefix}/questions`, asyncHandler(async (req, res) => {
    const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
    const questions = await storage.questionStorage.getAll(categoryId);
    res.json(questions);
  }));

  app.get(`${apiPrefix}/questions/:id`, asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const question = await storage.questionStorage.getById(id);
    
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    
    res.json(question);
  }));

  app.post(`${apiPrefix}/questions`, asyncHandler(async (req, res) => {
    try {
      // Validate question data
      const questionData = schema.questionInsertSchema.parse(req.body.question);
      const answerData = schema.answerInsertSchema.parse(req.body.answer);
      
      const result = await storage.questionStorage.create(questionData, answerData);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ errors: err.errors });
      }
      throw err;
    }
  }));

  // User progress routes
  app.get(`${apiPrefix}/progress`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const progress = await storage.progressStorage.getProgressSummary(deviceId);
      res.json(progress);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post(`${apiPrefix}/progress`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const { questionId, status } = req.body;
      
      if (!questionId || !status) {
        return res.status(400).json({ error: "Question ID and status are required" });
      }
      
      if (!["correct", "incorrect", "review"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'correct', 'incorrect', or 'review'" });
      }
      
      const progress = await storage.progressStorage.updateProgress(deviceId, questionId, status);
      res.status(200).json(progress);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post(`${apiPrefix}/progress/reset`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      await storage.progressStorage.resetProgress(deviceId);
      res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  // Saved questions routes
  app.get(`${apiPrefix}/saved-questions`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const savedQuestions = await storage.questionStorage.getSavedByDeviceId(deviceId);
      res.json(savedQuestions);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.get(`${apiPrefix}/saved-questions/details`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const savedQuestions = await storage.questionStorage.getSavedQuestionsWithDetailsByDeviceId(deviceId);
      res.json(savedQuestions);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post(`${apiPrefix}/saved-questions`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const { questionId } = req.body;
      
      if (!questionId) {
        return res.status(400).json({ error: "Question ID is required" });
      }
      
      const result = await storage.progressStorage.saveQuestion(deviceId, questionId);
      res.status(200).json(result);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.delete(`${apiPrefix}/saved-questions/:id`, asyncHandler(async (req, res) => {
    try {
      const deviceId = getDeviceId(req);
      const questionId = parseInt(req.params.id);
      
      await storage.progressStorage.unsaveQuestion(deviceId, questionId);
      res.status(200).json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));

  // File upload routes
  app.get(`${apiPrefix}/uploads`, asyncHandler(async (req, res) => {
    const uploads = await storage.uploadStorage.getAll();
    res.json(uploads);
  }));

  app.post(`${apiPrefix}/uploads`, upload.array('files', 5), asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }
    
    const uploadResults = [];
    
    for (const file of files) {
      // Check file type
      if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
        return res.status(400).json({ 
          error: "Invalid file type. Only PDF, JPEG, and PNG files are allowed." 
        });
      }
      
      const uploadResult = await storage.uploadStorage.saveFile(file);
      uploadResults.push(uploadResult);
      
      // Process the upload asynchronously
      processUpload(uploadResult).catch(err => {
        console.error(`Error processing upload ${uploadResult.id}:`, err);
      });
    }
    
    res.status(201).json(uploadResults);
  }));
  
  // Dropbox shared folder download endpoint
  app.post(`${apiPrefix}/dropbox-download`, asyncHandler(async (req, res) => {
    try {
      // Inform client that the download process has been initiated
      res.status(202).json({ 
        message: "Download from Dropbox shared folder initiated. This may take some time to complete."
      });
      
      // Import the Dropbox downloader module
      const { downloadAllFilesFromDropbox } = await import('./dropbox-downloader');
      
      // Start the download process asynchronously
      downloadAllFilesFromDropbox().catch(error => {
        console.error('Error downloading files from Dropbox shared folder:', error);
      });
    } catch (error) {
      console.error('Error initiating Dropbox download:', error);
      res.status(500).json({ 
        error: "Failed to initiate Dropbox download", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));
  
  // Backward compatibility: Keep the old Google Drive endpoint but use Dropbox instead
  app.post(`${apiPrefix}/drive-download`, asyncHandler(async (req, res) => {
    try {
      // Inform client that the download process has been initiated
      res.status(202).json({ 
        message: "Download from shared folder initiated. This may take some time to complete."
      });
      
      // Import the Dropbox downloader module
      const { downloadAllFilesFromDropbox } = await import('./dropbox-downloader');
      
      // Start the download process using Dropbox
      downloadAllFilesFromDropbox().catch(error => {
        console.error('Error downloading files from Dropbox shared folder:', error);
      });
    } catch (error) {
      console.error('Error initiating download:', error);
      res.status(500).json({ 
        error: "Failed to initiate download", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));
  
  // Google Drive single file download endpoint
  app.post(`${apiPrefix}/drive-download/file`, asyncHandler(async (req, res) => {
    try {
      // Check what kind of request we received
      const { url, fileName, fileId } = req.body;
      
      if (fileId) {
        // We have a file ID, use the API if possible
        if (!fileName) {
          return res.status(400).json({ 
            error: "fileName is required when using fileId" 
          });
        }
        
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
          // Import the API-based downloader module
          const { downloadSpecificFile } = await import('./drive-api-downloader');
          
          // Trigger the download process with the API
          const localPath = await downloadSpecificFile(fileId, fileName);
          
          if (!localPath) {
            return res.status(500).json({ 
              error: "Failed to download file" 
            });
          }
          
          res.status(200).json({ 
            message: "File downloaded successfully", 
            fileName, 
            localPath 
          });
        } else {
          // No API credentials, use fallback with constructed URL
          const { downloadManualFile } = await import('./drive-downloader');
          
          // Construct a Google Drive view URL from the file ID
          const driveUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
          
          // Trigger the download process
          const localPath = await downloadManualFile(driveUrl, fileName);
          
          if (!localPath) {
            return res.status(500).json({ 
              error: "Failed to download file" 
            });
          }
          
          res.status(200).json({ 
            message: "File downloaded successfully", 
            fileName, 
            localPath 
          });
        }
      } else if (url) {
        // We have a URL, use the legacy method
        if (!fileName) {
          return res.status(400).json({ 
            error: "fileName is required when using url" 
          });
        }
        
        // Import the downloader module dynamically
        const { downloadManualFile } = await import('./drive-downloader');
        
        // Trigger the download process
        const localPath = await downloadManualFile(url, fileName);
        
        if (!localPath) {
          return res.status(500).json({ 
            error: "Failed to download file" 
          });
        }
        
        res.status(200).json({ 
          message: "File downloaded successfully", 
          fileName, 
          localPath 
        });
      } else {
        return res.status(400).json({ 
          error: "Either url or fileId is required along with fileName" 
        });
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({ 
        error: "Failed to download file", 
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }));

  // Set up device ID middleware to extract from header or query
  app.use((req, res, next) => {
    // Allow device ID to be passed in header or query parameter
    const deviceId = req.headers["x-device-id"] || req.query.deviceId;
    if (deviceId) {
      req.headers["x-device-id"] = deviceId as string;
    }
    next();
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Process uploaded files asynchronously
async function processUpload(upload: schema.Upload): Promise<void> {
  console.log(`Processing upload ${upload.id}: ${upload.filename}`);
  
  try {
    // Check file type to determine how to process it
    const isDocument = upload.fileType === 'application/pdf';
    
    if (isDocument) {
      // Import the PDF parser here to avoid circular dependencies
      const { parsePdfFile, saveQuestionsToDatabase } = await import('./pdf-parser');
      
      // Parse the PDF file
      const options = {
        extractExplanations: true,
        autoCategories: true
      };
      
      console.log(`Parsing PDF file: ${upload.filePath}`);
      const parseResult = await parsePdfFile(upload.filePath, options);
      
      if (parseResult.questions.length > 0) {
        console.log(`Found ${parseResult.questions.length} questions in the PDF`);
        
        // Save questions to database
        const saveResult = await saveQuestionsToDatabase(parseResult.questions);
        
        // Mark upload as processed with results
        await storage.uploadStorage.markAsProcessed(upload.id, {
          processedAt: new Date().toISOString(),
          status: 'success',
          filesProcessed: 1,
          questionsExtracted: saveResult.added,
          errors: saveResult.errors
        });
        
        console.log(`Upload ${upload.id} processed successfully. Added ${saveResult.added} questions.`);
      } else {
        // No questions found
        await storage.uploadStorage.markAsProcessed(upload.id, {
          processedAt: new Date().toISOString(),
          status: 'warning',
          filesProcessed: 1,
          questionsExtracted: 0,
          errors: parseResult.errors
        });
        
        console.log(`Upload ${upload.id} processed but no questions were extracted.`);
      }
    } else {
      // For now, just mark image files as processed without extracting questions
      // In a production app, this would use OCR to extract text from images
      await storage.uploadStorage.markAsProcessed(upload.id, {
        processedAt: new Date().toISOString(),
        status: 'warning',
        filesProcessed: 1,
        questionsExtracted: 0,
        errors: ['Image processing is not fully implemented yet.']
      });
      
      console.log(`Upload ${upload.id} processed as image (no text extraction yet).`);
    }
  } catch (error) {
    console.error(`Error processing upload ${upload.id}:`, error);
    
    // Mark as failed
    await storage.uploadStorage.markAsProcessed(upload.id, {
      processedAt: new Date().toISOString(),
      status: 'error',
      filesProcessed: 0,
      questionsExtracted: 0,
      errors: [error instanceof Error ? error.message : String(error)]
    });
    
    throw error;
  }
}
