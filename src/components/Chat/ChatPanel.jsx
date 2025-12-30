import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, Text, TextArea, Button, IconButton, ScrollArea, Tooltip, Dialog } from '@radix-ui/themes';
import { Send, ChevronDown, ChevronUp, Trash2, MessageSquare, Bot, X, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, subscribeToChat, clearChatHistory } from '../../services/chatService';
import { sendChatMessage } from '../../services/anthropic';
import ChatMessage from './ChatMessage';

const ChatPanel = ({ pyramidId, pyramid }) => {
  const { user, apiKey } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Subscribe to chat messages
  useEffect(() => {
    if (!user || !pyramidId) return;
    const unsubscribe = subscribeToChat(user.uid, pyramidId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [user, pyramidId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input.trim();
    setInput('');
    setIsTyping(true);

    try {
      // 1. Save user message
      await sendMessage(user.uid, pyramidId, 'user', userMsg);

      // 2. Get AI Response
      const response = await sendChatMessage(apiKey, pyramid, messages, userMsg);

      // 3. Save AI message
      await sendMessage(user.uid, pyramidId, 'assistant', response);

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
        await clearChatHistory(user.uid, pyramidId);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Trigger Button (Fixed at bottom right) */}
      {!isOpen && (
        <Box 
          className="fixed bottom-8 right-8 z-40"
        >
            <Button 
                size="4" 
                variant="solid" 
                className="shadow-xl bg-surface hover:bg-surface-hover text-foreground rounded-full h-14 w-14 p-0 flex items-center justify-center transition-transform hover:scale-105"
                onClick={() => setIsOpen(true)}
                style={{ borderRadius: '9999px' }}
            >
                <MessageSquare size={24} />
            </Button>
            {messages.length > 0 && (
                <Box className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-surface">
                    {messages.length > 9 ? '9+' : messages.length}
                </Box>
            )}
        </Box>
      )}

      {/* Big Modal Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content style={{ maxWidth: 900, height: '85vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="bg-background">
            {/* Header */}
            <Flex 
                justify="between" 
                align="center" 
                className="p-4 border-b border-border bg-background"
            >
                <Flex gap="3" align="center">
                    <Box className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-foreground">
                        <Bot size={24} />
                    </Box>
                    <Box>
                        <Dialog.Title size="4" className="m-0 text-foreground">AI Pyramid Assistant</Dialog.Title>
                        <Dialog.Description size="1" color="gray" className="m-0">
                            Context-aware help for your pyramid problem solving
                        </Dialog.Description>
                    </Box>
                </Flex>
                <Flex gap="2">
                    <Tooltip content="Clear Chat History">
                        <IconButton variant="soft" color="red" onClick={handleClear}>
                            <Trash2 size={18} />
                        </IconButton>
                    </Tooltip>
                    <Dialog.Close>
                        <IconButton variant="ghost" color="gray">
                            <X size={24} />
                        </IconButton>
                    </Dialog.Close>
                </Flex>
            </Flex>

            {/* Messages Area */}
            <Box className="flex-1 overflow-y-auto p-6 bg-surface" ref={scrollRef}>
                {messages.length === 0 ? (
                    <Flex direction="column" align="center" justify="center" className="h-full text-center opacity-50 space-y-4">
                        <Box className="w-20 h-20 bg-surface-active rounded-full flex items-center justify-center text-foreground-muted mb-4">
                            <MessageSquare size={40} />
                        </Box>
                        <Text size="5" weight="bold" color="gray">No messages yet</Text>
                        <Text size="2" color="gray" style={{ maxWidth: 400 }}>
                            Start a conversation with the AI. It understands your pyramid structure, blocks, and progress. Ask for patterns, suggestions, or logic checks.
                        </Text>
                    </Flex>
                ) : (
                    <Flex direction="column" gap="4">
                        {messages.map((msg) => (
                            <ChatMessage 
                                key={msg.id} 
                                message={msg} 
                                onCopy={handleCopy} 
                            />
                        ))}
                        {isTyping && (
                            <Flex gap="3" className="mb-4">
                                <Box className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground flex-shrink-0 mt-1">
                                    <Bot size={16} />
                                </Box>
                                <Box className="bg-surface-active p-4 rounded-2xl rounded-tl-none">
                                    <Flex gap="1.5" align="center" height="24px">
                                        <div className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </Flex>
                                </Box>
                            </Flex>
                        )}
                    </Flex>
                )}
            </Box>

            {/* Input Area */}
            <Box className="p-4 border-t border-border bg-background">
                <Flex gap="3">
                    <TextArea 
                        placeholder={apiKey ? "Ask a question about your pyramid..." : "Please set API Key in Navbar first"}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={!apiKey || isTyping}
                        size="3"
                        rows={1}
                        className="flex-1 min-h-[60px] max-h-[150px] bg-surface text-foreground border-border"
                        style={{ resize: 'none' }}
                    />
                    <Flex direction="column" justify="end">
                        <IconButton 
                            size="4" 
                            variant="solid" 
                            color="gray" 
                            onClick={handleSend}
                            disabled={!input.trim() || !apiKey || isTyping}
                            className="h-[60px] w-[60px]"
                        >
                            <Send size={24} />
                        </IconButton>
                    </Flex>
                </Flex>
                {!apiKey && (
                    <Text size="1" color="red" className="mt-2 block text-center">
                        API Key required to chat.
                    </Text>
                )}
            </Box>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default ChatPanel;
