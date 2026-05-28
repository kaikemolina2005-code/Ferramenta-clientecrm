import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { NotificationsContainer } from './NotificationsContainer';
import useSocket from '@/hooks/useSocket';
import { ADVGDLogo } from './Logo';
import { designSystem } from '@/theme/designSystem';
export function Layout({ children }) {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { onNotification, onDocumentAnalyzed, onDocumentProcessingCompleted, onDocumentProcessingError } = useSocket();
    // Setup notification listeners
    useEffect(() => {
        const unsubscribe = onNotification((notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [onNotification]);
    useEffect(() => {
        const unsubscribe = onDocumentAnalyzed((data) => {
            setNotifications((prev) => [
                {
                    type: 'success',
                    title: '📄 Documento Analisado',
                    message: `Documento classificado como ${data.classification} com ${(data.confidence * 100).toFixed(0)}% de confiança`,
                    timestamp: new Date(),
                    id: `${Date.now()}-doc-analyzed`,
                },
                ...prev,
            ]);
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [onDocumentAnalyzed]);
    useEffect(() => {
        const unsubscribe = onDocumentProcessingCompleted((data) => {
            setNotifications((prev) => [
                {
                    type: 'success',
                    title: '✅ Processamento Completo',
                    message: `${data.successCount}/${data.processedCount} documentos processados com sucesso`,
                    timestamp: new Date(),
                    id: `${Date.now()}-processing-complete`,
                },
                ...prev,
            ]);
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [onDocumentProcessingCompleted]);
    useEffect(() => {
        const unsubscribe = onDocumentProcessingError((data) => {
            setNotifications((prev) => [
                {
                    type: 'error',
                    title: '❌ Erro no Processamento',
                    message: data.error || 'Erro ao processar documentos',
                    timestamp: new Date(),
                    id: `${Date.now()}-processing-error`,
                },
                ...prev,
            ]);
        });
        return () => {
            if (unsubscribe)
                unsubscribe();
        };
    }, [onDocumentProcessingError]);
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };
    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex h-screen", style: { backgroundColor: designSystem.colors.neutral.light }, children: [_jsxs("div", { className: "md:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-md flex items-center px-4 z-50", children: [_jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "text-2xl", style: { color: designSystem.colors.primary.dark }, children: "\u2630" }), _jsx("h2", { className: "ml-4 font-bold", style: { color: designSystem.colors.primary.dark }, children: "ADVGD CRM" })] }), sidebarOpen && (_jsx("div", { className: "md:hidden fixed inset-0 bg-black bg-opacity-50 z-30", onClick: () => setSidebarOpen(false) })), _jsxs("aside", { className: `w-64 shadow-xl flex flex-col fixed md:relative h-full z-40 md:z-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`, style: {
                            backgroundColor: designSystem.colors.primary.dark,
                            borderRight: `3px solid ${designSystem.colors.accent.gold}`,
                            top: 0,
                            left: 0
                        }, children: [_jsxs("div", { className: "p-6 border-b", style: {
                                    borderColor: designSystem.colors.accent.gold,
                                    background: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)'
                                }, children: [_jsx(ADVGDLogo, { size: "small", variant: "icon", showText: false, className: "mb-3" }), _jsx("h1", { className: "text-2xl font-bold font-poppins", style: { color: designSystem.colors.neutral.white }, children: "ADVGD CRM" }), _jsx("p", { className: "text-sm mt-1", style: { color: designSystem.colors.accent.light }, children: "Diego Patr\u00EDcio Advogado" })] }), _jsxs("nav", { className: "mt-6 flex-1 px-3 space-y-2", children: [_jsxs(Link, { to: "/dashboard", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all", style: {
                                            color: designSystem.colors.neutral.white,
                                            backgroundColor: 'rgba(201, 169, 97, 0.15)',
                                            borderLeft: `3px solid ${designSystem.colors.accent.gold}`
                                        }, onClick: () => setSidebarOpen(false), onMouseEnter: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(201, 169, 97, 0.25)';
                                        }, onMouseLeave: (e) => {
                                            e.currentTarget.style.backgroundColor = 'rgba(201, 169, 97, 0.15)';
                                        }, children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDCCA" }), _jsx("span", { children: "Dashboard" })] }), _jsxs(Link, { to: "/leads", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDC65" }), _jsx("span", { children: "Leads" })] }), _jsxs(Link, { to: "/kanban", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDCCB" }), _jsx("span", { children: "Kanban" })] }), _jsxs(Link, { to: "/automation", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\u2699\uFE0F" }), _jsx("span", { children: "Automa\u00E7\u00F5es" })] }), _jsxs(Link, { to: "/reports", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDCC8" }), _jsx("span", { children: "Relat\u00F3rios" })] }), _jsxs(Link, { to: "/documentos", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDCC4" }), _jsx("span", { children: "Documentos" })] }), _jsxs(Link, { to: "/whatsapp", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83D\uDCAC" }), _jsx("span", { children: "WhatsApp" })] }), _jsxs(Link, { to: "/ai", className: "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-white hover:bg-opacity-10", style: { color: designSystem.colors.neutral.white }, onClick: () => setSidebarOpen(false), children: [_jsx("span", { className: "mr-3", children: "\uD83E\uDDE0" }), _jsx("span", { children: "IA Documents" })] })] }), _jsx("div", { className: "border-t p-4", style: { borderColor: designSystem.colors.accent.gold }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-semibold", style: { color: designSystem.colors.neutral.white }, children: user?.name }), _jsx("p", { className: "text-xs", style: { color: designSystem.colors.accent.light }, children: user?.role })] }), _jsx("button", { onClick: handleLogout, className: "ml-2 px-3 py-1 text-xs font-medium rounded transition-all", style: {
                                                backgroundColor: designSystem.colors.status.error,
                                                color: designSystem.colors.neutral.white,
                                            }, onMouseEnter: (e) => {
                                                e.currentTarget.style.opacity = '0.9';
                                            }, onMouseLeave: (e) => {
                                                e.currentTarget.style.opacity = '1';
                                            }, children: "Sair" })] }) })] }), _jsx("main", { className: "flex-1 overflow-auto md:pt-0 pt-16", style: { backgroundColor: designSystem.colors.neutral.light }, children: _jsx("div", { className: "p-4 md:p-8", children: children }) })] }), _jsx(NotificationsContainer, { notifications: notifications, onRemove: removeNotification })] }));
}
