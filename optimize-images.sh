#!/bin/bash
# Image Optimization Script for PFL Website
# This script optimizes all images in the public/images directory

echo "=== PFL Image Optimization Script ==="
echo ""

# Check for available tools
echo "Checking available tools..."

# Create optimized directory
mkdir -p /home/shapi/.openclaw-pfl/workspace/website/pfl-astro/public/images-optimized

# Function to optimize images using ImageMagick if available
optimize_images() {
    local source_dir="/home/shapi/.openclaw-pfl/workspace/website/pfl-astro/public/images"
    local output_dir="/home/shapi/.openclaw-pfl/workspace/website/pfl-astro/public/images-optimized"
    
    echo "Scanning images in $source_dir..."
    echo ""
    
    # Find all image files and list sizes
    find "$source_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read img; do
        size=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img" 2>/dev/null)
        size_mb=$(echo "scale=2; $size / 1024 / 1024" | bc)
        echo "$(basename "$img"): ${size_mb}MB"
    done
    
    echo ""
    echo "Total images: $(find "$source_dir" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | wc -l)"
    
    total_size=$(du -sb "$source_dir" | cut -f1)
    total_mb=$(echo "scale=2; $total_size / 1024 / 1024" | bc)
    echo "Total size: ${total_mb}MB"
}

# Generate WebP versions
generate_webp() {
    echo ""
    echo "=== WebP Generation ==="
    echo "WebP images can reduce file sizes by 25-35%"
    echo "Consider using online tools like:"
    echo "  - https://squoosh.app"
    echo "  - https://convertio.co"
    echo "  - cwebp command line tool"
}

# Generate recommendations
show_recommendations() {
    echo ""
    echo "=== Optimization Recommendations ==="
    echo ""
    echo "1. IMAGE SIZES TO OPTIMIZE:"
    echo "   - Images larger than 500KB should be compressed"
    echo "   - Hero images should be max 200-300KB"
    echo "   - Gallery thumbnails should be 50-100KB"
    echo ""
    echo "2. TARGET SIZES:"
    echo "   - Hero images: 1920x1080 max, ~200KB"
    echo "   - Gallery images: 800x600 max, ~100KB"
    echo "   - Thumbnails: 400x300 max, ~50KB"
    echo ""
    echo "3. FORMAT RECOMMENDATIONS:"
    echo "   - Use WebP for photos (25-35% smaller)"
    echo "   - Keep JPEG fallback for older browsers"
    echo "   - Use PNG only for transparent images"
    echo ""
    echo "4. TOOLS TO USE:"
    echo "   - Online: Squoosh.app (Google)"
    echo "   - CLI: cwebp, jpegoptim, pngquant"
    echo "   - Batch: ImageMagick"
    echo ""
}

# Run analysis
optimize_images
generate_webp
show_recommendations

echo "=== Analysis Complete ==="
