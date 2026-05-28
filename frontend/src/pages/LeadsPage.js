import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import { leadService } from '@/services/leadService';
export function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        cpf: '',
        city: '',
        state: '',
        category: 'CONSULTATION',
        source: 'WEBSITE',
    });
    useEffect(() => {
        loadLeads();
    }, []);
    const loadLeads = async () => {
        try {
            setIsLoading(true);
            const response = await leadService.getAll();
            setLeads(response.leads || []);
        }
        catch (error) {
            console.error('Erro ao carregar leads:', error);
            setLeads([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const newLead = await leadService.create({
                ...formData,
                category: formData.category,
            });
            setLeads([newLead, ...leads]);
            setFormData({
                name: '',
                phone: '',
                email: '',
                cpf: '',
                city: '',
                state: '',
                category: 'CONSULTATION',
                source: 'WEBSITE',
            });
            setShowForm(false);
        }
        catch (error) {
            console.error('Erro ao criar lead:', error);
        }
    };
    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const updated = await leadService.update(leadId, { status: newStatus });
            setLeads(leads.map((lead) => (lead.id === leadId ? updated : lead)));
        }
        catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };
    const getStatusColor = (status) => {
        const statusMap = {
            INITIAL: 'primary',
            CONSULTING: 'warning',
            PAYMENT: 'info',
            LOSS: 'error',
            CONVERTED: 'success',
        };
        return statusMap[status] || 'primary';
    };
    return (_jsxs("div", { style: { padding: '32px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }, children: [_jsx("h1", { style: {
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: designSystem.colors.primary.dark
                        }, children: "\uD83D\uDC65 Leads" }), _jsx(Button, { variant: showForm ? 'error' : 'primary', onClick: () => setShowForm(!showForm), children: showForm ? '✕ Cancelar' : '+ Novo Lead' })] }), showForm && (_jsx(Card, { title: "Criar Novo Lead", icon: "\uD83D\uDCDD", hoverable: true, style: { marginBottom: '24px' }, children: _jsxs("form", { onSubmit: handleCreateLead, style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '16px'
                    }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Nome *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), style: {
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
                                    }, children: "Email *" }), _jsx("input", { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), style: {
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
                                    }, children: "Telefone *" }), _jsx("input", { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), style: {
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
                                    }, children: "CPF" }), _jsx("input", { type: "text", value: formData.cpf, onChange: (e) => setFormData({ ...formData, cpf: e.target.value }), style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        transition: designSystem.transitions.normal
                                    }, onFocus: (e) => e.currentTarget.style.borderColor = designSystem.colors.primary.dark, onBlur: (e) => e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300 })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Categoria" }), _jsxs("select", { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        backgroundColor: designSystem.colors.neutral.white
                                    }, children: [_jsx("option", { value: "CONSULTATION", children: "Consulta" }), _jsx("option", { value: "PROCESS", children: "Processo" }), _jsx("option", { value: "BPC_LOAS", children: "BPC/LOAS" }), _jsx("option", { value: "RETIREMENT", children: "Aposentadoria" })] })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Origem" }), _jsxs("select", { value: formData.source, onChange: (e) => setFormData({ ...formData, source: e.target.value }), style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        backgroundColor: designSystem.colors.neutral.white
                                    }, children: [_jsx("option", { value: "WEBSITE", children: "Website" }), _jsx("option", { value: "WHATSAPP", children: "WhatsApp" }), _jsx("option", { value: "PHONE", children: "Telefone" }), _jsx("option", { value: "REFERRAL", children: "Indica\u00E7\u00E3o" })] })] }), _jsxs("div", { style: { gridColumn: '1 / -1', display: 'flex', gap: '12px' }, children: [_jsx("button", { type: "submit", style: {
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
                                    }, children: "\u2713 Criar Lead" }), _jsx(Button, { variant: "secondary", onClick: () => setShowForm(false), children: "Cancelar" })] })] }) })), _jsx("div", { style: {
                    backgroundColor: designSystem.colors.neutral.white,
                    borderRadius: '12px',
                    boxShadow: designSystem.shadows.md,
                    overflow: 'hidden'
                }, children: isLoading ? (_jsx("div", { style: { padding: '32px', textAlign: 'center', color: designSystem.colors.neutral.gray500 }, children: "Carregando leads..." })) : leads.length === 0 ? (_jsx("div", { style: { padding: '32px', textAlign: 'center', color: designSystem.colors.neutral.gray500 }, children: "Nenhum lead encontrado" })) : (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { style: { backgroundColor: designSystem.colors.neutral.light, borderBottom: `1px solid ${designSystem.colors.neutral.gray300}` }, children: ['Nome', 'Email', 'Telefone', 'Categoria', 'Status', 'Ações'].map((header) => (_jsx("th", { style: {
                                            padding: '16px',
                                            textAlign: 'left',
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark,
                                            fontSize: '14px'
                                        }, children: header }, header))) }) }), _jsx("tbody", { children: leads.map((lead) => (_jsxs("tr", { style: {
                                        borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        transition: designSystem.transitions.normal,
                                        cursor: 'pointer'
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light, onMouseLeave: (e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.white, children: [_jsx("td", { style: { padding: '16px', fontWeight: '500', color: designSystem.colors.primary.dark }, children: lead.name }), _jsx("td", { style: { padding: '16px', color: designSystem.colors.neutral.gray600 }, children: lead.email }), _jsx("td", { style: { padding: '16px', color: designSystem.colors.neutral.gray600 }, children: lead.phone }), _jsx("td", { style: { padding: '16px', color: designSystem.colors.neutral.gray600 }, children: lead.category }), _jsx("td", { style: { padding: '16px' }, children: _jsx(Badge, { variant: getStatusColor(lead.status), children: lead.status }) }), _jsx("td", { style: { padding: '16px' }, children: _jsxs("select", { value: lead.status, onChange: (e) => handleStatusChange(lead.id, e.target.value), style: {
                                                    padding: '6px 12px',
                                                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    color: designSystem.colors.primary.dark,
                                                    backgroundColor: designSystem.colors.neutral.white,
                                                    cursor: 'pointer'
                                                }, children: [_jsx("option", { value: "INITIAL", children: "Inicial" }), _jsx("option", { value: "CONSULTING", children: "Consultando" }), _jsx("option", { value: "PAYMENT", children: "Pagamento" }), _jsx("option", { value: "LOSS", children: "Perda" }), _jsx("option", { value: "CONVERTED", children: "Convertido" })] }) })] }, lead.id))) })] }) })) })] }));
}
