import fs from 'fs';
import path from 'path';




const dbPath = path.resolve(process.cwd(), 'instruments.json');

export interface Instrument {
  id: string;
  company_name: string;
  display_name: string;
  exchange: string;
  exchange_symbol?: string;
  bse_scrip_code?: string;
  isin?: string;
  sector?: string;
  is_active: boolean;
}

export class InstrumentDB {
  private instruments: Instrument[] = [];

  constructor() {
    this.load();
  }

  load() {
    if (fs.existsSync(dbPath)) {
      try {
        const data = fs.readFileSync(dbPath, 'utf8');
        this.instruments = JSON.parse(data);
      } catch (e) {
        console.error("Failed to load DB", e);
        this.instruments = [];
      }
    } else {
      this.seed();
    }
  }

  save() {
    fs.writeFileSync(dbPath, JSON.stringify(this.instruments, null, 2));
  }

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

  search(query: string): Instrument[] {
    const q = query.toLowerCase();
    return this.instruments.filter(i => 
      i.company_name.toLowerCase().includes(q) ||
      i.display_name.toLowerCase().includes(q) ||
      (i.exchange_symbol && i.exchange_symbol.toLowerCase().includes(q)) ||
      (i.bse_scrip_code && i.bse_scrip_code.toLowerCase().includes(q)) ||
      (i.isin && i.isin.toLowerCase().includes(q))
    );
  }

  getAll(): Instrument[] {
    return this.instruments;
  }
}

export const db = new InstrumentDB();
