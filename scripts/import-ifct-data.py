#!/usr/bin/env python3
"""
Import IFCT food data into Supabase foods_indian table.

Installation: pip install supabase python-dotenv
"""

import json
import csv
import os
import sys
from pathlib import Path
from typing import List, Dict
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def import_from_json(json_file: str, batch_size: int = 100) -> int:
    """Import foods from JSON file to Supabase"""
    try:
        from supabase import create_client, Client
    except ImportError:
        print("Error: supabase package not installed. Run: pip install supabase")
        return 0
    
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment")
        return 0
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Read JSON file
    with open(json_file, 'r', encoding='utf-8') as f:
        foods = json.load(f)
    
    print(f"Loaded {len(foods)} foods from {json_file}")
    
    # Import in batches
    imported = 0
    for i in range(0, len(foods), batch_size):
        batch = foods[i:i+batch_size]
        
        try:
            # Prepare data for insertion
            batch_data = []
            for food in batch:
                # Extract micronutrients to separate JSON field
                micro = {}
                for key in list(food.keys()):
                    if key in ['iron_mg', 'calcium_mg', 'phosphorus_mg', 'vitamin_c_mg', 'vitamin_a_iu']:
                        micro[key] = food.pop(key)
                
                food['micronutrients'] = micro
                batch_data.append(food)
            
            # Insert batch
            response = supabase.table('foods_indian').insert(batch_data).execute()
            imported += len(batch)
            print(f"  Imported {imported}/{len(foods)} foods...")
        
        except Exception as e:
            print(f"  Error importing batch {i//batch_size}: {e}")
            continue
    
    print(f"Successfully imported {imported} foods!")
    return imported


def import_from_csv(csv_file: str, batch_size: int = 100) -> int:
    """Import foods from CSV file to Supabase"""
    try:
        from supabase import create_client, Client
    except ImportError:
        print("Error: supabase package not installed. Run: pip install supabase")
        return 0
    
    # Initialize Supabase client
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("Error: SUPABASE_URL or SUPABASE_ANON_KEY not set in environment")
        return 0
    
    supabase: Client = create_client(supabase_url, supabase_key)
    
    # Read CSV file
    foods = []
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert numeric fields
            for field in ['serving_size_g', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'water_g']:
                if field in row and row[field]:
                    try:
                        row[field] = float(row[field])
                    except:
                        row[field] = None
            
            foods.append(row)
    
    print(f"Loaded {len(foods)} foods from {csv_file}")
    
    # Import in batches
    imported = 0
    for i in range(0, len(foods), batch_size):
        batch = foods[i:i+batch_size]
        
        try:
            # Prepare data for insertion
            batch_data = []
            for food in batch:
                # Extract micronutrients to separate JSON field
                micro = {}
                for key in ['iron_mg', 'calcium_mg', 'phosphorus_mg', 'vitamin_c_mg', 'vitamin_a_iu']:
                    if key in food and food[key]:
                        try:
                            micro[key] = float(food.pop(key))
                        except:
                            if key in food:
                                del food[key]
                
                # Remove empty values
                food = {k: v for k, v in food.items() if v is not None and v != ''}
                food['micronutrients'] = micro
                batch_data.append(food)
            
            # Insert batch
            response = supabase.table('foods_indian').insert(batch_data).execute()
            imported += len(batch)
            print(f"  Imported {imported}/{len(foods)} foods...")
        
        except Exception as e:
            print(f"  Error importing batch {i//batch_size}: {e}")
            continue
    
    print(f"Successfully imported {imported} foods!")
    return imported


def main():
    if len(sys.argv) < 2:
        print("Usage: python import-ifct-data.py <json_or_csv_file>")
        print("Example: python import-ifct-data.py data/ifct/ifct_foods.json")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not Path(file_path).exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)
    
    if file_path.endswith('.json'):
        imported = import_from_json(file_path)
    elif file_path.endswith('.csv'):
        imported = import_from_csv(file_path)
    else:
        print("Error: Unsupported file format. Use JSON or CSV.")
        sys.exit(1)
    
    if imported == 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
