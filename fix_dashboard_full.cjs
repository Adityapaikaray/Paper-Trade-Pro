const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const regexToReplace = /<header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-ui-border">[\s\S]*?<\/header>/;

const newHeader = `<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
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
</div>

{/* Portfolio Summary 4 Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
  <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    <div className="relative z-10">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Total Portfolio Value</p>
      <p className="text-3xl font-serif font-black text-text-main">₹2,469,011.47</p>
      <p className="text-xs font-bold text-positive mt-1">+₹2,457,354.21 (+21080.03%)</p>
    </div>
  </div>

  <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    <div className="relative z-10">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Today's P/L</p>
      <p className="text-3xl font-serif font-black text-text-main">+₹612.38</p>
      <p className="text-xs font-bold text-positive mt-1">(+4.03%)</p>
    </div>
  </div>

  <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    <div className="relative z-10">
      <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Cash Balance</p>
      <p className="text-3xl font-serif font-black text-text-main">₹10,774.33</p>
    </div>
  </div>

  <div className="vibrant-card p-6 flex flex-col justify-between relative overflow-hidden group">
    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Portfolio Health</p>
        <p className="text-3xl font-serif font-black text-text-main">86 <span className="text-sm text-text-muted font-sans font-medium">/ 100</span></p>
        <p className="text-xs font-bold text-positive mt-1">Strong</p>
      </div>
      <div className="w-16 h-16 rounded-full border-4 border-ui-border border-t-primary border-r-primary flex items-center justify-center rotate-45 shadow-sm">
        <div className="w-12 h-12 rounded-full border-4 border-ui-border border-b-positive border-l-positive -rotate-45" />
      </div>
    </div>
  </div>
</div>`;

code = code.replace(regexToReplace, newHeader);
fs.writeFileSync('src/components/DashboardView.tsx', code);
console.log("Updated Hero Section successfully.");
