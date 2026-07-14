import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
// Code splitting: cada página só é baixada quando o usuário a acessa.
// Isso reduz drasticamente o tamanho do carregamento inicial da plataforma.
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const LeadsPage = lazy(() => import('@/pages/LeadsPage').then((m) => ({ default: m.LeadsPage })));
const LeadDetailPage = lazy(() => import('@/pages/LeadDetailPage').then((m) => ({ default: m.LeadDetailPage })));
const KanbanPage = lazy(() => import('@/pages/KanbanPage').then((m) => ({ default: m.KanbanPage })));
const DocumentsPage = lazy(() => import('@/pages/DocumentsPage').then((m) => ({ default: m.DocumentsPage })));
const WhatsAppPage = lazy(() => import('@/pages/WhatsAppPage').then((m) => ({ default: m.WhatsAppPage })));
const AIPage = lazy(() => import('@/pages/AIPage').then((m) => ({ default: m.AIPage })));
const TasksPage = lazy(() => import('@/pages/TasksPage').then((m) => ({ default: m.TasksPage })));
const AutomationDashboard = lazy(() => import('@/pages/AutomationDashboard'));
const ReportsPage = lazy(() => import('@/pages/ReportsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
// Indicador exibido enquanto o código da página é baixado
function PageLoader() {
    return (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }, children: [_jsx("div", { style: {
                    width: '40px',
                    height: '40px',
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#1B2559',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                } }), _jsx("style", { children: '@keyframes spin { to { transform: rotate(360deg); } }' })] }));
}
function App() {
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsx(Suspense, { fallback: _jsx(PageLoader, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Layout, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/leads", element: _jsx(Layout, { children: _jsx(LeadsPage, {}) }) }), _jsx(Route, { path: "/leads/:id", element: _jsx(Layout, { children: _jsx(LeadDetailPage, {}) }) }), _jsx(Route, { path: "/kanban", element: _jsx(Layout, { children: _jsx(KanbanPage, {}) }) }), _jsx(Route, { path: "/documentos", element: _jsx(Layout, { children: _jsx(DocumentsPage, {}) }) }), _jsx(Route, { path: "/whatsapp", element: _jsx(Layout, { children: _jsx(WhatsAppPage, {}) }) }), _jsx(Route, { path: "/ai", element: _jsx(Layout, { children: _jsx(AIPage, {}) }) }), _jsx(Route, { path: "/automation", element: _jsx(Layout, { children: _jsx(AutomationDashboard, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(Layout, { children: _jsx(ReportsPage, {}) }) }), _jsx(Route, { path: "/tarefas", element: _jsx(Layout, { children: _jsx(TasksPage, {}) }) }), _jsx(Route, { path: "/perfil", element: _jsx(Layout, { children: _jsx(ProfilePage, {}) }) })] }) }) }) }));
}
export default App;
