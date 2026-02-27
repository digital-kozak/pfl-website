#!/bin/bash
# QA Verification Script for PFL SEO Content Update
# Run after deployment to verify all content is working

echo "=========================================="
echo "PFL SEO Content QA Verification"
echo "=========================================="
echo ""

BASE_URL="https://pagosaforestlodge.com"
LOCAL_URL="http://localhost:4321"

# Use local URL if testing locally, production for live site
URL=${1:-$BASE_URL}

echo "Testing URL: $URL"
echo ""

# List of new blog posts to verify
POSTS=(
  "/blog/wolf-creek-vs-colorado-resorts-comparison/"
  "/blog/wolf-creek-powder-day-strategy-guide/"
  "/blog/wolf-creek-parking-guide-free-paid-tips/"
  "/blog/wolf-creek-early-season-guide-2026-2027/"
  "/blog/spring-skiing-wolf-creek-march-april-guide/"
  "/blog/15-things-to-do-pagosa-springs-locals-guide/"
  "/blog/best-restaurants-pagosa-springs-local-guide/"
  "/blog/pagosa-springs-cabins-vs-hotels-comparison/"
  "/blog/pagosa-springs-to-wolf-creek-driving-guide/"
  "/blog/altitude-sickness-pagosa-springs-guide/"
  "/blog/vrbo-vs-airbnb-pagosa-springs-comparison/"
  "/blog/non-skiers-guide-wolf-creek-pagosa-springs/"
)

echo "Checking 12 new blog posts..."
echo ""

PASS=0
FAIL=0

for post in "${POSTS[@]}"; do
  full_url="${URL}${post}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url")
  
  if [ "$status" == "200" ]; then
    echo "✅ $post (200 OK)"
    ((PASS++))
  else
    echo "❌ $post (Status: $status)"
    ((FAIL++))
  fi
done

echo ""
echo "=========================================="
echo "QA Results:"
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "=========================================="

if [ $FAIL -eq 0 ]; then
  echo ""
  echo "🎉 All blog posts are live and accessible!"
  echo ""
  echo "Next steps:"
  echo "  1. Submit URLs to Google Search Console"
  echo "  2. Monitor indexing over next 3-7 days"
  echo "  3. Check daily SEO analytics report"
  exit 0
else
  echo ""
  echo "⚠️  Some posts failed to load. Check:"
  echo "  - Build completed successfully"
  echo "  - Files deployed to server"
  echo "  - Server permissions correct"
  exit 1
fi
