import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { InterviewSession, IInterviewQuestion } from '../models/InterviewSession';
import { ActivityEvent } from '../models/ActivityEvent';
import { aiClient } from '../services/aiClient';

const router = Router();

// Question Bank by Domain
const QUESTION_BANK: Record<string, Array<{ question: string; idealConcepts: string[] }>> = {
  backend: [
    {
      question: 'Explain how Node.js handles asynchronous I/O with its event loop and libuv thread pool.',
      idealConcepts: ['event loop', 'libuv', 'non-blocking', 'single threaded', 'worker threads', 'callbacks', 'phases'],
    },
    {
      question: 'How do you design a database indexing strategy in MySQL or PostgreSQL, and what are the trade-offs of B-Tree indexes?',
      idealConcepts: ['indexes', 'b-tree', 'query plan', 'write overhead', 'cardinality', 'composite index'],
    },
    {
      question: 'Explain the principles of RESTful API design. What makes an endpoint idempotent?',
      idealConcepts: ['stateless', 'http methods', 'get', 'put', 'delete', 'idempotent', 'resource naming', 'status codes'],
    },
  ],
  frontend: [
    {
      question: 'How does React\'s Virtual DOM and Reconciliation algorithm work? When should you use React.memo or useMemo?',
      idealConcepts: ['virtual dom', 'reconciliation', 'fiber', 'diffing', 'render cycle', 'memoization', 'props'],
    },
    {
      question: 'Explain the difference between Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG).',
      idealConcepts: ['hydration', 'first contentful paint', 'seo', 'server rendering', 'build time', 'latency'],
    },
    {
      question: 'How do you manage complex asynchronous state and prevent race conditions in React applications?',
      idealConcepts: ['cleanup function', 'useeffect', 'abortcontroller', 'race condition', 'redux', 'caching'],
    },
  ],
  system_design: [
    {
      question: 'How would you design a scalable URL shortener service (like TinyURL) capable of handling 10,000 requests per second?',
      idealConcepts: ['base62', 'hashing', 'redis cache', 'database sharding', 'rate limiting', 'load balancer', 'collision resolution'],
    },
    {
      question: 'Explain the CAP Theorem and how you would choose between Consistency and Availability in a distributed payments system.',
      idealConcepts: ['cap theorem', 'consistency', 'availability', 'partition tolerance', 'two-phase commit', 'eventual consistency'],
    },
  ],
  dsa: [
    {
      question: 'How would you detect a cycle in a linked list and find the cycle entry node? What are the time and space complexities?',
      idealConcepts: ['floyd cycle finding', 'slow and fast pointers', 'o(n) time', 'o(1) space', 'head meeting point'],
    },
    {
      question: 'Explain how you approach Dynamic Programming problems using Memoization (Top-down) vs Tabulation (Bottom-up).',
      idealConcepts: ['overlapping subproblems', 'optimal substructure', 'memoization', 'tabulation', 'space optimization'],
    },
  ],
  behavioral: [
    {
      question: 'Describe a challenging technical bug or architectural bottleneck you encountered in a project, and how you diagnosed and resolved it.',
      idealConcepts: ['situation', 'task', 'action', 'result', 'root cause analysis', 'debugging tools', 'prevention'],
    },
  ],
};

// Start a New Mock Interview Session
router.post('/start', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { role, interviewType, difficulty, questionCount } = req.body;

    const domain = (interviewType || 'backend').toLowerCase();
    const availableQuestions = QUESTION_BANK[domain] || QUESTION_BANK['backend'];
    const count = Math.min(availableQuestions.length, Math.max(1, Number(questionCount) || 3));

    const selectedQuestions: IInterviewQuestion[] = availableQuestions.slice(0, count).map((q, idx) => ({
      questionNumber: idx + 1,
      question: q.question,
      idealConcepts: q.idealConcepts,
    }));

    const session = await InterviewSession.create({
      userId,
      role: role || 'Full Stack Developer',
      interviewType: domain,
      difficulty: difficulty || 'Intermediate',
      totalQuestions: count,
      questions: selectedQuestions,
      overallScore: 0,
      status: 'In Progress',
    });

    res.status(201).json({
      success: true,
      message: 'Interview session created.',
      session: {
        id: session._id,
        role: session.role,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        totalQuestions: session.totalQuestions,
        currentQuestionNumber: 1,
        question: selectedQuestions[0],
      },
    });
  } catch (error) {
    console.error('Interview start error:', error);
    res.status(500).json({ success: false, message: 'Failed to initiate mock interview session.' });
  }
});

