import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { InputGroup, InputLeftElement, Input, Icon, useColorModeValue, } from '@chakra-ui/react';
import { Search } from 'lucide-react';
/** Campo de busca arredondado no estilo Horizon. */
export default function SearchBar(props) {
    const { placeholder = 'Buscar...', ...rest } = props;
    const searchBg = useColorModeValue('secondaryGray.300', 'navy.900');
    const inputText = useColorModeValue('gray.700', 'white');
    const iconColor = useColorModeValue('gray.500', 'white');
    return (_jsxs(InputGroup, { w: { base: '100%', md: '200px' }, ...rest, children: [_jsx(InputLeftElement, { children: _jsx(Icon, { as: Search, color: iconColor, boxSize: "16px" }) }), _jsx(Input, { variant: "filled", fontSize: "sm", bg: searchBg, color: inputText, borderRadius: "30px", placeholder: placeholder, _placeholder: { color: 'secondaryGray.600', fontSize: '14px' }, _focus: { bg: searchBg, borderColor: 'transparent' }, _hover: { bg: searchBg }, border: "none" })] }));
}
