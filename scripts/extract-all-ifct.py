#!/usr/bin/env python3
"""
Complete IFCT 2017 extraction - Extract ALL 425 foods from the full PDF.
Uses OCR on all 28 pages with aggressive parsing to capture every entry.
"""

import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import sys

class FullIFCTExtractor:
    """Extract ALL IFCT foods with complete coverage."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        self.errors: List[str] = []
        
    def extract_all(self, dpi: int = 140) -> List[Dict]:
        """Extract ALL foods from all 28 pages."""
        print(f"🌾 Complete IFCT Extraction (ALL 425+ Foods)\n" + "=" * 70)
        
        try:
            images = convert_from_path(self.pdf_path, dpi=dpi)
            print(f"📄 Processing {len(images)} pages at {dpi} DPI...\n")
            
            for idx, image in enumerate(images):
                page_num = idx + 1
                text = pytesseract.image_to_string(image, lang='eng')
                page_foods = self._parse_all_entries(text, page_num)
                
                if page_foods:
                    self.foods.extend(page_foods)
                    print(f"  Page {page_num:2d}: ✓ {len(page_foods):3d} foods")
                else:
                    print(f"  Page {page_num:2d}: (no data)")
            
            print(f"\n✅ Extracted {len(self.foods)} total foods")
            if self.errors:
                print(f"⚠️  {len(self.errors)} parsing errors (ignored)")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error: {e}")
            return []
    
    def _parse_all_entries(self, text: str, page_num: int) -> List[Dict]:
        """Parse ALL food entries from page text - aggressive extraction."""
        foods = []
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines
            if len(line) < 10:
                continue
            
            # Skip header/metadata lines - but be less aggressive
            if any(x in line.lower() for x in ['water', 'protcnt', 'fatce', 'food nam', 'table', 'page']):
                continue
            
            # Match food entry pattern - ANY code with text
            # Patterns: "A001 Name", "001 Name", "C028 Name", etc.
            if re.match(r'^[A-Z]?\d{2,4}[\s\-_]', line):
                food = self._parse_entry(line)
                if food:
                    foods.append(food)
        
        return foods
    
    def _parse_entry(self, line: str) -> Optional[Dict]:
        """Parse single entry - maximize extraction."""
        try:
            # Extract code and name
            code_match = re.match(r'^([A-Z]?\d{2,4})[.\s\-_]+(.+?)(?=\s{2,}|$)', line)
            if not code_match:
                return None
            
            code = code_match.group(1)
            name_raw = code_match.group(2).strip()
            
            # Remove scientific name in parentheses
            name = re.sub(r'\s*\([^)]*\).*$', '', name_raw).strip()
            
            # Validate name
            if not name or len(name) < 2:
                return None
            
            # Clean up OCR artifacts
            name = self._clean_text(name)
            
            # Extract ALL numeric values
            nums = self._extract_numbers(line)
            
            if not nums:
                return None
            
            # Build nutrition record
            nutrition = {
                'name': name,
                'name_hindi': '',
                'category': 'IFCT2017',
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
            
            # Parse nutrition from numbers
            # IFCT format: Water%, Protein, Ash, Fat, Carbs, Fiber_total, Fiber_insoluble, Fiber_soluble, Energy_kJ, Energy_kcal
            # Skip water (0), use rest
            try:
                if len(nums) > 1:
                    val = nums[1]
                    if self._is_reasonable_protein(val):
                        nutrition['protein_g'] = val
                
                if len(nums) > 3:
                    val = nums[3]
                    if self._is_reasonable_fat(val):
                        nutrition['fat_g'] = val
                
                if len(nums) > 4:
                    val = nums[4]
                    if self._is_reasonable_carbs(val):
                        nutrition['carbs_g'] = val
                
                if len(nums) > 5:
                    val = nums[5]
                    if self._is_reasonable_fiber(val):
                        nutrition['fiber_g'] = val
                
                # Calculate calories
                if nutrition['protein_g'] and nutrition['carbs_g'] and nutrition['fat_g']:
                    nutrition['calories'] = round(
                        nutrition['protein_g'] * 4 +
                        nutrition['carbs_g'] * 4 +
                        nutrition['fat_g'] * 9, 1
                    )
                elif len(nums) > 8:
                    # Try to find energy value
                    for val in nums[-3:]:
                        if 10 < val < 900:
                            nutrition['calories'] = val
                            break
                
                # Validate and return
                if nutrition['calories'] and nutrition['protein_g']:
                    return nutrition
                
            except Exception as e:
                self.errors.append(f"Parse error: {str(e)}")
            
            return None
            
        except Exception as e:
            self.errors.append(f"Entry parse error: {str(e)}")
            return None
    
    def _extract_numbers(self, line: str) -> List[float]:
        """Extract all numeric values from line."""
        nums = []
        
        # Split by spaces/tabs and look for numbers
        parts = re.split(r'\s+', line)
        
        for part in parts:
            # Find all numbers in part
            values = re.findall(r'[\d.]+', part)
            for val in values:
                if val and val != '.':
                    try:
                        nums.append(float(val))
                    except:
                        pass
        
        return nums
    
    def _clean_text(self, text: str) -> str:
        """Clean OCR artifacts from text."""
        # Remove common OCR errors
        text = text.replace('—', '-')
        text = text.replace('_', ' ')
        text = re.sub(r'\s+', ' ', text)  # Multiple spaces to single
        text = re.sub(r'[^\w\s\-]', '', text)  # Remove special chars except word chars and dash
        return text.strip()
    
    def _is_reasonable_protein(self, val: float) -> bool:
        return 0 < val <= 100
    
    def _is_reasonable_fat(self, val: float) -> bool:
        return 0 < val <= 100
    
    def _is_reasonable_carbs(self, val: float) -> bool:
        return 0 < val <= 100
    
    def _is_reasonable_fiber(self, val: float) -> bool:
        return 0 < val <= 50
    
    def save_csv(self, path: str) -> bool:
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
    
    def save_json(self, path: str) -> bool:
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


def main():
    # Use the Downloads PDF
    pdf_path = '/Users/apple/Downloads/IFCT2017.pdf'
    
    extractor = FullIFCTExtractor(pdf_path)
    foods = extractor.extract_all(dpi=140)
    
    if foods:
        output_dir = '/Users/apple/Developer/app/fitwell/data/ifct'
        csv_path = f'{output_dir}/ifct_foods_complete.csv'
        json_path = f'{output_dir}/ifct_foods_complete.json'
        
        print(f"\n💾 Saving {len(foods)} foods...")
        
        if extractor.save_csv(csv_path):
            print(f"   ✓ CSV: {csv_path}")
        
        if extractor.save_json(json_path):
            print(f"   ✓ JSON: {json_path}")
        
        # Show samples
        print(f"\n📊 Sample foods:\n")
        for i, food in enumerate(foods[:15], 1):
            print(f"{i:2d}. {food['name']:40s} | "
                  f"{food['calories']:6.1f} kcal | "
                  f"P:{food['protein_g']:5.1f}g C:{food['carbs_g']:5.1f}g F:{food['fat_g']:5.1f}g")
        
        print(f"\n✅ Complete! {len(foods)} foods extracted and ready for import\n")
    else:
        print("❌ No foods extracted")


if __name__ == '__main__':
    main()
