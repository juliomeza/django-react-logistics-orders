// import React from 'react';
// import OrderDetailsBasicOrderInformation from './OrderDetailsBasicOrderInformation';
// import OrderDetailsLogisticsInformation from './OrderDetailsLogisticsInformation';
// import OrderDetailsDeliveryInformation from './OrderDetailsDeliveryInformation';
// import OrderDetailsAdditionalInformation from './OrderDetailsAdditionalInformation';

// const OrderDetailsStep = ({
//   formData,
//   handleChange,
//   orderTypes,
//   orderClasses,
//   warehouses,
//   projects,
//   carriers,
//   carrierServices,
//   contacts,
//   addresses,
//   formErrors,
//   isOrderLocked,
// }) => {
//   return (
//     <>
//       <OrderDetailsBasicOrderInformation
//         formData={formData}
//         handleChange={handleChange}
//         orderTypes={orderTypes}
//         orderClasses={orderClasses}
//         formErrors={formErrors}
//         isOrderLocked={isOrderLocked}
//       />
//       <OrderDetailsLogisticsInformation
//         formData={formData}
//         handleChange={handleChange}
//         warehouses={warehouses}
//         projects={projects}
//         carriers={carriers}
//         carrierServices={carrierServices}
//         formErrors={formErrors}
//         isOrderLocked={isOrderLocked}
//       />
//       <OrderDetailsDeliveryInformation
//         formData={formData}
//         handleChange={handleChange}
//         contacts={contacts}
//         addresses={addresses}
//         formErrors={formErrors}
//         isOrderLocked={isOrderLocked}
//       />
//       <OrderDetailsAdditionalInformation
//         formData={formData}
//         handleChange={handleChange}
//         formErrors={formErrors}
//         isOrderLocked={isOrderLocked}
//       />
//     </>
//   );
// };

// export default OrderDetailsStep;


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
  isOrderLocked,
  user // Asegúrate de recibir user desde MultiStepCreateOrder
}) => {
  return (
    <>
      <OrderDetailsBasicOrderInformation
        formData={formData}
        handleChange={handleChange}
        orderTypes={orderTypes}
        orderClasses={orderClasses}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <OrderDetailsLogisticsInformation
        formData={formData}
        handleChange={handleChange}
        warehouses={warehouses}
        projects={projects}
        carriers={carriers}
        carrierServices={carrierServices}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
      <OrderDetailsDeliveryInformation
        formData={formData}
        handleChange={handleChange}
        contacts={contacts}
        addresses={addresses}
        formErrors={formErrors}
        projects={projects} // Añadido
        user={user} // Añadido
        isOrderLocked={isOrderLocked}
      />
      <OrderDetailsAdditionalInformation
        formData={formData}
        handleChange={handleChange}
        formErrors={formErrors}
        isOrderLocked={isOrderLocked}
      />
    </>
  );
};

export default OrderDetailsStep;