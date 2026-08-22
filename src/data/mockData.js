/**
 * ORBIT Data Model Initializers
 * Production Clean State - Zero Mock Data
 */

export const mockUser = null;
export const mockTasks = [];
export const mockFocus = { current: 0, maxScore: 100, change: 0, status: "No Data", activeFocusItem: null };
export const mockWeeklyProductivity = [];
export const mockGoal = null;
export const mockRecovery = null;
export const mockInsights = [];
export const mockMemories = { live: [], trusted: [], evidence: [] };
export const mockProtocol = null;
export const mockPetState = {
  name: "ORBIT Companion",
  defaultExpression: "idle",
  contextualMessages: {
    highFocus: "You're in a strong focus window.",
    inRhythm: "Ready to focus on your next objective.",
    decliningFocus: "Your focus usually dips around this point.",
    recoveryRecommended: "You may benefit from a short recovery.",
    celebrating: "Outstanding session! Progress recorded."
  }
};
