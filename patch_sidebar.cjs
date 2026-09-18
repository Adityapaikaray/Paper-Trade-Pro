const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// Also import Crown and useUI
code = code.replace("import { useNavigation", "import { Crown } from 'lucide-react';\nimport { useUI } from '../contexts/UIContext.tsx';\nimport { useNavigation");

// Inside Sidebar add useUI
code = code.replace("const Sidebar: React.FC = () => {", "const Sidebar: React.FC = () => {\n  const { openModal } = useUI();");

// Add Upgrade block at the end of nav
const upgradeBlock = `
      <div className="p-4 mt-auto relative z-10">
        <div className={\`\${isExpanded ? 'p-5' : 'p-0 py-3'} rounded-2xl bg-ui-surface border border-primary/50 shadow-[0_0_20px_rgba(212,175,55,0.05)] flex flex-col items-center relative group cursor-pointer hover:border-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300\`} onClick={() => openModal('upgrade')} title="Upgrade to Pro">
          <div className={\`w-10 h-10 rounded-full bg-ui-sidebar border border-primary flex shrink-0 items-center justify-center text-primary \${isExpanded ? 'mb-4' : ''} group-hover:bg-primary/10 transition-colors\`}>
            <Crown size={20} strokeWidth={1.5} />
          </div>
          {isExpanded && (
            <>
              <h4 className="text-[13px] font-bold text-text-main mb-2 font-serif italic tracking-wide">Upgrade to Pro</h4>
              <p className="text-[11px] text-text-muted mb-3 leading-relaxed font-medium text-center">
                Advanced analytics.<br />Real-time data.<br />Deeper insights.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};`;

code = code.replace("    </div>\n  );\n};", upgradeBlock);
fs.writeFileSync('src/components/Sidebar.tsx', code);
