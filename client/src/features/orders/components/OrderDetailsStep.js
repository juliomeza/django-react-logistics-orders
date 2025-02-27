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
  formErrors // Añadimos formErrors como prop
}) => {
  return (
    <>
      <OrderDetailsBasicOrderInformation
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
        formErrors={formErrors} // Pasamos formErrors
      />
      <OrderDetailsLogisticsInformation
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
        formErrors={formErrors} // Pasamos formErrors
      />
      <OrderDetailsDeliveryInformation
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
        formErrors={formErrors} // Pasamos formErrors
      />
      <OrderDetailsAdditionalInformation
        formData={formData}
        handleChange={handleChange}
        formErrors={formErrors} // Pasamos formErrors (aunque no sea obligatorio aquí)
      />
    </>
  );
};

export default OrderDetailsStep;