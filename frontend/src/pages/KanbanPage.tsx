import { useState, useEffect } from 'react';
import { Modal } from '@/components/Modals';
import { designSystem } from '@/theme/designSystem';
import { kanbanService, leadService, taskService } from '@/services/leadService';
import { KanbanCard as KanbanCardType, Lead, LeadTask } from '@/types';

type SectorInfo = { key: string; name: string; color: string; icon: string };

// Meta das abas conhecidas (cor/ícone/nome). Abas criadas pelo usuário guardam
// esses dados na própria configuração salva.
const BUILTIN_SECTORS: Record<string, { name: string; color: string; icon: string }> = {
  COMMERCIAL: { name: 'Comercial', color: designSystem.colors.primary.dark, icon: '💼' },
  LEGAL: { name: 'Jurídico', color: designSystem.colors.accent.gold, icon: '⚖️' },
  ADMINISTRATIVE: { name: 'Administrativo', color: designSystem.colors.primary.light, icon: '📋' },
};

// Por padrão o quadro começa apenas com a aba Comercial. Outras abas podem ser
// adicionadas ou removidas pelo próprio usuário.
const DEFAULT_SECTORS: SectorInfo[] = [
  { key: 'COMMERCIAL', name: 'Comercial', color: designSystem.colors.primary.dark, icon: '💼' },
];

const SECTORS_STORAGE_KEY = 'kanban_sectors';

