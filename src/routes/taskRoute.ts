import express from 'express';
import { createTask, getTasks, updateTaskStatus } from '../controllers/taskController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/', authMiddleware, createTask);
router.get('/', authMiddleware, getTasks);
router.patch('/:taskId/status', authMiddleware, updateTaskStatus);

export default router;