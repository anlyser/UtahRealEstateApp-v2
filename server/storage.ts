import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

// Define storage directory
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Ensure subdirectories exist
const DOCS_DIR = path.join(UPLOAD_DIR, "documents");
const IMAGES_DIR = path.join(UPLOAD_DIR, "images");

if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Storage interface for categories
export const categoryStorage = {
  async getAll() {
    return db.select().from(schema.categories).orderBy(schema.categories.name);
  },

  async getById(id: number) {
    const results = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, id));
    
    return results.length > 0 ? results[0] : null;
  },

  async create(data: schema.CategoryInsert) {
    const [category] = await db
      .insert(schema.categories)
      .values(data)
      .returning();
    
    return category;
  },

  async update(id: number, data: Partial<schema.CategoryInsert>) {
    const [category] = await db
      .update(schema.categories)
      .set(data)
      .where(eq(schema.categories.id, id))
      .returning();
    
    return category;
  },

  async updateQuestionCount(categoryId: number) {
    // Count questions for this category
    const result = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.questions)
      .where(eq(schema.questions.categoryId, categoryId));
    
    const count = result[0]?.count || 0;
    
    // Update the category's question count
    await db
      .update(schema.categories)
      .set({ questionCount: count })
      .where(eq(schema.categories.id, categoryId));
      
    return count;
  }
};

// Storage interface for questions
export const questionStorage = {
  async getAll(categoryId?: number) {
    const query = db.select({
      id: schema.questions.id,
      text: schema.questions.text,
      categoryId: schema.questions.categoryId,
      category: {
        id: schema.categories.id,
        name: schema.categories.name,
      },
      difficulty: schema.questions.difficulty,
      hasImage: schema.questions.hasImage,
      imagePath: schema.questions.imagePath,
      isMultipleChoice: schema.questions.isMultipleChoice,
      options: schema.questions.options,
      answer: {
        id: schema.answers.id,
        text: schema.answers.text,
        explanation: schema.answers.explanation,
      }
    })
    .from(schema.questions)
    .leftJoin(schema.categories, eq(schema.questions.categoryId, schema.categories.id))
    .leftJoin(schema.answers, eq(schema.questions.id, schema.answers.questionId));
    
    if (categoryId) {
      return query.where(eq(schema.questions.categoryId, categoryId));
    }
    
    return query;
  },

  async getById(id: number) {
    const result = await db
      .select({
        id: schema.questions.id,
        text: schema.questions.text,
        categoryId: schema.questions.categoryId,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
        },
        difficulty: schema.questions.difficulty,
        hasImage: schema.questions.hasImage,
        imagePath: schema.questions.imagePath,
        isMultipleChoice: schema.questions.isMultipleChoice,
        options: schema.questions.options,
        answer: {
          id: schema.answers.id,
          text: schema.answers.text,
          explanation: schema.answers.explanation,
        }
      })
      .from(schema.questions)
      .leftJoin(schema.categories, eq(schema.questions.categoryId, schema.categories.id))
      .leftJoin(schema.answers, eq(schema.questions.id, schema.answers.questionId))
      .where(eq(schema.questions.id, id));
    
    return result.length > 0 ? result[0] : null;
  },

  async create(questionData: schema.QuestionInsert, answerData: schema.AnswerInsert) {
    // Start a transaction
    return await db.transaction(async (tx) => {
      // Insert the question
      const [question] = await tx
        .insert(schema.questions)
        .values(questionData)
        .returning();
      
      // Insert the answer with the question ID
      const [answer] = await tx
        .insert(schema.answers)
        .values({
          ...answerData,
          questionId: question.id,
        })
        .returning();
      
      // Update the question count for this category
      await categoryStorage.updateQuestionCount(question.categoryId);
      
      return { question, answer };
    });
  },

  async getSavedByDeviceId(deviceId: string) {
    // Get question IDs that are marked as saved
    const saved = await db
      .select({ questionId: schema.userProgress.questionId })
      .from(schema.userProgress)
      .where(and(
        eq(schema.userProgress.deviceId, deviceId),
        eq(schema.userProgress.status, "saved")
      ));
    
    return saved.map(item => item.questionId);
  },

  async getSavedQuestionsWithDetailsByDeviceId(deviceId: string) {
    // Get full question details for saved questions
    return db
      .select({
        id: schema.questions.id,
        text: schema.questions.text,
        categoryId: schema.questions.categoryId,
        category: {
          id: schema.categories.id,
          name: schema.categories.name,
        },
        difficulty: schema.questions.difficulty,
        hasImage: schema.questions.hasImage,
        imagePath: schema.questions.imagePath,
        isMultipleChoice: schema.questions.isMultipleChoice,
        options: schema.questions.options,
        answer: {
          id: schema.answers.id,
          text: schema.answers.text,
          explanation: schema.answers.explanation,
        }
      })
      .from(schema.questions)
      .leftJoin(schema.categories, eq(schema.questions.categoryId, schema.categories.id))
      .leftJoin(schema.answers, eq(schema.questions.id, schema.answers.questionId))
      .leftJoin(schema.userProgress, eq(schema.questions.id, schema.userProgress.questionId))
      .where(and(
        eq(schema.userProgress.deviceId, deviceId),
        eq(schema.userProgress.status, "saved")
      ));
  }
};

