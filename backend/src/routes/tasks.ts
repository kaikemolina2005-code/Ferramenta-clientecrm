// Lead task (reminder) routes
import { Router } from 'express';
import * as tasksController from '../controllers/tasks.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Middleware - All routes require authentication
router.use(authMiddleware);

// GET /tasks/lead/:leadId - List tasks for a lead
router.get('/lead/:leadId', tasksController.getLeadTasks);

// POST /tasks/lead/:leadId - Create task for a lead (optional attachment)
router.post('/lead/:leadId', tasksController.upload.single('file'), tasksController.createTask);

// PUT /tasks/:taskId - Update task (title, description, dueDate, completed)
router.put('/:taskId', tasksController.updateTask);

// DELETE /tasks/:taskId - Delete task
router.delete('/:taskId', tasksController.deleteTask);

export default router;
