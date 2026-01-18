#!/usr/bin/env python3
"""
Indian Foods Setup - Interactive Guide
"""

def print_header():
    print("\n" + "=" * 70)
    print("🇮🇳 FITWELL - Indian Foods Database Setup")
    print("=" * 70)

def step_1_sql():
    sql = """CREATE TABLE IF NOT EXISTS foods_indian (
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

CREATE POLICY "Allow all users to read" ON foods_indian
  FOR SELECT USING (true);"""
    
    return sql

def main():
    print_header()
    
    print("\n✅ STEP 1: Create Database Table")
    print("-" * 70)
    print("\n📍 Action: Go to Supabase and create the table")
    print("\n1. Open: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl/sql/new")
    print("2. Click: New Query")
    print("3. Paste this SQL:\n")
    
    sql = step_1_sql()
    print(sql)
    print("\n4. Click: Run")
    print("\n⏱️  Wait for confirmation (should see ✅ Query Completed)")
    
    print("\n" + "-" * 70)
    print("\n✅ STEP 2: Import Data")
    print("-" * 70)
    
    input("\n📌 Press ENTER after creating the table in Supabase...")
    
    print("\nNow importing 40 Indian foods to your database...")
    print("Processing...")
    
    try:
        from supabase import create_client
        import csv
        from pathlib import Path
        
        SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
        SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Load CSV
        foods_data = []
        with open('data/ifct/ifct_foods.csv', 'r', encoding='utf-8') as f:
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
        
        print(f"\n✅ Loaded {len(foods_data)} Indian foods from CSV")
        
        # Import
        batch_size = 10
        for i in range(0, len(foods_data), batch_size):
            batch = foods_data[i:i+batch_size]
            try:
                supabase.table('foods_indian').insert(batch).execute()
                print(f"   ✅ Imported {min(i + batch_size, len(foods_data))}/{len(foods_data)}")
            except Exception as e:
                print(f"   ❌ Error on batch {i//batch_size + 1}: {e}")
                raise
        
        print(f"\n✅ Successfully imported all {len(foods_data)} Indian foods!")
        
        # Verify
        print("\n🔍 Verifying data...")
        result = supabase.table('foods_indian').select('*').limit(5).execute()
        print(f"✅ Sample foods from database:")
        for food in result.data:
            print(f"   • {food['name']} ({food['calories']} cal) - {food['name_hindi']}")
        
        print("\n" + "=" * 70)
        print("✅ SETUP COMPLETE!")
        print("=" * 70)
        print("\n📱 Your app is ready to use!")
        print("   • 40+ Indian foods in local database")
        print("   • Zero API calls for Indian food search")
        print("   • Full nutrition data with macros & micros")
        print("\n🚀 Next: Open your app and look for the 'Indian Foods' toggle")
        print("=" * 70 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during import: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Make sure the table was created in Supabase")
        print("   2. Check that your credentials are correct")
        print("   3. Try importing manually via CSV upload in Supabase")

if __name__ == "__main__":
    main()
