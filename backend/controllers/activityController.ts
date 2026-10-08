import { Request, Response } from 'express';
import ActivityLogModel from '../models/ActivityLog.js';

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await ActivityLogModel.find({}).sort({ createdAt: -1 });
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createActivityLog = async (req: Request, res: Response) => {
  try {
    const newLog = new ActivityLogModel(req.body);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
