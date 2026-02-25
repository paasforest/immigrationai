'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { immigrationApi } from '@/lib/api/immigration';
import { CaseMessage } from '@/types/immigration';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, isToday, isThisWeek, isThisYear } from 'date-fns';

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatMessageTime(date: string): string {
  const messageDate = new Date(date);
  if (isToday(messageDate)) {
    return format(messageDate, 'h:mm a');
  } else if (isThisWeek(messageDate)) {
    return format(messageDate, 'EEE h:mm a');
  } else if (isThisYear(messageDate)) {
    return format(messageDate, 'MMM d h:mm a');
  } else {
    return format(messageDate, 'MMM d, yyyy h:mm a');
  }
}

interface MessagesTabProps {
  caseId: string;
}

export default function MessagesTab({ caseId }: MessagesTabProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isApplicant = user?.organizationRole === 'applicant';

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const response = await immigrationApi.getMessagesByCase(caseId, 1);
      if (response.success && response.data) {
        const fetchedMessages = response.data.data;
        setMessages(fetchedMessages);
        
        // Mark unread messages as read
        const unreadIds = fetchedMessages
          .filter((m) => !m.readAt && m.senderId !== user?.id)
          .map((m) => m.id);
        
        if (unreadIds.length > 0) {
          await immigrationApi.markMessagesRead(unreadIds);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately for optimistic UI

    // Optimistic update
    const optimisticMessage: CaseMessage = {
      id: `temp-${Date.now()}`,
      caseId,
      organizationId: '',
      senderId: user?.id || '',
      content: messageContent,
      isInternal,
      readAt: null,
      createdAt: new Date().toISOString(),
      sender: {
        id: user?.id || '',
        fullName: user?.fullName || '',
        email: user?.email || '',
      },
    };

    setMessages([...messages, optimisticMessage]);
    scrollToBottom();

    try {
      setIsSending(true);
      const response = await immigrationApi.sendMessage({
        caseId,
        content: messageContent,
        isInternal,
      });

      if (response.success && response.data) {
        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMessage.id ? response.data! : m))
        );
      } else {
        // Revert optimistic update on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        setNewMessage(messageContent); // Restore message text
        toast.error(response.error || 'Failed to send message');
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setNewMessage(messageContent); // Restore message text
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  // Filter out internal messages for applicants
  const visibleMessages = isApplicant
    ? messages.filter((m) => !m.isInternal)
    : messages;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : visibleMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          visibleMessages.map((message) => {
            const isCurrentUser = message.senderId === user?.id;
            const isInternalNote = message.isInternal;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser
                      ? 'bg-[#0F2557] text-white'
                      : isInternalNote
                      ? 'bg-amber-50 border-l-4 border-amber-500'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  {isInternalNote && !isCurrentUser && (
                    <div className="flex justify-end mb-1">
                      <Badge variant="outline" className="text-xs bg-amber-100">
                        Internal Note
                      </Badge>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                    <span>{message.sender?.fullName || 'Unknown'}</span>
                    <span>·</span>
                    <span>{formatMessageTime(message.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 rounded-lg">
        {!isApplicant && (
          <div className="flex items-center gap-2 mb-3">
            <Switch
              id="internal-note"
              checked={isInternal}
              onCheckedChange={setIsInternal}
            />
            <Label htmlFor="internal-note" className="text-sm">
              Internal note
            </Label>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="bg-[#0F2557] hover:bg-[#0a1d42]"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
