import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, ArrowUp, ArrowDown } from "lucide-react";

interface ViewReportingViewProps {
  onNavigate: (view: string) => void;
  monthlyReports: any[];
  currentUser: any;
}

type ViewMode = "single" | "range";
type AggregationType = "total" | "average";
type CategoryFilter = "all" | "releasees" | "calls" | "bridge_team" | "mentorship" | "donors" | "financials" | "social_media";

export default function ViewReportingView({ onNavigate, monthlyReports, currentUser }: ViewReportingViewProps) {
  const isBoardMember = currentUser?.role === "board_member";
  const isAdmin = currentUser?.role === "admin";

  // Check which categories the user can view
  const canViewCategory = (category: string): boolean => {
    if (isAdmin || isBoardMember) return true;
    if (!currentUser?.hasReportingAccess) return false;
    if (!currentUser?.reportingCategories || currentUser.reportingCategories.length === 0) return true;
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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Single month selection - default to current month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Date range selection
  const [startMonth, setStartMonth] = useState(1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  // Modals
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showRangePicker, setShowRangePicker] = useState(false);

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
      return sum + Object.values(r.releaseFacilityCounts).reduce((a: number, b: any) => a + (b || 0), 0);
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
      sum + (r.bridgeTeamMetrics?.participantsReceived?.manualOverride ?? r.bridgeTeamMetrics?.participantsReceived?.autoCalculated ?? 0), 0) / divisor;
    const pendingBridge = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.pendingBridge?.manualOverride ?? r.bridgeTeamMetrics?.statusCounts?.pendingBridge?.autoCalculated ?? 0), 0) / divisor;
    const attemptedToContact = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.attemptedToContact?.manualOverride ?? r.bridgeTeamMetrics?.statusCounts?.attemptedToContact?.autoCalculated ?? 0), 0) / divisor;
    const contacted = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.contacted?.manualOverride ?? r.bridgeTeamMetrics?.statusCounts?.contacted?.autoCalculated ?? 0), 0) / divisor;
    const unableToContact = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.statusCounts?.unableToContact?.manualOverride ?? r.bridgeTeamMetrics?.statusCounts?.unableToContact?.autoCalculated ?? 0), 0) / divisor;
    const averageDaysToFirstOutreach = reportsInRange.reduce((sum, r) =>
      sum + (r.bridgeTeamMetrics?.averageDaysToFirstOutreach?.manualOverride ?? r.bridgeTeamMetrics?.averageDaysToFirstOutreach?.autoCalculated ?? 0), 0) / divisor;

    // Donors
    const newDonors = reportsInRange.reduce((sum, r) => sum + (r.donorData?.newDonors || 0), 0) / divisor;
    const amountFromNewDonors = reportsInRange.reduce((sum, r) => sum + (r.donorData?.amountFromNewDonors || 0), 0) / divisor;
    const checks = reportsInRange.reduce((sum, r) => sum + (r.donorData?.checks || 0), 0) / divisor;
    const totalFromChecks = reportsInRange.reduce((sum, r) => sum + (r.donorData?.totalFromChecks || 0), 0) / divisor;

    // Financials
    let beginningBalance = 0;
    let endingBalance = 0;

    if (isDivisor) {
      beginningBalance = reportsInRange[0]?.financialData?.beginningBalance || 0;
      endingBalance = reportsInRange[reportsInRange.length - 1]?.financialData?.endingBalance || 0;
    } else {
      beginningBalance = reportsInRange.reduce((sum, r) => sum + (r.financialData?.beginningBalance || 0), 0);
      endingBalance = reportsInRange.reduce((sum, r) => sum + (r.financialData?.endingBalance || 0), 0);
    }

    // Social Media
    const reelsPostViews = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.reelsPostViews || 0), 0) / divisor;
    const viewsFromNonFollowers = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.viewsFromNonFollowers || 0), 0) / divisor;
    const followers = reportsInRange[reportsInRange.length - 1]?.socialMediaMetrics?.followers || 0;
    const followersGained = reportsInRange.reduce((sum, r) => sum + (r.socialMediaMetrics?.followersGained || 0), 0) / divisor;

    return {
      releasees: { total: totalReleasees, pamLychner, huntsville, planeStateJail, havinsUnit, clemensUnit, other },
      calls: { inbound, outbound, missedCallsPercent },
      mentorship: { participantsAssignedToMentorship },
      bridgeTeam: { participantsReceived, pendingBridge, attemptedToContact, contacted, unableToContact, averageDaysToFirstOutreach },
      donors: { newDonors, amountFromNewDonors, checks, totalFromChecks },
      financials: { beginningBalance, endingBalance, difference: endingBalance - beginningBalance },
      socialMedia: { reelsPostViews, viewsFromNonFollowers, followers, followersGained },
    };
  }, [reportsInRange, aggregationType]);

  const formatNumber = (num: number, decimals: number = 0) => {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (num: number) => {
    return `$${formatNumber(num, 2)}`;
  };

  const formatPercentage = (num: number) => {
    return `${formatNumber(num, 1)}%`;
  };

  // Calculate comparison (up/down from previous period)
  const getComparison = (currentValue: number, field: string, report: any) => {
    const prevReport = getPreviousMonthReport(report.month, report.year);
    if (!prevReport) return null;

    let prevValue = 0;

    // Navigate nested structure based on field
    if (field.startsWith("releaseFacilityCounts.")) {
      const facilityField = field.split(".")[1];
      prevValue = prevReport.releaseFacilityCounts?.[facilityField] || 0;
    } else if (field.startsWith("callMetrics.")) {
      const callField = field.split(".")[1];
      prevValue = prevReport.callMetrics?.[callField] || 0;
    } else if (field.startsWith("bridgeTeamMetrics.")) {
      const fieldParts = field.split(".");
      if (fieldParts.length === 3 && fieldParts[1] === "participantsReceived") {
        prevValue = prevReport.bridgeTeamMetrics?.participantsReceived?.manualOverride ??
                    prevReport.bridgeTeamMetrics?.participantsReceived?.autoCalculated ?? 0;
      } else if (fieldParts.length === 4 && fieldParts[1] === "statusCounts") {
        const statusField = fieldParts[2];
        prevValue = prevReport.bridgeTeamMetrics?.statusCounts?.[statusField]?.manualOverride ??
                    prevReport.bridgeTeamMetrics?.statusCounts?.[statusField]?.autoCalculated ?? 0;
      } else if (fieldParts.length === 3 && fieldParts[1] === "averageDaysToFirstOutreach") {
        prevValue = prevReport.bridgeTeamMetrics?.averageDaysToFirstOutreach?.manualOverride ??
                    prevReport.bridgeTeamMetrics?.averageDaysToFirstOutreach?.autoCalculated ?? 0;
      }
    } else if (field.startsWith("mentorshipMetrics.")) {
      const mentorField = field.split(".")[1];
      prevValue = prevReport.mentorshipMetrics?.[mentorField] || 0;
    } else if (field.startsWith("donorData.")) {
      const donorField = field.split(".")[1];
      prevValue = prevReport.donorData?.[donorField] || 0;
    } else if (field.startsWith("financialData.")) {
      const finField = field.split(".")[1];
      prevValue = prevReport.financialData?.[finField] || 0;
    } else if (field.startsWith("socialMediaMetrics.")) {
      const socialField = field.split(".")[1];
      prevValue = prevReport.socialMediaMetrics?.[socialField] || 0;
    }

    const diff = currentValue - prevValue;
    const percentChange = prevValue !== 0 ? (diff / prevValue) * 100 : 0;

    return { diff, percentChange, isUp: diff > 0, isDown: diff < 0 };
  };

  const ComparisonIndicator = ({ value, field, report }: { value: number; field: string; report: any }) => {
    const comparison = getComparison(value, field, report);
    if (!comparison || (comparison.diff === 0)) return null;

    const isMissedCallsMetric = field === "callMetrics.missedCallsPercent";
    const isGood = isMissedCallsMetric ? comparison.isDown : comparison.isUp;

    return (
      <div className={`inline-flex items-center ml-2 px-2 py-1 rounded text-xs font-semibold ${
        isGood ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        {comparison.isUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        <span className="ml-1">{formatNumber(Math.abs(comparison.diff))} ({formatNumber(Math.abs(comparison.percentChange), 1)}%)</span>
      </div>
    );
  };

  const renderMetricRow = (label: string, value: number, field: string, report: any, isCurrency = false, isPercentage = false) => (
    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
      <p className="text-gray-700">{label}</p>
      <div className="flex items-center">
        <p className="text-gray-900 font-semibold">
          {isCurrency ? formatCurrency(value) : isPercentage ? formatPercentage(value) : formatNumber(value)}
        </p>
        {viewMode === "single" && <ComparisonIndicator value={value} field={field} report={report} />}
      </div>
    </div>
  );

  const renderSingleMonthView = () => {
    const report = reportsInRange[0];
    if (!report) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-500">No report available for this month</p>
          </div>
        </div>
      );
    }

    const totalReleasees = report.releaseFacilityCounts
      ? Object.values(report.releaseFacilityCounts).reduce((a: number, b: any) => a + (b || 0), 0)
      : 0;

    return (
      <div className="space-y-4">
        {/* Releasees Met */}
        {canViewCategory("release_facilities") && (categoryFilter === "all" || categoryFilter === "releasees") && report.releaseFacilityCounts && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Releasees Met</h3>
            {renderMetricRow("Total", totalReleasees, "releaseFacilityCounts.total", report)}
            {renderMetricRow("Pam Lychner", report.releaseFacilityCounts.pamLychner ?? 0, "releaseFacilityCounts.pamLychner", report)}
            {renderMetricRow("Huntsville", report.releaseFacilityCounts.huntsville ?? 0, "releaseFacilityCounts.huntsville", report)}
            {renderMetricRow("Plane State Jail", report.releaseFacilityCounts.planeStateJail ?? 0, "releaseFacilityCounts.planeStateJail", report)}
            {renderMetricRow("Havins Unit", report.releaseFacilityCounts.havinsUnit ?? 0, "releaseFacilityCounts.havinsUnit", report)}
            {renderMetricRow("Clemens Unit", report.releaseFacilityCounts.clemensUnit ?? 0, "releaseFacilityCounts.clemensUnit", report)}
            {renderMetricRow("Other", report.releaseFacilityCounts.other ?? 0, "releaseFacilityCounts.other", report)}
          </div>
        )}

        {/* Calls */}
        {canViewCategory("calls") && (categoryFilter === "all" || categoryFilter === "calls") && report.callMetrics && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Calls</h3>
            {renderMetricRow("Inbound", report.callMetrics.inbound ?? 0, "callMetrics.inbound", report)}
            {renderMetricRow("Outbound", report.callMetrics.outbound ?? 0, "callMetrics.outbound", report)}
            {renderMetricRow("Missed Calls %", report.callMetrics.missedCallsPercent ?? 0, "callMetrics.missedCallsPercent", report, false, true)}
          </div>
        )}

        {/* Bridge Team */}
        {canViewCategory("bridge_team") && (categoryFilter === "all" || categoryFilter === "bridge_team") && report.bridgeTeamMetrics && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Bridge Team</h3>
            {renderMetricRow("Participants Received", report.bridgeTeamMetrics.participantsReceived?.manualOverride ?? report.bridgeTeamMetrics.participantsReceived?.autoCalculated ?? 0, "bridgeTeamMetrics.participantsReceived.autoCalculated", report)}

            <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Status Activity:</p>
            <div className="pl-4">
              {renderMetricRow("Pending Bridge", report.bridgeTeamMetrics.statusCounts?.pendingBridge?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.pendingBridge?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.pendingBridge.autoCalculated", report)}
              {renderMetricRow("Attempted to Contact", report.bridgeTeamMetrics.statusCounts?.attemptedToContact?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.attemptedToContact?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.attemptedToContact.autoCalculated", report)}
              {renderMetricRow("Contacted", report.bridgeTeamMetrics.statusCounts?.contacted?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.contacted?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.contacted.autoCalculated", report)}
              {renderMetricRow("Unable to Contact", report.bridgeTeamMetrics.statusCounts?.unableToContact?.manualOverride ?? report.bridgeTeamMetrics.statusCounts?.unableToContact?.autoCalculated ?? 0, "bridgeTeamMetrics.statusCounts.unableToContact.autoCalculated", report)}
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100 mt-2">
              <p className="text-gray-700">Avg Days to First Outreach</p>
              <div className="flex items-center">
                <p className="text-gray-900 font-semibold">
                  {formatNumber(report.bridgeTeamMetrics.averageDaysToFirstOutreach?.manualOverride ?? report.bridgeTeamMetrics.averageDaysToFirstOutreach?.autoCalculated ?? 0)} days
                </p>
                {viewMode === "single" && <ComparisonIndicator value={report.bridgeTeamMetrics.averageDaysToFirstOutreach?.manualOverride ?? report.bridgeTeamMetrics.averageDaysToFirstOutreach?.autoCalculated ?? 0} field="bridgeTeamMetrics.averageDaysToFirstOutreach.autoCalculated" report={report} />}
              </div>
            </div>
          </div>
        )}

        {/* Mentorship */}
        {canViewCategory("mentorship") && (categoryFilter === "all" || categoryFilter === "mentorship") && report.mentorshipMetrics && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Mentorship</h3>
            {renderMetricRow("Participants Assigned", report.mentorshipMetrics.participantsAssignedToMentorship, "mentorshipMetrics.participantsAssignedToMentorship", report)}
          </div>
        )}

        {/* Donors */}
        {canViewCategory("donors") && (categoryFilter === "all" || categoryFilter === "donors") && report.donorData && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Donors</h3>
            {renderMetricRow("New Donors", report.donorData.newDonors ?? 0, "donorData.newDonors", report)}
            {renderMetricRow("Amount from New Donors", report.donorData.amountFromNewDonors ?? 0, "donorData.amountFromNewDonors", report, true)}
            {renderMetricRow("Checks", report.donorData.checks ?? 0, "donorData.checks", report)}
            {renderMetricRow("Total from Checks", report.donorData.totalFromChecks ?? 0, "donorData.totalFromChecks", report, true)}
          </div>
        )}

        {/* Financials */}
        {canViewCategory("financials") && (categoryFilter === "all" || categoryFilter === "financials") && report.financialData && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Financials</h3>
            {renderMetricRow("Beginning Balance", report.financialData.beginningBalance ?? 0, "financialData.beginningBalance", report, true)}
            {renderMetricRow("Ending Balance", report.financialData.endingBalance ?? 0, "financialData.endingBalance", report, true)}
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mt-2">
              <p className="text-gray-700 mb-1">Difference</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formatCurrency((report.financialData.endingBalance ?? 0) - (report.financialData.beginningBalance ?? 0))}
              </p>
            </div>
          </div>
        )}

        {/* Social Media */}
        {canViewCategory("social_media") && (categoryFilter === "all" || categoryFilter === "social_media") && report.socialMediaMetrics && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Social Media</h3>
            {renderMetricRow("Reels/Post Views", report.socialMediaMetrics.reelsPostViews ?? 0, "socialMediaMetrics.reelsPostViews", report)}
            {renderMetricRow("Views from Non-Followers", report.socialMediaMetrics.viewsFromNonFollowers ?? 0, "socialMediaMetrics.viewsFromNonFollowers", report, false, true)}
            {renderMetricRow("Total Followers", report.socialMediaMetrics.followers ?? 0, "socialMediaMetrics.followers", report)}
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <p className="text-gray-700">Followers Gained</p>
              <div className="flex items-center">
                <p className={`font-semibold ${(report.socialMediaMetrics.followersGained ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(report.socialMediaMetrics.followersGained ?? 0) >= 0 ? "+" : ""}{formatNumber(report.socialMediaMetrics.followersGained ?? 0)}
                </p>
                {viewMode === "single" && <ComparisonIndicator value={report.socialMediaMetrics.followersGained ?? 0} field="socialMediaMetrics.followersGained" report={report} />}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRangeView = () => {
    if (!aggregatedMetrics) {
      return (
        <div className="flex items-center justify-center p-8">
          <p className="text-gray-500">No reports available in this range</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Summary Header */}
        <div className="bg-indigo-600 p-4 rounded-lg mb-4">
          <p className="text-white text-sm font-semibold">
            {aggregationType === "total" ? "Total" : "Average"} for {reportsInRange.length} month{reportsInRange.length !== 1 ? "s" : ""}
          </p>
          <p className="text-indigo-100 text-xs mt-1">
            {months[startMonth - 1]} {startYear} - {months[endMonth - 1]} {endYear}
          </p>
        </div>

        {/* Releasees Met */}
        {(categoryFilter === "all" || categoryFilter === "releasees") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Releasees Met</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Total</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.total)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Pam Lychner</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.pamLychner)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Huntsville</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.huntsville)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Plane State Jail</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.planeStateJail)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Havins Unit</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.havinsUnit)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Clemens Unit</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.clemensUnit)}</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-gray-700">Other</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.releasees.other)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Calls */}
        {(categoryFilter === "all" || categoryFilter === "calls") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Calls</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Inbound</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.calls.inbound)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Outbound</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.calls.outbound)}</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-gray-700">Missed Calls %</p>
                <p className="text-gray-900 font-semibold">{formatPercentage(aggregatedMetrics.calls.missedCallsPercent)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Team */}
        {(categoryFilter === "all" || categoryFilter === "bridge_team") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Bridge Team</h3>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <p className="text-gray-700">Participants Received</p>
              <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.bridgeTeam.participantsReceived)}</p>
            </div>

            <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Status Activity:</p>
            <div className="pl-4">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <p className="text-gray-600">Pending Bridge</p>
                <p className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.pendingBridge)}</p>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <p className="text-gray-600">Attempted to Contact</p>
                <p className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.attemptedToContact)}</p>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <p className="text-gray-600">Contacted</p>
                <p className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.contacted)}</p>
              </div>
              <div className="flex justify-between py-1">
                <p className="text-gray-600">Unable to Contact</p>
                <p className="text-gray-900">{formatNumber(aggregatedMetrics.bridgeTeam.unableToContact)}</p>
              </div>
            </div>

            <div className="flex justify-between py-2 border-t border-gray-100 mt-2">
              <p className="text-gray-700">Avg Days to First Outreach</p>
              <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.bridgeTeam.averageDaysToFirstOutreach)} days</p>
            </div>
          </div>
        )}

        {/* Mentorship */}
        {(categoryFilter === "all" || categoryFilter === "mentorship") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Mentorship</h3>
            <div className="flex justify-between py-2">
              <p className="text-gray-700">Participants Assigned</p>
              <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.mentorship.participantsAssignedToMentorship)}</p>
            </div>
          </div>
        )}

        {/* Donors */}
        {(categoryFilter === "all" || categoryFilter === "donors") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Donors</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">New Donors</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.donors.newDonors)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Amount from New Donors</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.donors.amountFromNewDonors)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Checks</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.donors.checks)}</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-gray-700">Total from Checks</p>
                <p className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.donors.totalFromChecks)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financials */}
        {(categoryFilter === "all" || categoryFilter === "financials") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Financials</h3>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <p className="text-gray-700">Beginning Balance</p>
              <p className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.financials.beginningBalance)}</p>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <p className="text-gray-700">Ending Balance</p>
              <p className="text-gray-900 font-semibold">{formatCurrency(aggregatedMetrics.financials.endingBalance)}</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 mt-2">
              <p className="text-gray-700 mb-1">Difference</p>
              <p className="text-2xl font-bold text-indigo-900">
                {formatCurrency(aggregatedMetrics.financials.difference)}
              </p>
            </div>
          </div>
        )}

        {/* Social Media */}
        {(categoryFilter === "all" || categoryFilter === "social_media") && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Social Media</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Reels/Post Views</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.socialMedia.reelsPostViews)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Views from Non-Followers</p>
                <p className="text-gray-900 font-semibold">{formatPercentage(aggregatedMetrics.socialMedia.viewsFromNonFollowers)}</p>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <p className="text-gray-700">Total Followers</p>
                <p className="text-gray-900 font-semibold">{formatNumber(aggregatedMetrics.socialMedia.followers)}</p>
              </div>
              <div className="flex justify-between py-2">
                <p className="text-gray-700">Followers Gained</p>
                <p className={`font-semibold ${aggregatedMetrics.socialMedia.followersGained >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {aggregatedMetrics.socialMedia.followersGained >= 0 ? "+" : ""}{formatNumber(aggregatedMetrics.socialMedia.followersGained)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mb-6">
        <button
          onClick={() => onNavigate("reporting")}
          className="flex items-center gap-2 text-secondary hover:text-text mb-4 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
          <span className="text-sm font-medium">Back to Monthly Reporting</span>
        </button>
        <h1 className="text-3xl font-bold text-text mb-2">View Reports</h1>
        <p className="text-secondary">Filter by date range, view aggregations, and compare months</p>
      </div>

      {/* Header Controls */}
      <div className="bg-white border border-border rounded-lg p-4 mb-4">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-3">
          <button
            className={`flex-1 py-2 rounded-md transition-colors ${viewMode === "single" ? "bg-white shadow-sm text-indigo-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setViewMode("single")}
          >
            Single Month
          </button>
          <button
            className={`flex-1 py-2 rounded-md transition-colors ${viewMode === "range" ? "bg-white shadow-sm text-indigo-600 font-semibold" : "text-gray-600"}`}
            onClick={() => setViewMode("range")}
          >
            Date Range
          </button>
        </div>

        {/* Date Selector */}
        {viewMode === "single" ? (
          <button
            className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg mb-3 hover:bg-gray-100 transition-colors"
            onClick={() => setShowMonthPicker(!showMonthPicker)}
          >
            <span className="text-base font-semibold text-gray-900">
              {months[selectedMonth - 1]} {selectedYear}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        ) : (
          <button
            className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg mb-3 hover:bg-gray-100 transition-colors"
            onClick={() => setShowRangePicker(!showRangePicker)}
          >
            <span className="text-base font-semibold text-gray-900">
              {months[startMonth - 1]} {startYear} - {months[endMonth - 1]} {endYear}
            </span>
            <ChevronDown className="w-5 h-5 text-gray-600" />
          </button>
        )}

        {/* Aggregation Type (only for range) */}
        {viewMode === "range" && (
          <div className="flex rounded-lg bg-gray-100 p-1 mb-3">
            <button
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${aggregationType === "total" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"}`}
              onClick={() => setAggregationType("total")}
            >
              Total
            </button>
            <button
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${aggregationType === "average" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"}`}
              onClick={() => setAggregationType("average")}
            >
              Average
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
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
            <button
              key={cat.key}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${categoryFilter === cat.key ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
              onClick={() => setCategoryFilter(cat.key as CategoryFilter)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {viewMode === "single" ? renderSingleMonthView() : renderRangeView()}

      {/* Month Picker Modal */}
      {showMonthPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMonthPicker(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Select Month & Year</h3>
              <button onClick={() => setShowMonthPicker(false)} className="text-gray-600 hover:text-gray-900">
                ✕
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center justify-center mb-4">
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => setSelectedYear(selectedYear - 1)}
              >
                -
              </button>
              <span className="text-2xl font-bold text-gray-900 mx-6">{selectedYear}</span>
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => setSelectedYear(selectedYear + 1)}
              >
                +
              </button>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  className={`p-3 rounded-lg font-semibold ${selectedMonth === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                  onClick={() => {
                    setSelectedMonth(index + 1);
                    setShowMonthPicker(false);
                  }}
                >
                  {month.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Range Picker Modal */}
      {showRangePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setShowRangePicker(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Select Date Range</h3>
              <button onClick={() => setShowRangePicker(false)} className="text-gray-600 hover:text-gray-900">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Start Date */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">Start Date</h4>
                <div className="flex items-center justify-center mb-4">
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setStartYear(startYear - 1)}
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-gray-900 mx-6">{startYear}</span>
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setStartYear(startYear + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {months.map((month, index) => (
                    <button
                      key={`start-${month}`}
                      className={`p-3 rounded-lg font-semibold ${startMonth === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                      onClick={() => setStartMonth(index + 1)}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* End Date */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-3">End Date</h4>
                <div className="flex items-center justify-center mb-4">
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setEndYear(endYear - 1)}
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-gray-900 mx-6">{endYear}</span>
                  <button
                    className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    onClick={() => setEndYear(endYear + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  {months.map((month, index) => (
                    <button
                      key={`end-${month}`}
                      className={`p-3 rounded-lg font-semibold ${endMonth === index + 1 ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900 hover:bg-gray-200"}`}
                      onClick={() => setEndMonth(index + 1)}
                    >
                      {month.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              onClick={() => setShowRangePicker(false)}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </>
  );
}
