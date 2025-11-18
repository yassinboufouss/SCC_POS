export const queryKeys = {
  profiles: {
    all: ['profiles'] as const,
    list: (search?: string, status?: string) => [...queryKeys.profiles.all, 'list', search, status] as const,
    detail: (id: string) => [...queryKeys.profiles.all, 'detail', id] as const,
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
    list: (search?: string) => [...queryKeys.transactions.all, 'list', search] as const,
    byMember: (memberId: string) => [...queryKeys.transactions.all, 'byMember', memberId] as const,
  },
  dashboard: {
    metrics: ['dashboard', 'metrics'] as const,
  }
};