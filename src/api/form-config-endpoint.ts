/**
 * API Endpoint: Get Current Form Configuration
 *
 * This provides the current participant intake form configuration
 * to power the embeddable web form.
 *
 * USAGE:
 * This is designed to be accessed directly from the React Native app's state.
 * For web deployment, you'll need to:
 * 1. Set up a cloud function (Vercel, Netlify, AWS Lambda, etc.)
 * 2. Store Firebase config in environment variables
 * 3. Use Firebase Admin SDK to read form configuration
 * 4. Return formatted config to the web form
 */

import { defaultIntakeFormConfig } from "../types/intakeForm";
import { useIntakeFormStore } from "../state/intakeFormStore";

/**
 * Get current form configuration from the app's state
 * This is used to generate the initial configuration for deployment
 */
export function getCurrentFormConfiguration() {
  const formConfig = useIntakeFormStore.getState().formConfig;
  return formConfig || defaultIntakeFormConfig;
}

/**
 * Format configuration for web form consumption
 * Filters to only enabled fields and returns in correct order
 */
export function formatFormConfigForWeb(config: typeof defaultIntakeFormConfig) {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    fields: config.fields
      .filter((f) => f.enabled)
      .sort((a, b) => a.order - b.order)
      .map((field) => ({
        id: field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options,
      })),
    updatedAt: config.updatedAt,
  };
}

/**
 * Export configuration as JSON string for deployment
 * This can be used to generate the initial config for serverless functions
 */
export function exportFormConfigAsJSON(): string {
  const config = getCurrentFormConfiguration();
  const webConfig = formatFormConfigForWeb(config);
  return JSON.stringify(webConfig, null, 2);
}
