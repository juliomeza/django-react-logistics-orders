import React from 'react';
import BasicOrderInfoStep from './BasicOrderInfoStep';
import LogisticsInfoStep from './LogisticsInfoStep';
import DeliveryInfoStep from './DeliveryInfoStep';
import AdditionalInfoStep from './AdditionalInfoStep';

const OrderDetailsForm = ({
  formData,
  handleChange,
  orderTypes,
  orderClasses,
  warehouses,
  projects,
  carriers,
  carrierServices,
  contacts,
  addresses,
  formErrors,
  isOrderLocked,
  user,
  refetchReferenceData,
}) => {
  return (
    <>
      <BasicOrderInfoStep
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <LogisticsInfoStep
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <DeliveryInfoStep
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
        formErrors={formErrors}
        projects={projects}
        user={user}
        isOrderLocked={isOrderLocked}
        refetchReferenceData={refetchReferenceData} // Pasamos la función
      />
      <AdditionalInfoStep
        formData={formData}
        handleChange={handleChange}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
    </>
  );
};

export default OrderDetailsForm;