import { KanbanCard as KanbanCardType } from '@/types';
import { KanbanCard } from './KanbanCardComponent';

interface KanbanColumnProps {
  title: string;
  stage: string;
  cards: KanbanCardType[];
  onCardDrop?: (cardId: string) => void;
}

export function KanbanColumn({ title, cards, onCardDrop }: Omit<KanbanColumnProps, 'stage'>) {
  return (
    <div className="flex-1 bg-light-gray rounded-lg p-4 min-h-96 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-dark-blue text-lg">{title}</h2>
        <span className="bg-dark-blue text-white px-2 py-1 rounded-full text-xs font-semibold">
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {cards.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">Nenhum card nesta coluna</p>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} draggable onDragEnd={() => onCardDrop?.(card.id)}>
              <KanbanCard card={card} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
