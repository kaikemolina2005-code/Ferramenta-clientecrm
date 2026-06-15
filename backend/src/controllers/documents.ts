import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

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

    // Salvar o conteúdo do arquivo no banco de dados (data URI em base64),
    // já que o disco do Render é apagado a cada deploy/restart.
    const fileBuffer = fs.readFileSync(req.file.path);
    const dataUri = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    fs.unlinkSync(req.file.path);

    const document = await prisma.document.create({
      data: {
        leadId,
        uploaderId: userId,
        name: req.file.originalname,
        type: req.file.mimetype,
        fileUrl: dataUri,
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

    // Deletar arquivo local (documentos antigos que ainda referenciam caminho em disco)
    if (document.fileUrl && !document.fileUrl.startsWith('data:') && fs.existsSync(document.fileUrl)) {
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

    if (!document || !document.fileUrl) {
      return res.status(404).json({
        success: false,
        message: 'Documento não encontrado',
      });
    }

    if (document.fileUrl.startsWith('data:')) {
      const matches = document.fileUrl.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        return res.status(500).json({
          success: false,
          message: 'Arquivo armazenado em formato inválido',
        });
      }
      const [, mimeType, base64Data] = matches;
      const buffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
      return res.send(buffer);
    }

    if (!fs.existsSync(document.fileUrl)) {
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
