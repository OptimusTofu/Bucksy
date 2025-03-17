import * as fs from 'fs-extra';
import * as path from 'path';

// Define paths
const srcDir = path.join(__dirname, '../admin/public');
const viewsDir = path.join(__dirname, '../admin/views');
const destDir = path.join(__dirname, '../../dist/admin/public');
const viewsDestDir = path.join(__dirname, '../../dist/admin/views');

// Ensure destination directories exist
fs.ensureDirSync(destDir);
fs.ensureDirSync(viewsDestDir);

// Copy public assets
console.log('Copying admin public assets...');
fs.copySync(srcDir, destDir, { overwrite: true });
console.log('Admin public assets copied successfully!');

// Copy views
console.log('Copying admin views...');
fs.copySync(viewsDir, viewsDestDir, { overwrite: true });
console.log('Admin views copied successfully!');

console.log('Admin build completed!'); 