/**
 * Importação e exportação de leads em CSV.
 */
import type { Lead } from '@/types';

const EXPORT_COLUMNS: { key: keyof Lead | string; label: string }[] = [
  { key: 'name', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Telefone' },
  { key: 'cpf', label: 'CPF' },
  { key: 'address', label: 'Endereco' },
  { key: 'neighborhood', label: 'Bairro' },
  { key: 'city', label: 'Cidade' },
  { key: 'state', label: 'Estado' },
  { key: 'zipCode', label: 'CEP' },
  { key: 'nationality', label: 'Nacionalidade' },
  { key: 'maritalStatus', label: 'EstadoCivil' },
  { key: 'profession', label: 'Profissao' },
  { key: 'category', label: 'Categoria' },
  { key: 'status', label: 'Status' },
  { key: 'source', label: 'Origem' },
];

function csvEscape(value: any): string {
  const str = value == null ? '' : String(value);
  if (/[";\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Gera e baixa um CSV com os leads informados. */
export function exportLeadsCsv(leads: Lead[]): void {
  const header = EXPORT_COLUMNS.map((c) => c.label).join(';');
  const rows = leads.map((lead) =>
    EXPORT_COLUMNS.map((c) => csvEscape((lead as any)[c.key])).join(';')
  );
  const csv = [header, ...rows].join('\r\n');
  // BOM para o Excel abrir com acentos corretos
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leads.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Baixa um modelo (template) de CSV com os títulos e uma linha de exemplo. */
export function downloadLeadsCsvTemplate(): void {
  const header = EXPORT_COLUMNS.map((c) => c.label).join(';');
  const example = [
    'Maria Aparecida Silva',
    'maria.silva@email.com',
    '13999998888',
    '123.456.789-00',
    'Rua das Flores, 100',
    'Centro',
    'Bertioga',
    'SP',
    '11250-000',
    'brasileira',
    'casada',
    'aposentada',
    'RETIREMENT',
    'INITIAL',
    'IMPORTACAO',
  ].map(csvEscape).join(';');
  const csv = [header, example].join('\r\n');
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'modelo_importar_leads.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Normaliza cabeçalho (minúsculo, sem acento, sem espaços) para mapear colunas
function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const HEADER_MAP: Record<string, string> = {
  nome: 'name',
  name: 'name',
  email: 'email',
  telefone: 'phone',
  celular: 'phone',
  fone: 'phone',
  phone: 'phone',
  whatsapp: 'phone',
  cpf: 'cpf',
  endereco: 'address',
  address: 'address',
  bairro: 'neighborhood',
  cidade: 'city',
  city: 'city',
  estado: 'state',
  uf: 'state',
  cep: 'zipCode',
  nacionalidade: 'nationality',
  estadocivil: 'maritalStatus',
  profissao: 'profession',
  cargo: 'profession',
  categoria: 'category',
  category: 'category',
  origem: 'source',
  source: 'source',
};

// Divide uma linha de CSV respeitando aspas
function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/**
 * Converte o texto de um CSV em uma lista de objetos de lead.
 * Detecta automaticamente se o separador é ";" ou ",".
 */
export function parseLeadsCsv(text: string): any[] {
  const clean = text.replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = (lines[0].match(/;/g)?.length || 0) >= (lines[0].match(/,/g)?.length || 0) ? ';' : ',';
  const headers = splitCsvLine(lines[0], delimiter).map((h) => HEADER_MAP[normalizeHeader(h)] || null);

  const leads: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter);
    const obj: any = {};
    headers.forEach((field, idx) => {
      if (field) obj[field] = (cols[idx] || '').trim();
    });
    if (obj.name) leads.push(obj);
  }
  return leads;
}
