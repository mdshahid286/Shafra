import React, { useState, useEffect, useRef } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit, Trash2, CheckCircle, Circle, Target, Flame, Calendar, User, LogOut } from 'lucide-react';
import HabitForm from '../components/HabitForm';
import { AnimatedText } from '../components/ui/animated-underline-text-one';
import { BackgroundAnimation } from '../components/ui/background-animation';
import { startOfWeek, endOfWeek, isSameDay, isBefore, addDays, format } from 'date-fns';
import './Home.css';

const Home = () => {
  const { 
    habits, 
    habitLogs,
    todayProgress, 
    loading, 
    createHabit,
    updateHabit,
    toggleHabitCompletion, 
    deleteHabit,
    getTodayCompletionStatus,
    updatingHabit
  } = useHabits();
  
  const { user, signOut } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const userProfileRef = useRef(null);
  const [weeklyHabitStats, setWeeklyHabitStats] = useState({});

  // Close user profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target)) {
        setShowUserProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate weekly stats for each habit
  useEffect(() => {
    const calculateWeeklyStats = () => {
      const today = new Date();
      const start = startOfWeek(today, { weekStartsOn: 0 }); // Sunday as start of week
      const end = endOfWeek(today, { weekStartsOn: 0 });

      const stats = {};
      habits.forEach(habit => {
        let completedThisWeek = 0;
        let missedThisWeek = 0;

        let currentDate = start;
        while (isBefore(currentDate, addDays(end, 1))) { // Iterate through each day of the week
          const dateString = format(currentDate, 'yyyy-MM-dd');
          const log = habitLogs.find(l => l.habitId === habit.id && l.date === dateString);

          if (isBefore(currentDate, today) || isSameDay(currentDate, today)) {
            if (log) {
              if (log.completed) {
                completedThisWeek++;
              } else {
                missedThisWeek++;
              }
            } else {
              // If no log exists for a past/current day, it's considered missed
              missedThisWeek++;
            }
          }
          currentDate = addDays(currentDate, 1);
        }
        stats[habit.id] = { completedThisWeek, missedThisWeek };
      });
      setWeeklyHabitStats(stats);
    };

    if (habits.length > 0 || habitLogs.length > 0) {
      calculateWeeklyStats();
    }
  }, [habits, habitLogs]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserProfile(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleToggleHabit = async (habitId) => {
    try {
      const isCompleted = getTodayCompletionStatus(habitId);
      const today = new Date().toISOString().split('T')[0];
      await toggleHabitCompletion(habitId, today, !isCompleted);
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await deleteHabit(habitId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'namaz':
        return '🕌';
      case 'quran':
        return '📖';
      case 'zikr':
        return '✨';
      default:
        return '📝';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'namaz':
        return '#4F46E5';
      case 'quran':
        return '#059669';
      case 'zikr':
        return '#DC2626';
      default:
        return '#7C3AED';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your habits...</p>
      </div>
    );
  }

  // Don't show stats if we don't have proper data yet
  if (habits.length === 0) {
    return (
      <div className="home relative">
        <BackgroundAnimation />
        <div className="home-header">
          <h1>Today's Progress</h1>
          <div className="header-actions">
            <button 
              className="add-habit-btn"
              onClick={() => setShowForm(true)}
            >
              <Plus size={20} />
              Add Habit
            </button>
          </div>
        </div>

        <div className="empty-state">
          <p>No habits yet. Create your first habit to get started!</p>
        </div>

        {/* Habit Form Modal */}
        {showForm && (
          <HabitForm
            onClose={() => setShowForm(false)}
            onSubmit={async (habitData) => {
              try {
                await createHabit(habitData);
                setShowForm(false);
              } catch (err) {
                console.error('Error creating habit:', err);
              }
            }}
          />
        )}

        {/* Bottom Spacer to ensure content can scroll above navbar */}
        <div className="bottom-spacer"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="page-header">
        {/* User Profile */}
        <div className="user-profile-container">
          <button 
            className="user-profile-btn"
            onClick={() => setShowUserProfile(!showUserProfile)}
            title="User Profile"
          >
            <User size={20} />
          </button>
          
          {showUserProfile && (
            <div className="user-profile-card" ref={userProfileRef}>
              <div className="user-info">
                <div className="user-avatar">
                  <User size={24} />
                </div>
                <div className="user-details">
                  <h4>{user?.displayName || 'User'}</h4>
                  <p>{user?.email || 'No email'}</p>
                </div>
              </div>
              <button 
                className="logout-btn"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Message with Animated Text */}
      <div className="welcome-section relative">
        <BackgroundAnimation />
        <div className="logo-container">
          <img 
            src="/logo.png" 
            alt="Shafra Logo" 
            className="app-logo"
          />
        </div>
        <AnimatedText 
          text="Shafra" 
          textClassName="shafra-title"
          underlineClassName="text-yellow-400"
          underlinePath="M 0,10 Q 75,0 150,10 Q 225,20 300,10"
          underlineHoverPath="M 0,10 Q 75,20 150,10 Q 225,0 300,10"
          underlineDuration={2}
        />
        <p className="text-center text-white/80 text-lg mb-8">
          Simple ticks. Stronger faith.
        </p>
      </div>

      <div className="home-header">
        <h1>Today's Progress</h1>
        <div className="header-actions">
          <button 
            className="add-habit-btn"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Add Habit
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="progress-summary">
        <div className="progress-card">
          <div className="progress-icon">
            <Target size={24} />
          </div>
          <div className="progress-info">
            <h3>{todayProgress.completed || 0}/{todayProgress.total || 0}</h3>
            <p>Completed Today</p>
          </div>
        </div>
        
        <div className="progress-card">
          <div className="progress-icon">
            <Calendar size={24} />
          </div>
          <div className="progress-info">
            <h3>{todayProgress.percentage || 0}%</h3>
            <p>Daily Goal</p>
          </div>
        </div>
        
        <div className="progress-card">
          <div className="progress-icon">
            <Flame size={24} />
          </div>
          <div className="progress-info">
            <h3>{Math.max(...(habits.map(h => h.streak || 0)), 0)}</h3>
            <p>Best Streak</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${Math.max(0, Math.min(100, todayProgress.percentage || 0))}%` 
            }}
          ></div>
        </div>
        <span className="progress-text">
          {todayProgress.completed || 0} of {todayProgress.total || 0} habits completed
        </span>
      </div>

      {/* Habits List */}
      <div className="habits-section">
        <h2>Your Habits</h2>
        {habits.length === 0 ? (
          <div className="empty-state">
            <p>No habits yet. Create your first habit to get started!</p>
          </div>
        ) : (
          <div className="habits-grid">
            {habits.map(habit => {
              const isCompletedToday = getTodayCompletionStatus(habit.id);
              return (
                <div key={habit.id} className="habit-card">
                  <div className="habit-header">
                    <div className="habit-category">
                      <span className="category-icon">
                        {getCategoryIcon(habit.category)}
                      </span>
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: getCategoryColor(habit.category) }}
                      >
                        {habit.category}
                      </span>
                    </div>
                    <div className="habit-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => setEditingHabit(habit)}
                        title="Edit habit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setShowDeleteConfirm(habit.id)}
                        title="Delete habit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="habit-content">
                    <h3 className="habit-name">{habit.name}</h3>
                    {habit.description && (
                      <p className="habit-description">{habit.description}</p>
                    )}
                  </div>
                  
                  <div className="habit-stats">
                    <div className="stat">
                      <CheckCircle size={16} />
                      <span>{weeklyHabitStats[habit.id]?.completedThisWeek || 0} completed this week</span>
                    </div>
                    <div className="stat">
                      <Circle size={16} />
                      <span>{weeklyHabitStats[habit.id]?.missedThisWeek || 0} missed this week</span>
                    </div>
                  </div>
                  
                  <div className="habit-toggle">
                    <button
                      className={`toggle-btn ${isCompletedToday ? 'completed' : ''}`}
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={updatingHabit}
                    >
                      {updatingHabit ? (
                        <div className="loading-spinner-small"></div>
                      ) : isCompletedToday ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                      <span>{updatingHabit ? 'Updating...' : (isCompletedToday ? 'Completed' : 'Mark Complete')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Habit Form Modal */}
      {showForm && (
        <HabitForm
          onClose={() => setShowForm(false)}
          onSubmit={async (habitData) => {
            try {
              await createHabit(habitData);
              setShowForm(false);
            } catch (err) {
              console.error('Error creating habit:', err);
            }
          }}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <HabitForm
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSubmit={async (habitData) => {
            try {
              await updateHabit(editingHabit.id, habitData);
              setEditingHabit(null);
            } catch (err) {
              console.error('Error updating habit:', err);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Habit</h3>
            <p>Are you sure you want to delete this habit? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteHabit(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer to ensure content can scroll above navbar */}
      <div className="bottom-spacer"></div>
    </div>
  );
};

export default Home;
