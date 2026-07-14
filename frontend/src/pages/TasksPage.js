import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Circle, Trash2, Plus, Paperclip, Calendar, User } from 'lucide-react';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import api from '@/services/api';
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
export const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterLeadId, setFilterLeadId] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef(null);
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
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.leadId || !form.title.trim())
            return;
        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('title', form.title);
            if (form.description)
                formData.append('description', form.description);
            if (form.dueDate)
                formData.append('dueDate', form.dueDate);
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
            if (fileRef.current)
                fileRef.current.value = '';
            setShowForm(false);
        }
        catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleToggle = async (task) => {
        try {
            const res = await api.put(`/tasks/${task.id}`, { completed: !task.completed });
            setTasks(tasks.map((t) => (t.id === task.id ? { ...t, ...res.data.data } : t)));
        }
        catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    };
    const handleDelete = async (taskId) => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?'))
            return;
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter((t) => t.id !== taskId));
        }
        catch (error) {
            console.error('Erro ao excluir tarefa:', error);
        }
    };
    const filtered = tasks.filter((t) => {
        if (filterLeadId && t.leadId !== filterLeadId)
            return false;
        if (filterStatus === 'pending' && t.completed)
            return false;
        if (filterStatus === 'done' && !t.completed)
            return false;
        return true;
    });
    const pending = tasks.filter((t) => !t.completed).length;
    const done = tasks.filter((t) => t.completed).length;
    const isOverdue = (t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date();
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", style: { color: designSystem.colors.primary.dark }, children: "\u2705 Tarefas" }), _jsx("p", { className: "text-sm mt-1", style: { color: designSystem.colors.neutral.gray500 }, children: "Organize a rotina do escrit\u00F3rio por lead" })] }), _jsxs(Button, { onClick: () => setShowForm(!showForm), children: [_jsx(Plus, { size: 16, className: "inline mr-1" }), "Nova Tarefa"] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Total" }), _jsx("p", { className: "text-3xl font-bold mt-1", style: { color: designSystem.colors.primary.dark }, children: tasks.length })] }), _jsx("span", { style: { fontSize: 32 }, children: "\uD83D\uDCCB" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Pendentes" }), _jsx("p", { className: "text-3xl font-bold mt-1", style: { color: designSystem.colors.status.warning }, children: pending })] }), _jsx("span", { style: { fontSize: 32 }, children: "\u23F3" })] }) }), _jsx(Card, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: "Conclu\u00EDdas" }), _jsx("p", { className: "text-3xl font-bold mt-1", style: { color: designSystem.colors.status.success }, children: done })] }), _jsx("span", { style: { fontSize: 32 }, children: "\u2705" })] }) })] }), showForm && (_jsx(Card, { title: "Nova Tarefa", icon: "\u2795", children: _jsxs("form", { onSubmit: handleCreate, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", style: { color: designSystem.colors.primary.dark }, children: "Lead *" }), _jsxs("select", { value: form.leadId, onChange: (e) => setForm({ ...form, leadId: e.target.value }), style: inputStyle, required: true, children: [_jsx("option", { value: "", children: "Selecione um lead..." }), leads.map((l) => (_jsx("option", { value: l.id, children: l.name }, l.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", style: { color: designSystem.colors.primary.dark }, children: "Prazo" }), _jsx("input", { type: "date", value: form.dueDate, onChange: (e) => setForm({ ...form, dueDate: e.target.value }), style: inputStyle })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", style: { color: designSystem.colors.primary.dark }, children: "T\u00EDtulo *" }), _jsx("input", { type: "text", placeholder: "Ex: Protocolar peti\u00E7\u00E3o inicial", value: form.title, onChange: (e) => setForm({ ...form, title: e.target.value }), style: inputStyle, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", style: { color: designSystem.colors.primary.dark }, children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { placeholder: "Detalhes da tarefa...", value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), rows: 3, style: { ...inputStyle, resize: 'vertical' } })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-1", style: { color: designSystem.colors.primary.dark }, children: "Anexo (documento vinculado)" }), _jsx("input", { type: "file", ref: fileRef, style: { fontSize: '14px' } })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx("button", { type: "submit", disabled: submitting, style: {
                                        backgroundColor: '#1a3a6b',
                                        color: '#fff',
                                        padding: '8px 20px',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        border: 'none',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        opacity: submitting ? 0.7 : 1,
                                    }, children: submitting ? 'Salvando...' : 'Criar Tarefa' }), _jsx("button", { type: "button", onClick: () => setShowForm(false), className: "px-4 py-2 rounded-lg text-sm", style: { color: designSystem.colors.neutral.gray600, backgroundColor: designSystem.colors.neutral.gray100 }, children: "Cancelar" })] })] }) })), _jsxs("div", { className: "flex flex-wrap gap-3 items-center", children: [_jsxs("select", { value: filterLeadId, onChange: (e) => setFilterLeadId(e.target.value), style: { ...inputStyle, width: 'auto', minWidth: '200px' }, children: [_jsx("option", { value: "", children: "Todos os leads" }), leads.map((l) => (_jsx("option", { value: l.id, children: l.name }, l.id)))] }), _jsx("div", { className: "flex gap-2", children: ['all', 'pending', 'done'].map((s) => (_jsx("button", { onClick: () => setFilterStatus(s), className: "px-4 py-2 rounded-lg text-sm font-medium transition-all", style: {
                                backgroundColor: filterStatus === s ? designSystem.colors.primary.dark : designSystem.colors.neutral.gray100,
                                color: filterStatus === s ? designSystem.colors.neutral.white : designSystem.colors.neutral.gray600,
                            }, children: s === 'all' ? 'Todas' : s === 'pending' ? 'Pendentes' : 'Concluídas' }, s))) }), _jsxs("span", { className: "text-sm", style: { color: designSystem.colors.neutral.gray500 }, children: [filtered.length, " tarefa", filtered.length !== 1 ? 's' : ''] })] }), loading ? (_jsx(Card, { children: _jsx("p", { className: "text-center py-8", style: { color: designSystem.colors.neutral.gray400 }, children: "Carregando..." }) })) : filtered.length === 0 ? (_jsx(Card, { children: _jsx("p", { className: "text-center py-8", style: { color: designSystem.colors.neutral.gray400 }, children: "Nenhuma tarefa encontrada. Clique em \"Nova Tarefa\" para criar a primeira." }) })) : (_jsx("div", { className: "space-y-3", children: filtered.map((task) => (_jsx("div", { style: {
                        backgroundColor: designSystem.colors.neutral.white,
                        borderRadius: '12px',
                        padding: '16px',
                        border: `1px solid ${isOverdue(task) ? designSystem.colors.status.error : designSystem.colors.neutral.gray200}`,
                        boxShadow: designSystem.shadows.sm,
                        opacity: task.completed ? 0.7 : 1,
                        transition: designSystem.transitions.normal,
                    }, children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("button", { onClick: () => handleToggle(task), className: "mt-0.5 flex-shrink-0", title: task.completed ? 'Marcar como pendente' : 'Marcar como concluída', children: task.completed
                                    ? _jsx(CheckCircle, { size: 22, style: { color: designSystem.colors.status.success } })
                                    : _jsx(Circle, { size: 22, style: { color: designSystem.colors.neutral.gray400 } }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center flex-wrap gap-2 mb-1", children: [_jsx("span", { className: "font-semibold", style: {
                                                    color: designSystem.colors.primary.dark,
                                                    textDecoration: task.completed ? 'line-through' : 'none',
                                                }, children: task.title }), isOverdue(task) && (_jsx(Badge, { variant: "error", size: "sm", children: "Atrasada" })), task.completed && (_jsx(Badge, { variant: "success", size: "sm", children: "Conclu\u00EDda" }))] }), task.description && (_jsx("p", { className: "text-sm mb-2", style: { color: designSystem.colors.neutral.gray600 }, children: task.description })), _jsxs("div", { className: "flex flex-wrap gap-4 text-xs", style: { color: designSystem.colors.neutral.gray500 }, children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { size: 12 }), task.lead?.name || 'Lead não encontrado'] }), task.dueDate && (_jsxs("span", { className: "flex items-center gap-1", style: { color: isOverdue(task) ? designSystem.colors.status.error : designSystem.colors.neutral.gray500 }, children: [_jsx(Calendar, { size: 12 }), new Date(task.dueDate).toLocaleDateString('pt-BR')] })), task.attachmentName && (_jsxs("span", { className: "flex items-center gap-1", style: { color: designSystem.colors.primary.light }, children: [_jsx(Paperclip, { size: 12 }), task.attachmentName] })), _jsxs("span", { children: ["Criada em ", new Date(task.createdAt).toLocaleDateString('pt-BR')] })] })] }), _jsx("button", { onClick: () => handleDelete(task.id), className: "flex-shrink-0 p-1 rounded", title: "Excluir tarefa", style: { color: designSystem.colors.neutral.gray400 }, onMouseEnter: (e) => (e.currentTarget.style.color = designSystem.colors.status.error), onMouseLeave: (e) => (e.currentTarget.style.color = designSystem.colors.neutral.gray400), children: _jsx(Trash2, { size: 16 }) })] }) }, task.id))) }))] }));
};
export default TasksPage;
