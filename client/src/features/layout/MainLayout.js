import React from 'react';
import Header from './Header';
import { Box } from '@mui/material';

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <Box sx={{ mt: 2, p: 2 }}>
        {children}
      </Box>
    </>
  );
};

export default MainLayout;
