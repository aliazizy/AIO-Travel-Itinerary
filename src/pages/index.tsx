import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageActions } from "@/components/message-actions";
import { SettingsModal, SettingsConfig, defaultSettings } from "@/components/settings-modal";
import { ChatRename } from "@/components/chat-rename";
import { APP_CONFIG, DEFAULT_SETTINGS, getAllModels } from "@/config/app-config";
import { useDropzone } from "react-dropzone";
import { 
  Send, 
  Upload, 
  Bot, 
  User, 
  FileText, 
  Image as ImageIcon, 
  Loader2,
  Sparkles,
  Brain,
  Zap,
  Globe,
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  History,
  X,
  Lightbulb,
  Mic,
  MicOff
} from "lucide-react";
import { toast } from "sonner";

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

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

// Get models from config with icons and colors
const getModelIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai': return Brain;
    case 'gemini': return Sparkles;
    case 'claude': return Brain;
    case 'ollama': return Globe;
    default: return Bot;
  }
};

const getModelColor = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'openai': return 'bg-green-500';
    case 'gemini': return 'bg-purple-500';
    case 'claude': return 'bg-orange-500';
    case 'ollama': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const models = getAllModels().map(model => ({
  ...model,
  icon: getModelIcon(model.provider),
  color: getModelColor(model.provider)
}));

const predefinedPrompts = APP_CONFIG.predefinedPrompts;

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editInput, setEditInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [settings, setSettings] = useState<SettingsConfig>(DEFAULT_SETTINGS);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/chat-sessions');
      if (response.ok) {
        const data = await response.json();
        setChatSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Chat',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(data.session.id);
        setMessages([]);
        setUploadedFiles([]);
        await loadChatSessions();
        toast.success('New chat created');
      }
    } catch (error) {
      toast.error('Failed to create new chat');
    }
  };

  const loadChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions?sessionId=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSessionId(sessionId);
        setMessages(data.messages || []);
        setUploadedFiles([]);
      }
    } catch (error) {
      toast.error('Failed to load chat session');
    }
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
        await loadChatSessions();
        toast.success('Chat deleted');
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const handleChatRename = (sessionId: string, newTitle: string) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title: newTitle, updatedAt: new Date().toISOString() }
          : session
      )
    );
  };

  const saveMessageToSession = async (message: Message) => {
    if (!currentSessionId) return;

    try {
      await fetch('/api/chat-sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: message,
        }),
      });
    } catch (error) {
      console.error('Failed to save message to session:', error);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = [];
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('settings', JSON.stringify(settings));
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          newFiles.push({
            name: file.name,
            type: file.type,
            size: file.size,
            content: result.content,
          });
          toast.success(`${file.name} uploaded and processed successfully`);
        } else {
          const error = await response.json();
          toast.error(`Failed to upload ${file.name}: ${error.details || error.error}`);
        }
      } catch (error) {
        toast.error(`Error uploading ${file.name}`);
      }
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/html': ['.html', '.htm'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return;

    // Create new session if none exists
    if (!currentSessionId) {
      await createNewChat();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedFiles([]);
    setIsLoading(true);

    // Save user message to session
    await saveMessageToSession(userMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage], // Send full chat history including new message
          model: selectedModel,
          sessionId: currentSessionId,
          settings: settings,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to session
        await saveMessageToSession(assistantMessage);
        await loadChatSessions(); // Refresh sessions to update message count
      } else {
        const error = await response.json();
        toast.error(`Failed to get response: ${error.details || error.error}`);
      }
    } catch (error) {
      toast.error('Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRetryMessage = async (message: Message) => {
    if (message.role !== 'user') return;

    // Remove all messages after this one (including assistant responses)
    const messageIndex = messages.findIndex(m => m.id === message.id);
    if (messageIndex === -1) return;

    const messagesUpToRetry = messages.slice(0, messageIndex);
    setMessages(messagesUpToRetry);

    // Set the input and files from the message
    setInput(message.content);
    if (message.files) {
      setUploadedFiles([...message.files]);
    }

    // Auto-send the message
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const handleEditMessage = (message: Message) => {
    if (message.role !== 'user') return;
    
    setEditingMessage(message);
    setEditInput(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editInput.trim()) return;

    // Find the message index
    const messageIndex = messages.findIndex(m => m.id === editingMessage.id);
    if (messageIndex === -1) return;

    // Update the message content
    const updatedMessage = { ...editingMessage, content: editInput.trim() };
    
    // Remove all messages after this one (including assistant responses)
    const messagesUpToEdit = messages.slice(0, messageIndex);
    setMessages([...messagesUpToEdit, updatedMessage]);

    // Clear editing state
    setEditingMessage(null);
    setEditInput('');

    // Save the updated message to session
    await saveMessageToSession(updatedMessage);

    // Auto-send to get new response
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messagesUpToEdit, updatedMessage], // Send full chat history up to edited message
          model: selectedModel,
          sessionId: currentSessionId,
          settings: settings,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.content,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to session
        await saveMessageToSession(assistantMessage);
        await loadChatSessions();
      } else {
        const error = await response.json();
        toast.error(`Failed to get response: ${error.details || error.error}`);
      }
    } catch (error) {
      toast.error('Error sending message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditInput('');
  };

  const handlePredefinedPrompt = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          if (transcript) {
            setInput(prev => prev + transcript);
          }
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please allow microphone access and try again.');
          } else if (event.error === 'no-speech') {
            toast.error('No speech detected. Please try again.');
          } else {
            toast.error('Speech recognition error. Please try again.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        setSpeechRecognition(recognition);
      }
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechRecognition) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const selectedModelInfo = models.find(m => m.id === selectedModel);

  return (
    <>
      <Head>
        <title>AIO Travel Itinerary assistant</title>
        <meta name="description" content="AI-powered travel itinerary planning assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://www.vosaio.com/wp-content/uploads/fbrfg/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex">
        {/* Sidebar for Chat Sessions */}
        <div className="hidden md:flex w-64 border-r border-border/40 bg-background/50 backdrop-blur-sm flex-col">
          <div className="p-4 border-b border-border/40">
            <Button onClick={createNewChat} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            {/* Predefined Prompts Section */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Quick Prompts</h3>
              </div>
              <div className="space-y-2">
                {predefinedPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3 text-xs hover:bg-primary/10"
                    onClick={() => handlePredefinedPrompt(prompt)}
                  >
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Chat Sessions Section */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <History className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Chat History</h3>
              </div>
              <div className="space-y-2">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : chatSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No chat sessions yet</p>
                  </div>
                ) : (
                  chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => loadChatSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.messageCount} messages
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatRename
                          sessionId={session.id}
                          currentTitle={session.title}
                          onRename={(newTitle) => handleChatRename(session.id, newTitle)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(session.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden fixed top-4 left-4 z-50">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <Button onClick={createNewChat} className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
            <ScrollArea className="mt-4 h-[calc(100vh-120px)]">
              {/* Predefined Prompts Section */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Quick Prompts</h3>
                </div>
                <div className="space-y-2">
                  {predefinedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3 text-xs hover:bg-primary/10"
                      onClick={() => handlePredefinedPrompt(prompt)}
                    >
                      <span className="truncate">{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator className="mb-4" />

              {/* Chat Sessions Section */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <History className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-medium text-foreground">Chat History</h3>
                </div>
                <div className="space-y-2">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => loadChatSession(session.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {session.messageCount} messages
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ChatRename
                          sessionId={session.id}
                          currentTitle={session.title}
                          onRename={(newTitle) => handleChatRename(session.id, newTitle)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChatSession(session.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <motion.header 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-40"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:ml-0 ml-12">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      src="https://www.vosaio.com/wp-content/uploads/2020/02/logo-site-bc.png" 
                      alt="AIO Travel Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">AIO Travel Itinerary assistant</h1>
                    <p className="text-sm text-muted-foreground">
                      {currentSessionId ? `Session: ${chatSessions.find(s => s.id === currentSessionId)?.title || 'Current Chat'}` : 'No active session'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => {
                        const Icon = model.icon;
                        return (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${model.color}`} />
                              <span>{model.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {model.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <SettingsModal 
                    settings={settings} 
                    onSettingsChange={setSettings} 
                  />
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.header>

          {/* Chat Messages */}
          <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
            <div className="flex flex-col h-[calc(100vh-200px)]">
              
              {/* Messages Area */}
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6">
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <img 
                          src="https://www.vosaio.com/wp-content/uploads/2020/02/logo-site-bc.png" 
                          alt="AIO Travel Logo" 
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground mb-2">
                        Welcome to AIO Travel Itinerary assistant
                      </h2>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Plan your perfect trip with AI-powered travel assistance. Upload documents and get personalized itinerary recommendations.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <Card 
                          {...getRootProps()}
                          className={`p-4 border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer ${
                            isDragActive ? 'border-primary bg-primary/10' : ''
                          }`}
                        >
                          <input {...getInputProps()} />
                          <FileText className="w-8 h-8 text-primary mb-2" />
                          <h3 className="font-medium mb-1">Upload Documents</h3>
                          <p className="text-sm text-muted-foreground">
                            Support for PDF, DOCX, TXT, HTML files
                          </p>
                        </Card>
                        <Card className="p-4 border-dashed border-2 hover:border-primary/50 transition-colors">
                          <Globe className="w-8 h-8 text-primary mb-2" />
                          <h3 className="font-medium mb-1">Auto Translation</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatic translation to English
                          </p>
                        </Card>
                      </div>
                    </motion.div>
                  ) : (
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                          className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : selectedModelInfo?.color || 'bg-secondary'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Bot className="w-4 h-4 text-white" />
                              )}
                            </div>
                            
                            <div className="flex-1 relative">
                              {editingMessage?.id === message.id ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={editInput}
                                    onChange={(e) => setEditInput(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                    placeholder="Edit your message..."
                                  />
                                  <div className="flex space-x-2">
                                    <Button size="sm" onClick={handleSaveEdit}>
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className={`rounded-2xl px-4 py-3 relative ${
                                  message.role === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}>
                                  {message.files && message.files.length > 0 && (
                                    <div className="mb-3 space-y-2">
                                      {message.files.map((file, fileIndex) => (
                                        <div key={fileIndex} className="flex items-center space-x-2 text-sm opacity-80">
                                          <FileText className="w-4 h-4" />
                                          <span>{file.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                  <div className={`text-xs mt-2 opacity-60 ${
                                    message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                                  }`}>
                                    {message.timestamp.toLocaleTimeString()}
                                  </div>
                                  
                                  {/* Message Actions */}
                                  <div className={`absolute top-2 ${message.role === 'user' ? 'left-2' : 'right-2'}`}>
                                    <MessageActions
                                      message={message}
                                      onRetry={handleRetryMessage}
                                      onEdit={handleEditMessage}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedModelInfo?.color || 'bg-secondary'}`}>
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* File Upload Area */}
              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center space-x-2 px-3 py-1"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="text-xs">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Input Area */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="border border-border rounded-2xl bg-background/50 backdrop-blur-sm"
              >
                <div className="p-4">
                  <div className="flex space-x-3">
                    <div
                      {...getRootProps()}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                        isDragActive 
                          ? 'border-primary bg-primary/10' 
                          : 'border-muted-foreground/30 hover:border-primary/50'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1">
                      <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here... (Shift+Enter for new line)"
                        className="min-h-[48px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                        rows={1}
                      />
                    </div>
                    
                    <Button
                      onClick={toggleSpeechRecognition}
                      disabled={isLoading}
                      size="icon"
                      variant={isListening ? "default" : "ghost"}
                      className={`w-12 h-12 rounded-xl transition-all ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={sendMessage}
                      disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                      size="icon"
                      className="w-12 h-12 rounded-xl"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}