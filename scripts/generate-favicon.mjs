import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a simple 32x32 favicon with the LeanVote orange color and chat icon
const svgIcon = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#f97352"/>
  <path d="M9 11C9 9.89543 9.89543 9 11 9H21C22.1046 9 23 9.89543 23 11V18C23 19.1046 22.1046 20 21 20H14L11 23V20H11C9.89543 20 9 19.1046 9 18V11Z" 
        stroke="white" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        fill="none"/>
</svg>
`;

async function generateFavicon() {
  const outputPath = join(__dirname, '..', 'public', 'favicon.ico');
  
  // Generate PNG from SVG
  const pngBuffer = await sharp(Buffer.from(svgIcon))
    .resize(32, 32)
    .png()
    .toBuffer();
  
  // For simplicity, save as PNG with .ico extension
  // Most browsers handle this correctly
  // For true ICO format, we'd need ico-endec package
  writeFileSync(outputPath, pngBuffer);
  
  console.log('✅ favicon.ico generated at', outputPath);
  
  // Also generate a 16x16 version
  const png16 = await sharp(Buffer.from(svgIcon))
    .resize(16, 16)
    .png()
    .toBuffer();
  
  writeFileSync(join(__dirname, '..', 'public', 'favicon-16x16.png'), png16);
  console.log('✅ favicon-16x16.png generated');
  
  // Generate 32x32 PNG version
  writeFileSync(join(__dirname, '..', 'public', 'favicon-32x32.png'), pngBuffer);
  console.log('✅ favicon-32x32.png generated');
}

generateFavicon().catch(console.error);
