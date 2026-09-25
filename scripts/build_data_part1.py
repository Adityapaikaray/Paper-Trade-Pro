import json, os, random
random.seed(101)

OUT_DIR = "/src/data/indices/constituents"
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Dow Jones 30
DOW_DATA = [
  ("UNH", "UnitedHealth Group Inc.", "Healthcare", 8.82, 585.40, "$538B", "NYSE"),
  ("MSFT", "Microsoft Corporation", "Technology", 7.44, 493.78, "$3.67T", "NASDAQ"),
  ("GS", "Goldman Sachs Group Inc.", "Financials", 6.85, 454.20, "$148B", "NYSE"),
  ("HD", "The Home Depot Inc.", "Consumer Discretionary", 5.92, 392.80, "$390B", "NYSE"),
  ("CAT", "Caterpillar Inc.", "Industrials", 5.80, 385.10, "$188B", "NYSE"),
  ("CRM", "Salesforce Inc.", "Technology", 5.15, 342.10, "$332B", "NYSE"),
  ("AMGN", "Amgen Inc.", "Healthcare", 4.88, 324.50, "$174B", "NASDAQ"),
  ("V", "Visa Inc.", "Financials", 4.79, 318.20, "$625B", "NYSE"),
  ("MCD", "McDonald's Corporation", "Consumer Discretionary", 4.45, 295.40, "$212B", "NYSE"),
  ("BA", "The Boeing Company", "Industrials", 3.95, 262.30, "$161B", "NYSE"),
  ("AMZN", "Amazon.com Inc.", "Consumer Discretionary", 3.82, 253.71, "$2.74T", "NASDAQ"),
  ("JPM", "JPMorgan Chase & Co.", "Financials", 3.65, 242.50, "$694B", "NYSE"),
  ("IBM", "International Business Machines", "Technology", 3.42, 227.10, "$208B", "NYSE"),
  ("HON", "Honeywell International", "Industrials", 3.19, 212.00, "$138B", "NASDAQ"),
  ("TRV", "The Travelers Companies", "Financials", 3.10, 205.80, "$47B", "NYSE"),
  ("AAPL", "Apple Inc.", "Technology", 5.06, 336.13, "$4.91T", "NASDAQ"),
  ("AXP", "American Express Company", "Financials", 2.95, 196.20, "$141B", "NYSE"),
  ("SHW", "The Sherwin-Williams Company", "Materials", 2.85, 189.50, "$48B", "NYSE"),
  ("JNJ", "Johnson & Johnson", "Healthcare", 2.45, 162.80, "$392B", "NYSE"),
  ("PG", "The Procter & Gamble Company", "Consumer Staples", 2.40, 159.40, "$374B", "NYSE"),
  ("CVX", "Chevron Corporation", "Energy", 2.30, 152.60, "$282B", "NYSE"),
  ("DIS", "The Walt Disney Company", "Communication Services", 1.72, 114.50, "$209B", "NYSE"),
  ("WMT", "Walmart Inc.", "Consumer Staples", 1.45, 96.20, "$772B", "NYSE"),
  ("MRK", "Merck & Co. Inc.", "Healthcare", 1.42, 94.50, "$239B", "NYSE"),
  ("CSCO", "Cisco Systems Inc.", "Technology", 0.91, 60.50, "$243B", "NASDAQ"),
  ("NKE", "NIKE Inc.", "Consumer Discretionary", 1.33, 88.50, "$133B", "NYSE"),
  ("KO", "The Coca-Cola Company", "Consumer Staples", 0.98, 65.20, "$281B", "NYSE"),
  ("DOW", "Dow Inc.", "Materials", 0.82, 54.80, "$38B", "NYSE"),
  ("INTC", "Intel Corporation", "Technology", 0.35, 23.40, "$100B", "NASDAQ"),
  ("VZ", "Verizon Communications", "Communication Services", 0.65, 43.10, "$181B", "NYSE")
]

