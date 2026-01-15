#!/bin/bash

# Supabase Credentials Setup Helper
# This script helps you update .env.local with your Supabase credentials

PROJECT_DIR="/Users/apple/Developer/app/fitwell"
ENV_FILE="$PROJECT_DIR/.env.local"

echo "================================"
echo "Supabase Credentials Setup"
echo "================================"
echo ""
echo "This script will help you update your Supabase credentials in .env.local"
echo ""

# Check if .env.local exists
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: .env.local not found at $ENV_FILE"
    exit 1
fi

echo "📋 Current .env.local contents:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📝 Instructions:"
echo "  1. Go to https://supabase.com/dashboard"
echo "  2. Select your project"
echo "  3. Go to Settings → API"
echo "  4. Copy 'Project URL' and 'Anon public' key"
echo ""

read -p "Do you want to update your credentials now? (y/n) " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping credential update. You can update .env.local manually."
    exit 0
fi

echo ""
read -p "Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ Error: Project URL is required"
    exit 1
fi

if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo "⚠️  Warning: URL might be incorrect. Expected format: https://xxxxx.supabase.co"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
read -p "Enter your Supabase Anon Key (starts with eyJh...): " SUPABASE_ANON_KEY

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Anon Key is required"
    exit 1
fi

# Create backup
echo ""
echo "💾 Creating backup..."
cp "$ENV_FILE" "${ENV_FILE}.backup"
echo "✓ Backup created at ${ENV_FILE}.backup"

# Update .env.local
cat > "$ENV_FILE" << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
EXPO_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}

# Google OAuth (Optional - Configure when ready)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=

EOF

echo ""
echo "✅ Credentials updated successfully!"
echo ""
echo "📋 Updated .env.local contents:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$ENV_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔒 Security Check:"
if grep -q "demo_key" "$ENV_FILE" || grep -q "demo.supabase" "$ENV_FILE"; then
    echo "❌ Still has demo values"
else
    echo "✓ No demo values found (safe)"
fi

if grep -q "\.env\.local" "$PROJECT_DIR/.gitignore"; then
    echo "✓ .env.local is in .gitignore (won't be committed)"
else
    echo "⚠️  Warning: .env.local might not be in .gitignore"
fi

echo ""
echo "📚 Next steps:"
echo "  1. Load database schema in Supabase"
echo "  2. Run: npm start"
echo "  3. Test signup/login in the app"
echo "  4. Check data appears in Supabase dashboard"
echo ""
echo "💡 For detailed instructions, see:"
echo "  - SUPABASE_QUICK_START.md"
echo "  - SUPABASE_SETUP_AUTOMATION.md"
