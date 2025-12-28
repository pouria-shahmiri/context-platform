import React, { useState } from 'react';
import { Dialog, Button, Flex, Text, TextField, TextArea } from '@radix-ui/themes';
import { Plus } from 'lucide-react';
import { createPyramid } from '../../services/pyramidService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const CreatePyramidModal = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      const pyramidId = await createPyramid(user.uid, title, context);
      setOpen(false);
      // Reset state
      setTitle('');
      setContext('');
      
      // Small delay to allow modal to close visually before navigating
      setTimeout(() => {
        navigate(`/pyramid/${pyramidId}`);
      }, 100);
    } catch (error) {
      console.error(error);
      alert('Failed to create pyramid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button size="2">
          <Plus size={16} /> New Pyramid
        </Button>
      </Dialog.Trigger>

      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Create New Pyramid</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Start a new problem-solving session.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Pyramid Title <Text color="red">*</Text>
            </Text>
            <TextField.Root
              placeholder="e.g., Q3 Sales Strategy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Context (Optional)
            </Text>
            <TextArea
              placeholder="Background information for the AI..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </label>
        </Flex>

        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit} disabled={!title.trim() || loading}>
            {loading ? 'Creating...' : 'Create Pyramid'}
          </Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CreatePyramidModal;
