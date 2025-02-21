import React from 'react';
import OrderDetails_BasicOrderInformation from './OrderDetails_BasicOrderInformation';
import OrderDetails_LogisticsInformation from './OrderDetails_LogisticsInformation';
import OrderDetails_DeliveryInformation from './OrderDetails_DeliveryInformation';
import OrderDetails_AdditionalInformation from './OrderDetails_AdditionalInformation';

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
      <OrderDetails_BasicOrderInformation
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
      />
      <OrderDetails_LogisticsInformation
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
      />
      <OrderDetails_DeliveryInformation
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
      />
      <OrderDetails_AdditionalInformation
        formData={formData}
        handleChange={handleChange}
      />
    </>
  );
};

export default OrderDetailsStep;
