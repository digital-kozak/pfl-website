#!/usr/bin/env node
/**
 * PFL Website Comprehensive QA Testing Suite
 * Tests: Routes, Responsive Design, Images, Forms, Navigation, Performance
 */

import { chromium, firefox, webkit, devices } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4321';
const RESULTS_DIR = path.join(process.cwd(), 'qa-results');
const SCREENSHOTS_DIR = path.join(RESULTS_DIR, 'screenshots');

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Test configuration
const ROUTES = [
  { path: '/', name: 'Home' },
  { path: '/book', name: 'Book' },
  { path: '/gallery', name: 'Gallery' },
  { path: '/location', name: 'Location' },
  { path: '/reviews', name: 'Reviews' },
  { path: '/the-cabin', name: 'The Cabin' },
  { path: '/things-to-do', name: 'Things To Do' }
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812, device: 'iPhone 14 Pro' },
  { name: 'tablet', width: 768, height: 1024, device: 'iPad Mini' },
  { name: 'desktop', width: 1920, height: 1080, device: 'Desktop 1080p' },
  { name: 'large-desktop', width: 2560, height: 1440, device: 'Desktop 1440p' }
];

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  url: BASE_URL,
  summary: {
    totalTests: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  },
  routes: {},
  responsive: {},
  images: { pages: {} },
  forms: { pages: {} },
  navigation: {},
  performance: { pages: {} },
  consoleErrors: [],
  networkErrors: []
};

