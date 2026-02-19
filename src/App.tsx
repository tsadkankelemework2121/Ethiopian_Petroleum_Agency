import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/DashboardPage'
import DepotsPage from './pages/DepotsPage'
import FuelDispatchPage from './pages/FuelDispatchPage'
import OilCompaniesPage from './pages/OilCompaniesPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import TrackingPage from './pages/TrackingPage'
import TransportersPage from './pages/TransportersPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/fuel-dispatch" element={<FuelDispatchPage />} />
        <Route path="/reports" element={<ReportsPage />} />

        <Route path="/entities">
          <Route index element={<Navigate to="/entities/oil-companies" replace />} />
          <Route path="oil-companies" element={<OilCompaniesPage />} />
          <Route path="transporters" element={<TransportersPage />} />
          <Route path="depots" element={<DepotsPage />} />
        </Route>

        <Route path="/settings" element={<SettingsPage />} />
       
      </Route>
    </Routes>
  )
}
