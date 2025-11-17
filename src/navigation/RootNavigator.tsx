import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useCurrentUser, useUserRole } from "../state/authStore";

// Screens
import LoginScreen from "../screens/LoginScreen";
import ChangePasswordScreen from "../screens/ChangePasswordScreen";
import IntakeFormScreen from "../screens/IntakeFormScreen";
import IntakeFormLinkScreen from "../screens/IntakeFormLinkScreen";
import PublicFormLinkScreen from "../screens/PublicFormLinkScreen";
import LiveFormLinkScreen from "../screens/LiveFormLinkScreen";
import EditIntakeFormScreen from "../screens/EditIntakeFormScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import BridgeTeamDashboardScreen from "../screens/BridgeTeamDashboardScreen";
import MentorshipLeaderDashboardScreen from "../screens/MentorshipLeaderDashboardScreen";
import MentorDashboardScreen from "../screens/MentorDashboardScreen";
import ParticipantProfileScreen from "../screens/ParticipantProfileScreen";
import MergeParticipantsScreen from "../screens/MergeParticipantsScreen";
import ContactFormScreen from "../screens/ContactFormScreen";
import BridgeTeamFollowUpFormScreen from "../screens/BridgeTeamFollowUpFormScreen";
import MoveToMentorshipScreen from "../screens/MoveToMentorshipScreen";
import AssignMentorScreen from "../screens/AssignMentorScreen";
import InitialContactFormScreen from "../screens/InitialContactFormScreen";
import MonthlyUpdateFormScreen from "../screens/MonthlyUpdateFormScreen";
import MonthlyReportFormScreen from "../screens/MonthlyReportFormScreen";
import WeeklyUpdateFormScreen from "../screens/WeeklyUpdateFormScreen";
import MonthlyCheckInFormScreen from "../screens/MonthlyCheckInFormScreen";
import GraduationApprovalScreen from "../screens/GraduationApprovalScreen";
import ResourcesScreen from "../screens/ResourcesScreen";
import AllParticipantsScreen from "../screens/AllParticipantsScreen";
import FilteredParticipantsScreen from "../screens/FilteredParticipantsScreen";
import AdminMentorshipAssignmentScreen from "../screens/AdminMentorshipAssignmentScreen";
import ManualIntakeFormScreen from "../screens/ManualIntakeFormScreen";
import ManageUsersScreen from "../screens/ManageUsersScreen";
import AddUserScreen from "../screens/AddUserScreen";
import EditUserScreen from "../screens/EditUserScreen";
import EditResourceScreen from "../screens/EditResourceScreen";
import MentorshipScreen from "../screens/MentorshipScreen";
import SchedulerScreen from "../screens/SchedulerScreen";
import CreateMeetingScreen from "../screens/CreateMeetingScreen";
import ManageShiftsScreen from "../screens/ManageShiftsScreen";
import AssignUserToShiftScreen from "../screens/AssignUserToShiftScreen";
import TaskListScreen from "../screens/TaskListScreen";
import TaskDetailScreen from "../screens/TaskDetailScreen";
import AdminTaskManagementScreen from "../screens/AdminTaskManagementScreen";
import CompletedTasksScreen from "../screens/CompletedTasksScreen";
import GuidanceTasksScreen from "../screens/GuidanceTasksScreen";
import ReportingScreen from "../screens/ReportingScreen";
import HomepageScreen from "../screens/HomepageScreen";
import MyMenteesScreen from "../screens/MyMenteesScreen";
import AdminHomepageScreen from "../screens/AdminHomepageScreen";
import TestEmailScreen from "../screens/TestEmailScreen";
import MonthlyReportingScreen from "../screens/MonthlyReportingScreen";
import ManageReportingScreen from "../screens/ManageReportingScreen";
import ViewReportingScreen from "../screens/ViewReportingScreen";
import BoardHomeScreen from "../screens/BoardHomeScreen";
import EmbeddableFormScreen from "../screens/EmbeddableFormScreen";
import FileManagementScreen from "../screens/FileManagementScreen";
import ManageFormsScreen from "../screens/ManageFormsScreen";
import EditFormQuestionsScreen from "../screens/EditFormQuestionsScreen";
import TaskManagementScreen from "../screens/TaskManagementScreen";
import IntakeTypeSelectionScreen from "../screens/IntakeTypeSelectionScreen";
import MissedCallNoVoicemailFormScreen from "../screens/MissedCallNoVoicemailFormScreen";
import MissedCallVoicemailFormScreen from "../screens/MissedCallVoicemailFormScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab navigator for authenticated users
function MainTabs() {
  const userRole = useUserRole();

  // Determine if user is a mentor or mentorship leader (they get the 4-tab layout)
  const isMentor = userRole === "mentor" || userRole === "mentorship_leader";
  const isVolunteer = userRole === "volunteer" || userRole === "volunteer_support";
  const isSupporter = userRole === "supporter";

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fcc85c",
        tabBarInactiveTintColor: "#99896c",
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 88,
          borderTopWidth: 1,
          borderTopColor: "#d7d7d6",
          backgroundColor: "#f8f8f8",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      {/* Admin sees homepage as home with 6 tabs */}
      {userRole === "admin" && (
        <>
          <Tab.Screen
            name="AdminHomepage"
            component={AdminHomepageScreen}
            options={{
              tabBarLabel: "Homepage",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Users"
            component={ManageUsersScreen}
            options={{
              tabBarLabel: "Users",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskManagementScreen}
            options={{
              tabBarLabel: "Tasks",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="checkbox" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Scheduler"
            component={SchedulerScreen}
            options={{
              tabBarLabel: "Scheduler",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MonthlyReporting"
            component={MonthlyReportingScreen}
            options={{
              tabBarLabel: "Reporting",
              tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Bridge Team Leader sees admin view but only for Bridge Team items */}
      {userRole === "bridge_team_leader" && (
        <>
          <Tab.Screen
            name="AdminHomepage"
            component={AdminHomepageScreen}
            options={{
              tabBarLabel: "Homepage",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Users"
            component={ManageUsersScreen}
            options={{
              tabBarLabel: "Users",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskManagementScreen}
            options={{
              tabBarLabel: "Tasks",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="checkbox" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Scheduler"
            component={SchedulerScreen}
            options={{
              tabBarLabel: "Scheduler",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MonthlyReporting"
            component={MonthlyReportingScreen}
            options={{
              tabBarLabel: "Reporting",
              tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Bridge Team sees their queue */}
      {userRole === "bridge_team" && (
        <>
          <Tab.Screen
            name="BridgeTeamDashboard"
            component={BridgeTeamDashboardScreen}
            options={{
              tabBarLabel: "Queue",
              tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Scheduler"
            component={SchedulerScreen}
            options={{
              tabBarLabel: "Scheduler",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "My Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Board Members see Board Home, Scheduler, Tasks, and Monthly Reporting */}
      {userRole === "board_member" && (
        <>
          <Tab.Screen
            name="BoardHome"
            component={BoardHomeScreen}
            options={{
              tabBarLabel: "Home",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Scheduler"
            component={SchedulerScreen}
            options={{
              tabBarLabel: "Scheduler",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "My Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MonthlyReporting"
            component={MonthlyReportingScreen}
            options={{
              tabBarLabel: "Reporting",
              tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Volunteers see Homepage */}
      {isVolunteer && (
        <>
          <Tab.Screen
            name="Homepage"
            component={HomepageScreen}
            options={{
              tabBarLabel: "Homepage",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "My Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Mentors see MentorDashboardScreen as first tab */}
      {userRole === "mentor" && (
        <>
          <Tab.Screen
            name="Homepage"
            component={MentorDashboardScreen}
            options={{
              tabBarLabel: "Homepage",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MyMentees"
            component={MyMenteesScreen}
            options={{
              tabBarLabel: "My Mentees",
              tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "My Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Mentorship Leaders see MentorshipLeaderDashboardScreen as first tab */}
      {userRole === "mentorship_leader" && (
        <>
          <Tab.Screen
            name="Homepage"
            component={MentorshipLeaderDashboardScreen}
            options={{
              tabBarLabel: "Homepage",
              tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MyMentees"
            component={MyMenteesScreen}
            options={{
              tabBarLabel: "My Mentees",
              tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "My Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Tasks"
            component={AdminTaskManagementScreen}
            options={{
              tabBarLabel: "Assign Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="MonthlyReporting"
            component={MonthlyReportingScreen}
            options={{
              tabBarLabel: "Reporting",
              tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="Resources"
            component={ResourcesScreen}
            options={{
              tabBarLabel: "Resources",
              tabBarIcon: ({ color, size}) => <Ionicons name="document-text" size={size} color={color} />,
            }}
          />
        </>
      )}

      {/* Supporters see only Schedule and Tasks (only tasks they assigned or are assigned to) */}
      {isSupporter && (
        <>
          <Tab.Screen
            name="Scheduler"
            component={SchedulerScreen}
            options={{
              tabBarLabel: "Schedule",
              tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
            }}
          />
          <Tab.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              tabBarLabel: "Tasks",
              tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" size={size} color={color} />,
            }}
          />
        </>
      )}
    </Tab.Navigator>
  );
}

// Root navigator
export default function RootNavigator() {
  const currentUser = useCurrentUser();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!currentUser ? (
        // Auth flow - only login for staff
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        // Authenticated flow
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="IntakeForm" component={IntakeFormScreen} />
          <Stack.Screen name="IntakeFormLink" component={IntakeFormLinkScreen} />
          <Stack.Screen name="PublicFormLink" component={PublicFormLinkScreen} />
          <Stack.Screen name="LiveFormLink" component={LiveFormLinkScreen} />
          <Stack.Screen name="EditIntakeForm" component={EditIntakeFormScreen} />
          <Stack.Screen name="AllParticipants" component={AllParticipantsScreen} />
          <Stack.Screen name="FilteredParticipants" component={FilteredParticipantsScreen} />
          <Stack.Screen name="AdminMentorshipAssignment" component={AdminMentorshipAssignmentScreen} />
          <Stack.Screen name="IntakeTypeSelection" component={IntakeTypeSelectionScreen} />
          <Stack.Screen name="ManualIntakeForm" component={ManualIntakeFormScreen} />
          <Stack.Screen name="MissedCallNoVoicemailForm" component={MissedCallNoVoicemailFormScreen} />
          <Stack.Screen name="MissedCallVoicemailForm" component={MissedCallVoicemailFormScreen} />
          <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
          <Stack.Screen name="AddUser" component={AddUserScreen} />
          <Stack.Screen name="EditUser" component={EditUserScreen} />
          <Stack.Screen name="ParticipantProfile" component={ParticipantProfileScreen} />
          <Stack.Screen name="MergeParticipants" component={MergeParticipantsScreen} />
          <Stack.Screen name="ContactForm" component={ContactFormScreen} />
          <Stack.Screen name="BridgeTeamFollowUpForm" component={BridgeTeamFollowUpFormScreen} />
          <Stack.Screen name="MoveToMentorship" component={MoveToMentorshipScreen} />
          <Stack.Screen name="AssignMentor" component={AssignMentorScreen} />
          <Stack.Screen name="InitialContactForm" component={InitialContactFormScreen} />
          <Stack.Screen name="MonthlyUpdateForm" component={MonthlyUpdateFormScreen} />
          <Stack.Screen name="MonthlyReportForm" component={MonthlyReportFormScreen} />
          <Stack.Screen name="WeeklyUpdateForm" component={WeeklyUpdateFormScreen} />
          <Stack.Screen name="MonthlyCheckInForm" component={MonthlyCheckInFormScreen} />
          <Stack.Screen name="GraduationApproval" component={GraduationApprovalScreen} />
          <Stack.Screen name="EditResource" component={EditResourceScreen} />
          <Stack.Screen name="Mentorship" component={MentorshipScreen} />
          <Stack.Screen name="SchedulerScreen" component={SchedulerScreen} />
          <Stack.Screen name="CreateMeeting" component={CreateMeetingScreen} />
          <Stack.Screen name="ManageShifts" component={ManageShiftsScreen} />
          <Stack.Screen name="AssignUserToShift" component={AssignUserToShiftScreen} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="AdminTaskManagement" component={AdminTaskManagementScreen} />
          <Stack.Screen name="CompletedTasks" component={CompletedTasksScreen} />
          <Stack.Screen name="GuidanceTasks" component={GuidanceTasksScreen} />
          <Stack.Screen name="Reporting" component={ReportingScreen} />
          <Stack.Screen name="MonthlyReporting" component={MonthlyReportingScreen} />
          <Stack.Screen name="ManageReporting" component={ManageReportingScreen} />
          <Stack.Screen name="ViewReporting" component={ViewReportingScreen} />
          <Stack.Screen name="EmbeddableForm" component={EmbeddableFormScreen} />
          <Stack.Screen name="TestEmail" component={TestEmailScreen} />
          <Stack.Screen name="FileManagement" component={FileManagementScreen} />
          <Stack.Screen name="ManageForms" component={ManageFormsScreen} />
          <Stack.Screen name="EditFormQuestions" component={EditFormQuestionsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
