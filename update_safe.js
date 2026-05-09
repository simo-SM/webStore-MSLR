const fs = require('fs');

// 1. Update products.js
let productsJs = fs.readFileSync('js/products.js', 'utf8');
productsJs = productsJs.replace(/price: (\d+)/g, (m, p1) => `price: ${parseInt(p1) * 10}`);
productsJs = productsJs.replace(/colors: \[[^\]]*\]/g, 'colors: ["#000000", "#ffffff"]');
productsJs = productsJs.replace(/colorNames: \[[^\]]*\]/g, 'colorNames: ["Black", "White"]');
fs.writeFileSync('js/products.js', productsJs);

// 3. Update HTML files
const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

for (const f of htmlFiles) {
  let html = fs.readFileSync(f, 'utf8');
  
  html = html.replace(/\$0\.00/g, '0 DH');
  html = html.replace(/\$0/g, '0 DH');
  
  // Replace Free Shipping Over $100
  html = html.replace(/Free Shipping Over \$100/g, 'Free Shipping Over 1000 DH');
  
  fs.writeFileSync(f, html);
}

console.log("Safe updates complete");
