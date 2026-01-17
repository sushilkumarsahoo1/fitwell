# USDA API Key Setup Guide

## Overview

The FitWell app integrates with the USDA FoodData Central API to provide comprehensive food database searching. To enable USDA food search functionality, you need to configure an API key.

## Step 1: Get a Free API Key

1. Visit: https://fdc.nal.usda.gov/api-key-signup.html
2. Fill out the signup form with your information
3. Agree to the terms of service
4. You'll receive an API key via email
5. Copy the API key (you'll need it in the next step)

**Note**: The API key is free and allows thousands of requests per day, which is more than sufficient for personal use.

## Step 2: Configure the API Key in Your Environment

### For Development (Local)

Edit your `.env.local` file and add:

```env
EXPO_PUBLIC_USDA_API_KEY=your_actual_api_key_here
```

Replace `your_actual_api_key_here` with the API key you received from USDA.

### Example `.env.local`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_USDA_API_KEY=your-usda-api-key
```

## Step 3: Restart Your Development Server

1. Stop the currently running app: `Ctrl+C`
2. Restart: `npm start`
3. The app will now have access to USDA API

## Step 4: Verify It Works

1. Open the app
2. Go to Food Logging screen
3. Click "USDA Search" tab
4. Search for a food (e.g., "apple")
5. You should see results from USDA database

If you still see errors:

- Verify the API key is correct
- Check that `.env.local` is saved
- Ensure the dev server was restarted
- Check browser console for specific error messages

## Troubleshooting

### Error: "USDA API key not configured"

- Make sure `EXPO_PUBLIC_USDA_API_KEY` is in your `.env.local` file
- Verify the key is not blank or empty
- Restart the development server after updating `.env.local`

### Error: "USDA API error: 401 Unauthorized"

- Your API key is invalid or expired
- Sign up again at: https://fdc.nal.usda.gov/api-key-signup.html
- Update your `.env.local` with the new key

### Error: "USDA API error: 404"

- This usually means the API key is not configured
- Or the USDA API endpoint is temporarily unavailable
- Try adding your API key to `.env.local`

### No search results appearing

- First verify your API key is working (check for errors in console)
- The USDA API might be rate-limited
- Try searching with a simple term like "apple" or "rice"

## About the API

- **Provider**: USDA FoodData Central
- **Cost**: Free
- **Rate Limit**: Thousands of requests per day (sufficient for personal use)
- **Data**: Public domain food composition data
- **Documentation**: https://fdc.nal.usda.gov/api-docs.html

## For Production Deployment

When deploying to production (EAS Build, App Store, Play Store):

1. Set the environment variable in your build configuration:

   ```bash
   eas build --set EXPO_PUBLIC_USDA_API_KEY=your_api_key
   ```

2. Or configure it in `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_USDA_API_KEY": "your_api_key"
         }
       }
     }
   }
   ```

## Alternative: Using App Foods Only

If you don't want to set up USDA API:

- The "App Foods" tab in Food Logging will still work
- It uses the pre-loaded food database
- You can add custom foods
- Just won't have access to USDA's comprehensive database

## Security Note

- Keep your API key secure
- Don't commit it to version control
- Use `.env.local` which is in `.gitignore`
- Never share your API key publicly
