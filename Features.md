# AIO Travel Itinerary Assistant - Features

A comprehensive AI-powered travel itinerary planning assistant with multi-model support, file processing capabilities, and advanced chat management features.

## 🤖 AI Model Support

### Multiple AI Providers
- **OpenAI**: Industry-leading GPT models
- **Google Gemini**: Google's advanced AI models
- **Claude**: Anthropic's conversational AI
- **Ollama**: Local AI model execution

### OpenAI Models
- **GPT-4o**: Latest and most capable model
- **GPT-4o Mini**: Faster, cost-effective version
- **GPT-4 Turbo**: Enhanced GPT-4 with larger context
- **GPT-4**: Advanced reasoning and analysis
- **GPT-3.5 Turbo**: Fast and reliable baseline model

### Gemini Models
- **Gemini Pro**: Google's flagship model
- **Gemini Pro Vision**: Multi-modal capabilities

### Claude Models
- **Claude 3 Opus**: Most capable Claude model
- **Claude 3 Sonnet**: Balanced performance
- **Claude 3 Haiku**: Fast and efficient

### Ollama Models (21 Models)
- **phi4:14b** - Microsoft's Phi-4 14B parameter model
- **phi3:14b** - Microsoft's Phi-3 14B parameter model
- **bigllama/mistralv01-7b:latest** - BigLlama Mistral variant
- **magistral:latest** - Magistral model
- **gemma3:27b** - Google's Gemma 3 27B model
- **llama3.2:latest** - Meta's Llama 3.2
- **llama3.1:latest** - Meta's Llama 3.1
- **mistral:instruct** - Mistral instruction-tuned model
- **gemma3:latest** - Latest Gemma 3 model
- **gemma3:4b** - Gemma 3 4B parameter model
- **qwen3:latest** - Alibaba's Qwen 3 model
- **codegemma:7b** - Code-specialized Gemma model
- **mixtral:latest** - Mistral's Mixtral model
- **mixtral:8x7b** - Mixtral 8x7B expert model
- **qwen3:8b** - Qwen 3 8B parameter model
- **deepseek-r1:latest** - DeepSeek R1 model
- **mistral:latest** - Latest Mistral model
- **llama3.3:latest** - Meta's Llama 3.3
- **llama3.3:70b** - Llama 3.3 70B parameter model
- **openchat:latest** - OpenChat model
- **mistral:7b** - Mistral 7B model
- **llama4:latest** - Meta's Llama 4 (when available)
- **llama4:scout** - Llama 4 Scout variant

## 📁 File Upload & Processing

### Supported File Formats
- **PDF**: Portable Document Format files
- **DOCX**: Microsoft Word documents (with table support)
- **DOC**: Legacy Microsoft Word documents
- **TXT**: Plain text files
- **HTML**: Web page files
- **HTM**: Alternative HTML extension

### File Processing Features
- **Automatic Content Extraction**: Intelligent text extraction from all supported formats
- **Document Structure Preservation**: Maintains paragraphs and table formatting
- **File Size Management**: Configurable file size limits (default: 10MB)
- **Content Limiting**: Configurable character limits for processing (5000 chars)
- **Batch Upload**: Support for multiple file uploads simultaneously
- **Drag & Drop Interface**: Intuitive file upload experience

## 🌐 Translation Features

### Automatic Translation
- **English Translation**: Automatic translation of non-English content
- **Language Detection**: Automatic source language identification
- **Translation Limits**: Configurable character limits (5000 chars)
- **Toggle Control**: Enable/disable translation via settings
- **Preservation of Formatting**: Maintains document structure during translation

## 🔍 Web Search Integration

### Real-time Web Search
- **DuckDuckGo Integration**: Privacy-focused search engine
- **Contextual Search**: Automatic search based on user queries
- **Configurable Results**: 1-10 search results limit
- **Search Result Formatting**: Clean, structured result presentation
- **Context Enhancement**: Search results integrated into AI responses
- **Privacy-First**: No tracking or data collection

### Search Controls
- **Enable/Disable Toggle**: User-controlled activation
- **Result Limit Configuration**: Customizable number of results
- **Query Optimization**: Intelligent search query generation