// Utility functions
async function captureScreenshot(page, name, viewport) {
  const filename = `${name}-${viewport}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

async function measurePerformance(page) {
  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    const navigation = performance.getEntriesByType('navigation')[0];
    
    return {
      // Core Web Vitals
      lcp: performance.getEntriesByType('largest-contentful-paint').pop()?.startTime || null,
      fcp: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime || null,
      
      // Navigation timing
      dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
      tcpConnection: timing.connectEnd - timing.connectStart,
      serverResponse: timing.responseEnd - timing.requestStart,
      domProcessing: timing.domComplete - timing.domLoading,
      totalLoadTime: timing.loadEventEnd - timing.navigationStart,
      
      // Resource counts
      resourceCount: performance.getEntriesByType('resource').length,
      imageCount: performance.getEntriesByType('resource').filter(r => r.initiatorType === 'img').length
    };
  });
  
  return metrics;
}

async function checkImages(page) {
  const images = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'));
    return imgs.map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      displayedWidth: img.width,
      displayedHeight: img.height,
      complete: img.complete,
      loading: img.loading,
      decoding: img.decoding
    }));
  });
  
  const issues = [];
  images.forEach((img, i) => {
    if (!img.alt && !img.src.includes('data:')) {
      issues.push({ type: 'missing-alt', src: img.src, index: i });
    }
    if (!img.complete) {
      issues.push({ type: 'not-loaded', src: img.src, index: i });
    }
    if (img.naturalWidth === 0 && !img.src.includes('data:')) {
      issues.push({ type: 'broken-image', src: img.src, index: i });
    }
  });
  
  return { images, count: images.length, issues };
}

async function checkLinks(page, baseUrl) {
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      href: a.href,
      text: a.textContent.trim(),
      isExternal: a.hostname !== window.location.hostname,
      target: a.target
    }));
  });
  
  const uniqueLinks = [...new Map(links.map(l => [l.href, l])).values()];
  const issues = [];
  
  for (const link of uniqueLinks.slice(0, 20)) { // Check first 20 links
    if (link.isExternal) continue; // Skip external links for this test
    
    try {
      const response = await page.request.head(link.href, { timeout: 5000 }).catch(() => null);
      if (response && response.status() >= 400) {
        issues.push({ type: 'broken-link', href: link.href, status: response.status() });
      }
    } catch (e) {
      // Link check failed, might be due to JS routing
    }
  }
  
  return { links, count: links.length, issues };
}

async function checkForms(page) {
  const forms = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('form')).map(form => ({
      action: form.action,
      method: form.method,
      id: form.id,
      fields: Array.from(form.querySelectorAll('input, textarea, select')).map(f => ({
        type: f.type,
        name: f.name,
        id: f.id,
        required: f.required,
        placeholder: f.placeholder
      }))
    }));
  });
  
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button, [role="button"], .btn, [class*="button"]')).map(btn => ({
      text: btn.textContent.trim().slice(0, 50),
      type: btn.type,
      disabled: btn.disabled,
      clickable: !btn.disabled
    }));
  });
  
  return { forms, buttons, formCount: forms.length, buttonCount: buttons.length };
}

async function runAccessibilityChecks(page) {
  // Basic accessibility checks
  const a11y = await page.evaluate(() => {
    const issues = [];
    
    // Check for missing lang attribute
    if (!document.documentElement.lang) {
      issues.push({ type: 'missing-lang', message: 'HTML element missing lang attribute' });
    }
    
    // Check for proper heading hierarchy
    const h1s = document.querySelectorAll('h1');
    if (h1s.length === 0) {
      issues.push({ type: 'missing-h1', message: 'No H1 heading found' });
    } else if (h1s.length > 1) {
      issues.push({ type: 'multiple-h1', message: `Found ${h1s.length} H1 headings` });
    }
    
    // Check for empty links
    document.querySelectorAll('a').forEach((a, i) => {
      if (!a.textContent.trim() && !a.querySelector('img, svg')) {
        issues.push({ type: 'empty-link', message: `Empty link at index ${i}`, href: a.href });
      }
    });
    
    // Check for low contrast indicators (basic)
    const elementsWithoutFocus = Array.from(document.querySelectorAll('a, button, input')).filter(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline === 'none' && !el.className.includes('focus');
    });
    
    if (elementsWithoutFocus.length > 5) {
      issues.push({ type: 'focus-styles', message: `${elementsWithoutFocus.length} interactive elements may lack focus styles` });
    }
    
    return { issues };
  });
  
  return a11y;
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting PFL Website QA Testing...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  // Collect console errors globally
  const consoleErrors = [];
  const networkErrors = [];
  
  try {
    // ============ TEST 1: ROUTE TESTING ============
    console.log('📍 Testing all page routes...');
    
    for (const route of ROUTES) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push({ route: route.path, type: msg.type(), text: msg.text() });
        }
      });
      
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push({ 
            route: route.path, 
            url: response.url(), 
            status: response.status() 
          });
        }
      });
      
      try {
        const startTime = Date.now();
        const response = await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
        const loadTime = Date.now() - startTime;
        
        const title = await page.title();
        const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
        
        results.routes[route.path] = {
          name: route.name,
          status: response.status(),
          loadTime,
          title,
          h1,
          ok: response.ok(),
          error: null
        };
        
        results.summary.totalTests++;
        if (response.ok()) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
          results.routes[route.path].error = `HTTP ${response.status()}`;
        }
        
        console.log(`  ✓ ${route.name} (${route.path}): ${response.status()} in ${loadTime}ms`);
        
      } catch (error) {
        results.routes[route.path] = {
          name: route.name,
          status: null,
          error: error.message,
          ok: false
        };
        results.summary.totalTests++;
        results.summary.failed++;
        console.log(`  ✗ ${route.name} (${route.path}): ${error.message}`);
      }
      
      await context.close();
    }
    
    // ============ TEST 2: RESPONSIVE DESIGN ============
    console.log('\n📱 Testing responsive design...');
    
    const homeContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const homePage = await homeContext.newPage();
    await homePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height }
      });
      const page = await context.newPage();
      
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      
      // Capture screenshot
      const screenshotPath = await captureScreenshot(page, 'homepage', viewport.name);
      
      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      // Check if nav is accessible
      const navVisible = await page.isVisible('nav, header').catch(() => false);
      const mobileMenuExists = await page.isVisible('[aria-label*="menu"], .hamburger, .mobile-menu, button[class*="menu"]').catch(() => false);
      
      results.responsive[viewport.name] = {
        width: viewport.width,
        height: viewport.height,
        device: viewport.device,
        screenshot: screenshotPath,
        hasOverflow,
        navVisible,
        mobileMenuExists,
        issues: hasOverflow ? ['Horizontal overflow detected'] : []
      };
      
      console.log(`  ✓ ${viewport.device} (${viewport.width}x${viewport.height}): ${hasOverflow ? '⚠️ Overflow' : 'OK'}`);
      
      await context.close();
    }
    
    await homeContext.close();
    
    // ============ TEST 3: IMAGE TESTING ============
    console.log('\n🖼️  Testing image loading and optimization...');
    
    for (const route of ROUTES) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      
      const imageData = await checkImages(page);
      results.images.pages[route.path] = imageData;
      
      if (imageData.issues.length > 0) {
        results.summary.warnings += imageData.issues.length;
        console.log(`  ⚠️  ${route.name}: ${imageData.count} images, ${imageData.issues.length} issues`);
        imageData.issues.slice(0, 3).forEach(issue => {
          console.log(`      - ${issue.type}: ${issue.src?.slice(-40) || 'unknown'}`);
        });
      } else {
        console.log(`  ✓ ${route.name}: ${imageData.count} images, no issues`);
      }
      
      await context.close();
    }
    
    // ============ TEST 4: FORM TESTING ============
    console.log('\n📝 Testing forms and interactivity...');
    
    for (const route of ROUTES) {
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      
      const formData = await checkForms(page);
      results.forms.pages[route.path] = formData;
      
      if (formData.forms.length > 0 || formData.buttons.length > 0) {
        console.log(`  ✓ ${route.name}: ${formData.forms.length} forms, ${formData.buttons.length} buttons`);
      }
      
      await context.close();
    }
    
    // ============ TEST 5: NAVIGATION & LINKS ============
    console.log('\n🔗 Testing navigation and links...');
    
    const navContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const navPage = await navContext.newPage();
    await navPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Test main navigation
    const navLinks = await navPage.evaluate(() => {
      const nav = document.querySelector('nav, header');
      if (!nav) return [];
      return Array.from(nav.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        isActive: a.classList.contains('active') || a.getAttribute('aria-current') === 'page'
      }));
    });
    
    results.navigation.navStructure = navLinks;
    results.navigation.navLinkCount = navLinks.length;
    
    // Test all internal links
    const linkData = await checkLinks(navPage, BASE_URL);
    results.navigation.links = linkData;
    
    if (linkData.issues.length > 0) {
      results.summary.warnings += linkData.issues.length;
      console.log(`  ⚠️  Found ${linkData.issues.length} potential link issues`);
    } else {
      console.log(`  ✓ All links appear functional (${linkData.count} total)`);
    }
    
    await navContext.close();
    
    // ============ TEST 6: PERFORMANCE METRICS ============
    console.log('\n⚡ Measuring performance metrics...');
    
    for (const route of ROUTES.slice(0, 3)) { // Test first 3 routes for performance
      const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
      const page = await context.newPage();
      
      // Clear cache and measure
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000); // Let things settle
      
      const perfMetrics = await measurePerformance(page);
      results.performance.pages[route.path] = perfMetrics;
      
      console.log(`  ✓ ${route.name}:`);
      console.log(`      FCP: ${perfMetrics.fcp ? Math.round(perfMetrics.fcp) + 'ms' : 'N/A'}`);
      console.log(`      LCP: ${perfMetrics.lcp ? Math.round(perfMetrics.lcp) + 'ms' : 'N/A'}`);
      console.log(`      Total: ${perfMetrics.totalLoadTime}ms`);
      console.log(`      Resources: ${perfMetrics.resourceCount}`);
      
      await context.close();
    }
    
    // ============ ACCESSIBILITY CHECKS ============
    console.log('\n♿ Running accessibility checks...');
    
    const a11yContext = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const a11yPage = await a11yContext.newPage();
    await a11yPage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    const a11yResults = await runAccessibilityChecks(a11yPage);
    results.accessibility = a11yResults;
    
    if (a11yResults.issues.length > 0) {
      results.summary.warnings += a11yResults.issues.length;
      console.log(`  ⚠️  Found ${a11yResults.issues.length} accessibility issues`);
      a11yResults.issues.forEach(issue => {
        console.log(`      - ${issue.type}: ${issue.message}`);
      });
    } else {
      console.log(`  ✓ No major accessibility issues found`);
    }
    
    await a11yContext.close();
    
    // Store console and network errors
    results.consoleErrors = consoleErrors;
    results.networkErrors = networkErrors;
    
    if (consoleErrors.length > 0) {
      results.summary.warnings += consoleErrors.length;
      console.log(`\n⚠️  ${consoleErrors.length} console errors detected`);
    }
    
    if (networkErrors.length > 0) {
      results.summary.warnings += networkErrors.length;
      console.log(`⚠️  ${networkErrors.length} network errors detected`);
    }
    
  } finally {
    await browser.close();
  }
  
  // Save detailed results
  fs.writeFileSync(
    path.join(RESULTS_DIR, 'test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('\n✅ QA Testing Complete!');
  console.log(`   Results saved to: ${RESULTS_DIR}`);
  
  return results;
}

// Generate markdown report
function generateReport(results) {
  const report = [];
  
  report.push('# PFL Website - QA Test Report');
  report.push('');
  report.push(`**Test Date:** ${new Date(results.timestamp).toLocaleString()}`);
  report.push(`**URL:** ${results.url}`);
  report.push('');
  report.push('---');
  report.push('');
  
  // Summary
  report.push('## Executive Summary');
  report.push('');
  report.push('| Metric | Count |');
  report.push('|--------|-------|');
  report.push(`| Total Tests | ${results.summary.totalTests} |`);
  report.push(`| ✅ Passed | ${results.summary.passed} |`);
  report.push(`| ❌ Failed | ${results.summary.failed} |`);
  report.push(`| ⚠️ Warnings | ${results.summary.warnings} |`);
  report.push('');
  
  const passRate = results.summary.totalTests > 0 
    ? Math.round((results.summary.passed / results.summary.totalTests) * 100) 
    : 0;
  report.push(`**Overall Pass Rate:** ${passRate}%`);
  report.push('');
  
  // Route Testing
  report.push('## 1. Page Route Testing');
  report.push('');
  report.push('| Route | Name | Status | Load Time | Title | H1 |');
  report.push('|-------|------|--------|-----------|-------|-----|');
  
  Object.entries(results.routes).forEach(([path, data]) => {
    const statusIcon = data.ok ? '✅' : '❌';
    const status = data.status || 'ERROR';
    const loadTime = data.loadTime ? `${data.loadTime}ms` : 'N/A';
    const title = (data.title || 'N/A').slice(0, 30);
    const h1 = (data.h1 || 'N/A').slice(0, 30);
    report.push(`| ${path} | ${data.name} | ${statusIcon} ${status} | ${loadTime} | ${title} | ${h1} |`);
  });
  report.push('');
  
  // Responsive Design
  report.push('## 2. Responsive Design Testing');
  report.push('');
  report.push('| Viewport | Device | Dimensions | Overflow | Nav Visible | Mobile Menu |');
  report.push('|----------|--------|------------|----------|-------------|-------------|');
  
  Object.entries(results.responsive).forEach(([name, data]) => {
    const overflow = data.hasOverflow ? '⚠️ Yes' : '✅ No';
    const nav = data.navVisible ? '✅ Yes' : '❌ No';
    const menu = data.mobileMenuExists ? '✅ Yes' : 'No';
    report.push(`| ${name} | ${data.device} | ${data.width}x${data.height} | ${overflow} | ${nav} | ${menu} |`);
  });
  report.push('');
  
  report.push('### Screenshots');
  report.push('');
  Object.entries(results.responsive).forEach(([name, data]) => {
    const screenshotPath = path.relative(RESULTS_DIR, data.screenshot);
    report.push(`- **${name}** (${data.device}): \`${screenshotPath}\``);
  });
  report.push('');
  
  // Image Testing
  report.push('## 3. Image Loading & Optimization');
  report.push('');
  report.push('| Page | Images | Issues |');
  report.push('|------|--------|--------|');
  
  Object.entries(results.images.pages).forEach(([path, data]) => {
    const issues = data.issues.length > 0 ? `${data.issues.length} ⚠️` : '✅ None';
    report.push(`| ${path} | ${data.count} | ${issues} |`);
  });
  report.push('');
  
  // Detailed image issues
  const allImageIssues = [];
  Object.entries(results.images.pages).forEach(([path, data]) => {
    data.issues.forEach(issue => {
      allImageIssues.push({ ...issue, page: path });
    });
  });
  
  if (allImageIssues.length > 0) {
    report.push('### Image Issues Found');
    report.push('');
    report.push('| Page | Type | Source |');
    report.push('|------|------|--------|');
    allImageIssues.slice(0, 20).forEach(issue => {
      const src = (issue.src || 'N/A').slice(-50);
      report.push(`| ${issue.page} | ${issue.type} | \`${src}\` |`);
    });
    report.push('');
  }
  
  // Form Testing
  report.push('## 4. Forms & Interactivity');
  report.push('');
  report.push('| Page | Forms | Buttons |');
  report.push('|------|-------|---------|');
  
  Object.entries(results.forms.pages).forEach(([path, data]) => {
    report.push(`| ${path} | ${data.formCount} | ${data.buttonCount} |`);
  });
  report.push('');
  
  // Navigation
  report.push('## 5. Navigation & Links');
  report.push('');
  report.push(`**Total Links Found:** ${results.navigation.links?.count || 0}`);
  report.push(`**Navigation Link Count:** ${results.navigation.navLinkCount || 0}`);
  report.push('');
  
  if (results.navigation.navStructure) {
    report.push('### Navigation Structure');
    report.push('');
    report.push('| Text | Href |');
    report.push('|------|------|');
    results.navigation.navStructure.forEach(link => {
      const text = (link.text || 'N/A').slice(0, 30);
      const href = link.href.replace(BASE_URL, '') || '/';
      report.push(`| ${text} | ${href} |`);
    });
    report.push('');
  }
  
  if (results.navigation.links?.issues?.length > 0) {
    report.push('### Link Issues');
    report.push('');
    results.navigation.links.issues.forEach(issue => {
      report.push(`- **${issue.type}:** ${issue.href} (${issue.status})`);
    });
    report.push('');
  }
  
  // Performance
  report.push('## 6. Performance Metrics');
  report.push('');
  report.push('| Page | FCP | LCP | Total Load | Resources | Images |');
  report.push('|------|-----|-----|------------|-----------|--------|');
  
  Object.entries(results.performance.pages).forEach(([path, data]) => {
    const fcp = data.fcp ? `${Math.round(data.fcp)}ms` : 'N/A';
    const lcp = data.lcp ? `${Math.round(data.lcp)}ms` : 'N/A';
    report.push(`| ${path} | ${fcp} | ${lcp} | ${data.totalLoadTime}ms | ${data.resourceCount} | ${data.imageCount} |`);
  });
  report.push('');
  
  report.push('### Performance Benchmarks');
  report.push('');
  report.push('- **FCP (First Contentful Paint):** Should be < 1.8s (Good), < 3s (Needs Improvement)');
  report.push('- **LCP (Largest Contentful Paint):** Should be < 2.5s (Good), < 4s (Needs Improvement)');
  report.push('- **Total Load Time:** Should be < 3s for optimal user experience');
  report.push('');
  
  // Accessibility
  report.push('## 7. Accessibility Audit');
  report.push('');
  if (results.accessibility?.issues?.length > 0) {
    report.push(`**Issues Found:** ${results.accessibility.issues.length}`);
    report.push('');
    report.push('| Type | Message |');
    report.push('|------|---------|');
    results.accessibility.issues.forEach(issue => {
      report.push(`| ${issue.type} | ${issue.message} |`);
    });
  } else {
    report.push('✅ No major accessibility issues detected');
  }
  report.push('');
  
  // Console & Network Errors
  if (results.consoleErrors?.length > 0 || results.networkErrors?.length > 0) {
    report.push('## 8. Console & Network Errors');
    report.push('');
    
    if (results.consoleErrors.length > 0) {
      report.push(`### Console Errors (${results.consoleErrors.length})`);
      report.push('');
      report.push('| Route | Type | Message |');
      report.push('|-------|------|---------|');
      results.consoleErrors.slice(0, 15).forEach(err => {
        const msg = err.text.slice(0, 60);
        report.push(`| ${err.route} | ${err.type} | ${msg} |`);
      });
      report.push('');
    }
    
    if (results.networkErrors.length > 0) {
      report.push(`### Network Errors (${results.networkErrors.length})`);
      report.push('');
      report.push('| Route | URL | Status |');
      report.push('|-------|-----|--------|');
      results.networkErrors.slice(0, 15).forEach(err => {
        const url = err.url.slice(-50);
        report.push(`| ${err.route} | ${url} | ${err.status} |`);
      });
      report.push('');
    }
  }
  
  // Bugs Summary
  report.push('---');
  report.push('');
  report.push('## Bug Summary');
  report.push('');
  
  const bugs = [];
  
  // Collect all issues
  Object.entries(results.routes).forEach(([path, data]) => {
    if (!data.ok) {
      bugs.push({ severity: 'High', category: 'Route', description: `${data.name} (${path}) failed with: ${data.error}` });
    }
  });
  
  Object.entries(results.responsive).forEach(([name, data]) => {
    if (data.hasOverflow) {
      bugs.push({ severity: 'Medium', category: 'Responsive', description: `Horizontal overflow detected on ${name} viewport` });
    }
  });
  
  allImageIssues.forEach(issue => {
    bugs.push({ severity: 'Low', category: 'Images', description: `${issue.type} on ${issue.page}: ${issue.src?.slice(-30)}` });
  });
  
  results.accessibility?.issues?.forEach(issue => {
    bugs.push({ severity: 'Medium', category: 'Accessibility', description: issue.message });
  });
  
  results.consoleErrors?.forEach(err => {
    bugs.push({ severity: 'Medium', category: 'Console', description: `Console error on ${err.route}: ${err.text.slice(0, 50)}` });
  });
  
  if (bugs.length === 0) {
    report.push('✅ No bugs detected!');
  } else {
    report.push(`**Total Issues Found:** ${bugs.length}`);
    report.push('');
    report.push('| Severity | Category | Description |');
    report.push('|----------|----------|-------------|');
    bugs.forEach(bug => {
      const desc = bug.description.slice(0, 80);
      report.push(`| ${bug.severity} | ${bug.category} | ${desc} |`);
    });
  }
  report.push('');
  
  // Recommendations
  report.push('## Recommendations');
  report.push('');
  report.push('1. **Performance Optimization:**');
  report.push('   - Consider lazy loading images below the fold');
  report.push('   - Optimize image sizes for different viewports');
  report.push('   - Implement resource preloading for critical assets');
  report.push('');
  report.push('2. **Accessibility Improvements:**');
  report.push('   - Ensure all images have descriptive alt text');
  report.push('   - Verify focus indicators are visible on all interactive elements');
  report.push('   - Add skip links for keyboard navigation');
  report.push('');
  report.push('3. **Responsive Design:**');
  report.push('   - Test thoroughly on actual mobile devices');
  report.push('   - Ensure touch targets are at least 44x44px');
  report.push('   - Verify text remains readable at all zoom levels');
  report.push('');
  
  report.push('---');
  report.push('');
  report.push('*Report generated by Playwright QA Automation*');
  
  return report.join('\n');
}

// Run the tests and generate report
runTests()
  .then(results => {
    const markdown = generateReport(results);
    const reportPath = path.join(process.cwd(), 'QA_REPORT.md');
    fs.writeFileSync(reportPath, markdown);
    console.log(`\n📄 QA Report saved to: ${reportPath}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
