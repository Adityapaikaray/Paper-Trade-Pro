const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

const newSeed = `
  seed() {
    this.instruments = [
      { id: '1', company_name: 'Reliance Industries', display_name: 'RELIANCE', exchange: 'NSE', exchange_symbol: 'RELIANCE', isin: 'INE002A01018', sector: 'Energy', is_active: true },
      { id: '2', company_name: 'Tata Consultancy Services', display_name: 'TCS', exchange: 'NSE', exchange_symbol: 'TCS', isin: 'INE467B01029', sector: 'Technology', is_active: true },
      { id: '3', company_name: 'HDFC Bank', display_name: 'HDFCBANK', exchange: 'NSE', exchange_symbol: 'HDFCBANK', sector: 'Financials', is_active: true },
      { id: '4', company_name: 'Infosys', display_name: 'INFY', exchange: 'NSE', exchange_symbol: 'INFY', sector: 'Technology', is_active: true },
      { id: '5', company_name: 'ICICI Bank', display_name: 'ICICIBANK', exchange: 'NSE', exchange_symbol: 'ICICIBANK', sector: 'Financials', is_active: true },
      { id: '6', company_name: 'State Bank of India', display_name: 'SBIN', exchange: 'NSE', exchange_symbol: 'SBIN', sector: 'Financials', is_active: true },
      { id: '7', company_name: 'Bharti Airtel', display_name: 'BHARTIARTL', exchange: 'NSE', exchange_symbol: 'BHARTIARTL', sector: 'Telecommunication', is_active: true },
      { id: '8', company_name: 'ITC Limited', display_name: 'ITC', exchange: 'NSE', exchange_symbol: 'ITC', sector: 'Consumer Staples', is_active: true },
      { id: '9', company_name: 'Apple Inc.', display_name: 'AAPL', exchange: 'US', exchange_symbol: 'AAPL', sector: 'Technology', is_active: true },
      { id: '10', company_name: 'Microsoft Corporation', display_name: 'MSFT', exchange: 'US', exchange_symbol: 'MSFT', sector: 'Technology', is_active: true },
      { id: '11', company_name: 'Tesla Inc.', display_name: 'TSLA', exchange: 'US', exchange_symbol: 'TSLA', sector: 'Automotive', is_active: true },
    ];
    this.save();
  }
`;

code = code.replace(/seed\(\) \{[\s\S]*?this\.save\(\);\n  \}/, newSeed.trim());
fs.writeFileSync('src/server/db.ts', code);
// Also delete instruments.json so it regenerates
if (fs.existsSync('instruments.json')) {
  fs.unlinkSync('instruments.json');
}
