import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ADVGDLogoDiego } from '@/components/Logo';
import { designSystem } from '@/theme/designSystem';
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@advgd.com');
    const [password, setPassword] = useState('123456');
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
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", style: {
            background: 'linear-gradient(135deg, #003f7f 0%, #0d47a1 100%)',
        }, children: _jsx("div", { className: "w-full max-w-md", children: _jsxs("div", { className: "rounded-xl p-8 shadow-xl", style: {
                    backgroundColor: designSystem.colors.neutral.white,
                }, children: [_jsx("div", { className: "flex justify-center mb-8", children: _jsx(ADVGDLogoDiego, { size: "medium" }) }), _jsx("h1", { className: "text-3xl font-bold text-center mb-2", style: { color: designSystem.colors.primary.dark }, children: "Bem-vindo" }), _jsx("p", { className: "text-center mb-8", style: { color: designSystem.colors.neutral.gray500 }, children: "Plataforma de Gest\u00E3o para Escrit\u00F3rios de Advocacia" }), _jsxs("form", { onSubmit: handleLogin, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", style: { color: designSystem.colors.primary.dark }, children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), className: "w-full px-4 py-3 rounded-lg border-2 transition-all", style: {
                                            borderColor: designSystem.colors.neutral.gray300,
                                            backgroundColor: designSystem.colors.neutral.white,
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor =
                                                designSystem.colors.primary.dark;
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor =
                                                designSystem.colors.neutral.gray300;
                                        }, placeholder: "seu@email.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", style: { color: designSystem.colors.primary.dark }, children: "Senha" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), className: "w-full px-4 py-3 rounded-lg border-2 transition-all", style: {
                                            borderColor: designSystem.colors.neutral.gray300,
                                            backgroundColor: designSystem.colors.neutral.white,
                                        }, onFocus: (e) => {
                                            e.target.style.borderColor =
                                                designSystem.colors.primary.dark;
                                        }, onBlur: (e) => {
                                            e.target.style.borderColor =
                                                designSystem.colors.neutral.gray300;
                                        }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), error && (_jsx("div", { className: "p-4 rounded-lg", style: {
                                    backgroundColor: '#f8d7da',
                                    color: designSystem.colors.status.error,
                                    borderLeft: `4px solid ${designSystem.colors.status.error}`,
                                }, children: error })), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "remember", className: "w-4 h-4" }), _jsx("label", { htmlFor: "remember", className: "ml-2 text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Lembrar-me" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-lg font-bold text-white transition-all", style: {
                                    backgroundColor: loading
                                        ? designSystem.colors.neutral.gray400
                                        : designSystem.colors.primary.dark,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }, onMouseEnter: (e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            designSystem.colors.primary.main;
                                    }
                                }, onMouseLeave: (e) => {
                                    if (!loading) {
                                        e.currentTarget.style.backgroundColor =
                                            designSystem.colors.primary.dark;
                                    }
                                }, children: loading ? 'Carregando...' : 'Entrar' })] }), _jsxs("div", { className: "mt-8 p-4 rounded-lg border-l-4", style: {
                            backgroundColor: designSystem.colors.primary.lighter,
                            borderColor: designSystem.colors.accent.gold,
                        }, children: [_jsx("p", { className: "text-xs font-semibold mb-2", style: { color: designSystem.colors.primary.dark }, children: "\uD83D\uDD13 Credenciais de Demonstra\u00E7\u00E3o:" }), _jsxs("p", { className: "text-xs", style: { color: designSystem.colors.neutral.gray600 }, children: [_jsx("strong", { children: "Email:" }), " admin@advgd.com", _jsx("br", {}), _jsx("strong", { children: "Senha:" }), " 123456"] })] }), _jsx("p", { className: "text-center text-xs mt-8", style: { color: designSystem.colors.neutral.gray500 }, children: "\u00A9 2026 ADVGD CRM. Todos os direitos reservados." })] }) }) }));
}
