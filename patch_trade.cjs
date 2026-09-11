const fs = require('fs');
let code = fs.readFileSync('src/components/TradeModal.tsx', 'utf8');

code = code.replace(
  '<label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Estimated Total</label>',
  '<label className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em]">Estimated Total</label>'
);

code = code.replace(
  '<p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5">Available Balance</p>',
  '<p className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em] mb-1.5">Available Virtual Cash</p>'
);

code = code.replace(
  'EXECUTE {type} ORDER • {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}',
  'CONFIRM VIRTUAL {type} • {liveStock.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}\n                  <div className="text-[8px] font-sans font-medium text-ui-bg/70 tracking-wider mt-1.5 lowercase first-letter:uppercase">Virtual order — no real money involved</div>'
);

// If the type is sell we should adjust text-ui-bg/70 since background is ui-bg not primary
code = code.replace(
  '<div className="text-[8px] font-sans font-medium text-ui-bg/70 tracking-wider mt-1.5 lowercase first-letter:uppercase">Virtual order — no real money involved</div>',
  '{type === \'BUY\' ? <div className="text-[8px] font-sans font-medium text-ui-bg/70 tracking-wider mt-1.5 normal-case tracking-normal">Virtual order — no real money involved</div> : <div className="text-[8px] font-sans font-medium text-text-muted tracking-wider mt-1.5 normal-case tracking-normal">Virtual order — no real money involved</div>}'
);

fs.writeFileSync('src/components/TradeModal.tsx', code);
