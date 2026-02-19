import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiBarangayListResponse } from '@/types/api';

export function useBarangays() {
  return useQuery({
    queryKey: ['barangays'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiBarangayListResponse>('/barangays', {
        params: { limit: 200 }, // Get all barangays
      });
      return data.barangays;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes — barangays rarely change
  });
}
