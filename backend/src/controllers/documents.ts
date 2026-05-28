import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import oneDriveService from '../services/oneDriveService.js';

const prisma = new PrismaClient();

// Configurar multer para salvar uploads temporariamente
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/jpeg',
      'image/png',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

export async function uploadDocument(req: any, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado',
      });
    }

    const { leadId } = req.params;
    const userId = req.userId;

    // Validar lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Lead não encontrado',
      });
    }

    try {
      // Fazer upload para OneDrive
      const oneDriveFile = await oneDriveService.uploadFile(
        req.file.path,
        `lead_${leadId}_${req.file.originalname}`
      );

      // Salvar documento no banco
      const document = await prisma.document.create({
        data: {
          leadId,
          uploaderId: userId,
          name: req.file.originalname,
          type: req.file.mimetype,
          fileUrl: req.file.path, // URL local temporária
          oneDriveId: oneDriveFile.id,
          isProcessed: false,
        },
      });

      // Registrar atividade
      await prisma.activity.create({
        data: {
          userId,
          leadId,
          action: 'DOCUMENT_UPLOADED',
          details: JSON.stringify({
            fileName: req.file.originalname,
            fileSize: req.file.size,
          }),
        },
      } as any);

      res.json({
        success: true,
        data: document,
        message: 'Documento enviado com sucesso',
      });
    } catch (oneDriveError) {
      console.error('Erro ao fazer upload no OneDrive:', oneDriveError);

      // Mesmo com erro no OneDrive, salvar localmente
      const document = await prisma.document.create({
        data: {
          leadId,
          uploaderId: userId,
          name: req.file.originalname,
          type: req.file.mimetype,
          fileUrl: req.file.path,
          isProcessed: false,
        },
      });

      res.status(201).json({
        success: true,
        data: document,
        message: 'Documento salvo localmente (OneDrive indisponível)',
      });
    }
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);

    // Limpar arquivo em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao fazer upload do documento',
    });
  }
}

export async function getLeadDocuments(req: any, res: Response) {
  try {
    const { leadId } = req.params;

    const documents = await prisma.document.findMany({
      where: { leadId },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: documents,
      total: documents.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar documentos',
    });
  }
}

export async function deleteDocument(req: any, res: Response) {
  try {
    const { documentId } = req.params;
    const userId = req.userId;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado',
      });
    }

    // Tentar deletar do OneDrive
    if (document.oneDriveId) {
      try {
        await oneDriveService.deleteFile(document.oneDriveId);
      } catch (error) {
        console.error('Erro ao deletar do OneDrive:', error);
      }
    }

    // Deletar arquivo local
    if (document.fileUrl && fs.existsSync(document.fileUrl)) {
      fs.unlinkSync(document.fileUrl);
    }

    // Deletar do banco
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Registrar atividade
    await prisma.activity.create({
      data: {
        userId,
        leadId: document.leadId,
        action: 'DOCUMENT_DELETED',
        details: JSON.stringify({
          fileName: document.name,
        }),
      },
    } as any);

    res.json({
      success: true,
      message: 'Documento deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar documento',
    });
  }
}

export async function downloadDocument(req: any, res: Response) {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || !document.fileUrl || !fs.existsSync(document.fileUrl)) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado',
      });
    }

    res.download(document.fileUrl, document.name);
  } catch (error: any) {
    console.error('Erro ao baixar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao baixar documento',
    });
  }
}

export async function processDocument(req: any, res: Response) {
  try {
    const { documentId } = req.params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado',
      });
    }

    // Marcar como processado
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        isProcessed: true,
        processedBy: req.userId,
      },
    });

    res.json({
      success: true,
      data: updated,
      message: 'Documento processado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao processar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar documento',
    });
  }
}
