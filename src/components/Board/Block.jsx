import React from 'react';
import { Text } from '@radix-ui/themes';
import { calculateCoordinates, BLOCK_SIZE } from '../../utils/pyramidLayout';
import { Bot, CheckCircle } from 'lucide-react';

const Block = ({ block, onClick, isSelected }) => {
  const { x, y } = calculateCoordinates(block.u, block.v);
  const isWhite = (block.u + block.v) % 2 === 0;
  
  // Chess colors
  const bgColor = isWhite ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';
  const textColor = isWhite ? 'text-[#b58863]' : 'text-[#f0d9b5]';
  
  // Selection style
  const selectionStyle = isSelected 
    ? 'ring-4 ring-indigo-500 ring-offset-2 z-20' 
    : 'border border-black/10 hover:opacity-90 z-10';

  // Content Truncation
  const displayContent = block.question || block.content || '';
  const hasContent = displayContent.length > 0;
  
  // Truncate logic: Show first 20 chars if content exists
  const truncatedContent = displayContent.length > 20 
    ? displayContent.substring(0, 20) + '...' 
    : displayContent;

  // Chess Label (e.g., 1-A)
  const getChessLabel = (u, v) => {
    const rank = u + 1;
    const file = String.fromCharCode(65 + v);
    return `${rank}-${file}`;
  };

  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick(block);
      }}
      className={`absolute flex items-center justify-center shadow-sm cursor-pointer transition-all ${bgColor} ${selectionStyle}`}
      style={{
        width: BLOCK_SIZE,
        height: BLOCK_SIZE,
        left: x,
        top: y,
        transform: 'translate(-50%, -50%) rotate(45deg)',
      }}
    >
      {/* Counter-rotated content container */}
      <div 
        style={{ transform: 'rotate(-45deg)' }} 
        className="flex flex-col items-center justify-center w-full h-full p-1 relative"
      >
        {/* Type Indicator (Top Right Corner) */}
        <div 
            className={`absolute top-0 right-0 w-2 h-2 rounded-full m-1 ${
                block.type === 'question' ? 'bg-blue-500' : 'bg-green-500'
            }`}
            title={`Type: ${block.type}`}
        />

        {/* AI Indicator */}
        {block.isAiGenerated && (
            <Bot size={12} className={`absolute top-0 left-0 m-1 ${textColor}`} />
        )}

        {/* Completion Status */}
        {block.status === 'completed' && (
            <CheckCircle size={12} className="absolute bottom-0 right-0 m-1 text-green-600" />
        )}

        {/* Coordinate Label OR Content */}
        {!hasContent ? (
            <Text size="3" weight="bold" className={`${textColor} opacity-80`}>
                {getChessLabel(block.u, block.v)}
            </Text>
        ) : (
            <Text 
                size="1" 
                weight="medium"
                className={`${textColor} text-[10px] leading-tight text-center break-words w-full max-h-[60px] overflow-hidden px-1`}
            >
                {truncatedContent}
            </Text>
        )}
      </div>
    </div>
  );
};

export default Block;
