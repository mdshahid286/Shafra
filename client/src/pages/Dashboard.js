import React, { useState, useEffect, useRef } from 'react';
import { useHabits } from '../contexts/HabitContext';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfWeek, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, User, LogOut } from 'lucide-react';
import { AnimatedText } from '../components/ui/animated-underline-text-one';
import { BackgroundAnimation } from '../components/ui/background-animation';
import './Dashboard.css';

const Dashboard = () => {
  const { habits, habitLogs, fetchHabitLogs, toggleHabitCompletion, updatingHabit, getTodayCompletionStatus, fetchingLogs } = useHabits();
  const { user, signOut } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [weekData, setWeekData] = useState([]);
  const lastFetchedWeek = useRef('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const userProfileRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const calendarRef = useRef(null);

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

  // Close calendar on outside click / Escape
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsCalendarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isCalendarOpen]);

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserProfile(false);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Calendar helpers
  const openCalendar = () => {
    setCalendarMonth(currentWeek);
    setIsCalendarOpen(true);
  };
  const changeMonth = (delta) => {
    const next = new Date(calendarMonth);
    next.setMonth(calendarMonth.getMonth() + delta);
    setCalendarMonth(next);
  };
  const getMonthMatrix = (date) => {
    const start = startOfWeek(new Date(date.getFullYear(), date.getMonth(), 1), { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };
  const handlePickDate = (day) => {
    setCurrentWeek(day);
    setIsCalendarOpen(false);
  };

  // Initialize week data
  useEffect(() => {
    if (currentWeek) {
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekDates = [];
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        weekDates.push(date);
      }
      
      setWeekData(weekDates);
    }
  }, [currentWeek]);

  // Fetch habit logs for the current week
  useEffect(() => {
    if (weekData.length > 0 && !fetchingLogs) {
      const startDate = format(weekData[0], 'yyyy-MM-dd');
      const endDate = format(weekData[weekData.length - 1], 'yyyy-MM-dd');
      const weekKey = `${startDate}-${endDate}`;
      
      // Only fetch if we haven't already fetched for this week
      if (lastFetchedWeek.current !== weekKey) {
        lastFetchedWeek.current = weekKey;
        fetchHabitLogs(startDate, endDate);
      }
    }
  }, [weekData, fetchHabitLogs, fetchingLogs]);

  const navigateWeek = (direction) => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      if (direction === 'next') {
        newDate.setDate(newDate.getDate() + 7);
      } else {
        newDate.setDate(newDate.getDate() - 7);
      }
      return newDate;
    });
  };

  const getHabitStatusForDate = (habitId, date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // If it's a future date, return null (not attempted yet)
    if (dateString > today) {
      return null;
    }
    
    // If it's today, use the helper function for consistency
    if (dateString === today) {
      return getTodayCompletionStatus(habitId);
    }
    
    // For past dates, check the logs
    const log = habitLogs.find(log => 
      log.habitId === habitId && log.date === dateString
    );
    return log ? log.completed : false;
  };

  const getStatusColor = (completed, isToday, isFuture) => {
    if (isFuture) {
      return '#9CA3AF'; // Light gray for future dates
    }
    if (isToday) {
      return completed ? '#10B981' : '#EF4444'; // Green for completed today, red for missed today
    }
    return completed ? '#10B981' : '#6B7280'; // Green for completed, gray for missed
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

  const calculateWeekStats = () => {
    const stats = {
      totalHabits: habits.length || 0,
      totalDays: weekData.length || 0,
      completedCount: 0,
      missedCount: 0,
      futureCount: 0
    };

    habits.forEach(habit => {
      weekData.forEach(date => {
        const status = getHabitStatusForDate(habit.id, date);
        if (status === true) {
          stats.completedCount++;
        } else if (status === false) {
          stats.missedCount++;
        } else {
          stats.futureCount++;
        }
      });
    });

    return stats;
  };

  const calculateOverallStats = () => {
    const stats = {
      totalHabits: habits.length || 0,
      totalCompleted: habitLogs.filter(log => log.completed).length || 0,
      totalMissed: habitLogs.filter(log => !log.completed).length || 0,
      totalDays: habitLogs.length || 0
    };

    return stats;
  };

  const weekStats = calculateWeekStats();
  const overallStats = calculateOverallStats();

  return (
    <div className="dashboard relative">
      <BackgroundAnimation />
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

      <div className="dashboard-header">
        <h1>Habit Dashboard</h1>
        <p>Track your daily progress and consistency</p>
        
        {updatingHabit && (
          <div className="updating-indicator">
            <div className="updating-spinner"></div>
            <span>Updating habit...</span>
          </div>
        )}
      </div>

      {/* Week Navigation Row */}
      <div className="week-navigation-row">
        <div className="week-navigation">
          <button 
            className="nav-btn"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="week-display" onClick={() => { setCalendarMonth(currentWeek); setIsCalendarOpen(true); }} style={{ cursor: 'pointer' }} title="Pick week">
            <Calendar size={20} />
            <span>
              {format(weekData[0] || new Date(), 'MMM d')} - {format(weekData[weekData.length - 1] || new Date(), 'MMM d, yyyy')}
            </span>
          </div>
          
          <button 
            className="nav-btn"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Dashboard Statistics Row */}
      <div className="dashboard-stats-row">
        <div className="week-stats">
          <div className="stat-card">
            <h3>{habits.length}</h3>
            <p>Total Habits</p>
          </div>
          <div className="stat-card">
            <h3>{weekStats.completedCount}</h3>
            <p>This Week</p>
          </div>
          <div className="stat-card">
            <h3>{overallStats.totalCompleted}</h3>
            <p>Total Completed</p>
          </div>
          <div className="stat-card">
            <h3>{overallStats.totalDays > 0 ? Math.round((overallStats.totalCompleted / overallStats.totalDays) * 100) : 0}%</h3>
            <p>Success Rate</p>
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="habits-grid-container">
        <div className="grid-header">
          <div className="habit-column-header">Habits</div>
          {weekData.map((date, index) => (
            <div key={index} className={`date-column-header ${format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'today' : ''}`}>
              <div className="date-day">{format(date, 'EEE')}</div>
              <div className="date-number">{format(date, 'd')}</div>
            </div>
          ))}
        </div>

        <div className="grid-body">
          {habits.map(habit => (
            <div key={habit.id} className="habit-row">
              <div className="habit-info">
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
                <h4 className="habit-name">{habit.name}</h4>
              </div>
              
                             {weekData.map((date, index) => {
                 const status = getHabitStatusForDate(habit.id, date);
                 const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                 const isFuture = status === null;
                 const isCompleted = status === true;
                 
                 const handleHabitClick = async () => {
                   if (isFuture) return; // Don't allow clicking on future dates
                   
                   const newStatus = !isCompleted;
                   
                   try {
                     await toggleHabitCompletion(habit.id, newStatus);
                   } catch (error) {
                     console.error('Error toggling habit completion:', error);
                   }
                 };
                 
                 return (
                   <div 
                     key={index} 
                     className={`status-cell ${isToday ? 'today' : ''} ${!isFuture ? 'clickable' : ''} ${updatingHabit ? 'updating' : ''}`}
                     style={{ 
                       backgroundColor: getStatusColor(isCompleted, isToday, isFuture),
                       opacity: isToday ? 1 : (isCompleted ? 0.8 : (isFuture ? 0.4 : 0.6))
                     }}
                     title={`${format(date, 'MMM d, yyyy')}: ${isFuture ? 'Future' : (isCompleted ? 'Completed' : 'Missed')} - ${!isFuture ? 'Click to toggle' : ''}`}
                     onClick={handleHabitClick}
                   >
                     {updatingHabit ? (
                       <div className="status-loading-spinner"></div>
                     ) : (
                       (isFuture ? '-' : (isCompleted ? '✓' : '✗'))
                     )}
                   </div>
                 );
               })}
            </div>
          ))}
        </div>
      </div>

      {/* 45-Day Habit Tracker */}
      <div className="habit-tracker-container">
        <h3>45-Day Habit Tracker</h3>
        <div className="tracker-grid">
                     {habits.map(habit => (
             <div 
               key={habit.id} 
               className="tracker-habit"
               style={{ '--habit-color': getCategoryColor(habit.category) }}
             >
                             <div className="tracker-habit-info">
                 <span className="tracker-habit-icon">
                   {getCategoryIcon(habit.category)}
                 </span>
                 <span className="tracker-habit-name">{habit.name}</span>
                 <div className="tracker-habit-stats">
                   <span className="tracker-habit-streak">Completed: {habitLogs.filter(log => log.habitId === habit.id && log.completed).length || 0} days</span>
                   <span className="tracker-habit-missed">Missed: {habitLogs.filter(log => log.habitId === habit.id && !log.completed).length || 0} days</span>
                 </div>
               </div>
                             <div className="tracker-dots">
                 {Array.from({ length: 45 }, (_, index) => {
                   const date = new Date();
                   date.setDate(date.getDate() - (44 - index));
                   const dateString = format(date, 'yyyy-MM-dd');
                   const today = format(new Date(), 'yyyy-MM-dd');
                   
                   let dotClass = 'tracker-dot';
                   let dotColor = '';
                   
                   if (dateString > today) {
                     // Future date
                     dotClass += ' future';
                     dotColor = 'transparent';
                   } else if (dateString === today) {
                     // Today - use helper function
                     const isCompletedToday = getTodayCompletionStatus(habit.id);
                     if (isCompletedToday) {
                       dotClass += ' completed';
                       dotColor = getCategoryColor(habit.category);
                     } else {
                       dotClass += ' missed';
                       dotColor = 'transparent';
                     }
                   } else {
                     // Past date
                     const log = habitLogs.find(log => 
                       log.habitId === habit.id && log.date === dateString
                     );
                     
                     if (log && log.completed) {
                       // Completed - show full category color
                       dotClass += ' completed';
                       dotColor = getCategoryColor(habit.category);
                     } else {
                       // Missed - show nothing (transparent)
                       dotClass += ' missed';
                       dotColor = 'transparent';
                     }
                   }
                   
                   const handleDotClick = async () => {
                     if (dateString > today) return; // Don't allow clicking on future dates
                     
                     let currentStatus;
                     if (dateString === today) {
                       // Use helper function for today
                       currentStatus = getTodayCompletionStatus(habit.id);
                     } else {
                       // Check logs for past dates
                       const log = habitLogs.find(log => 
                         log.habitId === habit.id && log.date === dateString
                       );
                       currentStatus = log ? log.completed : false;
                     }
                     
                     const newStatus = !currentStatus;
                     
                     try {
                       await toggleHabitCompletion(habit.id, newStatus);
                     } catch (error) {
                         console.error('Error toggling habit completion:', error);
                     }
                   };
                   
                   return (
                     <div
                       key={index}
                       className={`${dotClass} ${updatingHabit ? 'updating' : ''}`}
                       style={{ backgroundColor: dotColor }}
                       title={`${format(date, 'MMM d, yyyy')}: ${dateString === today ? 'Today' : (dateString > today ? 'Future' : (dotColor === getCategoryColor(habit.category) ? 'Completed' : 'Not completed'))} - ${dateString <= today ? 'Click to toggle' : ''}`}
                       onClick={handleDotClick}
                     />
                   );
                 })}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Spacer to ensure content can scroll above navbar */}
      <div className="bottom-spacer"></div>

      {isCalendarOpen && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal" ref={calendarRef}>
            <div className="calendar-header">
              <button className="calendar-nav" onClick={() => changeMonth(-1)} aria-label="Previous Month">
                <ChevronLeft size={18} />
              </button>
              <div className="calendar-title">{format(calendarMonth, 'MMMM yyyy')}</div>
              <button className="calendar-nav" onClick={() => changeMonth(1)} aria-label="Next Month">
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="calendar-grid">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="calendar-dow">{d}</div>
              ))}
              {getMonthMatrix(calendarMonth).map((day, idx) => {
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                const isSelectedWeek = format(startOfWeek(day, { weekStartsOn: 1 }), 'yyyy-MM-dd') === format(startOfWeek(currentWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd');
                return (
                  <button
                    key={idx}
                    className={`calendar-day ${isCurrentMonth ? '' : 'faded'} ${isToday ? 'today' : ''} ${isSelectedWeek ? 'selected-week' : ''}`}
                    onClick={() => handlePickDate(day)}
                    title={`Go to week of ${format(startOfWeek(day, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
