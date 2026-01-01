import React, { useState, useEffect } from 'react';
import { Dialog, Flex, Text, TextArea, Button, Box, IconButton } from '@radix-ui/themes';
import { Wand2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalContext } from '../../contexts/GlobalContext';
import { generateProductDefinitionSuggestion } from '../../services/anthropic';

const TopicEditModal = ({ isOpen, onClose, node, onSave, contextData, productTitle }) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { apiKey } = useAuth();
  const { aggregatedContext: globalContext } = useGlobalContext();

  useEffect(() => {
    if (node) {
      setDescription(node.description || '');
    }
  }, [node]);

  const handleSave = () => {
    onSave(node.id, description);
    onClose();
  };

  const handleAiSuggest = async () => {
    if (!apiKey) {
      alert("Please set your API Key in Settings to use AI features.");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Combine local context with global context
      const fullContext = (contextData || "") + "\n\n" + (globalContext || "");
      
      const suggestion = await generateProductDefinitionSuggestion(
        apiKey,
        node,
        productTitle,
        fullContext.trim() || "No external context provided."
      );
      setDescription(prev => prev ? `${prev}\n\n--- AI Suggestion ---\n${suggestion}` : suggestion);
    } catch (error) {
      console.error("Failed to generate suggestion", error);
      alert("Failed to generate suggestion. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 700 }}>
        <Dialog.Title>{node?.label || 'Edit Topic'}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          {node?.question ? (
            <Text weight="bold" color="indigo">{node.question}</Text>
          ) : (
            "Describe this aspect of the product."
          )}
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <Box>
            <Flex justify="between" align="center" mb="1">
              <Text as="label" size="2" weight="bold">Answer</Text>
              <Button 
                variant="ghost" 
                size="1" 
                onClick={handleAiSuggest} 
                disabled={isGenerating}
                style={{ cursor: 'pointer' }}
              >
                <Wand2 size={14} style={{ marginRight: 4 }} />
                {isGenerating ? "Thinking..." : "AI Recommendation"}
              </Button>
            </Flex>
            <TextArea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Write your answer here..."
              rows={12}
              className="mt-1"
            />
          </Box>

          <Flex gap="3" justify="end" mt="4">
            <Button variant="soft" color="gray" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Answer
            </Button>
          </Flex>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default TopicEditModal;
