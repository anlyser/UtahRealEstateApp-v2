import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  questionCount: integer("question_count").default(0),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  questions: many(questions)
}));

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  difficulty: text("difficulty").default("medium"),
  hasImage: boolean("has_image").default(false),
  imagePath: text("image_path"),
  isMultipleChoice: boolean("is_multiple_choice").default(false),
  options: json("options").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id]
  }),
  answers: many(answers)
}));

export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  text: text("text").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id]
  }),
}));

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  status: text("status").notNull(), // "correct", "incorrect", "review"
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  question: one(questions, {
    fields: [userProgress.questionId],
    references: [questions.id]
  }),
}));

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  processed: boolean("processed").default(false),
  extractedData: json("extracted_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create Zod schemas for validation
export const categoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.trim().min(1, "Category name is required"),
});

export const questionInsertSchema = createInsertSchema(questions, {
  text: (schema) => schema.trim().min(1, "Question text is required"),
  categoryId: (schema) => schema.positive("Category ID must be positive"),
});

export const answerInsertSchema = createInsertSchema(answers, {
  text: (schema) => schema.trim().min(1, "Answer text is required"),
  questionId: (schema) => schema.positive("Question ID must be positive"),
});

export const uploadInsertSchema = createInsertSchema(uploads, {
  filename: (schema) => schema.trim().min(1, "Filename is required"),
  filePath: (schema) => schema.trim().min(1, "File path is required"),
  fileType: (schema) => schema.trim().min(1, "File type is required"),
});

export const userProgressInsertSchema = createInsertSchema(userProgress, {
  deviceId: (schema) => schema.trim().min(1, "Device ID is required"),
  questionId: (schema) => schema.positive("Question ID must be positive"),
  status: (schema) => schema.trim().min(1, "Status is required"),
});

// Type definitions
export type Category = typeof categories.$inferSelect;
export type CategoryInsert = z.infer<typeof categoryInsertSchema>;

export type Question = typeof questions.$inferSelect;
export type QuestionInsert = z.infer<typeof questionInsertSchema>;

export type Answer = typeof answers.$inferSelect;
export type AnswerInsert = z.infer<typeof answerInsertSchema>;

export type Upload = typeof uploads.$inferSelect;
export type UploadInsert = z.infer<typeof uploadInsertSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type UserProgressInsert = z.infer<typeof userProgressInsertSchema>;

// Extended schemas for API responses
export const questionWithAnswerSchema = z.object({
  id: z.number(),
  text: z.string(),
  categoryId: z.number(),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  difficulty: z.string(),
  hasImage: z.boolean(),
  imagePath: z.string().nullable(),
  isMultipleChoice: z.boolean().default(false),
  options: z.array(z.string()).default([]),
  answer: z.object({
    id: z.number(),
    text: z.string(),
    explanation: z.string().nullable(),
  }),
});

export type QuestionWithAnswer = z.infer<typeof questionWithAnswerSchema>;
