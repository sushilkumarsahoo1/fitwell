#!/usr/bin/env python3
"""
Create foods_indian table and import data directly
"""

import json
import csv
from pathlib import Path

def main():
    print("\n" + "=" * 70)
    print("🇮🇳 Indian Foods - Database Setup")
    print("=" * 70)
    
    # Load CSV data
    print("\n📂 Loading foods from CSV...")
    csv_file = Path("data/ifct/ifct_foods.csv")
    foods_data = []
    
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
                'sodium_mg': float(row.get('sodium_mg', 0)),
                'potassium_mg': float(row.get('potassium_mg', 0)),
                'source': 'IFCT'
            })
    
    print(f"✅ Loaded {len(foods_data)} foods")
    
    # Connect & Import
    print("\n🔗 Connecting to Supabase...")
    from supabase import create_client
    
    SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
    SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected")
    
    # Import foods in batches
    print(f"\n📊 Importing {len(foods_data)} foods...")
    batch_size = 10
    
    for i in range(0, len(foods_data), batch_size):
        batch = foods_data[i:i+batch_size]
        try:
            response = supabase.table('foods_indian').insert(batch).execute()
            print(f"   ✅ {min(i+batch_size, len(foods_data))}/{len(foods_data)}")
        except Exception as e:
            error_str = str(e).lower()
            if 'foods_indian' in error_str and 'found' in error_str:
                print(f"\n❌ Table 'foods_indian' doesn't exist")
                print("\n💡 SOLUTION: Create the table in Supabase manually")
                print("\nGo to: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl/sql/new")
                print("\nRun this SQL:\n")
                print("""CREATE TABLE foods_indian (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  name_hindi VARCHAR(255),
  category VARCHAR(100),
  serving_size_g DECIMAL(10, 2),
  calories DECIMAL(10, 2),
  protein_g DECIMAL(10, 2),
  carbs_g DECIMAL(10, 2),
  fat_g DECIMAL(10, 2),
  fiber_g DECIMAL(10, 2),
  sodium_mg DECIMAL(10, 2),
  potassium_mg DECIMAL(10, 2),
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE foods_indian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select" ON foods_indian FOR SELECT USING (true);""")
                print("\nThen run this script again.")
                return False
            elif 'duplicate' in error_str or 'unique' in error_str:
                print(f"   ℹ️  {min(i+batch_size, len(foods_data))}/{len(foods_data)} (duplicates ok)")
            else:
                print(f"   ❌ Error: {e}")
                return False
    
    print(f"\n✅ Import complete")
    
    # Verify
    print("\n🔍 Verifying...")
    try:
        result = supabase.table('foods_indian').select('*').limit(5).execute()
        print(f"✅ Sample foods from database:")
        for food in result.data[:5]:
            print(f"   • {food['name']} ({food['calories']}cal) - {food['name_hindi']}")
    except Exception as e:
        print(f"⚠️  Could not verify: {e}")
    
    print("\n" + "=" * 70)
    print("✅ Indian Foods Ready!")
    print("=" * 70)
    return True

if __name__ == "__main__":
    try:
        success = main()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
