import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Flex, Stack, Text, HStack, Icon, Avatar, IconButton, Tooltip, Drawer, DrawerBody, DrawerContent, DrawerOverlay, useColorModeValue, } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Kanban, CheckSquare, Settings, BarChart2, FileText, MessageSquare, Brain, LogOut, User, } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
export const SIDEBAR_WIDTH = 290;
export const SIDEBAR_COLLAPSED = 84;
const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/kanban', icon: Kanban, label: 'CRM' },
    { to: '/tarefas', icon: CheckSquare, label: 'Tarefas' },
    { to: '/automation', icon: Settings, label: 'Automações' },
    { to: '/reports', icon: BarChart2, label: 'Relatórios' },
    { to: '/documentos', icon: FileText, label: 'Documentos' },
    { to: '/whatsapp', icon: MessageSquare, label: 'WhatsApp' },
    { to: '/ai', icon: Brain, label: 'IA Documents' },
    { to: '/perfil', icon: User, label: 'Perfil' },
];
function SidebarContent({ onNavigate, collapsed = false }) {
    const { pathname } = useLocation();
    const { user, logout } = useAuth();
    const activeColor = useColorModeValue('navy.700', 'white');
    const inactiveColor = useColorModeValue('secondaryGray.700', 'secondaryGray.600');
    const activeBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
    const brandText = useColorModeValue('navy.700', 'white');
    const borderCol = useColorModeValue('secondaryGray.200', 'whiteAlpha.200');
    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };
    return (_jsxs(Flex, { direction: "column", height: "100%", pt: "20px", px: "16px", pb: "16px", children: [_jsxs(HStack, { spacing: "12px", px: "8px", pb: "20px", mb: "12px", borderBottomWidth: "1px", borderColor: borderCol, justify: collapsed ? 'center' : 'flex-start', children: [_jsx(Box, { as: "img", src: "/logo-icon.png", alt: "Diego Patr\u00EDcio Advogado", h: collapsed ? '44px' : '64px', w: "auto", flexShrink: 0, borderRadius: "12px", objectFit: "contain" }), !collapsed && (_jsxs(Box, { overflow: "hidden", whiteSpace: "nowrap", children: [_jsx(Text, { fontSize: "md", fontWeight: "bold", color: brandText, lineHeight: "1.1", children: "CRM" }), _jsx(Text, { fontSize: "xs", color: "gold.600", lineHeight: "1.1", children: "Diego Patr\u00EDcio" })] }))] }), _jsx(Stack, { spacing: "2px", flex: "1", overflowY: "auto", overflowX: "hidden", children: NAV_ITEMS.map(({ to, icon: ItemIcon, label }) => {
                    const active = pathname === to || pathname.startsWith(to + '/');
                    return (_jsx(Tooltip, { label: label, placement: "right", isDisabled: !collapsed, hasArrow: true, children: _jsxs(HStack, { as: Link, to: to, onClick: onNavigate, spacing: "14px", px: "14px", py: "11px", borderRadius: "14px", bg: active ? activeBg : 'transparent', color: active ? activeColor : inactiveColor, fontWeight: active ? '700' : '500', transition: "all 0.15s", _hover: { bg: activeBg }, position: "relative", justify: collapsed ? 'center' : 'flex-start', children: [active && (_jsx(Box, { position: "absolute", left: "0", h: "60%", w: "4px", borderRadius: "full", bg: "gold.500" })), _jsx(Icon, { as: ItemIcon, boxSize: "20px", flexShrink: 0, color: active ? activeColor : 'inherit' }), !collapsed && (_jsx(Text, { fontSize: "sm", whiteSpace: "nowrap", overflow: "hidden", children: label }))] }) }, to));
                }) }), _jsxs(HStack, { mt: "12px", pt: "14px", borderTopWidth: "1px", borderColor: borderCol, spacing: "12px", justify: collapsed ? 'center' : 'flex-start', children: [_jsx(Avatar, { size: "sm", src: "/logo-icon.png", name: user?.name, bg: "#000000", color: "white", flexShrink: 0 }), !collapsed && (_jsxs(_Fragment, { children: [_jsxs(Box, { flex: "1", minW: "0", children: [_jsx(Text, { fontSize: "sm", fontWeight: "600", color: brandText, noOfLines: 1, children: user?.name }), _jsx(Text, { fontSize: "xs", color: "secondaryGray.700", noOfLines: 1, children: user?.role })] }), _jsx(IconButton, { "aria-label": "Sair", icon: _jsx(Icon, { as: LogOut, boxSize: "18px" }), variant: "ghost", colorScheme: "red", size: "sm", onClick: handleLogout })] }))] })] }));
}
/**
 * Sidebar fixa para desktop com efeito recolher/expandir no hover:
 * recolhida mostra so os icones; ao passar o mouse expande mostrando os textos.
 */
export function Sidebar() {
    const [expanded, setExpanded] = useState(false);
    const bg = useColorModeValue('white', 'navy.800');
    return (_jsx(Box, { display: { base: 'none', xl: 'block' }, position: "fixed", top: "0", left: "0", h: "100vh", w: `${expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED}px`, bg: bg, boxShadow: "14px 17px 40px 4px rgba(112, 144, 176, 0.08)", zIndex: "20", overflow: "hidden", transition: "width 0.2s ease", onMouseEnter: () => setExpanded(true), onMouseLeave: () => setExpanded(false), children: _jsx(SidebarContent, { collapsed: !expanded }) }));
}
/** Sidebar em Drawer para mobile/tablet. */
export function SidebarMobile({ isOpen, onClose }) {
    const bg = useColorModeValue('white', 'navy.800');
    return (_jsxs(Drawer, { isOpen: isOpen, onClose: onClose, placement: "left", children: [_jsx(DrawerOverlay, {}), _jsx(DrawerContent, { w: "285px", maxW: "285px", bg: bg, children: _jsx(DrawerBody, { p: "0", children: _jsx(SidebarContent, { onNavigate: onClose }) }) })] }));
}
export default Sidebar;
