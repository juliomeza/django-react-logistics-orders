import React from 'react';
import OrderDetailsBasicOrderInformation from './OrderDetailsBasicOrderInformation';
import OrderDetailsLogisticsInformation from './OrderDetailsLogisticsInformation';
import OrderDetailsDeliveryInformation from './OrderDetailsDeliveryInformation';
import OrderDetailsAdditionalInformation from './OrderDetailsAdditionalInformation';

const OrderDetailsStep = ({
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
  isOrderLocked, // Nueva prop
}) => {
  return (
    <>
      <OrderDetailsBasicOrderInformation
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked} // Pasamos a subcomponentes
      />
      <OrderDetailsLogisticsInformation
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked} // Pasamos a subcomponentes
      />
      <OrderDetailsDeliveryInformation
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked} // Pasamos a subcomponentes
      />
      <OrderDetailsAdditionalInformation
        formData={formData}
        handleChange={handleChange}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked} // Pasamos a subcomponentes
      />
    </>
  );
};

export default OrderDetailsStep;