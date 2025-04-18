import express from 'express';
import { importChatFromExcel, getChatHistory, upload } from '../controllers/chatController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/import', authMiddleware, upload.single('excelFile'), importChatFromExcel);
router.get('/history', authMiddleware, getChatHistory);
export default router;