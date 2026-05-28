import { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  isActive: boolean;
  createdAt: string;
  executionCount: number;
}

export function AutomationPage() {
  const [rules, setRules] = useState<AutomationRule[]>([]);
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
    } catch (error) {
      console.error('Erro ao carregar regras:', error);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error('Erro ao criar regra:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, currentStatus: boolean) => {
    try {
      const response = await api.patch(`/automation/rules/${ruleId}`, {
        isActive: !currentStatus,
      });
      setRules(rules.map((rule) => (rule.id === ruleId ? response.data.data : rule)));
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Tem certeza que deseja deletar esta regra?')) {
      try {
        await api.delete(`/automation/rules/${ruleId}`);
        setRules(rules.filter((rule) => rule.id !== ruleId));
      } catch (error) {
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

  return (
    <div style={{ padding: '32px', backgroundColor: designSystem.colors.neutral.light, minHeight: '100vh' }}>
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
          ⚙️ Automações
        </h1>
        <Button 
          variant={showForm ? 'error' : 'primary'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Nova Regra'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title="Criar Nova Regra de Automação" icon="➕" hoverable style={{ marginBottom: '24px' }}>
          <form onSubmit={handleCreateRule} style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: designSystem.colors.primary.dark,
                marginBottom: '8px'
              }}>
                Nome da Regra *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Enviar welcome email para novos leads"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, sans-serif',
                  transition: designSystem.transitions.normal
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = designSystem.colors.primary.dark}
                onBlur={(e) => e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: designSystem.colors.primary.dark,
                marginBottom: '8px'
              }}>
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada da automação"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, sans-serif',
                  resize: 'vertical',
                  transition: designSystem.transitions.normal
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = designSystem.colors.primary.dark}
                onBlur={(e) => e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: designSystem.colors.primary.dark,
                  marginBottom: '8px'
                }}>
                  Gatilho (Trigger) *
                </label>
                <select
                  value={formData.trigger}
                  onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Segoe UI, sans-serif',
                    backgroundColor: designSystem.colors.neutral.white,
                    cursor: 'pointer'
                  }}
                  required
                >
                  {triggerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: designSystem.colors.primary.dark,
                  marginBottom: '8px'
                }}>
                  Ação *
                </label>
                <select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'Segoe UI, sans-serif',
                    backgroundColor: designSystem.colors.neutral.white,
                    cursor: 'pointer'
                  }}
                  required
                >
                  {actionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: designSystem.colors.primary.dark,
                  color: designSystem.colors.neutral.white,
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.opacity = '1';
                }}
              >✓ Criar Regra</button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules List */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          color: designSystem.colors.neutral.gray500
        }}>
          Carregando automações...
        </div>
      ) : rules.length === 0 ? (
        <Card title="Nenhuma Automação Criada" icon="📭" hoverable>
          <p style={{ color: designSystem.colors.neutral.gray600, marginBottom: '16px' }}>
            Você ainda não tem nenhuma regra de automação configurada.
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            + Criar Primeira Regra
          </Button>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {rules.map((rule) => (
            <Card
              key={rule.id}
              title={rule.name}
              icon={rule.isActive ? '✓' : '⊘'}
              hoverable
              style={{
                borderLeft: `4px solid ${rule.isActive ? designSystem.colors.status.success : designSystem.colors.neutral.gray300}`
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <p style={{
                  fontSize: '13px',
                  color: designSystem.colors.neutral.gray600,
                  marginBottom: '8px'
                }}>
                  {rule.description || 'Sem descrição'}
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <div style={{
                    padding: '8px',
                    backgroundColor: `${designSystem.colors.primary.light}15`,
                    borderRadius: '6px'
                  }}>
                    <p style={{ color: designSystem.colors.neutral.gray500, margin: '0 0 4px 0' }}>
                      Gatilho
                    </p>
                    <p style={{ color: designSystem.colors.primary.dark, fontWeight: '500', margin: 0 }}>
                      {triggerOptions.find((o) => o.value === rule.trigger)?.label || rule.trigger}
                    </p>
                  </div>

                  <div style={{
                    padding: '8px',
                    backgroundColor: `${designSystem.colors.accent.gold}15`,
                    borderRadius: '6px'
                  }}>
                    <p style={{ color: designSystem.colors.neutral.gray500, margin: '0 0 4px 0' }}>
                      Ação
                    </p>
                    <p style={{ color: designSystem.colors.primary.dark, fontWeight: '500', margin: 0 }}>
                      {actionOptions.find((o) => o.value === rule.action)?.label || rule.action}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${designSystem.colors.neutral.gray300}`
                }}>
                  <Badge variant={rule.isActive ? 'success' : 'warning'}>
                    {rule.isActive ? '🟢 Ativo' : '⚫ Inativo'}
                  </Badge>
                  <span style={{
                    fontSize: '12px',
                    color: designSystem.colors.neutral.gray500
                  }}>
                    {rule.executionCount} execuções
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <Button
                    variant={rule.isActive ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                    style={{ flex: 1 }}
                  >
                    {rule.isActive ? '⊘ Desativar' : '✓ Ativar'}
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{ flex: 1 }}
                  >
                    🗑️ Deletar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
