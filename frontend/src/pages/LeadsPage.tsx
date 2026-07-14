import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Select,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import {
  Search,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import Card from '@/components/horizon/Card';
import { leadService } from '@/services/leadService';
import type { Lead } from '@/types';
import { DEMO_FALLBACK, demoLeads } from '@/utils/demoData';
import { generateLeadWord, generateLeadPDF } from '@/utils/leadDocuments';
import { exportLeadsCsv, parseLeadsCsv, downloadLeadsCsvTemplate } from '@/utils/leadCsv';

const STATUS_META: Record<string, { label: string; colorScheme: string }> = {
  INITIAL: { label: 'Inicial', colorScheme: 'blue' },
  CONSULTING: { label: 'Consultando', colorScheme: 'orange' },
  PAYMENT: { label: 'Pagamento', colorScheme: 'cyan' },
  LOSS: { label: 'Perda', colorScheme: 'red' },
  CONVERTED: { label: 'Convertido', colorScheme: 'green' },
};

const CATEGORY_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  PROCESS: 'Processo',
  BPC_LOAS: 'BPC/LOAS',
  RETIREMENT: 'Aposentadoria',
};

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  cpf: '',
  whatsappId: '',
  address: '',
  neighborhood: '',
  zipCode: '',
  city: '',
  state: '',
  nationality: '',
  maritalStatus: '',
  profession: '',
  category: 'CONSULTATION',
  source: 'WEBSITE',
};

const columnHelper = createColumnHelper<Lead>();

