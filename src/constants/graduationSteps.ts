import { GraduationStep } from "../types";

/**
 * 10 Steps to Graduate from the Mentorship Program
 * These steps track the mentee's progress through the program
 */
export const GRADUATION_STEPS: GraduationStep[] = [
  {
    id: "step_1",
    title: "Complete Initial Contact with Mentor",
    description: "Successfully complete initial meeting and establish communication with assigned mentor",
    order: 1,
  },
  {
    id: "step_2",
    title: "Establish Clear Goals",
    description: "Work with mentor to define specific, measurable goals for the mentorship period",
    order: 2,
  },
  {
    id: "step_3",
    title: "Attend Weekly Check-ins",
    description: "Maintain regular weekly communication with mentor for at least 4 consecutive weeks",
    order: 3,
  },
  {
    id: "step_4",
    title: "Complete Job Readiness Training",
    description: "Participate in job readiness workshops or training sessions",
    order: 4,
  },
  {
    id: "step_5",
    title: "Develop Resume and Cover Letter",
    description: "Create professional resume and cover letter with mentor guidance",
    order: 5,
  },
  {
    id: "step_6",
    title: "Complete Job Applications",
    description: "Submit at least 5 job applications or pursue employment opportunities",
    order: 6,
  },
  {
    id: "step_7",
    title: "Establish Stable Housing",
    description: "Secure and maintain stable housing arrangement",
    order: 7,
  },
  {
    id: "step_8",
    title: "Build Support Network",
    description: "Establish connections with community resources and support systems",
    order: 8,
  },
  {
    id: "step_9",
    title: "Demonstrate Progress Toward Goals",
    description: "Show measurable progress on established goals over 3+ months",
    order: 9,
  },
  {
    id: "step_10",
    title: "Complete Final Evaluation",
    description: "Successfully complete final evaluation with mentor and program administrator",
    order: 10,
  },
];

/**
 * Get graduation step by ID
 */
export function getGraduationStepById(stepId: string): GraduationStep | undefined {
  return GRADUATION_STEPS.find((step) => step.id === stepId);
}

/**
 * Calculate graduation progress percentage
 */
export function calculateGraduationProgress(completedSteps: string[]): number {
  if (completedSteps.length === 0) return 0;
  return Math.round((completedSteps.length / GRADUATION_STEPS.length) * 100);
}

/**
 * Check if all graduation steps are completed
 */
export function isReadyForGraduation(completedSteps: string[]): boolean {
  return completedSteps.length === GRADUATION_STEPS.length;
}
