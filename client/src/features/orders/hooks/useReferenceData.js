import { useState, useEffect, useCallback } from 'react'; // Añadimos useCallback
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

  // Definimos fetchData con useCallback para estabilizarla
  const fetchData = useCallback(async () => {
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
  }, [user]); // Dependencia en user

  // Función para recargar contactos, direcciones y proyectos dinámicamente
  const refetchReferenceData = async () => {
    try {
      const [contactsRes, addressesRes, projectsRes] = await Promise.all([
        apiProtected.get('contacts/'),
        apiProtected.get('addresses/'),
        apiProtected.get('projects/'),
      ]);
      const userId = parseInt(user.id, 10);
      setData((prev) => ({
        ...prev,
        contacts: contactsRes.data,
        addresses: addressesRes.data,
        projects: projectsRes.data.filter(
          (proj) => Array.isArray(proj.users) && proj.users.includes(userId)
        ),
      }));
    } catch (err) {
      setError('Failed to refresh reference data');
      console.error('Error refetching reference data:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, fetchData]); // Añadimos fetchData como dependencia

  return { data, loading, error, refetchReferenceData };
};

export default useReferenceData;