import { useState } from 'react'
import { Key, Users, GitBranch, Bell, Eye, EyeOff, Copy, Trash2, Plus, Check, ExternalLink } from 'lucide-react'
import { StatusDot } from '../components/shared/StatusDot'
import { Timestamp } from '../components/shared/Timestamp'
import { users } from '../mocks/users'

// --- Tabs ---
const tabs = [
  { id: 'api-keys', label: 'API Keys', icon: Key },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'connections', label: 'Connections', icon: GitBranch },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type TabId = (typeof tabs)[number]['id']

// --- API Keys ---
interface ApiKey {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used: string | null
  scopes: string[]
}

const apiKeys: ApiKey[] = [
  {
    id: 'key-001',
    name: 'CI Pipeline',
    prefix: 'ifg_live_a1b2c3',
    created_at: '2026-02-15T10:00:00Z',
    last_used: '2026-04-16T08:30:00Z',
    scopes: ['deployments:write', 'environments:read'],
  },
  {
    id: 'key-002',
    name: 'Monitoring Read-Only',
    prefix: 'ifg_live_d4e5f6',
    created_at: '2026-03-10T14:00:00Z',
    last_used: '2026-04-16T09:01:00Z',
    scopes: ['metrics:read', 'environments:read'],
  },
  {
    id: 'key-003',
    name: 'Local Development',
    prefix: 'ifg_test_x7y8z9',
    created_at: '2026-04-01T09:00:00Z',
    last_used: null,
    scopes: ['*'],
  },
]

