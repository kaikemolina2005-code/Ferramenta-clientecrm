// Notas/histórico do lead (timeline do card no Kanban)
import { Response } from 'express';
import { prisma } from '../services/prisma.js';

/**
 * GET /notes/lead/:leadId
 * Lista as notas de um lead (mais recentes primeiro)
 */
export async function getLeadNotes(req: any, res: Response) {
  try {
    const { leadId } = req.params;
    const notes = await prisma.leadNote.findMany({
      where: { leadId },
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: notes, total: notes.length });
  } catch (error: any) {
    console.error('Erro ao listar notas:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar notas' });
  }
}

/**
 * POST /notes/lead/:leadId
 * Cria uma nota para o lead
 */
export async function createNote(req: any, res: Response) {
  try {
    const { leadId } = req.params;
    const content = (req.body?.content || '').toString().trim();

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'O texto da nota é obrigatório',
      });
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId,
        content,
        createdById: req.userId,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });

    res.status(201).json({ success: true, data: note });
  } catch (error: any) {
    console.error('Erro ao criar nota:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar nota' });
  }
}

/**
 * DELETE /notes/:noteId
 * Remove uma nota
 */
export async function deleteNote(req: any, res: Response) {
  try {
    const { noteId } = req.params;
    await prisma.leadNote.delete({ where: { id: noteId } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao remover nota:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover nota' });
  }
}
