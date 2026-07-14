import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Flex, Text, IconButton, Icon, Avatar, Menu, MenuButton, MenuList, MenuItem, useColorMode, useColorModeValue, } from '@chakra-ui/react';
import { Menu as MenuIcon, Bell, Moon, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import SearchBar from './SearchBar';
const PAGE_NAMES = {
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/kanban': 'CRM',
    '/tarefas': 'Tarefas',
    '/automation': 'Automações',
    '/reports': 'Relatórios',
    '/documentos': 'Documentos',
    '/whatsapp': 'WhatsApp',
    '/ai': 'IA Documents',
    '/perfil': 'Perfil',
};
export function Navbar({ onOpenSidebar }) {
    const { pathname } = useLocation();
    const { colorMode, toggleColorMode } = useColorMode();
    const { user, logout } = useAuth();
    const pageName = PAGE_NAMES[pathname] ||
        Object.entries(PAGE_NAMES).find(([k]) => pathname.startsWith(k))?.[1] ||
        'Página';
    const mainText = useColorModeValue('navy.700', 'white');
    const secondaryText = useColorModeValue('secondaryGray.700', 'white');
    const navbarBg = useColorModeValue('rgba(244, 247, 254, 0.2)', 'rgba(11,20,55,0.5)');
    const menuBg = useColorModeValue('white', 'navy.800');
    const navbarIcon = useColorModeValue('gray.400', 'white');
    const shadow = useColorModeValue('14px 17px 40px 4px rgba(112, 144, 176, 0.18)', '14px 17px 40px 4px rgba(112, 144, 176, 0.06)');
    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };
    return (_jsx(Box, { position: "sticky", top: "0", zIndex: "10", bg: navbarBg, backdropFilter: "blur(20px)", px: { base: '16px', md: '24px' }, py: "12px", children: _jsxs(Flex, { align: "center", justify: "space-between", gap: "12px", children: [_jsxs(Box, { minW: "0", children: [_jsxs(Text, { fontSize: "xs", color: secondaryText, children: ["P\u00E1ginas / ", pageName] }), _jsx(Text, { fontSize: "2xl", fontWeight: "bold", color: mainText, lineHeight: "1.2", noOfLines: 1, children: pageName })] }), _jsxs(Flex, { align: "center", bg: menuBg, p: "10px", borderRadius: "30px", boxShadow: shadow, gap: "4px", children: [_jsx(SearchBar, { display: { base: 'none', md: 'flex' }, me: "6px" }), _jsx(IconButton, { "aria-label": "Notifica\u00E7\u00F5es", icon: _jsx(Icon, { as: Bell, boxSize: "18px" }), variant: "ghost", color: navbarIcon, borderRadius: "full", size: "sm" }), _jsx(IconButton, { "aria-label": "Alternar tema", icon: _jsx(Icon, { as: colorMode === 'light' ? Moon : Sun, boxSize: "18px" }), variant: "ghost", color: navbarIcon, borderRadius: "full", size: "sm", onClick: toggleColorMode }), _jsxs(Menu, { children: [_jsx(MenuButton, { children: _jsx(Avatar, { size: "sm", src: "/logo-icon.png", name: user?.name, bg: "#000000", color: "white", cursor: "pointer" }) }), _jsxs(MenuList, { boxShadow: shadow, p: "16px", borderRadius: "20px", bg: menuBg, border: "none", mt: "8px", children: [_jsxs(Box, { px: "8px", pb: "10px", mb: "8px", borderBottomWidth: "1px", borderColor: "secondaryGray.200", children: [_jsx(Text, { fontSize: "sm", fontWeight: "700", color: mainText, children: user?.name || 'Usuário' }), _jsx(Text, { fontSize: "xs", color: secondaryText, children: user?.role })] }), _jsx(MenuItem, { borderRadius: "8px", color: "red.500", fontWeight: "600", onClick: handleLogout, children: "Sair" })] })] }), _jsx(IconButton, { "aria-label": "Menu", icon: _jsx(Icon, { as: MenuIcon, boxSize: "20px" }), variant: "ghost", color: navbarIcon, borderRadius: "full", size: "sm", display: { base: 'flex', xl: 'none' }, onClick: onOpenSidebar })] })] }) }));
}
export default Navbar;
