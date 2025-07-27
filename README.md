# AI Chat Assistant

A beautiful ChatGPT-like chat application with support for multiple AI models, file uploads, and automatic translation to English.

## Features

- 🤖 **Multiple AI Models**: OpenAI GPT-4/3.5, Google Gemini, Anthropic Claude, Ollama (Llama 2, Mistral)
- 📁 **File Upload Support**: PDF, DOCX, DOC, TXT, HTML files with content extraction
- 🌍 **Translation Ready**: Framework for automatic English translation
- 🎨 **Beautiful UI**: Modern design with smooth animations using Framer Motion
- 📱 **Responsive**: Works on desktop and mobile devices
- 🌙 **Theme Support**: Dark/Light mode compatibility

## Prerequisites

Before running the app locally, make sure you have:

- **Node.js** (version 18 or higher)
- **npm** or **pnpm** (pnpm recommended)
- **Git** (for cloning the repository)

## Local Setup Instructions

### 1. Clone and Install Dependencies

```bash
# If you haven't cloned the repository yet
git clone <your-repo-url>
cd <your-repo-name>

# Install dependencies using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Add the following environment variables to `.env.local`:

```env
# Required for OpenAI models (GPT-4, GPT-3.5)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Add these if you want to use other models
GOOGLE_API_KEY=your_google_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# For development
NEXT_PUBLIC_CO_DEV_ENV=development
```

### 3. Getting API Keys

#### OpenAI API Key (Required for GPT models)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key (starts with `sk-`)

#### Google Gemini API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key

#### Anthropic Claude API Key (Optional)
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up for API access
3. Create an API key

### 4. Ollama Setup (Optional - for local models)

If you want to use local Ollama models:

```bash
# Install Ollama on macOS
brew install ollama

# Start Ollama service
ollama serve

# In another terminal, pull models
ollama pull llama2
ollama pull mistral
```

### 5. Run the Development Server

```bash
# Using pnpm (recommended)
pnpm dev

# Or using npm
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6. Build for Production (Optional)

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Usage

1. **Select AI Model**: Choose from the dropdown in the header
2. **Upload Files**: Drag and drop or click the upload area to add documents
3. **Start Chatting**: Type your message and press Enter or click Send
4. **File Processing**: Uploaded files are automatically processed and included in context

## Supported File Types

- **PDF**: Extracts text content
- **DOCX**: Extracts text and table content
- **DOC**: Basic text extraction
- **TXT**: Plain text files
- **HTML/HTM**: Web page content

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Or use a different port
   pnpm dev -- -p 3001
   ```

2. **File upload not working**
   - Make sure `/tmp` directory is writable
   - Check file size (max 10MB)

3. **Ollama models not responding**
   - Ensure Ollama is running: `ollama serve`
   - Check if models are installed: `ollama list`

4. **API key errors**
   - Verify your API keys in `.env.local`
   - Make sure you have billing set up for OpenAI

### Environment Variables

Make sure your `.env.local` file is in the root directory and contains:

```env
OPENAI_API_KEY=sk-your-actual-key-here
NEXT_PUBLIC_CO_DEV_ENV=development
```

### Dependencies Issues

If you encounter dependency issues:

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or with npm
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/
│   ├── api/            # API routes
│   │   ├── chat.ts     # Chat endpoint
│   │   └── upload.ts   # File upload endpoint
│   ├── _app.tsx        # App wrapper
│   └── index.tsx       # Main chat interface
├── styles/
│   └── globals.css     # Global styles
└── lib/                # Utility functions
```

## Technologies Used

- **Next.js 14** - React framework with API routes
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - UI components
- **OpenAI SDK** - AI model integration
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **Mammoth** - DOCX processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is licensed under the MIT License.