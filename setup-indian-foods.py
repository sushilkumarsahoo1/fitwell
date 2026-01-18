#!/usr/bin/env python3
"""
Apply Supabase migration and import Indian foods data
"""

import json
import csv
from pathlib import Path
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"

def main():
    print("=" * 60)
    print("🇮🇳 Indian Foods Database - Setup & Import")
    print("=" * 60)
    
    # Initialize Supabase client
    print("\n🔗 Connecting to Supabase...")
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("   ✅ Connected successfully")
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False
    
    # Load foods data
    print("\n📂 Loading food data...")
    csv_file = Path("data/ifct/ifct_foods.csv")
    if not csv_file.exists():
        print(f"   ❌ CSV file not found: {csv_file}")
        return False
    
    foods_data = []
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                foods_data.append({
                    'name': row['name'],
                    'name_hindi': row['name_hindi'],
                    'category': row['category'],
                    'serving_size_g': float(row['serving_size_g']),
                    'calories': float(row['calories']),
                    'protein_g': float(row['protein_g']),
                    'carbs_g': float(row['carbs_g']),
                    'fat_g': float(row['fat_g']),
                    'fiber_g': float(row['fiber_g']),
                    'sodium_mg': float(row['sodium_mg']),
                    'potassium_mg': float(row['potassium_mg']),
                    'source': 'IFCT'
                })
        print(f"   ✅ Loaded {len(foods_data)} foods")
    except Exception as e:
        print(f"   ❌ Failed to load CSV: {e}")
        return False
    
    # Insert foods into Supabase
    print("\n📊 Importing foods to database...")
    print(f"   Total foods to import: {len(foods_data)}")
    
    try:
        # Insert in batches
        batch_size = 10
        for i in range(0, len(foods_data), batch_size):
            batch = foods_data[i:i+batch_size]
            response = supabase.table('foods_indian').insert(batch).execute()
            print(f"   ✅ Imported {min(i+batch_size, len(foods_data))}/{len(foods_data)} foods")
        
        print(f"\n✅ Successfully imported all {len(foods_data)} foods!")
        
    except Exception as e:
        print(f"   ❌ Import failed: {e}")
        print(f"\n   Details: {str(e)}")
        return False
    
    # Verify data
    print("\n🔍 Verifying imported data...")
    try:
        result = supabase.table('foods_indian').select('COUNT(*)').execute()
        print(f"   ✅ Total foods in database: {len(result.data)}")
        
        # Show sample foods
        sample = supabase.table('foods_indian').select('*').limit(3).execute()
        print(f"\n   Sample foods imported:")
        for food in sample.data:
            print(f"      - {food['name']} ({food['calories']} cal)")
    except Exception as e:
        print(f"   ⚠️  Could not verify: {e}")
    
    print("\n" + "=" * 60)
    print("✅ Setup Complete!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
