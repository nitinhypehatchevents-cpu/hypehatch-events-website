#!/bin/bash

# Smoke test script for Hypehatch Events website
# Usage: ./scripts/smoke-test.sh https://your-domain.com

set -e

BASE_URL="${1:-http://localhost:3000}"

echo "🧪 Running smoke tests for: $BASE_URL"
echo ""

# Test 1: Homepage
echo "1. Testing homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$STATUS" -eq 200 ]; then
  echo "   ✅ Homepage: 200 OK"
else
  echo "   ❌ Homepage: $STATUS (expected 200)"
  exit 1
fi

# Test 2: Health check
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/api/health")
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
  echo "   ✅ Health check: OK"
else
  echo "   ❌ Health check: Invalid response"
  echo "   Response: $HEALTH_RESPONSE"
  exit 1
fi

# Test 3: Robots.txt
echo "3. Testing robots.txt..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
if [ "$ROBOTS_STATUS" -eq 200 ]; then
  echo "   ✅ Robots.txt: 200 OK"
else
  echo "   ❌ Robots.txt: $ROBOTS_STATUS (expected 200)"
  exit 1
fi

# Test 4: Sitemap
echo "4. Testing sitemap.xml..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
if [ "$SITEMAP_STATUS" -eq 200 ]; then
  echo "   ✅ Sitemap.xml: 200 OK"
else
  echo "   ❌ Sitemap.xml: $SITEMAP_STATUS (expected 200)"
  exit 1
fi

# Test 5: Gallery API (should work without auth)
echo "5. Testing gallery API..."
GALLERY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/gallery")
if [ "$GALLERY_STATUS" -eq 200 ]; then
  echo "   ✅ Gallery API: 200 OK"
else
  echo "   ⚠️  Gallery API: $GALLERY_STATUS (may require database)"
fi

echo ""
echo "✅ All smoke tests passed!"
echo ""


