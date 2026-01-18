#!/usr/bin/env python3
"""
Complete IFCT extraction: Process pages 1-4 (cereals, pulses) + 5-28 (vegetables, fruits, meat)
with proper nutrition parsing.
"""

import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import sys

class CompleteIFCTExtractor:
    """Extract all IFCT foods with complete coverage."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        
    def extract_complete(self) -> List[Dict]:
        """Extract ALL foods from complete PDF."""
        print("🌾 Complete IFCT Extraction (Pages 1-28)\n" + "=" * 70)
        
        try:
            # Process pages 1-4 (cereals, pulses) at higher quality
            print("\n📖 Processing pages 1-4 (Cereals & Pulses)...\n")
            images = convert_from_path(self.pdf_path, first_page=1, last_page=4, dpi=150)
            for idx, image in enumerate(images):
                page_num = idx + 1
                text = pytesseract.image_to_string(image, lang='eng')
                page_foods = self._parse_page(text, page_num)
                if page_foods:
                    self.foods.extend(page_foods)
                    print(f"  Page {page_num}: ✓ {len(page_foods)} foods")
                else:
                    print(f"  Page {page_num}: (no data)")
            
            # Process pages 5-28 (vegetables, fruits, dairy, meat, fish) at normal quality
            print("\n📖 Processing pages 5-28 (Vegetables, Fruits, Other)...\n")
            images = convert_from_path(self.pdf_path, first_page=5, last_page=28, dpi=140)
            for idx, image in enumerate(images):
                page_num = idx + 5
                text = pytesseract.image_to_string(image, lang='eng')
                page_foods = self._parse_page(text, page_num)
                if page_foods:
                    self.foods.extend(page_foods)
                    print(f"  Page {page_num}: ✓ {len(page_foods)} foods")
                else:
                    print(f"  Page {page_num}: (no data)")
            
            print(f"\n✅ Total extracted: {len(self.foods)} foods")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def _parse_page(self, text: str, page_num: int) -> List[Dict]:
        """Parse foods from page text."""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if len(line) < 15 or any(x in line.lower() for x in ['water', 'protcnt', 'fatce', 'food nam', 'fibre']):
                continue
            
            # Match food entry: CODE + NAME
            if re.match(r'^[A-Z]?\d{2,4}[\s\-_]', line):
                food = self._parse_food_entry(line)
                if food:
                    foods.append(food)
        
        return foods
    
    def _parse_food_entry(self, line: str) -> Optional[Dict]:
        """Parse single food entry."""
        try:
            # Extract code and name
            code_match = re.match(r'^([A-Z]?\d{2,4})[.\s\-_]+(.+?)(?=\s{2,}|\s+[\d\-]|$)', line)
            if not code_match:
                return None
            
            name = code_match.group(2).strip()
            # Remove scientific names in parentheses
            name = re.sub(r'\s*\([^)]*\).*$', '', name).strip()
            
            if not name or len(name) < 3:
                return None
            
            # Extract all numeric values
            nums = []
            for part in line.split():
                vals = re.findall(r'[\d.]+', part)
                for val in vals:
                    if val and val != '.':
                        try:
                            nums.append(float(val))
                        except:
                            pass
            
            if len(nums) < 4:
                return None
            
            nutrition = {
                'name': name,
                'name_hindi': '',
                'category': 'IFCT_Extracted',
                'serving_size_g': 100,
                'calories': None,
                'protein_g': None,
                'carbs_g': None,
                'fat_g': None,
                'fiber_g': None,
                'sodium_mg': None,
                'potassium_mg': None,
                'source': 'IFCT2017_Complete_OCR'
            }
            
            # IFCT order: Water%, Protein, Ash, Fat, Carbs, Fiber...
            # Skip water (first), use next values
            try:
                if len(nums) > 1:
                    nutrition['protein_g'] = self._validate(nums[1], 0, 100)
                if len(nums) > 3:
                    nutrition['fat_g'] = self._validate(nums[3], 0, 100)
                if len(nums) > 4:
                    nutrition['carbs_g'] = self._validate(nums[4], 0, 100)
                if len(nums) > 5:
                    nutrition['fiber_g'] = self._validate(nums[5], 0, 50)
                
                # Calculate calories if we have macros
                if nutrition['protein_g'] and nutrition['carbs_g'] and nutrition['fat_g']:
                    nutrition['calories'] = round(
                        nutrition['protein_g'] * 4 +
                        nutrition['carbs_g'] * 4 +
                        nutrition['fat_g'] * 9, 1
                    )
                
                if nutrition['calories'] and nutrition['protein_g']:
                    return nutrition
            except:
                pass
            
            return None
            
        except:
            return None
    
    def _validate(self, val: float, min_v: float, max_v: float) -> Optional[float]:
        if min_v <= val <= max_v:
            return val
        return None
    
    def save_to_csv(self, path: str) -> bool:
        """Save to CSV."""
        if not self.foods:
            return False
        
        try:
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'name', 'name_hindi', 'category', 'serving_size_g',
                    'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
                    'sodium_mg', 'potassium_mg', 'source'
                ])
                writer.writeheader()
                writer.writerows(self.foods)
            return True
        except Exception as e:
            print(f"❌ CSV Error: {e}")
            return False
    
    def save_to_json(self, path: str) -> bool:
        """Save to JSON."""
        if not self.foods:
            return False
        
        try:
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(self.foods, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"❌ JSON Error: {e}")
            return False
    
    def print_sample(self, count: int = 10):
        """Print sample foods."""
        if not self.foods:
            return
        
        print(f"\n📊 Sample ({min(count, len(self.foods))}/{len(self.foods)} foods):\n")
        
        for i, food in enumerate(self.foods[:count], 1):
            print(f"{i}. {food['name']}")
            print(f"   {food['calories']} kcal | {food['protein_g']}g protein | " + 
                  f"{food['carbs_g']}g carbs | {food['fat_g']}g fat")


def main():
    pdf_path = '/Users/apple/Developer/app/fitwell/IFCT2017.pdf'
    
    extractor = CompleteIFCTExtractor(pdf_path)
    foods = extractor.extract_complete()
    
    if foods:
        csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_all.csv'
        json_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_all.json'
        
        print("\n💾 Saving...")
        if extractor.save_to_csv(csv_path):
            print(f"   ✓ CSV: {csv_path}")
        if extractor.save_to_json(json_path):
            print(f"   ✓ JSON: {json_path}")
        
        extractor.print_sample()
        print(f"\n✅ {len(foods)} complete IFCT foods ready for import!\n")
    else:
        print("⚠️  No foods extracted\n")


if __name__ == '__main__':
    main()
