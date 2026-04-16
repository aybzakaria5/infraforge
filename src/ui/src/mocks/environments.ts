export type EnvironmentStatus =
  | 'provisioning'
  | 'running'
  | 'deploying'
  | 'failed'
  | 'destroying'
  | 'destroyed'

export type ResourceTier = 'small' | 'medium' | 'large'

export interface Environment {
  id: string
  name: string
  template: string
  status: EnvironmentStatus
  tier: ResourceTier
  owner_id: string
  namespace: string
  auto_destroy: boolean
  ttl_hours: number
  resources: number
  last_deploy: string | null
  created_at: string
  updated_at: string
}

export const environments: Environment[] = [
  {
    id: 'env-a1b2c3d400000001',
    name: 'api-gateway-prod',
    template: 'production',
    status: 'running',
    tier: 'large',
    owner_id: 'usr-a1b2c3d4e5f60001',
    namespace: 'api-gateway-prod-a1b2c3d4',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 14,
    last_deploy: '2026-04-16T07:14:00Z',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-04-16T07:14:00Z',
  },
  {
    id: 'env-a1b2c3d400000002',
    name: 'auth-service-staging',
    template: 'staging',
    status: 'running',
    tier: 'medium',
    owner_id: 'usr-a1b2c3d4e5f60002',
    namespace: 'auth-service-staging-b2c3d4e5',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 8,
    last_deploy: '2026-04-16T04:22:00Z',
    created_at: '2026-02-03T14:30:00Z',
    updated_at: '2026-04-16T04:22:00Z',
  },
  {
    id: 'env-a1b2c3d400000003',
    name: 'payment-service-dev',
    template: 'development',
    status: 'running',
    tier: 'small',
    owner_id: 'usr-a1b2c3d4e5f60003',
    namespace: 'payment-service-dev-c3d4e5f6',
    auto_destroy: true,
    ttl_hours: 48,
    resources: 4,
    last_deploy: '2026-04-15T09:14:00Z',
    created_at: '2026-03-12T09:00:00Z',
    updated_at: '2026-04-15T09:14:00Z',
  },
  {
    id: 'env-a1b2c3d400000004',
    name: 'worker-v2-canary',
    template: 'staging',
    status: 'deploying',
    tier: 'medium',
    owner_id: 'usr-a1b2c3d4e5f60001',
    namespace: 'worker-v2-canary-d4e5f6a7',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 8,
    last_deploy: '2026-04-16T08:47:00Z',
    created_at: '2026-03-25T11:00:00Z',
    updated_at: '2026-04-16T08:47:00Z',
  },
  {
    id: 'env-a1b2c3d400000005',
    name: 'notification-service-qa',
    template: 'staging',
    status: 'running',
    tier: 'small',
    owner_id: 'usr-a1b2c3d4e5f60002',
    namespace: 'notification-service-qa-e5f6a7b8',
    auto_destroy: true,
    ttl_hours: 24,
    resources: 4,
    last_deploy: '2026-04-16T06:02:00Z',
    created_at: '2026-03-30T08:00:00Z',
    updated_at: '2026-04-16T06:02:00Z',
  },
  {
    id: 'env-a1b2c3d400000006',
    name: 'search-indexer-prod',
    template: 'production',
    status: 'running',
    tier: 'large',
    owner_id: 'usr-a1b2c3d4e5f60003',
    namespace: 'search-indexer-prod-f6a7b8c9',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 14,
    last_deploy: '2026-04-15T21:30:00Z',
    created_at: '2026-02-18T16:00:00Z',
    updated_at: '2026-04-15T21:30:00Z',
  },
  {
    id: 'env-a1b2c3d400000007',
    name: 'ml-pipeline-experiment',
    template: 'development',
    status: 'failed',
    tier: 'medium',
    owner_id: 'usr-a1b2c3d4e5f60004',
    namespace: 'ml-pipeline-exp-a7b8c9d0',
    auto_destroy: true,
    ttl_hours: 72,
    resources: 8,
    last_deploy: '2026-04-14T10:15:00Z',
    created_at: '2026-04-01T13:00:00Z',
    updated_at: '2026-04-14T10:15:00Z',
  },
  {
    id: 'env-a1b2c3d400000008',
    name: 'legacy-api-migration',
    template: 'staging',
    status: 'provisioning',
    tier: 'small',
    owner_id: 'usr-a1b2c3d4e5f60001',
    namespace: 'legacy-api-migration-b8c9d0e1',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 4,
    last_deploy: null,
    created_at: '2026-04-16T08:55:00Z',
    updated_at: '2026-04-16T08:55:00Z',
  },
  {
    id: 'env-a1b2c3d400000009',
    name: 'analytics-dashboard-staging',
    template: 'staging',
    status: 'running',
    tier: 'medium',
    owner_id: 'usr-a1b2c3d4e5f60002',
    namespace: 'analytics-dash-staging-c9d0e1f2',
    auto_destroy: false,
    ttl_hours: 0,
    resources: 8,
    last_deploy: '2026-04-15T14:45:00Z',
    created_at: '2026-03-05T10:30:00Z',
    updated_at: '2026-04-15T14:45:00Z',
  },
  {
    id: 'env-a1b2c3d400000010',
    name: 'cache-layer-perf-test',
    template: 'development',
    status: 'destroying',
    tier: 'large',
    owner_id: 'usr-a1b2c3d4e5f60003',
    namespace: 'cache-layer-perf-d0e1f2a3',
    auto_destroy: true,
    ttl_hours: 12,
    resources: 14,
    last_deploy: '2026-04-15T22:10:00Z',
    created_at: '2026-04-15T18:00:00Z',
    updated_at: '2026-04-16T06:00:00Z',
  },
]