# 2. NIFTY 50 (50 stocks)
NIFTY_DATA = [
  ("RELIANCE", "Reliance Industries", "Energy", 9.8, 1226.40, "₹20.2T"),
  ("HDFCBANK", "HDFC Bank", "Financials", 8.9, 1712.50, "₹12.8T"),
  ("ICICIBANK", "ICICI Bank", "Financials", 7.6, 1264.30, "₹8.9T"),
  ("INFY", "Infosys", "Technology", 5.8, 1892.40, "₹7.8T"),
  ("TCS", "Tata Consultancy Services", "Technology", 4.9, 4210.00, "₹15.4T"),
  ("BHARTIARTL", "Bharti Airtel", "Telecom", 4.4, 1642.00, "₹9.4T"),
  ("ITC", "ITC Limited", "FMCG", 3.8, 498.20, "₹6.2T"),
  ("LT", "Larsen & Toubro", "Industrials", 3.7, 3680.00, "₹5.1T"),
  ("SBIN", "State Bank of India", "Financials", 3.5, 832.50, "₹7.4T"),
  ("KOTAKBANK", "Kotak Mahindra Bank", "Financials", 3.1, 1824.00, "₹3.6T"),
  ("AXISBANK", "Axis Bank", "Financials", 3.0, 1195.00, "₹3.7T"),
  ("HINDUNILVR", "Hindustan Unilever", "FMCG", 2.8, 2480.00, "₹5.9T"),
  ("BAJFINANCE", "Bajaj Finance", "Financials", 2.6, 7320.00, "₹4.5T"),
  ("M&M", "Mahindra & Mahindra", "Automobile", 2.5, 3120.00, "₹3.8T"),
  ("MARUTI", "Maruti Suzuki", "Automobile", 2.3, 12550.00, "₹3.9T"),
  ("SUNPHARMA", "Sun Pharma", "Healthcare", 2.2, 1810.00, "₹4.3T"),
  ("TATAMOTORS", "Tata Motors", "Automobile", 2.1, 978.00, "₹3.5T"),
  ("NTPC", "NTPC Limited", "Energy", 2.0, 422.00, "₹4.1T"),
  ("ULTRACEMCO", "UltraTech Cement", "Materials", 1.9, 11450.00, "₹3.3T"),
  ("TITAN", "Titan Company", "Consumer", 1.8, 3460.00, "₹3.1T"),
  ("POWERGRID", "Power Grid Corp", "Energy", 1.7, 342.00, "₹3.2T"),
  ("ADANIENT", "Adani Enterprises", "Industrials", 1.6, 3140.00, "₹3.6T"),
  ("TATASTEEL", "Tata Steel", "Metals", 1.5, 154.50, "₹1.9T"),
  ("COALINDIA", "Coal India", "Energy", 1.4, 492.00, "₹3.0T"),
  ("ASIANPAINT", "Asian Paints", "Materials", 1.3, 2840.00, "₹2.7T"),
  ("BAJAJ-AUTO", "Bajaj Auto", "Automobile", 1.3, 10240.00, "₹2.9T"),
  ("ONGC", "Oil & Natural Gas Corp", "Energy", 1.2, 298.00, "₹3.7T"),
  ("HCLTECH", "HCL Technologies", "Technology", 1.2, 1780.00, "₹4.8T"),
  ("WIPRO", "Wipro Limited", "Technology", 1.1, 542.00, "₹2.8T"),
  ("BPCL", "Bharat Petroleum", "Energy", 0.9, 348.00, "₹1.5T"),
  ("IOC", "Indian Oil Corp", "Energy", 0.9, 172.00, "₹2.4T"),
  ("GAIL", "GAIL India", "Energy", 0.8, 218.00, "₹1.4T"),
  ("DRREDDY", "Dr. Reddy's Laboratories", "Healthcare", 0.8, 6640.00, "₹1.1T"),
  ("CIPLA", "Cipla Limited", "Healthcare", 0.8, 1520.00, "₹1.2T"),
  ("APOLLOHOSP", "Apollo Hospitals", "Healthcare", 0.7, 6980.00, "₹1.0T"),
  ("HINDALCO", "Hindalco Industries", "Metals", 0.7, 680.00, "₹1.5T"),
  ("GRASIM", "Grasim Industries", "Materials", 0.7, 2650.00, "₹1.7T"),
  ("TECHM", "Tech Mahindra", "Technology", 0.7, 1640.00, "₹1.6T"),
  ("INDUSINDBK", "IndusInd Bank", "Financials", 0.6, 1410.00, "₹1.1T"),
  ("NESTLEIND", "Nestle India", "FMCG", 0.6, 2350.00, "₹2.3T"),
  ("JSWSTEEL", "JSW Steel", "Metals", 0.6, 980.00, "₹2.4T"),
  ("TATACONSUM", "Tata Consumer Products", "FMCG", 0.6, 1180.00, "₹1.1T"),
  ("BRITANNIA", "Britannia Industries", "FMCG", 0.5, 5740.00, "₹1.4T"),
  ("HEROMOTOCO", "Hero MotoCorp", "Automobile", 0.5, 5280.00, "₹1.1T"),
  ("EICHERMOT", "Eicher Motors", "Automobile", 0.5, 4820.00, "₹1.3T"),
  ("SBILIFE", "SBI Life Insurance", "Financials", 0.5, 1720.00, "₹1.7T"),
  ("HDFCLIFE", "HDFC Life Insurance", "Financials", 0.5, 715.00, "₹1.5T"),
  ("DIVISLAB", "Divi's Laboratories", "Healthcare", 0.5, 5840.00, "₹1.6T"),
  ("BAJAJFINSV", "Bajaj Finserv", "Financials", 0.5, 1860.00, "₹3.0T"),
  ("ADANIPORTS", "Adani Ports & SEZ", "Industrials", 0.5, 1440.00, "₹3.1T"),
  ("TRENT", "Trent Limited", "Retail", 0.5, 7250.00, "₹2.6T"),
  ("BEL", "Bharat Electronics", "Aerospace & Defence", 0.5, 298.00, "₹2.2T")
]

