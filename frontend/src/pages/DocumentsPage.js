import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { documentService } from '@/services/documentService';
import { GlassCard } from '@/components/Common';
export function DocumentsPage() {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    useEffect(() => {
        loadDocuments();
    }, []);
    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            // Nota: Será implementado com seleção de lead
            // const docs = await documentService.getLeadDocuments(leadId);
            // setDocuments(docs);
        }
        catch (error) {
            console.error('Erro ao carregar documentos:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tamanho (máx 4MB)
            if (file.size > 4 * 1024 * 1024) {
                alert('Arquivo muito grande. Máximo 4MB');
                return;
            }
            // Validar tipo
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png',
            ];
            if (!allowedTypes.includes(file.type)) {
                alert('Tipo de arquivo não permitido');
                return;
            }
            setSelectedFile(file);
        }
    };
    const handleUpload = async () => {
        if (!selectedFile)
            return;
        try {
            setIsLoading(true);
            setUploadProgress(0);
            // Simular progresso
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => Math.min(prev + 10, 90));
            }, 200);
            // Upload será implementado com seleção de lead
            // await documentService.uploadDocument(leadId, selectedFile);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setSelectedFile(null);
            await loadDocuments();
            setTimeout(() => setUploadProgress(0), 1000);
        }
        catch (error) {
            console.error('Erro ao fazer upload:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDelete = async (documentId) => {
        if (window.confirm('Tem certeza que deseja deletar este documento?')) {
            try {
                await documentService.deleteDocument(documentId);
                setDocuments(documents.filter((doc) => doc.id !== documentId));
            }
            catch (error) {
                console.error('Erro ao deletar documento:', error);
            }
        }
    };
    const handleDownload = async (documentId) => {
        try {
            await documentService.downloadDocument(documentId);
        }
        catch (error) {
            console.error('Erro ao baixar documento:', error);
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-3xl font-bold text-dark-blue font-poppins", children: "Documentos" }) }), _jsxs(GlassCard, { className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold text-dark-blue mb-4", children: "\uD83D\uDCE4 Upload de Documento" }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "border-2 border-dashed border-dark-blue rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors", children: _jsxs("label", { htmlFor: "file-input", className: "cursor-pointer block", children: [_jsx("p", { className: "text-lg font-semibold text-dark-blue", children: "Selecione um arquivo" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "PDF, DOC, DOCX, JPG ou PNG (m\u00E1x 4MB)" }), _jsx("input", { id: "file-input", type: "file", onChange: handleFileChange, className: "hidden", accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png" })] }) }), selectedFile && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm font-semibold text-dark-blue", children: "Arquivo selecionado:" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: selectedFile.name }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [(selectedFile.size / 1024 / 1024).toFixed(2), " MB"] })] })), uploadProgress > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-dark-blue h-2 rounded-full transition-all duration-300", style: { width: `${uploadProgress}%` } }) }), _jsxs("p", { className: "text-sm text-gray-600", children: [uploadProgress, "% conclu\u00EDdo"] })] })), _jsx("button", { onClick: handleUpload, disabled: !selectedFile || isLoading, className: "w-full px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all", children: isLoading ? 'Enviando...' : 'Fazer Upload' })] })] }), _jsxs(GlassCard, { className: "p-6", children: [_jsx("h2", { className: "text-xl font-bold text-dark-blue mb-4", children: "\uD83D\uDCC4 Meus Documentos" }), isLoading && !documents.length ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dark-blue mx-auto" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Carregando documentos..." })] })) : documents.length === 0 ? (_jsx("div", { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Nenhum documento enviado ainda" }) })) : (_jsx("div", { className: "space-y-3", children: documents.map((doc) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-light-gray rounded-lg hover:shadow-md transition-all", children: [_jsxs("div", { className: "flex items-center gap-4 flex-1", children: [_jsx("div", { className: "text-2xl", children: doc.type?.includes('pdf') ? '📕' : doc.type?.includes('word') ? '📗' : '📄' }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-dark-blue", children: doc.name }), _jsx("p", { className: "text-xs text-gray-500", children: new Date(doc.createdAt).toLocaleDateString('pt-BR') })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleDownload(doc.id), className: "px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors", children: "\u2B07\uFE0F Download" }), _jsx("button", { onClick: () => handleDelete(doc.id), className: "px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors", children: "\uD83D\uDDD1\uFE0F Deletar" })] })] }, doc.id))) }))] }), _jsx("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-700", children: ["\u2139\uFE0F ", _jsx("strong", { children: "Nota:" }), " Os documentos ser\u00E3o automaticamente salvos no OneDrive ap\u00F3s configurar as credenciais do Microsoft Azure."] }) })] }));
}
