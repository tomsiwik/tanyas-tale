#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const SOURCE_DIR = path.join(__dirname, 'assets', 'fixed');
const OUTPUT_DIR = path.join(__dirname, 'public', 'assets', 'sprites');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define sprite dimensions
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 32;

// Get e7*.png files in the source directory, limited to frames 0000-0055
const pngFiles = fs.readdirSync(SOURCE_DIR)
  .filter(file => file.toLowerCase().startsWith('e7') && file.toLowerCase().endsWith('.png'))
  .filter(file => {
    // Extract the numeric part from the filename (e.g., "e7 0001.png" -> "0001")
    const match = file.match(/\d+/);
    if (!match) return false;
    const frameNumber = parseInt(match[0]);
    return frameNumber <= 55; // Only include frames 0000-0055
  });

console.log(`Found ${pngFiles.length} e7*.png files to process (frames 0000-0055)`);

// Process all files
async function processAllFiles() {
  let processed = 0;
  let errors = 0;
  
  // Sort files to ensure consistent ordering
  const sortedFiles = pngFiles.sort((a, b) => {
    // Extract the numeric part from the filename (e.g., "e7 0001.png" -> "0001")
    const numA = a.match(/\d+/)[0];
    const numB = b.match(/\d+/)[0];
    return parseInt(numA) - parseInt(numB);
  });
  
  // Process individual files to AVIF
  for (const file of sortedFiles) {
    try {
      const inputPath = path.join(SOURCE_DIR, file);
      const outputBaseName = file.replace(/\s+/g, '_').replace('.png', '');
      const avifOutputPath = path.join(OUTPUT_DIR, `${outputBaseName}.avif`);
      
      console.log(`\nProcessing ${file} (${processed + 1}/${sortedFiles.length})...`);
      
      // Process to AVIF (high quality)
      await sharp(inputPath)
        .resize(SPRITE_WIDTH, SPRITE_HEIGHT, { fit: 'contain' })
        .avif({ quality: 90 })
        .toFile(avifOutputPath);
      
      processed++;
      console.log(`Completed ${file} (${processed}/${sortedFiles.length})`);
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\nProcessing complete!`);
  console.log(`Successfully processed: ${processed} files`);
  console.log(`Errors: ${errors} files`);
}

// Run the processing
processAllFiles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
