import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useReportingStore } from "../state/reportingStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber, formatCurrency, formatPercentage } from "../utils/formatNumber";
import { ReportingCategory } from "../types";

type ViewMode = "single" | "range";
type AggregationType = "total" | "average";
type CategoryFilter = "all" | "releasees" | "calls" | "bridge_team" | "mentorship" | "donors" | "financials" | "social_media";

export default function ViewReportingScreen() {
  const navigation = useNavigation<any>();
  const { monthlyReports, getMostRecentPostedReport } = useReportingStore();
  const currentUser = useCurrentUser();

  const isBoardMember = currentUser?.role === "board_member";
  const isAdmin = currentUser?.role === "admin";

  // Check which categories the user can view
  const canViewCategory = (category: ReportingCategory): boolean => {
    // Admins can view everything
    if (isAdmin) return true;

    // If user doesn't have reporting access, they can't view anything
    if (!currentUser?.hasReportingAccess) return false;

    // If user has no specific categories assigned, they can view all
    if (!currentUser?.reportingCategories || currentUser.reportingCategories.length === 0) {
      return true;
    }

    // Otherwise, check if category is in their allowed list
    return currentUser.reportingCategories.includes(category);
  };

  // Filter reports based on user role - board members only see posted reports
  const availableReports = useMemo(() => {
    if (isBoardMember) {
      return monthlyReports.filter(r => r.isPosted);
    }
    return monthlyReports;
  }, [monthlyReports, isBoardMember]);

  // Filter states
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [aggregationType, setAggregationType] = useState<AggregationType>("total");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  // Default to most recent posted month for board members, current month for others
  const getDefaultMonth = () => {
    if (isBoardMember) {
      const mostRecent = getMostRecentPostedReport();
      return mostRecent ? mostRecent.month : new Date().getMonth() + 1;
    }
    return new Date().getMonth() + 1;
  };

  const getDefaultYear = () => {
    if (isBoardMember) {
      const mostRecent = getMostRecentPostedReport();
      return mostRecent ? mostRecent.year : new Date().getFullYear();
    }
    return new Date().getFullYear();
  };

  // Single month selection - default to most recent posted for board members
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
  const [selectedYear, setSelectedYear] = useState(getDefaultYear());

  // Date range selection
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  // Modals
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get reports in date range
  const reportsInRange = useMemo(() => {
    if (viewMode === "single") {
      return availableReports.filter(r => r.month === selectedMonth && r.year === selectedYear);
    } else {
      const startDate = new Date(startYear, startMonth - 1);
      const endDate = new Date(endYear, endMonth - 1);

      return availableReports
        .filter(r => {
          const reportDate = new Date(r.year, r.month - 1);
          return reportDate >= startDate && reportDate <= endDate;
        })
        .sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });
    }
  }, [viewMode, selectedMonth, selectedYear, startMonth, startYear, endMonth, endYear, availableReports]);

  // Get previous month report for comparison
  const getPreviousMonthReport = (month: number, year: number) => {
    let prevMonth = month - 1;
    let prevYear = year;

    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    return availableReports.find(r => r.month === prevMonth && r.year === prevYear);
  };

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    if (reportsInRange.length === 0) return null;

    const isDivisor = aggregationType === "average";
    const divisor = isDivisor ? reportsInRange.length : 1;

    // Releasees Met
    const totalReleasees = reportsInRange.reduce((sum, r) => {
      if (!r.releaseFacilityCounts) return sum;
      return sum + Object.values(r.releaseFacilityCounts).reduce((a, b) => a + b, 0);
    }, 0) / divisor;

    const pamLychner = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.pamLychner || 0), 0) / divisor;
    const huntsville = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.huntsville || 0), 0) / divisor;
    const planeStateJail = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.planeStateJail || 0), 0) / divisor;
    const havinsUnit = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.havinsUnit || 0), 0) / divisor;
    const clemensUnit = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.clemensUnit || 0), 0) / divisor;
    const other = reportsInRange.reduce((sum, r) => sum + (r.releaseFacilityCounts?.other || 0), 0) / divisor;

    // Calls
    const inbound = reportsInRange.reduce((sum, r) => sum + (r.callMetrics?.inbound || 0), 0) / divisor;
    const outbound = reportsInRange.reduce((sum, r) => sum + (r.callMetrics?.outbound || 0), 0) / divisor;
    const missedCallsPercent = reportsInRange.reduce((sum, r) => sum + (r.callMetrics?.missedCallsPercent || 0), 0) / divisor;

    // Mentorship
    const participantsAssignedToMentorship = reportsInRange.reduce((sum, r) =>
      sum + (r.mentorshipMetrics?.participantsAssignedToMentorship || 0), 0) / divisor;

    // Bridge Team
    const participantsReceived = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.participantsReceived?.autoCalculated || 0), 0) / divisor;
    const pendingBridge = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.pendingBridge?.autoCalculated || 0), 0) / divisor;
    const attemptedToContact = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.attemptedToContact?.autoCalculated || 0), 0) / divisor;
    const contacted = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.contacted?.autoCalculated || 0), 0) / divisor;
    const unableToContact = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.unableToContact?.autoCalculated || 0), 0) / divisor;
    const averageDaysToFirstOutreach = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.averageDaysToFirstOutreach?.autoCalculated || 0), 0) / divisor;

    // Donors
    const newDonors = reportsInRange.reduce((sum, r) => sum + (r.donorData?.newDonors || 0), 0) / divisor;
    const amountFromNewDonors = reportsInRange.reduce((sum, r) => sum + (r.donorData?.amountFromNewDonors || 0), 0) / divisor;
    const checks = reportsInRange.reduce((sum, r) => sum + (r.donorData?.checks || 0), 0) / divisor;
    const totalFromChecks = reportsInRange.reduce((sum, r) => sum + (r.donorData?.totalFromChecks || 0), 0) / divisor;

    // Financials - special handling for average
    let beginningBalance = 0;
    let endingBalance = 0;

    if (isDivisor) {
      // For average, use first beginning and last ending
      beginningBalance = reportsInRange[0]?.financialData?.beginningBalance || 0;
      endingBalance = reportsInRange[reportsInRange.length - 1]?.financialData?.endingBalance || 0;
    } else {
      // For total, sum them
      beginningBalance = reportsInRange.reduce((sum, r) => sum + (r.financialData?.beginningBalance || 0), 0);
      endingBalance = reportsInRange.reduce((sum, r) => sum + (r.financialData?.endingBalance || 0), 0);
    }

    // Social Media Metrics
    const reelsPostViews = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.reelsPostViews || 0), 0) / divisor;
    const viewsFromNonFollowers = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.viewsFromNonFollowers || 0), 0) / divisor;

    // For followers, use the latest month's value (not averaged)
    const followers = reportsInRange[reportsInRange.length - 1]?.socialMediaMetrics?.followers || 0;

    // Followers gained - sum across all months
    const followersGained = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.followersGained || 0), 0) / divisor;

    return {
      releasees: {
        total: totalReleasees,
        pamLychner,
        huntsville,
        planeStateJail,
        havinsUnit,
        clemensUnit,
        other,
      },
      calls: {
        inbound,
        outbound,
        missedCallsPercent,
      },
      mentorship: {
        participantsAssignedToMentorship,
      },
      bridgeTeam: {
        participantsReceived,
        pendingBridge,
        attemptedToContact,
        contacted,
        unableToContact,
        averageDaysToFirstOutreach,
      },
      donors: {
        newDonors,
        amountFromNewDonors,
        checks,
        totalFromChecks,
      },
      financials: {
        beginningBalance,
        endingBalance,
        difference: endingBalance - beginningBalance,
      },
      socialMedia: {
        reelsPostViews,
        viewsFromNonFollowers,
        followers,
        followersGained,
      },
    };
  }, [reportsInRange, aggregationType]);

  // Calculate comparison (up/down from previous period)
  const getComparison = (currentValue: number, field: string, report: any) => {
    const prevReport = getPreviousMonthReport(report.month, report.year);
    if (!prevReport) return null;

    let prevValue = 0;

    // Navigate nested structure based on field
    if (field.startsWith("releaseFacilityCounts.")) {
      const facilityField = field.split(".")[1] as keyof typeof prevReport.releaseFacilityCounts;
      prevValue = prevReport.releaseFacilityCounts?.[facilityField] || 0;
    } else if (field.startsWith("callMetrics.")) {
      const callField = field.split(".")[1] as keyof typeof prevReport.callMetrics;
      prevValue = prevReport.callMetrics?.[callField] || 0;
    } else if (field.startsWith("mentorshipMetrics.")) {
      const mentorField = field.split(".")[1] as keyof typeof prevReport.mentorshipMetrics;
      prevValue = prevReport.mentorshipMetrics?.[mentorField] || 0;
    } else if (field.startsWith("donorData.")) {
      const donorField = field.split(".")[1] as keyof typeof prevReport.donorData;
      prevValue = prevReport.donorData?.[donorField] || 0;
    } else if (field.startsWith("financialData.")) {
      const finField = field.split(".")[1] as keyof typeof prevReport.financialData;
      prevValue = prevReport.financialData?.[finField] || 0;
    } else if (field.startsWith("socialMediaMetrics.")) {
      const socialField = field.split(".")[1] as keyof typeof prevReport.socialMediaMetrics;
      prevValue = prevReport.socialMediaMetrics?.[socialField] || 0;
    }

    const diff = currentValue - prevValue;
    const percentChange = prevValue !== 0 ? (diff / prevValue) * 100 : 0;

    return {
      diff,
      percentChange,
      isUp: diff > 0,
      isDown: diff < 0,
    };
  };

  const ComparisonIndicator = ({ value, field, report }: { value: number; field: string; report: any }) => {
    const comparison = getComparison(value, field, report);
    if (!comparison || (comparison.diff === 0)) return null;

    // For missed calls, reverse the color logic (lower is better)
    const isMissedCallsMetric = field === "callMetrics.missedCallsPercent";
    const isGood = isMissedCallsMetric ? comparison.isDown : comparison.isUp;
    const isBad = isMissedCallsMetric ? comparison.isUp : comparison.isDown;

    return (
      <View className={`flex-row items-center ml-2 px-2 py-1 rounded ${isGood ? "bg-green-100" : "bg-red-100"}`}>
        <Ionicons
          name={comparison.isUp ? "arrow-up" : "arrow-down"}
          size={12}
          color={isGood ? "#16a34a" : "#dc2626"}
        />
        <Text className={`text-xs font-semibold ml-1 ${isGood ? "text-green-700" : "text-red-700"}`}>
          {formatNumber(Math.abs(comparison.diff))} ({formatNumber(Math.abs(comparison.percentChange), 1)}%)
        </Text>
      </View>
    );
  };

  const renderMetricRow = (label: string, value: number, field: string, report: any, isCurrency = false, isPercentage = false) => (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
      <Text className="text-gray-700 flex-1">{label}</Text>
      <View className="flex-row items-center">
        <Text className="text-gray-900 font-semibold">
          {isCurrency ? formatCurrency(value) : isPercentage ? formatPercentage(value) : formatNumber(value)}
        </Text>
        {viewMode === "single" && <ComparisonIndicator value={value} field={field} report={report} />}
      </View>
    </View>
  );

  const renderSingleMonthView = () => {
    const report = reportsInRange[0];
    if (!report) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="document-text-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4">No report available for this month</Text>
        </View>
      );
    }

    const totalReleasees = report.releaseFacilityCounts
      ? Object.values(report.releaseFacilityCounts).reduce((a, b) => a + b, 0)
      : 0;

    return (
      <ScrollView className="flex-1">
        {/* Releasees Met */}
        {canViewCategory("release_facilities") && (categoryFilter === "all" || categoryFilter === "releasees") && report.releaseFacilityCounts && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Releasees Met</Text>
            {renderMetricRow("Total", totalReleasees, "releaseFacilityCounts.total", report)}
            {renderMetricRow("Pam Lychner", report.releaseFacilityCounts.pamLychner ?? 0, "releaseFacilityCounts.pamLychner", report)}
            {renderMetricRow("Huntsville", report.releaseFacilityCounts.huntsville ?? 0, "releaseFacilityCounts.huntsville", report)}
            {renderMetricRow("Plane State Jail", report.releaseFacilityCounts.planeStateJail ?? 0, "releaseFacilityCounts.planeStateJail", report)}
            {renderMetricRow("Havins Unit", report.releaseFacilityCounts.havinsUnit ?? 0, "releaseFacilityCounts.havinsUnit", report)}
            {renderMetricRow("Clemens Unit", report.releaseFacilityCounts.clemensUnit ?? 0, "releaseFacilityCounts.clemensUnit", report)}
            {renderMetricRow("Other", report.releaseFacilityCounts.other ?? 0, "releaseFacilityCounts.other", report)}
          </View>
        )}

        {/* Calls */}
        {canViewCategory("calls") && (categoryFilter === "all" || categoryFilter === "calls") && report.callMetrics && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Calls</Text>
            {renderMetricRow("Inbound", report.callMetrics.inbound ?? 0, "callMetrics.inbound", report)}
            {renderMetricRow("Outbound", report.callMetrics.outbound ?? 0, "callMetrics.outbound", report)}
            {renderMetricRow("Missed Calls %", report.callMetrics.missedCallsPercent ?? 0, "callMetrics.missedCallsPercent", report, false, true)}
          </View>
        )}

        {/* Bridge Team */}
        {canViewCategory("bridge_team") && (categoryFilter === "all" || categoryFilter === "bridge_team") && report.bridgeTeamMetrics?.participantsReceived && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Bridge Team</Text>
            {renderMetricRow("Participants Received", report.bridgeTeamMetrics.participantsReceived.manualOverride ?? report.bridgeTeamMetrics.participantsReceived.autoCalculated, "bridgeTeamMetrics.participantsReceived.autoCalculated", report)}

            <Text className="text-sm font-semibold text-gray-700 mt-3 mb-2">Status Activity:</Text>
            <View className="pl-4">
              {renderMetricRow("Pending Bridge", report.bridgeTeamMetrics.statusCounts?.pendingBridge?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.pendingBridge?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.pendingBridge.autoCalculated", report)}
              {renderMetricRow("Attempted to Contact", report.bridgeTeamMetrics.statusCounts?.attemptedToContact?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.attemptedToContact?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.attemptedToContact.autoCalculated", report)}
              {renderMetricRow("Contacted", report.bridgeTeamMetrics.statusCounts?.contacted?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.contacted?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.contacted.autoCalculated", report)}
              {renderMetricRow("Unable to Contact", report.bridgeTeamMetrics.statusCounts?.unableToContact?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.unableToContact?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.unableToContact.autoCalculated", report)}
            </View>

            <View className="flex-row justify-between items-center py-2 border-b border-gray-100 mt-2">
              <Text className="text-gray-700 flex-1">Avg Days to First Outreach</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-semibold">
                  {formatNumber(report.bridgeTeamMetrics.averageDaysToFirstOutreach?.manualOverride ?? report.bridgeTeamMetrics.averageDaysToFirstOutreach?.autoCalculated ?? 0)} days
                </Text>
                {viewMode === "single" && <ComparisonIndicator value={report.bridgeTeamMetrics.averageDaysToFirstOutreach?.manualOverride ?? report.bridgeTeamMetrics.averageDaysToFirstOutreach?.autoCalculated ?? 0} field="bridgeTeamMetrics.averageDaysToFirstOutreach.autoCalculated" report={report} />}
              </View>
            </View>
          </View>
        )}

        {/* Mentorship */}
        {canViewCategory("mentorship") && (categoryFilter === "all" || categoryFilter === "mentorship") && report.mentorshipMetrics && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Mentorship</Text>
            {renderMetricRow("Participants Assigned", report.mentorshipMetrics.participantsAssignedToMentorship, "mentorshipMetrics.participantsAssignedToMentorship", report)}
          </View>
        )}

        {/* Donors */}
        {canViewCategory("donors") && (categoryFilter === "all" || categoryFilter === "donors") && report.donorData && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Donors</Text>
            {renderMetricRow("New Donors", report.donorData.newDonors ?? 0, "donorData.newDonors", report)}
            {renderMetricRow("Amount from New Donors", report.donorData.amountFromNewDonors ?? 0, "donorData.amountFromNewDonors", report, true)}
            {renderMetricRow("Checks", report.donorData.checks ?? 0, "donorData.checks", report)}
            {renderMetricRow("Total from Checks", report.donorData.totalFromChecks ?? 0, "donorData.totalFromChecks", report, true)}
          </View>
        )}

        {/* Financials */}
        {canViewCategory("financials") && (categoryFilter === "all" || categoryFilter === "financials") && report.financialData && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Financials</Text>
            {renderMetricRow("Beginning Balance", report.financialData.beginningBalance ?? 0, "financialData.beginningBalance", report, true)}
            {renderMetricRow("Ending Balance", report.financialData.endingBalance ?? 0, "financialData.endingBalance", report, true)}
            <View className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mt-2">
              <Text className="text-gray-700 mb-1">Difference</Text>
              <Text className="text-2xl font-bold text-indigo-900">
                {formatCurrency((report.financialData.endingBalance ?? 0) - (report.financialData.beginningBalance ?? 0))}
              </Text>
            </View>
          </View>
        )}

        {/* Social Media */}
        {canViewCategory("social_media") && (categoryFilter === "all" || categoryFilter === "social_media") && report.socialMediaMetrics && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Social Media</Text>
            {renderMetricRow("Reels/Post Views", report.socialMediaMetrics.reelsPostViews ?? 0, "socialMediaMetrics.reelsPostViews", report)}
            {renderMetricRow("Views from Non-Followers", report.socialMediaMetrics.viewsFromNonFollowers ?? 0, "socialMediaMetrics.viewsFromNonFollowers", report, false, true)}
            {renderMetricRow("Total Followers", report.socialMediaMetrics.followers ?? 0, "socialMediaMetrics.followers", report)}
            <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
              <Text className="text-gray-700 flex-1">Followers Gained</Text>
              <View className="flex-row items-center">
                <Text className={`font-semibold ${(report.socialMediaMetrics.followersGained ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(report.socialMediaMetrics.followersGained ?? 0) >= 0 ? "+" : ""}{formatNumber(report.socialMediaMetrics.followersGained ?? 0)}
                </Text>
                {viewMode === "single" && <ComparisonIndicator value={report.socialMediaMetrics.followersGained ?? 0} field="socialMediaMetrics.followersGained" report={report} />}
              </View>
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    );
  };

  const renderRangeView = () => {
    if (!aggregatedMetrics) {
      return (
        <View className="flex-1 items-center justify-center p-8">
          <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-500 text-center mt-4">No reports available in this range</Text>
        </View>
      );
    }

    return (
      <ScrollView className="flex-1">
        {/* Summary Header */}
        <View className="bg-indigo-600 p-4 mx-4 mt-4 rounded-lg mb-4">
          <Text className="text-white text-sm font-semibold">
            {aggregationType === "total" ? "Total" : "Average"} for {reportsInRange.length} month{reportsInRange.length !== 1 ? "s" : ""}
          </Text>
          <Text className="text-indigo-100 text-xs mt-1">
            {months[startMonth - 1]} {startYear} - {months[endMonth - 1]} {endYear}
          </Text>
        </View>

        {/* Releasees Met */}
        {(categoryFilter === "all" || categoryFilter === "releasees") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Releasees Met</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Total</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.total)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Pam Lychner</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.pamLychner)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Huntsville</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.huntsville)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Plane State Jail</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.planeStateJail)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Havins Unit</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.havinsUnit)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Clemens Unit</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.clemensUnit)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-700">Other</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.other)}</Text>
            </View>
          </View>
        )}

        {/* Calls */}
        {(categoryFilter === "all" || categoryFilter === "calls") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Calls</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Inbound</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.calls.inbound)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Outbound</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.calls.outbound)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-700">Missed Calls %</Text>
              <Text className="text-gray-900 font-semibold">{formatPercentage(aggregatedMetrics.calls.missedCallsPercent)}</Text>
            </View>
          </View>
        )}

        {/* Bridge Team */}
        {(categoryFilter === "all" || categoryFilter === "bridge_team") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Bridge Team</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Participants Received</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.bridgeTeam.participantsReceived)}</Text>
            </View>

            <Text className="text-sm font-semibold text-gray-700 mt-3 mb-2">Status Activity:</Text>
            <View className="pl-4">
              <View className="flex-row justify-between py-1 border-b border-gray-100">
                <Text className="text-gray-600">Pending Bridge</Text>
                <Text className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.pendingBridge)}</Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-100">
                <Text className="text-gray-600">Attempted to Contact</Text>
                <Text className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.attemptedToContact)}</Text>
              </View>
              <View className="flex-row justify-between py-1 border-b border-gray-100">
                <Text className="text-gray-600">Contacted</Text>
                <Text className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.contacted)}</Text>
              </View>
              <View className="flex-row justify-between py-1">
                <Text className="text-gray-600">Unable to Contact</Text>
                <Text className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.unableToContact)}</Text>
              </View>
            </View>

            <View className="flex-row justify-between py-2 border-t border-gray-100 mt-2">
              <Text className="text-gray-700">Avg Days to First Outreach</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.bridgeTeam.averageDaysToFirstOutreach)} days</Text>
            </View>
          </View>
        )}

        {/* Mentorship */}
        {(categoryFilter === "all" || categoryFilter === "mentorship") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Mentorship</Text>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-700">Participants Assigned</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.mentorship.participantsAssignedToMentorship)}</Text>
            </View>
          </View>
        )}

        {/* Donors */}
        {(categoryFilter === "all" || categoryFilter === "donors") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Donors</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">New Donors</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.donors.newDonors)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Amount from New Donors</Text>
              <Text className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.donors.amountFromNewDonors)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Checks</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.donors.checks)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-700">Total from Checks</Text>
              <Text className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.donors.totalFromChecks)}</Text>
            </View>
          </View>
        )}

        {/* Financials */}
        {(categoryFilter === "all" || categoryFilter === "financials") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Financials</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Beginning Balance</Text>
              <Text className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.financials.beginningBalance)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Ending Balance</Text>
              <Text className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.financials.endingBalance)}</Text>
            </View>
            <View className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mt-2">
              <Text className="text-gray-700 mb-1">Difference</Text>
              <Text className="text-2xl font-bold text-indigo-900">
                {formatCurrency(aggregatedMetrics.financials.difference)}
              </Text>
            </View>
          </View>
        )}

        {/* Social Media */}
        {(categoryFilter === "all" || categoryFilter === "social_media") && (
          <View className="bg-white rounded-lg p-4 mb-4 mx-4 border border-gray-200">
            <Text className="text-lg font-bold text-gray-900 mb-3">Social Media</Text>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Reels/Post Views</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.socialMedia.reelsPostViews)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Views from Non-Followers</Text>
              <Text className="text-gray-900 font-semibold">{formatPercentage(aggregatedMetrics.socialMedia.viewsFromNonFollowers)}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-gray-100">
              <Text className="text-gray-700">Total Followers</Text>
              <Text className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.socialMedia.followers)}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-gray-700">Followers Gained</Text>
              <Text className={`font-semibold ${aggregatedMetrics.socialMedia.followersGained >= 0 ? "text-green-600" : "text-red-600"}`}>
                {aggregatedMetrics.socialMedia.followersGained >= 0 ? "+" : ""}{formatNumber(aggregatedMetrics.socialMedia.followersGained)}
              </Text>
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 flex-1">View Reports</Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* View Mode Toggle */}
        <View className="flex-row mb-3 bg-gray-100 rounded-lg p-1">
          <Pressable
            className={`flex-1 py-2 rounded-md ${viewMode === "single" ? "bg-white" : ""}`}
            onPress={() => setViewMode("single")}
          >
            <Text className={`text-center font-semibold ${viewMode === "single" ? "text-indigo-600" : "text-gray-600"}`}>
              Single Month
            </Text>
          </Pressable>
          <Pressable
            className={`flex-1 py-2 rounded-md ${viewMode === "range" ? "bg-white" : ""}`}
            onPress={() => setViewMode("range")}
          >
            <Text className={`text-center font-semibold ${viewMode === "range" ? "text-indigo-600" : "text-gray-600"}`}>
              Date Range
            </Text>
          </Pressable>
        </View>

        {/* Date Selector */}
        {viewMode === "single" ? (
          <Pressable
            className="flex-row items-center justify-between bg-gray-50 px-4 py-3 rounded-lg mb-3"
            onPress={() => setShowMonthPicker(true)}
          >
            <Text className="text-base font-semibold text-gray-900">
              {months[selectedMonth - 1]} {selectedYear}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Pressable>
        ) : (
          <Pressable
            className="flex-row items-center justify-between bg-gray-50 px-4 py-3 rounded-lg mb-3"
            onPress={() => setShowRangePicker(true)}
          >
            <Text className="text-base font-semibold text-gray-900">
              {months[startMonth - 1]} {startYear} - {months[endMonth - 1]} {endYear}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Pressable>
        )}

        {/* Aggregation Type (only for range) */}
        {viewMode === "range" && (
          <View className="flex-row mb-3 bg-gray-100 rounded-lg p-1">
            <Pressable
              className={`flex-1 py-2 rounded-md ${aggregationType === "total" ? "bg-white" : ""}`}
              onPress={() => setAggregationType("total")}
            >
              <Text className={`text-center text-sm font-semibold ${aggregationType === "total" ? "text-indigo-600" : "text-gray-600"}`}>
                Total
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-2 rounded-md ${aggregationType === "average" ? "bg-white" : ""}`}
              onPress={() => setAggregationType("average")}
            >
              <Text className={`text-center text-sm font-semibold ${aggregationType === "average" ? "text-indigo-600" : "text-gray-600"}`}>
                Average
              </Text>
            </Pressable>
          </View>
        )}

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {[
            { key: "all", label: "All" },
            { key: "releasees", label: "Releasees" },
            { key: "calls", label: "Calls" },
            { key: "bridge_team", label: "Bridge Team" },
            { key: "mentorship", label: "Mentorship" },
            { key: "donors", label: "Donors" },
            { key: "financials", label: "Financials" },
            { key: "social_media", label: "Social Media" },
          ].map(cat => (
            <Pressable
              key={cat.key}
              className={`px-4 py-2 rounded-lg ${categoryFilter === cat.key ? "bg-indigo-600" : "bg-gray-200"}`}
              onPress={() => setCategoryFilter(cat.key as CategoryFilter)}
            >
              <Text className={`text-sm font-semibold ${categoryFilter === cat.key ? "text-white" : "text-gray-700"}`}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {viewMode === "single" ? renderSingleMonthView() : renderRangeView()}

      {/* Single Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Month & Year</Text>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            {/* Year Selector */}
            <View className="flex-row items-center justify-center mb-4">
              <Pressable
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => setSelectedYear(selectedYear - 1)}
              >
                <Text className="text-gray-900 font-semibold">-</Text>
              </Pressable>
              <Text className="text-2xl font-bold text-gray-900 mx-6">{selectedYear}</Text>
              <Pressable
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => setSelectedYear(selectedYear + 1)}
              >
                <Text className="text-gray-900 font-semibold">+</Text>
              </Pressable>
            </View>

            {/* Month Grid */}
            <View className="flex-row flex-wrap">
              {months.map((month, index) => (
                <Pressable
                  key={month}
                  className={`w-1/3 p-3 ${selectedMonth === index + 1 ? "bg-indigo-600" : "bg-gray-100"} m-1 rounded-lg`}
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text className={`text-center font-semibold ${selectedMonth === index + 1 ? "text-white" : "text-gray-900"}`}>
                    {month.substring(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Range Picker Modal */}
      <Modal
        visible={showRangePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRangePicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-bold text-gray-900">Select Date Range</Text>
              <Pressable onPress={() => setShowRangePicker(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView className="max-h-96">
              {/* Start Date */}
              <Text className="text-lg font-bold text-gray-900 mb-3">Start Date</Text>
              <View className="flex-row items-center justify-center mb-4">
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setStartYear(startYear - 1)}
                >
                  <Text className="text-gray-900 font-semibold">-</Text>
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 mx-6">{startYear}</Text>
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setStartYear(startYear + 1)}
                >
                  <Text className="text-gray-900 font-semibold">+</Text>
                </Pressable>
              </View>

              <View className="flex-row flex-wrap mb-6">
                {months.map((month, index) => (
                  <Pressable
                    key={`start-${month}`}
                    className={`w-1/3 p-3 ${startMonth === index + 1 ? "bg-indigo-600" : "bg-gray-100"} m-1 rounded-lg`}
                    onPress={() => setStartMonth(index + 1)}
                  >
                    <Text className={`text-center font-semibold ${startMonth === index + 1 ? "text-white" : "text-gray-900"}`}>
                      {month.substring(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* End Date */}
              <Text className="text-lg font-bold text-gray-900 mb-3">End Date</Text>
              <View className="flex-row items-center justify-center mb-4">
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setEndYear(endYear - 1)}
                >
                  <Text className="text-gray-900 font-semibold">-</Text>
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 mx-6">{endYear}</Text>
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setEndYear(endYear + 1)}
                >
                  <Text className="text-gray-900 font-semibold">+</Text>
                </Pressable>
              </View>

              <View className="flex-row flex-wrap mb-6">
                {months.map((month, index) => (
                  <Pressable
                    key={`end-${month}`}
                    className={`w-1/3 p-3 ${endMonth === index + 1 ? "bg-indigo-600" : "bg-gray-100"} m-1 rounded-lg`}
                    onPress={() => setEndMonth(index + 1)}
                  >
                    <Text className={`text-center font-semibold ${endMonth === index + 1 ? "text-white" : "text-gray-900"}`}>
                      {month.substring(0, 3)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Pressable
              className="bg-indigo-600 py-3 rounded-lg mt-4"
              onPress={() => setShowRangePicker(false)}
            >
              <Text className="text-white text-center font-semibold">Apply Range</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
