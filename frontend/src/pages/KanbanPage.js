import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Button } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';
import { kanbanService } from '@/services/leadService';
export function KanbanPage() {
    const [sectors] = useState(['COMMERCIAL', 'LEGAL', 'ADMINISTRATIVE']);
    const [cards, setCards] = useState({
        COMMERCIAL: [],
        LEGAL: [],
        ADMINISTRATIVE: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [draggedCard, setDraggedCard] = useState(null);
    useEffect(() => {
        loadKanbanCards();
    }, []);
    const loadKanbanCards = async () => {
        try {
            setIsLoading(true);
            const allCards = await kanbanService.getCards();
            // Organizar cards por setor
            const organizedCards = {
                COMMERCIAL: [],
                LEGAL: [],
                ADMINISTRATIVE: [],
            };
            allCards.forEach((card) => {
                if (organizedCards[card.sector]) {
                    organizedCards[card.sector].push(card);
                }
            });
            setCards(organizedCards);
        }
        catch (error) {
            console.error('Erro ao carregar kanban:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleDragStart = (card) => {
        setDraggedCard(card);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDrop = async (sector) => {
        if (!draggedCard)
            return;
        try {
            // Mover card para novo setor
            await kanbanService.moveCard(draggedCard.id, {
                sector: sector,
                stage: 'todo',
                position: 0,
            });
            // Recarregar cards
            await loadKanbanCards();
            setDraggedCard(null);
        }
        catch (error) {
            console.error('Erro ao mover card:', error);
        }
    };
    const sectorNames = {
        COMMERCIAL: { name: 'Comercial', color: designSystem.colors.primary.dark, icon: '💼' },
        LEGAL: { name: 'Jurídico', color: designSystem.colors.accent.gold, icon: '⚖️' },
        ADMINISTRATIVE: { name: 'Administrativo', color: designSystem.colors.primary.light, icon: '📋' },
    };
    if (isLoading) {
        return (_jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: designSystem.colors.neutral.light
            }, children: _jsxs("div", { style: { textAlign: 'center', padding: '24px' }, children: [_jsx("div", { style: {
                            width: '48px',
                            height: '48px',
                            border: `4px solid ${designSystem.colors.primary.light}`,
                            borderTop: `4px solid ${designSystem.colors.primary.dark}`,
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        } }), _jsx("p", { style: { color: designSystem.colors.primary.dark, fontWeight: '600' }, children: "Carregando Kanban..." })] }) }));
    }
    return (_jsxs("div", { style: { padding: '32px', backgroundColor: designSystem.colors.neutral.light, minHeight: '100vh' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }, children: [_jsx("h1", { style: {
                            fontSize: '28px',
                            fontWeight: 'bold',
                            color: designSystem.colors.primary.dark
                        }, children: "\uD83D\uDCCA Kanban - Gest\u00E3o de Processos" }), _jsx(Button, { variant: "primary", onClick: loadKanbanCards, children: "\uD83D\uDD04 Atualizar" })] }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }, children: sectors.map((sector) => (_jsxs("div", { onDragOver: handleDragOver, onDrop: () => handleDrop(sector), style: {
                        backgroundColor: designSystem.colors.neutral.white,
                        borderRadius: '12px',
                        padding: '16px',
                        minHeight: '600px',
                        boxShadow: designSystem.shadows.md,
                        transition: designSystem.transitions.normal,
                        border: `2px solid ${sectorNames[sector].color}33`
                    }, children: [_jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                                paddingBottom: '12px',
                                borderBottom: `2px solid ${sectorNames[sector].color}`
                            }, children: [_jsxs("h2", { style: {
                                        fontWeight: 'bold',
                                        color: sectorNames[sector].color,
                                        fontSize: '16px'
                                    }, children: [sectorNames[sector].icon, " ", sectorNames[sector].name] }), _jsx("span", { style: {
                                        backgroundColor: sectorNames[sector].color,
                                        color: designSystem.colors.neutral.white,
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }, children: cards[sector]?.length || 0 })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }, children: cards[sector]?.length === 0 ? (_jsx("div", { style: {
                                    textAlign: 'center',
                                    color: designSystem.colors.neutral.gray400,
                                    padding: '32px 16px'
                                }, children: _jsx("p", { style: { fontSize: '14px' }, children: "Nenhum card nesta coluna" }) })) : (cards[sector]?.map((card) => (_jsx("div", { draggable: true, onDragStart: () => handleDragStart(card), style: {
                                    padding: '16px',
                                    backgroundColor: designSystem.colors.neutral.white,
                                    borderRadius: '8px',
                                    boxShadow: draggedCard?.id === card.id ? 'none' : designSystem.shadows.md,
                                    cursor: 'move',
                                    transition: designSystem.transitions.normal,
                                    border: `1px solid ${sectorNames[sector].color}`,
                                    opacity: draggedCard?.id === card.id ? 0.5 : 1,
                                    transform: draggedCard?.id === card.id ? 'scale(0.95)' : 'scale(1)'
                                }, onMouseEnter: (e) => {
                                    if (draggedCard?.id !== card.id) {
                                        e.currentTarget.style.boxShadow = designSystem.shadows.lg;
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                    }
                                }, onMouseLeave: (e) => {
                                    if (draggedCard?.id !== card.id) {
                                        e.currentTarget.style.boxShadow = designSystem.shadows.md;
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }, children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '8px' }, children: [_jsx("h3", { style: {
                                                fontWeight: '600',
                                                color: designSystem.colors.primary.dark,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                fontSize: '15px'
                                            }, children: card.lead?.name || 'Sem nome' }), card.lead?.category && (_jsx("div", { style: {
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                                backgroundColor: `${designSystem.colors.primary.light}20`,
                                                color: designSystem.colors.primary.dark,
                                                width: 'fit-content'
                                            }, children: card.lead.category })), card.lead && (_jsxs("div", { style: { fontSize: '12px', color: designSystem.colors.neutral.gray600, display: 'flex', flexDirection: 'column', gap: '4px' }, children: [_jsxs("p", { children: ["\uD83D\uDCE7 ", card.lead.email] }), _jsxs("p", { children: ["\uD83D\uDCF1 ", card.lead.phone] })] })), card.notes && (_jsxs("p", { style: {
                                                fontSize: '12px',
                                                color: designSystem.colors.neutral.gray500,
                                                fontStyle: 'italic',
                                                marginTop: '8px',
                                                borderTop: `1px solid ${designSystem.colors.neutral.gray300}`,
                                                paddingTop: '8px'
                                            }, children: [card.notes.substring(0, 50), "..."] }))] }) }, card.id)))) })] }, sector))) }), _jsx("div", { style: {
                    marginTop: '32px',
                    padding: '16px',
                    backgroundColor: `${designSystem.colors.primary.light}15`,
                    border: `1px solid ${designSystem.colors.primary.light}`,
                    borderRadius: '8px'
                }, children: _jsxs("p", { style: {
                        fontSize: '14px',
                        color: designSystem.colors.primary.dark,
                        margin: 0
                    }, children: ["\uD83D\uDCA1 ", _jsx("strong", { children: "Dica:" }), " Arraste os cards entre as colunas para mover os processos entre os setores."] }) })] }));
}
