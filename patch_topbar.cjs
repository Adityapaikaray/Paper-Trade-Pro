const fs = require('fs');
let code = fs.readFileSync('src/components/TopBar.tsx', 'utf8');

// Replace navigation to use setMenuOpen
code = code.replace("const { currentRoute, goBack, history, activeTab, navigate } = useNavigation();", "const { currentRoute, goBack, history, activeTab, navigate, setMenuOpen, isMenuOpen } = useNavigation();");

// Replace Mobile Brand Mark
const mobileBrandOld = `<button onClick={() => navigate('dashboard')} className="md:hidden shrink-0 transition-transform active:scale-95 outline-none">
          <img src="/tradepro-icon.jpg" alt="TradePro" className="w-9 h-9 rounded-lg object-contain" />
        </button>`;
        
const mobileBrandNew = `<button 
          onClick={() => setMenuOpen(!isMenuOpen)} 
          className="md:hidden shrink-0 transition-transform active:scale-95 outline-none rounded-lg focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <img src="/tradepro-logo.jpg" alt="TradePro" className="w-[100px] h-[26px] object-contain object-left" />
        </button>`;

code = code.replace(mobileBrandOld, mobileBrandNew);

fs.writeFileSync('src/components/TopBar.tsx', code);
