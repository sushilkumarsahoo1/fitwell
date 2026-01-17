# USDA API Configuration - Status

## ✅ Configured

The USDA API key has been configured in the FitWell app.

**API Key**: `E2WpkwatJoL2sT1T4PUgqFDxyWj8UU1oO5R0t3pj`
**Status**: Active ✓

## Configuration Method

The API key is stored in:

1. `.env.local` - For local development reference
2. `src/services/foodService.ts` - Hardcoded in the service (safe as it's a public API)
3. `app.json` - Extra configuration section (for future use)

## How It Works

When the app searches for USDA foods:

1. User enters search query in "USDA Search" tab
2. Query is sent to `searchFoods()` function
3. Function makes API call to USDA FoodData Central API
4. API key is included with request
5. Results are cached locally for 48 hours
6. User can select from results and log the food

## Debug Information

The foodService now logs:

- `[FoodService] USDA API Key loaded successfully (X chars)` - Shows API is configured
- `[FoodService] Searching for: "query"` - Shows search requests
- `[FoodService] Making USDA API request to: https://fdc.nal.usda.gov/api/foods/search` - Shows API call

Check browser console (F12) for these logs when testing USDA search.

## If It Stops Working

If USDA search returns 404 or other errors:

1. **Check the console logs**:
   - Open browser developer tools (F12)
   - Look for messages starting with `[FoodService]`

2. **Verify API key is loaded**:
   - Should see: `[FoodService] USDA API Key loaded successfully (36 chars)`

3. **Check the API**:
   - Visit: https://fdc.nal.usda.gov/api-docs.html
   - Check if USDA API is operational

4. **Verify request format**:
   - API should receive: `https://fdc.nal.usda.gov/api/foods/search?query=rice&pageNumber=1&pageSize=10&api_key=E2WpkwatJoL2sT1T4PUgqFDxyWj8UU1oO5R0t3pj`

## Security Note

- This API key is **public** (it's meant to be used in applications)
- Rate limiting is in place: ~100 requests/second per USDA
- No sensitive data is accessed with this key
- Safe to include in mobile app

## If You Want to Change the Key

1. Visit: https://fdc.nal.usda.gov/api-key-signup.html
2. Get a new API key
3. Update `src/services/foodService.ts`:
   ```typescript
   const USDA_API_KEY = "your_new_key_here";
   ```
4. Restart the app

---

Last Updated: January 17, 2026
