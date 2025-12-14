import React from "react";
import { CheckSquare, Square } from "lucide-react";

interface AddParticipantFormProps {
  formData: any;
  setFormData: (data: any) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  LEGAL_STATUS_OPTIONS: string[];
  RELEASE_LOCATION_OPTIONS: string[];
  REFERRAL_SOURCE_OPTIONS: string[];
  CRITICAL_NEEDS_OPTIONS: string[];
  toggleLegalStatus: (option: string) => void;
  toggleCriticalNeed: (option: string) => void;
}

export default function AddParticipantForm({
  formData,
  setFormData,
  handleFormSubmit,
  LEGAL_STATUS_OPTIONS,
  RELEASE_LOCATION_OPTIONS,
  REFERRAL_SOURCE_OPTIONS,
  CRITICAL_NEEDS_OPTIONS,
  toggleLegalStatus,
  toggleCriticalNeed,
}: AddParticipantFormProps) {
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* TDCJ Number */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          TDCJ Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required={!formData.tdcjNotAvailable}
          disabled={formData.tdcjNotAvailable}
          value={formData.participantNumber}
          onChange={(e) => setFormData({ ...formData, participantNumber: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          placeholder="Enter TDCJ number"
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.tdcjNotAvailable}
            onChange={(e) => setFormData({ ...formData, tdcjNotAvailable: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-secondary">TDCJ number not currently available</span>
        </label>
      </div>

      {/* First and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Last name"
          />
        </div>
      </div>

      {/* Nickname */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Nickname <span className="text-secondary text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter nickname"
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required={!formData.dobNotAvailable}
          disabled={formData.dobNotAvailable}
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          placeholder="MM/DD/YYYY"
        />
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.dobNotAvailable}
            onChange={(e) => setFormData({ ...formData, dobNotAvailable: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm text-secondary">Birthdate not currently available</span>
        </label>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: "Male" })}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors font-medium ${
              formData.gender === "Male"
                ? "bg-primary text-white border-primary"
                : "border-border text-text hover:bg-gray-50"
            }`}
          >
            Male
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, gender: "Female" })}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors font-medium ${
              formData.gender === "Female"
                ? "bg-primary text-white border-primary"
                : "border-border text-text hover:bg-gray-50"
            }`}
          >
            Female
          </button>
        </div>
      </div>

      {/* Phone and Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="email@example.com"
          />
        </div>
      </div>
      <p className="text-sm text-secondary -mt-2">
        * At least one contact method (phone or email) is required
      </p>

      {/* Address */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Full Address <span className="text-secondary text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Street address, City, State, ZIP"
        />
      </div>

      {/* Release Date */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Release Date <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.releaseDate}
          onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="MM/DD/YYYY"
        />
      </div>

      {/* Released From */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Released From <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={formData.releasedFrom}
          onChange={(e) => setFormData({ ...formData, releasedFrom: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select facility</option>
          {RELEASE_LOCATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {formData.releasedFrom === "Other" && (
          <input
            type="text"
            required
            value={formData.otherReleaseLocation}
            onChange={(e) => setFormData({ ...formData, otherReleaseLocation: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-2"
            placeholder="Specify release location"
          />
        )}
      </div>

      {/* Legal Status */}
      <div>
        <label className="block text-sm font-semibold text-text mb-3">
          Legal Status <span className="text-secondary text-xs">(Select all that apply)</span>
        </label>
        <div className="space-y-2">
          {LEGAL_STATUS_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                {formData.legalStatus.includes(option) ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-secondary" />
                )}
              </div>
              <span className="text-sm text-text">{option}</span>
              <input
                type="checkbox"
                checked={formData.legalStatus.includes(option)}
                onChange={() => toggleLegalStatus(option)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Referral Source */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          How did the participant hear about 7more? <span className="text-secondary text-xs">(Optional)</span>
        </label>
        <select
          value={formData.referralSource}
          onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select option</option>
          {REFERRAL_SOURCE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {formData.referralSource === "Other" && (
          <input
            type="text"
            required
            value={formData.otherReferralSource}
            onChange={(e) => setFormData({ ...formData, otherReferralSource: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mt-2"
            placeholder="Specify how they heard about 7more"
          />
        )}
      </div>

      {/* Critical Needs */}
      <div>
        <label className="block text-sm font-semibold text-text mb-3">
          Critical Needs <span className="text-secondary text-xs">(Select all that apply)</span>
        </label>
        <div className="space-y-2">
          {CRITICAL_NEEDS_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                {formData.criticalNeeds.includes(option) ? (
                  <CheckSquare className="w-5 h-5 text-primary" />
                ) : (
                  <Square className="w-5 h-5 text-secondary" />
                )}
              </div>
              <span className="text-sm text-text">{option}</span>
              <input
                type="checkbox"
                checked={formData.criticalNeeds.includes(option)}
                onChange={() => toggleCriticalNeed(option)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-3 font-semibold transition-colors"
        >
          Add Participant
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
