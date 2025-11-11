import { Participant, BridgeTeamMetrics } from "../types";

/**
 * Calculate Bridge Team metrics for a specific month
 * Auto-generates metrics only for dates >= November 1, 2025
 * Excludes participants where firstName equals "test" (case-insensitive)
 */

const CUTOFF_DATE = new Date("2025-11-01T00:00:00.000Z");

/**
 * Check if a participant should be excluded (test participant)
 */
const isTestParticipant = (participant: Participant): boolean => {
  return participant.firstName?.toLowerCase() === "test";
};

/**
 * Check if a date is within the specified month/year
 */
const isDateInMonth = (dateString: string | undefined, month: number, year: number): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date.getMonth() + 1 === month && date.getFullYear() === year;
};

/**
 * Get the day of week from a date string
 */
const getDayOfWeek = (dateString: string): string => {
  const date = new Date(dateString);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()];
};

/**
 * Calculate days between two dates
 */
const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate Bridge Team metrics for a given month
 */
export const calculateBridgeTeamMetrics = (
  participants: Participant[],
  month: number,
  year: number
): BridgeTeamMetrics | null => {
  // Check if we should auto-calculate for this month
  const targetDate = new Date(year, month - 1, 1);
  if (targetDate < CUTOFF_DATE) {
    // Return null for months before November 2025 - these must be entered manually
    return null;
  }

  // Filter out test participants
  const realParticipants = participants.filter((p) => !isTestParticipant(p));

  // 1. Participants Received - Count of new participant forms submitted during the month
  const participantsReceived = realParticipants.filter((p) =>
    isDateInMonth(p.submittedAt, month, year)
  ).length;

  // 2. Status Activity Counts (flow-based)
  // Count unique participants who entered each status at least once during the month
  const statusCounts = {
    pendingBridge: 0,
    attemptedToContact: 0,
    contacted: 0,
    unableToContact: 0,
  };

  const participantsInStatuses = {
    pendingBridge: new Set<string>(),
    attemptedToContact: new Set<string>(),
    contacted: new Set<string>(),
    unableToContact: new Set<string>(),
  };

  realParticipants.forEach((participant) => {
    if (!participant.history) return;

    participant.history.forEach((entry) => {
      if (!entry.createdAt || !isDateInMonth(entry.createdAt, month, year)) return;

      // Check if this history entry represents a status change
      if (entry.type === "status_change") {
        // Extract status from description like "Status changed to Pending Bridge"
        const description = entry.description || "";

        if (description.includes("Pending Bridge")) {
          participantsInStatuses.pendingBridge.add(participant.id);
        } else if (description.includes("Attempted to Contact")) {
          participantsInStatuses.attemptedToContact.add(participant.id);
        } else if (description.includes("Contacted")) {
          participantsInStatuses.contacted.add(participant.id);
        } else if (description.includes("Unable to Contact")) {
          participantsInStatuses.unableToContact.add(participant.id);
        }
      }
    });
  });

  statusCounts.pendingBridge = participantsInStatuses.pendingBridge.size;
  statusCounts.attemptedToContact = participantsInStatuses.attemptedToContact.size;
  statusCounts.contacted = participantsInStatuses.contacted.size;
  statusCounts.unableToContact = participantsInStatuses.unableToContact.size;

  // 3. Average Days to First Outreach
  // Calculate average days between Bridge assignment and first "Attempted to Contact" or "Contacted"
  let totalDays = 0;
  let countWithOutreach = 0;

  realParticipants.forEach((participant) => {
    if (!participant.movedToBridgeAt || !participant.history) return;

    // Find first outreach attempt in the target month
    const firstOutreach = participant.history
      .filter((entry) => {
        if (!entry.createdAt || !isDateInMonth(entry.createdAt, month, year)) return false;
        if (entry.type !== "status_change") return false;

        const description = entry.description || "";
        return (
          description.includes("Attempted to Contact") || description.includes("Contacted")
        );
      })
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())[0];

    if (firstOutreach && firstOutreach.createdAt) {
      const days = daysBetween(participant.movedToBridgeAt, firstOutreach.createdAt);
      totalDays += days;
      countWithOutreach++;
    }
  });

  const averageDaysToFirstOutreach =
    countWithOutreach > 0 ? Math.round(totalDays / countWithOutreach) : 0;

  // 4. Forms by Day of Week
  const formsByDayOfWeek = {
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0,
  };

  realParticipants.forEach((participant) => {
    if (participant.submittedAt && isDateInMonth(participant.submittedAt, month, year)) {
      const dayOfWeek = getDayOfWeek(participant.submittedAt) as keyof typeof formsByDayOfWeek;
      formsByDayOfWeek[dayOfWeek]++;
    }
  });

  // Find the day with the most forms
  const dayEntries = Object.entries(formsByDayOfWeek);
  const topDayEntry = dayEntries.reduce((max, current) =>
    current[1] > max[1] ? current : max
  );
  const topDay =
    topDayEntry[0].charAt(0).toUpperCase() + topDayEntry[0].slice(1); // Capitalize

  return {
    participantsReceived: {
      autoCalculated: participantsReceived,
      manualOverride: null,
    },
    statusCounts: {
      pendingBridge: {
        autoCalculated: statusCounts.pendingBridge,
        manualOverride: null,
      },
      attemptedToContact: {
        autoCalculated: statusCounts.attemptedToContact,
        manualOverride: null,
      },
      contacted: {
        autoCalculated: statusCounts.contacted,
        manualOverride: null,
      },
      unableToContact: {
        autoCalculated: statusCounts.unableToContact,
        manualOverride: null,
      },
    },
    averageDaysToFirstOutreach: {
      autoCalculated: averageDaysToFirstOutreach,
      manualOverride: null,
    },
    formsByDayOfWeek: {
      ...formsByDayOfWeek,
      topDay,
    },
  };
};

/**
 * Get the final display value for a metric (manual override if present, otherwise auto-calculated)
 */
export const getFinalValue = (metric: {
  autoCalculated: number;
  manualOverride: number | null;
}): number => {
  return metric.manualOverride !== null ? metric.manualOverride : metric.autoCalculated;
};
