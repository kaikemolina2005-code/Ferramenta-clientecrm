import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Flex, Grid, Text, IconButton, Icon, useColorModeValue } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from './Card';
const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
/** Mini calendario mensal no estilo Horizon (sem dependencias externas). */
export default function MiniCalendar() {
    const today = new Date();
    const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const textColor = useColorModeValue('navy.700', 'white');
    const mutedColor = 'secondaryGray.600';
    const todayBg = 'brand.600';
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++)
        cells.push(null);
    for (let d = 1; d <= daysInMonth; d++)
        cells.push(d);
    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    const move = (delta) => setCursor(new Date(year, month + delta, 1));
    return (_jsxs(Card, { children: [_jsxs(Flex, { align: "center", justify: "space-between", mb: "12px", children: [_jsx(IconButton, { "aria-label": "M\u00EAs anterior", icon: _jsx(Icon, { as: ChevronLeft }), size: "sm", variant: "ghost", onClick: () => move(-1) }), _jsxs(Text, { fontWeight: "700", color: textColor, children: [MONTHS[month], " ", year] }), _jsx(IconButton, { "aria-label": "Pr\u00F3ximo m\u00EAs", icon: _jsx(Icon, { as: ChevronRight }), size: "sm", variant: "ghost", onClick: () => move(1) })] }), _jsx(Grid, { templateColumns: "repeat(7, 1fr)", gap: "4px", mb: "4px", children: WEEKDAYS.map((w, i) => (_jsx(Text, { textAlign: "center", fontSize: "xs", fontWeight: "600", color: mutedColor, children: w }, i))) }), _jsx(Grid, { templateColumns: "repeat(7, 1fr)", gap: "4px", children: cells.map((d, i) => (_jsx(Box, { textAlign: "center", py: "6px", children: d && (_jsx(Flex, { align: "center", justify: "center", w: "32px", h: "32px", mx: "auto", borderRadius: "full", bg: isToday(d) ? todayBg : 'transparent', color: isToday(d) ? 'white' : textColor, fontSize: "sm", fontWeight: isToday(d) ? '700' : '500', cursor: "pointer", _hover: { bg: isToday(d) ? todayBg : 'secondaryGray.300' }, children: d })) }, i))) })] }));
}
