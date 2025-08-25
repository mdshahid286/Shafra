import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { habitsService, habitLogsService } from '../firebase/habitsService';
import { useAuth } from './AuthContext';

const HabitContext = createContext();

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const HabitProvider = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [todayProgress, setTodayProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [updatingHabit, setUpdatingHabit] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [fetchingLogs, setFetchingLogs] = useState(false);

  // Fetch all habits
  const fetchHabits = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const habitsData = await habitsService.getHabits(user.uid);
      setHabits(habitsData);
    } catch (err) {
      setError('Failed to fetch habits');
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch today's progress
  const fetchTodayProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      const todayLogs = await habitLogsService.getTodayProgress(user.uid);
      const totalHabits = habits.length;
      const completedToday = todayLogs.filter(log => log.completed).length;
      const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
      
      setTodayProgress({
        completed: completedToday,
        total: totalHabits,
        percentage
      });
    } catch (err) {
      console.error('Error fetching today progress:', err);
    }
  }, [habits.length, user]);

  // Fetch habit logs
  const fetchHabitLogs = useCallback(async (startDate, endDate) => {
    if (!user || fetchingLogs) return;
    
    try {
      setFetchingLogs(true);
      
      if (startDate && endDate) {
        const logs = await habitLogsService.getHabitLogs(startDate, endDate, user.uid);
        setHabitLogs(logs);
      } else {
        // If no date range specified, fetch all logs for the current month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const startDateStr = startOfMonth.toISOString().split('T')[0];
        const endDateStr = endOfMonth.toISOString().split('T')[0];
        
        const logs = await habitLogsService.getHabitLogs(startDateStr, endDateStr, user.uid);
        setHabitLogs(logs);
      }
    } catch (err) {
      console.error('Error fetching habit logs:', err);
    } finally {
      setFetchingLogs(false);
    }
  }, [user, fetchingLogs]);

  // Create new habit
  const createHabit = async (habitData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newHabit = await habitsService.createHabit(habitData, user.uid);
      setHabits(prev => [...prev, newHabit]);
      
      // Update today's progress with the new habit
      setTodayProgress(prev => ({
        completed: prev.completed,
        total: prev.total + 1,
        percentage: Math.round((prev.completed / (prev.total + 1)) * 100)
      }));
      
      return newHabit;
    } catch (err) {
      setError('Failed to create habit');
      throw err;
    }
  };

  // Update habit
  const updateHabit = async (id, habitData) => {
    try {
      const updatedHabit = await habitsService.updateHabit(id, habitData);
      setHabits(prev => prev.map(habit => 
        habit.id === id ? updatedHabit : habit
      ));
      return updatedHabit;
    } catch (err) {
      setError('Failed to update habit');
      throw err;
    }
  };

  // Delete habit
  const deleteHabit = async (id) => {
    try {
      await habitsService.deleteHabit(id);
      
      // Get the habit that was deleted to check if it was completed today
      const deletedHabit = habits.find(h => h.id === id);
      const today = new Date().toISOString().split('T')[0];
      const wasCompletedToday = habitLogs.some(log => 
        log.habitId === id && log.date === today && log.completed
      );
      
      setHabits(prev => prev.filter(habit => habit.id !== id));
      setHabitLogs(prev => prev.filter(log => log.habitId !== id));
      
      // Update today's progress
      setTodayProgress(prev => {
        const newTotal = prev.total - 1;
        const newCompleted = wasCompletedToday ? prev.completed - 1 : prev.completed;
        const newPercentage = newTotal > 0 ? Math.round((newCompleted / newTotal) * 100) : 0;
        
        return {
          completed: newCompleted,
          total: newTotal,
          percentage: newPercentage
        };
      });
    } catch (err) {
      setError('Failed to delete habit');
      throw err;
    }
  };

  // Mark habit as completed
  const toggleHabitCompletion = async (id, completed) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setUpdatingHabit(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Toggle the habit completion for today
      await habitLogsService.toggleHabitCompletion(id, today, completed, user.uid);
      
      // Update local habit logs immediately for better UX
      setHabitLogs(prevLogs => {
        const existingLogIndex = prevLogs.findIndex(log => 
          log.habitId === id && log.date === today
        );
        
        if (existingLogIndex >= 0) {
          // Update existing log
          const updatedLogs = [...prevLogs];
          updatedLogs[existingLogIndex] = { ...updatedLogs[existingLogIndex], completed };
          return updatedLogs;
        } else {
          // Add new log
          const newLog = {
            id: `${id}_${today}`,
            habitId: id,
            date: today,
            completed,
            timestamp: new Date().toISOString()
          };
          return [...prevLogs, newLog];
        }
      });
      
      // Update today's progress immediately without fetching
      setTodayProgress(prev => {
        const totalHabits = habits.length;
        const completedToday = completed ? prev.completed + 1 : prev.completed - 1;
        const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        return {
          completed: completedToday,
          total: totalHabits,
          percentage
        };
      });
    } catch (err) {
      setError('Failed to update habit completion');
      throw err;
    } finally {
      setUpdatingHabit(false);
    }
  };

  // Get today's completion status for a specific habit
  const getTodayCompletionStatus = useCallback((habitId) => {
    const today = new Date().toISOString().split('T')[0];
    const todayLog = habitLogs.find(log => 
      log.habitId === habitId && log.date === today
    );
    return todayLog ? todayLog.completed : false;
  }, [habitLogs]);

  // Initialize data
  useEffect(() => {
    if (!user) {
      setHabits([]);
      setHabitLogs([]);
      setTodayProgress({ completed: 0, total: 0, percentage: 0 });
      setLoading(false);
      setInitialized(false);
      return;
    }

    // Prevent multiple initializations
    if (initialized) return;

    const initializeData = async () => {
      setLoading(true);
      try {
        // First fetch habits to get the total count
        const habitsData = await habitsService.getHabits(user.uid);
        setHabits(habitsData);
        
        // Then fetch habit logs and calculate progress
        const logs = await habitLogsService.getAllHabitLogs(user.uid);
        setHabitLogs(logs);
        
        // Calculate today's progress with the actual habits data
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = logs.filter(log => log.date === today);
        const completedToday = todayLogs.filter(log => log.completed).length;
        const totalHabits = habitsData.length;
        const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        
        setTodayProgress({
          completed: completedToday,
          total: totalHabits,
          percentage
        });
        
        setInitialized(true);
      } catch (err) {
        console.error('Error initializing data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user, initialized]);

  const value = {
    habits,
    habitLogs,
    todayProgress,
    loading,
    updatingHabit,
    error,
    initialized,
    fetchingLogs,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    fetchHabits,
    fetchTodayProgress,
    fetchHabitLogs,
    setError,
    getTodayCompletionStatus
  };

  return (
    <HabitContext.Provider value={value}>
      {children}
    </HabitContext.Provider>
  );
};
