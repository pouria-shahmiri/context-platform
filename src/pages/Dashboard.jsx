import React, { useEffect, useState } from 'react';
import { Container, Box, Flex, Heading, TextField, Select, Text } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import PyramidList from '../components/Dashboard/PyramidList';
import CreatePyramidModal from '../components/Dashboard/CreatePyramidModal';
import { getUserPyramids, deletePyramid, duplicatePyramid } from '../services/pyramidService';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [pyramids, setPyramids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'modified', 'title'

  const fetchPyramids = async () => {
    if (!user) return;
    try {
      const data = await getUserPyramids(user.uid);
      setPyramids(data);
    } catch (error) {
      console.error("Failed to load pyramids", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPyramids();
  }, [user]);

  const handleDelete = async (id) => {
    try {
      await deletePyramid(id);
      setPyramids(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      alert("Failed to delete pyramid");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      // Optimistic update or fetch again. Let's fetch for simplicity to get true server timestamp, 
      // or we can manually add the mock response from service
      await duplicatePyramid(user.uid, id);
      fetchPyramids(); // Refresh list to get the new one properly sorted
    } catch (error) {
      alert("Failed to duplicate pyramid");
    }
  };

  // Filter and Sort Logic
  const filteredPyramids = pyramids
    .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      }
      if (sortBy === 'modified') {
        const dateA = a.lastModified?.toDate ? a.lastModified.toDate() : new Date(a.lastModified || 0);
        const dateB = b.lastModified?.toDate ? b.lastModified.toDate() : new Date(b.lastModified || 0);
        return dateB - dateA;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <Box className="min-h-screen bg-white">
      <Navbar />
      <Container size="4" className="p-4">
        {/* Header Section */}
        <Flex justify="between" align="center" className="mb-8 mt-6">
          <Heading size="6" className="text-gray-800">My Pyramids</Heading>
          <CreatePyramidModal />
        </Flex>

        {/* Filter Bar */}
        <Flex gap="4" className="mb-6 flex-col sm:flex-row">
          <Box className="flex-grow">
            <TextField.Root 
              placeholder="Search pyramids..." 
              size="2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
          
          <Box width={{ initial: "100%", sm: "200px" }}>
            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="w-full" />
              <Select.Content>
                <Select.Item value="recent">Sort by: Date Created</Select.Item>
                <Select.Item value="modified">Sort by: Last Modified</Select.Item>
                <Select.Item value="title">Sort by: Title</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>

        {/* Content */}
        {loading ? (
          <Flex justify="center" className="py-20">
            <Text color="gray">Loading your pyramids...</Text>
          </Flex>
        ) : (
          <PyramidList 
            pyramids={filteredPyramids} 
            onDelete={handleDelete} 
            onDuplicate={handleDuplicate} 
          />
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
