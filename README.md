# Shafra - Islamic Habit Tracker

A beautiful and comprehensive habit tracking web application designed specifically for Islamic practices including Namaz, Quran reading, Zikr, and daily activities.

## ✨ Features

### 🏠 Home Page
- **Daily Progress Overview**: Visual representation of completed vs. total habits
- **Progress Percentage**: Clear percentage display of daily goal achievement
- **Streak Tracking**: Monitor your consistency with streak counters
- **Habit Management**: Create, edit, and delete habits with ease
- **Real-time Updates**: Instant feedback when marking habits as complete

### 📊 Dashboard Page
- **Weekly Grid View**: Visual calendar showing habit completion status
- **Color Coding**: 
  - 🟢 Green: Completed habits
  - 🔴 Red: Missed habits (especially today)
  - ⚪ Gray: Missed habits from previous days
- **Week Navigation**: Navigate between different weeks
- **Statistics**: Weekly overview of completion rates and totals

### 🎯 Habit Categories
- **🕌 Namaz**: Track daily prayers
- **📖 Quran**: Monitor Quran reading progress
- **✨ Zikr**: Track remembrance activities
- **📝 Daily Activities**: General daily habits

### 🔧 Technical Features
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI/UX**: Beautiful glassmorphism design with Islamic theme
- **Real-time Updates**: Instant synchronization across all components
- **Data Persistence**: Habits and progress are saved and maintained

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shafra-habit-tracker
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```
   The server will run on `http://localhost:5000`

5. **Start the frontend application**
   ```bash
   npm run client
   ```
   The React app will run on `http://localhost:3000`

6. **Open your browser**
   Navigate to `http://localhost:3000` to use the application

### Alternative: Run Both Simultaneously
```bash
# In one terminal
npm run dev

# In another terminal
npm run client
```

## 🏗️ Project Structure

```
shafra-habit-tracker/
├── server.js                 # Express backend server
├── package.json             # Backend dependencies
├── client/                  # React frontend
│   ├── public/             # Static files
│   ├── src/                # Source code
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React context providers
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🎨 Design Features

### Islamic Theme
- **Color Palette**: Inspired by Islamic art and architecture
- **Typography**: Clean, readable fonts with Arabic-inspired elements
- **Icons**: Meaningful icons for each habit category
- **Visual Elements**: Subtle gradients and glassmorphism effects

### User Experience
- **Intuitive Navigation**: Clear navigation between home and dashboard
- **Visual Feedback**: Immediate response to user actions
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: Focus indicators and keyboard navigation support

## 📱 Usage Guide

### Creating a New Habit
1. Click the "Add Habit" button on the home page
2. Fill in the habit name, select a category, and add an optional description
3. Click "Create Habit" to save

### Marking Habits Complete
1. On the home page, find the habit you want to mark
2. Click the toggle button to mark it as complete/incomplete
3. The progress bar and statistics will update automatically

### Viewing Progress
1. **Home Page**: See today's progress, streaks, and individual habit status
2. **Dashboard**: View weekly grid showing completion patterns
3. Navigate between weeks using the arrow buttons

### Managing Habits
- **Edit**: Click the edit button (pencil icon) on any habit card
- **Delete**: Click the delete button (trash icon) and confirm
- **Categories**: Organize habits by type for better tracking

## 🔧 Customization

### Adding New Habit Categories
1. Edit `client/src/components/HabitForm.js`
2. Add new category options to the `categories` array
3. Update the `getCategoryIcon` and `getCategoryColor` functions in both Home and Dashboard components

### Styling Changes
- Modify CSS files in the respective component directories
- Update color schemes in `client/src/App.css`
- Adjust responsive breakpoints as needed

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Configure your web server (Nginx/Apache)

### Frontend Deployment
1. Build the production version: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure routing for single-page application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React and Node.js
- Styled with modern CSS and glassmorphism design
- Icons from Lucide React
- Date handling with date-fns library

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

---

**May Allah bless your journey in building good habits! 🌙✨**
