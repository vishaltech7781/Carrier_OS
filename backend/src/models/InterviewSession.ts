import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion {
  questionNumber: number;
  question: string;
  idealConcepts: string[];
  studentAnswer?: string;
  score?: number;
  technicalAccuracy?: number;
  completeness?: number;
  clarity?: number;
  feedback?: string;
  positivePoints?: string[];
  missingConcepts?: string[];
  improvements?: string[];
  answeredAt?: Date;
}

export interface IInterviewSession extends Document {
  userId: string;
  role: string;
  interviewType: string;
  difficulty: string;
  totalQuestions: number;
  questions: IInterviewQuestion[];
  overallScore: number;
  status: 'In Progress' | 'Completed' | 'Abandoned';
  summaryObservations: string[];
  evaluationMethod: string;
  createdAt: Date;
  completedAt?: Date;
}

const InterviewQuestionSchema = new Schema<IInterviewQuestion>({
  questionNumber: { type: Number, required: true },
  question: { type: String, required: true },
  idealConcepts: [{ type: String }],
  studentAnswer: { type: String },
  score: { type: Number },
  technicalAccuracy: { type: Number },
  completeness: { type: Number },
  clarity: { type: Number },
  feedback: { type: String },
  positivePoints: [{ type: String }],
  missingConcepts: [{ type: String }],
  improvements: [{ type: String }],
  answeredAt: { type: Date },
});

const InterviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    interviewType: { type: String, required: true },
    difficulty: { type: String, default: 'Intermediate' },
    totalQuestions: { type: Number, default: 3 },
    questions: [InterviewQuestionSchema],
    overallScore: { type: Number, default: 0 },
    status: { type: String, enum: ['In Progress', 'Completed', 'Abandoned'], default: 'In Progress' },
    summaryObservations: [{ type: String }],
    evaluationMethod: { type: String, default: 'Deterministic NLP Concept Grounding' },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export const InterviewSession = mongoose.model<IInterviewSession>('InterviewSession', InterviewSessionSchema);

