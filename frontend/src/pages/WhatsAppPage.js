import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';
export const WhatsAppPage = () => {
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState(null);
    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 30000); // Atualizar a cada 30s
        return () => clearInterval(interval);
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            const [statusRes, logsRes, statsRes] = await Promise.all([
                api.get('/whatsapp/status'),
                api.get('/whatsapp/logs?limit=10'),
                api.get('/whatsapp/stats'),
            ]);
            setConnectionStatus(statusRes.data);
            setLogs(logsRes.data);
            setStats(statsRes.data);
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSendTestMessage = async () => {
        if (!testPhone || !testMessage) {
            alert('Preencha o número e a mensagem');
            return;
        }
        try {
            setSending(true);
            const response = await api.post('/whatsapp/send-test', {
                phoneNumber: testPhone.replace(/\D/g, ''), // Remove caracteres não-numéricos
                message: testMessage,
            });
            setSendResult({ success: true, message: response.data.message });
            setTestMessage('');
            setTestPhone('');
            setTimeout(() => setSendResult(null), 5000);
        }
        catch (error) {
            setSendResult({
                success: false,
                message: error.response?.data?.error || 'Erro ao enviar mensagem',
            });
        }
        finally {
            setSending(false);
        }
    };
    const getStatusBadge = (configured) => {
        if (configured) {
            return _jsx(Badge, { variant: "success", children: "\uD83D\uDFE2 Conectado" });
        }
        return _jsx(Badge, { variant: "warning", children: "\u26AB N\u00E3o Configurado" });
    };
    return (_jsxs("div", { children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }, children: [_jsx("h1", { style: {
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: designSystem.colors.primary.dark
                        }, children: "\uD83D\uDCAC WhatsApp Integration" }), _jsxs("button", { onClick: loadData, disabled: loading, style: {
                            padding: '8px 16px',
                            backgroundColor: designSystem.colors.primary.dark,
                            color: designSystem.colors.neutral.white,
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: designSystem.transitions.normal,
                            opacity: loading ? 0.7 : 1
                        }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = designSystem.colors.primary.light, onMouseLeave: (e) => e.currentTarget.style.backgroundColor = designSystem.colors.primary.dark, children: [loading ? '⌛' : '🔄', " Atualizar"] })] }), _jsx(Card, { title: "Status da Conex\u00E3o", icon: "\uD83D\uDD0C", hoverable: true, style: { marginBottom: '24px' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                paddingBottom: '12px',
                                borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
                            }, children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray600, fontWeight: '500' }, children: "Status:" }), connectionStatus && getStatusBadge(connectionStatus.configured)] }), _jsxs("div", { style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }, children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray600, fontWeight: '500' }, children: "Phone ID:" }), _jsx("code", { style: {
                                        backgroundColor: designSystem.colors.neutral.light,
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        color: designSystem.colors.primary.dark
                                    }, children: connectionStatus?.phoneNumberId || 'Não configurado' })] })] }) }), connectionStatus?.configured && (_jsx(Card, { title: "Enviar Mensagem de Teste", icon: "\u2709\uFE0F", hoverable: true, style: { marginBottom: '24px' }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '16px' }, children: [_jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "N\u00FAmero WhatsApp" }), _jsx("input", { type: "text", placeholder: "ex: 5511999999999", value: testPhone, onChange: (e) => setTestPhone(e.target.value), style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px'
                                    } })] }), _jsxs("div", { children: [_jsx("label", { style: {
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: designSystem.colors.primary.dark,
                                        marginBottom: '8px'
                                    }, children: "Mensagem" }), _jsx("textarea", { placeholder: "Digite a mensagem...", value: testMessage, onChange: (e) => setTestMessage(e.target.value), rows: 3, style: {
                                        width: '100%',
                                        padding: '10px 16px',
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontFamily: 'Segoe UI, sans-serif',
                                        resize: 'vertical'
                                    } })] }), _jsx(Button, { variant: sending ? 'secondary' : 'primary', onClick: handleSendTestMessage, disabled: sending, children: sending ? '⌛ Enviando...' : '✉️ Enviar Mensagem' }), sendResult && (_jsx("div", { style: {
                                padding: '12px 16px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                backgroundColor: sendResult.success
                                    ? designSystem.colors.status.success + '20'
                                    : designSystem.colors.status.error + '20',
                                color: sendResult.success
                                    ? designSystem.colors.status.success
                                    : designSystem.colors.status.error,
                                border: `1px solid ${sendResult.success ? designSystem.colors.status.success : designSystem.colors.status.error}`
                            }, children: sendResult.message }))] }) })), stats && (_jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '24px'
                }, children: [_jsx(Card, { title: "Total de Leads", icon: "\uD83D\uDC65", hoverable: true, children: _jsx("p", { style: {
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: designSystem.colors.primary.dark,
                                margin: '0'
                            }, children: stats.totalLeads }) }), _jsx(Card, { title: "Por Status", icon: "\uD83D\uDCCA", hoverable: true, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: stats.byStatus.map((item) => (_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingBottom: '8px',
                                    borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
                                }, children: [_jsx("span", { style: { fontSize: '13px', color: designSystem.colors.neutral.gray600 }, children: item.status }), _jsx("span", { style: {
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark,
                                            backgroundColor: `${designSystem.colors.primary.light}20`,
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }, children: item._count })] }, item.status))) }) }), _jsx(Card, { title: "Por Categoria", icon: "\uD83C\uDFF7\uFE0F", hoverable: true, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: stats.byCategory.map((item) => (_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingBottom: '8px',
                                    borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
                                }, children: [_jsx("span", { style: { fontSize: '13px', color: designSystem.colors.neutral.gray600 }, children: item.category }), _jsx("span", { style: {
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark,
                                            backgroundColor: `${designSystem.colors.accent.gold}20`,
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }, children: item._count })] }, item.category))) }) })] })), _jsx(Card, { title: "\u00DAltimas Mensagens Recebidas", icon: "\uD83D\uDCE8", hoverable: true, style: { marginBottom: '24px' }, children: _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' }, children: logs.length === 0 ? (_jsxs(_Fragment, { children: [_jsx("p", { style: {
                                    textAlign: 'center',
                                    color: designSystem.colors.neutral.gray400,
                                    padding: '8px 0 16px',
                                    margin: 0
                                }, children: "Nenhuma mensagem recebida ainda. Veja abaixo um exemplo de como ficar\u00E1:" }), _jsxs("div", { style: {
                                    backgroundColor: designSystem.colors.neutral.light,
                                    borderRadius: '8px',
                                    padding: '12px',
                                    border: `1px dashed ${designSystem.colors.neutral.gray300}`,
                                    opacity: 0.7
                                }, children: [_jsxs("div", { style: {
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '8px'
                                        }, children: [_jsxs("div", { children: [_jsx("p", { style: {
                                                            fontWeight: '600',
                                                            color: designSystem.colors.primary.dark,
                                                            margin: '0 0 4px 0'
                                                        }, children: "Jo\u00E3o da Silva (exemplo)" }), _jsx("p", { style: {
                                                            fontSize: '12px',
                                                            color: designSystem.colors.neutral.gray500,
                                                            margin: 0
                                                        }, children: "5511999999999" })] }), _jsxs("span", { style: {
                                                    fontSize: '11px',
                                                    color: designSystem.colors.neutral.gray500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }, children: [_jsx(Clock, { size: 12 }), new Date().toLocaleString('pt-BR')] })] }), _jsx("p", { style: {
                                            fontSize: '13px',
                                            color: designSystem.colors.neutral.gray600,
                                            margin: 0
                                        }, children: "Mensagem recebida via WhatsApp: \"Ol\u00E1, gostaria de saber mais sobre o andamento do meu processo.\"" })] })] })) : (logs.map((log) => (_jsxs("div", { style: {
                            backgroundColor: designSystem.colors.neutral.light,
                            borderRadius: '8px',
                            padding: '12px',
                            border: `1px solid ${designSystem.colors.neutral.gray300}`,
                            transition: designSystem.transitions.normal
                        }, onMouseEnter: (e) => {
                            e.currentTarget.style.boxShadow = designSystem.shadows.md;
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }, onMouseLeave: (e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '8px'
                                }, children: [_jsxs("div", { children: [_jsx("p", { style: {
                                                    fontWeight: '600',
                                                    color: designSystem.colors.primary.dark,
                                                    margin: '0 0 4px 0'
                                                }, children: log.lead.name }), _jsx("p", { style: {
                                                    fontSize: '12px',
                                                    color: designSystem.colors.neutral.gray500,
                                                    margin: 0
                                                }, children: log.lead.whatsappId })] }), _jsxs("span", { style: {
                                            fontSize: '11px',
                                            color: designSystem.colors.neutral.gray500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }, children: [_jsx(Clock, { size: 12 }), new Date(log.createdAt).toLocaleString('pt-BR')] })] }), _jsx("p", { style: {
                                    fontSize: '13px',
                                    color: designSystem.colors.neutral.gray600,
                                    margin: 0
                                }, children: log.description }), log.details && (_jsx("div", { style: {
                                    marginTop: '8px',
                                    fontSize: '11px',
                                    backgroundColor: designSystem.colors.neutral.light,
                                    padding: '8px',
                                    borderRadius: '6px',
                                    color: designSystem.colors.neutral.gray600,
                                    maxHeight: '80px',
                                    overflowY: 'auto',
                                    fontFamily: 'monospace'
                                }, children: JSON.stringify(JSON.parse(log.details), null, 2) }))] }, log.id)))) }) }), stats && stats.lastLeads.length > 0 && (_jsx(Card, { title: "\u00DAltimos Leads (WhatsApp)", icon: "\uD83D\uDCCB", hoverable: true, children: _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsx("tr", { style: {
                                        borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        backgroundColor: designSystem.colors.neutral.light
                                    }, children: ['Nome', 'Telefone', 'Categoria', 'Status', 'Data'].map((header) => (_jsx("th", { style: {
                                            padding: '12px 16px',
                                            textAlign: 'left',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: designSystem.colors.primary.dark
                                        }, children: header }, header))) }) }), _jsx("tbody", { children: stats.lastLeads.map((lead) => (_jsxs("tr", { style: {
                                        borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        transition: designSystem.transitions.normal
                                    }, onMouseEnter: (e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light, onMouseLeave: (e) => e.currentTarget.style.backgroundColor = 'transparent', children: [_jsx("td", { style: {
                                                padding: '12px 16px',
                                                color: designSystem.colors.primary.dark,
                                                fontWeight: '500',
                                                fontSize: '13px'
                                            }, children: lead.name }), _jsx("td", { style: {
                                                padding: '12px 16px',
                                                color: designSystem.colors.neutral.gray600,
                                                fontSize: '13px'
                                            }, children: lead.phone }), _jsx("td", { style: {
                                                padding: '12px 16px',
                                                fontSize: '12px'
                                            }, children: _jsx(Badge, { variant: "info", children: lead.category }) }), _jsx("td", { style: {
                                                padding: '12px 16px',
                                                fontSize: '12px'
                                            }, children: _jsx(Badge, { variant: lead.status === 'INITIAL' ? 'warning' : 'success', children: lead.status }) }), _jsx("td", { style: {
                                                padding: '12px 16px',
                                                color: designSystem.colors.neutral.gray500,
                                                fontSize: '12px'
                                            }, children: new Date(lead.createdAt).toLocaleDateString('pt-BR') })] }, lead.id))) })] }) }) })), !connectionStatus?.configured && (_jsxs(Card, { title: "\u2699\uFE0F Configurar WhatsApp", icon: "\uD83D\uDD27", hoverable: true, children: [_jsxs("p", { style: {
                            fontSize: '13px',
                            color: designSystem.colors.neutral.gray600,
                            marginBottom: '12px'
                        }, children: ["Para habilitar o WhatsApp, configure as vari\u00E1veis de ambiente no arquivo", ' ', _jsx("code", { style: {
                                    backgroundColor: designSystem.colors.neutral.light,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }, children: ".env" }), ":"] }), _jsx("pre", { style: {
                            backgroundColor: designSystem.colors.neutral.light,
                            padding: '16px',
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontSize: '12px',
                            color: designSystem.colors.primary.dark,
                            fontFamily: 'monospace',
                            margin: '12px 0'
                        }, children: `WHATSAPP_BUSINESS_PHONE_ID=seu-phone-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=seu-access-token
WHATSAPP_BUSINESS_ACCOUNT_ID=seu-account-id
WHATSAPP_WEBHOOK_TOKEN=webhook_token_seguro_2026` }), _jsxs("p", { style: {
                            fontSize: '12px',
                            color: designSystem.colors.neutral.gray500,
                            margin: 0
                        }, children: ["Acesse a documenta\u00E7\u00E3o em", ' ', _jsx("code", { style: {
                                    backgroundColor: designSystem.colors.neutral.light,
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }, children: "README.WHATSAPP.md" }), ' ', "para detalhes completos de configura\u00E7\u00E3o."] })] }))] }));
};
export default WhatsAppPage;
