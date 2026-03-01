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
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isApplicant = user?.role === 'applicant';

  useEffect(() => {
    if (caseId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!caseId) {
      setError('Case ID is required');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await immigrationApi.getMessagesByCase(caseId, 1);
      
      if (response.success && response.data) {
        // Handle PaginatedResponse structure: { data: CaseMessage[], pagination: {...} }
        const paginatedData = response.data as unknown as { data?: CaseMessage[]; pagination?: any };
        const fetchedMessages = Array.isArray(paginatedData.data) ? paginatedData.data : [];
        setMessages(fetchedMessages);
        
        // Mark unread messages as read
        if (user?.id && fetchedMessages.length > 0) {
          const unreadIds = fetchedMessages
            .filter((m) => m && !m.readAt && m.senderId !== user.id)
            .map((m) => m.id)
            .filter((id) => id); // Filter out any undefined/null IDs
        
          if (unreadIds.length > 0) {
            try {
              await immigrationApi.markMessagesRead(unreadIds);
            } catch (markError) {
              console.error('Failed to mark messages as read:', markError);
              // Don't fail the whole fetch if marking as read fails
            }
          }
        }
      } else {
        // If API call succeeded but no data, set empty array
        setMessages([]);
        if (response.error) {
          setError(response.error);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      const errorMessage = error?.message || 'Failed to load messages. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setMessages([]); // Set empty array on error to prevent UI crash
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
  const visibleMessages = (isApplicant && Array.isArray(messages))
    ? messages.filter((m) => !m.isInternal)
    : (Array.isArray(messages) ? messages : []);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}>
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {error ? (
          <div className="text-center text-red-600 py-8">
            <p className="font-medium mb-2">⚠️ {error}</p>
            <Button variant="outline" size="sm" onClick={fetchMessages}>
              Try Again
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading messages...</div>
        ) : visibleMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No messages yet</div>
        ) : (
          visibleMessages.map((message) => {
            const isCurrentUser = user?.id && message.senderId === user.id;
            const isInternalNote = message.isInternal || false;

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
            size="default"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
