const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\Rafael_Livre';
const excludeDirs = ['AppData\\Local\\Application Data', 'AppData\\Local\\ElevatedDiagnostics', 'Application Data'];

function getDirSize(dirPath) {
  let size = 0;
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const file of files) {
      if (file.name === 'System Volume Information' || excludeDirs.some(e => dirPath.includes(e))) continue;
      const fullPath = path.join(dirPath, file.name);
      try {
        if (file.isDirectory()) {
          size += getDirSize(fullPath);
        } else {
          size += fs.statSync(fullPath).size;
        }
      } catch (e) {
        // ignore permission errors
      }
    }
  } catch (e) {
    // ignore
  }
  return size;
}

try {
  const topLevel = fs.readdirSync(basePath, { withFileTypes: true });
  const sizes = [];
  
  for (const dir of topLevel) {
    if (dir.isDirectory() && dir.name !== 'AppData' && !dir.name.startsWith('.')) {
      const fullPath = path.join(basePath, dir.name);
      const sizeBytes = getDirSize(fullPath);
      sizes.push({ name: dir.name, sizeGB: (sizeBytes / (1024 * 1024 * 1024)).toFixed(2) });
    }
  }
  
  sizes.sort((a, b) => parseFloat(b.sizeGB) - parseFloat(a.sizeGB));
  console.log("Maiores pastas na sua conta:");
  sizes.slice(0, 10).forEach(s => console.log(`${s.name}: ${s.sizeGB} GB`));
} catch (e) {
  console.error(e);
}
