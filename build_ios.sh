#!/bin/bash
# Auto build iOS with Expo EAS
# Requires: EXPO_TOKEN environment variable

set -e

echo "📱 BrightBits iOS Build Script"

# Check Expo token
if [ -z "$EXPO_TOKEN" ]; then
    echo "❌ Error: EXPO_TOKEN is required"
    echo "Get token from: https://expo.dev/settings/access-tokens"
    exit 1
fi

# Login to Expo
echo "🔐 Logging in to Expo..."
npx expo login --token $EXPO_TOKEN

# Build iOS
echo "🚀 Building iOS..."
npx eas-cli build --platform ios --profile production --non-interactive

echo "✅ Build complete! Check https://expo.dev/accounts/trannhatquang90-tech/builds"