#!/usr/bin/env node
/**
 * Image Optimization Script for PFL Website
 * Uses Sharp to compress and resize images
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, 'public', 'images');
const outputDir = path.join(__dirname, 'public', 'images-optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Image optimization settings
const settings = {
  // Hero images - max 1920px width, quality 80
  hero: {
    maxWidth: 1920,
    quality: 80,
    format: 'jpeg'
  },
  // Gallery images - max 1200px width, quality 75
  gallery: {
    maxWidth: 1200,
    quality: 75,
    format: 'jpeg'
  },
  // Thumbnails - max 600px width, quality 70
  thumbnail: {
    maxWidth: 600,
    quality: 70,
    format: 'jpeg'
  }
};

// List of hero/large images that need aggressive compression
const largeImages = [
  '014-0287 14317 W US Hwy 160.jpg',
  '023-0350 14317 W. US Hwy 160.jpg',
  '007-0279 14317 W US Hwy 160.jpg',
  '006-0278 14317 W US Hwy 160.jpg',
  'og-image.jpg',
  '008-0280 14317 W US Hwy 160.jpg',
  '128-0377 14317 W. US Hwy 160.jpg',
  '018-0291 14317 W US Hwy 160.jpg'
];

// PNG images to convert to JPEG
const pngImages = [
  'snowy-cabin.png',
  'pfl-stargazing.png',
  'hottub-snow.png',
  'snowy-cabin2.png'
];

async function optimizeImage(inputPath, outputPath, options) {
  try {
    const { maxWidth, quality, format } = options;
    
    let pipeline = sharp(inputPath);
    
    // Get metadata
    const metadata = await pipeline.metadata();
    
    // Resize if wider than max
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, { 
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Set format and quality
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ 
        quality,
        progressive: true,
        mozjpeg: true
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        quality,
        progressive: true,
        compressionLevel: 9
      });
    }
    
    await pipeline.toFile(outputPath);
    
    // Calculate savings
    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
    
    return {
      input: (inputStats.size / 1024 / 1024).toFixed(2),
      output: (outputStats.size / 1024 / 1024).toFixed(2),
      savings
    };
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('=== PFL Image Optimization ===\n');
  
  let totalInput = 0;
  let totalOutput = 0;
  
  // Process large images
  console.log('Processing large images...');
  for (const filename of largeImages) {
    const inputPath = path.join(imagesDir, filename);
    if (fs.existsSync(inputPath)) {
      const outputPath = path.join(outputDir, filename);
      const result = await optimizeImage(inputPath, outputPath, settings.hero);
      if (result) {
        console.log(`✓ ${filename}: ${result.input}MB → ${result.output}MB (${result.savings}% saved)`);
        totalInput += parseFloat(result.input);
        totalOutput += parseFloat(result.output);
      }
    }
  }
  
  // Convert PNG to JPEG
  console.log('\nConverting PNG images to JPEG...');
  for (const filename of pngImages) {
    const inputPath = path.join(imagesDir, filename);
    if (fs.existsSync(inputPath)) {
      const outputFilename = filename.replace('.png', '.jpg');
      const outputPath = path.join(outputDir, outputFilename);
      const result = await optimizeImage(inputPath, outputPath, settings.hero);
      if (result) {
        console.log(`✓ ${filename} → ${outputFilename}: ${result.input}MB → ${result.output}MB (${result.savings}% saved)`);
        totalInput += parseFloat(result.input);
        totalOutput += parseFloat(result.output);
      }
    }
  }
  
  console.log('\n=== Summary ===');
  console.log(`Total Input: ${totalInput.toFixed(2)} MB`);
  console.log(`Total Output: ${totalOutput.toFixed(2)} MB`);
  console.log(`Total Saved: ${(totalInput - totalOutput).toFixed(2)} MB (${((totalInput - totalOutput) / totalInput * 100).toFixed(1)}%)`);
  console.log(`\nOptimized images saved to: ${outputDir}`);
  console.log('\nTo apply changes:');
  console.log('  1. Review optimized images in public/images-optimized/');
  console.log('  2. Run: npm run optimize:apply');
}

main().catch(console.error);
