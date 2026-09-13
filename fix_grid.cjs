const fs = require('fs');

let code = fs.readFileSync('src/components/PortfolioView.tsx', 'utf8');

// Replace the problematic CSS Grid metrics section with a robust Flexbox layout
const oldGrid = `                 {/* Metrics Grid */}
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-6 mb-12">
                    {/* Row 1 */}
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">Quantity</p>
                       <p className="text-[18px] md:text-[22px] font-mono font-bold text-white">{pos.shares}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">Average Buy Price</p>
                       <p className="text-[18px] md:text-[22px] font-mono font-bold text-white">{pos.stock?.currency || '$'}{pos.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">Current Value</p>
                       <p className="text-[18px] md:text-[22px] font-mono font-bold text-white">{pos.stock?.currency || '$'}{pos.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    
                    {/* Row 2 */}
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">Cost of Purchase</p>
                       <p className="text-[18px] md:text-[22px] font-mono font-bold text-white">{pos.stock?.currency || '$'}{(pos.averagePrice * pos.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">P&L</p>
                       <div className={\`flex items-baseline gap-2 font-mono font-bold \${pos.profit >= 0 ? 'text-positive' : 'text-negative'}\`}>
                          <span className="text-[18px] md:text-[22px] leading-none">{pos.profit >= 0 ? '+' : ''}{pos.stock?.currency || '$'}{Math.abs(pos.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          <span className="text-[14px]">({pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%)</span>
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2">Allocation</p>
                       <div className="flex items-center gap-3">
                          <p className="text-[18px] md:text-[18px] md:text-[22px] font-mono font-bold text-white leading-none">
                             {allocation.toFixed(1)}%
                          </p>
                          {/* Small Pie Chart */}
                          <div 
                             className="w-[26px] h-[26px] rounded-full bg-[#111111] overflow-hidden flex items-center justify-center border border-[#333333] shadow-sm" 
                             style={{ background: \`conic-gradient(#D4AF37 0% \${allocation}%, #242424 \${allocation}% 100%)\` }}
                          >
                             <div className="w-3.5 h-3.5 bg-black rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>`;

const newFlexbox = `                 {/* Metrics Section - Flexbox for robust cross-browser layout */}
                 <div className="flex flex-col gap-10 mb-12 w-full">
                    {/* Row 1 */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between w-full">
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">Quantity</p>
                          <p className="text-[18px] md:text-[22px] font-mono font-bold text-white truncate">{pos.shares}</p>
                       </div>
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">Average Buy Price</p>
                          <p className="text-[18px] md:text-[22px] font-mono font-bold text-white truncate">{pos.stock?.currency || '$'}{pos.averagePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                       </div>
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">Current Value</p>
                          <p className="text-[18px] md:text-[22px] font-mono font-bold text-white truncate">{pos.stock?.currency || '$'}{pos.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                       </div>
                    </div>
                    
                    {/* Row 2 */}
                    <div className="flex flex-col md:flex-row gap-8 md:gap-4 justify-between w-full">
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">Cost of Purchase</p>
                          <p className="text-[18px] md:text-[22px] font-mono font-bold text-white truncate">{pos.stock?.currency || '$'}{(pos.averagePrice * pos.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                       </div>
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">P&L</p>
                          <div className={\`flex items-baseline gap-2 font-mono font-bold \${pos.profit >= 0 ? 'text-positive' : 'text-negative'} truncate\`}>
                             <span className="text-[18px] md:text-[22px] leading-none">{pos.profit >= 0 ? '+' : ''}{pos.stock?.currency || '$'}{Math.abs(pos.profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                             <span className="text-[14px]">({pos.profitPercent >= 0 ? '+' : ''}{pos.profitPercent.toFixed(2)}%)</span>
                          </div>
                       </div>
                       <div className="flex-1 shrink-0 min-w-0">
                          <p className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-[0.15em] mb-2 truncate">Allocation</p>
                          <div className="flex items-center gap-3">
                             <p className="text-[18px] md:text-[22px] font-mono font-bold text-white leading-none">
                                {allocation.toFixed(1)}%
                             </p>
                             {/* Small Pie Chart */}
                             <div 
                                className="w-[26px] h-[26px] rounded-full bg-[#111111] overflow-hidden flex shrink-0 items-center justify-center border border-[#333333] shadow-sm" 
                                style={{ background: \`conic-gradient(#D4AF37 0% \${allocation}%, #242424 \${allocation}% 100%)\` }}
                             >
                                <div className="w-3.5 h-3.5 bg-black rounded-full" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>`;

code = code.replace(oldGrid, newFlexbox);

fs.writeFileSync('src/components/PortfolioView.tsx', code);
