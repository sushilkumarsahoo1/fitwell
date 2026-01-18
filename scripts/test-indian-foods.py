#!/usr/bin/env python3
"""
Test script to verify Indian food database integration.
Tests both extraction and database import flows.
"""

import sys
import json
import os
from pathlib import Path

def test_pdf_extraction():
    """Test IFCT PDF extraction"""
    print("\n" + "="*60)
    print("TEST 1: PDF Extraction")
    print("="*60)
    
    try:
        import pdfplumber
        print("✓ pdfplumber installed")
    except ImportError:
        print("✗ pdfplumber not installed. Run: pip install pdfplumber pandas")
        return False
    
    pdf_path = '/Users/apple/Downloads/IFCT2017.pdf'
    if not Path(pdf_path).exists():
        print(f"✗ PDF not found at {pdf_path}")
        return False
    print(f"✓ PDF found at {pdf_path}")
    
    # Try extracting first page
    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"✓ PDF opened successfully ({len(pdf.pages)} pages)")
            
            # Check first few pages for tables
            found_tables = False
            for i, page in enumerate(pdf.pages[:3]):
                tables = page.extract_tables()
                if tables:
                    found_tables = True
                    print(f"✓ Found {len(tables)} table(s) on page {i+1}")
                    if tables[0]:
                        print(f"  - First table has {len(tables[0])} rows")
            
            if not found_tables:
                print("⚠ No tables found in first 3 pages. PDF may be image-based.")
                return False
    
    except Exception as e:
        print(f"✗ Error reading PDF: {e}")
        return False
    
    print("✓ PDF extraction test passed!")
    return True


def test_extracted_data():
    """Test that extracted data files exist and are valid"""
    print("\n" + "="*60)
    print("TEST 2: Extracted Data Files")
    print("="*60)
    
    output_dir = Path('/Users/apple/Developer/app/fitwell/data/ifct')
    
    # Check JSON file
    json_file = output_dir / 'ifct_foods.json'
    if json_file.exists():
        try:
            with open(json_file) as f:
                foods = json.load(f)
            print(f"✓ JSON file found: {len(foods)} foods extracted")
            
            if foods:
                sample = foods[0]
                print(f"  Sample food: {sample.get('name')}")
                print(f"  - Calories: {sample.get('calories')}")
                print(f"  - Protein: {sample.get('protein_g')}g")
        except Exception as e:
            print(f"✗ Error reading JSON: {e}")
            return False
    else:
        print(f"⚠ JSON file not found at {json_file}")
        print("  Run: python scripts/extract-ifct-data.py")
        return False
    
    # Check CSV file
    csv_file = output_dir / 'ifct_foods.csv'
    if csv_file.exists():
        try:
            import csv
            with open(csv_file) as f:
                reader = csv.DictReader(f)
                rows = list(reader)
            print(f"✓ CSV file found: {len(rows)} foods")
        except Exception as e:
            print(f"✗ Error reading CSV: {e}")
            return False
    else:
        print(f"⚠ CSV file not found at {csv_file}")
        return False
    
    print("✓ Extracted data test passed!")
    return True


def test_supabase_connection():
    """Test Supabase connection"""
    print("\n" + "="*60)
    print("TEST 3: Supabase Connection")
    print("="*60)
    
    # Check environment variables
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url:
        print("✗ SUPABASE_URL not set in environment")
        print("  Set with: export SUPABASE_URL='https://...'")
        return False
    print(f"✓ SUPABASE_URL set: {supabase_url[:30]}...")
    
    if not supabase_key:
        print("✗ SUPABASE_ANON_KEY not set in environment")
        print("  Set with: export SUPABASE_ANON_KEY='...'")
        return False
    print(f"✓ SUPABASE_ANON_KEY set")
    
    # Try connecting
    try:
        from supabase import create_client
        client = create_client(supabase_url, supabase_key)
        print("✓ Supabase client created")
        
        # Check if table exists
        response = client.table('foods_indian').select('id').limit(1).execute()
        print(f"✓ foods_indian table accessible")
        
        if response.data:
            print(f"✓ Table contains {len(response.data)} sample record(s)")
        else:
            print("⚠ Table exists but is empty (normal before import)")
    
    except ImportError:
        print("✗ supabase module not installed")
        print("  Install with: pip install supabase")
        return False
    except Exception as e:
        print(f"✗ Error connecting to Supabase: {e}")
        return False
    
    print("✓ Supabase connection test passed!")
    return True


