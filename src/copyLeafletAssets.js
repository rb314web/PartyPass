const fs = require('fs');
const path = require('path');

// Create images directory if it doesn't exist
const publicImagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

// Copy marker icons
const leafletImagesDir = path.join(__dirname, '../node_modules/leaflet/dist/images');
const filesToCopy = ['marker-icon.png', 'marker-shadow.png'];

filesToCopy.forEach(file => {
  const sourcePath = path.join(leafletImagesDir, file);
  const destPath = path.join(publicImagesDir, file);
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Copied ${file} to public/images directory`);
});

console.log('Leaflet assets copied successfully!'); 