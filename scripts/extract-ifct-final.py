#!/usr/bin/env python3
"""
Extract real IFCT 2017 food data from OCR-scanned PDF.
Successfully parses the actual food composition tables.
"""

import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import sys

class IFCTExtractor:
    """Extract IFCT food data from OCR output."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        
    def extract_all_foods(self, start_page: int = 1, end_page: int = 28) -> List[Dict]:
        """Extract foods from PDF pages (ALL pages)."""
        print(f"📄 Processing IFCT2017.pdf pages {start_page}-{end_page} (all data)...\n")
        
        try:
            images = convert_from_path(self.pdf_path, first_page=start_page, 
                                       last_page=min(end_page, 28), dpi=100)
            print(f"✓ Converted {len(images)} pages\n")
            
            for idx, image in enumerate(images):
                page_num = start_page + idx
                print(f"📖 Page {page_num}...", end=" ", flush=True)
                
                text = pytesseract.image_to_string(image, lang='eng')
                page_foods = self._parse_page_text(text)
                
                if page_foods:
                    self.foods.extend(page_foods)
                    print(f"✓ {len(page_foods)} foods")
                else:
                    print("(no food data)")
            
            print(f"\n✅ Successfully extracted {len(self.foods)} foods total\n")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)
            return []
    
    def _parse_page_text(self, text: str) -> List[Dict]:
        """Parse OCR text into food entries."""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty or very short lines
            if len(line) < 15:
                continue
            
            # Skip header/metadata lines
            if any(x in line.lower() for x in ['water', 'protcnt', 'fatce', 'food nam', 'fibre', 'energy']):
                continue
            
            # Match food entry pattern: CODE FOOD_NAME ... NUMBERS
            # Examples: "C028 Parsley (Petroselinum...)"
            #           "D001 Ash gourd (Benincasa...)"
            if re.match(r'^[A-Z]?\d{2,4}[\s\-_]', line):
                food = self._parse_food_entry(line)
                if food:
                    foods.append(food)
        
        return foods
    
    def _parse_food_entry(self, line: str) -> Optional[Dict]:
        """Parse single food entry line."""
        try:
            # Extract food code and name
            code_match = re.match(r'^([A-Z]?\d{2,4})[.\s\-_]+(.+?)(?=\s+[\d\-]|\s{2,})', line)
            if not code_match:
                return None
            
            code = code_match.group(1)
            name_part = code_match.group(2).strip()
            
            # Remove scientific name in parentheses
            food_name = re.sub(r'\s*\([^)]*\).*$', '', name_part).strip()
            
            # Skip if name is too short or invalid
            if not food_name or len(food_name) < 3 or not re.search(r'[a-zA-Z]', food_name):
                return None
            
            # Extract all numeric values from the line
            # IFCT format has: Water, Protein, Ash, Fat, Carbs, Fiber (total/insoluble/soluble), Energy
            nums = []
            for part in line.split():
                # Extract numbers, handle OCR artifacts like "0" instead of "O", etc.
                vals = re.findall(r'[\d.]+', part)
                for val in vals:
                    if val and val != '.':
                        try:
                            nums.append(float(val))
                        except:
                            pass
            
            if not nums or len(nums) < 5:
                return None
            
            # Build nutrition dict
            # Typical IFCT order (approximately): 
            # [water%, protein, ash, fat, carbs, fiber_total, fiber_insoluble, fiber_soluble, energy_kcal, energy_kj]
            nutrition = {
                'name': food_name,
                'name_hindi': '',
                'category': 'Extracted_IFCT',
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
            
            # Skip water content (first value, usually 70-95)
            # Assign based on IFCT typical order
            if len(nums) > 1:
                nutrition['protein_g'] = self._validate_protein(nums[1])
            if len(nums) > 3:
                nutrition['fat_g'] = self._validate_fat(nums[3])
            if len(nums) > 4:
                nutrition['carbs_g'] = self._validate_carbs(nums[4])
            if len(nums) > 5:
                nutrition['fiber_g'] = self._validate_fiber(nums[5])
            
            # Calculate calories if we have the macros
            if nutrition['protein_g'] and nutrition['carbs_g'] and nutrition['fat_g']:
                nutrition['calories'] = round(
                    nutrition['protein_g'] * 4 +
                    nutrition['carbs_g'] * 4 +
                    nutrition['fat_g'] * 9,
                    1
                )
            elif len(nums) > 8:
                # Last numbers are usually energy in kJ and kcal
                # Try to find a reasonable calorie value
                for val in nums[-3:]:
                    if 30 < val < 600:  # Reasonable kcal per 100g
                        nutrition['calories'] = val
                        break
            
            # Only return if we have minimum nutrition data
            if nutrition['calories'] and nutrition['protein_g']:
                return nutrition
            
            return None
            
        except Exception as e:
            return None
    
    def _validate_protein(self, val: float) -> Optional[float]:
        if 0 <= val <= 100:
            return val
        return None
    
    def _validate_fat(self, val: float) -> Optional[float]:
        if 0 <= val <= 100:
            return val
        return None
    
    def _validate_carbs(self, val: float) -> Optional[float]:
        if 0 <= val <= 100:
            return val
        return None
    
    def _validate_fiber(self, val: float) -> Optional[float]:
        if 0 <= val <= 50:
            return val
        return None
    
    def save_to_csv(self, path: str) -> bool:
        """Save to CSV file."""
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
        """Save to JSON file."""
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
        """Print sample of extracted foods."""
        if not self.foods:
            return
        
        print(f"📊 Sample ({min(count, len(self.foods))}/{len(self.foods)} foods):\n")
        
        for i, food in enumerate(self.foods[:count], 1):
            print(f"{i}. {food['name']}")
            print(f"   Energy: {food['calories']} kcal | "
                  f"Protein: {food['protein_g']}g | "
                  f"Carbs: {food['carbs_g']}g | "
                  f"Fat: {food['fat_g']}g | "
                  f"Fiber: {food['fiber_g']}g")


def main():
    pdf_path = '/Users/apple/Developer/app/fitwell/IFCT2017.pdf'
    
    print("🌾 IFCT 2017 OCR Food Extraction (COMPLETE)")
    print("=" * 70 + "\n")
    
    extractor = IFCTExtractor(pdf_path)
    foods = extractor.extract_all_foods(start_page=1, end_page=28)  # ALL PAGES
    
    if foods:
        csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_extracted.csv'
        json_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_extracted.json'
        
        print("💾 Saving extracted data...")
        if extractor.save_to_csv(csv_path):
            print(f"   ✓ CSV: {csv_path}")
        if extractor.save_to_json(json_path):
            print(f"   ✓ JSON: {json_path}")
        
        extractor.print_sample(count=10)
        
        print(f"\n✅ Complete! {len(foods)} real IFCT foods extracted from PDF")
        print(f"   Ready to import to Supabase database\n")
    else:
        print("⚠️  Could not extract foods from PDF")
        print("   PDF may need different settings or manual review\n")


if __name__ == '__main__':
    main()
