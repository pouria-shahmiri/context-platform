import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Heading, Text, Button, Flex } from '@radix-ui/themes';
import Navbar from '../components/Navbar/Navbar';
import PyramidBoard from '../components/Board/PyramidBoard';
import { ArrowLeft } from 'lucide-react';

const PyramidEditor = () => {
  const { pyramidId } = useParams();
  const navigate = useNavigate();

  return (
    <Box className="min-h-screen bg-gray-50">
      <Navbar />
      <Container size="4" className="p-4 pb-2">
        <Button variant="ghost" color="gray" onClick={() => navigate('/dashboard')} className="mb-4 hover:bg-gray-200">
          <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
        </Button>
        
        <Flex justify="between" align="center" className="mb-6">
          <Box>
            <Heading size="6">Pyramid Editor</Heading>
            <Text color="gray" size="2">ID: {pyramidId}</Text>
          </Box>
        </Flex>
      </Container>
      
      <Box className="px-4 w-full">
        <PyramidBoard pyramidId={pyramidId} />
      </Box>
    </Box>
  );
};

export default PyramidEditor;
