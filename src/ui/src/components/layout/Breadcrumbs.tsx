import { useLocation, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const labelMap: Record<string, string> = {
  '': 'Dashboard',
  environments: 'Environments',
  deployments: 'Deployments',
  infrastructure: 'Infrastructure',
  monitoring: 'Monitoring',
  settings: 'Settings',
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[13px] text-text-tertiary">
        <span className="text-text-secondary">Dashboard</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <Link to="/" className="text-text-tertiary hover:text-text-secondary transition-colors duration-150">
        Dashboard
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = labelMap[seg] || seg

        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-text-tertiary" />
            {isLast ? (
              <span className="text-text-secondary">{label}</span>
            ) : (
              <Link to={path} className="text-text-tertiary hover:text-text-secondary transition-colors duration-150">
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </div>
  )
}
