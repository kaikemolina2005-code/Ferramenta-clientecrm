import { useState, useEffect, useMemo } from 'react';
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
  city: '',
  state: '',
  category: 'CONSULTATION',
  source: 'WEBSITE',
};

const columnHelper = createColumnHelper<Lead>();

export function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
          <Text fontWeight="600" color={cellColor}>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, cellColor, subCellColor],
  );

  const table = useReactTable({
    data: leads,
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
