import { create } from "zustand";
import api from "@/services/api";

type DashboardState = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    pendingReviewsCount: number;
  };
  dailyRevenue: { date: string; total: string }[];
  recentOrders: { id: string; customerName: string; total: number; status: string; date: string }[];
  categoryDistribution: { name: string; value: number }[];
  loading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useDashboard = create<DashboardState>((set) => ({
  summary: {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingReviewsCount: 0
  },
  dailyRevenue: [],
  recentOrders: [],
  categoryDistribution: [],
  loading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/admin/dashboard-stats');
      set({ 
        summary: response.data.summary,
        dailyRevenue: response.data.dailyRevenue,
        recentOrders: response.data.recentOrders,
        categoryDistribution: response.data.categoryDistribution,
        loading: false 
      });
    } catch (err: unknown) {
      set({ loading: false, error: (err as ApiError).response?.data?.message || "Failed to load stats" });
    }
  },
}));
