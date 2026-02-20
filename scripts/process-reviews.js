#!/usr/bin/env node
/**
 * Process Airbnb reviews and update the website
 * Filters out negative reviews and adds pagination
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Negative keywords to filter out
const negativeKeywords = [
  'clogged', 'not draining', 'not clean', 'dirty', 'filthy',
  'bug', 'gnats', 'insects', 'pest', 'infestation',
  'broken', 'not working', 'didn\'t work', 'doesn\'t work',
  'disappointing', 'disappointed', 'terrible', 'awful', 'horrible',
  'worst', 'hate', 'regret', 'avoid', 'never again',
  'rude', 'unresponsive', 'unhelpful', 'unprofessional',
  'noisy', 'loud', 'road noise', 'highway noise',
  'hair', 'messes', 'unclean'
];

// Read the reviews file
const reviewsPath = path.join('/home/shapi/.openclaw-pfl/workspace/data', 'airbnb-reviews-master.json');
const reviewsData = JSON.parse(fs.readFileSync(reviewsPath, 'utf-8'));

console.log(`Total reviews in file: ${reviewsData.reviews.length}`);

// Filter reviews
const goodReviews = reviewsData.reviews.filter(review => {
  // Filter out 3-star and below
  if (review.rating < 4) {
    console.log(`❌ Filtered (low rating ${review.rating}): ${review.name}`);
    return false;
  }
  
  // Check for negative keywords in text
  const textLower = review.text.toLowerCase();
  const hasNegative = negativeKeywords.some(keyword => 
    textLower.includes(keyword.toLowerCase())
  );
  
  if (hasNegative) {
    console.log(`❌ Filtered (negative content): ${review.name}`);
    return false;
  }
  
  return true;
});

console.log(`\n✅ Good reviews to display: ${goodReviews.length}`);
console.log(`❌ Filtered out: ${reviewsData.reviews.length - goodReviews.length}`);

// Format reviews for the website
const formattedReviews = goodReviews.map(review => ({
  name: review.name,
  location: review.location || review.airbnb_tenure || 'Airbnb Guest',
  rating: review.rating,
  date: review.date,
  text: review.text,
  avatar: review.name.charAt(0).toUpperCase()
}));

// Generate the reviews page content
const reviewsPerPage = 12;
const totalPages = Math.ceil(formattedReviews.length / reviewsPerPage);

console.log(`\n📄 Pagination: ${totalPages} pages (${reviewsPerPage} reviews per page)`);

// Create the reviews data file
const outputDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outputDir, 'reviews.json'),
  JSON.stringify({
    totalReviews: formattedReviews.length,
    reviewsPerPage,
    totalPages,
    reviews: formattedReviews
  }, null, 2)
);

console.log('\n✅ Reviews data saved to src/data/reviews.json');

// Generate summary
const ratingCounts = {};
formattedReviews.forEach(r => {
  ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
});

console.log('\n📊 Rating Distribution:');
Object.entries(ratingCounts).sort((a, b) => b[0] - a[0]).forEach(([rating, count]) => {
  console.log(`  ${rating} stars: ${count} reviews`);
});

const avgRating = (formattedReviews.reduce((sum, r) => sum + r.rating, 0) / formattedReviews.length).toFixed(2);
console.log(`\n⭐ Average Rating: ${avgRating}`);
