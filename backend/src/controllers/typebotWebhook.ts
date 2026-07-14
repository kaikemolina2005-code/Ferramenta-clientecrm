import { Request, Response } from 'express';

import { prisma } from '../services/prisma.js';

/**
 * Verifica o token secreto do Typebot (enviado no header X-Typebot-Secret)
 */
function validateSecret(req: Request, res: Response): boolean {
  const secret = process.env.TYPEBOT_WEBHOOK_SECRET;
  if (!secret) return true; // se não configurado, libera (para desenvolvimento)
  const provided = req.headers['x-typebot-secret'];
  if (provided !== secret) {
    res.status(401).json({ error: 'Token inválido' });
    return false;
  }
  return true;
}

/**
 * POST /api/typebot/lead
 * Typebot chama este endpoint ao final do fluxo de atendimento para criar ou
 * atualizar o lead no CRM com os dados coletados na conversa.
 *
 * Body esperado:
 * {
 *   name: string,
 *   phone: string,           // ex: "5513996779549"
 *   whatsappId?: string,     // igual ao phone se vier do WhatsApp
 *   email?: string,
 *   category?: string,       // "TRABALHISTA" | "PREVIDENCIARIO" | "CONSULTATION" | etc.
 *   notes?: string,          // motivo do contato / observações
 * }
 */
export async function createLeadFromTypebot(req: Request, res: Response): Promise<void> {
  if (!validateSecret(req, res)) return;

  try {
    const { name, phone, whatsappId, email, category, notes } = req.body;

    if (!name || !phone) {
      res.status(400).json({ error: 'name e phone são obrigatórios' });
      return;
    }

    const waId = whatsappId || phone;

    // Verificar se lead já existe (pelo WhatsApp ou pelo telefone)
    let lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { whatsappId: waId },
          { phone },
        ],
      },
    });

    let isNew = false;

    if (!lead) {
      // Criar novo lead
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      lead = await prisma.lead.create({
        data: {
          name,
          phone,
          email: email || '',
          cpf: '',
          whatsappId: waId,
          source: 'WHATSAPP',
          category: (category as any) || 'CONSULTATION',
          status: 'INITIAL',
          responsibleId: adminUser?.id,
        },
      });
      isNew = true;
      console.log(`✅ Typebot criou novo lead: ${name} (${phone})`);
    } else {
      // Atualizar nome/email/categoria se vier dados novos
      lead = await prisma.lead.update({
        where: { id: lead.id },
        data: {
          name: name || lead.name,
          email: email || lead.email,
          whatsappId: waId,
          ...(category && { category: category as any }),
        },
      });
      console.log(`🔄 Typebot atualizou lead existente: ${lead.name} (${lead.id})`);
    }

    // Registrar observação do motivo de contato como atividade
    if (notes) {
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        await prisma.activity.create({
          data: {
            userId: adminUser.id,
            leadId: lead.id,
            action: 'typebot_contact',
            details: JSON.stringify({ notes, phone, category }),
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      isNew,
      leadId: lead.id,
      name: lead.name,
      message: isNew
        ? 'Lead criado com sucesso'
        : 'Lead já existia e foi atualizado',
    });
  } catch (error: any) {
    console.error('Erro ao criar lead via Typebot:', error);
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
}

/**
 * GET /api/typebot/lead/check?phone=5513996779549
 * Typebot chama este endpoint para verificar se o cliente já é cadastrado
 * antes de pedir os dados novamente.
 *
 * Response:
 * { exists: true, leadId: "xxx", name: "João Silva" }
 * { exists: false }
 */
export async function checkLeadByPhone(req: Request, res: Response): Promise<void> {
  if (!validateSecret(req, res)) return;

  try {
    const { phone } = req.query;
    if (!phone) {
      res.status(400).json({ error: 'phone é obrigatório' });
      return;
    }

    const lead = await prisma.lead.findFirst({
      where: {
        OR: [
          { whatsappId: String(phone) },
          { phone: String(phone) },
        ],
      },
      select: { id: true, name: true, category: true, status: true },
    });

    if (lead) {
      res.json({ exists: true, leadId: lead.id, name: lead.name, category: lead.category, status: lead.status });
    } else {
      res.json({ exists: false });
    }
  } catch (error: any) {
    console.error('Erro ao verificar lead:', error);
    res.status(500).json({ error: error.message || 'Erro interno' });
  }
}
