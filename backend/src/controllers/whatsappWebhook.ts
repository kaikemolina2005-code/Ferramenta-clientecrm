import express, { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService.js';
import { automationEngine } from '../services/automationEngine.js';
import { leadScoringService } from '../services/leadScoringService.js';
import { autoAssignmentService } from '../services/autoAssignmentService.js';

/**
 * Webhook handler para mensagens do WhatsApp
 * Recebe mensagens, cria leads, executa automações
 */

export async function handleWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body;

    // Responder imediatamente ao Webhook
    res.status(200).json({ received: true });

    console.log(`\n📱 Webhook WhatsApp recebido`);

    // Processar cada mensagem
    if (payload.entry && payload.entry[0] && payload.entry[0].changes) {
      const changes = payload.entry[0].changes[0];
      const messages = changes.value.messages || [];

      for (const message of messages) {
        // 1. Extrair dados da mensagem
        const from = message.from;
        const body = message.text?.body || '';
        const senderName = changes.value.contacts?.[0]?.profile?.name || 'Cliente';

        console.log(`📨 Mensagem de ${senderName} (${from}): "${body}"`);

        // 2. Processar mensagem (criar lead ou atualizar)
        const lead = await whatsappService.processMessage({
          from,
          body,
          timestamp: parseInt(message.timestamp)
        });

        if (lead) {
          // 3. Calcular score do novo lead
          await leadScoringService.calculateLeadScore(lead.id);
          console.log(`📊 Score calculado para ${lead.name}`);

          // 4. Auto-assign se score for alto
          if (lead.score && lead.score > 70) {
            const assignResult = await autoAssignmentService.autoAssignLead(lead.id);
            if (assignResult.success) {
              console.log(`✅ Lead atribuído a ${assignResult.assignedTo}`);
            }
          }

          // 5. Enviar confirmação via WhatsApp
          await whatsappService.sendTemplate(lead.id, 'welcome', {
            name: lead.name
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao processar mensagem' });
  }
}

/**
 * Valida token do webhook do WhatsApp
 */
export async function validateWhatsAppWebhook(req: Request, res: Response): Promise<void> {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const webhookToken = process.env.WHATSAPP_WEBHOOK_TOKEN || 'seu_token_secreto_aqui';

  if (token === webhookToken) {
    res.status(200).send(challenge);
    console.log('✅ Webhook WhatsApp validado');
  } else {
    res.status(403).json({ error: 'Token inválido' });
    console.error('❌ Tentativa de validação com token inválido');
  }
}

/**
 * Envia mensagem via WhatsApp
 */
export async function sendWhatsAppMessage(req: Request, res: Response): Promise<void> {
  try {
    const { leadId, message, templateName, variables } = req.body;

    if (!leadId) {
      res.status(400).json({ error: 'leadId é obrigatório' });
      return;
    }

    let result: boolean;

    if (templateName) {
      result = await whatsappService.sendTemplate(leadId, templateName, variables);
    } else if (message) {
      result = await whatsappService.sendMessage(leadId, message);
    } else {
      res.status(400).json({ error: 'message ou templateName é obrigatório' });
      return;
    }

    res.json({
      success: result,
      leadId,
      message: result ? 'Mensagem agendada para envio' : 'Erro ao agendar mensagem'
    });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem WhatsApp:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
}

/**
 * Obtém conversação do lead
 */
export async function getWhatsAppConversation(req: Request, res: Response): Promise<void> {
  try {
    const { leadId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!leadId) {
      res.status(400).json({ error: 'leadId é obrigatório' });
      return;
    }

    const conversation = await whatsappService.getConversation(leadId, limit);

    res.json({
      success: true,
      leadId,
      messages: conversation,
      count: conversation.length
    });
  } catch (error) {
    console.error('❌ Erro ao obter conversação:', error);
    res.status(500).json({ error: 'Erro ao obter conversação' });
  }
}

/**
 * Marca conversação como lida
 */
export async function markWhatsAppAsRead(req: Request, res: Response): Promise<void> {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      res.status(400).json({ error: 'leadId é obrigatório' });
      return;
    }

    await whatsappService.markAsRead(leadId);

    res.json({
      success: true,
      leadId,
      message: 'Conversação marcada como lida'
    });
  } catch (error) {
    console.error('❌ Erro ao marcar como lida:', error);
    res.status(500).json({ error: 'Erro ao marcar como lida' });
  }
}

/**
 * Obtém status de mensagens
 */
export async function getWhatsAppStatus(req: Request, res: Response): Promise<void> {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      res.status(400).json({ error: 'leadId é obrigatório' });
      return;
    }

    const status = await whatsappService.getMessageStatus(leadId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('❌ Erro ao obter status:', error);
    res.status(500).json({ error: 'Erro ao obter status' });
  }
}

/**
 * Ativa/desativa notificações WhatsApp
 */
export async function toggleWhatsAppNotifications(req: Request, res: Response): Promise<void> {
  try {
    const { leadId } = req.params;
    const { enabled } = req.body;

    if (!leadId || enabled === undefined) {
      res.status(400).json({ error: 'leadId e enabled são obrigatórios' });
      return;
    }

    await whatsappService.toggleWhatsAppNotifications(leadId, enabled);

    res.json({
      success: true,
      leadId,
      notificationsEnabled: enabled
    });
  } catch (error) {
    console.error('❌ Erro ao alternar notificações:', error);
    res.status(500).json({ error: 'Erro ao alternar notificações' });
  }
}

/**
 * Get WhatsApp statistics
 */
export async function getWhatsAppStats(req: Request, res: Response): Promise<void> {
  try {
    // TODO: Implementar estatísticas de WhatsApp
    res.json({
      success: true,
      data: {
        totalMessages: 0,
        totalLeads: 0,
        messagesSentToday: 0,
        averageResponseTime: 0,
        webhookStatus: 'configured'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
}
