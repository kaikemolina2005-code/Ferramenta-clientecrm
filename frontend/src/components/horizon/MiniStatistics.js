import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Flex, Stat, StatLabel, StatNumber, Text, Icon, useColorModeValue, } from '@chakra-ui/react';
import { RiArrowUpSFill, RiArrowDownSFill } from 'react-icons/ri';
import Card from './Card';
import IconBox from './IconBox';
/** Card de KPI no estilo Horizon: IconBox redondo + label + valor + crescimento. */
export default function MiniStatistics({ label, value, icon, growth, growthLabel = 'vs mês anterior', }) {
    const textColor = useColorModeValue('secondaryGray.900', 'white');
    const textColorSecondary = 'secondaryGray.600';
    const boxBg = useColorModeValue('secondaryGray.300', 'whiteAlpha.100');
    const brandColor = useColorModeValue('brand.600', 'white');
    const isNegative = growth?.trim().startsWith('-');
    const growthColor = isNegative ? 'red.500' : 'green.500';
    return (_jsx(Card, { py: "15px", children: _jsxs(Flex, { my: "auto", h: "100%", align: { base: 'center', xl: 'start' }, justify: "center", children: [icon && (_jsx(IconBox, { w: "56px", h: "56px", bg: boxBg, me: "18px", flexShrink: 0, fontSize: "28px", color: brandColor, icon: icon })), _jsxs(Stat, { my: "auto", children: [_jsx(StatLabel, { lineHeight: "100%", color: textColorSecondary, fontSize: "sm", fontWeight: "500", children: label }), _jsx(StatNumber, { color: textColor, fontSize: "2xl", fontWeight: "700", children: value }), growth && (_jsxs(Flex, { align: "center", mt: "4px", children: [_jsx(Icon, { as: isNegative ? RiArrowDownSFill : RiArrowUpSFill, color: growthColor, me: "2px" }), _jsx(Text, { color: growthColor, fontSize: "xs", fontWeight: "700", me: "5px", children: growth }), _jsx(Text, { color: "secondaryGray.600", fontSize: "xs", fontWeight: "400", children: growthLabel })] }))] })] }) }));
}
