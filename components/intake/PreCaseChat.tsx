'use client';

import React, { useState, useEffect, useRef } from 'react';
import { immigrationApi } from '@/lib/api/immigration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface IntakeMessage {
  id: string;
  senderEmail: string;
  senderName: string;
  senderRole: 'applicant' | 'professional';
  content: string;
  createdAt: string;
}

interface PreCaseChatProps {
  referenceNumber: string;
  applicantEmail: string;
  applicantName: string;
  /** Pass role='professional' when embedding in the dashboard lead detail */
  role?: 'applicant' | 'professional';
  senderEmail?: string;
  senderName?: string;
}

export default function PreCaseChat({
  referenceNumber,
  applicantEmail,
  applicantName,
  role = 'applicant',
  senderEmail,
  senderName,
}: PreCaseChatProps) {
  const [messages, setMessages] = useState<IntakeMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const effectiveSenderEmail = senderEmail ?? applicantEmail;
  const effectiveSenderName = senderName ?? applicantName;

  useEffect(() => {
    fetchMessages();
    // Poll every 15 seconds
    const interval = setInterval(fetchMessages, 15_000);
    return () => clearInterval(interval);
  }, [referenceNumber]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await immigrationApi.getIntakeMessages(referenceNumber);
      if (res.success && res.data) {
        setMessages(res.data as IntakeMessage[]);
      }
    } catch (e) {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await immigrationApi.sendIntakeMessage({
        referenceNumber,
        senderEmail: effectiveSenderEmail,
        senderName: effectiveSenderName,
        senderRole: role,
        content: newMessage.trim(),
      });
      if (res.success) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (e) {
      // silently fail
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[300px] max-h-[500px]">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b mb-3">
        <MessageSquare className="w-4 h-4 text-[#0F2557]" />
        <p className="text-sm font-semibold text-gray-800">Pre-Case Chat</p>
        <Badge variant="secondary" className="text-xs ml-auto">
          Ref: {referenceNumber}
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderEmail === effectiveSenderEmail;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-[#0F2557] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {!isMe && (
                    <p className={`text-xs font-semibold mb-1 ${msg.senderRole === 'professional' ? 'text-amber-600' : 'text-gray-600'}`}>
                      {msg.senderName}
                      {msg.senderRole === 'professional' && (
                        <span className="ml-1 font-normal opacity-70">· Specialist</span>
                      )}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t mt-3">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          className="flex-1"
          disabled={isSending}
        />
        <Button
          size="icon"
          className="bg-[#0F2557] hover:bg-[#0a1a3d]"
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
