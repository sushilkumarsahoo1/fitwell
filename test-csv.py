#!/usr/bin/env python3
"""Quick test of import"""
import csv
from pathlib import Path

CSV_FILE = Path("en.openfoodfacts.org.products.csv")
csv.field_size_limit(int(1e8))

print("Finding valid products...")
found = 0

with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    for i, row in enumerate(reader):
        name = (row.get("product_name") or "").strip()
        if name and len(name) > 2:
            found += 1
            print(f"{found}. {name}")
            if found >= 10:
                break

print(f"\n✅ Found {found} valid products!")
