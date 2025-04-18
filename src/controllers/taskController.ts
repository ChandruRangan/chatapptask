import { Request, Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Task title is required' });
      return;
    }
    
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.userId, title, description || '', 'pending']
    );
    
    res.status(201).json({
      message: 'Task created successfully',
      taskId: (result as any).insertId
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const { filter } = req.query;
    
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params: any[] = [req.userId];
    
    if (filter === 'completed') {
      query += ' AND status = ?';
      params.push('completed');
    } else if (filter === 'pending') {
      query += ' AND status = ?';
      params.push('pending');
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [tasks] = await pool.query(query, params);
    
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    const { taskId } = req.params;
    const { status } = req.body;
    
    if (!status || (status !== 'completed' && status !== 'pending')) {
      res.status(400).json({ error: 'Valid status (completed/pending) is required' });
      return;
    }
    
    // Verify the task belongs to the user
    const [tasks] = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, req.userId]
    );
    
    if (Array.isArray(tasks) && tasks.length === 0) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }
    
    await pool.query(
      'UPDATE tasks SET status = ? WHERE id = ?',
      [status, taskId]
    );
    
    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
