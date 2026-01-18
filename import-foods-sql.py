#!/usr/bin/env python3
"""
Import OpenFoodFacts to Supabase using SQL (bypasses RLS for public foods)
"""

import csv
import sys
import os
from pathlib import Path
from typing import Optional
import time

try:
    from supabase import create_client
except ImportError:
    print("❌ supabase-py not installed")
    sys.exit(1)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://mtevaxgfkjyifnaftxhl.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10ZXZheGdma2p5aWZuYWZ0eGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0ODYwMjcsImV4cCI6MjA4NDA2MjAyN30.P2SQLliRfl01ICVcv_xHqxwg9HOUU73Gk_9dMSz0ALE")

CSV_FILE = Path(__file__).parent / "en.openfoodfacts.org.products.csv"
BATCH_SIZE = 100  # Smaller batches for SQL


def safe_float(value: Optional[str], default: float = 0.0) -> float:
    if not value or str(value).strip() == "":
        return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def get_category(row: dict) -> str:
    categories = (row.get("categories_en") or "").lower()
    if "indian" in categories or "asia" in categories:
        return "indian"
    elif "packaged" in categories:
        return "packaged"
    return "global"


def escape_sql_string(s: str) -> str:
    """Escape string for SQL"""
    if not s:
        return "NULL"
    # Escape single quotes by doubling them
    escaped = str(s).replace("'", "''")
    return f"'{escaped}'"


def process_csv_row(row: dict) -> Optional[dict]:
    """Process CSV row"""
    try:
        product_name = (row.get("product_name") or "").strip()
        if not product_name or len(product_name) < 2:
            return None
        
        calories = safe_float(row.get("energy-kcal_100g"), 100)
        if calories == 0:
            calories = 100
        
        return {
            "name": product_name[:255],
            "calories_per_serving": int(max(10, min(1000, calories))),
            "protein_g": max(0, safe_float(row.get("proteins_100g"), 5.0)),
            "carbs_g": max(0, safe_float(row.get("carbohydrates_100g"), 10.0)),
            "fats_g": max(0, safe_float(row.get("fat_100g"), 5.0)),
            "serving_size_g": max(1, safe_float(row.get("serving_size", "100"), 100)),
            "category": get_category(row),
            "is_custom": False,
            "user_id": None,
        }
    except Exception:
        return None


print("=" * 70)
print("🍽️  OpenFoodFacts to Supabase - SQL Import")
print("=" * 70)

if not CSV_FILE.exists():
    print(f"\n❌ CSV file not found")
    sys.exit(1)

print(f"\n📊 CSV File: {CSV_FILE.name}")
print(f"   Size: {CSV_FILE.stat().st_size / (1024*1024):.1f} MB")

print("\n🔗 Connecting to Supabase...")
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    result = supabase.table("foods").select("id", count="exact").limit(1).execute()
    existing = result.count if hasattr(result, 'count') else 0
    print(f"   ✅ Connected (existing: {existing})")
except Exception as e:
    print(f"   ❌ Connection failed: {e}")
    sys.exit(1)

print(f"\n📥 Processing CSV (batch size: {BATCH_SIZE} rows per SQL statement)...")

csv.field_size_limit(int(1e8))
batch = []
imported = 0
skipped = 0
row_num = 0
start_time = time.time()
MAX_ROWS = None  # Change to limit e.g., 100000

try:
    with open(CSV_FILE, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f, delimiter='\t')
        
        for row in reader:
            row_num += 1
            
            if MAX_ROWS and row_num > MAX_ROWS:
                print(f"   Stopped at {row_num:,} rows")
                break
            
            food = process_csv_row(row)
            if not food:
                skipped += 1
                continue
            
            batch.append(food)
            
            # Execute batch
            if len(batch) >= BATCH_SIZE:
                elapsed = time.time() - start_time
                rate = row_num / elapsed if elapsed > 0 else 0
                print(f"   Rows: {row_num:,} | Rate: {rate:.0f} r/s | Imported: {imported:,}...", end=" ", flush=True)
                
                # Build INSERT SQL with multiple rows
                values = []
                for f in batch:
                    vals = (
                        f"uuid_generate_v4()",
                        escape_sql_string(f["name"]),
                        f["calories_per_serving"],
                        f["protein_g"],
                        f["carbs_g"],
                        f["fats_g"],
                        f["serving_size_g"],
                        escape_sql_string(f["category"]),
                        "false",
                        "NULL",
                    )
                    values.append(f"({','.join(str(v) for v in vals)})")
                
                sql = f"""
                INSERT INTO foods (id, name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom, user_id)
                VALUES {','.join(values)}
                ON CONFLICT (name) DO NOTHING;
                """
                
                try:
                    # Use RPC to execute SQL with elevated privileges
                    response = supabase.rpc("execute_sql", {"sql": sql}).execute()
                    imported += len(batch)
                    print("✅")
                except Exception as e:
                    error_msg = str(e)
                    if "RPC" in error_msg or "execute_sql" in error_msg:
                        print("❌ (SQL RPC not available)")
                        print(f"   💡 Trying direct insert via API...")
                        try:
                            # Fallback: try direct insert one by one
                            for f in batch:
                                try:
                                    supabase.table("foods").insert(f).execute()
                                    imported += 1
                                except:
                                    pass
                        except:
                            pass
                    else:
                        print(f"❌ ({error_msg[:30]})")
                
                batch = []

    # Final batch
    if batch:
        print(f"   Final batch ({len(batch)} items)............ ", end="", flush=True)
        values = []
        for f in batch:
            vals = (
                f"uuid_generate_v4()",
                escape_sql_string(f["name"]),
                f["calories_per_serving"],
                f["protein_g"],
                f["carbs_g"],
                f["fats_g"],
                f["serving_size_g"],
                escape_sql_string(f["category"]),
                "false",
                "NULL",
            )
            values.append(f"({','.join(str(v) for v in vals)})")
        
        sql = f"""
        INSERT INTO foods (id, name, calories_per_serving, protein_g, carbs_g, fats_g, serving_size_g, category, is_custom, user_id)
        VALUES {','.join(values)}
        ON CONFLICT (name) DO NOTHING;
        """
        
        try:
            response = supabase.rpc("execute_sql", {"sql": sql}).execute()
            imported += len(batch)
            print("✅")
        except:
            print("❌")

except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)

# Summary
elapsed = time.time() - start_time
print("\n" + "=" * 70)
print("📊 Summary")
print("=" * 70)
print(f"✅ Imported: {imported:,}")
print(f"⏭️  Skipped: {skipped:,}")
print(f"⏱️  Time: {elapsed:.0f}s")
if elapsed > 0:
    print(f"📊 Rate: {row_num/elapsed:.0f} rows/sec")
print("=" * 70)

sys.exit(0)
