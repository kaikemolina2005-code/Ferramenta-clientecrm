import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { KanbanCard } from './KanbanCardComponent';
export function KanbanColumn({ title, cards, onCardDrop }) {
    return (_jsxs("div", { className: "flex-1 bg-light-gray rounded-lg p-4 min-h-96 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "font-bold text-dark-blue text-lg", children: title }), _jsx("span", { className: "bg-dark-blue text-white px-2 py-1 rounded-full text-xs font-semibold", children: cards.length })] }), _jsx("div", { className: "space-y-3 max-h-96 overflow-y-auto", children: cards.length === 0 ? (_jsx("div", { className: "text-center text-gray-400 py-8", children: _jsx("p", { className: "text-sm", children: "Nenhum card nesta coluna" }) })) : (cards.map((card) => (_jsx("div", { draggable: true, onDragEnd: () => onCardDrop?.(card.id), children: _jsx(KanbanCard, { card: card }) }, card.id)))) })] }));
}
