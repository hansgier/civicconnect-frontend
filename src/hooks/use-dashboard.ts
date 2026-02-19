import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ApiDashboardStats,
  ApiTrendData,
  ApiTopProject,
  ApiWorstProject,
  ApiStatusTrendData,
} from '@/types/api';

/**
 * GET /api/dashboard/stats
 * Returns: cityPopulation, totalProjects, completedProjects, ongoingProjects,
 *          cancelledProjects, plannedProjects, onHoldProjects,
 *          approvedProposalProjects, statusDistribution
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiDashboardStats }>(
        '/dashboard/stats'
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * GET /api/dashboard/project-trends?months=N
 * Returns: trends[] (month + count), percentChange
 */
export function useProjectTrends(months: number = 12) {
  return useQuery({
    queryKey: ['dashboard', 'project-trends', months],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiTrendData }>(
        '/dashboard/project-trends',
        { params: { months } }
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * GET /api/dashboard/engagement-trends?months=N
 * Returns: trends[] (month + count), percentChange
 */
export function useEngagementTrends(months: number = 12) {
  return useQuery({
    queryKey: ['dashboard', 'engagement-trends', months],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiTrendData }>(
        '/dashboard/engagement-trends',
        { params: { months } }
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * GET /api/dashboard/top-projects?limit=N
 * Returns: projects with approveCount, commentCount, score
 */
export function useTopProjects(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'top-projects', limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiTopProject[] }>(
        '/dashboard/top-projects',
        { params: { limit } }
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * GET /api/dashboard/worst-projects?limit=N
 * Returns: projects with disapproveCount
 */
export function useWorstProjects(limit: number = 5) {
  return useQuery({
    queryKey: ['dashboard', 'worst-projects', limit],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiWorstProject[] }>(
        '/dashboard/worst-projects',
        { params: { limit } }
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * GET /api/dashboard/status-trends?months=N
 * Returns: status distribution by month
 */
export function useStatusTrends(months: number = 12) {
  return useQuery({
    queryKey: ['dashboard', 'status-trends', months],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiStatusTrendData[] }>(
        '/dashboard/status-trends',
        { params: { months } }
      );
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