## 💬 Chat Management

### Multi-Session Support
- **Multiple Chat Sessions**: Create and manage unlimited conversations
- **Session Persistence**: Chats saved between browser sessions
- **Chat History**: Complete conversation history maintained
- **Session Switching**: Easy navigation between different chats
- **Message Count Tracking**: Display of messages per session

### Chat Operations
- **New Chat Creation**: Start fresh conversations instantly
- **Chat Renaming**: Custom names for better organization
- **Chat Deletion**: Remove unwanted conversations
- **Session Loading**: Restore previous conversations
- **Auto-Save**: Automatic message saving to sessions

### Conversation Context
- **Full History Context**: Complete conversation sent to AI models
- **Message Threading**: Maintain conversation flow
- **File Context Preservation**: Uploaded files available throughout session
- **Cross-Message References**: AI can reference earlier messages

## 🎨 User Interface & Experience

### Modern Design
- **Framer-Inspired UI**: Premium, professional appearance
- **Clean Aesthetics**: No box shadows, modern flat design
- **Consistent Branding**: VOSAIO logo and custom favicon
- **Visual Hierarchy**: Clear information organization
- **Color-Coded Models**: Visual distinction between AI providers

### Animations & Interactions
- **Framer Motion**: Smooth fade in/out animations
- **Loading States**: Elegant loading indicators
- **Hover Effects**: Interactive element feedback
- **Transition Animations**: Smooth state changes
- **Micro-Interactions**: Delightful user feedback

### Layout & Navigation
- **Responsive Design**: Works on all device sizes
- **Collapsible Sidebar**: Space-efficient navigation (80% width)
- **Mobile Optimization**: Touch-friendly interface
- **Keyboard Shortcuts**: Efficient keyboard navigation
- **Intuitive Controls**: User-friendly interface elements

## 🌙 Theme System

### Theme Options
- **Dark Mode**: Full dark theme with proper contrast
- **Light Mode**: Clean, bright interface
- **System Mode**: Automatic theme based on OS preference
- **Theme Persistence**: Remembers user preference

### Theme Features
- **Consistent Theming**: All components support both themes
- **Smooth Transitions**: Animated theme switching
- **Accessibility**: Proper contrast ratios maintained
- **Custom Colors**: Tailored color palette for each theme

## 🎤 Voice Input

### Speech Recognition
- **Browser-Based**: Uses Web Speech API
- **Real-time Transcription**: Live speech-to-text conversion
- **Continuous Recognition**: Extended speech input support
- **Language Support**: Multiple language recognition
- **Error Handling**: Graceful handling of recognition errors

### Voice Controls
- **Click-to-Speak**: Easy activation/deactivation
- **Visual Feedback**: Clear indication of recording state
- **Microphone Permissions**: Proper permission handling
- **Fallback Support**: Graceful degradation for unsupported browsers

## ⚙️ Settings & Configuration

### Centralized Configuration
- **app-config.ts**: Single source of truth for all settings
- **Environment Variables**: Secure API key management
- **Validation**: Input validation for all settings
- **Default Values**: Sensible defaults for all options

### Configurable Options
- **File Content Limits**: 100-10,000 character range (default: 5000)
- **Translation Limits**: 100-10,000 character range (default: 5000)
- **System Prompts**: Custom AI behavior instructions
- **Web Search Settings**: Enable/disable and result limits
- **Model Selection**: Default model preferences

### Settings Management
- **Settings Modal**: User-friendly configuration interface
- **Real-time Validation**: Immediate feedback on invalid inputs
- **Reset to Defaults**: Easy restoration of default settings
- **Settings Persistence**: User preferences saved locally

## 📝 Message Actions

### Individual Message Controls
- **Copy Message**: Copy any message content to clipboard
- **Edit Messages**: Modify and resend user messages
- **Retry Generation**: Regenerate AI responses
- **Download as HTML**: Export individual messages as HTML files

### Message Management
- **Message History**: Complete conversation tracking
- **Message Timestamps**: Time tracking for all messages
- **File Attachments**: File context preserved with messages
- **Message Threading**: Maintain conversation flow

