import axios from 'axios';
import { PrismaClient } from '@prisma/client';

import { prisma } from './prisma.js';

interface WhatsAppMessage {
  from: string;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  timestamp: string;
  category?: string;
  messageId?: string;
}

interface WebhookPayload {
  object: string;
  entry: {
    id: string;
    changes: {
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        messages?: {
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: {
            body: string;
          };
          button?: {
            payload: string;
          };
          interactive?: {
            button_reply?: {
              id: string;
              title: string;
            };
            list_reply?: {
              id: string;
              title: string;
            };
          };
        }[];
        contacts?: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        statuses?: {
          id: string;
          status: string;
          timestamp: string;
        }[];
      };
    }[];
  }[];
}

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private webhookToken: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_ID || '';
    this.accessToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN || '';
    this.webhookToken = process.env.WHATSAPP_WEBHOOK_TOKEN || 'webhook_token_seguro_2026';
  }

  /**
   * Valida o token do webhook
   */
  validateWebhookToken(token: string): boolean {
    return token === this.webhookToken;
  }

  /**
   * Processa webhook do WhatsApp
   */
  processWebhook(payload: WebhookPayload): WhatsAppMessage[] {
    const messages: WhatsAppMessage[] = [];

    if (payload.object !== 'whatsapp_business_account') {
      return messages;
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        if (!value.messages) continue;

        for (const messageData of value.messages) {
          // Pular tipos de mensagem não-texto
          if (messageData.type === 'image' || messageData.type === 'document') {
            continue;
          }

          let messageText = '';

          if (messageData.text?.body) {
            messageText = messageData.text.body;
          } else if (messageData.button?.payload) {
            messageText = `[Button: ${messageData.button.payload}]`;
          } else if (messageData.interactive?.button_reply?.title) {
            messageText = messageData.interactive.button_reply.title;
          } else if (messageData.interactive?.list_reply?.title) {
            messageText = messageData.interactive.list_reply.title;
          }

          // Obter contacto
          const contact = value.contacts?.[0];
          const contactName = contact?.profile?.name || 'Unknown';
          const waId = contact?.wa_id || messageData.from;

          messages.push({
            from: messageData.from,
            name: contactName,
            message: messageText,
            timestamp: messageData.timestamp,
            category: this.extractCategory(messageText),
            messageId: messageData.id,
            phone: waId,
          });
        }
      }
    }

    return messages;
  }

  /**
   * Extrai categoria da mensagem
   */
  private extractCategory(message: string): string {
    const text = message.toLowerCase();

    if (
      text.includes('processo') ||
      text.includes('ação') ||
      text.includes('demanda') ||
      text.includes('acompanhar') ||
      text.includes('judicial')
    ) {
      return 'PROCESS';
    }

    if (text.includes('bpc') || text.includes('loas') || text.includes('assistência')) {
      return 'BPC_LOAS';
    }

    if (text.includes('aposentad') || text.includes('previdenciário') || text.includes('inss')) {
      return 'RETIREMENT';
    }

    if (text.includes('consult') || text.includes('orientação') || text.includes('dúvida')) {
      return 'CONSULTATION';
    }

    return 'CONSULTATION'; // Padrão
  }

  /**
   * Envia mensagem simples
   */
  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        console.warn('WhatsApp credentials not configured');
        return false;
      }

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        return false;
      }

      const response = await axios.post(
        `${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error);
      return false;
    }
  }

  /**
   * Envia mensagem com template
   */
  async sendTemplateMessage(
    phoneNumber: string,
    templateName: string,
    parameters: string[] = []
  ): Promise<boolean> {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        console.warn('WhatsApp credentials not configured');
        return false;
      }

      const body: any = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateName,
        },
      };

      if (parameters.length > 0) {
        body.template.parameters = {
          body: {
            parameters: parameters.map((p) => ({ type: 'text', text: p })),
          },
        };
      }

      const response = await axios.post(`${WHATSAPP_API_URL}/${this.phoneNumberId}/messages`, body, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return false;
    }
  }

  /**
   * Verifica status de credenciais
   */
  getConnectionStatus(): {
    configured: boolean;
    phoneNumberId: string;
  } {
    return {
      configured: !!(this.accessToken && this.phoneNumberId),
      phoneNumberId: this.phoneNumberId,
    };
  }

  /**
   * Processa mensagem recebida e retorna o lead associado
   */
  async processMessage(msg: { from: string; body: string; timestamp: number }): Promise<any | null> {
    try {
      const lead = await prisma.lead.findFirst({
        where: {
          OR: [
            { whatsappId: msg.from },
            { phone: msg.from }
          ]
        }
      });
      if (lead) {
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            lastActivityAt: new Date(),
            whatsappId: lead.whatsappId ?? msg.from
          }
        });
      }
      return lead;
    } catch (error) {
      console.error('Erro ao processar mensagem WhatsApp:', error);
      return null;
    }
  }

  /**
   * Envia template ao lead (busca telefone pelo leadId)
   */
  async sendTemplate(leadId: string, templateName: string, variables: Record<string, string> = {}): Promise<boolean> {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { phone: true }
      });
      if (!lead?.phone) return false;
      const params = Object.values(variables).map(String);
      return this.sendTemplateMessage(lead.phone, templateName, params);
    } catch (error) {
      console.error('Erro ao enviar template WhatsApp:', error);
      return false;
    }
  }

  /**
   * Retorna histórico de conversação (sem modelo de persistência ainda)
   */
  async getConversation(_leadId: string, _limit: number = 10): Promise<any[]> {
    return [];
  }

  /**
   * Retorna status das mensagens do lead
   */
  async getMessageStatus(leadId: string): Promise<{ configured: boolean; leadId: string }> {
    return { configured: this.getConnectionStatus().configured, leadId };
  }

  /**
   * Ativa/desativa notificações WhatsApp para um lead
   */
  async toggleWhatsAppNotifications(leadId: string, enabled: boolean): Promise<void> {
    console.log(`WhatsApp notifications ${enabled ? 'enabled' : 'disabled'} for lead ${leadId}`);
  }
}

export const whatsappService = new WhatsAppService();
