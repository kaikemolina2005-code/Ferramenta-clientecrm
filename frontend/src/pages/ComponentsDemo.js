import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Modal, ConfirmDialog, ToastContainer } from '@/components/Modals';
import { useToast } from '@/hooks/useToast';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
export default function ComponentsDemo() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const { toasts, success, error, warning, info, removeToast } = useToast();
    const handleCreateItem = () => {
        if (!formData.name || !formData.email) {
            error('Preencha todos os campos');
            return;
        }
        success(`Item "${formData.name}" criado com sucesso!`);
        setFormData({ name: '', email: '' });
        setIsModalOpen(false);
    };
    const handleDelete = () => {
        success('Item deletado com sucesso!');
        setIsConfirming(false);
    };
    return (_jsxs("div", { style: { minHeight: '100vh', backgroundColor: designSystem.colors.neutral.light, padding: '32px' }, children: [_jsxs("div", { style: { maxWidth: '1200px', margin: '0 auto' }, children: [_jsxs("div", { style: { marginBottom: '40px' }, children: [_jsx("h1", { style: {
                                    fontSize: '32px',
                                    fontWeight: 'bold',
                                    color: designSystem.colors.primary.dark,
                                    margin: '0 0 8px 0'
                                }, children: "\uD83C\uDFA8 Demonstra\u00E7\u00E3o de Componentes" }), _jsx("p", { style: {
                                    color: designSystem.colors.neutral.gray600,
                                    margin: '0'
                                }, children: "Conhe\u00E7a os novos componentes e funcionalidades" })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '24px',
                            marginBottom: '40px'
                        }, children: [_jsxs(Card, { title: "Modal Component", icon: "\uD83D\uDCE6", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 16px 0' }, children: "Abra um modal para coletar informa\u00E7\u00F5es do usu\u00E1rio" }), _jsx(Button, { variant: "primary", onClick: () => setIsModalOpen(true), children: "Abrir Modal" })] }), _jsxs(Card, { title: "Confirm Dialog", icon: "\u2753", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 16px 0' }, children: "Pe\u00E7a confirma\u00E7\u00E3o antes de a\u00E7\u00F5es irrevers\u00EDveis" }), _jsx(Button, { variant: "error", onClick: () => setIsConfirming(true), children: "Deletar Item" })] }), _jsxs(Card, { title: "Toast Notifications", icon: "\uD83D\uDD14", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }, children: "Notifica\u00E7\u00F5es flutuantes para feedback" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx(Button, { variant: "success", onClick: () => success('Sucesso!'), children: "Sucesso" }), _jsx(Button, { variant: "error", onClick: () => error('Erro!'), children: "Erro" }), _jsx(Button, { variant: "primary", onClick: () => warning('Aviso!'), children: "Aviso" }), _jsx(Button, { variant: "secondary", onClick: () => info('Info!'), children: "Info" })] })] }), _jsxs(Card, { title: "Status Badges", icon: "\uD83C\uDFF7\uFE0F", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }, children: "Indicadores de status" }), _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' }, children: [_jsx(Badge, { variant: "success", children: "Ativo" }), _jsx(Badge, { variant: "error", children: "Inativo" }), _jsx(Badge, { variant: "warning", children: "Pendente" }), _jsx(Badge, { variant: "info", children: "Info" }), _jsx(Badge, { variant: "primary", children: "Secund\u00E1rio" })] })] }), _jsxs(Card, { title: "Button Variants", icon: "\uD83D\uDD18", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }, children: "Diferentes estilos de bot\u00E3o" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx(Button, { variant: "primary", children: "Primary" }), _jsx(Button, { variant: "secondary", children: "Secondary" }), _jsx(Button, { variant: "success", children: "Success" }), _jsx(Button, { variant: "error", children: "Error" }), _jsx(Button, { variant: "outline", children: "Outline" })] })] }), _jsxs(Card, { title: "Button Sizes", icon: "\uD83D\uDCCF", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }, children: "Tamanhos dispon\u00EDveis" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx(Button, { size: "sm", children: "Small" }), _jsx(Button, { size: "md", children: "Medium" }), _jsx(Button, { size: "lg", children: "Large" })] })] })] }), _jsxs("div", { style: {
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '24px'
                        }, children: [_jsx(Card, { title: "\u2728 Novos Componentes", icon: "\u2B50", hoverable: true, style: {
                                    borderLeft: `4px solid ${designSystem.colors.accent.gold}`
                                }, children: _jsxs("ul", { style: { margin: '0', paddingLeft: '20px', lineHeight: '1.8' }, children: [_jsx("li", { children: "Modal com tamanhos ajust\u00E1veis" }), _jsx("li", { children: "Toast notifications com 4 tipos" }), _jsx("li", { children: "ConfirmDialog para confirma\u00E7\u00F5es" }), _jsx("li", { children: "Hook useToast para gerenciamento" }), _jsx("li", { children: "Totalmente responsivo" }), _jsx("li", { children: "Anima\u00E7\u00F5es suaves" })] }) }), _jsx(Card, { title: "\uD83D\uDCF1 Responsividade", icon: "\uD83D\uDCF2", hoverable: true, style: {
                                    borderLeft: `4px solid ${designSystem.colors.primary.light}`
                                }, children: _jsxs("ul", { style: { margin: '0', paddingLeft: '20px', lineHeight: '1.8' }, children: [_jsx("li", { children: "Sidebar colaps\u00E1vel em mobile" }), _jsx("li", { children: "Hamburger menu autom\u00E1tico" }), _jsx("li", { children: "Padding adaptativo" }), _jsx("li", { children: "Grid responsivo" }), _jsx("li", { children: "Touch-friendly buttons" }), _jsx("li", { children: "Overlay para mobile" })] }) }), _jsx(Card, { title: "\uD83E\uDDEA Testes Unit\u00E1rios", icon: "\u2705", hoverable: true, style: {
                                    borderLeft: `4px solid ${designSystem.colors.status.success}`
                                }, children: _jsxs("ul", { style: { margin: '0', paddingLeft: '20px', lineHeight: '1.8' }, children: [_jsx("li", { children: "Tests para Modal" }), _jsx("li", { children: "Tests para Toast" }), _jsx("li", { children: "Tests para ConfirmDialog" }), _jsx("li", { children: "Coverage completo" }), _jsx("li", { children: "Mock functions" }), _jsx("li", { children: "Ready to extend" })] }) })] }), _jsxs("div", { style: {
                            marginTop: '40px',
                            padding: '24px',
                            backgroundColor: designSystem.colors.primary.light + '20',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${designSystem.colors.primary.dark}`
                        }, children: [_jsx("h3", { style: {
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: designSystem.colors.primary.dark,
                                    margin: '0 0 12px 0'
                                }, children: "\u2139\uFE0F Como Usar" }), _jsxs("p", { style: {
                                    color: designSystem.colors.neutral.gray600,
                                    margin: '0'
                                }, children: ["Veja ", _jsx("strong", { children: "COMPONENTS_GUIDE.md" }), " na pasta frontend para documenta\u00E7\u00E3o completa. Os componentes est\u00E3o em ", _jsx("strong", { children: "src/components/Modals.tsx" }), " e o hook em ", _jsx("strong", { children: "src/hooks/useToast.ts" }), "."] })] })] }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: "Criar Novo Item", size: "medium", onConfirm: handleCreateItem, confirmText: "Criar", cancelText: "Cancelar", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Nome" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Digite o nome", style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Email" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), placeholder: "Digite o email", style: {
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit'
                                    } })] })] }) }), _jsx(ConfirmDialog, { isOpen: isConfirming, title: "Confirmar Dele\u00E7\u00E3o", message: "Tem certeza que deseja deletar este item? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita.", onConfirm: handleDelete, onCancel: () => setIsConfirming(false), isDangerous: true, confirmText: "Deletar", cancelText: "Cancelar" }), _jsx(ToastContainer, { toasts: toasts, onRemove: removeToast })] }));
}
