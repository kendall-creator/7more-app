import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FormQuestion {
  id: string;
  label: string;
  type: "text" | "dropdown" | "checkbox" | "radio" | "textarea";
  required: boolean;
  options?: string[]; // For dropdown/radio questions
  placeholder?: string;
  order: number;
  formType: "initial_contact" | "bridge_followup" | "weekly_update" | "monthly_checkin";
}

interface FormConfigState {
  questions: FormQuestion[];
  addQuestion: (question: FormQuestion) => void;
  updateQuestion: (questionId: string, updates: Partial<FormQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  getQuestionsByFormType: (formType: FormQuestion["formType"]) => FormQuestion[];
  reorderQuestion: (questionId: string, newOrder: number) => void;
}

// Default initial contact form questions
const defaultInitialContactQuestions: FormQuestion[] = [
  {
    id: "q_continue_reaching_out",
    label: "Are you alright with me continuing to reach out and check up on you?",
    type: "radio",
    required: true,
    options: ["Yes", "No"],
    order: 1,
    formType: "initial_contact",
  },
  {
    id: "q_living_situation",
    label: "Living Situation",
    type: "radio",
    required: true,
    options: ["Stable", "Needs Assistance"],
    order: 2,
    formType: "initial_contact",
  },
  {
    id: "q_living_situation_stable",
    label: "Current Living Arrangement",
    type: "radio",
    required: true,
    options: [
      "Living on Own",
      "Living with Friend or Family Member",
      "Staying at Transition House",
    ],
    order: 3,
    formType: "initial_contact",
  },
  {
    id: "q_living_situation_needs_assistance",
    label: "Assistance Needed",
    type: "radio",
    required: true,
    options: [
      "Needs to Move to Transitional Home",
      "Currently on Couch",
      "Staying in High Stress Environment",
    ],
    order: 4,
    formType: "initial_contact",
  },
  {
    id: "q_employment_status",
    label: "Employment Status",
    type: "radio",
    required: true,
    options: ["Employed", "Needs Employment", "Other"],
    order: 5,
    formType: "initial_contact",
  },
  {
    id: "q_clothing_needs",
    label: "Clothing Needs",
    type: "radio",
    required: true,
    options: ["In Need of Clothing", "No Need for Clothing"],
    order: 6,
    formType: "initial_contact",
  },
  {
    id: "q_open_invitation",
    label: "Open Invitation to Call Given",
    type: "checkbox",
    required: false,
    order: 7,
    formType: "initial_contact",
  },
  {
    id: "q_prayer_offered",
    label: "Prayer Offered",
    type: "checkbox",
    required: false,
    order: 8,
    formType: "initial_contact",
  },
  {
    id: "q_additional_notes",
    label: "Additional Notes",
    type: "textarea",
    required: false,
    placeholder: "Any additional observations or notes...",
    order: 9,
    formType: "initial_contact",
  },
];

export const useFormConfigStore = create<FormConfigState>()(
  persist(
    (set, get) => ({
      questions: defaultInitialContactQuestions,

      addQuestion: (question: FormQuestion) => {
        const newQuestions = [...get().questions, question];
        set({ questions: newQuestions });
      },

      updateQuestion: (questionId: string, updates: Partial<FormQuestion>) => {
        const newQuestions = get().questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q
        );
        set({ questions: newQuestions });
      },

      deleteQuestion: (questionId: string) => {
        const newQuestions = get().questions.filter((q) => q.id !== questionId);
        set({ questions: newQuestions });
      },

      getQuestionsByFormType: (formType: FormQuestion["formType"]) => {
        return get()
          .questions.filter((q) => q.formType === formType)
          .sort((a, b) => a.order - b.order);
      },

      reorderQuestion: (questionId: string, newOrder: number) => {
        const questions = get().questions;
        const question = questions.find((q) => q.id === questionId);
        if (!question) return;

        const sameFormQuestions = questions.filter((q) => q.formType === question.formType);
        const otherQuestions = questions.filter((q) => q.formType !== question.formType);

        // Remove the question being moved
        const filtered = sameFormQuestions.filter((q) => q.id !== questionId);

        // Insert at new position
        filtered.splice(newOrder - 1, 0, question);

        // Update order numbers
        const reordered = filtered.map((q, index) => ({
          ...q,
          order: index + 1,
        }));

        set({ questions: [...reordered, ...otherQuestions] });
      },
    }),
    {
      name: "form-config-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
