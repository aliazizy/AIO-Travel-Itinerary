// Application Configuration
export const APP_CONFIG = {
  // File and Translation Settings
  fileContentLimit: 5000,
  translationLimit: 5000,
  enableTranslation: true,
  
  // Web Search Settings
  enableWebSearch: false,
  webSearchResultsLimit: 5,
  
  // System Prompt
  systemPrompt: "You are AIO Travel Itinerary assistant. You help users create, analyze, and manage travel itineraries. You can translate content, extract detailed information, generate quotations, and provide comprehensive travel planning assistance.",
  
  // Model Configuration
  models: {
    openai: [
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    gemini: [
      { id: 'gemini-pro', name: 'Gemini Pro' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
    ],
    claude: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' }
    ],
    ollama: [
      { id: 'phi4:14b', name: 'Phi-4 14B' },
      { id: 'phi3:14b', name: 'Phi-3 14B' },
      { id: 'bigllama/mistralv01-7b:latest', name: 'BigLlama Mistral v0.1 7B' },
      { id: 'magistral:latest', name: 'Magistral' },
      { id: 'gemma3:27b', name: 'Gemma 3 27B' },
      { id: 'llama3.2:latest', name: 'Llama 3.2' },
      { id: 'llama3.1:latest', name: 'Llama 3.1' },
      { id: 'mistral:instruct', name: 'Mistral Instruct' },
      { id: 'gemma3:latest', name: 'Gemma 3' },
      { id: 'gemma3:4b', name: 'Gemma 3 4B' },
      { id: 'qwen3:latest', name: 'Qwen 3' },
      { id: 'codegemma:7b', name: 'CodeGemma 7B' },
      { id: 'mixtral:latest', name: 'Mixtral' },
      { id: 'mixtral:8x7b', name: 'Mixtral 8x7B' },
      { id: 'qwen3:8b', name: 'Qwen 3 8B' },
      { id: 'deepseek-r1:latest', name: 'DeepSeek R1' },
      { id: 'mistral:latest', name: 'Mistral' },
      { id: 'llama3.3:latest', name: 'Llama 3.3' },
      { id: 'llama3.3:70b', name: 'Llama 3.3 70B' },
      { id: 'openchat:latest', name: 'OpenChat' },
      { id: 'mistral:7b', name: 'Mistral 7B' },
      { id: 'llama4:latest', name: 'Llama 4' },
      { id: 'llama4:scout', name: 'Llama 4 Scout' }
    ]
  },
  
  // Predefined Prompts
  predefinedPrompts: [
    'Translate Itinerary',
    'Extract full detailed itinerary',
    'Generate a quotation',
    'Extract all inclusion',
    'Extract all exclusions'
  ],
  
  // UI Settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ['.pdf', '.docx', '.doc', '.txt', '.html', '.htm'],
  
  // Limits and Validation
  limits: {
    fileContentLimit: {
      min: 100,
      max: 10000,
      default: 5000
    },
    translationLimit: {
      min: 100,
      max: 10000,
      default: 5000
    },
    systemPrompt: {
      minLength: 10,
      maxLength: 2000
    }
  }
};

// Settings type definition
export interface AppSettings {
  fileContentLimit: number;
  translationLimit: number;
  enableTranslation: boolean;
  enableWebSearch: boolean;
  webSearchResultsLimit: number;
  systemPrompt: string;
}

// Default settings based on config
export const DEFAULT_SETTINGS: AppSettings = {
  fileContentLimit: APP_CONFIG.fileContentLimit,
  translationLimit: APP_CONFIG.translationLimit,
  enableTranslation: APP_CONFIG.enableTranslation,
  enableWebSearch: APP_CONFIG.enableWebSearch,
  webSearchResultsLimit: APP_CONFIG.webSearchResultsLimit,
  systemPrompt: APP_CONFIG.systemPrompt
};

// Helper function to get all models in a flat array
export const getAllModels = () => {
  const allModels: Array<{ id: string; name: string; provider: string }> = [];
  
  Object.entries(APP_CONFIG.models).forEach(([provider, models]) => {
    models.forEach(model => {
      allModels.push({
        ...model,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1)
      });
    });
  });
  
  return allModels;
};

// Helper function to validate settings
export const validateSettings = (settings: Partial<AppSettings>): AppSettings => {
  return {
    fileContentLimit: Math.max(
      APP_CONFIG.limits.fileContentLimit.min,
      Math.min(
        APP_CONFIG.limits.fileContentLimit.max,
        settings.fileContentLimit || APP_CONFIG.limits.fileContentLimit.default
      )
    ),
    translationLimit: Math.max(
      APP_CONFIG.limits.translationLimit.min,
      Math.min(
        APP_CONFIG.limits.translationLimit.max,
        settings.translationLimit || APP_CONFIG.limits.translationLimit.default
      )
    ),
    enableTranslation: settings.enableTranslation ?? APP_CONFIG.enableTranslation,
    enableWebSearch: settings.enableWebSearch ?? APP_CONFIG.enableWebSearch,
    webSearchResultsLimit: Math.max(1, Math.min(10, settings.webSearchResultsLimit || APP_CONFIG.webSearchResultsLimit)),
    systemPrompt: settings.systemPrompt && settings.systemPrompt.length >= APP_CONFIG.limits.systemPrompt.minLength
      ? settings.systemPrompt.slice(0, APP_CONFIG.limits.systemPrompt.maxLength)
      : APP_CONFIG.systemPrompt
  };
};