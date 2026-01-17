# USDA API 404 Error - Root Cause & Resolution

## Problem

The FitWell app was receiving 404 errors when attempting to search foods using the USDA FoodData Central API, despite having a valid API key configured.

**Error Logs:**

```
[FoodService] USDA API Key loaded successfully (40 chars)
[FoodService] Searching for: "chicken" | API Key length: 40
[FoodService] Making USDA API request to: https://fdc.nal.usda.gov/api/foods/search
ERROR [FoodService] Error searching foods: [Error: USDA API error: 404 Unknown Error...]
```

## Root Cause

The USDA API endpoint URL was **incorrect**.

**Wrong Endpoint:**

```
https://fdc.nal.usda.gov/api/foods/search
```

This URL points to the USDA web interface, not the API, which returns 404 HTML pages.

## Solution

Changed the USDA API endpoint to the correct v1 API URL.

**Correct Endpoint:**

```
https://api.nal.usda.gov/fdc/v1/foods/search
```

### File Modified

- **File:** [src/services/foodService.ts](src/services/foodService.ts#L89)
- **Line:** 89
- **Change:** Updated `USDA_API_BASE` constant

**Before:**

```typescript
const USDA_API_BASE = "https://fdc.nal.usda.gov/api/foods";
```

**After:**

```typescript
const USDA_API_BASE = "https://api.nal.usda.gov/fdc/v1/foods";
```

## Verification

Tested the corrected endpoint with curl:

```bash
curl -s "https://api.nal.usda.gov/fdc/v1/foods/search?query=chicken&api_key=E2WpkwatJoL2sT1T4PUgqFDxyWj8UU1oO5R0t3pj" | jq '.foods[0].description'
```

**Result:**

```
"CHICKEN"
```

HTTP Status: `200 OK` with valid JSON response containing food results.

## Expected Behavior After Fix

✅ USDA food search now works correctly  
✅ Users can search for foods by name  
✅ Nutrition data is populated from USDA database  
✅ Food logging with USDA foods fully functional

## Notes

- The API key is valid and properly configured
- The endpoint accepts the same parameters as before
- No other changes needed to the searchFoods() or getFoodDetails() functions
- Full backward compatibility maintained
