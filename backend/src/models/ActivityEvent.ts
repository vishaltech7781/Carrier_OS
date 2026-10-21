import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityEvent extends Document {
  userId: string;
  eventType: 'dsa_solved' | 'roadmap_completed' | 'interview_finished' | 'resume_uploaded' | 'job_analyzed' | 'profile_updated';
  title: string;
  description: string;
  meta?: Record<string, any>;
  createdAt: Date;
}

const ActivityEventSchema = new Schema<IActivityEvent>(
  {
    userId: { type: String, required: true, index: true },
    eventType: {
      type: String,
      required: true,
      enum: ['dsa_solved', 'roadmap_completed', 'interview_finished', 'resume_uploaded', 'job_analyzed', 'profile_updated'],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const ActivityEvent = mongoose.model<IActivityEvent>('ActivityEvent', ActivityEventSchema);

