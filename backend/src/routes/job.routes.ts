import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../config/db';
import { Profile } from '../models/Profile';
import { ActivityEvent } from '../models/ActivityEvent';
import { aiClient } from '../services/aiClient';

const router = Router();

// Analyze Pasted Job Description
router.post('/analyze', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { jobTitle, company, jobDescription } = req.body;

    if (!jobDescription || !jobDescription.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a job description.' });
      return;
    }

    // Retrieve user's verified skills & projects
    const profile = await Profile.findOne({ userId });
    const candidateSkills = profile?.skills.map(s => s.name) || ['JavaScript', 'HTML', 'CSS'];
    const candidateProjects = profile?.projects || [];

    const aiResult = await aiClient.analyzeJobDescription({
      job_title: jobTitle || 'Target Role',
      company: company || 'Prospective Employer',
      job_description: jobDescription,
      candidate_skills: candidateSkills,
      candidate_projects: candidateProjects,
    });

    // Log Activity
    await ActivityEvent.create({
      userId,
      eventType: 'job_analyzed',
      title: 'Job Description Evaluated',
      description: `Analyzed "${jobTitle || 'Role'}" at "${company || 'Company'}". Match score: ${aiResult.data.match_percentage}%.`,
    });

    res.json({
      success: true,
      source: aiResult.source,
      analysis: aiResult.data,
    });
  } catch (error) {
    console.error('Job analysis error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// List Curated Jobs with Real-time User Match Calculation
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await Profile.findOne({ userId });
    const userSkillsSet = new Set((profile?.skills || []).map(s => s.name.toLowerCase()));

    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Compute transparent match for each job against user's actual profile
    const enrichedJobs = jobs.map(j => {
      let reqSkills: string[] = [];
      let prefSkills: string[] = [];
      try {
        reqSkills = JSON.parse(j.requiredSkills);
        prefSkills = JSON.parse(j.preferredSkills);
      } catch (e) {
        reqSkills = j.requiredSkills.split(',').map(s => s.trim());
      }

      const matchedReq = reqSkills.filter(s => userSkillsSet.has(s.toLowerCase()));
      const missingReq = reqSkills.filter(s => !userSkillsSet.has(s.toLowerCase()));
      const matchedPref = prefSkills.filter(s => userSkillsSet.has(s.toLowerCase()));

      const totalWeights = (2.0 * reqSkills.length) + (1.0 * prefSkills.length);
      const achievedWeights = (2.0 * matchedReq.length) + (1.0 * matchedPref.length);
      const matchScore = totalWeights > 0 ? Math.round((achievedWeights / totalWeights) * 100) : 60;

      return {
        ...j,
        requiredSkillsList: reqSkills,
        preferredSkillsList: prefSkills,
        matchedSkills: matchedReq,
        missingSkills: missingReq,
        calculatedMatchScore: matchScore,
      };
    });

    // Sort by highest match score
    enrichedJobs.sort((a, b) => b.calculatedMatchScore - a.calculatedMatchScore);

    res.json({ success: true, jobs: enrichedJobs });
  } catch (error) {
    console.error('Jobs list error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs directory.' });
  }
});

// Create Job Manually
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, company, location, workMode, experienceLevel, description, requiredSkills, preferredSkills, sourceUrl } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location: location || 'Remote',
        workMode: workMode || 'Remote',
        experienceLevel: experienceLevel || 'Fresher / 0-2 yrs',
        description,
        requiredSkills: JSON.stringify(Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills]),
        preferredSkills: JSON.stringify(Array.isArray(preferredSkills) ? preferredSkills : []),
        sourceUrl: sourceUrl || 'https://careeros.ai/jobs',
        isDemoData: false,
      },
    });

    res.status(201).json({ success: true, message: 'Job listing added.', job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create job listing.' });
  }
});

// Get User's Applications Pipeline
router.get('/applications', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch job applications.' });
  }
});

// Add / Track Application
router.post('/applications', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { jobId, status, matchScore, notes } = req.body;

    const application = await prisma.jobApplication.upsert({
      where: {
        id: req.body.id || 'non-existent-id',
      },
      update: {
        status: status || 'Interested',
        notes,
        matchScore: matchScore || 0,
      },
      create: {
        userId,
        jobId,
        status: status || 'Interested',
        matchScore: matchScore || 0,
        notes,
        appliedDate: status === 'Applied' ? new Date() : null,
      },
      include: { job: true },
    });

    res.json({ success: true, message: 'Application status saved.', application });
  } catch (error) {
    console.error('Application track error:', error);
    res.status(500).json({ success: false, message: 'Failed to save application.' });
  }
});

// Update Application Status
router.put('/applications/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: {
        status,
        notes,
        ...(status === 'Applied' ? { appliedDate: new Date() } : {}),
      },
      include: { job: true },
    });

    res.json({ success: true, message: 'Application updated.', application: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update application.' });
  }
});

export default router;

