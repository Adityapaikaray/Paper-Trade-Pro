/**
 * Generator script to create comprehensive constituent data files
 * for all 13 supported indices:
 * U.S.: Dow Jones (30), S&P 100 (100), Nasdaq-100 (100), S&P 500 (503), Russell 2000 (2000)
 * India: NIFTY 50 (50), NIFTY Bank (12), NIFTY IT (10), NIFTY Fin (20), NIFTY Midcap 100 (100),
 *        NIFTY Smallcap 100 (100), BSE SENSEX (30), BSE 500 (500)
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'indices', 'constituents');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 1. Dow Jones 30
const DOW_CONSTITUENTS = [
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', weight: 8.82, sector: 'Healthcare', price: 585.40, marketCap: '538B' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 7.44, sector: 'Information Technology', price: 493.78, marketCap: '3.67T' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', weight: 6.85, sector: 'Financials', price: 454.20, marketCap: '148B' },
  { symbol: 'HD', name: 'The Home Depot Inc.', weight: 5.92, sector: 'Consumer Discretionary', price: 392.80, marketCap: '390B' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', weight: 5.80, sector: 'Industrials', price: 385.10, marketCap: '188B' },
  { symbol: 'CRM', name: 'Salesforce Inc.', weight: 5.15, sector: 'Information Technology', price: 342.10, marketCap: '332B' },
  { symbol: 'AMGN', name: 'Amgen Inc.', weight: 4.88, sector: 'Healthcare', price: 324.50, marketCap: '174B' },
  { symbol: 'V', name: 'Visa Inc.', weight: 4.79, sector: 'Financials', price: 318.20, marketCap: '625B' },
  { symbol: 'MCD', name: "McDonald's Corporation", weight: 4.45, sector: 'Consumer Discretionary', price: 295.40, marketCap: '212B' },
  { symbol: 'BA', name: 'The Boeing Company', weight: 3.95, sector: 'Industrials', price: 262.30, marketCap: '161B' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.82, sector: 'Consumer Discretionary', price: 253.71, marketCap: '2.74T' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', weight: 3.65, sector: 'Financials', price: 242.50, marketCap: '694B' },
  { symbol: 'IBM', name: 'International Business Machines', weight: 3.42, sector: 'Information Technology', price: 227.10, marketCap: '208B' },
  { symbol: 'HON', name: 'Honeywell International', weight: 3.19, sector: 'Industrials', price: 212.00, marketCap: '138B' },
  { symbol: 'TRV', name: 'The Travelers Companies', weight: 3.10, sector: 'Financials', price: 205.80, marketCap: '47B' },
  { symbol: 'AAPL', name: 'Apple Inc.', weight: 5.06, sector: 'Information Technology', price: 336.13, marketCap: '4.91T' },
  { symbol: 'AXP', name: 'American Express Company', weight: 2.95, sector: 'Financials', price: 196.20, marketCap: '141B' },
  { symbol: 'SHW', name: 'The Sherwin-Williams Company', weight: 2.85, sector: 'Materials', price: 189.50, marketCap: '48B' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', weight: 2.45, sector: 'Healthcare', price: 162.80, marketCap: '392B' },
  { symbol: 'PG', name: 'The Procter & Gamble Company', weight: 2.40, sector: 'Consumer Staples', price: 159.40, marketCap: '374B' },
  { symbol: 'CVX', name: 'Chevron Corporation', weight: 2.30, sector: 'Energy', price: 152.60, marketCap: '282B' },
  { symbol: 'DIS', name: 'The Walt Disney Company', weight: 1.72, sector: 'Communication Services', price: 114.50, marketCap: '209B' },
  { symbol: 'WMT', name: 'Walmart Inc.', weight: 1.45, sector: 'Consumer Staples', price: 96.20, marketCap: '772B' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', weight: 1.42, sector: 'Healthcare', price: 94.50, marketCap: '239B' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', weight: 0.91, sector: 'Information Technology', price: 60.50, marketCap: '243B' },
  { symbol: 'NKE', name: 'NIKE Inc.', weight: 1.33, sector: 'Consumer Discretionary', price: 88.50, marketCap: '133B' },
  { symbol: 'KO', name: 'The Coca-Cola Company', weight: 0.98, sector: 'Consumer Staples', price: 65.20, marketCap: '281B' },
  { symbol: 'DOW', name: 'Dow Inc.', weight: 0.82, sector: 'Materials', price: 54.80, marketCap: '38B' },
  { symbol: 'INTC', name: 'Intel Corporation', weight: 0.35, sector: 'Information Technology', price: 23.40, marketCap: '100B' },
  { symbol: 'VZ', name: 'Verizon Communications', weight: 0.65, sector: 'Communication Services', price: 43.10, marketCap: '181B' }
];

console.log('Dow constituents count:', DOW_CONSTITUENTS.length);

fs.writeFileSync(path.join(__dirname, 'test_run.txt'), 'Ready to generate');
