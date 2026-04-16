export interface MetricPoint {
  time: string
  value: number
}

export interface LatencyPoint {
  time: string
  p50: number
  p95: number
  p99: number
}

// last 24 hours in 1h intervals
function hoursAgo(h: number): string {
  const d = new Date('2026-04-16T09:00:00Z')
  d.setHours(d.getHours() - h)
  return d.toISOString()
}

export const latencyData: LatencyPoint[] = Array.from({ length: 24 }, (_, i) => {
  const h = 23 - i
  const base = 42 + Math.sin(i * 0.5) * 8
  return {
    time: hoursAgo(h),
    p50: Math.round(base * 10) / 10,
    p95: Math.round((base * 2.1 + Math.random() * 15) * 10) / 10,
    p99: Math.round((base * 3.4 + Math.random() * 30) * 10) / 10,
  }
})

export const errorRateData: MetricPoint[] = Array.from({ length: 24 }, (_, i) => {
  const h = 23 - i
  let value = 0.12 + Math.random() * 0.08
  // spike at hour 14 (the ml-pipeline failure)
  if (i === 14) value = 2.34
  if (i === 15) value = 0.87
  return {
    time: hoursAgo(h),
    value: Math.round(value * 100) / 100,
  }
})

export const podCountData: MetricPoint[] = Array.from({ length: 24 }, (_, i) => {
  const h = 23 - i
  const base = 28
  // slight ramp during business hours
  const offset = i >= 8 && i <= 20 ? 6 : 0
  return {
    time: hoursAgo(h),
    value: base + offset + Math.floor(Math.random() * 3),
  }
})

export const requestRateData: MetricPoint[] = Array.from({ length: 24 }, (_, i) => {
  const h = 23 - i
  const base = i >= 8 && i <= 20 ? 320 : 85
  return {
    time: hoursAgo(h),
    value: Math.round(base + Math.random() * 60),
  }
})

export const clusterMetrics = {
  cpu_usage: 62.4,
  cpu_total: 100,
  memory_usage: 14.8,
  memory_total: 24,
  memory_unit: 'GiB',
  pod_count: 34,
  pod_capacity: 110,
  node_count: 3,
  storage_usage: 128,
  storage_total: 500,
  storage_unit: 'GiB',
}

export const dashboardMetrics = {
  total_environments: 10,
  active_deployments: 1,
  cluster_health: 99.7,
  avg_deploy_time: 118.4,
  success_rate: 87.5,
}
