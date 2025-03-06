import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  CircularProgress
} from '@mui/material';
import MaterialTable from './MaterialTable';
import { enrichSelectedItems, createInventoryOptions, validateQuantity } from '../../utils/MaterialUtils';

const MaterialSelectionStep = ({ 
  formData, 
  setFormData, 
  inventories = [], 
  materials = [],
  loading = false,
  materialUoms = {} // Objeto que mapea materialId a array de UOMs disponibles
}) => {
  const [selectedItems, setSelectedItems] = useState(formData.selectedInventories || []);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Sync selectedItems with formData.selectedInventories and enrich with available quantities
  useEffect(() => {
    const enrichedItems = enrichSelectedItems(formData.selectedInventories, inventories, materials);
    
    if (enrichedItems) {
      console.log("Enriched items:", enrichedItems);
      setSelectedItems(enrichedItems);
    }
  }, [formData.selectedInventories, inventories, materials]);

  // Create inventory options for autocomplete
  const inventoryOptions = createInventoryOptions(inventories, materials);

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
      orderQuantity: 1,
      uom: selectedOption.uom || materials.find(m => m.id === selectedOption.material)?.uom || 1
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
    const quantity = validateQuantity(item, newQuantity);

    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, orderQuantity: quantity }
        : selectedItem
    );
    
    setSelectedItems(newSelectedItems);
    setFormData(newSelectedItems);
  };

  // Handle UOM change for selected items
  const handleUomChange = (itemId, newUomId) => {
    const newSelectedItems = selectedItems.map(selectedItem => 
      selectedItem.id === itemId 
        ? { ...selectedItem, uom: newUomId }
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
          <MaterialTable 
            selectedItems={selectedItems}
            materials={materials}
            handleQuantityChange={handleQuantityChange}
            handleUomChange={handleUomChange}
            handleRemoveItem={handleRemoveItem}
            availableOptions={availableOptions}
            currentSelection={currentSelection}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleAddItem={handleAddItem}
            setCurrentSelection={setCurrentSelection}
            materialUoms={materialUoms}
          />
          
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