### Editing Features
- **Inline Editing**: Edit messages directly in chat
- **Auto-Regeneration**: Automatic AI response after edits
- **Edit History**: Track message modifications
- **Cancel Editing**: Revert changes if needed

## 🚀 Predefined Prompts

### Travel-Specific Templates
- **Translate Itinerary**: Convert itineraries to English
- **Extract Full Detailed Itinerary**: Comprehensive itinerary extraction
- **Generate a Quotation**: Create travel cost estimates
- **Extract All Inclusions**: List included services/items
- **Extract All Exclusions**: List excluded services/items

### Prompt Features
- **Quick Access**: One-click prompt insertion
- **Sidebar Integration**: Easy access from navigation
- **Customizable**: Prompts configurable in app settings
- **Context Aware**: Prompts work with uploaded files

## 🔧 Technical Features

### Framework & Architecture
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout application
- **API Routes**: RESTful backend endpoints
- **Server-Side Rendering**: Optimized performance
- **Static Generation**: Fast page loading

### Styling & Components
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components
- **Radix UI**: Primitive components for complex interactions
- **Custom Components**: Specialized chat and file components
- **Responsive Grid**: Flexible layout system

### State Management
- **React Hooks**: Modern state management
- **Local Storage**: Client-side data persistence
- **Context API**: Global state sharing
- **Form Handling**: Robust form validation and submission

### Error Handling
- **Comprehensive Error Boundaries**: Graceful error recovery
- **API Error Handling**: Detailed error messages
- **User Feedback**: Toast notifications for all actions
- **Fallback UI**: Alternative interfaces for errors

## 📱 Mobile Optimization

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets and gestures
- **Viewport Optimization**: Proper mobile viewport handling
- **Performance**: Optimized for mobile networks

### Mobile-Specific Features
- **Sheet Components**: Mobile-optimized modals and drawers
- **Collapsible Navigation**: Space-efficient mobile sidebar
- **Touch Gestures**: Swipe and tap interactions
- **Mobile Keyboard**: Optimized input handling

## 🔒 Security & Privacy

### Data Protection
- **Environment Variables**: Secure API key storage
- **Client-Side Processing**: File processing in browser when possible
- **No Permanent Storage**: Messages not stored server-side permanently
- **Privacy-First Search**: DuckDuckGo for web search

### Security Features
- **Input Validation**: All user inputs validated
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery prevention
- **Secure Headers**: Proper security headers implementation

## 🌐 Deployment & Infrastructure

### Deployment Options
- **Azure Web App**: Configured for Azure deployment
- **Vercel**: Ready for Vercel deployment
- **Docker**: Containerization support
- **Environment Configuration**: Production-ready setup

### Performance Features
- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic image optimization
- **Caching**: Efficient caching strategies

### Monitoring & Analytics
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Application performance tracking
- **User Analytics**: Usage pattern analysis
- **Health Checks**: Application health monitoring

## 🔄 Integration Capabilities

### API Integrations
- **OpenAI API**: Full GPT model integration
- **Google AI**: Gemini model support
- **Anthropic API**: Claude model integration
- **Ollama**: Local model execution
- **DuckDuckGo**: Web search integration

### File Processing APIs
- **PDF Processing**: pdf-parse library integration
- **DOCX Processing**: mammoth library for Word documents
- **HTML Processing**: Native HTML parsing
- **Text Processing**: Advanced text manipulation

### Third-Party Services
- **Unsplash**: Background image integration
- **Web Speech API**: Browser speech recognition
- **File System API**: Advanced file handling
- **Clipboard API**: Copy/paste functionality

---

## Getting Started

To use all these features:

1. **Install Dependencies**: `npm install` or `pnpm install`
2. **Configure Environment**: Set up API keys in `.env.local`
3. **Run Development**: `npm run dev` or `pnpm dev`
4. **Access Application**: Open `http://localhost:3000`

## Configuration

All features can be configured through:
- **Settings Modal**: User interface for runtime configuration
- **app-config.ts**: Developer configuration file
- **Environment Variables**: Secure API key management

## Support

For issues or feature requests, please refer to the application's error handling system and toast notifications for immediate feedback.