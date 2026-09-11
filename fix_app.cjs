const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "  return (\n          {showSplash",
  "  return (\n    <>\n          {showSplash"
);

code = code.replace(
  "          )}\n  );",
  "          )}\n    </>\n  );"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixed App.tsx fragment.");
