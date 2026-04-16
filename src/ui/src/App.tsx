import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Environments from './pages/Environments'
import Deployments from './pages/Deployments'
import Infrastructure from './pages/Infrastructure'
import Monitoring from './pages/Monitoring'
import Settings from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="environments" element={<Environments />} />
          <Route path="deployments" element={<Deployments />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
