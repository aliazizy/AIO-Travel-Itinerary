import { NextApiRequest, NextApiResponse } from 'next';

interface TranslateRequest {
  text: string;
  targetLanguage?: string;
}

// Simple language detection function
function detectLanguage(text: string): string {
  // Basic language detection patterns
  const patterns = {
    spanish: /[ñáéíóúü]/i,
    french: /[àâäéèêëïîôöùûüÿç]/i,
    german: /[äöüß]/i,
    italian: /[àèéìíîòóù]/i,
    portuguese: /[ãõáàâéêíóôúç]/i,
    russian: /[а-яё]/i,
    chinese: /[\u4e00-\u9fff]/,
    japanese: /[\u3040-\u309f\u30a0-\u30ff]/,
    korean: /[\uac00-\ud7af]/,
    arabic: /[\u0600-\u06ff]/,
  };

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      return lang;
    }
  }
  
  return 'english';
}

// Simple translation function (you can replace this with Google Translate API)
async function translateText(text: string, targetLang: string = 'en'): Promise<string> {
  const detectedLang = detectLanguage(text);
  
  // If already in English, return as is
  if (detectedLang === 'english') {
    return text;
  }

  // For demo purposes, we'll use a mock translation
  // In production, you would use Google Translate API:
  /*
  const { Translate } = require('@google-cloud/translate').v2;
  const translate = new Translate({ key: process.env.GOOGLE_TRANSLATE_API_KEY });
  
  try {
    const [translation] = await translate.translate(text, targetLang);
    return translation;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
  */

  // Mock translation for demo
  const mockTranslations: { [key: string]: string } = {
    'Hola, ¿cómo estás?': 'Hello, how are you?',
    'Bonjour, comment allez-vous?': 'Hello, how are you?',
    'Guten Tag, wie geht es Ihnen?': 'Good day, how are you?',
    'Ciao, come stai?': 'Hello, how are you?',
    'Olá, como você está?': 'Hello, how are you?',
  };

  // Check if we have a mock translation
  const mockTranslation = mockTranslations[text.trim()];
  if (mockTranslation) {
    return `[Translated from ${detectedLang}] ${mockTranslation}`;
  }

  // If no mock translation, return with detected language info
  return `[Detected: ${detectedLang}] ${text}`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, targetLanguage = 'en' }: TranslateRequest = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const translatedText = await translateText(text, targetLanguage);
    const detectedLanguage = detectLanguage(text);

    return res.status(200).json({
      originalText: text,
      translatedText,
      detectedLanguage,
      targetLanguage,
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return res.status(500).json({
      error: 'Translation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}