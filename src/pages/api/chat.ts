import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { DEFAULT_SETTINGS, validateSettings, AppSettings, getAllModels } from '@/config/app-config';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: UploadedFile[];
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content?: string;
}

interface SettingsConfig {
  fileContentLimit: number;
  translationLimit: number;
  enableTranslation: boolean;
  enableWebSearch: boolean;
  webSearchResultsLimit: number;
  systemPrompt: string;
}

interface ChatRequest {
  messages: Message[];
  model: string;
  settings?: SettingsConfig;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Web search function
async function performWebSearch(query: string, limit: number = 5): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/web-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, limit }),
    });

    if (!response.ok) {
      throw new Error('Web search failed');
    }

    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const searchResults = data.results
        .map((result: any, index: number) => 
          `${index + 1}. ${result.title}\n   ${result.snippet}\n   URL: ${result.url}`
        )
        .join('\n\n');
      
      return `\n\n--- Web Search Results for "${query}" ---\n${searchResults}\n--- End of Search Results ---\n`;
    }
    
    return '';
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

async function callOpenAI(messages: Message[], model: string, settings: SettingsConfig): Promise<string> {
  try {
    const formattedMessages = await Promise.all(messages.map(async (msg) => {
      let content = msg.content;
      
      // If the message has files, include their content (limited by settings)
      if (msg.files && msg.files.length > 0) {
        const fileContents = msg.files
          .map(file => {
            const limitedContent = file.content && file.content.length > settings.fileContentLimit
              ? file.content.substring(0, settings.fileContentLimit) + '...'
              : file.content;
            return `\n\n--- Content from ${file.name} ---\n${limitedContent}`;
          })
          .join('\n');
        content += fileContents;
      }

      // Add web search results if enabled and this is a user message
      if (settings.enableWebSearch && msg.role === 'user') {
        const searchResults = await performWebSearch(msg.content, settings.webSearchResultsLimit);
        if (searchResults) {
          content += searchResults;
        }
      }
      
      return {
        role: msg.role,
        content: content,
      };
    }));

    // Add system prompt if provided
    const messagesWithSystem = settings.systemPrompt.trim() 
      ? [{ role: 'system', content: settings.systemPrompt }, ...formattedMessages]
      : formattedMessages;

    // Map model names to actual OpenAI model IDs
    let openaiModel = 'gpt-3.5-turbo';
    switch (model) {
      case 'gpt-4o':
        openaiModel = 'gpt-4o';
        break;
      case 'gpt-4o-mini':
        openaiModel = 'gpt-4o-mini';
        break;
      case 'gpt-4-turbo':
        openaiModel = 'gpt-4-turbo';
        break;
      case 'gpt-4':
        openaiModel = 'gpt-4';
        break;
      case 'gpt-3.5-turbo':
        openaiModel = 'gpt-3.5-turbo';
        break;
    }

    const completion = await openai.chat.completions.create({
      model: openaiModel,
      messages: messagesWithSystem as any,
      max_tokens: 2000,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to get response from OpenAI');
  }
}

async function callGemini(messages: Message[]): Promise<string> {
  // Placeholder for Gemini API integration
  // You would implement Google's Gemini API here
  try {
    // For now, return a mock response
    const lastMessage = messages[messages.length - 1];
    let content = lastMessage.content;
    
    if (lastMessage.files && lastMessage.files.length > 0) {
      const fileContents = lastMessage.files
        .map(file => `Content from ${file.name}: ${file.content?.substring(0, 500)}...`)
        .join('\n');
      content += `\n\nFiles uploaded: ${fileContents}`;
    }
    
    return `[Gemini Pro Response] I understand you're asking: "${content}". This is a mock response as Gemini API integration requires additional setup with Google AI Studio credentials.`;
  } catch (error) {
    throw new Error('Failed to get response from Gemini');
  }
}

async function callClaude(messages: Message[]): Promise<string> {
  // Placeholder for Claude API integration
  // You would implement Anthropic's Claude API here
  try {
    const lastMessage = messages[messages.length - 1];
    let content = lastMessage.content;
    
    if (lastMessage.files && lastMessage.files.length > 0) {
      const fileContents = lastMessage.files
        .map(file => `Content from ${file.name}: ${file.content?.substring(0, 500)}...`)
        .join('\n');
      content += `\n\nFiles uploaded: ${fileContents}`;
    }
    
    return `[Claude 3 Response] Thank you for your question: "${content}". This is a mock response as Claude API integration requires Anthropic API credentials.`;
  } catch (error) {
    throw new Error('Failed to get response from Claude');
  }
}

async function callOllama(messages: Message[], model: string, settings: SettingsConfig): Promise<string> {
  try {
    const lastMessage = messages[messages.length - 1];
    let content = lastMessage.content;
    
    if (lastMessage.files && lastMessage.files.length > 0) {
      const fileContents = lastMessage.files
        .map(file => {
          const limitedContent = file.content && file.content.length > settings.fileContentLimit
            ? file.content.substring(0, settings.fileContentLimit) + '...'
            : file.content;
          return `Content from ${file.name}: ${limitedContent}`;
        })
        .join('\n');
      content += `\n\nFiles uploaded: ${fileContents}`;
    }

    // Add system prompt if provided
    const fullPrompt = settings.systemPrompt.trim() 
      ? `${settings.systemPrompt}\n\nUser: ${content}`
      : content;

    // Call local Ollama instance - use model ID directly as it matches Ollama model names
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error('Ollama server not available');
    }

    const data = await response.json();
    return data.response || 'No response from Ollama';
  } catch (error) {
    console.error('Ollama error:', error);
    // Return a mock response if Ollama is not available
    const lastMessage = messages[messages.length - 1];
    return `[${model} Response] I received your message: "${lastMessage.content}". This is a mock response as Ollama server is not running locally. To use Ollama models, please install and run Ollama locally.`;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model, sessionId, settings }: ChatRequest & { sessionId?: string } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Use provided settings or defaults
    const finalSettings = settings ? validateSettings(settings) : DEFAULT_SETTINGS;

    // If sessionId is provided, get the full conversation history
    let fullMessages = messages;
    if (sessionId) {
      try {
        const sessionResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/chat-sessions?sessionId=${sessionId}`);
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          // Combine session history with new messages
          fullMessages = [...sessionData.messages, ...messages.slice(-1)]; // Only add the latest message to avoid duplication
        }
      } catch (error) {
        console.error('Failed to fetch session history:', error);
        // Continue with just the provided messages if session fetch fails
      }
    }

    let response: string;

    // Get all available models to determine the provider
    const allModels = getAllModels();
    const selectedModel = allModels.find(m => m.id === model);
    
    if (!selectedModel) {
      return res.status(400).json({ error: 'Unsupported model' });
    }

    // Route to appropriate provider based on model
    switch (selectedModel.provider.toLowerCase()) {
      case 'openai':
        response = await callOpenAI(fullMessages, model, finalSettings);
        break;
      
      case 'gemini':
        response = await callGemini(fullMessages);
        break;
      
      case 'claude':
        response = await callClaude(fullMessages);
        break;
      
      case 'ollama':
        response = await callOllama(fullMessages, model, finalSettings);
        break;
      
      default:
        return res.status(400).json({ error: 'Unsupported model provider' });
    }

    return res.status(200).json({
      content: response,
      model: model,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}