import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillProfile {
  name: string;
  category: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  isVerified: boolean;
  evidenceSource?: 'Profile' | 'Resume' | 'Assessment' | 'Project';
}

export interface IProjectProfile {
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface IProfile extends Document {
  userId: string;
  fullName: string;
  educationLevel: string;
  degree: string;
  college: string;
  graduationYear: number;
  targetRole: string;
  preferredLocations: string[];
  preferredWorkMode: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  weeklyLearningHours: number;
  skills: ISkillProfile[];
  projects: IProjectProfile[];
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillProfileSchema = new Schema<ISkillProfile>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  proficiencyLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  isVerified: { type: Boolean, default: false },
  evidenceSource: { type: String, default: 'Profile' },
});

const ProjectProfileSchema = new Schema<IProjectProfile>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  liveUrl: { type: String },
  githubUrl: { type: String },
});

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    educationLevel: { type: String, default: 'Undergraduate' },
    degree: { type: String, default: 'B.Tech / B.E. Computer Science' },
    college: { type: String, default: 'Engineering College' },
    graduationYear: { type: Number, default: 2026 },
    targetRole: { type: String, default: 'Full Stack Developer' },
    preferredLocations: [{ type: String }],
    preferredWorkMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site', 'Flexible'], default: 'Remote' },
    weeklyLearningHours: { type: Number, default: 15 },
    skills: [SkillProfileSchema],
    projects: [ProjectProfileSchema],
    bio: { type: String },
    githubUrl: { type: String },
    linkedinUrl: { type: String },
  },
  { timestamps: true }
);

export const Profile = mongoose.model<IProfile>('Profile', ProfileSchema);

