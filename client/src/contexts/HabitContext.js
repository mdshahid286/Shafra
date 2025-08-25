import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { habitsService, habitLogsService } from '../firebase/habitsService';
import { useAuth } from './AuthContext';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState([]);
  
  // Refs for cleanup
  const habitsUnsubscribe = useRef(null);
  const logsUnsubscribe = useRef(null);

  // Setup real-time listeners for habits
  const setupHabitsListener = useCallback(() => {
    if (!user) return;
    
    // Cleanup existing listener
    if (habitsUnsubscribe.current) {
      habitsUnsubscribe.current();
    }
    
    try {
      // Simple query without orderBy to avoid index requirements
      const habitsQuery = query(
        collection(db, 'habits'),
        where('userId', '==', user.uid)
      );
      
      habitsUnsubscribe.current = onSnapshot(habitsQuery, 
        (snapshot) => {
          const habitsData = [];
          snapshot.forEach((doc) => {
            habitsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          // Sort by createdAt in JavaScript instead of Firestore
          habitsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
            const bTime = b.createdAt?.toDate?.() || b.createdAt || new Date(0);
            return bTime - aTime;
          });
          setHabits(habitsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error listening to habits:', error);
          // Don't set error immediately, try fallback first
          console.log('Attempting fallback to regular fetch for habits...');
        }
      );
    } catch (error) {
      console.error('Failed to setup habits listener:', error);
      throw error; // Let the fallback handle it
    }
  }, [user]);

  // Setup real-time listeners for habit logs
  const setupLogsListener = useCallback(() => {
    if (!user) return;
    
    // Cleanup existing listener
    if (logsUnsubscribe.current) {
      logsUnsubscribe.current();
    }
    
    try {
      // Simple query without orderBy to avoid index requirements
      const logsQuery = query(
        collection(db, 'habitLogs'),
        where('userId', '==', user.uid)
      );
      
      logsUnsubscribe.current = onSnapshot(logsQuery, 
        (snapshot) => {
          const logsData = [];
          snapshot.forEach((doc) => {
            logsData.push({
              id: doc.id,
              ...doc.data()
            });
          });
          // Sort by date in JavaScript instead of Firestore
          logsData.sort((a, b) => {
            const aDate = a.date || '';
            const bDate = b.date || '';
            return bDate.localeCompare(aDate);
          });
          setHabitLogs(logsData);
        },
        (error) => {
          console.error('Error listening to habit logs:', error);
          // Don't set error immediately, try fallback first
          console.log('Attempting fallback to regular fetch for habit logs...');
        }
      );
    } catch (error) {
      console.error('Failed to setup logs listener:', error);
      throw error; // Let the fallback handle it
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
  }, [habits, user]);

  // Fetch habit logs for specific date range (for dashboard)
  const fetchHabitLogs = useCallback(async (startDate, endDate) => {
    if (!user || fetchingLogs) return;
    
    try {
      setFetchingLogs(true);
      
      if (startDate && endDate) {
        const logs = await habitLogsService.getHabitLogs(startDate, endDate, user.uid);
        // Note: We don't set habitLogs here as it's managed by real-time listener
        return logs;
      } else {
        // If no date range specified, fetch all logs for the current month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const startDateStr = startOfMonth.toISOString().split('T')[0];
        const endDateStr = endOfMonth.toISOString().split('T')[0];
        
        const logs = await habitLogsService.getHabitLogs(startDateStr, endDateStr, user.uid);
        return logs;
      }
    } catch (err) {
      console.error('Error fetching habit logs:', err);
      return [];
    } finally {
      setFetchingLogs(false);
    }
  }, [user, fetchingLogs]);

  // Create new habit with offline support
  const createHabit = async (habitData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newHabit = await habitsService.createHabit(habitData, user.uid);
      // Note: Real-time listener will update the habits state automatically
      return newHabit;
    } catch (err) {
      // If offline, add to pending operations
      if (!isOnline) {
        const pendingOp = {
          type: 'CREATE_HABIT',
          data: { habitData, userId: user.uid },
          timestamp: Date.now()
        };
        setPendingOperations(prev => [...prev, pendingOp]);
        
        // Optimistically update local state
        const optimisticHabit = {
          id: `temp_${Date.now()}`,
          ...habitData,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setHabits(prev => [...prev, optimisticHabit]);
        return optimisticHabit;
      }
      
      setError('Failed to create habit');
      throw err;
    }
  };

  // Update habit with offline support
  const updateHabit = async (id, habitData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const updatedHabit = await habitsService.updateHabit(id, habitData);
      // Note: Real-time listener will update the habits state automatically
      return updatedHabit;
    } catch (err) {
      // If offline, add to pending operations
      if (!isOnline) {
        const pendingOp = {
          type: 'UPDATE_HABIT',
          data: { habitId: id, habitData },
          timestamp: Date.now()
        };
        setPendingOperations(prev => [...prev, pendingOp]);
        
        // Optimistically update local state
        setHabits(prev => prev.map(habit => 
          habit.id === id ? { ...habit, ...habitData, updatedAt: new Date() } : habit
        ));
        return { id, ...habitData };
      }
      
      setError('Failed to update habit');
      throw err;
    }
  };

  // Delete habit with offline support
  const deleteHabit = async (id) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await habitsService.deleteHabit(id);
      // Note: Real-time listener will update the habits state automatically
    } catch (err) {
      // If offline, add to pending operations
      if (!isOnline) {
        const pendingOp = {
          type: 'DELETE_HABIT',
          data: { habitId: id },
          timestamp: Date.now()
        };
        setPendingOperations(prev => [...prev, pendingOp]);
        
        // Optimistically update local state
        setHabits(prev => prev.filter(habit => habit.id !== id));
        setHabitLogs(prev => prev.filter(log => log.habitId !== id));
        return;
      }
      
      setError('Failed to delete habit');
      throw err;
    }
  };

  // Mark habit as completed with offline support
  const toggleHabitCompletion = async (id, completed) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setUpdatingHabit(true);
      const today = new Date().toISOString().split('T')[0];
      
      // Toggle the habit completion for today
      await habitLogsService.toggleHabitCompletion(id, today, completed, user.uid);
      // Note: Real-time listener will update the habitLogs state automatically
    } catch (err) {
      // If offline, add to pending operations
      if (!isOnline) {
        const today = new Date().toISOString().split('T')[0];
        const pendingOp = {
          type: 'TOGGLE_COMPLETION',
          data: { habitId: id, date: today, completed, userId: user.uid },
          timestamp: Date.now()
        };
        setPendingOperations(prev => [...prev, pendingOp]);
        
        // Optimistically update local state
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
              userId: user.uid,
              timestamp: new Date().toISOString()
            };
            return [...prevLogs, newLog];
          }
        });
        return;
      }
      
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

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize real-time listeners with fallback
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

    setLoading(true);
    
    // Try to setup real-time listeners, fallback to regular fetch if they fail
    const initializeData = async () => {
      try {
        // Setup real-time listeners
        setupHabitsListener();
        setupLogsListener();
        
        setInitialized(true);
        setLoading(false);
      } catch (error) {
        console.error('Failed to setup real-time listeners, falling back to regular fetch:', error);
        
        // Fallback to regular fetch
        try {
          const habitsData = await habitsService.getHabits(user.uid);
          setHabits(habitsData);
          
          const logs = await habitLogsService.getAllHabitLogs(user.uid);
          setHabitLogs(logs);
          
          setInitialized(true);
        } catch (fetchError) {
          console.error('Fallback fetch also failed:', fetchError);
          setError('Failed to load data');
        } finally {
          setLoading(false);
        }
      }
    };
    
    // Add a small delay to avoid rapid retries
    const timeoutId = setTimeout(initializeData, 100);
    
    return () => clearTimeout(timeoutId);
  }, [user, initialized, setupHabitsListener, setupLogsListener]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      if (habitsUnsubscribe.current) {
        habitsUnsubscribe.current();
      }
      if (logsUnsubscribe.current) {
        logsUnsubscribe.current();
      }
    };
  }, []);

  // Update today's progress whenever habits or habitLogs change
  useEffect(() => {
    if (!user || !initialized) return;
    
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = habitLogs.filter(log => log.date === today);
    const completedToday = todayLogs.filter(log => log.completed).length;
    const totalHabits = habits.length;
    const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    
    setTodayProgress({
      completed: completedToday,
      total: totalHabits,
      percentage
    });
  }, [habits, habitLogs, user, initialized]);

  // Sync pending operations when coming back online
  useEffect(() => {
    if (isOnline && pendingOperations.length > 0) {
      const syncPendingOperations = async () => {
        const operations = [...pendingOperations];
        setPendingOperations([]);
        
        for (const operation of operations) {
          try {
            switch (operation.type) {
              case 'CREATE_HABIT':
                await habitsService.createHabit(operation.data.habitData, operation.data.userId);
                break;
              case 'UPDATE_HABIT':
                await habitsService.updateHabit(operation.data.habitId, operation.data.habitData);
                break;
              case 'DELETE_HABIT':
                await habitsService.deleteHabit(operation.data.habitId);
                break;
              case 'TOGGLE_COMPLETION':
                await habitLogsService.toggleHabitCompletion(
                  operation.data.habitId,
                  operation.data.date,
                  operation.data.completed,
                  operation.data.userId
                );
                break;
              default:
                console.warn('Unknown operation type:', operation.type);
            }
          } catch (error) {
            console.error('Error syncing operation:', error);
            // Re-add failed operations to pending
            setPendingOperations(prev => [...prev, operation]);
          }
        }
      };
      
      syncPendingOperations();
    }
  }, [isOnline, pendingOperations]);

  const value = {
    habits,
    habitLogs,
    todayProgress,
    loading,
    updatingHabit,
    error,
    initialized,
    fetchingLogs,
    isOnline,
    pendingOperations,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
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
