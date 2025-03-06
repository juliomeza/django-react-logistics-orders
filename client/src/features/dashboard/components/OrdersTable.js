import React from 'react';
import { 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Typography, 
  Paper, 
  Button, 
  Box, 
  IconButton 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getStatusChipColor, isCreatedStatus } from '../utils/DashboardUtils';

const OrdersTable = ({ 
  orders, 
  orderStatuses, 
  contacts, 
  addresses, 
  theme, 
  handleEditClick, 
  handleViewClick, 
  handleDeleteClick 
}) => {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><Typography variant="subtitle2">Order</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Reference Number</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Customer</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Destination</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => {
            const status = orderStatuses.find(s => s.id === order.order_status)?.status_name || 'Unknown';
            const statusStyle = getStatusChipColor(order.order_status, theme);
            const canEdit = isCreatedStatus(order.order_status);
            const contact = contacts.find(c => c.id === order.contact);
            const customerDisplay = contact ? (contact.company_name || contact.contact_name || '-') : '-';
            const address = addresses.find(a => a.id === order.shipping_address);
            const destinationDisplay = address && address.city && address.state ? `${address.city} - ${address.state}` : '-';

            return (
              <TableRow key={order.id} hover sx={{ cursor: 'pointer' }}>
                <TableCell>{order.lookup_code_order}</TableCell>
                <TableCell>{order.reference_number || '-'}</TableCell>
                <TableCell>{customerDisplay}</TableCell>
                <TableCell>{destinationDisplay}</TableCell>
                <TableCell>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      ...statusStyle,
                    }}
                  >
                    {status}
                  </span>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {canEdit ? (
                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleEditClick(order.id); }}>
                        Edit
                      </Button>
                    ) : (
                      <Button variant="outlined" size="small" onClick={(e) => { e.stopPropagation(); handleViewClick(order.id); }}>
                        View
                      </Button>
                    )}
                    {canEdit && (
                      <IconButton
                        aria-label="delete"
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(order.id); }}
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrdersTable;