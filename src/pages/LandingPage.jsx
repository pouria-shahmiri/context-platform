import React from 'react';
import { Flex, Heading, Text } from '@radix-ui/themes';
import GoogleLogin from '../components/Auth/GoogleLogin';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { user, loading, error } = useAuth();

  if (loading) return null; // Or a spinner
  if (user) return <Navigate to="/dashboard" />;

  return (
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh' }} gap="4" className="bg-background">
      <Heading size="9" className="text-foreground">Pyramid Solver</Heading>
      <Text size="4" color="gray" className="mb-8 max-w-md text-center">
      </Text>
      
      {error && (
        <Text color="red" size="2" className="mb-2 bg-red-100 p-3 rounded border border-red-200">
          {error}
        </Text>
      )}
      
      <GoogleLogin />
    </Flex>
  );
};

export default LandingPage;
