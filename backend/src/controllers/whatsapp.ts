import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsappService.js';
import { kanbanService } from '../services/kanbanService.js';
import { socketService } from '../socket/service.js';
import { aiService } from '../services/aiService.js';
import { oneDriveService } from '../services/oneDriveService.js';
import { downloadWhatsAppMedia, sendWhatsAppText, mimeToExt, mimeToLabel } from '../services/whatsappMediaService.js';
import { PrismaClient } from '@prisma/client';

import { prisma } from '../services/prisma.js';

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

          // Criar card no Kanban Comercial (etapa "Início") para triagem
          const kanbanCard = await kanbanService.createCard({
            leadId: lead.id,
            sector: 'COMMERCIAL',
            stage: 'inicio',
            position: 0,
            notes: `Lead recebido via WhatsApp (${msg.from})`,
          });

          socketService.emitKanbanCardCreated({
            cardId: kanbanCard.id,
            leadId: lead.id,
            sector: 'COMMERCIAL',
            title: lead.name,
            timestamp: new Date(),
            userId: 'system',
            userName: 'WhatsApp Bot',
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

    // Processar mensagens de mídia (imagem, documento, áudio, vídeo)
    await processMediaMessages(payload);

    // Confirmar recebimento ao WhatsApp
    res.status(200).json({ success: true, messages_processed: messages.length });
  } catch (error) {
    console.error('Erro ao receber mensagem:', error);
    res.status(500).json({ error: 'Erro ao receber mensagem' });
  }
};

/**
 * Processa mensagens de mídia recebidas via WhatsApp.
 * Baixa o arquivo, classifica com IA, salva no banco (e OneDrive se configurado)
 * e envia confirmação ao cliente.
 */
async function processMediaMessages(payload: any): Promise<void> {
  try {
    const entries = payload?.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const messages = change.value?.messages || [];
        const contacts = change.value?.contacts || [];
        const senderName = contacts[0]?.profile?.name || 'Cliente';

        for (const msg of messages) {
          const mediaTypes = ['image', 'document', 'audio', 'video', 'sticker'];
          if (!mediaTypes.includes(msg.type)) continue;

          const from: string = msg.from;
          const mediaData = msg[msg.type] as any;
          const mediaId: string = mediaData?.id;
          const originalFileName: string = mediaData?.filename || '';

          if (!mediaId) continue;

          console.log(`📎 Mídia recebida de ${senderName} (${from}): tipo=${msg.type}`);

          try {
            // 1. Encontrar lead pelo número de WhatsApp
            const lead = await prisma.lead.findFirst({ where: { whatsappId: from } });
            if (!lead) {
              console.warn(`Lead não encontrado para whatsappId=${from}. Mídia ignorada.`);
              await sendWhatsAppText(
                from,
                `Olá ${senderName}! Recebi seu arquivo, mas ainda não encontrei seu cadastro. Por favor, entre em contato com o escritório para que possamos te registrar. 📋`
              );
              continue;
            }

            // 2. Baixar arquivo da API do WhatsApp
            const { buffer, mimeType, fileName } = await downloadWhatsAppMedia(mediaId);
            const finalFileName = originalFileName || fileName;
            const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

            // 3. Classificar com IA (best-effort — não bloqueia se falhar)
            let aiClassification = '';
            try {
              const analysis = await aiService.analyzeDocument(dataUri, undefined, finalFileName);
              if (analysis.success && analysis.documentType) {
                aiClassification = analysis.documentType;
                console.log(`🧠 IA classificou como: ${aiClassification} (${((analysis.confidence || 0) * 100).toFixed(0)}%)`);
              }
            } catch (aiErr) {
              console.warn('IA não disponível para classificar arquivo:', aiErr);
            }

            // 4. Salvar no banco de dados vinculado ao lead
            const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
            const document = await prisma.document.create({
              data: {
                leadId: lead.id,
                uploaderId: adminUser?.id || lead.id,
                name: finalFileName,
                type: mimeType,
                fileUrl: dataUri,
                processedBy: aiClassification || null,
                isProcessed: !!aiClassification,
              },
            });

            // 5. Backup no OneDrive na pasta do lead (se configurado)
            if (oneDriveService.isConfigured()) {
              try {
                const folderName = `Lead_${lead.name.replace(/[^a-zA-Z0-9 ]/g, '_')}`;
                const oneDriveResult = await oneDriveService.uploadFile(buffer, `${folderName}/${finalFileName}`, mimeType);
                await prisma.document.update({
                  where: { id: document.id },
                  data: { oneDriveId: oneDriveResult.webUrl },
                });
                console.log(`☁️ Arquivo salvo no OneDrive: ${folderName}/${finalFileName}`);
              } catch (odErr) {
                console.warn('Erro ao salvar no OneDrive (arquivo salvo no banco):', odErr);
              }
            }

            // 6. Registrar atividade
            if (adminUser) {
              await prisma.activity.create({
                data: {
                  userId: adminUser.id,
                  leadId: lead.id,
                  action: 'whatsapp_file_received',
                  details: JSON.stringify({
                    fileName: finalFileName,
                    mimeType,
                    aiClassification,
                    documentId: document.id,
                  }),
                },
              });
            }

            // 7. Enviar confirmação ao cliente
            const label = mimeToLabel(mimeType);
            const classLabel = aiClassification ? ` (${aiClassification})` : '';
            await sendWhatsAppText(
              from,
              `✅ Recebi seu ${label}${classLabel}, ${lead.name.split(' ')[0]}! O arquivo já está salvo no seu processo. Caso precise de mais informações, nossa equipe entrará em contato em breve. 📂`
            );

            console.log(`✅ Arquivo de ${lead.name} salvo com sucesso (doc ID: ${document.id})`);
          } catch (mediaErr) {
            console.error(`Erro ao processar mídia de ${from}:`, mediaErr);
          }
        }
      }
    }
  } catch (error) {
    console.error('Erro ao processar mensagens de mídia:', error);
  }
}

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
      action: 'whatsapp_message_received',
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
