#!/bin/bash
# PFL SEO Deployment Script - Run this to deploy all changes
# Created: 2026-02-25

set -e

echo "🚀 Starting PFL SEO Deployment..."
echo ""

# Navigate to project
cd ~/.openclaw-pfl/workspace/website/pfl-astro

echo "📁 Fixing permissions..."
sudo chown -R $USER:$USER .

echo "🏗️  Building site..."
npm run build

echo ""
echo "✅ Build complete! Verifying new content..."

# Check if new blog posts exist
if [ -f "output/blog/pagosa-springs-tours-excursions-guide-2026/index.html" ]; then
    echo "✓ Tours & Excursions blog post built successfully"
else
    echo "✗ Tours & Excursions blog post NOT found"
    exit 1
fi

if [ -f "output/blog/ice-skating-pagosa-springs-guide-2026/index.html" ]; then
    echo "✓ Ice Skating blog post built successfully"
else
    echo "✗ Ice Skating blog post NOT found"
    exit 1
fi

# Check Things To Do page title
if grep -q "Things to Do in Pagosa Springs 2026" output/things-to-do/index.html; then
    echo "✓ Things To Do page title updated"
else
    echo "✗ Things To Do page title NOT updated"
    exit 1
fi

echo ""
echo "📝 Committing changes to Git..."
git add src/content/blog/pagosa-springs-tours-excursions-guide-2026.md \
        src/content/blog/ice-skating-pagosa-springs-guide-2026.md \
        src/pages/things-to-do.astro
git commit -m "SEO: Add tours & excursions content + optimize Things To Do page

- Updated Things To Do page title and meta for tours keyword
- Added comprehensive FAQ schema for tours and excursions
- Created new blog post: Complete Guide to Pagosa Springs Tours & Excursions 2026
- Created new blog post: Ice Skating in Pagosa Springs Guide 2026
- Targets high-value keywords from Search Console data
- Expands content depth for organic SEO growth"
git push

echo ""
echo "🌐 Deploying to production server..."
tar -czf /tmp/pfl-deploy.tar.gz -C output/ .
rsync -avz -e "ssh -i ~/.ssh/aroundpagos.pem" /tmp/pfl-deploy.tar.gz ubuntu@13.218.223.64:/tmp/
ssh -i ~/.ssh/aroundpagos.pem ubuntu@13.218.223.64 "sudo rm -rf /var/www/pfl/* && sudo tar -xzf /tmp/pfl-deploy.tar.gz -C /var/www/pfl/ && sudo chown -R www-data:www-data /var/www/pfl/"

echo ""
echo "🧪 Running Playwright QA tests..."
npm run test:playwright 2>&1 | tee /tmp/playwright-results.txt

# Check for test failures
if grep -q "failed" /tmp/playwright-results.txt; then
    echo ""
    echo "⚠️  Some QA tests failed. Please review the output above."
    exit 1
else
    echo ""
    echo "✅ All QA tests passed!"
fi

echo ""
echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================"
echo ""
echo "New content deployed:"
echo "  • /things-to-do - Updated with tours focus"
echo "  • /blog/pagosa-springs-tours-excursions-guide-2026"
echo "  • /blog/ice-skating-pagosa-springs-guide-2026"
echo ""
echo "Next steps:"
echo "  1. Visit https://pagosaforestlodge.com/things-to-do"
echo "  2. Check new blog posts are live"
echo "  3. Submit sitemap to Google Search Console"
echo "  4. Monitor rankings in 2-4 weeks"
echo ""
