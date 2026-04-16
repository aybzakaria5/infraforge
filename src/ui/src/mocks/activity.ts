export type ActivityType = 'deploy' | 'provision' | 'destroy' | 'scale' | 'alert' | 'config'

export interface ActivityEntry {
  id: string
  type: ActivityType
  message: string
  actor: string
  target: string
  timestamp: string
}

export const activity: ActivityEntry[] = [
  {
    id: 'act-001',
    type: 'deploy',
    message: 'Deployed infraforge-api:v1.4.2 to api-gateway-prod',
    actor: 'Ayoub Zakarya',
    target: 'env-a1b2c3d400000001',
    timestamp: '2026-04-16T07:00:34Z',
  },
  {
    id: 'act-002',
    type: 'provision',
    message: 'Provisioning started for legacy-api-migration',
    actor: 'Ayoub Zakarya',
    target: 'env-a1b2c3d400000008',
    timestamp: '2026-04-16T08:55:00Z',
  },
  {
    id: 'act-003',
    type: 'deploy',
    message: 'Deployed worker:v3.0.0-rc1 to worker-v2-canary (canary 20%)',
    actor: 'Ayoub Zakarya',
    target: 'env-a1b2c3d400000004',
    timestamp: '2026-04-16T08:47:00Z',
  },
  {
    id: 'act-004',
    type: 'deploy',
    message: 'Deployed notif-svc:v1.2.3 to notification-service-qa',
    actor: 'Sarah Chen',
    target: 'env-a1b2c3d400000005',
    timestamp: '2026-04-16T05:16:46Z',
  },
  {
    id: 'act-005',
    type: 'deploy',
    message: 'Deployed auth-service:v2.1.0 to auth-service-staging',
    actor: 'Sarah Chen',
    target: 'env-a1b2c3d400000002',
    timestamp: '2026-04-16T03:51:28Z',
  },
  {
    id: 'act-006',
    type: 'alert',
    message: 'Health check failing for ml-pipeline-experiment — verify stage returned 503',
    actor: 'system',
    target: 'env-a1b2c3d400000007',
    timestamp: '2026-04-14T09:55:12Z',
  },
  {
    id: 'act-007',
    type: 'destroy',
    message: 'Auto-destroy triggered for cache-layer-perf-test (TTL expired)',
    actor: 'system',
    target: 'env-a1b2c3d400000010',
    timestamp: '2026-04-16T06:00:00Z',
  },
  {
    id: 'act-008',
    type: 'scale',
    message: 'Scaled search-indexer-prod from 3 to 5 replicas (CPU > 80%)',
    actor: 'system',
    target: 'env-a1b2c3d400000006',
    timestamp: '2026-04-15T22:15:00Z',
  },
  {
    id: 'act-009',
    type: 'deploy',
    message: 'Deployed search-indexer:v2.0.1 to search-indexer-prod',
    actor: 'Marcus Johnson',
    target: 'env-a1b2c3d400000006',
    timestamp: '2026-04-15T21:02:56Z',
  },
  {
    id: 'act-010',
    type: 'config',
    message: 'Updated Grafana alert thresholds for api-gateway-prod',
    actor: 'Ayoub Zakarya',
    target: 'env-a1b2c3d400000001',
    timestamp: '2026-04-15T16:30:00Z',
  },
  {
    id: 'act-011',
    type: 'deploy',
    message: 'Deployed analytics-dash:v1.0.0-beta.3 to analytics-dashboard-staging',
    actor: 'Sarah Chen',
    target: 'env-a1b2c3d400000009',
    timestamp: '2026-04-15T14:21:12Z',
  },
  {
    id: 'act-012',
    type: 'deploy',
    message: 'Deployed worker:v2.9.8 to worker-v2-canary',
    actor: 'Ayoub Zakarya',
    target: 'env-a1b2c3d400000004',
    timestamp: '2026-04-15T11:06:56Z',
  },
]
