import { initDb, db } from './src/server/db.ts';

async function run() {
  await initDb();
  
  // Seed some initial instruments
  db.run(`INSERT INTO instruments (company_name, display_name, exchange, exchange_symbol, isin, sector, is_active) VALUES ('Reliance Industries', 'RELIANCE', 'NSE', 'RELIANCE', 'INE002A01018', 'Energy', 1)`);
  db.run(`INSERT INTO instruments (company_name, display_name, exchange, bse_scrip_code, isin, sector, is_active) VALUES ('Reliance Industries', 'RELIANCE', 'BSE', '500325', 'INE002A01018', 'Energy', 1)`);
  
  db.run(`INSERT INTO instruments (company_name, display_name, exchange, exchange_symbol, isin, sector, is_active) VALUES ('Tata Consultancy Services', 'TCS', 'NSE', 'TCS', 'INE467B01029', 'Technology', 1)`);
  db.run(`INSERT INTO instruments (company_name, display_name, exchange, bse_scrip_code, isin, sector, is_active) VALUES ('Tata Consultancy Services', 'TCS', 'BSE', '532540', 'INE467B01029', 'Technology', 1)`);

  console.log("DB seeded.");
}

run();
