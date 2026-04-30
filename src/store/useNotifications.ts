import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export type NotificationType = 
  | "account" 
  | "order" 
  | "payment" 
  | "sale" 
  | "stock" 
  | "promo" 
  | "loyalty" 
  | "search" 
  | "admin_alert";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
  icon?: string;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
}

export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (n) => {
        const id = Math.random().toString(36).substring(7);
        const timestamp = new Date().toISOString();
        const newNotification = { ...n, id, timestamp, isRead: false };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }));

        // Trigger Toast
        toast(newNotification.title, {
          description: newNotification.message,
          action: newNotification.link ? {
            label: "View",
            onClick: () => window.location.href = newNotification.link!
          } : undefined,
        });
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },
      clearAll: () => {
        set({ notifications: [] });
      },
      unreadCount: () => {
        return get().notifications.filter((n) => !n.isRead).length;
      },
    }),
    {
      name: "yaababy-notifications",
    }
  )
);
