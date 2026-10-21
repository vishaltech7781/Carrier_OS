import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { Resume } from '../models/Resume';
import { Profile } from '../models/Profile';
import { User } from '../models/User';
import { ActivityEvent } from '../models/ActivityEvent';
import { aiClient } from '../services/aiClient';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.txt') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and plain text (.txt) files are supported.'));
    }
  },
});

// Parse Plain Text Resume
router.post('/parse-text', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { rawText, syncToProfile } = req.body;

    if (!rawText || !rawText.trim()) {
      res.status(400).json({ success: false, message: 'Please provide non-empty resume text.' });
      return;
    }

    const aiResult = await aiClient.parseResumeText(rawText);
    const parsedData = aiResult.data;

    // Save resume record to MongoDB
    const resumeDoc = await Resume.create({
      userId,
      filename: 'Manual_Text_Resume.txt',
      rawText,
      candidateName: parsedData.candidate_name,
      email: parsedData.email,
      phone: parsedData.phone,
      githubUrl: parsedData.github_url,
      linkedinUrl: parsedData.linkedin_url,
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      skills: parsedData.skills || [],
      skillsByCategory: parsedData.skills_by_category || {},
      completenessScore: parsedData.completeness_score || 0,
      strengths: parsedData.strengths || [],
      improvementRecommendations: parsedData.improvement_recommendations || [],
    });

    // Optionally sync extracted skills to student profile
    if (syncToProfile && parsedData.skills && parsedData.skills.length > 0) {
      const profile = await Profile.findOne({ userId });
      if (profile) {
        const existingNames = new Set(profile.skills.map(s => s.name.toLowerCase()));
        for (const s of parsedData.skills) {
          if (!existingNames.has(s.name.toLowerCase())) {
            profile.skills.push({
              name: s.name,
              category: s.category || 'General',
              proficiencyLevel: 'Intermediate',
              isVerified: true,
              evidenceSource: 'Resume',
            });
          }
        }
        await profile.save();
      }
    }

    // Log Activity
    await ActivityEvent.create({
      userId,
      eventType: 'resume_uploaded',
      title: 'Resume Analyzed',
      description: `Analyzed resume with ${parsedData.skills?.length || 0} skills detected. Completeness: ${parsedData.completeness_score}%.`,
    });

    res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      source: aiResult.source,
      resume: resumeDoc,
    });
  } catch (error) {
    console.error('Resume text parse error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Upload and Parse PDF Resume
router.post('/upload', authenticateToken, upload.single('resume'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No resume file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;

    let aiResult;
    try {
      aiResult = await aiClient.parseResumeFile(filePath, originalName);
    } catch (parseErr) {
      // If PDF parsing fails, read file as text fallback
      const textBuffer = fs.readFileSync(filePath);
      const textContent = textBuffer.toString('utf-8');
      aiResult = await aiClient.parseResumeText(textContent, originalName);
    }

    const parsedData = aiResult.data;

    const resumeDoc = await Resume.create({
      userId,
      filename: originalName,
      rawText: parsedData.raw_character_count ? `Extracted ${parsedData.raw_character_count} characters.` : 'PDF binary stream',
      candidateName: parsedData.candidate_name,
      email: parsedData.email,
      phone: parsedData.phone,
      githubUrl: parsedData.github_url,
      linkedinUrl: parsedData.linkedin_url,
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      projects: parsedData.projects || [],
      skills: parsedData.skills || [],
      skillsByCategory: parsedData.skills_by_category || {},
      completenessScore: parsedData.completeness_score || 0,
      strengths: parsedData.strengths || [],
      improvementRecommendations: parsedData.improvement_recommendations || [],
    });

    // Clean up local temp file to save disk space
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // Non-critical
    }

    // Auto-sync verified skills to profile
    if (parsedData.skills && parsedData.skills.length > 0) {
      const profile = await Profile.findOne({ userId });
      if (profile) {
        const existingNames = new Set(profile.skills.map(s => s.name.toLowerCase()));
        for (const s of parsedData.skills) {
          if (!existingNames.has(s.name.toLowerCase())) {
            profile.skills.push({
              name: s.name,
              category: s.category || 'General',
              proficiencyLevel: 'Intermediate',
              isVerified: true,
              evidenceSource: 'Resume',
            });
          }
        }
        await profile.save();
      }
    }

    await ActivityEvent.create({
      userId,
      eventType: 'resume_uploaded',
      title: 'Resume Document Processed',
      description: `Uploaded "${originalName}". Identified ${parsedData.skills?.length || 0} skills and ${parsedData.projects?.length || 0} projects.`,
    });

    res.json({
      success: true,
      message: 'Resume uploaded and analyzed successfully.',
      source: aiResult.source,
      resume: resumeDoc,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Get Resume Analysis History
router.get('/history', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve resume history.' });
  }
});

// Delete Resume Record (Privacy control)
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const resumeId = req.params.id;

    const deleted = await Resume.findOneAndDelete({ _id: resumeId, userId });
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Resume record not found or access denied.' });
      return;
    }

    res.json({ success: true, message: 'Resume analysis and associated data deleted permanently.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete resume.' });
  }
});

export default router;

