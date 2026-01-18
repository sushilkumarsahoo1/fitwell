#!/usr/bin/env python3
"""
Clean and finalize IFCT data - remove OCR noise and prepare for import.
"""

import csv
import json
import re
from pathlib import Path
from typing import List, Dict

def clean_food_data(foods: List[Dict]) -> List[Dict]:
    """Clean and validate food data."""
    cleaned = []
    
    for food in foods:
        # Skip if name is empty or has too much noise
        name = food.get('name', '').strip()
        
        # Skip obvious OCR errors (too much text, only numbers, etc)
        if not name or len(name) < 2:
            continue
        
        # Remove obvious OCR artifacts - lines with 'pause CAG', etc
        if any(x in name.lower() for x in ['pause', 'cag to aru', 'heredoc', 'food nam']):
            continue
        
        # Clean OCR artifacts from name
        name = re.sub(r'\d{4,}', '', name)  # Remove long number sequences
        name = re.sub(r'\s+', ' ', name).strip()  # Clean spaces
        
        if len(name) < 2:
            continue
        
        # Validate nutrition numbers
        try:
            calories = float(food.get('calories', 0))
            protein = float(food.get('protein_g', 0) or 0)
            carbs = float(food.get('carbs_g', 0) or 0)
            fat = float(food.get('fat_g', 0) or 0)
            
            # Basic validation
            if calories < 1 or calories > 900:
                continue
            if protein < 0 or protein > 100:
                continue
            if carbs < 0 or carbs > 100:
                continue
            if fat < 0 or fat > 100:
                continue
            
            # Create clean record
            clean_food = {
                'name': name,
                'name_hindi': food.get('name_hindi', ''),
                'category': 'IFCT2017',
                'serving_size_g': 100,
                'calories': round(calories, 1),
                'protein_g': round(protein, 2),
                'carbs_g': round(carbs, 2),
                'fat_g': round(fat, 2),
                'fiber_g': float(food.get('fiber_g', 0) or 0) if food.get('fiber_g') else None,
                'sodium_mg': None,
                'potassium_mg': None,
                'source': 'IFCT2017_Complete_OCR'
            }
            
            cleaned.append(clean_food)
            
        except:
            continue
    
    return cleaned


def main():
    print("🧹 Cleaning IFCT Data\n" + "=" * 60)
    
    # Read raw extracted data
    csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_complete.csv'
    
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        raw_foods = list(reader)
    
    print(f"📥 Read {len(raw_foods)} raw foods")
    
    # Clean data
    cleaned_foods = clean_food_data(raw_foods)
    print(f"✓ Cleaned to {len(cleaned_foods)} valid foods\n")
    
    # Save cleaned CSV
    output_csv = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_final.csv'
    output_json = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_final.json'
    
    # Save CSV
    with open(output_csv, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'name', 'name_hindi', 'category', 'serving_size_g',
            'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
            'sodium_mg', 'potassium_mg', 'source'
        ])
        writer.writeheader()
        writer.writerows(cleaned_foods)
    
    print(f"💾 Saved CSV: {output_csv}")
    
    # Save JSON
    with open(output_json, 'w') as f:
        json.dump(cleaned_foods, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved JSON: {output_json}")
    
    # Show samples
    print(f"\n📊 Sample (first 15 foods):\n")
    for i, food in enumerate(cleaned_foods[:15], 1):
        print(f"{i:2d}. {food['name']:45s} | "
              f"{food['calories']:6.1f} kcal | "
              f"P:{food['protein_g']:5.1f}g C:{food['carbs_g']:5.1f}g F:{food['fat_g']:5.1f}g")
    
    # Coverage stats
    print(f"\n📊 Data Coverage:")
    for field in ['calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g']:
        non_empty = sum(1 for f in cleaned_foods if f.get(field) is not None)
        pct = (non_empty / len(cleaned_foods)) * 100
        print(f"  {field:15} {non_empty:3}/{len(cleaned_foods)} ({pct:6.1f}%)")
    
    print(f"\n✅ {len(cleaned_foods)} clean foods ready for Supabase import!\n")


if __name__ == '__main__':
    main()
