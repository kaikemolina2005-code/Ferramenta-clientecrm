import { jsx as _jsx } from "react/jsx-runtime";
import { Flex } from '@chakra-ui/react';
/** Circulo de icone no estilo Horizon (fundo claro + icone colorido). */
export default function IconBox({ icon, ...rest }) {
    return (_jsx(Flex, { alignItems: "center", justifyContent: "center", borderRadius: "50%", ...rest, children: icon }));
}
