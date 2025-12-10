import { create } from "zustand";
import { ref, set as firebaseSet, onValue, update as firebaseUpdate } from "firebase/database";
import { database } from "../config/firebase";
import { Task, TaskStatus, TaskFormResponse } from "../types";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
}

interface TaskActions {
  createTask: (task: Omit<Task, "id" | "createdAt" | "status">) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus, userId: string, completionComment?: string) => Promise<void>;
  submitTaskForm: (taskId: string, formResponse: TaskFormResponse[], userId: string, completionComment?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createRecurringTask: (completedTask: Task) => Promise<void>;
  getTasksForUser: (userId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getOverdueTasks: () => Task[];
  initializeFirebaseListener: () => void;
}

type TaskStore = TaskState & TaskActions;

let isListenerInitialized = false;

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    // Prevent multiple listener initializations
    if (isListenerInitialized) {
      console.log("⚠️ Tasks listener already initialized, skipping...");
      return;
    }

    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    console.log("🔥 Initializing tasks Firebase listener...");
    isListenerInitialized = true;

    const tasksRef = ref(database, "tasks");

    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.values(data) as Task[];

        // Auto-update overdue tasks
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of today

        const updatedTasks = tasksArray.map((task) => {
          if (
            task.status !== "completed" &&
            task.dueDate
          ) {
            // Parse the due date
            const parts = task.dueDate.split("-");
            if (parts.length === 3) {
              const [year, month, day] = parts.map(Number);
              const dueDate = new Date(year, month - 1, day);
              dueDate.setHours(0, 0, 0, 0); // Set to start of due date

              // Only mark as overdue if current date is AFTER the due date (not on the same day)
              if (now.getTime() > dueDate.getTime()) {
                return { ...task, status: "overdue" as TaskStatus };
              }
            }
          }
          return task;
        });

        console.log(`✅ Loaded ${updatedTasks.length} tasks from Firebase`);
        set({ tasks: updatedTasks, isLoading: false });
      } else {
        console.log("✅ No tasks in Firebase, setting empty array");
        set({ tasks: [], isLoading: false });
      }
    }, (error) => {
      console.warn("Tasks listener unavailable");
      set({ isLoading: false });
    });
  },

  createTask: async (taskData) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    // Clean the taskData object to remove any undefined values
    const cleanedData = Object.entries(taskData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);

    const newTask: Task = {
      ...cleanedData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const taskRef = ref(database, `tasks/${newTask.id}`);
    await firebaseSet(taskRef, newTask);
  },

  updateTaskStatus: async (taskId, status, userId, completionComment) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = {
      status,
    };

    if (status === "completed") {
      updates.completedAt = new Date().toISOString();
      if (completionComment?.trim()) {
        updates.completionComment = completionComment.trim();
      }

      // If this is a recurring task, create a new instance
      if (task.isRecurring && task.recurringFrequency && task.dueDate) {
        await get().createRecurringTask(task);
      }
    }

    const taskRef = ref(database, `tasks/${taskId}`);
    await firebaseUpdate(taskRef, updates);
  },

  submitTaskForm: async (taskId, formResponse, userId, completionComment) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updates: Partial<Task> = {
      formResponse,
      status: "completed",
      completedAt: new Date().toISOString(),
    };

    if (completionComment?.trim()) {
      updates.completionComment = completionComment.trim();
    }

    const taskRef = ref(database, `tasks/${taskId}`);
    await firebaseUpdate(taskRef, updates);

    // If this is a recurring task, create a new instance
    if (task.isRecurring && task.recurringFrequency && task.dueDate) {
      await get().createRecurringTask(task);
    }
  },

  createRecurringTask: async (completedTask: Task) => {
    if (!database || !completedTask.dueDate || !completedTask.recurringFrequency) {
      return;
    }

    // Calculate next due date based on frequency
    const parts = completedTask.dueDate.split("-");
    if (parts.length !== 3) return;

    const [year, month, day] = parts.map(Number);
    const currentDueDate = new Date(year, month - 1, day);

    let nextDueDate = new Date(currentDueDate);

    switch (completedTask.recurringFrequency) {
      case "daily":
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case "weekly":
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case "monthly":
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
    }

    // Format next due date as YYYY-MM-DD
    const nextYear = nextDueDate.getFullYear();
    const nextMonth = String(nextDueDate.getMonth() + 1).padStart(2, "0");
    const nextDay = String(nextDueDate.getDate()).padStart(2, "0");
    const nextDueDateString = `${nextYear}-${nextMonth}-${nextDay}`;

    // Create new task with same properties but new due date
    const newTaskData: any = {
      title: completedTask.title,
      description: completedTask.description,
      assignedToUserId: completedTask.assignedToUserId,
      assignedToUserName: completedTask.assignedToUserName,
      assignedToUserRole: completedTask.assignedToUserRole,
      assignedByUserId: completedTask.assignedByUserId,
      assignedByUserName: completedTask.assignedByUserName,
      priority: completedTask.priority,
      dueDate: nextDueDateString,
      isRecurring: true,
      recurringFrequency: completedTask.recurringFrequency,
      recurringParentId: completedTask.recurringParentId || completedTask.id,
    };

    // Copy optional fields if they exist
    if (completedTask.customForm) {
      newTaskData.customForm = completedTask.customForm;
    }
    if (completedTask.relatedParticipantId) {
      newTaskData.relatedParticipantId = completedTask.relatedParticipantId;
      newTaskData.relatedParticipantName = completedTask.relatedParticipantName;
    }

    await get().createTask(newTaskData);
  },

  deleteTask: async (taskId) => {
    if (!database) {
      throw new Error("Firebase not configured. Please add Firebase credentials in ENV tab.");
    }

    const taskRef = ref(database, `tasks/${taskId}`);
    await firebaseSet(taskRef, null);
  },

  getTasksForUser: (userId) => {
    return get().tasks.filter((task) => task.assignedToUserId === userId);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  getOverdueTasks: () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today

    return get().tasks.filter((task) => {
      if (task.status === "completed" || !task.dueDate) return false;

      // Parse the due date
      const parts = task.dueDate.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        const dueDate = new Date(year, month - 1, day);
        dueDate.setHours(0, 0, 0, 0);

        // Only overdue if current date is AFTER the due date (not on the same day)
        return now.getTime() > dueDate.getTime();
      }
      return false;
    });
  },
}));

// Selectors
export const useUserTasks = (userId: string) =>
  useTaskStore((s) => s.tasks.filter((task) => task.assignedToUserId === userId));

export const useAllTasks = () => useTaskStore((s) => s.tasks);
