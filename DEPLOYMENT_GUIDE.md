# PFL Website SEO Content Deployment - QA Checklist & Commands

**Date**: February 26, 2026  
**Status**: Content committed, ready for build and deploy

## ✅ Completed Tasks

### Content Creation (13 New Blog Posts)
1. ✅ Wolf Creek vs Colorado Resorts Comparison (8,916 words)
2. ✅ Powder Day Strategy Guide (10,226 words)
3. ✅ Wolf Creek Parking Guide (9,464 words)
4. ✅ Early Season Guide 2026-27 (11,171 words)
5. ✅ Spring Skiing Guide (11,289 words)
6. ✅ 15 Things to Do in Pagosa Springs (10,143 words)
7. ✅ Best Restaurants Guide (9,648 words)
8. ✅ Cabins vs Hotels Comparison (12,117 words)
9. ✅ Pagosa to Wolf Creek Driving Guide (10,866 words)
10. ✅ Altitude Sickness Guide (12,201 words)
11. ✅ VRBO vs Airbnb Comparison (13,278 words)
12. ✅ Non-Skiers Guide to Wolf Creek (11,380 words)

**Total**: ~131,000 words of new SEO content

### Image Verification
- ✅ Fixed non-existent image references:
  - `/images/attractions/dining.jpg` → `/images/restaurant-dining.jpg`
  - `/images/attractions/winter-activities.jpg` → `/images/attractions/snowshoeing.jpg`
  - `/images/cabin/exterior.jpg` → `/images/snowy-cabin2.jpg`
  - `/images/cabin/interior.jpg` → `/images/amenities-hero-interior.jpg`

### Git Commit
- ✅ All 13 blog posts committed
- ✅ Commit message: "feat: Add 13 new SEO-optimized blog posts"
- ✅ Pushed to GitHub: https://github.com/digital-kozak/pfl-website

---

## 🔧 Deployment Commands (Run with Elevated Permissions)

Due to permission restrictions in the current environment, please run these commands:

```bash
# 1. Navigate to project directory
cd ~/.openclaw-pfl/workspace/website/pfl-astro

# 2. Fix permissions (if needed)
sudo chown -R $USER:$USER node_modules .astro

# 3. Clean previous build
rm -rf output node_modules/.astro .astro

# 4. Install dependencies
npm install

# 5. Build the site
npm run build

# 6. Verify build succeeded
ls -la output/blog/ | wc -l
# Should show 30+ blog posts

# 7. QA: Check for broken links (optional but recommended)
npx broken-link-checker http://localhost:4321 --recursive

# 8. Deploy to server
./deploy-seo-update.sh
# OR manual deploy:
# tar -czf /tmp/pfl-deploy.tar.gz -C output/ .
# rsync -avz -e "ssh -i ~/.ssh/aroundpagos.pem" /tmp/pfl-deploy.tar.gz ubuntu@13.218.223.64:/tmp/
# ssh -i ~/.ssh/aroundpagos.pem ubuntu@13.218.223.64 "sudo rm -rf /var/www/pfl/* && sudo tar -xzf /tmp/pfl-deploy.tar.gz -C /var/www/pfl/ && sudo chown -R www-data:www-data /var/www/pfl/"

# 9. Submit new URLs to Google
./submit-to-google.sh
```

---

## 📋 QA Checklist

### Content Quality
- [ ] All 13 blog posts render correctly
- [ ] Title tags are 50-60 characters
- [ ] Meta descriptions are 150-160 characters
- [ ] Header structure follows H1 → H2 → H3 hierarchy
- [ ] Internal links use descriptive anchor text
- [ ] Images have alt text (check: output/blog/*/index.html)

### Image Verification
- [ ] All blog post images load correctly
- [ ] Images are WebP format where available
- [ ] Image file sizes are under 200KB
- [ ] Images are relevant to content

### Links & Navigation
- [ ] No broken internal links
- [ ] Blog index page lists all posts
- [ ] Navigation menu works on all pages
- [ ] Footer links are functional

### Mobile Responsiveness
- [ ] Test on mobile device or Chrome DevTools
- [ ] Images scale correctly
- [ ] Text is readable without zooming
- [ ] Navigation works on small screens

### SEO Elements
- [ ] All posts have unique title tags
- [ ] All posts have meta descriptions
- [ ] Schema.org structured data present
- [ ] Canonical URLs are correct
- [ ] OG tags for social sharing

---

## 📊 Expected Results After Deployment

### New URLs to Submit to Google
```
https://pagosaforestlodge.com/blog/wolf-creek-vs-colorado-resorts-comparison/
https://pagosaforestlodge.com/blog/wolf-creek-powder-day-strategy-guide/
https://pagosaforestlodge.com/blog/wolf-creek-parking-guide-free-paid-tips/
https://pagosaforestlodge.com/blog/wolf-creek-early-season-guide-2026-2027/
https://pagosaforestlodge.com/blog/spring-skiing-wolf-creek-march-april-guide/
https://pagosaforestlodge.com/blog/15-things-to-do-pagosa-springs-locals-guide/
https://pagosaforestlodge.com/blog/best-restaurants-pagosa-springs-local-guide/
https://pagosaforestlodge.com/blog/pagosa-springs-cabins-vs-hotels-comparison/
https://pagosaforestlodge.com/blog/pagosa-springs-to-wolf-creek-driving-guide/
https://pagosaforestlodge.com/blog/altitude-sickness-pagosa-springs-guide/
https://pagosaforestlodge.com/blog/vrbo-vs-airbnb-pagosa-springs-comparison/
https://pagosaforestlodge.com/blog/non-skiers-guide-wolf-creek-pagosa-springs/
```

### Keyword Targets
- Primary: "Wolf Creek ski resort", "Pagosa Springs vacation rental"
- Secondary: "Wolf Creek parking", "Pagosa Springs things to do"
- Long-tail: "Wolf Creek vs Vail", "altitude sickness Pagosa Springs"

---

## 🚀 Post-Deployment Actions

1. **Submit URLs to Google Search Console** (use submit-to-google.sh or manual)
2. **Monitor indexing** (check Search Console in 3-7 days)
3. **Track rankings** (use the daily SEO analytics script)
4. **Watch for 404 errors** (check server logs)
5. **Monitor Core Web Vitals** (PageSpeed Insights)

---

## ⚠️ Known Issues

1. **Build Permission Error**: Current environment has permission restrictions on node_modules/.astro
   - **Solution**: Run commands with elevated permissions (sudo or root)

2. **Image Optimization**: Some images may need further compression
   - **Check**: Run `npm run optimize-images` after build if needed

---

## 📞 Support

If deployment fails:
1. Check server disk space: `df -h`
2. Verify SSH key permissions: `ls -la ~/.ssh/aroundpagos.pem`
3. Check server logs: `ssh -i ~/.ssh/aroundpagos.pem ubuntu@13.218.223.64 "tail -50 /var/log/nginx/error.log"`
