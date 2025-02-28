import React from 'react';
import OrderSummary from './OrderSummary';

/**
 * Component for the final review step in the order creation process
 * Uses the shared OrderSummary component to display order information
 */
const ReviewStep = ({ 
  formData,
  orderTypes = [],
  orderClasses = [],
  warehouses = [],
  projects = [],
  carriers = [],
  carrierServices = [],
  contacts = [],
  addresses = [],
  materials = []
}) => {
  // Create reference data object in the format expected by OrderSummary
  const referenceData = {
    orderTypes,
    orderClasses,
    warehouses,
    projects,
    carriers,
    carrierServices,
    contacts,
    addresses
  };
  
  return (
    <OrderSummary 
      orderData={formData}
      referenceData={referenceData}
      materials={materials}
      materialItems={formData.selectedInventories}
      isReviewMode={true}
    />
  );
};

export default ReviewStep;