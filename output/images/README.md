# PFL Website Photos Setup

## ✅ Photos Successfully Copied

**Location:** `~/.openclaw-pfl/workspace/photos/`

**Total Photos:** 36 images

### Photo Inventory:
- Property/exterior photos (006-0278, 007-0279, 008-0280, etc.)
- Aerial interior shots (025-Aerial through 037-Aerial)
- Various room/property photos

---

## 🔗 Connect to Website

The PFL website is at: `~/.openclaw-pfl/workspace/website/pfl-astro/`

### Option 1: Fix Permissions (Recommended)

Run this to fix ownership and create proper symlink:

```bash
echo "mslion10" | sudo -S chown -R shapi:shapi ~/.openclaw-pfl/workspace/website/pfl-astro
rm -rf ~/.openclaw-pfl/workspace/website/pfl-astro/public/images
ln -s ~/.openclaw-pfl/workspace/photos ~/.openclaw-pfl/workspace/website/pfl-astro/public/images
```

### Option 2: Manual Copy (No Permissions Needed)

```bash
sudo cp ~/.openclaw-pfl/workspace/photos/*.jpg ~/.openclaw-pfl/workspace/website/pfl-astro/public/images/
```

### Option 3: Update astro.config.mjs

Point Astro to the photos directory:

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  publicDir: '../../photos', // Relative to src folder
});
```

---

## 🖼️ Using Photos in Astro

Once connected:

```astro
---
// Any .astro file
---
<img src="/images/006-0278 14317 W US Hwy 160.jpg" alt="Pagosa Forest Lodge Exterior" />

<!-- Or with better naming -->
<img src="/images/pfl-exterior-1.jpg" alt="PFL Cabin" />
```

---

## 📸 Photo Organization

Consider renaming photos for web:
```bash
cd ~/.openclaw-pfl/workspace/photos
mv "006-0278 14317 W US Hwy 160.jpg" pfl-exterior-driveway.jpg
mv "025-Aerial Interior.jpg" pfl-interior-main.jpg
# etc...
```

---

## ✅ Next Steps

1. **Fix website permissions** (run command above)
2. **Or manually copy** photos to `public/images/`
3. **Test** images load in browser
4. **Optimize** if needed (compress for web)

Photos are ready to use!
