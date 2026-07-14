import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Flex, Text, Badge, Button, SimpleGrid, Textarea, Icon, Divider, Spinner, useColorModeValue, } from '@chakra-ui/react';
import { ArrowLeft, Mail, Phone, MapPin, FileText, User as UserIcon, Briefcase, Clock, } from 'lucide-react';
import Card from '@/components/horizon/Card';
import { leadService, taskService } from '@/services/leadService';
import { generateLeadWord, generateLeadPDF } from '@/utils/leadDocuments';
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
const ACTION_LABELS = {
    created_lead: 'Lead criado',
    deleted_lead: 'Lead excluído',
    form_filled_with_ai: 'Formulário preenchido com IA',
    document_analyzed_with_ai: 'Documento analisado com IA',
    document_data_extracted: 'Dados extraídos do documento',
    document_summarized: 'Documento resumido',
    batch_documents_processed: 'Documentos processados em lote',
    DOCUMENT_UPLOADED: 'Documento enviado',
    DOCUMENT_DELETED: 'Documento excluído',
    whatsapp_message_received: 'Mensagem recebida no WhatsApp',
    typebot_contact: 'Contato via chatbot',
};
function formatDate(date) {
    try {
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    catch {
        return '';
    }
}
export function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const titleColor = useColorModeValue('navy.700', 'white');
    const labelColor = useColorModeValue('secondaryGray.600', 'secondaryGray.500');
    const valueColor = useColorModeValue('navy.700', 'whiteAlpha.900');
    const lineColor = useColorModeValue('secondaryGray.200', 'whiteAlpha.200');
    useEffect(() => {
        if (!id)
            return;
        (async () => {
            try {
                setLoading(true);
                const [leadData, act, tk] = await Promise.all([
                    leadService.getById(id),
                    leadService.getActivity(id).catch(() => []),
                    taskService.getByLead(id).catch(() => []),
                ]);
                setLead(leadData);
                setNotes(leadData.notes || '');
                setActivities(act || []);
                setTasks(tk || []);
            }
            catch (error) {
                console.error('Erro ao carregar lead:', error);
            }
            finally {
                setLoading(false);
            }
        })();
    }, [id]);
    const handleSaveNotes = async () => {
        if (!lead)
            return;
        try {
            setSavingNotes(true);
            await leadService.update(lead.id, { notes });
            setLead({ ...lead, notes });
        }
        catch (error) {
            console.error('Erro ao salvar anotações:', error);
        }
        finally {
            setSavingNotes(false);
        }
    };
    const timeline = useMemo(() => {
        const acts = activities.map((a) => ({
            kind: 'activity',
            title: ACTION_LABELS[a.action] || a.action,
            detail: a.details?.reason || a.details?.leadName || null,
            user: a.user?.name || null,
            date: a.createdAt,
        }));
        const tks = tasks.map((t) => ({
            kind: 'task',
            title: t.completed ? `Tarefa concluída: ${t.title}` : `Tarefa: ${t.title}`,
            detail: t.description || null,
            user: null,
            date: t.createdAt || t.dueDate,
        }));
        return [...acts, ...tks].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [activities, tasks]);
    if (loading) {
        return (_jsx(Flex, { justify: "center", align: "center", minH: "300px", children: _jsx(Spinner, { size: "lg", color: "brand.500" }) }));
    }
    if (!lead) {
        return (_jsxs(Card, { children: [_jsx(Text, { color: labelColor, children: "Lead n\u00E3o encontrado." }), _jsx(Button, { mt: "16px", onClick: () => navigate('/leads'), leftIcon: _jsx(Icon, { as: ArrowLeft }), children: "Voltar para Leads" })] }));
    }
    const status = STATUS_META[lead.status] || { label: lead.status, colorScheme: 'gray' };
    const DetailRow = ({ icon, label, value }) => (_jsxs(Box, { mb: "12px", children: [_jsxs(Flex, { align: "center", gap: "6px", mb: "2px", children: [_jsx(Icon, { as: icon, boxSize: "14px", color: labelColor }), _jsx(Text, { fontSize: "xs", color: labelColor, children: label })] }), _jsx(Text, { fontSize: "sm", color: valueColor, pl: "20px", children: value || '—' })] }));
    return (_jsxs(Box, { children: [_jsx(Button, { variant: "ghost", size: "sm", mb: "12px", leftIcon: _jsx(Icon, { as: ArrowLeft }), onClick: () => navigate('/leads'), children: "Voltar para Leads" }), _jsx(Card, { mb: "20px", children: _jsxs(Flex, { justify: "space-between", align: { base: 'flex-start', md: 'center' }, direction: { base: 'column', md: 'row' }, gap: "12px", children: [_jsxs(Box, { children: [_jsx(Text, { fontSize: "2xl", fontWeight: "700", color: titleColor, children: lead.name }), _jsxs(Flex, { align: "center", gap: "6px", mt: "6px", color: labelColor, children: [_jsx(Icon, { as: Briefcase, boxSize: "14px" }), _jsxs(Text, { fontSize: "sm", children: [_jsx("strong", { children: "Cargo/Profiss\u00E3o:" }), " ", lead.profession || '—'] })] }), _jsxs(Flex, { align: "center", gap: "6px", mt: "4px", color: labelColor, children: [_jsx(Icon, { as: UserIcon, boxSize: "14px" }), _jsxs(Text, { fontSize: "sm", children: [_jsx("strong", { children: "Respons\u00E1vel:" }), " ", lead.responsible?.name || 'Sem dono'] })] }), _jsxs(Flex, { align: "center", gap: "8px", mt: "10px", children: [_jsx(Badge, { colorScheme: status.colorScheme, borderRadius: "8px", px: "10px", py: "3px", children: status.label }), _jsx(Badge, { borderRadius: "8px", px: "10px", py: "3px", children: CATEGORY_LABELS[lead.category] || lead.category })] })] }), _jsxs(Flex, { gap: "8px", wrap: "wrap", children: [_jsx(Button, { size: "sm", variant: "outline", leftIcon: _jsx(Icon, { as: FileText, boxSize: "16px" }), onClick: () => generateLeadWord(lead), children: "Documentos (Word)" }), _jsx(Button, { size: "sm", variant: "outline", leftIcon: _jsx(Icon, { as: FileText, boxSize: "16px" }), onClick: () => generateLeadPDF(lead), children: "Documentos (PDF)" })] })] }) }), _jsxs(SimpleGrid, { columns: { base: 1, lg: 3 }, spacing: "20px", children: [_jsxs(Box, { children: [_jsxs(Card, { mb: "20px", children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "16px", children: "Detalhes do Lead" }), _jsx(DetailRow, { icon: Mail, label: "Email", value: lead.email }), _jsx(DetailRow, { icon: Phone, label: "Telefone", value: lead.phone }), _jsx(DetailRow, { icon: UserIcon, label: "CPF", value: lead.cpf }), _jsx(DetailRow, { icon: MapPin, label: "Endere\u00E7o", value: [lead.address, lead.neighborhood].filter(Boolean).join(', ') }), _jsx(DetailRow, { icon: MapPin, label: "Cidade / UF", value: [lead.city, lead.state].filter(Boolean).join(' / ') }), _jsx(DetailRow, { icon: MapPin, label: "CEP", value: lead.zipCode }), _jsx(DetailRow, { icon: UserIcon, label: "Nacionalidade", value: lead.nationality }), _jsx(DetailRow, { icon: UserIcon, label: "Estado civil", value: lead.maritalStatus }), _jsx(Divider, { my: "8px", borderColor: lineColor }), _jsx(DetailRow, { icon: Clock, label: "Origem do Lead", value: lead.source })] }), _jsxs(Card, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "12px", children: "Anota\u00E7\u00F5es" }), _jsx(Textarea, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Escreva observa\u00E7\u00F5es sobre este lead...", borderRadius: "12px", rows: 5, mb: "10px" }), _jsx(Button, { size: "sm", variant: "brand", onClick: handleSaveNotes, isLoading: savingNotes, children: "Salvar anota\u00E7\u00E3o" })] })] }), _jsx(Box, { gridColumn: { lg: 'span 2' }, children: _jsxs(Card, { children: [_jsx(Text, { fontSize: "lg", fontWeight: "700", color: titleColor, mb: "16px", children: "Atividades do Lead" }), timeline.length === 0 ? (_jsx(Text, { color: labelColor, fontSize: "sm", py: "16px", children: "Nenhuma atividade registrada ainda." })) : (_jsx(Box, { children: timeline.map((item, i) => (_jsxs(Flex, { gap: "12px", pb: "16px", mb: "16px", borderBottom: i < timeline.length - 1 ? `1px solid` : 'none', borderColor: lineColor, children: [_jsx(Box, { children: _jsx(Flex, { w: "32px", h: "32px", borderRadius: "full", bg: item.kind === 'task' ? 'purple.100' : 'blue.100', align: "center", justify: "center", children: _jsx(Icon, { as: item.kind === 'task' ? FileText : Clock, boxSize: "16px", color: item.kind === 'task' ? 'purple.500' : 'blue.500' }) }) }), _jsxs(Box, { flex: "1", children: [_jsxs(Flex, { justify: "space-between", align: "flex-start", gap: "8px", wrap: "wrap", children: [_jsx(Text, { fontSize: "sm", fontWeight: "600", color: valueColor, children: item.title }), _jsx(Text, { fontSize: "xs", color: labelColor, whiteSpace: "nowrap", children: formatDate(item.date) })] }), item.detail && _jsx(Text, { fontSize: "xs", color: labelColor, mt: "2px", children: item.detail }), item.user && _jsxs(Text, { fontSize: "xs", color: labelColor, mt: "2px", children: ["por ", item.user] })] })] }, i))) }))] }) })] })] }));
}
