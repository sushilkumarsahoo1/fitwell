# Fitwell - Fitness & Nutrition Tracking App

A modern, production-ready fitness tracking application built with React Native (Expo), TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ with npm
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free at supabase.io)
- iOS simulator (Xcode) or Android emulator (Android Studio)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd /Users/apple/Developer/app/fitwell
   npm install
   ```

2. **Set Up Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Set Up Supabase Database**
   
   a. Create a new Supabase project at https://supabase.io
   
   b. Go to SQL Editor and run the schema:
   ```sql
   -- Copy entire contents of database/schema.sql
   -- Paste into Supabase SQL editor
   -- Execute
   ```
   
   c. Enable Row Level Security (RLS) - Already enabled in schema

4. **Load Sample Data (Optional)**
   ```bash
   # Run the seed script after database setup
   npm run seed-data
   ```

5. **Run the App**
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Android:
   ```bash
   npm run android
   ```
   
   For Web (development):
   ```bash
   npm run web
   ```

## 📁 Project Structure

```
fitwell/
├── src/
│   ├── screens/           # All screen components
│   │   ├── auth/         # Login/Signup screens
│   │   ├── onboarding/   # Profile setup flow
│   │   └── app/          # Main app screens (Dashboard, Food, Workout, etc.)
│   ├── components/       # Reusable UI components
│   │   ├── common/       # Button, TextInput, Card, etc.
│   │   ├── nutrition/    # Food-related components
│   │   ├── workouts/     # Workout-related components
│   │   └── progress/     # Analytics components
│   ├── hooks/           # Custom React hooks
│   │   ├── useNutrition.ts
│   │   └── useWorkouts.ts
│   ├── services/        # API & external services
│   │   └── supabase.ts
│   ├── context/         # React Context providers
│   │   └── AuthContext.tsx
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── dateUtils.ts
│   │   ├── nutritionUtils.ts
│   │   └── validationUtils.ts
│   ├── constants/       # App constants
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── RootNavigator.tsx # Navigation setup
│   └── queryClient.ts   # React Query config
├── database/
│   └── schema.sql       # Complete Supabase schema
├── app.json             # Expo config
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
├── package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables
- **profiles** - User profile information
- **foods** - Food database with macro nutrients
- **food_logs** - Daily food tracking records
- **workouts** - Workout templates
- **workout_logs** - Completed workout sessions
- **weight_logs** - Body weight & measurements
- **water_logs** - Daily water intake
- **habits** - User habits & streaks
- **habit_logs** - Habit completion tracking
- **reminders** - Push notification reminders

All tables include:
- UUID primary keys
- Timestamps (created_at, updated_at)
- Row Level Security (RLS) policies
- Proper indexes for performance

## 🔐 Authentication Flow

1. **Sign Up** → Create email/password account
2. **Profile Setup** → Enter bio, fitness goals, activity level
3. **Calorie Calculation** → Auto-calculated based on Mifflin-St Jeor formula
4. **Dashboard** → Main app interface

Features:
- Email + Password authentication
- Google OAuth (ready to integrate)
- Persistent sessions with AsyncStorage
- Auto token refresh

## 🎯 Features Overview

### 1. Dashboard
- Daily calorie progress ring
- Macro breakdown (protein, carbs, fats)
- Today's meals summary
- Workout summary
- Quick action buttons

### 2. Food Logging
- Searchable food database (400+ foods)
- Indian & global cuisines
- Custom food creation
- Meal categorization (breakfast, lunch, dinner, snacks)
- Auto macro calculation
- Favorite foods management

### 3. Workout Tracking
- Multiple workout types (strength, cardio, yoga, HIIT)
- Duration & calories burned logging
- Workout templates
- Weekly summaries

### 4. Progress Analytics
- Weekly & monthly reports
- Weight tracking with graphs
- Trend analysis
- Calorie vs weight insights

### 5. Habits & Reminders
- Daily habit tracking
- Streak counting
- Custom reminders
- Push notifications

### 6. Settings
- Profile editing
- Calorie target adjustment
- Unit conversion (kg ↔ lbs, cm ↔ inches)
- Data export (coming soon)

## 🛠️ Technology Stack

### Frontend
- **React Native + Expo** - Cross-platform mobile app
- **TypeScript** - Type safety
- **React Navigation** - App navigation
- **NativeWind** - Tailwind CSS for React Native
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling

