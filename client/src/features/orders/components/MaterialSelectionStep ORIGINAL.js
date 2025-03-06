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
  TextField,
  IconButton,
  Box,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Delete, Add } from '@mui/icons-material';

const MaterialSelectionStep = ({ 
  formData, 
  setFormData, 
  inventories = [], 
  materials = [],
  loading = false
}) => {
  const [selectedItems, setSelectedItems] = useState(formData.selectedInventories || []);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Sync selectedItems with formData.selectedInventories and enrich with available quantities
  useEffect(() => {
    if (formData.selectedInventories && inventories.length > 0 && materials.length > 0) {
      console.log("Processing selected inventories:", formData.selectedInventories);
      console.log("Available inventories:", inventories);
      
      // Enrich the selected items with available quantities from the inventory
      const enrichedItems = formData.selectedInventories.map(item => {
        const material = materials.find(m => m.id === item.material);
        
        // First try to find inventory by exact match on material and license_plate
        let inventoryItem = null;
        
        if (item.license_plate) {
          inventoryItem = inventories.find(inv => 
            inv.material === item.material && 
            inv.license_plate === item.license_plate
          );
        }
        
        // If no match with license_plate or license_plate is null,
        // find all inventory items with the same material
        if (!inventoryItem) {
          const matchingInventories = inventories.filter(inv => inv.material === item.material);
          
          if (matchingInventories.length > 0) {
            // Sort by quantity to get the one with the highest available quantity
            matchingInventories.sort((a, b) => 
              parseFloat(b.quantity) - parseFloat(a.quantity)
            );
            inventoryItem = matchingInventories[0];
          }
        }
        
        console.log(`For material ${item.material}, found inventory:`, inventoryItem);
        
        return {
          ...item,
          materialName: material ? material.name : 'Unknown Material',
          materialCode: material ? material.lookup_code : '',
          // Use matched inventory quantity if available
          availableQty: inventoryItem ? parseFloat(inventoryItem.quantity) : 0
        };
      });
      
      console.log("Enriched items:", enrichedItems);
      setSelectedItems(enrichedItems);
    } else if (formData.selectedInventories) {
      // If we don't have inventory data yet, just use what we have
      setSelectedItems(formData.selectedInventories);
    } else {
      setSelectedItems([]);
    }
  }, [formData.selectedInventories, inventories, materials]);

  // Create inventory options for autocomplete that include material name and code
  const inventoryOptions = inventories.map(item => {
    const material = materials.find(m => m.id === item.material);
    const materialName = material ? material.name : 'Unknown Material';
    const materialCode = material ? material.lookup_code : '';
    
    return {
      ...item,
      materialName,
      materialCode,
      label: `${materialCode} - ${materialName}`,
      availableQty: parseFloat(item.quantity)
    };
  });

  // Filter out options that are already selected - by material ID to prevent duplicates
  const availableOptions = inventoryOptions.filter(option => 
    !selectedItems.some(item => item.material === option.material)
  );

  // Handle adding a new item when selected from autocomplete
  const handleAddItem = (selectedOption) => {
    if (!selectedOption) return;
    
    // Add new item with default quantity of 1
    const newItem = { 
      ...selectedOption, 
      orderQuantity: 1
    };
    
    const updatedItems = [...selectedItems, newItem];
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
    setCurrentSelection(null);
    setInputValue('');
  };

  // Handle removing an item
  const handleRemoveItem = (itemId) => {
    const updatedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(updatedItems);
    setFormData(updatedItems);
  };

  // Handle quantity change for selected items
  const handleQuantityChange = (itemId, newQuantity) => {
    const item = selectedItems.find(item => item.id === itemId);
    
    // Only apply max validation if availableQty is a valid positive number
    let quantity = newQuantity;
    if (typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0) {
      quantity = Math.min(Math.max(1, newQuantity), item.availableQty);
    } else {
      // If no valid max, just ensure minimum is 1
      quantity = Math.max(1, newQuantity);
    }

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: quantity }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Select Materials
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Selected materials table */}
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
                      <TableCell align="right">{
                        // Format the availableQty properly - ensure it's a valid number
                        (typeof item.availableQty === 'number' && !isNaN(item.availableQty)) 
                          ? item.availableQty.toFixed(2) 
                          : '0.00'
                      }</TableCell>
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
                
                {/* New row for adding materials */}
                <TableRow>
                  <TableCell colSpan={2}>
                    <Autocomplete
                      id="material-select"
                      options={availableOptions}
                      value={currentSelection}
                      onChange={(event, newValue) => {
                        handleAddItem(newValue);
                      }}
                      inputValue={inputValue}
                      onInputChange={(event, newValue) => {
                        setInputValue(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          placeholder="Search material by code or name..."
                          size="small"
                        />
                      )}
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      noOptionsText="No materials available"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary"
                      disabled={!currentSelection}
                      onClick={() => handleAddItem(currentSelection)}
                    >
                      <Add />
                    </IconButton>
                  </TableCell>
                </TableRow>
                
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
          
          {/* Selected items count */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              {selectedItems.length} items selected
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MaterialSelectionStep;