#!/usr/bin/env python3
"""
Import extracted IFCT foods to Supabase database.
"""

import csv
import json
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import sys

# Load environment
load_dotenv()
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Missing Supabase credentials in .env file")
    print("   Add SUPABASE_URL and SUPABASE_ANON_KEY to .env")
    sys.exit(1)

# Initialize Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def import_from_csv(csv_path: str) -> int:
    """Import foods from CSV file."""
    imported_count = 0
    failed_count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        foods = list(reader)
    
    print(f"📊 Importing {len(foods)} foods from {csv_path}\n")
    
    for i, food in enumerate(foods, 1):
        try:
            # Prepare record
            record = {
                'name': food.get('name', ''),
                'name_hindi': food.get('name_hindi', ''),
                'category': food.get('category', 'Extracted'),
                'serving_size_g': float(food.get('serving_size_g', 100)),
                'calories': float(food.get('calories', 0)) if food.get('calories') else 0,
                'protein_g': float(food.get('protein_g', 0)) if food.get('protein_g') else 0,
                'carbs_g': float(food.get('carbs_g', 0)) if food.get('carbs_g') else 0,
                'fat_g': float(food.get('fat_g', 0)) if food.get('fat_g') else 0,
                'fiber_g': float(food.get('fiber_g', 0)) if food.get('fiber_g') else 0,
                'sodium_mg': float(food.get('sodium_mg', 0)) if food.get('sodium_mg') else 0,
                'potassium_mg': float(food.get('potassium_mg', 0)) if food.get('potassium_mg') else 0,
                'source': 'IFCT2017_OCR'
            }
            
            # Skip if no name
            if not record['name']:
                failed_count += 1
                continue
            
            # Insert into Supabase
            response = supabase.table('foods_indian').insert(record).execute()
            imported_count += 1
            
            # Progress indicator
            if i % 20 == 0:
                print(f"  ✓ {i}/{len(foods)} imported...")
        
        except Exception as e:
            failed_count += 1
            if failed_count <= 3:  # Show first few errors
                print(f"  ⚠️  Row {i}: {str(e)[:60]}")
    
    return imported_count


def main():
    print("🌾 Import IFCT Foods to Supabase\n")
    print("=" * 60)
    
    csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_final.csv'
    
    # Check file exists
    if not Path(csv_path).exists():
        print(f"❌ File not found: {csv_path}")
        print("\n   First run: python scripts/extract-ifct-final.py")
        sys.exit(1)
    
    # Import
    try:
        imported = import_from_csv(csv_path)
        
        print(f"\n{'=' * 60}")
        print(f"✅ Import complete!")
        print(f"   Imported: {imported} foods")
        print(f"\n   Verify in Supabase:")
        print(f"   SELECT COUNT(*) FROM foods_indian;")
        
    except Exception as e:
        print(f"\n❌ Import failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
