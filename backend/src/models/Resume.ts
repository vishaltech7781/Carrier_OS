import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  userId: string;
  filename: string;
  rawText: string;
  candidateName?: string;
  email?: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  education: Array<{ institution?: string; degree?: string; year?: string }>;
  experience: Array<{ company?: string; role?: string; highlights?: string[] }>;
  projects: Array<{ title: string; description: string; technologies: string[] }>;
  skills: Array<{ name: string; category: string; confidence: number; evidenceSnippet?: string }>;
  skillsByCategory: Record<string, string[]>;
  completenessScore: number;
  strengths: string[];
  improvementRecommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    rawText: { type: String, required: true },
    candidateName: { type: String },
    email: { type: String },
    phone: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    education: [{ type: Schema.Types.Mixed }],
    experience: [{ type: Schema.Types.Mixed }],
    projects: [{ type: Schema.Types.Mixed }],
    skills: [{ type: Schema.Types.Mixed }],
    skillsByCategory: { type: Schema.Types.Mixed, default: {} },
    completenessScore: { type: Number, default: 0 },
    strengths: [{ type: String }],
    improvementRecommendations: [{ type: String }],
  },
  { timestamps: true }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);

