import { useEffect, useMemo, useState } from 'react';
import { designSystem } from '@/theme/designSystem';
import { leadService } from '@/services/leadService';
import { generateLeadWord, generateLeadPDF } from '@/utils/leadDocuments';
import type { Lead } from '@/types';

const CATEGORY_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  PROCESS: 'Processo',
  BPC_LOAS: 'BPC/LOAS',
  RETIREMENT: 'Aposentadoria',
};

export function DocumentsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const { leads } = await leadService.getAll(1, 500);
      setLeads(leads);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.cpf || '').toLowerCase().includes(q) ||
        (l.phone || '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  const btnStyle = (bg: string): React.CSSProperties => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: bg,
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: designSystem.colors.primary.dark, marginBottom: '4px' }}>
        📄 Documentos
      </h1>
      <p style={{ color: designSystem.colors.neutral.gray600, marginBottom: '20px', fontSize: '14px' }}>
        Escolha um cliente e gere Contrato, Procuração e Declaração já preenchidos com os dados dele.
      </p>

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar cliente por nome, CPF ou telefone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '12px 16px',
          borderRadius: '10px',
          border: `1px solid ${designSystem.colors.neutral.gray300}`,
          fontSize: '14px',
          marginBottom: '20px',
          boxSizing: 'border-box',
        }}
      />

      {loading ? (
        <p style={{ color: designSystem.colors.neutral.gray500 }}>Carregando clientes...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: designSystem.colors.neutral.gray500, padding: '24px 0' }}>
          {leads.length === 0
            ? 'Nenhum cliente cadastrado ainda. Cadastre leads na página de Leads.'
            : 'Nenhum cliente encontrado para essa busca.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map((lead) => (
            <div
              key={lead.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                backgroundColor: '#fff',
                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                borderRadius: '10px',
                padding: '14px 18px',
              }}
            >
              <div style={{ minWidth: '200px' }}>
                <p style={{ margin: 0, fontWeight: 600, color: designSystem.colors.primary.dark, fontSize: '15px' }}>
                  {lead.name}
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: designSystem.colors.neutral.gray600 }}>
                  {CATEGORY_LABELS[lead.category] || lead.category}
                  {lead.cpf ? ` • CPF ${lead.cpf}` : ''}
                  {lead.phone ? ` • ${lead.phone}` : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={btnStyle(designSystem.colors.primary.dark)} onClick={() => generateLeadWord(lead)}>
                  📝 Gerar Word
                </button>
                <button style={btnStyle(designSystem.colors.status.error)} onClick={() => generateLeadPDF(lead)}>
                  📄 Gerar PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
