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
  getTasksForUser: (userId: string) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getOverdueTasks: () => Task[];
  initializeFirebaseListener: () => void;
}

type TaskStore = TaskState & TaskActions;

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  isLoading: false,

  // Initialize Firebase real-time listener
  initializeFirebaseListener: () => {
    if (!database) {
      console.warn("Firebase not configured. Using local state only.");
      set({ isLoading: false });
      return;
    }

    const tasksRef = ref(database, "tasks");

    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.values(data) as Task[];

        // Auto-update overdue tasks
        const now = new Date();
        const updatedTasks = tasksArray.map((task) => {
          if (
            task.status !== "completed" &&
            task.dueDate &&
            new Date(task.dueDate) < now
          ) {
            return { ...task, status: "overdue" as TaskStatus };
          }
          return task;
        });

        set({ tasks: updatedTasks, isLoading: false });
      } else {
        set({ tasks: [], isLoading: false });
      }
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
    return get().tasks.filter(
      (task) =>
        task.status !== "completed" &&
        task.dueDate &&
        new Date(task.dueDate) < now
    );
  },
}));

// Selectors
export const useUserTasks = (userId: string) =>
  useTaskStore((s) => s.tasks.filter((task) => task.assignedToUserId === userId));

export const useAllTasks = () => useTaskStore((s) => s.tasks);
