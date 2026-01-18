#!/usr/bin/env python3
"""
Extract Indian food data from IFCT 2017 PDF using OCR.
IFCT = Indian Food Composition Tables
"""

import cv2
import pytesseract
from pdf2image import convert_from_path
import json
import csv
import re
from pathlib import Path
from typing import List, Dict, Optional
import sys

class IFCTOCRExtractor:
    """Extract food composition data from IFCT 2017 scanned PDF using OCR."""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.foods: List[Dict] = []
        self.current_page = 0
        self.total_pages = 0
        
    def extract_all_foods(self) -> List[Dict]:
        """Convert PDF to images and extract text via OCR."""
        print(f"📄 Converting PDF to images...")
        
        try:
            # Convert PDF pages to images
            images = convert_from_path(self.pdf_path, dpi=150)
            self.total_pages = len(images)
            print(f"✓ Converted {self.total_pages} pages to images")
            
            # Process each page
            for idx, image in enumerate(images):
                self.current_page = idx + 1
                print(f"\n📖 Processing page {self.current_page}/{self.total_pages}...")
                self._process_page(image)
                
            print(f"\n✅ Extraction complete! Found {len(self.foods)} foods")
            return self.foods
            
        except Exception as e:
            print(f"❌ Error during PDF processing: {e}", file=sys.stderr)
            return []
    
    def _process_page(self, image):
        """Process a single page image with OCR."""
        try:
            # Enhance image for better OCR
            enhanced = self._enhance_image(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(enhanced, lang='eng')
            
            if not text.strip():
                print(f"  ⚠️  No text detected on page {self.current_page}")
                return
            
            print(f"  📝 Extracted {len(text)} characters from page")
            
            # Parse text into structured food data
            foods_on_page = self._parse_page_text(text)
            if foods_on_page:
                self.foods.extend(foods_on_page)
                print(f"  ✓ Found {len(foods_on_page)} foods on this page")
                
        except Exception as e:
            print(f"  ❌ Error processing page: {e}", file=sys.stderr)
    
    def _enhance_image(self, image):
        """Enhance image for better OCR accuracy."""
        # Convert PIL to OpenCV format
        import numpy as np
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # Apply preprocessing
        gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
        
        # Apply morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        return cleaned
    
    def _parse_page_text(self, text: str) -> List[Dict]:
        """Parse OCR text into structured food entries."""
        foods = []
        lines = text.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines and headers
            if not line or any(x in line.lower() for x in ['page', 'serial', 'table', 'code']):
                i += 1
                continue
            
            # Try to parse as food entry
            food = self._parse_food_entry(line, lines, i)
            if food:
                foods.append(food)
                i += 1
            else:
                i += 1
        
        return foods
    
    def _parse_food_entry(self, line: str, all_lines: List[str], line_idx: int) -> Optional[Dict]:
        """Parse a single line as food entry with nutrition data."""
        
        # Skip if line is too short or only contains numbers
        if len(line) < 5 or line.replace(' ', '').replace('.', '').isdigit():
            return None
        
        # Try to extract food name and nutrition values
        # IFCT format typically: Name | Serving | Calories | Protein | Carbs | Fat | Fiber ...
        
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 3:
            return None
        
        try:
            food_name = parts[0].strip()
            
            # Validate food name
            if not food_name or len(food_name) < 3 or any(x in food_name.lower() for x in ['code', 'serial', 'page']):
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
            
            # Extract numeric values from remaining parts
            numeric_parts = []
            for part in parts[1:]:
                # Try to find numeric values
                nums = re.findall(r'[\d.]+', part)
                numeric_parts.extend(nums)
            
            # Assign nutrition values if we have them
            if len(numeric_parts) > 0:
                nutrition['calories'] = self._to_float(numeric_parts[0])
            if len(numeric_parts) > 1:
                nutrition['protein_g'] = self._to_float(numeric_parts[1])
            if len(numeric_parts) > 2:
                nutrition['carbs_g'] = self._to_float(numeric_parts[2])
            if len(numeric_parts) > 3:
                nutrition['fat_g'] = self._to_float(numeric_parts[3])
            if len(numeric_parts) > 4:
                nutrition['fiber_g'] = self._to_float(numeric_parts[4])
            
            # Only return if we have at least calories and protein
            if nutrition['calories'] is not None and nutrition['protein_g'] is not None:
                return nutrition
            
            return None
            
        except Exception as e:
            return None
    
    def _to_float(self, value: str) -> Optional[float]:
        """Convert string to float safely."""
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def save_to_csv(self, output_path: str):
        """Save extracted foods to CSV."""
        if not self.foods:
            print("❌ No foods to save")
            return
        
        try:
            fieldnames = [
                'name', 'name_hindi', 'category', 'serving_size_g',
                'calories', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g',
                'sodium_mg', 'potassium_mg', 'source'
            ]
            
            with open(output_path, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(self.foods)
            
            print(f"✅ Saved {len(self.foods)} foods to {output_path}")
            
        except Exception as e:
            print(f"❌ Error saving CSV: {e}", file=sys.stderr)
    
    def save_to_json(self, output_path: str):
        """Save extracted foods to JSON."""
        if not self.foods:
            print("❌ No foods to save")
            return
        
        try:
            with open(output_path, 'w') as f:
                json.dump(self.foods, f, indent=2)
            
            print(f"✅ Saved {len(self.foods)} foods to {output_path}")
            
        except Exception as e:
            print(f"❌ Error saving JSON: {e}", file=sys.stderr)


def main():
    """Main extraction workflow."""
    pdf_path = '/Users/apple/Developer/app/fitwell/IFCT2017.pdf'
    
    print("🌾 IFCT 2017 OCR Extraction\n")
    print("=" * 50)
    
    extractor = IFCTOCRExtractor(pdf_path)
    foods = extractor.extract_all_foods()
    
    if foods:
        # Save outputs
        csv_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_extracted.csv'
        json_path = '/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods_extracted.json'
        
        Path(csv_path).parent.mkdir(parents=True, exist_ok=True)
        
        extractor.save_to_csv(csv_path)
        extractor.save_to_json(json_path)
        
        print("\n" + "=" * 50)
        print(f"📊 Summary:")
        print(f"  • Total foods extracted: {len(foods)}")
        print(f"  • CSV saved to: {csv_path}")
        print(f"  • JSON saved to: {json_path}")
    else:
        print("\n⚠️  No foods extracted. PDF may need manual OCR tuning.")


if __name__ == '__main__':
    main()
