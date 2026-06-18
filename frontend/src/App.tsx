import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { KanbanPage } from '@/pages/KanbanPage'
import { DocumentsPage } from '@/pages/DocumentsPage'
import { WhatsAppPage } from '@/pages/WhatsAppPage'
import { AIPage } from '@/pages/AIPage'
import { TasksPage } from '@/pages/TasksPage'
import AutomationDashboard from '@/pages/AutomationDashboard'
import ReportsPage from '@/pages/ReportsPage'

function App() {
  return (
    <AuthProvider>
      <Router>
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
            path="/kanban"
            element={
              <Layout>
                <KanbanPage />
              </Layout>
            }
          />
          <Route
            path="/documentos"
            element={
              <Layout>
                <DocumentsPage />
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
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
