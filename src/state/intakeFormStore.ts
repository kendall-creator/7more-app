import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IntakeFormConfig, IntakeFormField, defaultIntakeFormConfig } from "../types/intakeForm";
import { ref, set, get as getFirebase } from "firebase/database";
import { database } from "../config/firebase";

interface IntakeFormState {
  formConfig: IntakeFormConfig;
}

interface IntakeFormActions {
  updateFormConfig: (updates: Partial<IntakeFormConfig>) => void;
  updateField: (fieldId: string, updates: Partial<IntakeFormField>) => void;
  toggleFieldEnabled: (fieldId: string) => void;
  updateFieldOptions: (fieldId: string, options: string[]) => void;
  reorderFields: (fieldId: string, newOrder: number) => void;
  addField: (field: Omit<IntakeFormField, "id" | "order">) => void;
  removeField: (fieldId: string) => void;
  resetToDefault: () => void;
  loadFromFirebase: () => Promise<void>;
  syncToFirebase: (config: IntakeFormConfig) => Promise<void>;
}

type IntakeFormStore = IntakeFormState & IntakeFormActions;

// Helper to sync to Firebase
const syncToFirebase = async (config: IntakeFormConfig) => {
  if (!database) {
    console.warn("Firebase not initialized, skipping sync");
    return;
  }

  try {
    const formConfigRef = ref(database, "formConfig/participantIntake");
    await set(formConfigRef, config);
    console.log("✅ Form config synced to Firebase");
  } catch (error) {
    console.error("Failed to sync form config to Firebase:", error);
  }
};

export const useIntakeFormStore = create<IntakeFormStore>()(
  persist(
    (set, get) => ({
      formConfig: defaultIntakeFormConfig,

      updateFormConfig: (updates) => {
        const newConfig = {
          ...get().formConfig,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      updateField: (fieldId, updates) => {
        const newConfig = {
          ...get().formConfig,
          fields: get().formConfig.fields.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
          ),
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      toggleFieldEnabled: (fieldId) => {
        const newConfig = {
          ...get().formConfig,
          fields: get().formConfig.fields.map((field) =>
            field.id === fieldId ? { ...field, enabled: !field.enabled } : field
          ),
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      updateFieldOptions: (fieldId, options) => {
        const newConfig = {
          ...get().formConfig,
          fields: get().formConfig.fields.map((field) =>
            field.id === fieldId ? { ...field, options } : field
          ),
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      reorderFields: (fieldId, newOrder) => {
        const fields = [...get().formConfig.fields];
        const fieldIndex = fields.findIndex((f) => f.id === fieldId);
        if (fieldIndex === -1) return;

        const field = fields[fieldIndex];
        const oldOrder = field.order;

        // Update orders
        const updatedFields = fields.map((f) => {
          if (f.id === fieldId) {
            return { ...f, order: newOrder };
          }
          if (oldOrder < newOrder && f.order > oldOrder && f.order <= newOrder) {
            return { ...f, order: f.order - 1 };
          }
          if (oldOrder > newOrder && f.order >= newOrder && f.order < oldOrder) {
            return { ...f, order: f.order + 1 };
          }
          return f;
        });

        const newConfig = {
          ...get().formConfig,
          fields: updatedFields.sort((a, b) => a.order - b.order),
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      addField: (fieldData) => {
        const maxOrder = Math.max(...get().formConfig.fields.map((f) => f.order), 0);
        const newField: IntakeFormField = {
          ...fieldData,
          id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          order: maxOrder + 1,
        };

        const newConfig = {
          ...get().formConfig,
          fields: [...get().formConfig.fields, newField],
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      removeField: (fieldId) => {
        const fields = get().formConfig.fields.filter((f) => f.id !== fieldId);
        // Reorder remaining fields
        const reorderedFields = fields
          .sort((a, b) => a.order - b.order)
          .map((field, index) => ({ ...field, order: index + 1 }));

        const newConfig = {
          ...get().formConfig,
          fields: reorderedFields,
          updatedAt: new Date().toISOString(),
        };
        set({ formConfig: newConfig });
        syncToFirebase(newConfig);
      },

      resetToDefault: () => {
        set({ formConfig: defaultIntakeFormConfig });
        syncToFirebase(defaultIntakeFormConfig);
      },

      loadFromFirebase: async () => {
        if (!database) {
          console.warn("Firebase not initialized, skipping load");
          return;
        }

        try {
          const formConfigRef = ref(database, "formConfig/participantIntake");
          const snapshot = await getFirebase(formConfigRef);

          if (snapshot.exists()) {
            const config = snapshot.val() as IntakeFormConfig;
            set({ formConfig: config });
            console.log("✅ Form config loaded from Firebase");
          }
        } catch (error) {
          console.error("Failed to load form config from Firebase:", error);
        }
      },

      syncToFirebase: async (config: IntakeFormConfig) => {
        await syncToFirebase(config);
      },
    }),
    {
      name: "intake-form-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2, // Changed from 1 to force a reset and fix infinite loop
      migrate: (persistedState: any, version: number) => {
        // Force reset to default if version doesn't match
        if (version !== 2) {
          return { formConfig: defaultIntakeFormConfig };
        }
        return persistedState as IntakeFormState;
      },
    }
  )
);

// Selectors - return specific parts of state
export const useFormConfig = (): IntakeFormConfig => useIntakeFormStore((s) => s.formConfig);
export const useFormFields = (): IntakeFormField[] => useIntakeFormStore((s) => s.formConfig.fields);
