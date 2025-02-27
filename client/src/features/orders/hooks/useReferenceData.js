import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';

const useReferenceData = (user) => {
  const [data, setData] = useState({
    orderTypes: [],
    orderClasses: [],
    projects: [],
    warehouses: [],
    contacts: [],
    addresses: [],
    carriers: [],
    carrierServices: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          orderTypesRes,
          orderClassesRes,
          projectsRes,
          warehousesRes,
          contactsRes,
          addressesRes,
          carriersRes,
          carrierServicesRes,
        ] = await Promise.all([
          apiProtected.get('order-types/'),
          apiProtected.get('order-classes/'),
          apiProtected.get('projects/'),
          apiProtected.get('warehouses/'),
          apiProtected.get('contacts/'),
          apiProtected.get('addresses/'),
          apiProtected.get('carriers/'),
          apiProtected.get('carrier-services/'),
        ]);
        const userId = parseInt(user.id, 10);
        setData({
          orderTypes: orderTypesRes.data,
          orderClasses: orderClassesRes.data,
          projects: projectsRes.data.filter(
            (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
          ),
          warehouses: warehousesRes.data,
          contacts: contactsRes.data,
          addresses: addressesRes.data,
          carriers: carriersRes.data,
          carrierServices: carrierServicesRes.data,
        });
      } catch (err) {
        setError('Failed to load reference data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return { data, loading, error };
};

export default useReferenceData;