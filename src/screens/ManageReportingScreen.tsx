import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useReportingStore } from "../state/reportingStore";
import { useParticipantStore } from "../state/participantStore";
import { useCurrentUser } from "../state/authStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber, formatCurrency, formatPercentage } from "../utils/formatNumber";

export default function ManageReportingScreen() {
  const navigation = useNavigation<any>();
  const currentUser = useCurrentUser();
  const { monthlyReports, createMonthlyReport, updateMonthlyReport, postReport, calculateMentorshipMetrics, calculateBridgeTeamMetrics, updateReleaseFacilityCounts, updateCallMetrics, updateBridgeTeamMetrics, updateDonorData, updateFinancialData, updateSocialMediaMetrics, updateWinsAndConcerns } = useReportingStore();
  const participants = useParticipantStore((s) => s.participants);

  // View mode: "month" or "category"
  const [viewMode, setViewMode] = useState<"month" | "category">("month");

  // For month view
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // For category view
  const [selectedCategory, setSelectedCategory] = useState<"releasees" | "calls" | "donors" | "financials" | "social_media" | "wins_concerns">("releasees");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Current report (for month view)
  const [currentReport, setCurrentReport] = useState<any>(null);

  // All reports for the year (for category view)
  const [yearReports, setYearReports] = useState<any[]>([]);

  // Local state for category view inputs to prevent losing focus on auto-save
  const [categoryInputs, setCategoryInputs] = useState<Record<string, string>>({});

  // Releasees Met (Section 1)
  const [pamLychner, setPamLychner] = useState("");
  const [huntsville, setHuntsville] = useState("");
  const [planeStateJail, setPlaneStateJail] = useState("");
  const [havinsUnit, setHavinsUnit] = useState("");
  const [clemensUnit, setClemensUnit] = useState("");
  const [other, setOther] = useState("");

  // Calls (Section 2)
  const [inbound, setInbound] = useState("");
  const [outbound, setOutbound] = useState("");
  const [missedCallsPercent, setMissedCallsPercent] = useState("");
  const [hungUpPriorToWelcome, setHungUpPriorToWelcome] = useState("");
  const [hungUpWithin10Seconds, setHungUpWithin10Seconds] = useState("");
  const [missedDueToNoAnswer, setMissedDueToNoAnswer] = useState("");

  // Donor Data
  const [newDonors, setNewDonors] = useState("");
  const [amountFromNewDonors, setAmountFromNewDonors] = useState("");
  const [checks, setChecks] = useState("");
  const [totalFromChecks, setTotalFromChecks] = useState("");

  // Financial Data
  const [beginningBalance, setBeginningBalance] = useState("");
  const [endingBalance, setEndingBalance] = useState("");

  // Social Media Data
  const [reelsPostViews, setReelsPostViews] = useState("");
  const [viewsFromNonFollowers, setViewsFromNonFollowers] = useState("");
  const [followers, setFollowers] = useState("");
  const [followersGained, setFollowersGained] = useState("");
  const [followersGainedSign, setFollowersGainedSign] = useState<"plus" | "minus">("plus");

  // Wins & Concerns - Array of up to 5 entries each
  const [wins, setWins] = useState<{ title: string; body: string }[]>([]);
  const [concerns, setConcerns] = useState<{ title: string; body: string }[]>([]);

  // Post confirmation modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Load or create report when month/year changes (month view)
  useEffect(() => {
    if (viewMode === "month") {
      loadReport();
    } else {
      loadYearReports();
    }
  }, [selectedMonth, selectedYear, viewMode, monthlyReports]);

  const loadReport = async () => {
    if (!currentUser) return;

    let report = monthlyReports.find((r) => r.month === selectedMonth && r.year === selectedYear);

    if (!report) {
      // Create new report
      report = await createMonthlyReport(selectedMonth, selectedYear, currentUser.id, currentUser.name);
    }

    setCurrentReport(report);

    // Populate Section 1 fields - use empty string for null values
    setPamLychner(report.releaseFacilityCounts.pamLychner !== null ? report.releaseFacilityCounts.pamLychner.toString() : "");
    setHuntsville(report.releaseFacilityCounts.huntsville !== null ? report.releaseFacilityCounts.huntsville.toString() : "");
    setPlaneStateJail(report.releaseFacilityCounts.planeStateJail !== null ? report.releaseFacilityCounts.planeStateJail.toString() : "");
    setHavinsUnit(report.releaseFacilityCounts.havinsUnit !== null ? report.releaseFacilityCounts.havinsUnit.toString() : "");
    setClemensUnit(report.releaseFacilityCounts.clemensUnit !== null ? report.releaseFacilityCounts.clemensUnit.toString() : "");
    setOther(report.releaseFacilityCounts.other !== null ? report.releaseFacilityCounts.other.toString() : "");

    // Populate Section 2 fields - use empty string for null values
    setInbound(report.callMetrics.inbound !== null ? report.callMetrics.inbound.toString() : "");
    setOutbound(report.callMetrics.outbound !== null ? report.callMetrics.outbound.toString() : "");
    setMissedCallsPercent(report.callMetrics.missedCallsPercent !== null ? report.callMetrics.missedCallsPercent.toString() : "");
    setHungUpPriorToWelcome(report.callMetrics.hungUpPriorToWelcome !== null ? report.callMetrics.hungUpPriorToWelcome.toString() : "");
    setHungUpWithin10Seconds(report.callMetrics.hungUpWithin10Seconds !== null ? report.callMetrics.hungUpWithin10Seconds.toString() : "");
    setMissedDueToNoAnswer(report.callMetrics.missedDueToNoAnswer !== null ? report.callMetrics.missedDueToNoAnswer.toString() : "");

    // Populate donor and financial fields - use empty string for null values
    setNewDonors(report.donorData.newDonors !== null ? report.donorData.newDonors.toString() : "");
    setAmountFromNewDonors(report.donorData.amountFromNewDonors !== null ? report.donorData.amountFromNewDonors.toString() : "");
    setChecks(report.donorData.checks !== null ? report.donorData.checks.toString() : "");
    setTotalFromChecks(report.donorData.totalFromChecks !== null ? report.donorData.totalFromChecks.toString() : "");
    setBeginningBalance(report.financialData.beginningBalance !== null ? report.financialData.beginningBalance.toString() : "");
    setEndingBalance(report.financialData.endingBalance !== null ? report.financialData.endingBalance.toString() : "");

    // Populate social media fields
    setReelsPostViews(report.socialMediaMetrics?.reelsPostViews !== null && report.socialMediaMetrics?.reelsPostViews !== undefined ? report.socialMediaMetrics.reelsPostViews.toString() : "");
    setViewsFromNonFollowers(report.socialMediaMetrics?.viewsFromNonFollowers !== null && report.socialMediaMetrics?.viewsFromNonFollowers !== undefined ? report.socialMediaMetrics.viewsFromNonFollowers.toString() : "");
    setFollowers(report.socialMediaMetrics?.followers !== null && report.socialMediaMetrics?.followers !== undefined ? report.socialMediaMetrics.followers.toString() : "");

    // Handle followers gained with sign
    const followersGainedValue = report.socialMediaMetrics?.followersGained;
    if (followersGainedValue !== null && followersGainedValue !== undefined) {
      setFollowersGainedSign(followersGainedValue >= 0 ? "plus" : "minus");
      setFollowersGained(Math.abs(followersGainedValue).toString());
    } else {
      setFollowersGained("");
      setFollowersGainedSign("plus");
    }

    // Populate wins and concerns arrays
    setWins(report.wins || []);
    setConcerns(report.concerns || []);
  };

  const loadYearReports = async () => {
    if (!currentUser) return;

    // Load or create reports for all 12 months of the selected year
    const reports: any[] = [];
    const inputs: Record<string, string> = {};

    for (let month = 1; month <= 12; month++) {
      let report = monthlyReports.find((r) => r.month === month && r.year === selectedYear);

      if (!report) {
        report = await createMonthlyReport(month, selectedYear, currentUser.id, currentUser.name);
      }

      reports.push(report);

      // Initialize input state for each field
      if (selectedCategory === "releasees") {
        ["pamLychner", "huntsville", "planeStateJail", "havinsUnit", "clemensUnit", "other"].forEach((field) => {
          const key = `${month}-${field}`;
          const value = (report.releaseFacilityCounts as any)?.[field];
          inputs[key] = value === null || value === undefined ? "N/A" : value.toString();
        });
      } else if (selectedCategory === "calls") {
        ["inbound", "outbound", "missedCallsPercent", "hungUpPriorToWelcome", "hungUpWithin10Seconds", "missedDueToNoAnswer"].forEach((field) => {
          const key = `${month}-${field}`;
          const value = (report.callMetrics as any)?.[field];
          inputs[key] = value === null || value === undefined ? "N/A" : value.toString();
        });
      } else if (selectedCategory === "donors") {
        ["newDonors", "amountFromNewDonors", "checks", "totalFromChecks"].forEach((field) => {
          const key = `${month}-${field}`;
          const value = (report.donorData as any)?.[field];
          inputs[key] = value === null || value === undefined ? "N/A" : value.toString();
        });
      } else if (selectedCategory === "financials") {
        ["beginningBalance", "endingBalance"].forEach((field) => {
          const key = `${month}-${field}`;
          const value = (report.financialData as any)?.[field];
          inputs[key] = value === null || value === undefined ? "N/A" : value.toString();
        });
      } else if (selectedCategory === "social_media") {
        ["reelsPostViews", "viewsFromNonFollowers", "followers", "followersGained"].forEach((field) => {
          const key = `${month}-${field}`;
          const value = (report.socialMediaMetrics as any)?.[field];
          inputs[key] = value === null || value === undefined ? "N/A" : value.toString();
        });
      } else if (selectedCategory === "wins_concerns") {
        // For wins and concerns, we'll display them differently (not as simple inputs)
        // Store summary data for display
        const key = `${month}-winsCount`;
        inputs[key] = report.wins?.length?.toString() || "0";
        const concernsKey = `${month}-concernsCount`;
        inputs[concernsKey] = report.concerns?.length?.toString() || "0";
      }
    }

    setYearReports(reports);
    setCategoryInputs(inputs);
  };

  const handleSaveReleaseFacilityCounts = async () => {
    if (!currentReport) return;

    await updateReleaseFacilityCounts(currentReport.id, {
      pamLychner: pamLychner === "" ? null : parseInt(pamLychner) || null,
      huntsville: huntsville === "" ? null : parseInt(huntsville) || null,
      planeStateJail: planeStateJail === "" ? null : parseInt(planeStateJail) || null,
      havinsUnit: havinsUnit === "" ? null : parseInt(havinsUnit) || null,
      clemensUnit: clemensUnit === "" ? null : parseInt(clemensUnit) || null,
      other: other === "" ? null : parseInt(other) || null,
    });

    Alert.alert("Success", "Releasees Met data saved");
  };

  const handleSaveCallMetrics = async () => {
    if (!currentReport) return;

    const missedTotal = (parseFloat(hungUpPriorToWelcome) || 0) +
                        (parseFloat(hungUpWithin10Seconds) || 0) +
                        (parseFloat(missedDueToNoAnswer) || 0);

    const enteredMissed = parseFloat(missedCallsPercent) || 0;

    if (Math.abs(missedTotal - enteredMissed) > 0.01) {
      Alert.alert(
        "Warning",
        `The subcategories (${formatPercentage(missedTotal)}) do not add up to the Missed Calls percentage (${formatPercentage(enteredMissed)}). Do you want to continue?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Anyway", onPress: saveCallMetrics }
        ]
      );
    } else {
      await saveCallMetrics();
    }
  };

  const saveCallMetrics = async () => {
    if (!currentReport) return;

    await updateCallMetrics(currentReport.id, {
      inbound: inbound === "" ? null : parseInt(inbound) || null,
      outbound: outbound === "" ? null : parseInt(outbound) || null,
      missedCallsPercent: missedCallsPercent === "" ? null : parseFloat(missedCallsPercent) || null,
      hungUpPriorToWelcome: hungUpPriorToWelcome === "" ? null : parseFloat(hungUpPriorToWelcome) || null,
      hungUpWithin10Seconds: hungUpWithin10Seconds === "" ? null : parseFloat(hungUpWithin10Seconds) || null,
      missedDueToNoAnswer: missedDueToNoAnswer === "" ? null : parseFloat(missedDueToNoAnswer) || null,
    });

    Alert.alert("Success", "Call metrics saved");
  };

  const handleSaveDonorData = async () => {
    if (!currentReport) return;

    await updateDonorData(currentReport.id, {
      newDonors: newDonors === "" ? null : parseInt(newDonors) || null,
      amountFromNewDonors: amountFromNewDonors === "" ? null : parseFloat(amountFromNewDonors) || null,
      checks: checks === "" ? null : parseInt(checks) || null,
      totalFromChecks: totalFromChecks === "" ? null : parseFloat(totalFromChecks) || null,
    });

    Alert.alert("Success", "Donor data saved");
  };

  const handleSaveFinancialData = async () => {
    if (!currentReport) return;

    await updateFinancialData(
      currentReport.id,
      beginningBalance === "" ? null : parseFloat(beginningBalance) || null,
      endingBalance === "" ? null : parseFloat(endingBalance) || null
    );

    Alert.alert("Success", "Financial data saved");
  };

  const handleSaveSocialMediaMetrics = async () => {
    if (!currentReport) return;

    // Calculate the signed value for followers gained
    const followersGainedValue = followersGained === ""
      ? null
      : (followersGainedSign === "minus" ? -1 : 1) * (parseInt(followersGained) || 0);

    await updateSocialMediaMetrics(currentReport.id, {
      reelsPostViews: reelsPostViews === "" ? null : parseInt(reelsPostViews) || null,
      viewsFromNonFollowers: viewsFromNonFollowers === "" ? null : parseFloat(viewsFromNonFollowers) || null,
      followers: followers === "" ? null : parseInt(followers) || null,
      followersGained: followersGainedValue,
    });

    Alert.alert("Success", "Social media metrics saved");
  };

  const handleSaveWinsAndConcerns = async () => {
    if (!currentReport) return;

    await updateWinsAndConcerns(currentReport.id, wins, concerns);

    Alert.alert("Success", "Wins and concerns saved");
  };

  const handleRefreshMetrics = async () => {
    if (!currentReport) return;

    const mentorshipMetrics = calculateMentorshipMetrics(selectedMonth, selectedYear);
    const bridgeTeamMetrics = calculateBridgeTeamMetrics(selectedMonth, selectedYear);

    await updateMonthlyReport(currentReport.id, {
      mentorshipMetrics,
      bridgeTeamMetrics,
    });

    Alert.alert("Success", "Auto-calculated metrics refreshed from app data");
  };

  const handlePostReport = async () => {
    if (!currentReport || !currentUser) return;

    setIsPosting(true);
    try {
      await postReport(currentReport.id, currentUser.id, currentUser.name);
      setShowPostModal(false);
      loadReport(); // Reload to show posted status
      Alert.alert("Success", `Report for ${months[selectedMonth - 1]} ${selectedYear} has been posted for board member viewing.`);
    } catch (error) {
      console.error("Error posting report:", error);
      Alert.alert("Error", "Failed to post report. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Category view handlers - save data for specific field across all months
  const handleCategoryInputChange = (month: number, field: string, value: string) => {
    const key = `${month}-${field}`;
    setCategoryInputs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveCategoryData = async (month: number, field: string, value: string) => {
    const report = yearReports.find((r) => r.month === month);
    if (!report) return;

    // Handle "N/A" or empty as null to indicate no data
    const numValue = value === "N/A" || value.trim() === "" ? null : parseFloat(value);

    // Don't save if the value is invalid (NaN) and not empty/N/A
    if (numValue !== null && isNaN(numValue)) {
      return;
    }

    // Determine which category and update accordingly
    if (selectedCategory === "releasees") {
      const currentCounts = report.releaseFacilityCounts || {
        pamLychner: null,
        huntsville: null,
        planeStateJail: null,
        havinsUnit: null,
        clemensUnit: null,
        other: null,
      };
      await updateReleaseFacilityCounts(report.id, {
        ...currentCounts,
        [field]: numValue,
      });
    } else if (selectedCategory === "calls") {
      const currentMetrics = report.callMetrics || {
        inbound: null,
        outbound: null,
        missedCallsPercent: null,
        hungUpPriorToWelcome: null,
        hungUpWithin10Seconds: null,
        missedDueToNoAnswer: null,
      };
      await updateCallMetrics(report.id, {
        ...currentMetrics,
        [field]: numValue,
      });
    } else if (selectedCategory === "donors") {
      const currentData = report.donorData || {
        newDonors: null,
        amountFromNewDonors: null,
        checks: null,
        totalFromChecks: null,
      };
      await updateDonorData(report.id, {
        ...currentData,
        [field]: numValue,
      });
    } else if (selectedCategory === "financials") {
      await updateFinancialData(
        report.id,
        field === "beginningBalance" ? numValue : report.financialData.beginningBalance,
        field === "endingBalance" ? numValue : report.financialData.endingBalance
      );
    } else if (selectedCategory === "social_media") {
      const currentMetrics = report.socialMediaMetrics || {
        reelsPostViews: null,
        viewsFromNonFollowers: null,
        followers: null,
        followersGained: null,
      };
      await updateSocialMediaMetrics(report.id, {
        ...currentMetrics,
        [field]: numValue,
      });
    }

    // Don't reload all reports - just update the local state
    const key = `${month}-${field}`;
    setCategoryInputs((prev) => ({
      ...prev,
      [key]: numValue === null ? "N/A" : numValue.toString()
    }));
  };

  const isAdmin = currentUser?.role === "admin";
  const canEdit = currentUser?.role === "admin";

  // Calculate totals and averages for category view
  const calculateCategoryStats = (field: string) => {
    const values = yearReports
      .map((report) => {
        if (selectedCategory === "releasees") {
          return (report.releaseFacilityCounts as any)?.[field];
        } else if (selectedCategory === "calls") {
          return (report.callMetrics as any)?.[field];
        } else if (selectedCategory === "donors") {
          return (report.donorData as any)?.[field];
        } else if (selectedCategory === "financials") {
          return (report.financialData as any)?.[field];
        } else if (selectedCategory === "social_media") {
          return (report.socialMediaMetrics as any)?.[field];
        }
        return null;
      })
      .filter((val) => val !== null && val !== undefined);

    if (values.length === 0) return { total: 0, average: 0, count: 0 };

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;

    return { total, average, count: values.length };
  };

  // Calculate subcategory total for display
  const subcategoryTotal = (parseFloat(hungUpPriorToWelcome) || 0) +
                          (parseFloat(hungUpWithin10Seconds) || 0) +
                          (parseFloat(missedDueToNoAnswer) || 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-gray-200 px-4 py-4">
          <View className="flex-row items-center mb-3">
            <Pressable onPress={() => navigation.goBack()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </Pressable>
            <Text className="text-2xl font-bold text-gray-900 flex-1">Manage Reports</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          {/* View Mode Toggle */}
          <View className="flex-row mb-3 bg-gray-100 rounded-lg p-1">
            <Pressable
              className={`flex-1 py-2 rounded-md ${viewMode === "month" ? "bg-white" : "bg-transparent"}`}
              onPress={() => setViewMode("month")}
            >
              <Text className={`text-center font-semibold ${viewMode === "month" ? "text-indigo-600" : "text-gray-600"}`}>
                By Month
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 py-2 rounded-md ${viewMode === "category" ? "bg-white" : "bg-transparent"}`}
              onPress={() => setViewMode("category")}
            >
              <Text className={`text-center font-semibold ${viewMode === "category" ? "text-indigo-600" : "text-gray-600"}`}>
                By Category
              </Text>
            </Pressable>
          </View>

          {/* Month/Year or Category Selector */}
          {viewMode === "month" ? (
            <>
              <Pressable
                className="flex-row items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                onPress={() => setShowMonthPicker(true)}
              >
                <Text className="text-lg font-semibold text-gray-900">
                  {months[selectedMonth - 1]} {selectedYear}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Pressable>

              <Pressable
                className="mt-2 bg-indigo-600 px-4 py-2 rounded-lg"
                onPress={handleRefreshMetrics}
              >
                <Text className="text-white text-center font-semibold">Refresh Auto-Calculated Metrics</Text>
              </Pressable>

              {/* Post Report Button */}
              {currentReport && (
                <Pressable
                  className={`mt-2 px-4 py-3 rounded-lg flex-row items-center justify-center ${currentReport.isPosted ? "bg-green-100 border border-green-600" : "bg-yellow-600"}`}
                  onPress={() => !currentReport.isPosted && setShowPostModal(true)}
                  disabled={currentReport.isPosted}
                >
                  {currentReport.isPosted ? (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                      <Text className="text-green-700 font-bold ml-2">
                        Posted for Board Viewing
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={20} color="white" />
                      <Text className="text-white font-bold ml-2">
                        Post Report for Board Members
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </>
          ) : (
            <View className="space-y-2">
              <Pressable
                className="flex-row items-center justify-between bg-gray-50 px-4 py-3 rounded-lg mb-2"
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text className="text-lg font-semibold text-gray-900 capitalize">
                  {selectedCategory}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Pressable>

              <View className="flex-row items-center justify-center">
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setSelectedYear(selectedYear - 1)}
                >
                  <Text className="text-gray-900 font-semibold">-</Text>
                </Pressable>
                <Text className="text-xl font-bold text-gray-900 mx-6">{selectedYear}</Text>
                <Pressable
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setSelectedYear(selectedYear + 1)}
                >
                  <Text className="text-gray-900 font-semibold">+</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <ScrollView className="flex-1 px-4 py-4">
          {viewMode === "month" ? (
            // MONTH VIEW - Show all categories for one month
            !currentReport ? (
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-gray-500 text-center">Loading report...</Text>
              </View>
            ) : (
            <>
              {/* 1. Releasees Met Section */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">1. Releasees Met</Text>
                <Text className="text-sm text-gray-500 mb-3">Manual input for each facility</Text>

                <View className="space-y-3">
                  <View>
                    <Text className="text-gray-700 mb-1">Pam Lychner</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={pamLychner}
                      onChangeText={setPamLychner}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Huntsville</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={huntsville}
                      onChangeText={setHuntsville}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Plane State Jail</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={planeStateJail}
                      onChangeText={setPlaneStateJail}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Havins Unit</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={havinsUnit}
                      onChangeText={setHavinsUnit}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Clemens Unit</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={clemensUnit}
                      onChangeText={setClemensUnit}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Other</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={other}
                      onChangeText={setOther}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  {/* Total Display */}
                  <View className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                    <Text className="text-gray-700 mb-1">Total Releasees Met</Text>
                    <Text className="text-2xl font-bold text-indigo-900">
                      {formatNumber(
                        (parseInt(pamLychner) || 0) +
                        (parseInt(huntsville) || 0) +
                        (parseInt(planeStateJail) || 0) +
                        (parseInt(havinsUnit) || 0) +
                        (parseInt(clemensUnit) || 0) +
                        (parseInt(other) || 0)
                      )}
                    </Text>
                  </View>

                  {canEdit && (
                    <Pressable
                      className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                      onPress={handleSaveReleaseFacilityCounts}
                    >
                      <Text className="text-white text-center font-semibold">Save Releasees Met</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* 2. Calls Section */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">2. Calls</Text>
                <Text className="text-sm text-gray-500 mb-3">Manual input for call metrics</Text>

                <View className="space-y-3">
                  <View>
                    <Text className="text-gray-700 mb-1">Inbound</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={inbound}
                      onChangeText={setInbound}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Outbound</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={outbound}
                      onChangeText={setOutbound}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  {/* Divider */}
                  <View className="border-t border-gray-200 my-2" />

                  <View>
                    <Text className="text-gray-700 mb-1 font-semibold">Missed Calls (%)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={missedCallsPercent}
                      onChangeText={setMissedCallsPercent}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      editable={canEdit}
                    />
                    <Text className="text-xs text-gray-500 mt-1">Enter as number (e.g., 15.5 for 15.5%)</Text>
                  </View>

                  <Text className="text-sm font-semibold text-gray-700 mt-2">Missed Calls Breakdown:</Text>

                  <View>
                    <Text className="text-gray-700 mb-1">Hung up prior to welcome message (%)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={hungUpPriorToWelcome}
                      onChangeText={setHungUpPriorToWelcome}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Hung up within 10 seconds of waiting (%)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={hungUpWithin10Seconds}
                      onChangeText={setHungUpWithin10Seconds}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Missed call due to users not answering (%)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={missedDueToNoAnswer}
                      onChangeText={setMissedDueToNoAnswer}
                      keyboardType="decimal-pad"
                      placeholder="0.0"
                      editable={canEdit}
                    />
                  </View>

                  {/* Breakdown Total Display */}
                  <View className={`p-3 rounded-lg border ${
                    Math.abs(subcategoryTotal - (parseFloat(missedCallsPercent) || 0)) < 0.01
                      ? "bg-green-50 border-green-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <Text className="text-gray-700 mb-1">Breakdown Total</Text>
                    <Text className="text-xl font-bold text-gray-900">
                      {formatPercentage(subcategoryTotal)}
                    </Text>
                    {Math.abs(subcategoryTotal - (parseFloat(missedCallsPercent) || 0)) >= 0.01 && (
                      <Text className="text-xs text-yellow-700 mt-1">
                        Should equal Missed Calls % ({formatPercentage(parseFloat(missedCallsPercent) || 0)})
                      </Text>
                    )}
                  </View>

                  {canEdit && (
                    <Pressable
                      className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                      onPress={handleSaveCallMetrics}
                    >
                      <Text className="text-white text-center font-semibold">Save Call Metrics</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* 3. Bridge Team Metrics (Auto-Calculated) */}
              {currentReport.bridgeTeamMetrics?.participantsReceived && (
                <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <Text className="text-lg font-bold text-gray-900 mb-3">3. Bridge Team</Text>
                  <Text className="text-sm text-gray-500 mb-3">Auto-calculated from app data</Text>

                  <View className="space-y-2">
                    {/* Participants Received */}
                    <View className="flex-row justify-between py-2 border-b border-gray-100">
                      <Text className="text-gray-700">Participants Received</Text>
                      <Text className="text-gray-900 font-semibold">
                        {formatNumber(currentReport.bridgeTeamMetrics.participantsReceived.manualOverride ?? currentReport.bridgeTeamMetrics.participantsReceived.autoCalculated)}
                      </Text>
                    </View>

                    {/* Status Counts */}
                    <View className="mt-2">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">Status Activity:</Text>

                      <View className="flex-row justify-between py-1 pl-4">
                        <Text className="text-gray-600">Pending Bridge</Text>
                        <Text className="text-gray-900">
                          {formatNumber(currentReport.bridgeTeamMetrics.statusCounts?.pendingBridge?.manualOverride ?? currentReport.bridgeTeamMetrics.statusCounts?.pendingBridge?.autoCalculated ?? 0)}
                        </Text>
                      </View>

                      <View className="flex-row justify-between py-1 pl-4">
                        <Text className="text-gray-600">Attempted to Contact</Text>
                        <Text className="text-gray-900">
                          {formatNumber(currentReport.bridgeTeamMetrics.statusCounts?.attemptedToContact?.manualOverride ?? currentReport.bridgeTeamMetrics.statusCounts?.attemptedToContact?.autoCalculated ?? 0)}
                        </Text>
                      </View>

                      <View className="flex-row justify-between py-1 pl-4">
                        <Text className="text-gray-600">Contacted</Text>
                        <Text className="text-gray-900">
                          {formatNumber(currentReport.bridgeTeamMetrics.statusCounts?.contacted?.manualOverride ?? currentReport.bridgeTeamMetrics.statusCounts?.contacted?.autoCalculated ?? 0)}
                        </Text>
                      </View>

                      <View className="flex-row justify-between py-1 pl-4">
                        <Text className="text-gray-600">Unable to Contact</Text>
                        <Text className="text-gray-900">
                          {formatNumber(currentReport.bridgeTeamMetrics.statusCounts?.unableToContact?.manualOverride ?? currentReport.bridgeTeamMetrics.statusCounts?.unableToContact?.autoCalculated ?? 0)}
                        </Text>
                      </View>
                    </View>

                    {/* Average Days to First Outreach */}
                    <View className="flex-row justify-between py-2 border-t border-gray-100 mt-2 pt-2">
                      <Text className="text-gray-700">Avg Days to First Outreach</Text>
                      <Text className="text-gray-900 font-semibold">
                        {formatNumber(currentReport.bridgeTeamMetrics.averageDaysToFirstOutreach?.manualOverride ?? currentReport.bridgeTeamMetrics.averageDaysToFirstOutreach?.autoCalculated ?? 0)} days
                      </Text>
                    </View>

                    {/* Forms by Day of Week */}
                    {currentReport.bridgeTeamMetrics.formsByDayOfWeek && (
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Forms Received by Day:</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {Object.entries(currentReport.bridgeTeamMetrics.formsByDayOfWeek)
                            .filter(([key]) => key !== "topDay")
                            .map(([day, count]) => (
                              <View key={day} className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                <Text className="text-xs text-gray-600 capitalize">{day.substring(0, 3)}</Text>
                                <Text className="text-sm font-bold text-gray-900">{String(count)}</Text>
                              </View>
                            ))}
                        </View>
                        <View className="mt-2 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-200">
                          <Text className="text-sm text-indigo-900">
                            <Text className="font-semibold">Top Day: </Text>
                            {currentReport.bridgeTeamMetrics.formsByDayOfWeek.topDay}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* 4. Mentorship Metrics (Auto-Calculated) */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">4. Mentorship</Text>
                <Text className="text-sm text-gray-500 mb-3">Auto-calculated from app data</Text>

                <View className="flex-row justify-between py-2">
                  <Text className="text-gray-700">Participants Assigned to Mentorship</Text>
                  <Text className="text-gray-900 font-semibold">{formatNumber(currentReport.mentorshipMetrics.participantsAssignedToMentorship)}</Text>
                </View>
              </View>

              {/* 5. Donors Section */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">5. Donors</Text>

                <View className="space-y-3">
                  <View>
                    <Text className="text-gray-700 mb-1">New Donors</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={newDonors}
                      onChangeText={setNewDonors}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Amount from New Donors</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={amountFromNewDonors}
                      onChangeText={setAmountFromNewDonors}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Checks</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={checks}
                      onChangeText={setChecks}
                      keyboardType="number-pad"
                      placeholder="0"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Total from Checks</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={totalFromChecks}
                      onChangeText={setTotalFromChecks}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      editable={canEdit}
                    />
                  </View>

                  {canEdit && (
                    <Pressable
                      className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                      onPress={handleSaveDonorData}
                    >
                      <Text className="text-white text-center font-semibold">Save Donor Data</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* 6. Financials Section */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">6. Financials</Text>

                <View className="space-y-3">
                  <View>
                    <Text className="text-gray-700 mb-1">Beginning Balance (Month Start)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={beginningBalance}
                      onChangeText={setBeginningBalance}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Ending Balance (Month End)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={endingBalance}
                      onChangeText={setEndingBalance}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      editable={canEdit}
                    />
                  </View>

                  <View className="bg-gray-100 p-3 rounded-lg">
                    <Text className="text-gray-700 mb-1">Difference (Auto-Calculated)</Text>
                    <Text className="text-2xl font-bold text-gray-900">
                      {formatCurrency((parseFloat(endingBalance) || 0) - (parseFloat(beginningBalance) || 0))}
                    </Text>
                  </View>

                  {canEdit && (
                    <Pressable
                      className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                      onPress={handleSaveFinancialData}
                    >
                      <Text className="text-white text-center font-semibold">Save Financial Data</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* 7. Social Media Metrics */}
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-3">7. Social Media Metrics</Text>

                <View className="space-y-3">
                  <View>
                    <Text className="text-gray-700 mb-1">Reels/Post Views</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={reelsPostViews}
                      onChangeText={setReelsPostViews}
                      placeholder="Combined reels and post views"
                      keyboardType="number-pad"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Views from Non-Followers (%)</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={viewsFromNonFollowers}
                      onChangeText={setViewsFromNonFollowers}
                      placeholder="Percentage (e.g., 45 for 45%)"
                      keyboardType="decimal-pad"
                      editable={canEdit}
                    />
                    <Text className="text-xs text-gray-500 mt-1">Enter as a percentage (0-100)</Text>
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Total Followers</Text>
                    <TextInput
                      className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                      value={followers}
                      onChangeText={setFollowers}
                      placeholder="Current follower count"
                      keyboardType="number-pad"
                      editable={canEdit}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-700 mb-1">Followers Gained (+/-)</Text>
                    <View className="flex-row items-center gap-2">
                      {/* Plus/Minus Buttons */}
                      <View className="flex-row border border-gray-300 rounded-lg overflow-hidden">
                        <Pressable
                          onPress={() => setFollowersGainedSign("plus")}
                          disabled={!canEdit}
                          className={`px-4 py-3 ${
                            followersGainedSign === "plus" ? "bg-green-500" : "bg-gray-50"
                          }`}
                        >
                          <Ionicons
                            name="add"
                            size={24}
                            color={followersGainedSign === "plus" ? "white" : "#6B7280"}
                          />
                        </Pressable>
                        <View className="w-px bg-gray-300" />
                        <Pressable
                          onPress={() => setFollowersGainedSign("minus")}
                          disabled={!canEdit}
                          className={`px-4 py-3 ${
                            followersGainedSign === "minus" ? "bg-red-500" : "bg-gray-50"
                          }`}
                        >
                          <Ionicons
                            name="remove"
                            size={24}
                            color={followersGainedSign === "minus" ? "white" : "#6B7280"}
                          />
                        </Pressable>
                      </View>

                      {/* Number Input */}
                      <TextInput
                        className="flex-1 bg-gray-50 px-4 py-3 rounded-lg border border-gray-300"
                        value={followersGained}
                        onChangeText={setFollowersGained}
                        placeholder="Enter number"
                        keyboardType="number-pad"
                        editable={canEdit}
                      />
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">
                      {followersGainedSign === "plus" ? "Gained followers" : "Lost followers"}
                    </Text>
                  </View>

                  {canEdit && (
                    <Pressable
                      className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                      onPress={handleSaveSocialMediaMetrics}
                    >
                      <Text className="text-white text-center font-semibold">Save Social Media Metrics</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* 8. Wins & Concerns (Admin Only) */}
              {isAdmin && (
                <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <Text className="text-lg font-bold text-gray-900 mb-3">8. Wins & Concerns</Text>

                  {/* Wins Section */}
                  <View className="mb-6">
                    <Text className="text-base font-semibold text-gray-900 mb-2">Wins (up to 5)</Text>
                    {[0, 1, 2, 3, 4].map((index) => (
                      <View key={`win-${index}`} className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <Text className="text-xs text-gray-600 mb-2">Win #{index + 1} (Optional)</Text>
                        <TextInput
                          className="bg-white px-3 py-2 rounded-lg border border-gray-300 mb-2"
                          value={wins[index]?.title || ""}
                          onChangeText={(text) => {
                            const newWins = [...wins];
                            if (!newWins[index]) newWins[index] = { title: "", body: "" };
                            newWins[index].title = text;
                            setWins(newWins);
                          }}
                          placeholder="Title (e.g., Record Donations)"
                          editable={canEdit}
                        />
                        <TextInput
                          className="bg-white px-3 py-2 rounded-lg border border-gray-300"
                          value={wins[index]?.body || ""}
                          onChangeText={(text) => {
                            const newWins = [...wins];
                            if (!newWins[index]) newWins[index] = { title: "", body: "" };
                            newWins[index].body = text;
                            setWins(newWins);
                          }}
                          placeholder="Description..."
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          editable={canEdit}
                        />
                      </View>
                    ))}
                  </View>

                  {/* Concerns Section */}
                  <View className="mb-4">
                    <Text className="text-base font-semibold text-gray-900 mb-2">Concerns (up to 5)</Text>
                    {[0, 1, 2, 3, 4].map((index) => (
                      <View key={`concern-${index}`} className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <Text className="text-xs text-gray-600 mb-2">Concern #{index + 1} (Optional)</Text>
                        <TextInput
                          className="bg-white px-3 py-2 rounded-lg border border-gray-300 mb-2"
                          value={concerns[index]?.title || ""}
                          onChangeText={(text) => {
                            const newConcerns = [...concerns];
                            if (!newConcerns[index]) newConcerns[index] = { title: "", body: "" };
                            newConcerns[index].title = text;
                            setConcerns(newConcerns);
                          }}
                          placeholder="Title (e.g., Funding Shortfall)"
                          editable={canEdit}
                        />
                        <TextInput
                          className="bg-white px-3 py-2 rounded-lg border border-gray-300"
                          value={concerns[index]?.body || ""}
                          onChangeText={(text) => {
                            const newConcerns = [...concerns];
                            if (!newConcerns[index]) newConcerns[index] = { title: "", body: "" };
                            newConcerns[index].body = text;
                            setConcerns(newConcerns);
                          }}
                          placeholder="Description..."
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          editable={canEdit}
                        />
                      </View>
                    ))}
                  </View>

                  <Pressable
                    className="bg-indigo-600 px-4 py-3 rounded-lg mt-2"
                    onPress={handleSaveWinsAndConcerns}
                  >
                    <Text className="text-white text-center font-semibold">Save Wins & Concerns</Text>
                  </Pressable>
                </View>
              )}
            </>
            )
          ) : (
            // CATEGORY VIEW - Show one category for all 12 months
            yearReports.length === 0 ? (
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-gray-500 text-center">Loading reports...</Text>
              </View>
            ) : (
              <View className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <Text className="text-lg font-bold text-gray-900 mb-2 capitalize">{selectedCategory}</Text>
                <Text className="text-sm text-gray-500 mb-1">Enter data for each month of {selectedYear}</Text>
                <Text className="text-xs text-gray-400 mb-4">Type numbers only. Use &quot;N/A&quot; for months with no data.</Text>

                {selectedCategory === "releasees" && (
                  <View className="space-y-4">
                    {["pamLychner", "huntsville", "planeStateJail", "havinsUnit", "clemensUnit", "other"].map((field) => {
                      const stats = calculateCategoryStats(field);
                      return (
                        <View key={field} className="border-b border-gray-100 pb-4">
                          <Text className="text-base font-semibold text-gray-900 mb-3 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </Text>
                          <View className="flex-row flex-wrap">
                            {yearReports.map((report) => {
                              const key = `${report.month}-${field}`;
                              const inputValue = categoryInputs[key] || "N/A";
                              return (
                                <View key={report.month} className="w-1/3 p-1">
                                  <Text className="text-xs text-gray-600 mb-1">{months[report.month - 1].substring(0, 3)}</Text>
                                  <TextInput
                                    className="bg-gray-50 px-2 py-2 rounded border border-gray-300 text-sm"
                                    value={inputValue === "N/A" ? "" : inputValue}
                                    onChangeText={(value) => handleCategoryInputChange(report.month, field, value)}
                                    onBlur={() => {
                                      const currentValue = categoryInputs[key] || "";
                                      handleSaveCategoryData(report.month, field, currentValue === "" ? "N/A" : currentValue);
                                    }}
                                    keyboardType="number-pad"
                                    placeholder="N/A"
                                    editable={canEdit}
                                  />
                                </View>
                              );
                            })}
                          </View>
                          {/* Stats Summary */}
                          <View className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-sm text-gray-700">Total:</Text>
                              <Text className="text-sm font-semibold text-indigo-900">{formatNumber(stats.total)}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-700">Average ({stats.count} months):</Text>
                              <Text className="text-sm font-semibold text-indigo-900">{formatNumber(stats.average, 1)}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {selectedCategory === "calls" && (
                  <View className="space-y-4">
                    {["inbound", "outbound", "missedCallsPercent", "hungUpPriorToWelcome", "hungUpWithin10Seconds", "missedDueToNoAnswer"].map((field) => {
                      const stats = calculateCategoryStats(field);
                      const isPercentage = field.includes("Percent") || field.includes("hung") || field.includes("missed");
                      return (
                        <View key={field} className="border-b border-gray-100 pb-4">
                          <Text className="text-base font-semibold text-gray-900 mb-3 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                            {isPercentage ? " (%)" : ""}
                          </Text>
                          <View className="flex-row flex-wrap">
                            {yearReports.map((report) => {
                              const key = `${report.month}-${field}`;
                              const inputValue = categoryInputs[key] || "N/A";
                              return (
                                <View key={report.month} className="w-1/3 p-1">
                                  <Text className="text-xs text-gray-600 mb-1">{months[report.month - 1].substring(0, 3)}</Text>
                                  <TextInput
                                    className="bg-gray-50 px-2 py-2 rounded border border-gray-300 text-sm"
                                    value={inputValue === "N/A" ? "" : inputValue}
                                    onChangeText={(value) => handleCategoryInputChange(report.month, field, value)}
                                    onBlur={() => {
                                      const currentValue = categoryInputs[key] || "";
                                      handleSaveCategoryData(report.month, field, currentValue === "" ? "N/A" : currentValue);
                                    }}
                                    keyboardType={isPercentage ? "decimal-pad" : "number-pad"}
                                    placeholder="N/A"
                                    editable={canEdit}
                                  />
                                </View>
                              );
                            })}
                          </View>
                          {/* Stats Summary */}
                          <View className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-sm text-gray-700">Total:</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isPercentage ? formatPercentage(stats.total, 1) : formatNumber(stats.total)}
                              </Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-700">Average ({stats.count} months):</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isPercentage ? formatPercentage(stats.average, 1) : formatNumber(stats.average, 1)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {selectedCategory === "donors" && (
                  <View className="space-y-4">
                    {["newDonors", "amountFromNewDonors", "checks", "totalFromChecks"].map((field) => {
                      const stats = calculateCategoryStats(field);
                      const isCurrency = field.includes("amount") || field.includes("total");
                      return (
                        <View key={field} className="border-b border-gray-100 pb-4">
                          <Text className="text-base font-semibold text-gray-900 mb-3 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </Text>
                          <View className="flex-row flex-wrap">
                            {yearReports.map((report) => {
                              const key = `${report.month}-${field}`;
                              const inputValue = categoryInputs[key] || "N/A";
                              return (
                                <View key={report.month} className="w-1/3 p-1">
                                  <Text className="text-xs text-gray-600 mb-1">{months[report.month - 1].substring(0, 3)}</Text>
                                  <TextInput
                                    className="bg-gray-50 px-2 py-2 rounded border border-gray-300 text-sm"
                                    value={inputValue === "N/A" ? "" : inputValue}
                                    onChangeText={(value) => handleCategoryInputChange(report.month, field, value)}
                                    onBlur={() => {
                                      const currentValue = categoryInputs[key] || "";
                                      handleSaveCategoryData(report.month, field, currentValue === "" ? "N/A" : currentValue);
                                    }}
                                    keyboardType={isCurrency ? "decimal-pad" : "number-pad"}
                                    placeholder="N/A"
                                    editable={canEdit}
                                  />
                                </View>
                              );
                            })}
                          </View>
                          {/* Stats Summary */}
                          <View className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-sm text-gray-700">Total:</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isCurrency ? formatCurrency(stats.total) : formatNumber(stats.total)}
                              </Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-700">Average ({stats.count} months):</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isCurrency ? formatCurrency(stats.average) : formatNumber(stats.average, 1)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {selectedCategory === "financials" && (
                  <View className="space-y-4">
                    {["beginningBalance", "endingBalance"].map((field) => {
                      const stats = calculateCategoryStats(field);
                      return (
                        <View key={field} className="border-b border-gray-100 pb-4">
                          <Text className="text-base font-semibold text-gray-900 mb-3 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                          </Text>
                          <View className="flex-row flex-wrap">
                            {yearReports.map((report) => {
                              const key = `${report.month}-${field}`;
                              const inputValue = categoryInputs[key] || "N/A";
                              return (
                                <View key={report.month} className="w-1/3 p-1">
                                  <Text className="text-xs text-gray-600 mb-1">{months[report.month - 1].substring(0, 3)}</Text>
                                  <TextInput
                                    className="bg-gray-50 px-2 py-2 rounded border border-gray-300 text-sm"
                                    value={inputValue === "N/A" ? "" : inputValue}
                                    onChangeText={(value) => handleCategoryInputChange(report.month, field, value)}
                                    onBlur={() => {
                                      const currentValue = categoryInputs[key] || "";
                                      handleSaveCategoryData(report.month, field, currentValue === "" ? "N/A" : currentValue);
                                    }}
                                    keyboardType="decimal-pad"
                                    placeholder="N/A"
                                    editable={canEdit}
                                  />
                                </View>
                              );
                            })}
                          </View>
                          {/* Stats Summary */}
                          <View className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-sm text-gray-700">Total:</Text>
                              <Text className="text-sm font-semibold text-indigo-900">{formatCurrency(stats.total)}</Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-700">Average ({stats.count} months):</Text>
                              <Text className="text-sm font-semibold text-indigo-900">{formatCurrency(stats.average)}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {selectedCategory === "social_media" && (
                  <View className="space-y-4">
                    {["reelsPostViews", "viewsFromNonFollowers", "followers", "followersGained"].map((field) => {
                      const stats = calculateCategoryStats(field);
                      const isPercentage = field === "viewsFromNonFollowers";
                      return (
                        <View key={field} className="border-b border-gray-100 pb-4">
                          <Text className="text-base font-semibold text-gray-900 mb-3 capitalize">
                            {field.replace(/([A-Z])/g, " $1").trim()}
                            {isPercentage ? " (%)" : ""}
                          </Text>
                          <View className="flex-row flex-wrap">
                            {yearReports.map((report) => {
                              const key = `${report.month}-${field}`;
                              const inputValue = categoryInputs[key] || "N/A";
                              return (
                                <View key={report.month} className="w-1/3 p-1">
                                  <Text className="text-xs text-gray-600 mb-1">{months[report.month - 1].substring(0, 3)}</Text>
                                  <TextInput
                                    className="bg-gray-50 px-2 py-2 rounded border border-gray-300 text-sm"
                                    value={inputValue === "N/A" ? "" : inputValue}
                                    onChangeText={(value) => handleCategoryInputChange(report.month, field, value)}
                                    onBlur={() => {
                                      const currentValue = categoryInputs[key] || "";
                                      handleSaveCategoryData(report.month, field, currentValue === "" ? "N/A" : currentValue);
                                    }}
                                    keyboardType={isPercentage ? "decimal-pad" : "number-pad"}
                                    placeholder="N/A"
                                    editable={canEdit}
                                  />
                                </View>
                              );
                            })}
                          </View>
                          {/* Stats Summary */}
                          <View className="mt-3 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <View className="flex-row justify-between mb-1">
                              <Text className="text-sm text-gray-700">Total:</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isPercentage ? formatPercentage(stats.total, 1) : formatNumber(stats.total)}
                              </Text>
                            </View>
                            <View className="flex-row justify-between">
                              <Text className="text-sm text-gray-700">Average ({stats.count} months):</Text>
                              <Text className="text-sm font-semibold text-indigo-900">
                                {isPercentage ? formatPercentage(stats.average, 1) : formatNumber(stats.average)}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {selectedCategory === "wins_concerns" && (
                  <View className="space-y-4">
                    <Text className="text-base text-gray-600 mb-4">
                      Wins & Concerns are displayed below for each month. View details in Month View for full entries.
                    </Text>
                    {yearReports.map((report) => (
                      <View key={report.month} className="border border-gray-200 rounded-lg p-4 mb-3">
                        <Text className="text-base font-bold text-gray-900 mb-3">
                          {months[report.month - 1]} {report.year}
                        </Text>

                        {/* Wins */}
                        <View className="mb-3">
                          <Text className="text-sm font-semibold text-green-700 mb-2">
                            Wins ({report.wins?.length || 0})
                          </Text>
                          {report.wins && report.wins.length > 0 ? (
                            report.wins.map((win: any, index: number) => (
                              <View key={index} className="mb-2 pl-3 border-l-2 border-green-400">
                                <Text className="text-sm font-semibold text-gray-900">{win.title}</Text>
                                <Text className="text-xs text-gray-600">{win.body}</Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-xs text-gray-400 italic">No wins entered</Text>
                          )}
                        </View>

                        {/* Concerns */}
                        <View>
                          <Text className="text-sm font-semibold text-red-700 mb-2">
                            Concerns ({report.concerns?.length || 0})
                          </Text>
                          {report.concerns && report.concerns.length > 0 ? (
                            report.concerns.map((concern: any, index: number) => (
                              <View key={index} className="mb-2 pl-3 border-l-2 border-red-400">
                                <Text className="text-sm font-semibold text-gray-900">{concern.title}</Text>
                                <Text className="text-xs text-gray-600">{concern.body}</Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-xs text-gray-400 italic">No concerns entered</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )
          )}

          <View className="h-20" />
        </ScrollView>

        {/* Month/Year Picker Modal */}
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

        {/* Category Picker Modal */}
        <Modal
          visible={showCategoryPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryPicker(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-3xl p-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">Select Category</Text>
                <Pressable onPress={() => setShowCategoryPicker(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </Pressable>
              </View>

              {/* Category Options */}
              <View className="space-y-2">
                {[
                  { value: "releasees", label: "Releasees Met", icon: "people" },
                  { value: "calls", label: "Phone Calls", icon: "call" },
                  { value: "donors", label: "Donors", icon: "heart" },
                  { value: "financials", label: "Financials", icon: "cash" },
                  { value: "social_media", label: "Social Media", icon: "logo-instagram" },
                  { value: "wins_concerns", label: "Wins & Concerns", icon: "star" },
                ].map((category) => (
                  <Pressable
                    key={category.value}
                    className={`flex-row items-center p-4 rounded-lg border ${
                      selectedCategory === category.value
                        ? "bg-indigo-50 border-indigo-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                    onPress={() => {
                      setSelectedCategory(category.value as any);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={selectedCategory === category.value ? "#4F46E5" : "#6B7280"}
                    />
                    <Text
                      className={`ml-3 text-lg font-semibold ${
                        selectedCategory === category.value ? "text-indigo-900" : "text-gray-900"
                      }`}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>

        {/* Post Confirmation Modal */}
        <Modal
          visible={showPostModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPostModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <View className="bg-white rounded-lg p-6 w-full max-w-md">
              <View className="items-center mb-4">
                <View className="w-16 h-16 bg-yellow-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="cloud-upload-outline" size={32} color="#F59E0B" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Post Report?</Text>
                <Text className="text-gray-600 text-center">
                  This will publish the {months[selectedMonth - 1]} {selectedYear} report for board member viewing. Once posted, board members will be able to see this report.
                </Text>
              </View>

              <View className="space-y-2">
                <Pressable
                  onPress={handlePostReport}
                  disabled={isPosting}
                  className="bg-yellow-600 rounded-lg p-4"
                >
                  <Text className="text-white text-center font-bold">
                    {isPosting ? "Posting..." : "Yes, Post Report"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setShowPostModal(false)}
                  disabled={isPosting}
                  className="bg-gray-200 rounded-lg p-4"
                >
                  <Text className="text-gray-700 text-center font-semibold">Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
