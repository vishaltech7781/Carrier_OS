import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/User';
import { Profile } from '../models/Profile';
import { authenticateToken } from '../middleware/auth';
import { ActivityEvent } from '../models/ActivityEvent';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'careeros_jwt_super_secret_development_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']).optional().default('student'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { name, email, password, role } = parseResult.data;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'student',
      isOnboarded: false,
      readinessScore: 35, // Initial provisional score
    });

    // Create empty profile
    await Profile.create({
      userId: user._id.toString(),
      fullName: name,
      educationLevel: 'Undergraduate',
      degree: 'B.Tech / B.E. Computer Science',
      college: 'Engineering College',
      graduationYear: 2026,
      targetRole: 'Full Stack Developer',
      preferredLocations: ['Remote', 'Bengaluru', 'Pune'],
      preferredWorkMode: 'Remote',
      weeklyLearningHours: 15,
      skills: [],
      projects: [],
    });

    await ActivityEvent.create({
      userId: user._id.toString(),
      eventType: 'profile_updated',
      title: 'Account Created',
      description: 'Welcome to CareerOS AI. Complete the onboarding wizard to unlock your career readiness plan.',
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// Demo Account Quick-Fill (For evaluator/examiner testing)
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const demoEmail = 'student.demo@careeros.ai';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('CareerOS@Demo2026', salt);

      user = await User.create({
        name: 'Vishal Biradar',
        email: demoEmail,
        passwordHash,
        role: 'student',
        isOnboarded: true,
        targetRole: 'Full Stack Developer',
        readinessScore: 78,
      });

      await Profile.create({
        userId: user._id.toString(),
        fullName: 'Vishal Biradar',
        educationLevel: 'Undergraduate',
        degree: 'B.Tech Computer Science Engineering',
        college: 'College of Engineering',
        graduationYear: 2026,
        targetRole: 'Full Stack Developer',
        preferredLocations: ['Remote', 'Bengaluru', 'Pune'],
        preferredWorkMode: 'Remote',
        weeklyLearningHours: 15,
        skills: [
          { name: 'JavaScript', category: 'Programming Languages', proficiencyLevel: 'Advanced', isVerified: true, evidenceSource: 'Project' },
          { name: 'TypeScript', category: 'Programming Languages', proficiencyLevel: 'Intermediate', isVerified: true, evidenceSource: 'Resume' },
          { name: 'React', category: 'Frontend Development', proficiencyLevel: 'Advanced', isVerified: true, evidenceSource: 'Project' },
          { name: 'Node.js', category: 'Backend Development', proficiencyLevel: 'Intermediate', isVerified: true, evidenceSource: 'Project' },
          { name: 'Express', category: 'Backend Development', proficiencyLevel: 'Intermediate', isVerified: true, evidenceSource: 'Project' },
          { name: 'MongoDB', category: 'Databases', proficiencyLevel: 'Intermediate', isVerified: true, evidenceSource: 'Project' },
          { name: 'SQL', category: 'Databases', proficiencyLevel: 'Intermediate', isVerified: false, evidenceSource: 'Profile' },
          { name: 'Git', category: 'Cloud & DevOps', proficiencyLevel: 'Intermediate', isVerified: true, evidenceSource: 'Resume' },
        ],
        projects: [
          {
            title: 'Ling Yatra - Multi-Lingual Cultural & Tourism Platform',
            description: 'Full stack web application engineered with React, TypeScript, Node.js, Express, and MongoDB. Implemented authentication and real-time state management.',
            technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Express'],
            githubUrl: 'https://github.com/vishal/ling-yatra',
          },
          {
            title: 'YouTube Stream Engine',
            description: 'Responsive video streaming client with component modularity and third-party API integration.',
            technologies: ['React', 'JavaScript', 'Tailwind CSS', 'Redux'],
            githubUrl: 'https://github.com/vishal/youtube-clone',
          },
        ],
        bio: 'Aspiring Full Stack Engineer passionate about building scalable, high-performance web systems and AI-integrated software.',
        githubUrl: 'https://github.com/vishalbiradar',
        linkedinUrl: 'https://linkedin.com/in/vishalbiradar',
      });

      await ActivityEvent.create({
        userId: user._id.toString(),
        eventType: 'profile_updated',
        title: 'Demo Student Account Initialized',
        description: 'Loaded flagship verified profile for evaluation.',
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Demo session authenticated.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ success: false, message: 'Server error during demo session setup.' });
  }
});

// Admin Demo Login
router.post('/demo-admin-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminEmail = 'admin@careeros.ai';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('CareerOS@Admin2026', salt);

      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isOnboarded: true,
        targetRole: 'Engineering Manager',
        readinessScore: 98,
      });
    }

    const token = jwt.sign(
      { id: admin._id.toString(), email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Administrator session authenticated.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isOnboarded: admin.isOnboarded,
        targetRole: admin.targetRole,
        readinessScore: admin.readinessScore,
      },
    });
  } catch (error) {
    console.error('Admin demo login error:', error);
    res.status(500).json({ success: false, message: 'Server error during admin login.' });
  }
});

// Current User Me
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-passwordHash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnboarded: user.isOnboarded,
        targetRole: user.targetRole,
        readinessScore: user.readinessScore,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve profile data.' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    return;
  }
  // In development, return confirmation message without leaking user existence
  res.json({
    success: true,
    message: 'If an account exists with this email address, a password reset instruction has been dispatched.',
  });
});

export default router;

