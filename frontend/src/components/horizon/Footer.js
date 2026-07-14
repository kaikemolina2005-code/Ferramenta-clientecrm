import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Flex, Text, Link } from '@chakra-ui/react';
export function Footer() {
    const year = new Date().getFullYear();
    return (_jsxs(Flex, { direction: { base: 'column', md: 'row' }, align: "center", justify: "space-between", px: { base: '16px', md: '24px' }, py: "20px", gap: "8px", children: [_jsxs(Text, { color: "secondaryGray.700", fontSize: "sm", children: ["\u00A9 ", year, " ADVGD CRM \u2014 Diego Patr\u00EDcio Advogado. Todos os direitos reservados."] }), _jsx(Link, { href: "#", color: "gold.600", fontSize: "sm", fontWeight: "500", children: "Suporte" })] }));
}
export default Footer;
