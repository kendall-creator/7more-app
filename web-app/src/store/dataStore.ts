import { create } from "zustand";
import { ref, onValue, get as firebaseGet } from "firebase/database";
import { database } from "../config/firebase";
import { Participant, Task, Shift } from "../types";

interface DataState {
  participants: Participant[];
  tasks: Task[];
  shifts: Shift[];
  isLoading: boolean;
}

interface DataActions {
  initializeListeners: () => void;
}

type DataStore = DataState & DataActions;

export const useDataStore = create<DataStore>()((set) => ({
  participants: [],
  tasks: [],
  shifts: [],
  isLoading: true,

  initializeListeners: () => {
    if (!database) {
      console.warn("Firebase not configured");
      set({ isLoading: false });
      return;
    }

    // Participants listener
    const participantsRef = ref(database, "participants");
    firebaseGet(participantsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const participantsArray = Object.values(data) as Participant[];
          set({ participants: participantsArray });
        }
      })
      .catch(console.error);

    onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsArray = Object.values(data) as Participant[];
        set({ participants: participantsArray });
      }
    });

    // Tasks listener
    const tasksRef = ref(database, "tasks");
    firebaseGet(tasksRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const tasksArray = Object.values(data) as Task[];
          set({ tasks: tasksArray });
        }
      })
      .catch(console.error);

    onValue(tasksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const tasksArray = Object.values(data) as Task[];
        set({ tasks: tasksArray });
      }
    });

    // Shifts listener
    const shiftsRef = ref(database, "shifts");
    firebaseGet(shiftsRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const shiftsArray = Object.values(data) as Shift[];
          set({ shifts: shiftsArray, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      })
      .catch((error) => {
        console.error(error);
        set({ isLoading: false });
      });

    onValue(shiftsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shiftsArray = Object.values(data) as Shift[];
        set({ shifts: shiftsArray });
      }
    });
  },
}));
