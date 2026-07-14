import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Flex, Grid, GridItem, Avatar, Text, Badge, SimpleGrid, Stack, Divider, useColorModeValue, } from '@chakra-ui/react';
import Card from '@/components/horizon/Card';
import MiniCalendar from '@/components/horizon/MiniCalendar';
import { useAuth } from '@/context/AuthContext';
const ROLE_LABELS = {
    ADMIN: 'Administrador',
    LAWYER: 'Advogado',
    ASSISTANT: 'Assistente',
    USER: 'Usuário',
};
function InfoRow({ label, value }) {
    const labelColor = 'secondaryGray.600';
    const valueColor = useColorModeValue('navy.700', 'white');
    return (_jsxs(Flex, { justify: "space-between", py: "8px", children: [_jsx(Text, { fontSize: "sm", color: labelColor, children: label }), _jsx(Text, { fontSize: "sm", fontWeight: "600", color: valueColor, children: value || '—' })] }));
}
export function ProfilePage() {
    const { user } = useAuth();
    const titleColor = useColorModeValue('navy.700', 'white');
    return (_jsxs(Grid, { templateColumns: { base: '1fr', lg: '1fr 1fr' }, gap: "20px", children: [_jsx(GridItem, { colSpan: { base: 1, lg: 2 }, children: _jsxs(Card, { p: "0", overflow: "hidden", children: [_jsx(Box, { h: "120px", bgGradient: "linear(135deg, #003f7f 0%, #0d47a1 100%)" }), _jsxs(Flex, { direction: "column", align: "center", mt: "-44px", pb: "24px", px: "20px", children: [_jsx(Avatar, { size: "xl", name: user?.name, src: user?.avatar || '/logo.png', border: "4px solid white", bg: "#000000", color: "white" }), _jsx(Text, { fontSize: "xl", fontWeight: "700", color: titleColor, mt: "12px", children: user?.name || 'Usuário' }), _jsx(Badge, { colorScheme: "blue", borderRadius: "8px", mt: "4px", children: ROLE_LABELS[user?.role || ''] || user?.role })] })] }) }), _jsx(GridItem, { children: _jsxs(Card, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "8px", children: "Informa\u00E7\u00F5es da Conta" }), _jsx(Divider, { mb: "8px" }), _jsxs(Stack, { spacing: "0", divider: _jsx(Divider, {}), children: [_jsx(InfoRow, { label: "Nome", value: user?.name }), _jsx(InfoRow, { label: "Email", value: user?.email }), _jsx(InfoRow, { label: "Telefone", value: user?.phone }), _jsx(InfoRow, { label: "Cargo", value: ROLE_LABELS[user?.role || ''] || user?.role })] })] }) }), _jsx(GridItem, { children: _jsxs(Stack, { spacing: "20px", children: [_jsx(MiniCalendar, {}), _jsx(Card, { children: _jsxs(SimpleGrid, { columns: 2, spacing: "16px", children: [_jsxs(Box, { children: [_jsx(Text, { fontSize: "2xl", fontWeight: "700", color: titleColor, children: "\u2014" }), _jsx(Text, { fontSize: "sm", color: "secondaryGray.600", children: "Tarefas pendentes" })] }), _jsxs(Box, { children: [_jsx(Text, { fontSize: "2xl", fontWeight: "700", color: titleColor, children: "\u2014" }), _jsx(Text, { fontSize: "sm", color: "secondaryGray.600", children: "Leads atribu\u00EDdos" })] })] }) })] }) })] }));
}
export default ProfilePage;
