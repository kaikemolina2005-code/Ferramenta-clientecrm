import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'

// Code splitting: cada página só é baixada quando o usuário a acessa.
// Isso reduz drasticamente o tamanho do carregamento inicial da plataforma.
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const LeadsPage = lazy(() => import('@/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })))
const LeadDetailPage = lazy(() => import('@/pages/LeadDetailPage').then((m) => ({ default: m.LeadDetailPage })))
const KanbanPage = lazy(() => import('@/pages/KanbanPage').then((m) => ({ default: m.KanbanPage })))
const WhatsAppPage = lazy(() => import('@/pages/WhatsAppPage').then((m) => ({ default: m.WhatsAppPage })))
const AIPage = lazy(() => import('@/pages/AIPage').then((m) => ({ default: m.AIPage })))
const TasksPage = lazy(() => import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })))
const AutomationDashboard = lazy(() => import('@/pages/AutomationDashboard'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))

// Indicador exibido enquanto o código da página é baixado
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTopColor: '#1B2559',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/leads"
              element={
                <Layout>
                  <LeadsPage />
                </Layout>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <Layout>
                  <LeadDetailPage />
                </Layout>
              }
            />
            <Route
              path="/kanban"
              element={
                <Layout>
                  <KanbanPage />
                </Layout>
              }
            />
            <Route
              path="/whatsapp"
              element={
                <Layout>
                  <WhatsAppPage />
                </Layout>
              }
            />
            <Route
              path="/ai"
              element={
                <Layout>
                  <AIPage />
                </Layout>
              }
            />
            <Route
              path="/automation"
              element={
                <Layout>
                  <AutomationDashboard />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <Layout>
                  <ReportsPage />
                </Layout>
              }
            />
            <Route
              path="/tarefas"
              element={
                <Layout>
                  <TasksPage />
                </Layout>
              }
            />
            <Route
              path="/perfil"
              element={
                <Layout>
                  <ProfilePage />
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
