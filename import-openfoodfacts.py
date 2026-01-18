#!/usr/bin/env python3
"""
Import OpenFoodFacts data from CSV to Supabase foods table
"""

import csv
import sys
from pathlib import Path
from typing import Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Try importing supabase
try:
    from supabase import create_client
except ImportError:
    print("❌ supabase-py not installed. Install with: pip install supabase")
    sys.exit(1)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mtevaxgfkjyifnaftxhl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE")

CSV_FILE = Path(__file__).parent / "en.openfoodfacts.org.products.csv"
BATCH_SIZE = 500
SKIP_ERRORS = True


def safe_float(value: Optional[str], default: float = 0.0) -> float:
    """Safely convert string to float"""
    if not value or value.strip() == "":
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def extract_nutrition_data(row: dict) -> dict:
    """Extract nutrition data from CSV row"""
    return {
        "calories_per_serving": max(100, safe_float(row.get("energy-kcal_100g", "0"), 100)),
        "protein_g": safe_float(row.get("proteins_100g", "0")),
        "carbs_g": safe_float(row.get("carbohydrates_100g", "0")),
        "fats_g": safe_float(row.get("fat_100g", "0")),
        "serving_size_g": safe_float(row.get("serving_size", "100"), 100),
    }


def get_category(row: dict) -> str:
    """Determine category from CSV data"""
    categories = row.get("categories_en", "").lower()
    if "indian" in categories or "asia" in categories:
        return "indian"
    return "global"


def process_csv_row(row: dict) -> Optional[dict]:
    """Process a CSV row into database format"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name:
            return None
        
        nutrition = extract_nutrition_data(row)
        
        return {
            "name": product_name,
            "calories_per_serving": int(nutrition["calories_per_serving"]),
            "protein_g": nutrition["protein_g"],
            "carbs_g": nutrition["carbs_g"],
            "fats_g": nutrition["fats_g"],
            "serving_size_g": nutrition["serving_size_g"],
            "category": get_category(row),
            "is_custom": False,
            "user_id": None,
        }
    except Exception as e:
        if not SKIP_ERRORS:
            raise
        return None


def import_foods_from_csv():
    """Main import function"""
    print("=" * 70)
    print("🍽️  OpenFoodFacts to Supabase - Food Importer")
    print("=" * 70)
    
    # Check CSV file
    if not CSV_FILE.exists():
        print(f"\n❌ CSV file not found: {CSV_FILE}")
        return False
    
    file_size_mb = CSV_FILE.stat().st_size / (1024 * 1024)
    print(f"\n📊 CSV File: {CSV_FILE.name}")
    print(f"   Size: {file_size_mb:.1f} MB")
    
    # Initialize Supabase
    print("\n🔗 Connecting to Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Test connection
        result = supabase.table("foods").select("id", count="exact").limit(1).execute()
        print(f"   ✅ Connected successfully")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Process CSV
    print(f"\n📥 Processing CSV (batch size: {BATCH_SIZE})...")
    
    batch = []
    imported = 0
    skipped = 0
    errors = 0
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
            # Increase field size limit for large CSV fields
            csv.field_size_limit(int(1e8))
            reader = csv.DictReader(f)
            
            for row_num, row in enumerate(reader, start=1):
                # Process row
                food_data = process_csv_row(row)
                
                if food_data is None:
                    skipped += 1
                    continue
                
                batch.append(food_data)
                
                # Upload batch
                if len(batch) >= BATCH_SIZE:
                    print(f"   Uploading batch {row_num // BATCH_SIZE} ({len(batch)} items)...", end=" ")
                    try:
                        response = supabase.table("foods").insert(batch).execute()
                        imported += len(batch)
                        print(f"✅ ({imported} total)")
                    except Exception as e:
                        error_msg = str(e)
                        if "UNIQUE" in error_msg or "duplicate" in error_msg.lower():
                            print(f"⚠️  (duplicates skipped)")
                        else:
                            print(f"❌ Error: {error_msg}")
                            errors += 1
                    batch = []
                
                # Progress indicator
                if row_num % (BATCH_SIZE * 10) == 0:
                    print(f"   Progress: {row_num:,} rows processed ({imported:,} imported)")
        
        # Upload remaining batch
        if batch:
            print(f"   Uploading final batch ({len(batch)} items)...", end=" ")
            try:
                response = supabase.table("foods").insert(batch).execute()
                imported += len(batch)
                print(f"✅ ({imported} total)")
            except Exception as e:
                print(f"❌ Error: {e}")
                errors += 1
    
    except Exception as e:
        print(f"\n❌ Error reading CSV: {e}")
        return False
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 Import Summary")
    print("=" * 70)
    print(f"✅ Successfully imported: {imported:,} foods")
    print(f"⏭️  Skipped (empty): {skipped:,} rows")
    print(f"❌ Errors: {errors:,}")
    print("=" * 70)
    
    return True


if __name__ == "__main__":
    success = import_foods_from_csv()
    sys.exit(0 if success else 1)
