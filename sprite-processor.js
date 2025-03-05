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
const SPRITES_PER_ROW = 10;

// Get all e7*.png files in the source directory
const pngFiles = fs.readdirSync(SOURCE_DIR)
  .filter(file => file.toLowerCase().startsWith('e7') && file.toLowerCase().endsWith('.png'));

console.log(`Found ${pngFiles.length} e7*.png files to process`);

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

      const image = sharp(inputPath)
        .resize(SPRITE_WIDTH, SPRITE_HEIGHT, { fit: 'contain' })
        .modulate({ brightness: 1.2, saturation: 1.1 }); // Example color correction

      const imageBuffer = await image.toBuffer();
      const imageMetadata = await image.metadata();

      images.push({ input: imageBuffer, raw: imageMetadata });
      
      const frameName = file;
      // Calculate the position of this frame in the sprite sheet
      const row = Math.floor(processed / SPRITES_PER_ROW);
      const col = processed % SPRITES_PER_ROW;
      const x = col * SPRITE_WIDTH;
      const y = row * SPRITE_HEIGHT;
      
      frames[frameName] = {
        frame: { x, y, w: SPRITE_WIDTH, h: SPRITE_HEIGHT },
        sourceSize: { w: SPRITE_WIDTH, h: SPRITE_HEIGHT },
        spriteSourceSize: { x: 0, y: 0, w: SPRITE_WIDTH, h: SPRITE_HEIGHT }
      };

      processed++;
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

    // Organize animations by type and direction
    const animations = {
      // Standing animations (single frame per direction)
      standing_n: [sortedFiles[0]],
      standing_nw: [sortedFiles[1]],
      standing_w: [sortedFiles[2]],
      standing_sw: [sortedFiles[3]],
      standing_s: [sortedFiles[4]],
      standing_se: [sortedFiles[5]],
      standing_e: [sortedFiles[6]],
      standing_ne: [sortedFiles[7]],
      
      // Running animations (6 frames per direction)
      running_n: sortedFiles.slice(8, 14),
      running_nw: sortedFiles.slice(14, 20),
      running_w: sortedFiles.slice(20, 26),
      running_sw: sortedFiles.slice(26, 32),
      running_s: sortedFiles.slice(32, 38),
      running_se: sortedFiles.slice(38, 44),
      running_e: sortedFiles.slice(44, 50),
      running_ne: sortedFiles.slice(50, 56),
      
      // Shooting animations (7 frames per direction)
      shooting_n: sortedFiles.slice(56, 63),
      shooting_nw: sortedFiles.slice(63, 70),
      shooting_w: sortedFiles.slice(70, 77),
      shooting_sw: sortedFiles.slice(77, 84),
      shooting_s: sortedFiles.slice(84, 91),
      shooting_se: sortedFiles.slice(91, 98),
      shooting_e: sortedFiles.slice(98, 105),
      shooting_ne: sortedFiles.slice(105, 112),

      // Ducking animations
      duck_n: sortedFiles.slice(112, 119),
      duck_nw: sortedFiles.slice(119, 126),
      duck_w: sortedFiles.slice(126, 133),
      duck_sw: sortedFiles.slice(133, 140),
      duck_s: sortedFiles.slice(140, 147),
      duck_se: sortedFiles.slice(147, 154),
      duck_e: sortedFiles.slice(154, 161),
      duck_ne: sortedFiles.slice(161, 168),

      // Crawling animations
      crawl_n: sortedFiles.slice(168, 175),
      crawl_nw: sortedFiles.slice(175, 182),
      crawl_w: sortedFiles.slice(182, 189),
      crawl_sw: sortedFiles.slice(189, 196),
      crawl_s: sortedFiles.slice(196, 203),
      crawl_se: sortedFiles.slice(203, 210),
      crawl_e: sortedFiles.slice(210, 217),
      crawl_ne: sortedFiles.slice(217, 224),

      // Standing up animations
      stand_n: sortedFiles.slice(224, 231),
      stand_nw: sortedFiles.slice(231, 238),
      stand_w: sortedFiles.slice(238, 245),
      stand_sw: sortedFiles.slice(245, 252),
      stand_s: sortedFiles.slice(252, 259),
      stand_se: sortedFiles.slice(259, 266),
      stand_e: sortedFiles.slice(266, 273),
      stand_ne: sortedFiles.slice(273, 280),

      // Death animations
      death_zap: sortedFiles.slice(280, 287),
      death_explode: sortedFiles.slice(287, 294)
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
