#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define directories
const ROOT_DIR = path.join(__dirname, 'assets');
const PURPLE_MAP_DIR = path.join(ROOT_DIR, 'purple_map');
const OUTPUT_DIR = path.join(ROOT_DIR, 'fixed');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Get all e7*.png files in the root assets directory
const pngFiles = fs.readdirSync(ROOT_DIR)
  .filter(file => file.toLowerCase().startsWith('e7') && file.toLowerCase().endsWith('.png'));

console.log(`Found ${pngFiles.length} e7*.png files to process`);

// Process all files
async function processAllFiles() {
  let processed = 0;
  let errors = 0;
  
  for (const file of pngFiles) {
    try {
      const inputPath = path.join(ROOT_DIR, file);
      const purpleMapPath = path.join(PURPLE_MAP_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, file);

      // Check if the corresponding purple map file exists
      if (!fs.existsSync(purpleMapPath)) {
        console.warn(`Warning: No purple map found for ${file}, skipping`);
        continue;
      }

      console.log(`\nProcessing ${file} (${processed + 1}/${pngFiles.length})...`);
      
      // Process the image
      await processImage(inputPath, purpleMapPath, outputPath);
      
      processed++;
      console.log(`Completed ${file} (${processed}/${pngFiles.length})`);
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\nProcessing complete!`);
  console.log(`Successfully processed: ${processed} files`);
  console.log(`Errors: ${errors} files`);
}

// Check if a pixel is green
function isGreenPixel(r, g, b) {
  return g > 200 && r < 100 && b < 100;
}

// Check if a pixel is purple
function isPurplePixel(r, g, b) {
  return r > 200 && g < 50 && b > 50 && b < 200;
}

// Process image
async function processImage(inputPath, purpleMapPath, outputPath) {
  // Load the main image
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  // Load the purple map image and resize it to match the main image if needed
  const purpleMap = sharp(purpleMapPath);
  const purpleMapMetadata = await purpleMap.metadata();
  
  let resizedPurpleMap = purpleMap;
  if (metadata.width !== purpleMapMetadata.width || metadata.height !== purpleMapMetadata.height) {
    console.log(`Resizing purple map to match main image dimensions`);
    resizedPurpleMap = purpleMap.resize(metadata.width, metadata.height, { fit: 'fill' });
  }
  
  // Extract the raw pixel data from both images
  const { data: imageData, info: imageInfo } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { data: purpleMapData, info: purpleMapInfo } = await resizedPurpleMap
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Create a new buffer for the resulting image (fully transparent initially)
  const resultBuffer = Buffer.alloc(metadata.width * metadata.height * 4, 0);
  
  // Track statistics
  let greenPixelCount = 0;
  let purplePixelCount = 0;
  let normalPixelCount = 0;
  
  // Process each pixel
  for (let y = 0; y < metadata.height; y++) {
    for (let x = 0; x < metadata.width; x++) {
      const imageIndex = (y * metadata.width + x) * imageInfo.channels;
      const purpleMapIndex = (y * metadata.width + x) * purpleMapInfo.channels;
      const resultIndex = (y * metadata.width + x) * 4;
      
      // Get the pixel values from the main image
      const r = imageData[imageIndex];
      const g = imageData[imageIndex + 1];
      const b = imageData[imageIndex + 2];
      const a = imageInfo.channels === 4 ? imageData[imageIndex + 3] : 255;
      
      // Get the pixel values from the purple map
      const purpleR = purpleMapData[purpleMapIndex];
      const purpleG = purpleMapData[purpleMapIndex + 1];
      const purpleB = purpleMapData[purpleMapIndex + 2];
      
      // Check if the pixel is green in the original image
      if (isGreenPixel(r, g, b)) {
        // Add a shadow pixel to the resulting image
        resultBuffer[resultIndex] = 0; // R
        resultBuffer[resultIndex + 1] = 0; // G
        resultBuffer[resultIndex + 2] = 0; // B
        resultBuffer[resultIndex + 3] = 192; // A (75% opacity)
        greenPixelCount++;
      }
      // Check if the pixel is purple in the purple map
      else if (isPurplePixel(purpleR, purpleG, purpleB)) {
        // Leave transparent (already initialized to 0)
        purplePixelCount++;
      }
      // Otherwise, copy the pixel from the original image
      else {
        resultBuffer[resultIndex] = r;
        resultBuffer[resultIndex + 1] = g;
        resultBuffer[resultIndex + 2] = b;
        resultBuffer[resultIndex + 3] = a;
        normalPixelCount++;
      }
    }
  }
  
  console.log(`Applied shadows to ${greenPixelCount} green pixels`);
  console.log(`Applied transparency to ${purplePixelCount} purple pixels`);
  console.log(`Copied ${normalPixelCount} normal pixels`);
  
  // Create a new image from the processed buffer
  await sharp(resultBuffer, {
    raw: {
      width: metadata.width,
      height: metadata.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);
}

// Run the processing
processAllFiles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