### Backend
- **Supabase** - PostgreSQL database + auth
- **Row Level Security** - Data access control
- **PostgreSQL Functions** - Business logic

### Development
- **Expo CLI** - Development server
- **Tailwind CSS** - Styling
- **Prettier** - Code formatting

## 📱 App Flow

```
App Start
  ↓
[Authentication Check]
  ├→ Not authenticated → Sign In/Sign Up
  ├→ Authenticated, no profile → Onboarding
  └→ Authenticated, has profile → Main App
       ├→ Dashboard
       ├→ Food Logging
       ├→ Workout Tracking
       ├→ Progress & Analytics
       └→ Settings
```

## 🔧 Build & Deployment

### For iOS (App Store)

1. **Prepare Certificate & Provisioning Profile**
   ```bash
   eas credentials
   ```

2. **Create Build**
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### For Android (Google Play)

1. **Prepare Signing Key**
   ```bash
   eas credentials
   ```

2. **Create Build**
   ```bash
   eas build --platform android
   ```

3. **Submit to Google Play**
   ```bash
   eas submit --platform android
   ```

### Environment Configuration

Production `.env` should include:
```env
EXPO_PUBLIC_SUPABASE_URL=production-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=production-key
EXPO_PUBLIC_GOOGLE_CLIENT_ID=production-google-id
```

## 📚 API Integration

### Supabase REST API Examples

**Add Food Log:**
```typescript
await supabase
  .from("food_logs")
  .insert([{
    user_id,
    food_id,
    quantity,
    meal_type: "breakfast",
    date: "2024-01-15",
    calories: 450,
    protein_g: 25,
    carbs_g: 50,
    fats_g: 15
  }]);
```

**Fetch Daily Summary:**
```typescript
const { data } = await supabase
  .rpc('get_daily_nutrition_summary', {
    user_id_input: userId,
    date_input: '2024-01-15'
  });
```

**Get Weekly Stats:**
```typescript
const { data } = await supabase
  .from("food_logs")
  .select("*")
  .eq("user_id", userId)
  .gte("date", startDate)
  .lte("date", endDate);
```

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Check TypeScript
npm run type-check

# Lint code
npm run lint
```

## 🐛 Debugging

### Debug Mode
```bash
npm run ios -- --localhost
npm run android -- --localhost
```

### Logs
```bash
# View app logs
npm start

# Clear cache
npm start -- --clear
```

## 📖 Common Tasks

### Add New Food Items
Edit `database/schema.sql` or use Supabase Dashboard to insert into `foods` table.

### Customize Colors
Edit `src/constants/index.ts` - `COLORS` object.

### Change UI Components
Components in `src/components/common/` are reusable and can be extended.

### Add New Screens
1. Create file in `src/screens/`
2. Import in navigation
3. Add route in RootNavigator.tsx

## 📊 Data Security

- ✅ **Row Level Security (RLS)** - Users access only their data
- ✅ **Secure Auth** - Email verification, password hashing
- ✅ **No hardcoded secrets** - All secrets in environment variables
- ✅ **HTTPS only** - Supabase enforces secure connections
- ✅ **Validation** - All inputs validated on client & server

## 🚀 Performance Optimizations

- **Lazy loading** - Screens loaded on demand
- **Memoization** - Components optimized with React.memo
- **Query caching** - TanStack Query caches data
- **Pagination** - Large lists paginated
- **Image optimization** - Assets minimized

## 📝 Code Quality

- **TypeScript** - Full type safety
- **ESLint** - Code linting (when configured)
- **Prettier** - Auto-formatting
- **Comments** - Complex logic documented
- **Error handling** - Try-catch on async operations

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push branch: `git push origin feature/my-feature`
4. Create Pull Request

## 📄 License

MIT License - Feel free to use in personal or commercial projects

## 🆘 Support & Troubleshooting

### Common Issues

**Supabase connection error**
- Check environment variables
- Verify Supabase project is running
- Check network connectivity

**Build failure**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm start -- --clear`
- Check Node.js version: `node --version`

**Permission denied errors**
- Ensure RLS policies are set correctly
- Check user authentication state
- Verify policy SQL syntax

## 📞 Contact & Resources

- **Supabase Docs** - https://supabase.io/docs
- **React Native Docs** - https://reactnative.dev/
- **Expo Docs** - https://docs.expo.dev/
- **TanStack Query** - https://tanstack.com/query

---

**Version**: 1.0.0  
**Last Updated**: January 15, 2026  
**Status**: Production Ready
