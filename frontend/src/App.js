import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { LeadsPage } from '@/pages/LeadsPage';
import { KanbanPage } from '@/pages/KanbanPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { WhatsAppPage } from '@/pages/WhatsAppPage';
import { AIPage } from '@/pages/AIPage';
import AutomationDashboard from '@/pages/AutomationDashboard';
import ReportsPage from '@/pages/ReportsPage';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Layout, { children: _jsx(DashboardPage, {}) }) }), _jsx(Route, { path: "/leads", element: _jsx(Layout, { children: _jsx(LeadsPage, {}) }) }), _jsx(Route, { path: "/kanban", element: _jsx(Layout, { children: _jsx(KanbanPage, {}) }) }), _jsx(Route, { path: "/documentos", element: _jsx(Layout, { children: _jsx(DocumentsPage, {}) }) }), _jsx(Route, { path: "/whatsapp", element: _jsx(Layout, { children: _jsx(WhatsAppPage, {}) }) }), _jsx(Route, { path: "/ai", element: _jsx(Layout, { children: _jsx(AIPage, {}) }) }), _jsx(Route, { path: "/automation", element: _jsx(Layout, { children: _jsx(AutomationDashboard, {}) }) }), _jsx(Route, { path: "/reports", element: _jsx(Layout, { children: _jsx(ReportsPage, {}) }) })] }) }) }));
}
export default App;
