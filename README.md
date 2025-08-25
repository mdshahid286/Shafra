# Shafra - Islamic Habit Tracker

A beautiful, modern habit tracking web application designed specifically for Islamic practices including Namaz, Quran reading, Zikr, and daily activities. Built with React, Firebase, and modern web technologies.

![Shafra App](https://img.shields.io/badge/Shafra-Habit%20Tracker-blue?style=for-the-badge&logo=react)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.1.0-FFCA28?style=for-the-badge&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🔐 Authentication System
- **User Registration & Login**: Secure authentication with Firebase Auth
- **Password Reset**: Email-based password recovery
- **Protected Routes**: Secure access to app features
- **User Profile Management**: Display name and email management

### 🏠 Home Dashboard
- **Daily Progress Overview**: Real-time progress tracking with visual indicators
- **Progress Statistics**: 
  - Completed vs. total habits count
  - Daily goal percentage
  - Best streak tracking
- **Interactive Progress Bar**: Visual representation of daily achievement
- **Habit Management**: Create, edit, and delete habits with intuitive forms
- **Real-time Updates**: Instant feedback when marking habits complete/incomplete

### 📊 Weekly Dashboard
- **Interactive Week Grid**: Visual calendar showing habit completion status
- **Smart Color Coding**: 
  - 🟢 Green: Completed habits
  - 🔴 Red: Missed habits (especially today)
  - ⚪ Gray: Missed habits from previous days
  - 🔵 Blue: Future dates (non-interactive)
- **Week Navigation**: Navigate between different weeks with arrow controls
- **Comprehensive Statistics**: Weekly overview with completion rates and totals
- **45-Day Habit Tracker**: Extended view for long-term habit analysis

### 🎯 Habit Categories
- **🕌 Namaz**: Track daily prayers (Fajr, Dhuhr, Asr, Maghrib, Isha)
- **📖 Quran**: Monitor Quran reading progress and consistency
- **✨ Zikr**: Track remembrance activities and spiritual practices
- **📝 Daily Activities**: General daily habits and personal goals

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful translucent card designs with backdrop blur
- **Animated Backgrounds**: Subtle floating path animations using Framer Motion
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Islamic Theme**: Color palette inspired by Islamic art and architecture
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions

### 🔧 Technical Features
- **Real-time Data Sync**: Firebase Firestore integration for instant updates
- **Offline Support**: Progressive Web App capabilities
- **State Management**: React Context API for global state management
- **Performance Optimized**: Efficient rendering and minimal re-renders
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mdshahid286/Shafra.git
   cd Shafra
   ```

2. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Firestore Database
   - Copy your Firebase config to `client/src/firebase/config.js`

4. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## 🏗️ Project Architecture

### Frontend Structure
```
client/src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   │   ├── AuthContainer.js    # Main auth wrapper
│   │   ├── Login.js            # Login form
│   │   ├── SignUp.js           # Registration form
│   │   ├── ResetPassword.js    # Password reset
│   │   └── PrivateRoute.js     # Route protection
│   ├── ui/              # UI utility components
│   │   ├── background-animation.jsx    # Animated backgrounds
│   │   ├── animated-underline-text-one.jsx  # Text animations
│   │   └── button.jsx          # Button components
│   ├── HabitForm.js     # Habit creation/editing modal
│   └── Navbar.js        # Navigation component
├── contexts/            # React Context providers
│   ├── AuthContext.js   # Authentication state management
│   └── HabitContext.js  # Habits and progress state
├── firebase/            # Firebase services
│   ├── config.js        # Firebase configuration
│   ├── authService.js   # Authentication operations
│   └── habitsService.js # Habits CRUD operations
├── pages/               # Main page components
│   ├── Home.js          # Home dashboard
│   └── Dashboard.js     # Weekly progress view
├── App.js               # Main application component
└── index.js             # Application entry point
```

### Data Flow
```
User Action → Context Hook → Firebase Service → Firestore → UI Update
     ↓              ↓              ↓            ↓         ↓
  Click Habit → useHabits → habitsService → Database → Re-render
```

### Key Technologies
- **React 18.2.0**: Modern React with hooks and context
- **Firebase 12.1.0**: Backend-as-a-Service for auth and database
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Framer Motion 12.23.12**: Animation library for smooth transitions
- **date-fns 2.29.3**: Date manipulation utilities
- **Lucide React 0.263.1**: Beautiful icon library

## 📱 Usage Guide

### Creating Your First Habit
1. **Sign up/Login** to your account
2. **Click "Add Habit"** button on the home page
3. **Fill in details**:
   - Habit name (e.g., "Fajr Namaz")
   - Select category (Namaz, Quran, Zikr, or Daily)
   - Add optional description
4. **Click "Create Habit"** to save

### Tracking Daily Progress
1. **Home Page**: See today's progress overview
2. **Mark Complete**: Click the toggle button on any habit card
3. **Real-time Updates**: Progress bars and statistics update instantly
4. **View History**: Check the Dashboard for weekly patterns

### Managing Habits
- **Edit**: Click the pencil icon on any habit card
- **Delete**: Click the trash icon and confirm deletion
- **Categories**: Organize habits by type for better tracking
- **Progress**: Monitor completion rates and streaks

## 🎨 Design System

### Color Palette
- **Primary**: Islamic blue (#4F46E5) for Namaz
- **Success**: Green (#059669) for Quran
- **Warning**: Red (#DC2626) for Zikr
- **Accent**: Purple (#7C3AED) for Daily activities
- **Background**: Dark theme with glassmorphism effects

### Typography
- **Headings**: Modern sans-serif with proper hierarchy
- **Body Text**: Readable fonts optimized for mobile
- **Arabic Support**: Ready for RTL language support

### Components
- **Cards**: Glassmorphism design with backdrop blur
- **Buttons**: Interactive states with hover effects
- **Forms**: Clean, accessible form elements
- **Modals**: Smooth overlay transitions

## 🔧 Customization

### Adding New Habit Categories
1. Edit `client/src/components/HabitForm.js`
2. Add new category to the `categories` array
3. Update `getCategoryIcon()` and `getCategoryColor()` functions in both Home and Dashboard components
4. Add corresponding emoji and color values

### Styling Changes
- Modify CSS files in respective component directories
- Update Tailwind classes for consistent design
- Adjust responsive breakpoints in component CSS files

### Firebase Configuration
- Update Firebase config in `client/src/firebase/config.js`
- Modify Firestore rules for custom security policies
- Add new collections or fields as needed

## 🚀 Deployment

### Netlify Deployment (Recommended)
1. **Build the app**:
   ```bash
   cd client
   npm run build
   ```
2. **Deploy to Netlify**:
   - Connect your GitHub repository
   - Build command: `cd client && npm run build`
   - Publish directory: `client/build`
   - The `netlify.toml` file handles configuration automatically

### Environment Variables
- **Firebase Config**: Update with production Firebase project
- **Build Settings**: Configure in Netlify dashboard
- **Custom Domain**: Add in Netlify site settings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow React best practices and hooks patterns
- Maintain consistent code style and formatting
- Add proper error handling and loading states
- Test on multiple devices and screen sizes
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing framework
- **Firebase**: For robust backend services
- **Tailwind CSS**: For the utility-first CSS framework
- **Framer Motion**: For smooth animations
- **Lucide**: For beautiful icons
- **date-fns**: For date manipulation utilities

## 📞 Support & Community

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join community discussions
- **Documentation**: Check the code comments and structure
- **Contributing**: Help improve the project

## 🔮 Future Roadmap

- [ ] **Mobile App**: React Native version
- [ ] **Offline Support**: Enhanced PWA capabilities
- [ ] **Social Features**: Share progress with family/friends
- [ ] **Analytics**: Detailed habit insights and trends
- [ ] **Reminders**: Push notifications and email reminders
- [ ] **Multi-language**: Arabic and other language support
- [ ] **Dark/Light Themes**: User preference customization

---

**May Allah bless your journey in building good habits! 🌙✨**

*Built with ❤️ for the Muslim community*
