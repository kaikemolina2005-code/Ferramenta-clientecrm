import { Request, Response } from 'express';
import { leadService } from '../services/leadService.js';
import { socketService } from '../socket/service.js';
import { emailService } from '../services/emailService.js';

interface WebhookFormData {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  category?: string;
  origin?: string;
  message?: string;
}

/**
 * Gerar um CPF aleatório único para leads sem CPF fornecido
 */
function generateRandomCPF(): string {
  const timestamp = Date.now().toString().slice(-9).padStart(9, '0');
  const random = Math.random().toString().slice(2, 4);
  return timestamp + random;
}

/**
 * POST /webhooks/forms
 * Receber formulários de websites e criar leads automaticamente
 */
export async function receiveFormWebhook(req: Request, res: Response) {
  try {
    const webhookToken = req.headers['x-webhook-token'] as string;
    if (webhookToken !== process.env.WEBHOOK_TOKEN) {
      console.warn('⚠️ Webhook token inválido');
      return res.status(401).json({
        success: false,
        error: 'Webhook token inválido',
      });
    }

    const data: WebhookFormData = req.body;

    if (!data.name || !data.email || !data.phone) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e telefone são obrigatórios',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido',
      });
    }

    const phoneNumbers = data.phone.replace(/\D/g, '');
    const phoneRegex = /^(\d{10,11})$/;
    if (!phoneRegex.test(phoneNumbers)) {
      return res.status(400).json({
        success: false,
        error: 'Telefone inválido',
      });
    }

    console.log('📋 Webhook formulário recebido:', {
      name: data.name,
      email: data.email,
      origin: data.origin || 'Webhook',
    });

    const cpf = data.cpf?.replace(/\D/g, '') || generateRandomCPF();

    const newLead = await leadService.createLead({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: phoneNumbers,
      cpf: cpf,
      category: data.category?.toUpperCase() as any || 'CONSULTATION',
      source: data.origin || 'WEBHOOK',
    });

    console.log('✅ Lead criado via webhook:', {
      id: newLead.id,
      name: newLead.name,
    });

    socketService.emitLeadCreated({
      id: newLead.id,
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      category: newLead.category,
      status: newLead.status,
      source: newLead.source,
      createdAt: newLead.createdAt,
    });

    await emailService.sendLeadConfirmationEmail(
      newLead.name,
      newLead.email
    ).catch((err) => {
      console.error('❌ Email error:', err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Lead criado via webhook',
      data: {
        id: newLead.id,
        name: newLead.name,
        email: newLead.email,
        phone: newLead.phone,
        status: newLead.status,
      },
    });
  } catch (error: any) {
    console.error('❌ Webhook erro:', error.message);

    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(409).json({
        success: false,
        error: 'Email já existe',
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar',
    });
  }
}

/**
 * POST /webhooks/forms/batch
 */
export async function receiveFormWebhookBatch(req: Request, res: Response) {
  try {
    const webhookToken = req.headers['x-webhook-token'] as string;
    if (webhookToken !== process.env.WEBHOOK_TOKEN) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
      });
    }

    const forms = req.body as WebhookFormData[];

    if (!Array.isArray(forms)) {
      return res.status(400).json({
        success: false,
        error: 'Body deve ser array',
      });
    }

    const results = {
      created: 0,
      failed: 0,
    };

    for (const form of forms) {
      try {
        if (!form.name || !form.email || !form.phone) {
          results.failed++;
          continue;
        }

        const cpf = form.cpf?.replace(/\D/g, '') || generateRandomCPF();

        const newLead = await leadService.createLead({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.replace(/\D/g, ''),
          cpf: cpf,
          category: form.category?.toUpperCase() as any || 'CONSULTATION',
          source: form.origin || 'WEBHOOK_BATCH',
        });

        results.created++;

        socketService.emitLeadCreated({
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          category: newLead.category,
          status: newLead.status,
          source: newLead.source,
          createdAt: newLead.createdAt,
        });
      } catch (_error: any) {
        results.failed++;
      }
    }

    return res.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('❌ Batch error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * GET /webhooks/forms/test
 */
export function testWebhook(_req: Request, res: Response) {
  res.json({
    success: true,
    message: 'Webhook ativo',
    endpoint: '/api/webhooks/forms',
  });
}
