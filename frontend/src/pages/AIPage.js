import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Zap, BarChart3, FileText } from 'lucide-react';
import aiService from '@/services/aiService';
export const AIPage = () => {
    const [aiStatus, setAIStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processingLeadId, setProcessingLeadId] = useState('');
    const [leadIdInput, setLeadIdInput] = useState('');
    const [processResults, setProcessResults] = useState([]);
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
            const status = await aiService.getStatus();
            setAIStatus(status);
        }
        catch (error) {
            console.error('Erro ao carregar status da IA:', error);
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
            const result = await aiService.processAllDocuments(leadIdInput);
            setStats({
                totalDocuments: result.totalDocuments,
                successCount: result.processedCount,
            });
            setProcessResults(result.results);
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
        if (configured) {
            return (_jsxs("div", { className: "flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg", children: [_jsx(CheckCircle, { size: 20 }), _jsx("span", { children: "Configurado e Ativo" })] }));
        }
        return (_jsxs("div", { className: "flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg", children: [_jsx(AlertCircle, { size: 20 }), _jsx("span", { children: "N\u00E3o Configurado" })] }));
    };
    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.9)
            return 'bg-green-500/20 text-green-300';
        if (confidence >= 0.7)
            return 'bg-yellow-500/20 text-yellow-300';
        return 'bg-red-500/20 text-red-300';
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Brain, { size: 32, className: "text-blue-400" }), _jsx("h1", { className: "text-3xl font-bold text-white", children: "Document AI Processing" })] }), _jsx("button", { onClick: loadAIStatus, disabled: loading, className: "p-2 hover:bg-white/10 rounded-lg transition", children: _jsx(Zap, { size: 20, className: loading ? 'animate-spin' : '' }) })] }), _jsxs("div", { className: "bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Status da IA" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Status:" }), aiStatus && getStatusBadge(aiStatus.configured)] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Provider:" }), _jsx("code", { className: "bg-black/30 px-3 py-1 rounded text-sm", children: aiStatus?.provider || 'Carregando...' })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Modelo:" }), _jsx("code", { className: "bg-black/30 px-3 py-1 rounded text-sm", children: aiStatus?.model || 'Carregando...' })] }), _jsx("p", { className: "text-sm text-gray-400 pt-2", children: aiStatus?.message })] })] }), aiStatus?.configured && (_jsxs("div", { className: "bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Processar Documentos de um Lead" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm text-gray-300 mb-2", children: "ID do Lead" }), _jsx("input", { type: "text", placeholder: "ex: clh7q4qp80000qz900hqkcy", value: leadIdInput, onChange: (e) => setLeadIdInput(e.target.value), className: "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500" })] }), _jsxs("button", { onClick: handleProcessLeadDocuments, disabled: loading || !leadIdInput.trim(), className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition", children: [_jsx(Brain, { size: 18 }), loading && processingLeadId === leadIdInput ? 'Processando...' : 'Processar Documentos'] })] })] })), stats.totalDocuments > 0 && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { className: "bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-300 text-sm", children: "Total de Documentos" }), _jsx("p", { className: "text-3xl font-bold text-white mt-2", children: stats.totalDocuments })] }), _jsx(FileText, { size: 32, className: "text-blue-400/50" })] }) }), _jsx("div", { className: "bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-gray-300 text-sm", children: "Processados com Sucesso" }), _jsx("p", { className: "text-3xl font-bold text-green-400 mt-2", children: stats.successCount })] }), _jsx(CheckCircle, { size: 32, className: "text-green-400/50" })] }) })] })), processResults.length > 0 && (_jsxs("div", { className: "bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-white mb-4", children: "Resultados da An\u00E1lise" }), _jsx("div", { className: "space-y-3", children: processResults.map((result) => (_jsxs("div", { className: `p-4 rounded-lg border ${result.success
                                ? 'bg-green-500/10 border-green-500/20'
                                : 'bg-red-500/10 border-red-500/20'}`, children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("div", { children: _jsxs("p", { className: "font-semibold text-white", children: ["Documento ", result.documentId.substring(0, 8)] }) }), result.success ? (_jsx(CheckCircle, { size: 20, className: "text-green-400" })) : (_jsx(AlertCircle, { size: 20, className: "text-red-400" }))] }), result.success && result.analysis && (_jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Tipo:" }), _jsx("span", { className: "text-white", children: result.analysis.documentType })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Classifica\u00E7\u00E3o:" }), _jsx("span", { className: "text-white", children: result.analysis.classification })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-400", children: "Confian\u00E7a:" }), _jsxs("span", { className: `px-2 py-1 rounded text-xs ${getConfidenceColor(result.analysis.confidence)}`, children: [(result.analysis.confidence * 100).toFixed(0), "%"] })] }), _jsx("p", { className: "text-gray-300 mt-2", children: result.analysis.summary })] })), !result.success && result.error && (_jsx("p", { className: "text-red-300 text-sm", children: result.error }))] }, result.documentId))) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 p-6", children: [_jsx(BarChart3, { size: 24, className: "text-blue-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "An\u00E1lise de Documentos" }), _jsx("p", { className: "text-sm text-gray-300", children: "Extrai informa\u00E7\u00F5es autom\u00E1ticas de qualquer documento" })] }), _jsxs("div", { className: "bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 p-6", children: [_jsx(FileText, { size: 24, className: "text-green-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "Classifica\u00E7\u00E3o Inteligente" }), _jsx("p", { className: "text-sm text-gray-300", children: "Categoriza automaticamente o tipo de documento" })] }), _jsxs("div", { className: "bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 p-6", children: [_jsx(Brain, { size: 24, className: "text-purple-400 mb-3" }), _jsx("h3", { className: "font-semibold text-white mb-2", children: "Preenchimento Autom\u00E1tico" }), _jsx("p", { className: "text-sm text-gray-300", children: "Preenche formul\u00E1rios com dados do cliente" })] })] }), !aiStatus?.configured && (_jsxs("div", { className: "bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-blue-300 mb-4", children: "\u2699\uFE0F Configurar IA" }), _jsxs("p", { className: "text-gray-300 mb-4", children: ["Para habilitar processamento com IA, configure a chave OpenAI no arquivo", ' ', _jsx("code", { className: "bg-black/30 px-2 py-1 rounded", children: ".env" }), ":"] }), _jsx("pre", { className: "bg-black/30 p-4 rounded-lg overflow-x-auto text-sm text-gray-300", children: `OPENAI_API_KEY="sk-your-api-key-here"` }), _jsxs("p", { className: "text-sm text-gray-400 mt-4", children: ["Obtenha sua chave em", ' ', _jsx("a", { href: "https://platform.openai.com/api-keys", target: "_blank", rel: "noreferrer", className: "text-blue-400", children: "platform.openai.com/api-keys" })] })] }))] }));
};
export default AIPage;
