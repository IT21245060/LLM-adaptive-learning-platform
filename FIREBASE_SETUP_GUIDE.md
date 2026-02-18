# Firebase Setup Guide for Quiz Application

## 🔥 What is Firebase and How Your Friend Used It

Firebase is a Google service that provides:
1. **Authentication** - User login/signup (email & password)
2. **Firestore Database** - Cloud database to store quiz results, user data, leaderboards

Your friend's app uses Firebase for:
- ✅ User registration and login
- ✅ Storing quiz results after each quiz
- ✅ Displaying user statistics (average scores, quiz history)
- ✅ Leaderboard rankings

---

## 📊 Firestore Database Structure

Your app stores data in these collections:

### Collection: `users`
Stores user profile information
```
users/
  {userId}/
    - email: string
    - displayName: string
    - level: string ("easy" | "medium" | "hard")
    - createdAt: timestamp
```

### Collection: `quizResults`
Stores completed quiz results
```
quizResults/
  {quizId}/
    - userId: string
    - subject: string ("se" | "english" | "maths" | "cloud")
    - module: string (e.g., "Introduction and Fundamentals")
    - difficulty: string ("easy" | "medium" | "hard")
    - score: number (0-100)
    - startedAt: string (ISO date)
    - completedAt: string (ISO date)
    - timeSpent: string
    - answers: object
    - feedback: array
    - questions: array
    - weakTopics: array
    - createdAt: string
```

---

## 🚀 Step-by-Step: Create Your Own Firebase Project

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `quiz-app` (or any name you like)
4. Disable Google Analytics (optional, you can enable it if you want)
5. Click **Create Project**

### Step 2: Enable Authentication
1. In Firebase Console, click **Authentication** from left menu
2. Click **Get Started**
3. Click **Sign-in method** tab
4. Enable **Email/Password** provider:
   - Click on "Email/Password"
   - Toggle **Enable** switch ON
   - Click **Save**

### Step 3: Create Firestore Database
1. In Firebase Console, click **Firestore Database** from left menu
2. Click **Create database**
3. Select **Start in test mode** (for development)
   - **⚠️ IMPORTANT**: Test mode allows anyone to read/write for 30 days
   - We'll set proper rules later
4. Choose location: Select closest region to you
5. Click **Enable**

### Step 4: Set Up Firestore Security Rules
1. In Firestore Database, click **Rules** tab
2. **DELETE ALL existing rules** in the editor
3. **Copy and paste ONLY the rules below** (⚠️ DO NOT copy the line that says "javascript"):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own quiz results
    match /quizResults/{resultId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Click **Publish**

**⚠️ COPY EXACTLY AS SHOWN ABOVE** - Start from `rules_version` and end at the closing `}`

### Step 5: Get Firebase Configuration
1. Click **Project Settings** (gear icon ⚙️ in top left)
2. Scroll down to **Your apps** section
3. Click the **Web icon** (</>)
4. Register app name: `quiz-app-frontend`
5. Click **Register app**
6. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};
```

---

## 🔧 Step 6: Update Your Application

### Update Firebase Configuration File

Replace the configuration in this file:
**File: `quiz-app-frontend-main/config/firebase.ts`**

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 👇 REPLACE THIS WITH YOUR CONFIG FROM FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 🎯 Step 7: Create Composite Indexes (IMPORTANT!)

Your app queries use multiple fields, which requires indexes.

### Method 1: Automatic (Recommended)
1. Run your app and try to view quiz statistics
2. Open browser console (F12)
3. You'll see an error with a **link to create the index**
4. Click the link - Firebase will create it automatically
5. Wait 1-2 minutes for index to build

### Method 2: Manual
1. Go to Firestore Database → **Indexes** tab
2. Click **Add Index**
3. Create these indexes:

**Index 1: For Quiz Statistics**
- Collection: `quizResults`
- Fields:
  - `userId` - Ascending
  - `difficulty` - Ascending
  - `subject` - Ascending
- Query scope: Collection

**Index 2: For Recent Quizzes**
- Collection: `quizResults`
- Fields:
  - `userId` - Ascending
  - `subject` - Ascending
  - `module` - Ascending
  - `completedAt` - Descending
- Query scope: Collection

---

## ✅ Test Your Setup

### 1. Register a New User
1. Start your app: http://localhost:3000
2. Click **Sign Up**
3. Create account with email/password
4. Check Firebase Console → Authentication → Users
   - Your new user should appear!

### 2. Check Firestore
1. Complete a quiz in your app
2. Go to Firebase Console → Firestore Database
3. You should see:
   - `users/{userId}` - Your user document
   - `quizResults/{resultId}` - Your quiz results

### 3. Verify Statistics Work
1. Go to any subject page (e.g., Cloud Computing)
2. Quiz Stats card should show:
   - "No quiz data available" (before completing quizzes)
   - Statistics with scores (after completing quizzes)

---

## 🐛 Troubleshooting

### Error: "Missing or insufficient permissions"
**Solution**: Update Firestore rules (see Step 4)

### Error: "The query requires an index"
**Solution**: Click the link in error message to create index automatically

### Error: "Firebase: Error (auth/invalid-api-key)"
**Solution**: Double-check your `firebaseConfig` - make sure you copied it correctly

### Error: "Failed to fetch quiz statistics"
**Solutions**:
1. Make sure you're logged in
2. Create required indexes (see Step 7)
3. Check Firestore rules allow reading `quizResults`

---

## 📝 Summary

**What Firebase Does in Your App:**
- 🔐 Handles user authentication (login/signup)
- 💾 Stores quiz results in cloud database
- 📊 Enables statistics and leaderboards
- 🔄 Syncs data across devices

**Your Current Setup:**
- ❌ Using your friend's Firebase project (research-59b04)
- ✅ Need to create YOUR OWN Firebase project
- ✅ Update `config/firebase.ts` with YOUR credentials

**After Setup:**
- ✅ Users can register and login
- ✅ Quiz results saved to YOUR database
- ✅ Statistics display correctly
- ✅ No more permission errors!

---

## 🎓 Next Steps

1. **Create Firebase project** (15 minutes)
2. **Copy configuration** to `config/firebase.ts`
3. **Set up Firestore rules** (5 minutes)
4. **Test with registration** and complete a quiz
5. **Create indexes** when prompted

Need help? Check the error messages in browser console - Firebase provides helpful links!
