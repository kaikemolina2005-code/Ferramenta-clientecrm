import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Textarea,
  Icon,
  Divider,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  User as UserIcon,
  Briefcase,
  Clock,
  Trash2,
} from 'lucide-react';
import Card from '@/components/horizon/Card';
import { leadService, taskService, noteService } from '@/services/leadService';
import { generateLeadWord, generateLeadPDF } from '@/utils/leadDocuments';
import type { Lead, LeadTask, LeadNote } from '@/types';

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

const ACTION_LABELS: Record<string, string> = {
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

function formatDate(date: string | Date): string {
  try {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<LeadTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [leadNotes, setLeadNotes] = useState<LeadNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const titleColor = useColorModeValue('navy.700', 'white');
  const labelColor = useColorModeValue('secondaryGray.600', 'secondaryGray.500');
  const valueColor = useColorModeValue('navy.700', 'whiteAlpha.900');
  const lineColor = useColorModeValue('secondaryGray.200', 'whiteAlpha.200');
  const noteBg = useColorModeValue('gray.50', 'whiteAlpha.100');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [leadData, act, tk, nts] = await Promise.all([
          leadService.getById(id),
          leadService.getActivity(id).catch(() => []),
          taskService.getByLead(id).catch(() => []),
          noteService.getByLead(id).catch(() => []),
        ]);
        setLead(leadData);
        setActivities(act || []);
        setTasks(tk || []);
        setLeadNotes(nts || []);
      } catch (error) {
        console.error('Erro ao carregar lead:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddNote = async () => {
    if (!lead || !newNote.trim()) return;
    try {
      setSavingNote(true);
      await noteService.create(lead.id, newNote.trim());
      setNewNote('');
      const nts = await noteService.getByLead(lead.id);
      setLeadNotes(nts);
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      alert('Erro ao salvar a anotação. Tente novamente.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Remover esta anotação?')) return;
    try {
      await noteService.delete(noteId);
      setLeadNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (error) {
      console.error('Erro ao remover anotação:', error);
    }
  };

  const timeline = useMemo(() => {
    const acts = activities.map((a) => ({
      kind: 'activity' as const,
      title: ACTION_LABELS[a.action] || a.action,
      detail: a.details?.reason || a.details?.leadName || null,
      user: a.user?.name || null,
      date: a.createdAt,
    }));
    const tks = tasks.map((t) => ({
      kind: 'task' as const,
      title: t.completed ? `Tarefa concluída: ${t.title}` : `Tarefa: ${t.title}`,
      detail: t.description || null,
      user: null,
      date: (t as any).createdAt || (t as any).dueDate,
    }));
    return [...acts, ...tks].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [activities, tasks]);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Spinner size="lg" color="brand.500" />
      </Flex>
    );
  }

  if (!lead) {
    return (
      <Card>
        <Text color={labelColor}>Lead não encontrado.</Text>
        <Button mt="16px" onClick={() => navigate('/leads')} leftIcon={<Icon as={ArrowLeft} />}>
          Voltar para Leads
        </Button>
      </Card>
    );
  }

  const status = STATUS_META[lead.status] || { label: lead.status, colorScheme: 'gray' };

  const DetailRow = ({ icon, label, value }: { icon: any; label: string; value?: string }) => (
    <Box mb="12px">
      <Flex align="center" gap="6px" mb="2px">
        <Icon as={icon} boxSize="14px" color={labelColor} />
        <Text fontSize="xs" color={labelColor}>{label}</Text>
      </Flex>
      <Text fontSize="sm" color={valueColor} pl="20px">{value || '—'}</Text>
    </Box>
  );

  return (
    <Box>
      <Button
        variant="ghost"
        size="sm"
        mb="12px"
        leftIcon={<Icon as={ArrowLeft} />}
        onClick={() => navigate('/leads')}
      >
        Voltar para Leads
      </Button>

      {/* Cabeçalho */}
      <Card mb="20px">
        <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap="12px">
          <Box>
            <Text fontSize="2xl" fontWeight="700" color={titleColor}>{lead.name}</Text>
            <Flex align="center" gap="6px" mt="6px" color={labelColor}>
              <Icon as={Briefcase} boxSize="14px" />
              <Text fontSize="sm"><strong>Cargo/Profissão:</strong> {lead.profession || '—'}</Text>
            </Flex>
            <Flex align="center" gap="6px" mt="4px" color={labelColor}>
              <Icon as={UserIcon} boxSize="14px" />
              <Text fontSize="sm"><strong>Responsável:</strong> {lead.responsible?.name || 'Sem dono'}</Text>
            </Flex>
            <Flex align="center" gap="8px" mt="10px">
              <Badge colorScheme={status.colorScheme} borderRadius="8px" px="10px" py="3px">{status.label}</Badge>
              <Badge borderRadius="8px" px="10px" py="3px">{CATEGORY_LABELS[lead.category] || lead.category}</Badge>
            </Flex>
          </Box>
          <Flex gap="8px" wrap="wrap">
            <Button size="sm" variant="outline" leftIcon={<Icon as={FileText} boxSize="16px" />} onClick={() => generateLeadWord(lead)}>
              Documentos (Word)
            </Button>
            <Button size="sm" variant="outline" leftIcon={<Icon as={FileText} boxSize="16px" />} onClick={() => generateLeadPDF(lead)}>
              Documentos (PDF)
            </Button>
          </Flex>
        </Flex>
      </Card>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="20px">
        {/* Coluna esquerda: detalhes + anotações */}
        <Box>
          <Card mb="20px">
            <Text fontSize="lg" fontWeight="700" color={titleColor} mb="16px">Detalhes do Lead</Text>
            <DetailRow icon={Mail} label="Email" value={lead.email} />
            <DetailRow icon={Phone} label="Telefone" value={lead.phone} />
            <DetailRow icon={UserIcon} label="CPF" value={lead.cpf} />
            <DetailRow icon={MapPin} label="Endereço" value={[lead.address, lead.neighborhood].filter(Boolean).join(', ')} />
            <DetailRow icon={MapPin} label="Cidade / UF" value={[lead.city, lead.state].filter(Boolean).join(' / ')} />
            <DetailRow icon={MapPin} label="CEP" value={lead.zipCode} />
            <DetailRow icon={UserIcon} label="Nacionalidade" value={lead.nationality} />
            <DetailRow icon={UserIcon} label="Estado civil" value={lead.maritalStatus} />
            <Divider my="8px" borderColor={lineColor} />
            <DetailRow icon={Clock} label="Origem do Lead" value={lead.source} />
          </Card>

          <Card>
            <Text fontSize="lg" fontWeight="700" color={titleColor} mb="4px">📝 Anotações e Reuniões</Text>
            <Text fontSize="xs" color={labelColor} mb="12px">
              Registre reuniões, ligações e combinados. Cada anotação fica salva com data e autor.
            </Text>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ex: Reunião feita hoje com o cliente. Ficou de enviar os documentos até sexta..."
              borderRadius="12px"
              rows={3}
              mb="10px"
            />
            <Button size="sm" variant="brand" onClick={handleAddNote} isLoading={savingNote} isDisabled={!newNote.trim()} mb="16px">
              + Adicionar anotação
            </Button>

            {leadNotes.length === 0 ? (
              <Text color={labelColor} fontSize="sm">Nenhuma anotação ainda.</Text>
            ) : (
              <Box>
                {leadNotes.map((n) => (
                  <Flex key={n.id} direction="column" bg={noteBg} borderLeft="3px solid" borderColor="brand.500" borderRadius="0 8px 8px 0" p="10px 12px" mb="10px">
                    <Flex justify="space-between" align="center" gap="8px">
                      <Text fontSize="xs" fontWeight="600" color={valueColor}>{n.createdBy?.name || 'Usuário'}</Text>
                      <Flex align="center" gap="8px">
                        <Text fontSize="xs" color={labelColor} whiteSpace="nowrap">{formatDate(n.createdAt)}</Text>
                        <Icon as={Trash2} boxSize="14px" color={labelColor} cursor="pointer" onClick={() => handleDeleteNote(n.id)} />
                      </Flex>
                    </Flex>
                    <Text fontSize="sm" color={valueColor} mt="6px" whiteSpace="pre-wrap">{n.content}</Text>
                  </Flex>
                ))}
              </Box>
            )}
          </Card>
        </Box>

        {/* Coluna direita: linha do tempo */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Card>
            <Text fontSize="lg" fontWeight="700" color={titleColor} mb="16px">Atividades do Lead</Text>
            {timeline.length === 0 ? (
              <Text color={labelColor} fontSize="sm" py="16px">Nenhuma atividade registrada ainda.</Text>
            ) : (
              <Box>
                {timeline.map((item, i) => (
                  <Flex key={i} gap="12px" pb="16px" mb="16px" borderBottom={i < timeline.length - 1 ? `1px solid` : 'none'} borderColor={lineColor}>
                    <Box>
                      <Flex w="32px" h="32px" borderRadius="full" bg={item.kind === 'task' ? 'purple.100' : 'blue.100'} align="center" justify="center">
                        <Icon as={item.kind === 'task' ? FileText : Clock} boxSize="16px" color={item.kind === 'task' ? 'purple.500' : 'blue.500'} />
                      </Flex>
                    </Box>
                    <Box flex="1">
                      <Flex justify="space-between" align="flex-start" gap="8px" wrap="wrap">
                        <Text fontSize="sm" fontWeight="600" color={valueColor}>{item.title}</Text>
                        <Text fontSize="xs" color={labelColor} whiteSpace="nowrap">{formatDate(item.date)}</Text>
                      </Flex>
                      {item.detail && <Text fontSize="xs" color={labelColor} mt="2px">{item.detail}</Text>}
                      {item.user && <Text fontSize="xs" color={labelColor} mt="2px">por {item.user}</Text>}
                    </Box>
                  </Flex>
                ))}
              </Box>
            )}
          </Card>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
