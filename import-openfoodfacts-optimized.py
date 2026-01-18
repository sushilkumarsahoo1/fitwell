#!/usr/bin/env python3
"""
Optimized OpenFoodFacts to Supabase - Food Importer
Handles large CSV files efficiently
"""

import csv
import sys
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
import time

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
BATCH_SIZE = 1000
MAX_ROWS = None  # Set to a number to limit (e.g., 10000 for testing)


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
    energy_kcal = safe_float(row.get("energy-kcal_100g", "0"))
    
    return {
        "calories_per_serving": max(10, int(energy_kcal)) if energy_kcal > 0 else 100,
        "protein_g": safe_float(row.get("proteins_100g", "0")),
        "carbs_g": safe_float(row.get("carbohydrates_100g", "0")),
        "fats_g": safe_float(row.get("fat_100g", "0")),
        "serving_size_g": safe_float(row.get("serving_size", "100"), 100),
    }


def get_category(row: dict) -> str:
    """Determine category from CSV data"""
    categories = (row.get("categories_en") or "").lower()
    if "indian" in categories or "asia" in categories:
        return "indian"
    return "global"


def process_csv_row(row: dict) -> Optional[dict]:
    """Process a CSV row into database format"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name or len(product_name) < 2:
            return None
        
        # Skip if no nutrition data
        energy_kcal = safe_float(row.get("energy-kcal_100g", "0"))
        if energy_kcal <= 0:
            return None
        
        nutrition = extract_nutrition_data(row)
        
        # Validate nutrition data
        if nutrition["protein_g"] == 0 and nutrition["carbs_g"] == 0 and nutrition["fats_g"] == 0:
            return None
        
        return {
            "name": product_name[:255],  # Limit to column size
            "calories_per_serving": nutrition["calories_per_serving"],
            "protein_g": max(0, nutrition["protein_g"]),
            "carbs_g": max(0, nutrition["carbs_g"]),
            "fats_g": max(0, nutrition["fats_g"]),
            "serving_size_g": max(1, nutrition["serving_size_g"]),
            "category": get_category(row),
            "is_custom": False,
            "user_id": None,
        }
    except Exception:
        return None


def import_foods_from_csv():
    """Main import function"""
    print("=" * 70)
    print("🍽️  OpenFoodFacts to Supabase - Optimized Importer")
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
        existing_count = result.count if hasattr(result, 'count') else 0
        print(f"   ✅ Connected successfully")
        print(f"   📊 Existing foods in database: {existing_count}")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Process CSV
    print(f"\n📥 Processing CSV (batch size: {BATCH_SIZE})...")
    print("   (This will take several minutes for the full dataset)")
    
    batch = []
    imported = 0
    skipped = 0
    duplicate_errors = 0
    other_errors = 0
    row_num = 0
    start_time = time.time()
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
            # Increase field size limit for large CSV fields
            csv.field_size_limit(int(1e8))
            reader = csv.DictReader(f)
            
            for row in reader:
                row_num += 1
                
                # Check limit
                if MAX_ROWS and row_num > MAX_ROWS:
                    print(f"\n   ⏹️  Stopped at {row_num:,} rows (MAX_ROWS limit)")
                    break
                
                # Process row
                food_data = process_csv_row(row)
                
                if food_data is None:
                    skipped += 1
                    continue
                
                batch.append(food_data)
                
                # Upload batch
                if len(batch) >= BATCH_SIZE:
                    elapsed = time.time() - start_time
                    rate = row_num / elapsed if elapsed > 0 else 0
                    print(f"   Batch {row_num // BATCH_SIZE} | Rows: {row_num:,} ({rate:.0f} r/s) | Imported: {imported:,}", end="")
                    
                    try:
                        response = supabase.table("foods").insert(batch).execute()
                        imported += len(batch)
                        print(f" ✅")
                    except Exception as e:
                        error_msg = str(e)
                        if "UNIQUE" in error_msg or "duplicate" in error_msg.lower() or "key" in error_msg.lower():
                            print(f" ⚠️  (duplicates)")
                            duplicate_errors += 1
                        else:
                            print(f" ❌ ({error_msg[:50]})")
                            other_errors += 1
                    batch = []
        
        # Upload remaining batch
        if batch:
            print(f"   Final batch ({len(batch)} items)...", end=" ")
            try:
                response = supabase.table("foods").insert(batch).execute()
                imported += len(batch)
                print(f"✅")
            except Exception as e:
                print(f"❌ Error: {e}")
                other_errors += 1
    
    except Exception as e:
        print(f"\n❌ Error reading CSV: {e}")
        return False
    
    # Summary
    elapsed = time.time() - start_time
    print("\n" + "=" * 70)
    print("📊 Import Summary")
    print("=" * 70)
    print(f"✅ Successfully imported: {imported:,} foods")
    print(f"⏭️  Skipped (invalid): {skipped:,} rows")
    print(f"⚠️  Duplicate errors: {duplicate_errors:,}")
    print(f"❌ Other errors: {other_errors:,}")
    print(f"⏱️  Time elapsed: {elapsed:.1f}s ({elapsed/60:.1f}m)")
    print(f"📊 Processing rate: {row_num/elapsed:.0f} rows/sec")
    print("=" * 70)
    
    return imported > 0


if __name__ == "__main__":
    success = import_foods_from_csv()
    sys.exit(0 if success else 1)
