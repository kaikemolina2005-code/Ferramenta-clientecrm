import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Valida e processa webhook do WhatsApp
 */
export const validateWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    if (!token || !whatsappService.validateWebhookToken(token)) {
      res.status(403).send('Invalid verification token');
      return;
    }

    res.status(200).send(challenge);
  } catch (error) {
    console.error('Erro ao validar webhook:', error);
    res.status(500).json({ error: 'Erro ao validar webhook' });
  }
};

/**
 * Recebe e processa mensagens do WhatsApp
 */
export const receiveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body;

    // Processar mensagens
    const messages = whatsappService.processWebhook(payload);

    for (const msg of messages) {
      try {
        // Marcar como lida
        if (msg.messageId) {
          await whatsappService.markAsRead(msg.messageId);
        }

        // Verificar se lead já existe
        let lead = await prisma.lead.findFirst({
          where: {
            whatsappId: msg.from,
          },
        });

        if (!lead) {
          // Criar novo lead
          lead = await prisma.lead.create({
            data: {
              whatsappId: msg.from,
              name: msg.name || 'Lead via WhatsApp',
              cpf: msg.from.substring(0, 11), // Usar WhatsApp ID como CPF temporário (será atualizado depois)
              phone: msg.phone || msg.from,
              category: (msg.category as any) || 'CONSULTATION',
              status: 'INITIAL',
              source: 'WHATSAPP',
            },
          });

          // Enviar mensagem de boas-vindas
          const welcomeMessage =
            `Olá ${msg.name || 'cliente'}! 👋\n\n` +
            `Obrigado por entrar em contato com nosso escritório de advocacia.\n\n` +
            `Recebemos sua solicitação e em breve um de nossos advogados entrará em contato para orienta-lo.\n\n` +
            `ID do Lead: ${lead.id}`;

          await whatsappService.sendMessage(msg.from, welcomeMessage);
        } else {
          // Lead existente - apenas registrar mensagem na atividade
          console.log(`Lead ${lead.id} enviou mensagem: ${msg.message}`);
        }

        // Registrar atividade
        // Obter usuário admin padrão
        const adminUser = await prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (adminUser) {
          await prisma.activity.create({
            data: {
              userId: adminUser.id,
              leadId: lead.id,
              action: 'whatsapp_message_received',
              details: JSON.stringify({
                phoneNumber: msg.from,
                originalMessage: msg.message,
                category: msg.category,
                timestamp: msg.timestamp,
              }),
            },
          });
        }
      } catch (error) {
        console.error(`Erro ao processar mensagem de ${msg.from}:`, error);
      }
    }

    // Confirmar recebimento ao WhatsApp
    res.status(200).json({ success: true, messages_processed: messages.length });
  } catch (error) {
    console.error('Erro ao receber mensagem:', error);
    res.status(500).json({ error: 'Erro ao receber mensagem' });
  }
};

/**
 * Obtém status de conexão com WhatsApp
 */
export const getConnectionStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = whatsappService.getConnectionStatus();
    res.status(200).json(status);
  } catch (error) {
    console.error('Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro ao obter status' });
  }
};

/**
 * Envia mensagem de teste
 */
export const sendTestMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      res.status(400).json({ error: 'phoneNumber e message são obrigatórios' });
      return;
    }

    const success = await whatsappService.sendMessage(phoneNumber, message);

    if (success) {
      res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso' });
    } else {
      res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem de teste:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};

/**
 * Obtém logs de mensagens recebidas
 */
export const getMessageLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { leadId, limit = '20' } = req.query;

    let whereClause: any = {
      type: 'MESSAGE',
    };

    if (leadId) {
      whereClause.leadId = leadId as string;
    }

    const activities = await prisma.activity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            whatsappId: true,
          },
        },
      },
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error('Erro ao obter logs:', error);
    res.status(500).json({ error: 'Erro ao obter logs' });
  }
};

/**
 * Obtém estatísticas de leads via WhatsApp
 */
export const getWhatsAppStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = {
      totalLeads: await prisma.lead.count({
        where: {
          source: 'WHATSAPP',
        },
      }),
      byStatus: await prisma.lead.groupBy({
        by: ['status'],
        where: {
          source: 'WHATSAPP',
        },
        _count: true,
      }),
      byCategory: await prisma.lead.groupBy({
        by: ['category'],
        where: {
          source: 'WHATSAPP',
        },
        _count: true,
      }),
      lastLeads: await prisma.lead.findMany({
        where: {
          source: 'WHATSAPP',
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          phone: true,
          category: true,
          status: true,
          createdAt: true,
        },
      }),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
};
