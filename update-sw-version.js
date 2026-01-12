const fs = require('fs');
const path = require('path');

// Generate a shorter version based on timestamp (last 8 digits)
// This ensures uniqueness while keeping it readable
const timestamp = Date.now().toString();
const version = `v${timestamp.slice(-8)}`;

// Read the service worker file
const swPath = path.join(__dirname, 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Replace version numbers (handles v followed by numbers or timestamp)
swContent = swContent.replace(
	/CACHE_NAME = "kevin-reyes-portfolio-v[\w-]+"/,
	`CACHE_NAME = "kevin-reyes-portfolio-${version}"`
);
swContent = swContent.replace(
	/STATIC_CACHE_NAME = "kevin-reyes-portfolio-static-v[\w-]+"/,
	`STATIC_CACHE_NAME = "kevin-reyes-portfolio-static-${version}"`
);

// Write back to file
fs.writeFileSync(swPath, swContent, 'utf8');
console.log(`✅ Service worker version updated to ${version}`);
