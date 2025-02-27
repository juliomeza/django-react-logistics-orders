import { useState, useEffect } from 'react';
import apiProtected from '../../../services/api/secureApi';

const useInventoriesAndMaterials = (user, warehouse) => {
  const [inventories, setInventories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !warehouse) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [invRes, matRes] = await Promise.all([
          apiProtected.get('inventories/'),
          apiProtected.get('materials/'),
        ]);
        setInventories(
          invRes.data.filter((inv) => inv.warehouse === parseInt(warehouse, 10))
        );
        setMaterials(matRes.data);
      } catch (err) {
        setError('Failed to load inventories');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, warehouse]);

  return { inventories, materials, loading, error };
};

export default useInventoriesAndMaterials;