// Submit Answer for Current Question
router.post('/:sessionId/answer', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { questionNumber, answer } = req.body;

    if (!answer || !answer.trim()) {
      res.status(400).json({ success: false, message: 'Please submit a non-empty response.' });
      return;
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found.' });
      return;
    }

    const qIndex = session.questions.findIndex(q => q.questionNumber === Number(questionNumber));
    if (qIndex === -1) {
      res.status(400).json({ success: false, message: 'Invalid question number for this session.' });
      return;
    }

    const targetQuestion = session.questions[qIndex];

    // Evaluate answer via AI service
    const evalResult = await aiClient.evaluateInterview({
      role: session.role,
      interview_type: session.interviewType,
      question: targetQuestion.question,
      student_answer: answer,
      ideal_concepts: targetQuestion.idealConcepts || [],
      difficulty: session.difficulty,
    });

    const evaluated = evalResult.data;

    // Update Question Record
    targetQuestion.studentAnswer = answer;
    targetQuestion.score = evaluated.overall_score;
    targetQuestion.technicalAccuracy = evaluated.technical_accuracy;
    targetQuestion.completeness = evaluated.completeness;
    targetQuestion.clarity = evaluated.communication_clarity;
    targetQuestion.feedback = evaluated.recommended_model_answer_outline;
    targetQuestion.positivePoints = evaluated.positive_observations;
    targetQuestion.missingConcepts = evaluated.missing_key_concepts;
    targetQuestion.improvements = evaluated.suggested_improvements;
    targetQuestion.answeredAt = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Answer evaluated.',
      evaluation: {
        questionNumber,
        score: evaluated.overall_score,
        technicalAccuracy: evaluated.technical_accuracy,
        completeness: evaluated.completeness,
        clarity: evaluated.communication_clarity,
        positivePoints: evaluated.positive_observations,
        missingConcepts: evaluated.missing_key_concepts,
        improvements: evaluated.suggested_improvements,
        modelAnswerOutline: evaluated.recommended_model_answer_outline,
        evaluationMethod: evaluated.evaluation_method,
      },
    });
  } catch (error) {
    console.error('Answer submission error:', error);
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

// Finish Interview Session and Generate Report
router.post('/:sessionId/finish', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }

    const answered = session.questions.filter(q => q.score !== undefined);
    const avgScore = answered.length > 0 ? Math.round(answered.reduce((sum, q) => sum + (q.score || 0), 0) / answered.length) : 0;

    session.overallScore = avgScore;
    session.status = 'Completed';
    session.completedAt = new Date();

    const observations = [];
    if (avgScore >= 75) {
      observations.push('Candidate demonstrates strong conceptual grounding and articulate explanation of core architectural patterns.');
    } else if (avgScore >= 50) {
      observations.push('Satisfactory baseline knowledge. Needs deeper elaboration on trade-offs and real-world system constraints.');
    } else {
      observations.push('Significant foundational gaps identified. Recommend comprehensive review of core domain concepts.');
    }
    session.summaryObservations = observations;

    await session.save();

    // Log Activity
    await ActivityEvent.create({
      userId,
      eventType: 'interview_finished',
      title: 'Mock Interview Completed',
      description: `Completed ${session.interviewType.toUpperCase()} interview (${session.difficulty}). Final Score: ${avgScore}/100.`,
    });

    res.json({
      success: true,
      message: 'Interview session completed.',
      session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete interview session.' });
  }
});

// Get Session History
router.get('/history', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch interview history.' });
  }
});

// Get Session by ID
router.get('/:sessionId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found.' });
      return;
    }
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load session details.' });
  }
});

export default router;