function ApiKeysPanel() {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [copied, setCopied] = useState<string | null>(null)

  const toggleReveal = (id: string) => setRevealed(r => ({ ...r, [id]: !r[id] }))
  const handleCopy = (prefix: string, id: string) => {
    navigator.clipboard.writeText(`${prefix}••••••••••••••••`)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-tertiary">{apiKeys.length} keys</span>
        <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-accent-primary text-[12px]
          font-medium text-bg-primary hover:bg-accent-primary/90 transition-colors">
          <Plus size={14} />
          Generate Key
        </button>
      </div>

      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="text-left px-3 py-1.5 font-normal">Name</th>
              <th className="text-left px-3 py-1.5 font-normal">Key</th>
              <th className="text-left px-3 py-1.5 font-normal">Scopes</th>
              <th className="text-right px-3 py-1.5 font-normal">Last Used</th>
              <th className="w-20 px-3 py-1.5 font-normal" />
            </tr>
          </thead>
          <tbody>
            {apiKeys.map(k => (
              <tr key={k.id} className="border-b border-border-default last:border-0 hover:bg-bg-tertiary transition-colors duration-150">
                <td className="px-3 py-1.5 text-text-primary">{k.name}</td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[12px] text-text-secondary">
                      {revealed[k.id] ? `${k.prefix}••••••••••••••••` : `${k.prefix.slice(0, 8)}••••••••`}
                    </span>
                    <button onClick={() => toggleReveal(k.id)} className="text-text-tertiary hover:text-text-secondary transition-colors">
                      {revealed[k.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button onClick={() => handleCopy(k.prefix, k.id)} className="text-text-tertiary hover:text-text-secondary transition-colors">
                      {copied === k.id ? <Check size={12} className="text-accent-primary" /> : <Copy size={12} />}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {k.scopes.map(s => (
                      <span key={s} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-default">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-1.5 text-right text-text-tertiary">
                  {k.last_used ? <Timestamp iso={k.last_used} className="text-text-tertiary" /> : '—'}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <button className="text-text-tertiary hover:text-accent-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Team ---
const roleBadge: Record<string, string> = {
  admin: 'text-accent-warning bg-accent-warning/10',
  member: 'text-accent-info bg-accent-info/10',
  viewer: 'text-text-tertiary bg-bg-tertiary',
}

function TeamPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-tertiary">{users.length} members</span>
        <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-accent-primary text-[12px]
          font-medium text-bg-primary hover:bg-accent-primary/90 transition-colors">
          <Plus size={14} />
          Invite Member
        </button>
      </div>

      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="text-left px-3 py-1.5 font-normal">User</th>
              <th className="text-left px-3 py-1.5 font-normal">Role</th>
              <th className="text-left px-3 py-1.5 font-normal">Status</th>
              <th className="text-right px-3 py-1.5 font-normal">Last Login</th>
              <th className="text-right px-3 py-1.5 font-normal">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-border-default last:border-0 hover:bg-bg-tertiary transition-colors duration-150">
                <td className="px-3 py-1.5">
                  <div className="flex flex-col">
                    <span className="text-text-primary">{u.name}</span>
                    <span className="font-mono text-[11px] text-text-tertiary">{u.email}</span>
                  </div>
                </td>
                <td className="px-3 py-1.5">
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${roleBadge[u.role]}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <StatusDot status={u.active ? 'success' : 'failed'} size={5} />
                    <span className="text-text-secondary text-[12px]">{u.active ? 'Active' : 'Inactive'}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right text-text-tertiary">
                  {u.last_login ? <Timestamp iso={u.last_login} className="text-text-tertiary" /> : '—'}
                </td>
                <td className="px-3 py-1.5 text-right text-text-tertiary">
                  <Timestamp iso={u.created_at} className="text-text-tertiary" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Connections ---
interface Connection {
  id: string
  name: string
  type: 'gitlab' | 'argocd' | 'aws' | 'vault'
  endpoint: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string | null
}

const connections: Connection[] = [
  {
    id: 'conn-001',
    name: 'GitLab CI/CD',
    type: 'gitlab',
    endpoint: 'https://gitlab.infraforge.dev',
    status: 'connected',
    lastSync: '2026-04-16T09:00:00Z',
  },
  {
    id: 'conn-002',
    name: 'ArgoCD',
    type: 'argocd',
    endpoint: 'https://argocd.infraforge.dev',
    status: 'connected',
    lastSync: '2026-04-16T08:55:00Z',
  },
  {
    id: 'conn-003',
    name: 'AWS Account',
    type: 'aws',
    endpoint: 'us-east-1 · 123456789012',
    status: 'connected',
    lastSync: '2026-04-16T08:30:00Z',
  },
  {
    id: 'conn-004',
    name: 'HashiCorp Vault',
    type: 'vault',
    endpoint: 'https://vault.infraforge.dev',
    status: 'disconnected',
    lastSync: '2026-04-12T14:20:00Z',
  },
]

const connStatusStyle: Record<string, string> = {
  connected: 'success',
  disconnected: 'warning',
  error: 'failed',
}

function ConnectionsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[12px] text-text-tertiary">{connections.length} integrations</span>

      <div className="flex flex-col gap-2">
        {connections.map(c => (
          <div key={c.id} className="flex items-center justify-between px-3 py-2.5 border border-border-default
            rounded-md bg-bg-secondary hover:border-border-hover transition-colors">
            <div className="flex items-center gap-3">
              <StatusDot status={connStatusStyle[c.status] as 'success' | 'warning' | 'failed'} size={6} />
              <div className="flex flex-col">
                <span className="text-[13px] text-text-primary">{c.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] text-text-tertiary">{c.endpoint}</span>
                  <ExternalLink size={10} className="text-text-tertiary" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              {c.lastSync && (
                <span className="text-text-tertiary flex items-center gap-1">
                  Synced <Timestamp iso={c.lastSync} />
                </span>
              )}
              <button className="px-2 py-1 rounded border border-border-default text-[11px] text-text-secondary
                hover:bg-bg-tertiary transition-colors">
                {c.status === 'connected' ? 'Reconfigure' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Notifications ---
interface NotifChannel {
  id: string
  type: 'slack' | 'email' | 'webhook'
  target: string
  events: string[]
  enabled: boolean
}

const notifChannels: NotifChannel[] = [
  {
    id: 'notif-001',
    type: 'slack',
    target: '#infraforge-alerts',
    events: ['deployment.failed', 'alert.firing', 'environment.destroyed'],
    enabled: true,
  },
  {
    id: 'notif-002',
    type: 'email',
    target: 'oncall@infraforge.dev',
    events: ['alert.firing', 'alert.resolved'],
    enabled: true,
  },
  {
    id: 'notif-003',
    type: 'webhook',
    target: 'https://hooks.infraforge.dev/pagerduty',
    events: ['alert.firing'],
    enabled: false,
  },
]

function NotificationsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-text-tertiary">{notifChannels.length} channels</span>
        <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-accent-primary text-[12px]
          font-medium text-bg-primary hover:bg-accent-primary/90 transition-colors">
          <Plus size={14} />
          Add Channel
        </button>
      </div>

      <div className="border border-border-default rounded-md bg-bg-secondary overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-default text-text-tertiary text-[11px] uppercase tracking-wide">
              <th className="text-left px-3 py-1.5 font-normal">Type</th>
              <th className="text-left px-3 py-1.5 font-normal">Target</th>
              <th className="text-left px-3 py-1.5 font-normal">Events</th>
              <th className="text-right px-3 py-1.5 font-normal">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {notifChannels.map(ch => (
              <tr key={ch.id} className="border-b border-border-default last:border-0 hover:bg-bg-tertiary transition-colors duration-150">
                <td className="px-3 py-1.5">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium text-accent-info bg-accent-info/10">
                    {ch.type}
                  </span>
                </td>
                <td className="px-3 py-1.5 font-mono text-text-secondary text-[12px]">{ch.target}</td>
                <td className="px-3 py-1.5">
                  <div className="flex flex-wrap gap-1">
                    {ch.events.map(e => (
                      <span key={e} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-tertiary border border-border-default">
                        {e}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-1.5 text-right">
                  <span className={`inline-block w-2 h-2 rounded-full ${ch.enabled ? 'bg-accent-primary' : 'bg-border-default'}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Main ---
export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('api-keys')

  return (
    <div className="flex flex-col gap-3">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 border-b border-border-default">
        {tabs.map(t => {
          const Icon = t.icon
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] transition-colors border-b-2 -mb-px
                ${active
                  ? 'border-accent-primary text-text-primary'
                  : 'border-transparent text-text-tertiary hover:text-text-secondary'
                }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'api-keys' && <ApiKeysPanel />}
      {activeTab === 'team' && <TeamPanel />}
      {activeTab === 'connections' && <ConnectionsPanel />}
      {activeTab === 'notifications' && <NotificationsPanel />}
    </div>
  )
}
