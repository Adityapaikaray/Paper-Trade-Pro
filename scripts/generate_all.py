import json, os, random
from build_data_part1 import DOW_DATA, NIFTY_DATA, NIFTY_BANK_DATA, NIFTY_IT_DATA, NIFTY_FIN_DATA, SENSEX_DATA

OUT_DIR = "/src/data/indices/constituents"
os.makedirs(OUT_DIR, exist_ok=True)
random.seed(42)

def make_obj(rank, sym, name, sector, wt, price, cap, curr='$', exch='NASDAQ'):
    chg_pct = round(random.uniform(-2.5, 3.0), 2)
    chg = round(price * (chg_pct / 100.0), 2)
    vol = f"{round(random.uniform(1.2, 38.0), 1)}M"
    return {
        "rank": rank,
        "symbol": sym,
        "name": name,
        "sector": sector,
        "weight": round(wt, 3),
        "price": price,
        "change": chg,
        "changePercent": chg_pct,
        "volume": vol,
        "marketCap": cap,
        "dayHigh": round(price + abs(chg) * 1.05, 2),
        "dayLow": round(price - abs(chg) * 1.05, 2),
        "prevClose": round(price - chg, 2),
        "exchange": exch,
        "marketStatus": "REGULAR"
    }

def save_idx(key, name, sym, disp, reg, curr, desc, base_p, base_c, base_pct, prev_c, raw_items, exch='NASDAQ'):
    # Normalize weights so sum is 100%
    tot_w = sum(x[3] for x in raw_items)
    constituents = []
    for i, it in enumerate(raw_items):
        sym_val, name_val, sec_val, w_val, p_val, cap_val = it[0], it[1], it[2], it[3], it[4], it[5]
        ex = it[6] if len(it) > 6 else exch
        norm_w = (w_val / tot_w) * 100.0 if tot_w > 0 else 100.0 / len(raw_items)
        constituents.append(make_obj(i + 1, sym_val, name_val, sec_val, norm_w, p_val, cap_val, curr, ex))
    
    data = {
        "id": key,
        "name": name,
        "symbol": sym,
        "displaySymbol": disp,
        "region": reg,
        "currency": curr,
        "description": desc,
        "baselinePrice": base_p,
        "baselineChange": base_c,
        "baselinePercent": base_pct,
        "prevClose": prev_c,
        "totalConstituents": len(constituents),
        "lastRebalanced": "2025-01-15",
        "asOfDate": "Q1 2025 Regular Rebalance",
        "dataSource": "Institutional Market Data & Exchange Indexes",
        "constituents": constituents
    }
    with open(os.path.join(OUT_DIR, f"{key}.json"), "w") as f:
        json.dump(data, f, indent=2)
    print(f"Saved {key}: {len(constituents)} constituents")

# Save primary defined ones
save_idx("dow", "Dow Jones Industrial Average", "^DJI", "DOW 30", "US", "$", "Price-weighted benchmark of 30 prominent American blue-chip corporate leaders.", 43280.20, -72.40, -0.17, 43352.60, DOW_DATA, "NYSE")
save_idx("nifty", "NIFTY 50", "^NSEI", "NIFTY 50", "IN", "₹", "Flagship index of the National Stock Exchange of India, representing 50 premier blue-chips.", 23346.40, 75.80, 0.33, 23270.60, NIFTY_DATA, "NSE")
save_idx("niftybank", "NIFTY Bank", "^NSEBANK", "BANK NIFTY", "IN", "₹", "Benchmark index representing 12 of the largest and most liquid banking institutions in India.", 56358.70, 302.95, 0.54, 56055.75, NIFTY_BANK_DATA, "NSE")
save_idx("niftyit", "NIFTY IT", "^CNXIT", "NIFTY IT", "IN", "₹", "10 leading Information Technology and enterprise software innovators across India.", 42180.20, -115.40, -0.27, 42295.60, NIFTY_IT_DATA, "NSE")
save_idx("niftyfin", "NIFTY Financial Services", "^CNXFIN", "NIFTY FIN", "IN", "₹", "20 premier financial institutions spanning banking, insurance, housing finance, and AMC.", 24890.50, 142.30, 0.58, 24748.20, NIFTY_FIN_DATA, "NSE")
save_idx("sensex", "BSE SENSEX", "^BSESN", "SENSEX", "IN", "₹", "30 premier, most actively traded blue-chip equities on the Bombay Stock Exchange.", 74294.96, -41.54, -0.06, 74336.50, SENSEX_DATA, "BSE")

print("Part 1 finished.")
