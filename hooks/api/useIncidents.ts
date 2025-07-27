// hooks/api/useIncidents.ts
import { useState, useEffect } from 'react';
import { incidentsAPI } from '../../lib/api/incidents';
import type { Incident, GetIncidentsQuery } from '../../lib/api/incidents';

export function useIncidents(query: GetIncidentsQuery = {}) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchIncidents();
  }, [JSON.stringify(query)]);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await incidentsAPI.getAll(query);
      if (response.success && response.data) {
        setIncidents(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async (data: any) => {
    try {
      const response = await incidentsAPI.create(data);
      if (response.success && response.data) {
        setIncidents(prev => [response.data!, ...prev]);
        return response.data;
      }
      throw new Error(response.error || 'Failed to create incident');
    } catch (err) {
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    pagination,
    fetchIncidents,
    createIncident,
  };
}
