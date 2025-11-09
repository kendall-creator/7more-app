import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IntakeFormConfig, IntakeFormField, defaultIntakeFormConfig } from "../types/intakeForm";

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
}

type IntakeFormStore = IntakeFormState & IntakeFormActions;

export const useIntakeFormStore = create<IntakeFormStore>()(
  persist(
    (set, get) => ({
      formConfig: defaultIntakeFormConfig,

      updateFormConfig: (updates) => {
        set((state) => ({
          formConfig: {
            ...state.formConfig,
            ...updates,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      updateField: (fieldId, updates) => {
        set((state) => ({
          formConfig: {
            ...state.formConfig,
            fields: state.formConfig.fields.map((field) =>
              field.id === fieldId ? { ...field, ...updates } : field
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      toggleFieldEnabled: (fieldId) => {
        set((state) => ({
          formConfig: {
            ...state.formConfig,
            fields: state.formConfig.fields.map((field) =>
              field.id === fieldId ? { ...field, enabled: !field.enabled } : field
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      updateFieldOptions: (fieldId, options) => {
        set((state) => ({
          formConfig: {
            ...state.formConfig,
            fields: state.formConfig.fields.map((field) =>
              field.id === fieldId ? { ...field, options } : field
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      reorderFields: (fieldId, newOrder) => {
        set((state) => {
          const fields = [...state.formConfig.fields];
          const fieldIndex = fields.findIndex((f) => f.id === fieldId);
          if (fieldIndex === -1) return state;

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

          return {
            formConfig: {
              ...state.formConfig,
              fields: updatedFields.sort((a, b) => a.order - b.order),
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addField: (fieldData) => {
        set((state) => {
          const maxOrder = Math.max(...state.formConfig.fields.map((f) => f.order), 0);
          const newField: IntakeFormField = {
            ...fieldData,
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            order: maxOrder + 1,
          };

          return {
            formConfig: {
              ...state.formConfig,
              fields: [...state.formConfig.fields, newField],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeField: (fieldId) => {
        set((state) => {
          const fields = state.formConfig.fields.filter((f) => f.id !== fieldId);
          // Reorder remaining fields
          const reorderedFields = fields
            .sort((a, b) => a.order - b.order)
            .map((field, index) => ({ ...field, order: index + 1 }));

          return {
            formConfig: {
              ...state.formConfig,
              fields: reorderedFields,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      resetToDefault: () => {
        set({ formConfig: defaultIntakeFormConfig });
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
