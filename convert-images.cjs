const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');

// Convert a single image to WebP
async function convertToWebP(inputPath, outputPath, quality = 85) {
  try {
    await sharp(inputPath)
      .webp({ quality, effort: 6 })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const webpSize = fs.statSync(outputPath).size;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → WebP (${savings}% smaller)`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to convert ${path.basename(inputPath)}:`, err.message);
    return false;
  }
}

// Main conversion function
async function main() {
  const imagesToConvert = [
    'pfl-stargazing.jpg',
    'pfl-stargazing-mobile.jpg',
    'snowy-cabin2.jpg',
    'hottub-snow.jpg'
  ];
  
  console.log('🚀 Converting images to WebP...\n');
  
  for (const image of imagesToConvert) {
    const inputPath = path.join(imagesDir, image);
    const outputPath = inputPath.replace('.jpg', '.webp');
    
    if (fs.existsSync(inputPath)) {
      await convertToWebP(inputPath, outputPath);
    } else {
      console.log(`⚠️  ${image} not found`);
    }
  }
  
  console.log('\n✨ Done!');
}

main().catch(console.error);
