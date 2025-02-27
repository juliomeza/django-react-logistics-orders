// Initial form state
export const initialFormState = {
  lookup_code_order: '',
  reference_number: '',
  notes: '',
  order_type: '',
  order_class: '',
  warehouse: '',
  project: '',
  carrier: '',
  service_type: '',
  contact: '',
  expected_delivery_date: '',
  shipping_address: '',
  billing_address: '',
  selectedInventories: [],
};

// Form state reducer
export const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_INVENTORIES':
      return { ...state, selectedInventories: action.inventories };
    case 'SET_FORM_DATA':
      return { ...state, ...action.data }; // Actualiza el estado con todos los datos de la orden
    default:
      return state;
  }
};