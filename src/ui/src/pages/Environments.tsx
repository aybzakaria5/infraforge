import { useState } from 'react'
import { ChevronRight, Plus, X, Box, Network } from 'lucide-react'
import { StatusDot } from '../components/shared/StatusDot'
import { ServiceMap } from '../components/flow/ServiceMap'
import { environments, type Environment } from '../mocks/environments'
import { userMap } from '../mocks/users'
import { relativeTime } from '../lib/time'

const tierBadge: Record<string, string> = {
  small: 'text-text-tertiary bg-bg-tertiary',
  medium: 'text-accent-info bg-accent-info/10',
  large: 'text-accent-neutral bg-accent-neutral/10',
}

function ExpandedRow({ env }: { env: Environment }) {
  const owner = userMap[env.owner_id]
  const [showMap, setShowMap] = useState(false)

  return (
    <tr>
      <td colSpan={7} className="px-0 py-0">
        <div className="bg-bg-primary border-t border-border-default px-4 py-3 flex flex-col gap-3">
          {/* Detail grid */}
          <div className="grid grid-cols-4 gap-4 text-[12px]">
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary uppercase tracking-wide text-[10px]">Namespace</span>
              <span className="font-mono text-text-secondary">{env.namespace}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary uppercase tracking-wide text-[10px]">Owner</span>
              <span className="text-text-secondary">{owner?.name ?? env.owner_id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary uppercase tracking-wide text-[10px]">Auto-Destroy</span>
              <span className="text-text-secondary">
                {env.auto_destroy ? `Enabled · ${env.ttl_hours}h TTL` : 'Disabled'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-text-tertiary uppercase tracking-wide text-[10px]">Environment ID</span>
              <span className="font-mono text-text-tertiary">{env.id}</span>
            </div>
          </div>

          {/* Service topology toggle + graph */}
          {!showMap ? (
            <button
              onClick={(e) => { e.stopPropagation(); setShowMap(true) }}
              className="flex items-center gap-1.5 text-[12px] text-accent-info hover:text-accent-info/80
                transition-colors w-fit"
            >
              <Network size={13} />
              View Service Topology
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-text-tertiary uppercase tracking-wide flex items-center gap-1.5">
                  <Network size={12} />
                  Service Topology
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMap(false) }}
                  className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
                >
                  Hide
                </button>
              </div>
              <ServiceMap envId={env.id} />
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function CreatePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 z-50 h-full w-[380px] bg-bg-secondary border-l border-border-default
        flex flex-col shadow-[−4px_0_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
          <span className="text-[14px] font-medium text-text-primary">New Environment</span>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {/* Name */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Name</span>
            <input
              type="text"
              placeholder="payment-service-staging"
              className="h-8 px-2.5 text-[13px] font-mono rounded-md border border-border-default
                bg-bg-input text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:border-accent-neutral transition-colors"
            />
          </label>

          {/* Template */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Template</span>
            <select className="h-8 px-2 text-[13px] rounded-md border border-border-default
              bg-bg-input text-text-primary focus:outline-none focus:border-accent-neutral transition-colors">
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </label>

          {/* Tier */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Resource Tier</span>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(t => (
                <button
                  key={t}
                  className="h-8 rounded-md border border-border-default bg-bg-tertiary text-[12px]
                    text-text-secondary hover:border-border-hover transition-colors
                    focus:border-accent-neutral focus:outline-none"
                >
                  <div className="flex flex-col items-center">
                    <span className="capitalize">{t}</span>
                  </div>
                </button>
              ))}
            </div>
            <span className="text-[10px] text-text-tertiary">small: 4 resources · medium: 8 · large: 14</span>
          </label>

          {/* Auto-destroy */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-tertiary uppercase tracking-wide">Auto-Destroy</span>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-[12px] text-text-secondary cursor-pointer">
                <input type="checkbox" className="accent-accent-neutral" />
                Enable TTL
              </label>
              <select className="h-7 px-2 text-[12px] rounded-md border border-border-default
                bg-bg-input text-text-secondary focus:outline-none">
                <option value="12">12h</option>
                <option value="24">24h</option>
                <option value="48">48h</option>
                <option value="72">72h</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border-default flex gap-2">
          <button
            className="flex-1 h-8 rounded-md bg-accent-primary text-[13px] font-medium text-bg-primary
              hover:bg-accent-primary/90 transition-colors"
          >
            Create Environment
          </button>
          <button
            onClick={onClose}
            className="h-8 px-3 rounded-md border border-border-default text-[13px]
              text-text-secondary hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

export default function Environments() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id))

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-text-tertiary">
            {environments.length} environments
          </span>
        </div>
        <button
          onClick={() => setPanelOpen(true)}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-accent-primary text-[12px]
            font-medium text-bg-primary hover:bg-accent-primary/90 transition-colors"
        >
          <Plus size={14} />
          New Environment
        </button>
      </div>

      {/* Table */}
      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="w-6 px-2 py-1.5" />
              <th className="text-left px-3 py-1.5 font-normal">Name</th>
              <th className="text-left px-3 py-1.5 font-normal">Status</th>
              <th className="text-left px-3 py-1.5 font-normal">Template</th>
              <th className="text-left px-3 py-1.5 font-normal">Tier</th>
              <th className="text-left px-3 py-1.5 font-normal">Resources</th>
              <th className="text-right px-3 py-1.5 font-normal">Last Deploy</th>
            </tr>
          </thead>
          <tbody>
            {environments.map(env => (
              <>
                <tr
                  key={env.id}
                  onClick={() => toggle(env.id)}
                  className="border-b border-border-default hover:bg-bg-tertiary transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-2 py-1.5 text-center">
                    <ChevronRight
                      size={13}
                      className={`text-text-tertiary transition-transform duration-150
                        ${expandedId === env.id ? 'rotate-90' : ''}`}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="font-mono text-text-primary">{env.name}</span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="inline-flex items-center gap-1.5">
                      <StatusDot status={env.status} />
                      <span className="text-text-secondary">{env.status}</span>
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-text-tertiary">{env.template}</td>
                  <td className="px-3 py-1.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[11px] font-medium ${tierBadge[env.tier]}`}>
                      {env.tier}
                    </span>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="flex items-center gap-1 font-mono text-text-secondary">
                      <Box size={12} className="text-text-tertiary" />
                      {env.resources}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    {env.last_deploy ? (
                      <span className="text-text-tertiary" title={env.last_deploy}>
                        {relativeTime(env.last_deploy)}
                      </span>
                    ) : (
                      <span className="text-text-tertiary">—</span>
                    )}
                  </td>
                </tr>
                {expandedId === env.id && <ExpandedRow key={`${env.id}-exp`} env={env} />}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <CreatePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
