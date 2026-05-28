import { useState, useEffect } from 'react';
import { Button } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import { kanbanService } from '@/services/leadService';
import { KanbanCard as KanbanCardType } from '@/types';

export function KanbanPage() {
  const [sectors] = useState<string[]>(['COMMERCIAL', 'LEGAL', 'ADMINISTRATIVE']);
  const [cards, setCards] = useState<Record<string, KanbanCardType[]>>({
    COMMERCIAL: [],
    LEGAL: [],
    ADMINISTRATIVE: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState<KanbanCardType | null>(null);

  useEffect(() => {
    loadKanbanCards();
  }, []);

  const loadKanbanCards = async () => {
    try {
      setIsLoading(true);
      const allCards = await kanbanService.getCards();
      
      // Organizar cards por setor
      const organizedCards: Record<string, KanbanCardType[]> = {
        COMMERCIAL: [],
        LEGAL: [],
        ADMINISTRATIVE: [],
      };

      allCards.forEach((card: any) => {
        if (organizedCards[card.sector]) {
          organizedCards[card.sector].push(card);
        }
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

  const handleDrop = async (sector: string) => {
    if (!draggedCard) return;

    try {
      // Mover card para novo setor
      await kanbanService.moveCard(draggedCard.id, {
        sector: sector as any,
        stage: 'todo',
        position: 0,
      } as any);

      // Recarregar cards
      await loadKanbanCards();
      setDraggedCard(null);
    } catch (error) {
      console.error('Erro ao mover card:', error);
    }
  };

  const sectorNames: Record<string, { name: string; color: string; icon: string }> = {
    COMMERCIAL: { name: 'Comercial', color: designSystem.colors.primary.dark, icon: '💼' },
    LEGAL: { name: 'Jurídico', color: designSystem.colors.accent.gold, icon: '⚖️' },
    ADMINISTRATIVE: { name: 'Administrativo', color: designSystem.colors.primary.light, icon: '📋' },
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
            Carregando Kanban...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', backgroundColor: designSystem.colors.neutral.light, minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: designSystem.colors.primary.dark
        }}>
          📊 Kanban - Gestão de Processos
        </h1>
        <Button 
          variant="primary"
          onClick={loadKanbanCards}
        >
          🔄 Atualizar
        </Button>
      </div>

      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {sectors.map((sector) => (
          <div
            key={sector}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(sector)}
            style={{
              backgroundColor: designSystem.colors.neutral.white,
              borderRadius: '12px',
              padding: '16px',
              minHeight: '600px',
              boxShadow: designSystem.shadows.md,
              transition: designSystem.transitions.normal,
              border: `2px solid ${sectorNames[sector].color}33`
            }}
          >
            {/* Column Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: `2px solid ${sectorNames[sector].color}`
            }}>
              <h2 style={{
                fontWeight: 'bold',
                color: sectorNames[sector].color,
                fontSize: '16px'
              }}>
                {sectorNames[sector].icon} {sectorNames[sector].name}
              </h2>
              <span style={{
                backgroundColor: sectorNames[sector].color,
                color: designSystem.colors.neutral.white,
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {cards[sector as keyof typeof cards]?.length || 0}
              </span>
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {cards[sector as keyof typeof cards]?.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: designSystem.colors.neutral.gray400,
                  padding: '32px 16px'
                }}>
                  <p style={{ fontSize: '14px' }}>Nenhum card nesta coluna</p>
                </div>
              ) : (
                cards[sector as keyof typeof cards]?.map((card) => (
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
                      border: `1px solid ${sectorNames[sector].color}`,
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
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
          💡 <strong>Dica:</strong> Arraste os cards entre as colunas para mover os processos entre os setores.
        </p>
      </div>
    </div>
  );
}
