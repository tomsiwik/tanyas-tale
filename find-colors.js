import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function findColors() {
  try {
    // Analyze main image
    const inputPath = path.join(__dirname, 'assets', 'e7 0000.png');
    console.log(`Analyzing colors in ${inputPath}`);
    
    const image = sharp(inputPath);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const colorCounts = {};
    
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skip transparent pixels
      if (info.channels === 4 && data[i + 3] === 0) continue;
      
      const colorKey = `${r},${g},${b}`;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    }
    
    console.log('Top 10 colors in the main image:');
    const sortedColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [color, count] of sortedColors) {
      const [r, g, b] = color.split(',').map(Number);
      console.log(`RGB(${r}, ${g}, ${b}) - Hex: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} - ${count} pixels`);
    }
    
    // Analyze purple map
    const purpleMapPath = path.join(__dirname, 'assets', 'purple_map', 'e7 0000.png');
    console.log(`\nAnalyzing colors in ${purpleMapPath}`);
    
    const purpleMap = sharp(purpleMapPath);
    const purpleMapData = await purpleMap.raw().toBuffer({ resolveWithObject: true });
    
    const purpleMapColorCounts = {};
    
    for (let i = 0; i < purpleMapData.data.length; i += purpleMapData.info.channels) {
      const r = purpleMapData.data[i];
      const g = purpleMapData.data[i + 1];
      const b = purpleMapData.data[i + 2];
      
      // Skip transparent pixels
      if (purpleMapData.info.channels === 4 && purpleMapData.data[i + 3] === 0) continue;
      
      const colorKey = `${r},${g},${b}`;
      purpleMapColorCounts[colorKey] = (purpleMapColorCounts[colorKey] || 0) + 1;
    }
    
    console.log('Top 10 colors in the purple map:');
    const sortedPurpleMapColors = Object.entries(purpleMapColorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    for (const [color, count] of sortedPurpleMapColors) {
      const [r, g, b] = color.split(',').map(Number);
      console.log(`RGB(${r}, ${g}, ${b}) - Hex: #${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} - ${count} pixels`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

findColors();
