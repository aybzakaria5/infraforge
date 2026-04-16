import { useState, useEffect } from 'react'
import {
  Server,
  Rocket,
  Heart,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Trash2,
  Scale,
  Settings2,
  GitCommit,
} from 'lucide-react'
import { MetricTile } from '../components/shared/MetricTile'
import { StatusDot } from '../components/shared/StatusDot'
import { Timestamp } from '../components/shared/Timestamp'
import { MetricSkeleton, TableSkeleton } from '../components/shared/Skeleton'
import { dashboardMetrics, clusterMetrics } from '../mocks/metrics'
import { deployments } from '../mocks/deployments'
import { activity, type ActivityType } from '../mocks/activity'
import { formatDuration } from '../lib/time'

const statusStyle: Record<string, string> = {
  success: 'text-accent-primary bg-accent-primary/10 shadow-[0_0_8px_rgba(34,197,94,0.2)]',
  running: 'text-accent-info bg-accent-info/10 shadow-[0_0_8px_rgba(59,130,246,0.2)]',
  pending: 'text-accent-info bg-accent-info/10',
  failed: 'text-accent-danger bg-accent-danger/10 shadow-[0_0_8px_rgba(239,68,68,0.2)]',
  rollback: 'text-accent-warning bg-accent-warning/10 shadow-[0_0_8px_rgba(234,179,8,0.2)]',
}

const activityIcon: Record<ActivityType, typeof Rocket> = {
  deploy: Rocket,
  provision: Server,
  destroy: Trash2,
  scale: Scale,
  alert: AlertTriangle,
  config: Settings2,
}

function UsageBar({ label, used, total, unit }: { label: string; used: number; total: number; unit?: string }) {
  const pct = Math.round((used / total) * 100)
  const color = pct > 85 ? 'bg-accent-danger' : pct > 70 ? 'bg-accent-warning' : 'bg-accent-primary'

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-text-tertiary">{label}</span>
        <span className="font-mono text-text-secondary">
          {used}{unit && ` ${unit}`}
          <span className="text-text-tertiary"> / {total}{unit && ` ${unit}`}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-border-default overflow-hidden">
        <div className={`h-full rounded-full ${color} bar-shimmer transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const recentDeploys = deployments.slice(0, 8)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 5 }, (_, i) => <MetricSkeleton key={i} />)}
        </div>
        <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
          <div className="px-3 py-2 border-b border-border-default">
            <div className="h-3 w-32 rounded bg-bg-tertiary animate-pulse" />
          </div>
          <table className="w-full"><tbody><TableSkeleton rows={6} cols={6} /></tbody></table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Metric tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <MetricTile label="Environments" value={dashboardMetrics.total_environments} accent="var(--color-accent-primary)" />
        <MetricTile label="Active Deploys" value={dashboardMetrics.active_deployments} accent="var(--color-accent-info)" />
        <MetricTile label="Cluster Health" value={`${dashboardMetrics.cluster_health}%`} accent="var(--color-accent-primary)" />
        <MetricTile label="Avg Deploy Time" value={formatDuration(dashboardMetrics.avg_deploy_time)} accent="var(--color-accent-neutral)" />
        <MetricTile label="Success Rate" value={`${dashboardMetrics.success_rate}%`} accent="var(--color-accent-warning)" />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Deployments table */}
        <div className="xl:col-span-8 border border-border-default rounded-md bg-bg-secondary overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
            <span className="text-[13px] font-medium text-text-primary">Recent Deployments</span>
            <span className="text-[11px] text-text-tertiary">{deployments.length} total</span>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
                <th className="text-left px-3 py-1.5 font-normal">Status</th>
                <th className="text-left px-3 py-1.5 font-normal">Environment</th>
                <th className="text-left px-3 py-1.5 font-normal">Commit</th>
                <th className="text-left px-3 py-1.5 font-normal">Strategy</th>
                <th className="text-right px-3 py-1.5 font-normal">Duration</th>
                <th className="text-right px-3 py-1.5 font-normal">When</th>
              </tr>
            </thead>
            <tbody>
              {recentDeploys.map(d => (
                <tr key={d.id} className="border-b border-border-default last:border-0 hover:bg-bg-tertiary transition-colors duration-100 cursor-pointer">
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${statusStyle[d.status] || ''}`}>
                      <StatusDot status={d.status} size={5} />
                      {d.status}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-text-primary">{d.environment_name}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-text-secondary">{d.commit_sha.slice(0, 7)}</span>
                      <span className="text-[11px] text-text-tertiary truncate max-w-[200px]">{d.commit_message}</span>
                    </div>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="text-text-tertiary">{d.strategy}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <span className="font-mono text-text-secondary">
                      {d.duration_sec > 0 ? formatDuration(d.duration_sec) : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <Timestamp iso={d.created_at} className="text-text-tertiary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Side panel */}
        <div className="xl:col-span-4 flex flex-col gap-3">
          {/* Cluster resources */}
          <div className="border border-border-default rounded-md bg-bg-secondary p-3 flex flex-col gap-2.5">
            <span className="text-[13px] font-medium text-text-primary">Cluster Resources</span>
            <UsageBar label="CPU" used={clusterMetrics.cpu_usage} total={clusterMetrics.cpu_total} unit="%" />
            <UsageBar label="Memory" used={clusterMetrics.memory_usage} total={clusterMetrics.memory_total} unit={clusterMetrics.memory_unit} />
            <UsageBar label="Pods" used={clusterMetrics.pod_count} total={clusterMetrics.pod_capacity} />
            <UsageBar label="Storage" used={clusterMetrics.storage_usage} total={clusterMetrics.storage_total} unit={clusterMetrics.storage_unit} />
            <div className="flex items-center justify-between pt-1 border-t border-border-default">
              <span className="text-[11px] text-text-tertiary">Nodes</span>
              <span className="text-[13px] font-mono text-text-secondary">{clusterMetrics.node_count}</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="border border-border-default rounded-md bg-bg-secondary p-3 flex flex-col gap-2">
            <span className="text-[13px] font-medium text-text-primary">Pipeline Stats (24h)</span>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-text-tertiary">
                <CheckCircle2 size={13} className="text-accent-primary" /> Succeeded
              </span>
              <span className="font-mono text-text-secondary">7</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-text-tertiary">
                <AlertTriangle size={13} className="text-accent-danger" /> Failed
              </span>
              <span className="font-mono text-text-secondary">1</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-1.5 text-text-tertiary">
                <Clock size={13} className="text-accent-info" /> In Progress
              </span>
              <span className="font-mono text-text-secondary">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border-default">
          <span className="text-[13px] font-medium text-text-primary">Recent Activity</span>
        </div>
        <div className="divide-y divide-border-default">
          {activity.slice(0, 10).map(entry => {
            const Icon = activityIcon[entry.type] || GitCommit
            return (
              <div key={entry.id} className="group flex items-start gap-2.5 px-3 py-2 hover:bg-bg-tertiary transition-colors duration-100 cursor-pointer">
                <Icon size={14} className="mt-0.5 text-text-tertiary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-text-secondary truncate">{entry.message}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-text-tertiary">{entry.actor}</span>
                    <Timestamp iso={entry.timestamp} className="text-[11px] text-text-tertiary" />
                  </div>
                </div>
                <ArrowUpRight size={12} className="text-text-tertiary shrink-0 mt-0.5 transition-transform duration-150 group-hover:translate-x-0.5" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
