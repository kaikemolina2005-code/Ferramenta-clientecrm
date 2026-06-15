import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, AlertCircle, Zap, BarChart3, FileText } from 'lucide-react';
import aiService from '@/services/aiService';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';

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
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);
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
        setEmptyMessage(
          'Nenhum documento encontrado para este lead. Faça upload de um documento na página "Documentos" ou no cadastro do lead e tente novamente.'
        );
      }

      setLeadIdInput('');
    } catch (error: any) {
      alert(`Erro: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
      setProcessingLeadId('');
    }
  };

  const getStatusBadge = (configured: boolean) => {
    return (
      <Badge variant={configured ? 'success' : 'warning'}>
        {configured ? '✅ Configurado e Ativo' : '⚠️ Não Configurado'}
      </Badge>
    );
  };

  const getConfidenceVariant = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain size={32} style={{ color: designSystem.colors.primary.dark }} />
          <h1 className="text-3xl font-bold" style={{ color: designSystem.colors.primary.dark }}>
            Processamento de Documentos com IA
          </h1>
        </div>
        <button
          onClick={loadAIStatus}
          disabled={loading}
          className="p-2 rounded-lg transition hover:bg-gray-100"
          style={{ color: designSystem.colors.primary.dark }}
        >
          <Zap size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Erro ao carregar status */}
      {statusError && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ backgroundColor: '#f8d7da', color: designSystem.colors.status.error }}
        >
          <AlertCircle size={20} />
          <span>{statusError}</span>
        </div>
      )}

      {/* Status */}
      <Card title="Status da IA" icon="🧠">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span style={{ color: designSystem.colors.neutral.gray500 }}>Status:</span>
            {aiStatus && getStatusBadge(aiStatus.configured)}
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: designSystem.colors.neutral.gray500 }}>Provider:</span>
            <code
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.primary.dark }}
            >
              {aiStatus?.provider || 'Carregando...'}
            </code>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: designSystem.colors.neutral.gray500 }}>Modelo:</span>
            <code
              className="px-3 py-1 rounded text-sm"
              style={{ backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.primary.dark }}
            >
              {aiStatus?.model || 'Carregando...'}
            </code>
          </div>
          <p className="text-sm pt-2" style={{ color: designSystem.colors.neutral.gray500 }}>
            {aiStatus?.message}
          </p>
        </div>
      </Card>

      {/* Como testar */}
      {aiStatus?.configured && (
        <Card title="Como testar a IA" icon="📝">
          <ol className="space-y-2 text-sm list-decimal list-inside" style={{ color: designSystem.colors.neutral.gray600 }}>
            <li>
              Vá até a página <strong>Documentos</strong> (ou abra o cadastro de um lead) e faça o
              upload de um arquivo (ex: PDF ou TXT) vinculado a um lead.
            </li>
            <li>
              Copie o <strong>ID do lead</strong> ao qual o documento foi vinculado (ele aparece na
              listagem de leads ou na URL da página do lead).
            </li>
            <li>
              Cole o ID no campo <strong>"ID do Lead"</strong> abaixo e clique em{' '}
              <strong>"Processar Documentos"</strong>.
            </li>
            <li>
              Aguarde o processamento. A IA vai analisar cada documento não processado e exibir o
              tipo, a classificação, o nível de confiança e um resumo do conteúdo.
            </li>
          </ol>
        </Card>
      )}

      {/* Para que serve */}
      {aiStatus?.configured && (
        <Card title="Como isso ajuda o escritório" icon="💡">
          <ul className="space-y-3 text-sm" style={{ color: designSystem.colors.neutral.gray600 }}>
            <li>
              <strong>Triagem automática de documentos:</strong> quando um cliente envia RG, CPF,
              comprovante de renda, declarações, contratos, etc., a IA já identifica o tipo e classifica
              o documento sem alguém precisar abrir e ler manualmente.
            </li>
            <li>
              <strong>Resumo rápido:</strong> em vez de ler o documento inteiro, o advogado/equipe vê um
              resumo de 2-3 linhas do conteúdo — útil para casos com muitos anexos (ex: processos de
              INSS, aposentadoria, BPC/LOAS).
            </li>
            <li>
              <strong>Extração de dados:</strong> nomes, CPF, valores, datas, endereços já saem
              estruturados — pode alimentar formulários/petições automaticamente (função "Preenchimento
              Automático").
            </li>
            <li>
              <strong>Indicador de confiança:</strong> mostra o quão segura a IA está da classificação,
              então a equipe sabe quando vale revisar manualmente (confiança baixa) e quando pode
              confiar direto (confiança alta, como 90-95% nos testes).
            </li>
          </ul>
        </Card>
      )}

      {/* Processar Documentos */}
      {aiStatus?.configured && (
        <Card title="Processar Documentos de um Lead" icon="⚙️">
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-2" style={{ color: designSystem.colors.neutral.gray600 }}>
                ID do Lead
              </label>
              <input
                type="text"
                placeholder="ex: clh7q4qp80000qz900hqkcy"
                value={leadIdInput}
                onChange={(e) => setLeadIdInput(e.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{
                  backgroundColor: designSystem.colors.neutral.white,
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  color: designSystem.colors.neutral.black,
                }}
              />
            </div>
            <Button
              onClick={handleProcessLeadDocuments}
              disabled={loading || !leadIdInput.trim()}
              className="w-full flex items-center justify-center gap-2"
            >
              <Brain size={18} />
              {loading && processingLeadId === leadIdInput ? 'Processando...' : 'Processar Documentos'}
            </Button>
          </div>
        </Card>
      )}

      {/* Mensagem de nenhum documento */}
      {emptyMessage && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-lg"
          style={{ backgroundColor: '#fff3cd', color: designSystem.colors.status.warning }}
        >
          <AlertCircle size={20} />
          <span>{emptyMessage}</span>
        </div>
      )}

      {/* Resultados */}
      {stats.totalDocuments > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
                  Total de Documentos
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: designSystem.colors.primary.dark }}>
                  {stats.totalDocuments}
                </p>
              </div>
              <FileText size={32} style={{ color: designSystem.colors.primary.light }} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
                  Processados com Sucesso
                </p>
                <p className="text-3xl font-bold mt-2" style={{ color: designSystem.colors.status.success }}>
                  {stats.successCount}
                </p>
              </div>
              <CheckCircle size={32} style={{ color: designSystem.colors.status.success }} />
            </div>
          </Card>
        </div>
      )}

      {/* Detalhes dos Resultados */}
      {processResults.length > 0 && (
        <Card title="Resultados da Análise" icon="📊">
          <div className="space-y-3">
            {processResults.map((result) => (
              <div
                key={result.documentId}
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                  borderColor: result.success ? designSystem.colors.status.success : designSystem.colors.status.error,
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold" style={{ color: designSystem.colors.neutral.black }}>
                    Documento {result.documentId.substring(0, 8)}
                  </p>
                  {result.success ? (
                    <CheckCircle size={20} style={{ color: designSystem.colors.status.success }} />
                  ) : (
                    <AlertCircle size={20} style={{ color: designSystem.colors.status.error }} />
                  )}
                </div>

                {result.success && result.analysis && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: designSystem.colors.neutral.gray500 }}>Tipo:</span>
                      <span style={{ color: designSystem.colors.neutral.black }}>{result.analysis.documentType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: designSystem.colors.neutral.gray500 }}>Classificação:</span>
                      <span style={{ color: designSystem.colors.neutral.black }}>{result.analysis.classification}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ color: designSystem.colors.neutral.gray500 }}>Confiança:</span>
                      <Badge variant={getConfidenceVariant(result.analysis.confidence)} size="sm">
                        {(result.analysis.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <p className="mt-2" style={{ color: designSystem.colors.neutral.gray600 }}>
                      {result.analysis.summary}
                    </p>
                  </div>
                )}

                {!result.success && result.error && (
                  <p className="text-sm" style={{ color: designSystem.colors.status.error }}>
                    {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recursos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <BarChart3 size={24} style={{ color: designSystem.colors.primary.light }} className="mb-3" />
          <h3 className="font-semibold mb-2" style={{ color: designSystem.colors.primary.dark }}>
            Análise de Documentos
          </h3>
          <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
            Extrai informações automáticas de qualquer documento
          </p>
        </Card>

        <Card>
          <FileText size={24} style={{ color: designSystem.colors.status.success }} className="mb-3" />
          <h3 className="font-semibold mb-2" style={{ color: designSystem.colors.primary.dark }}>
            Classificação Inteligente
          </h3>
          <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
            Categoriza automaticamente o tipo de documento
          </p>
        </Card>

        <Card>
          <Brain size={24} style={{ color: designSystem.colors.accent.dark }} className="mb-3" />
          <h3 className="font-semibold mb-2" style={{ color: designSystem.colors.primary.dark }}>
            Preenchimento Automático
          </h3>
          <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
            Preenche formulários com dados do cliente
          </p>
        </Card>
      </div>

      {/* Configuração */}
      {!aiStatus?.configured && (
        <Card title="⚙️ Configurar IA">
          <p className="mb-4" style={{ color: designSystem.colors.neutral.gray600 }}>
            Para habilitar processamento com IA, configure a chave da Groq no arquivo{' '}
            <code className="px-2 py-1 rounded" style={{ backgroundColor: designSystem.colors.neutral.gray100 }}>
              .env
            </code>
            :
          </p>
          <pre
            className="p-4 rounded-lg overflow-x-auto text-sm"
            style={{ backgroundColor: designSystem.colors.neutral.gray100, color: designSystem.colors.neutral.gray600 }}
          >
{`GROQ_API_KEY="sua-chave-aqui"`}
          </pre>
          <p className="text-sm mt-4" style={{ color: designSystem.colors.neutral.gray500 }}>
            Obtenha sua chave gratuitamente em{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              style={{ color: designSystem.colors.primary.light }}
            >
              console.groq.com/keys
            </a>
          </p>
        </Card>
      )}
    </div>
  );
};

export default AIPage;
