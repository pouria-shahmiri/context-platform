import React from 'react';
import Navbar from '../Navbar/Navbar';
import { Box } from '@radix-ui/themes';

const AuthenticatedLayout = ({ children }) => {
  return (
    <Box className="h-screen flex flex-col overflow-hidden">
      <Navbar />
      <Box className="flex-grow overflow-auto flex flex-col">
        {children}
      </Box>
    </Box>
  );
};

export default AuthenticatedLayout;
