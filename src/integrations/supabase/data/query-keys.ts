import { Transaction } from "@/types/supabase";
import { PaymentMethod } from "@/types/pos";

export const queryKeys = {
  profiles: {
    all: ['profiles'] as const,
    list: (search?: string, status?: string) => [...queryKeys.profiles.all, 'list', search, status] as const,
    detail: (id: string) => [...queryKeys.profiles.all, 'detail', id] as const,
    byCode: (code: string) => [...queryKeys.profiles.all, 'byCode', code] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    list: (search?: string) => [...queryKeys.inventory.all, 'list', search] as const,
    detail: (id: string) => [...queryKeys.inventory.all, 'detail', id] as const,
  },
  plans: {
    all: ['plans'] as const,
    list: (search?: string) => [...queryKeys.plans.all, 'list', search] as const,
    detail: (id: string) => [...queryKeys.plans.all, 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (search?: string, type?: Transaction['type'] | 'All', paymentMethod?: PaymentMethod | 'All', dateRange?: { from: Date | undefined, to: Date | undefined }) => [...queryKeys.transactions.all, 'list', search, type, paymentMethod, dateRange] as const,
    byMember: (memberId: string) => [...queryKeys.transactions.all, 'byMember', memberId] as const,
  },
  dashboard: {
    metrics: ['dashboard', 'metrics'] as const,
  }
};