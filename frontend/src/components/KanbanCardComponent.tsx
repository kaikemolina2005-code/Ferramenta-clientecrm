import { KanbanCard as KanbanCardType } from '@/types';

interface KanbanCardProps {
  card: KanbanCardType;
  isDragging?: boolean;
}

export function KanbanCard({ card, isDragging = false }: KanbanCardProps) {
  const categoryColors: Record<string, string> = {
    'CONSULTATION': 'bg-blue-100 text-blue-800',
    'PROCESS': 'bg-purple-100 text-purple-800',
    'BPC_LOAS': 'bg-green-100 text-green-800',
    'RETIREMENT': 'bg-orange-100 text-orange-800',
  };

  const statusColors: Record<string, string> = {
    'INITIAL': 'border-l-4 border-gray-400',
    'CONSULTING': 'border-l-4 border-blue-400',
    'PAYMENT': 'border-l-4 border-yellow-400',
    'LOSS': 'border-l-4 border-red-400',
    'CONVERTED': 'border-l-4 border-green-400',
  };

  return (
    <div
      className={`
        p-4 bg-white rounded-lg shadow cursor-move transition-all
        ${statusColors[card.lead?.status || 'INITIAL'] || 'border-l-4 border-gray-400'}
        ${isDragging ? 'opacity-50 scale-95' : 'hover:shadow-lg'}
      `}
    >
      <div className="space-y-2">
        {/* Lead Name */}
        <h3 className="font-semibold text-dark-blue truncate">{card.lead?.name || 'Sem nome'}</h3>

        {/* Category Badge */}
        {card.lead?.category && (
          <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${categoryColors[card.lead.category]}`}>
            {card.lead.category}
          </div>
        )}

        {/* Lead Info */}
        {card.lead && (
          <div className="text-xs text-gray-600 space-y-1">
            <p>📧 {card.lead.email}</p>
            <p>📱 {card.lead.phone}</p>
          </div>
        )}

        {/* Notes */}
        {card.notes && (
          <p className="text-xs text-gray-500 italic mt-2">"{card.notes}"</p>
        )}

        {/* Move Info */}
        {card.movedAt && (
          <p className="text-xs text-gray-400">
            Movido em {new Date(card.movedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  );
}
