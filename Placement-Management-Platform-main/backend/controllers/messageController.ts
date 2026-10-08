import { Request, Response } from 'express';
import MessageModel from '../models/Message.js';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await MessageModel.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const newMsg = new MessageModel(req.body);
    await newMsg.save();
    res.status(201).json(newMsg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await MessageModel.findOneAndUpdate({ id }, { read: true }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Message not found' });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
