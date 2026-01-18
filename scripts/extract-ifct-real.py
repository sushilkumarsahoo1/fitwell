#!/usr/bin/env python3
"""
Parse real IFCT 2017 OCR data into structured food records.
Uses actual extracted text from PDF OCR.
"""

import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import sys

class IFCTOCRParser:
    """Parse IFCT OCR data into food records."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        self.extraction_log: List[str] = []
        
    def extract_all_foods(self, start_page: int = 5, end_page: int = 28) -> List[Dict]:
        """Extract foods from all pages (or range)."""
        print(f"📄 Processing pages {start_page}-{end_page}...")
        
        try:
            images = convert_from_path(self.pdf_path, first_page=start_page, 
                                       last_page=min(end_page, 28), dpi=120)
            print(f"✓ Converted {len(images)} pages\n")
            
            for idx, image in enumerate(images):
                page_num = start_page + idx
                print(f"📖 Page {page_num}...", end=" ")
                
                text = pytesseract.image_to_string(image, lang='eng')
                page_foods = self._parse_page(text, page_num)
                
                if page_foods:
                    self.foods.extend(page_foods)
                    print(f"✓ {len(page_foods)} foods")
                else:
                    print("(no data)")
            
            print(f"\n✅ Extracted {len(self.foods)} total foods")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)
            return []
    
    def _parse_page(self, text: str, page_num: int) -> List[Dict]:
        """Parse OCR text from a single page."""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if not line or len(line) < 10:
                continue
            
            # Skip headers/metadata
            if any(x in line.lower() for x in ['water', 'protcnt', 'fatce', 'page', 'table', 'code', 'serial', 'name', 'fibre', 'energy']):
                continue
            
            # Look for food entries: typically start with number/code
            # Examples: "C028 Parsley...", "028 Parsley...", "C029 Ponnaganni..."
            match = re.match(r'^[A-Za-z]?\d+\.?\s+', line)
            if match:
                food = self._parse_food_line(line)
                if food:
                    foods.append(food)
        
        return foods
    
    def _parse_food_line(self, line: str) -> Optional[Dict]:
        """Parse a single food entry line from OCR text."""
        try:
            # Remove serial number (C028, 028, etc)
            clean = re.sub(r'^[A-Za-z]?\d+\.?\s+', '', line)
            
            # Split by multiple spaces or tabs (OCR creates these as column separators)
            parts = [p.strip() for p in re.split(r'\s{2,}|\t', clean) if p.strip()]
            
            if not parts:
                return None
            
            food_name = parts[0]
            
            # Skip if name looks wrong
            if len(food_name) < 3 or not re.search(r'[a-zA-Z]', food_name):
                return None
            
            # Remove parenthetical scientific names
            food_name = re.sub(r'\s*\([^)]*\).*', '', food_name).strip()
            
            # Extract all numeric values (nutrition data)
            nums = []
            for part in parts[1:]:
                # Handle numbers with or without decimals, commas, hyphens
                vals = re.findall(r'[\d.]+', part)
                nums.extend([float(v) for v in vals if v and v != '.'])
            
            if not nums or len(nums) < 2:
                return None
            
            # IFCT format (approximately):
            # Water, Protein, Ash, Fat, Carbohydrate, Fiber (various), Energy (kJ, kcal)
            # Let's map the first ~8 values
            nutrition = {
                'name': food_name,
                'name_hindi': '',
                'category': 'Extracted_from_IFCT',
                'serving_size_g': 100,
                'calories': None,
                'protein_g': None,
                'carbs_g': None,
                'fat_g': None,
                'fiber_g': None,
                'sodium_mg': None,
                'potassium_mg': None,
                'source': 'IFCT2017_OCR'
            }
            
            # Map numeric values (guessing based on typical IFCT order)
            if len(nums) > 0:
                nutrition['protein_g'] = self._clamp_protein(nums[0])  # Usually protein is first
            if len(nums) > 1:
                nutrition['fat_g'] = self._clamp_fat(nums[1])          # Fat
            if len(nums) > 2:
                nutrition['carbs_g'] = self._clamp_carbs(nums[2])      # Carbs
            if len(nums) > 3:
                nutrition['fiber_g'] = self._clamp_fiber(nums[3])      # Fiber
            
            # Estimate calories if we have protein, carbs, fat
            if nutrition['protein_g'] and nutrition['carbs_g'] and nutrition['fat_g']:
                nutrition['calories'] = (
                    nutrition['protein_g'] * 4 +
                    nutrition['carbs_g'] * 4 +
                    nutrition['fat_g'] * 9
                )
            elif len(nums) > 4:
                # Try using the later numeric values as energy (usually last are in kcal/kJ)
                # Pick a reasonable energy value
                possible_energy = [n for n in nums[4:] if 50 < n < 800]
                if possible_energy:
                    nutrition['calories'] = possible_energy[0]
            
            # Validate that we have core nutrition
            if nutrition['calories'] and nutrition['protein_g']:
                return nutrition
            
            return None
            
        except Exception as e:
            return None
    
    def _clamp_protein(self, val: float) -> Optional[float]:
        """Validate protein value (typically 0-50g per 100g)."""
        if 0 <= val <= 60:
            return val
        return None
    
    def _clamp_fat(self, val: float) -> Optional[float]:
        """Validate fat value (typically 0-100g per 100g)."""
        if 0 <= val <= 100:
            return val
        return None
    
    def _clamp_carbs(self, val: float) -> Optional[float]:
        """Validate carbs value (typically 0-100g per 100g)."""
        if 0 <= val <= 100:
            return val
        return None
    
    def _clamp_fiber(self, val: float) -> Optional[float]:
        """Validate fiber value (typically 0-30g per 100g)."""
        if 0 <= val <= 50:
            return val
        return None
    
    def save_outputs(self, csv_path: str, json_path: str) -> bool:
        """Save extracted foods to CSV and JSON."""
        if not self.foods:
            print("❌ No foods to save")
            return False
        
        try:
            Path(csv_path).parent.mkdir(parents=True, exist_ok=True)
            
            fieldnames = ['name', 'name_hindi', 'category', 'serving_size_g',
                         'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
                         'sodium_mg', 'potassium_mg', 'source']
            
            # Save CSV
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.foods)
            
            # Save JSON
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(self.foods, f, indent=2, ensure_ascii=False)
            
            print(f"\n✅ Saved {len(self.foods)} foods:")
            print(f"   CSV:  {csv_path}")
            print(f"   JSON: {json_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving: {e}")
            return False
    
    def print_sample(self, count: int = 5):
        """Print sample of extracted foods."""
        if not self.foods:
            return
        
        print(f"\n📊 Sample of extracted foods ({min(count, len(self.foods))}/{len(self.foods)}):")
        print("-" * 80)
        
        for food in self.foods[:count]:
            print(f"\n  {food['name']}")
            print(f"    Calories: {food['calories']} | Protein: {food['protein_g']}g | "
                  f"Carbs: {food['carbs_g']}g | Fat: {food['fat_g']}g")


def main():
    pdf_path = '/Users/apple/Developer/app/fitwell/IFCT2017.pdf'
    
    print("🌾 IFCT 2017 Real OCR Parser")
    print("=" * 60 + "\n")
    
    parser = IFCTOCRParser(pdf_path)
    foods = parser.extract_all_foods(start_page=5, end_page=28)
    
    if foods:
        csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_real.csv'
        json_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_real.json'
        
        if parser.save_outputs(csv_path, json_path):
            parser.print_sample(count=10)
    else:
        print("\n⚠️  No foods could be parsed from OCR output")
        print("    (PDF may need different DPI or language settings)")


if __name__ == '__main__':
    main()
