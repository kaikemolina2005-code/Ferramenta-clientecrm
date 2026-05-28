import { useState, useEffect } from 'react';
import { Button, Card, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import { leadService } from '@/services/leadService';
import { Lead } from '@/types';

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
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
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newLead = await leadService.create({
        ...formData,
        category: formData.category as any,
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
    } catch (error) {
      console.error('Erro ao criar lead:', error);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const updated = await leadService.update(leadId, { status: newStatus as any });
      setLeads(leads.map((lead) => (lead.id === leadId ? updated : lead)));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      INITIAL: 'primary',
      CONSULTING: 'warning',
      PAYMENT: 'info',
      LOSS: 'error',
      CONVERTED: 'success',
    };
    return statusMap[status] || 'primary';
  };

  return (
    <div style={{ padding: '32px' }}>
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
          👥 Leads
        </h1>
        <Button 
          variant={showForm ? 'error' : 'primary'}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancelar' : '+ Novo Lead'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card title="Criar Novo Lead" icon="📝" hoverable style={{ marginBottom: '24px' }}>
          <form onSubmit={handleCreateLead} style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
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
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
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
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, sans-serif',
                  backgroundColor: designSystem.colors.neutral.white
                }}
              >
                <option value="CONSULTATION">Consulta</option>
                <option value="PROCESS">Processo</option>
                <option value="BPC_LOAS">BPC/LOAS</option>
                <option value="RETIREMENT">Aposentadoria</option>
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
                Origem
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Segoe UI, sans-serif',
                  backgroundColor: designSystem.colors.neutral.white
                }}
              >
                <option value="WEBSITE">Website</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Telefone</option>
                <option value="REFERRAL">Indicação</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
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
              >✓ Criar Lead</button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Leads List */}
      <div style={{
        backgroundColor: designSystem.colors.neutral.white,
        borderRadius: '12px',
        boxShadow: designSystem.shadows.md,
        overflow: 'hidden'
      }}>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: designSystem.colors.neutral.gray500 }}>
            Carregando leads...
          </div>
        ) : leads.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: designSystem.colors.neutral.gray500 }}>
            Nenhum lead encontrado
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: designSystem.colors.neutral.light, borderBottom: `1px solid ${designSystem.colors.neutral.gray300}` }}>
                  {['Nome', 'Email', 'Telefone', 'Categoria', 'Status', 'Ações'].map((header) => (
                    <th
                      key={header}
                      style={{
                        padding: '16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: designSystem.colors.primary.dark,
                        fontSize: '14px'
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: `1px solid ${designSystem.colors.neutral.gray300}`,
                      transition: designSystem.transitions.normal,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = designSystem.colors.neutral.white}
                  >
                    <td style={{ padding: '16px', fontWeight: '500', color: designSystem.colors.primary.dark }}>{lead.name}</td>
                    <td style={{ padding: '16px', color: designSystem.colors.neutral.gray600 }}>{lead.email}</td>
                    <td style={{ padding: '16px', color: designSystem.colors.neutral.gray600 }}>{lead.phone}</td>
                    <td style={{ padding: '16px', color: designSystem.colors.neutral.gray600 }}>{lead.category}</td>
                    <td style={{ padding: '16px' }}>
                      <Badge variant={getStatusColor(lead.status) as any}>{lead.status}</Badge>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          border: `1px solid ${designSystem.colors.neutral.gray300}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: designSystem.colors.primary.dark,
                          backgroundColor: designSystem.colors.neutral.white,
                          cursor: 'pointer'
                        }}
                      >
                        <option value="INITIAL">Inicial</option>
                        <option value="CONSULTING">Consultando</option>
                        <option value="PAYMENT">Pagamento</option>
                        <option value="LOSS">Perda</option>
                        <option value="CONVERTED">Convertido</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