function loadSectors(): SectorInfo[] {
  try {
    const raw = localStorage.getItem(SECTORS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SECTORS;
  } catch {
    return DEFAULT_SECTORS;
  }
}

// Etapas genéricas para abas criadas pelo usuário (sem etapas padrão definidas).
const GENERIC_STAGES: { key: string; name: string; editable?: boolean }[] = [
  { key: 'inicio', name: 'Início' },
  { key: 'andamento', name: 'Em andamento', editable: true },
  { key: 'concluido', name: 'Concluído', editable: true },
];

// Etapas padrão de cada Kanban, conforme briefing do cliente.
// As etapas marcadas como "editável" podem ser renomeadas pelo usuário.
const DEFAULT_STAGES: Record<string, { key: string; name: string; editable?: boolean }[]> = {
  COMMERCIAL: [
    { key: 'inicio', name: 'Início' },
    { key: 'replica', name: 'Réplica' },
    { key: 'pericia', name: 'Perícia' },
    { key: 'extra_1', name: 'Etapa Extra 1', editable: true },
    { key: 'extra_2', name: 'Etapa Extra 2', editable: true },
  ],
  LEGAL: [
    { key: 'inicial', name: 'Inicial' },
    { key: 'consulta', name: 'Consulta' },
    { key: 'pagamento', name: 'Pagamento' },
    { key: 'loss', name: 'Loss' },
  ],
  ADMINISTRATIVE: [
    { key: 'requerimento', name: 'Requerimento' },
    { key: 'pericia', name: 'Perícia' },
    { key: 'extra_1', name: 'Etapa Extra 1', editable: true },
    { key: 'extra_2', name: 'Etapa Extra 2', editable: true },
  ],
};

const STAGE_NAMES_STORAGE_KEY = 'kanban_stage_names';
const STAGE_REMOVED_STORAGE_KEY = 'kanban_stage_removed';

function loadStageNameOverrides(): Record<string, Record<string, string>> {
  try {
    const raw = localStorage.getItem(STAGE_NAMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadRemovedStages(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(STAGE_REMOVED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const STAGE_ADDED_STORAGE_KEY = 'kanban_stage_added';

function loadAddedStages(): Record<string, { key: string; name: string; editable?: boolean }[]> {
  try {
    const raw = localStorage.getItem(STAGE_ADDED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getStageKey(card: KanbanCardType, sector: string): string {
  const stages = DEFAULT_STAGES[sector];
  return stages.some((s) => s.key === card.stage) ? card.stage : stages[0].key;
}

export function KanbanPage() {
  const [sectors, setSectors] = useState<SectorInfo[]>(loadSectors());
  const [activeSector, setActiveSector] = useState<string>(loadSectors()[0].key);
  const [cards, setCards] = useState<Record<string, KanbanCardType[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<KanbanCardType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [stageNameOverrides, setStageNameOverrides] = useState<Record<string, Record<string, string>>>(
    loadStageNameOverrides()
  );
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [removedStages, setRemovedStages] = useState<Record<string, string[]>>(loadRemovedStages());
  const [addedStages, setAddedStages] = useState<Record<string, { key: string; name: string; editable?: boolean }[]>>(loadAddedStages());

  // Salva a configuração das colunas/abas no servidor (compartilhada entre todos)
  // e também no navegador como backup.
  const persistConfig = (
    names: Record<string, Record<string, string>>,
    removed: Record<string, string[]>,
    added: Record<string, { key: string; name: string; editable?: boolean }[]>,
    sectorsList: SectorInfo[] = sectors
  ) => {
    try {
      localStorage.setItem(SECTORS_STORAGE_KEY, JSON.stringify(sectorsList));
    } catch {
      /* ignore */
    }
    kanbanService.saveConfig({ names, removed, added, sectors: sectorsList } as any).catch((err) => {
      console.error('Erro ao salvar configuração das colunas:', err);
    });
  };

  // Carrega a configuração compartilhada das colunas do servidor
  const loadStageConfig = async () => {
    try {
      const config = await kanbanService.getConfig();
      if (config && typeof config === 'object') {
        if (config.names) setStageNameOverrides(config.names);
        if (config.removed) setRemovedStages(config.removed);
        if (config.added) setAddedStages(config.added);
        const cfgSectors = (config as any).sectors;
        if (Array.isArray(cfgSectors) && cfgSectors.length > 0) {
          setSectors(cfgSectors);
          setActiveSector((cur) => cfgSectors.some((s: SectorInfo) => s.key === cur) ? cur : cfgSectors[0].key);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração das colunas:', error);
    }
  };
  const [taskModalCard, setTaskModalCard] = useState<KanbanCardType | null>(null);
  const [editCard, setEditCard] = useState<KanbanCardType | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', cpf: '', category: 'CONSULTATION' });
  const [savingEditCard, setSavingEditCard] = useState(false);
  const [leadTasks, setLeadTasks] = useState<LeadTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskFile, setNewTaskFile] = useState<File | null>(null);
  const [savingTask, setSavingTask] = useState(false);

  const getStageName = (sector: string, stageKey: string, defaultName: string): string => {
    return stageNameOverrides[sector]?.[stageKey] || defaultName;
  };

  const renameStage = (sector: string, stageKey: string, newName: string) => {
    const updated = {
      ...stageNameOverrides,
      [sector]: { ...stageNameOverrides[sector], [stageKey]: newName },
    };
    setStageNameOverrides(updated);
    persistConfig(updated, removedStages, addedStages);
  };

  const isStageRemoved = (sector: string, stageKey: string): boolean => {
    return (removedStages[sector] || []).includes(stageKey);
  };

  const deleteStage = (sector: string, stageKey: string, stageName: string, cardCount: number) => {
    if (cardCount > 0) {
      alert(
        `A coluna "${stageName}" tem ${cardCount} card(s). Mova os cards para outra coluna antes de excluí-la.`
      );
      return;
    }
    if (!confirm(`Excluir a coluna "${stageName}"?`)) return;

    const updated = {
      ...removedStages,
      [sector]: [...(removedStages[sector] || []), stageKey],
    };
    setRemovedStages(updated);
    persistConfig(stageNameOverrides, updated, addedStages);
  };

  const restoreStages = (sector: string) => {
    const updated = { ...removedStages, [sector]: [] };
    setRemovedStages(updated);
    persistConfig(stageNameOverrides, updated, addedStages);
  };

  // Lista completa de colunas do setor: padrão + adicionadas, sem as removidas
  const getSectorStages = (sector: string): { key: string; name: string; editable?: boolean }[] => {
    const base = DEFAULT_STAGES[sector] || GENERIC_STAGES;
    const all = [...base, ...(addedStages[sector] || [])];
    return all.filter((s) => !isStageRemoved(sector, s.key));
  };

  const getSectorInfo = (sector: string): SectorInfo => {
    return (
      sectors.find((s) => s.key === sector) ||
      (BUILTIN_SECTORS[sector] && { key: sector, ...BUILTIN_SECTORS[sector] }) ||
      { key: sector, name: sector, color: designSystem.colors.primary.dark, icon: '📁' }
    );
  };

  // Cria uma nova aba (setor) no quadro.
  const addSector = () => {
    const name = prompt('Nome da nova aba (ex.: Financeiro, Pós-venda):');
    if (!name || !name.trim()) return;
    const key = `sector_${Date.now()}`;
    const updated = [...sectors, { key, name: name.trim(), color: designSystem.colors.primary.dark, icon: '📁' }];
    setSectors(updated);
    setActiveSector(key);
    persistConfig(stageNameOverrides, removedStages, addedStages, updated);
  };

  // Remove uma aba (setor) do quadro. Não permite remover a última.
  const removeSector = (sector: string) => {
    if (sectors.length <= 1) {
      alert('É preciso manter pelo menos uma aba no quadro.');
      return;
    }
    const info = getSectorInfo(sector);
    const count = (cards[sector] || []).length;
    const extra = count > 0
      ? `\n\nOs ${count} card(s) desta aba deixarão de aparecer no quadro (os leads continuam cadastrados).`
      : '';
    if (!confirm(`Remover a aba "${info.name}"?${extra}`)) return;
    const updated = sectors.filter((s) => s.key !== sector);
    setSectors(updated);
    setActiveSector((cur) => (cur === sector ? updated[0].key : cur));
    persistConfig(stageNameOverrides, removedStages, addedStages, updated);
  };

  // Retorna a coluna do card considerando colunas padrão E adicionadas
  const stageKeyOf = (card: KanbanCardType, sector: string): string => {
    const stages = getSectorStages(sector);
    return stages.some((s) => s.key === card.stage) ? card.stage : stages[0]?.key || '';
  };

  const addStage = (sector: string) => {
    const name = prompt('Nome da nova coluna:');
    if (!name || !name.trim()) return;
    const key = `custom_${Date.now()}`;
    const updated = {
      ...addedStages,
      [sector]: [...(addedStages[sector] || []), { key, name: name.trim(), editable: true }],
    };
    setAddedStages(updated);
    persistConfig(stageNameOverrides, removedStages, updated);
  };

  useEffect(() => {
    loadKanbanCards();
    loadStageConfig();
  }, []);

  const loadKanbanCards = async () => {
    try {
      setIsLoading(true);
      const allCards = await kanbanService.getCards();

      // Organizar cards por setor (agrupa qualquer setor que vier do backend)
      const organizedCards: Record<string, KanbanCardType[]> = {};

      allCards.forEach((card: any) => {
        if (!organizedCards[card.sector]) organizedCards[card.sector] = [];
        organizedCards[card.sector].push(card);
      });

      setCards(organizedCards);
    } catch (error) {
      console.error('Erro ao carregar kanban:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (card: KanbanCardType) => {
    setDraggedCard(card);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stageKey: string) => {
    if (!draggedCard) return;

    try {
      // Mover card para novo estágio dentro do setor ativo
      await kanbanService.moveCard(draggedCard.id, {
        sector: activeSector as any,
        stage: stageKey,
        position: 0,
      } as any);

      await loadKanbanCards();
      setDraggedCard(null);
    } catch (error) {
      console.error('Erro ao mover card:', error);
    }
  };

  const openAddModal = async () => {
    setShowAddModal(true);
    setLeadSearch('');

    try {
      setLeadsLoading(true);
      const { leads } = await leadService.getAll(1, 100);

      // Não mostrar leads que já estão em algum card do Kanban
      const cardLeadIds = new Set(
        Object.values(cards).flat().map((card) => card.leadId)
      );
      setAvailableLeads(leads.filter((lead) => !cardLeadIds.has(lead.id)));
    } catch (error) {
      console.error('Erro ao carregar leads:', error);
    } finally {
      setLeadsLoading(false);
    }
  };

  const handleAddCard = async (leadId: string) => {
    try {
      const firstStage = getSectorStages(activeSector)[0].key;
      await kanbanService.createCardFromLead(leadId, activeSector, firstStage);
      setShowAddModal(false);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao adicionar card:', error);
    }
  };

  const handleDeleteCard = async (card: KanbanCardType) => {
    const name = card.lead?.name || 'este card';
    if (!confirm(`Remover "${name}" do quadro?\n\n(O lead continua cadastrado na página de Leads — só sai do quadro.)`)) return;
    try {
      await kanbanService.deleteCard(card.id);
      if (draggedCard?.id === card.id) setDraggedCard(null);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao remover card:', error);
      alert('Erro ao remover o card. Tente novamente.');
    }
  };

  const openEditCard = (card: KanbanCardType) => {
    setEditForm({
      name: card.lead?.name || '',
      phone: card.lead?.phone || '',
      email: card.lead?.email || '',
      cpf: card.lead?.cpf || '',
      category: (card.lead?.category as any) || 'CONSULTATION',
    });
    setEditCard(card);
  };

  const handleSaveEditCard = async () => {
    if (!editCard) return;
    try {
      setSavingEditCard(true);
      await leadService.update(editCard.leadId, {
        ...editForm,
        category: editForm.category as any,
      });
      setEditCard(null);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao editar lead do card:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSavingEditCard(false);
    }
  };

  const openTasksModal = async (card: KanbanCardType) => {
    setTaskModalCard(card);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setNewTaskFile(null);

    try {
      setTasksLoading(true);
      const tasks = await taskService.getByLead(card.leadId);
      setLeadTasks(tasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const closeTasksModal = () => {
    setTaskModalCard(null);
    setLeadTasks([]);
  };

  const handleCreateTask = async () => {
    if (!taskModalCard || !newTaskTitle.trim()) return;

    try {
      setSavingTask(true);
      await taskService.create(taskModalCard.leadId, {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        dueDate: newTaskDueDate || undefined,
        file: newTaskFile || undefined,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setNewTaskFile(null);
      const tasks = await taskService.getByLead(taskModalCard.leadId);
      setLeadTasks(tasks);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleTask = async (task: LeadTask) => {
    if (!taskModalCard) return;

    try {
      await taskService.update(task.id, { completed: !task.completed });
      const tasks = await taskService.getByLead(taskModalCard.leadId);
      setLeadTasks(tasks);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDeleteTask = async (task: LeadTask) => {
    if (!taskModalCard) return;

    try {
      await taskService.delete(task.id);
      const tasks = await taskService.getByLead(taskModalCard.leadId);
      setLeadTasks(tasks);
      await loadKanbanCards();
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: designSystem.colors.neutral.light
      }}>
        <div style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${designSystem.colors.primary.light}`,
            borderTop: `4px solid ${designSystem.colors.primary.dark}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: designSystem.colors.primary.dark, fontWeight: '600' }}>
            Carregando CRM...
          </p>
        </div>
      </div>
    );
  }

  // Mapa de meta das abas para acesso por chave no render.
  const sectorNames: Record<string, SectorInfo> = {};
  sectors.forEach((s) => { sectorNames[s.key] = getSectorInfo(s.key); });
  if (!sectorNames[activeSector]) sectorNames[activeSector] = getSectorInfo(activeSector);

  const activeColor = sectorNames[activeSector].color;
  const sectorCards = cards[activeSector] || [];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: designSystem.colors.primary.dark
        }}>
          📊 CRM - Gestão de Processos
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={openAddModal}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: activeColor,
              color: designSystem.colors.neutral.white,
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: designSystem.transitions.normal
            }}
          >
            + Adicionar lead
          </button>
          <button
            onClick={loadKanbanCards}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: `1px solid ${designSystem.colors.neutral.gray300}`,
              backgroundColor: designSystem.colors.neutral.white,
              color: designSystem.colors.primary.dark,
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {/* Sector Tabs - cada setor é um kanban isolado. Abas podem ser adicionadas/removidas. */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        {sectors.map((s) => {
          const sector = s.key;
          const isActive = sector === activeSector;
          const sectorInfo = sectorNames[sector];
          return (
            <div
              key={sector}
              onClick={() => setActiveSector(sector)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px 12px 24px',
                borderRadius: '8px 8px 0 0',
                border: `2px solid ${sectorInfo.color}`,
                borderBottom: isActive ? `2px solid ${sectorInfo.color}` : 'none',
                backgroundColor: isActive ? sectorInfo.color : designSystem.colors.neutral.white,
                color: isActive ? designSystem.colors.neutral.white : sectorInfo.color,
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                transition: designSystem.transitions.normal
              }}
            >
              <span>{sectorInfo.icon} {sectorInfo.name} ({(cards[sector] || []).length})</span>
              {sectors.length > 1 && (
                <span
                  role="button"
                  title="Remover esta aba"
                  onClick={(e) => { e.stopPropagation(); removeSector(sector); }}
                  style={{ fontSize: '16px', lineHeight: 1, fontWeight: '700', opacity: 0.75, padding: '0 2px' }}
                >
                  ×
                </span>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addSector}
          title="Adicionar nova aba"
          style={{
            padding: '10px 18px',
            borderRadius: '8px 8px 0 0',
            border: `2px dashed ${designSystem.colors.neutral.gray400}`,
            borderBottom: 'none',
            backgroundColor: designSystem.colors.neutral.white,
            color: designSystem.colors.primary.dark,
            fontWeight: '700',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          ➕ Nova aba
        </button>
      </div>

      {/* Board do setor ativo - kanban isolado com 3 colunas (estágios) */}
      <div style={{
        backgroundColor: designSystem.colors.neutral.white,
        borderRadius: '12px',
        padding: '24px',
        boxShadow: designSystem.shadows.md,
        border: `2px solid ${activeColor}33`
      }}>
        <h2 style={{
          fontWeight: 'bold',
          color: activeColor,
          fontSize: '18px',
          marginBottom: '20px'
        }}>
          {sectorNames[activeSector].icon} CRM - {sectorNames[activeSector].name}
        </h2>

        {(removedStages[activeSector] || []).length > 0 && (
          <button
            type="button"
            onClick={() => restoreStages(activeSector)}
            style={{
              marginBottom: '16px',
              padding: '6px 12px',
              border: `1px solid ${activeColor}`,
              borderRadius: '8px',
              background: 'transparent',
              color: activeColor,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            ↩️ Restaurar colunas excluídas
          </button>
        )}

        <button
          type="button"
          onClick={() => addStage(activeSector)}
          style={{
            marginBottom: '16px',
            marginLeft: (removedStages[activeSector] || []).length > 0 ? '8px' : '0',
            padding: '6px 12px',
            border: `1px solid ${activeColor}`,
            borderRadius: '8px',
            background: activeColor,
            color: designSystem.colors.neutral.white,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          ➕ Nova coluna
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {getSectorStages(activeSector).map((stage) => {
            const stageCards = sectorCards.filter((card) => stageKeyOf(card, activeSector) === stage.key);
            const stageName = getStageName(activeSector, stage.key, stage.name);
            const editId = `${activeSector}:${stage.key}`;
            const isEditing = editingStage === editId;

            return (
              <div
                key={stage.key}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage.key)}
                style={{
                  backgroundColor: designSystem.colors.neutral.light,
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '500px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `2px solid ${activeColor}`,
                  gap: '8px'
                }}>
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      defaultValue={stageName}
                      onBlur={(e) => {
                        renameStage(activeSector, stage.key, e.target.value.trim() || stage.name);
                        setEditingStage(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                      }}
                      style={{
                        fontWeight: 'bold',
                        color: activeColor,
                        fontSize: '15px',
                        border: `1px solid ${activeColor}`,
                        borderRadius: '4px',
                        padding: '2px 6px',
                        width: '100%'
                      }}
                    />
                  ) : (
                    <h3 style={{
                      fontWeight: 'bold',
                      color: activeColor,
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: stage.editable ? 'pointer' : 'default'
                    }}
                      onClick={() => stage.editable && setEditingStage(editId)}
                      title={stage.editable ? 'Clique para renomear esta etapa' : undefined}
                    >
                      {stageName}
                      {stage.editable && <span style={{ fontSize: '12px' }}>✏️</span>}
                    </h3>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                      backgroundColor: activeColor,
                      color: designSystem.colors.neutral.white,
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {stageCards.length}
                    </span>
                    <button
                      type="button"
                      title="Excluir coluna"
                      onClick={() => deleteStage(activeSector, stage.key, stageName, stageCards.length)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: 1,
                        padding: '2px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Botao "mover para ca" (aparece quando um card esta selecionado - util no celular) */}
                {draggedCard && stageKeyOf(draggedCard, activeSector) !== stage.key && (
                  <button
                    onClick={() => handleDrop(stage.key)}
                    style={{
                      width: '100%',
                      marginBottom: '12px',
                      padding: '10px',
                      backgroundColor: activeColor,
                      color: designSystem.colors.neutral.white,
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '13px'
                    }}
                  >
                    📥 Mover "{draggedCard.lead?.name || 'card'}" para cá
                  </button>
                )}

                {/* Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                  {stageCards.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: designSystem.colors.neutral.gray400,
                      padding: '32px 16px'
                    }}>
                      <p style={{ fontSize: '14px' }}>Nenhum card nesta coluna</p>
                    </div>
                  ) : (
                    stageCards.map((card) => (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={() => handleDragStart(card)}
                        style={{
                          padding: '16px',
                          backgroundColor: designSystem.colors.neutral.white,
                          borderRadius: '8px',
                          boxShadow: draggedCard?.id === card.id ? 'none' : designSystem.shadows.md,
                          cursor: 'move',
                          transition: designSystem.transitions.normal,
                          border: `1px solid ${activeColor}`,
                          opacity: draggedCard?.id === card.id ? 0.5 : 1,
                          transform: draggedCard?.id === card.id ? 'scale(0.95)' : 'scale(1)'
                        }}
                        onMouseEnter={(e) => {
                          if (draggedCard?.id !== card.id) {
                            e.currentTarget.style.boxShadow = designSystem.shadows.lg;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (draggedCard?.id !== card.id) {
                            e.currentTarget.style.boxShadow = designSystem.shadows.md;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Lead Name */}
                          <h3 style={{
                            fontWeight: '600',
                            color: designSystem.colors.primary.dark,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '15px'
                          }}>
                            {card.lead?.name || 'Sem nome'}
                          </h3>

                          {/* Botoes: mover (selecionar) + excluir card */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDraggedCard(draggedCard?.id === card.id ? null : card);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: `1px solid ${activeColor}`,
                                borderRadius: '6px',
                                backgroundColor: draggedCard?.id === card.id ? activeColor : designSystem.colors.neutral.white,
                                color: draggedCard?.id === card.id ? designSystem.colors.neutral.white : activeColor,
                                cursor: 'pointer'
                              }}
                            >
                              {draggedCard?.id === card.id ? '✓ Selecionado (escolha a coluna)' : '↔ Mover'}
                            </button>
                            <button
                              title="Editar dados do lead"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditCard(card);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: `1px solid ${activeColor}`,
                                borderRadius: '6px',
                                backgroundColor: designSystem.colors.neutral.white,
                                color: activeColor,
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              title="Remover card do quadro"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCard(card);
                              }}
                              style={{
                                padding: '4px 10px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: `1px solid ${designSystem.colors.status.error}`,
                                borderRadius: '6px',
                                backgroundColor: designSystem.colors.neutral.white,
                                color: designSystem.colors.status.error,
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Excluir
                            </button>
                          </div>

                          {/* Category Badge */}
                          {card.lead?.category && (
                            <div style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '500',
                              backgroundColor: `${designSystem.colors.primary.light}20`,
                              color: designSystem.colors.primary.dark,
                              width: 'fit-content'
                            }}>
                              {card.lead.category}
                            </div>
                          )}

                          {/* Lead Info */}
                          {card.lead && (
                            <div style={{ fontSize: '12px', color: designSystem.colors.neutral.gray600, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <p>📧 {card.lead.email}</p>
                              <p>📱 {card.lead.phone}</p>
                            </div>
                          )}

                          {/* Notes */}
                          {card.notes && (
                            <p style={{
                              fontSize: '12px',
                              color: designSystem.colors.neutral.gray500,
                              fontStyle: 'italic',
                              marginTop: '8px',
                              borderTop: `1px solid ${designSystem.colors.neutral.gray300}`,
                              paddingTop: '8px'
                            }}>
                              {card.notes.substring(0, 50)}...
                            </p>
                          )}

                          {/* Tasks button + pending indicator */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openTasksModal(card);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '6px',
                              marginTop: '4px',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: `1px solid ${designSystem.colors.neutral.gray300}`,
                              backgroundColor: (card.lead?.tasks?.length || 0) > 0
                                ? `${designSystem.colors.accent.gold}20`
                                : designSystem.colors.neutral.light,
                              color: designSystem.colors.primary.dark,
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <span>📌 Tarefas</span>
                            {(card.lead?.tasks?.length || 0) > 0 && (
                              <span style={{
                                backgroundColor: designSystem.colors.accent.gold,
                                color: designSystem.colors.neutral.white,
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '11px'
                              }}>
                                {card.lead?.tasks?.length} pendente{(card.lead?.tasks?.length || 0) > 1 ? 's' : ''}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: `${designSystem.colors.primary.light}15`,
        border: `1px solid ${designSystem.colors.primary.light}`,
        borderRadius: '8px'
      }}>
        <p style={{
          fontSize: '14px',
          color: designSystem.colors.primary.dark,
          margin: 0
        }}>
          💡 <strong>Dica:</strong> Cada aba é um CRM isolado com suas próprias etapas. Use “➕ Nova aba” para criar outras abas e o “×” na aba para removê-la. Mova os cards entre as colunas (arrastando no PC ou pelo botão "Mover" no celular). Colunas com ✏️ podem ter o nome alterado clicando no título, e o 🗑️ exclui a coluna (se estiver vazia).
        </p>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`➕ Adicionar lead - ${sectorNames[activeSector].name}`}
        size="medium"
      >
        <input
          type="text"
          placeholder="Buscar lead por nome..."
          value={leadSearch}
          onChange={(e) => setLeadSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${designSystem.colors.neutral.gray300}`,
            fontSize: '14px',
            marginBottom: '16px',
            boxSizing: 'border-box'
          }}
        />

        {leadsLoading ? (
          <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500 }}>
            Carregando leads...
          </p>
        ) : (
          (() => {
            const filteredLeads = availableLeads.filter((lead) =>
              lead.name.toLowerCase().includes(leadSearch.toLowerCase())
            );

            if (filteredLeads.length === 0) {
              return (
                <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500, padding: '24px 0' }}>
                  {availableLeads.length === 0
                    ? 'Nenhum lead disponível. Cadastre um novo lead na página de Leads para poder adicioná-lo ao CRM.'
                    : 'Nenhum lead encontrado para essa busca.'}
                </p>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleAddCard(lead.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${designSystem.colors.neutral.gray300}`,
                      backgroundColor: designSystem.colors.neutral.white,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: designSystem.transitions.normal
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = designSystem.colors.neutral.light;
                      e.currentTarget.style.borderColor = activeColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = designSystem.colors.neutral.white;
                      e.currentTarget.style.borderColor = designSystem.colors.neutral.gray300;
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '600', color: designSystem.colors.primary.dark, margin: 0 }}>
                        {lead.name}
                      </p>
                      <p style={{ fontSize: '12px', color: designSystem.colors.neutral.gray600, margin: '4px 0 0' }}>
                        {lead.category} • {lead.phone}
                      </p>
                    </div>
                    <span style={{ fontSize: '20px', color: designSystem.colors.neutral.gray400 }}>+</span>
                  </button>
                ))}
              </div>
            );
          })()
        )}
      </Modal>

      {/* Tasks/Reminders Modal */}
      {/* Modal: editar dados do lead do card */}
      <Modal
        isOpen={!!editCard}
        onClose={() => !savingEditCard && setEditCard(null)}
        title="✏️ Editar dados do lead"
        size="medium"
        onConfirm={handleSaveEditCard}
        confirmText={savingEditCard ? 'Salvando...' : 'Salvar'}
      >
        {(() => {
          const fieldStyle: React.CSSProperties = {
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${designSystem.colors.neutral.gray300}`,
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '12px',
            boxSizing: 'border-box',
          };
          const labelStyle: React.CSSProperties = {
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '4px',
            color: designSystem.colors.primary.dark,
          };
          return (
            <div>
              <label style={labelStyle}>Nome</label>
              <input style={fieldStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <label style={labelStyle}>Email</label>
              <input style={fieldStyle} value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <label style={labelStyle}>Telefone</label>
              <input style={fieldStyle} value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <label style={labelStyle}>CPF</label>
              <input style={fieldStyle} value={editForm.cpf} onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })} />
              <label style={labelStyle}>Categoria</label>
              <select style={fieldStyle} value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                <option value="CONSULTATION">Consulta</option>
                <option value="PROCESS">Processo</option>
                <option value="BPC_LOAS">BPC/LOAS</option>
                <option value="RETIREMENT">Aposentadoria</option>
              </select>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={!!taskModalCard}
        onClose={closeTasksModal}
        title={`📌 Tarefas - ${taskModalCard?.lead?.name || ''}`}
        size="medium"
      >
        {tasksLoading ? (
          <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500 }}>
            Carregando tarefas...
          </p>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
              {leadTasks.length === 0 ? (
                <p style={{ textAlign: 'center', color: designSystem.colors.neutral.gray500, padding: '16px 0' }}>
                  Nenhuma tarefa cadastrada para este lead.
                </p>
              ) : (
                leadTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${designSystem.colors.neutral.gray300}`,
                      backgroundColor: task.completed ? `${designSystem.colors.neutral.gray300}20` : designSystem.colors.neutral.white
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task)}
                      style={{ marginTop: '4px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: 0,
                        fontWeight: '600',
                        fontSize: '14px',
                        color: designSystem.colors.primary.dark,
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: designSystem.colors.neutral.gray600 }}>
                          {task.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: designSystem.colors.neutral.gray500 }}>
                        {task.dueDate && <span>📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                        {task.attachmentName && <span>📎 {task.attachmentName}</span>}
                        {task.createdBy?.name && <span>👤 {task.createdBy.name}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task)}
                      style={{
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: designSystem.colors.neutral.gray400,
                        fontSize: '16px'
                      }}
                      title="Remover tarefa"
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* New task form */}
            <div style={{
              borderTop: `1px solid ${designSystem.colors.neutral.gray300}`,
              paddingTop: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <input
                type="text"
                placeholder="Título da tarefa..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                placeholder="Descrição (opcional)..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={2}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${designSystem.colors.neutral.gray300}`,
                    fontSize: '14px'
                  }}
                />
                <input
                  type="file"
                  onChange={(e) => setNewTaskFile(e.target.files?.[0] || null)}
                  style={{ fontSize: '13px', flex: 1 }}
                />
              </div>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || savingTask}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: sectorNames[activeSector].color,
                  color: designSystem.colors.neutral.white,
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: !newTaskTitle.trim() || savingTask ? 'not-allowed' : 'pointer',
                  opacity: !newTaskTitle.trim() || savingTask ? 0.6 : 1
                }}
              >
                {savingTask ? 'Salvando...' : '+ Adicionar tarefa'}
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
