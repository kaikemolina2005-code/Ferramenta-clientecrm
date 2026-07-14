import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Zap, BarChart3, FileText } from 'lucide-react';
import aiService from '@/services/aiService';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
export const AIPage = () => {
    const [aiStatus, setAIStatus] = useState(null);
    const [statusError, setStatusError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processingLeadId, setProcessingLeadId] = useState('');
    const [leadIdInput, setLeadIdInput] = useState('');
    const [processResults, setProcessResults] = useState([]);
    const [emptyMessage, setEmptyMessage] = useState(null);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        successCount: 0,
    });
    useEffect(() => {
        loadAIStatus();
    }, []);
    const loadAIStatus = async () => {
        try {
            setLoading(true);
            setStatusError(null);
            const status = await aiService.getStatus();
            setAIStatus(status);
        }
        catch (error) {
            console.error('Erro ao carregar status da IA:', error);
            setStatusError(error.response?.data?.error ||
                error.message ||
                'Não foi possível conectar ao servidor para verificar o status da IA.');
            setAIStatus({
                configured: false,
                provider: '-',
                model: '-',
                message: 'Status indisponível.',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleProcessLeadDocuments = async () => {
        if (!leadIdInput.trim()) {
            alert('Digite o ID do lead');
            return;
        }
        try {
            setLoading(true);
            setProcessingLeadId(leadIdInput);
            setEmptyMessage(null);
            setProcessResults([]);
            setStats({ totalDocuments: 0, successCount: 0 });
            const result = await aiService.processAllDocuments(leadIdInput);
            const totalDocuments = result.totalDocuments || 0;
            const successCount = result.processedCount || 0;
            const results = result.results || [];
            setStats({ totalDocuments, successCount });
            setProcessResults(results);
            if (totalDocuments === 0) {
                setEmptyMessage('Nenhum documento encontrado para este lead. Faça upload de um documento na página "Documentos" ou no cadastro do lead e tente novamente.');
            }
            setLeadIdInput('');
        }
        catch (error) {
            alert(`Erro: ${error.response?.data?.error || error.message}`);
        }
        finally {
            setLoading(false);
            setProcessingLeadId('');
        }
    };
    const getStatusBadge = (configured) => {
        return (_jsx(Badge, { variant: configured ? 'success' : 'warning', children: configured ? '✅ Configurado e Ativo' : '⚠️ Não Configurado' }));
    };
    const getConfidenceVariant = (confidence) => {
        if (confidence >= 0.9)
            return 'success';
        if (confidence >= 0.7)
            return 'warning';
        return 'error';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Brain, { size: 32, style: { color: designSystem.colors.primary.dark } }), _jsx("h1", { className: "text-3xl font-bold", style: { color: designSystem.colors.primary.dark }, children: "Processamento de Documentos com IA" })] }), _jsx("button", { onClick: loadAIStatus, disabled: loading, className: "p-2 rounded-lg transition hover:bg-gray-100", style: { color: designSystem.colors.primary.dark }, children: _jsx(Zap, { size: 20, className: loading ? 'animate-spin' : '' }) })] }), statusError && (_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-lg", style: { backgroundColor: '#f8d7da', color: designSystem.colors.status.error }, children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: statusError })] })), _jsx(Card, { title: "Status da IA", icon: "\uD83E\uDDE0", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Status:" }), aiStatus && getStatusBadge(aiStatus.configured)] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Provider:" }), _jsx("code", { className: "px-3 py-1 rounded text-sm", style: { backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.primary.dark }, children: aiStatus?.provider || 'Carregando...' })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Modelo:" }), _jsx("code", { className: "px-3 py-1 rounded text-sm", style: { backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.primary.dark }, children: aiStatus?.model || 'Carregando...' })] }), _jsx("p", { className: "text-sm pt-2", style: { color: designSystem.colors.neutral.gray500 }, children: aiStatus?.message })] }) }), aiStatus?.configured && (_jsx(Card, { title: "Como testar a IA", icon: "\uD83D\uDCDD", children: _jsxs("ol", { className: "space-y-2 text-sm list-decimal list-inside", style: { color: designSystem.colors.neutral.gray600 }, children: [_jsxs("li", { children: ["V\u00E1 at\u00E9 a p\u00E1gina ", _jsx("strong", { children: "Documentos" }), " (ou abra o cadastro de um lead) e fa\u00E7a o upload de um arquivo (ex: PDF ou TXT) vinculado a um lead."] }), _jsxs("li", { children: ["Copie o ", _jsx("strong", { children: "ID do lead" }), " ao qual o documento foi vinculado (ele aparece na listagem de leads ou na URL da p\u00E1gina do lead)."] }), _jsxs("li", { children: ["Cole o ID no campo ", _jsx("strong", { children: "\"ID do Lead\"" }), " abaixo e clique em", ' ', _jsx("strong", { children: "\"Processar Documentos\"" }), "."] }), _jsx("li", { children: "Aguarde o processamento. A IA vai analisar cada documento n\u00E3o processado e exibir o tipo, a classifica\u00E7\u00E3o, o n\u00EDvel de confian\u00E7a e um resumo do conte\u00FAdo." })] }) })), aiStatus?.configured && (_jsx(Card, { title: "Como isso ajuda o escrit\u00F3rio", icon: "\uD83D\uDCA1", children: _jsxs("ul", { className: "space-y-3 text-sm", style: { color: designSystem.colors.neutral.gray600 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Triagem autom\u00E1tica de documentos:" }), " quando um cliente envia RG, CPF, comprovante de renda, declara\u00E7\u00F5es, contratos, etc., a IA j\u00E1 identifica o tipo e classifica o documento sem algu\u00E9m precisar abrir e ler manualmente."] }), _jsxs("li", { children: [_jsx("strong", { children: "Resumo r\u00E1pido:" }), " em vez de ler o documento inteiro, o advogado/equipe v\u00EA um resumo de 2-3 linhas do conte\u00FAdo \u2014 \u00FAtil para casos com muitos anexos (ex: processos de INSS, aposentadoria, BPC/LOAS)."] }), _jsxs("li", { children: [_jsx("strong", { children: "Extra\u00E7\u00E3o de dados:" }), " nomes, CPF, valores, datas, endere\u00E7os j\u00E1 saem estruturados \u2014 pode alimentar formul\u00E1rios/peti\u00E7\u00F5es automaticamente (fun\u00E7\u00E3o \"Preenchimento Autom\u00E1tico\")."] }), _jsxs("li", { children: [_jsx("strong", { children: "Indicador de confian\u00E7a:" }), " mostra o qu\u00E3o segura a IA est\u00E1 da classifica\u00E7\u00E3o, ent\u00E3o a equipe sabe quando vale revisar manualmente (confian\u00E7a baixa) e quando pode confiar direto (confian\u00E7a alta, como 90-95% nos testes)."] })] }) })), aiStatus?.configured && (_jsx(Card, { title: "Processar Documentos de um Lead", icon: "\u2699\uFE0F", children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm mb-2", style: { color: designSystem.colors.neutral.gray600 }, children: "ID do Lead" }), _jsx("input", { type: "text", placeholder: "ex: clh7q4qp80000qz900hqkcy", value: leadIdInput, onChange: (e) => setLeadIdInput(e.target.value), className: "w-full rounded-lg px-4 py-2", style: {
                                        backgroundColor: designSystem.colors.neutral.white,
                                        border: `1px solid ${designSystem.colors.neutral.gray300}`,
                                        color: designSystem.colors.neutral.black,
                                    } })] }), _jsxs(Button, { onClick: handleProcessLeadDocuments, disabled: loading || !leadIdInput.trim(), className: "w-full flex items-center justify-center gap-2", children: [_jsx(Brain, { size: 18 }), loading && processingLeadId === leadIdInput ? 'Processando...' : 'Processar Documentos'] })] }) })), emptyMessage && (_jsxs("div", { className: "flex items-center gap-2 px-4 py-3 rounded-lg", style: { backgroundColor: '#fff3cd', color: designSystem.colors.status.warning }, children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: emptyMessage })] })), stats.totalDocuments > 0 && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Total de Documentos" }), _jsx("p", { className: "text-3xl font-bold mt-2", style: { color: designSystem.colors.primary.dark }, children: stats.totalDocuments })] }), _jsx(FileText, { size: 32, style: { color: designSystem.colors.primary.light } })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Processados com Sucesso" }), _jsx("p", { className: "text-3xl font-bold mt-2", style: { color: designSystem.colors.status.success }, children: stats.successCount })] }), _jsx(CheckCircle, { size: 32, style: { color: designSystem.colors.status.success } })] }) })] })), processResults.length > 0 && (_jsx(Card, { title: "Resultados da An\u00E1lise", icon: "\uD83D\uDCCA", children: _jsx("div", { className: "space-y-3", children: processResults.map((result) => (_jsxs("div", { className: "p-4 rounded-lg border", style: {
                            backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                            borderColor: result.success ? designSystem.colors.status.success : designSystem.colors.status.error,
                        }, children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("p", { className: "font-semibold", style: { color: designSystem.colors.neutral.black }, children: ["Documento ", result.documentId.substring(0, 8)] }), result.success ? (_jsx(CheckCircle, { size: 20, style: { color: designSystem.colors.status.success } })) : (_jsx(AlertCircle, { size: 20, style: { color: designSystem.colors.status.error } }))] }), result.success && result.analysis && (_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Tipo:" }), _jsx("span", { style: { color: designSystem.colors.neutral.black }, children: result.analysis.documentType })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Classifica\u00E7\u00E3o:" }), _jsx("span", { style: { color: designSystem.colors.neutral.black }, children: result.analysis.classification })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { style: { color: designSystem.colors.neutral.gray500 }, children: "Confian\u00E7a:" }), _jsxs(Badge, { variant: getConfidenceVariant(result.analysis.confidence), size: "sm", children: [(result.analysis.confidence * 100).toFixed(0), "%"] })] }), _jsx("p", { className: "mt-2", style: { color: designSystem.colors.neutral.gray600 }, children: result.analysis.summary })] })), !result.success && result.error && (_jsx("p", { className: "text-sm", style: { color: designSystem.colors.status.error }, children: result.error }))] }, result.documentId))) }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { children: [_jsx(BarChart3, { size: 24, style: { color: designSystem.colors.primary.light }, className: "mb-3" }), _jsx("h3", { className: "font-semibold mb-2", style: { color: designSystem.colors.primary.dark }, children: "An\u00E1lise de Documentos" }), _jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Extrai informa\u00E7\u00F5es autom\u00E1ticas de qualquer documento" })] }), _jsxs(Card, { children: [_jsx(FileText, { size: 24, style: { color: designSystem.colors.status.success }, className: "mb-3" }), _jsx("h3", { className: "font-semibold mb-2", style: { color: designSystem.colors.primary.dark }, children: "Classifica\u00E7\u00E3o Inteligente" }), _jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Categoriza automaticamente o tipo de documento" })] }), _jsxs(Card, { children: [_jsx(Brain, { size: 24, style: { color: designSystem.colors.accent.dark }, className: "mb-3" }), _jsx("h3", { className: "font-semibold mb-2", style: { color: designSystem.colors.primary.dark }, children: "Preenchimento Autom\u00E1tico" }), _jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Preenche formul\u00E1rios com dados do cliente" })] })] }), !aiStatus?.configured && (_jsxs(Card, { title: "\u2699\uFE0F Configurar IA", children: [_jsxs("p", { className: "mb-4", style: { color: designSystem.colors.neutral.gray600 }, children: ["Para habilitar processamento com IA, configure a chave da Groq no arquivo", ' ', _jsx("code", { className: "px-2 py-1 rounded", style: { backgroundColor: designSystem.colors.neutral.gray100 }, children: ".env" }), ":"] }), _jsx("pre", { className: "p-4 rounded-lg overflow-x-auto text-sm", style: { backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.neutral.gray600 }, children: `GROQ_API_KEY="sua-chave-aqui"` }), _jsxs("p", { className: "text-sm mt-4", style: { color: designSystem.colors.neutral.gray500 }, children: ["Obtenha sua chave gratuitamente em", ' ', _jsx("a", { href: "https://console.groq.com/keys", target: "_blank", rel: "noreferrer", style: { color: designSystem.colors.primary.light }, children: "console.groq.com/keys" })] })] }))] }));
};
export default AIPage;
