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
  addresses
}) => {
  return (
    <>
      <OrderDetailsBasicOrderInformation
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
      />
      <OrderDetailsLogisticsInformation
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
      />
      <OrderDetailsDeliveryInformation
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
      />
      <OrderDetailsAdditionalInformation
        formData={formData}
        handleChange={handleChange}
      />
    </>
  );
};

export default OrderDetailsStep;
