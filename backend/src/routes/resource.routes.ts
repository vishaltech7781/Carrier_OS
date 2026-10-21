import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';

const router = Router();

// List Learning Resources with Filtering
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { skill, resourceType, difficulty, search } = req.query;

    const where: any = {};
    if (skill && typeof skill === 'string') where.skill = skill;
    if (resourceType && typeof resourceType === 'string') where.resourceType = resourceType;
    if (difficulty && typeof difficulty === 'string') where.difficulty = difficulty;
    if (search && typeof search === 'string') {
      where.title = { contains: search };
    }

    const resources = await prisma.learningResource.findMany({
      where,
      include: {
        bookmarks: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = resources.map(r => ({
      ...r,
      isBookmarked: r.bookmarks.length > 0,
    }));

    res.json({ success: true, resources: formatted });
  } catch (error) {
    console.error('Resources fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch learning resources.' });
  }
});

// Bookmark / Unbookmark Resource
router.post('/bookmark', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { resourceId, notes } = req.body;

    const existing = await prisma.resourceBookmark.findFirst({
      where: { userId, resourceId },
    });

    if (existing) {
      await prisma.resourceBookmark.delete({ where: { id: existing.id } });
      res.json({ success: true, message: 'Bookmark removed.', isBookmarked: false });
    } else {
      const bookmark = await prisma.resourceBookmark.create({
        data: { userId, resourceId, notes },
      });
      res.json({ success: true, message: 'Resource bookmarked.', isBookmarked: true, bookmark });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update bookmark.' });
  }
});

export default router;

