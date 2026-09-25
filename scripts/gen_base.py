import json
import os
import random

OUT_DIR = "/src/data/indices/constituents"
os.makedirs(OUT_DIR, exist_ok=True)
random.seed(42)

def make_stock(rank, sym, name, sector, wt, price, cap_str, curr='$', exch='NASDAQ'):
    chg_pct = round(random.uniform(-2.5, 3.0), 2)
    chg = round(price * (chg_pct / 100.0), 2)
    vol = f"{round(random.uniform(1.0, 35.0), 1)}M"
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
        "marketCap": cap_str,
        "dayHigh": round(price + abs(chg) * 1.1, 2),
        "dayLow": round(price - abs(chg) * 1.1, 2),
        "prevClose": round(price - chg, 2),
        "exchange": exch,
        "marketStatus": "REGULAR"
    }

print("Ready to generate index files.")
