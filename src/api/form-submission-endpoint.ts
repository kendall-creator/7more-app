/**
 * API Endpoint: Submit Participant Form
 *
 * This receives participant form submissions from the embeddable web form
 * and saves them to Firebase using the same logic as the in-app form.
 *
 * USAGE:
 * This is designed to work with Firebase directly from the React Native app.
 * For web deployment via serverless functions, you'll need to:
 * 1. Set up Firebase Admin SDK in your cloud function
 * 2. Use environment variables for Firebase credentials
 * 3. Call this submission logic from your serverless function
 */

import { database } from "../config/firebase";
import { ref, set as firebaseSet } from "firebase/database";
import { Participant, ParticipantStatus } from "../types";

/**
 * Calculate age from date of birth
 */
function calculateAge(dobString: string): number {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Calculate days since release (time out)
 */
function calculateTimeOut(releaseDateString: string): number {
  const release = new Date(releaseDateString);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - release.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Validate required fields
 */
function validateFormData(formData: any, requiredFields: string[]): string | null {
  for (const fieldId of requiredFields) {
    if (!formData[fieldId] || formData[fieldId].toString().trim() === "") {
      return `Missing required field: ${fieldId}`;
    }
  }

  // Special validation for "Other" option in releasedFrom
  if (formData.releasedFrom === "Other" && !formData.releasedFrom_other?.trim()) {
    return "Please specify the facility name";
  }

  return null;
}

/**
 * Submit participant form data to Firebase
 */
export async function submitParticipantForm(formData: any): Promise<{ success: boolean; error?: string; participantId?: string }> {
  try {
    if (!database) {
      throw new Error("Firebase not configured");
    }

    // Get the actual releasedFrom value (handle "Other" case)
    const releasedFromValue = formData.releasedFrom === "Other"
      ? formData.releasedFrom_other
      : formData.releasedFrom;

    // Calculate age and timeOut
    const age = calculateAge(formData.dateOfBirth);
    const timeOut = calculateTimeOut(formData.releaseDate);

    // Create new participant object matching the exact structure
    const newParticipant: Participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participantNumber: formData.participantNumber || "",
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
      age,
      gender: formData.gender || "",
      phoneNumber: formData.phoneNumber || undefined,
      email: formData.email || undefined,
      releaseDate: new Date(formData.releaseDate).toISOString(),
      timeOut,
      releasedFrom: releasedFromValue || "",
      status: "pending_bridge" as ParticipantStatus,
      submittedAt: new Date().toISOString(),
      movedToBridgeAt: new Date().toISOString(),
      completedGraduationSteps: [],
      notes: [],
      history: [
        {
          id: `history_${Date.now()}`,
          type: "form_submitted",
          description: "Participant submitted intake form (web)",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    // Save to Firebase
    const participantRef = ref(database, `participants/${newParticipant.id}`);
    await firebaseSet(participantRef, newParticipant);

    return {
      success: true,
      participantId: newParticipant.id,
    };
  } catch (error: any) {
    console.error("Error submitting participant form:", error);
    return {
      success: false,
      error: error.message || "Failed to submit form",
    };
  }
}

/**
 * HTTP Handler for form submission endpoint
 * Example: POST /api/submit-participant
 */
export async function handleFormSubmission(req: any, res: any) {
  try {
    const formData = req.body;

    // Basic validation
    if (!formData) {
      return res.status(400).json({
        success: false,
        error: "No form data provided",
      });
    }

    // Submit to Firebase
    const result = await submitParticipantForm(formData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Thank you! Your information has been received. Our Bridge Team will contact you soon.",
        participantId: result.participantId,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error("Error in form submission endpoint:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process form submission",
    });
  }
}
