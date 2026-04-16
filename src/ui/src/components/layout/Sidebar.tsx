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
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-border-default
        bg-bg-secondary transition-[width] duration-150 ease-out
        ${expanded ? 'w-[220px]' : 'w-12'}`}
    >
      {/* Logo */}
      <div className="flex items-center h-12 px-3 border-b border-border-default shrink-0">
        <Anvil size={20} className="text-accent-primary shrink-0" />
        <span
          className={`ml-2.5 text-sm font-medium text-text-primary whitespace-nowrap overflow-hidden
            transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}
        >
          InfraForge
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 py-2 px-1.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center h-9 rounded-md transition-colors duration-150 group
              ${expanded ? 'px-2.5' : 'px-0 justify-center'}
              ${isActive
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary'
              }`
            }
          >
            <Icon size={18} className="shrink-0" />
            <span
              className={`ml-2.5 text-[13px] whitespace-nowrap overflow-hidden
                transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0 w-0'}`}
            >
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border-default">
        <span
          className={`text-[11px] font-mono text-text-tertiary whitespace-nowrap overflow-hidden
            transition-opacity duration-150 ${expanded ? 'opacity-100' : 'opacity-0'}`}
        >
          v0.1.0
        </span>
      </div>
    </aside>
  )
}
