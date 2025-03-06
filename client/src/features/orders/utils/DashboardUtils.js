// Utility functions for the Dashboard component

// Check if date is within the last 30 days
export const isWithinLast30Days = (dateString) => {
    if (!dateString) return false;
    
    const currentDate = new Date();
    const date = new Date(dateString);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);
    
    return date >= thirtyDaysAgo && date <= currentDate;
  };
  
  // Get status chip styles based on statusId
  export const getStatusChipColor = (statusId, theme) => {
    switch (statusId) {
      case 1: case 2:
        return {
          backgroundColor: theme.palette.status.initial.backgroundColor,
          color: theme.palette.status.initial.color,
          border: `1px solid ${theme.palette.status.initial.border}`,
        };
      case 3: case 4: case 5: case 6:
        return {
          backgroundColor: theme.palette.status.inProgress.backgroundColor,
          color: theme.palette.status.inProgress.color,
          border: `1px solid ${theme.palette.status.inProgress.border}`,
        };
      case 7:
        return {
          backgroundColor: theme.palette.status.completed.backgroundColor,
          color: theme.palette.status.completed.color,
          border: `1px solid ${theme.palette.status.completed.border}`,
        };
      default:
        return {
          backgroundColor: theme.palette.status.default.backgroundColor,
          color: theme.palette.status.default.color,
          border: `1px solid ${theme.palette.status.default.border}`,
        };
    }
  };
  
  // Check if order is in created status and can be edited
  export const isCreatedStatus = (statusId) => statusId === 1;
  
  // Filter orders based on search text and selected tab
  export const filterOrders = (orders, contacts, addresses, orderTypes, searchText, selectedTab) => {
    return orders
      .filter(order => {
        const contact = contacts.find(c => c.id === order.contact);
        const address = addresses.find(a => a.id === order.shipping_address);
        const companyName = contact?.company_name || '';
        const contactName = contact?.contact_name || '';
        const city = address?.city || '';
        const state = address?.state || '';
        
        // Search text filtering
        const searchMatch =
          searchText === '' ||
          (order.lookup_code_order && order.lookup_code_order.toLowerCase().includes(searchText.toLowerCase())) ||
          (order.reference_number && order.reference_number.toLowerCase().includes(searchText.toLowerCase())) ||
          companyName.toLowerCase().includes(searchText.toLowerCase()) ||
          contactName.toLowerCase().includes(searchText.toLowerCase()) ||
          city.toLowerCase().includes(searchText.toLowerCase()) ||
          state.toLowerCase().includes(searchText.toLowerCase());
        
        // Tab filtering (outbound vs inbound)
        const outboundTypes = orderTypes
          .filter(type => type.type_name?.toLowerCase().includes('outbound') || type.is_outbound)
          .map(type => type.id);
        const inboundTypes = orderTypes
          .filter(type => type.type_name?.toLowerCase().includes('inbound') || type.is_inbound)
          .map(type => type.id);
        const tabMatch = selectedTab === 0 ? outboundTypes.includes(order.order_type) : inboundTypes.includes(order.order_type);
        
        return searchMatch && tabMatch;
      })
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  };