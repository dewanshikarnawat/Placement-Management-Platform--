import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserProfileModel from '../models/User.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'incipio_secret_key_107';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, college, graduationYear, companyName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please enter all required fields.' });
    }

    if (role !== 'Student') {
      return res.status(400).json({ error: 'Only Student registration is enabled. Other accounts must be created by administrators.' });
    }

    const existingUser = await UserProfileModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create unique ID prefix
    const rolePrefix = role.toLowerCase();
    const id = `${rolePrefix}-${Date.now()}`;

    const newUser = new UserProfileModel({
      id,
      name,
      email,
      password: hashedPassword,
      role,
      college,
      graduationYear,
      companyName,
      skills: [],
      bio: ''
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // Exclude password from return
    const userObj = newUser.toObject() as any;
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: userObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password coordinates.' });
    }

    const user = await UserProfileModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email credentials. Account not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password credentials.' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const userObj = user.toObject() as any;
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userObj = req.user.toObject() as any;
    delete userObj.password;
    res.json(userObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Simulation endpoint deleted as simulator is removed
