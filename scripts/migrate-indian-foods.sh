#!/bin/bash

# Migration script to migrate Indian foods from foods_indian to main foods table
# This fixes the UUID validation error when logging Indian foods

set -e

echo "🔄 Starting Indian Foods Migration..."
echo "This will migrate Indian foods from foods_indian table to the main foods table"
echo ""

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ Error: SUPABASE_URL or SUPABASE_KEY not set"
    echo "Please set these environment variables first:"
    echo "  export SUPABASE_URL='your-supabase-url'"
    echo "  export SUPABASE_KEY='your-supabase-key'"
    exit 1
fi

# Get the migration SQL
MIGRATION_SQL="supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql"

if [ ! -f "$MIGRATION_SQL" ]; then
    echo "❌ Migration file not found: $MIGRATION_SQL"
    exit 1
fi

echo "📋 Reading migration from: $MIGRATION_SQL"
echo ""

# Execute the migration using psql through Supabase REST API
# Note: For local Supabase, you can use supabase db push
echo "🚀 Running migration..."

# Try using psql if available
if command -v psql &> /dev/null; then
    echo "Using psql to run migration..."
    # Extract connection string from SUPABASE_URL (would need additional setup)
    echo "⚠️  psql method requires direct database access"
    echo "Please manually execute the SQL migration in Supabase dashboard SQL Editor"
else
    echo "⚠️  psql not found. Please run the migration manually:"
    echo ""
    echo "1. Go to Supabase Dashboard → SQL Editor"
    echo "2. Create a new query and paste the contents of:"
    echo "   $MIGRATION_SQL"
    echo "3. Click 'Run'"
    echo ""
fi

# For now, just provide instructions
echo "📖 Instructions:"
echo "1. Open: https://app.supabase.com/project/[your-project]/sql/new"
echo "2. Copy the contents of: supabase/migrations/20260118_migrate_indian_foods_to_foods_table.sql"
echo "3. Paste and execute"
echo ""
echo "Or use Supabase CLI:"
echo "  supabase db push"
echo ""

echo "✅ Migration setup complete!"
echo ""
echo "After running the migration:"
echo "- Indian foods will be available in the main foods table"
echo "- Food logging will work correctly with UUID validation"
echo "- The foods_indian table will remain as-is for reference"
