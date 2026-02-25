# PFL SEO Update QA Checklist

## Deployment Date: 2026-02-25

---

## Pre-Deployment Verification

- [ ] All files created:
  - [ ] `src/content/blog/pagosa-springs-tours-excursions-guide-2026.md`
  - [ ] `src/content/blog/ice-skating-pagosa-springs-guide-2026.md`
  - [ ] `src/pages/things-to-do.astro` (modified)

- [ ] Content quality verified:
  - [ ] Tours guide is ~4,200 words
  - [ ] Ice skating guide is ~2,800 words
  - [ ] Things To Do has new FAQ schema

---

## Post-Deployment Verification

### 1. Things To Do Page
URL: `https://pagosaforestlodge.com/things-to-do`

- [ ] Page loads successfully (200 status)
- [ ] Title tag: "Things to Do in Pagosa Springs 2026 | Tours & Excursions Guide"
- [ ] Meta description contains "tours & excursions"
- [ ] New FAQ schema present (check with Google's Rich Results Test)
- [ ] Mobile responsive
- [ ] All images load
- [ ] Internal links work

### 2. Tours & Excursions Blog Post
URL: `https://pagosaforestlodge.com/blog/pagosa-springs-tours-excursions-guide-2026`

- [ ] Page loads successfully (200 status)
- [ ] Title: "Complete Guide to Pagosa Springs Tours & Excursions 2026"
- [ ] Description: "Discover the best Pagosa Springs tours & excursions for 2026..."
- [ ] Hero image displays
- [ ] Article schema present
- [ ] All internal links work
- [ ] CTA buttons link correctly
- [ ] Mobile responsive
- [ ] Estimated read time displayed
- [ ] Related posts section visible

### 3. Ice Skating Blog Post
URL: `https://pagosaforestlodge.com/blog/ice-skating-pagosa-springs-guide-2026`

- [ ] Page loads successfully (200 status)
- [ ] Title: "Ice Skating in Pagosa Springs: Best Spots & Season Guide 2026"
- [ ] Description: "Discover the best ice skating spots in Pagosa Springs for 2026..."
- [ ] Hero image displays
- [ ] Article schema present
- [ ] Ice thickness table renders correctly
- [ ] All internal links work
- [ ] Mobile responsive

### 4. Blog Index Page
URL: `https://pagosaforestlodge.com/blog`

- [ ] New posts appear in blog listing
- [ ] Post excerpts display correctly
- [ ] Featured images load
- [ ] Dates show correctly (Feb 25, 2026)

### 5. Cross-Cutting Checks

- [ ] No console errors on any new pages
- [ ] All images have alt text
- [ ] Page load speed acceptable (< 3s)
- [ ] No broken links
- [ ] Google Analytics tracking works
- [ ] Search Console can crawl new pages

---

## SEO Verification

### Search Console
- [ ] Submit sitemap for re-crawling
- [ ] Request indexing for new URLs
- [ ] Check for mobile usability issues

### Meta Tags
Test these URLs in:
- [ ] Facebook Sharing Debugger
- [ ] Twitter Card Validator
- [ ] LinkedIn Post Inspector

### Schema Markup
Test with:
- [ ] Google's Rich Results Test
- [ ] Schema.org Validator

Expected schema types:
- [ ] Article schema on blog posts
- [ ] FAQ schema on Things To Do page
- [ ] BreadcrumbList on all pages

---

## Playwright Test Results

```
npm run test:playwright
```

- [ ] All tests pass
- [ ] No critical failures
- [ ] Screenshots captured (if configured)

---

## Content Accuracy Check

### Tours Guide
- [ ] Pricing information current
- [ ] Phone numbers correct
- [ ] Season dates accurate for 2026
- [ ] Links to external sites work

### Ice Skating Guide
- [ ] Parks & Rec phone number: (970) 264-4152
- [ ] Season timeline accurate
- [ ] Safety information correct
- [ ] Rental location info current

---

## Performance Metrics

Run Lighthouse audits on:
- [ ] Things To Do page
- [ ] Tours blog post
- [ ] Ice Skating blog post

Target scores:
- [ ] Performance: 90+
- [ ] Accessibility: 100
- [ ] Best Practices: 100
- [ ] SEO: 100

---

## Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Developer | | | |
| QA Tester | | | |
| SEO Review | | | |
| Client Approval | | | |

---

## Post-Deployment Monitoring

Set calendar reminders for:

**Week 1:**
- [ ] Check Search Console for indexing status
- [ ] Monitor for 404 errors
- [ ] Verify analytics tracking

**Week 2-4:**
- [ ] Check ranking improvements
- [ ] Monitor organic traffic changes
- [ ] Review Search Console performance report

**Month 2:**
- [ ] Full SEO performance review
- [ ] Compare to baseline metrics
- [ ] Plan next content batch

---

## Rollback Plan

If critical issues found:

```bash
cd ~/.openclaw-pfl/workspace/website/pfl-astro
git revert HEAD --no-edit
npm run build
# Re-deploy using standard deployment process
```

---

## Notes

*Document any issues found and resolutions here:*

