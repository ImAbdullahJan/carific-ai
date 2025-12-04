export const siteConfig = {
  name: "Carific.ai",
  tagline: "Career growth, powered by AI",
  description:
    "Carific.ai is a collection of focused AI agents - resume editor, interview coach, daily practice micro-tasks, and career path generator - built to help you make measurable progress. Open-source, privacy-first, and designed to ship fast.",
  logo: "C",
  githubUrl: "https://github.com/",
};

export const navLinks = [
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Roadmap", href: "#roadmap" },
  { label: "Contribute", href: "#contribute" },
];

export const heroContent = {
  title: "Level up your career and land your dream job",
  description:
    "Carific.ai is a collection of focused AI agents - resume editor, interview coach, and career path generator - built to help you land your next role. Open-source, privacy-first, and designed to ship fast.",
  primaryCta: { label: "Get started - it's free", href: "#signup" },
  secondaryCta: { label: "Try a demo", href: "#demo" },
  badge: "Open source • MIT License • Weekly public builds",
  stats: [
    { value: "100+", label: "Resumes processed" },
    { value: "Weekly", label: "Public builds" },
    { value: "Good first issues", label: "Contributor friendly" },
  ],
};

export const demoContent = {
  title: "Resume to Job Match (demo)",
  description:
    "Paste your resume and a job description - get a match score and 3 high-impact edits.",
  resumePlaceholder: "- Senior frontend developer with 4+ years...",
  jobPlaceholder: "- 3+ years React, Next.js experience...",
  exampleResult: {
    score: "72 / 100",
    suggestions: [
      "Replace vague verbs with metrics-driven bullets.",
      "Highlight Next.js and performance work in top bullets.",
      "Add a short projects section linking to GitHub.",
    ],
  },
};

export const featuresContent = {
  title: "Focused agents, real results",
  description:
    "Each agent solves one specific problem - combine them for powerful workflows.",
  items: [
    {
      title: "Resume Editor",
      description: "Match score, concise edits, ATS-friendly suggestions",
      status: "MVP-ready",
    },
    {
      title: "Interview Coach",
      description: "Role-specific questions, feedback, and score rubric",
      status: "MVP-ready",
    },
    {
      title: "Career Path",
      description: "3-12 month learning + project roadmap to a target role",
      status: "MVP-ready",
    },
    {
      title: "Daily Micro-practice",
      description: "Short exercises for communication and habits",
      status: "MVP-ready",
    },
  ],
};

export const howItWorksContent = {
  title: "How it works",
  steps: [
    {
      title: "1. Diagnose",
      description:
        "Quick wizard surfaces your top career challenges and goals.",
    },
    {
      title: "2. Solve",
      description:
        "Run one or more focused agents (resume, interview, micro-practice) that produce concrete action items.",
    },
    {
      title: "3. Track & Repeat",
      description:
        "Follow daily micro-tasks, measure progress, and share anonymized wins to the public feed.",
    },
  ],
};

export const roadmapContent = {
  title: "Roadmap (first 3 months)",
  milestones: [
    {
      version: "v0.1 - MVP",
      description:
        "Auth, profile, diagnostic wizard, resume editor, interview coach, public progress feed.",
    },
    {
      version: "v0.2",
      description:
        "Habit micro-practice, career path generator, basic mentoring flow.",
    },
    {
      version: "v1.0",
      description:
        "Voice mock interviews, integrations, embedding-based personal knowledge, paid tier.",
    },
  ],
};

export const contributeContent = {
  title: "Open source & community",
  description:
    'Everything will live on GitHub. We accept contributions, issues, docs edits, and designer help. New contributors - check the "good first issues" label.',
  buttons: [
    {
      label: "View repo",
      href: "https://github.com/",
      variant: "default" as const,
    },
    { label: "Contributing guide", href: "#", variant: "outline" as const },
    { label: "Roadmap", href: "#roadmap", variant: "outline" as const },
  ],
  info: [
    { title: "Funding", description: "GitHub Sponsors • Open Collective" },
    {
      title: "Community",
      description: "Discord • GitHub Discussions • Monthly sprints",
    },
  ],
};

export const footerContent = {
  tagline: "Open-source career development platform",
  links: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "GitHub", href: "https://github.com/" },
  ],
};
