# Carrier Mate - AI-Powered Personalized Learning Platform

**Carrier Mate** is an intelligent mobile application designed to guide learners toward suitable vocational training programs and skill development paths. By leveraging Artificial Intelligence, it creates personalized learning experiences tailored to a user's profile, education background, and career aspirations.

## Key Features

### 🧠 AI-Powered Content Generation
- **Dynamic Curriculum:** Generates complete course modules and lessons using Google Gemini AI based on course titles.
- **Smart Quiz Generator:** Automatically creates 5-question interactive quizzes for every module to test understanding.
- **Video Curation:** Intelligently searches and embeds relevant YouTube video tutorials for specific topics.

### 👤 Personalized Onboarding & Profiling
- **Step-by-Step Profiling:** Collects data on Education, Socio-Economic background, and Career Aspirations.
- **Skill Mapping:** Suggests courses aligned with the user's career goals and current skill level.

### 📚 Interactive Learning Experience
- **Multi-Modal Learning:** Supports Video lessons, rich Text Articles, and Interactive Quizzes.
- **Real-Time Assessment:** Quizzes provide immediate feedback on answers with detailed explanations.
- **Progress Tracking:** Visual indicators of course and module completion.

### 🎨 Modern & Responsive UI
- **Tech Stack:** Built with **React Native (Expo)** and **NativeWind** (Tailwind CSS).
- **Dark Mode:** Fully supported dark/light theme switching.
- **Smooth Navigation:** Intuitive user flow with `expo-router`.

## 🛠️ Technology Stack

- **Framework:** React Native (Expo SDK 54)
- **Language:** TypeScript
- **Database & Auth:** [InstantDB](https://instantdb.com) (Real-time sync, Optimistic updates)
- **AI Engine:** Google Gemini (via Vercel AI SDK `@ai-sdk/google`)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Routing:** `expo-router`

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carrier-mate.git
   cd carrier-mate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_GOOGLE_API_KEY=your_gemini_api_key
   EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_data_api_key
   ```
   *Note: InstantDB App ID is managed in `create-instant-app` config or `app.json` context.*

4. **Run the Development Server**
   ```bash
   npm run start
   ```

## 🗄️ Database Schema (InstantDB)

The app uses a relational schema with the following key entities:
- **Users & Profiles:** Stores personal details, education, and preferences.
- **RecommendedCourses:** AI-suggested learning paths.
- **Modules:** Individual lessons (Video, Article, Quiz) linked to courses.
- **Quizzes & Questions:** Interactive assessment content.
- **Enrollments:** Tracks user progress through courses.

## 🔮 Future Roadmap

- [ ] **Resume Builder:** Auto-generate resumes based on profile and completed courses.
- [ ] **Job Matching:** Connect users with job opportunities matching their new skills.
- [ ] **Community:** Peer-to-peer learning and discussion forums.
- [ ] **Offline Mode:** Download content for offline access.

---

Built with ❤️ using [Expo](https://expo.dev) & [InstantDB](https://instantdb.com).
