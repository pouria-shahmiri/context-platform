import React, { useEffect, useRef } from 'react';
import { Box, Flex, Text, Avatar, IconButton } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Copy, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ChatMessage = ({ message, onCopy, onRegenerate, isLastAiMessage }) => {
  const isUser = message.role === 'user';
  const { user } = useAuth();

  return (
    <Flex 
      direction="column" 
      align={isUser ? 'end' : 'start'} 
      className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}
    >
      <Flex gap="2" className={`max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <Box className="flex-shrink-0 mt-1">
          {isUser ? (
             <Avatar 
                src={user?.photoURL} 
                fallback={user?.displayName?.[0] || 'U'} 
                radius="full" 
                size="1" 
             />
          ) : (
             <Box className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                <Bot size={14} />
             </Box>
          )}
        </Box>

        {/* Message Bubble */}
        <Box 
          className={`
            p-3 rounded-lg text-sm relative group
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'}
          `}
        >
          {isUser ? (
            <Text>{message.content}</Text>
          ) : (
            <Box className="markdown-content">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          )}

          {/* Action Buttons (Hover) */}
          {!isUser && (
            <Flex 
                className="absolute -bottom-6 left-0 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                align="center"
            >
                <IconButton 
                    size="1" 
                    variant="ghost" 
                    color="gray" 
                    onClick={() => onCopy(message.content)}
                    title="Copy message"
                >
                    <Copy size={12} />
                </IconButton>
                {/* Only show regenerate for the last AI message if needed, or general logic */}
                {/* {isLastAiMessage && (
                    <IconButton 
                        size="1" 
                        variant="ghost" 
                        color="gray" 
                        onClick={() => onRegenerate(message)}
                        title="Regenerate response"
                    >
                        <RefreshCw size={12} />
                    </IconButton>
                )} */}
            </Flex>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default ChatMessage;
