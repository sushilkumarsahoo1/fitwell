#!/usr/bin/env python3
"""
Fast IFCT OCR extraction using pytesseract with smart page sampling.
Instead of processing all 28 pages, sample key pages to identify pattern.
"""

import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import sys

class FastIFCTExtractor:
    """Fast extraction focusing on key pages with actual food data."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        
    def extract_foods_smart(self) -> List[Dict]:
        """Extract foods from key pages only (faster approach)."""
        print(f"📄 Converting PDF pages 5-10 (sample pages with data)...\n")
        
        try:
            # Convert only pages 5-10 (where tables typically start in IFCT)
            images = convert_from_path(self.pdf_path, first_page=5, last_page=10, dpi=150)
            print(f"✓ Converted {len(images)} sample pages to images")
            
            # Process each page
            for idx, image in enumerate(images):
                page_num = 5 + idx
                print(f"\n📖 Processing page {page_num}...")
                self._process_page(image, page_num)
                
            print(f"\n✅ Extraction complete! Found {len(self.foods)} foods from sample")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error: {e}", file=sys.stderr)
            return []
    
    def _process_page(self, image, page_num: int):
        """Process single page with OCR."""
        try:
            # Extract text directly (skip enhancement for speed)
            text = pytesseract.image_to_string(image, lang='eng')
            
            if not text.strip():
                print(f"  ⚠️  No text detected")
                return
            
            print(f"  📝 Extracted {len(text)} characters")
            
            # Parse text into food entries
            foods_on_page = self._parse_foods(text)
            if foods_on_page:
                self.foods.extend(foods_on_page)
                print(f"  ✓ Found {len(foods_on_page)} foods")
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
    
    def _parse_foods(self, text: str) -> List[Dict]:
        """Parse OCR text into food entries."""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines, headers, page numbers
            if not line or len(line) < 5:
                continue
            if any(x in line.lower() for x in ['page', 'serial', 'table of', 'code', 'sr no']):
                continue
            
            # Look for numeric entries (typically: number, food name, values)
            if re.match(r'^\d+\.?\s+', line):
                food = self._parse_food_line(line)
                if food:
                    foods.append(food)
        
        return foods
    
    def _parse_food_line(self, line: str) -> Optional[Dict]:
        """Parse single food entry line."""
        try:
            # Split by tabs or multiple spaces
            parts = [p.strip() for p in re.split(r'\s{2,}|\t', line)]
            
            if len(parts) < 2:
                return None
            
            # Remove serial number (first part)
            food_name = parts[1] if len(parts) > 1 else parts[0]
            
            if len(food_name) < 3 or any(x in food_name.lower() for x in ['code', 'class']):
                return None
            
            # Try to extract nutrition values from remaining parts
            nutrition = {
                'name': food_name,
                'name_hindi': '',
                'category': 'Extracted',
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
            
            # Extract numeric values
            nums = []
            for part in parts[2:]:
                val = self._to_float(part)
                if val is not None:
                    nums.append(val)
            
            # Assign values (typical IFCT order: calories, protein, carbs, fat, fiber)
            if len(nums) > 0:
                nutrition['calories'] = nums[0]
            if len(nums) > 1:
                nutrition['protein_g'] = nums[1]
            if len(nums) > 2:
                nutrition['carbs_g'] = nums[2]
            if len(nums) > 3:
                nutrition['fat_g'] = nums[3]
            if len(nums) > 4:
                nutrition['fiber_g'] = nums[4]
            
            # Only include if we have essential nutrition data
            if nutrition['calories'] and nutrition['protein_g']:
                return nutrition
            
            return None
            
        except Exception:
            return None
    
    def _to_float(self, value: str) -> Optional[float]:
        """Convert to float safely."""
        try:
            return float(value.replace(',', ''))
        except (ValueError, TypeError):
            return None
    
    def save_outputs(self, csv_path: str, json_path: str):
        """Save extracted foods."""
        if not self.foods:
            print("❌ No foods to save")
            return False
        
        try:
            Path(csv_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Save CSV
            fieldnames = ['name', 'name_hindi', 'category', 'serving_size_g',
                         'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
                         'sodium_mg', 'potassium_mg', 'source']
            
            with open(csv_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.foods)
            
            # Save JSON
            with open(json_path, 'w') as f:
                json.dump(self.foods, f, indent=2)
            
            print(f"\n✅ Saved {len(self.foods)} foods")
            print(f"   CSV: {csv_path}")
            print(f"   JSON: {json_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error saving: {e}")
            return False


def main():
    pdf_path = '/Users/apple/Developer/app/fitwell/IFCT2017.pdf'
    
    print("🌾 Fast IFCT OCR Extraction\n" + "="*50)
    
    extractor = FastIFCTExtractor(pdf_path)
    foods = extractor.extract_foods_smart()
    
    if foods:
        csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_ocr.csv'
        json_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_ocr.json'
        extractor.save_outputs(csv_path, json_path)
    else:
        print("\n⚠️  No foods extracted. PDF is heavily scanned/image-based.")
        print("    Recommendation: Use generated foods (40 items ready now)")
        print("                   or manually OCR pages with tesseract-gui")


if __name__ == '__main__':
    main()
