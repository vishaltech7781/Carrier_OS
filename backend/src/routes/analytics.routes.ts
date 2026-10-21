import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Profile } from '../models/Profile';
import { Resume } from '../models/Resume';
import { InterviewSession } from '../models/InterviewSession';
import { ActivityEvent } from '../models/ActivityEvent';
import { prisma } from '../config/db';

const router = Router();

// Calculate Explainable Career Readiness Score
router.get('/readiness', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const profile = await Profile.findOne({ userId });
    const latestResume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    const dsaProblems = await prisma.dSAProblem.findMany({ where: { userId } });
    const interviews = await InterviewSession.find({ userId, status: 'Completed' }).sort({ createdAt: -1 });

    // 1. Skill Coverage (Weight: 35%)
    // Benchmark: 10 core skills for full-stack role
    const verifiedSkillsCount = profile?.skills.length || 0;
    const skillScore = Math.min(100, Math.round((verifiedSkillsCount / 10) * 100));

    // 2. DSA Performance (Weight: 20%)
    // Benchmark: 30 solved problems with good difficulty spread
    const solvedDsaCount = dsaProblems.filter(p => p.status === 'Solved').length;
    const dsaScore = Math.min(100, Math.round((solvedDsaCount / 30) * 100));

    // 3. Project Evidence (Weight: 20%)
    // Benchmark: 2-3 detailed projects with tech stack
    const projectsCount = profile?.projects.length || 0;
    const projectScore = Math.min(100, Math.round((projectsCount / 2.5) * 100));

    // 4. Interview Performance (Weight: 15%)
    // Benchmark: Average score of completed interviews
    let interviewScore = 0;
    if (interviews.length > 0) {
      interviewScore = Math.round(interviews.reduce((sum, i) => sum + i.overallScore, 0) / interviews.length);
    } else {
      interviewScore = 40; // baseline provisional if no interview taken yet
    }

    // 5. Resume Completeness (Weight: 10%)
    const resumeScore = latestResume?.completenessScore || 40;

    // Weighted Overall Score
    const overallScore = Math.round(
      (skillScore * 0.35) +
      (dsaScore * 0.20) +
      (projectScore * 0.20) +
      (interviewScore * 0.15) +
      (resumeScore * 0.10)
    );

    const breakdown = [
      { component: 'Skill Coverage', weightPct: 35, score: skillScore, contribution: Math.round(skillScore * 0.35), detail: `${verifiedSkillsCount}/10 core skills demonstrated` },
      { component: 'DSA Problem Solving', weightPct: 20, score: dsaScore, contribution: Math.round(dsaScore * 0.20), detail: `${solvedDsaCount} solved problems tracked` },
      { component: 'Project Portfolio', weightPct: 20, score: projectScore, contribution: Math.round(projectScore * 0.20), detail: `${projectsCount} engineering projects documented` },
      { component: 'Mock Interview Performance', weightPct: 15, score: interviewScore, contribution: Math.round(interviewScore * 0.15), detail: interviews.length > 0 ? `${interviews.length} sessions completed (avg ${interviewScore}%)` : 'Provisional score (no sessions completed)' },
      { component: 'Resume Completeness', weightPct: 10, score: resumeScore, contribution: Math.round(resumeScore * 0.10), detail: latestResume ? `Resume analysis score: ${resumeScore}%` : 'Provisional baseline (no resume uploaded)' },
    ];

    res.json({
      success: true,
      readinessScore: overallScore,
      targetRole: profile?.targetRole || 'Full Stack Developer',
      breakdown,
      isProvisional: !latestResume || interviews.length === 0,
      nextRecommendedAction: solvedDsaCount < 10
        ? 'Log and practice 5 more DSA problems to boost problem-solving readiness.'
        : interviews.length === 0
        ? 'Complete a mock technical interview to validate concept articulation.'
        : 'Review your personalized career roadmap to master remaining missing skills.',
    });
  } catch (error) {
    console.error('Readiness error:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate career readiness.' });
  }
});

// Career Digital Twin (Multi-dimensional pillar representation)
router.get('/digital-twin', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const profile = await Profile.findOne({ userId });
    const dsaProblems = await prisma.dSAProblem.findMany({ where: { userId } });
    const interviews = await InterviewSession.find({ userId, status: 'Completed' });

    const userSkills = profile?.skills || [];
    const getSkillsInCat = (catName: string) => userSkills.filter(s => s.category.toLowerCase().includes(catName.toLowerCase()));

    // Pillar 1: Frontend Development
    const feSkills = getSkillsInCat('frontend');
    const feScore = Math.min(95, Math.max(30, feSkills.length * 28 + (profile?.projects.length ? 15 : 0)));

    // Pillar 2: Backend Development
    const beSkills = getSkillsInCat('backend');
    const beScore = Math.min(95, Math.max(25, beSkills.length * 25 + (profile?.projects.length ? 15 : 0)));

    // Pillar 3: Databases & Persistence
    const dbSkills = getSkillsInCat('database');
    const dbScore = Math.min(95, Math.max(20, dbSkills.length * 30));

    // Pillar 4: Data Structures & Algorithms
    const solvedDsa = dsaProblems.filter(p => p.status === 'Solved').length;
    const dsaScore = Math.min(95, Math.max(20, Math.round((solvedDsa / 25) * 80)));

    // Pillar 5: System Design & Architecture
    const sysDesignScore = interviews.some(i => i.interviewType === 'system_design') ? 70 : 45;

    // Pillar 6: Cloud & DevOps
    const devopsSkills = getSkillsInCat('cloud') || getSkillsInCat('devops');
    const devopsScore = Math.min(90, Math.max(20, devopsSkills.length * 25));

    // Pillar 7: Core Programming Languages
    const langSkills = getSkillsInCat('language');
    const langScore = Math.min(95, Math.max(35, langSkills.length * 22));

    const pillars = [
      { pillar: 'Frontend', score: feScore, skills: feSkills.map(s => s.name), evidence: 'Projects & Profile', confidence: 'High' },
      { pillar: 'Backend', score: beScore, skills: beSkills.map(s => s.name), evidence: 'Projects & REST APIs', confidence: 'High' },
      { pillar: 'Databases', score: dbScore, skills: dbSkills.map(s => s.name), evidence: 'Relational & Document models', confidence: 'Medium' },
      { pillar: 'DSA & Problem Solving', score: dsaScore, skills: [`${solvedDsa} Solved Problems`], evidence: 'DSA Tracker logs', confidence: solvedDsa > 5 ? 'High' : 'Low' },
      { pillar: 'System Design', score: sysDesignScore, skills: ['Scalability', 'Microservices'], evidence: 'Interview assessment', confidence: 'Medium' },
      { pillar: 'Cloud & DevOps', score: devopsScore, skills: devopsSkills.map(s => s.name), evidence: 'Containers & Git', confidence: 'Medium' },
      { pillar: 'Languages', score: langScore, skills: langSkills.map(s => s.name), evidence: 'Code artifacts', confidence: 'High' },
    ];

    res.json({
      success: true,
      digitalTwin: {
        targetRole: profile?.targetRole || 'Full Stack Developer',
        overallCompetencyScore: Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length),
        pillars,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Digital twin error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate digital twin.' });
  }
});

// Activity Timeline
router.get('/activity', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const activities = await ActivityEvent.find({ userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch activity timeline.' });
  }
});

export default router;

