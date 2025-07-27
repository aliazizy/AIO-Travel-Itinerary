import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

interface SettingsConfig {
  fileContentLimit: number;
  translationLimit: number;
  enableTranslation: boolean;
  systemPrompt: string;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

const uploadMiddleware = promisify(upload.single('file'));

// Disable Next.js body parser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  try {
    switch (mimeType) {
      case 'text/plain':
      case 'text/html':
        return fs.readFileSync(filePath, 'utf-8');
      
      case 'application/pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxBuffer = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: docxBuffer });
        return result.value;
      
      case 'application/msword':
        // For .doc files, we'll try to read as text (limited support)
        return fs.readFileSync(filePath, 'utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
}

async function translateToEnglish(text: string, settings: SettingsConfig): Promise<string> {
  try {
    // Check if translation is enabled
    if (!settings.enableTranslation) {
      return text;
    }

    // Limit text length for translation
    const textToTranslate = text.length > settings.translationLimit 
      ? text.substring(0, settings.translationLimit) + '...'
      : text;

    // Call our translation API
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: textToTranslate,
        targetLanguage: 'en',
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result.translatedText;
    } else {
      console.error('Translation API failed, returning original text');
      return text;
    }
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload
    await uploadMiddleware(req as any, res as any);
    
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get settings from form data or use defaults
    const settingsJson = (req as any).body?.settings;
    const settings: SettingsConfig = settingsJson ? JSON.parse(settingsJson) : {
      fileContentLimit: 500,
      translationLimit: 500,
      enableTranslation: true,
      systemPrompt: ''
    };

    // Extract text from the uploaded file
    let extractedText = await extractTextFromFile(file.path, file.mimetype);
    
    // Apply file content limit
    if (extractedText.length > settings.fileContentLimit) {
      extractedText = extractedText.substring(0, settings.fileContentLimit) + '...';
    }
    
    // Translate to English if needed
    const translatedText = await translateToEnglish(extractedText, settings);
    
    // Clean up the temporary file
    fs.unlinkSync(file.path);
    
    return res.status(200).json({
      success: true,
      content: translatedText,
      originalName: file.originalname,
      size: file.size,
      type: file.mimetype,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}