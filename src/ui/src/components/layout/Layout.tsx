import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Breadcrumbs } from './Breadcrumbs'
import { ThemeToggle } from './ThemeToggle'
import { useTheme } from '../../hooks/useTheme'

export function Layout() {
  const { theme, toggle } = useTheme()

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main content — offset by collapsed sidebar width */}
      <div className="flex-1 ml-12">
        {/* Header bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-10 px-4
          border-b border-border-default bg-bg-primary/80 backdrop-blur-sm">
          <Breadcrumbs />
          <ThemeToggle theme={theme} onToggle={toggle} />
        </header>

        {/* Page content */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
