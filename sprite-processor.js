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
const OUTPUT_DIR = path.join(__dirname, 'public', 'assets', 'atlas');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let SPRITE_WIDTH;
let SPRITE_HEIGHT;

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
  const images = [];
  const frames = {};

  // Determine sprite dimensions from the first file
  if (sortedFiles.length > 0) {
    const firstFile = sortedFiles[0];
    const firstFilePath = path.join(SOURCE_DIR, firstFile);
    try {
      const firstImageMetadata = await sharp(firstFilePath).metadata();
      SPRITE_WIDTH = firstImageMetadata.width;
      SPRITE_HEIGHT = firstImageMetadata.height;
      console.log(`Determined sprite dimensions: ${SPRITE_WIDTH}x${SPRITE_HEIGHT}`);
    } catch (error) {
      console.error(`Error getting metadata for first file: ${error.message}`);
      return;
    }
  } else {
    console.log("No sprite files found to determine dimensions.");
    return;
  }

  for (const file of sortedFiles) {
    try {
      const inputPath = path.join(SOURCE_DIR, file);
      console.log(`\nReading ${file} (${images.length + 1}/${sortedFiles.length})...`);

      const image = sharp(inputPath)
        .resize(SPRITE_WIDTH, SPRITE_HEIGHT, { fit: 'contain' })
        .modulate({ brightness: 1.2, saturation: 1.1 }); // Example color correction

      const imageBuffer = await image.toBuffer();
      const imageMetadata = await image.metadata();

      images.push({ input: imageBuffer, raw: imageMetadata });
      
      const frameName = file;
      frames[frameName] = {
        frame: { x: 0, y: 0, w: SPRITE_WIDTH, h: SPRITE_HEIGHT },
        sourceSize: { w: SPRITE_WIDTH, h: SPRITE_HEIGHT },
        spriteSourceSize: { x: 0, y: 0, w: SPRITE_WIDTH, h: SPRITE_HEIGHT }
      };

      processed++;
      console.log(`Completed ${file} (${processed}/${sortedFiles.length})`);
    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      errors++;
    }
  }

  if (images.length === 0) {
    console.log("No images to process.");
    return;
  }

  // Calculate sprite sheet dimensions
  const SPRITES_PER_ROW = 10;
  const numRows = Math.ceil(images.length / SPRITES_PER_ROW);
  const spriteSheetWidth = SPRITES_PER_ROW * SPRITE_WIDTH;
  const spriteSheetHeight = numRows * SPRITE_HEIGHT;

  console.log(`Creating sprite sheet with dimensions: ${spriteSheetWidth}x${spriteSheetHeight}`);

  const compositeInput = images.map((image, index) => ({
    input: image.input,
    top: Math.floor(index / SPRITES_PER_ROW) * SPRITE_HEIGHT,
    left: (index % SPRITES_PER_ROW) * SPRITE_WIDTH,
  }));

  try {
    const spriteSheetBuffer = await sharp({
      create: {
        width: spriteSheetWidth,
        height: spriteSheetHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      },
    })
      .composite(compositeInput)
      .avif()
      .toBuffer();

    const spriteSheetPath = path.join(OUTPUT_DIR, 'sprite_atlas.avif');
    fs.writeFileSync(spriteSheetPath, spriteSheetBuffer);
    console.log(`Sprite sheet created at ${spriteSheetPath}`);

    const meta = {
      image: 'sprite_atlas.avif',
      format: 'RGBA8888',
      size: { w: spriteSheetWidth, h: spriteSheetHeight },
      scale: 1
    };

    const animations = {
      running: sortedFiles // Array of frame names
    };

    const atlasData = {
      frames: frames,
      meta: meta,
      animations: animations
    };

    const metadataPath = path.join(OUTPUT_DIR, 'sprite_atlas.json');
    fs.writeFileSync(metadataPath, JSON.stringify(atlasData, null, 2));
    console.log(`Metadata created at ${metadataPath}`);
  } catch (error) {
    console.error(`Error creating sprite sheet: ${error.message}`);
    errors++;
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
