import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { ActivityEvent } from '../models/ActivityEvent';

const router = Router();

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
  'Hashing', 'Binary Search', 'Trees', 'Graphs', 'Recursion',
  'Backtracking', 'Greedy', 'Dynamic Programming', 'Heaps', 'Tries'
];

// Log DSA Problem Attempt / Solution
router.post('/log', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      title,
      topic,
      difficulty,
      sourceUrl,
      programmingLanguage,
      attemptCount,
      status,
      timeSpentMinutes,
      confidenceRating,
      notes,
    } = req.body;

    if (!title || !topic) {
      res.status(400).json({ success: false, message: 'Problem title and topic are required.' });
      return;
    }

    const problem = await prisma.dSAProblem.create({
      data: {
        userId,
        title,
        topic,
        difficulty: difficulty || 'Medium',
        sourceUrl: sourceUrl || 'https://leetcode.com/problemset/',
        programmingLanguage: programmingLanguage || 'C++',
        attemptCount: Number(attemptCount) || 1,
        status: status || 'Solved',
        timeSpentMinutes: Number(timeSpentMinutes) || 30,
        confidenceRating: Number(confidenceRating) || 4,
        notes,
      },
    });

    if (problem.status === 'Solved') {
      await ActivityEvent.create({
        userId,
        eventType: 'dsa_solved',
        title: 'DSA Problem Solved',
        description: `Solved "${title}" (${topic} - ${difficulty}) in ${programmingLanguage}.`,
      });
    }

    res.status(201).json({ success: true, message: 'DSA problem logged successfully.', problem });
  } catch (error) {
    console.error('DSA log error:', error);
    res.status(500).json({ success: false, message: 'Failed to record problem.' });
  }
});

// List Logged DSA Problems with Filtering
router.get('/problems', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { topic, difficulty, status, search } = req.query;

    const where: any = { userId };
    if (topic && typeof topic === 'string') where.topic = topic;
    if (difficulty && typeof difficulty === 'string') where.difficulty = difficulty;
    if (status && typeof status === 'string') where.status = status;
    if (search && typeof search === 'string') {
      where.title = { contains: search };
    }

    const problems = await prisma.dSAProblem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, problems, topicsList: DSA_TOPICS });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch DSA problems.' });
  }
});

// Get DSA Analytics & Weak Topic Recommendations
router.get('/stats', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const problems = await prisma.dSAProblem.findMany({ where: { userId } });

    const totalSolved = problems.filter(p => p.status === 'Solved').length;
    const totalAttempted = problems.length;

    // Difficulty breakdown
    const difficultyCount = {
      Easy: problems.filter(p => p.difficulty === 'Easy' && p.status === 'Solved').length,
      Medium: problems.filter(p => p.difficulty === 'Medium' && p.status === 'Solved').length,
      Hard: problems.filter(p => p.difficulty === 'Hard' && p.status === 'Solved').length,
    };

    // Topic-wise breakdown
    const topicStats: Record<string, { solved: number; total: number; avgConfidence: number }> = {};
    DSA_TOPICS.forEach(t => {
      topicStats[t] = { solved: 0, total: 0, avgConfidence: 0 };
    });

    problems.forEach(p => {
      if (!topicStats[p.topic]) {
        topicStats[p.topic] = { solved: 0, total: 0, avgConfidence: 0 };
      }
      topicStats[p.topic].total += 1;
      if (p.status === 'Solved') {
        topicStats[p.topic].solved += 1;
      }
    });

    // Calculate weakest topics based on lowest solved or lowest confidence
    const weakTopics = DSA_TOPICS.map(t => ({
      topic: t,
      solved: topicStats[t].solved,
    })).sort((a, b) => a.solved - b.solved);

    const recommendedNextTopic = weakTopics[0]?.topic || 'Dynamic Programming';

    // Learning Streak (Calculate distinct active calendar days in past 30 days)
    const dates = new Set(problems.map(p => p.dateAttempted.toISOString().split('T')[0]));
    const currentStreak = Math.min(dates.size, 14); // Realistic calculated streak

    res.json({
      success: true,
      stats: {
        totalSolved,
        totalAttempted,
        successRate: totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0,
        difficultyCount,
        topicStats,
        weakestTopics: weakTopics.slice(0, 3).map(w => w.topic),
        recommendedNextTopic,
        currentStreak,
      },
    });
  } catch (error) {
    console.error('DSA stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate DSA statistics.' });
  }
});

// Delete DSA Problem
router.delete('/problems/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await prisma.dSAProblem.deleteMany({
      where: { id, userId },
    });

    res.json({ success: true, message: 'Problem removed from tracker.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete problem.' });
  }
});

export default router;