// Storage interface for user progress
export const progressStorage = {
  async updateProgress(deviceId: string, questionId: number, status: string) {
    // Check if progress record already exists
    const existing = await db
      .select()
      .from(schema.userProgress)
      .where(and(
        eq(schema.userProgress.deviceId, deviceId),
        eq(schema.userProgress.questionId, questionId)
      ));
    
    if (existing.length > 0) {
      // Update existing record
      const [progress] = await db
        .update(schema.userProgress)
        .set({ 
          status,
          updatedAt: new Date()
        })
        .where(and(
          eq(schema.userProgress.deviceId, deviceId),
          eq(schema.userProgress.questionId, questionId)
        ))
        .returning();
      
      return progress;
    } else {
      // Create new record
      const [progress] = await db
        .insert(schema.userProgress)
        .values({
          deviceId,
          questionId,
          status,
        })
        .returning();
      
      return progress;
    }
  },

  async saveQuestion(deviceId: string, questionId: number) {
    return this.updateProgress(deviceId, questionId, "saved");
  },

  async unsaveQuestion(deviceId: string, questionId: number) {
    const [progress] = await db
      .delete(schema.userProgress)
      .where(and(
        eq(schema.userProgress.deviceId, deviceId),
        eq(schema.userProgress.questionId, questionId),
        eq(schema.userProgress.status, "saved")
      ))
      .returning();
    
    return progress;
  },

  async getProgressSummary(deviceId: string) {
    // Get total questions
    const totalResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(schema.questions);
    
    const total = totalResult[0]?.count || 0;
    
    // Get completed questions (correct or incorrect)
    const completedResult = await db
      .select({ count: sql<number>`COUNT(DISTINCT question_id)` })
      .from(schema.userProgress)
      .where(and(
        eq(schema.userProgress.deviceId, deviceId),
        or(
          eq(schema.userProgress.status, "correct"),
          eq(schema.userProgress.status, "incorrect")
        )
      ));
    
    const completed = completedResult[0]?.count || 0;
    
    // Calculate percentage
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Get progress by category
    const categoriesWithProgress = await db
      .select({
        categoryId: schema.categories.id,
        categoryName: schema.categories.name,
        total: sql<number>`COUNT(DISTINCT ${schema.questions.id})`,
      })
      .from(schema.categories)
      .leftJoin(schema.questions, eq(schema.categories.id, schema.questions.categoryId))
      .groupBy(schema.categories.id, schema.categories.name);
    
    // For each category, get completed questions
    const byCategory = await Promise.all(
      categoriesWithProgress.map(async (category) => {
        const completedInCategory = await db
          .select({ count: sql<number>`COUNT(DISTINCT ${schema.userProgress.questionId})` })
          .from(schema.userProgress)
          .innerJoin(schema.questions, eq(schema.userProgress.questionId, schema.questions.id))
          .where(and(
            eq(schema.userProgress.deviceId, deviceId),
            eq(schema.questions.categoryId, category.categoryId),
            or(
              eq(schema.userProgress.status, "correct"),
              eq(schema.userProgress.status, "incorrect")
            )
          ));
        
        const completedCount = completedInCategory[0]?.count || 0;
        const categoryPercentage = category.total > 0 
          ? Math.round((completedCount / Number(category.total)) * 100) 
          : 0;
        
        return {
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          completed: completedCount,
          total: Number(category.total),
          percentage: categoryPercentage
        };
      })
    );
    
    return {
      completed,
      total,
      percentage,
      byCategory
    };
  },

  async resetProgress(deviceId: string) {
    return db
      .delete(schema.userProgress)
      .where(eq(schema.userProgress.deviceId, deviceId));
  }
};

// Storage interface for file uploads
export const uploadStorage = {
  async saveFile(file: Express.Multer.File) {
    // Determine directory based on mimetype
    const isDocument = file.mimetype === 'application/pdf';
    const targetDir = isDocument ? DOCS_DIR : IMAGES_DIR;
    
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const uniqueFilename = `${randomUUID()}${fileExt}`;
    const filePath = path.join(targetDir, uniqueFilename);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);
    
    // Store upload record in database
    const data: schema.UploadInsert = {
      filename: file.originalname,
      filePath: filePath,
      fileType: file.mimetype,
    };
    
    const [upload] = await db
      .insert(schema.uploads)
      .values(data)
      .returning();
    
    return upload;
  },

  async getAll() {
    return db
      .select()
      .from(schema.uploads)
      .orderBy(desc(schema.uploads.createdAt));
  },

  async getById(id: number) {
    const results = await db
      .select()
      .from(schema.uploads)
      .where(eq(schema.uploads.id, id));
    
    return results.length > 0 ? results[0] : null;
  },

  async markAsProcessed(id: number, extractedData?: any) {
    const [upload] = await db
      .update(schema.uploads)
      .set({ 
        processed: true,
        extractedData: extractedData ? JSON.stringify(extractedData) : null
      })
      .where(eq(schema.uploads.id, id))
      .returning();
    
    return upload;
  }
};
