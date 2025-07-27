import { NextApiRequest, NextApiResponse } from 'next';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

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

// In-memory storage for demo purposes
// In production, you'd use a database
let chatSessions: { [sessionId: string]: { session: ChatSession; messages: Message[] } } = {};

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateTitle(firstMessage: string): string {
  // Generate a title from the first message (max 50 chars)
  const title = firstMessage.trim().substring(0, 50);
  return title.length < firstMessage.trim().length ? title + '...' : title;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Get all chat sessions or a specific session
      const { sessionId: getSessionId } = req.query;
      
      if (getSessionId) {
        // Get specific session with messages
        const sessionData = chatSessions[getSessionId as string];
        if (!sessionData) {
          return res.status(404).json({ error: 'Session not found' });
        }
        return res.status(200).json(sessionData);
      } else {
        // Get all sessions (without messages)
        const sessions = Object.values(chatSessions).map(({ session }) => session);
        return res.status(200).json({ sessions });
      }

    case 'POST':
      // Create a new chat session
      const { title, firstMessage } = req.body;
      
      const newSessionId = generateSessionId();
      const sessionTitle = title || (firstMessage ? generateTitle(firstMessage) : 'New Chat');
      
      const newSession: ChatSession = {
        id: newSessionId,
        title: sessionTitle,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 0,
      };

      chatSessions[newSessionId] = {
        session: newSession,
        messages: [],
      };

      return res.status(201).json({ session: newSession });

    case 'PUT':
      // Update session (add message or update title)
      const { sessionId: updateSessionId, message, newTitle } = req.body;
      
      if (!updateSessionId || !chatSessions[updateSessionId]) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const sessionData = chatSessions[updateSessionId];

      if (message) {
        // Add message to session
        sessionData.messages.push(message);
        sessionData.session.messageCount = sessionData.messages.length;
        sessionData.session.updatedAt = new Date().toISOString();
        
        // Update title if this is the first user message
        if (sessionData.messages.length === 1 && message.role === 'user') {
          sessionData.session.title = generateTitle(message.content);
        }
      }

      if (newTitle) {
        // Update session title
        sessionData.session.title = newTitle;
        sessionData.session.updatedAt = new Date().toISOString();
      }

      return res.status(200).json({ session: sessionData.session });

    case 'DELETE':
      // Delete a chat session
      const { sessionId: deleteSessionId } = req.query;
      
      if (!deleteSessionId || typeof deleteSessionId !== 'string' || !chatSessions[deleteSessionId]) {
        return res.status(404).json({ error: 'Session not found' });
      }

      delete chatSessions[deleteSessionId];
      return res.status(200).json({ message: 'Session deleted successfully' });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${method} not allowed` });
  }
}