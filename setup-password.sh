#!/bin/bash
# Quick setup script for HR Connect Dashboard Password Protection

echo "🔒 Setting up HR Connect Dashboard Password Protection..."
echo ""

# Check if config directory exists
if [ ! -d "config" ]; then
    echo "❌ Config directory not found. Please run this script from the project root."
    exit 1
fi

# Check if auth config exists
if [ ! -f "config/auth.ts" ]; then
    echo "❌ Authentication config file not found."
    exit 1
fi

echo "✅ Password protection is already set up!"
echo ""
echo "📝 Configuration:"
echo "   - Password: Check config/auth.ts file"
echo "   - Session: 24 hours (configurable)"
echo "   - Storage: Browser localStorage"
echo ""
echo "🔧 To customize:"
echo "   1. Edit config/auth.ts to change password"
echo "   2. Run: npm run build"
echo "   3. Deploy updated files"
echo ""
echo "📖 For detailed instructions, see PASSWORD_SETUP.md"
echo ""
echo "🚀 Ready to use! Users will now see a login screen."