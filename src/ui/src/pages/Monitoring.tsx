import { useMemo, useState, useEffect } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from 'recharts'
import { AlertTriangle, Bell, CheckCircle2, XCircle } from 'lucide-react'
import { StatusDot } from '../components/shared/StatusDot'
import { Timestamp } from '../components/shared/Timestamp'
import { ChartSkeleton, TableSkeleton } from '../components/shared/Skeleton'
import {
  latencyData,
  errorRateData,
  podCountData,
  requestRateData,
  type LatencyPoint,
  type MetricPoint,
} from '../mocks/metrics'

function formatHour(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCHours().toString().padStart(2, '0')}:00`
}

// Shared tooltip styling
function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-secondary border border-border-default rounded px-2.5 py-1.5 text-[11px] shadow-md">
      <div className="font-mono text-text-tertiary mb-1">{formatHour(label as string)}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-text-secondary">{p.dataKey}</span>
          <span className="font-mono text-text-primary ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

const gridStroke = '#1c1c1f'
const axisStyle = { fontSize: 10, fill: '#71717a', fontFamily: 'JetBrains Mono, monospace' }

function LatencyChart({ data }: { data: LatencyPoint[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Request Latency (ms)</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-primary inline-block rounded" /> p50</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-info inline-block rounded" /> p95</span>
          <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-accent-warning inline-block rounded" /> p99</span>
        </div>
      </div>
      <div className="h-[200px] border border-border-default rounded-md bg-bg-secondary p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatHour} tick={axisStyle} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={36} domain={['auto', 'auto']} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="p99" stroke="#eab308" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ErrorRateChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Error Rate (%)</span>
      <div className="h-[200px] border border-border-default rounded-md bg-bg-secondary p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatHour} tick={axisStyle} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={36} domain={[0, 'auto']} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PodCountChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Pod Count</span>
      <div className="h-[200px] border border-border-default rounded-md bg-bg-secondary p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatHour} tick={axisStyle} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={36} domain={[0, 'auto']} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="stepAfter" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.08} strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function RequestRateChart({ data }: { data: MetricPoint[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Request Rate (req/s)</span>
      <div className="h-[200px] border border-border-default rounded-md bg-bg-secondary p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tickFormatter={formatHour} tick={axisStyle} axisLine={false} tickLine={false} interval={3} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- Alert rules ---
interface AlertRule {
  id: string
  name: string
  severity: 'critical' | 'warning' | 'info'
  condition: string
  status: 'firing' | 'pending' | 'inactive'
  lastFired: string | null
}

const alertRules: AlertRule[] = [
  {
    id: 'alert-001',
    name: 'HighErrorRate',
    severity: 'critical',
    condition: 'error_rate > 5% for 5m',
    status: 'inactive',
    lastFired: '2026-04-14T11:32:00Z',
  },
  {
    id: 'alert-002',
    name: 'PodCrashLooping',
    severity: 'critical',
    condition: 'restart_count > 3 in 10m',
    status: 'inactive',
    lastFired: '2026-04-13T08:15:00Z',
  },
  {
    id: 'alert-003',
    name: 'HighP99Latency',
    severity: 'warning',
    condition: 'p99_latency > 500ms for 5m',
    status: 'pending',
    lastFired: null,
  },
  {
    id: 'alert-004',
    name: 'DiskPressure',
    severity: 'warning',
    condition: 'disk_usage > 85% for 10m',
    status: 'inactive',
    lastFired: '2026-04-10T16:45:00Z',
  },
  {
    id: 'alert-005',
    name: 'NodeNotReady',
    severity: 'critical',
    condition: 'node_status != Ready for 3m',
    status: 'inactive',
    lastFired: null,
  },
  {
    id: 'alert-006',
    name: 'HighMemoryUsage',
    severity: 'warning',
    condition: 'memory_usage > 90% for 5m',
    status: 'inactive',
    lastFired: '2026-04-15T22:10:00Z',
  },
  {
    id: 'alert-007',
    name: 'CertificateExpiringSoon',
    severity: 'info',
    condition: 'cert_expiry < 14d',
    status: 'inactive',
    lastFired: null,
  },
  {
    id: 'alert-008',
    name: 'DeploymentReplicasMismatch',
    severity: 'warning',
    condition: 'desired != available for 5m',
    status: 'firing',
    lastFired: '2026-04-16T08:42:00Z',
  },
]

const severityStyle: Record<string, string> = {
  critical: 'text-accent-danger bg-accent-danger/10',
  warning: 'text-accent-warning bg-accent-warning/10',
  info: 'text-accent-info bg-accent-info/10',
}

const statusMap: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  firing: { icon: XCircle, color: 'text-accent-danger' },
  pending: { icon: AlertTriangle, color: 'text-accent-warning' },
  inactive: { icon: CheckCircle2, color: 'text-text-tertiary' },
}

function AlertsTable({ rules, loading }: { rules: AlertRule[]; loading: boolean }) {
  const sorted = useMemo(() => {
    const order = { firing: 0, pending: 1, inactive: 2 }
    return [...rules].sort((a, b) => order[a.status] - order[b.status])
  }, [rules])

  const firingCount = rules.filter(r => r.status === 'firing').length
  const pendingCount = rules.filter(r => r.status === 'pending').length

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={13} className="text-text-tertiary" />
          <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Alert Rules</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {firingCount > 0 && (
            <span className="flex items-center gap-1 text-accent-danger">
              <StatusDot status="failed" size={5} pulse />
              {firingCount} firing
            </span>
          )}
          {pendingCount > 0 && (
            <span className="flex items-center gap-1 text-accent-warning">
              <StatusDot status="warning" size={5} />
              {pendingCount} pending
            </span>
          )}
          <span className="text-text-tertiary">{rules.length} rules</span>
        </div>
      </div>

      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="text-left px-3 py-1.5 font-normal">Status</th>
              <th className="text-left px-3 py-1.5 font-normal">Name</th>
              <th className="text-left px-3 py-1.5 font-normal">Severity</th>
              <th className="text-left px-3 py-1.5 font-normal">Condition</th>
              <th className="text-right px-3 py-1.5 font-normal">Last Fired</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <TableSkeleton rows={5} cols={5} /> : sorted.map(rule => {
              const st = statusMap[rule.status]
              const StIcon = st.icon
              return (
                <tr
                  key={rule.id}
                  className="border-b border-border-default last:border-0 hover:bg-bg-tertiary transition-colors duration-150"
                >
                  <td className="px-3 py-1.5">
                    <span className={`flex items-center gap-1.5 text-[11px] ${st.color}`}>
                      <StIcon size={13} />
                      {rule.status}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-text-primary">{rule.name}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${severityStyle[rule.severity]}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-[12px] text-text-tertiary">{rule.condition}</td>
                  <td className="px-3 py-1.5 text-right text-text-tertiary">
                    {rule.lastFired ? (
                      <Timestamp iso={rule.lastFired} className="text-text-tertiary" />
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Monitoring() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-[13px] text-text-tertiary">Last 24 hours · 1h intervals</span>

      {/* Charts grid: 2×2 on large, stacked on small */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {loading ? (
          <>
            <ChartSkeleton height={240} />
            <ChartSkeleton height={240} />
            <ChartSkeleton height={240} />
            <ChartSkeleton height={240} />
          </>
        ) : (
          <>
            <LatencyChart data={latencyData} />
            <ErrorRateChart data={errorRateData} />
            <PodCountChart data={podCountData} />
            <RequestRateChart data={requestRateData} />
          </>
        )}
      </div>

      {/* Alert rules */}
      <AlertsTable rules={alertRules} loading={loading} />
    </div>
  )
}
