// Utility functions for material selection and manipulation

export const enrichSelectedItems = (selectedInventories, inventories, materials) => {
    if (!selectedInventories || inventories.length === 0 || materials.length === 0) {
      return selectedInventories || [];
    }
    
    return selectedInventories.map(item => {
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
      
      return {
        ...item,
        materialName: material ? material.name : 'Unknown Material',
        materialCode: material ? material.lookup_code : '',
        // Use matched inventory quantity if available
        availableQty: inventoryItem ? parseFloat(inventoryItem.quantity) : 0
      };
    });
  };
  
  export const createInventoryOptions = (inventories, materials) => {
    return inventories.map(item => {
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
  };
  
  export const validateQuantity = (item, newQuantity) => {
    // Only apply max validation if availableQty is a valid positive number
    if (typeof item.availableQty === 'number' && !isNaN(item.availableQty) && item.availableQty > 0) {
      return Math.min(Math.max(1, newQuantity), item.availableQty);
    } else {
      // If no valid max, just ensure minimum is 1
      return Math.max(1, newQuantity);
    }
  };
  
  export const formatQuantity = (value) => {
    return (typeof value === 'number' && !isNaN(value)) 
      ? value.toFixed(2) 
      : '0.00';
  };