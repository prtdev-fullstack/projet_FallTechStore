import { create } from 'zustand';
import type { Order } from '../types';
import { api } from '../lib/api';

/* ==========================================================================
   Commandes — persistées côté serveur (voir server/), visibles par
   n'importe quel navigateur admin, pas seulement celui qui les a passées.

   `orders` n'est peuplé que côté admin (GET /api/orders exige la session
   admin) : la page « Mes commandes » du compte client interroge séparément
   GET /api/orders/by-email/:email, public, filtré par e-mail — voir
   Account.tsx.
   ========================================================================== */

interface OrdersState {
  orders: Order[];
  isLoaded: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (order: { id: string; total: number; lines: Order['lines']; customer: Order['customer'] }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  isLoaded: false,

  fetchOrders: async () => {
    const orders = await api.get<Order[]>('/orders');
    set({ orders, isLoaded: true });
  },

  createOrder: async (order) => api.post<Order>('/orders', order),

  updateOrderStatus: async (id, status) => {
    const updated = await api.patch<Order>(`/orders/${id}/status`, { status });
    set({ orders: get().orders.map((order) => (order.id === id ? updated : order)) });
  },
}));
