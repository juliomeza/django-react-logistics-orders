import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TextField,
  IconButton,
  Typography
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import MaterialSearch from './MaterialSearch';
import { formatQuantity } from './MaterialUtils';

const MaterialTable = ({ 
  selectedItems, 
  materials, 
  handleQuantityChange, 
  handleRemoveItem, 
  availableOptions,
  currentSelection,
  inputValue,
  setInputValue,
  handleAddItem,
  setCurrentSelection
}) => {
  return (
    <TableContainer sx={{ mb: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Material Code</TableCell>
            <TableCell width="40%">Material Name</TableCell>
            <TableCell align="right">Available Qty</TableCell>
            <TableCell>Order Qty</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {selectedItems.map((item) => {
            const material = materials.find(m => m.id === item.material);
            return (
              <TableRow key={item.id}>
                <TableCell>{item.materialCode || material?.lookup_code || '-'}</TableCell>
                <TableCell>{item.materialName || material?.name || 'Unknown Material'}</TableCell>
                <TableCell align="right">{formatQuantity(item.availableQty)}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={item.orderQuantity || 1}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      if (val === '' || !isNaN(val)) {
                        handleQuantityChange(item.id, val);
                      }
                    }}
                    InputProps={{
                      inputProps: {
                        min: 1,
                        // Ensure max is always a valid number or remove it if not
                        ...(typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0
                          ? { max: item.availableQty }
                          : {}),
                        type: 'number',
                        style: { textAlign: 'center' }
                      }
                    }}
                    sx={{ width: '80px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
          
          <MaterialSearch 
            availableOptions={availableOptions}
            currentSelection={currentSelection}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleAddItem={handleAddItem}
            setCurrentSelection={setCurrentSelection}
          />
          
          {/* Empty state messages */}
          {selectedItems.length === 0 && availableOptions.length > 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Search and select materials to add to your order
                </Typography>
              </TableCell>
            </TableRow>
          )}
          
          {availableOptions.length === 0 && selectedItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No inventory items available
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MaterialTable;