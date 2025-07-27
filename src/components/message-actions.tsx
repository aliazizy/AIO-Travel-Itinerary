"use client"

import * as React from "react"
import { Copy, RotateCcw, Edit3, Download, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: any[];
}

interface MessageActionsProps {
  message: Message;
  onRetry?: (message: Message) => void;
  onEdit?: (message: Message) => void;
}

export function MessageActions({ message, onRetry, onEdit }: MessageActionsProps) {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success("Message copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy message")
    }
  }

  const downloadAsHtml = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Message - ${message.timestamp.toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .message {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-weight: 600;
            color: #374151;
        }
        .user-message .message-header {
            color: #1f2937;
        }
        .assistant-message .message-header {
            color: #6366f1;
        }
        .message-content {
            white-space: pre-wrap;
            color: #374151;
        }
        .message-timestamp {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-top: 12px;
        }
        .files {
            margin-bottom: 12px;
            padding: 8px;
            background: #f3f4f6;
            border-radius: 6px;
        }
        .file-item {
            font-size: 0.875rem;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <h1>Chat Message</h1>
    <div class="message ${message.role}-message">
        <div class="message-header">
            ${message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
        </div>
        ${message.files && message.files.length > 0 ? `
        <div class="files">
            <strong>Attached files:</strong><br>
            ${message.files.map(file => `<div class="file-item">📄 ${file.name}</div>`).join('')}
        </div>
        ` : ''}
        <div class="message-content">${message.content}</div>
        <div class="message-timestamp">
            ${message.timestamp.toLocaleString()}
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-message-${message.timestamp.toISOString().split('T')[0]}-${message.id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Message downloaded as HTML")
  }

  const handleRetry = () => {
    if (onRetry) {
      onRetry(message)
      toast.success("Retrying message...")
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(message)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        >
          <span className="sr-only">Message actions</span>
          <div className="w-1 h-1 bg-current rounded-full"></div>
          <div className="w-1 h-1 bg-current rounded-full ml-0.5"></div>
          <div className="w-1 h-1 bg-current rounded-full ml-0.5"></div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          <span>{copied ? "Copied!" : "Copy"}</span>
        </DropdownMenuItem>
        
        {message.role === 'user' && onRetry && (
          <DropdownMenuItem onClick={handleRetry} className="cursor-pointer">
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Retry</span>
          </DropdownMenuItem>
        )}
        
        {message.role === 'user' && onEdit && (
          <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
            <Edit3 className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={downloadAsHtml} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          <span>Download as HTML</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}