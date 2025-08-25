const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// In-memory storage (in production, use a database)
let habits = [
  {
    id: '1',
    name: 'Fajr Namaz',
    category: 'namaz',
    description: 'Pray Fajr prayer on time',
    createdAt: new Date().toISOString(),
    streak: 0,
    totalCompleted: 0
  },
  {
    id: '2',
    name: 'Quran Reading',
    category: 'quran',
    description: 'Read at least 1 page of Quran daily',
    createdAt: new Date().toISOString(),
    streak: 0,
    totalCompleted: 0
  },
  {
    id: '3',
    name: 'Morning Zikr',
    category: 'zikr',
    description: 'Perform morning remembrance of Allah',
    createdAt: new Date().toISOString(),
    streak: 0,
    totalCompleted: 0
  }
];

let habitLogs = [];

// Helper function to get today's date string
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper function to calculate streak
const calculateStreak = (habitId) => {
  const logs = habitLogs.filter(log => log.habitId === habitId && log.completed);
  if (logs.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateString = checkDate.toISOString().split('T')[0];
    
    const hasLog = logs.some(log => log.date === dateString);
    if (hasLog) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// API Routes

// Get all habits
app.get('/api/habits', (req, res) => {
  const habitsWithStreaks = habits.map(habit => ({
    ...habit,
    streak: calculateStreak(habit.id)
  }));
  res.json(habitsWithStreaks);
});

// Get habit logs for dashboard
app.get('/api/habit-logs', (req, res) => {
  const { startDate, endDate } = req.query;
  let filteredLogs = habitLogs;
  
  if (startDate && endDate) {
    filteredLogs = habitLogs.filter(log => 
      log.date >= startDate && log.date <= endDate
    );
  }
  
  res.json(filteredLogs);
});

// Get today's progress
app.get('/api/today-progress', (req, res) => {
  const today = getTodayString();
  const todayLogs = habitLogs.filter(log => log.date === today);
  const completedToday = todayLogs.filter(log => log.completed).length;
  const totalHabits = habits.length;
  const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  res.json({
    completed: completedToday,
    total: totalHabits,
    percentage,
    date: today
  });
});

// Create new habit
app.post('/api/habits', (req, res) => {
  const { name, category, description } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }
  
  const newHabit = {
    id: uuidv4(),
    name,
    category,
    description: description || '',
    createdAt: new Date().toISOString(),
    streak: 0,
    totalCompleted: 0
  };
  
  habits.push(newHabit);
  res.status(201).json(newHabit);
});

// Update habit
app.put('/api/habits/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, description } = req.body;
  
  const habitIndex = habits.findIndex(habit => habit.id === id);
  if (habitIndex === -1) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  
  habits[habitIndex] = {
    ...habits[habitIndex],
    name: name || habits[habitIndex].name,
    category: category || habits[habitIndex].category,
    description: description !== undefined ? description : habits[habitIndex].description
  };
  
  res.json(habits[habitIndex]);
});

// Delete habit
app.delete('/api/habits/:id', (req, res) => {
  const { id } = req.params;
  
  const habitIndex = habits.findIndex(habit => habit.id === id);
  if (habitIndex === -1) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  
  // Remove habit and all related logs
  habits.splice(habitIndex, 1);
  habitLogs = habitLogs.filter(log => log.habitId !== id);
  
  res.json({ message: 'Habit deleted successfully' });
});

// Mark habit as completed for today
app.post('/api/habits/:id/complete', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  const habit = habits.find(h => h.id === id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  
  const today = getTodayString();
  
  // Remove existing log for today
  habitLogs = habitLogs.filter(log => !(log.habitId === id && log.date === today));
  
  // Add new log
  if (completed) {
    habitLogs.push({
      id: uuidv4(),
      habitId: id,
      date: today,
      completed: true,
      timestamp: new Date().toISOString()
    });
  }
  
  // Update habit stats
  habit.totalCompleted = habitLogs.filter(log => log.habitId === id && log.completed).length;
  habit.streak = calculateStreak(id);
  
  res.json({ message: 'Habit updated successfully' });
});

// Get habit completion for specific date range
app.get('/api/habits/:id/completion', (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;
  
  let filteredLogs = habitLogs.filter(log => log.habitId === id);
  
  if (startDate && endDate) {
    filteredLogs = filteredLogs.filter(log => 
      log.date >= startDate && log.date <= endDate
    );
  }
  
  res.json(filteredLogs);
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
