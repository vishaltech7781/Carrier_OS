import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial CareerOS MySQL data...');

  // 1. Seed Skills
  const initialSkills = [
    { name: 'JavaScript', category: 'Programming Languages', aliases: JSON.stringify(['js', 'es6', 'vanilla js']), targetProficiency: 85 },
    { name: 'TypeScript', category: 'Programming Languages', aliases: JSON.stringify(['ts']), targetProficiency: 80 },
    { name: 'Python', category: 'Programming Languages', aliases: JSON.stringify(['python3', 'py']), targetProficiency: 80 },
    { name: 'C++', category: 'Programming Languages', aliases: JSON.stringify(['cpp', 'c plus plus']), targetProficiency: 75 },
    { name: 'SQL', category: 'Programming Languages', aliases: JSON.stringify(['structured query language']), targetProficiency: 85 },
    { name: 'React', category: 'Frontend Development', aliases: JSON.stringify(['reactjs', 'react.js']), targetProficiency: 85 },
    { name: 'Tailwind CSS', category: 'Frontend Development', aliases: JSON.stringify(['tailwind', 'tailwindcss']), targetProficiency: 80 },
    { name: 'Node.js', category: 'Backend Development', aliases: JSON.stringify(['nodejs', 'node']), targetProficiency: 80 },
    { name: 'Express', category: 'Backend Development', aliases: JSON.stringify(['expressjs', 'express.js']), targetProficiency: 80 },
    { name: 'MongoDB', category: 'Databases', aliases: JSON.stringify(['mongo', 'mongoose']), targetProficiency: 80 },
    { name: 'MySQL', category: 'Databases', aliases: JSON.stringify(['mariadb', 'relational db']), targetProficiency: 80 },
    { name: 'Redis', category: 'Databases', aliases: JSON.stringify(['redis cache']), targetProficiency: 70 },
    { name: 'Docker', category: 'Cloud & DevOps', aliases: JSON.stringify(['docker containers', 'dockerfile']), targetProficiency: 75 },
    { name: 'Git', category: 'Cloud & DevOps', aliases: JSON.stringify(['github', 'version control']), targetProficiency: 85 },
    { name: 'DSA', category: 'Computer Science Fundamentals', aliases: JSON.stringify(['data structures', 'algorithms']), targetProficiency: 80 },
    { name: 'System Design', category: 'Computer Science Fundamentals', aliases: JSON.stringify(['distributed systems', 'hld', 'lld']), targetProficiency: 70 },
  ];

  for (const s of initialSkills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: s,
      create: s,
    });
  }

  // 2. Seed Roles
  const roles = [
    {
      name: 'Full Stack Developer',
      description: 'Engineers complete client and server architectures, RESTful APIs, relational/document persistence, and automated workflows.',
      requiredSkills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Git']),
      preferredSkills: JSON.stringify(['Docker', 'Redis', 'Tailwind CSS', 'DSA', 'Unit Testing', 'System Design']),
    },
    {
      name: 'Frontend Engineer',
      description: 'Specializes in responsive user interfaces, accessible design systems, performance optimization, and client state.',
      requiredSkills: JSON.stringify(['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Tailwind CSS', 'Git']),
      preferredSkills: JSON.stringify(['Next.js', 'Redux', 'Unit Testing', 'GraphQL']),
    },
    {
      name: 'Backend Engineer',
      description: 'Builds high-throughput microservices, robust API gateways, database schemas, and distributed caching systems.',
      requiredSkills: JSON.stringify(['Node.js', 'Python', 'SQL', 'MongoDB', 'Express', 'Git']),
      preferredSkills: JSON.stringify(['Docker', 'Redis', 'System Design', 'DSA', 'CI/CD']),
    },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: r,
      create: r,
    });
  }

  // 3. Seed Curated Starter Jobs
  const curatedJobs = [
    {
      id: 'job-seed-1',
      title: 'Junior Full Stack Engineer',
      company: 'Veloce Systems',
      location: 'Remote / Bengaluru',
      workMode: 'Remote',
      experienceLevel: 'Fresher / 0-2 yrs',
      description: 'Looking for a passionate junior full-stack engineer to build scalable web applications. You will write clean TypeScript, design React components, develop Express API routes, and query MongoDB & MySQL databases.',
      requiredSkills: JSON.stringify(['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Git']),
      preferredSkills: JSON.stringify(['Docker', 'SQL', 'Tailwind CSS']),
      sourceUrl: 'https://careeros.ai/jobs/veloce-fullstack',
      isDemoData: true,
    },
    {
      id: 'job-seed-2',
      title: 'Backend Software Engineer',
      company: 'Aether Cloud Platform',
      location: 'Pune / Hybrid',
      workMode: 'Hybrid',
      experienceLevel: '0-2 yrs',
      description: 'Join our core infrastructure team building high-performance APIs and microservices. Responsibilities include database optimization, caching layers with Redis, and containerized deployments with Docker.',
      requiredSkills: JSON.stringify(['Node.js', 'SQL', 'Docker', 'Redis', 'Git']),
      preferredSkills: JSON.stringify(['Python', 'System Design', 'TypeScript']),
      sourceUrl: 'https://careeros.ai/jobs/aether-backend',
      isDemoData: true,
    },
    {
      id: 'job-seed-3',
      title: 'Frontend React Developer',
      company: 'Nexus Studio',
      location: 'Remote',
      workMode: 'Remote',
      experienceLevel: 'Fresher / 1-2 yrs',
      description: 'Craft beautiful, accessible, and responsive user experiences. You will collaborate closely with UI/UX designers, implement reusable component libraries in React, and consume RESTful endpoints.',
      requiredSkills: JSON.stringify(['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'Git']),
      preferredSkills: JSON.stringify(['Next.js', 'Unit Testing', 'Node.js']),
      sourceUrl: 'https://careeros.ai/jobs/nexus-frontend',
      isDemoData: true,
    },
  ];

  for (const j of curatedJobs) {
    await prisma.job.upsert({
      where: { id: j.id },
      update: j,
      create: j,
    });
  }

  // 4. Seed Learning Resources
  const resources = [
    {
      title: 'The TypeScript Handbook (Official)',
      skill: 'TypeScript',
      resourceType: 'Docs',
      difficulty: 'Beginner',
      estimatedDuration: '6 hours',
      provider: 'TypeScript Team',
      url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      isFree: true,
    },
    {
      title: 'React.dev: Modern State, Hooks & Architecture',
      skill: 'React',
      resourceType: 'Docs',
      difficulty: 'Intermediate',
      estimatedDuration: '10 hours',
      provider: 'React Core Team',
      url: 'https://react.dev/learn',
      isFree: true,
    },
    {
      title: 'Node.js Asynchronous Architecture & Event Loop Deep Dive',
      skill: 'Node.js',
      resourceType: 'Docs',
      difficulty: 'Intermediate',
      estimatedDuration: '4 hours',
      provider: 'Node.js Foundation',
      url: 'https://nodejs.org/en/learn',
      isFree: true,
    },
    {
      title: 'NeetCode 150 - Core Algorithm Patterns',
      skill: 'DSA',
      resourceType: 'Practice',
      difficulty: 'Intermediate',
      estimatedDuration: '40 hours',
      provider: 'NeetCode',
      url: 'https://neetcode.io/practice',
      isFree: true,
    },
    {
      title: 'Docker Getting Started & Multi-Stage Builds',
      skill: 'Docker',
      resourceType: 'Tutorial',
      difficulty: 'Beginner',
      estimatedDuration: '5 hours',
      provider: 'Docker Docs',
      url: 'https://docs.docker.com/get-started/',
      isFree: true,
    },
    {
      title: 'SQLZoo Interactive Relational Query Mastery',
      skill: 'SQL',
      resourceType: 'Practice',
      difficulty: 'Beginner',
      estimatedDuration: '8 hours',
      provider: 'SQLZoo',
      url: 'https://sqlzoo.net/',
      isFree: true,
    },
  ];

  for (const r of resources) {
    const existing = await prisma.learningResource.findFirst({ where: { title: r.title } });
    if (!existing) {
      await prisma.learningResource.create({ data: r });
    }
  }

  console.log('✔ Seed completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

