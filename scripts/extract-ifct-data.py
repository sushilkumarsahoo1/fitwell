#!/usr/bin/env python3
"""
Extract nutrition data from IFCT 2017 PDF and convert to JSON/CSV format
for importing into Supabase foods_indian table.

Installation: pip install pdfplumber pandas
"""

import pdfplumber
import json
import csv
import re
from typing import List, Dict, Optional
from pathlib import Path

class IFCTExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods = []
        
        # Map common column headers
        self.header_map = {
            'Energy (kcal)': 'calories',
            'Protein (g)': 'protein_g',
            'Fat (g)': 'fat_g',
            'Carbohydrates (g)': 'carbs_g',
            'Fiber (g)': 'fiber_g',
            'Water (g)': 'water_g',
            'Iron (mg)': 'iron_mg',
            'Calcium (mg)': 'calcium_mg',
            'Phosphorus (mg)': 'phosphorus_mg',
            'Vitamin C (mg)': 'vitamin_c_mg',
            'Vitamin A (IU)': 'vitamin_a_iu',
        }
    
    def extract_from_tables(self) -> List[Dict]:
        """Extract food data from PDF tables"""
        with pdfplumber.open(self.pdf_path) as pdf:
            print(f"Total pages: {len(pdf.pages)}")
            
            for page_num, page in enumerate(pdf.pages, 1):
                print(f"Processing page {page_num}...")
                
                tables = page.extract_tables()
                if not tables:
                    continue
                
                for table_idx, table in enumerate(tables):
                    if len(table) < 2:
                        continue
                    
                    # Try to parse table
                    headers = table[0]
                    for row in table[1:]:
                        if len(row) >= 2 and row[0]:  # Ensure food name exists
                            food_data = self._parse_row(headers, row)
                            if food_data:
                                self.foods.append(food_data)
                                print(f"  Extracted: {food_data['name']}")
        
        return self.foods
    
    def _parse_row(self, headers: List, row: List) -> Optional[Dict]:
        """Parse a single table row into food data structure"""
        try:
            if not row[0]:
                return None
            
            food = {
                'name': row[0].strip() if row[0] else '',
                'name_hindi': '',
                'category': 'Indian',
                'serving_size_g': 100,
                'source': 'IFCT',
            }
            
            # Parse nutrition columns
            for col_idx, header in enumerate(headers):
                if col_idx >= len(row):
                    break
                
                value = row[col_idx]
                if not value or not isinstance(value, (int, float, str)):
                    continue
                
                # Try to convert to float
                try:
                    num_value = float(value) if value else 0
                except:
                    continue
                
                # Map to nutrition field
                header_clean = header.strip() if isinstance(header, str) else str(header)
                for pattern, field in self.header_map.items():
                    if pattern.lower() in header_clean.lower():
                        food[field] = round(num_value, 2)
                        break
            
            # Validate food has at least name and one macro
            if food['name'] and any(key in food for key in ['calories', 'protein_g', 'fat_g', 'carbs_g']):
                return food
        
        except Exception as e:
            print(f"  Error parsing row: {e}")
        
        return None
    
    def to_json(self, output_path: str):
        """Export to JSON format"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.foods, f, indent=2, ensure_ascii=False)
        print(f"Exported {len(self.foods)} foods to {output_path}")
    
    def to_csv(self, output_path: str):
        """Export to CSV format for Supabase import"""
        if not self.foods:
            print("No foods to export")
            return
        
        # Get all unique fields
        all_fields = set()
        for food in self.foods:
            all_fields.update(food.keys())
        
        # Define column order
        column_order = [
            'name', 'name_hindi', 'category', 'serving_size_g', 'source',
            'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'water_g',
            'iron_mg', 'calcium_mg', 'phosphorus_mg', 'vitamin_c_mg', 'vitamin_a_iu'
        ]
        
        # Filter to existing columns
        columns = [col for col in column_order if col in all_fields]
        
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=columns, restval='')
            writer.writeheader()
            writer.writerows(self.foods)
        
        print(f"Exported {len(self.foods)} foods to {output_path}")
    
    def print_summary(self):
        """Print extraction summary"""
        print(f"\n--- Extraction Summary ---")
        print(f"Total foods extracted: {len(self.foods)}")
        
        if self.foods:
            print(f"\nSample foods:")
            for food in self.foods[:5]:
                print(f"  - {food.get('name', 'Unknown')}: {food.get('calories', 'N/A')} kcal")
            
            print(f"\nFields captured:")
            all_fields = set()
            for food in self.foods:
                all_fields.update(food.keys())
            for field in sorted(all_fields):
                print(f"  - {field}")


def main():
    pdf_path = '/Users/apple/Downloads/IFCT2017.pdf'
    output_dir = Path('/Users/apple/Developer/app/fitwell/data/ifct')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Extract data
    print("Starting IFCT 2017 extraction...")
    extractor = IFCTExtractor(pdf_path)
    extractor.extract_from_tables()
    
    # Export
    extractor.to_json(str(output_dir / 'ifct_foods.json'))
    extractor.to_csv(str(output_dir / 'ifct_foods.csv'))
    extractor.print_summary()


if __name__ == '__main__':
    main()
