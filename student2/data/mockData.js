/**
 * ORBIT Core Mock Data Layer
 * 
 * NOTE: All data herein represents simulated demo state.
 * Observations, confidence metrics, and detected patterns are demo placeholders
 * designed for Module 1 frontend demonstration prior to backend API integration.
 */

export const mockUser = {
  id: 1,
  name: "Bhuvan",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ORBIT",
  streak: 7,
  level: "Adaptive Phase 2",
  role: "Software Engineer & Learner"
};

export const mockTasks = [
  {
    id: 1,
    title: "Review graph basics",
    completed: true,
    difficulty: "medium",
    estimatedMinutes: 25,
    category: "Learning"
  },
  {
    id: 2,
    title: "Solve 5 BFS problems",
    completed: true,
    difficulty: "high",
    estimatedMinutes: 40,
    category: "Practice"
  },
  {
    id: 3,
    title: "Complete DFS problems",
    completed: false,
    difficulty: "high",
    estimatedMinutes: 45,
    category: "Practice"
  },
  {
    id: 4,
    title: "Review mistakes & edge cases",
    completed: false,
    difficulty: "low",
    estimatedMinutes: 20,
    category: "Review"
  },
  {
    id: 5,
    title: "Take mock test",
    completed: false,
    difficulty: "high",
    estimatedMinutes: 50,
    category: "Assessment"
  }
];

export const mockFocus = {
  current: 82,
  maxScore: 100,
  change: 8, // +8% from recent average
  status: "Trending Upward",
  activeFocusItem: {
    title: "DAA — Graph Algorithms",
    progress: 72,
    estimatedTimeMinutes: 42,
    difficulty: "High"
  }
};

export const mockWeeklyProductivity = [
  { day: "Mon", focus: 65, tasksCompleted: 4, productiveMinutes: 180 },
  { day: "Tue", focus: 72, tasksCompleted: 5, productiveMinutes: 210 },
  { day: "Wed", focus: 68, tasksCompleted: 3, productiveMinutes: 160 },
  { day: "Thu", focus: 74, tasksCompleted: 6, productiveMinutes: 240 },
  { day: "Fri", focus: 79, tasksCompleted: 5, productiveMinutes: 220 },
  { day: "Sat", focus: 76, tasksCompleted: 4, productiveMinutes: 190 },
  { day: "Sun", focus: 82, tasksCompleted: 3, productiveMinutes: 195 }
];

export const mockGoal = {
  title: "Become proficient in DAA",
  progress: 78,
  completedMilestones: 4,
  totalMilestones: 5,
  nextMilestone: "Complete graph algorithms",
  targetDate: "2026-09-15"
};

export const mockRecovery = {
  state: "Good",
  lastBreakMinutesAgo: 18,
  recommendedDuration: 6,
  fatigueLevel: "Low",
  recommendation: "6 min recovery session suggested after current focus block."
};

export const mockInsights = [
  {
    id: 1,
    title: "Morning focus window optimization",
    description: "You tend to maintain higher focus during shorter morning sessions.",
    confidence: 78,
    evidenceCount: 12,
    type: "Observation",
    isDemoData: true
  },
  {
    id: 2,
    title: "Recovery break cadence effect",
    description: "6-minute recovery breaks following 45-minute focus cycles reduced recorded fatigue metrics.",
    confidence: 84,
    evidenceCount: 18,
    type: "Observation",
    isDemoData: true
  }
];

export const mockMemories = {
  live: [
    { id: "L-1", text: "Active Focus: DAA Graph Algorithms", timestamp: "10 min ago", category: "Active Session" },
    { id: "L-2", text: "Completed BFS practice set (5/5)", timestamp: "42 min ago", category: "Task Telemetry" },
    { id: "L-3", text: "Telemetry recorded: High focus state maintained", timestamp: "1 hour ago", category: "Observation" }
  ],
  trusted: [
    { id: "T-1", text: "45-minute focus blocks yield highest completion rate", confidence: "High (84%)", validated: true },
    { id: "T-2", text: "Retrieval practice method optimal for algorithm retention", confidence: "Medium-High (78%)", validated: true },
    { id: "T-3", text: "Short recovery walks restore focus index by +12%", confidence: "High (82%)", validated: true }
  ],
  evidence: [
    { id: "E-1", sessionDate: "2026-08-21", duration: "43 min", focusScore: 84, outcome: "Completed DFS graph problems" },
    { id: "E-2", sessionDate: "2026-08-20", duration: "45 min", focusScore: 79, outcome: "Completed Binary Search practice" },
    { id: "E-3", sessionDate: "2026-08-19", duration: "50 min", focusScore: 72, outcome: "Dynamic Programming review" },
    { id: "E-4", sessionDate: "2026-08-18", duration: "40 min", focusScore: 88, outcome: "Graph Representation & Adjacency Lists" }
  ]
};

export const mockProtocol = {
  focusCycle: "45 + 6 min",
  bestStudyTime: "10 AM – 1 PM",
  preferredMethod: "Retrieval Practice",
  recovery: "Music + Walking",
  status: "Active Protocol (v1.2)"
};

export const mockPetState = {
  name: "ORBIT Companion",
  defaultExpression: "happy",
  contextualMessages: {
    highFocus: "You're in a strong focus window.",
    inRhythm: "You're in a good rhythm today.",
    decliningFocus: "Your focus usually dips around this point.",
    recoveryRecommended: "You may benefit from a short recovery.",
    celebrating: "Outstanding session! Evidence recorded."
  }
};
