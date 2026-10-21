import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { Profile } from '../models/Profile';
import { ActivityEvent } from '../models/ActivityEvent';
import { aiClient } from '../services/aiClient';

const router = Router();

// Get Active Career Roadmap
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const roadmap = await prisma.roadmap.findUnique({
      where: { userId },
      include: {
        weeks: {
          include: {
            tasks: {
              orderBy: { priority: 'asc' },
            },
          },
          orderBy: { weekNumber: 'asc' },
        },
      },
    });

    if (!roadmap) {
      res.json({ success: true, roadmap: null, message: 'No roadmap generated yet.' });
      return;
    }

    // Calculate completion progress
    let totalTasks = 0;
    let completedTasks = 0;
    roadmap.weeks.forEach(w => {
      w.tasks.forEach(t => {
        totalTasks += 1;
        if (t.isCompleted) completedTasks += 1;
      });
    });

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      roadmap,
      stats: {
        totalTasks,
        completedTasks,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error('Roadmap fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve roadmap.' });
  }
});

// Generate or Regenerate Roadmap
router.post('/generate', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { targetRole, timelineWeeks, weeklyHours } = req.body;

    const profile = await Profile.findOne({ userId });
    const studentRole = targetRole || profile?.targetRole || 'Full Stack Developer';
    const hours = Number(weeklyHours) || profile?.weeklyLearningHours || 15;
    const weeksCount = Number(timelineWeeks) || 6;

    const currentSkills = profile?.skills.map(s => s.name) || ['JavaScript', 'HTML'];

    // Identify gaps against standard full-stack benchmark
    const standardExpectations = ['TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Docker', 'Redis', 'DSA', 'System Design'];
    const currentSkillsLower = new Set(currentSkills.map(s => s.toLowerCase()));
    const missingSkills = standardExpectations.filter(s => !currentSkillsLower.has(s.toLowerCase()));

    const aiResult = await aiClient.generateRoadmap({
      target_role: studentRole,
      current_skills: currentSkills,
      missing_skills: missingSkills,
      available_hours_per_week: hours,
      timeline_weeks: weeksCount,
    });

    const generated = aiResult.data;

    // Delete existing roadmap for clean regeneration
    await prisma.roadmap.deleteMany({ where: { userId } });

    // Store in MySQL via Prisma
    const newRoadmap = await prisma.roadmap.create({
      data: {
        userId,
        targetRole: studentRole,
        timelineWeeks: generated.timeline_weeks,
        totalPlannedHours: generated.total_planned_hours,
        summaryAdvice: generated.summary_advice,
        weeks: {
          create: generated.weeks.map((w: any) => ({
            weekNumber: w.week_number,
            focusTheme: w.focus_theme,
            totalHours: w.total_hours,
            tasks: {
              create: w.tasks.map((t: any) => ({
                title: t.title,
                description: t.description,
                relatedSkill: t.related_skill,
                category: t.category,
                priority: t.priority,
                estimatedHours: t.estimated_hours,
                resourceTitle: t.recommended_resource_title,
                resourceUrl: t.recommended_resource_url,
                resourceType: t.recommended_resource_type,
                isCompleted: false,
              })),
            },
          })),
        },
      },
      include: {
        weeks: {
          include: { tasks: true },
        },
      },
    });

    await ActivityEvent.create({
      userId,
      eventType: 'roadmap_completed',
      title: 'Roadmap Generated',
      description: `Generated a personalized ${weeksCount}-week roadmap for ${studentRole}.`,
    });

    res.json({
      success: true,
      message: 'Roadmap generated successfully.',
      source: aiResult.source,
      roadmap: newRoadmap,
    });
  } catch (error) {
    console.error('Roadmap generation error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Toggle Task Completion
router.patch('/tasks/:taskId/toggle', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;

    const existingTask = await prisma.roadmapTask.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      res.status(404).json({ success: false, message: 'Task not found.' });
      return;
    }

    const nextState = !existingTask.isCompleted;

    const updatedTask = await prisma.roadmapTask.update({
      where: { id: taskId },
      data: {
        isCompleted: nextState,
        completedAt: nextState ? new Date() : null,
      },
    });

    if (nextState) {
      await ActivityEvent.create({
        userId: req.user!.id,
        eventType: 'roadmap_completed',
        title: 'Roadmap Task Completed',
        description: `Completed: ${existingTask.title} (${existingTask.relatedSkill}).`,
      });
    }

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
});

// Update Task Details (Priority, Target Date, etc.)
router.put('/tasks/:taskId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { priority, estimatedHours, title, description } = req.body;

    const updated = await prisma.roadmapTask.update({
      where: { id: taskId },
      data: {
        ...(priority ? { priority } : {}),
        ...(estimatedHours ? { estimatedHours: Number(estimatedHours) } : {}),
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
      },
    });

    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task.' });
  }
});

export default router;
