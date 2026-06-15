import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Zap, BarChart3, FileText } from 'lucide-react';
import aiService from '@/services/aiService';

interface AIStatus {
  configured: boolean;
  provider: string;
  model: string;
  message: string;
}

interface DocumentResult {
  documentId: string;
  success: boolean;
  analysis?: {
    documentType: string;
    summary: string;
    classification: string;
    confidence: number;
  };
  error?: string;
}

export const AIPage: React.FC = () => {
  const [aiStatus, setAIStatus] = useState<AIStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingLeadId, setProcessingLeadId] = useState('');
  const [leadIdInput, setLeadIdInput] = useState('');
  const [processResults, setProcessResults] = useState<DocumentResult[]>([]);
  const [stats, setStats] = useState<{ totalDocuments: number; successCount: number }>({
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
    } catch (error: any) {
      console.error('Erro ao carregar status da IA:', error);
      setStatusError(
        error.response?.data?.error ||
          error.message ||
          'Não foi possível conectar ao servidor para verificar o status da IA.'
      );
      setAIStatus({
        configured: false,
        provider: '-',
        model: '-',
        message: 'Status indisponível.',
      });
    } finally {
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
    } catch (error: any) {
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
      setProcessingLeadId('');
    }
  };

  const getStatusBadge = (configured: boolean) => {
    if (configured) {
      return (
        <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
          <CheckCircle size={20} />
          <span>Configurado e Ativo</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg">
        <AlertCircle size={20} />
        <span>Não Configurado</span>
      </div>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-500/20 text-green-300';
    if (confidence >= 0.7) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-red-500/20 text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain size={32} className="text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Document AI Processing</h1>
        </div>
        <button
          onClick={loadAIStatus}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <Zap size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Erro ao carregar status */}
      {statusError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
          <AlertCircle size={20} />
          <span>{statusError}</span>
        </div>
      )}

      {/* Status */}
      <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Status da IA</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Status:</span>
            {aiStatus && getStatusBadge(aiStatus.configured)}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Provider:</span>
            <code className="bg-black/30 px-3 py-1 rounded text-sm">
              {aiStatus?.provider || 'Carregando...'}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Modelo:</span>
            <code className="bg-black/30 px-3 py-1 rounded text-sm">
              {aiStatus?.model || 'Carregando...'}
            </code>
          </div>
          <p className="text-sm text-gray-400 pt-2">{aiStatus?.message}</p>
        </div>
      </div>

      {/* Processar Documentos */}
      {aiStatus?.configured && (
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Processar Documentos de um Lead</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-2">ID do Lead</label>
              <input
                type="text"
                placeholder="ex: clh7q4qp80000qz900hqkcy"
                value={leadIdInput}
                onChange={(e) => setLeadIdInput(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={handleProcessLeadDocuments}
              disabled={loading || !leadIdInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Brain size={18} />
              {loading && processingLeadId === leadIdInput ? 'Processando...' : 'Processar Documentos'}
            </button>
          </div>
        </div>
      )}

      {/* Resultados */}
      {stats.totalDocuments > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total de Documentos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalDocuments}</p>
              </div>
              <FileText size={32} className="text-blue-400/50" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Processados com Sucesso</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.successCount}</p>
              </div>
              <CheckCircle size={32} className="text-green-400/50" />
            </div>
          </div>
        </div>
      )}

      {/* Detalhes dos Resultados */}
      {processResults.length > 0 && (
        <div className="bg-gradient-to-r from-white/5 to-white/10 rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Resultados da Análise</h2>
          <div className="space-y-3">
            {processResults.map((result) => (
              <div
                key={result.documentId}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-white">Documento {result.documentId.substring(0, 8)}</p>
                  </div>
                  {result.success ? (
                    <CheckCircle size={20} className="text-green-400" />
                  ) : (
                    <AlertCircle size={20} className="text-red-400" />
                  )}
                </div>

                {result.success && result.analysis && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tipo:</span>
                      <span className="text-white">{result.analysis.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Classificação:</span>
                      <span className="text-white">{result.analysis.classification}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confiança:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(result.analysis.confidence)}`}>
                        {(result.analysis.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-gray-300 mt-2">{result.analysis.summary}</p>
                  </div>
                )}

                {!result.success && result.error && (
                  <p className="text-red-300 text-sm">{result.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 p-6">
          <BarChart3 size={24} className="text-blue-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">Análise de Documentos</h3>
          <p className="text-sm text-gray-300">Extrai informações automáticas de qualquer documento</p>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 p-6">
          <FileText size={24} className="text-green-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">Classificação Inteligente</h3>
          <p className="text-sm text-gray-300">Categoriza automaticamente o tipo de documento</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 p-6">
          <Brain size={24} className="text-purple-400 mb-3" />
          <h3 className="font-semibold text-white mb-2">Preenchimento Automático</h3>
          <p className="text-sm text-gray-300">Preenche formulários com dados do cliente</p>
        </div>
      </div>

      {/* Configuração */}
      {!aiStatus?.configured && (
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-xl border border-blue-500/20 p-6">
          <h2 className="text-xl font-semibold text-blue-300 mb-4">⚙️ Configurar IA</h2>
          <p className="text-gray-300 mb-4">
            Para habilitar processamento com IA, configure a chave do Google Gemini no arquivo{' '}
            <code className="bg-black/30 px-2 py-1 rounded">.env</code>:
          </p>
          <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
{`GEMINI_API_KEY="sua-chave-aqui"`}
          </pre>
          <p className="text-sm text-gray-400 mt-4">
            Obtenha sua chave gratuitamente em{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400">
              aistudio.google.com/apikey
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default AIPage;
