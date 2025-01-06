import sharp from 'sharp';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

const BACKUP_DIR = 'image-backups';
const MAX_WIDTH = 1920; // Maximum width for any image
const QUALITY = 80; // WebP quality (0-100)

async function optimizeImages() {
  // Create backup directory if it doesn't exist
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  try {
    // Find all images
    const images = await glob('public/**/*.{jpg,jpeg,png,gif}');
    
    console.log(`Found ${images.length} images to optimize`);

    for (const imagePath of images) {
      const filename = path.basename(imagePath);
      const ext = path.extname(filename);
      const name = path.basename(filename, ext);
      const dir = path.dirname(imagePath);
      
      // Create backup directory structure
      const backupDir = path.join(BACKUP_DIR, dir);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Backup original
      fs.copyFileSync(imagePath, path.join(BACKUP_DIR, imagePath));

      console.log(`Processing: ${imagePath}`);

      try {
        // Get image metadata
        const metadata = await sharp(imagePath).metadata();
        
        // Calculate new width while maintaining aspect ratio
        const width = metadata.width ? Math.min(metadata.width, MAX_WIDTH) : MAX_WIDTH;

        // Optimize image
        await sharp(imagePath)
          .resize(width, null, { 
            withoutEnlargement: true,
            fit: 'inside'
          })
          .webp({ 
            quality: QUALITY,
            effort: 6 // Higher effort = better compression but slower
          })
          .toFile(path.join(dir, `${name}.webp`));

        // Remove original file
        fs.unlinkSync(imagePath);

        console.log(`✓ Optimized: ${imagePath} -> ${path.join(dir, `${name}.webp`)}`);
      } catch (err) {
        console.error(`Error processing ${imagePath}:`, err);
      }
    }

    console.log('\nImage optimization complete!');
    console.log(`Original images backed up in ${BACKUP_DIR}/`);
  } catch (err) {
    console.error('Error during optimization:', err);
  }
}

optimizeImages(); 