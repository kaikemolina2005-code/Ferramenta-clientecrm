import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Text, Badge, Table, Thead, Tbody, Tr, Th, Td, Icon, Menu, MenuButton, MenuList, MenuItem, MenuGroup, MenuDivider, IconButton, Input, InputGroup, InputLeftElement, HStack, Select, SimpleGrid, FormControl, FormLabel, Textarea, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure, useColorModeValue, } from '@chakra-ui/react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, } from '@tanstack/react-table';
import { Search, MoreVertical, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, } from 'lucide-react';
import Card from '@/components/horizon/Card';
import { leadService } from '@/services/leadService';
import { DEMO_FALLBACK, demoLeads } from '@/utils/demoData';
import { generateLeadWord, generateLeadPDF } from '@/utils/leadDocuments';
import { exportLeadsCsv, parseLeadsCsv, downloadLeadsCsvTemplate } from '@/utils/leadCsv';
const STATUS_META = {
    INITIAL: { label: 'Inicial', colorScheme: 'blue' },
    CONSULTING: { label: 'Consultando', colorScheme: 'orange' },
    PAYMENT: { label: 'Pagamento', colorScheme: 'cyan' },
    LOSS: { label: 'Perda', colorScheme: 'red' },
    CONVERTED: { label: 'Convertido', colorScheme: 'green' },
};
const CATEGORY_LABELS = {
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
const columnHelper = createColumnHelper();
export function LeadsPage() {
    const navigate = useNavigate();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [sorting, setSorting] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [sourceFilter, setSourceFilter] = useState('ALL');
    const [responsibleFilter, setResponsibleFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('recent');
    const [importOpen, setImportOpen] = useState(false);
    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteReason, setDeleteReason] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [editTarget, setEditTarget] = useState(null);
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
        }
        catch (error) {
            console.error('Erro ao carregar leads:', error);
            setLeads(DEMO_FALLBACK ? demoLeads : []);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateLead = async (e) => {
        e.preventDefault();
        try {
            const newLead = await leadService.create({
                ...formData,
                category: formData.category,
            });
            setLeads([newLead, ...leads]);
            setFormData(EMPTY_FORM);
            onClose();
        }
        catch (error) {
            console.error('Erro ao criar lead:', error);
        }
    };
    const handleStatusChange = async (leadId, newStatus) => {
        try {
            const updated = await leadService.update(leadId, { status: newStatus });
            setLeads(leads.map((lead) => (lead.id === leadId ? updated : lead)));
        }
        catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };
    const handleExport = () => {
        exportLeadsCsv(displayLeads.length ? displayLeads : leads);
    };
    const handleImportFile = async (file) => {
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
        }
        catch (error) {
            console.error('Erro ao importar:', error);
            setImportResult({ created: 0, skipped: 0, failed: -1, total: 0 });
        }
        finally {
            setImporting(false);
        }
    };
    const openEditModal = (lead) => {
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
            category: lead.category || 'CONSULTATION',
            source: lead.source || 'WEBSITE',
        });
        setEditTarget(lead);
    };
    const handleUpdateLead = async (e) => {
        e.preventDefault();
        if (!editTarget)
            return;
        try {
            setSavingEdit(true);
            const updated = await leadService.update(editTarget.id, {
                ...editForm,
                category: editForm.category,
            });
            setLeads(leads.map((l) => (l.id === editTarget.id ? updated : l)));
            setEditTarget(null);
        }
        catch (error) {
            console.error('Erro ao editar lead:', error);
        }
        finally {
            setSavingEdit(false);
        }
    };
    const openDeleteModal = (lead) => {
        setDeleteTarget(lead);
        setDeleteReason('');
        setDeleteError('');
    };
    const handleConfirmDelete = async () => {
        if (!deleteTarget)
            return;
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
        }
        catch (error) {
            setDeleteError(error?.response?.data?.error || 'Erro ao excluir o lead. Tente novamente.');
        }
        finally {
            setDeleting(false);
        }
    };
    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Nome',
            cell: (info) => (_jsx(Text, { fontWeight: "600", color: "brand.500", cursor: "pointer", _hover: { textDecoration: 'underline' }, onClick: () => navigate(`/leads/${info.row.original.id}`), children: info.getValue() })),
        }),
        columnHelper.accessor('email', {
            header: 'Email',
            cell: (info) => _jsx(Text, { color: subCellColor, children: info.getValue() || '—' }),
        }),
        columnHelper.accessor('phone', {
            header: 'Telefone',
            cell: (info) => _jsx(Text, { color: subCellColor, children: info.getValue() }),
        }),
        columnHelper.accessor('category', {
            header: 'Categoria',
            cell: (info) => (_jsx(Text, { color: subCellColor, children: CATEGORY_LABELS[info.getValue()] || info.getValue() })),
        }),
        columnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                const meta = STATUS_META[info.getValue()] || { label: info.getValue(), colorScheme: 'gray' };
                return (_jsx(Badge, { colorScheme: meta.colorScheme, borderRadius: "8px", px: "10px", py: "3px", fontSize: "xs", children: meta.label }));
            },
        }),
        columnHelper.display({
            id: 'actions',
            header: 'Ações',
            cell: ({ row }) => (_jsxs(Menu, { children: [_jsx(MenuButton, { as: IconButton, "aria-label": "A\u00E7\u00F5es", icon: _jsx(Icon, { as: MoreVertical, boxSize: "18px" }), variant: "ghost", size: "sm", borderRadius: "full" }), _jsxs(MenuList, { borderRadius: "16px", boxShadow: "0px 18px 40px rgba(112,144,176,0.2)", children: [_jsx(MenuItem, { onClick: () => openEditModal(row.original), children: "\u270F\uFE0F Editar cadastro" }), _jsx(MenuDivider, {}), _jsxs(MenuGroup, { title: "Gerar documentos", children: [_jsx(MenuItem, { onClick: () => generateLeadWord(row.original), children: "\uD83D\uDCC4 Baixar em Word" }), _jsx(MenuItem, { onClick: () => generateLeadPDF(row.original), children: "\uD83D\uDCC4 Baixar em PDF" })] }), _jsx(MenuDivider, {}), _jsx(MenuGroup, { title: "Mudar status", children: Object.entries(STATUS_META).map(([value, meta]) => (_jsx(MenuItem, { onClick: () => handleStatusChange(row.original.id, value), isDisabled: row.original.status === value, children: meta.label }, value))) }), _jsx(MenuDivider, {}), _jsx(MenuItem, { color: "red.500", onClick: () => openDeleteModal(row.original), children: "\uD83D\uDDD1\uFE0F Excluir lead" })] })] })),
        }),
    ], 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leads, cellColor, subCellColor]);
    // Opções dinâmicas de origem e responsável (a partir dos leads carregados)
    const uniqueSources = useMemo(() => {
        const set = new Set();
        leads.forEach((l) => { if (l.source)
            set.add(l.source); });
        return Array.from(set).sort();
    }, [leads]);
    const uniqueResponsibles = useMemo(() => {
        const map = new Map();
        leads.forEach((l) => {
            if (l.responsibleId && l.responsible?.name)
                map.set(l.responsibleId, l.responsible.name);
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [leads]);
    // Aplica filtros + ordenação antes de passar para a tabela
    const displayLeads = useMemo(() => {
        let list = leads.filter((l) => (statusFilter === 'ALL' || l.status === statusFilter) &&
            (categoryFilter === 'ALL' || l.category === categoryFilter) &&
            (sourceFilter === 'ALL' || (l.source || '') === sourceFilter) &&
            (responsibleFilter === 'ALL' || l.responsibleId === responsibleFilter));
        const byDate = (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'recent')
            list = [...list].sort(byDate);
        else if (sortBy === 'oldest')
            list = [...list].sort((a, b) => byDate(b, a));
        else if (sortBy === 'name')
            list = [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
    return (_jsxs(Box, { children: [_jsxs(Card, { children: [_jsxs(Flex, { direction: { base: 'column', md: 'row' }, align: { base: 'stretch', md: 'center' }, justify: "space-between", gap: "12px", mb: "16px", children: [_jsx(Text, { fontSize: "xl", fontWeight: "700", color: titleColor, children: "\uD83D\uDC65 Leads" }), _jsxs(HStack, { spacing: "10px", children: [_jsxs(InputGroup, { w: { base: '100%', md: '240px' }, children: [_jsx(InputLeftElement, { children: _jsx(Icon, { as: Search, color: "secondaryGray.600", boxSize: "16px" }) }), _jsx(Input, { value: globalFilter ?? '', onChange: (e) => setGlobalFilter(e.target.value), placeholder: "Buscar lead...", borderRadius: "30px", fontSize: "sm" })] }), _jsx(Button, { variant: "outline", onClick: () => { setImportResult(null); setImportOpen(true); }, flexShrink: 0, children: "Importar" }), _jsx(Button, { variant: "outline", onClick: handleExport, flexShrink: 0, children: "Exportar" }), _jsx(Button, { variant: "brand", leftIcon: _jsx(Icon, { as: Plus, boxSize: "18px" }), onClick: onOpen, flexShrink: 0, children: "Novo Lead" })] })] }), _jsxs(Text, { fontSize: "sm", color: "secondaryGray.600", mb: "10px", children: ["Existem ", _jsx("strong", { children: leads.length }), " leads na sua base", ' • ', _jsx("strong", { children: table.getFilteredRowModel().rows.length }), " encontrados"] }), _jsxs(Flex, { gap: "10px", mb: "16px", flexWrap: "wrap", align: "center", children: [_jsxs(Select, { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), w: { base: '100%', sm: '170px' }, borderRadius: "12px", fontSize: "sm", children: [_jsx("option", { value: "ALL", children: "Status: todos" }), _jsx("option", { value: "INITIAL", children: "Inicial" }), _jsx("option", { value: "CONSULTING", children: "Consultando" }), _jsx("option", { value: "PAYMENT", children: "Pagamento" }), _jsx("option", { value: "LOSS", children: "Perda" }), _jsx("option", { value: "CONVERTED", children: "Convertido" })] }), _jsxs(Select, { value: categoryFilter, onChange: (e) => setCategoryFilter(e.target.value), w: { base: '100%', sm: '180px' }, borderRadius: "12px", fontSize: "sm", children: [_jsx("option", { value: "ALL", children: "Categoria: todas" }), _jsx("option", { value: "CONSULTATION", children: "Consulta" }), _jsx("option", { value: "PROCESS", children: "Processo" }), _jsx("option", { value: "BPC_LOAS", children: "BPC/LOAS" }), _jsx("option", { value: "RETIREMENT", children: "Aposentadoria" })] }), _jsxs(Select, { value: sourceFilter, onChange: (e) => setSourceFilter(e.target.value), w: { base: '100%', sm: '170px' }, borderRadius: "12px", fontSize: "sm", children: [_jsx("option", { value: "ALL", children: "Origem: todas" }), uniqueSources.map((s) => (_jsx("option", { value: s, children: s }, s)))] }), _jsxs(Select, { value: responsibleFilter, onChange: (e) => setResponsibleFilter(e.target.value), w: { base: '100%', sm: '190px' }, borderRadius: "12px", fontSize: "sm", children: [_jsx("option", { value: "ALL", children: "Respons\u00E1vel: todos" }), uniqueResponsibles.map((r) => (_jsx("option", { value: r.id, children: r.name }, r.id)))] }), _jsxs(Select, { value: sortBy, onChange: (e) => setSortBy(e.target.value), w: { base: '100%', sm: '190px' }, borderRadius: "12px", fontSize: "sm", children: [_jsx("option", { value: "recent", children: "Ordenar: mais recentes" }), _jsx("option", { value: "oldest", children: "Ordenar: mais antigos" }), _jsx("option", { value: "name", children: "Ordenar: nome (A-Z)" })] }), (statusFilter !== 'ALL' || categoryFilter !== 'ALL' || sourceFilter !== 'ALL' || responsibleFilter !== 'ALL' || globalFilter) && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => {
                                    setStatusFilter('ALL');
                                    setCategoryFilter('ALL');
                                    setSourceFilter('ALL');
                                    setResponsibleFilter('ALL');
                                    setGlobalFilter('');
                                }, children: "Limpar filtros" }))] }), isLoading ? (_jsx(Text, { py: "32px", textAlign: "center", color: "secondaryGray.600", children: "Carregando leads..." })) : leads.length === 0 ? (_jsx(Text, { py: "32px", textAlign: "center", color: "secondaryGray.600", children: "Nenhum lead encontrado" })) : (_jsxs(Box, { overflowX: "auto", w: "100%", children: [_jsxs(Table, { variant: "simple", minW: "720px", children: [_jsx(Thead, { children: table.getHeaderGroups().map((hg) => (_jsx(Tr, { children: hg.headers.map((header) => {
                                                const sortDir = header.column.getIsSorted();
                                                return (_jsx(Th, { borderColor: borderColor, color: headerColor, cursor: header.column.getCanSort() ? 'pointer' : 'default', onClick: header.column.getToggleSortingHandler(), userSelect: "none", whiteSpace: "nowrap", children: _jsxs(Flex, { align: "center", gap: "4px", children: [flexRender(header.column.columnDef.header, header.getContext()), sortDir === 'asc' && _jsx(Icon, { as: ChevronUp, boxSize: "14px" }), sortDir === 'desc' && _jsx(Icon, { as: ChevronDown, boxSize: "14px" })] }) }, header.id));
                                            }) }, hg.id))) }), _jsx(Tbody, { children: table.getRowModel().rows.map((row) => (_jsx(Tr, { _hover: { bg: hoverBg }, children: row.getVisibleCells().map((cell) => (_jsx(Td, { borderColor: borderColor, whiteSpace: "nowrap", children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id))) }, row.id))) })] }), _jsxs(Flex, { align: "center", justify: "space-between", mt: "16px", flexWrap: "wrap", gap: "8px", children: [_jsxs(Text, { fontSize: "sm", color: "secondaryGray.600", children: ["P\u00E1gina ", table.getState().pagination.pageIndex + 1, " de ", table.getPageCount(), " \u2022", ' ', table.getFilteredRowModel().rows.length, " leads"] }), _jsxs(HStack, { children: [_jsx(IconButton, { "aria-label": "Anterior", icon: _jsx(Icon, { as: ChevronLeft }), size: "sm", variant: "ghost", onClick: () => table.previousPage(), isDisabled: !table.getCanPreviousPage() }), _jsx(IconButton, { "aria-label": "Pr\u00F3xima", icon: _jsx(Icon, { as: ChevronRight }), size: "sm", variant: "ghost", onClick: () => table.nextPage(), isDisabled: !table.getCanNextPage() })] })] })] }))] }), _jsxs(Modal, { isOpen: isOpen, onClose: onClose, size: "xl", isCentered: true, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { borderRadius: "20px", as: "form", onSubmit: handleCreateLead, children: [_jsx(ModalHeader, { color: titleColor, children: "\uD83D\uDCDD Criar Novo Lead" }), _jsx(ModalCloseButton, {}), _jsx(ModalBody, { children: _jsxs(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: "16px", children: [_jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Nome" }), _jsx(Input, { value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Email" }), _jsx(Input, { type: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Telefone" }), _jsx(Input, { type: "tel", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "WhatsApp (ex: 5511999990000)" }), _jsx(Input, { type: "tel", placeholder: "5511999990000", value: formData.whatsappId, onChange: (e) => setFormData({ ...formData, whatsappId: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "CPF" }), _jsx(Input, { value: formData.cpf, onChange: (e) => setFormData({ ...formData, cpf: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Endere\u00E7o (rua e n\u00FAmero)" }), _jsx(Input, { value: formData.address, onChange: (e) => setFormData({ ...formData, address: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Bairro" }), _jsx(Input, { value: formData.neighborhood, onChange: (e) => setFormData({ ...formData, neighborhood: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "CEP" }), _jsx(Input, { value: formData.zipCode, onChange: (e) => setFormData({ ...formData, zipCode: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Cidade" }), _jsx(Input, { value: formData.city, onChange: (e) => setFormData({ ...formData, city: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Estado (UF)" }), _jsx(Input, { value: formData.state, onChange: (e) => setFormData({ ...formData, state: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Nacionalidade" }), _jsx(Input, { placeholder: "brasileiro(a)", value: formData.nationality, onChange: (e) => setFormData({ ...formData, nationality: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Estado civil" }), _jsx(Input, { placeholder: "solteiro(a), casado(a)...", value: formData.maritalStatus, onChange: (e) => setFormData({ ...formData, maritalStatus: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Profiss\u00E3o" }), _jsx(Input, { value: formData.profession, onChange: (e) => setFormData({ ...formData, profession: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Categoria" }), _jsxs(Select, { value: formData.category, onChange: (e) => setFormData({ ...formData, category: e.target.value }), borderRadius: "12px", children: [_jsx("option", { value: "CONSULTATION", children: "Consulta" }), _jsx("option", { value: "PROCESS", children: "Processo" }), _jsx("option", { value: "BPC_LOAS", children: "BPC/LOAS" }), _jsx("option", { value: "RETIREMENT", children: "Aposentadoria" })] })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Origem" }), _jsxs(Select, { value: formData.source, onChange: (e) => setFormData({ ...formData, source: e.target.value }), borderRadius: "12px", children: [_jsx("option", { value: "WEBSITE", children: "Website" }), _jsx("option", { value: "WHATSAPP", children: "WhatsApp" }), _jsx("option", { value: "PHONE", children: "Telefone" }), _jsx("option", { value: "REFERRAL", children: "Indica\u00E7\u00E3o" })] })] })] }) }), _jsxs(ModalFooter, { gap: "10px", children: [_jsx(Button, { variant: "ghost", onClick: onClose, children: "Cancelar" }), _jsx(Button, { variant: "brand", type: "submit", children: "\u2713 Criar Lead" })] })] })] }), _jsxs(Modal, { isOpen: importOpen, onClose: () => !importing && setImportOpen(false), size: "lg", isCentered: true, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { borderRadius: "20px", children: [_jsx(ModalHeader, { color: titleColor, children: "\uD83D\uDCE5 Importar Leads (CSV)" }), _jsx(ModalCloseButton, { isDisabled: importing }), _jsxs(ModalBody, { children: [_jsxs(Text, { fontSize: "sm", color: "secondaryGray.600", mb: "12px", children: ["Envie um arquivo ", _jsx("strong", { children: ".csv" }), " (planilha do Excel salva como CSV). A primeira linha deve conter os t\u00EDtulos das colunas. Reconhecemos automaticamente:", _jsx("br", {}), _jsx("strong", { children: "Nome, Email, Telefone, CPF, Endereco, Bairro, Cidade, Estado, CEP, Nacionalidade, EstadoCivil, Profissao, Categoria, Origem" }), ".", _jsx("br", {}), "Obrigat\u00F3rios: ", _jsx("strong", { children: "Nome" }), " e ", _jsx("strong", { children: "Telefone" }), ". Leads com CPF j\u00E1 existente s\u00E3o ignorados (n\u00E3o duplica)."] }), _jsx(Button, { size: "sm", variant: "brand", mb: "12px", onClick: downloadLeadsCsvTemplate, children: "\u2B07\uFE0F Baixar modelo CSV (com exemplo)" }), _jsx(Input, { type: "file", accept: ".csv,text/csv", p: "6px", onChange: (e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                                handleImportFile(file);
                                            e.target.value = '';
                                        }, isDisabled: importing }), importing && (_jsx(Text, { mt: "12px", fontSize: "sm", color: "secondaryGray.600", children: "Importando, aguarde..." })), importResult && !importing && (_jsx(Box, { mt: "16px", p: "12px", borderRadius: "12px", bg: "secondaryGray.100", children: importResult.failed === -1 ? (_jsx(Text, { color: "red.500", fontSize: "sm", children: "Erro ao importar o arquivo. Verifique se \u00E9 um CSV v\u00E1lido." })) : importResult.total === 0 ? (_jsx(Text, { color: "orange.500", fontSize: "sm", children: "Nenhum lead encontrado no arquivo. Confira os t\u00EDtulos das colunas." })) : (_jsxs(Box, { fontSize: "sm", children: [_jsxs(Text, { color: "green.600", children: ["\u2705 ", importResult.created, " lead(s) criado(s)"] }), importResult.skipped > 0 && _jsxs(Text, { color: "secondaryGray.700", children: ["\u21A9\uFE0F ", importResult.skipped, " ignorado(s) (CPF j\u00E1 existia)"] }), importResult.failed > 0 && _jsxs(Text, { color: "red.500", children: ["\u26A0\uFE0F ", importResult.failed, " com erro (faltou nome ou telefone)"] })] })) }))] }), _jsx(ModalFooter, { children: _jsx(Button, { variant: "ghost", onClick: () => setImportOpen(false), isDisabled: importing, children: "Fechar" }) })] })] }), _jsxs(Modal, { isOpen: !!editTarget, onClose: () => !savingEdit && setEditTarget(null), size: "xl", isCentered: true, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { borderRadius: "20px", as: "form", onSubmit: handleUpdateLead, children: [_jsx(ModalHeader, { color: titleColor, children: "\u270F\uFE0F Editar Cadastro" }), _jsx(ModalCloseButton, { isDisabled: savingEdit }), _jsx(ModalBody, { children: _jsxs(SimpleGrid, { columns: { base: 1, md: 2 }, spacing: "16px", children: [_jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Nome" }), _jsx(Input, { value: editForm.name, onChange: (e) => setEditForm({ ...editForm, name: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Email" }), _jsx(Input, { type: "email", value: editForm.email, onChange: (e) => setEditForm({ ...editForm, email: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { isRequired: true, children: [_jsx(FormLabel, { fontSize: "sm", children: "Telefone" }), _jsx(Input, { type: "tel", value: editForm.phone, onChange: (e) => setEditForm({ ...editForm, phone: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "WhatsApp (ex: 5511999990000)" }), _jsx(Input, { type: "tel", value: editForm.whatsappId, onChange: (e) => setEditForm({ ...editForm, whatsappId: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "CPF" }), _jsx(Input, { value: editForm.cpf, onChange: (e) => setEditForm({ ...editForm, cpf: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Endere\u00E7o (rua e n\u00FAmero)" }), _jsx(Input, { value: editForm.address, onChange: (e) => setEditForm({ ...editForm, address: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Bairro" }), _jsx(Input, { value: editForm.neighborhood, onChange: (e) => setEditForm({ ...editForm, neighborhood: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "CEP" }), _jsx(Input, { value: editForm.zipCode, onChange: (e) => setEditForm({ ...editForm, zipCode: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Cidade" }), _jsx(Input, { value: editForm.city, onChange: (e) => setEditForm({ ...editForm, city: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Estado (UF)" }), _jsx(Input, { value: editForm.state, onChange: (e) => setEditForm({ ...editForm, state: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Nacionalidade" }), _jsx(Input, { placeholder: "brasileiro(a)", value: editForm.nationality, onChange: (e) => setEditForm({ ...editForm, nationality: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Estado civil" }), _jsx(Input, { placeholder: "solteiro(a), casado(a)...", value: editForm.maritalStatus, onChange: (e) => setEditForm({ ...editForm, maritalStatus: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Profiss\u00E3o" }), _jsx(Input, { value: editForm.profession, onChange: (e) => setEditForm({ ...editForm, profession: e.target.value }), borderRadius: "12px" })] }), _jsxs(FormControl, { children: [_jsx(FormLabel, { fontSize: "sm", children: "Categoria" }), _jsxs(Select, { value: editForm.category, onChange: (e) => setEditForm({ ...editForm, category: e.target.value }), borderRadius: "12px", children: [_jsx("option", { value: "CONSULTATION", children: "Consulta" }), _jsx("option", { value: "PROCESS", children: "Processo" }), _jsx("option", { value: "BPC_LOAS", children: "BPC/LOAS" }), _jsx("option", { value: "RETIREMENT", children: "Aposentadoria" })] })] })] }) }), _jsxs(ModalFooter, { gap: "10px", children: [_jsx(Button, { variant: "ghost", onClick: () => setEditTarget(null), isDisabled: savingEdit, children: "Cancelar" }), _jsx(Button, { variant: "brand", type: "submit", isLoading: savingEdit, children: "Salvar altera\u00E7\u00F5es" })] })] })] }), _jsxs(Modal, { isOpen: !!deleteTarget, onClose: () => !deleting && setDeleteTarget(null), size: "md", isCentered: true, children: [_jsx(ModalOverlay, {}), _jsxs(ModalContent, { borderRadius: "20px", children: [_jsx(ModalHeader, { color: "red.500", children: "\uD83D\uDDD1\uFE0F Excluir lead" }), _jsx(ModalCloseButton, { isDisabled: deleting }), _jsxs(ModalBody, { children: [_jsxs(Text, { fontSize: "sm", color: "secondaryGray.600", mb: "16px", children: ["Voc\u00EA est\u00E1 prestes a excluir ", _jsx("strong", { children: deleteTarget?.name }), ". Essa a\u00E7\u00E3o n\u00E3o pode ser desfeita e ficar\u00E1 registrada no hist\u00F3rico (quem excluiu e o motivo)."] }), _jsxs(FormControl, { isRequired: true, isInvalid: !!deleteError, children: [_jsx(FormLabel, { fontSize: "sm", children: "Motivo da exclus\u00E3o" }), _jsx(Textarea, { value: deleteReason, onChange: (e) => {
                                                    setDeleteReason(e.target.value);
                                                    setDeleteError('');
                                                }, placeholder: "Ex: Lead duplicado, cadastrado por engano...", borderRadius: "12px", rows: 3, autoFocus: true }), deleteError && (_jsx(Text, { color: "red.500", fontSize: "13px", mt: "6px", children: deleteError }))] })] }), _jsxs(ModalFooter, { gap: "10px", children: [_jsx(Button, { variant: "ghost", onClick: () => setDeleteTarget(null), isDisabled: deleting, children: "Cancelar" }), _jsx(Button, { colorScheme: "red", onClick: handleConfirmDelete, isLoading: deleting, children: "Confirmar exclus\u00E3o" })] })] })] })] }));
}
