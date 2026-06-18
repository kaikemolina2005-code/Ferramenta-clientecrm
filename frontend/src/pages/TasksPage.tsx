import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Circle, Trash2, Plus, Paperclip, Calendar, User } from 'lucide-react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';

interface Lead {
  id: string;
  name: string;
  phone: string;
}

interface Task {
  id: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  lead: Lead;
  createdBy: { id: string; name: string };
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${designSystem.colors.neutral.gray300}`,
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'Segoe UI, sans-serif',
  backgroundColor: designSystem.colors.neutral.white,
  color: designSystem.colors.neutral.black,
  outline: 'none',
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterLeadId, setFilterLeadId] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>('all');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    leadId: '',
    title: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, leadsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/leads'),
      ]);
      setTasks(tasksRes.data.data || []);
      setLeads(leadsRes.data.leads || leadsRes.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leadId || !form.title.trim()) return;
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', form.title);
      if (form.description) formData.append('description', form.description);
      if (form.dueDate) formData.append('dueDate', form.dueDate);
      if (fileRef.current?.files?.[0]) {
        formData.append('file', fileRef.current.files[0]);
      }
      const res = await api.post(`/tasks/lead/${form.leadId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newTask = res.data.data;
      // enriquecer com dados do lead
      const lead = leads.find((l) => l.id === form.leadId);
      setTasks([{ ...newTask, lead: lead || { id: form.leadId, name: '', phone: '' } }, ...tasks]);
      setForm({ leadId: '', title: '', description: '', dueDate: '' });
      if (fileRef.current) fileRef.current.value = '';
      setShowForm(false);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      const res = await api.put(`/tasks/${task.id}`, { completed: !task.completed });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, ...res.data.data } : t)));
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filterLeadId && t.leadId !== filterLeadId) return false;
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'done' && !t.completed) return false;
    return true;
  });

  const pending = tasks.filter((t) => !t.completed).length;
  const done = tasks.filter((t) => t.completed).length;

  const isOverdue = (t: Task) =>
    !t.completed && t.dueDate && new Date(t.dueDate) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: designSystem.colors.primary.dark }}>
            ✅ Tarefas
          </h1>
          <p className="text-sm mt-1" style={{ color: designSystem.colors.neutral.gray500 }}>
            Organize a rotina do escritório por lead
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="inline mr-1" />
          Nova Tarefa
        </Button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>Total</p>
              <p className="text-3xl font-bold mt-1" style={{ color: designSystem.colors.primary.dark }}>{tasks.length}</p>
            </div>
            <span style={{ fontSize: 32 }}>📋</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>Pendentes</p>
              <p className="text-3xl font-bold mt-1" style={{ color: designSystem.colors.status.warning }}>{pending}</p>
            </div>
            <span style={{ fontSize: 32 }}>⏳</span>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>Concluídas</p>
              <p className="text-3xl font-bold mt-1" style={{ color: designSystem.colors.status.success }}>{done}</p>
            </div>
            <span style={{ fontSize: 32 }}>✅</span>
          </div>
        </Card>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card title="Nova Tarefa" icon="➕">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: designSystem.colors.primary.dark }}>
                  Lead *
                </label>
                <select
                  value={form.leadId}
                  onChange={(e) => setForm({ ...form, leadId: e.target.value })}
                  style={inputStyle}
                  required
                >
                  <option value="">Selecione um lead...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: designSystem.colors.primary.dark }}>
                  Prazo
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: designSystem.colors.primary.dark }}>
                Título *
              </label>
              <input
                type="text"
                placeholder="Ex: Protocolar petição inicial"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: designSystem.colors.primary.dark }}>
                Descrição
              </label>
              <textarea
                placeholder="Detalhes da tarefa..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: designSystem.colors.primary.dark }}>
                Anexo (documento vinculado)
              </label>
              <input type="file" ref={fileRef} style={{ fontSize: '14px' }} />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#1a3a6b',
                  color: '#fff',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? 'Salvando...' : 'Criar Tarefa'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: designSystem.colors.neutral.gray600, backgroundColor: designSystem.colors.neutral.gray100 }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterLeadId}
          onChange={(e) => setFilterLeadId(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '200px' }}
        >
          <option value="">Todos os leads</option>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(['all', 'pending', 'done'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: filterStatus === s ? designSystem.colors.primary.dark : designSystem.colors.neutral.gray100,
                color: filterStatus === s ? designSystem.colors.neutral.white : designSystem.colors.neutral.gray600,
              }}
            >
              {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendentes' : 'Concluídas'}
            </button>
          ))}
        </div>
        <span className="text-sm" style={{ color: designSystem.colors.neutral.gray500 }}>
          {filtered.length} tarefa{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista de tarefas */}
      {loading ? (
        <Card><p className="text-center py-8" style={{ color: designSystem.colors.neutral.gray400 }}>Carregando...</p></Card>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="text-center py-8" style={{ color: designSystem.colors.neutral.gray400 }}>
            Nenhuma tarefa encontrada. Clique em "Nova Tarefa" para criar a primeira.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <div
              key={task.id}
              style={{
                backgroundColor: designSystem.colors.neutral.white,
                borderRadius: '12px',
                padding: '16px',
                border: `1px solid ${isOverdue(task) ? designSystem.colors.status.error : designSystem.colors.neutral.gray200}`,
                boxShadow: designSystem.shadows.sm,
                opacity: task.completed ? 0.7 : 1,
                transition: designSystem.transitions.normal,
              }}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(task)}
                  className="mt-0.5 flex-shrink-0"
                  title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                >
                  {task.completed
                    ? <CheckCircle size={22} style={{ color: designSystem.colors.status.success }} />
                    : <Circle size={22} style={{ color: designSystem.colors.neutral.gray400 }} />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <span
                      className="font-semibold"
                      style={{
                        color: designSystem.colors.primary.dark,
                        textDecoration: task.completed ? 'line-through' : 'none',
                      }}
                    >
                      {task.title}
                    </span>
                    {isOverdue(task) && (
                      <Badge variant="error" size="sm">Atrasada</Badge>
                    )}
                    {task.completed && (
                      <Badge variant="success" size="sm">Concluída</Badge>
                    )}
                  </div>

                  {task.description && (
                    <p className="text-sm mb-2" style={{ color: designSystem.colors.neutral.gray600 }}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs" style={{ color: designSystem.colors.neutral.gray500 }}>
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {task.lead?.name || 'Lead não encontrado'}
                    </span>
                    {task.dueDate && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: isOverdue(task) ? designSystem.colors.status.error : designSystem.colors.neutral.gray500 }}
                      >
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {task.attachmentName && (
                      <span className="flex items-center gap-1" style={{ color: designSystem.colors.primary.light }}>
                        <Paperclip size={12} />
                        {task.attachmentName}
                      </span>
                    )}
                    <span>
                      Criada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="flex-shrink-0 p-1 rounded"
                  title="Excluir tarefa"
                  style={{ color: designSystem.colors.neutral.gray400 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = designSystem.colors.status.error)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = designSystem.colors.neutral.gray400)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
