import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import { ActivityEvent } from '../models/ActivityEvent';

const router = Router();

// Get Student Profile
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    let profile = await Profile.findOne({ userId });

    if (!profile) {
      const user = await User.findById(userId);
      profile = await Profile.create({
        userId,
        fullName: user?.name || 'Student Candidate',
        educationLevel: 'Undergraduate',
        degree: 'B.Tech / B.E. Computer Science',
        college: 'Engineering College',
        graduationYear: 2026,
        targetRole: user?.targetRole || 'Full Stack Developer',
        skills: [],
        projects: [],
      });
    }

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch student profile.' });
  }
});

// Update Profile
router.put('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updateData = req.body;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    if (updateData.targetRole) {
      await User.findByIdAndUpdate(userId, { targetRole: updateData.targetRole });
    }

    await ActivityEvent.create({
      userId,
      eventType: 'profile_updated',
      title: 'Profile Updated',
      description: 'Updated personal profile, skills, and target role preferences.',
    });

    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student profile.' });
  }
});

// Submit Onboarding Wizard
router.post('/onboarding', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      fullName,
      educationLevel,
      degree,
      college,
      graduationYear,
      targetRole,
      preferredLocations,
      preferredWorkMode,
      weeklyLearningHours,
      skills,
      projects,
    } = req.body;

    // Calculate explainable initial readiness score
    // Skill count: max 40 points
    // Projects: max 30 points
    // Weekly hours commitment: max 20 points
    // Education & target role defined: 10 points
    let initialScore = 10; // baseline for completed profile
    if (Array.isArray(skills)) {
      initialScore += Math.min(40, skills.length * 6);
    }
    if (Array.isArray(projects)) {
      initialScore += Math.min(30, projects.length * 15);
    }
    if (weeklyLearningHours && weeklyLearningHours >= 10) {
      initialScore += Math.min(20, Math.round((weeklyLearningHours / 20) * 20));
    }
    initialScore = Math.min(90, Math.max(25, initialScore));

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        $set: {
          fullName,
          educationLevel,
          degree,
          college,
          graduationYear: Number(graduationYear) || 2026,
          targetRole,
          preferredLocations: preferredLocations || ['Remote'],
          preferredWorkMode: preferredWorkMode || 'Remote',
          weeklyLearningHours: Number(weeklyLearningHours) || 15,
          skills: skills || [],
          projects: projects || [],
        },
      },
      { new: true, upsert: true }
    );

    await User.findByIdAndUpdate(userId, {
      name: fullName,
      isOnboarded: true,
      targetRole,
      readinessScore: initialScore,
    });

    await ActivityEvent.create({
      userId,
      eventType: 'profile_updated',
      title: 'Career Onboarding Completed',
      description: `Initial career readiness calculated at ${initialScore}% for ${targetRole}.`,
    });

    res.json({
      success: true,
      message: 'Onboarding completed successfully!',
      readinessScore: initialScore,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).json({ success: false, message: 'Failed to process onboarding.' });
  }
});

export default router;