def test_import_readiness():
    """Test if system is ready for import"""
    print("\n" + "="*60)
    print("TEST 4: Import Readiness")
    print("="*60)
    
    # Check CSV format
    csv_file = Path('/Users/apple/Developer/app/fitwell/data/ifct/ifct_foods.csv')
    
    if not csv_file.exists():
        print("✗ CSV file not found. Run extraction first.")
        return False
    
    try:
        import csv
        with open(csv_file) as f:
            reader = csv.DictReader(f)
            sample_rows = [next(reader) for _ in range(min(3, 3))]
        
        # Check required columns
        headers = sample_rows[0].keys()
        required = ['name', 'calories', 'protein_g', 'carbs_g', 'fat_g']
        
        for col in required:
            if col in headers:
                print(f"✓ Column '{col}' present")
            else:
                print(f"✗ Column '{col}' missing")
                return False
        
        print(f"✓ CSV has all required columns")
        print(f"\nSample row:")
        for row in sample_rows[:1]:
            for k, v in list(row.items())[:5]:
                print(f"  {k}: {v}")
    
    except Exception as e:
        print(f"✗ Error checking CSV: {e}")
        return False
    
    print("✓ Import readiness test passed!")
    return True


def test_app_integration():
    """Test that app files have been updated"""
    print("\n" + "="*60)
    print("TEST 5: App Integration")
    print("="*60)
    
    # Check foodService.ts
    service_file = Path('/Users/apple/Developer/app/fitwell/src/services/foodService.ts')
    if service_file.exists():
        content = service_file.read_text()
        if 'searchIndianFoods' in content:
            print("✓ foodService.ts has searchIndianFoods function")
        else:
            print("✗ searchIndianFoods not found in foodService.ts")
            return False
        
        if 'logIndianFood' in content:
            print("✓ foodService.ts has logIndianFood function")
        else:
            print("✗ logIndianFood not found in foodService.ts")
            return False
    else:
        print("✗ foodService.ts not found")
        return False
    
    # Check FoodLoggingScreen.tsx
    screen_file = Path('/Users/apple/Developer/app/fitwell/src/screens/app/FoodLoggingScreen.tsx')
    if screen_file.exists():
        content = screen_file.read_text()
        if 'foodSource' in content and 'Indian Foods' in content:
            print("✓ FoodLoggingScreen.tsx has food source toggle")
        else:
            print("✗ Food source toggle not found in FoodLoggingScreen.tsx")
            return False
    else:
        print("✗ FoodLoggingScreen.tsx not found")
        return False
    
    print("✓ App integration test passed!")
    return True


def main():
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "INDIAN FOOD DATABASE TEST SUITE" + " "*12 + "║")
    print("╚" + "="*58 + "╝")
    
    tests = [
        ("PDF Extraction", test_pdf_extraction),
        ("Extracted Data", test_extracted_data),
        ("Supabase Connection", test_supabase_connection),
        ("Import Readiness", test_import_readiness),
        ("App Integration", test_app_integration),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print(f"\n✗ EXCEPTION in {name}: {e}")
            results.append((name, False))
    
    # Print summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status:8} - {name}")
    
    print("="*60)
    print(f"Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All tests passed! Ready to import data.")
        print("\nNext steps:")
        print("1. Extract data: python scripts/extract-ifct-data.py")
        print("2. Import data: python scripts/import-ifct-data.py data/ifct/ifct_foods.csv")
        print("3. Test in app: Open FoodLoggingScreen and toggle to Indian Foods")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please fix issues above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
