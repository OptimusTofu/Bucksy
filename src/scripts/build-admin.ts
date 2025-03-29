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

// Make sure CSS directory exists
const cssDestDir = path.join(destDir, 'css');
fs.ensureDirSync(cssDestDir);

// Copy public assets
console.log('Copying admin public assets...');
try {
    fs.copySync(srcDir, destDir, { overwrite: true });
    console.log('Admin public assets copied successfully!');

    // Double-check CSS files specifically
    const cssFiles = ['styles.css', 'dark-theme.css'];
    cssFiles.forEach(file => {
        const srcFile = path.join(srcDir, 'css', file);
        const destFile = path.join(cssDestDir, file);

        if (fs.existsSync(srcFile)) {
            // Copy again to be 100% sure
            fs.copyFileSync(srcFile, destFile);
            console.log(`Verified CSS file: ${file} (${fs.statSync(destFile).size} bytes)`);
        } else {
            console.error(`WARNING: Source CSS file not found: ${srcFile}`);
        }
    });
} catch (err) {
    console.error('Error copying public assets:', err);
    process.exit(1);
}

// Copy views
console.log('Copying admin views...');
try {
    fs.copySync(viewsDir, viewsDestDir, { overwrite: true });
    console.log('Admin views copied successfully!');
} catch (err) {
    console.error('Error copying views:', err);
    process.exit(1);
}

// Print summary of copied files
console.log('\nBuild Summary:');
console.log(`Public directory: ${destDir}`);
console.log(`CSS directory: ${cssDestDir}`);
console.log(`Views directory: ${viewsDestDir}`);

if (fs.existsSync(path.join(cssDestDir, 'styles.css'))) {
    console.log('✅ styles.css was copied successfully');
} else {
    console.log('❌ styles.css is MISSING');
}

if (fs.existsSync(path.join(cssDestDir, 'dark-theme.css'))) {
    console.log('✅ dark-theme.css was copied successfully');
} else {
    console.log('❌ dark-theme.css is MISSING');
}

console.log('\nAdmin build completed!'); 