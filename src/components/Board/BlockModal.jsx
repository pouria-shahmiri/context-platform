import React, { useState, useEffect } from 'react';
import { Dialog, Button, Flex, Text, TextArea, Box, Badge } from '@radix-ui/themes';
import { Sparkles, Save, X, Merge } from 'lucide-react';

const BlockModal = ({ isOpen, onClose, block, parents, onSave }) => {
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [combinedQuestion, setCombinedQuestion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (block) {
      setAnswer(block.answer || '');
      setQuestion(block.question || block.content || '');
      setCombinedQuestion(block.combinedQuestion || '');
      setSuggestions([]);
    }
  }, [block]);

  const handleSave = () => {
    onSave({
      ...block,
      answer,
      question, // We use 'question' as the primary content now
      combinedQuestion,
      content: question, // Keep content synced for backward compatibility
      status: answer && question ? 'completed' : 'in_progress'
    });
    onClose();
  };

  const handleAiGenerate = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    // TODO: Call AI service
    setTimeout(() => {
      setSuggestions([
        "How does the previous answer impact the overall goal?",
        "What are the potential risks identified here?",
        "Is there a missing link in the logic?"
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleAiCombine = async () => {
    setIsGenerating(true);
    setSuggestions([]);
    // TODO: Call AI service to combine parent questions
    setTimeout(() => {
        const combined = `[AI Combined] How do "${parents[0]?.question || '...'}" and "${parents[1]?.question || '...'}" relate to each other?`;
        setCombinedQuestion(combined);
        setIsGenerating(false);
    }, 1000);
  };

  // Helper to format block ID to Chess notation (e.g. 1-A)
  const formatBlockLabel = (id) => {
    if (!id) return '';
    const [u, v] = id.split('-').map(Number);
    const rank = u + 1;
    const file = String.fromCharCode(65 + v);
    return `${rank}-${file}`;
  };

  if (!block) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Content style={{ maxWidth: 500 }}>
        <Dialog.Title>Edit Block {formatBlockLabel(block.id)}</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Provide an answer to the previous level and formulate a new question.
        </Dialog.Description>

        <Flex direction="column" gap="4">
          {/* Parent Context Section */}
          {parents && parents.length > 0 && (
            <Box className="bg-gray-50 p-3 rounded-md border border-gray-200">
              <Text size="2" weight="bold" color="gray" className="uppercase text-xs mb-2 block">
                Previous Level Context (Parents)
              </Text>
              <Flex direction="column" gap="2">
                {parents.map(parent => (
                  <Box key={parent.id} className="text-sm">
                    <Badge color="indigo" variant="soft" className="mr-2">
                      {formatBlockLabel(parent.id)}
                    </Badge>
                    <Text>{parent.question || parent.content || "(No question defined)"}</Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}

          {/* Combined Question Section (Only for blocks with >1 parents) */}
          {parents && parents.length > 1 && (
            <Box>
                <Flex justify="between" align="center" className="mb-1">
                    <Text as="label" size="2" weight="bold">
                        Combined Question
                    </Text>
                    <Button 
                        size="1" 
                        variant="soft" 
                        color="orange" 
                        onClick={handleAiCombine}
                        disabled={isGenerating}
                        title="Combine parent questions into a new one"
                    >
                        <Merge size={14} className="mr-1" />
                        {isGenerating ? 'Combining...' : 'Combine Questions'}
                    </Button>
                </Flex>
                <TextArea 
                    placeholder="Formulate a question that combines the insights from the parents..." 
                    value={combinedQuestion}
                    onChange={(e) => setCombinedQuestion(e.target.value)}
                    rows={2}
                />
            </Box>
          )}

          {/* Answer Input - Hidden for the first block (1-A / 0-0) */}
          {block.id !== '0-0' && (
            <Box>
                <Text as="label" size="2" weight="bold" className="mb-1 block">
                    {parents && parents.length > 1 ? "Answer to Combined Question" : "Answer to Previous Question"}
                </Text>
                <TextArea 
                placeholder="Write your answer/insight..." 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                />
            </Box>
          )}

          {/* New Question Input */}
          <Box>
            <Flex justify="between" align="center" className="mb-1">
              <Text as="label" size="2" weight="bold">
                New Question / Insight
              </Text>
              <Flex gap="2">
                <Button 
                    size="1" 
                    variant="ghost" 
                    color="purple" 
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                >
                    <Sparkles size={14} className="mr-1" />
                    {isGenerating ? 'Generating...' : 'AI Suggestion'}
                </Button>
              </Flex>
            </Flex>

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <Flex gap="2" direction="column" className="mb-2 mt-2 bg-purple-50 p-2 rounded border border-purple-100">
                    <Text size="1" color="purple" weight="bold">AI Suggestions:</Text>
                    {suggestions.map((s, i) => (
                        <Box 
                            key={i} 
                            onClick={() => { setQuestion(s); setSuggestions([]); }}
                            className="cursor-pointer hover:bg-purple-100 p-1 rounded text-xs text-purple-800 transition-colors"
                        >
                            • {s}
                        </Box>
                    ))}
                </Flex>
            )}

            <TextArea 
              placeholder="What is the key question or insight for this block?" 
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
          </Box>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSave}>
            <Save size={16} className="mr-2" /> Save Changes
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default BlockModal;
