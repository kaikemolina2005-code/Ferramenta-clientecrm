import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { NotificationsContainer } from './NotificationsContainer';
import useSocket from '@/hooks/useSocket';
import { Sidebar, SidebarMobile, SIDEBAR_COLLAPSED } from './horizon/Sidebar';
import { Navbar } from './horizon/Navbar';
import { Footer } from './horizon/Footer';
import FixedPlugin from './horizon/FixedPlugin';
export function Layout({ children }) {
    const [notifications, setNotifications] = useState([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const bg = useColorModeValue('secondaryGray.300', 'navy.900');
    const { onNotification, onDocumentAnalyzed, onDocumentProcessingCompleted, onDocumentProcessingError } = useSocket();
    useEffect(() => {
        const unsub = onNotification((n) => setNotifications((prev) => [n, ...prev]));
        return () => { if (unsub)
            unsub(); };
    }, [onNotification]);
    useEffect(() => {
        const unsub = onDocumentAnalyzed((data) => {
            setNotifications((prev) => [{
                    type: 'success',
                    title: '📄 Documento Analisado',
                    message: `Classificado como ${data.classification} com ${(data.confidence * 100).toFixed(0)}% de confiança`,
                    timestamp: new Date(),
                    id: `${Date.now()}-doc-analyzed`,
                }, ...prev]);
        });
        return () => { if (unsub)
            unsub(); };
    }, [onDocumentAnalyzed]);
    useEffect(() => {
        const unsub = onDocumentProcessingCompleted((data) => {
            setNotifications((prev) => [{
                    type: 'success',
                    title: '✅ Processamento Completo',
                    message: `${data.successCount}/${data.processedCount} documentos processados com sucesso`,
                    timestamp: new Date(),
                    id: `${Date.now()}-processing-complete`,
                }, ...prev]);
        });
        return () => { if (unsub)
            unsub(); };
    }, [onDocumentProcessingCompleted]);
    useEffect(() => {
        const unsub = onDocumentProcessingError((data) => {
            setNotifications((prev) => [{
                    type: 'error',
                    title: '❌ Erro no Processamento',
                    message: data.error || 'Erro ao processar documentos',
                    timestamp: new Date(),
                    id: `${Date.now()}-processing-error`,
                }, ...prev]);
        });
        return () => { if (unsub)
            unsub(); };
    }, [onDocumentProcessingError]);
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };
    return (_jsxs(Box, { minH: "100vh", bg: bg, children: [_jsx(Sidebar, {}), _jsx(SidebarMobile, { isOpen: isOpen, onClose: onClose }), _jsxs(Box, { ml: { base: 0, xl: `${SIDEBAR_COLLAPSED}px` }, display: "flex", flexDirection: "column", minH: "100vh", children: [_jsx(Navbar, { onOpenSidebar: onOpen }), _jsx(Box, { as: "main", flex: "1", px: { base: '16px', md: '24px' }, py: "20px", children: children }), _jsx(Footer, {})] }), _jsx(NotificationsContainer, { notifications: notifications, onRemove: removeNotification }), _jsx(FixedPlugin, {})] }));
}
