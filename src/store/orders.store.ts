import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Order } from '../types';

/* ==========================================================================
   Commandes — 100 % client, sans serveur.

   Les commandes passées depuis le tunnel sont conservées dans localStorage,
   sur le navigateur qui les a passées : l'admin de démonstration et la page
   « Mes commandes » du compte lisent donc la même liste locale. Une vraie
   boutique aurait ici un serveur ; ce projet assume la démonstration.
   ========================================================================== */

interface OrdersState {
  orders: Order[];
  /** Toujours vrai ici — voir le même champ dans catalog.store.ts. */
  isLoaded: boolean;
  createOrder: (order: {
    id: string;
    total: number;
    lines: Order['lines'];
    customer: Order['customer'];
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoaded: true,

      /* `async` conservé : Checkout.tsx `await`e cet appel et affiche un état
         d'envoi pendant la fausse latence de la passerelle de paiement. */
      createOrder: async (input) => {
        const order: Order = {
          ...input,
          date: new Date().toISOString(),
          status: 'en-preparation',
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },

      updateOrderStatus: async (id, status) => {
        set({
          orders: get().orders.map((order) => (order.id === id ? { ...order, status } : order)),
        });
      },
    }),
    {
      name: 'falltech-orders',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);

/** Commandes d'un client donné, les plus récentes d'abord — utilisé par la
 *  page « Mes commandes » du compte, qui ne doit jamais voir celles des
 *  autres. La comparaison ignore la casse : l'e-mail saisi au tunnel n'est
 *  pas forcément écrit comme celui du compte. */
export function ordersByEmail(orders: Order[], email: string | undefined): Order[] {
  if (!email) return [];
  const needle = email.trim().toLowerCase();
  return orders.filter((order) => order.customer.email.trim().toLowerCase() === needle);
}
