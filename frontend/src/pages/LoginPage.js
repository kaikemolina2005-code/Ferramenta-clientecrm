import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Flex, Box, Heading, Text, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, Checkbox, Alert, AlertIcon, Icon, } from '@chakra-ui/react';
import { Eye, EyeOff } from 'lucide-react';
import { ADVGDLogoDiego } from '@/components/Logo';
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@advgd.com');
    const [password, setPassword] = useState('123456');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx(Flex, { minH: "100vh", align: "center", justify: "center", p: "16px", bgGradient: "linear(135deg, #2b2f36 0%, #3a4048 100%)", children: _jsxs(Box, { w: "100%", maxW: "420px", bg: "white", borderRadius: "20px", p: "32px", boxShadow: "2xl", children: [_jsx(Flex, { justify: "center", mb: "24px", children: _jsx(ADVGDLogoDiego, { size: "medium" }) }), _jsx(Heading, { textAlign: "center", fontSize: "3xl", color: "brand.600", mb: "4px", children: "Bem-vindo" }), _jsx(Text, { textAlign: "center", color: "secondaryGray.700", mb: "28px", fontSize: "sm", children: "Plataforma de Gest\u00E3o para Escrit\u00F3rios de Advocacia" }), _jsxs("form", { onSubmit: handleLogin, children: [_jsxs(FormControl, { mb: "16px", isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", color: "brand.600", children: "Email" }), _jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "seu@email.com", borderRadius: "12px" })] }), _jsxs(FormControl, { mb: "16px", isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", color: "brand.600", children: "Senha" }), _jsxs(InputGroup, { children: [_jsx(Input, { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", borderRadius: "12px" }), _jsx(InputRightElement, { children: _jsx(Box, { cursor: "pointer", onClick: () => setShowPassword(!showPassword), children: _jsx(Icon, { as: showPassword ? EyeOff : Eye, color: "secondaryGray.600", boxSize: "18px" }) }) })] })] }), error && (_jsxs(Alert, { status: "error", borderRadius: "12px", mb: "16px", fontSize: "sm", children: [_jsx(AlertIcon, {}), error] })), _jsx(Checkbox, { mb: "20px", colorScheme: "blue", defaultChecked: false, children: _jsx(Text, { fontSize: "sm", color: "secondaryGray.700", children: "Lembrar-me" }) }), _jsx(Button, { type: "submit", isLoading: loading, loadingText: "Carregando...", variant: "brand", w: "100%", py: "22px", children: "Entrar" })] }), _jsxs(Box, { mt: "24px", p: "14px", borderRadius: "12px", bg: "brand.50", borderLeftWidth: "4px", borderColor: "gold.500", children: [_jsx(Text, { fontSize: "xs", fontWeight: "700", color: "brand.600", mb: "4px", children: "\uD83D\uDD13 Credenciais de Demonstra\u00E7\u00E3o:" }), _jsxs(Text, { fontSize: "xs", color: "secondaryGray.700", children: [_jsx("strong", { children: "Email:" }), " admin@advgd.com", _jsx("br", {}), _jsx("strong", { children: "Senha:" }), " 123456"] })] }), _jsx(Text, { textAlign: "center", fontSize: "xs", color: "secondaryGray.700", mt: "20px", children: "\u00A9 2026 ADVGD CRM. Todos os direitos reservados." })] }) }));
}
