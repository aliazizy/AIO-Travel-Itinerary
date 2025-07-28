import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface ChatRenameProps {
  sessionId: string;
  currentTitle: string;
  onRename: (newTitle: string) => void;
}

export function ChatRename({ sessionId, currentTitle, onRename }: ChatRenameProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState(currentTitle);
  const [isLoading, setIsLoading] = useState(false);

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle.trim() === currentTitle) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          title: newTitle.trim(),
        }),
      });

      if (response.ok) {
        onRename(newTitle.trim());
        setIsOpen(false);
        toast.success('Chat renamed successfully');
      } else {
        toast.error('Failed to rename chat');
      }
    } catch (error) {
      toast.error('Error renaming chat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewTitle(currentTitle);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter new chat title..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRename();
              } else if (e.key === 'Escape') {
                handleCancel();
              }
            }}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isLoading || !newTitle.trim()}>
              <Check className="w-4 h-4 mr-2" />
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}