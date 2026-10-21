import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { User } from '../models/User';
import { Resume } from '../models/Resume';
import { InterviewSession } from '../models/InterviewSession';
import { prisma } from '../config/db';

const router = Router();

// Protect all admin routes with authentication and admin privilege
router.use(authenticateToken);
router.use(requireAdmin);

// Platform Aggregate Statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const resumesCount = await Resume.countDocuments();
    const interviewsCount = await InterviewSession.countDocuments();

    const jobsCount = await prisma.job.count();
    const dsaProblemsCount = await prisma.dSAProblem.count();
    const resourcesCount = await prisma.learningResource.count();

    res.json({
      success: true,
      stats: {
        totalUsers,
        studentUsers,
        resumesAnalyzed: resumesCount,
        interviewsCompleted: interviewsCount,
        jobsCatalogued: jobsCount,
        dsaProblemsLogged: dsaProblemsCount,
        learningResources: resourcesCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics.' });
  }
});

// List Registered Users
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users directory.' });
  }
});

// Manage Skills Taxonomy
router.get('/skills', async (req: Request, res: Response): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load skills taxonomy.' });
  }
});

router.post('/skills', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, aliases, targetProficiency } = req.body;
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        aliases: JSON.stringify(Array.isArray(aliases) ? aliases : []),
        targetProficiency: Number(targetProficiency) || 80,
      },
    });
    res.status(201).json({ success: true, message: 'Skill added to taxonomy.', skill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add skill.' });
  }
});

export default router;

