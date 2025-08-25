# 🔥 Firebase Setup Guide for Habit Tracker

## Prerequisites
1. Install Firebase dependency:
   ```bash
   cd client
   npm install firebase
   ```

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "habit-tracker-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

## Step 3: Get Firebase Configuration
1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter your app nickname (e.g., "habit-tracker-web")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Set Up Environment Variables
1. Create a `.env` file in the `client` directory:
   ```bash
   cd client
   touch .env
   ```

2. Add your Firebase configuration to the `.env` file:
   ```env
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

## Step 5: Set Up Firestore Security Rules
1. In Firebase Console, go to "Firestore Database" → "Rules"
2. Replace the default rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read/write access to all users under any document
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   **Note**: These rules allow full access. For production, implement proper authentication and security rules.

## Step 6: Test the Integration
1. Start your development server:
   ```bash
   npm run client
   ```

2. Create a new habit and check if it appears in your Firestore database
3. Mark habits as complete and verify the logs are stored

## Database Structure

### Habits Collection
```javascript
{
  id: "auto-generated",
  name: "Pray Fajr",
  category: "namaz",
  description: "Pray Fajr prayer",
  streak: 5,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Habit Logs Collection
```javascript
{
  id: "auto-generated",
  habitId: "habit-document-id",
  date: "2024-01-15",
  completed: true,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Troubleshooting

### Common Issues:
1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens when the app is initialized multiple times
   - Check that you're only importing and initializing Firebase once

2. **"Missing or insufficient permissions"**
   - Check your Firestore security rules
   - Ensure you're in test mode or have proper authentication

3. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase configuration is correct

### Development Tips:
- Use Firebase Console to monitor your data in real-time
- Check the browser console for any Firebase-related errors
- Use Firebase Emulator Suite for local development (optional)

## Production Considerations
1. **Security Rules**: Implement proper authentication and security rules
2. **Authentication**: Add user authentication to separate data by user
3. **Backup**: Set up regular backups of your Firestore data
4. **Monitoring**: Enable Firebase Analytics and Performance Monitoring
5. **Cost Optimization**: Monitor your Firestore usage to optimize costs

## Next Steps
- Add user authentication with Firebase Auth
- Implement offline support with Firestore offline persistence
- Add real-time updates using Firestore listeners
- Set up Firebase Hosting for deployment
