import { z } from "zod";

const settingsSchema = z.object({
  renameInstructions: z.string().optional(),
  customFolderInstructions: z.string().optional(),
  imageInstructions: z.string().optional(),
});

export const chatTools = {
  getSearchQuery: {
    description: "Extract semantic search queries to find relevant notes based on content and meaning",
    parameters: z.object({
      query: z.string().describe("The semantic search query to find relevant notes"),
    }),
  },
  searchByName: {
    description: "Search for files by name pattern or exact match, useful for finding specific notes or groups of notes",
    parameters: z.object({
      query: z.string().describe("The name pattern to search for (e.g., 'Untitled*', 'daily-*', or exact name)"),
    }),
  },
  getYoutubeVideoId: {
    description: "Extract YouTube video ID to import and organize video content into notes",
    parameters: z.object({
      videoId: z.string().describe("The YouTube video ID"),
    }),
  },
  getLastModifiedFiles: {
    description: "Retrieve recently modified files to track changes and activity in the vault",
    parameters: z.object({
      count: z.number().describe("The number of last modified files to retrieve"),
    }),
  },
  appendContentToFile: {
    description: "Add new content to existing notes while preserving structure and formatting",
    parameters: z.object({
      content: z.string().describe("The formatted content to append to the file"),
      message: z.string().describe("Clear explanation of what content will be added"),
      fileName: z.string().optional().describe("Optional specific file to append to"),
    }),
  },
  addTextToDocument: {
    description: "Add new sections or content to notes with proper formatting and structure",
    parameters: z.object({
      content: z.string().describe("The formatted text content to add"),
      path: z.string().optional().describe("Optional path to the document. If not provided, uses current document"),
    }),
  },
  modifyDocumentText: {
    description: "Edit existing note content while maintaining consistency and structure. Can modify selected text or entire document.",
    parameters: z.object({
      content: z.string().describe("The new formatted content to replace existing content"),
      path: z.string().optional().describe("Optional path to the document. If not provided, uses current document"),
      instructions: z.string().optional().describe("Optional specific instructions for how to modify the content"),
    }),
  },
  generateSettings: {
    description: "Create personalized vault organization settings based on user preferences and best practices",
    parameters: settingsSchema,
  },
  analyzeVaultStructure: {
    description: "Analyze vault organization and provide actionable improvement suggestions (used in onboarding), help me set up my vault organization settings",
    parameters: z.object({
      path: z.string().describe("Path to analyze. Use '/' for all files or specific folder path"),
      maxDepth: z.number().optional().describe("Maximum folder depth to analyze"),
    }),
  },
  getScreenpipeDailySummary: {
    description: "Generate comprehensive daily summaries from Screenpipe data with key insights and activities",
    parameters: z.object({
      startTime: z.string().optional().describe("Start time in ISO format"),
      endTime: z.string().optional().describe("End time in ISO format"),
    }),
  },
  moveFiles: {
    description: "Organize files into appropriate folders based on content and structure",
    parameters: z.object({
      moves: z.array(
        z.object({
          sourcePath: z.string().describe("Source path (e.g., '/' for root, or specific folder path)"),
          destinationPath: z.string().describe("Destination folder path"),
          pattern: z.object({
            namePattern: z.string().optional().describe("File name pattern to match (e.g., 'untitled-*', 'daily-*')"),
            extension: z.string().optional().describe("File extension to match"),
          }).optional(),
        })
      ),
      message: z.string().describe("Clear explanation of the proposed file organization"),
    }),
  },
  renameFiles: {
    description: "Rename files intelligently based on content and organizational patterns",
    parameters: z.object({
      files: z.array(
        z.object({
          oldPath: z.string().describe("Current full path of the file"),
          newName: z.string().describe("Descriptive new file name based on content"),
        })
      ),
      message: z.string().describe("Clear explanation of the naming strategy"),
    }),
  },
  executeActionsOnFileBasedOnPrompt: {
    description: "Analyze and organize files through tagging, moving, or renaming based on content analysis",
    parameters: z.object({
      filePaths: z.array(z.string()).describe("List of file paths to analyze and organize"),
      userPrompt: z.string().describe("Specific instructions for file organization strategy"),
    }),
  },
} as const; 