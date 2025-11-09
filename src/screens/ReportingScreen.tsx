import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useParticipantStore } from "../state/participantStore";
import { Ionicons } from "@expo/vector-icons";
import { formatNumber } from "../utils/formatNumber";

export default function ReportingScreen() {
  const navigation = useNavigation<any>();
  const allParticipants = useParticipantStore((s) => s.participants);

  // Calculate age demographics
  const ageDemographics = useMemo(() => {
    const total = allParticipants.length;
    if (total === 0) return [];

    const ageRanges = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "56+": 0,
    };

    allParticipants.forEach((p) => {
      const age = p.age;
      if (age >= 18 && age <= 25) ageRanges["18-25"]++;
      else if (age >= 26 && age <= 35) ageRanges["26-35"]++;
      else if (age >= 36 && age <= 45) ageRanges["36-45"]++;
      else if (age >= 46 && age <= 55) ageRanges["46-55"]++;
      else if (age >= 56) ageRanges["56+"]++;
    });

    return Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    }));
  }, [allParticipants]);

  // Calculate gender demographics
  const genderDemographics = useMemo(() => {
    const total = allParticipants.length;
    if (total === 0) return [];

    const genderCounts: Record<string, number> = {};

    allParticipants.forEach((p) => {
      const gender = p.gender || "Not specified";
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    return Object.entries(genderCounts).map(([gender, count]) => ({
      gender,
      count,
      percentage: ((count / total) * 100).toFixed(1),
    }));
  }, [allParticipants]);

  // Calculate release location demographics
  const releaseLocationDemographics = useMemo(() => {
    const total = allParticipants.length;
    if (total === 0) return [];

    const locationCounts: Record<string, number> = {};

    allParticipants.forEach((p) => {
      const location = p.releasedFrom || "Not specified";
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    // Sort by count descending
    return Object.entries(locationCounts)
      .map(([location, count]) => ({
        location,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count);
  }, [allParticipants]);

  const renderDemographicSection = (
    title: string,
    icon: string,
    data: Array<{ label?: string; range?: string; gender?: string; location?: string; count: number; percentage: string }>,
    color: string
  ) => (
    <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
      <View className="flex-row items-center mb-4">
        <View className={`w-10 h-10 ${color} rounded-full items-center justify-center mr-3`}>
          <Ionicons name={icon as any} size={20} color="#fff" />
        </View>
        <Text className="text-lg font-bold text-gray-900">{title}</Text>
      </View>

      {data.length === 0 ? (
        <Text className="text-gray-500 text-center py-4">No data available</Text>
      ) : (
        <View className="gap-3">
          {data.map((item, index) => {
            const label = item.label || item.range || item.gender || item.location || "Unknown";
            return (
              <View key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-base text-gray-900 font-semibold">{label}</Text>
                  <Text className="text-base text-gray-900 font-bold">{item.percentage}%</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="flex-1 bg-gray-100 rounded-full h-2 mr-3">
                    <View
                      className={`${color} rounded-full h-2`}
                      style={{ width: `${parseFloat(item.percentage)}%` as any }}
                    />
                  </View>
                  <Text className="text-sm text-gray-600">{formatNumber(item.count)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-gray-600 pt-16 pb-6 px-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="flex-row items-center mb-4 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <Text className="text-white text-base ml-2 font-semibold">Back</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white mb-1">Demographics Report</Text>
        <Text className="text-yellow-100 text-sm">
          {formatNumber(allParticipants.length)} total participant{allParticipants.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Overview Card */}
        <View className="bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          <Text className="text-lg font-bold text-gray-900 mb-4">Overview</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-gray-50 rounded-xl p-4">
              <Text className="text-2xl font-bold text-gray-900">{formatNumber(allParticipants.length)}</Text>
              <Text className="text-xs text-gray-600 mt-1">Total Participants</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4">
              <Text className="text-2xl font-bold text-gray-900">{formatNumber(genderDemographics.length)}</Text>
              <Text className="text-xs text-gray-600 mt-1">Gender Categories</Text>
            </View>
            <View className="flex-1 bg-gray-50 rounded-xl p-4">
              <Text className="text-2xl font-bold text-gray-900">{formatNumber(releaseLocationDemographics.length)}</Text>
              <Text className="text-xs text-gray-600 mt-1">Release Locations</Text>
            </View>
          </View>
        </View>

        {/* Age Demographics */}
        {renderDemographicSection(
          "Age Distribution",
          "calendar-outline",
          ageDemographics.map((d) => ({ ...d, label: d.range })),
          "bg-blue-600"
        )}

        {/* Gender Demographics */}
        {renderDemographicSection(
          "Gender Distribution",
          "people-outline",
          genderDemographics.map((d) => ({ ...d, label: d.gender })),
          "bg-purple-600"
        )}

        {/* Release Location Demographics */}
        {renderDemographicSection(
          "Release Location Distribution",
          "location-outline",
          releaseLocationDemographics.map((d) => ({ ...d, label: d.location })),
          "bg-green-600"
        )}
      </ScrollView>
    </View>
  );
}
