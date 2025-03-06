import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton, 
  Chip, 
  Collapse 
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import OrdersTable from './OrdersTable';

const OrdersSection = ({ 
  orders, 
  title, 
  subtitle, 
  isOpen, 
  setIsOpen, 
  orderStatuses, 
  contacts, 
  addresses, 
  theme, 
  handleEditClick, 
  handleViewClick, 
  handleDeleteClick 
}) => {
  if (orders.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Paper 
        sx={{ 
          p: 2, 
          mb: isOpen ? 2 : 0, 
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: '#eef0f2',
          },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              {title}
              {!isOpen && (
                <Chip
                  label={orders.length}
                  size="small"
                  color="primary"
                  sx={{ 
                    ml: 1,
                    height: '22px',
                    fontSize: '0.75rem',
                    '& .MuiChip-label': {
                      paddingTop: '1px',
                      lineHeight: 1
                    }
                  }}
                />
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isOpen && (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </Typography>
          )}
          <IconButton size="small">
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </Box>
      </Paper>
      
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <OrdersTable 
          orders={orders} 
          orderStatuses={orderStatuses} 
          contacts={contacts} 
          addresses={addresses} 
          theme={theme} 
          handleEditClick={handleEditClick}
          handleViewClick={handleViewClick}
          handleDeleteClick={handleDeleteClick}
        />
      </Collapse>
    </Box>
  );
};

export default OrdersSection;