# 3. NIFTY Bank (12 stocks)
NIFTY_BANK_DATA = [
  ("HDFCBANK", "HDFC Bank", "Private Banks", 28.5, 1712.50, "₹12.8T"),
  ("ICICIBANK", "ICICI Bank", "Private Banks", 24.2, 1264.30, "₹8.9T"),
  ("SBIN", "State Bank of India", "Public Banks", 11.8, 832.50, "₹7.4T"),
  ("KOTAKBANK", "Kotak Mahindra Bank", "Private Banks", 10.1, 1824.00, "₹3.6T"),
  ("AXISBANK", "Axis Bank", "Private Banks", 9.8, 1195.00, "₹3.7T"),
  ("INDUSINDBK", "IndusInd Bank", "Private Banks", 4.8, 1410.00, "₹1.1T"),
  ("BANKBARODA", "Bank of Baroda", "Public Banks", 3.2, 258.00, "₹1.3T"),
  ("PNB", "Punjab National Bank", "Public Banks", 2.4, 108.50, "₹1.2T"),
  ("FEDERALBNK", "Federal Bank", "Private Banks", 2.1, 196.00, "₹480B"),
  ("IDFCFIRSTB", "IDFC First Bank", "Private Banks", 1.5, 82.40, "₹590B"),
  ("AUBANK", "AU Small Finance Bank", "Small Finance", 1.0, 654.00, "₹490B"),
  ("BANDHANBNK", "Bandhan Bank", "Private Banks", 0.6, 192.00, "₹310B")
]

# 4. NIFTY IT (10 stocks)
NIFTY_IT_DATA = [
  ("TCS", "Tata Consultancy Services", "IT Services", 27.8, 4210.00, "₹15.4T"),
  ("INFY", "Infosys", "IT Services", 26.5, 1892.40, "₹7.8T"),
  ("HCLTECH", "HCL Technologies", "IT Services", 14.2, 1780.00, "₹4.8T"),
  ("WIPRO", "Wipro Limited", "IT Services", 9.8, 542.00, "₹2.8T"),
  ("TECHM", "Tech Mahindra", "IT Services", 8.5, 1640.00, "₹1.6T"),
  ("LTIM", "LTIMindtree", "IT Services", 5.4, 6150.00, "₹1.8T"),
  ("PERSISTENT", "Persistent Systems", "Digital Engineering", 3.2, 5350.00, "₹820B"),
  ("COFORGE", "Coforge Limited", "Software Solutions", 2.1, 8120.00, "₹520B"),
  ("MPHASIS", "Mphasis Limited", "Cloud & Cognitive", 1.5, 3080.00, "₹580B"),
  ("LTTS", "L&T Technology Services", "ER&D Services", 1.0, 5580.00, "₹590B")
]

# 5. NIFTY Financial Services (20 stocks)
NIFTY_FIN_DATA = [
  ("HDFCBANK", "HDFC Bank", "Banking", 22.4, 1712.50, "₹12.8T"),
  ("ICICIBANK", "ICICI Bank", "Banking", 19.8, 1264.30, "₹8.9T"),
  ("SBIN", "State Bank of India", "Banking", 9.4, 832.50, "₹7.4T"),
  ("BAJFINANCE", "Bajaj Finance", "NBFC", 8.2, 7320.00, "₹4.5T"),
  ("KOTAKBANK", "Kotak Mahindra Bank", "Banking", 7.8, 1824.00, "₹3.6T"),
  ("AXISBANK", "Axis Bank", "Banking", 7.5, 1195.00, "₹3.7T"),
  ("BAJAJFINSV", "Bajaj Finserv", "Financials", 4.2, 1860.00, "₹3.0T"),
  ("CHOLAFIN", "Cholamandalam Investment", "NBFC", 3.1, 1480.00, "₹1.2T"),
  ("SBILIFE", "SBI Life Insurance", "Insurance", 2.8, 1720.00, "₹1.7T"),
  ("HDFCLIFE", "HDFC Life Insurance", "Insurance", 2.5, 715.00, "₹1.5T"),
  ("SHRIRAMFIN", "Shriram Finance", "NBFC", 2.4, 3180.00, "₹1.2T"),
  ("PFC", "Power Finance Corporation", "NBFC", 2.1, 510.00, "₹1.7T"),
  ("RECLTD", "REC Limited", "NBFC", 1.9, 580.00, "₹1.5T"),
  ("MUTHOOTFIN", "Muthoot Finance", "NBFC", 1.5, 1920.00, "₹770B"),
  ("ICICIPRULI", "ICICI Prudential Life", "Insurance", 1.2, 730.00, "₹1.0T"),
  ("ICICIGI", "ICICI Lombard General Ins", "Insurance", 1.1, 1980.00, "₹980B"),
  ("HDFCAMC", "HDFC Asset Management", "Asset Management", 0.9, 4420.00, "₹940B"),
  ("LICHSGFIN", "LIC Housing Finance", "Housing Finance", 0.5, 680.00, "₹370B"),
  ("SBICARD", "SBI Cards & Payment", "Credit Cards", 0.4, 760.00, "₹720B"),
  ("IEX", "Indian Energy Exchange", "Exchange", 0.4, 215.00, "₹190B")
]

