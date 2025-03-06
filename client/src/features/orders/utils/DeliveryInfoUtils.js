import React from 'react';
import { createFilterOptions } from '@mui/material/Autocomplete';

export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
};

export const formatAddress = (address) => {
  if (!address) return 'No address selected';
  return (
    <>
      {address.address_line_1}
      <br />
      {address.address_line_2 && (
        <>
          {address.address_line_2}
          <br />
        </>
      )}
      {address.city}, {address.state} {address.postal_code}
      <br />
      {address.country}
    </>
  );
};

export const buildContactOptions = (contacts, addresses) => {
  return contacts.map((contact) => {
    const shippingAddress = addresses.find(
      (addr) => contact.addresses?.includes(addr.id) && addr.address_type === 'shipping'
    );
    const city = shippingAddress ? shippingAddress.city : '';
    const displayName = contact.company_name || contact.contact_name;
    return { ...contact, label: city ? `${displayName} - ${city}` : displayName };
  });
};

export const createCustomFilterOptions = () => {
  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: (option) => option.label || '',
  });

  return (options, params) => {
    const filtered = filterOptions(options, params);
    
    // Siempre agregar la opción "Add New Contact" al final
    filtered.push({
      inputValue: params.inputValue,
      label: 'Add New Contact',
      isAddOption: true
    });
    
    return filtered;
  };
};