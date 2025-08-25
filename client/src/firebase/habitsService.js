import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

// Collection names
const HABITS_COLLECTION = 'habits';
const HABIT_LOGS_COLLECTION = 'habitLogs';

// Habits CRUD operations
export const habitsService = {
  // Get all habits for a user
  async getHabits(userId) {
    try {
      const q = query(
        collection(db, HABITS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const habits = [];
      querySnapshot.forEach((doc) => {
        habits.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return habits;
    } catch (error) {
      console.error('Error getting habits:', error);
      throw error;
    }
  },

  // Create a new habit
  async createHabit(habitData, userId) {
    try {
      const docRef = await addDoc(collection(db, HABITS_COLLECTION), {
        ...habitData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return {
        id: docRef.id,
        ...habitData,
        userId
      };
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  // Update a habit
  async updateHabit(habitId, habitData) {
    try {
      const habitRef = doc(db, HABITS_COLLECTION, habitId);
      await updateDoc(habitRef, {
        ...habitData,
        updatedAt: serverTimestamp()
      });
      return {
        id: habitId,
        ...habitData
      };
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  // Delete a habit
  async deleteHabit(habitId) {
    try {
      await deleteDoc(doc(db, HABITS_COLLECTION, habitId));
      return habitId;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  }
};

// Habit Logs operations
export const habitLogsService = {
  // Get habit logs for a date range
  async getHabitLogs(startDate, endDate, userId) {
    try {
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        // Filter by date range in JavaScript instead of Firestore
        if (logData.date >= startDate && logData.date <= endDate) {
          logs.push({
            id: doc.id,
            ...logData
          });
        }
      });
      return logs;
    } catch (error) {
      console.error('Error getting habit logs:', error);
      throw error;
    }
  },

  // Get all habit logs for a user
  async getAllHabitLogs(userId) {
    try {
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const logs = [];
      querySnapshot.forEach((doc) => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return logs;
    } catch (error) {
      console.error('Error getting all habit logs:', error);
      throw error;
    }
  },

  // Toggle habit completion for a specific date
  async toggleHabitCompletion(habitId, date, completed, userId) {
    try {
      // Check if log already exists for this habit and date
      const existingLogQuery = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const existingLogSnapshot = await getDocs(existingLogQuery);
      
      // Find existing log in JavaScript instead of Firestore query
      const existingLog = existingLogSnapshot.docs.find(doc => 
        doc.data().habitId === habitId && doc.data().date === date
      );
      
      if (existingLog) {
        // Update existing log
        await updateDoc(doc(db, HABIT_LOGS_COLLECTION, existingLog.id), {
          completed,
          updatedAt: serverTimestamp()
        });
        return {
          id: existingLog.id,
          habitId,
          date,
          completed,
          userId
        };
      } else {
        // Create new log
        const docRef = await addDoc(collection(db, HABIT_LOGS_COLLECTION), {
          habitId,
          date,
          completed,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return {
          id: docRef.id,
          habitId,
          date,
          completed,
          userId
        };
      }
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      throw error;
    }
  },

  // Get today's progress for a user
  async getTodayProgress(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, HABIT_LOGS_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const todayLogs = [];
      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        // Filter by date in JavaScript instead of Firestore
        if (logData.date === today) {
          todayLogs.push({
            id: doc.id,
            ...logData
          });
        }
      });
      return todayLogs;
    } catch (error) {
      console.error('Error getting today\'s progress:', error);
      throw error;
    }
  }
};
