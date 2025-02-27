import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Checkbox,
  TextField, 
  IconButton,
  InputAdornment,
  Box,
  CircularProgress
} from '@mui/material';
import { Search, Add, Remove } from '@mui/icons-material';

const MaterialSelectionStep = ({ 
  formData, 
  setFormData, 
  inventories = [], 
  materials = [],
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [selectedItems, setSelectedItems] = useState(formData.selectedInventories || []);

  // Sync selectedItems with formData.selectedInventories
  useEffect(() => {
    setSelectedItems(formData.selectedInventories || []);
  }, [formData.selectedInventories]);

  // Filter inventories based on search term
  useEffect(() => {
    if (!inventories) return;
    
    const filtered = inventories.filter(item => {
      const material = materials.find(m => m.id === item.material);
      const materialName = material ? material.name : '';
      
      return (
        item.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    
    setFilteredInventories(filtered);
  }, [searchTerm, inventories, materials]);

  // Handle selection of inventory items
  const handleToggleItem = (item) => {
    const existingItemIndex = selectedItems.findIndex(
      selectedItem => selectedItem.id === item.id
    );

    let newSelectedItems;
    if (existingItemIndex >= 0) {
      newSelectedItems = selectedItems.filter((_, index) => index !== existingItemIndex);
    } else {
      newSelectedItems = [...selectedItems, { ...item, orderQuantity: 1 }];
    }
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems); // Pass array directly to dispatch
  };

  // Handle quantity change for selected items
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = inventories.find(inv => inv.id === itemId);
    const maxQuantity = parseFloat(item.quantity);
    const quantity = Math.min(Math.max(1, newQuantity), maxQuantity);

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: quantity }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems); // Pass array directly to dispatch
  };

  // Check if an item is selected
  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
  };

  // Find material name by ID
  const getMaterialName = (materialId) => {
    const material = materials.find(m => m.id === materialId);
    return material ? material.name : 'Unknown Material';
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Available Inventory
        </Typography>
        
        {/* Search field */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by material, license plate, or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }
            }}
          />
        </Box>

        {/* Selected items count */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">
            {selectedItems.length} items selected
          </Typography>
        </Box>

        {/* Inventory table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Available Qty</TableCell>
                  <TableCell>Order Qty</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredInventories.map((item) => {
                  const isSelected = isItemSelected(item.id);
                  const selectedItem = selectedItems.find(
                    selectedItem => selectedItem.id === item.id
                  );
                  
                  return (
                    <TableRow 
                      key={item.id}
                      hover
                      selected={isSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleItem(item)}
                        />
                      </TableCell>
                      <TableCell>{getMaterialName(item.material)}</TableCell>
                      <TableCell>{item.license_plate}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell align="right">{parseFloat(item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        {isSelected && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton 
                              size="small"
                              onClick={() => handleQuantityChange(
                                item.id, 
                                (selectedItem.orderQuantity || 1) - 1
                              )}
                              disabled={(selectedItem.orderQuantity || 1) <= 1}
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                            <TextField
                              size="small"
                              value={selectedItem.orderQuantity || 1}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                if (val === '' || !isNaN(val)) {
                                  handleQuantityChange(item.id, val);
                                }
                              }}
                              slotProps={{ 
                                input: {
                                  style: { textAlign: 'center' },
                                  min: 1,
                                  max: parseFloat(item.quantity),
                                  type: 'number'
                                }
                              }}
                              sx={{ width: '60px', mx: 1 }}
                            />
                            <IconButton 
                              size="small"
                              onClick={() => handleQuantityChange(
                                item.id, 
                                (selectedItem.orderQuantity || 1) + 1
                              )}
                              disabled={(selectedItem.orderQuantity || 1) >= parseFloat(item.quantity)}
                            >
                              <Add fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredInventories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Selected Items Summary */}
      {selectedItems.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Selected Materials
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell>License Plate</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={`selected-${item.id}`}>
                    <TableCell>{getMaterialName(item.material)}</TableCell>
                    <TableCell>{item.license_plate}</TableCell>
                    <TableCell align="right">{item.orderQuantity || 1}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </>
  );
};

export default MaterialSelectionStep;