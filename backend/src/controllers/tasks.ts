import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { taskService } from '../services/taskService.js';

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
});

export async function getLeadTasks(req: any, res: Response) {
  try {
    const { leadId } = req.params;
    const tasks = await taskService.getTasksByLead(leadId);

    res.json({
      success: true,
      data: tasks,
      total: tasks.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar tarefas',
    });
  }
}

export async function createTask(req: any, res: Response) {
  try {
    const { leadId } = req.params;
    const { title, description, dueDate } = req.body;
    const userId = req.userId;

    if (!title) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'O título da tarefa é obrigatório',
      });
    }

    let attachmentUrl: string | undefined;
    let attachmentName: string | undefined;

    if (req.file) {
      attachmentName = req.file.originalname;
      const fileBuffer = fs.readFileSync(req.file.path);
      attachmentUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      fs.unlinkSync(req.file.path);
    }

    const task = await taskService.createTask({
      leadId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdById: userId,
      attachmentUrl,
      attachmentName,
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Tarefa criada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao criar tarefa:', error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar tarefa',
    });
  }
}

export async function updateTask(req: any, res: Response) {
  try {
    const { taskId } = req.params;
    const { title, description, dueDate, completed } = req.body;

    const task = await taskService.updateTask(taskId, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(completed !== undefined && { completed }),
    });

    res.json({
      success: true,
      data: task,
      message: 'Tarefa atualizada com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tarefa',
    });
  }
}

export async function deleteTask(req: any, res: Response) {
  try {
    const { taskId } = req.params;
    const success = await taskService.deleteTask(taskId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Tarefa não encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Tarefa removida com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao remover tarefa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao remover tarefa',
    });
  }
}
