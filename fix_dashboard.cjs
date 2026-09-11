const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const heroRegex = /<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">[\s\S]*?<\/div>\s*<\/div>/;

const newHero = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
  <div className="relative">
    <div className="absolute -inset-10 bg-radial-gradient from-primary/5 to-transparent blur-3xl -z-10" />
    <h1 className="text-3xl md:text-5xl font-sans font-bold text-text-main tracking-tight leading-tight">
      Good Morning, <br />
      <span className="font-serif italic text-primary font-black">Investor!</span>
    </h1>
    <p className="text-text-muted mt-2 text-sm">Here’s what’s happening with your portfolio today.</p>
  </div>
  <div className="text-right">
    <p className="text-sm font-bold text-text-main uppercase tracking-wider">{new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</p>
    <p className="text-xs text-text-muted mt-1 font-serif italic">"A smarter you, a brighter tomorrow."</p>
  </div>
</div>`;

if (code.match(heroRegex)) {
    code = code.replace(heroRegex, newHero);
    fs.writeFileSync('src/components/DashboardView.tsx', code);
    console.log("Updated Hero Section successfully.");
} else {
    console.log("Could not find the exact Hero section to replace. Manual check required.");
}