export function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [responsibleFilter, setResponsibleFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('recent');
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; failed: number; total: number } | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editTarget, setEditTarget] = useState<Lead | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  const titleColor = useColorModeValue('navy.700', 'white');
  const headerColor = useColorModeValue('secondaryGray.600', 'white');
  const cellColor = useColorModeValue('navy.700', 'whiteAlpha.900');
  const subCellColor = useColorModeValue('secondaryGray.700', 'secondaryGray.500');
  const borderColor = useColorModeValue('secondaryGray.200', 'whiteAlpha.200');
  const hoverBg = useColorModeValue('secondaryGray.100', 'whiteAlpha.100');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      const response = await leadService.getAll();
      const list = response.leads || [];
      setLeads(DEMO_FALLBACK && list.length === 0 ? demoLeads : list);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
      setLeads(DEMO_FALLBACK ? demoLeads : []);
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
      setFormData(EMPTY_FORM);
      onClose();
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

  const handleExport = () => {
    exportLeadsCsv(displayLeads.length ? displayLeads : leads);
  };

  const handleImportFile = async (file: File) => {
    try {
      setImporting(true);
      setImportResult(null);
      const text = await file.text();
      const parsed = parseLeadsCsv(text);
      if (parsed.length === 0) {
        setImportResult({ created: 0, skipped: 0, failed: 0, total: 0 });
        return;
      }
      const result = await leadService.importLeads(parsed);
      setImportResult(result);
      await loadLeads();
    } catch (error) {
      console.error('Erro ao importar:', error);
      setImportResult({ created: 0, skipped: 0, failed: -1, total: 0 });
    } finally {
      setImporting(false);
    }
  };

  const openEditModal = (lead: Lead) => {
    setEditForm({
      name: lead.name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      cpf: lead.cpf || '',
      whatsappId: lead.whatsappId || '',
      address: lead.address || '',
      neighborhood: lead.neighborhood || '',
      zipCode: lead.zipCode || '',
      city: lead.city || '',
      state: lead.state || '',
      nationality: lead.nationality || '',
      maritalStatus: lead.maritalStatus || '',
      profession: lead.profession || '',
      category: (lead.category as any) || 'CONSULTATION',
      source: lead.source || 'WEBSITE',
    });
    setEditTarget(lead);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    try {
      setSavingEdit(true);
      const updated = await leadService.update(editTarget.id, {
        ...editForm,
        category: editForm.category as any,
      });
      setLeads(leads.map((l) => (l.id === editTarget.id ? updated : l)));
      setEditTarget(null);
    } catch (error) {
      console.error('Erro ao editar lead:', error);
    } finally {
      setSavingEdit(false);
    }
  };

  const openDeleteModal = (lead: Lead) => {
    setDeleteTarget(lead);
    setDeleteReason('');
    setDeleteError('');
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const reason = deleteReason.trim();
    if (!reason) {
      setDeleteError('Informe o motivo da exclusão.');
      return;
    }
    try {
      setDeleting(true);
      await leadService.delete(deleteTarget.id, reason);
      setLeads(leads.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteReason('');
    } catch (error: any) {
      setDeleteError(
        error?.response?.data?.error || 'Erro ao excluir o lead. Tente novamente.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nome',
        cell: (info) => (
          <Text
            fontWeight="600"
            color="brand.500"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            onClick={() => navigate(`/leads/${info.row.original.id}`)}
          >
            {info.getValue()}
          </Text>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => <Text color={subCellColor}>{info.getValue() || '—'}</Text>,
      }),
      columnHelper.accessor('phone', {
        header: 'Telefone',
        cell: (info) => <Text color={subCellColor}>{info.getValue()}</Text>,
      }),
      columnHelper.accessor('category', {
        header: 'Categoria',
        cell: (info) => (
          <Text color={subCellColor}>{CATEGORY_LABELS[info.getValue()] || info.getValue()}</Text>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const meta = STATUS_META[info.getValue()] || { label: info.getValue(), colorScheme: 'gray' };
          return (
            <Badge colorScheme={meta.colorScheme} borderRadius="8px" px="10px" py="3px" fontSize="xs">
              {meta.label}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Ações"
              icon={<Icon as={MoreVertical} boxSize="18px" />}
              variant="ghost"
              size="sm"
              borderRadius="full"
            />
            <MenuList borderRadius="16px" boxShadow="0px 18px 40px rgba(112,144,176,0.2)">
              <MenuItem onClick={() => openEditModal(row.original)}>✏️ Editar cadastro</MenuItem>
              <MenuDivider />
              <MenuGroup title="Gerar documentos">
                <MenuItem onClick={() => generateLeadWord(row.original)}>📄 Baixar em Word</MenuItem>
                <MenuItem onClick={() => generateLeadPDF(row.original)}>📄 Baixar em PDF</MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuGroup title="Mudar status">
                {Object.entries(STATUS_META).map(([value, meta]) => (
                  <MenuItem
                    key={value}
                    onClick={() => handleStatusChange(row.original.id, value)}
                    isDisabled={row.original.status === value}
                  >
                    {meta.label}
                  </MenuItem>
                ))}
              </MenuGroup>
              <MenuDivider />
              <MenuItem color="red.500" onClick={() => openDeleteModal(row.original)}>
                🗑️ Excluir lead
              </MenuItem>
            </MenuList>
          </Menu>
        ),
      }),
    ],
    [leads, cellColor, subCellColor],
  );

  // Opções dinâmicas de origem e responsável (a partir dos leads carregados)
  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => { if (l.source) set.add(l.source); });
    return Array.from(set).sort();
  }, [leads]);

  const uniqueResponsibles = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      if (l.responsibleId && l.responsible?.name) map.set(l.responsibleId, l.responsible.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [leads]);

  // Aplica filtros + ordenação antes de passar para a tabela
  const displayLeads = useMemo(() => {
    let list = leads.filter((l) =>
      (statusFilter === 'ALL' || l.status === statusFilter) &&
      (categoryFilter === 'ALL' || l.category === categoryFilter) &&
      (sourceFilter === 'ALL' || (l.source || '') === sourceFilter) &&
      (responsibleFilter === 'ALL' || l.responsibleId === responsibleFilter)
    );
    const byDate = (a: Lead, b: Lead) =>
      new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
    if (sortBy === 'recent') list = [...list].sort(byDate);
    else if (sortBy === 'oldest') list = [...list].sort((a, b) => byDate(b, a));
    else if (sortBy === 'name') list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    return list;
  }, [leads, statusFilter, categoryFilter, sourceFilter, responsibleFilter, sortBy]);

  const table = useReactTable({
    data: displayLeads,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <Box>
      <Card>
        {/* Cabecalho: busca + novo lead */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap="12px"
          mb="16px"
        >
          <Text fontSize="xl" fontWeight="700" color={titleColor}>
            👥 Leads
          </Text>
          <HStack spacing="10px">
            <InputGroup w={{ base: '100%', md: '240px' }}>
              <InputLeftElement>
                <Icon as={Search} color="secondaryGray.600" boxSize="16px" />
              </InputLeftElement>
              <Input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Buscar lead..."
                borderRadius="30px"
                fontSize="sm"
              />
            </InputGroup>
            <Button variant="outline" onClick={() => { setImportResult(null); setImportOpen(true); }} flexShrink={0}>
              Importar
            </Button>
            <Button variant="outline" onClick={handleExport} flexShrink={0}>
              Exportar
            </Button>
            <Button
              variant="brand"
              leftIcon={<Icon as={Plus} boxSize="18px" />}
              onClick={onOpen}
              flexShrink={0}
            >
              Novo Lead
            </Button>
          </HStack>
        </Flex>

        {/* Contador */}
        <Text fontSize="sm" color="secondaryGray.600" mb="10px">
          Existem <strong>{leads.length}</strong> leads na sua base
          {' • '}
          <strong>{table.getFilteredRowModel().rows.length}</strong> encontrados
        </Text>

        {/* Barra de filtros + ordenação */}
        <Flex gap="10px" mb="16px" flexWrap="wrap" align="center">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} w={{ base: '100%', sm: '170px' }} borderRadius="12px" fontSize="sm">
            <option value="ALL">Status: todos</option>
            <option value="INITIAL">Inicial</option>
            <option value="CONSULTING">Consultando</option>
            <option value="PAYMENT">Pagamento</option>
            <option value="LOSS">Perda</option>
            <option value="CONVERTED">Convertido</option>
          </Select>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} w={{ base: '100%', sm: '180px' }} borderRadius="12px" fontSize="sm">
            <option value="ALL">Categoria: todas</option>
            <option value="CONSULTATION">Consulta</option>
            <option value="PROCESS">Processo</option>
            <option value="BPC_LOAS">BPC/LOAS</option>
            <option value="RETIREMENT">Aposentadoria</option>
          </Select>
          <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} w={{ base: '100%', sm: '170px' }} borderRadius="12px" fontSize="sm">
            <option value="ALL">Origem: todas</option>
            {uniqueSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={responsibleFilter} onChange={(e) => setResponsibleFilter(e.target.value)} w={{ base: '100%', sm: '190px' }} borderRadius="12px" fontSize="sm">
            <option value="ALL">Responsável: todos</option>
            {uniqueResponsibles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} w={{ base: '100%', sm: '190px' }} borderRadius="12px" fontSize="sm">
            <option value="recent">Ordenar: mais recentes</option>
            <option value="oldest">Ordenar: mais antigos</option>
            <option value="name">Ordenar: nome (A-Z)</option>
          </Select>
          {(statusFilter !== 'ALL' || categoryFilter !== 'ALL' || sourceFilter !== 'ALL' || responsibleFilter !== 'ALL' || globalFilter) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setStatusFilter('ALL');
                setCategoryFilter('ALL');
                setSourceFilter('ALL');
                setResponsibleFilter('ALL');
                setGlobalFilter('');
              }}
            >
              Limpar filtros
            </Button>
          )}
        </Flex>

        {/* Tabela */}
        {isLoading ? (
          <Text py="32px" textAlign="center" color="secondaryGray.600">
            Carregando leads...
          </Text>
        ) : leads.length === 0 ? (
          <Text py="32px" textAlign="center" color="secondaryGray.600">
            Nenhum lead encontrado
          </Text>
        ) : (
          <Box overflowX="auto" w="100%">
            <Table variant="simple" minW="720px">
              <Thead>
                {table.getHeaderGroups().map((hg) => (
                  <Tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const sortDir = header.column.getIsSorted();
                      return (
                        <Th
                          key={header.id}
                          borderColor={borderColor}
                          color={headerColor}
                          cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                          onClick={header.column.getToggleSortingHandler()}
                          userSelect="none"
                          whiteSpace="nowrap"
                        >
                          <Flex align="center" gap="4px">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sortDir === 'asc' && <Icon as={ChevronUp} boxSize="14px" />}
                            {sortDir === 'desc' && <Icon as={ChevronDown} boxSize="14px" />}
                          </Flex>
                        </Th>
                      );
                    })}
                  </Tr>
                ))}
              </Thead>
              <Tbody>
                {table.getRowModel().rows.map((row) => (
                  <Tr key={row.id} _hover={{ bg: hoverBg }}>
                    {row.getVisibleCells().map((cell) => (
                      <Td key={cell.id} borderColor={borderColor} whiteSpace="nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Paginacao */}
            <Flex align="center" justify="space-between" mt="16px" flexWrap="wrap" gap="8px">
              <Text fontSize="sm" color="secondaryGray.600">
                Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} •{' '}
                {table.getFilteredRowModel().rows.length} leads
              </Text>
              <HStack>
                <IconButton
                  aria-label="Anterior"
                  icon={<Icon as={ChevronLeft} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                />
                <IconButton
                  aria-label="Próxima"
                  icon={<Icon as={ChevronRight} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                />
              </HStack>
            </Flex>
          </Box>
        )}
      </Card>

      {/* Modal: criar lead */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px" as="form" onSubmit={handleCreateLead}>
          <ModalHeader color={titleColor}>📝 Criar Novo Lead</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nome</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  borderRadius="12px"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  borderRadius="12px"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Telefone</FormLabel>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  borderRadius="12px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">WhatsApp (ex: 5511999990000)</FormLabel>
                <Input
                  type="tel"
                  placeholder="5511999990000"
                  value={formData.whatsappId}
                  onChange={(e) => setFormData({ ...formData, whatsappId: e.target.value })}
                  borderRadius="12px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">CPF</FormLabel>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  borderRadius="12px"
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Endereço (rua e número)</FormLabel>
                <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Bairro</FormLabel>
                <Input value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">CEP</FormLabel>
                <Input value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Cidade</FormLabel>
                <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Estado (UF)</FormLabel>
                <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Nacionalidade</FormLabel>
                <Input placeholder="brasileiro(a)" value={formData.nationality} onChange={(e) => setFormData({ ...formData, nationality: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Estado civil</FormLabel>
                <Input placeholder="solteiro(a), casado(a)..." value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Profissão</FormLabel>
                <Input value={formData.profession} onChange={(e) => setFormData({ ...formData, profession: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Categoria</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  borderRadius="12px"
                >
                  <option value="CONSULTATION">Consulta</option>
                  <option value="PROCESS">Processo</option>
                  <option value="BPC_LOAS">BPC/LOAS</option>
                  <option value="RETIREMENT">Aposentadoria</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Origem</FormLabel>
                <Select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  borderRadius="12px"
                >
                  <option value="WEBSITE">Website</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="PHONE">Telefone</option>
                  <option value="REFERRAL">Indicação</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter gap="10px">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="brand" type="submit">
              ✓ Criar Lead
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: importar leads (CSV) */}
      <Modal isOpen={importOpen} onClose={() => !importing && setImportOpen(false)} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px">
          <ModalHeader color={titleColor}>📥 Importar Leads (CSV)</ModalHeader>
          <ModalCloseButton isDisabled={importing} />
          <ModalBody>
            <Text fontSize="sm" color="secondaryGray.600" mb="12px">
              Envie um arquivo <strong>.csv</strong> (planilha do Excel salva como CSV). A primeira
              linha deve conter os títulos das colunas. Reconhecemos automaticamente:
              <br />
              <strong>Nome, Email, Telefone, CPF, Endereco, Bairro, Cidade, Estado, CEP, Nacionalidade, EstadoCivil, Profissao, Categoria, Origem</strong>.
              <br />
              Obrigatórios: <strong>Nome</strong> e <strong>Telefone</strong>. Leads com CPF já
              existente são ignorados (não duplica).
            </Text>

            <Button size="sm" variant="brand" mb="12px" onClick={downloadLeadsCsvTemplate}>
              ⬇️ Baixar modelo CSV (com exemplo)
            </Button>

            <Input
              type="file"
              accept=".csv,text/csv"
              p="6px"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = '';
              }}
              isDisabled={importing}
            />

            {importing && (
              <Text mt="12px" fontSize="sm" color="secondaryGray.600">Importando, aguarde...</Text>
            )}

            {importResult && !importing && (
              <Box mt="16px" p="12px" borderRadius="12px" bg="secondaryGray.100">
                {importResult.failed === -1 ? (
                  <Text color="red.500" fontSize="sm">Erro ao importar o arquivo. Verifique se é um CSV válido.</Text>
                ) : importResult.total === 0 ? (
                  <Text color="orange.500" fontSize="sm">Nenhum lead encontrado no arquivo. Confira os títulos das colunas.</Text>
                ) : (
                  <Box fontSize="sm">
                    <Text color="green.600">✅ {importResult.created} lead(s) criado(s)</Text>
                    {importResult.skipped > 0 && <Text color="secondaryGray.700">↩️ {importResult.skipped} ignorado(s) (CPF já existia)</Text>}
                    {importResult.failed > 0 && <Text color="red.500">⚠️ {importResult.failed} com erro (faltou nome ou telefone)</Text>}
                  </Box>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setImportOpen(false)} isDisabled={importing}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: editar lead */}
      <Modal isOpen={!!editTarget} onClose={() => !savingEdit && setEditTarget(null)} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px" as="form" onSubmit={handleUpdateLead}>
          <ModalHeader color={titleColor}>✏️ Editar Cadastro</ModalHeader>
          <ModalCloseButton isDisabled={savingEdit} />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="16px">
              <FormControl isRequired>
                <FormLabel fontSize="sm">Nome</FormLabel>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Email</FormLabel>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">Telefone</FormLabel>
                <Input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">WhatsApp (ex: 5511999990000)</FormLabel>
                <Input type="tel" value={editForm.whatsappId} onChange={(e) => setEditForm({ ...editForm, whatsappId: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">CPF</FormLabel>
                <Input value={editForm.cpf} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Endereço (rua e número)</FormLabel>
                <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Bairro</FormLabel>
                <Input value={editForm.neighborhood} onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">CEP</FormLabel>
                <Input value={editForm.zipCode} onChange={(e) => setEditForm({ ...editForm, zipCode: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Cidade</FormLabel>
                <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Estado (UF)</FormLabel>
                <Input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Nacionalidade</FormLabel>
                <Input placeholder="brasileiro(a)" value={editForm.nationality} onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Estado civil</FormLabel>
                <Input placeholder="solteiro(a), casado(a)..." value={editForm.maritalStatus} onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Profissão</FormLabel>
                <Input value={editForm.profession} onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })} borderRadius="12px" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Categoria</FormLabel>
                <Select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} borderRadius="12px">
                  <option value="CONSULTATION">Consulta</option>
                  <option value="PROCESS">Processo</option>
                  <option value="BPC_LOAS">BPC/LOAS</option>
                  <option value="RETIREMENT">Aposentadoria</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </ModalBody>
          <ModalFooter gap="10px">
            <Button variant="ghost" onClick={() => setEditTarget(null)} isDisabled={savingEdit}>
              Cancelar
            </Button>
            <Button variant="brand" type="submit" isLoading={savingEdit}>
              Salvar alterações
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal: excluir lead (motivo obrigatorio) */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        size="md"
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="20px">
          <ModalHeader color="red.500">🗑️ Excluir lead</ModalHeader>
          <ModalCloseButton isDisabled={deleting} />
          <ModalBody>
            <Text fontSize="sm" color="secondaryGray.600" mb="16px">
              Você está prestes a excluir <strong>{deleteTarget?.name}</strong>. Essa ação
              não pode ser desfeita e ficará registrada no histórico (quem excluiu e o
              motivo).
            </Text>
            <FormControl isRequired isInvalid={!!deleteError}>
              <FormLabel fontSize="sm">Motivo da exclusão</FormLabel>
              <Textarea
                value={deleteReason}
                onChange={(e) => {
                  setDeleteReason(e.target.value);
                  setDeleteError('');
                }}
                placeholder="Ex: Lead duplicado, cadastrado por engano..."
                borderRadius="12px"
                rows={3}
                autoFocus
              />
              {deleteError && (
                <Text color="red.500" fontSize="13px" mt="6px">
                  {deleteError}
                </Text>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter gap="10px">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} isDisabled={deleting}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={handleConfirmDelete} isLoading={deleting}>
              Confirmar exclusão
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
