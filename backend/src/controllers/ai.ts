import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { socketService } from '../socket/service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Analisa um documento com IA
 */
export const analyzeDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { documentType } = req.body;

    // Buscar documento no BD
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        lead: true,
        uploader: true,
      },
    });

    if (!document) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }

    // Verificar se arquivo existe
    const filePath = document.fileUrl;
    if (!filePath) {
      res.status(400).json({ error: 'Caminho do arquivo não disponível' });
      return;
    }

    // Analisar com IA
    const analysis = await aiService.analyzeDocument(filePath, documentType);

    if (!analysis.success) {
      res.status(400).json({
        error: analysis.error || 'Erro ao analisar documento',
      });
      return;
    }

    // Atualizar documento no BD
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isProcessed: true,
        processedBy: analysis.classification,
      },
    });

    // Registrar atividade
    if (req.userId) {
      await prisma.activity.create({
        data: {
          userId: req.userId,
          leadId: document.leadId || undefined,
          action: 'document_analyzed_with_ai',
          details: JSON.stringify({
            documentId,
            documentType: analysis.documentType,
            classification: analysis.classification,
            confidence: analysis.confidence,
          }),
        },
      });
    }

    // Emitir evento Socket.io
    socketService.emitDocumentAnalyzed({
      documentId,
      leadId: document.leadId || '',
      documentType: analysis.documentType || 'generic',
      classification: analysis.classification || 'generic',
      confidence: analysis.confidence || 0,
      summary: analysis.summary || '',
      timestamp: new Date(),
      userId: req.userId || '',
    });

    res.status(200).json({
      document: updatedDocument,
      analysis,
    });
  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    
    // Emitir erro via Socket.io
    if (req.userId && req.params.documentId) {
      const doc = await prisma.document.findUnique({
        where: { id: req.params.documentId },
      });
      socketService.emitDocumentProcessingError(
        doc?.leadId || '',
        error instanceof Error ? error.message : 'Erro desconhecido',
        req.userId
      );
    }
    
    res.status(500).json({
      error: 'Erro ao analisar documento',
    });
  }
};

/**
 * Extrai dados estruturados de um documento
 */
export const extractData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { dataSchema } = req.body;

    if (!dataSchema) {
      res.status(400).json({ error: 'dataSchema é obrigatório' });
      return;
    }

    // Buscar documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }

    // Extrair dados
    const result = await aiService.extractStructuredData(document.fileUrl, dataSchema);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Registrar atividade
    if (req.userId) {
      await prisma.activity.create({
        data: {
          userId: req.userId,
          leadId: document.leadId || undefined,
          action: 'document_data_extracted',
          details: JSON.stringify({
            documentId,
            extractedFields: Object.keys(result.extractedData || {}),
          }),
        },
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao extrair dados:', error);
    res.status(500).json({ error: 'Erro ao extrair dados' });
  }
};

/**
 * Gera resumo de um documento
 */
export const summarizeDocument = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    // Buscar documento
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      res.status(404).json({ error: 'Documento não encontrado' });
      return;
    }

    // Gerar resumo
    const result = await aiService.summarizeDocument(document.fileUrl);

    if (!result.success) {
      res.status(400).json({ error: result.error });
      return;
    }

    // Registrar atividade
    if (req.userId) {
      await prisma.activity.create({
        data: {
          userId: req.userId,
          leadId: document.leadId || undefined,
          action: 'document_summarized',
          details: JSON.stringify({
            documentId,
            summaryLength: result.summary?.length || 0,
          }),
        },
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao resumir documento:', error);
    res.status(500).json({ error: 'Erro ao resumir documento' });
  }
};

/**
 * Preenche campos de um formulário
 */
export const fillFormFields = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { documentId, leadId } = req.params;
    const { formTemplate } = req.body;

    if (!formTemplate) {
      res.status(400).json({ error: 'formTemplate é obrigatório' });
      return;
    }

    // Buscar lead com dados
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      res.status(404).json({ error: 'Lead não encontrado' });
      return;
    }

    // Preencher formulário
    const filledForm = await aiService.fillDocumentFields(formTemplate, {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      cpf: lead.cpf,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zipCode: lead.zipCode,
    });

    // Registrar atividade
    if (req.userId) {
      await prisma.activity.create({
        data: {
          userId: req.userId,
          leadId,
          action: 'form_filled_with_ai',
          details: JSON.stringify({
            documentId,
            leadId,
          }),
        },
      });
    }

    res.status(200).json({
      filledForm,
      leadId,
    });
  } catch (error) {
    console.error('Erro ao preencher formulário:', error);
    res.status(500).json({ error: 'Erro ao preencher formulário' });
  }
};

/**
 * Verifica status da IA (configuração)
 */
export const getAIStatus = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const configured = aiService.isConfigured();

    res.status(200).json({
      configured,
      provider: 'Groq',
      model: 'llama-3.3-70b-versatile',
      message: configured
        ? 'IA está configurada e pronta para uso'
        : 'Configure GROQ_API_KEY no arquivo .env',
    });
  } catch (error) {
    console.error('Erro ao verificar status da IA:', error);
    res.status(500).json({ error: 'Erro ao verificar status' });
  }
};

/**
 * Processa todos os documentos de um lead com IA
 */
export const processLeadDocuments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { leadId } = req.params;

    // Buscar todos os documentos do lead
    const documents = await prisma.document.findMany({
      where: {
        leadId,
        isProcessed: false,
      },
    });

    if (documents.length === 0) {
      res.status(200).json({
        message: 'Nenhum documento para processar',
        totalDocuments: 0,
        processedCount: 0,
        results: [],
      });
      return;
    }

    // Emitir evento de início
    socketService.emitDocumentProcessingStarted({
      leadId,
      totalDocuments: documents.length,
      timestamp: new Date(),
      userId: req.userId || '',
    });

    // Processar cada documento
    const results = [];
    for (const document of documents) {
      const analysis = await aiService.analyzeDocument(document.fileUrl);

      if (analysis.success) {
        // Atualizar documento
        await prisma.document.update({
          where: { id: document.id },
          data: {
            isProcessed: true,
            processedBy: analysis.classification,
          },
        });

        results.push({
          documentId: document.id,
          success: true,
          analysis,
        });
      } else {
        results.push({
          documentId: document.id,
          success: false,
          error: analysis.error,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    // Registrar atividade de batch
    if (req.userId) {
      await prisma.activity.create({
        data: {
          userId: req.userId,
          leadId,
          action: 'batch_documents_processed',
          details: JSON.stringify({
            totalDocuments: documents.length,
            successCount,
          }),
        },
      });
    }

    // Emitir evento de conclusão
    socketService.emitDocumentProcessingCompleted({
      leadId,
      processedCount: documents.length,
      successCount,
      failureCount,
      timestamp: new Date(),
      userId: req.userId || '',
    });

    res.status(200).json({
      leadId,
      totalDocuments: documents.length,
      processedCount: results.filter((r) => r.success).length,
      results,
    });
  } catch (error) {
    console.error('Erro ao processar documentos do lead:', error);
    res.status(500).json({ error: 'Erro ao processar documentos' });
  }
};
