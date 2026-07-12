import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import azAZ from 'antd/locale/az_AZ'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLayout } from './layouts/AdminLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { SiteSettingsPage } from './pages/SiteSettingsPage'
import { MediaPage } from './pages/MediaPage'
import { NavigationPage } from './pages/NavigationPage'
import { TeamPage } from './pages/TeamPage'
import { ServicesPage } from './pages/ServicesPage'
import { StatsPage } from './pages/StatsPage'
import { PartnersPage } from './pages/PartnersPage'
import { WhyUsPage } from './pages/WhyUsPage'
import { BlogPage } from './pages/BlogPage'
import { AcademyPage } from './pages/AcademyPage'
import { InquiriesPage } from './pages/InquiriesPage'

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth()
  if (loading) return null
  if (session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <ConfigProvider
      locale={azAZ}
      theme={{
        token: {
          colorPrimary: '#c9a227',
          borderRadius: 8,
          fontFamily: 'Inter, system-ui, sans-serif',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnly>
                  <LoginPage />
                </PublicOnly>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/settings" element={<SiteSettingsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/navigation" element={<NavigationPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/why-us" element={<WhyUsPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/academy" element={<AcademyPage />} />
              <Route path="/inquiries" element={<InquiriesPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}
