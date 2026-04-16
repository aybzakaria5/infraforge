import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Rocket,
  Network,
  Activity,
  Settings,
  Anvil,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/environments', icon: Server, label: 'Environments' },
  { to: '/deployments', icon: Rocket, label: 'Deployments' },
  { to: '/infrastructure', icon: Network, label: 'Infrastructure' },
  { to: '/monitoring', icon: Activity, label: 'Monitoring' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ width: expanded ? 220 : 48, transition: 'width 200ms ease-out' }}
      className="fixed top-0 left-0 h-screen z-50 flex flex-col
        border-r border-border-default bg-bg-secondary overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-12 px-3 border-b border-border-default shrink-0">
        <Anvil size={20} className="text-accent-primary shrink-0" />
        <span
          className="ml-2.5 text-sm font-medium text-text-primary whitespace-nowrap"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 150ms ease-out',
            transitionDelay: expanded ? '50ms' : '0ms',
          }}
        >
          InfraForge
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 py-2 px-1.5 overflow-hidden">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center h-9 rounded-md transition-colors duration-150 shrink-0
              ${expanded ? 'px-2.5' : 'px-0 justify-center'}
              ${isActive
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span
              className="ml-2.5 text-[13px] whitespace-nowrap"
              style={{
                opacity: expanded ? 1 : 0,
                width: expanded ? 'auto' : 0,
                overflow: 'hidden',
                transition: 'opacity 150ms ease-out',
                transitionDelay: expanded ? '50ms' : '0ms',
              }}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border-default shrink-0">
        <span
          className="text-[11px] font-mono text-text-tertiary whitespace-nowrap"
          style={{
            opacity: expanded ? 1 : 0,
            transition: 'opacity 150ms ease-out',
            transitionDelay: expanded ? '50ms' : '0ms',
          }}
        >
          v0.1.0
        </span>
      </div>
    </aside>
  )
}