# 6. BSE SENSEX (30 stocks)
SENSEX_DATA = [
  ("RELIANCE", "Reliance Industries", "Energy", 11.2, 1226.40, "₹20.2T"),
  ("HDFCBANK", "HDFC Bank", "Financials", 10.4, 1712.50, "₹12.8T"),
  ("ICICIBANK", "ICICI Bank", "Financials", 8.8, 1264.30, "₹8.9T"),
  ("INFY", "Infosys", "Technology", 6.9, 1892.40, "₹7.8T"),
  ("TCS", "Tata Consultancy Services", "Technology", 5.7, 4210.00, "₹15.4T"),
  ("BHARTIARTL", "Bharti Airtel", "Telecom", 5.1, 1642.00, "₹9.4T"),
  ("ITC", "ITC Limited", "FMCG", 4.5, 498.20, "₹6.2T"),
  ("LT", "Larsen & Toubro", "Industrials", 4.4, 3680.00, "₹5.1T"),
  ("SBIN", "State Bank of India", "Financials", 4.1, 832.50, "₹7.4T"),
  ("KOTAKBANK", "Kotak Mahindra Bank", "Financials", 3.6, 1824.00, "₹3.6T"),
  ("AXISBANK", "Axis Bank", "Financials", 3.5, 1195.00, "₹3.7T"),
  ("HINDUNILVR", "Hindustan Unilever", "FMCG", 3.3, 2480.00, "₹5.9T"),
  ("BAJFINANCE", "Bajaj Finance", "Financials", 3.1, 7320.00, "₹4.5T"),
  ("M&M", "Mahindra & Mahindra", "Automobile", 2.9, 3120.00, "₹3.8T"),
  ("MARUTI", "Maruti Suzuki", "Automobile", 2.7, 12550.00, "₹3.9T"),
  ("SUNPHARMA", "Sun Pharma", "Healthcare", 2.6, 1810.00, "₹4.3T"),
  ("TATAMOTORS", "Tata Motors", "Automobile", 2.5, 978.00, "₹3.5T"),
  ("NTPC", "NTPC Limited", "Energy", 2.4, 422.00, "₹4.1T"),
  ("ULTRACEMCO", "UltraTech Cement", "Materials", 2.2, 11450.00, "₹3.3T"),
  ("TITAN", "Titan Company", "Consumer", 2.1, 3460.00, "₹3.1T"),
  ("POWERGRID", "Power Grid Corp", "Energy", 2.0, 342.00, "₹3.2T"),
  ("TATASTEEL", "Tata Steel", "Metals", 1.8, 154.50, "₹1.9T"),
  ("ASIANPAINT", "Asian Paints", "Materials", 1.6, 2840.00, "₹2.7T"),
  ("BAJAJFINSV", "Bajaj Finserv", "Financials", 1.5, 1860.00, "₹3.0T"),
  ("HCLTECH", "HCL Technologies", "Technology", 1.4, 1780.00, "₹4.8T"),
  ("TECHM", "Tech Mahindra", "Technology", 1.1, 1640.00, "₹1.6T"),
  ("INDUSINDBK", "IndusInd Bank", "Financials", 1.0, 1410.00, "₹1.1T"),
  ("NESTLEIND", "Nestle India", "FMCG", 0.9, 2350.00, "₹2.3T"),
  ("JSWSTEEL", "JSW Steel", "Metals", 0.9, 980.00, "₹2.4T"),
  ("ADANIPORTS", "Adani Ports & SEZ", "Industrials", 0.8, 1440.00, "₹3.1T")
]

print("Base definitions ready.")
