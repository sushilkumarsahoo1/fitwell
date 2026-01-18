#!/usr/bin/env python3
"""
Create Indian foods table and import data via Supabase SQL
"""

import json
import csv
from pathlib import Path
import httpx

SUPABASE_URL = "https://mtevaxgfkjyifnaftxhl.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE"
SERVICE_ROLE_KEY = ""  # Will try anonymous key first

def execute_sql(sql_statement):
    """Execute SQL statement through Supabase RPC"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        # Try using sql RPC endpoint
        client = httpx.Client()
        response = client.post(
            f"{SUPABASE_URL}/rest/v1/rpc/execute_sql",
            headers=headers,
            json={"sql": sql_statement}
        )
        return response
    except:
        return None

def create_table():
    """Create the foods_indian table"""
    print("\n📋 Creating foods_indian table...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS foods_indian (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      name_hindi VARCHAR(255),
      category VARCHAR(100) DEFAULT 'Indian',
      description TEXT,
      serving_size_g DECIMAL(8, 2) DEFAULT 100,
      calories DECIMAL(10, 2),
      protein_g DECIMAL(10, 2),
      carbs_g DECIMAL(10, 2),
      fat_g DECIMAL(10, 2),
      fiber_g DECIMAL(10, 2),
      water_g DECIMAL(10, 2),
      micronutrients JSONB DEFAULT '{}',
      source VARCHAR(50),
      source_id VARCHAR(255),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
      UNIQUE(name)
    );
    
    ALTER TABLE foods_indian ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Allow all users to read foods_indian" ON foods_indian
      FOR SELECT USING (true);
    """
    
    response = execute_sql(sql)
    if response and response.status_code < 400:
        print("   ✅ Table created")
        return True
    else:
        print(f"   ⚠️  Could not create via SQL RPC: {response}")
        print("   💡 Will try direct insert (table might already exist)")
        return False

def load_foods_csv():
    """Load foods from CSV"""
    print("\n📂 Loading food data...")
    csv_file = Path("data/ifct/ifct_foods.csv")
    
    if not csv_file.exists():
        print(f"   ❌ CSV file not found: {csv_file}")
        return None
    
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
                'source': 'IFCT'
            })
    
    print(f"   ✅ Loaded {len(foods_data)} foods")
    return foods_data

def insert_foods_via_supabase(foods_data):
    """Insert foods using Supabase REST API"""
    print(f"\n📊 Importing {len(foods_data)} foods to database...")
    
    from supabase import create_client
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Try direct insert
        batch_size = 10
        imported = 0
        
        for i in range(0, len(foods_data), batch_size):
            batch = foods_data[i:i+batch_size]
            response = supabase.table('foods_indian').insert(batch).execute()
            imported = min(i + batch_size, len(foods_data))
            print(f"   ✅ Imported {imported}/{len(foods_data)} foods")
        
        print(f"\n✅ Successfully imported all {len(foods_data)} foods!")
        return True
        
    except Exception as e:
        print(f"   ❌ Import failed: {e}")
        return False

def main():
    print("=" * 60)
    print("🇮🇳 Indian Foods Database - Create Table & Import")
    print("=" * 60)
    
    # Load foods first
    foods_data = load_foods_csv()
    if not foods_data:
        return False
    
    # Try to create table (might already exist)
    create_table()
    
    # Insert foods
    return insert_foods_via_supabase(foods_data)

if __name__ == "__main__":
    success = main()
    print("\n" + "=" * 60)
    if success:
        print("✅ Setup Complete!")
    else:
        print("❌ Setup Failed - Check Supabase manually")
        print("\n💡 Manual steps:")
        print("1. Go to: https://app.supabase.com/project/mtevaxgfkjyifnaftxhl")
        print("2. SQL Editor → New Query")
        print("3. Copy SQL from: supabase/migrations/20260118_create_foods_indian_table.sql")
        print("4. Click Run")
    print("=" * 60)
    exit(0 if success else 1)
