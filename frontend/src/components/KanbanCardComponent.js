import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function KanbanCard({ card, isDragging = false }) {
    const categoryColors = {
        'CONSULTATION': 'bg-blue-100 text-blue-800',
        'PROCESS': 'bg-purple-100 text-purple-800',
        'BPC_LOAS': 'bg-green-100 text-green-800',
        'RETIREMENT': 'bg-orange-100 text-orange-800',
    };
    const statusColors = {
        'INITIAL': 'border-l-4 border-gray-400',
        'CONSULTING': 'border-l-4 border-blue-400',
        'PAYMENT': 'border-l-4 border-yellow-400',
        'LOSS': 'border-l-4 border-red-400',
        'CONVERTED': 'border-l-4 border-green-400',
    };
    return (_jsx("div", { className: `
        p-4 bg-white rounded-lg shadow cursor-move transition-all
        ${statusColors[card.lead?.status || 'INITIAL'] || 'border-l-4 border-gray-400'}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'}
      `, children: _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-semibold text-dark-blue truncate", children: card.lead?.name || 'Sem nome' }), card.lead?.category && (_jsx("div", { className: `inline-block px-2 py-1 rounded text-xs font-medium ${categoryColors[card.lead.category]}`, children: card.lead.category })), card.lead && (_jsxs("div", { className: "text-xs text-gray-600 space-y-1", children: [_jsxs("p", { children: ["\uD83D\uDCE7 ", card.lead.email] }), _jsxs("p", { children: ["\uD83D\uDCF1 ", card.lead.phone] })] })), card.notes && (_jsxs("p", { className: "text-xs text-gray-500 italic mt-2", children: ["\"", card.notes, "\""] })), card.movedAt && (_jsxs("p", { className: "text-xs text-gray-400", children: ["Movido em ", new Date(card.movedAt).toLocaleDateString('pt-BR')] }))] }) }));
}
