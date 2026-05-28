import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';
export function AutomationPage() {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        trigger: 'LEAD_CREATED',
        action: 'SEND_EMAIL',
    });
    useEffect(() => {
        loadRules();
    }, []);
    const loadRules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/automation/rules');
            setRules(response.data.data || []);
        }
        catch (error) {
            console.error('Erro ao carregar regras:', error);
            setRules([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreateRule = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/automation/rules', formData);
            setRules([response.data.data, ...rules]);
            setFormData({
                name: '',
                description: '',
                trigger: 'LEAD_CREATED',
                action: 'SEND_EMAIL',
            });
            setShowForm(false);
        }
        catch (error) {
            console.error('Erro ao criar regra:', error);
        }
    };
    const handleToggleRule = async (ruleId, currentStatus) => {
        try {
            const response = await api.patch(`/automation/rules/${ruleId}`, {
                isActive: !currentStatus,
            });
            setRules(rules.map((rule) => (rule.id === ruleId ? response.data.data : rule)));
        }
        catch (error) {
            console.error('Erro ao atualizar regra:', error);
        }
    };
    const handleDeleteRule = async (ruleId) => {
        if (confirm('Tem certeza que deseja deletar esta regra?')) {
            try {
                await api.delete(`/automation/rules/${ruleId}`);
                setRules(rules.filter((rule) => rule.id !== ruleId));
            }
            catch (error) {
                console.error('Erro ao deletar regra:', error);
            }
        }
    };
    const triggerOptions = [
        { value: 'LEAD_CREATED', label: 'Lead Criado' },
        { value: 'STATUS_CHANGED', label: 'Status Alterado' },
        { value: 'HIGH_SCORE', label: 'Score Alto' },
        { value: 'SCHEDULED', label: 'Agendado' },
    ];
    const actionOptions = [
        { value: 'SEND_EMAIL', label: 'Enviar Email' },
        { value: 'SEND_MESSAGE', label: 'Enviar Mensagem' },
        { value: 'ASSIGN_LEAD', label: 'Atribuir Lead' },
        { value: 'UPDATE_SCORE', label: 'Atualizar Score' },
    ];
    return (_jsxs("div", { style: { padding: '32px', backgroundColor: designSystem.colors.neutral.light, minHeight: '100vh' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }, children: [_jsx("h1", { style: {
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: designSystem.colors.primary.dark
                        }, children: "\u2699\uFE0F Automa\u00E7\u00F5es" }), _jsx(Button, { variant: showForm ? 'error' : 'primary', onClick: () => setShowForm(!showForm), children: showForm ? '✕ Cancelar' : '+ Nova Regra' })] }), showForm && (_jsx(Card, { title: "Criar Nova Regra de Automa\u00E7\u00E3o", icon: "\u2795", hoverable: true, style: { marginBottom: '24px' }, children: _jsxs("form", { onSubmit: handleCreateRule, style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '16px'
                    }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Nome da Regra *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), placeholder: "Ex: Enviar welcome email para novos leads", style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        transition: designSystem.transitions.normal
                                    }, onFocus: (e) => e.currentTarget.style.borderColor = designSystem.colors.primary.dark, onBlur: (e) => e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300, required: true })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { value: formData.description, onChange: (e) => setFormData({ ...formData, description: e.target.value }), placeholder: "Descri\u00E7\u00E3o detalhada da automa\u00E7\u00E3o", rows: 3, style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        resize: 'vertical',
                                        transition: designSystem.transitions.normal
                                    }, onFocus: (e) => e.currentTarget.style.borderColor = designSystem.colors.primary.dark, onBlur: (e) => e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300 })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: designSystem.colors.primary.dark,
                                                marginBottom: '8px'
                                            }, children: "Gatilho (Trigger) *" }), _jsx("select", { value: formData.trigger, onChange: (e) => setFormData({ ...formData, trigger: e.target.value }), style: {
                                                width: '100%',
                                                padding: '10px 16px',
                                                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                backgroundColor: designSystem.colors.neutral.white,
                                                cursor: 'pointer'
                                            }, required: true, children: triggerOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                                display: 'block',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: designSystem.colors.primary.dark,
                                                marginBottom: '8px'
                                            }, children: "A\u00E7\u00E3o *" }), _jsx("select", { value: formData.action, onChange: (e) => setFormData({ ...formData, action: e.target.value }), style: {
                                                width: '100%',
                                                padding: '10px 16px',
                                                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontFamily: 'Segoe UI, sans-serif',
                                                backgroundColor: designSystem.colors.neutral.white,
                                                cursor: 'pointer'
                                            }, required: true, children: actionOptions.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value))) })] })] }), _jsxs("div", { style: { display: 'flex', gap: '12px' }, children: [_jsx("button", { type: "submit", style: {
                                        padding: '8px 16px',
                                        backgroundColor: designSystem.colors.primary.dark,
                                        color: designSystem.colors.neutral.white,
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s'
                                    }, onMouseEnter: (e) => {
                                        e.currentTarget.style.opacity = '0.9';
                                    }, onMouseLeave: (e) => {
                                        e.currentTarget.style.opacity = '1';
                                    }, children: "\u2713 Criar Regra" }), _jsx(Button, { variant: "secondary", onClick: () => setShowForm(false), children: "Cancelar" })] })] }) })), loading ? (_jsx("div", { style: {
                    textAlign: 'center',
                    padding: '48px',
                    color: designSystem.colors.neutral.gray500
                }, children: "Carregando automa\u00E7\u00F5es..." })) : rules.length === 0 ? (_jsxs(Card, { title: "Nenhuma Automa\u00E7\u00E3o Criada", icon: "\uD83D\uDCED", hoverable: true, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray600, marginBottom: '16px' }, children: "Voc\u00EA ainda n\u00E3o tem nenhuma regra de automa\u00E7\u00E3o configurada." }), _jsx(Button, { variant: "primary", onClick: () => setShowForm(true), children: "+ Criar Primeira Regra" })] })) : (_jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px'
                }, children: rules.map((rule) => (_jsx(Card, { title: rule.name, icon: rule.isActive ? '✓' : '⊘', hoverable: true, style: {
                        borderLeft: `4px solid ${rule.isActive ? designSystem.colors.status.success : designSystem.colors.neutral.gray300}`
                    }, children: _jsxs("div", { style: {
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }, children: [_jsx("p", { style: {
                                    fontSize: '13px',
                                    color: designSystem.colors.neutral.gray600,
                                    marginBottom: '8px'
                                }, children: rule.description || 'Sem descrição' }), _jsxs("div", { style: {
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                    fontSize: '12px'
                                }, children: [_jsxs("div", { style: {
                                            padding: '8px',
                                            backgroundColor: `${designSystem.colors.primary.light}15`,
                                            borderRadius: '6px'
                                        }, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray500, margin: '0 0 4px 0' }, children: "Gatilho" }), _jsx("p", { style: { color: designSystem.colors.primary.dark, fontWeight: '500', margin: 0 }, children: triggerOptions.find((o) => o.value === rule.trigger)?.label || rule.trigger })] }), _jsxs("div", { style: {
                                            padding: '8px',
                                            backgroundColor: `${designSystem.colors.accent.gold}15`,
                                            borderRadius: '6px'
                                        }, children: [_jsx("p", { style: { color: designSystem.colors.neutral.gray500, margin: '0 0 4px 0' }, children: "A\u00E7\u00E3o" }), _jsx("p", { style: { color: designSystem.colors.primary.dark, fontWeight: '500', margin: 0 }, children: actionOptions.find((o) => o.value === rule.action)?.label || rule.action })] })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${designSystem.colors.neutral.gray300}`
                                }, children: [_jsx(Badge, { variant: rule.isActive ? 'success' : 'warning', children: rule.isActive ? '🟢 Ativo' : '⚫ Inativo' }), _jsxs("span", { style: {
                                            fontSize: '12px',
                                            color: designSystem.colors.neutral.gray500
                                        }, children: [rule.executionCount, " execu\u00E7\u00F5es"] })] }), _jsxs("div", { style: {
                                    display: 'flex',
                                    gap: '8px'
                                }, children: [_jsx(Button, { variant: rule.isActive ? 'secondary' : 'primary', size: "sm", onClick: () => handleToggleRule(rule.id, rule.isActive), style: { flex: 1 }, children: rule.isActive ? '⊘ Desativar' : '✓ Ativar' }), _jsx(Button, { variant: "error", size: "sm", onClick: () => handleDeleteRule(rule.id), style: { flex: 1 }, children: "\uD83D\uDDD1\uFE0F Deletar" })] })] }) }, rule.id))) }))] }));
}
