export type IntakeFormFieldType =
  | "text"
  | "date"
  | "radio"
  | "select"
  | "textarea";

export interface IntakeFormField {
  id: string;
  label: string;
  type: IntakeFormFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For radio/select fields
  enabled: boolean;
  order: number;
}

export interface IntakeFormConfig {
  id: string;
  title: string;
  description: string;
  fields: IntakeFormField[];
  updatedAt: string;
}

// Default form configuration - using a static timestamp to prevent infinite loops
export const defaultIntakeFormConfig: IntakeFormConfig = {
  id: "intake_form_config",
  title: "Participant Intake Form",
  description: "Please complete all fields to begin your journey with us",
  fields: [
    {
      id: "participantNumber",
      label: "Participant Number",
      type: "text",
      required: true,
      placeholder: "Enter your participant number",
      enabled: true,
      order: 1,
    },
    {
      id: "firstName",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "First name",
      enabled: true,
      order: 2,
    },
    {
      id: "lastName",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Last name",
      enabled: true,
      order: 3,
    },
    {
      id: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      required: true,
      enabled: true,
      order: 4,
    },
    {
      id: "gender",
      label: "Gender",
      type: "radio",
      required: true,
      options: ["Male", "Female", "Other"],
      enabled: true,
      order: 5,
    },
    {
      id: "phoneNumber",
      label: "Phone Number (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter phone number",
      enabled: true,
      order: 6,
    },
    {
      id: "email",
      label: "Email Address (Optional)",
      type: "text",
      required: false,
      placeholder: "Enter email address",
      enabled: true,
      order: 7,
    },
    {
      id: "releaseDate",
      label: "Release Date",
      type: "date",
      required: true,
      enabled: true,
      order: 8,
    },
    {
      id: "releasedFrom",
      label: "Facility Released From",
      type: "select",
      required: true,
      options: ["Pam Lychner", "Huntsville", "Plane", "Hawaii", "Other"],
      enabled: true,
      order: 9,
    },
  ],
  updatedAt: "2025-01-01T00:00:00.000Z",
};
