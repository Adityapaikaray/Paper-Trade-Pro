const fs = require('fs');

let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

// Replace TITAN grid with flexbox
code = code.replace(
  /<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">/g,
  '<div className="flex flex-col md:flex-row flex-wrap xl:flex-nowrap gap-4 mb-5 w-full">'
);

// Add min-w-0 and flex-1 to the children of the grid
const addFlex1ToDivs = (text) => {
  return text.replace(/<div>\s*<p className="text-\[10px\]/g, '<div className="flex-1 min-w-0">\n                    <p className="text-[10px]');
};

code = addFlex1ToDivs(code);

code = code.replace(
  /<div className="flex items-center gap-3">/g,
  '<div className="flex-1 min-w-0 flex items-center gap-3">'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
