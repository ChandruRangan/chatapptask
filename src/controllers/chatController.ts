import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';
import * as XLSX from 'xlsx';
import { Chat } from '../models/Chat';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Define interface for the Excel data structure
interface ExcelChatRow {
  message: string;
  timestamp: string | Date;
  sender: string;
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: (arg0: null, arg1: string) => void) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export const importChatFromExcel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded or invalid file format' });
      return;
    }
    
    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Validate data with proper type predicate
    const validData = data.filter((row: any): row is ExcelChatRow => 
      row.message && 
      row.timestamp && 
      (row.sender === 'user' || row.sender === 'system')
    );
    
    if (validData.length === 0) {
      res.status(400).json({ error: 'No valid chat data found in Excel file' });
      return;
    }
    
    // Insert data into database
    let insertedCount = 0;
    for (const item of validData) {
      const chatMessage: Chat = {
        user_id: req.userId,
        message: item.message,
        timestamp: new Date(item.timestamp),
        sender: item.sender
      };
      
      await pool.query(
        'INSERT INTO chat_messages (user_id, message, timestamp, sender) VALUES (?, ?, ?, ?)',
        [chatMessage.user_id, chatMessage.message, chatMessage.timestamp, chatMessage.sender]
      );
      
      insertedCount++;
    }
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({
      message: 'Chat history imported successfully',
      importedCount: insertedCount
    });
  } catch (error) {
    console.error('Error importing chat from Excel:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const [messages] = await pool.query(
      'SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC',
      [req.userId]
    );
    
    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};