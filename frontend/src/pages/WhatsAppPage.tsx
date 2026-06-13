import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import axios from 'axios';

interface ConnectionStatus {
  configured: boolean;
  phoneNumberId: string;
}

interface Activity {
  id: string;
  leadId: string;
  type: string;
  description: string;
  details: string;
  createdAt: string;
  lead: {
    id: string;
    name: string;
    whatsappId: string;
  };
}

interface Stats {
  totalLeads: number;
  byStatus: { status: string; _count: number }[];
  byCategory: { category: string; _count: number }[];
  lastLeads: any[];
}

export const WhatsAppPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [logs, setLogs] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Atualizar a cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusRes, logsRes, statsRes] = await Promise.all([
        axios.get('/api/whatsapp/status').catch(e => ({ data: { configured: false, phoneNumberId: 'Erro ao conectar' } })),
        axios.get('/api/whatsapp/logs?limit=10').catch(e => ({ data: [] })),
        axios.get('/api/whatsapp/stats').catch(e => ({ data: null })),
      ]);

      setConnectionStatus(statusRes.data);
      setLogs(logsRes.data || []);
      setStats(statsRes.data);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Erro ao carregar dados do WhatsApp';
      console.error('Erro ao carregar dados:', error);
      setError(errorMsg);
    } finally {
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
      const response = await axios.post('/api/whatsapp/send-test', {
        phoneNumber: testPhone.replace(/\D/g, ''), // Remove caracteres não-numéricos
        message: testMessage,
      });

      setSendResult({ success: true, message: response.data.message });
      setTestMessage('');
      setTestPhone('');
      setTimeout(() => setSendResult(null), 5000);
    } catch (error: any) {
      setSendResult({
        success: false,
        message: error.response?.data?.error || 'Erro ao enviar mensagem',
      });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (configured: boolean) => {
    if (configured) {
      return <Badge variant="success">🟢 Conectado</Badge>;
    }
    return <Badge variant="warning">⚫ Não Configurado</Badge>;
  };

  const renderLogDetails = (details: unknown) => {
    if (!details) return null;

    if (typeof details === 'string') {
      try {
        return JSON.stringify(JSON.parse(details), null, 2);
      } catch {
        return details;
      }
    }

    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: designSystem.colors.neutral.light,
      minHeight: '100vh'
    }}>
      {/* Erro Banner */}
      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '24px',
          borderRadius: '8px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          color: '#721c24',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: designSystem.colors.primary.dark
        }}>
          💬 WhatsApp Integration
        </h1>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: designSystem.colors.primary.dark,
            color: designSystem.colors.neutral.white,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: designSystem.transitions.normal,
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.primary.light}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.primary.dark}
        >
          {loading ? '⌛' : '🔄'} Atualizar
        </button>
      </div>

      {/* Status */}
      <Card title="Status da Conexão" icon="🔌" hoverable style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
          }}>
            <span style={{ color: designSystem.colors.neutral.gray600, fontWeight: '500' }}>
              Status:
            </span>
            {connectionStatus && getStatusBadge(connectionStatus.configured)}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: designSystem.colors.neutral.gray600, fontWeight: '500' }}>
              Phone ID:
            </span>
            <code style={{
              backgroundColor: designSystem.colors.neutral.light,
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: designSystem.colors.primary.dark
            }}>
              {connectionStatus?.phoneNumberId || 'Não configurado'}
            </code>
          </div>
        </div>
      </Card>

      {/* Teste de Mensagem */}
      {connectionStatus?.configured && (
        <Card title="Enviar Mensagem de Teste" icon="✉️" hoverable style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: designSystem.colors.primary.dark,
                marginBottom: '8px'
              }}>
                Número WhatsApp
              </label>
              <input
                type="text"
                placeholder="ex: 5511999999999"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: designSystem.colors.primary.dark,
                marginBottom: '8px'
              }}>
                Mensagem
              </label>
              <textarea
                placeholder="Digite a mensagem..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, sans-serif',
                  resize: 'vertical'
                }}
              />
            </div>
            <Button
              variant={sending ? 'secondary' : 'primary'}
              onClick={handleSendTestMessage}
              disabled={sending}
            >
              {sending ? '⌛ Enviando...' : '✉️ Enviar Mensagem'}
            </Button>
            {sendResult && (
              <div
                style={{
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
                }}
              >
                {sendResult.message}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Estatísticas */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          <Card title="Total de Leads" icon="👥" hoverable>
            <p style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: designSystem.colors.primary.dark,
              margin: '0'
            }}>
              {stats.totalLeads}
            </p>
          </Card>

          <Card title="Por Status" icon="📊" hoverable>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.byStatus.map((item) => (
                <div
                  key={item.status}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
                  }}
                >
                  <span style={{ fontSize: '13px', color: designSystem.colors.neutral.gray600 }}>
                    {item.status}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: designSystem.colors.primary.dark,
                    backgroundColor: `${designSystem.colors.primary.light}20`,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {item._count}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Por Categoria" icon="🏷️" hoverable>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.byCategory.map((item) => (
                <div
                  key={item.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`
                  }}
                >
                  <span style={{ fontSize: '13px', color: designSystem.colors.neutral.gray600 }}>
                    {item.category}
                  </span>
                  <span style={{
                    fontWeight: '600',
                    color: designSystem.colors.primary.dark,
                    backgroundColor: `${designSystem.colors.accent.gold}20`,
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {item._count}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Logs de Mensagens */}
      <Card title="Últimas Mensagens Recebidas" icon="📨" hoverable style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {logs.length === 0 ? (
            <p style={{
              textAlign: 'center',
              color: designSystem.colors.neutral.gray400,
              padding: '32px 0',
              margin: 0
            }}>
              Nenhuma mensagem recebida
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                style={{
                  backgroundColor: designSystem.colors.neutral.light,
                  borderRadius: '8px',
                  padding: '12px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  transition: designSystem.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = designSystem.shadows.md;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <p style={{
                      fontWeight: '600',
                      color: designSystem.colors.primary.dark,
                      margin: '0 0 4px 0'
                    }}>
                      {log.lead.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: designSystem.colors.neutral.gray500,
                      margin: 0
                    }}>
                      {log.lead.whatsappId}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: designSystem.colors.neutral.gray500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={12} />
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p style={{
                  fontSize: '13px',
                  color: designSystem.colors.neutral.gray600,
                  margin: 0
                }}>
                  {log.description}
                </p>
                {log.details && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    backgroundColor: designSystem.colors.neutral.light,
                    padding: '8px',
                    borderRadius: '6px',
                    color: designSystem.colors.neutral.gray600,
                    maxHeight: '80px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                  }}>
                    {renderLogDetails(log.details)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Últimos Leads */}
      {stats && stats.lastLeads.length > 0 && (
        <Card title="Últimos Leads (WhatsApp)" icon="📋" hoverable>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{
                  borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                  backgroundColor: designSystem.colors.neutral.light
                }}>
                  {['Nome', 'Telefone', 'Categoria', 'Status', 'Data'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: designSystem.colors.primary.dark
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.lastLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                      transition: designSystem.transitions.normal
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{
                      padding: '12px 16px',
                      color: designSystem.colors.primary.dark,
                      fontWeight: '500',
                      fontSize: '13px'
                    }}>
                      {lead.name}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      color: designSystem.colors.neutral.gray600,
                      fontSize: '13px'
                    }}>
                      {lead.phone}
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px'
                    }}>
                      <Badge variant="info">{lead.category}</Badge>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      fontSize: '12px'
                    }}>
                      <Badge variant={lead.status === 'INITIAL' ? 'warning' : 'success'}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td style={{
                      padding: '12px 16px',
                      color: designSystem.colors.neutral.gray500,
                      fontSize: '12px'
                    }}>
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Instruções de Configuração */}
      {!connectionStatus?.configured && (
        <Card title="⚙️ Configurar WhatsApp" icon="🔧" hoverable>
          <p style={{
            fontSize: '13px',
            color: designSystem.colors.neutral.gray600,
            marginBottom: '12px'
          }}>
            Para habilitar o WhatsApp, configure as variáveis de ambiente no arquivo{' '}
            <code style={{
              backgroundColor: designSystem.colors.neutral.light,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              .env
            </code>:
          </p>
          <pre style={{
            backgroundColor: designSystem.colors.neutral.light,
            padding: '16px',
            borderRadius: '8px',
            overflowX: 'auto',
            fontSize: '12px',
            color: designSystem.colors.primary.dark,
            fontFamily: 'monospace',
            margin: '12px 0'
          }}>
{`WHATSAPP_BUSINESS_PHONE_ID=seu-phone-id
WHATSAPP_BUSINESS_ACCESS_TOKEN=seu-access-token
WHATSAPP_BUSINESS_ACCOUNT_ID=seu-account-id
WHATSAPP_WEBHOOK_TOKEN=webhook_token_seguro_2026`}
          </pre>
          <p style={{
            fontSize: '12px',
            color: designSystem.colors.neutral.gray500,
            margin: 0
          }}>
            Acesse a documentação em{' '}
            <code style={{
              backgroundColor: designSystem.colors.neutral.light,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              README.WHATSAPP.md
            </code>{' '}
            para detalhes completos de configuração.
          </p>
        </Card>
      )}
    </div>
  );
};

export default WhatsAppPage;
